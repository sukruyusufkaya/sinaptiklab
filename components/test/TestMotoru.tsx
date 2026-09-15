'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { Hedef, Kapat, Ok, Onay } from '@/components/arayuz/Ikonlar';
import { testSonucuKaydet } from '@/lib/site/form-eylemleri';
import type { Soru } from '@/lib/tipler';

type Asama = 'giris' | 'soru' | 'sonuc';

export type SonucBasamagi = {
  ad: string;
  aralik: string;
  tarif: string;
  renk: string;
  altSinir: number;
};

/**
 * İstemci tarafı test motoru.
 *
 * Tasarım kararı: cevap verildikten sonra açıklama hemen gösterilir. Test bir
 * ölçüm aracı olduğu kadar öğretim aracıdır; yanlış cevabın nedenini o anda
 * görmek, sonuç ekranında görmekten daha öğreticidir.
 *
 * SONUÇ KAYDI (ANONİM)
 *
 * Test bitiminde sonuç `test_sonuclari` koleksiyonuna yazılır: `testSlug`,
 * puan, doğru/soru sayısı, beceri kırılımı ve süre. `kullaniciKimligi`
 * YAZILMAZ — şema açıklaması anonim çözümlerde kullanıcı bağlanmayacağını
 * söylüyor. Ayırt edici olarak yalnızca tarayıcıda üretilen rastgele
 * `oturumAnahtari` gönderilir; kimlikle ilişkilendirilemez, `localStorage`
 * dışına çıkmaz. `testSlug` verilmezse hiç yazılmaz (kayıt hangi teste ait
 * olduğu bilinmeden anlamsız olur).
 *
 * Yazma SESSİZDİR: sonuç ekranı bir veritabanı hatası yüzünden bozulmaz.
 */
export function TestMotoru({
  sorular,
  basamaklar,
  oneri,
  alanBasligi = 'Beceri kırılımı',
  testSlug,
}: {
  sorular: Soru[];
  basamaklar: SonucBasamagi[];
  oneri?: { ad: string; yol: string; not?: string };
  alanBasligi?: string;
  /** Sonucun kaydedileceği test slug'ı. Verilmezse sonuç kaydedilmez. */
  testSlug?: string;
}) {
  const [asama, setAsama] = useState<Asama>('giris');
  const [sira, setSira] = useState(0);
  const [secim, setSecim] = useState<number | null>(null);
  const [cevaplar, setCevaplar] = useState<number[]>([]);
  const baslangic = useRef<number | null>(null);

  const aktif = sorular[sira];
  const toplam = sorular.length;

  const sonuc = useMemo(() => {
    const dogru = cevaplar.reduce(
      (sayac, cevap, indeks) => (cevap === sorular[indeks]?.dogruIndeks ? sayac + 1 : sayac),
      0,
    );
    const yuzde = toplam > 0 ? Math.round((dogru / toplam) * 100) : 0;

    const basamak =
      [...basamaklar].reverse().find((kayit) => yuzde >= kayit.altSinir) ?? basamaklar[0]!;

    // Beceri bazlı kırılım: hangi beceride kaç doğru?
    const beceriler = new Map<string, { dogru: number; toplam: number }>();
    sorular.forEach((soru, indeks) => {
      const mevcut = beceriler.get(soru.beceri) ?? { dogru: 0, toplam: 0 };
      mevcut.toplam += 1;
      if (cevaplar[indeks] === soru.dogruIndeks) mevcut.dogru += 1;
      beceriler.set(soru.beceri, mevcut);
    });

    const kirilim = [...beceriler.entries()]
      .map(([ad, kayit]) => ({
        ad,
        dogru: kayit.dogru,
        toplam: kayit.toplam,
        yuzde: Math.round((kayit.dogru / kayit.toplam) * 100),
      }))
      .sort((a, b) => a.yuzde - b.yuzde);

    const zayif = kirilim.filter((kayit) => kayit.yuzde < 100);

    return { dogru, yanlis: toplam - dogru, yuzde, basamak, kirilim, zayif };
  }, [cevaplar, sorular, toplam, basamaklar]);

  function basla() {
    setCevaplar([]);
    setSira(0);
    setSecim(null);
    baslangic.current = Date.now();
    setAsama('soru');
  }

  function cevapla(indeks: number) {
    if (secim !== null) return;
    setSecim(indeks);
    setCevaplar((onceki) => {
      const yeni = [...onceki];
      yeni[sira] = indeks;
      return yeni;
    });
  }

  function ilerle() {
    if (sira + 1 >= toplam) {
      // Kayıt EFFECT İÇİNDE DEĞİL, olay işleyicisinde tetiklenir (CLAUDE.md
      // kural 3): son soru yanıtlandığında test bir kez biter, effect ise
      // yeniden render'larda tekrar çalışabilir ve mükerrer kayıt üretirdi.
      sonucuKaydet();
      setAsama('sonuc');
      return;
    }
    setSira(sira + 1);
    setSecim(null);
  }

  function sonucuKaydet() {
    if (!testSlug) return;

    const gecen = baslangic.current;
    void testSonucuKaydet({
      testSlug,
      puan: sonuc.yuzde,
      dogruSayisi: sonuc.dogru,
      soruSayisi: toplam,
      seviye: sonuc.basamak.ad,
      beceriKirilimi: Object.fromEntries(sonuc.kirilim.map((k) => [k.ad, k.yuzde])),
      sureSaniye: gecen === null ? undefined : Math.round((Date.now() - gecen) / 1000),
      oturumAnahtari: oturumAnahtari(),
    });
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
              {toplam} soruluk testi çözmeye hazır mısın?
            </p>
            <p className="mt-2 max-w-xl text-[0.9375rem] leading-relaxed text-metin-ikincil">
              Her cevaptan sonra doğru yanıt ve açıklaması gösterilir. Sonuçta beceri bazlı kırılım
              ve eksik alanlar için öneri alırsın.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={basla}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-vurgu px-6 text-sm font-medium text-white shadow-[0_6px_24px_-10px_var(--vurgu)] transition-colors hover:bg-vurgu-parlak"
          >
            Teste başla
            <Ok className="size-4" />
          </button>
          <span className="text-xs text-metin-soluk">
            {testSlug
              ? 'Sonuç anonim olarak kaydedilir: yalnızca puan ve beceri kırılımı; kimlik bilgisi tutulmaz.'
              : 'Sonuç tarayıcıda kalır, hiçbir yere gönderilmez.'}
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
          <p className="etiket-mono mb-4 text-vurgu-parlak">Sonuç</p>

          <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
            <div>
              <p className="flex items-baseline gap-1.5">
                <span className="font-mono text-[3.5rem] leading-none font-medium tracking-tighter tabular-nums">
                  {sonuc.yuzde}
                </span>
                <span className="font-mono text-xl text-metin-soluk">/100</span>
              </p>
              <p className="mt-2 text-[1.0625rem] font-semibold tracking-tight text-metin">
                {sonuc.basamak.ad}
              </p>
              <p className="mt-1 text-[0.8125rem] text-metin-ikincil">{sonuc.basamak.tarif}</p>
            </div>

            <dl className="flex gap-px overflow-hidden rounded-xl border border-kenar bg-kenar">
              <div className="bg-zemin px-5 py-3.5">
                <dt className="etiket-mono text-metin-soluk">Doğru</dt>
                <dd className="mt-1 font-mono text-xl text-basari tabular-nums">{sonuc.dogru}</dd>
              </div>
              <div className="bg-zemin px-5 py-3.5">
                <dt className="etiket-mono text-metin-soluk">Yanlış</dt>
                <dd className="mt-1 font-mono text-xl text-tehlike tabular-nums">{sonuc.yanlis}</dd>
              </div>
              <div className="bg-zemin px-5 py-3.5">
                <dt className="etiket-mono text-metin-soluk">Soru</dt>
                <dd className="mt-1 font-mono text-xl text-metin-ikincil tabular-nums">{toplam}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 h-2 overflow-hidden rounded-full bg-yuzey-3">
            <div
              className={`h-full rounded-full ${sonuc.basamak.renk}`}
              style={{ width: `${sonuc.yuzde}%` }}
            />
          </div>
        </div>

        <div className="grid gap-px bg-kenar lg:grid-cols-2">
          {/* Beceri kırılımı */}
          <div className="bg-zemin p-6">
            <p className="etiket-mono mb-4 text-metin">{alanBasligi}</p>
            <ul className="space-y-3">
              {sonuc.kirilim.map((kayit) => (
                <li key={kayit.ad}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <span className="text-[0.8125rem] text-metin-ikincil">{kayit.ad}</span>
                    <span className="font-mono text-xs text-metin-soluk tabular-nums">
                      {kayit.dogru}/{kayit.toplam}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-yuzey-3">
                    <div
                      className={`h-full rounded-full ${
                        kayit.yuzde === 100
                          ? 'bg-basari'
                          : kayit.yuzde >= 50
                            ? 'bg-uyari'
                            : 'bg-tehlike'
                      }`}
                      style={{ width: `${kayit.yuzde}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Öneri */}
          <div className="bg-zemin p-6">
            <p className="etiket-mono mb-4 text-metin">Sıradaki adım</p>

            {sonuc.zayif.length > 0 ? (
              <>
                <p className="text-[0.875rem] leading-relaxed text-metin-ikincil">
                  Eksik çıkan beceriler:
                </p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {sonuc.zayif.map((kayit) => (
                    <li
                      key={kayit.ad}
                      className="rounded-md border border-uyari/30 bg-uyari/10 px-2 py-1 text-[0.6875rem] text-uyari"
                    >
                      {kayit.ad}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed text-metin-ikincil">
                <Onay className="mt-0.5 size-4 shrink-0 text-basari" />
                Tüm beceri alanlarında tam skor. Bir üst seviye teste geçebilirsin.
              </p>
            )}

            {oneri && (
              <div className="mt-5 rounded-xl border border-vurgu/30 bg-vurgu-zemin/50 p-4">
                <p className="etiket-mono mb-1.5 text-vurgu-parlak">Önerilen rota</p>
                <Link
                  href={oneri.yol}
                  className="text-sm font-medium text-metin transition-colors hover:text-vurgu-parlak"
                >
                  {oneri.ad}
                </Link>
                {oneri.not && <p className="mt-1 text-xs text-metin-ikincil">{oneri.not}</p>}
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={basla}
                className="inline-flex h-9 items-center gap-2 rounded-full border border-kenar-guclu bg-yuzey/60 px-4 text-[0.8125rem] font-medium text-metin transition-colors hover:border-vurgu"
              >
                Yeniden çöz
              </button>
              <Link
                href="/testler/"
                className="inline-flex h-9 items-center gap-2 rounded-full px-4 text-[0.8125rem] font-medium text-metin-ikincil transition-colors hover:text-metin"
              >
                Diğer testler
                <Ok className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* --- Soru --- */
  if (!aktif) return null;

  const dogruMu = secim === aktif.dogruIndeks;

  return (
    <div className="overflow-hidden rounded-2xl border border-kenar bg-yuzey/40">
      {/* İlerleme */}
      <div className="border-b border-kenar px-6 py-4">
        <div className="mb-2.5 flex items-center justify-between gap-4">
          <span className="etiket-mono text-metin-soluk">
            Soru {sira + 1} / {toplam}
          </span>
          <span className="etiket-mono text-metin-soluk">
            {aktif.altKonu} · {aktif.beceri}
          </span>
        </div>
        <div
          className="h-1 overflow-hidden rounded-full bg-yuzey-3"
          role="progressbar"
          aria-valuenow={sira + 1}
          aria-valuemin={1}
          aria-valuemax={toplam}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-vurgu to-ikincil transition-[width] duration-300 ease-sinaptik"
            style={{ width: `${((sira + (secim !== null ? 1 : 0)) / toplam) * 100}%` }}
          />
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <p className="text-[1.125rem] leading-snug font-medium tracking-tight text-metin sm:text-[1.25rem]">
          {aktif.soru}
        </p>

        <ul className="mt-6 space-y-2.5" role="radiogroup" aria-label="Cevap seçenekleri">
          {aktif.secenekler.map((secenek, indeks) => {
            const secili = secim === indeks;
            const dogruSecenek = indeks === aktif.dogruIndeks;
            const cevaplandi = secim !== null;

            const sinif = !cevaplandi
              ? 'border-kenar bg-zemin/50 hover:border-vurgu/50 hover:bg-yuzey-2 cursor-pointer'
              : dogruSecenek
                ? 'border-basari/45 bg-basari/10'
                : secili
                  ? 'border-tehlike/45 bg-tehlike/10'
                  : 'border-kenar-soluk bg-zemin/30 opacity-60';

            return (
              <li key={secenek}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={secili}
                  disabled={cevaplandi}
                  onClick={() => cevapla(indeks)}
                  className={`flex w-full items-start gap-3.5 rounded-xl border px-4 py-3.5 text-left transition-[border-color,background-color,opacity] duration-200 ${sinif}`}
                >
                  <span
                    className={`etiket-mono mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border ${
                      cevaplandi && dogruSecenek
                        ? 'border-basari/45 bg-basari/15 text-basari'
                        : cevaplandi && secili
                          ? 'border-tehlike/45 bg-tehlike/15 text-tehlike'
                          : 'border-kenar text-metin-soluk'
                    }`}
                  >
                    {String.fromCharCode(65 + indeks)}
                  </span>
                  <span className="flex-1 text-[0.9375rem] leading-relaxed text-metin-ikincil">
                    {secenek}
                  </span>
                  {cevaplandi && dogruSecenek && (
                    <Onay className="mt-0.5 size-4 shrink-0 text-basari" />
                  )}
                  {cevaplandi && secili && !dogruSecenek && (
                    <Kapat className="mt-0.5 size-4 shrink-0 text-tehlike" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Açıklama */}
        {secim !== null && (
          <div
            className={`giris-animasyonu mt-6 rounded-xl border p-5 ${
              dogruMu ? 'border-basari/30 bg-basari/8' : 'border-uyari/30 bg-uyari/8'
            }`}
          >
            <p className={`etiket-mono mb-2 ${dogruMu ? 'text-basari' : 'text-uyari'}`}>
              {dogruMu ? 'Doğru' : 'Yanlış'}
            </p>
            <p className="text-[0.9375rem] leading-relaxed text-metin-ikincil">{aktif.aciklama}</p>
            {aktif.ilgiliAtlas && (
              <Link
                href={`/atlas/${aktif.ilgiliAtlas}/`}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-vurgu-parlak"
              >
                İlgili Atlas girdisini oku
                <Ok className="size-3.5" />
              </Link>
            )}
          </div>
        )}

        {/* İlerle */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <span className="etiket-mono text-metin-soluk">{aktif.kimlik}</span>
          <button
            type="button"
            disabled={secim === null}
            onClick={ilerle}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-vurgu px-5 text-sm font-medium text-white transition-colors hover:bg-vurgu-parlak disabled:pointer-events-none disabled:opacity-40"
          >
            {sira + 1 >= toplam ? 'Sonucu gör' : 'Sonraki soru'}
            <Ok className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Anonim çözüm anahtarı.
 *
 * Aynı tarayıcının farklı denemelerini birbirine bağlar (şema: "anonim
 * çözümlerde rastgele anahtar"). Rastgeledir, kimlikten türetilmez ve sunucuya
 * yalnızca bu değer gider. Okuma/yazma OLAY ANINDA yapılır, render sırasında
 * değil: `localStorage` sunucuda yoktur ve render'ı ortama bağlamak hidrasyon
 * uyuşmazlığı üretir.
 */
function oturumAnahtari(): string | undefined {
  try {
    const kayitli = localStorage.getItem(ANAHTAR_ADI);
    if (kayitli && /^[a-zA-Z0-9-]{8,64}$/.test(kayitli)) return kayitli;

    const yeni = crypto.randomUUID();
    localStorage.setItem(ANAHTAR_ADI, yeni);
    return yeni;
  } catch {
    // Gizli kip veya kapatılmış depolama: anahtar olmadan da kayıt geçerlidir.
    return undefined;
  }
}

const ANAHTAR_ADI = 'sinaptik-test-oturumu';
