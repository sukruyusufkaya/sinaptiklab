import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { Rozet } from '@/components/arayuz/Rozet';
import { Ok, Saat, Zarf } from '@/components/arayuz/Ikonlar';
import { KapanisCagrisi } from '@/components/icerik/IcerikDuzeni';
import { BosDurum } from '@/components/arayuz/Filtreler';
import { etkinlikListesi, podcastListesi, uzmanListesi } from '@/lib/icerik/yayin';
import { SORU_CEVAP } from '@/lib/veri/yayin';
import { tarihKisa, tarihUzun } from '@/lib/bicim';

export const metadata: Metadata = {
  title: 'Topluluk',
  description:
    'Uzmanlar, etkinlikler, soru-cevap, podcast ve bülten. Forum açmadan önce gerçek katkı kanallarını kuruyoruz.',
  alternates: { canonical: '/topluluk/' },
};

const KANALLAR = [
  { ad: 'Uzmanlar', yol: '/uzmanlar/', ozet: 'Katkı veren uzmanların profilleri.', durum: 'Açık' },
  {
    ad: 'Etkinlikler',
    yol: '/etkinlikler/',
    ozet: 'Atölye, webinar ve konferanslar.',
    durum: 'Açık',
  },
  { ad: 'Soru & Cevap', yol: '/soru-cevap/', ozet: 'Uygulamaya dönük sorular.', durum: 'Açık' },
  { ad: 'Podcast', yol: '/podcast/', ozet: 'Sinaptik Sessions bölümleri.', durum: 'Açık' },
  { ad: 'Bülten', yol: '/bulten/', ozet: 'Günlük ve haftalık e-bülten.', durum: 'Açık' },
  { ad: 'Tartışmalar', yol: '/topluluk/', ozet: 'Forum ve çalışma grupları.', durum: 'Yakında' },
];

export default async function ToplulukSayfasi() {
  const [UZMANLAR, ETKINLIKLER, PODCAST] = await Promise.all([
    uzmanListesi(),
    etkinlikListesi(),
    podcastListesi(),
  ]);
  const yaklasan = ETKINLIKLER.filter((etkinlik) => etkinlik.durum !== 'gecti').slice(0, 3);

  return (
    <>
      <SayfaBasligi
        kirintilar={[{ ad: 'Topluluk', yol: '/topluluk/' }]}
        etiket="TOPLULUK"
        baslik="Topluluk"
        ozet="İlk günden forum açmak zorunlu değil. Önce gerçek katkı kanalları kurulur: uzman profilleri, etkinlikler, soru-cevap ve bülten. Tartışma alanı bunların üzerine gelir."
        olcumler={[
          { deger: `${UZMANLAR.length}`, etiket: 'Uzman koltuğu' },
          { deger: `${ETKINLIKLER.length}`, etiket: 'Etkinlik' },
          { deger: `${PODCAST.length}`, etiket: 'Podcast bölümü' },
          { deger: `${SORU_CEVAP.length}`, etiket: 'Soru' },
        ]}
        eylemler={
          <>
            <Dugme href="/topluluk/katki/">
              Katkıda bulun
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/bulten/" gorunum="ikincil">
              <Zarf className="size-4" />
              Bültene katıl
            </Dugme>
          </>
        }
      />

      <Bolum>
        <BolumBasligi numara="01" etiket="KANALLAR" baslik="Katkı kanalları" />
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-3">
          {KANALLAR.map((kanal) => (
            <li key={kanal.ad}>
              <Link
                href={kanal.yol}
                className="group flex h-full flex-col bg-zemin p-6 transition-colors hover:bg-yuzey/60"
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="text-[1.0625rem] font-semibold tracking-tight text-metin group-hover:text-vurgu-parlak">
                    {kanal.ad}
                  </span>
                  {kanal.durum === 'Yakında' && (
                    <span className="etiket-mono shrink-0 text-metin-soluk">Yakında</span>
                  )}
                </span>
                <span className="mt-2 flex-1 text-xs leading-relaxed text-metin-soluk">
                  {kanal.ozet}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Bolum>

      <Bolum zemin="derin">
        <BolumBasligi
          numara="02"
          etiket="ETKİNLİK"
          baslik="Yaklaşan etkinlikler"
          baglantiYolu="/etkinlikler/"
        />
        {yaklasan.length > 0 ? (
          <ul className="divide-y divide-kenar-soluk border-y border-kenar-soluk">
            {yaklasan.map((etkinlik) => (
              <li key={etkinlik.slug} className="group">
                <Link
                  href={`/etkinlikler/${etkinlik.slug}/`}
                  className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:gap-6"
                >
                  <span className="etiket-mono w-28 shrink-0 text-metin-soluk">
                    <time dateTime={etkinlik.tarih}>{tarihUzun(etkinlik.tarih)}</time>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[1.0625rem] font-medium tracking-tight text-metin transition-colors group-hover:text-vurgu-parlak">
                      {etkinlik.ad}
                    </span>
                    <span className="mt-1 block text-[0.875rem] leading-relaxed text-metin-soluk">
                      {etkinlik.ozet}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="etiket-mono inline-flex items-center gap-1.5 text-metin-soluk">
                      <Saat className="size-3.5" />
                      {etkinlik.bicim}
                    </span>
                    {etkinlik.durum === 'kayit-acik' ? (
                      <Rozet ton="basari">Kayıt açık</Rozet>
                    ) : (
                      <Rozet>Planlandı</Rozet>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <BosDurum
            baslik="Takvimde yaklaşan etkinlik yok"
            metin="Yeni atölye ve webinar tarihleri açıldığında burada listelenir."
            eylem={
              <Dugme href="/etkinlikler/" gorunum="ikincil">
                Geçmiş etkinlikler
              </Dugme>
            }
          />
        )}
      </Bolum>

      <Bolum>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-kenar bg-yuzey/40 p-6">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-kenar-soluk pb-3.5">
              <p className="etiket-mono text-metin">Son sorular</p>
              <Link href="/soru-cevap/" className="etiket-mono text-vurgu-parlak">
                Tümü →
              </Link>
            </div>
            <ul className="divide-y divide-kenar-soluk">
              {SORU_CEVAP.slice(0, 4).map((kayit) => (
                <li key={kayit.slug} className="group">
                  <Link href="/soru-cevap/" className="block py-3">
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-metin group-hover:text-vurgu-parlak">
                        {kayit.soru}
                      </span>
                      {/*
                        Burada etiketsiz bir yanıt sayısı basılıyordu; yayında
                        yanıt kaydı yok (bkz. `/soru-cevap/` sayfası notu).
                      */}
                      <span className="etiket-mono shrink-0 text-metin-soluk">
                        {tarihKisa(kayit.tarih)}
                      </span>
                    </span>
                    <span className="mt-1 block text-xs text-metin-soluk">{kayit.konu}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-kenar bg-yuzey/40 p-6">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-kenar-soluk pb-3.5">
              <p className="etiket-mono text-metin">Sinaptik Sessions</p>
              <Link href="/podcast/" className="etiket-mono text-vurgu-parlak">
                Tümü →
              </Link>
            </div>
            <ul className="divide-y divide-kenar-soluk">
              {PODCAST.map((bolum) => (
                <li key={bolum.slug} className="group">
                  <Link href={`/podcast/${bolum.slug}/`} className="block py-3">
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-metin group-hover:text-vurgu-parlak">
                        #{bolum.numara} {bolum.ad}
                      </span>
                      <span className="etiket-mono shrink-0 text-metin-soluk">
                        {bolum.dakika} dk
                      </span>
                    </span>
                    <span className="mt-1 block text-xs text-metin-soluk">{bolum.konuk}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Bolum>

      <KapanisCagrisi
        etiket="KATKI"
        baslik="Uzman koltuklarından biri senin olabilir"
        metin="Bir konuda derinliğin varsa Atlas girdisi yazabilir, teknik inceleme yapabilir veya podcast konuğu olabilirsin."
        eylemler={
          <>
            <Dugme href="/topluluk/katki/">
              Katkı biçimlerini gör
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/uzmanlar/" gorunum="ikincil">
              Uzmanlar
            </Dugme>
          </>
        }
      />
    </>
  );
}
