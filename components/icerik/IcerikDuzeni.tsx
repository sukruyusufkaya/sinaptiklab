import type { ReactNode } from 'react';

/** Uzun metin düzeni: solda gövde, sağda yapışkan kenar çubuğu. */
export function IcerikDuzeni({
  children,
  kenar,
  kimlik = 'makale',
}: {
  children: ReactNode;
  kenar?: ReactNode;
  /** Okuma ilerleme çubuğunun ölçtüğü kap. */
  kimlik?: string;
}) {
  return (
    <div className="kap py-10 md:py-14">
      <div
        className={
          kenar ? 'grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,19rem)] lg:gap-14' : ''
        }
      >
        <div id={kimlik} className="min-w-0">
          {children}
        </div>
        {kenar && <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">{kenar}</aside>}
      </div>
    </div>
  );
}

/** Sayfa altı büyük eylem bloğu. */
export function KapanisCagrisi({
  etiket,
  baslik,
  metin,
  eylemler,
}: {
  etiket: string;
  baslik: string;
  metin: string;
  eylemler: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-t border-kenar bg-zemin-derin">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="izgara-zemin absolute inset-0 opacity-40" />
        <div className="absolute -bottom-24 left-1/3 h-64 w-[30rem] rounded-full bg-vurgu/14 blur-[110px]" />
      </div>
      <div className="kap relative py-14 md:py-16">
        <p className="etiket-mono mb-4 text-vurgu-parlak">{etiket}</p>
        <h2 className="max-w-2xl text-2xl leading-[1.12] font-semibold tracking-tight text-balance sm:text-3xl">
          {baslik}
        </h2>
        <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-metin-ikincil">{metin}</p>
        <div className="mt-7 flex flex-wrap items-center gap-3">{eylemler}</div>
      </div>
    </section>
  );
}
