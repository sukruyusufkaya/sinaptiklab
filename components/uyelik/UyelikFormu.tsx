'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition, type ReactNode } from 'react';
import { Ok } from '@/components/arayuz/Ikonlar';
import type { EylemSonucu } from '@/lib/yetki/korumali-eylem';

/**
 * Üyelik formlarının paylaşılan kabuğu.
 *
 * Kayıt, giriş, parola sıfırlama ve hesap güncelleme formlarının HEPSİ aynı
 * şeye ihtiyaç duyar: bekleme durumu, hata iletisi, alan bazında hata, başarı
 * iletisi ve başarıdan sonra gezinme. Bu mantık tek yerde toplanır; her form
 * yalnızca kendi ALANLARINI yazar.
 *
 * CLAUDE.md kural 3: effect içinde `setState` yok — durum yalnızca olay
 * işleyicisinden değişir, `useTransition` bekleme durumunu taşır.
 *
 * ERİŞİLEBİLİRLİK: hata `role="alert"` ile duyurulur, başarı `role="status"`
 * ile; alan hatası girdinin `aria-describedby` bağlantısıyla eşlenir
 * (alanları yazan çağıran `alanHatasi` ile o metni alır).
 */

export type UyelikEylemi<T> = (veri: FormData) => Promise<EylemSonucu<T>>;

export function UyelikFormu<T extends { yol?: string } | undefined>({
  eylem,
  baslik,
  dugmeMetni,
  children,
  altBilgi,
  /** Başarıdan sonra gezinilecek yol; eylem yol döndürürse o kazanır. */
  basariYolu,
  /** Başarıdan sonra formu temizle (kayıt/talep formları için). */
  basaridaTemizle = false,
}: {
  eylem: UyelikEylemi<T>;
  baslik: string;
  dugmeMetni: string;
  children: (alanHatasi: (ad: string) => string | undefined) => ReactNode;
  altBilgi?: ReactNode;
  basariYolu?: string;
  basaridaTemizle?: boolean;
}) {
  const [hata, setHata] = useState<string>();
  const [ileti, setIleti] = useState<string>();
  const [alanHatalari, setAlanHatalari] = useState<Record<string, string>>({});
  const [bekliyor, baslat] = useTransition();
  const yonlendirici = useRouter();

  function gonder(veri: FormData) {
    baslat(async () => {
      const sonuc = await eylem(veri);

      if (!sonuc.tamam) {
        setIleti(undefined);
        setHata(sonuc.hata);
        setAlanHatalari(sonuc.alanHatalari ?? {});
        return;
      }

      setHata(undefined);
      setAlanHatalari({});
      setIleti(sonuc.ileti);

      const hedef = sonuc.veri?.yol ?? basariYolu;
      if (hedef) {
        yonlendirici.push(hedef);
        // Sunucu bileşenleri yeni oturumu görsün.
        yonlendirici.refresh();
      }
    });
  }

  const alanHatasi = (ad: string) => alanHatalari[ad];

  return (
    <form
      action={gonder}
      // Başarıda temizleme: `key` değiştirmek yerine formun kendisi sıfırlanır.
      {...(basaridaTemizle && ileti ? { key: ileti } : {})}
      className="rounded-2xl border border-kenar bg-yuzey/50 p-6"
    >
      <p className="etiket-mono mb-5 text-metin">{baslik}</p>

      <div className="space-y-4">{children(alanHatasi)}</div>

      {hata && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-tehlike/30 bg-tehlike/8 px-3.5 py-2.5 text-xs leading-relaxed text-tehlike"
        >
          {hata}
        </p>
      )}
      {ileti && (
        <p
          role="status"
          className="mt-4 rounded-lg border border-basari/30 bg-basari/8 px-3.5 py-2.5 text-xs leading-relaxed text-metin-ikincil"
        >
          {ileti}
        </p>
      )}

      <button
        type="submit"
        disabled={bekliyor}
        className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-vurgu text-sm font-medium text-white shadow-[0_6px_24px_-10px_var(--vurgu)] transition-colors hover:bg-vurgu-parlak disabled:opacity-60"
      >
        {bekliyor ? 'Gönderiliyor…' : dugmeMetni}
        {!bekliyor && <Ok className="size-4" />}
      </button>

      {altBilgi}
    </form>
  );
}

/**
 * Etiketli girdi — alan hatası gösterebilen sürüm.
 *
 * `components/kurumsal/KimlikKarti.tsx` içindeki `AlanGrubu` ile aynı görünüm,
 * ek olarak hata durumu ve `autoComplete` denetimi taşır. O bileşen sunucu
 * tarafında da kullanıldığı için ayrı tutuldu.
 */
export function UyelikAlani({
  ad,
  etiket,
  tur = 'text',
  ipucu,
  hata,
  otomatik,
  zorunlu = true,
  varsayilan,
}: {
  ad: string;
  etiket: string;
  tur?: 'text' | 'email' | 'password';
  ipucu?: string;
  hata?: string;
  otomatik?: string;
  zorunlu?: boolean;
  varsayilan?: string;
}) {
  const ipucuKimligi = ipucu ? `${ad}-ipucu` : undefined;
  const hataKimligi = hata ? `${ad}-hata` : undefined;
  const tanim = [hataKimligi, ipucuKimligi].filter(Boolean).join(' ') || undefined;

  return (
    <div>
      <label htmlFor={ad} className="etiket-mono mb-1.5 block text-metin-soluk">
        {etiket}
      </label>
      <input
        id={ad}
        name={ad}
        type={tur}
        required={zorunlu}
        defaultValue={varsayilan}
        autoComplete={otomatik}
        aria-invalid={hata ? true : undefined}
        aria-describedby={tanim}
        className={`h-11 w-full rounded-lg border bg-zemin/70 px-3.5 text-sm text-metin outline-none transition-colors focus:border-vurgu ${
          hata ? 'border-tehlike' : 'border-kenar'
        }`}
      />
      {hata && (
        <p id={hataKimligi} className="mt-1.5 text-[0.6875rem] text-tehlike">
          {hata}
        </p>
      )}
      {ipucu && (
        <p id={ipucuKimligi} className="mt-1.5 text-[0.6875rem] text-metin-soluk">
          {ipucu}
        </p>
      )}
    </div>
  );
}
