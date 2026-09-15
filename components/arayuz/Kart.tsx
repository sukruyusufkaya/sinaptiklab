import Link from 'next/link';
import type { ReactNode } from 'react';
import { Ok } from './Ikonlar';

/**
 * Tek kart sistemi, farklı içerik tipleri için aynı ritmi korur
 * (MASTER-PLAN §108 — kart sistemleri aynı design system altında farklılaşır).
 */
export function Kart({
  yol,
  ustEtiket,
  baslik,
  aciklama,
  altBilgi,
  rozetler,
  vurguTonu = 'vurgu',
  ikon,
  children,
}: {
  yol: string;
  ustEtiket?: ReactNode;
  baslik: ReactNode;
  aciklama?: ReactNode;
  altBilgi?: ReactNode;
  rozetler?: ReactNode;
  vurguTonu?: 'vurgu' | 'ikincil' | 'sinyal';
  ikon?: ReactNode;
  children?: ReactNode;
}) {
  const kenarSinifi =
    vurguTonu === 'ikincil'
      ? 'hover:border-ikincil/45'
      : vurguTonu === 'sinyal'
        ? 'hover:border-sinyal/45'
        : 'hover:border-vurgu/45';

  const metinSinifi =
    vurguTonu === 'ikincil'
      ? 'group-hover:text-ikincil'
      : vurguTonu === 'sinyal'
        ? 'group-hover:text-sinyal'
        : 'group-hover:text-vurgu-parlak';

  return (
    <article
      className={`group relative flex h-full flex-col rounded-2xl border border-kenar bg-yuzey/40 p-5 transition-[border-color,background-color,transform] duration-300 ease-sinaptik hover:-translate-y-0.5 hover:bg-yuzey/70 ${kenarSinifi}`}
    >
      {(ustEtiket || ikon) && (
        <div className="mb-3.5 flex items-start justify-between gap-3">
          {ustEtiket && <span className="etiket-mono text-metin-soluk">{ustEtiket}</span>}
          {ikon}
        </div>
      )}

      <h3 className={`text-[1.0625rem] leading-snug font-semibold tracking-tight ${metinSinifi}`}>
        <Link href={yol} className="before:absolute before:inset-0">
          {baslik}
        </Link>
      </h3>

      {aciklama && (
        <p className="mt-2.5 flex-1 text-[0.8125rem] leading-relaxed text-metin-ikincil">
          {aciklama}
        </p>
      )}

      {children}

      {rozetler && <div className="mt-4 flex flex-wrap gap-1.5">{rozetler}</div>}

      {altBilgi && (
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-kenar-soluk pt-3.5 text-xs text-metin-soluk">
          {altBilgi}
          <Ok className="size-4 shrink-0 transition-transform duration-200 ease-sinaptik group-hover:translate-x-0.5" />
        </div>
      )}
    </article>
  );
}

/** Kart içinde kullanılan küçük etiket. */
export function KartEtiketi({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md border border-kenar-soluk bg-zemin/60 px-2 py-1 text-[0.6875rem] text-metin-soluk">
      {children}
    </span>
  );
}

/** Izgara: kartların ortak dizilimi. */
export function KartIzgarasi({ children, kolon = 3 }: { children: ReactNode; kolon?: 2 | 3 | 4 }) {
  const sinif =
    kolon === 2
      ? 'sm:grid-cols-2'
      : kolon === 4
        ? 'sm:grid-cols-2 lg:grid-cols-4'
        : 'sm:grid-cols-2 lg:grid-cols-3';
  return <div className={`grid gap-4 ${sinif}`}>{children}</div>;
}
