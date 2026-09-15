import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { Rozet } from '@/components/arayuz/Rozet';
import { Kod, Ok } from '@/components/arayuz/Ikonlar';
import { KapanisCagrisi } from '@/components/icerik/IcerikDuzeni';
import { MetinGovdesi } from '@/components/icerik/MetinGovdesi';
import { EtkilesimliArac, aracVarMi } from '@/components/lab/AracKayitDefteri';
import { ustveriBirlestir } from '@/lib/seo/ustveri';
import { labBul, labProjeleri } from '@/lib/icerik/lab';
import { atlasListesi } from '@/lib/icerik/atlas';
import { rehberListesi } from '@/lib/icerik/yayin';

export async function generateStaticParams() {
  return (await labProjeleri()).map((proje) => ({ slug: proje.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const proje = await labBul(slug);
  if (!proje) return {};

  // Editörün panelden yazdığı SEO alanları varsayılanların üzerine uygulanır.
  return ustveriBirlestir(proje.seo, {
    baslik: proje.ad,
    aciklama: proje.ozet,
    kanonik: `/lab/${proje.slug}/`,
  });
}

const REHBER_ESLEMESI: Record<string, string[]> = {
  'rag-chunk-hesaplayici': ['turkce-icin-parcalama', 'rag-mimarisi'],
  'baglam-penceresi-hesaplayici': ['rag-mimarisi'],
  'model-secici': ['model-secim-karari'],
  'ai-roi-hesaplayici': ['model-secim-karari'],
  ornekler: ['rag-mimarisi', 'hibrit-arama-kurulumu'],
};

export default async function LabProjeSayfasi({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const proje = await labBul(slug);
  if (!proje) notFound();

  const aracHazir = aracVarMi(proje.slug);
  const [LAB_PROJELERI, ATLAS, REHBERLER] = await Promise.all([
    labProjeleri(),
    atlasListesi(),
    rehberListesi(),
  ]);
  const digerleri = LAB_PROJELERI.filter((diger) => diger.slug !== proje.slug).slice(0, 6);

  // Kavram bağı artık kayıttan gelir; koda gömülü slug tablosu kaldırıldı
  // (bkz. `lab_projeleri.kavramlar` şema notu).
  const kavramlar = (proje.kavramlar ?? [])
    .map((kavramSlug) => ATLAS.find((girdi) => girdi.slug === kavramSlug))
    .filter((girdi): girdi is NonNullable<typeof girdi> => Boolean(girdi));

  const rehberler = (REHBER_ESLEMESI[proje.slug] ?? [])
    .map((rehberSlug) => REHBERLER.find((rehber) => rehber.slug === rehberSlug))
    .filter((rehber): rehber is NonNullable<typeof rehber> => Boolean(rehber));

  /*
   * Bölüm numaraları KOŞULLU bölümlere göre türetilir, elle yazılmaz.
   *
   * Sayfada dört bölümden üçü koşullu (anlatım, kavramlar, rehberler);
   * numaralar sabit yazıldığında gövdesi olmayan bir projede sıra "01, 03,
   * 04" gibi atlıyor, ikisi birden varken de iki bölüm aynı numarayı
   * taşıyordu. Sayaç bir kez kurulur, basılan her bölüm sırayı ilerletir.
   */
  const govdeVar = Boolean(proje.govde && proje.govde.length > 0);
  /*
   * Numaralar render SIRASINDA değil, önceden hesaplanır: render içinde sayaç
   * artırmak `react-hooks/immutability` kuralını bozar (ve çift render'da
   * yanlış sonuç verir). Basılacak bölümler sırayla toplanıp numaraya
   * çevrilir.
   */
  const bolumler = [
    'arac',
    govdeVar && 'yontem',
    kavramlar.length > 0 && 'kavram',
    rehberler.length > 0 && 'rehber',
    'diger',
  ].filter((ad): ad is string => Boolean(ad));
  const numara = (ad: string) => String(bolumler.indexOf(ad) + 1).padStart(2, '0');

  return (
    <>
      <SayfaBasligi
        kirintilar={[
          { ad: 'Lab', yol: '/lab/' },
          { ad: proje.ad, yol: `/lab/${proje.slug}/` },
        ]}
        etiket={`LAB · ${proje.tur.toLocaleUpperCase('tr-TR')}`}
        baslik={proje.ad}
        ozet={proje.ozet}
        eylemler={
          aracHazir ? (
            <Dugme href={`/lab/${proje.slug}/#arac`}>
              <Kod className="size-4" />
              Aracı kullan
            </Dugme>
          ) : (
            <Dugme href="/bulten/" gorunum="ikincil">
              Yayına girdiğinde haber ver
              <Ok className="size-4" />
            </Dugme>
          )
        }
        yan={
          <div className="rounded-2xl border border-kenar bg-yuzey/50 p-5">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-kenar-soluk pb-3.5">
              <p className="etiket-mono text-metin">Durum</p>
              {aracHazir ? <Rozet ton="basari">Çalışıyor</Rozet> : <Rozet>Geliştiriliyor</Rozet>}
            </div>

            {proje.girdiler && proje.girdiler.length > 0 ? (
              <>
                <p className="etiket-mono mb-3 text-metin-soluk">Girdiler</p>
                <dl className="space-y-2.5 text-xs">
                  {proje.girdiler.map((girdi) => (
                    <div key={girdi.etiket} className="flex justify-between gap-4">
                      <dt className="text-metin-ikincil">{girdi.etiket}</dt>
                      <dd className="etiket-mono text-metin-soluk">{girdi.birim}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : (
              <p className="text-xs leading-relaxed text-metin-soluk">
                Bu projenin girdi tanımları, arayüz tasarımıyla birlikte yayımlanacak.
              </p>
            )}

            {aracHazir && (
              <p className="mt-4 border-t border-kenar-soluk pt-3.5 text-[0.6875rem] leading-relaxed text-metin-soluk">
                Hesaplama tarayıcıda yapılır; girdiğiniz değerler sunucuya gönderilmez.
              </p>
            )}
          </div>
        }
        desen="nokta"
      />

      {/* --- Etkileşimli araç --- */}
      <Bolum kimlik="arac">
        {aracHazir ? (
          <>
            <BolumBasligi
              numara={numara('arac')}
              etiket="ARAÇ"
              baslik="Hesapla"
              aciklama="Girdileri değiştirdiğinizde sonuç anında güncellenir. Hangi varsayımın sonucu ne kadar değiştirdiğini görmek için tek tek oynayın."
            />
            <EtkilesimliArac slug={proje.slug} />
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-kenar-guclu bg-zemin-derin p-6 sm:p-10">
            <div className="mx-auto max-w-lg text-center">
              <span className="etiket-mono text-metin-soluk">Geliştiriliyor</span>
              <p className="mt-4 text-lg font-semibold tracking-tight text-metin">
                {proje.ad} henüz yayında değil
              </p>
              <p className="mt-3 text-[0.875rem] leading-relaxed text-metin-ikincil">
                Bu proje geliştirme listesinde. Yayına girdiğinde bültenle duyurulacak; çalışan
                araçları Lab sayfasından görebilirsiniz.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Dugme href="/araclar/hesaplayicilar/" boyut="sm">
                  Çalışan hesaplayıcılar
                </Dugme>
                <Dugme href="/topluluk/katki/" gorunum="ikincil" boyut="sm">
                  Katkıda bulun
                </Dugme>
              </div>
            </div>
          </div>
        )}
      </Bolum>

      {/* --- Anlatım --- */}
      {govdeVar && (
        <Bolum zemin="derin">
          {/*
           * `govde` şemada ve panelde vardı, hiçbir sayfa basmıyordu: araç
           * olmayan projeler (deney, açık kaynak, demo) sitede tek bir özet
           * cümlesiyle görünüyordu. Yöntem, varsayımlar ve sınırlılıklar
           * burada yayına giriyor.
           */}
          <BolumBasligi
            numara={numara('yontem')}
            etiket="YÖNTEM"
            baslik={aracHazir ? 'Hesap nasıl kuruluyor?' : 'Projenin içi'}
            aciklama={
              aracHazir
                ? 'Bir hesaplayıcının değeri sonucunda değil, hangi varsayımla o sonuca vardığındadır.'
                : 'Kurulum, varsayımlar, ölçüm düzeni ve sınırlılıklar.'
            }
          />
          <div className="mt-6 max-w-[72ch]">
            <MetinGovdesi bloklar={proje.govde ?? []} />
          </div>
        </Bolum>
      )}

      {/* --- Kavramlar --- */}
      {kavramlar.length > 0 && (
        <Bolum zemin={govdeVar ? undefined : 'derin'}>
          <BolumBasligi
            numara={numara('kavram')}
            etiket="ATLAS"
            baslik="Aracın arkasındaki kavramlar"
            aciklama="Hesaplayıcı bir kararı hızlandırır; kararın nedenini kavram girdileri anlatır."
            baglantiYolu="/atlas/"
          />
          <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-4">
            {kavramlar.map((girdi) => (
              <li key={girdi.slug}>
                <Link
                  href={`/atlas/${girdi.slug}/`}
                  className="group flex h-full flex-col bg-zemin p-5 transition-colors hover:bg-yuzey/60"
                >
                  <span className="etiket-mono text-metin-soluk">{girdi.kategori}</span>
                  <span className="mt-2 block text-[0.9375rem] font-medium text-metin group-hover:text-vurgu-parlak">
                    {girdi.ad}
                  </span>
                  <span className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-metin-soluk">
                    {girdi.kisaTanim}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Bolum>
      )}

      {/* --- Rehberler --- */}
      {rehberler.length > 0 && (
        <Bolum>
          <BolumBasligi
            numara={numara('rehber')}
            etiket="REHBER"
            baslik="Uygulamaya geçmek için"
            baglantiYolu="/rehber/"
          />
          <ul className="grid gap-4 md:grid-cols-2">
            {rehberler.map((rehber) => (
              <li key={rehber.slug}>
                <Link
                  href={`/rehber/${rehber.slug}/`}
                  className="group flex h-full flex-col rounded-2xl border border-kenar bg-yuzey/40 p-6 transition-colors hover:border-vurgu/45"
                >
                  <span className="etiket-mono text-metin-soluk">
                    {rehber.konu} · {rehber.adimlar} adım
                  </span>
                  <span className="mt-2.5 block text-[1.0625rem] font-semibold tracking-tight text-metin group-hover:text-vurgu-parlak">
                    {rehber.baslik}
                  </span>
                  <span className="mt-2 text-[0.8125rem] leading-relaxed text-metin-ikincil">
                    {rehber.kisaCevap}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Bolum>
      )}

      {/* --- Diğer projeler --- */}
      <Bolum zemin={rehberler.length > 0 ? 'derin' : 'yok'}>
        <BolumBasligi
          numara={numara('diger')}
          etiket="DİĞER PROJELER"
          baslik="Lab'dan"
          baglantiYolu="/lab/"
        />
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-3">
          {digerleri.map((diger) => (
            <li key={diger.slug}>
              <Link
                href={`/lab/${diger.slug}/`}
                className="group flex h-full flex-col bg-zemin p-5 transition-colors hover:bg-yuzey/60"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="etiket-mono text-metin-soluk">{diger.tur}</span>
                  {aracVarMi(diger.slug) ? (
                    <span className="etiket-mono text-basari">Çalışıyor</span>
                  ) : (
                    <span className="etiket-mono text-metin-soluk">Yakında</span>
                  )}
                </span>
                <span className="mt-2 block text-[0.9375rem] font-medium text-metin group-hover:text-sinyal">
                  {diger.ad}
                </span>
                <span className="mt-1.5 text-xs leading-relaxed text-metin-soluk">
                  {diger.ozet}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Bolum>

      <KapanisCagrisi
        etiket="BUILD"
        baslik="Hesap tuttu, sıra uygulamada"
        metin="Aynı hesabı kendi verinizle yapıp mimariyi kurmak için kurumsal destek alabilirsiniz."
        eylemler={
          <>
            <Dugme href="/kurumsal/">
              Kurumsal hizmetler
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/lab/" gorunum="ikincil">
              Lab&apos;a dön
            </Dugme>
          </>
        }
      />
    </>
  );
}
