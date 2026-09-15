import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Faceted navigation sonsuz URL uzayı üretir (MASTER-PLAN §51).
        disallow: [
          '/api/',
          '/admin/',
          // Taslak önizleme bağlantıları — yayımlanmamış içerik.
          '/onizleme/',
          // Üyelik ve kimlik sayfaları: kişiye özel, dizinlenmez.
          '/hesabim/',
          '/giris/',
          '/uye-ol/',
          '/parola-sifirla/',
          '/*?format=',
          '/*?level=',
          '/*?year=',
          '/ara/',
        ],
      },
    ],
    /*
     * Yalnızca İNDEKS bildirilir; parçaları arama motoru indeksten keşfeder
     * (MASTER-PLAN §50). Parça listesi `lib/seo/site-haritasi.ts` içindedir.
     */
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
