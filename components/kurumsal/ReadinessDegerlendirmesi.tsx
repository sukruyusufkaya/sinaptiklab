'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Hedef, Ok, Onay } from '@/components/arayuz/Ikonlar';
import { ReadinessPaylasimi } from '@/components/form/ReadinessPaylasimi';
import {
  BOYUT_HIZMET_ESLEMESI,
  CEVAP_SECENEKLERI,
  OLGUNLUK_SEVIYELERI,
  READINESS_BOYUTLARI_TAM,
} from '@/lib/veri/readiness';

type Asama = 'giris' | 'boyut' | 'sonuc';

const TOPLAM_IFADE = READINESS_BOYUTLARI_TAM.reduce((t, b) => t + b.ifadeler.length, 0);

/**
 * AI Readiness değerlendirmesi — istemci tarafı.
 *
 * Skor ağırlıklı ortalamadır: güvenlik ve yönetişim gibi boyutlar daha yüksek
 * ağırlık taşır, çünkü zayıf oldukları durumda diğer boyutların gücü riske
 * dönüşür.
 *
 * CEVAPLAR GÖNDERİLMEZ. Hesaplama tarayıcıda yapılır; sonuç ekranındaki
 * `ReadinessPaylasimi` bölümü ise kullanıcı AÇIKÇA paylaşmayı seçerse yalnızca
 * SKORLARI (boyut yüzdeleri ve toplam) gönderir — ifade metinleri ve tek tek
 * cevaplar hiçbir zaman gönderilmez. Bu, `readiness_sonuclari` koleksiyonunun
 * "kayıt yalnızca kullanıcı açıkça paylaşmayı seçerse oluşur" şartının
 * karşılığıdır.
 */
export function ReadinessDegerlendirmesi() {
  const [asama, setAsama] = useState<Asama>('giris');
  const [boyutSira, setBoyutSira] = useState(0);
  const [cevaplar, setCevaplar] = useState<Record<string, number>>({});

  const aktifBoyut = READINESS_BOYUTLARI_TAM[boyutSira];

  const sonuc = useMemo(() => {
    const boyutSkorlari = READINESS_BOYUTLARI_TAM.map((boyut) => {
      const enCok = boyut.ifadeler.length * 3;
      const alinan = boyut.ifadeler.reduce(
        (toplam, ifade) => toplam + (cevaplar[ifade.kimlik] ?? 0),
        0,
      );
      const yuzde = enCok > 0 ? Math.round((alinan / enCok) * 100) : 0;

      const zayifIfadeler = boyut.ifadeler.filter((ifade) => (cevaplar[ifade.kimlik] ?? 0) <= 1);

      return { boyut, yuzde, zayifIfadeler };
    });

    const agirlikToplami = READINESS_BOYUTLARI_TAM.reduce((t, b) => t + b.agirlik, 0);
    const genel = Math.round(
      boyutSkorlari.reduce((t, kayit) => t + kayit.yuzde * kayit.boyut.agirlik, 0) / agirlikToplami,
    );

    const seviye =
      [...OLGUNLUK_SEVIYELERI].reverse().find((kayit) => genel >= kayit.altSinir) ??
      OLGUNLUK_SEVIYELERI[0]!;

    // En zayıf üç boyut, öneri sırasını belirler.
    const oncelikler = [...boyutSkorlari].sort((a, b) => a.yuzde - b.yuzde).slice(0, 3);

    const cevaplanan = Object.keys(cevaplar).length;

    return { boyutSkorlari, genel, seviye, oncelikler, cevaplanan };
  }, [cevaplar]);

  function cevapla(kimlik: string, deger: number) {
    setCevaplar((onceki) => ({ ...onceki, [kimlik]: deger }));
  }

  function ilerle() {
    if (boyutSira + 1 >= READINESS_BOYUTLARI_TAM.length) {
      setAsama('sonuc');
      return;
    }
    setBoyutSira(boyutSira + 1);
  }

  function geri() {
    if (boyutSira === 0) {
      setAsama('giris');
      return;
    }
    setBoyutSira(boyutSira - 1);
  }

  function sifirla() {
    setCevaplar({});
    setBoyutSira(0);
    setAsama('boyut');
  }

  /* --- Giriş --- */
  if (asama === 'giris') {
    return (
      <div className="rounded-2xl border border-kenar bg-yuzey/40 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-full border border-vurgu/35 bg-vurgu-zemin text-vurgu-parlak">
            <Hedef className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[1.125rem] font-semibold tracking-tight text-metin">
              {READINESS_BOYUTLARI_TAM.length} boyut, {TOPLAM_IFADE} ifade
            </p>
            <p className="mt-2 max-w-xl text-[0.9375rem] leading-relaxed text-metin-ikincil">
              Her boyutta gözlemlenebilir ifadeler var: &quot;stratejiniz var mı?&quot; gibi yoruma
              açık sorular yerine yazılı mı, sahibi kim, ölçülüyor mu diye soruyoruz.
            </p>
          </div>
        </div>

        <ul className="mt-6 flex flex-wrap gap-2">
          {READINESS_BOYUTLARI_TAM.map((boyut) => (
            <li
              key={boyut.slug}
              className="rounded-full border border-kenar bg-zemin/60 px-3.5 py-1.5 text-xs text-metin-ikincil"
            >
              {boyut.ad}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setAsama('boyut')}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-vurgu px-6 text-sm font-medium text-white shadow-[0_6px_24px_-10px_var(--vurgu)] transition-colors hover:bg-vurgu-parlak"
          >
            Değerlendirmeyi başlat
            <Ok className="size-4" />
          </button>
          <span className="text-xs text-metin-soluk">
            ~5 dakika · Cevaplar tarayıcıda kalır; yalnızca siz seçerseniz skorunuz paylaşılır.
          </span>
        </div>
      </div>
    );
  }

  /* --- Sonuç --- */
  if (asama === 'sonuc') {
    return (
      <div className="overflow-hidden rounded-2xl border border-kenar bg-yuzey/40">
        <div className="border-b border-kenar bg-zemin-derin p-6 sm:p-8">
          <p className="etiket-mono mb-4 text-vurgu-parlak">AI Readiness Skoru</p>

          <div className="flex flex-wrap items-end gap-x-10 gap-y-4">
            <div>
              <p className="flex items-baseline gap-1.5">
                <span className="font-mono text-[3.5rem] leading-none font-medium tracking-tighter tabular-nums">
                  {sonuc.genel}
                </span>
                <span className="font-mono text-xl text-metin-soluk">/100</span>
              </p>
              <p className="mt-2 text-[1.0625rem] font-semibold tracking-tight text-metin">
                {sonuc.seviye.ad}
              </p>
              <p className="mt-1 max-w-md text-[0.8125rem] leading-relaxed text-metin-ikincil">
                {sonuc.seviye.tarif}
              </p>
            </div>

            <ul className="space-y-1.5">
              {OLGUNLUK_SEVIYELERI.map((kayit) => (
                <li key={kayit.ad} className="flex items-center gap-2.5 text-xs">
                  <span
                    className={`size-2 rounded-full ${kayit.renk} ${
                      kayit.ad === sonuc.seviye.ad ? '' : 'opacity-30'
                    }`}
                    aria-hidden="true"
                  />
                  <span
                    className={kayit.ad === sonuc.seviye.ad ? 'text-metin' : 'text-metin-soluk'}
                  >
                    {kayit.ad}
                  </span>
                  <span className="etiket-mono text-metin-soluk tabular-nums">{kayit.aralik}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 h-2 overflow-hidden rounded-full bg-yuzey-3">
            <div
              className={`h-full rounded-full ${sonuc.seviye.renk}`}
              style={{ width: `${sonuc.genel}%` }}
            />
          </div>
        </div>

        <div className="grid gap-px bg-kenar lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          {/* Boyut kırılımı */}
          <div className="bg-zemin p-6">
            <p className="etiket-mono mb-4 text-metin">Boyut kırılımı</p>
            <ul className="space-y-3.5">
              {sonuc.boyutSkorlari.map((kayit) => (
                <li key={kayit.boyut.slug}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <span className="text-[0.8125rem] text-metin-ikincil">{kayit.boyut.ad}</span>
                    <span className="font-mono text-xs text-metin-soluk tabular-nums">
                      {kayit.yuzde}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-yuzey-3">
                    <div
                      className={`h-full rounded-full ${
                        kayit.yuzde >= 80
                          ? 'bg-basari'
                          : kayit.yuzde >= 50
                            ? 'bg-vurgu'
                            : kayit.yuzde >= 30
                              ? 'bg-uyari'
                              : 'bg-tehlike'
                      }`}
                      style={{ width: `${Math.max(2, kayit.yuzde)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-kenar-soluk pt-3.5 text-[0.6875rem] leading-relaxed text-metin-soluk">
              Genel skor ağırlıklı ortalamadır: güvenlik ve yönetişim daha yüksek ağırlık taşır.
            </p>
          </div>

          {/* Öneriler */}
          <div className="bg-zemin p-6">
            <p className="etiket-mono mb-4 text-metin">En yüksek getirili ilk üç adım</p>
            <ol className="space-y-4">
              {sonuc.oncelikler.map((kayit, sira) => {
                const hizmet = BOYUT_HIZMET_ESLEMESI[kayit.boyut.slug];
                const ilkOneri = kayit.zayifIfadeler[0]?.oneri ?? kayit.boyut.tarif;

                return (
                  <li key={kayit.boyut.slug} className="flex gap-3.5">
                    <span className="etiket-mono grid size-7 shrink-0 place-items-center rounded-full border border-vurgu/35 bg-vurgu-zemin text-vurgu-parlak">
                      {sira + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[0.9375rem] font-medium text-metin">
                        {kayit.boyut.ad}
                        <span className="etiket-mono ml-2 text-metin-soluk">{kayit.yuzde}/100</span>
                      </p>
                      <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-metin-ikincil">
                        {ilkOneri}
                      </p>
                      {hizmet && (
                        <Link
                          href={hizmet.yol}
                          className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-vurgu-parlak"
                        >
                          {hizmet.ad}
                          <Ok className="size-3.5" />
                        </Link>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="mt-6 flex flex-wrap gap-3 border-t border-kenar-soluk pt-5">
              <Link
                href="/iletisim/"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-vurgu px-5 text-[0.8125rem] font-medium text-white transition-colors hover:bg-vurgu-parlak"
              >
                Sonucu birlikte yorumlayalım
                <Ok className="size-3.5" />
              </Link>
              <button
                type="button"
                onClick={sifirla}
                className="inline-flex h-10 items-center rounded-full border border-kenar-guclu bg-yuzey/60 px-4 text-[0.8125rem] font-medium text-metin transition-colors hover:border-vurgu"
              >
                Yeniden değerlendir
              </button>
            </div>

            <ReadinessPaylasimi
              sonuc={{
                boyutPuanlari: Object.fromEntries(
                  sonuc.boyutSkorlari.map((kayit) => [kayit.boyut.slug, kayit.yuzde]),
                ),
                toplamPuan: sonuc.genel,
                olgunlukSeviyesi: sonuc.seviye.ad,
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  /* --- Boyut --- */
  if (!aktifBoyut) return null;

  const boyutCevaplandi = aktifBoyut.ifadeler.every(
    (ifade) => cevaplar[ifade.kimlik] !== undefined,
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-kenar bg-yuzey/40">
      <div className="border-b border-kenar px-6 py-4">
        <div className="mb-2.5 flex items-center justify-between gap-4">
          <span className="etiket-mono text-metin-soluk">
            Boyut {boyutSira + 1} / {READINESS_BOYUTLARI_TAM.length}
          </span>
          <span className="etiket-mono text-metin-soluk">
            {sonuc.cevaplanan} / {TOPLAM_IFADE} ifade
          </span>
        </div>
        <div className="flex gap-1">
          {READINESS_BOYUTLARI_TAM.map((boyut, sira) => (
            <span
              key={boyut.slug}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                sira < boyutSira
                  ? 'bg-basari'
                  : sira === boyutSira
                    ? 'bg-gradient-to-r from-vurgu to-ikincil'
                    : 'bg-yuzey-3'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <h3 className="text-[1.25rem] font-semibold tracking-tight text-metin">{aktifBoyut.ad}</h3>
        <p className="mt-2 text-[0.875rem] leading-relaxed text-metin-soluk">{aktifBoyut.tarif}</p>

        <ul className="mt-7 space-y-5">
          {aktifBoyut.ifadeler.map((ifade) => (
            <li key={ifade.kimlik}>
              <p className="mb-3 text-[0.9375rem] leading-snug font-medium text-metin">
                {ifade.metin}
              </p>
              <div
                className="grid grid-cols-2 gap-2 sm:grid-cols-4"
                role="radiogroup"
                aria-label={ifade.metin}
              >
                {CEVAP_SECENEKLERI.map((secenek) => {
                  const secili = cevaplar[ifade.kimlik] === secenek.deger;
                  return (
                    <button
                      key={secenek.deger}
                      type="button"
                      role="radio"
                      aria-checked={secili}
                      onClick={() => cevapla(ifade.kimlik, secenek.deger)}
                      className={`rounded-xl border px-3 py-2.5 text-left transition-[border-color,background-color] duration-200 ${
                        secili
                          ? 'border-vurgu/50 bg-vurgu-zemin'
                          : 'border-kenar bg-zemin/50 hover:border-kenar-guclu hover:bg-yuzey-2'
                      }`}
                    >
                      <span
                        className={`block text-[0.8125rem] font-medium ${secili ? 'text-vurgu-parlak' : 'text-metin-ikincil'}`}
                      >
                        {secenek.ad}
                      </span>
                      <span className="mt-0.5 block text-[0.625rem] text-metin-soluk">
                        {secenek.tarif}
                      </span>
                    </button>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex items-center justify-between gap-4 border-t border-kenar-soluk pt-5">
          <button
            type="button"
            onClick={geri}
            className="inline-flex h-10 items-center rounded-full px-4 text-[0.8125rem] font-medium text-metin-soluk transition-colors hover:text-metin"
          >
            Geri
          </button>
          <button
            type="button"
            disabled={!boyutCevaplandi}
            onClick={ilerle}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-vurgu px-5 text-sm font-medium text-white transition-colors hover:bg-vurgu-parlak disabled:pointer-events-none disabled:opacity-40"
          >
            {boyutSira + 1 >= READINESS_BOYUTLARI_TAM.length ? 'Skoru gör' : 'Sonraki boyut'}
            {boyutCevaplandi ? <Ok className="size-4" /> : <Onay className="size-4 opacity-0" />}
          </button>
        </div>
      </div>
    </div>
  );
}
