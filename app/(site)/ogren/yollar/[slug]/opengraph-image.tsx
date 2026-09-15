import { ogKarti, OG_BOYUTU, OG_TURU } from '@/lib/seo/og-gorsel';
import { yolBul } from '@/lib/icerik/ogrenme';

/**
 * ÖĞRENME YOLU paylaşım kartı.
 *
 * Düzen `lib/seo/og-gorsel.tsx` içindedir; burada yalnızca veri toplanır.
 * Kayıt bulunamazsa (taslak ya da silinmiş) kart üretilmez ve sayfa kök
 * kartını miras alır — kırık görsel yerine varsayılan kart gösterilir.
 */

export const size = OG_BOYUTU;
export const contentType = OG_TURU;

export default async function OgGorseli({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const k = await yolBul(slug);
  if (!k) return ogKarti({ etiket: 'ÖĞRENME YOLU', baslik: 'Sinaptik Lab' });

  return ogKarti({
    etiket: 'ÖĞRENME YOLU',
    baslik: k.ad,
    altMetin: k.aciklama,
    kunye: [k.rol, `${k.saat} saat`],
  });
}
