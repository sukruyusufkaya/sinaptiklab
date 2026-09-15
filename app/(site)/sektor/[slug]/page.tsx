import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { Ok, Onay } from '@/components/arayuz/Ikonlar';
import { KapanisCagrisi } from '@/components/icerik/IcerikDuzeni';
import { ustveriBirlestir } from '@/lib/seo/ustveri';
import { hizmetler, sektorBul, sektoreGoreVakalar, sektorler } from '@/lib/icerik/kurumsal';

export async function generateStaticParams() {
  return (await sektorler()).map((sektor) => ({ slug: sektor.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sektor = await sektorBul(slug);
  if (!sektor) return {};

  // Editörün panelden yazdığı SEO alanları varsayılanların üzerine uygulanır.
  return ustveriBirlestir(sektor.seo, {
    baslik: `${sektor.ad} sektöründe yapay zekâ`,
    aciklama: `${sektor.ad} sektöründe yapay zekâ kullanım alanları, kullanılan teknolojiler, riskler ve ilgili vaka çalışmaları.`,
    kanonik: `/sektor/${sektor.slug}/`,
  });
}

export default async function SektorSayfasi({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sektor = await sektorBul(slug);
  if (!sektor) notFound();

  const [vakalar, HIZMETLER, SEKTORLER] = await Promise.all([
    sektoreGoreVakalar(sektor.slug),
    hizmetler(),
    sektorler(),
  ]);

  const ilgiliHizmetler = HIZMETLER.filter((hizmet) =>
    (sektor.teknolojiler ?? []).some((teknoloji) =>
      hizmet.ad.toLocaleLowerCase('tr').includes(teknoloji.toLocaleLowerCase('tr')),
    ),
  ).slice(0, 4);

  return (
    <>
      <SayfaBasligi
        kirintilar={[
          { ad: 'Sektörler', yol: '/sektor/' },
          { ad: sektor.ad, yol: `/sektor/${sektor.slug}/` },
        ]}
        etiket="SEKTÖR"
        baslik={`${sektor.ad} sektöründe yapay zekâ`}
        ozet={`${sektor.ozet}. Aşağıda bu sektörde öne çıkan kullanım alanları, kullanılan teknolojiler ve dikkat edilmesi gereken riskler yer alıyor.`}
        olcumler={[
          { deger: `${(sektor.kullanimAlanlari ?? []).length}`, etiket: 'Kullanım alanı' },
          { deger: `${(sektor.teknolojiler ?? []).length}`, etiket: 'Teknoloji' },
          { deger: `${(sektor.riskler ?? []).length}`, etiket: 'Risk başlığı' },
          { deger: `${vakalar.length}`, etiket: 'Vaka' },
        ]}
        eylemler={
          <Dugme href="/kurumsal/ai-readiness/">
            Olgunluğunuzu ölçün
            <Ok className="size-4" />
          </Dugme>
        }
        desen="nokta"
      />

      {sektor.kullanimAlanlari && (
        <Bolum>
          <BolumBasligi numara="01" etiket="KULLANIM ALANLARI" baslik="Nerede işe yarıyor?" />
          <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2">
            {sektor.kullanimAlanlari.map((alan, sira) => (
              <li key={alan} className="flex items-start gap-4 bg-zemin p-6">
                <span className="etiket-mono mt-0.5 shrink-0 text-metin-soluk">
                  {String(sira + 1).padStart(2, '0')}
                </span>
                <span className="text-[1.0625rem] leading-snug font-medium text-metin">{alan}</span>
              </li>
            ))}
          </ul>
        </Bolum>
      )}

      <Bolum zemin="derin">
        <div className="grid gap-6 lg:grid-cols-2">
          {sektor.teknolojiler && (
            <div className="rounded-2xl border border-kenar bg-yuzey/40 p-6">
              <p className="etiket-mono mb-4 text-basari">Kullanılan teknolojiler</p>
              <ul className="space-y-2.5">
                {sektor.teknolojiler.map((teknoloji) => (
                  <li
                    key={teknoloji}
                    className="flex items-start gap-2.5 text-[0.9375rem] text-metin-ikincil"
                  >
                    <Onay className="mt-0.5 size-4 shrink-0 text-basari" />
                    {teknoloji}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {sektor.riskler && (
            <div className="rounded-2xl border border-uyari/25 bg-uyari/8 p-6">
              <p className="etiket-mono mb-4 text-uyari">Riskler ve kısıtlar</p>
              <ul className="space-y-2.5">
                {sektor.riskler.map((risk) => (
                  <li
                    key={risk}
                    className="flex items-start gap-2.5 text-[0.9375rem] text-metin-ikincil"
                  >
                    <span
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-uyari"
                      aria-hidden="true"
                    />
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Bolum>

      {vakalar.length > 0 && (
        <Bolum>
          <BolumBasligi
            numara="02"
            etiket="KANIT"
            baslik="Bu sektördeki vaka çalışmaları"
            baglantiYolu="/vaka-calismalari/"
          />
          <ul className="grid gap-4 md:grid-cols-2">
            {vakalar.map((vaka) => (
              <li key={vaka.slug}>
                <Link
                  href={`/vaka-calismalari/${vaka.slug}/`}
                  className="group flex h-full flex-col rounded-2xl border border-kenar bg-yuzey/40 p-6 transition-colors hover:border-vurgu/45"
                >
                  <span className="text-[1.0625rem] font-semibold tracking-tight text-metin group-hover:text-vurgu-parlak">
                    {vaka.baslik}
                  </span>
                  <span className="mt-2.5 flex-1 text-[0.875rem] leading-relaxed text-metin-ikincil">
                    {vaka.problem}
                  </span>
                  <span className="etiket-mono mt-4 text-metin-soluk">
                    {vaka.teknolojiler.join(' · ')}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Bolum>
      )}

      {ilgiliHizmetler.length > 0 && (
        <Bolum zemin="derin">
          <BolumBasligi
            numara="03"
            etiket="HİZMET"
            baslik="İlgili kurumsal hizmetler"
            baglantiYolu="/kurumsal/"
          />
          <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2">
            {ilgiliHizmetler.map((hizmet) => (
              <li key={hizmet.slug}>
                <Link
                  href={`/kurumsal/${hizmet.slug}/`}
                  className="group flex h-full flex-col bg-zemin p-6 transition-colors hover:bg-yuzey/60"
                >
                  <span className="text-[0.9375rem] font-semibold tracking-tight text-metin group-hover:text-vurgu-parlak">
                    {hizmet.ad}
                  </span>
                  <span className="mt-2 text-xs leading-relaxed text-metin-soluk">
                    {hizmet.ozet}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Bolum>
      )}

      <Bolum>
        <BolumBasligi
          numara="04"
          etiket="DİĞER SEKTÖRLER"
          baslik="Sektör listesi"
          baglantiYolu="/sektor/"
        />
        <ul className="flex flex-wrap gap-2">
          {SEKTORLER.filter((diger) => diger.slug !== sektor.slug).map((diger) => (
            <li key={diger.slug}>
              <Link
                href={`/sektor/${diger.slug}/`}
                className="rounded-full border border-kenar bg-yuzey/40 px-4 py-2 text-sm text-metin-ikincil transition-colors hover:border-vurgu/45 hover:text-metin"
              >
                {diger.ad}
              </Link>
            </li>
          ))}
        </ul>
      </Bolum>

      <KapanisCagrisi
        etiket="BUILD"
        baslik={`${sektor.ad} sektöründe bir senaryo mu değerlendiriyorsunuz?`}
        metin="Discovery oturumunda veri durumunuzu, kısıtlarınızı ve ölçülebilir başarı tanımınızı birlikte çıkarıyoruz."
        eylemler={
          <>
            <Dugme href="/iletisim/">
              Görüşme talep et
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/kurumsal/" gorunum="ikincil">
              Kurumsal hizmetler
            </Dugme>
          </>
        }
      />
    </>
  );
}
