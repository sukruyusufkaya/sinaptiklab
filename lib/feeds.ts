// Feed yüzeylerinin ortak katmanı (BRIEF §7.1): /feed.xml (RSS 2.0),
// /atom.xml (Atom 1.0) ve /feed.json (JSON Feed 1.1) aynı veriden beslenir.
// DB hatasında 500 ATILMAZ; boş-öğeli ama spesifikasyona uygun feed döner —
// app/(site)/page.tsx'teki DB'siz dayanıklılık deseninin feed karşılığı.
import { yayindakiIcerikListesi } from "@/lib/db/queries/contents";
import { env } from "@/lib/env";
import { icerikYolu } from "@/lib/rotalar";

export const SITE_URL = env.NEXT_PUBLIC_SITE_URL;
export const FEED_BASLIK = "Sinaptiklab";
export const FEED_ACIKLAMA =
  "Yapay zeka sistemlerini gerçekten üretenler için Türkçe teknik yayın: " +
  "her iddia kaynaklı, her tutorial çalışan repo ile. Saha verisi, uydurma yok.";
export const FEED_YAZAR = "Sinaptiklab";
export const FEED_DIL = "tr";

export interface FeedOgesi {
  title: string;
  dek: string;
  excerptHtml: string;
  /** Mutlak URL — aynı zamanda kalıcı kimlik (guid / atom:id / JSON id). */
  url: string;
  /** ISO 8601; yayınlanmış içerikte hep dolu, güvenlik için updatedAt yedeği. */
  publishedAt: string;
  updatedAt: string;
}

/** Son `adet` yayın; DB hatasında boş liste (feed'ler 500 atmaz). */
export async function feedOgeleri(adet = 20): Promise<FeedOgesi[]> {
  try {
    const liste = await yayindakiIcerikListesi({ adet });
    return liste.map((icerik) => ({
      title: icerik.title,
      dek: icerik.dek,
      excerptHtml: icerik.excerptHtml,
      url: `${SITE_URL}${icerikYolu(icerik.type, icerik.slug)}`,
      publishedAt: icerik.publishedAt ?? icerik.updatedAt,
      updatedAt: icerik.updatedAt,
    }));
  } catch {
    return [];
  }
}

/** Feed'in "son güncelleme" damgası: en yeni öğe, yoksa şimdi. */
export function feedGuncellemesi(ogeler: FeedOgesi[]): string {
  return ogeler[0]?.publishedAt ?? new Date().toISOString();
}

/** XML metin düğümü / öznitelik kaçışı (RSS başlık, dek, URL değerleri). */
export function xmlKacis(deger: string): string {
  return deger
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** HTML gövdeyi CDATA'ya güvenle koyar — "]]>" dizisi bölünerek kaçışlanır. */
export function cdata(html: string): string {
  return `<![CDATA[${html.replace(/\]\]>/g, "]]]]><![CDATA[>")}]]>`;
}

/** RSS 2.0 pubDate biçimi (RFC 822/1123, GMT). */
export function rfc822(iso: string): string {
  return new Date(iso).toUTCString();
}
