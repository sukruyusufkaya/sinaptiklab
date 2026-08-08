// MDX derleme hattı — BRIEF §3 (next-mdx-remote/rsc) + §6.2/6.3.
// mdxDerle: kaynak MDX → { icerik (ReactElement), toc } tek geçişte.
// Hem sayfa render'ında hem İÇERİK KAYDEDİLİRKEN çağrılır; hata durumunda
// satır bilgili, Türkçe MdxDerlemeHatasi fırlatır.
import rehypeShiki from "@shikijs/rehype";
import type { Element, Root, RootContent } from "hast";
import { compileMDX } from "next-mdx-remote/rsc";
import type { ReactElement } from "react";
import remarkGfm from "remark-gfm";
import { addClassToHast, type ShikiTransformer } from "shiki";

import { mdxBilesenleri } from "@/components/mdx";
import { slugla } from "@/lib/slug";

/** lib/db/schemas/content.ts `toc` alanıyla birebir aynı yapı. */
export interface TocMaddesi {
  id: string;
  text: string;
  depth: number;
}

export class MdxDerlemeHatasi extends Error {
  readonly satir: number | null;
  readonly sutun: number | null;

  constructor(mesaj: string, satir: number | null = null, sutun: number | null = null) {
    super(mesaj);
    this.name = "MdxDerlemeHatasi";
    this.satir = satir;
    this.sutun = sutun;
  }
}

// ── rehypeBaslikId ───────────────────────────────────────────────────
// H2/H3'lere lib/slug `slugla()` ile stabil id verir (çakışanlara -2/-3 eki)
// ve AYNI geçişte TOC'u toplar — BRIEF §4.3/4 ve §8.3/4 (stabil çapa).

function baslikMetni(dugum: RootContent): string {
  if (dugum.type === "text") return dugum.value;
  if ("children" in dugum) return dugum.children.map(baslikMetni).join("");
  return "";
}

function rehypeBaslikId(secenekler: { toc: TocMaddesi[] }) {
  return (agac: Root): void => {
    const kullanilan = new Map<string, number>();

    const isle = (baslik: Element, derinlik: number): void => {
      const metin = baslik.children.map(baslikMetni).join("").trim();
      const mevcut = baslik.properties.id;
      let id: string;
      if (typeof mevcut === "string" && mevcut.length > 0) {
        // Yazarın elle verdiği id korunur (başlık değişse de çapa stabil kalır).
        id = mevcut;
      } else {
        const taban = slugla(metin) || "bolum";
        const sira = (kullanilan.get(taban) ?? 0) + 1;
        kullanilan.set(taban, sira);
        id = sira === 1 ? taban : `${taban}-${sira}`;
        baslik.properties.id = id;
      }
      secenekler.toc.push({ id, text: metin, depth: derinlik });
    };

    const gez = (dugum: Root | RootContent): void => {
      if (dugum.type === "element") {
        if (dugum.tagName === "h2") isle(dugum, 2);
        else if (dugum.tagName === "h3") isle(dugum, 3);
      }
      if ("children" in dugum) {
        for (const cocuk of dugum.children) gez(cocuk);
      }
    };

    gez(agac);
  };
}

// ── Satır vurgusu transformer'ı ──────────────────────────────────────
// KARAR: @shikijs/transformers paketi kurulu değil ve yeni paket kurmak
// yasak; bu yüzden `// [!code highlight]` (# / -- / ; / /* */ / <!-- -->
// yorumlarıyla da) notasyonunu işleyen kendi minimal transformer'ımız.
// `[!code highlight:N]` o satırdan itibaren N satırı vurgular; satır yalnız
// işaretten oluşuyorsa satır düşer ve takip eden N satır vurgulanır.
// Vurgulu satıra `.highlighted` sınıfı basılır — stil app/globals.css'te.

const VURGU_DESENI =
  /(?:\/\/|#|--|;|\/\*|<!--)\s*\[!code (highlight|\+\+|--)(?::(\d+))?\]\s*(?:\*\/|-->)?\s*$/;

/** İşaret türü → satıra basılacak sınıf (stiller app/globals.css'te). */
const ISARET_SINIFI: Record<string, string> = {
  highlight: "highlighted",
  "++": "diff-ekle",
  "--": "diff-sil",
};

function satirVurguDonusturucu(): ShikiTransformer {
  // Blok başına durum: preprocess her kod bloğunda sıfırlar; Shiki bir bloğu
  // baştan sona işleyip sonrakine geçtiği için `line` kancaları aynı bloğun
  // kümesini okur.
  let isaretliler = new Map<number, string>();

  return {
    name: "sinaptiklab:satir-vurgu",
    preprocess(kod) {
      isaretliler = new Map<number, string>();
      if (!kod.includes("[!code ")) return undefined;

      const sonuc: string[] = [];
      let kalan = 0;
      let kalanSinif = "highlighted";
      for (const satir of kod.split("\n")) {
        const es = VURGU_DESENI.exec(satir);
        if (es !== null && es[1] !== undefined) {
          const sinif = ISARET_SINIFI[es[1]] ?? "highlighted";
          const adet = es[2] !== undefined ? Number.parseInt(es[2], 10) : 1;
          const govde = satir.slice(0, es.index).replace(/\s+$/, "");
          if (govde.length === 0) {
            kalan += adet;
            kalanSinif = sinif;
            continue;
          }
          isaretliler.set(sonuc.length, sinif);
          sonuc.push(govde);
          kalan += adet - 1;
          kalanSinif = sinif;
          continue;
        }
        if (kalan > 0) {
          isaretliler.set(sonuc.length, kalanSinif);
          kalan -= 1;
        }
        sonuc.push(satir);
      }
      return sonuc.join("\n");
    },
    line(dugum, satirNo) {
      const sinif = isaretliler.get(satirNo - 1);
      if (sinif !== undefined) {
        addClassToHast(dugum, sinif);
      }
    },
  };
}

// ── Hata çevirisi ────────────────────────────────────────────────────

function sayiOku(deger: unknown): number | null {
  return typeof deger === "number" && Number.isFinite(deger) ? deger : null;
}

// next-mdx-remote v6 asıl VFileMessage'ı düz Error'a sarar; konum bilgisi
// çoğu hatada mesaj metninde "(satır:sütun-satır:sütun)" biçiminde kalır.
const MESAJ_KONUM_DESENI = /\((\d+):(\d+)(?:-\d+:\d+)?\)/;

function mdxHatasinaCevir(hata: unknown): MdxDerlemeHatasi {
  if (hata instanceof MdxDerlemeHatasi) return hata;

  let mesaj = "bilinmeyen hata";
  let satir: number | null = null;
  let sutun: number | null = null;

  if (hata instanceof Error && hata.message.length > 0) {
    // Sarmalayıcı gürültüsünü ayıkla; asıl nedeni (ilk dolu satır) al.
    const temiz = hata.message
      .replace(/^\[next-mdx-remote\] error compiling MDX:\s*/, "")
      .replace(/\n+More information:[\s\S]*$/, "")
      .trim();
    mesaj = temiz.split("\n").find((s) => s.trim().length > 0) ?? temiz;
  }
  if (typeof hata === "object" && hata !== null) {
    const kayit = hata as Record<string, unknown>;
    // Sarılmamış VFileMessage: `reason` asıl mesaj, `line`/`column` konum.
    if (typeof kayit["reason"] === "string" && kayit["reason"].length > 0) {
      mesaj = kayit["reason"];
    }
    satir = sayiOku(kayit["line"]);
    sutun = sayiOku(kayit["column"]);
  }
  if (satir === null) {
    const es = MESAJ_KONUM_DESENI.exec(mesaj);
    if (es !== null && es[1] !== undefined) {
      satir = Number.parseInt(es[1], 10);
      sutun = es[2] !== undefined ? Number.parseInt(es[2], 10) : null;
    }
  }

  const konum =
    satir !== null ? ` (satır ${satir}${sutun !== null ? `, sütun ${sutun}` : ""})` : "";
  return new MdxDerlemeHatasi(
    `MDX derlenemedi${konum}: ${mesaj} — içeriği kaydetmeden önce MDX sözdizimini düzeltin.`,
    satir,
    sutun,
  );
}

// ── Ana giriş ────────────────────────────────────────────────────────

const SHIKI_TEMALARI = { light: "github-light", dark: "github-dark" };

export async function mdxDerle(
  kaynak: string,
  ekBilesenler?: import("mdx/types").MDXComponents,
): Promise<{ icerik: ReactElement; toc: TocMaddesi[] }> {
  const toc: TocMaddesi[] = [];
  try {
    const { content } = await compileMDX({
      source: kaynak,
      // ekBilesenler aynı ada sahip varsayılanı ezer (örn. IcerikSayfasi'nın
      // kaynak-veri bağlanmış <Kaynak> sürümü — kenar notları için).
      components: { ...mdxBilesenleri, ...ekBilesenler },
      options: {
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            [
              rehypeShiki,
              {
                themes: SHIKI_TEMALARI,
                // defaultColor:false → token'lar yalnız --shiki-light/--shiki-dark
                // CSS değişkenleri taşır; tema seçimi globals.css'te yapılır.
                defaultColor: false,
                transformers: [satirVurguDonusturucu()],
              },
            ],
            [rehypeBaslikId, { toc }],
          ],
        },
      },
    });
    return { icerik: content, toc };
  } catch (hata) {
    throw mdxHatasinaCevir(hata);
  }
}

// ── Okuma süresi ─────────────────────────────────────────────────────
// Kod blokları hariç kelime sayısı / 230 kelime-dakika, min 1, yuvarlanır.

export function okumaSuresi(kaynak: string): number {
  const kodsuz = kaynak.replace(/```[\s\S]*?```/g, " ");
  const kelimeSayisi = kodsuz.split(/\s+/).filter((k) => k.length > 0).length;
  return Math.max(1, Math.round(kelimeSayisi / 230));
}
