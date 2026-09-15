'use client';

import type { ReactNode } from 'react';

/**
 * Hesaplayıcıların ortak form ve sonuç bileşenleri.
 * Hesaplama tamamen istemcide yapılır; girdiler sunucuya gönderilmez.
 */

export function HesapDuzeni({
  girdiler,
  sonuclar,
  not,
}: {
  girdiler: ReactNode;
  sonuclar: ReactNode;
  not?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-kenar bg-yuzey/40">
      <div className="grid gap-px bg-kenar lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="bg-zemin p-6 sm:p-7">
          <p className="etiket-mono mb-5 text-metin">Girdiler</p>
          <div className="space-y-5">{girdiler}</div>
        </div>
        <div className="bg-zemin-derin p-6 sm:p-7">
          <p className="etiket-mono mb-5 text-vurgu-parlak">Sonuç</p>
          <div className="space-y-4">{sonuclar}</div>
        </div>
      </div>
      {not && (
        <div className="border-t border-kenar px-6 py-4 sm:px-7">
          <p className="text-xs leading-relaxed text-metin-soluk">{not}</p>
        </div>
      )}
    </div>
  );
}

export function SayiAlani({
  etiket,
  deger,
  degisti,
  birim,
  enAz = 0,
  enCok,
  adim = 1,
  ipucu,
}: {
  etiket: string;
  deger: number;
  degisti: (yeni: number) => void;
  birim?: string;
  enAz?: number;
  enCok?: number;
  adim?: number;
  ipucu?: string;
}) {
  const kimlik = `alan-${etiket.toLocaleLowerCase('tr-TR').replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <div>
      <label htmlFor={kimlik} className="etiket-mono mb-1.5 block text-metin-soluk">
        {etiket}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={kimlik}
          type="number"
          inputMode="decimal"
          value={Number.isFinite(deger) ? deger : ''}
          min={enAz}
          max={enCok}
          step={adim}
          onChange={(olay) => degisti(olay.target.valueAsNumber)}
          className="h-10 min-w-0 flex-1 rounded-lg border border-kenar bg-zemin/70 px-3.5 font-mono text-sm text-metin outline-none transition-colors tabular-nums focus:border-vurgu"
        />
        {birim && (
          <span className="etiket-mono shrink-0 text-metin-soluk" aria-hidden="true">
            {birim}
          </span>
        )}
      </div>
      {ipucu && <p className="mt-1.5 text-[0.6875rem] leading-relaxed text-metin-soluk">{ipucu}</p>}
    </div>
  );
}

export function KaydirmaAlani({
  etiket,
  deger,
  degisti,
  enAz,
  enCok,
  adim = 1,
  bicimle,
}: {
  etiket: string;
  deger: number;
  degisti: (yeni: number) => void;
  enAz: number;
  enCok: number;
  adim?: number;
  bicimle?: (deger: number) => string;
}) {
  const kimlik = `kaydir-${etiket.toLocaleLowerCase('tr-TR').replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={kimlik} className="etiket-mono text-metin-soluk">
          {etiket}
        </label>
        <span className="font-mono text-sm text-metin tabular-nums">
          {bicimle ? bicimle(deger) : deger}
        </span>
      </div>
      <input
        id={kimlik}
        type="range"
        value={deger}
        min={enAz}
        max={enCok}
        step={adim}
        onChange={(olay) => degisti(olay.target.valueAsNumber)}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-yuzey-3 accent-[var(--vurgu)]"
      />
    </div>
  );
}

export function SecimAlani<T extends string>({
  etiket,
  deger,
  degisti,
  secenekler,
  ipucu,
}: {
  etiket: string;
  deger: T;
  degisti: (yeni: T) => void;
  secenekler: { deger: T; ad: string }[];
  ipucu?: string;
}) {
  const kimlik = `secim-${etiket.toLocaleLowerCase('tr-TR').replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <div>
      <label htmlFor={kimlik} className="etiket-mono mb-1.5 block text-metin-soluk">
        {etiket}
      </label>
      <select
        id={kimlik}
        value={deger}
        onChange={(olay) => degisti(olay.target.value as T)}
        className="h-10 w-full rounded-lg border border-kenar bg-zemin/70 px-3 text-sm text-metin outline-none transition-colors focus:border-vurgu"
      >
        {secenekler.map((secenek) => (
          <option key={secenek.deger} value={secenek.deger}>
            {secenek.ad}
          </option>
        ))}
      </select>
      {ipucu && <p className="mt-1.5 text-[0.6875rem] leading-relaxed text-metin-soluk">{ipucu}</p>}
    </div>
  );
}

export function MetinAlani({
  etiket,
  deger,
  degisti,
  satir = 6,
  ipucu,
  yerTutucu,
}: {
  etiket: string;
  deger: string;
  degisti: (yeni: string) => void;
  satir?: number;
  ipucu?: string;
  yerTutucu?: string;
}) {
  const kimlik = `metin-${etiket.toLocaleLowerCase('tr-TR').replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <div>
      <label htmlFor={kimlik} className="etiket-mono mb-1.5 block text-metin-soluk">
        {etiket}
      </label>
      <textarea
        id={kimlik}
        rows={satir}
        value={deger}
        placeholder={yerTutucu}
        onChange={(olay) => degisti(olay.target.value)}
        className="w-full rounded-lg border border-kenar bg-zemin/70 px-3.5 py-2.5 text-sm leading-relaxed text-metin outline-none transition-colors placeholder:text-metin-soluk focus:border-vurgu"
      />
      {ipucu && <p className="mt-1.5 text-[0.6875rem] leading-relaxed text-metin-soluk">{ipucu}</p>}
    </div>
  );
}

export function AnaSonuc({
  deger,
  birim,
  etiket,
  ton = 'vurgu',
}: {
  deger: string;
  birim?: string;
  etiket: string;
  ton?: 'vurgu' | 'ikincil' | 'sinyal' | 'uyari';
}) {
  const renk =
    ton === 'ikincil'
      ? 'text-ikincil'
      : ton === 'sinyal'
        ? 'text-sinyal'
        : ton === 'uyari'
          ? 'text-uyari'
          : 'text-metin';

  return (
    <div className="rounded-xl border border-kenar bg-yuzey/50 p-5">
      <p className="etiket-mono text-metin-soluk">{etiket}</p>
      <p className="mt-2 flex items-baseline gap-1.5">
        <span
          className={`font-mono text-[2.5rem] leading-none font-medium tracking-tighter tabular-nums ${renk}`}
        >
          {deger}
        </span>
        {birim && <span className="font-mono text-base text-metin-soluk">{birim}</span>}
      </p>
    </div>
  );
}

export function SonucSatiri({
  etiket,
  deger,
  vurgulu,
}: {
  etiket: string;
  deger: string;
  vurgulu?: boolean;
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-4 border-b border-kenar-soluk pb-2.5 last:border-b-0 ${
        vurgulu ? 'text-metin' : 'text-metin-ikincil'
      }`}
    >
      <span className="text-[0.8125rem]">{etiket}</span>
      <span
        className={`font-mono text-sm tabular-nums ${vurgulu ? 'font-medium text-metin' : 'text-metin-ikincil'}`}
      >
        {deger}
      </span>
    </div>
  );
}

export function OranCubugu({
  bolumler,
  toplam,
}: {
  bolumler: { ad: string; deger: number; renk: string }[];
  toplam: number;
}) {
  const guvenliToplam = toplam > 0 ? toplam : 1;

  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-yuzey-3">
        {bolumler.map((bolum) => (
          <div
            key={bolum.ad}
            className={bolum.renk}
            style={{ width: `${Math.min(100, (bolum.deger / guvenliToplam) * 100)}%` }}
            title={`${bolum.ad}: ${bolum.deger.toLocaleString('tr-TR')}`}
          />
        ))}
      </div>
      <ul className="mt-3 space-y-1.5">
        {bolumler.map((bolum) => (
          <li key={bolum.ad} className="flex items-center justify-between gap-3 text-xs">
            <span className="flex items-center gap-2">
              <span className={`size-2 rounded-full ${bolum.renk}`} aria-hidden="true" />
              <span className="text-metin-ikincil">{bolum.ad}</span>
            </span>
            <span className="font-mono text-metin-soluk tabular-nums">
              {bolum.deger.toLocaleString('tr-TR')}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* --- Biçimlendiriciler ---------------------------------------------------- */

export function sayi(deger: number, basamak = 0) {
  if (!Number.isFinite(deger)) return '—';
  return deger.toLocaleString('tr-TR', {
    minimumFractionDigits: basamak,
    maximumFractionDigits: basamak,
  });
}

export function paraBirimi(deger: number, basamak = 2) {
  if (!Number.isFinite(deger)) return '—';
  return deger.toLocaleString('tr-TR', {
    minimumFractionDigits: basamak,
    maximumFractionDigits: basamak,
  });
}

export function guvenliSayi(deger: number, varsayilan = 0) {
  return Number.isFinite(deger) ? deger : varsayilan;
}
