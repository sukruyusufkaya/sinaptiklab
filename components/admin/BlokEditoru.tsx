'use client';

import { useId, useState } from 'react';
import { Kapat, Ok } from '@/components/arayuz/Ikonlar';
import type { Blok } from '@/lib/tipler';

/**
 * Yapılandırılmış metin gövdesi editörü.
 *
 * HTML string DÜZENLENMEZ: gövde `Blok` birliğidir (paragraf, altbaşlık,
 * liste, kısa-cevap, alıntı, kod, tablo, akış, uyarı). Bu, aynı içeriğin
 * hem HTML'e hem şema işaretlemesine hem de makine yüzeylerine (llms.txt,
 * RSS) tutarlı biçimde çevrilmesini sağlar — ve depolanmış XSS yüzeyini
 * ortadan kaldırır, çünkü hiçbir yere ham işaretleme yazılmaz.
 *
 * Değer gizli bir alanda JSON olarak taşınır; sunucu tarafı `formuCoz`
 * içinde çözer ve doğrular.
 */

const BLOK_TURLERI = [
  { tip: 'paragraf', etiket: 'Paragraf' },
  { tip: 'altbaslik', etiket: 'Alt başlık' },
  { tip: 'kisa-cevap', etiket: 'Kısa cevap (answer-first)' },
  { tip: 'liste', etiket: 'Liste' },
  { tip: 'tablo', etiket: 'Tablo' },
  { tip: 'akis', etiket: 'Akış (adımlar)' },
  { tip: 'uyari', etiket: 'Uyarı' },
  { tip: 'alinti', etiket: 'Alıntı' },
  { tip: 'kod', etiket: 'Kod' },
] as const;

type BlokTipi = (typeof BLOK_TURLERI)[number]['tip'];

const ALAN =
  'w-full rounded-lg border border-kenar bg-zemin px-3 py-2 text-sm text-metin outline-none transition-colors focus:border-vurgu';
const KUCUK_DUGME =
  'rounded-md border border-kenar px-2 py-1 font-mono text-[0.625rem] tracking-[0.06em] text-metin-soluk transition-colors hover:border-vurgu hover:text-metin disabled:opacity-40';

/** Alt başlıktan kimlik üretir — içindekiler bağlantısı için gerekli. */
function kimlikUret(metin: string): string {
  return metin
    .toLocaleLowerCase('tr-TR')
    .replaceAll('ı', 'i')
    .replaceAll('ğ', 'g')
    .replaceAll('ü', 'u')
    .replaceAll('ş', 's')
    .replaceAll('ö', 'o')
    .replaceAll('ç', 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function bosBlok(tip: BlokTipi): Blok {
  switch (tip) {
    case 'altbaslik':
      return { tip: 'altbaslik', metin: '', kimlik: '' };
    case 'liste':
      return { tip: 'liste', ogeler: [''] };
    case 'tablo':
      return { tip: 'tablo', basliklar: ['', ''], satirlar: [['', '']] };
    case 'akis':
      return { tip: 'akis', adimlar: [{ ad: '', aciklama: '' }] };
    case 'uyari':
      return { tip: 'uyari', ton: 'bilgi', metin: '' };
    case 'alinti':
      return { tip: 'alinti', metin: '' };
    case 'kod':
      return { tip: 'kod', dil: 'text', metin: '' };
    case 'kisa-cevap':
      return { tip: 'kisa-cevap', metin: '' };
    default:
      return { tip: 'paragraf', metin: '' };
  }
}

/**
 * Eksik alanlı blokları tamamlar.
 *
 * NEDEN GEREKLİ: şema bir blokta yalnızca `tip` alanını zorunlu tutar (bkz.
 * `BLOK`, lib/mongo/koleksiyonlar.ts), yani `{ tip: 'liste' }` veritabanında
 * GEÇERLİ bir belgedir. `Blok` tipi `ogeler`i zorunlu saydığı için TypeScript
 * uyarmaz, editör gövdesi `blok.ogeler.join(...)` der ve düzenleme ekranı o
 * kayıtta "Cannot read properties of undefined" ile 500'e düşer.
 *
 * Eksik alanlar `bosBlok` varsayılanlarıyla doldurulur; var olan değerler
 * korunur. Tanınmayan bir `tip` paragrafa indirgenir. Onarım kaydedildiğinde
 * belgeye de yazılır.
 */
function blokTamamla(blok: Blok): Blok {
  const taninan = BLOK_TURLERI.some((tur) => tur.tip === blok?.tip);
  const tip = (taninan ? blok.tip : 'paragraf') as BlokTipi;
  return { ...bosBlok(tip), ...blok, tip } as Blok;
}

/** Kapalı bloğun yanında görünen tek satırlık özet. */
function blokOzeti(blok: Blok): string {
  if ('metin' in blok && blok.metin) return blok.metin.slice(0, 70);
  if (blok.tip === 'liste') return `${blok.ogeler?.length ?? 0} madde`;
  if (blok.tip === 'tablo') {
    return `${blok.basliklar?.length ?? 0}×${blok.satirlar?.length ?? 0} tablo`;
  }
  if (blok.tip === 'akis') return `${blok.adimlar?.length ?? 0} adım`;
  return '';
}

export function BlokEditoru({ ad, baslangic }: { ad: string; baslangic?: Blok[] }) {
  // Eksik alanlı bloklar İLK durumda onarılır; editör gövdesi hep tam blok görür.
  const [bloklar, setBloklar] = useState<Blok[]>(() => (baslangic ?? []).map(blokTamamla));
  const [acik, setAcik] = useState<number | null>(baslangic?.length ? null : 0);
  const kimlikOneki = useId();

  function guncelle(sira: number, yeni: Blok) {
    setBloklar((mevcut) => mevcut.map((b, i) => (i === sira ? yeni : b)));
  }

  function ekle(tip: BlokTipi) {
    setBloklar((mevcut) => {
      setAcik(mevcut.length);
      return [...mevcut, bosBlok(tip)];
    });
  }

  function sil(sira: number) {
    setBloklar((mevcut) => mevcut.filter((_, i) => i !== sira));
    setAcik(null);
  }

  function tasi(sira: number, yon: -1 | 1) {
    setBloklar((mevcut) => {
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
    <div className="space-y-3">
      {/* Sunucuya giden gerçek değer */}
      <input type="hidden" name={ad} value={JSON.stringify(bloklar)} />

      {bloklar.length === 0 && (
        <p className="rounded-lg border border-dashed border-kenar-guclu px-4 py-6 text-center text-sm text-metin-soluk">
          Gövde boş. Aşağıdan blok ekleyin.
        </p>
      )}

      <ol className="space-y-2">
        {bloklar.map((blok, sira) => {
          const acikMi = acik === sira;
          const etiket = BLOK_TURLERI.find((t) => t.tip === blok.tip)?.etiket ?? blok.tip;

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
                  <span className="etiket-mono w-6 shrink-0 text-metin-soluk tabular-nums">
                    {String(sira + 1).padStart(2, '0')}
                  </span>
                  <span className="etiket-mono shrink-0 text-vurgu-parlak">{etiket}</span>
                  <span className="min-w-0 truncate text-xs text-metin-soluk">
                    {blokOzeti(blok)}
                  </span>
                </button>

                <span className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => tasi(sira, -1)}
                    disabled={sira === 0}
                    className={KUCUK_DUGME}
                    aria-label="Yukarı taşı"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => tasi(sira, 1)}
                    disabled={sira === bloklar.length - 1}
                    className={KUCUK_DUGME}
                    aria-label="Aşağı taşı"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => sil(sira)}
                    className="grid size-7 place-items-center rounded-md border border-kenar text-metin-soluk transition-colors hover:border-tehlike hover:text-tehlike"
                    aria-label="Bloğu sil"
                  >
                    <Kapat className="size-3.5" />
                  </button>
                </span>
              </div>

              {acikMi && (
                <div className="space-y-2.5 border-t border-kenar-soluk px-3 py-3">
                  <BlokAlanlari blok={blok} degistir={(yeni) => guncelle(sira, yeni)} />
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {/* Blok ekleme */}
      <div className="flex flex-wrap gap-1.5 border-t border-kenar-soluk pt-3">
        {BLOK_TURLERI.map((tur) => (
          <button
            key={tur.tip}
            type="button"
            onClick={() => ekle(tur.tip)}
            className="rounded-full border border-kenar px-2.5 py-1 text-[0.75rem] text-metin-ikincil transition-colors hover:border-vurgu hover:text-metin"
          >
            + {tur.etiket}
          </button>
        ))}
      </div>
    </div>
  );
}

/* --- BLOK TİPİNE GÖRE ALANLAR -------------------------------------------- */

function BlokAlanlari({ blok, degistir }: { blok: Blok; degistir: (yeni: Blok) => void }) {
  switch (blok.tip) {
    case 'paragraf':
    case 'kisa-cevap':
      return (
        <textarea
          value={blok.metin}
          onChange={(o) => degistir({ ...blok, metin: o.target.value })}
          rows={blok.tip === 'kisa-cevap' ? 3 : 5}
          placeholder={
            blok.tip === 'kisa-cevap' ? 'Tek cümlelik, alıntılanabilir cevap…' : 'Paragraf metni…'
          }
          className={ALAN}
        />
      );

    case 'altbaslik':
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            value={blok.metin}
            onChange={(o) =>
              degistir({
                ...blok,
                metin: o.target.value,
                // Kimlik elle değiştirilmediyse başlıktan türetilir.
                kimlik:
                  blok.kimlik && blok.kimlik !== kimlikUret(blok.metin)
                    ? blok.kimlik
                    : kimlikUret(o.target.value),
              })
            }
            placeholder="Alt başlık"
            className={ALAN}
          />
          <input
            value={blok.kimlik}
            onChange={(o) => degistir({ ...blok, kimlik: o.target.value })}
            placeholder="bagalanti-kimligi"
            className={`${ALAN} font-mono text-xs`}
          />
        </div>
      );

    case 'liste':
      return (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs text-metin-ikincil">
            <input
              type="checkbox"
              checked={Boolean(blok.sirali)}
              onChange={(o) => degistir({ ...blok, sirali: o.target.checked })}
              className="size-3.5 accent-[var(--vurgu)]"
            />
            Sıralı liste (1, 2, 3…)
          </label>
          <textarea
            value={blok.ogeler.join('\n')}
            onChange={(o) => degistir({ ...blok, ogeler: o.target.value.split('\n') })}
            rows={Math.max(3, blok.ogeler.length + 1)}
            placeholder="Her satır bir madde"
            className={ALAN}
          />
          <p className="text-xs text-metin-soluk">Her satır bir madde olur.</p>
        </div>
      );

    case 'tablo':
      return <TabloAlani blok={blok} degistir={degistir} />;

    case 'akis':
      return (
        <div className="space-y-2">
          {blok.adimlar.map((adim, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[10rem_1fr]">
              <input
                value={adim.ad}
                onChange={(o) =>
                  degistir({
                    ...blok,
                    adimlar: blok.adimlar.map((a, j) =>
                      j === i ? { ...a, ad: o.target.value } : a,
                    ),
                  })
                }
                placeholder="Adım adı"
                className={ALAN}
              />
              <span className="flex gap-2">
                <input
                  value={adim.aciklama}
                  onChange={(o) =>
                    degistir({
                      ...blok,
                      adimlar: blok.adimlar.map((a, j) =>
                        j === i ? { ...a, aciklama: o.target.value } : a,
                      ),
                    })
                  }
                  placeholder="Açıklama"
                  className={ALAN}
                />
                <button
                  type="button"
                  onClick={() =>
                    degistir({ ...blok, adimlar: blok.adimlar.filter((_, j) => j !== i) })
                  }
                  className={KUCUK_DUGME}
                  aria-label="Adımı sil"
                >
                  ×
                </button>
              </span>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              degistir({ ...blok, adimlar: [...blok.adimlar, { ad: '', aciklama: '' }] })
            }
            className={KUCUK_DUGME}
          >
            + adım
          </button>
        </div>
      );

    case 'uyari':
      return (
        <div className="space-y-2">
          <select
            value={blok.ton}
            onChange={(o) => degistir({ ...blok, ton: o.target.value as 'bilgi' | 'dikkat' })}
            className={ALAN}
          >
            <option value="bilgi">Bilgi (mavi)</option>
            <option value="dikkat">Dikkat (sarı)</option>
          </select>
          <textarea
            value={blok.metin}
            onChange={(o) => degistir({ ...blok, metin: o.target.value })}
            rows={3}
            placeholder="Uyarı metni"
            className={ALAN}
          />
        </div>
      );

    case 'alinti':
      return (
        <div className="space-y-2">
          <textarea
            value={blok.metin}
            onChange={(o) => degistir({ ...blok, metin: o.target.value })}
            rows={3}
            placeholder="Alıntı"
            className={ALAN}
          />
          <input
            value={blok.kaynak ?? ''}
            onChange={(o) => degistir({ ...blok, kaynak: o.target.value })}
            placeholder="Kaynak (opsiyonel)"
            className={ALAN}
          />
        </div>
      );

    case 'kod':
      return (
        <div className="space-y-2">
          <input
            value={blok.dil}
            onChange={(o) => degistir({ ...blok, dil: o.target.value })}
            placeholder="dil (json, python, text…)"
            className={`${ALAN} font-mono text-xs`}
          />
          <textarea
            value={blok.metin}
            onChange={(o) => degistir({ ...blok, metin: o.target.value })}
            rows={8}
            spellCheck={false}
            placeholder="Kod"
            className={`${ALAN} font-mono text-xs`}
          />
        </div>
      );

    default:
      return null;
  }
}

function TabloAlani({
  blok,
  degistir,
}: {
  blok: Extract<Blok, { tip: 'tablo' }>;
  degistir: (yeni: Blok) => void;
}) {
  const kolonSayisi = blok.basliklar.length;

  function kolonEkle() {
    degistir({
      ...blok,
      basliklar: [...blok.basliklar, ''],
      satirlar: blok.satirlar.map((s) => [...s, '']),
    });
  }

  function kolonSil(index: number) {
    if (kolonSayisi <= 1) return;
    degistir({
      ...blok,
      basliklar: blok.basliklar.filter((_, i) => i !== index),
      satirlar: blok.satirlar.map((s) => s.filter((_, i) => i !== index)),
    });
  }

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              {blok.basliklar.map((baslik, i) => (
                <th key={i} className="p-1">
                  <span className="flex items-center gap-1">
                    <input
                      value={baslik}
                      onChange={(o) =>
                        degistir({
                          ...blok,
                          basliklar: blok.basliklar.map((b, j) => (j === i ? o.target.value : b)),
                        })
                      }
                      placeholder={`Kolon ${i + 1}`}
                      className={`${ALAN} py-1 text-xs font-semibold`}
                    />
                    <button
                      type="button"
                      onClick={() => kolonSil(i)}
                      className={KUCUK_DUGME}
                      aria-label="Kolonu sil"
                    >
                      ×
                    </button>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {blok.satirlar.map((satir, si) => (
              <tr key={si}>
                {satir.map((hucre, hi) => (
                  <td key={hi} className="p-1">
                    <input
                      value={hucre}
                      onChange={(o) =>
                        degistir({
                          ...blok,
                          satirlar: blok.satirlar.map((s, j) =>
                            j === si ? s.map((h, k) => (k === hi ? o.target.value : h)) : s,
                          ),
                        })
                      }
                      className={`${ALAN} py-1 text-xs`}
                    />
                  </td>
                ))}
                <td className="p-1">
                  <button
                    type="button"
                    onClick={() =>
                      degistir({
                        ...blok,
                        satirlar: blok.satirlar.filter((_, j) => j !== si),
                      })
                    }
                    className={KUCUK_DUGME}
                    aria-label="Satırı sil"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() =>
            degistir({
              ...blok,
              satirlar: [...blok.satirlar, Array.from({ length: kolonSayisi }, () => '')],
            })
          }
          className={KUCUK_DUGME}
        >
          + satır
        </button>
        <button type="button" onClick={kolonEkle} className={KUCUK_DUGME}>
          + kolon
        </button>
      </div>

      <input
        value={blok.aciklama ?? ''}
        onChange={(o) => degistir({ ...blok, aciklama: o.target.value })}
        placeholder="Tablo altı açıklaması — örnek veriyse burada belirtin"
        className={ALAN}
      />
      <p className="flex items-start gap-1.5 text-xs text-uyari">
        <Ok className="mt-0.5 size-3 shrink-0" />
        Sayısal karşılaştırma ölçüm değilse açıklamada &quot;temsilî&quot; olduğunu yazın
        (MASTER-PLAN §59).
      </p>
    </div>
  );
}
