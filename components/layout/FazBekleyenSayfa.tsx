import Link from "next/link";

/**
 * Henüz açılmamış modüller için gerçek sayfa (404 yerine): ne geleceğini ve
 * bugün nereye bakılacağını dürüstçe söyler. Uydurma "çok yakında"
 * pazarlaması yok.
 *
 * İç faz numaralandırması (Faz 7/8…) BİLİNÇLİ olarak dışarı verilmez:
 * okuyucunun proje planımızdaki sıra numarasıyla işi yok, tarih sözü
 * veremediğimiz için de tarih yazmıyoruz. Sayfanın işi beklentiyi doğru
 * kurmak ve bugün işe yarayan alternatifi göstermek.
 */
export function FazBekleyenSayfa({
  indeks,
  baslik,
  ozet,
  kapsam,
  simdilik,
}: {
  indeks: string;
  baslik: string;
  ozet: string;
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
            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-doku bg-kagit-alt px-3 py-1.5 font-mono text-xs text-murekkep-2">
              <span aria-hidden className="inline-block size-1.5 rounded-full bg-olcum" />
              bu bölüm henüz açık değil
            </p>
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
                {simdilik.etiket}{" "}
                <span aria-hidden className="ok">
                  →
                </span>
              </Link>
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
