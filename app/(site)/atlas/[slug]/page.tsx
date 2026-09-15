import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Kirintilar } from '@/components/arayuz/Kirintilar';
import { Rozet } from '@/components/arayuz/Rozet';
import { IcerikDuzeni, KapanisCagrisi } from '@/components/icerik/IcerikDuzeni';
import { OkumaCubugu } from '@/components/icerik/OkumaCubugu';
import { IcindekilerTakipli } from '@/components/icerik/IcindekilerTakipli';
import { MetinGovdesi, altBasliklar } from '@/components/icerik/MetinGovdesi';
import {
  IlgiliBaglantilar,
  KaynakListesi,
  SSSBolumu,
  SurumGecmisi,
  YazarSeridi,
} from '@/components/icerik/IcerikKenari';
import { Dugme } from '@/components/arayuz/Dugme';
import { Ok } from '@/components/arayuz/Ikonlar';
import { MakaleSemasi, SSSSemasi } from '@/lib/seo/jsonld';
import { ustveriBirlestir } from '@/lib/seo/ustveri';
import { atlasBul, atlasListesi, ATLAS_KATEGORILERI } from '@/lib/icerik/atlas';
import { yazarBul } from '@/lib/icerik/temel';
import { etiketlereGoreSorular, testler } from '@/lib/icerik/ogrenme';
import { konuyaGoreGundem } from '@/lib/icerik/gundem';
import { SEVIYE_ADI } from '@/lib/taksonomi';

export async function generateStaticParams() {
  return (await atlasListesi()).map((girdi) => ({ slug: girdi.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const girdi = await atlasBul(slug);
  if (!girdi) return {};

  // Editörün panelden yazdığı SEO alanları varsayılanların üzerine uygulanır.
  return ustveriBirlestir(girdi.seo, {
    baslik: `${girdi.ad} nedir?`,
    aciklama: girdi.kisaTanim,
    kanonik: `/atlas/${girdi.slug}/`,
    openGraph: { type: 'article' },
  });
}

export default async function AtlasGirdiSayfasi({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const girdi = await atlasBul(slug);
  if (!girdi) notFound();

  const yazar = await yazarBul(girdi.yazarSlug);
  const inceleyen = girdi.inceleyenSlug ? await yazarBul(girdi.inceleyenSlug) : undefined;
  const kategori = ATLAS_KATEGORILERI.find((k) => k.ad === girdi.kategori);
  const basliklar = altBasliklar(girdi.govde);

  // Semantik komşuluk: aynı kategorideki diğer girdiler ve adı geçen kavramlar.
  const ilgiliGirdiler = (await atlasListesi())
    .filter(
      (diger) =>
        diger.slug !== girdi.slug &&
        (girdi.ilgili.some((ad) => diger.ad.includes(ad) || (diger.altAd ?? '').includes(ad)) ||
          diger.kategori === girdi.kategori),
    )
    .slice(0, 5);

  /*
   * İLGİLİ TEST — iki ölçüt, önem sırasıyla.
   *
   * 1. Testin konusu bu Atlas girdisiyle AYNI slug'ı taşıyorsa (`llm`, `rag`,
   *    `ai-agent`… taksonomi ile Atlas'ın kesiştiği yerler) doğrudan eşleşir.
   * 2. Değilse soru bankasına bakılır: bir sorusu bu girdiyi `ilgiliAtlas`
   *    olarak gösteriyorsa test ilgilidir.
   *
   * Eski üçüncü ölçüt `test.konu === girdi.kategori` KALDIRILDI: `konu` alanı
   * artık taksonomideki konu adını taşıyor (Atlas kategorisini değil), yani
   * karşılaştırma hiçbir zaman tutmuyordu — sessizce ölü koddu.
   *
   * Soru bankası test başına değil TEK sorguyla okunur (bkz.
   * `etiketlereGoreSorular`).
   */
  const TESTLER = await testler();
  const soruHaritasi = await etiketlereGoreSorular(TESTLER.map((test) => test.soruEtiketi));
  const ilgiliTest =
    TESTLER.find((test) => test.konuSlug === girdi.slug) ??
    TESTLER.find((test) =>
      (soruHaritasi.get(test.soruEtiketi ?? '') ?? []).some(
        (soru) => soru.ilgiliAtlas === girdi.slug,
      ),
    );
  const ilgiliHaberler = (await konuyaGoreGundem(girdi.slug)).slice(0, 3);

  return (
    <>
      <OkumaCubugu />
      {yazar && (
        <MakaleSemasi
          tur="TechArticle"
          baslik={`${girdi.ad} nedir?`}
          aciklama={girdi.kisaTanim}
          yol={`/atlas/${girdi.slug}/`}
          yazar={yazar}
          inceleyen={inceleyen}
          yayinTarihi={girdi.yayinTarihi}
          guncellemeTarihi={girdi.guncellemeTarihi}
          bolum={girdi.kategori}
          anahtarlar={girdi.ilgili}
        />
      )}
      {girdi.sss && <SSSSemasi sorular={girdi.sss} />}

      {/* --- Başlık --- */}
      <section className="relative overflow-hidden border-b border-kenar bg-zemin-derin">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="nokta-zemin absolute inset-0 opacity-40" />
          <div className="absolute -top-28 right-1/4 h-64 w-96 rounded-full bg-vurgu/16 blur-[100px]" />
        </div>

        <div className="kap relative py-10 md:py-14">
          <Kirintilar
            ogeler={[
              { ad: 'AI Atlas', yol: '/atlas/' },
              ...(kategori ? [{ ad: kategori.ad, yol: `/atlas/kategori/${kategori.slug}/` }] : []),
              { ad: girdi.ad, yol: `/atlas/${girdi.slug}/` },
            ]}
          />

          <div className="flex flex-wrap items-center gap-2">
            <Rozet ton="vurgu">Atlas girdisi</Rozet>
            <Rozet>{SEVIYE_ADI[girdi.seviye]}</Rozet>
          </div>

          <h1 className="mt-5 max-w-3xl text-[2rem] leading-[1.08] font-semibold tracking-[-0.028em] text-balance sm:text-[2.5rem]">
            {girdi.ad}
          </h1>
          {girdi.altAd && <p className="etiket-mono mt-3 text-metin-soluk">{girdi.altAd}</p>}

          {/* Answer-first: sayfanın ilk cümlesi tanımdır (§56) */}
          <p className="mt-6 max-w-3xl border-l-2 border-vurgu pl-5 font-serif text-lg leading-relaxed text-metin sm:text-xl">
            {girdi.kisaTanim}
          </p>

          {girdi.onkosullar && girdi.onkosullar.length > 0 && (
            <p className="mt-6 text-xs text-metin-soluk">
              <span className="etiket-mono mr-2">Önkoşul</span>
              {girdi.onkosullar.join(' · ')}
            </p>
          )}
        </div>
      </section>

      <IcerikDuzeni
        kenar={
          <>
            <IcindekilerTakipli basliklar={basliklar} />
            {yazar && (
              <YazarSeridi
                yazar={yazar}
                inceleyen={inceleyen}
                yayinTarihi={girdi.yayinTarihi}
                guncellemeTarihi={girdi.guncellemeTarihi}
                sonDogrulama={girdi.sonDogrulama}
              />
            )}
            <IlgiliBaglantilar
              ogeler={ilgiliGirdiler.map((diger) => ({
                ad: diger.ad,
                yol: `/atlas/${diger.slug}/`,
                not: diger.kategori,
              }))}
            />
            {ilgiliTest && (
              <IlgiliBaglantilar
                baslik="Bilgini ölç"
                ogeler={[
                  {
                    ad: ilgiliTest.ad,
                    yol: `/testler/${ilgiliTest.slug}/`,
                    not: `${ilgiliTest.soruSayisi} soru · ${ilgiliTest.dakika} dk`,
                  },
                ]}
              />
            )}
          </>
        }
      >
        {girdi.govde ? (
          <MetinGovdesi bloklar={girdi.govde} />
        ) : (
          <p className="font-serif text-[1.0625rem] leading-relaxed text-metin-ikincil">
            Bu girdinin ayrıntılı gövdesi hazırlanıyor. Yukarıdaki tanım, kavramın alıntılanabilir
            özetidir.
          </p>
        )}

        <div className="mt-12 space-y-10">
          {girdi.sss && <SSSBolumu sorular={girdi.sss} />}
          {girdi.kaynaklar && <KaynakListesi kaynaklar={girdi.kaynaklar} />}
          {girdi.surumler && <SurumGecmisi surumler={girdi.surumler} />}

          {ilgiliHaberler.length > 0 && (
            <section aria-labelledby="ilgili-haber" className="border-t border-kenar pt-8">
              <h2 id="ilgili-haber" className="etiket-mono mb-4 text-metin">
                Bu kavramla ilgili gündem
              </h2>
              <ul className="divide-y divide-kenar-soluk">
                {ilgiliHaberler.map((haber) => (
                  <li key={haber.slug}>
                    <Link href={haber.yol} className="group flex items-start gap-4 py-3.5">
                      <span className="etiket-mono mt-1 w-14 shrink-0 text-metin-soluk">
                        {new Intl.DateTimeFormat('tr-TR', {
                          day: '2-digit',
                          month: 'short',
                        }).format(new Date(haber.yayinTarihi))}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[0.9375rem] font-medium text-metin group-hover:text-vurgu-parlak">
                          {haber.baslik}
                        </span>
                        <span className="mt-1 block text-xs text-metin-soluk">
                          {haber.kisaCevap}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </IcerikDuzeni>

      <KapanisCagrisi
        etiket="LEARN"
        baslik={`${girdi.ad} konusunu uygulamaya dökmek ister misin?`}
        metin="Kavramı okudun; sırada onu bir rotanın içinde öğrenmek ve bir testle ölçmek var."
        eylemler={
          <>
            <Dugme href="/ogren/yollar/">
              Öğrenme yollarına bak
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/atlas/" gorunum="ikincil">
              Atlas&apos;a dön
            </Dugme>
          </>
        }
      />
    </>
  );
}
