import Link from 'next/link';
import type { ReactNode } from 'react';
import { Kirintilar } from '@/components/arayuz/Kirintilar';
import { Ok, Onay } from '@/components/arayuz/Ikonlar';

/** Giriş ve üyelik sayfalarının ortak düzeni. */
export function KimlikKarti({
  etiket,
  baslik,
  ozet,
  kirinti,
  form,
  faydalar,
  altMetin,
}: {
  etiket: string;
  baslik: string;
  ozet: string;
  kirinti: { ad: string; yol: string };
  form: ReactNode;
  faydalar: { ad: string; tarif: string }[];
  altMetin: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="izgara-zemin absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black,transparent)]" />
        <div className="absolute -top-32 left-1/2 h-80 w-[36rem] -translate-x-1/2 rounded-full bg-vurgu/14 blur-[120px]" />
      </div>

      <div className="kap relative py-10 md:py-16">
        <Kirintilar ogeler={[kirinti]} />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
          <div className="lg:pt-4">
            <p className="etiket-mono mb-4 text-vurgu-parlak">{etiket}</p>
            <h1 className="max-w-xl text-[2rem] leading-[1.08] font-semibold tracking-[-0.028em] text-balance sm:text-[2.5rem]">
              {baslik}
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-metin-ikincil">{ozet}</p>

            <ul className="mt-9 space-y-4">
              {faydalar.map((fayda) => (
                <li key={fayda.ad} className="flex items-start gap-3.5">
                  <Onay className="mt-0.5 size-4 shrink-0 text-basari" />
                  <span>
                    <span className="block text-[0.9375rem] font-medium text-metin">
                      {fayda.ad}
                    </span>
                    <span className="mt-0.5 block text-[0.8125rem] leading-relaxed text-metin-soluk">
                      {fayda.tarif}
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-10 rounded-xl border border-kenar bg-yuzey/40 p-5">
              <p className="etiket-mono mb-2 text-metin-soluk">Üyelik olmadan da</p>
              <p className="text-[0.875rem] leading-relaxed text-metin-ikincil">
                Atlas, rehberler, gündem, araştırma ve tüm testler üyelik gerektirmez ve taranabilir
                durumdadır. Üyelik yalnızca ilerlemenizi kaydetmek için gerekir.
              </p>
              <Link
                href="/atlas/"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-vurgu-parlak"
              >
                Atlas&apos;a göz at
                <Ok className="size-3.5" />
              </Link>
            </div>
          </div>

          <div>
            {form}
            <p className="mt-5 text-center text-xs leading-relaxed text-metin-soluk">{altMetin}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Form alanı — giriş/üyelik formlarında tekrar eden girdi bloğu. */
export function AlanGrubu({
  kimlik,
  etiket,
  tur = 'text',
  ipucu,
}: {
  kimlik: string;
  etiket: string;
  tur?: 'text' | 'email' | 'password';
  ipucu?: string;
}) {
  return (
    <div>
      <label htmlFor={kimlik} className="etiket-mono mb-1.5 block text-metin-soluk">
        {etiket}
      </label>
      <input
        id={kimlik}
        name={kimlik}
        type={tur}
        required
        autoComplete={
          tur === 'email' ? 'email' : tur === 'password' ? 'current-password' : undefined
        }
        className="h-11 w-full rounded-lg border border-kenar bg-zemin/70 px-3.5 text-sm text-metin outline-none transition-colors focus:border-vurgu"
      />
      {ipucu && <p className="mt-1.5 text-[0.6875rem] text-metin-soluk">{ipucu}</p>}
    </div>
  );
}
