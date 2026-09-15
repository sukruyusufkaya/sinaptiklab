import Link from 'next/link';
import type { ReactNode } from 'react';
import { Ok } from './Ikonlar';

/**
 * Ana sayfa ve arşiv bölümlerinin ortak başlık bloğu.
 * Numara + mono etiket + başlık + açıklama + tümünü gör bağlantısı.
 */
export function BolumBasligi({
  numara,
  etiket,
  baslik,
  aciklama,
  baglantiYolu,
  baglantiMetni = 'Tümünü gör',
  arac,
}: {
  numara?: string;
  etiket: string;
  baslik: ReactNode;
  aciklama?: ReactNode;
  baglantiYolu?: string;
  baglantiMetni?: string;
  arac?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-5 border-b border-kenar-soluk pb-5 md:mb-10 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <div className="mb-3 flex items-center gap-3">
          {numara && <span className="etiket-mono text-metin-soluk">{numara}</span>}
          <span className="h-px w-6 bg-kenar-guclu" aria-hidden="true" />
          <span className="etiket-mono text-vurgu-parlak">{etiket}</span>
        </div>
        <h2 className="text-2xl leading-[1.12] font-semibold tracking-tight text-balance sm:text-3xl md:text-[2.125rem]">
          {baslik}
        </h2>
        {aciklama && (
          <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-metin-ikincil">
            {aciklama}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {arac}
        {baglantiYolu && (
          <Link
            href={baglantiYolu}
            className="group inline-flex items-center gap-2 rounded-full border border-kenar px-4 py-2 text-sm font-medium text-metin-ikincil transition-colors duration-200 hover:border-vurgu hover:text-metin"
          >
            {baglantiMetni}
            <Ok className="size-4 transition-transform duration-200 ease-sinaptik group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
