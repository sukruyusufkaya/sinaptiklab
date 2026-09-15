import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { FiltreSeridi } from '@/components/arayuz/Filtreler';
import { CokYakinda } from '@/components/arayuz/CokYakinda';
import { Grafik, Ok, Onay } from '@/components/arayuz/Ikonlar';
import { KapanisCagrisi } from '@/components/icerik/IcerikDuzeni';
import { MetinGovdesi } from '@/components/icerik/MetinGovdesi';
import { SSSBolumu } from '@/components/icerik/IcerikKenari';
import { OkumaCubugu } from '@/components/icerik/OkumaCubugu';
import { SSSSemasi, VeriSetiSemasi } from '@/lib/seo/jsonld';
import { atlasBul } from '@/lib/icerik/atlas';
import {
  ARASTIRMA_TURLERI,
  arastirmaBul,
  arastirmaListesi,
  arastirmaSluglari,
} from '@/lib/icerik/arastirma';
import { ustveriBirlestir } from '@/lib/seo/ustveri';
import { tarihUzun } from '@/lib/bicim';

/**
 * Tek dinamik segment iki sayfa tipini karşılar:
 *  - slug bir yayın türüyse (`raporlar`, `benchmark`, …) → tür arşivi
 *  - slug bir yayın ise → yayın sayfası
 * Böylece URL'ler düz kalır: /arastirma/raporlar/ ve /arastirma/state-of-ai-turkiye/
 */

export async function generateStaticParams() {
  return [
    ...ARASTIRMA_TURLERI.map((tur) => ({ slug: tur.slug })),
    ...(await arastirmaSluglari()).map((slug) => ({ slug })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  // Tür arşivi bir KOD SABITİNDEN gelir (`ARASTIRMA_TURLERI`); panelde
  // karşılığı olan bir belge yoktur, bu yüzden editör SEO
  // alanına bağlanacak bir kayıt da yok. Üstverisi olduğu gibi kalır.
  const tur = ARASTIRMA_TURLERI.find((t) => t.slug === slug);
  if (tur) {
    return {
      title: tur.ad,
      description: tur.ozet,
      alternates: { canonical: `/arastirma/${tur.slug}/` },
    };
  }

  const yayin = await arastirmaBul(slug);
  if (!yayin) return {};

  // Editörün panelden yazdığı SEO alanları varsayılanların üzerine uygulanır.
  return ustveriBirlestir(yayin.seo, {
    baslik: yayin.baslik,
    aciklama: yayin.ozet,
    kanonik: `/arastirma/${yayin.slug}/`,
  });
}

export default async function ArastirmaDetaySayfasi({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tur = ARASTIRMA_TURLERI.find((t) => t.slug === slug);

  if (tur) return <TurArsivi turSlug={tur.slug} />;

  const yayin = await arastirmaBul(slug);
  if (!yayin) notFound();

  const ARASTIRMA = await arastirmaListesi();
  const digerleri = ARASTIRMA.filter((diger) => diger.slug !== yayin.slug).slice(0, 4);
  const kavramlar = (await Promise.all((yayin.ilgiliSluglar ?? []).map((s) => atlasBul(s)))).filter(
    (girdi): girdi is NonNullable<typeof girdi> => Boolean(girdi),
  );
  const turKaydi = ARASTIRMA_TURLERI.find((t) => t.tur === yayin.tur);

  return (
    <>
      {yayin.govde && <OkumaCubugu hedefKimlik="tam-metin" />}
      {yayin.sss && <SSSSemasi sorular={yayin.sss} />}
      {yayin.tur === 'Veri Seti' && (
        <VeriSetiSemasi
          ad={yayin.baslik}
          aciklama={yayin.ozet}
          yol={`/arastirma/${yayin.slug}/`}
          lisans={yayin.lisans}
          tarih={yayin.tarih}
        />
      )}

      <SayfaBasligi
        kirintilar={[
          { ad: 'Araştırma', yol: '/arastirma/' },
          ...(turKaydi ? [{ ad: turKaydi.ad, yol: `/arastirma/${turKaydi.slug}/` }] : []),
          { ad: yayin.baslik, yol: `/arastirma/${yayin.slug}/` },
        ]}
        etiket={yayin.tur.toLocaleUpperCase('tr-TR')}
        baslik={yayin.baslik}
        ozet={yayin.ozet}
        eylemler={
          <>
            <Dugme href="/metodoloji/" gorunum="ikincil">
              Metodoloji ilkeleri
            </Dugme>
            <Dugme href="/bulten/" gorunum="sessiz">
              Yayın duyuruları
              <Ok className="size-4" />
            </Dugme>
          </>
        }
        yan={
          <div className="space-y-4">
            {yayin.kapsam && (
              <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar">
                {yayin.kapsam.map((satir) => (
                  <div key={satir.etiket} className="bg-zemin px-4 py-3.5">
                    <dt className="etiket-mono text-metin-soluk">{satir.etiket}</dt>
                    <dd className="mt-1.5 text-sm text-metin">{satir.deger}</dd>
                  </div>
                ))}
              </dl>
            )}
            <div className="rounded-2xl border border-kenar bg-yuzey/50 p-5">
              <dl className="space-y-2.5 text-xs">
                <div className="flex justify-between gap-4">
                  <dt className="text-metin-soluk">Yayın tarihi</dt>
                  <dd className="text-metin-ikincil">
                    <time dateTime={yayin.tarih}>{tarihUzun(yayin.tarih)}</time>
                  </dd>
                </div>
                {yayin.lisans && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-metin-soluk">Lisans</dt>
                    <dd className="text-metin-ikincil">{yayin.lisans}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <dt className="text-metin-soluk">Yürüten</dt>
                  <dd className="text-metin-ikincil">Sinaptik Research</dd>
                </div>
              </dl>
            </div>
          </div>
        }
      />

      <Bolum>
        <div className="grid gap-6 lg:grid-cols-2">
          {yayin.yontem && (
            <div className="rounded-2xl border border-kenar bg-yuzey/40 p-6">
              <p className="etiket-mono mb-4 text-metin">Yöntem</p>
              <ol className="space-y-3">
                {yayin.yontem.map((adim, sira) => (
                  <li key={adim} className="flex gap-3.5">
                    <span className="etiket-mono mt-0.5 shrink-0 text-vurgu-parlak">
                      {String(sira + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[0.875rem] leading-relaxed text-metin-ikincil">
                      {adim}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {yayin.bulgular && (
            <div className="rounded-2xl border border-kenar bg-yuzey/40 p-6">
              <p className="etiket-mono mb-4 text-basari">Bulgular</p>
              <ul className="space-y-3">
                {yayin.bulgular.map((bulgu) => (
                  <li key={bulgu} className="flex items-start gap-2.5">
                    <Onay className="mt-0.5 size-4 shrink-0 text-basari" />
                    <span className="text-[0.875rem] leading-relaxed text-metin-ikincil">
                      {bulgu}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {yayin.sinirliliklar && (
          <div className="mt-6 rounded-2xl border border-uyari/25 bg-uyari/8 p-6">
            <p className="etiket-mono mb-4 text-uyari">Sınırlılıklar</p>
            <ul className="space-y-2.5">
              {yayin.sinirliliklar.map((sinir) => (
                <li key={sinir} className="flex items-start gap-2.5">
                  <span
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-uyari"
                    aria-hidden="true"
                  />
                  <span className="text-[0.875rem] leading-relaxed text-metin-ikincil">
                    {sinir}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-uyari/20 pt-3.5 text-xs text-metin-soluk">
              Sınırlılık bölümü olmayan yayın onaylanmaz — bu, metodoloji ilkelerinden biridir.
            </p>
          </div>
        )}

        {yayin.atifFormati && (
          <div className="mt-6 rounded-2xl border border-kenar bg-zemin-derin p-6">
            <p className="etiket-mono mb-3 text-metin">Atıf formatı</p>
            <p className="rounded-lg border border-kenar-soluk bg-zemin px-4 py-3 font-mono text-[0.8125rem] leading-relaxed text-metin-ikincil">
              {yayin.atifFormati}
            </p>
          </div>
        )}

        {yayin.govde && (
          <div id="tam-metin" className="mt-12 border-t border-kenar pt-10">
            <p className="etiket-mono mb-6 text-ikincil">TAM METİN</p>
            <div className="olcu">
              <MetinGovdesi bloklar={yayin.govde} />
            </div>
          </div>
        )}

        {yayin.sss && (
          <div className="olcu mt-12">
            <SSSBolumu sorular={yayin.sss} />
          </div>
        )}

        {kavramlar.length > 0 && (
          <div className="mt-12 border-t border-kenar pt-8">
            <p className="etiket-mono mb-4 text-metin-soluk">Geçen kavramlar</p>
            <ul className="flex flex-wrap gap-2">
              {kavramlar.map((girdi) => (
                <li key={girdi.slug}>
                  <Link
                    href={`/atlas/${girdi.slug}/`}
                    className="inline-flex items-center rounded-full border border-kenar bg-yuzey/40 px-3.5 py-1.5 text-[0.8125rem] text-metin-ikincil transition-colors hover:border-ikincil/45 hover:text-metin"
                  >
                    {girdi.ad}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!yayin.govde && (
          <div className="mt-6 rounded-xl border border-kenar bg-yuzey/40 p-5">
            <p className="etiket-mono mb-2 text-metin-soluk">Yayın durumu</p>
            <p className="text-[0.875rem] leading-relaxed text-metin-ikincil">
              Bu sayfa yayının künyesini ve yöntemini tanıtır. Tam metin, veri dosyaları ve
              indirilebilir ekler yayın takvimine göre eklenecek.
            </p>
          </div>
        )}
      </Bolum>

      <Bolum zemin="derin">
        <BolumBasligi
          numara="01"
          etiket="DİĞER YAYINLAR"
          baslik="Sinaptik Research"
          baglantiYolu="/arastirma/"
        />
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2">
          {digerleri.map((diger) => (
            <li key={diger.slug}>
              <Link
                href={`/arastirma/${diger.slug}/`}
                className="group flex h-full flex-col bg-zemin p-6 transition-colors hover:bg-yuzey/60"
              >
                <span className="etiket-mono text-metin-soluk">{diger.tur}</span>
                <span className="mt-2.5 block text-[0.9375rem] font-semibold tracking-tight text-metin group-hover:text-ikincil">
                  {diger.baslik}
                </span>
                <span className="mt-2 flex-1 text-xs leading-relaxed text-metin-soluk">
                  {diger.ozet}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Bolum>

      <KapanisCagrisi
        etiket="BUILD"
        baslik="Bu veriyi kendi kurumunuzda ölçmek ister misiniz?"
        metin="Aynı metodolojiyi kurumunuzun görev setine uyarlıyor, sonuçları kendi ölçütlerinizle raporluyoruz."
        eylemler={
          <>
            <Dugme href="/kurumsal/ai-readiness/">
              AI Readiness değerlendirmesi
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/metodoloji/" gorunum="ikincil">
              Metodoloji
            </Dugme>
          </>
        }
      />
    </>
  );
}

async function TurArsivi({ turSlug }: { turSlug: string }) {
  const tur = ARASTIRMA_TURLERI.find((t) => t.slug === turSlug)!;
  const ARASTIRMA = await arastirmaListesi();
  const yayinlar = ARASTIRMA.filter((yayin) => yayin.tur === tur.tur).sort((a, b) =>
    b.tarih.localeCompare(a.tarih),
  );

  return (
    <>
      <SayfaBasligi
        kirintilar={[
          { ad: 'Araştırma', yol: '/arastirma/' },
          { ad: tur.ad, yol: `/arastirma/${tur.slug}/` },
        ]}
        etiket="RESEARCH"
        baslik={tur.ad}
        ozet={tur.ozet}
        olcumler={[{ deger: `${yayinlar.length}`, etiket: 'Yayın' }]}
        desen="nokta"
      />

      <Bolum>
        <div className="mb-9">
          <FiltreSeridi
            etiket="Yayın türleri"
            aktifYol={`/arastirma/${tur.slug}/`}
            ogeler={[
              { ad: 'Tümü', yol: '/arastirma/' },
              ...ARASTIRMA_TURLERI.map((t) => ({
                ad: t.ad,
                yol: `/arastirma/${t.slug}/`,
                adet: ARASTIRMA.filter((y) => y.tur === t.tur).length,
              })),
            ]}
          />
        </div>

        {yayinlar.length > 0 ? (
          <ul className="space-y-4">
            {yayinlar.map((yayin) => (
              <li key={yayin.slug}>
                <Link
                  href={`/arastirma/${yayin.slug}/`}
                  className="group flex gap-6 rounded-2xl border border-kenar bg-yuzey/40 p-6 transition-[border-color,background-color] duration-300 hover:border-ikincil/45 hover:bg-yuzey/70"
                >
                  <span className="hidden w-20 shrink-0 border-r border-kenar-soluk pr-6 sm:block">
                    <Grafik className="size-5 text-metin-soluk transition-colors group-hover:text-ikincil" />
                    <span className="mt-4 block font-mono text-lg leading-none font-medium text-metin">
                      {yayin.veriNoktasi}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="etiket-mono text-metin-soluk">{tarihUzun(yayin.tarih)}</span>
                    <span className="mt-2 block text-[1.0625rem] font-semibold tracking-tight text-metin">
                      {yayin.baslik}
                    </span>
                    <span className="mt-2 block text-[0.875rem] leading-relaxed text-metin-ikincil">
                      {yayin.ozet}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <CokYakinda
            baslik={`${tur.ad} hazırlanıyor`}
            metin={`${tur.ozet} Bu türde ilk çalışma yayımlandığında, metodolojisi ve sınırlılıklarıyla birlikte burada listelenecek.`}
            kapsam={[
              'Yöntemin baştan sona yazıldığı metodoloji bölümü',
              'Örneklem büyüklüğü, toplama tarihi ve kapsam sınırları',
              'Neyin ÖLÇÜLMEDİĞİNİ açıkça söyleyen sınırlılıklar bölümü',
              'Atıf formatı ve yeniden kullanım lisansı',
            ]}
            notlar={[
              'Sinaptik Research yayınları ticari müşterilerden bağımsız yürütülür; sponsorlu çalışma bu başlık altında yayımlanmaz.',
              'Metodolojisi yayımlanmamış hiçbir sayı yayımlanmaz — bu, sitenin tamamı için geçerli bir kuraldır.',
            ]}
          />
        )}
      </Bolum>
    </>
  );
}
