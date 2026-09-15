import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { Grafik, Ok } from '@/components/arayuz/Ikonlar';
import { CokYakinda } from '@/components/arayuz/CokYakinda';
import { ListeSemasi } from '@/lib/seo/jsonld';
import { arastirmaListesi, ARASTIRMA_TURLERI } from '@/lib/icerik/arastirma';
import { tarihUzun } from '@/lib/bicim';

export const metadata: Metadata = {
  title: 'Araştırma — Raporlar, Benchmarklar, Veri Setleri',
  description:
    'Özgün araştırma, açık metodoloji ve atıf formatıyla yayımlanan veri setleri. Benchmark ve raporlar ticari müşterilerden bağımsız yürütülür.',
  alternates: { canonical: '/arastirma/' },
};

const TUR_TONU: Record<string, string> = {
  Rapor: 'text-vurgu-parlak',
  Benchmark: 'text-ikincil',
  'Veri Seti': 'text-sinyal',
  Index: 'text-uyari',
  Whitepaper: 'text-metin-ikincil',
  Not: 'text-metin-soluk',
};

export default async function ArastirmaSayfasi() {
  const ARASTIRMA = await arastirmaListesi();
  const sirali = [...ARASTIRMA].sort((a, b) => b.tarih.localeCompare(a.tarih));
  const amiral = ARASTIRMA.find((yayin) => yayin.slug === 'state-of-ai-turkiye');

  return (
    <>
      <ListeSemasi
        ad="Sinaptik Research yayınları"
        ogeler={ARASTIRMA.map((yayin) => ({
          ad: yayin.baslik,
          yol: `/arastirma/${yayin.slug}/`,
        }))}
      />

      <SayfaBasligi
        kirintilar={[{ ad: 'Araştırma', yol: '/arastirma/' }]}
        etiket="RESEARCH"
        baslik="Başkalarının kaynak göstermek zorunda kalacağı veri"
        ozet="Sinaptik Research; saha araştırmaları, açık metodolojili benchmarklar ve lisanslı veri setleri üretir. Her yayının sınırlılık bölümü vardır."
        olcumler={[
          { deger: `${ARASTIRMA.length}`, etiket: 'Yayın' },
          { deger: `${ARASTIRMA_TURLERI.length}`, etiket: 'Yayın türü' },
          { deger: 'Açık', etiket: 'Metodoloji' },
          { deger: 'Bağımsız', etiket: 'Yürütme' },
        ]}
        eylemler={
          <Dugme href="/metodoloji/">
            Metodoloji ilkeleri
            <Ok className="size-4" />
          </Dugme>
        }
      />

      {/* --- Amiral gemisi --- */}
      {amiral && (
        <Bolum>
          <Link
            href={`/arastirma/${amiral.slug}/`}
            className="group relative block overflow-hidden rounded-3xl border border-kenar bg-zemin-derin p-6 transition-colors duration-300 hover:border-vurgu/45 sm:p-10"
          >
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              <div className="izgara-zemin absolute inset-0 opacity-45" />
              <div className="absolute -top-24 right-1/4 h-64 w-96 rounded-full bg-vurgu/16 blur-[100px]" />
            </div>

            <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)]">
              <div>
                <span className="etiket-mono text-vurgu-parlak">AMİRAL GEMİSİ RAPOR</span>
                <h2 className="mt-4 max-w-xl text-2xl leading-[1.12] font-semibold tracking-tight text-balance sm:text-[2rem]">
                  {amiral.baslik}
                </h2>
                <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-metin-ikincil">
                  {amiral.ozet}
                </p>
                <span className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-vurgu-parlak">
                  Raporu incele
                  <Ok className="size-4 transition-transform duration-200 ease-sinaptik group-hover:translate-x-1" />
                </span>
              </div>

              {amiral.kapsam && (
                <dl className="grid grid-cols-2 gap-px self-start overflow-hidden rounded-xl border border-kenar bg-kenar">
                  {amiral.kapsam.map((satir) => (
                    <div key={satir.etiket} className="bg-zemin px-4 py-3.5">
                      <dt className="etiket-mono text-metin-soluk">{satir.etiket}</dt>
                      <dd className="mt-1.5 text-sm text-metin">{satir.deger}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </Link>
        </Bolum>
      )}

      {/* --- Türler --- */}
      <Bolum zemin="derin">
        <BolumBasligi numara="01" etiket="TÜRLER" baslik="Yayın türleri" />
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-3">
          {ARASTIRMA_TURLERI.map((tur) => {
            const adet = ARASTIRMA.filter((yayin) => yayin.tur === tur.tur).length;
            return (
              <li key={tur.slug}>
                <Link
                  href={`/arastirma/${tur.slug}/`}
                  className="group flex h-full flex-col bg-zemin p-6 transition-colors hover:bg-yuzey/60"
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-[0.9375rem] font-medium text-metin group-hover:text-vurgu-parlak">
                      {tur.ad}
                    </span>
                    <span className="etiket-mono shrink-0 text-metin-soluk tabular-nums">
                      {adet}
                    </span>
                  </span>
                  <span className="mt-2 text-xs leading-relaxed text-metin-soluk">{tur.ozet}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Bolum>

      {/* --- Tüm yayınlar --- */}
      <Bolum>
        <BolumBasligi numara="02" etiket="YAYINLAR" baslik="Tüm yayınlar" />

        {/*
          Liste boşken sayfa BOŞ GÖSTERİLMEZ, hazırlanıyor gösterilir.
          İkisi arasındaki fark okur açısından belirleyici: boş bir arşiv
          "burada bir şey yok" der, hazırlanan bir arşiv "burada şu olacak" der
          ve bir bekleme yolu verir.
        */}
        {sirali.length === 0 && (
          <CokYakinda
            baslik="Sinaptik Research yayınları hazırlanıyor"
            metin="Bu bölüm, başkalarının kaynak göstermek zorunda kalacağı veriyi üretmek için kuruluyor: saha araştırmaları, açık metodolojili benchmarklar ve yeniden kullanılabilir lisansla yayımlanan veri setleri."
            kapsam={[
              'Yöntemin baştan sona yazıldığı metodoloji bölümü',
              'Örneklem büyüklüğü, toplama tarihi ve kapsam sınırları',
              'Neyin ölçülmediğini açıkça söyleyen sınırlılıklar bölümü',
              'Atıf formatı ve yeniden kullanım lisansı',
              'Türkçe dil modeli değerlendirmeleri için açık test setleri',
              'Yıllık Türkiye durum raporu',
            ]}
            notlar={[
              'Çalışmalar ticari müşterilerden bağımsız yürütülür; sponsorlu içerik açıkça işaretlenir.',
              'Metodolojisi yayımlanmamış hiçbir sayı yayımlanmaz.',
            ]}
          />
        )}

        <ul className="space-y-4">
          {sirali.map((yayin) => (
            <li key={yayin.slug}>
              <Link
                href={`/arastirma/${yayin.slug}/`}
                className="group relative flex gap-6 rounded-2xl border border-kenar bg-yuzey/40 p-6 transition-[border-color,background-color] duration-300 hover:border-ikincil/45 hover:bg-yuzey/70"
              >
                <span className="hidden w-24 shrink-0 flex-col justify-between border-r border-kenar-soluk pr-6 sm:flex">
                  <Grafik className="size-5 text-metin-soluk transition-colors group-hover:text-ikincil" />
                  <span>
                    <span className="block font-mono text-xl leading-none font-medium tracking-tight text-metin">
                      {yayin.veriNoktasi}
                    </span>
                    <span className="mt-1.5 block text-[0.6875rem] leading-tight text-metin-soluk">
                      {yayin.veriEtiketi}
                    </span>
                  </span>
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <span className={`etiket-mono ${TUR_TONU[yayin.tur] ?? 'text-metin-soluk'}`}>
                      {yayin.tur}
                    </span>
                    <span className="size-1 rounded-full bg-kenar-guclu" aria-hidden="true" />
                    <span className="etiket-mono text-metin-soluk">{tarihUzun(yayin.tarih)}</span>
                    {yayin.lisans && (
                      <>
                        <span className="size-1 rounded-full bg-kenar-guclu" aria-hidden="true" />
                        <span className="etiket-mono text-metin-soluk">{yayin.lisans}</span>
                      </>
                    )}
                  </span>

                  <span className="mt-2.5 block text-[1.0625rem] leading-snug font-semibold tracking-tight text-metin">
                    {yayin.baslik}
                  </span>
                  <span className="mt-2 block text-[0.875rem] leading-relaxed text-metin-ikincil">
                    {yayin.ozet}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-8 rounded-lg border border-kenar bg-yuzey/40 px-4 py-3 text-xs text-metin-soluk">
          Araştırma ve benchmark sonuçları danışmanlık müşterilerinden bağımsız yürütülür; sponsorlu
          içerikler açıkça işaretlenir.
        </p>
      </Bolum>
    </>
  );
}
