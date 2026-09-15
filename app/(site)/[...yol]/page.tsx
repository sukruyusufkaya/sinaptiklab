import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { yonlendirmeCoz } from '@/lib/mongo/sorgular/yonlendirme';

/**
 * Yakalayıcı rota — panelde tanımlı URL yönlendirmelerini uygular.
 *
 * Next yol eşleştirmede statik segmentleri, sonra dinamik segmentleri, EN SON
 * yakalayıcıyı dener. Bu yüzden burası yalnızca gerçek bir sayfaya karşılık
 * gelmeyen adreslerde çalışır: yaşayan bir sayfayı gölgeleyemez. Gerekçenin
 * tamamı `lib/mongo/sorgular/yonlendirme.ts` başlığındadır.
 *
 * Yönlendirme yoksa `notFound()` çağrılır ve normal 404 ekranı basılır —
 * yani bu rotanın varlığı 404 davranışını değiştirmez.
 */

export const dynamic = 'force-dynamic';

/**
 * Bu rota indekslenmez. Yönlendirme bulunursa yanıt zaten 3xx olur; bulunmazsa
 * `notFound()` 404 döndürür. Yine de yedek emniyet olarak noindex verilir.
 */
export const metadata = {
  robots: { index: false, follow: false },
};

export default async function YonlendirmeYakalayici({
  params,
}: {
  params: Promise<{ yol: string[] }>;
}) {
  const { yol } = await params;
  const istenenYol = `/${(yol ?? []).join('/')}/`;

  const sonuc = await yonlendirmeCoz(istenenYol);
  if (!sonuc) notFound();

  // `redirect` ve `permanentRedirect` özel bir hata atarak çalışır; bu yüzden
  // çağrıdan sonra kod yürümez ve try/catch içine ALINMAMALIDIR.
  if (sonuc.kalici) permanentRedirect(sonuc.hedefYol);
  redirect(sonuc.hedefYol);
}
