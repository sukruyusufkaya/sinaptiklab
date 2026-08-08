import type { ReactNode } from "react";
import { OlayBeacon } from "@/components/analytics/OlayBeacon";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

/**
 * Site kabuğu — eski kök layout'taki skip-link + Header + main + Footer birebir
 * buraya taşındı; (admin) grubu bu kabuğu ALMAZ (kendi minimal kabuğu var).
 * app/not-found.tsx kökte kaldığı için 404 sayfası chrome'suz ama markalıdır
 * (bilinçli karar).
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#icerik"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:bg-kagit focus:px-3 focus:py-2 focus:font-mono focus:text-sm"
      >
        İçeriğe atla
      </a>
      <OlayBeacon />
      <Header />
      <main id="icerik" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
