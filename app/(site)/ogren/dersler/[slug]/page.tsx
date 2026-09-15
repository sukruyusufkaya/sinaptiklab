import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Kirintilar } from '@/components/arayuz/Kirintilar';
import { Rozet } from '@/components/arayuz/Rozet';
import { Dugme } from '@/components/arayuz/Dugme';
import { Ok, Onay } from '@/components/arayuz/Ikonlar';
import { IcerikDuzeni, KapanisCagrisi } from '@/components/icerik/IcerikDuzeni';
import { OkumaCubugu } from '@/components/icerik/OkumaCubugu';
import { IcindekilerTakipli } from '@/components/icerik/IcindekilerTakipli';
import { MetinGovdesi, altBasliklar } from '@/components/icerik/MetinGovdesi';
import { IlgiliBaglantilar, SSSBolumu } from '@/components/icerik/IcerikKenari';
import { SSSSemasi } from '@/lib/seo/jsonld';
import { ustveriBirlestir } from '@/lib/seo/ustveri';
import { dersBul, dersler, testBul, yolBul, yolunDersleri } from '@/lib/icerik/ogrenme';
import { atlasBul } from '@/lib/icerik/atlas';
import { SEVIYE_ADI } from '@/lib/taksonomi';

export async function generateStaticParams() {
  return (await dersler()).map((ders) => ({ slug: ders.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ders = await dersBul(slug);
  if (!ders) return {};

  // Editörün panelden yazdığı SEO alanları varsayılanların üzerine uygulanır;
  // `openGraph` başlığını ve açıklamasını `ustveriBirlestir()` kendisi doldurur.
  return ustveriBirlestir(ders.seo, {
    baslik: ders.ad,
    aciklama: ders.ozet,
    kanonik: `/ogren/dersler/${ders.slug}/`,
    openGraph: { type: 'article' },
  });
}

const DONGU = [
  { ad: 'Teori', tarif: 'Kavramın çalışma mantığı' },
  { ad: 'Örnek', tarif: 'Gerçek bir senaryo üzerinde gösterim' },
  { ad: 'Lab', tarif: 'Uygulamalı alıştırma' },
  { ad: 'Test', tarif: 'Kısa ölçüm' },
  { ad: 'Proje', tarif: 'Rotadaki projeye katkı' },
];

export default async function DersSayfasi({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ders = await dersBul(slug);
  if (!ders) notFound();

  // Kardes dersler ve rota ici sira, rotanin kendi ders listesinden okunur.
  const [yol, yolDersleri] = await Promise.all([yolBul(ders.yolSlug), yolunDersleri(ders.yolSlug)]);
  const kardesler = yolDersleri.filter((diger) => diger.slug !== ders.slug);
  const sira = yolDersleri.findIndex((d) => d.slug === ders.slug);
  const basliklar = altBasliklar(ders.govde);
  const kavramlar = (await Promise.all((ders.kavramlar ?? []).map((s) => atlasBul(s)))).filter(
    (girdi): girdi is NonNullable<typeof girdi> => Boolean(girdi),
  );
  const onkosullar = (await Promise.all((ders.onkosullar ?? []).map((s) => atlasBul(s)))).filter(
    (girdi): girdi is NonNullable<typeof girdi> => Boolean(girdi),
  );
  const test = ders.testSlug ? await testBul(ders.testSlug) : undefined;

  return (
    <>
      <OkumaCubugu />
      {ders.sss && <SSSSemasi sorular={ders.sss} />}

      <section className="relative overflow-hidden border-b border-kenar bg-zemin-derin">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="izgara-zemin absolute inset-0 opacity-45" />
          <div className="absolute -top-24 left-1/4 h-56 w-[26rem] rounded-full bg-vurgu/12 blur-[100px]" />
        </div>
        <div className="kap relative py-10 md:py-14">
          <Kirintilar
            ogeler={[
              { ad: 'Öğren', yol: '/ogren/' },
              { ad: 'Dersler', yol: '/ogren/dersler/' },
              { ad: ders.ad, yol: `/ogren/dersler/${ders.slug}/` },
            ]}
          />

          <div className="flex flex-wrap items-center gap-2">
            <Rozet ton="vurgu">Ders</Rozet>
            <Rozet>{SEVIYE_ADI[ders.seviye]}</Rozet>
            <Rozet>{ders.dakika} dakika</Rozet>
            {sira >= 0 && yol && <Rozet>{`${yol.ad} · ${sira + 1}. ders`}</Rozet>}
          </div>

          <h1 className="mt-5 max-w-3xl text-[1.875rem] leading-[1.1] font-semibold tracking-[-0.028em] text-balance sm:text-[2.375rem]">
            {ders.ad}
          </h1>
          <p className="mt-5 max-w-2xl font-serif text-lg leading-relaxed text-metin-ikincil">
            {ders.ozet}
          </p>

          {onkosullar.length > 0 && (
            <p className="mt-6 text-xs text-metin-soluk">
              Önkoşul:{' '}
              {onkosullar.map((girdi, i) => (
                <span key={girdi.slug}>
                  {i > 0 && ', '}
                  <Link
                    href={`/atlas/${girdi.slug}/`}
                    className="text-vurgu-parlak underline decoration-kenar-guclu underline-offset-2"
                  >
                    {girdi.ad}
                  </Link>
                </span>
              ))}
            </p>
          )}
        </div>
      </section>

      <IcerikDuzeni
        kenar={
          <>
            {basliklar.length > 0 && <IcindekilerTakipli basliklar={basliklar} />}
            {yol && (
              <IlgiliBaglantilar
                baslik="Bu ders şu rotada"
                ogeler={[
                  {
                    ad: yol.ad,
                    yol: `/ogren/yollar/${yol.slug}/`,
                    not: `${yol.bolum} bölüm · ~${yol.saat} sa`,
                  },
                ]}
              />
            )}
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
            {kardesler.length > 0 && (
              <IlgiliBaglantilar
                baslik="Aynı rotadaki dersler"
                ogeler={kardesler.map((diger) => ({
                  ad: diger.ad,
                  yol: `/ogren/dersler/${diger.slug}/`,
                  not: `${diger.dakika} dk`,
                }))}
              />
            )}
          </>
        }
      >
        {/* Öğrenme hedefleri */}
        {ders.hedefler && (
          <section
            aria-labelledby="hedefler"
            className="rounded-2xl border border-vurgu/25 bg-vurgu-zemin/40 p-6"
          >
            <h2 id="hedefler" className="etiket-mono mb-4 text-vurgu-parlak">
              BU DERSİN SONUNDA
            </h2>
            <ul className="space-y-2.5">
              {ders.hedefler.map((hedef) => (
                <li key={hedef} className="flex items-start gap-3">
                  <Onay className="mt-0.5 size-4 shrink-0 text-vurgu-parlak" />
                  <span className="text-[0.9375rem] leading-relaxed text-metin-ikincil">
                    {hedef}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Ders döngüsü */}
        <ol className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-5">
          {DONGU.map((adim, index) => (
            <li key={adim.ad} className="bg-zemin p-4">
              <span className="etiket-mono grid size-6 place-items-center rounded-full border border-vurgu/35 bg-vurgu-zemin text-vurgu-parlak">
                {index + 1}
              </span>
              <p className="mt-3 text-sm font-medium text-metin">{adim.ad}</p>
              <p className="mt-1 text-xs leading-relaxed text-metin-soluk">{adim.tarif}</p>
            </li>
          ))}
        </ol>

        {/* Gövde */}
        <div className="mt-10">
          {ders.govde ? (
            <MetinGovdesi bloklar={ders.govde} />
          ) : (
            <div className="rounded-xl border border-kenar bg-yuzey/40 p-6">
              <p className="etiket-mono mb-3 text-metin-soluk">Ders içeriği</p>
              <p className="text-[0.9375rem] leading-relaxed text-metin-ikincil">
                Bu dersin gövdesi hazırlanıyor. Yayına girdiğinde yukarıdaki beş adımlı döngüyü
                izleyecek ve her adım ilgili Atlas kavramına bağlanacak.
              </p>
            </div>
          )}
        </div>

        {/* Alıştırma */}
        {ders.alistirma && (
          <section
            aria-labelledby="alistirma"
            className="mt-12 overflow-hidden rounded-2xl border border-ikincil/30"
          >
            <div className="border-b border-ikincil/25 bg-ikincil/10 px-6 py-4">
              <p className="etiket-mono text-ikincil-parlak">LAB · UYGULAMALI ALIŞTIRMA</p>
              <h2 id="alistirma" className="mt-2 text-lg font-semibold tracking-tight text-metin">
                {ders.alistirma.baslik}
              </h2>
            </div>
            <div className="bg-yuzey/30 px-6 py-6">
              <ol className="space-y-3">
                {ders.alistirma.adimlar.map((adim, index) => (
                  <li key={adim} className="flex items-start gap-3.5">
                    <span className="etiket-mono mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-kenar bg-zemin text-metin-soluk tabular-nums">
                      {index + 1}
                    </span>
                    <span className="text-[0.9375rem] leading-relaxed text-metin-ikincil">
                      {adim}
                    </span>
                  </li>
                ))}
              </ol>
              <div className="mt-6 rounded-xl border border-kenar bg-zemin/60 p-4">
                <p className="etiket-mono mb-2 text-metin-soluk">Beklenen çıktı</p>
                <p className="text-[0.9375rem] leading-relaxed text-metin">
                  {ders.alistirma.cikti}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* SSS */}
        {ders.sss && (
          <div className="mt-12">
            <SSSBolumu sorular={ders.sss} />
          </div>
        )}

        {/* Ölçüm */}
        {test && (
          <section className="mt-12 rounded-2xl border border-kenar bg-yuzey/40 p-6">
            <p className="etiket-mono mb-3 text-metin-soluk">ÖLÇ</p>
            <h2 className="text-lg font-semibold tracking-tight text-metin">{test.ad}</h2>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-metin-ikincil">
              {test.soruSayisi} soru · {test.dakika} dakika · {test.konu}
            </p>
            <div className="mt-5">
              <Dugme href={`/testler/${test.slug}/`} gorunum="ikincil" boyut="sm">
                Testi çöz
                <Ok className="size-4" />
              </Dugme>
            </div>
          </section>
        )}
      </IcerikDuzeni>

      <KapanisCagrisi
        etiket="LEARN"
        baslik={yol ? `${yol.ad} rotasına devam et` : 'Rotanı seç'}
        metin="Dersler tek başına da okunabilir, ama sıralı ilerlemek önkoşul boşluklarını kapatır."
        eylemler={
          <>
            <Dugme href={yol ? `/ogren/yollar/${yol.slug}/` : '/ogren/yollar/'}>
              Rotayı aç
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/ogren/dersler/" gorunum="ikincil">
              Tüm dersler
            </Dugme>
          </>
        }
      />
    </>
  );
}
