import { notFound } from 'next/navigation';
import {
  HABER_PARCASI_ADI,
  haberHaritasiOlustur,
  parcaBul,
  tekilles,
  urlSetiOlustur,
} from '@/lib/seo/site-haritasi';
import { tumGundem } from '@/lib/icerik/gundem';

/**
 * Adlandırılmış site haritası parçası: `/sitemap/<ad>.xml`.
 *
 * Tek rota bütün parçalara hizmet eder; parça tanımları
 * `lib/seo/site-haritasi.ts` içindeki kayıt defterindedir. Tanınmayan ad 404
 * döner — uydurma bir parça adı boş bir harita üretip arama motorunu
 * yanıltmamalı.
 */

export const dynamic = 'force-dynamic';

/** Google News son iki günün içeriğini bekler. */
const HABER_PENCERESI_GUN = 2;

export async function GET(_istek: Request, { params }: { params: Promise<{ parca: string }> }) {
  const { parca } = await params;
  const ad = parca.replace(/\.xml$/, '');

  if (ad === HABER_PARCASI_ADI) {
    const icerikler = await tumGundem();
    const esik = Date.now() - HABER_PENCERESI_GUN * 24 * 60 * 60 * 1000;

    const girdiler = icerikler.flatMap((icerik) => {
      const yayin = new Date(icerik.yayinTarihi);
      if (Number.isNaN(yayin.getTime()) || yayin.getTime() < esik) return [];
      return [{ yol: icerik.yol, haber: { baslik: icerik.baslik, yayinTarihi: yayin } }];
    });

    return yanit(haberHaritasiOlustur(girdiler));
  }

  const bulunan = parcaBul(ad);
  if (!bulunan) notFound();

  return yanit(urlSetiOlustur(tekilles(await bulunan.uret())));
}

function yanit(govde: string): Response {
  return new Response(govde, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
