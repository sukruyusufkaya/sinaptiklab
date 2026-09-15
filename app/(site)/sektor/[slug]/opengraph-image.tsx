import { ogKarti, OG_BOYUTU, OG_TURU } from '@/lib/seo/og-gorsel';
import { sektorBul } from '@/lib/icerik/kurumsal';

/**
 * SEKTÖR paylaşım kartı.
 *
 * Düzen `lib/seo/og-gorsel.tsx` içindedir; burada yalnızca veri toplanır.
 * Kayıt bulunamazsa (taslak ya da silinmiş) kart üretilmez ve sayfa kök
 * kartını miras alır — kırık görsel yerine varsayılan kart gösterilir.
 */

export const size = OG_BOYUTU;
export const contentType = OG_TURU;

export default async function OgGorseli({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const k = await sektorBul(slug);
  if (!k) return ogKarti({ etiket: 'SEKTÖR', baslik: 'Sinaptik Lab' });

  return ogKarti({
    etiket: 'SEKTÖR',
    baslik: k.ad,
    altMetin: k.ozet,
    kunye: undefined,
  });
}
