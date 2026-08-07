import type { Metadata, Viewport } from "next";
import type { CSSProperties, ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { env } from "@/lib/env";
import { fontDegiskenleri } from "@/lib/fonts";
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
      <body className="flex min-h-dvh flex-col antialiased">
        <a
          href="#icerik"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:bg-kagit focus:px-3 focus:py-2 focus:font-mono focus:text-sm"
        >
          İçeriğe atla
        </a>
        <Header />
        <main id="icerik" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
