'use client';

import { useEffect } from 'react';
import { yaziSinifi } from '@/lib/yazi-tipleri';
import './globals.css';

/**
 * Son çare hata sınırı.
 *
 * `app/global-error.tsx` KÖK DÜZENİN YERİNE geçer: düzenin kendisi (veya bir
 * düzen içindeki sağlayıcı) hata verdiğinde devreye girer. Bu yüzden `<html>`
 * ve `<body>` etiketlerini kendisi basmak zorundadır ve `globals.css`'i kendisi
 * içe alır — kök düzen çalışmadığı için token'lar başka yolla gelmez.
 *
 * Burada `Dugme`, `Baslik` gibi paylaşılan bileşenler KULLANILMAZ: bu ekranın
 * ayakta kalması, hata veren ağaçtan hiçbir şeye bağlı olmamasına bağlıdır.
 * Tema betiği de yok; sayfa işletim sistemi tercihine göre boyanır.
 */

export default function KokHataSinir({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[sinaptiklab] kök hata', error.digest ?? error.message);
  }, [error]);

  return (
    <html lang="tr">
      <body className={yaziSinifi}>
        <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-20">
          <p className="font-mono text-xs tracking-widest text-metin-soluk">SİNAPTİK LAB</p>
          <h1 className="mt-4 text-3xl leading-[1.1] font-semibold tracking-tight text-balance text-metin">
            Site şu anda yanıt veremiyor.
          </h1>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-metin-ikincil">
            Beklenmeyen bir hata uygulamanın tamamını durdurdu. Bu durum kaydedildi ve inceleniyor.
          </p>

          {error.digest && (
            <p className="mt-4 font-mono text-xs text-metin-soluk">
              Hata numarası: <span className="text-metin-ikincil">{error.digest}</span>
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-10 items-center rounded-full bg-vurgu px-5 text-sm font-medium text-white transition-colors hover:bg-vurgu-parlak"
            >
              Yeniden dene
            </button>
            {/*
              BİLİNÇLİ OLARAK `<a>`: `next/link` yumuşak gezinme yapar ve
              okuyucuyu çökmüş React ağacının içinde bırakabilir. Kök hata
              sınırında istenen şey tam sayfa yeniden yüklemedir.
            */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              className="text-sm text-metin-ikincil underline underline-offset-4 transition-colors hover:text-metin"
            >
              ana sayfa
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
