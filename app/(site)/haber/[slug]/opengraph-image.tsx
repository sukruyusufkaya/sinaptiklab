import { ogKarti, OG_BOYUTU, OG_TURU } from '@/lib/seo/og-gorsel';
import { gundemBul } from '@/lib/icerik/gundem';

/**
 * HABER paylaşım kartı.
 *
 * Düzen `lib/seo/og-gorsel.tsx` içindedir; burada yalnızca veri toplanır.
 * Kayıt bulunamazsa (taslak ya da silinmiş) kart üretilmez ve sayfa kök
 * kartını miras alır — kırık görsel yerine varsayılan kart gösterilir.
 */

export const size = OG_BOYUTU;
export const contentType = OG_TURU;

export default async function OgGorseli({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const k = await gundemBul(slug);
  if (!k) return ogKarti({ etiket: 'HABER', baslik: 'Sinaptik Lab' });

  return ogKarti({
    etiket: 'HABER',
    baslik: k.baslik,
    altMetin: k.kisaCevap,
    kunye: [k.yayinTarihi, `${k.okumaDakika} dk`],
  });
}
