import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { KonsolGezinme } from "@/components/admin/KonsolGezinme";
import { HudCerceve } from "@/components/layout/HudCerceve";

/**
 * Admin kabuğu — site Header/Footer'ı YOK; yalnız enstrüman konsolu şeridi
 * (ADR 0008 `.ekran`: tema bağımsız koyu panel, "cihazın ekranı hep koyu").
 * Erişim middleware'de Basic Auth ile korunur (ADR 0007); robots noindex
 * yedek emniyettir.
 * Not: /admin/onizleme/<id> de bu kabuğu alır; editördeki iframe önizlemesinin
 * üstünde bar görünür (Faz 2 için kabul edilen sadelik).
 */
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Sinaptiklab Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="ekran hud relative border-b border-doku">
        <HudCerceve />
        <div className="ekran-izgara">
          <div className="mx-auto max-w-[1280px] px-[var(--gutter)]">
            {/* Cihaz üst çubuğu: durum LED'i + konsol kimliği */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-doku py-2.5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-murekkep-2">
              <span className="flex items-center gap-2 text-onay">
                <span aria-hidden className="inline-block size-1.5 bg-onay" />
                bağlı
              </span>
              <span aria-hidden>/</span>
              <Link
                href="/admin"
                className="font-bold tracking-[0.18em] text-murekkep no-underline hover:text-sinyal"
              >
                ADMİN KONSOLU
              </Link>
              <span aria-hidden>/</span>
              <span>kanal 00 · editoryal</span>
              <span className="ml-auto max-sm:hidden">erişim: basic-auth · tr</span>
            </div>

            {/* Sekmeler + çıkış */}
            <div className="flex flex-wrap items-center justify-between gap-x-6">
              <KonsolGezinme />
              <Link
                href="/"
                className="py-2.5 font-mono text-xs uppercase tracking-[0.18em] text-murekkep-2 no-underline hover:text-sinyal"
              >
                siteye dön <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </>
  );
}
