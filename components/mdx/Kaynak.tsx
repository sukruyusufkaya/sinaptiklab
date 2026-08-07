// BRIEF §6.2 — metin içi atıf: <Kaynak id="3">metin</Kaynak>
// Metnin ardına üst simge dipnot linki [3] ekler; sayfa sonundaki
// numaralı kaynak listesindeki #kaynak-<id> çapasına gider.
import type { ReactNode } from "react";

export function Kaynak({ id, children }: { id: string; children?: ReactNode }) {
  return (
    <>
      {children}
      <sup className="ml-0.5">
        <a
          href={`#kaynak-${id}`}
          aria-label={`Kaynak ${id}`}
          className="font-mono text-xs text-sinyal no-underline hover:underline"
        >
          [{id}]
        </a>
      </sup>
    </>
  );
}
