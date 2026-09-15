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
import { dergiSayiListesi, dergiSayisiBul } from '@/lib/icerik/yayin';
import { atlasBul } from '@/lib/icerik/atlas';
import { tarihUzun } from '@/lib/bicim';

export async function generateStaticParams() {
  return (await dergiSayiListesi()).flatMap((sayi) =>
    sayi.yazilar.map((yazi) => ({ sayi: sayi.slug, yazi: yazi.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sayi: string; yazi: string }>;
}): Promise<Metadata> {
  const { sayi: sayiSlug, yazi: yaziSlug } = await params;
  const sayi = await dergiSayisiBul(sayiSlug);
  const yazi = sayi?.yazilar.find((y) => y.slug === yaziSlug);
  if (!sayi || !yazi) return {};

  return {
    title: yazi.baslik,
    description: yazi.ozet,
    alternates: { canonical: `/dergi/${sayi.slug}/${yazi.slug}/` },
    openGraph: { title: yazi.baslik, description: yazi.ozet, type: 'article' },
  };
}

export default async function DergiYazisiSayfasi({
  params,
}: {
  params: Promise<{ sayi: string; yazi: string }>;
}) {
  const { sayi: sayiSlug, yazi: yaziSlug } = await params;
  const sayi = await dergiSayisiBul(sayiSlug);
  const yazi = sayi?.yazilar.find((y) => y.slug === yaziSlug);
  if (!sayi || !yazi) notFound();

  // Cozulmus yazar kaydin uzerinde gelir; cozulemezse imza basilmaz.
  const yazar = yazi.yazar;
  const sira = sayi.yazilar.findIndex((y) => y.slug === yazi.slug);
  const onceki = sira > 0 ? sayi.yazilar[sira - 1] : undefined;
  const sonraki = sira < sayi.yazilar.length - 1 ? sayi.yazilar[sira + 1] : undefined;
  const digerYazilar = sayi.yazilar.filter((y) => y.slug !== yazi.slug);
  const basliklar = altBasliklar(yazi.govde);
  const kavramlar = (await Promise.all((yazi.ilgiliSluglar ?? []).map((s) => atlasBul(s)))).filter(
    (girdi): girdi is NonNullable<typeof girdi> => Boolean(girdi),
  );

  return (
    <>
      <OkumaCubugu />
      {yazar && (
        <MakaleSemasi
          baslik={yazi.baslik}
          aciklama={yazi.ozet}
          yol={`/dergi/${sayi.slug}/${yazi.slug}/`}
          yazar={yazar}
          yayinTarihi={sayi.tarih}
          bolum={yazi.bolum}
        />
      )}

      <section className="relative overflow-hidden border-b border-kenar bg-zemin-derin">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="nokta-zemin absolute inset-0 opacity-40" />
          <div className="absolute -top-24 left-1/3 h-60 w-96 rounded-full bg-vurgu/16 blur-[100px]" />
        </div>

        <div className="kap relative py-10 md:py-14">
          <Kirintilar
            ogeler={[
              { ad: 'Dergi', yol: '/dergi/' },
              { ad: sayi.sayi, yol: `/dergi/${sayi.slug}/` },
              { ad: yazi.baslik, yol: `/dergi/${sayi.slug}/${yazi.slug}/` },
            ]}
          />

          <div className="flex flex-wrap items-center gap-2">
            <Rozet ton="vurgu">{yazi.bolum}</Rozet>
            <Rozet>{sayi.sayi}</Rozet>
          </div>

          <h1 className="mt-5 max-w-4xl text-[1.875rem] leading-[1.1] font-semibold tracking-[-0.028em] text-balance sm:text-[2.375rem]">
            {yazi.baslik}
          </h1>

          <p className="mt-6 max-w-3xl font-serif text-lg leading-relaxed text-metin-ikincil sm:text-xl">
            {yazi.ozet}
          </p>

          <p className="mt-7 text-xs text-metin-soluk">
            {yazar && `${yazar.ad} · `}
            <time dateTime={sayi.tarih}>{tarihUzun(sayi.tarih)}</time> · {yazi.okumaDakika}{' '}
            dakikalık okuma
          </p>
        </div>
      </section>

      <IcerikDuzeni
        kenar={
          <>
            {basliklar.length > 0 && <IcindekilerTakipli basliklar={basliklar} />}
            {yazar && (
              <YazarSeridi yazar={yazar} yayinTarihi={sayi.tarih} okumaDakika={yazi.okumaDakika} />
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
            <IlgiliBaglantilar
              baslik={`${sayi.sayi} içindekiler`}
              ogeler={digerYazilar.map((diger) => ({
                ad: diger.baslik,
                yol: `/dergi/${sayi.slug}/${diger.slug}/`,
                not: diger.bolum,
              }))}
            />
          </>
        }
      >
        {yazi.govde ? (
          <MetinGovdesi bloklar={yazi.govde} />
        ) : (
          <div className="rounded-xl border border-kenar bg-yuzey/40 p-6">
            <p className="etiket-mono mb-3 text-metin-soluk">Editoryal not</p>
            <p className="text-[0.9375rem] leading-relaxed text-metin-ikincil">
              Bu dergi yazısının tam metni hazırlanıyor. Yayına girdiğinde yukarıdaki özet metnin
              tezini, gövde ise kaynaklandırılmış argümanı taşıyacak.
            </p>
          </div>
        )}

        {yazi.kaynaklar && (
          <div className="mt-12">
            <KaynakListesi kaynaklar={yazi.kaynaklar} />
          </div>
        )}

        <p className="mt-10 rounded-xl border border-kenar bg-yuzey/30 p-4 text-xs leading-relaxed text-metin-soluk">
          Dergi yazıları PDF&apos;in içine gömülmez; her biri kendi kalıcı adresinde HTML olarak
          yayımlanır ve ayrı ayrı alıntılanabilir.
        </p>

        {/* Sayı içi gezinme */}
        <nav aria-label="Sayı içi gezinme" className="mt-10 grid gap-3 sm:grid-cols-2">
          {onceki ? (
            <Link
              href={`/dergi/${sayi.slug}/${onceki.slug}/`}
              className="group rounded-xl border border-kenar bg-yuzey/40 p-4 transition-colors hover:border-vurgu/45"
            >
              <span className="etiket-mono text-metin-soluk">← Önceki yazı</span>
              <span className="mt-1.5 block text-sm font-medium text-metin group-hover:text-vurgu-parlak">
                {onceki.baslik}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {sonraki && (
            <Link
              href={`/dergi/${sayi.slug}/${sonraki.slug}/`}
              className="group rounded-xl border border-kenar bg-yuzey/40 p-4 text-right transition-colors hover:border-vurgu/45"
            >
              <span className="etiket-mono text-metin-soluk">Sonraki yazı →</span>
              <span className="mt-1.5 block text-sm font-medium text-metin group-hover:text-vurgu-parlak">
                {sonraki.baslik}
              </span>
            </Link>
          )}
        </nav>
      </IcerikDuzeni>

      <KapanisCagrisi
        etiket="MAGAZINE"
        baslik={`${sayi.kapakKonusu} dosyasının tamamını oku`}
        metin="Sayının diğer yazıları aynı dosyayı farklı açılardan ele alıyor."
        eylemler={
          <>
            <Dugme href={`/dergi/${sayi.slug}/`}>
              Sayıya dön
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/dergi/arsiv/" gorunum="ikincil">
              Arşiv
            </Dugme>
          </>
        }
      />
    </>
  );
}
