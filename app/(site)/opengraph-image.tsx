import { SITE } from '@/lib/site';
import { ogKarti, OG_BOYUTU, OG_TURU } from '@/lib/seo/og-gorsel';

/**
 * Sitenin varsayılan paylaşım kartı.
 *
 * Kendi `opengraph-image` dosyası olmayan her sayfa bunu miras alır — yani
 * hiçbir sayfa kartsız paylaşılmaz.
 */

export const size = OG_BOYUTU;
export const contentType = OG_TURU;
export const alt = `${SITE.ad} — ${SITE.vaat}`;

export default function OgGorseli() {
  return ogKarti({
    etiket: 'YAPAY ZEKÂ BİLGİ PLATFORMU',
    baslik: SITE.vaat,
    altMetin: SITE.aciklama,
  });
}
