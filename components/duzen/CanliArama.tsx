'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Ara, Kapat, Ok } from '@/components/arayuz/Ikonlar';
import { AramaKaydi } from '@/components/form/AramaKaydi';
import {
  ARAMA_ONERILERI,
  puanla,
  sadelestir,
  type AramaGrubu,
  type AramaKaydi as AramaKaydiTipi,
} from '@/lib/arama';

const EN_COK = 40;

/**
 * /ara/ sayfasının canlı arama arayüzü.
 *
 * Komut paletiyle aynı dizini kullanır; fark, sonuçların gruplara göre
 * kırılabilmesi ve daha geniş bir sonuç listesi göstermesi.
 *
 * Sorgular `AramaKaydi` ile `arama_kayitlari` koleksiyonuna yazılır: sonuç
 * sayısını bilen tek yer burasıdır. Kayıt gecikmelidir ve hiçbir kişisel veri
 * göndermez (bkz. o bileşenin başlığı).
 */
/*
 * DİZİN ARTIK PROP: eskiden `aramaDizini()` çağrılıyordu ve o fonksiyon
 * `lib/veri/*` fixture'larından besleniyordu — 234 kayıt görüyordu, yayında
 * ~900 kayıt vardı. Dizin sunucuda veritabanından kurulur
 * (`lib/arama-dizini.ts`) ve buraya prop olarak iner.
 */
export function CanliArama({ dizin }: { dizin: AramaKaydiTipi[] }) {
  const [sorgu, setSorgu] = useState('');
  const [grup, setGrup] = useState<AramaGrubu | 'Tümü'>('Tümü');

  const tumSonuclar = useMemo(() => {
    const q = sadelestir(sorgu);
    if (!q) return [];
    return dizin
      .map((kayit) => ({ kayit, puan: puanla(kayit, q) }))
      .filter(({ puan }) => puan > 0)
      .sort((a, b) => b.puan - a.puan || a.kayit.ad.localeCompare(b.kayit.ad, 'tr'))
      .map(({ kayit }) => kayit);
  }, [sorgu, dizin]);

  const gruplar = useMemo(() => {
    const sayac = new Map<AramaGrubu, number>();
    for (const kayit of tumSonuclar) {
      sayac.set(kayit.grup, (sayac.get(kayit.grup) ?? 0) + 1);
    }
    return [...sayac.entries()].sort((a, b) => b[1] - a[1]);
  }, [tumSonuclar]);

  const sonuclar = useMemo(
    () =>
      (grup === 'Tümü' ? tumSonuclar : tumSonuclar.filter((kayit) => kayit.grup === grup)).slice(
        0,
        EN_COK,
      ),
    [tumSonuclar, grup],
  );

  return (
    <div className="space-y-6">
      {/* Girdi */}
      <div className="flex items-center gap-3 rounded-2xl border border-kenar bg-yuzey/50 px-5">
        <Ara className="size-5 shrink-0 text-metin-soluk" />
        <label htmlFor="arama-girdisi" className="yalniz-ekran-okuyucu">
          Arama
        </label>
        <input
          id="arama-girdisi"
          type="search"
          value={sorgu}
          onChange={(olay) => {
            setSorgu(olay.target.value);
            setGrup('Tümü');
          }}
          placeholder="Kavram, model, ders, haber, araştırma…"
          className="h-14 flex-1 bg-transparent text-base text-metin outline-none placeholder:text-metin-soluk"
        />
        {sorgu && (
          <button
            type="button"
            onClick={() => setSorgu('')}
            className="grid size-8 place-items-center rounded-full text-metin-soluk transition-colors hover:bg-yuzey-2 hover:text-metin"
            aria-label="Aramayı temizle"
          >
            <Kapat className="size-4" />
          </button>
        )}
      </div>

      {/* Öneriler */}
      {!sorgu && (
        <div className="rounded-2xl border border-kenar bg-yuzey/40 p-6">
          <p className="etiket-mono mb-3.5 text-metin-soluk">Öneriler</p>
          <div className="flex flex-wrap gap-2">
            {ARAMA_ONERILERI.map((oneri) => (
              <button
                key={oneri}
                type="button"
                onClick={() => setSorgu(oneri)}
                className="rounded-full border border-kenar bg-zemin/60 px-3.5 py-1.5 text-[0.8125rem] text-metin-ikincil transition-colors hover:border-vurgu hover:text-metin"
              >
                {oneri}
              </button>
            ))}
          </div>
          <p className="mt-5 text-xs leading-relaxed text-metin-soluk">
            Dizinde {dizin.length} kayıt var: kavramlar, konu merkezleri, rehberler, gündem,
            analizler, modeller, şirketler, araçlar, rotalar, dersler, testler, araştırma yayınları,
            dergi yazıları, podcast bölümleri, kurumsal hizmetler, sektörler, vakalar, Lab projeleri
            ve meslekler.
          </p>
        </div>
      )}

      {/* Grup filtreleri */}
      {sorgu && gruplar.length > 1 && (
        <nav aria-label="Sonuç grupları" className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setGrup('Tümü')}
            aria-pressed={grup === 'Tümü'}
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[0.8125rem] font-medium transition-colors ${
              grup === 'Tümü'
                ? 'border-vurgu/40 bg-vurgu-zemin text-vurgu-parlak'
                : 'border-kenar text-metin-ikincil hover:border-kenar-guclu hover:text-metin'
            }`}
          >
            Tümü
            <span className="etiket-mono text-metin-soluk tabular-nums">{tumSonuclar.length}</span>
          </button>

          {gruplar.map(([ad, adet]) => (
            <button
              key={ad}
              type="button"
              onClick={() => setGrup(ad)}
              aria-pressed={grup === ad}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[0.8125rem] font-medium transition-colors ${
                grup === ad
                  ? 'border-vurgu/40 bg-vurgu-zemin text-vurgu-parlak'
                  : 'border-kenar text-metin-ikincil hover:border-kenar-guclu hover:text-metin'
              }`}
            >
              {ad}
              <span className="etiket-mono text-metin-soluk tabular-nums">{adet}</span>
            </button>
          ))}
        </nav>
      )}

      {/* Sonuçlar */}
      {sorgu && (
        <div aria-live="polite">
          {sonuclar.length > 0 ? (
            <>
              <p className="etiket-mono mb-4 text-metin-soluk">
                {tumSonuclar.length} sonuç
                {grup !== 'Tümü' && ` · ${grup} filtresi`}
              </p>
              <ul className="divide-y divide-kenar-soluk overflow-hidden rounded-2xl border border-kenar">
                {sonuclar.map((sonuc) => (
                  <li key={`${sonuc.grup}-${sonuc.yol}-${sonuc.ad}`} className="group bg-yuzey/30">
                    <Link
                      href={sonuc.yol}
                      className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-yuzey/60"
                    >
                      <span className="etiket-mono w-20 shrink-0 text-metin-soluk">
                        {sonuc.grup}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.9375rem] font-medium text-metin group-hover:text-vurgu-parlak">
                          {sonuc.ad}
                        </span>
                        {sonuc.aciklama && (
                          <span className="block truncate text-xs text-metin-soluk">
                            {sonuc.aciklama}
                          </span>
                        )}
                      </span>
                      <Ok className="size-4 shrink-0 text-metin-soluk opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
              {tumSonuclar.length > sonuclar.length && grup === 'Tümü' && (
                <p className="mt-4 text-xs text-metin-soluk">
                  İlk {EN_COK} sonuç gösteriliyor. Daraltmak için yukarıdaki grup filtrelerini
                  kullanın.
                </p>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-kenar-guclu bg-zemin-derin/60 px-6 py-12 text-center">
              <p className="etiket-mono mb-3 text-metin-soluk">Sonuç yok</p>
              <p className="mx-auto max-w-md text-[0.9375rem] leading-relaxed text-metin-ikincil">
                <span className="font-medium text-metin">“{sorgu}”</span> için dizinde kayıt
                bulunamadı. Sonuç üretmeyen sorgular kaydedilir ve içerik açığı panosunda
                değerlendirilir.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {ARAMA_ONERILERI.slice(0, 4).map((oneri) => (
                  <button
                    key={oneri}
                    type="button"
                    onClick={() => setSorgu(oneri)}
                    className="rounded-full border border-kenar px-3.5 py-1.5 text-[0.8125rem] text-metin-ikincil transition-colors hover:border-vurgu hover:text-metin"
                  >
                    {oneri}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sessiz sorgu kaydı; hiçbir şey çizmez. */}
      <AramaKaydi
        sorgu={sorgu}
        sonucSayisi={tumSonuclar.length}
        ilkSonucYolu={tumSonuclar[0]?.yol}
      />
    </div>
  );
}
