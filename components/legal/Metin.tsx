// Kurumsal/yasal sayfaların gövde tipografisi. Tailwind typography eklentisi
// yok (BRIEF §3 yığını sabit); bu yüzden okunabilir metin öğeleri burada
// token'lı yardımcı bileşenler olarak tanımlanır — hiçbir sayfada hex yok.
import type { ReactNode } from "react";

/** Gövde paragrafı: ölçü sınırı sayfa kabında, satır yüksekliği burada. */
export function P({ children }: { children: ReactNode }) {
  return <p className="mt-4 leading-relaxed text-murekkep-2 first:mt-0">{children}</p>;
}

/** Bölüm içi ara başlık (h3). */
export function AltBaslik({ children }: { children: ReactNode }) {
  return (
    <h3 className="mt-7 font-mono text-sm uppercase tracking-[0.18em] text-murekkep">{children}</h3>
  );
}

/** Enstrüman işaretli liste — madde imi yerine sinyal karesi. */
export function Liste({ children }: { children: ReactNode }) {
  return <ul className="mt-4 space-y-2.5">{children}</ul>;
}

export function Madde({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3 leading-relaxed text-murekkep-2">
      <span aria-hidden className="mt-2.5 size-1.5 shrink-0 bg-sinyal" />
      <span className="min-w-0">{children}</span>
    </li>
  );
}

/** Sıralı (adımlı) liste — mono numaralı. */
export function SiraliListe({ children }: { children: ReactNode }) {
  return <ol className="mt-4 space-y-2.5">{children}</ol>;
}

export function SiraliMadde({ no, children }: { no: number; children: ReactNode }) {
  return (
    <li className="flex gap-3 leading-relaxed text-murekkep-2">
      <span aria-hidden className="mt-0.5 shrink-0 font-mono text-xs text-sinyal">
        {String(no).padStart(2, "0")}
      </span>
      <span className="min-w-0">{children}</span>
    </li>
  );
}

/** Kenar kutusu: mono etiketli, hairline çerçeveli not. */
export function Kutu({ etiket, children }: { etiket: string; children: ReactNode }) {
  return (
    <div className="mt-6 border border-doku rounded-lg bg-kagit-alt px-5 py-4">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-murekkep-2">
        {etiket}
      </p>
      <div className="mt-2 text-sm leading-relaxed text-murekkep-2 [&>p:first-child]:mt-0">
        {children}
      </div>
    </div>
  );
}
