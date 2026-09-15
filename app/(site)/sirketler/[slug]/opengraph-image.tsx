import { ogKarti, OG_BOYUTU, OG_TURU } from '@/lib/seo/og-gorsel';
import { sirketBul } from '@/lib/icerik/varliklar';

/**
 * ŞİRKET paylaşım kartı.
 *
 * Düzen `lib/seo/og-gorsel.tsx` içindedir; burada yalnızca veri toplanır.
 * Kayıt bulunamazsa (taslak ya da silinmiş) kart üretilmez ve sayfa kök
 * kartını miras alır — kırık görsel yerine varsayılan kart gösterilir.
 */

export const size = OG_BOYUTU;
export const contentType = OG_TURU;

export default async function OgGorseli({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const k = await sirketBul(slug);
  if (!k) return ogKarti({ etiket: 'ŞİRKET', baslik: 'Sinaptik Lab' });

  return ogKarti({
    etiket: 'ŞİRKET',
    baslik: k.ad,
    altMetin: k.ozet,
    kunye: [k.merkez],
  });
}
