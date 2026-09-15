'use client';

import Link from 'next/link';
import { useActionState, useEffect, useRef } from 'react';
import { Ok, Onay, Zarf } from '@/components/arayuz/Ikonlar';
import { bultenAbone } from '@/lib/site/form-eylemleri';
import {
  BULTEN_SECENEKLERI,
  EPOSTA_EN_COK,
  FORM_BASLANGICI,
  type FormSonucu,
} from '@/lib/site/form-sozlesmesi';

/**
 * Bülten kayıt formu — `aboneler` koleksiyonuna yazar.
 *
 * İKİ YERLEŞİM, TEK EYLEM
 *
 * Ana sayfadaki kutu ile `/bulten/` sayfasındaki kenar kartı farklı
 * yerleşimlere sahipti ve ikisi de `action` taşımıyordu. Görünümü korumak için
 * iki yerleşim `duzen` propuyla ayrılır:
 *
 *  - `satir`  → ana sayfa: e-posta + düğme yan yana. Bülten seçimi AYRI bir
 *    ızgara hücresinde durduğu için `BultenSecimi` ile dışarıda çizilir ve
 *    onay kutuları HTML'in `form` niteliğiyle bu forma bağlanır. Böylece
 *    yerleşim hiç değişmeden aynı `FormData` içinde gönderilirler.
 *  - `sutun` → `/bulten/` kenar kartı: her şey formun içinde, alt alta.
 *
 * `form.reset()` `form` niteliğiyle bağlanan alanları da sıfırlar
 * (`form.elements` onları içerir), bu yüzden başarılı gönderimde ana sayfadaki
 * onay kutuları da varsayılanına döner.
 */

type Duzen = 'satir' | 'sutun';

export function BultenFormu({
  kimlik,
  duzen,
  kaynakYol,
}: {
  /** Formun DOM kimliği; `BultenSecimi` onay kutularını buna bağlar. */
  kimlik: string;
  duzen: Duzen;
  kaynakYol: string;
}) {
  const [durum, gonder, bekliyor] = useActionState(bultenAbone, FORM_BASLANGICI);
  const formRef = useRef<HTMLFormElement>(null);

  // EFFECT İÇİNDE setState YOK (CLAUDE.md kural 3): yalnızca DOM sıfırlaması.
  useEffect(() => {
    if (durum?.tamam) formRef.current?.reset();
  }, [durum]);

  const epostaKimligi = `${kimlik}-eposta`;
  const hataKimligi = `${kimlik}-hata`;
  const alanHatalari = durum && !durum.tamam ? durum.alanHatalari : undefined;

  if (duzen === 'satir') {
    return (
      <>
        <form
          ref={formRef}
          id={kimlik}
          action={gonder}
          className="mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
        >
          <input type="hidden" name="kaynakYol" value={kaynakYol} />
          <label htmlFor={epostaKimligi} className="yalniz-ekran-okuyucu">
            E-posta adresiniz
          </label>
          <input
            id={epostaKimligi}
            name="eposta"
            type="email"
            required
            maxLength={EPOSTA_EN_COK}
            autoComplete="email"
            placeholder="ornek@sirket.com"
            aria-invalid={alanHatalari?.eposta ? true : undefined}
            aria-describedby={durum && !durum.tamam ? hataKimligi : undefined}
            className="h-12 flex-1 rounded-full border border-kenar bg-yuzey/70 px-5 text-sm text-metin outline-none transition-colors placeholder:text-metin-soluk focus:border-vurgu"
          />
          <button
            type="submit"
            disabled={bekliyor}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-vurgu px-6 text-sm font-medium text-white shadow-[0_6px_24px_-10px_var(--vurgu)] transition-colors hover:bg-vurgu-parlak disabled:pointer-events-none disabled:opacity-60"
          >
            {bekliyor ? 'Gönderiliyor…' : 'Katıl'}
            <Ok className="size-4" />
          </button>
        </form>
        <BultenMesaji durum={durum} kimlik={hataKimligi} aralik="mt-4" />
      </>
    );
  }

  return (
    <form
      ref={formRef}
      id={kimlik}
      action={gonder}
      className="rounded-2xl border border-kenar bg-yuzey/50 p-6"
    >
      <div className="flex items-center gap-2">
        <Zarf className="size-4 text-ikincil" />
        <p className="etiket-mono text-metin">Abone ol</p>
      </div>

      <input type="hidden" name="kaynakYol" value={kaynakYol} />

      <label htmlFor={epostaKimligi} className="yalniz-ekran-okuyucu">
        E-posta adresiniz
      </label>
      <input
        id={epostaKimligi}
        name="eposta"
        type="email"
        required
        maxLength={EPOSTA_EN_COK}
        autoComplete="email"
        placeholder="ornek@sirket.com"
        aria-invalid={alanHatalari?.eposta ? true : undefined}
        aria-describedby={durum && !durum.tamam ? hataKimligi : undefined}
        className="mt-4 h-11 w-full rounded-full border border-kenar bg-zemin/70 px-4 text-sm text-metin outline-none transition-colors placeholder:text-metin-soluk focus:border-vurgu"
      />

      <fieldset className="mt-4">
        <legend className="etiket-mono mb-2.5 text-metin-soluk">Bülten seçimi</legend>
        <ul className="space-y-2">
          {BULTEN_SECENEKLERI.map((bulten) => (
            <li key={bulten.deger}>
              <label className="flex cursor-pointer items-center gap-2.5 text-xs text-metin-ikincil">
                <input
                  type="checkbox"
                  name="listeler"
                  value={bulten.deger}
                  defaultChecked={bulten.varsayilan}
                  className="size-4 shrink-0 accent-[var(--vurgu)]"
                />
                {bulten.ad}
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <button
        type="submit"
        disabled={bekliyor}
        className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-vurgu text-sm font-medium text-white shadow-[0_6px_24px_-10px_var(--vurgu)] transition-colors hover:bg-vurgu-parlak disabled:pointer-events-none disabled:opacity-60"
      >
        {bekliyor ? 'Gönderiliyor…' : 'Katıl'}
        <Ok className="size-4" />
      </button>

      <BultenMesaji durum={durum} kimlik={hataKimligi} aralik="mt-3" />

      <p className="mt-3 text-[0.6875rem] leading-relaxed text-metin-soluk">
        Kayıt olarak{' '}
        <Link href="/kvkk-aydinlatma/" className="underline underline-offset-2">
          KVKK aydınlatma metnini
        </Link>{' '}
        okuduğunuzu kabul edersiniz.
      </p>
    </form>
  );
}

/**
 * Ana sayfadaki bülten seçimi.
 *
 * Onay kutuları `form` niteliğiyle forma bağlanır: DOM'da başka bir ızgara
 * hücresinde dursalar bile aynı gönderimin parçasıdırlar. Denetimsiz
 * (uncontrolled) kaldıkları için paylaşılan React durumu gerekmez; değerler
 * gönderim anında `FormData`'dan okunur.
 */
export function BultenSecimi({ formKimligi }: { formKimligi: string }) {
  return (
    <fieldset className="rounded-2xl border border-kenar bg-yuzey/50 p-6">
      <legend className="etiket-mono px-2 text-metin-soluk">Bülten seçimi</legend>
      <ul className="space-y-2.5">
        {BULTEN_SECENEKLERI.map((bulten) => (
          <li key={bulten.deger}>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-kenar-soluk p-3.5 transition-colors hover:border-kenar-guclu">
              <input
                type="checkbox"
                form={formKimligi}
                name="listeler"
                value={bulten.deger}
                defaultChecked={bulten.varsayilan}
                className="mt-0.5 size-4 shrink-0 accent-[var(--vurgu)]"
              />
              <span>
                <span className="block text-sm font-medium text-metin">{bulten.ad}</span>
                <span className="mt-0.5 block text-xs text-metin-soluk">
                  {BULTEN_TARIFLERI[bulten.deger]}
                </span>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}

/**
 * Ana sayfa kutusundaki kısa tarifler.
 *
 * `Record<BultenListesi, string>` olduğu için şemaya yeni bir liste değeri
 * eklendiğinde buraya tarif yazılmadan derleme geçmez — kutu sessizce eksik
 * kalmaz.
 */
const BULTEN_TARIFLERI: Record<(typeof BULTEN_SECENEKLERI)[number]['deger'], string> = {
  daily: 'Günlük AI gündemi, 5 madde',
  weekly: 'Haftanın özeti ve analizler',
  research: 'Araştırma ve paper özetleri',
  kurumsal: 'Yöneticiler için yapay zekâ',
};

/** Başarı ve hata iletisi. Hata `role="alert"`, başarı `role="status"`. */
function BultenMesaji({
  durum,
  kimlik,
  aralik,
}: {
  durum: FormSonucu | null;
  kimlik: string;
  aralik: string;
}) {
  if (!durum) return null;

  if (durum.tamam) {
    return (
      <p
        role="status"
        className={`${aralik} flex items-start gap-2 rounded-lg border border-basari/30 bg-basari/10 px-3 py-2.5 text-xs leading-relaxed text-metin`}
      >
        <Onay className="mt-0.5 size-3.5 shrink-0 text-basari" />
        {durum.ileti}
      </p>
    );
  }

  return (
    <p
      id={kimlik}
      role="alert"
      className={`${aralik} rounded-lg border border-tehlike/30 bg-tehlike/10 px-3 py-2.5 text-xs leading-relaxed text-metin`}
    >
      {durum.hata}
    </p>
  );
}

/** Bülten kayıtları kapalıyken formun yerine basılan kart. */
export function BultenKapali({ duzen, ileti }: { duzen: Duzen; ileti: string }) {
  if (duzen === 'satir') {
    return (
      <p className="mt-8 max-w-md rounded-2xl border border-dashed border-kenar-guclu bg-yuzey/40 px-5 py-4 text-sm leading-relaxed text-metin-ikincil">
        {ileti}
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-kenar-guclu bg-yuzey/50 p-6">
      <div className="flex items-center gap-2">
        <Zarf className="size-4 text-ikincil" />
        <p className="etiket-mono text-metin">Abone ol</p>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-metin-ikincil">{ileti}</p>
    </div>
  );
}
