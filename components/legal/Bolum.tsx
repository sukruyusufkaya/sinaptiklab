// Numaralı metin bölümü — kurumsal/yasal sayfalarda tek başlık ritmi.
// `id` stabil tutulur: yasal metinlere derin bağlantı verilebilmeli
// (örn. /kvkk-aydinlatma#haklar).
import type { ReactNode } from "react";

interface Props {
  id: string;
  /** İki haneli bölüm damgası: "01", "02"… */
  no: string;
  baslik: string;
  children: ReactNode;
}

export function Bolum({ id, no, baslik, children }: Props) {
  return (
    <section
      aria-labelledby={id}
      className="scroll-mt-24 border-t border-doku py-9 first:border-t-0 first:pt-0"
    >
      <p className="bolum-indeks uppercase">§ {no}</p>
      <h2 id={id} className="mt-2 font-display text-xl font-bold tracking-tight [font-stretch:94%]">
        {baslik}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
