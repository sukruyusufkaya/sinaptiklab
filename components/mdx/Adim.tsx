// BRIEF §6.2 — numaralı adım (tutorial'larda HowTo şemasının görsel eşi).
// Enstrüman dili: numara rozeti + adımı sonrakine bağlayan dikey kılavuz
// çizgi (montaj talimatı hissi).
import type { ReactNode } from "react";

export function Adim({
  n,
  baslik,
  children,
}: {
  n: string | number;
  baslik?: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-label={baslik !== undefined ? `Adım ${n}: ${baslik}` : `Adım ${n}`}
      className="group/adim relative my-7 flex gap-4 pb-1"
    >
      <div className="flex shrink-0 flex-col items-center">
        <span className="flex size-9 items-center justify-center border border-murekkep bg-kagit font-mono text-sm font-bold tabular-nums">
          {n}
        </span>
        {/* sonraki adıma giden kılavuz çizgi (son adımda görünmez kalır) */}
        <span aria-hidden className="mt-2 w-px flex-1 bg-doku" />
      </div>
      <div className="min-w-0 flex-1">
        {baslik !== undefined && (
          <p className="mb-2 mt-1 font-display text-lg font-semibold leading-snug">{baslik}</p>
        )}
        <div className="[&>p:first-child]:mt-0 [&>p:last-child]:mb-0">{children}</div>
      </div>
    </section>
  );
}
