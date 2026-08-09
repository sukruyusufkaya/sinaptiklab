// Yükleme iskeletleri (ADR 0009): içerik gelene kadar tarama bandıyla
// canlanan hairline bloklar. Ölçüm cihazının "veri bekleniyor" durumu.
// aria-hidden + üstte sr-only durum bildirimi (ekran okuyucu için).

function Blok({ sinif }: { sinif: string }) {
  return <div aria-hidden className={`iskelet ${sinif}`} />;
}

/** Kart ızgarası iskeleti (liste sayfaları) */
export function KartIzgarasiIskeleti({ adet = 6 }: { adet?: number }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">İçerik yükleniyor</span>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: adet }, (_, i) => (
          <li key={i}>
            <Blok sinif="h-[190px] w-full" />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Makale iskeleti (detay sayfaları) */
export function MakaleIskeleti() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto max-w-[1280px] px-[var(--gutter)] py-10"
    >
      <span className="sr-only">Makale yükleniyor</span>
      <div className="mx-auto max-w-[var(--govde-olcu)] space-y-4">
        <Blok sinif="h-4 w-52" />
        <Blok sinif="h-12 w-full" />
        <Blok sinif="h-12 w-4/5" />
        <Blok sinif="h-5 w-full" />
        <Blok sinif="h-14 w-full" />
        <div className="pt-4" />
        <Blok sinif="h-40 w-full" />
        <Blok sinif="h-5 w-full" />
        <Blok sinif="h-5 w-11/12" />
        <Blok sinif="h-5 w-3/4" />
      </div>
    </div>
  );
}
