import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { Kalkan, Ok, Onay } from '@/components/arayuz/Ikonlar';
import { KapanisCagrisi } from '@/components/icerik/IcerikDuzeni';
import { SSSBolumu } from '@/components/icerik/IcerikKenari';
import { HizmetSemasi, SSSSemasi } from '@/lib/seo/jsonld';
import { ustveriBirlestir } from '@/lib/seo/ustveri';
import { hizmetBul, hizmetler, SUREC_ADIMLARI, vakalar } from '@/lib/icerik/kurumsal';
import { rehberListesi } from '@/lib/icerik/yayin';

export async function generateStaticParams() {
  return (await hizmetler()).map((hizmet) => ({ slug: hizmet.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const hizmet = await hizmetBul(slug);
  if (!hizmet) return {};

  // Editörün panelden yazdığı SEO alanları varsayılanların üzerine uygulanır.
  return ustveriBirlestir(hizmet.seo, {
    baslik: hizmet.ad,
    aciklama: hizmet.ozet,
    kanonik: `/kurumsal/${hizmet.slug}/`,
  });
}

export default async function HizmetSayfasi({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hizmet = await hizmetBul(slug);
  if (!hizmet) notFound();

  const [HIZMETLER, VAKALAR, REHBERLER] = await Promise.all([
    hizmetler(),
    vakalar(),
    rehberListesi(),
  ]);

  const digerleri = HIZMETLER.filter((diger) => diger.slug !== hizmet.slug).slice(0, 6);
  const ilgiliRehber = REHBERLER.find(
    (rehber) => rehber.slug === hizmet.slug || rehber.slug.includes(hizmet.slug),
  );
  const ilgiliVakalar = VAKALAR.filter((vaka) =>
    vaka.teknolojiler.some((teknoloji) =>
      hizmet.ad.toLocaleLowerCase('tr').includes(teknoloji.toLocaleLowerCase('tr')),
    ),
  ).slice(0, 2);

  return (
    <>
      <HizmetSemasi ad={hizmet.ad} aciklama={hizmet.ozet} yol={`/kurumsal/${hizmet.slug}/`} />
      {hizmet.sss && <SSSSemasi sorular={hizmet.sss} />}

      <SayfaBasligi
        kirintilar={[
          { ad: 'Kurumsal', yol: '/kurumsal/' },
          { ad: hizmet.ad, yol: `/kurumsal/${hizmet.slug}/` },
        ]}
        etiket="KURUMSAL HİZMET"
        baslik={hizmet.ad}
        ozet={hizmet.ozet}
        eylemler={
          <>
            <Dugme href="/iletisim/">
              Değerlendirme talep et
              <Ok className="size-4" />
            </Dugme>
            {ilgiliRehber && (
              <Dugme href={`/rehber/${ilgiliRehber.slug}/`} gorunum="ikincil">
                İlgili rehber
              </Dugme>
            )}
          </>
        }
      />

      {/* --- Problem / çözüm --- */}
      <Bolum>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-uyari/25 bg-uyari/8 p-6 sm:p-8">
            <p className="etiket-mono mb-4 text-uyari">Problem</p>
            <p className="font-serif text-[1.125rem] leading-relaxed text-metin">
              {hizmet.problem}
            </p>
          </div>
          <div className="rounded-2xl border border-vurgu/30 bg-vurgu-zemin/45 p-6 sm:p-8">
            <p className="etiket-mono mb-4 text-vurgu-parlak">Çözüm</p>
            <p className="font-serif text-[1.125rem] leading-relaxed text-metin">{hizmet.cozum}</p>
          </div>
        </div>
      </Bolum>

      {/* --- Kullanım alanları --- */}
      <Bolum zemin="derin">
        <BolumBasligi numara="01" etiket="KULLANIM" baslik="Kullanım alanları" />
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-3">
          {hizmet.kullanimAlanlari.map((alan) => (
            <li key={alan} className="flex items-center gap-3 bg-zemin px-5 py-4">
              <Onay className="size-4 shrink-0 text-basari" />
              <span className="text-[0.9375rem] text-metin-ikincil">{alan}</span>
            </li>
          ))}
        </ul>
      </Bolum>

      {/* --- Mimari --- */}
      {hizmet.mimari && (
        <Bolum>
          <BolumBasligi
            numara="02"
            etiket="MİMARİ"
            baslik="Referans mimari"
            aciklama="Katmanlar sabit değildir; kurumun veri ve uyum kısıtlarına göre şekillenir."
          />
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-3">
            {hizmet.mimari.map((katman, sira) => (
              <li key={katman} className="flex items-center gap-2">
                <span className="rounded-full border border-kenar bg-yuzey/50 px-4 py-2 text-sm text-metin-ikincil">
                  {katman}
                </span>
                {sira < hizmet.mimari!.length - 1 && (
                  <span className="text-metin-soluk" aria-hidden="true">
                    →
                  </span>
                )}
              </li>
            ))}
          </ol>
        </Bolum>
      )}

      {/* --- Güvenlik --- */}
      {hizmet.guvenlik && (
        <Bolum zemin="derin">
          <BolumBasligi numara="03" etiket="GÜVENLİK" baslik="Güvenlik ve uyum" />
          <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-4">
            {hizmet.guvenlik.map((madde) => (
              <li key={madde} className="bg-zemin p-5">
                <Kalkan className="size-4 text-ikincil" />
                <p className="mt-3 text-[0.875rem] leading-relaxed text-metin-ikincil">{madde}</p>
              </li>
            ))}
          </ul>
        </Bolum>
      )}

      {/* --- Süreç --- */}
      <Bolum>
        <BolumBasligi numara="04" etiket="SÜREÇ" baslik="Yaklaşımımız" />
        <ol className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-3 lg:grid-cols-6">
          {SUREC_ADIMLARI.map((adim, sira) => (
            <li key={adim.ad} className="bg-zemin p-5">
              <span className="etiket-mono text-vurgu-parlak">
                {String(sira + 1).padStart(2, '0')}
              </span>
              <p className="mt-2.5 text-[0.9375rem] font-medium text-metin">{adim.ad}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-metin-soluk">{adim.ozet}</p>
            </li>
          ))}
        </ol>
      </Bolum>

      {/* --- Vakalar --- */}
      {ilgiliVakalar.length > 0 && (
        <Bolum zemin="derin">
          <BolumBasligi
            numara="05"
            etiket="KANIT"
            baslik="İlgili vaka çalışmaları"
            baglantiYolu="/vaka-calismalari/"
          />
          <ul className="grid gap-4 md:grid-cols-2">
            {ilgiliVakalar.map((vaka) => (
              <li key={vaka.slug}>
                <Link
                  href={`/vaka-calismalari/${vaka.slug}/`}
                  className="group flex h-full flex-col rounded-2xl border border-kenar bg-yuzey/40 p-6 transition-colors hover:border-vurgu/45"
                >
                  <span className="etiket-mono text-vurgu-parlak">{vaka.sektor}</span>
                  <span className="mt-3 block text-[1.0625rem] font-semibold tracking-tight text-metin group-hover:text-vurgu-parlak">
                    {vaka.baslik}
                  </span>
                  <span className="mt-2.5 flex-1 text-[0.875rem] leading-relaxed text-metin-ikincil">
                    {vaka.problem}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Bolum>
      )}

      {/* --- SSS --- */}
      {hizmet.sss && (
        <Bolum>
          <SSSBolumu sorular={hizmet.sss} />
        </Bolum>
      )}

      {/* --- Diğer hizmetler --- */}
      <Bolum zemin="derin">
        <BolumBasligi
          numara="06"
          etiket="DİĞER HİZMETLER"
          baslik="Hizmet hatları"
          baglantiYolu="/kurumsal/"
        />
        <ul className="flex flex-wrap gap-2">
          {digerleri.map((diger) => (
            <li key={diger.slug}>
              <Link
                href={`/kurumsal/${diger.slug}/`}
                className="rounded-full border border-kenar bg-yuzey/40 px-4 py-2 text-sm text-metin-ikincil transition-colors hover:border-vurgu/45 hover:text-metin"
              >
                {diger.ad}
              </Link>
            </li>
          ))}
        </ul>
      </Bolum>

      <KapanisCagrisi
        etiket="İLETİŞİM"
        baslik={`${hizmet.ad} için değerlendirme oturumu`}
        metin="İlk görüşmede kullanım senaryonuzu, veri durumunuzu ve kısıtlarınızı birlikte çıkarıyoruz."
        eylemler={
          <>
            <Dugme href="/iletisim/">
              Talep gönder
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/kurumsal/ai-readiness/" gorunum="ikincil">
              Önce olgunluğunuzu ölçün
            </Dugme>
          </>
        }
      />
    </>
  );
}
