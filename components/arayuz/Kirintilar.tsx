import Link from 'next/link';
import { KirintiSemasi } from '@/lib/seo/jsonld';

export type Kirinti = { ad: string; yol: string };

/**
 * Breadcrumb + BreadcrumbList şeması (MASTER-PLAN §49).
 * Son öge geçerli sayfadır ve bağlantı taşımaz.
 */
export function Kirintilar({ ogeler }: { ogeler: Kirinti[] }) {
  const tumu: Kirinti[] = [{ ad: 'Sinaptik Lab', yol: '/' }, ...ogeler];

  return (
    <>
      <KirintiSemasi ogeler={tumu} />
      <nav aria-label="Sayfa konumu" className="mb-6">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {tumu.map((oge, sira) => {
            const son = sira === tumu.length - 1;
            return (
              <li key={oge.yol} className="flex items-center gap-2">
                {son ? (
                  <span className="etiket-mono text-metin-ikincil" aria-current="page">
                    {oge.ad}
                  </span>
                ) : (
                  <>
                    <Link
                      href={oge.yol}
                      className="etiket-mono text-metin-soluk transition-colors hover:text-metin"
                    >
                      {oge.ad}
                    </Link>
                    <span className="text-metin-soluk" aria-hidden="true">
                      /
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
