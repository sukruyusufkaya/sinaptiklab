// GEO metin yüzeylerinin çekirdeği (BRIEF §8.1): MDX gövdesini LLM-dostu temiz
// Markdown'a indirger. components/mdx'teki özel etiketler metin karşılıklarına
// çevrilir; kod çitleri ve satır içi kod dönüşümlerden korunur; bilinmeyen ya
// da artakalan JSX etiketleri silinir ama içerikleri kalır. `.md` route'u ve
// /llms-full yüzeyleri aynı dönüştürücüden beslenir.
import type { IcerikDetayDTO } from "@/lib/db/queries/dto";
import type { TerimDetayDTO } from "@/lib/db/queries/terms";
import { env } from "@/lib/env";
import { icerikYolu, seviyeEtiketi, turEtiketi } from "@/lib/rotalar";

/** mdxTemizle'nin ihtiyaç duyduğu asgari kaynak alanları (DTO sources uyumlu). */
export interface KaynakOgesi {
  label: string;
  url: string;
  publisher: string;
}

/** `ad="deger"` veya `ad={deger}` biçimindeki JSX özniteliğini okur. */
function oznitelik(nitelikler: string, ad: string): string | undefined {
  const tirnakli = nitelikler.match(new RegExp(`\\b${ad}="([^"]*)"`));
  if (tirnakli?.[1] !== undefined) return tirnakli[1];
  const suslu = nitelikler.match(new RegExp(`\\b${ad}=\\{\\s*[\`"']?([^}\`"']*)[\`"']?\\s*\\}`));
  return suslu?.[1];
}

/** Diyagram'ın `kod` özniteliği çok satırlı olabilir (şablon dizgesi). */
function diyagramKodu(nitelikler: string): string | undefined {
  const sablonlu = nitelikler.match(/\bkod=\{\s*`([\s\S]*?)`\s*\}/);
  if (sablonlu?.[1] !== undefined) return sablonlu[1];
  const tirnakli = nitelikler.match(/\bkod="([\s\S]*?)"/);
  return tirnakli?.[1];
}

/** Çok satırlı içeriği etiketli markdown blockquote'a çevirir. */
function blokAlinti(etiket: string, icerik: string): string {
  return `**${etiket}:** ${icerik.trim()}`
    .split("\n")
    .map((satir) => (satir.trim() === "" ? ">" : `> ${satir.trimEnd()}`))
    .join("\n");
}

/**
 * MDX gövdesini temiz Markdown'a çevirir. `sources`, `<Kaynak id="N">`
 * atıflarının numara doğrulaması için kullanılır: listede karşılığı olmayan
 * numara belgeye köşeli atıf olarak taşınmaz (metin korunur).
 */
export function mdxTemizle(body: string, sources: readonly KaynakOgesi[]): string {
  const korunanlar: string[] = [];
  // Yer tutucu U+E000 (Unicode özel kullanım alanı) ile sarılır: bu karakter
  // gerçek içerikte geçmez, "GEO7" gibi düz metinlerle çakışamaz.
  const koru = (blok: string): string => {
    korunanlar.push(blok);
    return `\uE000GEO${korunanlar.length - 1}\uE000`;
  };

  // 1) Kod çitleri ve satır içi kod korunur: JSX örneği içerebilirler ve
  //    temizlik onlara dokunmamalı (rag/ollama tohumlarında fiilen var).
  let metin = body.replace(/```[\s\S]*?```/g, koru);
  metin = metin.replace(/`[^`\n]+`/g, koru);

  // 2) MDX yorumları düz metinde karşılıksız: düşer.
  metin = metin.replace(/\{\/\*[\s\S]*?\*\/\}/g, "");

  // 3) <Kaynak id="N">metin</Kaynak> → "metin [N]" — numaralı kaynak listesi
  //    belge sonuna icerikMarkdown tarafından eklenir, köşeli atıf yeter.
  metin = metin.replace(
    /<Kaynak\b([^>]*)>([\s\S]*?)<\/Kaynak>/g,
    (_tam, nitelikler: string, icerik: string) => {
      const no = Number.parseInt(oznitelik(nitelikler, "id") ?? "", 10);
      const gecerli = Number.isInteger(no) && no >= 1 && no <= sources.length;
      return gecerli ? `${icerik} [${no}]` : icerik;
    },
  );

  // 4) Salt sarmalayıcılar: etiket düşer, içerik olduğu gibi kalır.
  //    (Karsilastirma'nın içi zaten markdown tablo; Kod'un içi korunmuş çit.)
  metin = metin.replace(/<Terim\b[^>]*>([\s\S]*?)<\/Terim>/g, "$1");
  metin = metin.replace(/<KisaCevap\b[^>]*>([\s\S]*?)<\/KisaCevap>/g, "$1");
  metin = metin.replace(/<Karsilastirma\b[^>]*>([\s\S]*?)<\/Karsilastirma>/g, "$1");
  metin = metin.replace(/<Kod\b[^>]*>([\s\S]*?)<\/Kod>/g, "$1");

  // 5) <Adim n="X" baslik="B"> → "### Adım X: B" + içerik.
  metin = metin.replace(
    /<Adim\b([^>]*)>([\s\S]*?)<\/Adim>/g,
    (_tam, nitelikler: string, icerik: string) => {
      const n = oznitelik(nitelikler, "n") ?? "?";
      const baslik = oznitelik(nitelikler, "baslik");
      const baslikSatiri = baslik === undefined ? `### Adım ${n}` : `### Adım ${n}: ${baslik}`;
      return `${baslikSatiri}\n\n${icerik.trim()}`;
    },
  );

  // 6) Blok alıntıya inen bileşenler.
  metin = metin.replace(
    /<YoneticiOzeti\b[^>]*>([\s\S]*?)<\/YoneticiOzeti>/g,
    (_tam, icerik: string) => blokAlinti("Yönetici özeti", icerik),
  );
  metin = metin.replace(
    /<Uyari\b([^>]*)>([\s\S]*?)<\/Uyari>/g,
    (_tam, nitelikler: string, icerik: string) =>
      blokAlinti(`Uyarı (${oznitelik(nitelikler, "tip") ?? "dikkat"})`, icerik),
  );

  // 7) <Diyagram kod="..."/> → mermaid çitli kod bloğu. Üretilen çit, sonraki
  //    genel temizlikten etkilenmesin diye korunanlara alınır (mermaid kodu
  //    "-->" gibi açılı karakterler içerebilir).
  metin = metin.replace(/<Diyagram\b([\s\S]*?)\/>/g, (_tam, nitelikler: string) => {
    const kod = diyagramKodu(nitelikler);
    return kod === undefined ? "" : koru(`\`\`\`mermaid\n${kod.trim()}\n\`\`\``);
  });

  // 8) Görsel/canlı veri bileşenlerinin düz metin karşılığı yok: düşer.
  metin = metin.replace(/<(?:Olcum|Video)\b[^>]*?\/>/g, "");
  metin = metin.replace(/<(Olcum|Video)\b[^>]*>[\s\S]*?<\/\1>/g, "");

  // 9) Bilinmeyen/artakalan JSX: kendi kapananlar tamamen silinir; açılış ve
  //    kapanış etiketleri düşer, aralarındaki içerik kalır.
  metin = metin.replace(/<[A-Z][A-Za-z0-9]*\b[^>]*?\/>/g, "");
  metin = metin.replace(/<\/?[A-Z][A-Za-z0-9]*\b[^>]*>/g, "");

  // 10) Korunan bloklar geri gelir, artakalan boş satırlar toparlanır.
  metin = metin.replace(
    /\uE000GEO(\d+)\uE000/g,
    (_tam, sira: string) => korunanlar[Number(sira)] ?? "",
  );
  return `${metin.replace(/\n{3,}/g, "\n\n").trim()}\n`;
}

/**
 * Bir içeriğin tam LLM-dostu Markdown belgesi: başlık, dek, meta satırı,
 * kısa cevap, temizlenmiş gövde, numaralı kaynak listesi, SSS ve kanonik
 * URL notu. `.md` route'u ile /llms-full/<pillar>.txt bunu döndürür.
 */
export function icerikMarkdown(icerik: IcerikDetayDTO): string {
  const mutlakUrl = `${env.NEXT_PUBLIC_SITE_URL}${icerikYolu(icerik.type, icerik.slug)}`;
  const bolumler: string[] = [];

  bolumler.push(`# ${icerik.title}`);
  bolumler.push(`> ${icerik.dek}`);

  const yazarAdlari = icerik.yazarlar.map((yazar) => yazar.name).join(", ");
  const meta = [
    yazarAdlari === "" ? null : `Yazar: ${yazarAdlari}`,
    icerik.teknikEditor === null ? null : `Teknik editör: ${icerik.teknikEditor.name}`,
    icerik.publishedAt === null ? null : `Yayın: ${icerik.publishedAt.slice(0, 10)}`,
    `Güncelleme: ${icerik.updatedAt.slice(0, 10)}`,
    `Tür: ${turEtiketi(icerik.type)}`,
    `Pillar: ${icerik.pillar}`,
    `Seviye: ${seviyeEtiketi(icerik.level)}`,
  ].filter((parca): parca is string => parca !== null);
  bolumler.push(meta.join(" · "));

  bolumler.push("## Kısa cevap");
  bolumler.push(icerik.answerFirst.trim());

  bolumler.push(mdxTemizle(icerik.body, icerik.sources).trim());

  if (icerik.sources.length > 0) {
    bolumler.push("## Kaynaklar");
    bolumler.push(
      icerik.sources
        .map((kaynak, sira) => `${sira + 1}. ${kaynak.label} — ${kaynak.publisher} — ${kaynak.url}`)
        .join("\n"),
    );
  }

  if (icerik.faq.length > 0) {
    bolumler.push("## SSS");
    bolumler.push(icerik.faq.map((soru) => `**${soru.q}**\n\n${soru.a}`).join("\n\n"));
  }

  bolumler.push("---");
  bolumler.push(
    `Kanonik sürüm: ${mutlakUrl}\n` +
      `Bu belge, sayfanın LLM tüketimi için üretilmiş Markdown dışa aktarımıdır (${mutlakUrl}.md).`,
  );

  return `${bolumler.join("\n\n")}\n`;
}

/**
 * Sözlük teriminin LLM-dostu Markdown belgesi: kanonik Türkçe ad, İngilizce
 * karşılık, eşanlamlılar, kısa ve uzun tanım, ilgili terimler ve numaralı
 * kaynak listesi. `/sozluk/<slug>.md` bunu döndürür.
 *
 * Ayrı bir üretici olmasının nedeni terimin içerikten farklı bir belge
 * olması: gövdesi yok, karşılığı ve eşanlamlıları var — kanonik terminoloji
 * iddiasının makine tarafındaki karşılığı budur.
 */
export function terimMarkdown(terim: TerimDetayDTO): string {
  const mutlakUrl = `${env.NEXT_PUBLIC_SITE_URL}/sozluk/${terim.slug}`;
  const bolumler: string[] = [`# ${terim.tr}`];

  const ustSatir = [`İngilizce: ${terim.en}`];
  if (terim.aliases.length > 0) ustSatir.push(`Eşanlamlı: ${terim.aliases.join(", ")}`);
  ustSatir.push(`Konu: ${terim.pillar}`);
  bolumler.push(ustSatir.join(" · "));

  bolumler.push(`> ${terim.shortDef}`);
  if (terim.longDef.trim().length > 0) bolumler.push(terim.longDef.trim());

  if (terim.ilgili.length > 0) {
    bolumler.push(
      "## İlgili terimler",
      terim.ilgili
        .map((t) => `- [${t.tr}](${env.NEXT_PUBLIC_SITE_URL}/sozluk/${t.slug})`)
        .join("\n"),
    );
  }

  if (terim.sources.length > 0) {
    bolumler.push(
      "## Kaynaklar",
      terim.sources
        .map((k, sira) => `${sira + 1}. [${k.label}](${k.url}) — ${k.publisher}`)
        .join("\n"),
    );
  }

  bolumler.push(`---\n\nKanonik URL: ${mutlakUrl}`);
  return `${bolumler
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()}\n`;
}
