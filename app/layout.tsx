import type { Metadata, Viewport } from 'next';
import { SITE } from '@/lib/site';
import { yaziSinifi } from '@/lib/yazi-tipleri';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.ad} — Yapay Zekâ Bilgi Platformu`,
    template: `%s · ${SITE.ad}`,
  },
  description: SITE.aciklama,
  applicationName: SITE.ad,
  authors: [{ name: SITE.ad, url: SITE.url }],
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: SITE.ad,
    url: SITE.url,
    title: `${SITE.ad} — Yapay Zekâ Bilgi Platformu`,
    description: SITE.aciklama,
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbfbfd' },
    { media: '(prefers-color-scheme: dark)', color: '#111219' },
  ],
};

/** Tema tercihini ilk boyamadan önce uygular; renk sıçraması olmaz. */
const TEMA_BETIGI = `(function(){try{var t=localStorage.getItem('sinaptik-tema');if(t==='aydinlik'||t==='karanlik'){document.documentElement.setAttribute('data-tema',t)}}catch(e){}})()`;

export default function KokDuzen({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: TEMA_BETIGI }} />
        {/*
          Akış keşfi doğrudan `<head>` içine yazılır, `metadata.alternates`
          ÜZERİNDEN DEĞİL: Next üstveriyi alan alan birleştirirken bir sayfanın
          kendi `alternates` nesnesi kökün `alternates`'ini BÜTÜN OLARAK ezer.
          Ana sayfa `alternates: { canonical: '/' }` yazdığı için akış
          bağlantıları sessizce düşüyordu. Buradaki etiketler her sayfada durur.
        */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`${SITE.ad} — RSS`}
          href="/rss.xml"
        />
        <link
          rel="alternate"
          type="application/atom+xml"
          title={`${SITE.ad} — Atom`}
          href="/atom.xml"
        />
      </head>
      <body className={yaziSinifi}>{children}</body>
    </html>
  );
}
