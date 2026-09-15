import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Kirintilar } from '@/components/arayuz/Kirintilar';
import { Rozet } from '@/components/arayuz/Rozet';
import { Dugme } from '@/components/arayuz/Dugme';
import { Ok } from '@/components/arayuz/Ikonlar';
import { IcerikDuzeni, KapanisCagrisi } from '@/components/icerik/IcerikDuzeni';
import { OkumaCubugu } from '@/components/icerik/OkumaCubugu';
import { IcindekilerTakipli } from '@/components/icerik/IcindekilerTakipli';
import {
  IlgiliBaglantilar,
  KaynakListesi,
  SSSBolumu,
  YazarSeridi,
} from '@/components/icerik/IcerikKenari';
import { MetinGovdesi } from '@/components/icerik/MetinGovdesi';
import { Onay } from '@/components/arayuz/Ikonlar';
import { MakaleSemasi, NasilYapilirSemasi, SSSSemasi } from '@/lib/seo/jsonld';
import { ustveriBirlestir } from '@/lib/seo/ustveri';
import { rehberBul, rehberListesi } from '@/lib/icerik/yayin';
import { yazarBul } from '@/lib/icerik/temel';
import { SEVIYE_ADI } from '@/lib/taksonomi';
import { atlasBul, atlasListesi } from '@/lib/icerik/atlas';

export async function generateStaticParams() {
  return (await rehberListesi()).map((rehber) => ({ slug: rehber.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const rehber = await rehberBul(slug);
  if (!rehber) return {};

  // Editorun panelden yazdigi SEO alanlari varsayilanlarin uzerine uygulanir.
  return ustveriBirlestir(rehber.seo, {
    baslik: rehber.baslik,
    aciklama: rehber.kisaCevap,
    kanonik: `/rehber/${rehber.slug}/`,
    openGraph: { type: 'article' },
  });
}

export default async function RehberSayfasi({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rehber = await rehberBul(slug);
  if (!rehber) notFound();

  const yazar = await yazarBul(rehber.yazarSlug);
  const adimlar = rehber.adimListesi ?? [];
  const isaretliKavramlar = (
    await Promise.all((rehber.ilgiliSluglar ?? []).map((kavram) => atlasBul(kavram)))
  ).filter((girdi): girdi is NonNullable<typeof girdi> => Boolean(girdi));
  const ilgiliKavramlar = isaretliKavramlar.length
    ? isaretliKavramlar
    : (await atlasListesi())
        .filter((girdi) => girdi.kategori.includes(rehber.konu) || girdi.ad.includes(rehber.konu))
        .slice(0, 5);
  const digerRehberler = (await rehberListesi())
    .filter((diger) => diger.slug !== rehber.slug && diger.konu === rehber.konu)
    .slice(0, 4);

  return (
    <>
      <OkumaCubugu />
      {/* Sema yazar nesnesi ister; imza cozulemezse sema basilmaz. */}
      {yazar && (
        <MakaleSemasi
          tur="TechArticle"
          baslik={rehber.baslik}
          aciklama={rehber.kisaCevap}
          yol={`/rehber/${rehber.slug}/`}
          yazar={yazar}
          yayinTarihi={rehber.tarih}
          bolum={rehber.konu}
        />
      )}
      {rehber.sss && <SSSSemasi sorular={rehber.sss} />}
      {/*
        Adımlı rehber için doğru yapılandırılmış veri tipi `HowTo`;
        `Article` yalnızca metni tanımlar, adımları tanımlamaz.
      */}
      <NasilYapilirSemasi
        ad={rehber.baslik}
        aciklama={rehber.kisaCevap}
        yol={`/rehber/${rehber.slug}/`}
        adimlar={(rehber.adimListesi ?? []).map((adim) => ({ ad: adim.ad, ozet: adim.ozet }))}
        araclar={rehber.araclar}
        onKosullar={rehber.onKosullar}
      />

      <section className="relative overflow-hidden border-b border-kenar bg-zemin-derin">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="izgara-zemin absolute inset-0 opacity-45" />
          <div className="absolute -top-28 left-1/3 h-64 w-96 rounded-full bg-vurgu/14 blur-[100px]" />
        </div>

        <div className="kap relative py-10 md:py-14">
          <Kirintilar
            ogeler={[
              { ad: 'Rehberler', yol: '/rehber/' },
              { ad: rehber.baslik, yol: `/rehber/${rehber.slug}/` },
            ]}
          />

          <div className="flex flex-wrap items-center gap-2">
            <Rozet ton="vurgu">Rehber</Rozet>
            <Rozet>{SEVIYE_ADI[rehber.seviye]}</Rozet>
            <Rozet>{rehber.konu}</Rozet>
          </div>

          <h1 className="mt-5 max-w-3xl text-[2rem] leading-[1.08] font-semibold tracking-[-0.028em] text-balance sm:text-[2.5rem]">
            {rehber.baslik}
          </h1>

          <p className="mt-6 max-w-3xl border-l-2 border-vurgu pl-5 font-serif text-lg leading-relaxed text-metin">
            {rehber.kisaCevap}
          </p>
        </div>
      </section>

      <IcerikDuzeni
        kenar={
          <>
            <IcindekilerTakipli
              basliklar={[
                ...adimlar.map((adim, sira) => ({
                  kimlik: `adim-${sira + 1}`,
                  metin: adim.ad,
                })),
                ...(rehber.tuzaklar ? [{ kimlik: 'tuzaklar', metin: 'Sık düşülen tuzaklar' }] : []),
                ...(rehber.kontrolListesi
                  ? [{ kimlik: 'kontrol-listesi', metin: 'Kontrol listesi' }]
                  : []),
              ]}
            />
            {yazar && (
              <YazarSeridi
                yazar={yazar}
                yayinTarihi={rehber.tarih}
                okumaDakika={rehber.okumaDakika}
              />
            )}
            <IlgiliBaglantilar
              ogeler={ilgiliKavramlar.map((girdi) => ({
                ad: girdi.ad,
                yol: `/atlas/${girdi.slug}/`,
                not: girdi.kategori,
              }))}
            />
            {digerRehberler.length > 0 && (
              <IlgiliBaglantilar
                baslik="Aynı konudaki rehberler"
                ogeler={digerRehberler.map((diger) => ({
                  ad: diger.baslik,
                  yol: `/rehber/${diger.slug}/`,
                  not: `${diger.adimlar} adım`,
                }))}
              />
            )}
          </>
        }
      >
        {/* Onkosul ve araclar */}
        {(rehber.onKosullar || rehber.araclar) && (
          <div className="mb-10 grid gap-4 sm:grid-cols-2">
            {rehber.onKosullar && (
              <section
                aria-labelledby="onkosullar"
                className="rounded-2xl border border-kenar bg-yuzey/40 p-5"
              >
                <h2 id="onkosullar" className="etiket-mono mb-3.5 text-metin-soluk">
                  ÖNKOŞULLAR
                </h2>
                <ul className="space-y-2">
                  {rehber.onKosullar.map((madde) => (
                    <li key={madde} className="flex items-start gap-2.5">
                      <span
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-kenar-guclu"
                        aria-hidden="true"
                      />
                      <span className="text-[0.875rem] leading-relaxed text-metin-ikincil">
                        {madde}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {rehber.araclar && (
              <section
                aria-labelledby="araclar"
                className="rounded-2xl border border-kenar bg-yuzey/40 p-5"
              >
                <h2 id="araclar" className="etiket-mono mb-3.5 text-metin-soluk">
                  GEREKEN ARAÇLAR
                </h2>
                <ul className="space-y-2">
                  {rehber.araclar.map((madde) => (
                    <li key={madde} className="flex items-start gap-2.5">
                      <span
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-kenar-guclu"
                        aria-hidden="true"
                      />
                      <span className="text-[0.875rem] leading-relaxed text-metin-ikincil">
                        {madde}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        <ol className="space-y-12">
          {adimlar.map((adim, sira) => (
            <li key={adim.ad} id={`adim-${sira + 1}`} className="scroll-mt-28">
              <div className="flex items-start gap-4">
                <span className="etiket-mono grid size-8 shrink-0 place-items-center rounded-full border border-vurgu/35 bg-vurgu-zemin text-vurgu-parlak">
                  {String(sira + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 pt-1">
                  <h2 className="text-lg font-semibold tracking-tight sm:text-xl">{adim.ad}</h2>
                  <p className="mt-2.5 font-serif text-[1.0625rem] leading-relaxed text-metin-ikincil">
                    {adim.ozet}
                  </p>
                </div>
              </div>
              {adim.ayrinti && (
                <div className="mt-6 sm:pl-12">
                  <MetinGovdesi bloklar={adim.ayrinti} />
                </div>
              )}
            </li>
          ))}
        </ol>

        {/* Tuzaklar */}
        {rehber.tuzaklar && (
          <section aria-labelledby="tuzaklar" className="mt-14">
            <h2 id="tuzaklar" className="etiket-mono mb-5 text-uyari">
              SIK DÜŞÜLEN TUZAKLAR
            </h2>
            <ul className="grid gap-px overflow-hidden rounded-2xl border border-uyari/25 bg-uyari/20 sm:grid-cols-2">
              {rehber.tuzaklar.map((tuzak) => (
                <li key={tuzak.baslik} className="bg-zemin p-5">
                  <p className="text-[0.9375rem] font-semibold tracking-tight text-metin">
                    {tuzak.baslik}
                  </p>
                  <p className="mt-2 text-[0.875rem] leading-relaxed text-metin-ikincil">
                    {tuzak.aciklama}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Kontrol listesi */}
        {rehber.kontrolListesi && (
          <section
            aria-labelledby="kontrol-listesi"
            className="mt-14 rounded-2xl border border-basari/25 bg-basari/8 p-6"
          >
            <h2 id="kontrol-listesi" className="etiket-mono mb-4 text-basari">
              KONTROL LİSTESİ
            </h2>
            <ul className="space-y-2.5">
              {rehber.kontrolListesi.map((madde) => (
                <li key={madde} className="flex items-start gap-3">
                  <Onay className="mt-0.5 size-4 shrink-0 text-basari" />
                  <span className="text-[0.9375rem] leading-relaxed text-metin-ikincil">
                    {madde}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-5 border-t border-basari/20 pt-3.5 text-xs text-metin-soluk">
              Maddelerin tamamı işaretlenmeden kurulum üretime alınmamalı.
            </p>
          </section>
        )}

        {adimlar.length === 0 && (
          <p className="font-serif text-[1.0625rem] leading-relaxed text-metin-ikincil">
            Bu rehberin adım gövdesi hazırlanıyor. Yukarıdaki cevap, konunun alıntılanabilir
            özetidir.
          </p>
        )}

        {rehber.sss && (
          <div className="mt-14">
            <SSSBolumu sorular={rehber.sss} />
          </div>
        )}

        {rehber.kaynaklar && (
          <div className="mt-12">
            <KaynakListesi kaynaklar={rehber.kaynaklar} />
          </div>
        )}
      </IcerikDuzeni>

      <KapanisCagrisi
        etiket="BUILD"
        baslik="Bu rehberi kurumunuzda uygulayalım mı?"
        metin="Aynı mimariyi kendi verinizle kurmak için discovery oturumundan üretime kadar birlikte ilerliyoruz."
        eylemler={
          <>
            <Dugme href="/kurumsal/">
              Kurumsal hizmetler
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/rehber/" gorunum="ikincil">
              Diğer rehberler
            </Dugme>
          </>
        }
      />
    </>
  );
}
