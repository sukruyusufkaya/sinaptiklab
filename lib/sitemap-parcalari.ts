// Parçalı sitemap'in tek doğruluk kaynağı (BRIEF §7.1). Hem app/sitemap.ts
// (parça üretimi, /sitemap/<id>.xml) hem app/sitemap-indeksi.xml/route.ts
// (indeks; /sitemap.xml'e rewrite'lı) bu listeden okur — liste değişirse iki
// yüzey birlikte değişir. Next 16 generateSitemaps ile /sitemap.xml'i KENDİSİ
// üretmediği için indeks ayrı route handler'dır.
import type { IcerikTuru } from "@/lib/rotalar";

export const SITEMAP_PARCALARI = [
  "sayfalar",
  "makaleler",
  "rehberler",
  "uygulamalar",
  "diger",
  "konular",
  "sozluk",
] as const;

export type SitemapParcasi = (typeof SITEMAP_PARCALARI)[number];

export function sitemapParcasiMi(id: string): id is SitemapParcasi {
  return (SITEMAP_PARCALARI as readonly string[]).includes(id);
}

/** İçerik türü taşıyan parçalar → contents sorgusundaki type filtresi. */
export const PARCA_ICERIK_TURU: Partial<Record<SitemapParcasi, IcerikTuru>> = {
  makaleler: "article",
  rehberler: "guide",
  uygulamalar: "tutorial",
};

/**
 * Kalan türler tek parçada toplanır. Beşi için beş ayrı dosya açmak,
 * hepsi boşken sitemap indeksini boş dosyalarla doldururdu; tek parça
 * hem indeksi temiz tutar hem içerik geldiğinde kendiliğinden dolar.
 */
export const DIGER_TURLER: readonly IcerikTuru[] = [
  "lab",
  "tool",
  "benchmark",
  "case",
  "compliance",
];

/** Parçanın mutlak URL'i — Next kalıbı: /sitemap/<id>.xml */
export function parcaUrl(siteUrl: string, id: SitemapParcasi): string {
  return `${siteUrl}/sitemap/${id}.xml`;
}
