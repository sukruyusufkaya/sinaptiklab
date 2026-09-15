import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { Atlas, Katman, Kod, Ok, Onay, Saat, Terazi } from '@/components/arayuz/Ikonlar';
import { KapanisCagrisi } from '@/components/icerik/IcerikDuzeni';
import { SSSBolumu } from '@/components/icerik/IcerikKenari';
import { MeslekSemasi, SSSSemasi } from '@/lib/seo/jsonld';
import { ustveriBirlestir } from '@/lib/seo/ustveri';
import { labProjeleri, meslekBul, meslekler } from '@/lib/icerik/lab';
import { atlasListesi } from '@/lib/icerik/atlas';
import { testBul, yolBul } from '@/lib/icerik/ogrenme';
import type { MeslekBasamagi, MeslekSeviyesi } from '@/lib/tipler';

/**
 * Meslek sayfası.
 *
 * SAYFANIN OMURGASI KIDEM KIRILIMIDIR. Önceki sürüm "ne yapar" başlığı altında
 * üç madde basıyordu ve bu üç madde işe yeni başlayan biriyle on yıllık birine
 * aynı şeyi söylüyordu — ikisine de yanlış. "Değerlendirme seti kurar" cümlesi
 * bir junior için hedef, bir senior için alt iştir. Basamaklar ayrıldığında
 * okur kendi konumunu bulabilir ve bir sonraki basamağın ne istediğini görür.
 *
 * Her basamak bir KANIT taşır: o basamakta olunduğunu gösteren, gösterilebilir
 * bir iş. Unvanlar kurumdan kuruma değişir, kanıt değişmez — bu yüzden
 * basamaklar unvan değil sorumluluk sınıfı olarak tanımlanır.
 *
 * MAAŞ YOK ve uydurulmayacak: doğrulanmış bir saha araştırması yayımlanana
 * kadar sayfa bunu açıkça söyler (değişmez kural 5).
 */

const BASAMAK_ADI: Record<MeslekBasamagi, string> = {
  giris: 'Giriş',
  orta: 'Orta',
  kidemli: 'Kıdemli',
  lider: 'Lider',
};

const BASAMAK_SIRASI: readonly MeslekBasamagi[] = ['giris', 'orta', 'kidemli', 'lider'];

export async function generateStaticParams() {
  return (await meslekler()).map((meslek) => ({ slug: meslek.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meslek = await meslekBul(slug);
  if (!meslek) return {};

  // Editörün panelden yazdığı SEO alanları varsayılanların üzerine uygulanır.
  return ustveriBirlestir(meslek.seo, {
    baslik: `${meslek.ad} nasıl olunur?`,
    aciklama: meslek.kisaCevap ?? meslek.ozet,
    kanonik: `/kariyer/${meslek.slug}/`,
  });
}

export default async function MeslekSayfasi({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meslek = await meslekBul(slug);
  if (!meslek) notFound();

  const [yol, test, TUM_MESLEKLER, ATLAS, LAB] = await Promise.all([
    meslek.yolSlug ? yolBul(meslek.yolSlug) : undefined,
    meslek.testSlug ? testBul(meslek.testSlug) : undefined,
    meslekler(),
    atlasListesi(),
    labProjeleri(),
  ]);

  const meslekHaritasi = new Map(TUM_MESLEKLER.map((m) => [m.slug, m]));
  const atlasHaritasi = new Map(ATLAS.map((a) => [a.slug, a]));
  const labHaritasi = new Map(LAB.map((l) => [l.slug, l]));

  const seviyeler = [...(meslek.seviyeler ?? [])].sort(
    (a, b) => BASAMAK_SIRASI.indexOf(a.basamak) - BASAMAK_SIRASI.indexOf(b.basamak),
  );

  // Komşular kayıttan gelir ve FARKINI taşır; bulunamayan slug sessizce düşer.
  const komsular = (meslek.komsuMeslekler ?? [])
    .map((k) => ({ ...k, kayit: meslekHaritasi.get(k.slug) }))
    .filter((k) => Boolean(k.kayit));

  const ailedekiler = TUM_MESLEKLER.filter(
    (m) => m.slug !== meslek.slug && m.rolAilesi && m.rolAilesi === meslek.rolAilesi,
  ).slice(0, 6);

  // Bölüm numaraları koşullu bölümler yüzünden sabit yazılamaz; önce sıra
  // kurulur, sonra basılır (render sırasında sayaç artırmak kural 3'e takılır).
  const bolumler = [
    'roller',
    ...(seviyeler.length ? ['basamaklar'] : []),
    ...(meslek.gunlukIs?.length ? ['gun'] : []),
    'beceri',
    ...(meslek.ciktilar?.length || meslek.olcutler?.length ? ['cikti'] : []),
    ...(yol ? ['rota'] : []),
    ...(meslek.portfolyo?.length ? ['portfolyo'] : []),
    ...(meslek.yanlisAnlamalar?.length ? ['yanlis'] : []),
    ...(komsular.length ? ['komsu'] : []),
  ];
  const numara = (anahtar: string) => String(bolumler.indexOf(anahtar) + 1).padStart(2, '0');

  return (
    <>
      <MeslekSemasi
        ad={meslek.ad}
        aciklama={meslek.kisaCevap ?? meslek.ozet}
        yol={`/kariyer/${meslek.slug}/`}
        beceriler={meslek.beceriler}
        sorumluluklar={meslek.neYapar}
        esAdlar={meslek.esAdlar}
        kategori={meslek.rolAilesi}
      />
      {meslek.sss?.length ? <SSSSemasi sorular={meslek.sss} /> : null}

      <SayfaBasligi
        kirintilar={[
          { ad: 'Kariyer', yol: '/kariyer/' },
          { ad: meslek.ad, yol: `/kariyer/${meslek.slug}/` },
        ]}
        etiket={meslek.rolAilesi ? `MESLEK · ${meslek.rolAilesi}` : 'MESLEK'}
        baslik={`${meslek.ad} nasıl olunur?`}
        ozet={meslek.ozet}
        olcumler={[
          { deger: `${meslek.neYapar.length}`, etiket: 'Temel sorumluluk' },
          { deger: `${seviyeler.length || '—'}`, etiket: 'Kıdem basamağı' },
          { deger: `${meslek.beceriler.length}`, etiket: 'Beceri' },
          { deger: yol ? `${yol.bolum}` : '—', etiket: 'Rota bölümü' },
        ]}
        eylemler={
          <>
            {yol && (
              <Dugme href={`/ogren/yollar/${yol.slug}/`}>
                Öğrenme rotasını aç
                <Ok className="size-4" />
              </Dugme>
            )}
            {test && (
              <Dugme href={`/testler/${test.slug}/`} gorunum="ikincil">
                Seviyeni ölç
              </Dugme>
            )}
          </>
        }
      />

      <Bolum zemin="derin">
        {/*
          `esAdlar` bölüm açıklamasında duruyor.
          Alan yalnızca süs değil: arama dizinine ve `Occupation` şemasının
          `alternateName` alanına da giriyor. Aynı iş piyasada hem "ML Engineer"
          hem "Makine Öğrenmesi Mühendisi" diye aranıyor; sayfada hiç
          görünmeseydi okur aradığı unvanın karşılığını bulduğunu anlayamazdı.
        */}
        <BolumBasligi
          numara={numara('roller')}
          etiket="İŞ TANIMI"
          baslik="Ne yapar?"
          aciklama={
            meslek.esAdlar?.length
              ? `Aynı iş şu adlarla da anılır: ${meslek.esAdlar.join(' · ')}`
              : undefined
          }
        />
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-3">
          {meslek.neYapar.map((madde, sira) => (
            <li key={madde} className="bg-zemin p-6">
              <span className="etiket-mono text-vurgu-parlak">
                {String(sira + 1).padStart(2, '0')}
              </span>
              <p className="mt-3 text-[0.9375rem] leading-snug font-medium text-metin">{madde}</p>
            </li>
          ))}
        </ul>
      </Bolum>

      {/* --- Kıdem kırılımı: sayfanın omurgası --- */}
      {seviyeler.length > 0 && (
        <Bolum kimlik="basamaklar">
          <BolumBasligi
            numara={numara('basamaklar')}
            etiket="KIDEM"
            baslik="Basamaklar ve ne değiştiği"
            aciklama="Unvanlar kurumdan kuruma değişir, sorumluluk sınıfları değişmez. Her basamak bir kanıtla eşleşir: o basamakta olduğunuzu gösterebileceğiniz somut bir iş."
          />
          <ol className="space-y-4">
            {seviyeler.map((seviye, sira) => (
              <BasamakKarti key={seviye.basamak} seviye={seviye} sira={sira} />
            ))}
          </ol>
        </Bolum>
      )}

      {/* --- Günlük iş --- */}
      {meslek.gunlukIs?.length ? (
        <Bolum zemin="derin">
          <BolumBasligi
            numara={numara('gun')}
            etiket="BİR GÜN"
            baslik="İş günü neye benziyor?"
            aciklama="Meslek seçimini unvan değil, günün nasıl geçtiği belirler."
          />
          <ol className="relative space-y-0 border-l border-kenar pl-6">
            {meslek.gunlukIs.map((dilim) => (
              <li key={dilim.dilim} className="relative pb-7 last:pb-0">
                <span
                  aria-hidden
                  className="absolute top-1.5 -left-[1.6875rem] size-2.5 rounded-full border-2 border-zemin-derin bg-vurgu"
                />
                <p className="etiket-mono text-vurgu-sonuk">{dilim.dilim}</p>
                <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-metin-ikincil">
                  {dilim.is}
                </p>
              </li>
            ))}
          </ol>
        </Bolum>
      ) : null}

      {/* --- Beceri ve teknoloji --- */}
      <Bolum>
        <BolumBasligi
          numara={numara('beceri')}
          etiket="YETKİNLİK"
          baslik="Beceriler ve araçlar"
          aciklama="Araç listesi hızla değişir; işe alım görüşmelerinde belirleyici olan araçlar değil beceriler."
        />
        <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,22rem)]">
          <div className="rounded-2xl border border-kenar bg-yuzey/40 p-6">
            <p className="etiket-mono mb-4 text-basari">Gerekli beceriler</p>
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {meslek.beceriler.map((beceri) => (
                <li
                  key={beceri}
                  className="flex items-start gap-2.5 text-[0.9375rem] text-metin-ikincil"
                >
                  <Onay className="mt-0.5 size-4 shrink-0 text-basari" />
                  {beceri}
                </li>
              ))}
            </ul>

            {meslek.girisYollari?.length ? (
              <div className="mt-6 border-t border-kenar-soluk pt-5">
                <p className="etiket-mono mb-3 text-metin-soluk">
                  Bu role hangi geçmişlerden gelinir
                </p>
                <ul className="space-y-2">
                  {meslek.girisYollari.map((giris) => (
                    <li key={giris} className="text-[0.875rem] leading-relaxed text-metin-ikincil">
                      {giris}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-kenar bg-yuzey/40 p-6">
              <p className="etiket-mono mb-4 text-ikincil">Teknolojiler</p>
              <ul className="flex flex-wrap gap-2">
                {meslek.teknolojiler.map((teknoloji) => (
                  <li
                    key={teknoloji}
                    className="rounded-full border border-kenar bg-zemin/60 px-3.5 py-1.5 text-xs text-metin-ikincil"
                  >
                    {teknoloji}
                  </li>
                ))}
              </ul>
            </div>

            {meslek.ilgiliAtlas?.length ? (
              <div className="rounded-2xl border border-kenar bg-yuzey/40 p-6">
                <p className="etiket-mono mb-4 text-metin-soluk">Bilmesi gereken kavramlar</p>
                <ul className="space-y-2">
                  {meslek.ilgiliAtlas.map((atlasSlug) => {
                    const girdi = atlasHaritasi.get(atlasSlug);
                    if (!girdi) return null;
                    return (
                      <li key={atlasSlug}>
                        <Link
                          href={`/atlas/${atlasSlug}/`}
                          className="group inline-flex items-center gap-2 text-[0.875rem] text-metin-ikincil transition-colors hover:text-vurgu-parlak"
                        >
                          <Atlas className="size-3.5 text-metin-soluk" />
                          {girdi.ad}
                          <Ok className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </Bolum>

      {/* --- Çıktılar ve ölçütler --- */}
      {(meslek.ciktilar?.length || meslek.olcutler?.length) && (
        <Bolum zemin="derin">
          <BolumBasligi
            numara={numara('cikti')}
            etiket="SONUÇ"
            baslik="Ne üretir, nasıl ölçülür?"
            aciklama="Bir rolün gerçek tanımı unvanında değil, ürettiği çıktıda ve başarısının nasıl ölçüldüğündedir."
          />
          <div className="grid gap-6 lg:grid-cols-2">
            {meslek.ciktilar?.length ? (
              <div className="rounded-2xl border border-kenar bg-yuzey/40 p-6">
                <p className="etiket-mono mb-4 text-metin">Ürettiği çıktılar</p>
                <ul className="space-y-2.5">
                  {meslek.ciktilar.map((cikti) => (
                    <li
                      key={cikti}
                      className="flex items-start gap-2.5 text-[0.9375rem] leading-relaxed text-metin-ikincil"
                    >
                      <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-vurgu" />
                      {cikti}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {meslek.olcutler?.length ? (
              <div className="rounded-2xl border border-kenar bg-yuzey/40 p-6">
                <p className="etiket-mono mb-4 text-metin">Başarı ölçütleri</p>
                <dl className="space-y-4">
                  {meslek.olcutler.map((olcut) => (
                    <div key={olcut.ad}>
                      <dt className="text-[0.9375rem] font-medium text-metin">{olcut.ad}</dt>
                      <dd className="mt-1 text-[0.875rem] leading-relaxed text-metin-ikincil">
                        {olcut.aciklama}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          </div>
        </Bolum>
      )}

      {/* --- Rota --- */}
      {yol && (
        <Bolum>
          <BolumBasligi
            numara={numara('rota')}
            etiket="ROTA"
            baslik="Bu mesleğe çıkan öğrenme yolu"
            baglantiYolu={`/ogren/yollar/${yol.slug}/`}
            baglantiMetni="Rotayı aç"
          />
          <Link
            href={`/ogren/yollar/${yol.slug}/`}
            className="group flex flex-col gap-5 rounded-2xl border border-kenar bg-yuzey/40 p-6 transition-colors hover:border-vurgu/45 sm:flex-row sm:items-center"
          >
            <span className="min-w-0 flex-1">
              <span className="etiket-mono text-metin-soluk">{yol.seviyeAraligi}</span>
              <span className="mt-2 block text-[1.125rem] font-semibold tracking-tight text-metin group-hover:text-vurgu-parlak">
                {yol.ad}
              </span>
              <span className="mt-2 block text-[0.875rem] leading-relaxed text-metin-ikincil">
                {yol.aciklama}
              </span>
            </span>
            <span className="etiket-mono flex shrink-0 items-center gap-4 text-metin-soluk">
              <span className="inline-flex items-center gap-1.5">
                <Katman className="size-3.5" />
                {yol.bolum} bölüm
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Saat className="size-3.5" />~{yol.saat} sa
              </span>
            </span>
          </Link>

          <div className="mt-4 rounded-xl border border-kenar bg-zemin-derin p-5">
            <p className="etiket-mono mb-2 text-metin-soluk">Maaş verisi</p>
            <p className="text-[0.875rem] leading-relaxed text-metin-ikincil">
              Maaş aralıkları, Sinaptik Research&apos;ün saha araştırması yayımlandığında — örneklem
              büyüklüğü, toplama yöntemi ve kaynak bilgisiyle birlikte — bu sayfaya eklenecek.
              Doğrulanmamış aralık yayımlanmaz; bu alanda en çok okunan ve en kolay yanlış
              yönlendiren veri budur.
            </p>
          </div>
        </Bolum>
      )}

      {/* --- Portfolyo --- */}
      {meslek.portfolyo?.length ? (
        <Bolum zemin="derin">
          <BolumBasligi
            numara={numara('portfolyo')}
            etiket="PORTFOLYO"
            baslik="Neyi göstermek işe yarar?"
            aciklama="Çalışan bir demo tek başına yetmez; demolar kolay, kalıcılık zordur. Aşağıdaki her madde belirli bir yetkinliği kanıtlar."
          />
          <ul className="grid gap-4 md:grid-cols-3">
            {meslek.portfolyo.map((oge) => {
              const lab = oge.labSlug ? labHaritasi.get(oge.labSlug) : undefined;
              return (
                <li
                  key={oge.ad}
                  className="flex flex-col rounded-2xl border border-kenar bg-yuzey/40 p-6"
                >
                  <p className="text-[0.9375rem] font-semibold tracking-tight text-metin">
                    {oge.ad}
                  </p>
                  <p className="mt-2.5 text-[0.875rem] leading-relaxed text-metin-ikincil">
                    {oge.aciklama}
                  </p>
                  {oge.kanit && (
                    <p className="mt-3 border-l-2 border-vurgu/40 pl-3 text-[0.8125rem] leading-relaxed text-metin-soluk">
                      <span className="text-vurgu-sonuk">Neyi kanıtlar:</span> {oge.kanit}
                    </p>
                  )}
                  {lab && (
                    <Link
                      href={`/lab/${lab.slug}/`}
                      className="etiket-mono mt-auto inline-flex items-center gap-1.5 pt-5 text-vurgu-parlak transition-colors hover:text-vurgu-sonuk"
                    >
                      <Kod className="size-3.5" />
                      {lab.ad}
                      <Ok className="size-3" />
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </Bolum>
      ) : null}

      {/* --- Yanlış anlamalar --- */}
      {meslek.yanlisAnlamalar?.length ? (
        <Bolum>
          <BolumBasligi
            numara={numara('yanlis')}
            etiket="DÜZELTME"
            baslik="Sık duyulan ama yanlış"
          />
          <ul className="divide-y divide-kenar-soluk overflow-hidden rounded-2xl border border-kenar">
            {meslek.yanlisAnlamalar.map((yanlis) => (
              <li key={yanlis.iddia} className="grid gap-3 bg-yuzey/25 p-6 md:grid-cols-2 md:gap-8">
                <p className="text-[0.9375rem] leading-relaxed text-metin-soluk line-through decoration-tehlike/50">
                  {yanlis.iddia}
                </p>
                <p className="text-[0.9375rem] leading-relaxed text-metin-ikincil">
                  {yanlis.gercek}
                </p>
              </li>
            ))}
          </ul>
        </Bolum>
      ) : null}

      {/* --- Komşu meslekler --- */}
      {komsular.length > 0 && (
        <Bolum zemin="derin">
          <BolumBasligi
            numara={numara('komsu')}
            etiket="KOMŞU MESLEKLER"
            baslik="Bununla karıştırılanlar"
            aciklama="Kariyer kararı çoğunlukla 'bu meslek nedir' değil 'bununla şu arasındaki fark nedir' sorusudur."
            baglantiYolu="/kariyer/"
          />
          <ul className="space-y-3">
            {komsular.map((komsu) => (
              <li key={komsu.slug}>
                <Link
                  href={`/kariyer/${komsu.slug}/`}
                  className="group flex flex-col gap-3 rounded-2xl border border-kenar bg-zemin p-6 transition-colors hover:border-vurgu/45 sm:flex-row sm:items-start sm:gap-6"
                >
                  <span className="flex shrink-0 items-center gap-2.5 sm:w-60">
                    <Terazi className="size-4 text-metin-soluk" />
                    <span className="text-[0.9375rem] font-semibold tracking-tight text-metin group-hover:text-vurgu-parlak">
                      {komsu.kayit!.ad}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1 text-[0.875rem] leading-relaxed text-metin-ikincil">
                    {komsu.fark}
                  </span>
                  <Ok className="hidden size-4 shrink-0 self-center text-metin-soluk transition-transform duration-200 ease-sinaptik group-hover:translate-x-0.5 sm:block" />
                </Link>
              </li>
            ))}
          </ul>

          {ailedekiler.length > 0 && (
            <>
              <p className="etiket-mono mt-8 mb-3 text-metin-soluk">
                Aynı rol ailesinden: {meslek.rolAilesi}
              </p>
              <ul className="flex flex-wrap gap-2">
                {ailedekiler.map((diger) => (
                  <li key={diger.slug}>
                    <Link
                      href={`/kariyer/${diger.slug}/`}
                      className="inline-flex rounded-full border border-kenar bg-zemin/60 px-3.5 py-1.5 text-[0.8125rem] text-metin-ikincil transition-colors hover:border-vurgu/45 hover:text-vurgu-parlak"
                    >
                      {diger.ad}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Bolum>
      )}

      {meslek.sss?.length ? (
        <Bolum>
          <div className="olcu">
            <SSSBolumu sorular={meslek.sss} />
          </div>
        </Bolum>
      ) : null}

      <KapanisCagrisi
        etiket="LEARN"
        baslik="Nereden başlayacağını bilmiyorsan önce ölç"
        metin="Seviye testi, mevcut becerilerine göre hangi bölümden başlaman gerektiğini söyler."
        eylemler={
          <>
            <Dugme href="/seviye-testi/">
              Seviye testini çöz
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/ogren/yollar/" gorunum="ikincil">
              Tüm rotalar
            </Dugme>
          </>
        }
      />
    </>
  );
}

function BasamakKarti({ seviye, sira }: { seviye: MeslekSeviyesi; sira: number }) {
  return (
    <li className="overflow-hidden rounded-2xl border border-kenar bg-yuzey/40">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-kenar-soluk bg-zemin-derin px-6 py-4">
        <span className="etiket-mono grid size-7 shrink-0 place-items-center rounded-full border border-vurgu/35 bg-vurgu-zemin text-vurgu-parlak">
          {sira + 1}
        </span>
        <span className="text-[1.0625rem] font-semibold tracking-tight text-metin">
          {seviye.ad}
        </span>
        <span className="etiket-mono ml-auto rounded-full border border-kenar px-2.5 py-1 text-metin-soluk">
          {BASAMAK_ADI[seviye.basamak]}
        </span>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,20rem)_1fr]">
        <div>
          <p className="etiket-mono mb-2 text-metin-soluk">Odak</p>
          <p className="text-[0.9375rem] leading-relaxed text-metin-ikincil">{seviye.odak}</p>
          {seviye.kanit && (
            <div className="mt-5 rounded-xl border border-basari/25 bg-basari/8 p-4">
              <p className="etiket-mono mb-1.5 text-basari">Bu basamağın kanıtı</p>
              <p className="text-[0.8125rem] leading-relaxed text-metin-ikincil">{seviye.kanit}</p>
            </div>
          )}
        </div>

        <div>
          <p className="etiket-mono mb-3 text-metin-soluk">Sorumluluklar</p>
          <ul className="space-y-2.5">
            {seviye.sorumluluklar.map((sorumluluk) => (
              <li
                key={sorumluluk}
                className="flex items-start gap-2.5 text-[0.9375rem] leading-relaxed text-metin-ikincil"
              >
                <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-vurgu" />
                {sorumluluk}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
}
