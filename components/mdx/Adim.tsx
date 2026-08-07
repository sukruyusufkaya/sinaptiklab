// BRIEF §6.2 — numaralı adım: <Adim n="1" baslik="...">
// Sol tarafta font-mono numara rozeti. HowTo JSON-LD üretimi Faz 4'te;
// şimdilik yalnız görsel + semantik (section + aria-label).
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
      className="my-6 flex gap-4"
    >
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border border-murekkep font-mono text-sm"
      >
        {n}
      </span>
      <div className="min-w-0 flex-1">
        {baslik !== undefined ? (
          <p className="mb-1 mt-0 font-display text-lg font-semibold">{baslik}</p>
        ) : null}
        <div className="[&>p:first-child]:mt-0 [&>p:last-child]:mb-0">{children}</div>
      </div>
    </section>
  );
}
