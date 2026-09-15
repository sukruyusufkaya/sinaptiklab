'use client';

import Link from 'next/link';
import { useActionState, useEffect, useRef } from 'react';
import { Ok, Onay, Zarf } from '@/components/arayuz/Ikonlar';
import { iletisimGonder } from '@/lib/site/form-eylemleri';
import {
  FORM_BASLANGICI,
  ILETISIM_KONULARI,
  MESAJ_EN_COK,
  AD_EN_COK,
  EPOSTA_EN_COK,
} from '@/lib/site/form-sozlesmesi';

/**
 * İletişim talep formu — `form_kayitlari` koleksiyonuna yazar.
 *
 * GÖRÜNÜM DEĞİŞMEDİ: sınıflar, yerleşim ve metinler `app/(site)/iletisim/page.tsx`
 * içindeki formdan olduğu gibi taşındı. Eklenen tek şey işlevdir: `action`,
 * `name` nitelikleri, alan hataları ve başarı iletisi.
 *
 * NEDEN `useActionState`
 *
 * `<form action={eylem}>` kalıbı Next'te ilerlemeli iyileştirme (progressive
 * enhancement) taşır: JavaScript yüklenmeden gönderilen form da sunucu eylemine
 * düşer. `useTransition` ile elle `fetch` yapan bir kurulum bunu kaybederdi.
 *
 * EFFECT İÇİNDE `setState` YOK (CLAUDE.md kural 3): effect yalnızca DOM'a
 * dokunur (`form.reset()`). Başarı/hata durumu `useActionState`'in kendi
 * durumudur, effect'te türetilmez.
 */
export function IletisimFormu() {
  const [durum, gonder, bekliyor] = useActionState(iletisimGonder, FORM_BASLANGICI);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (durum?.tamam) formRef.current?.reset();
  }, [durum]);

  const alanHatalari = durum && !durum.tamam ? durum.alanHatalari : undefined;

  return (
    <form ref={formRef} action={gonder} className="rounded-2xl border border-kenar bg-yuzey/50 p-6">
      <div className="flex items-center gap-2">
        <Zarf className="size-4 text-vurgu-parlak" />
        <p className="etiket-mono text-metin">Talep formu</p>
      </div>

      <input type="hidden" name="kaynakYol" value="/iletisim/" />

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="ad" className="etiket-mono mb-1.5 block text-metin-soluk">
            Ad soyad
          </label>
          <input
            id="ad"
            name="adSoyad"
            type="text"
            required
            maxLength={AD_EN_COK}
            autoComplete="name"
            aria-invalid={alanHatalari?.adSoyad ? true : undefined}
            aria-describedby={alanHatalari?.adSoyad ? 'ad-hatasi' : undefined}
            className="h-10 w-full rounded-lg border border-kenar bg-zemin/70 px-3.5 text-sm text-metin outline-none transition-colors focus:border-vurgu"
          />
          {alanHatalari?.adSoyad && (
            <p id="ad-hatasi" className="mt-1.5 text-[0.6875rem] text-tehlike">
              {alanHatalari.adSoyad}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="eposta" className="etiket-mono mb-1.5 block text-metin-soluk">
            E-posta
          </label>
          <input
            id="eposta"
            name="eposta"
            type="email"
            required
            maxLength={EPOSTA_EN_COK}
            autoComplete="email"
            aria-invalid={alanHatalari?.eposta ? true : undefined}
            aria-describedby={alanHatalari?.eposta ? 'eposta-hatasi' : undefined}
            className="h-10 w-full rounded-lg border border-kenar bg-zemin/70 px-3.5 text-sm text-metin outline-none transition-colors focus:border-vurgu"
          />
          {alanHatalari?.eposta && (
            <p id="eposta-hatasi" className="mt-1.5 text-[0.6875rem] text-tehlike">
              {alanHatalari.eposta}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="konu" className="etiket-mono mb-1.5 block text-metin-soluk">
            Konu
          </label>
          <select
            id="konu"
            name="konu"
            defaultValue={ILETISIM_KONULARI[0].deger}
            className="h-10 w-full rounded-lg border border-kenar bg-zemin/70 px-3 text-sm text-metin outline-none transition-colors focus:border-vurgu"
          >
            {ILETISIM_KONULARI.map((konu) => (
              <option key={konu.deger} value={konu.deger}>
                {konu.ad}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="mesaj" className="etiket-mono mb-1.5 block text-metin-soluk">
            Mesaj
          </label>
          <textarea
            id="mesaj"
            name="mesaj"
            rows={5}
            required
            maxLength={MESAJ_EN_COK}
            aria-invalid={alanHatalari?.mesaj ? true : undefined}
            aria-describedby={alanHatalari?.mesaj ? 'mesaj-hatasi' : undefined}
            className="w-full rounded-lg border border-kenar bg-zemin/70 px-3.5 py-2.5 text-sm leading-relaxed text-metin outline-none transition-colors focus:border-vurgu"
          />
          {alanHatalari?.mesaj && (
            <p id="mesaj-hatasi" className="mt-1.5 text-[0.6875rem] text-tehlike">
              {alanHatalari.mesaj}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={bekliyor}
        className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-vurgu text-sm font-medium text-white shadow-[0_6px_24px_-10px_var(--vurgu)] transition-colors hover:bg-vurgu-parlak disabled:pointer-events-none disabled:opacity-60"
      >
        {bekliyor ? 'Gönderiliyor…' : 'Gönder'}
        <Ok className="size-4" />
      </button>

      {/* Sonuç: başarı da hata da GÖRÜNÜR. Sessiz başarısızlık olmaz. */}
      {durum?.tamam && (
        <p
          role="status"
          className="mt-3 flex items-start gap-2 rounded-lg border border-basari/30 bg-basari/10 px-3 py-2.5 text-[0.75rem] leading-relaxed text-metin"
        >
          <Onay className="mt-0.5 size-3.5 shrink-0 text-basari" />
          {durum.ileti}
        </p>
      )}
      {durum && !durum.tamam && (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-tehlike/30 bg-tehlike/10 px-3 py-2.5 text-[0.75rem] leading-relaxed text-metin"
        >
          {durum.hata}
        </p>
      )}

      <p className="mt-3 text-[0.6875rem] leading-relaxed text-metin-soluk">
        Form gönderimi{' '}
        <Link href="/kvkk-aydinlatma/" className="underline underline-offset-2">
          KVKK aydınlatma metni
        </Link>{' '}
        kapsamında işlenir. Talep kaydı en çok 24 ay saklanır, sonra otomatik silinir.
      </p>
    </form>
  );
}
