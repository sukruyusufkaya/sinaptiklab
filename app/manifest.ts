import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';
import { MARKA } from '@/lib/seo/marka';

/**
 * Web uygulama künyesi.
 *
 * `display: 'browser'` bilinçli: site bir uygulama değil, yayın. Tam ekran
 * bağımsız kip adres çubuğunu gizler ve okuyucunun kanonik adresi görmesini
 * engeller — bilgi platformunda adresin görünür olması güven unsurudur.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.ad} — Yapay Zekâ Bilgi Platformu`,
    short_name: SITE.kisaAd,
    description: SITE.aciklama,
    start_url: '/',
    display: 'browser',
    background_color: MARKA.zemin,
    theme_color: MARKA.vurgu,
    lang: 'tr-TR',
    dir: 'ltr',
    categories: ['education', 'news', 'technology'],
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
  };
}
