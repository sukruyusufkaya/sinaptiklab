'use client';

import { useCallback, useEffect, useState } from 'react';
import { Baslik } from './Baslik';
import { KomutPaleti } from './KomutPaleti';

/** Header ve komut paletinin ortak durumunu tutan istemci kabuğu. */
export function SiteKabugu() {
  const [paletAcik, setPaletAcik] = useState(false);
  const paletiAc = useCallback(() => setPaletAcik(true), []);
  const paletiKapat = useCallback(() => setPaletAcik(false), []);

  useEffect(() => {
    const dinle = (olay: KeyboardEvent) => {
      if ((olay.metaKey || olay.ctrlKey) && olay.key.toLowerCase() === 'k') {
        olay.preventDefault();
        setPaletAcik((a) => !a);
      }
      if (olay.key === '/' && !(olay.target instanceof HTMLInputElement)) {
        const hedef = olay.target as HTMLElement | null;
        if (hedef?.isContentEditable || hedef instanceof HTMLTextAreaElement) return;
        olay.preventDefault();
        setPaletAcik(true);
      }
    };
    document.addEventListener('keydown', dinle);
    return () => document.removeEventListener('keydown', dinle);
  }, []);

  return (
    <>
      <Baslik paletiAc={paletiAc} />
      {paletAcik && <KomutPaleti kapat={paletiKapat} />}
    </>
  );
}
