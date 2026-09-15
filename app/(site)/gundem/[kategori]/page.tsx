import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { FiltreSeridi, BosDurum } from '@/components/arayuz/Filtreler';
import { Dugme } from '@/components/arayuz/Dugme';
import { Ok, Saat } from '@/components/arayuz/Ikonlar';
import { GUNDEM_KATEGORILERI, konuyaGoreGundem, radarBul } from '@/lib/icerik/gundem';
import { konuListesi } from '@/lib/icerik/temel';
import { atlasBul } from '@/lib/icerik/atlas';
import { TUR_ADI } from '@/lib/taksonomi';
import { tarihKisa } from '@/lib/bicim';

export function generateStaticParams() {
  return GUNDEM_KATEGORILERI.map((kategori) => ({ kategori: kategori.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ kategori: string }>;
}): Promise<Metadata> {
  const { kategori: slug } = await params;
  const kategori = GUNDEM_KATEGORILERI.find((k) => k.slug === slug);
  if (!kategori) return {};

  return {
    title: `${kategori.ad} haberleri`,
    description: kategori.ozet,
    alternates: { canonical: kategori.yol },
  };
}

export default async function GundemKategoriSayfasi({
  params,
}: {
  params: Promise<{ kategori: string }>;
}) {
  const { kategori: slug } = await params;
  const kategori = GUNDEM_KATEGORILERI.find((k) => k.slug === slug);
  if (!kategori) notFound();

  const haberler = (await konuyaGoreGundem(kategori.slug)).sort((a, b) =>
    b.yayinTarihi.localeCompare(a.yayinTarihi),
  );
  const atlas = await atlasBul(kategori.slug);
  const radar = await radarBul(kategori.slug);
  // Her gündem kategorisinin bir konu merkezi karşılığı yoktur (ör. "Startuplar").
  const konu = (await konuListesi()).find((k) => k.slug === kategori.slug);

  return (
    <>
      <SayfaBasligi
        kirintilar={[
          { ad: 'Gündem', yol: '/gundem/' },
          { ad: kategori.ad, yol: kategori.yol },
        ]}
        etiket="GÜNDEM KATEGORİSİ"
        baslik={kategori.ad}
        ozet={kategori.ozet}
        olcumler={[
          { deger: `${haberler.length}`, etiket: 'Haber' },
          ...(radar ? [{ deger: `${radar.momentum}`, etiket: 'Radar momentum' }] : []),
        ]}
        eylemler={
          <>
            {atlas && (
              <Dugme href={`/atlas/${atlas.slug}/`} gorunum="ikincil">
                Kavram girdisi
              </Dugme>
            )}
            {konu && (
              <Dugme href={`/konu/${konu.slug}/`} gorunum="sessiz">
                Konu merkezi
                <Ok className="size-4" />
              </Dugme>
            )}
          </>
        }
        desen="nokta"
      />

      <Bolum>
        <div className="mb-9">
          <FiltreSeridi
            etiket="Gündem kategorileri"
            aktifYol={kategori.yol}
            ogeler={[
              { ad: 'Tümü', yol: '/gundem/' },
              ...GUNDEM_KATEGORILERI.map((k) => ({ ad: k.ad, yol: k.yol })),
            ]}
          />
        </div>

        {haberler.length > 0 ? (
          <ul className="divide-y divide-kenar-soluk border-y border-kenar-soluk">
            {haberler.map((icerik) => (
              <li key={icerik.slug} className="group relative">
                <Link href={icerik.yol} className="flex flex-col gap-2 py-5 sm:flex-row sm:gap-6">
                  <span className="flex shrink-0 items-center gap-3 sm:w-32 sm:flex-col sm:items-start sm:gap-1.5">
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
                    <span className="mt-2.5 inline-flex items-center gap-1 text-xs text-metin-soluk">
                      <Saat className="size-3.5" />
                      {icerik.okumaDakika} dakika
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <BosDurum
            baslik={`${kategori.ad} akışı hazırlanıyor`}
            metin="Bu kategori için henüz yayımlanmış içerik yok. Kategori, anlamlı minimum içerik kümesi oluşmadan öne çıkarılmaz."
            eylem={<Dugme href="/gundem/">Tüm gündem</Dugme>}
          />
        )}
      </Bolum>
    </>
  );
}
