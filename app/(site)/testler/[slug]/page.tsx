import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { BosDurum } from '@/components/arayuz/Filtreler';
import { Hedef, Ok, Onay } from '@/components/arayuz/Ikonlar';
import { KapanisCagrisi } from '@/components/icerik/IcerikDuzeni';
import { TestSemasi } from '@/lib/seo/jsonld';
import { ustveriBirlestir } from '@/lib/seo/ustveri';
import { TestMotoru } from '@/components/test/TestMotoru';
import { ogrenmeYollari, testBul, testiSorulariylaBul, testler } from '@/lib/icerik/ogrenme';
// SEVIYE_BASAMAKLARI ve TEST_ONERILERI yapılandırmadır (skor basamakları ve
// test → rota eşlemesi); hiçbir koleksiyona tohumlanmadı, fixture'da kalıyor.
import { KUME_ONERILERI, SEVIYE_BASAMAKLARI, TEST_ONERILERI } from '@/lib/veri/ogrenme';
import { SEVIYE_ADI } from '@/lib/taksonomi';
import { atlasBul } from '@/lib/icerik/atlas';
import { konuHaritasi } from '@/lib/icerik/temel';

export async function generateStaticParams() {
  return (await testler()).map((test) => ({ slug: test.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const test = await testBul(slug);
  if (!test) return {};

  // Editörün panelden yazdığı SEO alanları varsayılanların üzerine uygulanır.
  return ustveriBirlestir(test.seo, {
    baslik: test.ad,
    aciklama: test.ozet,
    kanonik: `/testler/${test.slug}/`,
  });
}

export default async function TestSayfasi({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const test = await testiSorulariylaBul(slug);
  if (!test) notFound();

  /*
   * "Diğer testler" YAKINLIĞA göre sıralanır, alfabeye göre DEĞİL.
   *
   * Önceki hâli `testler().filter(...).slice(0, 6)` idi: banka 12 testken
   * kabul edilebilirdi, 100 teste çıkınca her test sayfasının altında aynı
   * alfabetik ilk altı test görünüyor — yüz sayfada aynı altı bağlantı, yani
   * öneri değil dolgu. Sıra artık: aynı konunun diğer seviyeleri (en yakın),
   * sonra aynı kümedeki konular, sonra kalanlar.
   */
  const [TUM_TESTLER, KONULAR] = await Promise.all([testler(), konuHaritasi()]);
  const konu = test.konuSlug ? KONULAR.get(test.konuSlug) : undefined;
  const yakinlik = (diger: (typeof TUM_TESTLER)[number]) => {
    if (diger.konuSlug && diger.konuSlug === test.konuSlug) return 0;
    const digerKume = diger.konuSlug ? KONULAR.get(diger.konuSlug)?.kume : undefined;
    if (konu && digerKume && digerKume === konu.kume) return 1;
    return 2;
  };
  const digerleri = TUM_TESTLER.filter((diger) => diger.slug !== test.slug)
    .map((diger) => ({ diger, mesafe: yakinlik(diger) }))
    .sort((a, b) => a.mesafe - b.mesafe || a.diger.ad.localeCompare(b.diger.ad, 'tr'))
    .slice(0, 6)
    .map(({ diger }) => diger);

  /*
   * Rota önerisi: önce test bazında kürelenmiş eşleme, yoksa konu kümesinin
   * önerisi. 12 test için elle yazılmış tablo 100 teste ölçeklenmiyordu;
   * karşılığı olmayan testte bölüm hiç basılmaz (uydurma rota gösterilmez).
   */
  const oneriSlug = TEST_ONERILERI[test.slug] ?? (konu ? KUME_ONERILERI[konu.kume] : undefined);
  const oneriYolu = oneriSlug
    ? (await ogrenmeYollari()).find((yol) => yol.slug === oneriSlug)
    : undefined;
  const ornekler = test.ornekSorular.slice(0, 3);

  // Atlas girdileri JSX içinde çözülemez (okuma artık async): örnek soruların
  // ilgili girdileri önden okunup soru kimliğine göre haritalanır.
  const ornekAtlas = new Map(
    (
      await Promise.all(
        ornekler.map(async (soru) => ({
          kimlik: soru.kimlik,
          girdi: soru.ilgiliAtlas ? await atlasBul(soru.ilgiliAtlas) : undefined,
        })),
      )
    ).map(({ kimlik, girdi }) => [kimlik, girdi] as const),
  );

  return (
    <>
      {test.ornekSorular.length > 0 && (
        <TestSemasi ad={test.ad} aciklama={test.ozet} sorular={test.ornekSorular} />
      )}

      <SayfaBasligi
        kirintilar={[
          { ad: 'Testler', yol: '/testler/' },
          { ad: test.ad, yol: `/testler/${test.slug}/` },
        ]}
        etiket={`${test.konu.toLocaleUpperCase('tr-TR')} · ${SEVIYE_ADI[test.seviye]}`}
        baslik={test.ad}
        ozet={test.ozet}
        olcumler={[
          { deger: `${test.soruSayisi}`, etiket: 'Soru' },
          { deger: `${test.dakika} dk`, etiket: 'Süre' },
          { deger: `${test.olculenBeceriler.length}`, etiket: 'Ölçülen beceri' },
          { deger: SEVIYE_ADI[test.seviye] ?? '—', etiket: 'Seviye' },
        ]}
        eylemler={
          <>
            <Dugme href={`/testler/${test.slug}/#coz`}>
              <Hedef className="size-4" />
              Teste başla
            </Dugme>
            {/*
              Bağ iki yönlü: konu merkezi testlerini `konuSlug` ile listeliyor,
              test de kendi konusuna dönüyor. Konusu çözülemeyen testte satır
              hiç basılmaz — var olmayan sayfaya bağlanmaktan iyidir.
            */}
            {konu ? (
              <Dugme href={`/konu/${konu.slug}/`} gorunum="ikincil">
                {konu.ad} konu merkezi
              </Dugme>
            ) : (
              <Dugme href="/testler/" gorunum="ikincil">
                Diğer testler
              </Dugme>
            )}
          </>
        }
        yan={
          <div className="rounded-2xl border border-kenar bg-yuzey/50 p-5">
            <p className="etiket-mono mb-3.5 text-metin">Kimler çözmeli?</p>
            <p className="text-[0.875rem] leading-relaxed text-metin-ikincil">
              {test.kimlerCozmeli}
            </p>
            <p className="etiket-mono mt-5 mb-2.5 border-t border-kenar-soluk pt-4 text-metin">
              Ölçülen beceriler
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {test.olculenBeceriler.map((beceri) => (
                <li
                  key={beceri}
                  className="rounded-md border border-kenar-soluk bg-zemin/60 px-2 py-1 text-[0.6875rem] text-metin-soluk"
                >
                  {beceri}
                </li>
              ))}
            </ul>
          </div>
        }
      />

      {/* --- Test motoru --- */}
      {test.ornekSorular.length > 0 && (
        <Bolum kimlik="coz">
          <BolumBasligi
            numara="01"
            etiket="ÇÖZ"
            baslik="Testi çöz"
            aciklama="Her cevaptan sonra doğru yanıt ve açıklaması gösterilir. Sonuçta beceri bazlı kırılım ve eksik alan önerisi alırsın."
          />
          <TestMotoru
            testSlug={test.slug}
            sorular={test.ornekSorular}
            basamaklar={SEVIYE_BASAMAKLARI}
            oneri={
              oneriYolu
                ? {
                    ad: oneriYolu.ad,
                    yol: `/ogren/yollar/${oneriYolu.slug}/`,
                    not: `${oneriYolu.bolum} bölüm · ${oneriYolu.seviyeAraligi}`,
                  }
                : undefined
            }
          />
        </Bolum>
      )}

      {/* --- Öğrenme hedefleri --- */}
      <Bolum zemin="derin">
        <BolumBasligi
          numara="02"
          etiket="HEDEFLER"
          baslik="Bu test neyi ölçüyor?"
          aciklama="Test sonrası ne bildiğini değil, hangi beceride eksik olduğunu görürsün."
        />
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-3">
          {test.ogrenmeHedefleri.map((hedef, sira) => (
            <li key={hedef} className="bg-zemin p-6">
              <span className="etiket-mono text-metin-soluk">
                {String(sira + 1).padStart(2, '0')}
              </span>
              <p className="mt-3 text-[0.9375rem] leading-snug font-medium text-metin">{hedef}</p>
            </li>
          ))}
        </ul>
      </Bolum>

      {/* --- Örnek sorular: sayfada görünür (§27) --- */}
      <Bolum>
        <BolumBasligi
          numara="03"
          etiket="ÖRNEK SORULAR"
          baslik="Sorular sayfada görünür"
          aciklama="Eğitim içeriği JavaScript arkasına gizlenmez. Aşağıdaki üç örnek soru, doğru cevapları ve açıklamalarıyla birlikte taranabilir durumdadır."
        />

        {test.ornekSorular.length > 0 ? (
          <ol className="space-y-5">
            {ornekler.map((soru, sira) => {
              const atlas = ornekAtlas.get(soru.kimlik);
              return (
                <li
                  key={soru.kimlik}
                  className="overflow-hidden rounded-2xl border border-kenar bg-yuzey/40"
                >
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-kenar-soluk px-5 py-3.5">
                    <span className="etiket-mono text-vurgu-parlak">
                      Soru {String(sira + 1).padStart(2, '0')}
                    </span>
                    <span className="etiket-mono text-metin-soluk">{soru.kimlik}</span>
                    <span className="etiket-mono text-metin-soluk">
                      {soru.altKonu} · {SEVIYE_ADI[soru.zorluk]} · {soru.beceri}
                    </span>
                  </div>

                  <div className="p-5 sm:p-6">
                    <p className="text-[1.0625rem] leading-snug font-medium text-metin">
                      {soru.soru}
                    </p>

                    <ul className="mt-4 space-y-2">
                      {soru.secenekler.map((secenek, secenekSira) => {
                        const dogru = secenekSira === soru.dogruIndeks;
                        return (
                          <li
                            key={secenek}
                            className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-[0.875rem] ${
                              dogru
                                ? 'border-basari/35 bg-basari/8 text-metin'
                                : 'border-kenar-soluk bg-zemin/40 text-metin-ikincil'
                            }`}
                          >
                            <span
                              className={`etiket-mono mt-0.5 shrink-0 ${dogru ? 'text-basari' : 'text-metin-soluk'}`}
                            >
                              {String.fromCharCode(65 + secenekSira)}
                            </span>
                            <span className="flex-1">{secenek}</span>
                            {dogru && <Onay className="mt-0.5 size-4 shrink-0 text-basari" />}
                          </li>
                        );
                      })}
                    </ul>

                    <div className="mt-4 rounded-xl border border-ikincil/25 bg-ikincil-zemin/40 p-4">
                      <p className="etiket-mono mb-2 text-ikincil">Açıklama</p>
                      <p className="text-[0.875rem] leading-relaxed text-metin-ikincil">
                        {soru.aciklama}
                      </p>
                      {atlas && (
                        <Link
                          href={`/atlas/${atlas.slug}/`}
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-vurgu-parlak"
                        >
                          {atlas.ad} girdisini oku
                          <Ok className="size-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <BosDurum
            baslik="Örnek sorular hazırlanıyor"
            metin={`${test.ad} için soru bankası hazırlanıyor. Yayına girdiğinde örnek sorular, doğru cevapları ve açıklamalarıyla bu sayfada görünecek.`}
            eylem={<Dugme href="/testler/">Yayındaki testler</Dugme>}
          />
        )}
      </Bolum>

      {/* --- Sonuç seviyeleri --- */}
      <Bolum>
        <BolumBasligi numara="04" etiket="SONUÇ" baslik="Skor nasıl okunur?" />
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-4">
          {SEVIYE_BASAMAKLARI.map((basamak) => (
            <li key={basamak.ad} className="bg-zemin p-5">
              <span className={`block size-2.5 rounded-full ${basamak.renk}`} aria-hidden="true" />
              <p className="mt-3 text-[0.9375rem] font-semibold tracking-tight text-metin">
                {basamak.ad}
              </p>
              <p className="etiket-mono mt-1 text-metin-soluk tabular-nums">{basamak.aralik}</p>
              <p className="mt-2.5 text-xs leading-relaxed text-metin-soluk">{basamak.tarif}</p>
            </li>
          ))}
        </ul>
      </Bolum>

      <Bolum zemin="derin">
        <BolumBasligi
          numara="05"
          etiket="DİĞER TESTLER"
          baslik="Ölçmeye devam et"
          baglantiYolu="/testler/"
        />
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-3">
          {digerleri.map((diger) => (
            <li key={diger.slug}>
              <Link
                href={`/testler/${diger.slug}/`}
                className="group flex h-full flex-col bg-zemin p-5 transition-colors hover:bg-yuzey/60"
              >
                <span className="etiket-mono text-metin-soluk">{diger.konu}</span>
                <span className="mt-2 block text-[0.9375rem] font-medium text-metin group-hover:text-vurgu-parlak">
                  {diger.ad}
                </span>
                <span className="etiket-mono mt-2 text-metin-soluk">
                  {diger.soruSayisi} soru · {diger.dakika} dk
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Bolum>

      <KapanisCagrisi
        etiket="LEARN"
        baslik="Eksik çıkan beceriyi kapat"
        metin="Test sonucun beceri grafiğine işlenir; sistem hangi dersle devam etmen gerektiğini söyler."
        eylemler={
          <>
            <Dugme href="/ogren/yollar/">
              Öğrenme yolları
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/seviye-testi/" gorunum="ikincil">
              Genel seviye testi
            </Dugme>
          </>
        }
      />
    </>
  );
}
