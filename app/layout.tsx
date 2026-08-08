import type { Metadata, Viewport } from "next";
import type { CSSProperties, ReactNode } from "react";
import { env } from "@/lib/env";
import { fontDegiskenleri } from "@/lib/fonts";
import { jsonLdScript, organizasyonJsonLd, webSiteJsonLd } from "@/lib/seo/jsonld";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: {
    default: "Sinaptiklab — Türkçe teknik yapay zeka yayını",
    template: "%s · Sinaptiklab",
  },
  description:
    "Yapay zeka sistemlerini gerçekten üretenler için Türkçe teknik yayın: her iddia kaynaklı, her tutorial çalışan repo ile. Saha verisi, uydurma yok.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f1f2ed" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0d11" },
  ],
};

/**
 * FOUC'suz tema: boyamadan önce localStorage'daki açık tercihi (varsa) html'e
 * yazar; tercih yoksa attribute bırakılmaz ve CSS prefers-color-scheme yönetir.
 * (Tema tercihi kritik durum değildir; BRIEF §14/9 kapsamı dışında.)
 */
const TEMA_SCRIPT = `try{var t=localStorage.getItem("tema");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr" style={fontDegiskenleri as CSSProperties} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: TEMA_SCRIPT }} />
      </head>
      {/* Site kabuğu (skip-link + Header + main + Footer) app/(site)/layout.tsx'te;
          admin kendi minimal kabuğunu app/(admin)/layout.tsx'te kurar. */}
      <body className="flex min-h-dvh flex-col antialiased">
        {children}
        {/* Global JSON-LD (BRIEF §7.2) — body sonunda; crawler'lar konumdan bağımsız okur */}
        {jsonLdScript(organizasyonJsonLd())}
        {jsonLdScript(webSiteJsonLd())}
      </body>
    </html>
  );
}
