import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Kirintilar } from '@/components/arayuz/Kirintilar';
import { Rozet } from '@/components/arayuz/Rozet';
import { Dugme } from '@/components/arayuz/Dugme';
import { Ok, Onay } from '@/components/arayuz/Ikonlar';
import { IcerikDuzeni, KapanisCagrisi } from '@/components/icerik/IcerikDuzeni';
import { OkumaCubugu } from '@/components/icerik/OkumaCubugu';
import { IlgiliBaglantilar } from '@/components/icerik/IcerikKenari';
import { ustveriBirlestir } from '@/lib/seo/ustveri';
import { podcastBul, podcastListesi } from '@/lib/icerik/yayin';
import { tarihUzun } from '@/lib/bicim';

export async function generateStaticParams() {
  return (await podcastListesi()).map((bolum) => ({ slug: bolum.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const bolum = await podcastBul(slug);
  if (!bolum) return {};

  // Editörün panelden yazdığı SEO alanları varsayılanların üzerine uygulanır.
  return ustveriBirlestir(bolum.seo, {
    baslik: `#${bolum.numara} ${bolum.ad}`,
    aciklama: bolum.ozet,
    kanonik: `/podcast/${bolum.slug}/`,
  });
}

export default async function PodcastBolumSayfasi({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const bolum = await podcastBul(slug);
  if (!bolum) notFound();

  const digerleri = (await podcastListesi()).filter((diger) => diger.slug !== bolum.slug);

  return (
    <>
      <OkumaCubugu />
      <section className="relative overflow-hidden border-b border-kenar bg-zemin-derin">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="nokta-zemin absolute inset-0 opacity-40" />
          <div className="absolute -top-24 left-1/3 h-60 w-96 rounded-full bg-ikincil/16 blur-[100px]" />
        </div>

        <div className="kap relative py-10 md:py-14">
          <Kirintilar
            ogeler={[
              { ad: 'Podcast', yol: '/podcast/' },
              { ad: bolum.ad, yol: `/podcast/${bolum.slug}/` },
            ]}
          />

          <div className="flex flex-wrap items-center gap-2">
            <Rozet ton="ikincil">Bölüm {bolum.numara}</Rozet>
            <Rozet>{bolum.dakika} dakika</Rozet>
          </div>

          <h1 className="mt-5 max-w-3xl text-[1.875rem] leading-[1.1] font-semibold tracking-[-0.028em] text-balance sm:text-[2.375rem]">
            {bolum.ad}
          </h1>
          <p className="mt-5 max-w-2xl font-serif text-lg leading-relaxed text-metin-ikincil">
            {bolum.ozet}
          </p>
          <p className="mt-6 text-xs text-metin-soluk">
            Konuk: {bolum.konuk} · <time dateTime={bolum.tarih}>{tarihUzun(bolum.tarih)}</time>
          </p>
        </div>
      </section>

      <IcerikDuzeni
        kenar={
          <>
            <div className="rounded-xl border border-kenar bg-yuzey/40 p-5">
              <p className="etiket-mono mb-3 text-metin">Bölüm bilgisi</p>
              <dl className="space-y-2.5 text-xs">
                <div className="flex justify-between gap-4">
                  <dt className="text-metin-soluk">Numara</dt>
                  <dd className="text-metin-ikincil">#{bolum.numara}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-metin-soluk">Süre</dt>
                  <dd className="text-metin-ikincil">{bolum.dakika} dakika</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-metin-soluk">Konuk</dt>
                  <dd className="text-right text-metin-ikincil">{bolum.konuk}</dd>
                </div>
              </dl>
            </div>
            <IlgiliBaglantilar
              baslik="Diğer bölümler"
              ogeler={digerleri.map((diger) => ({
                ad: `#${diger.numara} ${diger.ad}`,
                yol: `/podcast/${diger.slug}/`,
                not: `${diger.dakika} dk`,
              }))}
            />
          </>
        }
      >
        <section aria-labelledby="cikarimlar">
          <h2 id="cikarimlar" className="text-[1.375rem] font-semibold tracking-tight sm:text-2xl">
            Anahtar çıkarımlar
          </h2>
          <ul className="mt-5 space-y-3">
            {bolum.cikarimlar.map((cikarim) => (
              <li key={cikarim} className="flex items-start gap-3">
                <Onay className="mt-1 size-4 shrink-0 text-basari" />
                <span className="font-serif text-[1.0625rem] leading-relaxed text-metin-ikincil">
                  {cikarim}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-10 rounded-xl border border-kenar bg-yuzey/40 p-6">
          <p className="etiket-mono mb-3 text-metin-soluk">Kayıt ve transcript</p>
          <p className="text-[0.9375rem] leading-relaxed text-metin-ikincil">
            Ses kaydı ve tam transcript, bölüm yayına girdiğinde bu sayfaya eklenecek. Transcript
            HTML olarak yayımlanır; ses platformlarına bağımlı kalmaz.
          </p>
        </div>
      </IcerikDuzeni>

      <KapanisCagrisi
        etiket="TOPLULUK"
        baslik="Konuk olmak veya konu önermek ister misin?"
        metin="Sinaptik Sessions, alanda gerçekten iş yapan kişilerle konuşmayı hedefler."
        eylemler={
          <>
            <Dugme href="/topluluk/katki/">
              Katkı biçimleri
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/podcast/" gorunum="ikincil">
              Tüm bölümler
            </Dugme>
          </>
        }
      />
    </>
  );
}
