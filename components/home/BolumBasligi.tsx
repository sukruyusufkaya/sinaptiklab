import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Ana sayfa bölüm başlığı: teknik belge numaralandırması (§01, §02…) +
 * başlık + sağda bağlam notu ya da "tümü" bağlantısı. Bölümler arası ritmi
 * bu kalıp taşır.
 */
export function BolumBasligi({
  no,
  id,
  baslik,
  not,
  bagAdres,
  bagEtiket,
}: {
  no: string;
  id: string;
  baslik: string;
  not?: ReactNode;
  bagAdres?: string;
  bagEtiket?: string;
}) {
  return (
    <div className="relative flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-doku pb-3">
      {/* Alt çizginin sinyal katmanı: bölüm görüş alanına girerken çizilir */}
      <span aria-hidden className="cizgi-ciz absolute inset-x-0 bottom-[-1px] h-px bg-sinyal/60" />
      <div className="min-w-0">
        <p className="bolum-indeks uppercase">§ {no}</p>
        <h2 id={id} className="mt-2 font-display text-2xl font-bold tracking-tight">
          {baslik}
        </h2>
      </div>
      {bagAdres !== undefined && bagEtiket !== undefined ? (
        <Link
          href={bagAdres}
          className="baglanti-iz ok-kayar font-mono text-xs text-murekkep-2 hover:text-sinyal"
        >
          {bagEtiket}{" "}
          <span aria-hidden className="ok">
            →
          </span>
        </Link>
      ) : (
        not !== undefined && <p className="font-mono text-xs text-murekkep-2">{not}</p>
      )}
    </div>
  );
}
