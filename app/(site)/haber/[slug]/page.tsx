import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Kirintilar } from '@/components/arayuz/Kirintilar';
import { Rozet } from '@/components/arayuz/Rozet';
import { Dugme } from '@/components/arayuz/Dugme';
import { Ok } from '@/components/arayuz/Ikonlar';
import { IcerikDuzeni, KapanisCagrisi } from '@/components/icerik/IcerikDuzeni';
import { OkumaCubugu } from '@/components/icerik/OkumaCubugu';
import { IcindekilerTakipli } from '@/components/icerik/IcindekilerTakipli';
import { MetinGovdesi, altBasliklar } from '@/components/icerik/MetinGovdesi';
import { IlgiliBaglantilar, KaynakListesi, YazarSeridi } from '@/components/icerik/IcerikKenari';
import { MakaleSemasi } from '@/lib/seo/jsonld';
import { ustveriBirlestir } from '@/lib/seo/ustveri';
import { GUNDEM_KATEGORILERI, gundemBul, tumGundem } from '@/lib/icerik/gundem';
import { atlasBul } from '@/lib/icerik/atlas';
import { TUR_ADI } from '@/lib/taksonomi';
import { tarihKisa, tarihUzun } from '@/lib/bicim';

export async function generateStaticParams() {
  return (await tumGundem()).map((icerik) => ({ slug: icerik.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const icerik = await gundemBul(slug);
  if (!icerik) return {};

  // Editorun panelden yazdigi SEO alanlari varsayilanlarin uzerine uygulanir.
  return ustveriBirlestir(icerik.seo, {
    baslik: icerik.baslik,
    aciklama: icerik.kisaCevap,
    kanonik: icerik.yol,
    openGraph: { type: 'article', publishedTime: icerik.yayinTarihi },
  });
}

export default async function HaberSayfasi({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const icerik = await gundemBul(slug);
  if (!icerik) notFound();

  const kategori = GUNDEM_KATEGORILERI.find((k) => k.slug === icerik.konu.slug);
  const basliklar = altBasliklar(icerik.govde);
  const kavramlar = (
    await Promise.all((icerik.ilgiliSluglar ?? []).map((slug) => atlasBul(slug)))
  ).filter((girdi): girdi is NonNullable<typeof girdi> => Boolean(girdi));
  const digerHaberler = (await tumGundem())
    .filter((diger) => diger.slug !== icerik.slug && diger.konu.slug === icerik.konu.slug)
    .slice(0, 4);

  return (
    <>
      <OkumaCubugu />
      <MakaleSemasi
        tur={icerik.tur === 'haber' ? 'NewsArticle' : 'Article'}
        baslik={icerik.baslik}
        aciklama={icerik.kisaCevap}
        yol={icerik.yol}
        yazar={icerik.yazar}
        yayinTarihi={icerik.yayinTarihi}
        guncellemeTarihi={icerik.guncellemeTarihi}
        bolum={icerik.konu.ad}
        anahtarlar={icerik.etiketler}
      />

      <section className="relative overflow-hidden border-b border-kenar bg-zemin-derin">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="izgara-zemin absolute inset-0 opacity-45" />
          <div className="absolute -top-28 left-1/4 h-64 w-[28rem] rounded-full bg-vurgu/14 blur-[100px]" />
        </div>

        <div className="kap relative py-10 md:py-14">
          <Kirintilar
            ogeler={[
              { ad: 'Gündem', yol: '/gundem/' },
              ...(kategori ? [{ ad: kategori.ad, yol: kategori.yol }] : []),
              { ad: icerik.baslik, yol: icerik.yol },
            ]}
          />

          <div className="flex flex-wrap items-center gap-2">
            <Rozet ton="vurgu">{TUR_ADI[icerik.tur]}</Rozet>
            <Rozet>{icerik.konu.ad}</Rozet>
            {icerik.etiketler?.slice(0, 2).map((etiket) => (
              <Rozet key={etiket}>{etiket}</Rozet>
            ))}
          </div>

          <h1 className="mt-5 max-w-4xl text-[1.875rem] leading-[1.1] font-semibold tracking-[-0.028em] text-balance sm:text-[2.375rem]">
            {icerik.baslik}
          </h1>

          {/* Answer-first (§56) */}
          <p className="mt-6 max-w-3xl border-l-2 border-vurgu pl-5 font-serif text-lg leading-relaxed text-metin">
            {icerik.kisaCevap}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-metin-soluk">
            <Link
              href={`/yazar/${icerik.yazar.slug}/`}
              className="inline-flex items-center gap-2.5 transition-colors hover:text-metin"
            >
              <span className="etiket-mono grid size-8 place-items-center rounded-full border border-kenar bg-yuzey-2 text-metin-ikincil">
                {icerik.yazar.basHarfler}
              </span>
              <span className="font-medium text-metin-ikincil">{icerik.yazar.ad}</span>
            </Link>
            <span className="size-1 rounded-full bg-kenar-guclu" aria-hidden="true" />
            <time dateTime={icerik.yayinTarihi}>{tarihUzun(icerik.yayinTarihi)}</time>
            <span className="size-1 rounded-full bg-kenar-guclu" aria-hidden="true" />
            <span>{icerik.okumaDakika} dakikalık okuma</span>
          </div>
        </div>
      </section>

      <IcerikDuzeni
        kenar={
          <>
            {basliklar.length > 0 && <IcindekilerTakipli basliklar={basliklar} />}
            <YazarSeridi
              yazar={icerik.yazar}
              yayinTarihi={icerik.yayinTarihi}
              guncellemeTarihi={icerik.guncellemeTarihi}
              okumaDakika={icerik.okumaDakika}
            />
            {kavramlar.length > 0 && (
              <IlgiliBaglantilar
                baslik="Geçen kavramlar"
                ogeler={kavramlar.map((girdi) => ({
                  ad: girdi.ad,
                  yol: `/atlas/${girdi.slug}/`,
                  not: girdi.kategori,
                }))}
              />
            )}
            <IlgiliBaglantilar
              baslik="Konu merkezi"
              ogeler={[
                {
                  ad: icerik.konu.ad,
                  yol: `/konu/${icerik.konu.slug}/`,
                  not: 'Tüm formatlar tek sayfada',
                },
              ]}
            />
          </>
        }
      >
        {icerik.govde ? (
          <MetinGovdesi bloklar={icerik.govde} />
        ) : (
          <div className="space-y-6">
            {icerik.ozet && (
              <p className="font-serif text-[1.0625rem] leading-[1.75] text-metin-ikincil">
                {icerik.ozet}
              </p>
            )}
            <div className="rounded-xl border border-kenar bg-yuzey/40 p-5">
              <p className="etiket-mono mb-2 text-metin-soluk">Editoryal not</p>
              <p className="text-[0.9375rem] leading-relaxed text-metin-ikincil">
                Bu haberin tam gövdesi hazırlanıyor. Yayına girdiğinde şu şablonu izleyecek: ne oldu
                · neden önemli · teknik detay · kimleri etkiliyor · Sinaptik yorumu · kaynak.
              </p>
            </div>
          </div>
        )}

        {icerik.kaynaklar && (
          <div className="mt-12">
            <KaynakListesi kaynaklar={icerik.kaynaklar} />
          </div>
        )}

        {digerHaberler.length > 0 && (
          <section aria-labelledby="devami" className="mt-12 border-t border-kenar pt-8">
            <h2 id="devami" className="etiket-mono mb-4 text-metin">
              {icerik.konu.ad} akışından
            </h2>
            <ul className="divide-y divide-kenar-soluk">
              {digerHaberler.map((diger) => (
                <li key={diger.slug}>
                  <Link href={diger.yol} className="group flex items-start gap-4 py-3.5">
                    <span className="etiket-mono mt-1 w-14 shrink-0 text-metin-soluk">
                      {tarihKisa(diger.yayinTarihi)}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[0.9375rem] font-medium text-metin group-hover:text-vurgu-parlak">
                        {diger.baslik}
                      </span>
                      <span className="mt-1 block text-xs text-metin-soluk">{diger.kisaCevap}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </IcerikDuzeni>

      <KapanisCagrisi
        etiket="DISCOVER"
        baslik="Bunu kaçırmamak için günlük Brief'e katıl"
        metin="Her sabah bilmeniz gereken beş gelişme, beş dakikada okunacak biçimde e-postanıza gelir."
        eylemler={
          <>
            <Dugme href="/bulten/">
              Sinaptik Daily&apos;e katıl
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/gundem/" gorunum="ikincil">
              Gündeme dön
            </Dugme>
          </>
        }
      />
    </>
  );
}
