import type { ReactNode } from 'react';

export type RozetTonu =
  'notr' | 'vurgu' | 'ikincil' | 'sinyal' | 'uyari' | 'tehlike' | 'basari' | 'canli';

const TONLAR: Record<RozetTonu, string> = {
  notr: 'border-kenar bg-yuzey-2 text-metin-ikincil',
  vurgu: 'border-vurgu/35 bg-vurgu-zemin text-vurgu-parlak',
  ikincil: 'border-ikincil/35 bg-ikincil-zemin text-ikincil',
  sinyal: 'border-sinyal/35 bg-sinyal-zemin text-sinyal',
  uyari: 'border-uyari/35 bg-uyari/12 text-uyari',
  tehlike: 'border-tehlike/35 bg-tehlike/12 text-tehlike',
  basari: 'border-basari/35 bg-basari/12 text-basari',
  canli: 'border-tehlike/40 bg-tehlike/10 text-tehlike',
};

export function Rozet({
  children,
  ton = 'notr',
  className = '',
}: {
  children: ReactNode;
  ton?: RozetTonu;
  className?: string;
}) {
  return (
    <span
      className={`etiket-mono inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${TONLAR[ton]} ${className}`.trim()}
    >
      {ton === 'canli' && (
        <span className="nabiz-nokta inline-block size-1.5 rounded-full bg-current" />
      )}
      {children}
    </span>
  );
}
