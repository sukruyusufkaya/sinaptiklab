import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

type Gorunum = 'birincil' | 'ikincil' | 'sessiz' | 'sinyal';
type Boyut = 'sm' | 'md' | 'lg';

const TEMEL =
  'inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap rounded-full ' +
  'transition-[background-color,color,border-color,box-shadow,transform] duration-200 ease-sinaptik ' +
  'active:translate-y-px disabled:pointer-events-none disabled:opacity-50';

const GORUNUMLER: Record<Gorunum, string> = {
  birincil:
    'bg-vurgu text-white shadow-[0_6px_24px_-10px_var(--vurgu)] hover:bg-vurgu-parlak hover:shadow-[0_10px_32px_-10px_var(--vurgu)]',
  ikincil: 'border border-kenar-guclu bg-yuzey/60 text-metin hover:border-vurgu hover:bg-yuzey-2',
  sessiz: 'text-metin-ikincil hover:bg-yuzey-2 hover:text-metin',
  sinyal: 'bg-sinyal text-metin-zit hover:brightness-110',
};

const BOYUTLAR: Record<Boyut, string> = {
  sm: 'h-8 px-3.5 text-[0.8125rem]',
  md: 'h-10 px-5 text-sm',
  lg: 'h-12 px-6 text-[0.9375rem]',
};

type OrtakOzellikler = {
  gorunum?: Gorunum;
  boyut?: Boyut;
  children: ReactNode;
  className?: string;
};

type DugmeOzellikleri = OrtakOzellikler &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & { href?: undefined };

type BaglantiOzellikleri = OrtakOzellikler &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children' | 'href'> & {
    href: string;
  };

export function Dugme(ozellikler: DugmeOzellikleri | BaglantiOzellikleri) {
  const { gorunum = 'birincil', boyut = 'md', children, className = '', ...rest } = ozellikler;
  const sinif = `${TEMEL} ${GORUNUMLER[gorunum]} ${BOYUTLAR[boyut]} ${className}`.trim();

  if ('href' in rest && typeof rest.href === 'string') {
    const { href, ...baglantiRest } = rest;
    const disArtiklik = href.startsWith('http');
    return (
      <Link
        href={href}
        className={sinif}
        {...(disArtiklik ? { target: '_blank', rel: 'noreferrer' } : {})}
        {...baglantiRest}
      >
        {children}
      </Link>
    );
  }

  return (
    <button className={sinif} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
