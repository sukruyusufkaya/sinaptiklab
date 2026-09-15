import { HABER_PARCASI_ADI, HARITA_PARCALARI, indeksOlustur } from '@/lib/seo/site-haritasi';

/**
 * Site haritası indeksi (MASTER-PLAN §50).
 *
 * `robots.txt` yalnızca bu adresi bildirir; arama motoru parçaları buradan
 * keşfeder. Parça listesi `HARITA_PARCALARI` kayıt defterinden gelir — yeni
 * parça eklemek için bu dosya değişmez.
 *
 * Haber haritası da indekste yer alır: Google News onu ayrı keşfetmek yerine
 * indeksten okuyabilir.
 */

export const dynamic = 'force-dynamic';

export async function GET() {
  const parcalar = [...HARITA_PARCALARI.map((p) => ({ ad: p.ad })), { ad: HABER_PARCASI_ADI }];

  return new Response(indeksOlustur(parcalar, new Date()), {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      // Panel yayımladığında indeks en geç bir saat içinde tazelenir.
      'cache-control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
