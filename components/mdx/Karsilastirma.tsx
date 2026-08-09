// BRIEF §6.2 — karşılaştırma tablosu sarmalayıcısı. Yatay kaydırma
// (mobil), başlık satırı yapışkan, hairline hücreler ve zebra yok:
// veri tablosu değil, ölçüm çizelgesi görünümü.
import type { ReactNode } from "react";

export function Karsilastirma({ baslik, children }: { baslik?: string; children: ReactNode }) {
  return (
    <figure className="my-7 border border-doku rounded-md">
      {baslik !== undefined && (
        <figcaption className="border-b border-doku bg-kagit-alt px-4 py-2 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-murekkep-2">
          {baslik}
        </figcaption>
      )}
      <div className="overflow-x-auto [&>div]:my-0 [&_table]:my-0 [&_table]:border-0 [&_td]:border-0 [&_td]:border-t [&_td]:border-doku [&_th]:border-0 [&_th]:border-b [&_th]:border-doku [&_th]:bg-kagit-alt [&_th]:font-mono [&_th]:text-[0.7rem] [&_th]:uppercase [&_th]:tracking-wider">
        {children}
      </div>
    </figure>
  );
}
