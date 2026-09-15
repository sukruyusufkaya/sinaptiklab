'use client';

import Link from 'next/link';
import { useActionState, useEffect, useRef } from 'react';
import { Ok, Onay } from '@/components/arayuz/Ikonlar';
import { readinessSonucuKaydet } from '@/lib/site/form-eylemleri';
import {
  CALISAN_ARALIKLARI,
  EPOSTA_EN_COK,
  FORM_BASLANGICI,
  KURUM_ADI_EN_COK,
  calisanAraligiMi,
  type FormSonucu,
  type ReadinessSonucuGirdisi,
} from '@/lib/site/form-sozlesmesi';

/**
 * AI Readiness sonucunun PAYLAŞILMASI — `readiness_sonuclari` koleksiyonu.
 *
 * AÇIK RIZA (KVKK)
 *
 * Değerlendirme istemcide hesaplanır ve hiçbir yere gönderilmez; bu bölüm
 * kullanıcı "sonucu paylaş" düğmesine BASTIĞINDA kayıt oluşturur. İletişim
 * izni onay kutusu VARSAYILAN OLARAK İŞARETSİZDİR ve e-posta yalnızca o kutu
 * işaretliyken yazılır — "izin vermedi ama adresi kayıtta" hâli oluşmaz.
 * Koleksiyon açıklaması da bunu şart koşuyor: "kayıt yalnızca kullanıcı açıkça
 * paylaşmayı seçerse oluşur".
 *
 * Kurum adı ve çalışan aralığı İSTEĞE BAĞLIDIR: boş bırakılırsa o alanlar hiç
 * yazılmaz.
 */
export function ReadinessPaylasimi({ sonuc }: { sonuc: ReadinessSonucuGirdisi }) {
  const [durum, gonder, bekliyor] = useActionState(
    async (_onceki: FormSonucu | null, veri: FormData) => {
      const iletisimIzni = veri.get('iletisimIzni') === 'evet';
      const calisanAraligi = veri.get('calisanAraligi');

      return readinessSonucuKaydet({
        ...sonuc,
        kurumAdi: metin(veri.get('kurumAdi')),
        calisanAraligi: calisanAraligiMi(calisanAraligi) ? calisanAraligi : undefined,
        iletisimIzni,
        eposta: iletisimIzni ? metin(veri.get('eposta')) : undefined,
      });
    },
    FORM_BASLANGICI,
  );

  const formRef = useRef<HTMLFormElement>(null);

  // EFFECT İÇİNDE setState YOK: yalnızca DOM sıfırlaması.
  useEffect(() => {
    if (durum?.tamam) formRef.current?.reset();
  }, [durum]);

  const alanHatalari = durum && !durum.tamam ? durum.alanHatalari : undefined;

  if (durum?.tamam) {
    return (
      <div className="mt-6 border-t border-kenar-soluk pt-5">
        <p
          role="status"
          className="flex items-start gap-2 rounded-xl border border-basari/30 bg-basari/10 px-4 py-3 text-[0.8125rem] leading-relaxed text-metin"
        >
          <Onay className="mt-0.5 size-4 shrink-0 text-basari" />
          {durum.ileti}
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={gonder} className="mt-6 border-t border-kenar-soluk pt-5">
      <p className="etiket-mono mb-2 text-metin">Sonucu bizimle paylaşın</p>
      <p className="text-[0.8125rem] leading-relaxed text-metin-ikincil">
        Paylaşırsanız skor ve boyut kırılımı kaydedilir; sektör karşılaştırmalarını bu kayıtlar
        besler. Cevaplarınızın metni gönderilmez.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="readiness-kurum" className="etiket-mono mb-1.5 block text-metin-soluk">
            Kurum adı (isteğe bağlı)
          </label>
          <input
            id="readiness-kurum"
            name="kurumAdi"
            type="text"
            maxLength={KURUM_ADI_EN_COK}
            autoComplete="organization"
            className="h-10 w-full rounded-lg border border-kenar bg-zemin/70 px-3.5 text-sm text-metin outline-none transition-colors focus:border-vurgu"
          />
        </div>

        <div>
          <label htmlFor="readiness-calisan" className="etiket-mono mb-1.5 block text-metin-soluk">
            Çalışan sayısı (isteğe bağlı)
          </label>
          <select
            id="readiness-calisan"
            name="calisanAraligi"
            defaultValue=""
            className="h-10 w-full rounded-lg border border-kenar bg-zemin/70 px-3 text-sm text-metin outline-none transition-colors focus:border-vurgu"
          >
            <option value="">Belirtmek istemiyorum</option>
            {CALISAN_ARALIKLARI.map((aralik) => (
              <option key={aralik} value={aralik}>
                {aralik}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Açık rıza: varsayılan olarak İŞARETSİZ. */}
      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-kenar-soluk p-3.5 transition-colors hover:border-kenar-guclu">
        <input
          type="checkbox"
          name="iletisimIzni"
          value="evet"
          className="mt-0.5 size-4 shrink-0 accent-[var(--vurgu)]"
        />
        <span>
          <span className="block text-[0.8125rem] font-medium text-metin">
            Sonucu yorumlamak için benimle iletişime geçilmesini istiyorum
          </span>
          <span className="mt-0.5 block text-xs text-metin-soluk">
            İşaretlemezseniz e-posta adresiniz kaydedilmez.
          </span>
        </span>
      </label>

      <div className="mt-3">
        <label htmlFor="readiness-eposta" className="etiket-mono mb-1.5 block text-metin-soluk">
          E-posta (yalnızca iletişim izni verirseniz)
        </label>
        <input
          id="readiness-eposta"
          name="eposta"
          type="email"
          maxLength={EPOSTA_EN_COK}
          autoComplete="email"
          aria-invalid={alanHatalari?.eposta ? true : undefined}
          aria-describedby={alanHatalari?.eposta ? 'readiness-eposta-hatasi' : undefined}
          className="h-10 w-full rounded-lg border border-kenar bg-zemin/70 px-3.5 text-sm text-metin outline-none transition-colors focus:border-vurgu"
        />
        {alanHatalari?.eposta && (
          <p id="readiness-eposta-hatasi" className="mt-1.5 text-[0.6875rem] text-tehlike">
            {alanHatalari.eposta}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={bekliyor}
        className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-vurgu px-5 text-[0.8125rem] font-medium text-white transition-colors hover:bg-vurgu-parlak disabled:pointer-events-none disabled:opacity-60"
      >
        {bekliyor ? 'Gönderiliyor…' : 'Sonucu paylaş'}
        <Ok className="size-3.5" />
      </button>

      {durum && !durum.tamam && (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-tehlike/30 bg-tehlike/10 px-3 py-2.5 text-xs leading-relaxed text-metin"
        >
          {durum.hata}
        </p>
      )}

      <p className="mt-3 text-[0.6875rem] leading-relaxed text-metin-soluk">
        Kayıt{' '}
        <Link href="/kvkk-aydinlatma/" className="underline underline-offset-2">
          KVKK aydınlatma metni
        </Link>{' '}
        kapsamında işlenir. İletişim izni verilen kayıtlar en çok 24 ay, anonim kayıtlar 12 ay
        saklanır.
      </p>
    </form>
  );
}

function metin(deger: FormDataEntryValue | null): string | undefined {
  if (typeof deger !== 'string') return undefined;
  const kirpik = deger.trim();
  return kirpik.length > 0 ? kirpik : undefined;
}
