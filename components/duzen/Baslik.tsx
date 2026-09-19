'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ANA_MENU, UST_CUBUK } from '@/lib/rotalar';
import { Ara, Kevron, Menu } from '@/components/arayuz/Ikonlar';
import { Logo } from './Logo';
import { MegaMenu } from './MegaMenu';
import { OturumAlani } from './OturumAlani';
import { TemaAnahtari } from './TemaAnahtari';
import { MobilMenu } from './MobilMenu';

export function Baslik({ paletiAc }: { paletiAc: () => void }) {
  const [acik, setAcik] = useState<string | null>(null);
  const [kaydirildi, setKaydirildi] = useState(false);
  const [mobilAcik, setMobilAcik] = useState(false);
  const zamanlayici = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const dinle = () => setKaydirildi(window.scrollY > 8);
    dinle();
    window.addEventListener('scroll', dinle, { passive: true });
    return () => window.removeEventListener('scroll', dinle);
  }, []);

  useEffect(() => {
    const kacis = (olay: KeyboardEvent) => {
      if (olay.key === 'Escape') setAcik(null);
    };
    document.addEventListener('keydown', kacis);
    return () => document.removeEventListener('keydown', kacis);
  }, []);

  const gecikmeliKapat = useCallback(() => {
    if (zamanlayici.current) clearTimeout(zamanlayici.current);
    zamanlayici.current = setTimeout(() => setAcik(null), 120);
  }, []);

  const acmaIptal = useCallback(() => {
    if (zamanlayici.current) clearTimeout(zamanlayici.current);
  }, []);

  return (
    <>
      {/* Klavye kullanıcıları için içeriğe atlama */}
      <a
        href="#ana-icerik"
        className="yalniz-ekran-okuyucu focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:h-auto focus:w-auto focus:rounded-full focus:bg-vurgu focus:px-4 focus:py-2 focus:text-sm focus:text-white focus:[clip-path:none]"
      >
        İçeriğe atla
      </a>

      <header
        className={`sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
          kaydirildi || acik
            ? 'border-b border-kenar bg-zemin/85 backdrop-blur-xl'
            : 'border-b border-transparent bg-zemin'
        }`}
        onMouseLeave={gecikmeliKapat}
      >
        {/* --- Üst yardımcı çubuk --- */}
        <div className="hidden border-b border-kenar-soluk lg:block">
          <div className="kap flex h-9 items-center justify-between">
            <nav aria-label="Hızlı erişim" className="flex items-center gap-1">
              {UST_CUBUK.map((oge, sira) => (
                <Link
                  key={oge.yol}
                  href={oge.yol}
                  className="etiket-mono flex items-center gap-1.5 rounded-full px-2.5 py-1 text-metin-soluk transition-colors duration-150 hover:bg-yuzey-2 hover:text-metin"
                >
                  {sira === 0 && (
                    <span
                      className="nabiz-nokta size-1.5 rounded-full bg-sinyal"
                      aria-hidden="true"
                    />
                  )}
                  {oge.ad}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <div className="etiket-mono flex items-center overflow-hidden rounded-full border border-kenar">
                <span className="bg-yuzey-2 px-2 py-1 text-metin">TR</span>
                <Link
                  href="/en/"
                  className="px-2 py-1 text-metin-soluk transition-colors hover:text-metin"
                >
                  EN
                </Link>
              </div>
              <TemaAnahtari />
            </div>
          </div>
        </div>

        {/* --- Ana çubuk --- */}
        <div className="kap flex h-16 items-center justify-between gap-4">
          <Logo />

          <nav aria-label="Ana menü" className="hidden items-center lg:flex">
            {ANA_MENU.map((oge) => {
              const secili = acik === oge.anahtar;
              return (
                <div key={oge.anahtar} onMouseEnter={acmaIptal}>
                  <button
                    type="button"
                    aria-expanded={secili}
                    aria-haspopup="true"
                    onMouseEnter={() => setAcik(oge.anahtar)}
                    onFocus={() => setAcik(oge.anahtar)}
                    onClick={() => setAcik(secili ? null : oge.anahtar)}
                    className={`flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-150 ${
                      secili ? 'bg-yuzey-2 text-metin' : 'text-metin-ikincil hover:text-metin'
                    }`}
                  >
                    {oge.ad}
                    <Kevron
                      className={`size-3.5 text-metin-soluk transition-transform duration-200 ${secili ? 'rotate-180' : ''}`}
                    />
                  </button>
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={paletiAc}
              className="group flex h-9 items-center gap-2 rounded-full border border-kenar bg-yuzey/60 pr-1.5 pl-3 text-metin-soluk transition-colors duration-200 hover:border-kenar-guclu hover:text-metin"
              aria-label="Sitede ara"
            >
              <Ara className="size-4" />
              <span className="hidden text-sm md:inline">Ara</span>
              <kbd className="etiket-mono ml-1 hidden rounded-full border border-kenar bg-zemin px-1.5 py-1 text-[0.5625rem] text-metin-soluk md:inline">
                ⌘K
              </kbd>
            </button>

            <OturumAlani />

            <button
              type="button"
              onClick={() => setMobilAcik(true)}
              className="grid size-9 place-items-center rounded-full border border-kenar text-metin lg:hidden"
              aria-label="Menüyü aç"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>

        {/* --- Mega menü paneli --- */}
        <div
          className={`absolute inset-x-0 top-full hidden origin-top border-b border-kenar bg-zemin/95 backdrop-blur-xl transition-[opacity,transform] duration-200 ease-sinaptik lg:block ${
            acik
              ? 'pointer-events-auto translate-y-0 opacity-100'
              : 'pointer-events-none -translate-y-1 opacity-0'
          }`}
          onMouseEnter={acmaIptal}
        >
          {ANA_MENU.filter((oge) => oge.anahtar === acik).map((oge) => (
            <MegaMenu key={oge.anahtar} oge={oge} />
          ))}
        </div>
      </header>

      <MobilMenu acik={mobilAcik} kapat={() => setMobilAcik(false)} paletiAc={paletiAc} />
    </>
  );
}
