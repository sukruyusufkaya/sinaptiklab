// BRIEF §6.2 — karşılaştırma sarmalayıcısı: çocuğu (GFM) tablo olan blok.
// Yatay kaydırma + hairline çerçeve; mobil kart dönüşümü Faz 3'te.
import type { ReactNode } from "react";

export function Karsilastirma({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 overflow-x-auto border border-doku [&_table]:my-0 [&>div]:my-0">
      {children}
    </div>
  );
}
