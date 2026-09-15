'use client';

import { useMemo, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Ara, Kapat, Onay } from '@/components/arayuz/Ikonlar';
import {
  KATEGORI_ADI,
  KATEGORI_SIRASI,
  MODALITE_ADI,
  anahtar,
  sayi,
  type ModelKategorisi,
} from '@/lib/modeller/siniflandirma';
import type { KiyasDizinKaydi } from '@/lib/modeller/kiyas';

/**
 * Karşılaştırma seçicisi.
 *
 * SEÇİM İSTEMCİDE TUTULMAZ, URL'DE TUTULUR. Eski sürüm `useState` ile 340
 * düğmeyi yönetiyordu; bu, kurulan bir karşılaştırmanın paylaşılamaması,
 * yer imine eklenememesi ve geri tuşuyla dönülememesi demekti. Artık her
 * seçim `?m=` parametresini değiştirir, tabloyu sunucu render eder.
 *
 * İSTEMCİDE KALAN TEK DURUM arama kutusu ve süzgeçlerdir: bunlar kişiye ve
 * o âna ait, paylaşılmasının anlamı olmayan tercihlerdir.
 *
 * ARAMADA TÜRKÇE: `anahtar()` hem sorguyu hem kaydı ASCII'ye indirir, böylece
 * "gorsel" yazan da "görsel" yazan da aynı sonucu bulur ve `İ`/`ı` çiftinde
 * yerel ayara bağlı bir kayma olmaz.
 */

const GORUNUR_SINIR = 48;

type Props = {
  dizin: KiyasDizinKaydi[];
  secili: readonly string[];
  enCok: number;
  /** Seçim değişince korunacak diğer parametreler (ör. iş yükü senaryosu). */
  isYuku: string;
};

export function KiyasSecici({ dizin, secili, enCok, isYuku }: Props) {
  const yonlendirici = useRouter();
  const yol = usePathname();
  const [bekliyor, baslat] = useTransition();

  const [sorgu, setSorgu] = useState('');
  const [kategori, setKategori] = useState<ModelKategorisi | 'tumu'>('tumu');
  const [saglayici, setSaglayici] = useState('tumu');
  const [yalnizAcik, setYalnizAcik] = useState(false);
  const [yalnizFiyatli, setYalnizFiyatli] = useState(false);

  const saglayicilar = useMemo(
    () => [...new Set(dizin.map((k) => k.saglayici))].sort((a, b) => a.localeCompare(b, 'tr')),
    [dizin],
  );

  /** Ad ve sağlayıcı üzerinde ASCII katlanmış arama anahtarı — kayıt başına bir kez. */
  const aranabilir = useMemo(
    () => dizin.map((kayit) => ({ kayit, metin: anahtar(`${kayit.ad} ${kayit.saglayici}`) })),
    [dizin],
  );

  const eslesen = useMemo(() => {
    const a = anahtar(sorgu);
    return aranabilir
      .filter(({ kayit, metin }) => {
        if (a && !metin.includes(a)) return false;
        if (kategori !== 'tumu' && kayit.kategori !== kategori) return false;
        if (saglayici !== 'tumu' && kayit.saglayici !== saglayici) return false;
        // Bilinmeyen ağırlık durumu (`null`) "açık" sayılmaz — uydurma olurdu.
        if (yalnizAcik && kayit.acikAgirlik !== true) return false;
        if (yalnizFiyatli && kayit.girdiFiyat == null) return false;
        return true;
      })
      .map(({ kayit }) => kayit);
  }, [aranabilir, sorgu, kategori, saglayici, yalnizAcik, yalnizFiyatli]);

  const seciliKayitlar = useMemo(
    () =>
      secili
        .map((slug) => dizin.find((k) => k.slug === slug))
        .filter((k): k is KiyasDizinKaydi => Boolean(k)),
    [secili, dizin],
  );

  function git(yeni: readonly string[]) {
    const parametre = new URLSearchParams();
    if (yeni.length) parametre.set('m', yeni.join(','));
    if (isYuku) parametre.set('is', isYuku);
    baslat(() => {
      yonlendirici.replace(`${yol}?${parametre.toString()}`, { scroll: false });
    });
  }

  function degistir(slug: string) {
    if (secili.includes(slug)) {
      git(secili.filter((s) => s !== slug));
      return;
    }
    // Sınıra gelindiğinde EN ESKİ seçim düşer: kullanıcı bir şey seçince
    // hiçbir şey olmaması, sessizce yok sayılmaktan daha kafa karıştırıcı.
    git(secili.length >= enCok ? [...secili.slice(1), slug] : [...secili, slug]);
  }

  const suzgecAcik =
    Boolean(sorgu) || kategori !== 'tumu' || saglayici !== 'tumu' || yalnizAcik || yalnizFiyatli;

  return (
    <div
      className={`rounded-2xl border border-kenar bg-yuzey/40 transition-opacity ${bekliyor ? 'opacity-60' : ''}`}
    >
      {/* Seçili şerit */}
      <div className="flex flex-wrap items-center gap-2 border-b border-kenar-soluk p-5">
        <span className="etiket-mono mr-1 text-metin-soluk">
          {seciliKayitlar.length}/{enCok} seçili
        </span>
        {seciliKayitlar.map((kayit) => (
          <button
            key={kayit.slug}
            type="button"
            onClick={() => degistir(kayit.slug)}
            className="group inline-flex items-center gap-2 rounded-full border border-vurgu/50 bg-vurgu-zemin py-1.5 pr-2.5 pl-3.5 text-[0.8125rem] font-medium text-vurgu-parlak transition-colors hover:border-tehlike/60"
          >
            {kayit.ad}
            <Kapat className="size-3.5 text-vurgu-sonuk transition-colors group-hover:text-tehlike" />
            <span className="sr-only">karşılaştırmadan çıkar</span>
          </button>
        ))}
        {seciliKayitlar.length === 0 && (
          <span className="text-[0.8125rem] text-metin-soluk">Aşağıdan en az iki model seçin.</span>
        )}
      </div>

      {/* Süzgeçler */}
      <div className="space-y-4 border-b border-kenar-soluk p-5">
        <label className="relative block">
          <span className="sr-only">Model ara</span>
          <Ara className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-metin-soluk" />
          <input
            type="search"
            value={sorgu}
            onChange={(olay) => setSorgu(olay.target.value)}
            placeholder="Model veya sağlayıcı ara — Fable, Qwen, Mistral…"
            className="h-11 w-full rounded-full border border-kenar bg-zemin pr-4 pl-11 text-[0.875rem] text-metin transition-colors outline-none placeholder:text-metin-soluk focus-visible:border-vurgu"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <SuzgecDugmesi
            etkin={kategori === 'tumu'}
            onClick={() => setKategori('tumu')}
            etiket="Tüm türler"
          />
          {KATEGORI_SIRASI.map((k) => (
            <SuzgecDugmesi
              key={k}
              etkin={kategori === k}
              onClick={() => setKategori(k)}
              etiket={KATEGORI_ADI[k]}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2">
            <span className="etiket-mono text-metin-soluk">Sağlayıcı</span>
            <select
              value={saglayici}
              onChange={(olay) => setSaglayici(olay.target.value)}
              className="h-9 rounded-full border border-kenar bg-zemin px-3.5 text-[0.8125rem] text-metin outline-none focus-visible:border-vurgu"
            >
              <option value="tumu">Tümü ({saglayicilar.length})</option>
              {saglayicilar.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <SuzgecDugmesi
            etkin={yalnizAcik}
            onClick={() => setYalnizAcik((o) => !o)}
            etiket="Açık ağırlık"
          />
          <SuzgecDugmesi
            etkin={yalnizFiyatli}
            onClick={() => setYalnizFiyatli((o) => !o)}
            etiket="Token tarifesi yayımlı"
          />

          {suzgecAcik && (
            <button
              type="button"
              onClick={() => {
                setSorgu('');
                setKategori('tumu');
                setSaglayici('tumu');
                setYalnizAcik(false);
                setYalnizFiyatli(false);
              }}
              className="text-[0.8125rem] text-metin-soluk underline underline-offset-4 transition-colors hover:text-metin"
            >
              Süzgeçleri temizle
            </button>
          )}
        </div>
      </div>

      {/* Sonuçlar */}
      <div className="p-5">
        <p className="etiket-mono mb-3 text-metin-soluk">
          {eslesen.length} model eşleşiyor
          {eslesen.length > GORUNUR_SINIR && ` · ilk ${GORUNUR_SINIR} gösteriliyor`}
        </p>

        {eslesen.length === 0 ? (
          <p className="rounded-xl border border-dashed border-kenar-guclu px-5 py-8 text-center text-[0.875rem] text-metin-ikincil">
            Bu süzgeçlerle eşleşen model yok. Aramayı kısaltmayı veya sağlayıcı süzgecini kaldırmayı
            deneyin.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {eslesen.slice(0, GORUNUR_SINIR).map((kayit) => {
              const isaretli = secili.includes(kayit.slug);
              return (
                <li key={kayit.slug}>
                  <button
                    type="button"
                    aria-pressed={isaretli}
                    onClick={() => degistir(kayit.slug)}
                    className={`inline-flex max-w-full items-center gap-2 rounded-full border px-3.5 py-2 text-left text-[0.8125rem] transition-[border-color,background-color,color] duration-200 ${
                      isaretli
                        ? 'border-vurgu/50 bg-vurgu-zemin text-vurgu-parlak'
                        : 'border-kenar bg-zemin/50 text-metin-ikincil hover:border-kenar-guclu hover:text-metin'
                    }`}
                  >
                    {isaretli && <Onay className="size-3.5 shrink-0" />}
                    <span className="truncate font-medium">{kayit.ad}</span>
                    <span className="etiket-mono shrink-0 text-metin-soluk">{kayit.saglayici}</span>
                    {kayit.girdiFiyat != null && (
                      <span className="etiket-mono shrink-0 text-ikincil">
                        {sayi(kayit.girdiFiyat)} {kayit.paraBirimi}
                      </span>
                    )}
                    {kayit.modaliteler.length > 1 && (
                      <span className="etiket-mono hidden shrink-0 text-metin-soluk sm:inline">
                        {kayit.modaliteler.map((m) => MODALITE_ADI[m]).join('·')}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function SuzgecDugmesi({
  etkin,
  onClick,
  etiket,
}: {
  etkin: boolean;
  onClick: () => void;
  etiket: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={etkin}
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-[0.8125rem] font-medium transition-[border-color,background-color,color] duration-200 ${
        etkin
          ? 'border-vurgu/50 bg-vurgu-zemin text-vurgu-parlak'
          : 'border-kenar bg-zemin/50 text-metin-soluk hover:border-kenar-guclu hover:text-metin'
      }`}
    >
      {etiket}
    </button>
  );
}
