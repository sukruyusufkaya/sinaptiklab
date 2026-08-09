import type { Document, Filter } from "mongodb";
import { icerikOzetDTO, type IcerikOzetDTO } from "@/lib/db/queries/dto";
import type { Content, ContentDoc, Term } from "@/lib/db/schemas";
import { getDb } from "@/lib/mongodb";
import { aramaKoleksiyonu } from "./istemci";

/**
 * Arama katmanı (BRIEF §13 FAZ 6). İki motor:
 *  1. **Atlas Search** — `content_search` index'i (Türkçe analyzer, §4.1);
 *     alan ağırlıkları sorgu tarafında verilir (title^5, dek^3, tags^2, body).
 *  2. **regex yedeği** — $search desteklenmeyen ortamda title/dek taraması.
 * Hangi motorun çalıştığı dışarı raporlanır; UI mono altbilgide gösterir,
 * böylece "arama gerçekten Atlas'tan mı geliyor" sorusu tahmine değil
 * çıktıya dayanır.
 */

export const ARAMA_SAYFA_ADEDI = 12;
const SORGU_AZAMI = 120;

export type AramaMotoru = "atlas" | "regex";

export interface AramaSonucu extends IcerikOzetDTO {
  /** Atlas searchScore; regex yedeğinde tanımsız. */
  skor?: number;
  /** Atlas highlight'ından düz metin parça; yoksa tanımsız. */
  parca?: string;
}

export interface AramaCiktisi {
  sonuclar: AramaSonucu[];
  toplam: number;
  motor: AramaMotoru;
}

export interface AramaSuzgeci {
  tur?: Content["type"];
  pillar?: string;
  seviye?: Content["level"];
}

export interface AramaParams extends AramaSuzgeci {
  sorgu: string;
  adet?: number;
  sayfa?: number;
}

interface CozulmusParams extends AramaSuzgeci {
  sorgu: string;
  adet: number;
  sayfa: number;
}

// ── Saf yardımcılar (birim testli) ───────────────────────────────────

/**
 * Kullanıcı sorgusunu normalize eder: kontrol/biçim karakterlerini (\p{C})
 * boşluğa çevirir, iç boşlukları teke indirir, kırpar ve uzunluğu sınırlar.
 * Uzun sorgu hem Atlas'ta hem regex'te maliyet üretir, faydası yok.
 */
export function sorguTemizle(ham: string): string {
  return ham.replace(/\p{C}/gu, " ").replace(/\s+/g, " ").trim().slice(0, SORGU_AZAMI);
}

/** Regex yedeğinde kullanıcı girdisini literal hâle getirir (desen enjeksiyonu). */
export function regexKacis(metin: string): string {
  return metin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export interface SayfalamaHesabi {
  sayfa: number;
  atla: number;
  sayfaSayisi: number;
  oncekiVar: boolean;
  sonrakiVar: boolean;
}

/** Sayfa numarasını sınırlar içine çeker ve $skip değerini hesaplar. */
export function sayfalama(toplam: number, adet: number, istenenSayfa: number): SayfalamaHesabi {
  const guvenliAdet = Math.max(1, Math.trunc(adet));
  const sayfaSayisi = Math.max(1, Math.ceil(Math.max(0, toplam) / guvenliAdet));
  const istenen = Number.isFinite(istenenSayfa) ? Math.trunc(istenenSayfa) : 1;
  const sayfa = Math.min(Math.max(1, istenen), sayfaSayisi);
  return {
    sayfa,
    atla: (sayfa - 1) * guvenliAdet,
    sayfaSayisi,
    oncekiVar: sayfa > 1,
    sonrakiVar: sayfa < sayfaSayisi,
  };
}

/** URL'den gelen `sayfa` parametresini pozitif tam sayıya sabitler (yoksa 1). */
export function sayfaNoOku(ham: string | undefined): number {
  const sayi = Number.parseInt(ham ?? "", 10);
  return Number.isFinite(sayi) && sayi > 0 ? sayi : 1;
}

/** `status: published` + opsiyonel tür/pillar/seviye (iki motorda da ortak). */
export function icerikFiltresi(suzgec: AramaSuzgeci): Document {
  const filtre: Document = { status: "published" };
  if (suzgec.tur) filtre["type"] = suzgec.tur;
  if (suzgec.pillar) filtre["pillar"] = suzgec.pillar;
  if (suzgec.seviye) filtre["level"] = suzgec.seviye;
  return filtre;
}

/**
 * Atlas `$search` gövdesi — BRIEF §4.1 ağırlıkları sorgu tarafında verilir
 * (index tanımı yalnız alanları ve Türkçe analyzer'ı taşır). Başlık ve spotta
 * yazım toleransı açık (fuzzy maxEdits 1); gövde ve etikette kapalı ki
 * gürültü artmasın.
 */
export function atlasAsamasi(sorgu: string): Document {
  return {
    index: "content_search",
    compound: {
      should: [
        {
          text: {
            query: sorgu,
            path: "title",
            score: { boost: { value: 5 } },
            fuzzy: { maxEdits: 1, prefixLength: 2 },
          },
        },
        {
          text: {
            query: sorgu,
            path: "dek",
            score: { boost: { value: 3 } },
            fuzzy: { maxEdits: 1, prefixLength: 2 },
          },
        },
        { text: { query: sorgu, path: "tags", score: { boost: { value: 2 } } } },
        { text: { query: sorgu, path: "body" } },
      ],
      minimumShouldMatch: 1,
    },
    highlight: { path: ["title", "dek", "body"] },
  };
}

/**
 * searchHighlights → tek satırlık düz metin parça. Bilinçli olarak HTML
 * üretmiyoruz: parça React'te metin olarak basılır, XSS yüzeyi açılmaz.
 */
export function highlightParcasi(ham: unknown): string | undefined {
  if (!Array.isArray(ham) || ham.length === 0) return undefined;
  const ilk: unknown = ham[0];
  if (typeof ilk !== "object" || ilk === null) return undefined;
  const texts: unknown = (ilk as { texts?: unknown }).texts;
  if (!Array.isArray(texts)) return undefined;
  const metin = texts
    .map((p: unknown) =>
      typeof p === "object" && p !== null && typeof (p as { value?: unknown }).value === "string"
        ? (p as { value: string }).value
        : "",
    )
    .join("")
    .replace(/\s+/g, " ")
    .trim();
  return metin.length > 0 ? metin.slice(0, 220) : undefined;
}

// ── İçerik araması ───────────────────────────────────────────────────

const OZET_PROJEKSIYONU = {
  _id: 1,
  type: 1,
  slug: 1,
  title: 1,
  dek: 1,
  level: 1,
  pillar: 1,
  clusters: 1,
  tags: 1,
  excerptHtml: 1,
  readingMinutes: 1,
  publishedAt: 1,
  updatedAt: 1,
  lastVerifiedAt: 1,
} as const;

type HamSonuc = ContentDoc & { skor?: number; vurgular?: unknown };

interface FacetCiktisi {
  sonuclar: HamSonuc[];
  toplam: { adet: number }[];
}

function sonucaCevir(doc: HamSonuc): AramaSonucu {
  const parca = highlightParcasi(doc.vurgular);
  return {
    ...icerikOzetDTO(doc),
    ...(typeof doc.skor === "number" ? { skor: doc.skor } : {}),
    ...(parca !== undefined ? { parca } : {}),
  };
}

async function atlasAra(params: CozulmusParams): Promise<AramaCiktisi> {
  const koleksiyon = await aramaKoleksiyonu<Content>("contents");
  const atla = Math.max(0, (params.sayfa - 1) * params.adet);
  // Tek turda hem sayfa hem toplam: $facet (korpus küçük, ikinci sorgu israf).
  const boru: Document[] = [
    { $search: atlasAsamasi(params.sorgu) },
    { $match: icerikFiltresi(params) },
    { $addFields: { skor: { $meta: "searchScore" }, vurgular: { $meta: "searchHighlights" } } },
    {
      $facet: {
        sonuclar: [
          { $skip: atla },
          { $limit: params.adet },
          { $project: { ...OZET_PROJEKSIYONU, skor: 1, vurgular: 1 } },
        ],
        toplam: [{ $count: "adet" }],
      },
    },
  ];
  const [kutu] = await koleksiyon.aggregate<FacetCiktisi>(boru).toArray();
  return {
    sonuclar: (kutu?.sonuclar ?? []).map(sonucaCevir),
    toplam: kutu?.toplam[0]?.adet ?? 0,
    motor: "atlas",
  };
}

async function regexAra(params: CozulmusParams): Promise<AramaCiktisi> {
  const db = await getDb();
  const koleksiyon = db.collection<Content>("contents");
  const desen = new RegExp(regexKacis(params.sorgu), "i");
  const filtre = {
    ...icerikFiltresi(params),
    $or: [{ title: desen }, { dek: desen }],
  } as Filter<Content>;

  const toplam = await koleksiyon.countDocuments(filtre);
  const { atla } = sayfalama(toplam, params.adet, params.sayfa);
  const docs = await koleksiyon
    .find(filtre, { projection: OZET_PROJEKSIYONU })
    .sort({ publishedAt: -1 })
    .skip(atla)
    .limit(params.adet)
    .toArray();

  return { sonuclar: docs.map((d) => icerikOzetDTO(d as ContentDoc)), toplam, motor: "regex" };
}

/**
 * İçerik araması. Önce Atlas Search; $search desteklenmeyen ortamda (yerel
 * mongod, index yok, ağ hatası) title/dek regex yedeğine düşer. Boş sorguda
 * DB'ye hiç gidilmez.
 */
export async function icerikAra(params: AramaParams): Promise<AramaCiktisi> {
  const sorgu = sorguTemizle(params.sorgu);
  if (sorgu === "") return { sonuclar: [], toplam: 0, motor: "regex" };

  const cozulmus: CozulmusParams = {
    sorgu,
    ...(params.tur ? { tur: params.tur } : {}),
    ...(params.pillar ? { pillar: params.pillar } : {}),
    ...(params.seviye ? { seviye: params.seviye } : {}),
    adet: params.adet ?? ARAMA_SAYFA_ADEDI,
    sayfa: params.sayfa ?? 1,
  };

  try {
    return await atlasAra(cozulmus);
  } catch {
    return await regexAra(cozulmus);
  }
}

// ── Terim araması ────────────────────────────────────────────────────

export interface TerimEslesmesiDTO {
  slug: string;
  tr: string;
  en: string;
  shortDef: string;
}

/** terms koleksiyonu filtresi: tr / en / aliases üzerinde büyük-küçük duyarsız. */
export function terimFiltresi(sorgu: string): Filter<Term> {
  const desen = new RegExp(regexKacis(sorgu), "i");
  return { $or: [{ tr: desen }, { en: desen }, { aliases: desen }] };
}

/**
 * Sözlük araması. terms için ayrı Atlas Search index'i YOK (korpus küçük:
 * onlarca kayıt), doğrudan regex yeterli — bu yüzden lib/mongodb'nin normal
 * (Stable API strict) client'ı kullanılabilir.
 */
export async function terimAra(sorgu: string, adet = 6): Promise<TerimEslesmesiDTO[]> {
  const temiz = sorguTemizle(sorgu);
  if (temiz === "") return [];
  const db = await getDb();
  const docs = await db
    .collection<Term>("terms")
    .find(terimFiltresi(temiz), {
      projection: { _id: 0, slug: 1, tr: 1, en: 1, shortDef: 1 },
      limit: adet,
    })
    .toArray();
  return docs.map((d) => ({ slug: d.slug, tr: d.tr, en: d.en, shortDef: d.shortDef }));
}
