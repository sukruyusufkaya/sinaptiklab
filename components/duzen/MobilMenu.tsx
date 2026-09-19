'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ANA_MENU, UST_CUBUK } from '@/lib/rotalar';
import { Ara, Kapat, Kevron } from '@/components/arayuz/Ikonlar';
import { Logo } from './Logo';
import { OturumAlaniMobil } from './OturumAlani';
import { TemaAnahtari } from './TemaAnahtari';

export function MobilMenu({
  acik,
  kapat,
  paletiAc,
}: {
  acik: boolean;
  kapat: () => void;
  paletiAc: () => void;
}) {
  const [genisleyen, setGenisleyen] = useState<string | null>(ANA_MENU[0]?.anahtar ?? null);

  useEffect(() => {
    if (!acik) return;
    const onceki = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const kacis = (olay: KeyboardEvent) => {
      if (olay.key === 'Escape') kapat();
    };
    document.addEventListener('keydown', kacis);
    return () => {
      document.body.style.overflow = onceki;
      document.removeEventListener('keydown', kacis);
    };
  }, [acik, kapat]);

  if (!acik) return null;

  return (
    <div
      className="fixed inset-0 z-[70] lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Menü"
    >
      <button
        type="button"
        className="absolute inset-0 bg-zemin-derin/80 backdrop-blur-sm"
        onClick={kapat}
        aria-label="Menüyü kapat"
      />

      <div className="giris-animasyonu absolute inset-y-0 right-0 flex w-full max-w-sm flex-col border-l border-kenar bg-zemin">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-kenar px-5">
          <Logo />
          <button
            type="button"
            onClick={kapat}
            className="grid size-9 place-items-center rounded-full border border-kenar text-metin"
            aria-label="Menüyü kapat"
          >
            <Kapat className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          <button
            type="button"
            onClick={() => {
              kapat();
              paletiAc();
            }}
            className="mb-5 flex h-11 w-full items-center gap-2.5 rounded-xl border border-kenar bg-yuzey/60 px-4 text-sm text-metin-soluk"
          >
            <Ara className="size-4" />
            Sitede ara
          </button>

          <nav aria-label="Ana menü">
            <ul className="space-y-1">
              {ANA_MENU.map((oge) => {
                const genis = genisleyen === oge.anahtar;
                return (
                  <li key={oge.anahtar} className="border-b border-kenar-soluk last:border-b-0">
                    <button
                      type="button"
                      aria-expanded={genis}
                      onClick={() => setGenisleyen(genis ? null : oge.anahtar)}
                      className="flex w-full items-center justify-between py-3.5 text-left"
                    >
                      <span>
                        <span className="block text-[0.9375rem] font-semibold text-metin">
                          {oge.ad}
                        </span>
                        <span className="mt-0.5 block text-xs text-metin-soluk">{oge.ozet}</span>
                      </span>
                      <Kevron
                        className={`size-4 shrink-0 text-metin-soluk transition-transform duration-200 ${genis ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {genis && (
                      <div className="pb-4">
                        {oge.sutunlar.map((sutun) => (
                          <div key={sutun.baslik} className="mb-3 last:mb-0">
                            <p className="etiket-mono mb-2 text-metin-soluk">{sutun.baslik}</p>
                            <ul className="grid grid-cols-2 gap-1">
                              {sutun.ogeler.map((alt) => (
                                <li key={alt.yol}>
                                  <Link
                                    href={alt.yol}
                                    onClick={kapat}
                                    className="block rounded-lg px-2.5 py-2 -mx-2.5 text-[0.8125rem] text-metin-ikincil hover:bg-yuzey-2 hover:text-metin"
                                  >
                                    {alt.ad}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-6 border-t border-kenar pt-5">
            <p className="etiket-mono mb-3 text-metin-soluk">Hızlı erişim</p>
            <div className="flex flex-wrap gap-2">
              {UST_CUBUK.map((oge) => (
                <Link
                  key={oge.yol}
                  href={oge.yol}
                  onClick={kapat}
                  className="rounded-full border border-kenar px-3 py-1.5 text-xs text-metin-ikincil"
                >
                  {oge.ad}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-kenar px-5 py-4">
          <TemaAnahtari />
          <OturumAlaniMobil kapat={kapat} />
        </div>
      </div>
    </div>
  );
}
