import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { BosDurum } from '@/components/arayuz/Filtreler';
import { Ok, Saat } from '@/components/arayuz/Ikonlar';
import { ListeSemasi } from '@/lib/seo/jsonld';
import { podcastListesi } from '@/lib/icerik/yayin';
import { tarihUzun } from '@/lib/bicim';

export const metadata: Metadata = {
  title: 'Sinaptik Sessions',
  description:
    'Araştırmacı, kurucu ve uygulayıcılarla konuşmalar. Her bölümün kendi sayfası, anahtar çıkarımları ve konuk künyesi vardır.',
  alternates: { canonical: '/podcast/' },
};

export default async function PodcastSayfasi() {
  const PODCAST = await podcastListesi();
  const sirali = [...PODCAST].sort((a, b) => b.numara - a.numara);

  return (
    <>
      <ListeSemasi
        ad="Sinaptik Sessions bölümleri"
        ogeler={PODCAST.map((bolum) => ({ ad: bolum.ad, yol: `/podcast/${bolum.slug}/` }))}
      />

      <SayfaBasligi
        kirintilar={[
          { ad: 'Topluluk', yol: '/topluluk/' },
          { ad: 'Podcast', yol: '/podcast/' },
        ]}
        etiket="TOPLULUK"
        baslik="Sinaptik Sessions"
        ozet="Bölümler yalnızca ses platformlarına bırakılmaz: her bölümün kendi sayfası, anahtar çıkarımları ve konuk künyesi vardır."
        olcumler={[
          { deger: `${PODCAST.length}`, etiket: 'Bölüm' },
          {
            deger: `${PODCAST.reduce((t, b) => t + b.dakika, 0)} dk`,
            etiket: 'Toplam süre',
          },
          /*
            "Transcript · Her bölümde" ölçümü KALDIRILDI: `PodcastBolumu`
            tipinde ve şemada transcript alanı YOK, üç bölümün hiçbirinde de
            böyle bir içerik bulunmuyor. Olmayan bir özelliği ölçüm şeridinde
            ilan etmek değişmez kural 5'in ihlaliydi. Transcript yayımlanmaya
            başlandığında önce şemaya alan eklenir, sonra iddia geri gelir.
          */
          { deger: 'Anahtar çıkarım', etiket: 'Her bölümde' },
        ]}
        desen="nokta"
      />

      <Bolum>
        <BolumBasligi numara="01" etiket="BÖLÜMLER" baslik="Tüm bölümler" />
        {sirali.length > 0 ? (
          <ul className="space-y-4">
            {sirali.map((bolum) => (
              <li key={bolum.slug}>
                <Link
                  href={`/podcast/${bolum.slug}/`}
                  className="group flex flex-col gap-5 rounded-2xl border border-kenar bg-yuzey/40 p-6 transition-[border-color,background-color] duration-300 hover:border-ikincil/45 hover:bg-yuzey/70 sm:flex-row"
                >
                  <span className="shrink-0">
                    <span className="grid size-14 place-items-center rounded-2xl border border-kenar bg-zemin-derin font-mono text-lg text-metin-ikincil transition-colors group-hover:border-ikincil/40 group-hover:text-ikincil">
                      {bolum.numara}
                    </span>
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="etiket-mono text-metin-soluk">
                      {bolum.konuk} · <time dateTime={bolum.tarih}>{tarihUzun(bolum.tarih)}</time>
                    </span>
                    <span className="mt-2 block text-[1.125rem] leading-snug font-semibold tracking-tight text-metin group-hover:text-ikincil">
                      {bolum.ad}
                    </span>
                    <span className="mt-2 block text-[0.875rem] leading-relaxed text-metin-ikincil">
                      {bolum.ozet}
                    </span>
                    <span className="etiket-mono mt-3 inline-flex items-center gap-1.5 text-metin-soluk">
                      <Saat className="size-3.5" />
                      {bolum.dakika} dakika
                    </span>
                  </span>

                  <Ok className="hidden size-5 shrink-0 self-center text-metin-soluk transition-transform duration-200 ease-sinaptik group-hover:translate-x-1 sm:block" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <BosDurum
            baslik="İlk bölüm hazırlanıyor"
            metin="Yayına giren her bölüm kendi sayfasında çıkarımları ve kaynaklarıyla burada listelenecek."
          />
        )}
      </Bolum>
    </>
  );
}
