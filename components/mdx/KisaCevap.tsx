// BRIEF §6.1/5 — "Kısa cevap" kutusu: answerFirst içeriği, koyu çerçeve,
// ilk ekranda, kopyalanabilir. RSC; yalnız kopyala butonu client.
import type { ReactNode } from "react";
import { KopyalaButonu } from "./KopyalaButonu";

export function KisaCevap({ children }: { children: ReactNode }) {
  return (
    <aside
      aria-label="Kısa cevap"
      data-kopyalanabilir
      className="my-6 border-2 border-murekkep p-4"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="font-mono text-xs tracking-widest text-murekkep-2">KISA CEVAP</span>
        <KopyalaButonu />
      </div>
      <div data-kopya-icerik className="[&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
        {children}
      </div>
    </aside>
  );
}
