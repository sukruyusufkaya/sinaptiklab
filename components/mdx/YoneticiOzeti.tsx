// BRIEF §6.2 — yönetici özeti: cetvel motifli üst-alt çizgiler arasında
// "YÖNETİCİ ÖZETİ" etiketli blok (5 dakikada durum okuyucusu için).
import type { ReactNode } from "react";

export function YoneticiOzeti({ children }: { children: ReactNode }) {
  return (
    <aside aria-label="Yönetici özeti" className="my-8">
      <div className="cetvel" aria-hidden="true" />
      <div className="py-4">
        <span className="font-mono text-xs tracking-widest text-murekkep-2">YÖNETİCİ ÖZETİ</span>
        <div className="mt-2 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">{children}</div>
      </div>
      <div className="cetvel" aria-hidden="true" />
    </aside>
  );
}
