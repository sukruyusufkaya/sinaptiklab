'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Kilit, Ok } from '@/components/arayuz/Ikonlar';
import { giris } from '@/lib/yetki/eylemler';

/**
 * Giriş formu.
 *
 * Yönlendirmeyi eylem DEĞİL istemci yapar: Next.js'te `redirect()` bir
 * istisna fırlatır ve eylem sarmalayıcılarının catch bloğunda yutulabilir.
 * Eylem hedef yolu döndürür, gezinme burada gerçekleşir.
 */
export function GirisFormu({
  devam,
  baslangicHatasi,
}: {
  devam: string;
  baslangicHatasi?: string;
}) {
  const [hata, setHata] = useState<string | undefined>(baslangicHatasi);
  const [bekliyor, baslat] = useTransition();
  const yonlendirici = useRouter();

  function gonder(veri: FormData) {
    setHata(undefined);
    baslat(async () => {
      const sonuc = await giris(veri);
      if (sonuc.tamam) {
        yonlendirici.replace(sonuc.veri?.yol ?? '/admin/');
        yonlendirici.refresh();
      } else {
        setHata(sonuc.hata);
      }
    });
  }

  return (
    <form action={gonder} className="space-y-4" noValidate>
      <input type="hidden" name="devam" value={devam} />

      <div>
        <label htmlFor="eposta" className="etiket-mono mb-1.5 block text-metin-soluk">
          E-POSTA
        </label>
        <input
          id="eposta"
          name="eposta"
          type="email"
          autoComplete="username"
          required
          autoFocus
          spellCheck={false}
          className="h-11 w-full rounded-lg border border-kenar bg-zemin px-3.5 text-sm text-metin outline-none transition-colors focus:border-vurgu"
        />
      </div>

      <div>
        <label htmlFor="parola" className="etiket-mono mb-1.5 block text-metin-soluk">
          PAROLA
        </label>
        <input
          id="parola"
          name="parola"
          type="password"
          autoComplete="current-password"
          required
          className="h-11 w-full rounded-lg border border-kenar bg-zemin px-3.5 text-sm text-metin outline-none transition-colors focus:border-vurgu"
        />
      </div>

      {hata && (
        <p
          role="alert"
          aria-live="polite"
          className="rounded-lg border border-tehlike/35 bg-tehlike/10 px-3.5 py-2.5 text-[0.8125rem] leading-relaxed text-tehlike"
        >
          {hata}
        </p>
      )}

      <button
        type="submit"
        disabled={bekliyor}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-vurgu text-sm font-medium text-white transition-colors hover:bg-vurgu-parlak disabled:opacity-60"
      >
        {bekliyor ? (
          'Doğrulanıyor…'
        ) : (
          <>
            <Kilit className="size-4" />
            Panele gir
            <Ok className="size-4" />
          </>
        )}
      </button>

      <p className="pt-1 text-center text-xs leading-relaxed text-metin-soluk">
        Bu panel dizinlenmez ve yalnızca yetkili hesaplara açıktır. Tüm giriş denemeleri denetim
        kaydına yazılır.
      </p>
    </form>
  );
}
