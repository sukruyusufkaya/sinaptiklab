// BRIEF §6.2 — metin içi atıf: <Kaynak id="3">metin</Kaynak>
// Metnin ardına üst simge dipnot linki [3] ekler; sayfa sonundaki numaralı
// kaynak listesindeki #kaynak-<id> çapasına gider. `kaynaklar` verildiğinde
// (IcerikSayfasi bağlar) xl+ ekranda Tufte tarzı hizalı kenar notu da basar
// (BRIEF §5.5 kenar notu sütunu); kenar notu CSS float ile sağ paya taşar,
// dar ekranda hiç görünmez — dipnot listesi her boyutta erişilebilir kalır.
import type { ReactNode } from "react";

export interface KenarKaynagi {
  label: string;
  publisher: string;
}

export function Kaynak({
  id,
  children,
  kaynaklar,
}: {
  id: string;
  children?: ReactNode;
  kaynaklar?: KenarKaynagi[];
}) {
  const sira = Number.parseInt(id, 10);
  const kaynak =
    kaynaklar !== undefined && Number.isInteger(sira) ? kaynaklar[sira - 1] : undefined;

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
      {kaynak !== undefined && (
        <span aria-hidden className="kenar-notu">
          <span className="font-mono text-sinyal">[{id}]</span> {kaynak.label}
          <span className="text-murekkep-2"> — {kaynak.publisher}</span>
        </span>
      )}
    </>
  );
}
