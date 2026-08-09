import Link from "next/link";

/**
 * Site tarafı 404 — kök `app/not-found.tsx`'ten farkı: header/footer
 * kabuğunu alır, yani okuyucu kaybolduğu yerden gezinmeye devam edebilir.
 * (Kök sürüm yalnız layout dışı hatalarda görünür.)
 */
export default function SiteBulunamadi() {
  return (
    <>
      <section className="ekran relative overflow-hidden border-b border-doku">
        <div className="ekran-izgara">
          <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-16">
            <p className="flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-uyari">
              <span aria-hidden className="led inline-block size-1.5 bg-uyari" />
              sinyal yok · hata 404
            </p>
            <svg
              aria-hidden
              viewBox="0 0 600 60"
              fill="none"
              className="mt-6 h-12 w-full max-w-2xl text-doku"
              preserveAspectRatio="none"
            >
              <path
                d="M0 30 H180 L190 30 L196 12 L202 48 L208 30 H240"
                stroke="var(--sinyal)"
                strokeWidth="1.5"
              />
              <path
                d="M240 30 H600"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            </svg>
            <h1 className="mt-6 max-w-[24ch] font-display text-3xl font-bold leading-tight tracking-tight text-murekkep [font-stretch:94%]">
              Bu adreste bir ölçüm bulunamadı.
            </h1>
            <p className="mt-4 max-w-[var(--govde-olcu)] leading-relaxed text-murekkep-2">
              Sayfa taşınmış, hiç var olmamış ya da henüz yayına alınmamış olabilir. Aradığınızı
              aramayla bulabilir veya konu haritasından ilerleyebilirsiniz.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/ara" className="dugme-birincil">
                Aramaya git <span aria-hidden>→</span>
              </Link>
              <Link href="/konu" className="dugme-cerceve">
                Konu haritası
              </Link>
              <Link href="/" className="dugme-cerceve">
                Ana sayfa
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-12">
        <h2 className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-murekkep-2">
          Sık kullanılan bölümler
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/makale", etiket: "Makaleler" },
            { href: "/rehber", etiket: "Rehberler" },
            { href: "/sozluk", etiket: "Sözlük" },
            { href: "/bulten", etiket: "Bülten arşivi" },
          ].map((madde) => (
            <li key={madde.href}>
              <Link
                href={madde.href}
                className="centik flex items-center justify-between border border-doku rounded-lg px-4 py-3 text-sm text-murekkep no-underline transition-colors hover:border-doku-guclu"
              >
                {madde.etiket}
                <span aria-hidden className="font-mono text-xs text-sinyal">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
