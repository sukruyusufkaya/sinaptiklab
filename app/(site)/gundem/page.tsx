import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { FiltreSeridi } from '@/components/arayuz/Filtreler';
import { Rozet } from '@/components/arayuz/Rozet';
import { Dugme } from '@/components/arayuz/Dugme';
import { Ok, Saat } from '@/components/arayuz/Ikonlar';
import { SinyalAgi } from '@/components/gorsel/SinyalAgi';
import { ListeSemasi } from '@/lib/seo/jsonld';
import {
  briefArsivi,
  GUNDEM_KATEGORILERI,
  konuyaGoreGundem,
  manset,
  tumGundem,
} from '@/lib/icerik/gundem';
import { TUR_ADI } from '@/lib/taksonomi';
import { tarihKisa, tarihUzun } from '@/lib/bicim';

export const metadata: Metadata = {
  title: 'Gündem — Yapay Zekâ Haberleri',
  description:
    'Yapay zekâ dünyasında bugün ne oluyor? Her haber "peki bunun anlamı ne?" sorusuna cevap verir: ne oldu, neden önemli, kimleri etkiliyor.',
  alternates: { canonical: '/gundem/' },
};

export default async function GundemSayfasi() {
  const TUM_GUNDEM = await tumGundem();
  const BRIEF_SAYISI = (await briefArsivi()).length;
  // Manşet öne çıkarılmış kayıttır; hiçbir kayıt öne çıkarılmamışsa yoktur.
  const MANSET = await manset();
  const sirali = [...TUM_GUNDEM].sort((a, b) => b.yayinTarihi.localeCompare(a.yayinTarihi));
  const [ilk, ...digerleri] = sirali;
  if (!ilk) return null;

  // Filtre şeridi ve kategori kartlarındaki sayılar JSX içinde beklenemez.
  const kategoriAdetleri = new Map(
    await Promise.all(
      GUNDEM_KATEGORILERI.map(
        async (kategori) =>
          [kategori.slug, (await konuyaGoreGundem(kategori.slug)).length] as const,
      ),
    ),
  );
  const kategoriAdedi = (slug: string) => kategoriAdetleri.get(slug) ?? 0;

  return (
    <>
      <ListeSemasi
        ad="Gündem akışı"
        ogeler={sirali.map((icerik) => ({ ad: icerik.baslik, yol: icerik.yol }))}
      />

      <SayfaBasligi
        kirintilar={[{ ad: 'Gündem', yol: '/gundem/' }]}
        etiket="DISCOVER"
        baslik="Bugünün AI gündemi"
        ozet="Yabancı haberin çevirisi değil, bağlamı. Her haber şu şablonla yazılır: ne oldu, neden önemli, teknik detay, kimleri etkiliyor, Sinaptik yorumu."
        olcumler={[
          { deger: `${sirali.length}`, etiket: 'Yayında' },
          { deger: `${GUNDEM_KATEGORILERI.length}`, etiket: 'Kategori' },
          // Sıklık vaadi yerine sayılabilen değer (bkz. `/brief/` sayfası notu).
          { deger: `${BRIEF_SAYISI}`, etiket: 'Brief sayısı' },
          { deger: tarihKisa(ilk.yayinTarihi), etiket: 'Son güncelleme' },
        ]}
        eylemler={
          <>
            <Dugme href="/brief/">
              Sinaptik Brief
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/radar/" gorunum="ikincil">
              AI Radar
            </Dugme>
          </>
        }
      />

      <Bolum>
        <div className="mb-9">
          <FiltreSeridi
            etiket="Gündem kategorileri"
            aktifYol="/gundem/"
            ogeler={[
              { ad: 'Tümü', yol: '/gundem/' },
              ...GUNDEM_KATEGORILERI.map((kategori) => ({
                ad: kategori.ad,
                yol: kategori.yol,
                adet: kategoriAdedi(kategori.slug),
              })),
            ]}
          />
        </div>

        {/* --- Manşet --- */}
        {MANSET && (
          <article className="group relative mb-12 overflow-hidden rounded-2xl border border-kenar bg-yuzey/40 transition-colors duration-300 hover:border-vurgu/45 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div className="relative min-h-52 overflow-hidden border-b border-kenar bg-zemin-derin lg:border-r lg:border-b-0">
              <div className="izgara-zemin absolute inset-0 opacity-50" aria-hidden="true" />
              <div className="absolute -right-12 -bottom-16 h-56 w-56 rounded-full bg-vurgu/22 blur-[80px]" />
              <SinyalAgi className="absolute inset-0 size-full opacity-80" />
              <div className="relative flex h-full items-end p-6">
                <Rozet ton="vurgu">{MANSET.konu.ad}</Rozet>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-metin-soluk">
                <span className="etiket-mono text-vurgu-parlak">{TUR_ADI[MANSET.tur]}</span>
                <span className="size-1 rounded-full bg-kenar-guclu" aria-hidden="true" />
                <time dateTime={MANSET.yayinTarihi}>{tarihUzun(MANSET.yayinTarihi)}</time>
                <span className="size-1 rounded-full bg-kenar-guclu" aria-hidden="true" />
                <span className="inline-flex items-center gap-1">
                  <Saat className="size-3.5" />
                  {MANSET.okumaDakika} dk
                </span>
              </div>

              <h2 className="mt-4 text-xl leading-[1.16] font-semibold tracking-tight text-balance sm:text-2xl">
                <Link href={MANSET.yol} className="before:absolute before:inset-0">
                  {MANSET.baslik}
                </Link>
              </h2>

              <p className="mt-4 border-l-2 border-vurgu/50 pl-4 text-[0.9375rem] leading-relaxed text-metin-ikincil">
                {MANSET.kisaCevap}
              </p>

              <div className="mt-6 flex items-center gap-2.5 border-t border-kenar-soluk pt-4">
                <span className="etiket-mono grid size-8 place-items-center rounded-full border border-kenar bg-yuzey-2 text-metin-ikincil">
                  {MANSET.yazar.basHarfler}
                </span>
                <span className="text-xs">
                  <span className="block font-medium text-metin">{MANSET.yazar.ad}</span>
                  <span className="block text-metin-soluk">{MANSET.yazar.unvan}</span>
                </span>
              </div>
            </div>
          </article>
        )}

        {/* --- Akış --- */}
        <BolumBasligi numara="01" etiket="AKIŞ" baslik="Son gelişmeler" />

        <ul className="divide-y divide-kenar-soluk border-y border-kenar-soluk">
          {digerleri.map((icerik) => (
            <li key={icerik.slug} className="group relative">
              <Link href={icerik.yol} className="flex flex-col gap-2 py-5 sm:flex-row sm:gap-6">
                <span className="flex shrink-0 items-center gap-3 sm:w-40 sm:flex-col sm:items-start sm:gap-1.5">
                  <span className="etiket-mono text-metin-soluk">
                    {tarihKisa(icerik.yayinTarihi)}
                  </span>
                  <span className="etiket-mono text-vurgu-parlak">{TUR_ADI[icerik.tur]}</span>
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-[1.0625rem] leading-snug font-medium tracking-tight text-metin transition-colors group-hover:text-vurgu-parlak">
                    {icerik.baslik}
                  </span>
                  <span className="mt-2 block text-[0.875rem] leading-relaxed text-metin-ikincil">
                    {icerik.kisaCevap}
                  </span>
                  <span className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-metin-soluk">
                    <span className="etiket-mono">{icerik.konu.ad}</span>
                    <span className="inline-flex items-center gap-1">
                      <Saat className="size-3.5" />
                      {icerik.okumaDakika} dk
                    </span>
                  </span>
                </span>

                <Ok className="mt-1 hidden size-5 shrink-0 self-center text-metin-soluk transition-transform duration-200 ease-sinaptik group-hover:translate-x-1 group-hover:text-vurgu-parlak sm:block" />
              </Link>
            </li>
          ))}
        </ul>
      </Bolum>

      {/* --- Kategoriler --- */}
      <Bolum zemin="derin">
        <BolumBasligi
          numara="02"
          etiket="KATEGORİLER"
          baslik="Konuya göre gündem"
          aciklama="Kategoriler küratörlü hub'lardır; filtre kombinasyonları indekslenmez."
        />
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-3">
          {GUNDEM_KATEGORILERI.map((kategori) => (
            <li key={kategori.slug}>
              <Link
                href={kategori.yol}
                className="group flex h-full flex-col bg-zemin p-5 transition-colors hover:bg-yuzey/60"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="text-[0.9375rem] font-medium text-metin group-hover:text-vurgu-parlak">
                    {kategori.ad}
                  </span>
                  <span className="etiket-mono shrink-0 text-metin-soluk tabular-nums">
                    {kategoriAdedi(kategori.slug)}
                  </span>
                </span>
                <span className="mt-2 text-xs leading-relaxed text-metin-soluk">
                  {kategori.ozet}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Bolum>
    </>
  );
}
