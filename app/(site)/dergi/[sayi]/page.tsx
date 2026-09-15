import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { CokYakinda } from '@/components/arayuz/CokYakinda';
import { Kitap, Ok } from '@/components/arayuz/Ikonlar';
import { ListeSemasi } from '@/lib/seo/jsonld';
import {
  DERGI_BOLUMLERI,
  dergiBolumununYazilari,
  dergiSayiListesi,
  dergiSayisiBul,
} from '@/lib/icerik/yayin';
import { ustveriBirlestir } from '@/lib/seo/ustveri';
import { tarihUzun } from '@/lib/bicim';

/**
 * Tek dinamik segment iki sayfa tipini karşılar:
 *  - slug bir bölüm ise (`dosya`, `roportaj`, `kose`) → bölüm arşivi
 *  - slug bir sayı ise (`2026-ekim`) → sayı sayfası
 */

export async function generateStaticParams() {
  return [
    ...DERGI_BOLUMLERI.map((bolum) => ({ sayi: bolum.slug })),
    ...(await dergiSayiListesi()).map((sayi) => ({ sayi: sayi.slug })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sayi: string }>;
}): Promise<Metadata> {
  const { sayi: slug } = await params;
  // Bölüm arşivi bir KOD SABITİNDEN gelir (`DERGI_BOLUMLERI`); panelde
  // karşılığı olan bir belge yoktur, bu yüzden editör SEO
  // alanına bağlanacak bir kayıt da yok. Üstverisi olduğu gibi kalır.
  const bolum = DERGI_BOLUMLERI.find((b) => b.slug === slug);
  if (bolum) {
    return {
      title: bolum.ad,
      description: bolum.ozet,
      alternates: { canonical: `/dergi/${bolum.slug}/` },
    };
  }

  const sayi = await dergiSayisiBul(slug);
  if (!sayi) return {};

  // Editörün panelden yazdığı SEO alanları varsayılanların üzerine uygulanır.
  return ustveriBirlestir(sayi.seo, {
    baslik: `${sayi.sayi} — ${sayi.kapakKonusu}`,
    aciklama: sayi.ozet,
    kanonik: `/dergi/${sayi.slug}/`,
  });
}

export default async function DergiSayiSayfasi({ params }: { params: Promise<{ sayi: string }> }) {
  const { sayi: slug } = await params;
  const bolum = DERGI_BOLUMLERI.find((b) => b.slug === slug);
  if (bolum) return <BolumArsivi bolumSlug={bolum.slug} />;

  const sayi = await dergiSayisiBul(slug);
  if (!sayi) notFound();

  const digerSayilar = (await dergiSayiListesi()).filter((diger) => diger.slug !== sayi.slug);
  // Kunyesi girilmis ama ici bos bir sayida ilk yaziya baglanacak adres yoktur.
  const ilkYazi = sayi.yazilar[0];

  return (
    <>
      <ListeSemasi
        ad={`${sayi.sayi} içindekiler`}
        ogeler={sayi.yazilar.map((yazi) => ({
          ad: yazi.baslik,
          yol: `/dergi/${sayi.slug}/${yazi.slug}/`,
        }))}
      />

      <SayfaBasligi
        kirintilar={[
          { ad: 'Dergi', yol: '/dergi/' },
          { ad: sayi.sayi, yol: `/dergi/${sayi.slug}/` },
        ]}
        etiket={`${sayi.sayi} · KAPAK DOSYASI`}
        baslik={sayi.kapakKonusu}
        ozet={sayi.ozet}
        olcumler={[
          { deger: `${sayi.yazilar.length}`, etiket: 'Yazı' },
          {
            deger: `${sayi.yazilar.reduce((t, y) => t + y.okumaDakika, 0)} dk`,
            etiket: 'Toplam okuma',
          },
          { deger: tarihUzun(sayi.tarih), etiket: 'Yayın' },
        ]}
        eylemler={
          <>
            {ilkYazi && (
              <Dugme href={`/dergi/${sayi.slug}/${ilkYazi.slug}/`}>
                <Kitap className="size-4" />
                İlk yazıdan başla
              </Dugme>
            )}
            <Dugme href="/dergi/arsiv/" gorunum="ikincil">
              Arşiv
            </Dugme>
          </>
        }
      />

      <Bolum>
        <BolumBasligi numara="01" etiket="İÇİNDEKİLER" baslik={`${sayi.yazilar.length} yazı`} />
        {sayi.yazilar.length > 0 ? (
          <ol className="divide-y divide-kenar-soluk overflow-hidden rounded-2xl border border-kenar">
            {sayi.yazilar.map((yazi, sira) => {
              const yazar = yazi.yazar;
              return (
                <li key={yazi.slug} className="group bg-yuzey/30">
                  <Link
                    href={`/dergi/${sayi.slug}/${yazi.slug}/`}
                    className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6"
                  >
                    <span className="etiket-mono grid size-9 shrink-0 place-items-center rounded-full border border-kenar bg-zemin text-metin-soluk">
                      {String(sira + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="etiket-mono text-vurgu-parlak">{yazi.bolum}</span>
                      <span className="mt-1.5 block text-[1.0625rem] leading-snug font-semibold tracking-tight text-metin transition-colors group-hover:text-vurgu-parlak">
                        {yazi.baslik}
                      </span>
                      <span className="mt-1.5 block text-[0.875rem] leading-relaxed text-metin-ikincil">
                        {yazi.ozet}
                      </span>
                    </span>
                    <span className="etiket-mono shrink-0 text-metin-soluk sm:text-right">
                      {yazar && <span className="block">{yazar.ad}</span>}
                      <span className="mt-1 block">{yazi.okumaDakika} dk</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        ) : (
          <CokYakinda
            etiket="HAZIRLANIYOR"
            baslik="Bu sayının yazıları hazırlanıyor"
            metin="Sayının künyesi girildi; yazılar yayına alındıkça her biri kendi kalıcı adresiyle bu listede görünecek."
          />
        )}

        <div className="mt-6 rounded-xl border border-kenar bg-yuzey/40 p-5">
          <p className="etiket-mono mb-2 text-metin-soluk">PDF politikası</p>
          <p className="text-[0.875rem] leading-relaxed text-metin-ikincil">
            Sayının PDF sürümü, HTML yayını tamamlandıktan sonra ikincil format olarak sunulur.
            Birincil ve kanonik yayın bu sayfalardır.
          </p>
        </div>
      </Bolum>

      <Bolum zemin="derin">
        <BolumBasligi
          numara="02"
          etiket="DİĞER SAYILAR"
          baslik="Arşivden"
          baglantiYolu="/dergi/arsiv/"
        />
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2">
          {digerSayilar.map((diger) => (
            <li key={diger.slug}>
              <Link
                href={`/dergi/${diger.slug}/`}
                className="group flex h-full flex-col bg-zemin p-6 transition-colors hover:bg-yuzey/60"
              >
                <span className="etiket-mono text-metin-soluk">{diger.sayi}</span>
                <span className="mt-2.5 block text-[1.0625rem] font-semibold tracking-tight text-metin group-hover:text-vurgu-parlak">
                  {diger.kapakKonusu}
                </span>
                <span className="mt-2 flex-1 text-xs leading-relaxed text-metin-soluk">
                  {diger.ozet}
                </span>
                <Ok className="mt-4 size-4 text-metin-soluk transition-transform duration-200 ease-sinaptik group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      </Bolum>
    </>
  );
}

async function BolumArsivi({ bolumSlug }: { bolumSlug: string }) {
  const bolum = DERGI_BOLUMLERI.find((b) => b.slug === bolumSlug)!;

  // Eşleşme `yaziBolumu` alanıyla; görünen ada göre karşılaştırma kırıktı
  // (bkz. `dergiBolumununYazilari` başlığı).
  const yazilar = await dergiBolumununYazilari(bolumSlug);

  return (
    <>
      <SayfaBasligi
        kirintilar={[
          { ad: 'Dergi', yol: '/dergi/' },
          { ad: bolum.ad, yol: `/dergi/${bolum.slug}/` },
        ]}
        etiket="MAGAZINE BÖLÜMÜ"
        baslik={bolum.ad}
        ozet={bolum.ozet}
        olcumler={[{ deger: `${yazilar.length}`, etiket: 'Yazı' }]}
        desen="nokta"
      />

      <Bolum>
        {yazilar.length > 0 ? (
          <ul className="divide-y divide-kenar-soluk border-y border-kenar-soluk">
            {yazilar.map((yazi) => {
              const yazar = yazi.yazar;
              return (
                <li key={`${yazi.sayiSlug}-${yazi.slug}`} className="group">
                  <Link
                    href={`/dergi/${yazi.sayiSlug}/${yazi.slug}/`}
                    className="flex flex-col gap-2 py-5 sm:flex-row sm:gap-6"
                  >
                    <span className="etiket-mono w-28 shrink-0 text-metin-soluk">
                      {yazi.sayiAd}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[1.0625rem] leading-snug font-medium tracking-tight text-metin transition-colors group-hover:text-vurgu-parlak">
                        {yazi.baslik}
                      </span>
                      <span className="mt-1.5 block text-[0.875rem] leading-relaxed text-metin-ikincil">
                        {yazi.ozet}
                      </span>
                      <span className="etiket-mono mt-2 block text-metin-soluk">
                        {yazar ? `${yazar.ad} · ${yazi.okumaDakika} dk` : `${yazi.okumaDakika} dk`}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <CokYakinda
            baslik={`${bolum.ad} hazırlanıyor`}
            metin={`${bolum.ozet} Derginin ilk sayısı yayımlandığında bu bölümün yazıları — her biri kendi kalıcı adresiyle — burada birikecek.`}
            kapsam={[
              'Sayı sayı biriken, tarihe göre değil konuya göre gezilebilen arşiv',
              'Her yazının yazar künyesi, okuma süresi ve kaynakları',
              'Yazıların kalıcı ve tarihsiz kendi adresleri',
              'Konu merkezlerinden bu bölüme gelen çapraz bağlantılar',
            ]}
            notlar={[
              'Bölüm arşivi otomatik dolar: bir yazı bu bölüme işaretlendiğinde elle bir şey yapılmadan burada görünür.',
            ]}
          />
        )}
      </Bolum>
    </>
  );
}
