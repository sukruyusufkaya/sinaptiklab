import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { CokYakinda } from '@/components/arayuz/CokYakinda';
import { Ok, Saat, Zarf } from '@/components/arayuz/Ikonlar';
import { ListeSemasi } from '@/lib/seo/jsonld';
import { koseYazilari, type KoseYazisi } from '@/lib/icerik/kose';
import { DERGI_BOLUMLERI, dergiBolumununYazilari } from '@/lib/icerik/yayin';
import { tarihUzun } from '@/lib/bicim';
import type { Yazar } from '@/lib/tipler';

const BOLUM = DERGI_BOLUMLERI.find((b) => b.slug === 'kose')!;

export const metadata: Metadata = {
  title: 'Köşe Yazıları',
  description:
    'Sinaptik Lab köşe yazıları: yapay zekâ üzerine imzalı, kaynaklı ve uzun soluklu görüş yazıları. Her rakam birincil kaynağına bağlı.',
  alternates: { canonical: '/dergi/kose/' },
};

/**
 * Köşe yazıları arşivi.
 *
 * İKİ KAYNAK: bağımsız görüş yazıları (`icerikler`, `tur: 'gorus'`) ve dergi
 * sayılarının içindeki "Görüş" bölümü yazıları. İkincisi bir sayıya aittir
 * ve kanonik adresi sayının altındadır; burada yalnızca listelenir, kopyası
 * açılmaz. Bugün dergi sayıları arşivde olduğu için ikinci liste boştur.
 *
 * Sayfa `[sayi]` dinamik segmentinin bölüm arşivini GÖLGELER: statik `kose`
 * klasörü dinamik segmentten önce eşleşir (bkz. `[sayi]/page.tsx`).
 */
export default async function KoseArsivi() {
  const [yazilar, sayiYazilari] = await Promise.all([
    koseYazilari(),
    dergiBolumununYazilari('kose'),
  ]);

  const [one, ...kalan] = yazilar;
  const yazarlar = yazarOzeti(yazilar);
  const toplamDakika = yazilar.reduce((t, y) => t + y.okumaDakika, 0);
  const bos = yazilar.length === 0 && sayiYazilari.length === 0;

  return (
    <>
      {yazilar.length > 0 && (
        <ListeSemasi
          ad="Sinaptik Lab köşe yazıları"
          ogeler={yazilar.map((yazi) => ({ ad: yazi.baslik, yol: yazi.yol }))}
        />
      )}

      <SayfaBasligi
        kirintilar={[
          { ad: 'Dergi', yol: '/dergi/' },
          { ad: BOLUM.ad, yol: '/dergi/kose/' },
        ]}
        etiket="MAGAZINE · KÖŞE"
        baslik={BOLUM.ad}
        ozet="Yapay zekâ üzerine imzalı, uzun soluklu görüş yazıları. Gündemin hızına kapılmadan yazılır; yazarının kişisel değerlendirmesini taşır ve kullandığı her rakamı kaynağına bağlar."
        olcumler={
          bos
            ? undefined
            : [
                { deger: `${yazilar.length + sayiYazilari.length}`, etiket: 'Yazı' },
                { deger: `${yazarlar.length}`, etiket: 'Yazar' },
                { deger: `${toplamDakika} dk`, etiket: 'Toplam okuma' },
              ]
        }
        eylemler={
          <Dugme href="/bulten/" gorunum="ikincil">
            <Zarf className="size-4" />
            Yeni yazılardan haberdar ol
          </Dugme>
        }
        desen="nokta"
      />

      {bos ? (
        <Bolum>
          <CokYakinda
            baslik={`${BOLUM.ad} hazırlanıyor`}
            metin={`${BOLUM.ozet} İlk yazı yayımlandığında — kendi kalıcı adresiyle — burada görünecek.`}
          />
        </Bolum>
      ) : (
        <>
          {one && (
            <Bolum>
              <BolumBasligi numara="01" etiket="SON YAZI" baslik="Öne çıkan köşe yazısı" />
              <OneCikanYazi yazi={one} />
            </Bolum>
          )}

          {kalan.length > 0 && (
            <Bolum zemin="derin">
              <BolumBasligi numara="02" etiket="ARŞİV" baslik={`${kalan.length} yazı daha`} />
              <ul className="divide-y divide-kenar-soluk border-y border-kenar-soluk">
                {kalan.map((yazi) => (
                  <ArsivSatiri key={yazi.slug} yazi={yazi} />
                ))}
              </ul>
            </Bolum>
          )}

          {sayiYazilari.length > 0 && (
            <Bolum>
              <BolumBasligi
                numara={kalan.length > 0 ? '03' : '02'}
                etiket="DERGİ SAYILARINDAN"
                baslik="Sayıların görüş bölümü"
              />
              <ul className="divide-y divide-kenar-soluk border-y border-kenar-soluk">
                {sayiYazilari.map((yazi) => (
                  <li key={`${yazi.sayiSlug}-${yazi.slug}`}>
                    <Link
                      href={`/dergi/${yazi.sayiSlug}/${yazi.slug}/`}
                      className="group flex flex-col gap-2 py-5 sm:flex-row sm:gap-6"
                    >
                      <span className="etiket-mono w-32 shrink-0 text-metin-soluk">
                        {yazi.sayiAd}
                      </span>
                      <span className="font-serif text-lg font-semibold text-metin transition-colors group-hover:text-vurgu-parlak">
                        {yazi.baslik}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Bolum>
          )}

          {yazarlar.length > 0 && (
            <Bolum>
              <BolumBasligi etiket="KÖŞE YAZARLARI" baslik="İmzalar" />
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {yazarlar.map(({ yazar, adet }) => (
                  <li key={yazar.slug}>
                    <Link
                      href={`/yazar/${yazar.slug}/`}
                      className="group flex h-full items-start gap-4 rounded-2xl border border-kenar bg-yuzey/30 p-5 transition-colors hover:border-vurgu/45"
                    >
                      <span className="grid size-12 shrink-0 place-items-center rounded-full border border-vurgu/40 bg-vurgu-zemin font-serif font-semibold text-vurgu-parlak">
                        {yazar.basHarfler}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-semibold text-metin transition-colors group-hover:text-vurgu-parlak">
                          {yazar.ad}
                        </span>
                        <span className="mt-0.5 block text-xs text-metin-soluk">{yazar.unvan}</span>
                        <span className="etiket-mono mt-3 block text-metin-soluk">
                          {adet} köşe yazısı
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Bolum>
          )}
        </>
      )}

      <Bolum zemin="derin">
        <BolumBasligi
          etiket="SÖZLEŞME"
          baslik="Köşe yazısı neyi taahhüt eder?"
          aciklama="Görüş ile analiz arasındaki fark tonda değil, okura verilen sözdedir."
        />
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar md:grid-cols-3">
          {SOZLESME.map((madde, sira) => (
            <li key={madde.baslik} className="bg-zemin p-6">
              <span className="etiket-mono text-vurgu-parlak">
                {String(sira + 1).padStart(2, '0')}
              </span>
              <p className="mt-3 font-semibold text-metin">{madde.baslik}</p>
              <p className="mt-2 text-[0.875rem] leading-relaxed text-metin-ikincil">
                {madde.metin}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-[0.875rem] text-metin-soluk">
          Kanıt yükünü tez güveni ve yanlışlanma koşuluyla taşıyan metinler için{' '}
          <Link href="/analiz/" className="text-vurgu-parlak hover:text-metin">
            derin analizlere
          </Link>{' '}
          bak.
        </p>
      </Bolum>
    </>
  );
}

const SOZLESME = [
  {
    baslik: 'İmzalıdır',
    metin:
      'Her köşe yazısı bir yazarın adıyla yayımlanır ve onun kişisel değerlendirmesini taşır. İmzasız görüş yazısı yayımlanmaz.',
  },
  {
    baslik: 'Rakamı kaynaklıdır',
    metin:
      'Görüş yorumdur, veri değildir. Metnin kullandığı her rakam sayfadaki veri şeridinde birincil kaynağına bağlanır.',
  },
  {
    baslik: 'Kalıcıdır',
    metin:
      'Her yazının tarihsiz, kalıcı bir adresi vardır. Yazı sonradan düzeltilirse güncelleme tarihi görünür biçimde eklenir.',
  },
] as const;

function yazarOzeti(yazilar: KoseYazisi[]): { yazar: Yazar; adet: number }[] {
  const harita = new Map<string, { yazar: Yazar; adet: number }>();
  for (const yazi of yazilar) {
    const kayit = harita.get(yazi.yazar.slug);
    if (kayit) kayit.adet += 1;
    else harita.set(yazi.yazar.slug, { yazar: yazi.yazar, adet: 1 });
  }
  return [...harita.values()].sort((a, b) => b.adet - a.adet);
}

function OneCikanYazi({ yazi }: { yazi: KoseYazisi }) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-kenar bg-zemin-derin">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="izgara-zemin absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_60%_80%_at_10%_0%,black,transparent)]" />
        <div className="absolute -top-32 left-[10%] h-72 w-[30rem] rounded-full bg-vurgu/14 blur-[110px]" />
      </div>
      <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-12">
        <div>
          <p className="etiket-mono text-vurgu-parlak">
            Köşe yazısı{yazi.konu ? ` · ${yazi.konu.ad}` : ''}
          </p>
          <h3 className="mt-4 font-serif text-[1.875rem] leading-[1.1] font-semibold tracking-[-0.02em] text-balance sm:text-[2.5rem]">
            <Link href={yazi.yol} className="transition-colors hover:text-vurgu-parlak">
              {/* Bağlantı kartın tamamını kaplar. */}
              <span className="absolute inset-0" aria-hidden="true" />
              {yazi.baslik}
            </Link>
          </h3>
          {yazi.ozet && (
            <p className="mt-5 max-w-2xl font-serif text-lg leading-relaxed text-metin-ikincil">
              {yazi.ozet}
            </p>
          )}
          <p className="mt-6 max-w-2xl border-l-2 border-vurgu pl-4 text-[0.9375rem] leading-relaxed text-metin">
            {yazi.kisaCevap}
          </p>
        </div>

        <div className="flex flex-col justify-between gap-6 lg:border-l lg:border-kenar lg:pl-10">
          <div className="flex items-center gap-3.5">
            <span className="grid size-12 shrink-0 place-items-center rounded-full border border-vurgu/40 bg-vurgu-zemin font-serif font-semibold text-vurgu-parlak">
              {yazi.yazar.basHarfler}
            </span>
            <span>
              <span className="block text-[0.9375rem] font-semibold text-metin">
                {yazi.yazar.ad}
              </span>
              <span className="mt-0.5 block text-xs text-metin-soluk">{yazi.yazar.unvan}</span>
            </span>
          </div>
          <dl className="space-y-2 text-xs">
            <div className="flex justify-between gap-3">
              <dt className="text-metin-soluk">Yayın</dt>
              <dd className="text-metin-ikincil">
                <time dateTime={yazi.tarih}>{tarihUzun(yazi.tarih)}</time>
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="inline-flex items-center gap-1.5 text-metin-soluk">
                <Saat className="size-3.5" />
                Okuma
              </dt>
              <dd className="text-metin-ikincil">{yazi.okumaDakika} dakika</dd>
            </div>
            {yazi.veriNoktalari && yazi.veriNoktalari.length > 0 && (
              <div className="flex justify-between gap-3">
                <dt className="text-metin-soluk">Kaynaklı veri</dt>
                <dd className="text-metin-ikincil">{yazi.veriNoktalari.length} rakam</dd>
              </div>
            )}
          </dl>
          <span className="etiket-mono relative inline-flex items-center gap-1.5 text-vurgu-parlak">
            Yazıyı oku
            <Ok className="size-4 transition-transform duration-200 ease-sinaptik group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </article>
  );
}

function ArsivSatiri({ yazi }: { yazi: KoseYazisi }) {
  return (
    <li className="group">
      <Link href={yazi.yol} className="flex flex-col gap-2 py-6 sm:flex-row sm:gap-8">
        <span className="etiket-mono w-36 shrink-0 text-metin-soluk">
          <time dateTime={yazi.tarih}>{tarihUzun(yazi.tarih)}</time>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-serif text-xl leading-snug font-semibold text-metin transition-colors group-hover:text-vurgu-parlak">
            {yazi.baslik}
          </span>
          {yazi.ozet && (
            <span className="mt-2 block text-[0.9375rem] leading-relaxed text-metin-ikincil">
              {yazi.ozet}
            </span>
          )}
          <span className="etiket-mono mt-2.5 block text-metin-soluk">
            {yazi.yazar.ad} · {yazi.okumaDakika} dk
          </span>
        </span>
      </Link>
    </li>
  );
}
