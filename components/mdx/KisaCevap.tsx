// BRIEF §6.2/§6.1-5 — "Kısa cevap" kutusu: ilk ekranda, kopyalanabilir,
// GEO'nun ana çıkarılabilir birimi. Enstrüman dili: sinyal renginde sol
// kılavuz şerit + mono başlık çubuğu + okuma değeri gövdesi.
import type { ReactNode } from "react";
import { KopyalaButonu } from "./KopyalaButonu";

export function KisaCevap({ children }: { children: ReactNode }) {
  return (
    <aside
      data-kopyalanabilir
      aria-label="Kısa cevap"
      className="my-7 border border-murekkep rounded-md bg-kagit-alt"
    >
      <div className="flex items-center justify-between gap-2 border-b border-murekkep/25 px-4 py-2">
        <span className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-murekkep-2">
          <span aria-hidden className="inline-block h-3 w-0.5 bg-sinyal" />
          kısa cevap
        </span>
        <KopyalaButonu />
      </div>
      <div
        data-kopya-icerik
        className="px-4 py-4 text-[1.0625rem] leading-relaxed [&>p:first-child]:mt-0 [&>p:last-child]:mb-0"
      >
        {children}
      </div>
    </aside>
  );
}
