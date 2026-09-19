import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Kart, KartEtiketi, KartIzgarasi } from '@/components/arayuz/Kart';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { FiltreSeridi, BosDurum } from '@/components/arayuz/Filtreler';
import { Dugme } from '@/components/arayuz/Dugme';
import { Rozet } from '@/components/arayuz/Rozet';
import { Atlas, Onay } from '@/components/arayuz/Ikonlar';
import { TerimKumesiSemasi } from '@/lib/seo/jsonld';
import {
  ATLAS_KATEGORILERI,
  kategoriyeGoreAtlas,
  kategoriyeGoreSozluk,
  type SozlukGirdisi,
} from '@/lib/icerik/atlas';
import { SEVIYE_ADI, tarihUzun } from '@/lib/veri/temel';

/**
 * Atlas kategori sayfası — kategorinin TAM sözlüğü.
 *
 * ÖNCEDEN YALNIZCA ATLAS GİRDİLERİNİ LİSTELİYORDU ve bu bir ince sayfa
 * sorunuydu: 35 Atlas girdisi 14 kategoriye bölününce sayfa başına ortalama
 * iki kart düşüyordu. İki kart, arama motoru için de okur için de bir sayfa
 * değildir.
 *
 * Aynı kategorinin sözlük terimleri o boşluğu doldurur. Bu, `/sozluk/`
 * sayfasının kopyası DEĞİLDİR: sözlük 538 terimi alfabetik tek liste hâlinde
 * verir, burası tek bir alanın terimlerini konusuyla birlikte verir. İki sayfa
 * aynı veriyi taşır ama farklı soruları cevaplar — "bu terim ne demek?" ile
 * "bu alanda ne bilmem gerekiyor?".
 *
 * KATEGORİ SABİT BİR TAKSONOMİDİR, kullanıcı filtresi değil (`lib/taksonomi.ts`).
 * Bu yüzden indekslenir; `?tur=`, `?seviye=` gibi kombinasyonlar indekslenmez
 * (MASTER-PLAN §51).
 */

export function generateStaticParams() {
  return ATLAS_KATEGORILERI.map((kategori) => ({ slug: kategori.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const kategori = ATLAS_KATEGORILERI.find((k) => k.slug === slug);
  if (!kategori) return {};

  const [girdiler, terimler] = await Promise.all([
    kategoriyeGoreAtlas(kategori.slug),
    kategoriyeGoreSozluk(kategori.slug),
  ]);

  const aciklama = `${kategori.ad} alanındaki ${terimler.length} yapay zekâ teriminin Türkçe tanımı${
    girdiler.length > 0 ? ` ve ${girdiler.length} ayrıntılı AI Atlas girdisi` : ''
  }. Her terim İngilizce karşılığıyla ve alanda yerleşik olup olmadığı bilgisiyle birlikte verilir.`;

  return {
    title: `${kategori.ad} terimleri ve kavramları`,
    description: aciklama,
    alternates: { canonical: `/atlas/kategori/${kategori.slug}/` },
    openGraph: {
      title: `${kategori.ad} — ${terimler.length} Türkçe terim`,
      description: aciklama,
      url: `/atlas/kategori/${kategori.slug}/`,
      type: 'website',
    },
  };
}

const ASAMA_ETIKETI = {
  yeni: { ad: 'Yerleşmekte', ton: 'sinyal' as const },
  'kullanimdan-kalkti': { ad: 'Kullanımdan kalktı', ton: 'uyari' as const },
};

export default async function AtlasKategoriSayfasi({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const kategori = ATLAS_KATEGORILERI.find((k) => k.slug === slug);
  if (!kategori) notFound();

  const [girdiler, terimler] = await Promise.all([
    kategoriyeGoreAtlas(kategori.slug),
    kategoriyeGoreSozluk(kategori.slug),
  ]);

  const isaretli = terimler.filter((t) => t.asama !== 'yerlesik');

  return (
    <>
      {/*
       * ŞEMA BU SAYFANIN KENDİ ALT KÜMESİNİ TANIMLAR. `/sozluk/#sozluk`
       * kimliğini tekrar etmez; aynı `@id` altında iki farklı terim listesi
       * yayımlamak, tüketiciye hangisinin küme olduğunu belirsiz bırakırdı.
       */}
      {terimler.length > 0 && (
        <TerimKumesiSemasi
          ad={`${kategori.ad} terimleri`}
          aciklama={`${kategori.ad} alanındaki yapay zekâ terimlerinin Türkçe, tek satırlık tanımları.`}
          yol={`/atlas/kategori/${kategori.slug}/`}
          terimler={terimler.map((t) => ({
            ad: t.terim,
            tanim: t.tanim,
            kimlik: t.slug,
            esAd: t.ingilizce,
            kaynakAdresi: t.kaynak?.adres,
          }))}
        />
      )}

      <SayfaBasligi
        kirintilar={[
          { ad: 'AI Atlas', yol: '/atlas/' },
          { ad: kategori.ad, yol: `/atlas/kategori/${kategori.slug}/` },
        ]}
        etiket="ATLAS KATEGORİSİ"
        baslik={kategori.ad}
        ozet={`${kategori.ad} alanındaki ${terimler.length} terimin Türkçe tanımı bu sayfada. Ayrıntı gerektiren kavramlar Atlas girdisine açılır; geri kalanında sözlük tanımı nihai biçimdir.`}
        olcumler={[
          { deger: `${terimler.length}`, etiket: 'Terim' },
          { deger: `${girdiler.length}`, etiket: 'Atlas girdisi' },
          { deger: `${isaretli.length}`, etiket: 'İşaretli' },
          { deger: `${kategori.adet}`, etiket: 'Hedef girdi' },
        ]}
        desen="nokta"
      />

      <Bolum>
        <div className="mb-8">
          <FiltreSeridi
            etiket="Atlas kategorileri"
            aktifYol={`/atlas/kategori/${kategori.slug}/`}
            ogeler={ATLAS_KATEGORILERI.map((k) => ({
              ad: k.ad,
              yol: `/atlas/kategori/${k.slug}/`,
            }))}
          />
        </div>

        <BolumBasligi
          numara="01"
          etiket="AYRINTILI GİRDİLER"
          baslik="Atlas kavramları"
          aciklama="Gövdesi, kaynakları ve sürüm geçmişi olan girdiler. Bir kavramın Atlas girdisi açılması, tek satırlık tanımın yetmediği anlamına gelir."
        />

        {girdiler.length > 0 ? (
          <KartIzgarasi kolon={3}>
            {girdiler.map((girdi) => (
              <Kart
                key={girdi.slug}
                yol={`/atlas/${girdi.slug}/`}
                ustEtiket={SEVIYE_ADI[girdi.seviye]}
                baslik={girdi.ad}
                aciklama={girdi.kisaTanim}
                rozetler={girdi.ilgili.slice(0, 3).map((ilgi) => (
                  <KartEtiketi key={ilgi}>{ilgi}</KartEtiketi>
                ))}
                altBilgi={
                  <span className="inline-flex items-center gap-1.5">
                    <Onay className="size-3.5 text-basari" />
                    {tarihUzun(girdi.sonDogrulama)}
                  </span>
                }
              />
            ))}
          </KartIzgarasi>
        ) : (
          <BosDurum
            baslik={`${kategori.ad} girdileri hazırlanıyor`}
            metin="Bu kümede henüz ayrıntılı Atlas girdisi yok. Alanın terimleri aşağıdaki sözlükte tanımlarıyla birlikte duruyor."
            eylem={<Dugme href="/sozluk/">Tüm sözlüğe git</Dugme>}
          />
        )}
      </Bolum>

      {terimler.length > 0 && (
        <Bolum zemin="derin">
          <BolumBasligi
            numara="02"
            etiket="ALAN SÖZLÜĞÜ"
            baslik={`${kategori.ad} terimleri`}
            aciklama="Bu alanın tüm sözlük terimleri, Türkçe tanımı ve İngilizce karşılığıyla. Mor işaretli olanların ayrıntılı Atlas girdisi yayında."
            baglantiYolu="/sozluk/"
            baglantiMetni="Tüm sözlük"
          />

          <dl className="divide-y divide-kenar-soluk">
            {terimler.map((terim) => (
              <KategoriTerimi key={terim.slug} kayit={terim} />
            ))}
          </dl>
        </Bolum>
      )}
    </>
  );
}

function KategoriTerimi({ kayit }: { kayit: SozlukGirdisi }) {
  const asama = kayit.asama === 'yerlesik' ? undefined : ASAMA_ETIKETI[kayit.asama];

  return (
    <div className="grid gap-2 py-4 md:grid-cols-[17rem_1fr] md:gap-6">
      <dt>
        <span className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          {kayit.atlasSlug ? (
            <Link
              href={`/atlas/${kayit.atlasSlug}/`}
              className="sozluk-terim text-vurgu-parlak hover:opacity-80"
            >
              {kayit.terim}
            </Link>
          ) : (
            <span className="sozluk-terim text-metin">{kayit.terim}</span>
          )}
          {kayit.kisaltma && (
            <span className="etiket-mono rounded border border-kenar-soluk px-1.5 py-0.5 text-metin-soluk">
              {kayit.kisaltma}
            </span>
          )}
        </span>
        {kayit.ingilizce && kayit.ingilizce !== kayit.terim && (
          <span className="sozluk-ingilizce">{kayit.ingilizce}</span>
        )}
        {asama && (
          <Rozet ton={asama.ton} className="mt-2">
            {asama.ad}
          </Rozet>
        )}
      </dt>
      <dd className="sozluk-tanim">
        {kayit.tanim}
        {kayit.asamaNotu && <span className="sozluk-not">{kayit.asamaNotu}</span>}
        <span className="etiket-mono sozluk-kunye">
          <a href={`/sozluk/#terim-${kayit.slug}`} className="hover:text-vurgu-parlak">
            Sözlükteki yeri
          </a>
          {kayit.atlasSlug && (
            <Link
              href={`/atlas/${kayit.atlasSlug}/`}
              className="inline-flex items-center gap-1.5 text-vurgu-sonuk hover:text-vurgu-parlak"
            >
              <Atlas className="size-3" />
              Atlas girdisi
            </Link>
          )}
        </span>
      </dd>
    </div>
  );
}
