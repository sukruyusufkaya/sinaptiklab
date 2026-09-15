'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Onay } from '@/components/arayuz/Ikonlar';
import { parolaDegistir } from '@/lib/yetki/eylemler';

const ALAN =
  'h-11 w-full rounded-lg border border-kenar bg-zemin px-3.5 text-sm text-metin outline-none transition-colors focus:border-vurgu';

export function ParolaFormu() {
  const [hata, setHata] = useState<string>();
  const [alanHatalari, setAlanHatalari] = useState<Record<string, string>>({});
  const [ileti, setIleti] = useState<string>();
  const [bekliyor, baslat] = useTransition();
  const yonlendirici = useRouter();

  function gonder(veri: FormData) {
    setHata(undefined);
    setAlanHatalari({});
    setIleti(undefined);

    baslat(async () => {
      const sonuc = await parolaDegistir(veri);
      if (sonuc.tamam) {
        setIleti(sonuc.ileti ?? 'Parolanız değiştirildi.');
        yonlendirici.refresh();
      } else {
        setHata(sonuc.hata);
        setAlanHatalari(sonuc.alanHatalari ?? {});
      }
    });
  }

  return (
    <form action={gonder} className="space-y-4" noValidate>
      {(
        [
          { ad: 'mevcutParola', etiket: 'MEVCUT PAROLA', tamamlama: 'current-password' },
          { ad: 'yeniParola', etiket: 'YENİ PAROLA', tamamlama: 'new-password' },
          { ad: 'yeniParolaTekrar', etiket: 'YENİ PAROLA (TEKRAR)', tamamlama: 'new-password' },
        ] as const
      ).map((alan) => (
        <div key={alan.ad}>
          <label htmlFor={alan.ad} className="etiket-mono mb-1.5 block text-metin-soluk">
            {alan.etiket}
          </label>
          <input
            id={alan.ad}
            name={alan.ad}
            type="password"
            autoComplete={alan.tamamlama}
            required
            aria-invalid={Boolean(alanHatalari[alan.ad])}
            className={ALAN}
          />
          {alanHatalari[alan.ad] && (
            <p className="mt-1.5 text-xs text-tehlike">{alanHatalari[alan.ad]}</p>
          )}
        </div>
      ))}

      <p className="text-xs leading-relaxed text-metin-soluk">
        En az 12 karakter. E-posta adresinizi veya tahmin edilebilir dizileri içeremez.
        Değişiklikten sonra diğer tüm oturumlarınız kapatılır.
      </p>

      {hata && (
        <p
          role="alert"
          className="rounded-lg border border-tehlike/35 bg-tehlike/10 px-3.5 py-2.5 text-[0.8125rem] text-tehlike"
        >
          {hata}
        </p>
      )}

      {ileti && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-lg border border-basari/35 bg-basari/10 px-3.5 py-2.5 text-[0.8125rem] text-basari"
        >
          <Onay className="size-4 shrink-0" />
          {ileti}
        </p>
      )}

      <button
        type="submit"
        disabled={bekliyor}
        className="inline-flex h-11 items-center justify-center rounded-lg bg-vurgu px-5 text-sm font-medium text-white transition-colors hover:bg-vurgu-parlak disabled:opacity-60"
      >
        {bekliyor ? 'Değiştiriliyor…' : 'Parolayı değiştir'}
      </button>
    </form>
  );
}
