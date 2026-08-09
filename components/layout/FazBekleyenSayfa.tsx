import Link from "next/link";

/**
 * Sonraki fazda açılacak modüller için gerçek sayfa (404 yerine): ne
 * geleceğini, hangi fazda planlandığını ve şimdilik nereye bakılacağını
 * dürüstçe söyler. Uydurma "çok yakında" pazarlaması yok — plan açık.
 */
export function FazBekleyenSayfa({
  indeks,
  baslik,
  ozet,
  faz,
  kapsam,
  simdilik,
}: {
  indeks: string;
  baslik: string;
  ozet: string;
  faz: string;
  kapsam: string[];
  simdilik: { metin: string; href: string; etiket: string };
}) {
  return (
    <>
      <section className="ekran relative overflow-hidden border-b border-doku">
        <div className="ekran-izgara">
          <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-14">
            <p className="bolum-indeks uppercase">§ {indeks}</p>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-murekkep [font-stretch:94%]">
              {baslik}
            </h1>
            <p className="mt-4 max-w-[var(--govde-olcu)] leading-relaxed text-murekkep-2">{ozet}</p>
            <div className="veri-rayi mt-7 max-w-md">
              <div>
                durum
                <br />
                <span className="deger">planlandı</span>
              </div>
              <div>
                faz
                <br />
                <span className="deger">{faz}</span>
              </div>
              <div>
                modül
                <br />
                <span className="deger">kapalı</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1280px] gap-8 px-[var(--gutter)] py-12 lg:grid-cols-2">
        <section aria-labelledby="kapsam-baslik" className="beliren">
          <h2
            id="kapsam-baslik"
            className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-murekkep-2"
          >
            Bu modülde ne olacak
          </h2>
          <ul className="mt-4 space-y-2">
            {kapsam.map((madde, sira) => (
              <li key={madde} className="flex gap-3 text-sm leading-relaxed">
                <span aria-hidden className="shrink-0 font-mono text-xs text-sinyal">
                  {String(sira + 1).padStart(2, "0")}
                </span>
                <span className="text-murekkep-2">{madde}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="simdilik-baslik" className="beliren">
          <h2
            id="simdilik-baslik"
            className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-murekkep-2"
          >
            Şimdilik
          </h2>
          <div className="centik mt-4 border border-doku rounded-lg bg-kagit-alt p-6">
            <p className="leading-relaxed text-murekkep-2">{simdilik.metin}</p>
            <p className="mt-5">
              <Link href={simdilik.href} className="dugme-cerceve">
                {simdilik.etiket} <span aria-hidden>→</span>
              </Link>
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
