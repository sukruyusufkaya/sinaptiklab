import { NextResponse } from 'next/server';
import { siteAramaDizini } from '@/lib/arama-dizini';

/**
 * Arama dizini JSON yüzeyi — komut paleti (⌘K) bunu İLK AÇILIŞTA çeker.
 *
 * NEDEN ROTA, NEDEN PROP DEĞİL: dizin ~900 kayıt taşıyor. Site kabuğu her
 * sayfada monte olduğu için dizini prop olarak geçirmek, onu HER sayfanın RSC
 * yüküne eklerdi — paletini hiç açmayan ziyaretçi de bedelini öderdi. Rota,
 * bedeli yalnızca paleti açana yükler ve tarayıcı yanıtı önbelleğe alır.
 *
 * DİZİNLENMEZ: `robots.ts` tarafında kapsam dışıdır ve yanıt `X-Robots-Tag`
 * taşır; bu bir makine yüzeyidir, içerik sayfası değil.
 */
export const revalidate = 3600;

export async function GET() {
  const dizin = await siteAramaDizini();
  return NextResponse.json(
    { kayitlar: dizin },
    {
      headers: {
        'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
        'X-Robots-Tag': 'noindex',
      },
    },
  );
}
