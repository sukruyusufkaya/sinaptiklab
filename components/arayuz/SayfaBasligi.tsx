import type { ReactNode } from 'react';
import { Kirintilar, type Kirinti } from './Kirintilar';

/**
 * Arşiv ve hub sayfalarının ortak başlık bloğu.
 * Kırıntı + mono etiket + H1 + özet + ölçüm şeridi + eylem alanı.
 */
export function SayfaBasligi({
  kirintilar,
  etiket,
  baslik,
  ozet,
  olcumler,
  eylemler,
  yan,
  desen = 'izgara',
}: {
  kirintilar: Kirinti[];
  etiket: string;
  baslik: ReactNode;
  ozet?: ReactNode;
  olcumler?: { deger: string; etiket: string }[];
  eylemler?: ReactNode;
  yan?: ReactNode;
  desen?: 'izgara' | 'nokta' | 'yok';
}) {
  return (
    <section className="relative overflow-hidden border-b border-kenar bg-zemin-derin">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {desen === 'izgara' && (
          <div className="izgara-zemin absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_70%_70%_at_30%_0%,black,transparent)]" />
        )}
        {desen === 'nokta' && <div className="nokta-zemin absolute inset-0 opacity-40" />}
        <div className="absolute -top-32 left-1/4 h-72 w-[32rem] rounded-full bg-vurgu/14 blur-[110px]" />
      </div>

      <div className="kap relative py-10 md:py-14">
        <Kirintilar ogeler={kirintilar} />

        <div className={yan ? 'grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]' : ''}>
          <div>
            <p className="etiket-mono mb-4 text-vurgu-parlak">{etiket}</p>
            <h1 className="max-w-3xl text-[2rem] leading-[1.08] font-semibold tracking-[-0.028em] text-balance sm:text-[2.5rem] lg:text-[2.875rem]">
              {baslik}
            </h1>
            {ozet && (
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-metin-ikincil">{ozet}</p>
            )}

            {eylemler && <div className="mt-7 flex flex-wrap items-center gap-3">{eylemler}</div>}

            {olcumler && olcumler.length > 0 && (
              <dl className="mt-9 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-kenar bg-kenar sm:grid-cols-4">
                {olcumler.map((olcum) => (
                  <div key={olcum.etiket} className="bg-zemin px-4 py-3.5">
                    <dt className="etiket-mono text-metin-soluk">{olcum.etiket}</dt>
                    <dd className="mt-1.5 font-mono text-lg font-medium tracking-tight tabular-nums">
                      {olcum.deger}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {yan && <div className="lg:pt-2">{yan}</div>}
        </div>
      </div>
    </section>
  );
}
