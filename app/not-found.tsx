import Link from "next/link";

/**
 * 404 — "sinyal kaybı" ekranı. Kök layout'ta yaşar (site chrome'u yok),
 * bu yüzden kendi geri dönüş bağlantılarını taşır. Düz çizgi motifi
 * statiktir; animasyon yok (§5.6).
 */
export default function BulunamadiSayfasi() {
  return (
    <div className="mm-zemin arti-izgara flex min-h-dvh items-center">
      <div className="mx-auto w-full max-w-[1280px] px-[var(--gutter)] py-20">
        <div className="max-w-[60ch] border border-doku rounded-lg bg-kagit p-8 sm:p-12">
          <p className="flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-uyari">
            <span aria-hidden className="inline-block size-1.5 bg-uyari" />
            sinyal yok · hata 404
          </p>

          <svg
            aria-hidden
            viewBox="0 0 600 60"
            fill="none"
            className="mt-6 h-12 w-full text-doku"
            preserveAspectRatio="none"
          >
            <path
              d="M0 30 H180 L190 30 L196 12 L202 48 L208 30 H240"
              stroke="var(--sinyal)"
              strokeWidth="1.5"
            />
            <path d="M240 30 H600" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
          </svg>

          <h1 className="mt-6 font-display text-3xl font-bold leading-tight tracking-tight">
            Bu adreste bir ölçüm bulunamadı.
          </h1>
          <p className="mt-4 text-murekkep-2">
            Aradığınız sayfa taşınmış, hiç var olmamış ya da henüz yayına alınmamış olabilir.
            Sinaptiklab bölüm bölüm açılıyor; bu bölüm de sırasını bekliyor olabilir.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className="dugme-birincil">
              Ana sayfa <span aria-hidden>→</span>
            </Link>
            <Link href="/konu" className="dugme-cerceve">
              Konu haritası
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
