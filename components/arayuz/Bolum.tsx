import type { ReactNode } from 'react';

/** Ana sayfa bölümlerinin ortak dikey ritmi ve kap genişliği. */
export function Bolum({
  children,
  kimlik,
  className = '',
  zemin = 'yok',
  etiketlendiren,
}: {
  children: ReactNode;
  kimlik?: string;
  className?: string;
  zemin?: 'yok' | 'derin' | 'yuzey';
  etiketlendiren?: string;
}) {
  const zeminSinifi =
    zemin === 'derin'
      ? 'bg-zemin-derin border-y border-kenar-soluk'
      : zemin === 'yuzey'
        ? 'bg-yuzey/40 border-y border-kenar-soluk'
        : '';

  return (
    <section
      id={kimlik}
      aria-labelledby={etiketlendiren}
      className={`${zeminSinifi} ${className}`.trim()}
    >
      <div className="kap py-14 md:py-20">{children}</div>
    </section>
  );
}
