// Sitemap İNDEKSİ (BRIEF §7.1) — kanonik adresi /sitemap.xml'dir
// (next.config.ts rewrite). Next 16 generateSitemaps parçaları
// /sitemap/<id>.xml altında üretir ama indeks dosyası üretmez; app dizininde
// /sitemap.xml yolunu elle kullanmak da metadata rotasıyla çakışır
// ("Conflicting route and metadata at /sitemap.xml" build hatası). Bu yüzden
// indeks bu route'ta yaşar, /sitemap.xml'e rewrite ile bağlanır. Parça
// listesi lib/sitemap-parcalari.ts'ten gelir (app/sitemap.ts ile ortak).
import { env } from "@/lib/env";
import { parcaUrl, SITEMAP_PARCALARI } from "@/lib/sitemap-parcalari";

export const revalidate = 3600;

export function GET(): Response {
  const parcalar = SITEMAP_PARCALARI.map(
    (id) => `  <sitemap><loc>${parcaUrl(env.NEXT_PUBLIC_SITE_URL, id)}</loc></sitemap>`,
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${parcalar}
</sitemapindex>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
