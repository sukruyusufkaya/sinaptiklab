import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Kirintilar } from '@/components/arayuz/Kirintilar';
import { Rozet } from '@/components/arayuz/Rozet';
import { Dugme } from '@/components/arayuz/Dugme';
import { Ok, OkSagUst, Saat, Zarf } from '@/components/arayuz/Ikonlar';
import { IcerikDuzeni, KapanisCagrisi } from '@/components/icerik/IcerikDuzeni';
import { OkumaCubugu } from '@/components/icerik/OkumaCubugu';
import { IcindekilerTakipli } from '@/components/icerik/IcindekilerTakipli';
import { MetinGovdesi, altBasliklar } from '@/components/icerik/MetinGovdesi';
import { IlgiliBaglantilar, KaynakListesi } from '@/components/icerik/IcerikKenari';
import { KoseAraclari } from '@/components/icerik/KoseAraclari';
import { MakaleSemasi } from '@/lib/seo/jsonld';
import { ustveriBirlestir } from '@/lib/seo/ustveri';
import { koseYazilari, koseYazisiBul, type KoseYazisi } from '@/lib/icerik/kose';
import { analizler } from '@/lib/icerik/gundem';
import { atlasBul } from '@/lib/icerik/atlas';
import { tarihUzun } from '@/lib/bicim';
import { kelimeSayisi } from '@/lib/metin';
import { SITE } from '@/lib/site';
import type { Yazar } from '@/lib/tipler';

/**
 * Köşe yazısı — imzalı görüş.
 *
 * Analizden farkı biçimde değil SÖZLEŞMEDEDİR (ADR 0004): analiz kendi tezinin
 * güvenini ve yanlışlanma koşulunu yazmak zorundadır; görüş yazısı ise
 * yazarın kişisel değerlendirmesidir ve kanıt yükü yazarın imzasındadır.
 * Sayfa bu farkı okura açıkça söyler ("Bu bir görüş yazısıdır" notu), yazının
 * kullandığı her rakamı da kaynağıyla birlikte ayrı bir şeritte gösterir.
 */

export async function generateStaticParams() {
  return (await koseYazilari()).map((yazi) => ({ slug: yazi.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const yazi = await koseYazisiBul(slug);
  if (!yazi) return {};

  return ustveriBirlestir(yazi.seo, {
    baslik: yazi.baslik,
    aciklama: yazi.ozet ?? yazi.kisaCevap,
    kanonik: yazi.yol,
    openGraph: {
      type: 'article',
      publishedTime: yazi.tarih,
      authors: [yazi.yazar.ad],
      tags: yazi.etiketler,
    },
  });
}

export default async function KoseYazisiSayfasi({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const yazi = await koseYazisiBul(slug);
  if (!yazi) notFound();

  const [tumKose, tumAnaliz, kavramlar] = await Promise.all([
    koseYazilari(),
    analizler(),
    Promise.all((yazi.ilgiliSluglar ?? []).map((s) => atlasBul(s))),
  ]);

  const { yazar } = yazi;
  const basliklar = altBasliklar(yazi.govde);
  const kelime = kelimeSayisi(yazi.govde);
  const adres = `${SITE.url}${yazi.yol}`;
  const ilgiliAnalizler = (yazi.ilgiliIcerik ?? [])
    .map((s) => tumAnaliz.find((analiz) => analiz.slug === s))
    .filter((analiz): analiz is NonNullable<typeof analiz> => Boolean(analiz));
  const gecenKavramlar = kavramlar.filter((girdi): girdi is NonNullable<typeof girdi> =>
    Boolean(girdi),
  );
  const digerKose = tumKose.filter((diger) => diger.slug !== yazi.slug).slice(0, 3);
  const [ustBaslik, altBaslik] = basligiBol(yazi.baslik);

  return (
    <>
      <OkumaCubugu />
      <MakaleSemasi
        tur="OpinionNewsArticle"
        baslik={yazi.baslik}
        aciklama={yazi.kisaCevap}
        yol={yazi.yol}
        yazar={yazar}
        yayinTarihi={yazi.tarih}
        guncellemeTarihi={yazi.guncellemeTarihi}
        bolum="Köşe Yazıları"
        anahtarlar={yazi.etiketler}
        kelimeSayisi={kelime}
      />

      {/* --- GİRİŞ ----------------------------------------------------------- */}
      <header className="relative overflow-hidden border-b border-kenar bg-zemin-derin">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="izgara-zemin absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_70%_80%_at_20%_0%,black,transparent)]" />
          <div className="absolute -top-40 left-[8%] h-80 w-[36rem] rounded-full bg-vurgu/16 blur-[120px]" />
          <div className="absolute -right-24 bottom-0 h-64 w-96 rounded-full bg-ikincil/10 blur-[120px]" />
        </div>

        <div className="kap relative pt-10 pb-12 md:pt-14 md:pb-16">
          <Kirintilar
            ogeler={[
              { ad: 'Dergi', yol: '/dergi/' },
              { ad: 'Köşe Yazıları', yol: '/dergi/kose/' },
              { ad: yazi.baslik, yol: yazi.yol },
            ]}
          />

          <div className="flex flex-wrap items-center gap-2">
            <Rozet ton="vurgu">Köşe yazısı</Rozet>
            <Rozet>Görüş</Rozet>
            {yazi.konu && (
              <Link
                href={`/konu/${yazi.konu.slug}/`}
                className="transition-opacity hover:opacity-80"
              >
                <Rozet ton="ikincil">{yazi.konu.ad}</Rozet>
              </Link>
            )}
          </div>

          <h1 className="mt-7 max-w-5xl font-serif font-semibold tracking-[-0.025em] text-balance">
            {altBaslik ? (
              <>
                <span className="block text-[1.375rem] leading-tight text-metin-ikincil sm:text-[1.75rem]">
                  {ustBaslik}
                </span>
                <span className="gradyan-metin mt-2 block text-[2.25rem] leading-[1.04] sm:text-[3.25rem] lg:text-[4rem]">
                  {altBaslik}
                </span>
              </>
            ) : (
              <span className="block text-[2.25rem] leading-[1.06] sm:text-[3.25rem]">
                {ustBaslik}
              </span>
            )}
          </h1>

          {yazi.ozet && (
            <p className="mt-7 max-w-3xl font-serif text-lg leading-relaxed text-metin-ikincil sm:text-xl">
              {yazi.ozet}
            </p>
          )}

          <Imza
            yazar={yazar}
            tarih={yazi.tarih}
            guncelleme={yazi.guncellemeTarihi}
            okumaDakika={yazi.okumaDakika}
            kelime={kelime}
          />
        </div>
      </header>

      {/* --- TEZ + VERİLER --------------------------------------------------- */}
      <section className="border-b border-kenar" aria-label="Yazının tezi ve dayandığı veriler">
        <div className="kap grid gap-6 py-10 md:py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-10">
          <div className="relative overflow-hidden rounded-2xl border border-vurgu/30 bg-vurgu-zemin/40 p-6 sm:p-7">
            <p className="etiket-mono mb-3 text-vurgu-parlak">Yazının tezi</p>
            <p className="font-serif text-[1.1875rem] leading-relaxed text-metin sm:text-[1.3125rem]">
              {yazi.kisaCevap}
            </p>
          </div>

          {yazi.veriNoktalari && yazi.veriNoktalari.length > 0 && (
            <div>
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <p className="etiket-mono text-metin-soluk">Yazıdaki veriler</p>
                <p className="text-xs text-metin-soluk">Her rakam kaynağına bağlı</p>
              </div>
              <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 xl:grid-cols-3">
                {yazi.veriNoktalari.map((veri) => (
                  <li key={`${veri.deger}-${veri.aciklama}`} className="flex flex-col bg-zemin p-4">
                    <span className="font-mono text-[1.375rem] font-medium tracking-tight text-metin tabular-nums">
                      {veri.deger}
                    </span>
                    <span className="mt-1.5 flex-1 text-[0.8125rem] leading-relaxed text-metin-ikincil">
                      {veri.aciklama}
                    </span>
                    <a
                      href={veri.adres}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="etiket-mono mt-3 inline-flex items-center gap-1 text-metin-soluk transition-colors hover:text-vurgu-parlak"
                    >
                      {veri.kaynak}
                      <OkSagUst className="size-3" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* --- GÖVDE ----------------------------------------------------------- */}
      <IcerikDuzeni
        kenar={
          <>
            {basliklar.length > 0 && <IcindekilerTakipli basliklar={basliklar} />}
            <KoseAraclari adres={adres} baslik={yazi.baslik} kaynakca={kaynakcaSatiri(yazi)} />
            {gecenKavramlar.length > 0 && (
              <IlgiliBaglantilar
                baslik="Yazıda geçen kavramlar"
                ogeler={gecenKavramlar.map((girdi) => ({
                  ad: girdi.ad,
                  yol: `/atlas/${girdi.slug}/`,
                  not: girdi.kategori,
                }))}
              />
            )}
          </>
        }
      >
        <div className="olcu">
          {yazi.govde ? (
            <MetinGovdesi bloklar={yazi.govde} gorunum="kose" />
          ) : (
            <p className="font-serif text-lg leading-relaxed text-metin-ikincil">
              {yazi.kisaCevap}
            </p>
          )}

          {/* İmza: yazar metnin sonunda kendi adıyla durur. */}
          <footer className="mt-14 flex items-center gap-4 border-t border-kenar pt-8">
            <span className="h-px w-8 bg-vurgu" aria-hidden="true" />
            <div>
              <Link
                href={`/yazar/${yazar.slug}/`}
                className="font-serif text-lg font-semibold text-metin transition-colors hover:text-vurgu-parlak"
              >
                {yazar.ad}
              </Link>
              <p className="mt-0.5 font-serif text-[0.9375rem] text-metin-soluk italic">
                {yazar.unvan}
              </p>
            </div>
          </footer>

          {yazi.etiketler && yazi.etiketler.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-2" aria-label="Etiketler">
              {yazi.etiketler.map((etiket) => (
                <li
                  key={etiket}
                  className="etiket-mono rounded-full border border-kenar px-3 py-1.5 text-metin-soluk"
                >
                  #{etiket}
                </li>
              ))}
            </ul>
          )}

          <aside className="mt-10 rounded-2xl border border-kenar bg-yuzey/30 p-5 sm:p-6">
            <p className="etiket-mono mb-2.5 text-metin-soluk">Bu bir görüş yazısıdır</p>
            <p className="text-[0.875rem] leading-relaxed text-metin-ikincil">
              Köşe yazıları yazarının kişisel değerlendirmesini yansıtır ve kanıt yükü yazarın
              imzasındadır. Analizlerden farklı olarak bir tez güveni ya da yanlışlanma koşulu
              taşımaz; ancak metnin kullandığı her rakam yukarıdaki veri şeridinde ve aşağıdaki
              kaynak listesinde birincil kaynağına bağlanır.{' '}
              <Link href="/metodoloji/" className="text-vurgu-parlak hover:text-metin">
                Editoryal ilkeler
              </Link>
            </p>
          </aside>

          {yazi.kaynaklar && yazi.kaynaklar.length > 0 && (
            <div className="mt-12">
              <KaynakListesi kaynaklar={yazi.kaynaklar} />
            </div>
          )}

          <YazarKarti yazar={yazar} />
        </div>
      </IcerikDuzeni>

      {/* --- DEVAMI ---------------------------------------------------------- */}
      {ilgiliAnalizler.length > 0 && (
        <section className="border-t border-kenar bg-zemin-derin">
          <div className="kap py-12 md:py-16">
            <p className="etiket-mono mb-3 text-vurgu-parlak">DERİNLEŞ</p>
            <h2 className="max-w-2xl text-2xl leading-tight font-semibold tracking-tight text-balance sm:text-[1.75rem]">
              Bu yazının açtığı başlıkları kanıtla tartışan analizler
            </h2>
            <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-metin-ikincil">
              Görüş yazısı yönü gösterir; analizler aynı başlıkları tez güveni ve yanlışlanma
              koşuluyla ele alır.
            </p>
            <ul className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-3">
              {ilgiliAnalizler.map((analiz) => (
                <li key={analiz.slug}>
                  <Link
                    href={`/analiz/${analiz.slug}/`}
                    className="group flex h-full flex-col bg-zemin p-6 transition-colors hover:bg-yuzey/60"
                  >
                    <span className="etiket-mono text-metin-soluk">Analiz · {analiz.konu}</span>
                    <span className="mt-2.5 block text-[1.0625rem] leading-snug font-semibold tracking-tight text-metin transition-colors group-hover:text-vurgu-parlak">
                      {analiz.baslik}
                    </span>
                    <span className="mt-2 line-clamp-3 flex-1 text-[0.8125rem] leading-relaxed text-metin-soluk">
                      {analiz.girizgah}
                    </span>
                    <span className="etiket-mono mt-4 inline-flex items-center gap-1.5 text-metin-soluk">
                      <Saat className="size-3.5" />
                      {analiz.okumaDakika} dk
                      <Ok className="ml-auto size-4 transition-transform duration-200 ease-sinaptik group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {digerKose.length > 0 && (
        <section className="border-t border-kenar">
          <div className="kap py-12 md:py-14">
            <p className="etiket-mono mb-5 text-metin-soluk">Diğer köşe yazıları</p>
            <ul className="divide-y divide-kenar-soluk border-y border-kenar-soluk">
              {digerKose.map((diger) => (
                <li key={diger.slug}>
                  <Link
                    href={diger.yol}
                    className="group flex flex-col gap-1.5 py-5 sm:flex-row sm:gap-6"
                  >
                    <span className="etiket-mono w-40 shrink-0 text-metin-soluk">
                      {diger.yazar.ad}
                    </span>
                    <span className="font-serif text-lg font-semibold text-metin transition-colors group-hover:text-vurgu-parlak">
                      {diger.baslik}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <KapanisCagrisi
        etiket="KÖŞE"
        baslik="Yeni köşe yazısı çıktığında ilk sen oku"
        metin="Köşe yazıları gündemin hızına kapılmadan, imzalı ve kaynaklı yayımlanır. Haftalık bültende yeni yazılar ilk sırada yer alır."
        eylemler={
          <>
            <Dugme href="/bulten/">
              <Zarf className="size-4" />
              Bültene katıl
            </Dugme>
            <Dugme href="/dergi/kose/" gorunum="ikincil">
              Tüm köşe yazıları
            </Dugme>
          </>
        }
      />
    </>
  );
}

/* --- PARÇALAR ------------------------------------------------------------- */

/**
 * "Üst başlık: Ana başlık" biçimindeki başlığı iki satıra böler.
 * İki nokta yoksa başlık tek parça kalır; bölme bir sunum kararıdır, metin
 * değişmez (H1'in erişilebilir adı yine başlığın tamamıdır).
 */
function basligiBol(baslik: string): [string, string | undefined] {
  const ayrac = baslik.indexOf(': ');
  if (ayrac < 8) return [baslik, undefined];
  return [`${baslik.slice(0, ayrac)}:`, baslik.slice(ayrac + 2)];
}

/** Türkçe kaynakça satırı (APA biçimine yakın): Soyad, A. B. (Yıl, Gün Ay). Başlık. Yayın. Adres */
function kaynakcaSatiri(yazi: KoseYazisi): string {
  const parcalar = yazi.yazar.ad.trim().split(/\s+/);
  const soyad = parcalar.length > 1 ? parcalar[parcalar.length - 1] : parcalar[0];
  const basHarfler = parcalar
    .slice(0, -1)
    .map((ad) => `${ad.charAt(0)}.`)
    .join(' ');
  const yil = yazi.tarih.slice(0, 4);
  const gunAy = tarihUzun(yazi.tarih).replace(/\s*\d{4}$/, '');
  const yazarAdi = basHarfler ? `${soyad}, ${basHarfler}` : soyad;
  return `${yazarAdi} (${yil}, ${gunAy}). ${yazi.baslik}. ${SITE.ad}. ${SITE.url}${yazi.yol}`;
}

function Imza({
  yazar,
  tarih,
  guncelleme,
  okumaDakika,
  kelime,
}: {
  yazar: Yazar;
  tarih: string;
  guncelleme?: string;
  okumaDakika: number;
  kelime: number;
}) {
  return (
    <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5 border-t border-kenar pt-7">
      <Link href={`/yazar/${yazar.slug}/`} className="group flex items-center gap-3.5">
        <span className="grid size-12 shrink-0 place-items-center rounded-full border border-vurgu/40 bg-vurgu-zemin font-serif text-base font-semibold text-vurgu-parlak shadow-[0_0_0_4px_var(--zemin-derin)]">
          {yazar.basHarfler}
        </span>
        <span>
          <span className="block text-[0.9375rem] font-semibold text-metin transition-colors group-hover:text-vurgu-parlak">
            {yazar.ad}
          </span>
          <span className="mt-0.5 block text-xs text-metin-soluk">{yazar.unvan}</span>
        </span>
      </Link>
      <dl className="flex flex-wrap gap-x-6 gap-y-2">
        <div>
          <dt className="etiket-mono text-metin-soluk">Yayın</dt>
          <dd className="mt-1 text-sm text-metin-ikincil">
            <time dateTime={tarih}>{tarihUzun(tarih)}</time>
          </dd>
        </div>
        {guncelleme && (
          <div>
            <dt className="etiket-mono text-metin-soluk">Güncelleme</dt>
            <dd className="mt-1 text-sm text-metin-ikincil">
              <time dateTime={guncelleme}>{tarihUzun(guncelleme)}</time>
            </dd>
          </div>
        )}
        <div>
          <dt className="etiket-mono text-metin-soluk">Okuma</dt>
          <dd className="mt-1 text-sm text-metin-ikincil">{okumaDakika} dakika</dd>
        </div>
        <div>
          <dt className="etiket-mono text-metin-soluk">Uzunluk</dt>
          <dd className="mt-1 text-sm text-metin-ikincil tabular-nums">
            {kelime.toLocaleString('tr-TR')} kelime
          </dd>
        </div>
      </dl>
    </div>
  );
}

function YazarKarti({ yazar }: { yazar: Yazar }) {
  return (
    <section
      aria-label="Yazar hakkında"
      className="relative mt-12 overflow-hidden rounded-2xl border border-kenar bg-yuzey/40 p-6 sm:p-7"
    >
      <div
        className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-vurgu/10 blur-[60px]"
        aria-hidden="true"
      />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
        <span className="grid size-16 shrink-0 place-items-center rounded-full border border-vurgu/40 bg-vurgu-zemin font-serif text-xl font-semibold text-vurgu-parlak">
          {yazar.basHarfler}
        </span>
        <div className="min-w-0">
          <p className="etiket-mono text-metin-soluk">Yazar</p>
          <p className="mt-1.5 text-lg font-semibold text-metin">{yazar.ad}</p>
          <p className="mt-0.5 text-sm text-metin-soluk">{yazar.unvan}</p>
          {yazar.ozgecmis && (
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-metin-ikincil">
              {yazar.ozgecmis}
            </p>
          )}
          {yazar.uzmanlik && yazar.uzmanlik.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {yazar.uzmanlik.map((alan) => (
                <li key={alan}>
                  <Rozet>{alan}</Rozet>
                </li>
              ))}
            </ul>
          )}
          <Link
            href={`/yazar/${yazar.slug}/`}
            className="etiket-mono mt-5 inline-flex items-center gap-1.5 text-vurgu-parlak transition-colors hover:text-metin"
          >
            Yazarın tüm yazıları
            <Ok className="size-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
