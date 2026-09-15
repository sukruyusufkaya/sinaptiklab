'use client';

import { useSyncExternalStore } from 'react';
import { Ay, Gunes, Sistem } from '@/components/arayuz/Ikonlar';
import { temaAbone, temaOku, temaSunucuda, temaYaz, type Tema } from '@/lib/tema';

const SECENEKLER: { deger: Tema; ad: string; Ikon: typeof Gunes }[] = [
  { deger: 'sistem', ad: 'Sistem teması', Ikon: Sistem },
  { deger: 'aydinlik', ad: 'Açık tema', Ikon: Gunes },
  { deger: 'karanlik', ad: 'Koyu tema', Ikon: Ay },
];

export function TemaAnahtari({ className = '' }: { className?: string }) {
  const tema = useSyncExternalStore(temaAbone, temaOku, temaSunucuda);

  return (
    <div
      role="radiogroup"
      aria-label="Tema"
      className={`inline-flex items-center gap-0.5 rounded-full border border-kenar bg-yuzey/70 p-0.5 ${className}`.trim()}
    >
      {SECENEKLER.map(({ deger, ad, Ikon }) => {
        const secili = tema === deger;
        return (
          <button
            key={deger}
            type="button"
            role="radio"
            aria-checked={secili}
            aria-label={ad}
            title={ad}
            onClick={() => temaYaz(deger)}
            className={`grid size-7 place-items-center rounded-full transition-colors duration-200 ${
              secili
                ? 'bg-vurgu-zemin text-vurgu-parlak'
                : 'text-metin-soluk hover:bg-yuzey-2 hover:text-metin'
            }`}
          >
            <Ikon className="size-3.5" />
          </button>
        );
      })}
    </div>
  );
}
