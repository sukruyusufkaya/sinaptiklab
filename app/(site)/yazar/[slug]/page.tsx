import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { BosDurum } from '@/components/arayuz/Filtreler';
import { Ok, Saat } from '@/components/arayuz/Ikonlar';
import { ProfilSemasi } from '@/lib/seo/jsonld';
import { ustveriBirlestir } from '@/lib/seo/ustveri';
import { yazarListesi } from '@/lib/icerik/temel';
import { analizler as analizListesi, tumGundem } from '@/lib/icerik/gundem';
import { atlasListesi } from '@/lib/icerik/atlas';
import { rehberListesi, uzmanListesi } from '@/lib/icerik/yayin';
import { tarihKisa } from '@/lib/bicim';

export async function generateStaticParams() {
  const [YAZAR_LISTESI, UZMANLAR] = await Promise.all([yazarListesi(), uzmanListesi()]);
  return [
    ...YAZAR_LISTESI.map((yazar) => ({ slug: yazar.slug })),
    ...UZMANLAR.filter((uzman) => !YAZAR_LISTESI.some((y) => y.slug === uzman.slug)).map(
      (uzman) => ({ slug: uzman.slug }),
    ),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const yazar = (await yazarListesi()).find((y) => y.slug === slug);
  // Editörün panelden yazdığı SEO alanları varsayılanların üzerine uygulanır.
  // Aşağıdaki açık koltuk dalı geçmez: `Uzman` tipi `seo` taşımaz (bkz.
  // `lib/tipler.ts` — uzmanın kendi detay rotası yoktur, sayfa yalnızca
  // `/uzmanlar/` listesinden gelen boş koltuğu gösterir ve noindex kalır).
  if (yazar) {
    return ustveriBirlestir(yazar.seo, {
      baslik: yazar.ad,
      aciklama: yazar.ozgecmis ?? `${yazar.ad} — ${yazar.unvan}`,
      kanonik: `/yazar/${yazar.slug}/`,
    });
  }

  const uzman = (await uzmanListesi()).find((u) => u.slug === slug);
  if (!uzman) return {};
  return {
    title: uzman.unvan,
    description: `${uzman.unvan} koltuğu — ${uzman.alan}`,
    alternates: { canonical: `/yazar/${uzman.slug}/` },
    robots: { index: false, follow: true },
  };
}

export default async function YazarSayfasi({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const yazar = (await yazarListesi()).find((y) => y.slug === slug);

  if (!yazar) {
    const uzman = (await uzmanListesi()).find((u) => u.slug === slug);
    if (!uzman) notFound();

    return (
      <>
        <SayfaBasligi
          kirintilar={[
            { ad: 'Uzmanlar', yol: '/uzmanlar/' },
            { ad: uzman.unvan, yol: `/yazar/${uzman.slug}/` },
          ]}
          etiket="AÇIK KOLTUK"
          baslik={uzman.unvan}
          ozet={`${uzman.alan} alanında katkı verecek bir uzman arıyoruz. Koltuk gerçek katkıyla dolar; o zamana kadar boş gösterilir.`}
          desen="nokta"
        />
        <Bolum>
          <BosDurum
            baslik={`${uzman.unvan} koltuğu boş`}
            metin="Bu alanda derinliği olan bir katkıcı arıyoruz. Atlas girdisi yazma, teknik inceleme veya podcast konukluğu biçiminde katkı verebilirsiniz."
            eylem={<Dugme href="/topluluk/katki/">Katkı biçimlerini gör</Dugme>}
          />
        </Bolum>
      </>
    );
  }

  const [TUM_GUNDEM, ATLAS, REHBERLER, ANALIZLER] = await Promise.all([
    tumGundem(),
    atlasListesi(),
    rehberListesi(),
    analizListesi(),
  ]);

  const haberler = TUM_GUNDEM.filter((icerik) => icerik.yazar.slug === yazar.slug);
  const atlasGirdileri = ATLAS.filter((girdi) => girdi.yazarSlug === yazar.slug);
  const incelemeleri = ATLAS.filter((girdi) => girdi.inceleyenSlug === yazar.slug);
  const rehberler = REHBERLER.filter((rehber) => rehber.yazarSlug === yazar.slug);
  const analizler = ANALIZLER.filter((analiz) => analiz.yazarSlug === yazar.slug);

  return (
    <>
      <ProfilSemasi yazar={yazar} />

      <SayfaBasligi
        kirintilar={[
          { ad: 'Yazarlar', yol: '/yazar/' },
          { ad: yazar.ad, yol: `/yazar/${yazar.slug}/` },
        ]}
        etiket={yazar.unvan.toLocaleUpperCase('tr-TR')}
        baslik={yazar.ad}
        ozet={yazar.ozgecmis}
        olcumler={[
          { deger: `${haberler.length}`, etiket: 'Gündem' },
          { deger: `${analizler.length}`, etiket: 'Analiz' },
          { deger: `${atlasGirdileri.length}`, etiket: 'Atlas' },
          { deger: `${rehberler.length}`, etiket: 'Rehber' },
        ]}
        yan={
          <div className="rounded-2xl border border-kenar bg-yuzey/50 p-5">
            <span className="etiket-mono grid size-14 place-items-center rounded-full border border-vurgu/35 bg-vurgu-zemin text-base text-vurgu-parlak">
              {yazar.basHarfler}
            </span>

            {yazar.uzmanlik && (
              <>
                <p className="etiket-mono mt-5 mb-2.5 text-metin">Uzmanlık alanları</p>
                <ul className="flex flex-wrap gap-1.5">
                  {yazar.uzmanlik.map((alan) => (
                    <li
                      key={alan}
                      className="rounded-md border border-kenar-soluk bg-zemin/60 px-2 py-1 text-[0.6875rem] text-metin-soluk"
                    >
                      {alan}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {yazar.sosyal && yazar.sosyal.length > 0 && (
              <>
                <p className="etiket-mono mt-5 mb-2.5 border-t border-kenar-soluk pt-4 text-metin">
                  Profiller
                </p>
                <ul className="flex flex-wrap gap-2">
                  {yazar.sosyal.map((hesap) => (
                    <li key={hesap.etiket}>
                      <a
                        href={hesap.adres}
                        target="_blank"
                        rel="noreferrer me"
                        className="etiket-mono rounded-full border border-kenar px-3 py-1.5 text-metin-soluk transition-colors hover:border-kenar-guclu hover:text-metin"
                      >
                        {hesap.etiket}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        }
      />

      {haberler.length > 0 && (
        <Bolum>
          <BolumBasligi
            numara="01"
            etiket="GÜNDEM"
            baslik="Gündem ve analizler"
            baglantiYolu="/gundem/"
          />
          <ul className="divide-y divide-kenar-soluk border-y border-kenar-soluk">
            {haberler.map((icerik) => (
              <li key={icerik.slug} className="group">
                <Link href={icerik.yol} className="flex items-start gap-5 py-4">
                  <span className="etiket-mono mt-1 w-14 shrink-0 text-metin-soluk">
                    {tarihKisa(icerik.yayinTarihi)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.9375rem] font-medium text-metin group-hover:text-vurgu-parlak">
                      {icerik.baslik}
                    </span>
                    <span className="mt-1.5 block text-[0.8125rem] leading-relaxed text-metin-soluk">
                      {icerik.kisaCevap}
                    </span>
                  </span>
                  <span className="etiket-mono mt-1 hidden shrink-0 items-center gap-1.5 text-metin-soluk sm:inline-flex">
                    <Saat className="size-3.5" />
                    {icerik.okumaDakika} dk
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Bolum>
      )}

      {(atlasGirdileri.length > 0 || rehberler.length > 0) && (
        <Bolum zemin="derin">
          <BolumBasligi numara="02" etiket="KALICI İÇERİK" baslik="Atlas ve rehberler" />
          <div className="grid gap-6 lg:grid-cols-2">
            {atlasGirdileri.length > 0 && (
              <div className="rounded-2xl border border-kenar bg-yuzey/40 p-6">
                <p className="etiket-mono mb-4 text-metin">Atlas girdileri</p>
                <ul className="divide-y divide-kenar-soluk">
                  {atlasGirdileri.map((girdi) => (
                    <li key={girdi.slug} className="group">
                      <Link href={`/atlas/${girdi.slug}/`} className="block py-3">
                        <span className="block text-sm font-medium text-metin group-hover:text-vurgu-parlak">
                          {girdi.ad}
                        </span>
                        <span className="mt-1 block text-xs text-metin-soluk">
                          {girdi.kategori}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {rehberler.length > 0 && (
              <div className="rounded-2xl border border-kenar bg-yuzey/40 p-6">
                <p className="etiket-mono mb-4 text-metin">Rehberler</p>
                <ul className="divide-y divide-kenar-soluk">
                  {rehberler.map((rehber) => (
                    <li key={rehber.slug} className="group">
                      <Link href={`/rehber/${rehber.slug}/`} className="block py-3">
                        <span className="block text-sm font-medium text-metin group-hover:text-vurgu-parlak">
                          {rehber.baslik}
                        </span>
                        <span className="mt-1 block text-xs text-metin-soluk">
                          {rehber.adimlar} adım · {rehber.okumaDakika} dk
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Bolum>
      )}

      {incelemeleri.length > 0 && (
        <Bolum>
          <BolumBasligi
            numara="03"
            etiket="İNCELEME"
            baslik="Teknik inceleme yaptığı içerikler"
            aciklama="İnceleme, biçimsel bir etiket değil gerçek bir editoryal adımdır."
          />
          <ul className="flex flex-wrap gap-2">
            {incelemeleri.map((girdi) => (
              <li key={girdi.slug}>
                <Link
                  href={`/atlas/${girdi.slug}/`}
                  className="rounded-full border border-kenar bg-yuzey/40 px-4 py-2 text-sm text-metin-ikincil transition-colors hover:border-vurgu/45 hover:text-metin"
                >
                  {girdi.ad}
                </Link>
              </li>
            ))}
          </ul>
        </Bolum>
      )}

      <Bolum zemin="derin">
        <div className="flex flex-wrap items-center gap-3">
          <Dugme href="/yazar/" gorunum="ikincil">
            Tüm yazarlar
            <Ok className="size-4" />
          </Dugme>
          <Dugme href="/editoryal-ilkeler/" gorunum="sessiz">
            Editoryal ilkeler
          </Dugme>
        </div>
      </Bolum>
    </>
  );
}
