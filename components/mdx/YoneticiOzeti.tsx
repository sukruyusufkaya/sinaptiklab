// BRIEF §6.2 — yönetici özeti: 5 dakikada durum isteyen okuyucu için
// (§1.4 "yönetici okuyucu" personası). Spektrum çentikleriyle çerçevelenmiş,
// gövde metninden belirgin şekilde ayrışan blok.
import type { ReactNode } from "react";

export function YoneticiOzeti({ children }: { children: ReactNode }) {
  return (
    <aside aria-label="Yönetici özeti" className="my-8">
      <div className="spektrum" aria-hidden />
      <div className="bg-kagit-alt px-5 py-4">
        <p className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-murekkep-2">
          <span aria-hidden className="inline-block size-1.5 bg-sinyal" />
          yönetici özeti
        </p>
        <div className="mt-3 text-[1.0625rem] leading-relaxed [&>p:first-child]:mt-0 [&>p:last-child]:mb-0 [&>ul]:mt-2">
          {children}
        </div>
      </div>
      <div className="cetvel" aria-hidden />
    </aside>
  );
}
