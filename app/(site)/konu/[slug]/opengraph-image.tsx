import { ogKarti, OG_BOYUTU, OG_TURU } from '@/lib/seo/og-gorsel';
import { konuBul } from '@/lib/icerik/temel';

/**
 * KONU paylaşım kartı.
 *
 * Düzen `lib/seo/og-gorsel.tsx` içindedir; burada yalnızca veri toplanır.
 * Kayıt bulunamazsa (taslak ya da silinmiş) kart üretilmez ve sayfa kök
 * kartını miras alır — kırık görsel yerine varsayılan kart gösterilir.
 */

export const size = OG_BOYUTU;
export const contentType = OG_TURU;

export default async function OgGorseli({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const k = await konuBul(slug);
  if (!k) return ogKarti({ etiket: 'KONU', baslik: 'Sinaptik Lab' });

  return ogKarti({
    etiket: 'KONU',
    baslik: k.ad,
    kunye: [k.kume],
  });
}
