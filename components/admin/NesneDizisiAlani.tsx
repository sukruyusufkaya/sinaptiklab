'use client';

import { useId, useState } from 'react';
import { Kapat } from '@/components/arayuz/Ikonlar';
import type { Alan } from '@/lib/admin/alanlar/tipler';

/**
 * İç içe nesne dizisi editörü.
 *
 * Dergi yazıları, rota bölümleri, kaynak listeleri, tablo etkileri… Şemada
 * `array of object` olan her alan bunu kullanır. Alt alanlar `altAlanlar`
 * tanımından render edilir, yani yeni bir alt alan eklemek için yalnızca
 * konfigürasyon değişir.
 *
 * Değer gizli bir alanda JSON olarak taşınır.
 */

const ALAN =
  'w-full rounded-lg border border-kenar bg-zemin px-3 py-2 text-sm text-metin outline-none transition-colors focus:border-vurgu';
const KUCUK_DUGME =
  'rounded-md border border-kenar px-2 py-1 font-mono text-[0.625rem] tracking-[0.06em] text-metin-soluk transition-colors hover:border-vurgu hover:text-metin disabled:opacity-40';

type Oge = Record<string, unknown>;

function bosOge(altAlanlar: readonly Alan[]): Oge {
  const oge: Oge = {};
  for (const alt of altAlanlar) {
    if (alt.tip === 'metinDizisi' || alt.tip === 'cokluIliski') oge[alt.ad] = [];
    else if (alt.tip === 'mantik') oge[alt.ad] = false;
    else if (alt.tip === 'sayi') oge[alt.ad] = 0;
    else if (alt.tip === 'nesneDizisi' || alt.tip === 'bloklar') oge[alt.ad] = [];
    else oge[alt.ad] = '';
  }
  return oge;
}

function ozet(oge: Oge, altAlanlar: readonly Alan[]): string {
  const ilk = altAlanlar[0];
  if (!ilk) return '';
  const deger = oge[ilk.ad];
  if (typeof deger === 'string' && deger) return deger.slice(0, 60);
  if (Array.isArray(deger)) return `${deger.length} öge`;
  return '(boş)';
}

export function NesneDizisiAlani({
  ad,
  altAlanlar,
  baslangic,
  iliskiSecenekleri,
}: {
  ad: string;
  altAlanlar: readonly Alan[];
  baslangic?: Oge[];
  iliskiSecenekleri?: Record<string, { deger: string; etiket: string }[]>;
}) {
  const [ogeler, setOgeler] = useState<Oge[]>(baslangic ?? []);
  const [acik, setAcik] = useState<number | null>(null);
  const kimlikOneki = useId();

  function guncelle(sira: number, alanAdi: string, deger: unknown) {
    setOgeler((mevcut) => mevcut.map((o, i) => (i === sira ? { ...o, [alanAdi]: deger } : o)));
  }

  function tasi(sira: number, yon: -1 | 1) {
    setOgeler((mevcut) => {
      const hedef = sira + yon;
      if (hedef < 0 || hedef >= mevcut.length) return mevcut;
      const kopya = [...mevcut];
      const a = kopya[sira];
      const b = kopya[hedef];
      if (!a || !b) return mevcut;
      kopya[sira] = b;
      kopya[hedef] = a;
      return kopya;
    });
    setAcik(sira + yon);
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={ad} value={JSON.stringify(ogeler)} />

      {ogeler.length === 0 && (
        <p className="rounded-lg border border-dashed border-kenar-guclu px-3 py-4 text-center text-xs text-metin-soluk">
          Henüz öge yok.
        </p>
      )}

      <ol className="space-y-1.5">
        {ogeler.map((oge, sira) => {
          const acikMi = acik === sira;
          return (
            <li
              key={`${kimlikOneki}-${sira}`}
              className="rounded-lg border border-kenar bg-yuzey/30"
            >
              <div className="flex items-center gap-2 px-3 py-2">
                <button
                  type="button"
                  onClick={() => setAcik(acikMi ? null : sira)}
                  className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                  aria-expanded={acikMi}
                >
                  <span className="etiket-mono w-5 shrink-0 text-metin-soluk tabular-nums">
                    {sira + 1}
                  </span>
                  <span className="min-w-0 truncate text-xs text-metin-ikincil">
                    {ozet(oge, altAlanlar)}
                  </span>
                </button>
                <span className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => tasi(sira, -1)}
                    disabled={sira === 0}
                    className={KUCUK_DUGME}
                    aria-label="Yukarı"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => tasi(sira, 1)}
                    disabled={sira === ogeler.length - 1}
                    className={KUCUK_DUGME}
                    aria-label="Aşağı"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOgeler((m) => m.filter((_, i) => i !== sira));
                      setAcik(null);
                    }}
                    className="grid size-7 place-items-center rounded-md border border-kenar text-metin-soluk transition-colors hover:border-tehlike hover:text-tehlike"
                    aria-label="Ögeyi sil"
                  >
                    <Kapat className="size-3.5" />
                  </button>
                </span>
              </div>

              {acikMi && (
                <div className="grid gap-2.5 border-t border-kenar-soluk px-3 py-3 sm:grid-cols-2">
                  {altAlanlar.map((alt) => (
                    <div key={alt.ad} className={alt.genislik === 'yarim' ? '' : 'sm:col-span-2'}>
                      <label className="etiket-mono mb-1 block text-metin-soluk">
                        {alt.etiket}
                        {alt.zorunlu && <span className="ml-1 text-tehlike">*</span>}
                      </label>
                      <AltAlan
                        alan={alt}
                        deger={oge[alt.ad]}
                        degistir={(d) => guncelle(sira, alt.ad, d)}
                        secenekler={iliskiSecenekleri?.[alt.ad]}
                      />
                      {alt.yardim && (
                        <p className="mt-1 text-[0.6875rem] leading-relaxed text-metin-soluk">
                          {alt.yardim}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <button
        type="button"
        onClick={() => {
          setOgeler((m) => {
            setAcik(m.length);
            return [...m, bosOge(altAlanlar)];
          });
        }}
        className={KUCUK_DUGME}
      >
        + öge ekle
      </button>
    </div>
  );
}

function AltAlan({
  alan,
  deger,
  degistir,
  secenekler,
}: {
  alan: Alan;
  deger: unknown;
  degistir: (yeni: unknown) => void;
  secenekler?: { deger: string; etiket: string }[];
}) {
  switch (alan.tip) {
    case 'uzunMetin':
      return (
        <textarea
          value={typeof deger === 'string' ? deger : ''}
          onChange={(o) => degistir(o.target.value)}
          rows={alan.satir ?? 3}
          className={ALAN}
        />
      );

    case 'sayi':
      return (
        <input
          type="number"
          value={typeof deger === 'number' ? deger : ''}
          onChange={(o) => degistir(o.target.value === '' ? '' : Number(o.target.value))}
          className={ALAN}
        />
      );

    case 'mantik':
      return (
        <label className="flex items-center gap-2 text-sm text-metin-ikincil">
          <input
            type="checkbox"
            checked={Boolean(deger)}
            onChange={(o) => degistir(o.target.checked)}
            className="size-4 accent-[var(--vurgu)]"
          />
          {alan.etiket}
        </label>
      );

    case 'secim':
      return (
        <select
          value={typeof deger === 'string' ? deger : ''}
          onChange={(o) => degistir(o.target.value)}
          className={ALAN}
        >
          <option value="">— seçin —</option>
          {alan.secenekler?.map((s) => (
            <option key={s.deger} value={s.deger}>
              {s.etiket}
            </option>
          ))}
        </select>
      );

    case 'iliski':
      return (
        <select
          value={typeof deger === 'string' ? deger : ''}
          onChange={(o) => degistir(o.target.value)}
          className={ALAN}
        >
          <option value="">— seçin —</option>
          {(secenekler ?? []).map((s) => (
            <option key={s.deger} value={s.deger}>
              {s.etiket}
            </option>
          ))}
        </select>
      );

    case 'metinDizisi':
    case 'cokluIliski':
      return (
        <textarea
          value={Array.isArray(deger) ? deger.join('\n') : ''}
          onChange={(o) =>
            degistir(
              o.target.value
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean),
            )
          }
          rows={3}
          placeholder="Her satır bir değer"
          className={ALAN}
        />
      );

    case 'bloklar':
    case 'nesneDizisi':
    case 'json':
      return (
        <textarea
          value={deger === undefined ? '' : JSON.stringify(deger, null, 1)}
          onChange={(o) => {
            try {
              degistir(JSON.parse(o.target.value || '[]'));
            } catch {
              /* geçersiz JSON yazılırken değeri koru */
            }
          }}
          rows={6}
          spellCheck={false}
          className={`${ALAN} font-mono text-xs`}
        />
      );

    default:
      return (
        <input
          type={alan.tip === 'tarih' ? 'date' : 'text'}
          value={typeof deger === 'string' ? deger : ''}
          onChange={(o) => degistir(o.target.value)}
          className={alan.tip === 'slug' ? `${ALAN} font-mono text-xs` : ALAN}
        />
      );
  }
}
