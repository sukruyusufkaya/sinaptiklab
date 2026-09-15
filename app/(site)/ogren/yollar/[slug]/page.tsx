import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { BosDurum } from '@/components/arayuz/Filtreler';
import { Katman, Ok, Onay, Saat } from '@/components/arayuz/Ikonlar';
import { KapanisCagrisi } from '@/components/icerik/IcerikDuzeni';
import { KursSemasi } from '@/lib/seo/jsonld';
import { ustveriBirlestir } from '@/lib/seo/ustveri';
import { ogrenmeYollari, testler, yolBul, yolunDersleri } from '@/lib/icerik/ogrenme';
import { atlasListesi } from '@/lib/icerik/atlas';

export async function generateStaticParams() {
  return (await ogrenmeYollari()).map((yol) => ({ slug: yol.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const yol = await yolBul(slug);
  if (!yol) return {};

  // Editörün panelden yazdığı SEO alanları varsayılanların üzerine uygulanır.
  return ustveriBirlestir(yol.seo, {
    baslik: `${yol.ad} — Öğrenme Yolu`,
    aciklama: yol.aciklama,
    kanonik: `/ogren/yollar/${yol.slug}/`,
  });
}

const DONGU = ['Teori', 'Örnek', 'Lab', 'Test', 'Proje'];

export default async function YolSayfasi({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const yol = await yolBul(slug);
  if (!yol) notFound();

  const [OGRENME_YOLLARI, TESTLER, dersler, atlasGirdileri] = await Promise.all([
    ogrenmeYollari(),
    testler(),
    yolunDersleri(yol.slug),
    atlasListesi(),
  ]);
  // Kavram baglantilari tek listeden kurulur; kavram basina ayri sorgu atilmaz.
  const atlasKayitlari = new Map(atlasGirdileri.map((girdi) => [girdi.slug, girdi] as const));

  const digerYollar = OGRENME_YOLLARI.filter((diger) => diger.slug !== yol.slug).slice(0, 4);

  // Rotanın bölümlerinde geçen kavramları Atlas girdileriyle eşle.
  const kavramSluglari = new Set<string>();
  for (const bolum of yol.bolumler ?? []) {
    for (const kavram of bolum.kavramlar) {
      const aday = kavram.toLocaleLowerCase('tr-TR').replaceAll(' ', '-').replaceAll('ı', 'i');
      if (atlasKayitlari.has(aday)) kavramSluglari.add(aday);
    }
  }
  const kavramlar = [...kavramSluglari]
    .map((slug) => atlasKayitlari.get(slug))
    .filter((girdi): girdi is NonNullable<typeof girdi> => Boolean(girdi));

  const ilgiliTest = TESTLER.find((test) =>
    (yol.bolumler ?? []).some((bolum) => bolum.kavramlar.includes(test.konu)),
  );

  return (
    <>
      <KursSemasi
        ad={yol.ad}
        aciklama={yol.aciklama}
        yol={`/ogren/yollar/${yol.slug}/`}
        seviye={yol.seviyeAraligi}
      />

      <SayfaBasligi
        kirintilar={[
          { ad: 'Öğren', yol: '/ogren/' },
          { ad: 'Öğrenme Yolları', yol: '/ogren/yollar/' },
          { ad: yol.ad, yol: `/ogren/yollar/${yol.slug}/` },
        ]}
        etiket={`${yol.rol.toLocaleUpperCase('tr-TR')} · ${yol.seviyeAraligi}`}
        baslik={yol.ad}
        ozet={yol.aciklama}
        olcumler={[
          { deger: `${yol.bolum}`, etiket: 'Bölüm' },
          { deger: `~${yol.saat} sa`, etiket: 'Süre' },
          { deger: `${dersler.length}`, etiket: 'Ders' },
          { deger: yol.onkosullar ? `${yol.onkosullar.length}` : '0', etiket: 'Önkoşul' },
        ]}
        eylemler={
          <>
            <Dugme href="/uye-ol/">
              Rotayı başlat
              <Ok className="size-4" />
            </Dugme>
            {ilgiliTest && (
              <Dugme href={`/testler/${ilgiliTest.slug}/`} gorunum="ikincil">
                Önce seviyeni ölç
              </Dugme>
            )}
          </>
        }
        yan={
          <div className="space-y-4">
            <div className="rounded-2xl border border-kenar bg-yuzey/50 p-5">
              <p className="etiket-mono mb-4 text-metin">Bölüm döngüsü</p>
              <ol className="space-y-2">
                {DONGU.map((adim, sira) => (
                  <li key={adim} className="flex items-center gap-3">
                    <span className="etiket-mono grid size-6 place-items-center rounded-full border border-vurgu/35 bg-vurgu-zemin text-vurgu-parlak">
                      {sira + 1}
                    </span>
                    <span className="text-sm text-metin-ikincil">{adim}</span>
                  </li>
                ))}
              </ol>
            </div>

            {yol.onkosullar && yol.onkosullar.length > 0 && (
              <div className="rounded-2xl border border-kenar bg-yuzey/50 p-5">
                <p className="etiket-mono mb-3.5 text-metin">Önkoşullar</p>
                <ul className="space-y-2">
                  {yol.onkosullar.map((onkosul) => (
                    <li
                      key={onkosul}
                      className="flex items-center gap-2 text-sm text-metin-ikincil"
                    >
                      <Onay className="size-4 shrink-0 text-basari" />
                      {onkosul}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        }
      />

      {/* --- Çıktılar --- */}
      <Bolum>
        <BolumBasligi
          numara="01"
          etiket="ÇIKTI"
          baslik="Rotayı bitirdiğinde ne yapabiliyor olacaksın?"
          aciklama={yol.kimeGore}
        />
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-3">
          {yol.cikti.map((cikti, sira) => (
            <li key={cikti} className="bg-zemin p-6">
              <span className="etiket-mono text-metin-soluk">
                {String(sira + 1).padStart(2, '0')}
              </span>
              <p className="mt-3 text-[1.0625rem] font-semibold tracking-tight text-metin">
                {cikti}
              </p>
            </li>
          ))}
        </ul>
      </Bolum>

      {/* --- Bölümler --- */}
      <Bolum zemin="derin">
        <BolumBasligi
          numara="02"
          etiket="MÜFREDAT"
          baslik={`${yol.bolum} bölüm`}
          aciklama="Her bölüm ilgili Atlas kavramlarına bağlanır; eksik önkoşul varsa beceri grafiği uyarır."
        />

        {yol.bolumler && yol.bolumler.length > 0 ? (
          <ol className="divide-y divide-kenar-soluk overflow-hidden rounded-2xl border border-kenar">
            {yol.bolumler.map((bolum, sira) => (
              <li key={bolum.ad} className="bg-yuzey/30 p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <span className="etiket-mono grid size-9 shrink-0 place-items-center rounded-full border border-kenar bg-zemin text-metin-soluk">
                    {String(sira + 1).padStart(2, '0')}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <h3 className="text-[1.0625rem] font-semibold tracking-tight text-metin">
                        {bolum.ad}
                      </h3>
                      <span className="etiket-mono inline-flex items-center gap-1.5 text-metin-soluk">
                        <Saat className="size-3.5" />
                        {bolum.sure}
                      </span>
                    </div>
                    <p className="mt-2 text-[0.875rem] leading-relaxed text-metin-ikincil">
                      {bolum.ozet}
                    </p>
                    <ul className="mt-3.5 flex flex-wrap gap-1.5">
                      {bolum.kavramlar.map((kavram) => {
                        const aday = kavram
                          .toLocaleLowerCase('tr-TR')
                          .replaceAll(' ', '-')
                          .replaceAll('ı', 'i');
                        const girdi = atlasKayitlari.get(aday);
                        return (
                          <li key={kavram}>
                            {girdi ? (
                              <Link
                                href={`/atlas/${girdi.slug}/`}
                                className="rounded-md border border-vurgu/30 bg-vurgu-zemin px-2 py-1 text-[0.6875rem] text-vurgu-parlak transition-opacity hover:opacity-80"
                              >
                                {kavram}
                              </Link>
                            ) : (
                              <span className="rounded-md border border-kenar-soluk bg-zemin/60 px-2 py-1 text-[0.6875rem] text-metin-soluk">
                                {kavram}
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <BosDurum
            baslik="Müfredat ayrıntısı hazırlanıyor"
            metin={`${yol.ad} rotası ${yol.bolum} bölümden oluşuyor. Bölüm bölüm müfredat, içerik üretimi tamamlandıkça yayımlanacak.`}
            eylem={<Dugme href="/ogren/yollar/">Diğer rotalar</Dugme>}
          />
        )}
      </Bolum>

      {/* --- Dersler --- */}
      {dersler.length > 0 && (
        <Bolum>
          <BolumBasligi
            numara="03"
            etiket="DERSLER"
            baslik="Bu rotadaki dersler"
            baglantiYolu="/ogren/dersler/"
          />
          <ul className="divide-y divide-kenar-soluk border-y border-kenar-soluk">
            {dersler.map((ders) => (
              <li key={ders.slug} className="group">
                <Link
                  href={`/ogren/dersler/${ders.slug}/`}
                  className="flex items-center gap-5 py-4"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.9375rem] font-medium text-metin group-hover:text-vurgu-parlak">
                      {ders.ad}
                    </span>
                    <span className="mt-1 block text-xs text-metin-soluk">{ders.ozet}</span>
                  </span>
                  <span className="etiket-mono shrink-0 text-metin-soluk">{ders.dakika} dk</span>
                  <Ok className="size-4 shrink-0 text-metin-soluk opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </li>
            ))}
          </ul>
        </Bolum>
      )}

      {/* --- Kavramlar --- */}
      {kavramlar.length > 0 && (
        <Bolum zemin="derin">
          <BolumBasligi
            numara="04"
            etiket="ATLAS"
            baslik="Rotada geçen kavramlar"
            baglantiYolu="/atlas/"
          />
          <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-3">
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

      {/* --- Diğer rotalar --- */}
      <Bolum>
        <BolumBasligi
          numara="05"
          etiket="DİĞER ROTALAR"
          baslik="Sana uygun olmayabilir mi?"
          baglantiYolu="/ogren/yollar/"
        />
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-4">
          {digerYollar.map((diger) => (
            <li key={diger.slug}>
              <Link
                href={`/ogren/yollar/${diger.slug}/`}
                className="group flex h-full flex-col bg-zemin p-5 transition-colors hover:bg-yuzey/60"
              >
                <span className="etiket-mono text-metin-soluk">{diger.rol}</span>
                <span className="mt-2 block text-[0.9375rem] font-medium text-metin group-hover:text-vurgu-parlak">
                  {diger.ad}
                </span>
                <span className="etiket-mono mt-2 flex items-center gap-3 text-metin-soluk">
                  <span className="inline-flex items-center gap-1.5">
                    <Katman className="size-3.5" />
                    {diger.bolum}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Saat className="size-3.5" />~{diger.saat} sa
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Bolum>

      <KapanisCagrisi
        etiket="ÖLÇ"
        baslik="Rotaya başlamadan önce nerede durduğunu gör"
        metin="15 soruluk seviye testi, hangi bölümden başlaman gerektiğini söyler."
        eylemler={
          <>
            <Dugme href="/seviye-testi/">
              Seviye testini çöz
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/ogren/beceri-grafigi/" gorunum="ikincil">
              Beceri grafiği
            </Dugme>
          </>
        }
      />
    </>
  );
}
