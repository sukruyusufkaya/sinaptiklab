import { ogKarti, OG_BOYUTU, OG_TURU } from '@/lib/seo/og-gorsel';
import { koseYazisiBul } from '@/lib/icerik/kose';
import { tarihUzun } from '@/lib/bicim';

/**
 * KÖŞE YAZISI paylaşım kartı.
 *
 * Görüş yazısı imzalıdır; künyede yazar adı başta durur. Düzen
 * `lib/seo/og-gorsel.tsx` içindedir, burada yalnızca veri toplanır.
 */

export const size = OG_BOYUTU;
export const contentType = OG_TURU;

export default async function OgGorseli({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const yazi = await koseYazisiBul(slug);
  if (!yazi) return ogKarti({ etiket: 'KÖŞE YAZISI', baslik: 'Sinaptik Lab' });

  return ogKarti({
    etiket: 'KÖŞE YAZISI · GÖRÜŞ',
    baslik: yazi.baslik,
    altMetin: yazi.ozet ?? yazi.kisaCevap,
    kunye: [yazi.yazar.ad, tarihUzun(yazi.tarih), `${yazi.okumaDakika} dk`],
  });
}
