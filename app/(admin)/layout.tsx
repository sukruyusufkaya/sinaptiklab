import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Admin kabuğu — site Header/Footer'ı YOK; yalnız üst bar. Erişim middleware'de
 * Basic Auth ile korunur (ADR 0007); robots noindex yedek emniyettir.
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
      <header className="border-b border-doku">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-baseline gap-x-6 gap-y-2 px-[var(--gutter)] py-3">
          <Link
            href="/admin"
            className="flex items-baseline gap-1 font-display text-lg font-bold tracking-tight text-murekkep no-underline hover:text-murekkep"
          >
            SINAPTIKLAB
            <span aria-hidden className="inline-block size-2 bg-sinyal" />
            <span className="ml-1 font-mono text-xs font-normal tracking-widest text-murekkep-2">
              ADMİN
            </span>
          </Link>
          <nav aria-label="Admin gezinme" className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link
              href="/admin"
              className="font-mono text-sm text-murekkep-2 no-underline hover:text-sinyal"
            >
              İçerikler
            </Link>
            <Link
              href="/admin/geo"
              className="font-mono text-sm text-murekkep-2 no-underline hover:text-sinyal"
            >
              YZ Görünürlük
            </Link>
            <Link
              href="/"
              className="font-mono text-sm text-murekkep-2 no-underline hover:text-sinyal"
            >
              Siteye dön
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </>
  );
}
