'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition, type ReactNode } from 'react';
import { Kapat, Kilit, Menu, Ok } from '@/components/arayuz/Ikonlar';
import type { GezinmeBolumu } from '@/lib/admin/gezinme';
import { cikis } from '@/lib/yetki/eylemler';
import { ROL_ADI, type Rol } from '@/lib/yetki/roller';

/**
 * Panel kabuğu: solda gezinme, üstte kimlik şeridi.
 *
 * Site kabuğunun (Baslik/Altlik) hiçbir parçasını kullanmaz — panel bir
 * yayın yüzeyi değil, bir konsoldur.
 */

type Kullanici = {
  kimlik: string;
  eposta: string;
  adSoyad?: string;
  roller: string[];
  parolaGuncellendi?: Date | string;
};

export function PanelKabugu({
  kullanici,
  bolumler,
  yol,
  children,
}: {
  kullanici: Kullanici;
  bolumler: GezinmeBolumu[];
  yol: string;
  children: ReactNode;
}) {
  const [mobilAcik, setMobilAcik] = useState(false);
  const [cikisBekliyor, cikisBaslat] = useTransition();
  const yonlendirici = useRouter();

  const rolEtiketi = kullanici.roller.map((r) => ROL_ADI[r as Rol] ?? r).join(', ') || 'yetkisiz';

  function cikisYap() {
    cikisBaslat(async () => {
      const sonuc = await cikis();
      if (sonuc.tamam) {
        yonlendirici.replace(sonuc.veri?.yol ?? '/admin/giris/');
        yonlendirici.refresh();
      }
    });
  }

  return (
    <div className="min-h-dvh bg-zemin-derin text-metin">
      {/* Üst şerit */}
      <header className="sticky top-0 z-40 border-b border-kenar bg-zemin/95 backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-4">
          <button
            type="button"
            onClick={() => setMobilAcik((a) => !a)}
            className="grid size-9 place-items-center rounded-lg border border-kenar text-metin-ikincil transition-colors hover:text-metin lg:hidden"
            aria-label={mobilAcik ? 'Gezinmeyi kapat' : 'Gezinmeyi aç'}
            aria-expanded={mobilAcik}
          >
            {mobilAcik ? <Kapat className="size-4" /> : <Menu className="size-4" />}
          </button>

          <Link href="/admin/" className="flex items-baseline gap-2.5">
            <span className="etiket-mono font-semibold tracking-[0.14em] text-vurgu">SİNAPTİK</span>
            <span className="etiket-mono text-metin-soluk">PANEL</span>
          </Link>

          <span className="ml-auto flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="etiket-mono hidden text-metin-soluk transition-colors hover:text-metin sm:inline"
            >
              siteyi aç ↗
            </Link>

            <span className="hidden text-right sm:block">
              <span className="block text-xs font-medium text-metin">
                {kullanici.adSoyad ?? kullanici.eposta}
              </span>
              <span className="etiket-mono block text-metin-soluk">{rolEtiketi}</span>
            </span>

            <Link
              href="/admin/hesap/"
              className="grid size-9 place-items-center rounded-lg border border-kenar text-metin-ikincil transition-colors hover:border-vurgu hover:text-metin"
              aria-label="Hesap ayarları"
              title="Hesap ayarları"
            >
              <Kilit className="size-4" />
            </Link>

            <button
              type="button"
              onClick={cikisYap}
              disabled={cikisBekliyor}
              className="etiket-mono rounded-lg border border-kenar px-3 py-2 text-metin-ikincil transition-colors hover:border-tehlike hover:text-tehlike disabled:opacity-50"
            >
              {cikisBekliyor ? 'çıkılıyor…' : 'çıkış'}
            </button>
          </span>
        </div>
      </header>

      <div className="flex">
        {/* Gezinme */}
        <nav
          aria-label="Panel gezinmesi"
          className={`${
            mobilAcik ? 'block' : 'hidden'
          } fixed inset-x-0 top-14 bottom-0 z-30 overflow-y-auto border-r border-kenar bg-zemin px-3 py-4 lg:sticky lg:top-14 lg:block lg:h-[calc(100dvh-3.5rem)] lg:w-64 lg:shrink-0`}
        >
          <ul className="space-y-6">
            {bolumler.map((bolum) => (
              <li key={bolum.baslik}>
                <p className="etiket-mono mb-2 px-2.5 text-metin-soluk">{bolum.baslik}</p>
                <ul className="space-y-0.5">
                  {bolum.ogeler.map((oge) => {
                    const etkin =
                      yol === oge.yol || (oge.yol !== '/admin/' && yol.startsWith(oge.yol));
                    return (
                      <li key={oge.yol}>
                        <Link
                          href={oge.yol}
                          onClick={() => setMobilAcik(false)}
                          title={oge.ipucu}
                          aria-current={etkin ? 'page' : undefined}
                          className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-[0.8125rem] transition-colors ${
                            etkin
                              ? 'bg-vurgu-zemin text-vurgu-parlak'
                              : 'text-metin-ikincil hover:bg-yuzey hover:text-metin'
                          }`}
                        >
                          {oge.ad}
                          {etkin && <Ok className="size-3.5" />}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
