import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { Ok, Zarf } from '@/components/arayuz/Ikonlar';
import { MetinGovdesi } from '@/components/icerik/MetinGovdesi';
import { KaynakListesi, SSSBolumu } from '@/components/icerik/IcerikKenari';
import { ListeSemasi, SSSSemasi } from '@/lib/seo/jsonld';
import { ustveriBirlestir } from '@/lib/seo/ustveri';
import { briefArsivi, briefBul } from '@/lib/icerik/gundem';
import { koseYazilari } from '@/lib/icerik/kose';
import { tarihUzun } from '@/lib/bicim';

/**
 * Tek bir Sinaptik Brief sayısı.
 *
 * NEDEN VAR: arşivde 45 sayı duruyordu ama yalnızca en yenisi okunabiliyordu —
 * `/brief/` sayfasındaki arşiv listesi her satırı yine `/brief/`'e
 * bağlıyordu. 44 sayı veritabanında vardı, hiçbir adresten görünmüyordu.
 *
 * URL TARİHLİDİR ve bu bilinçlidir. Değişmez kural 6 "URL'ler tarih içermez"
 * der; o kural KALICI içerik içindir (bir kavram, bir rehber, bir haber
 * güncellendiğinde adresi değişmemeli). Brief ise tanımı gereği bir GÜNÜN
 * kaydıdır: tarih başlık değil, kimliğin kendisidir — bir gazetenin sayı
 * numarası gibi. `/brief/2026-08-14/` ile `/brief/2026-09-01/` iki ayrı
 * belgedir, aynı belgenin iki sürümü değil.
 */

export async function generateStaticParams() {
  return (await briefArsivi()).map((sayi) => ({ tarih: sayi.tarih }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tarih: string }>;
}): Promise<Metadata> {
  const { tarih } = await params;
  const sayi = await briefBul(tarih);
  if (!sayi) return {};

  // Editörün panelden yazdığı SEO alanları varsayılanların üzerine uygulanır.
  return ustveriBirlestir(sayi.seo, {
    baslik: `${sayi.baslik} — ${tarihUzun(sayi.tarih)}`,
    aciklama:
      sayi.ozet ??
      `Sinaptik Brief, ${tarihUzun(sayi.tarih)}: ${sayi.maddeler
        .map((m) => m.baslik)
        .slice(0, 3)
        .join(' · ')}`,
    kanonik: `/brief/${sayi.tarih}/`,
    openGraph: { type: 'article', publishedTime: sayi.tarih },
  });
}

export default async function BriefSayisiSayfasi({
  params,
}: {
  params: Promise<{ tarih: string }>;
}) {
  const { tarih } = await params;
  const sayi = await briefBul(tarih);
  if (!sayi) notFound();

  const [ARSIV, KOSE] = await Promise.all([briefArsivi(), koseYazilari()]);
  // Aynı gün yayımlanan köşe yazısı: brief günün haberini, köşe aynı günün yorumunu taşır.
  const gununKosesi = KOSE.find((yazi) => yazi.tarih === sayi.tarih);
  const tamMetin = (sayi.govde ?? []).length > 0;
  // Tam metinde her maddenin bölümü `madde-<numara>` çapasıyla açılır.
  const capalar = new Set(
    (sayi.govde ?? []).flatMap((blok) => (blok.tip === 'altbaslik' ? [blok.kimlik] : [])),
  );
  const sira = ARSIV.findIndex((s) => s.tarih === sayi.tarih);
  // Arşiv yeniden eskiye sıralı: bir SONRAKİ sayı listede bir ÖNCEKİ satırdır.
  const sonraki = sira > 0 ? ARSIV[sira - 1] : undefined;
  const onceki = sira >= 0 && sira < ARSIV.length - 1 ? ARSIV[sira + 1] : undefined;

  return (
    <>
      {sayi.sss && <SSSSemasi sorular={sayi.sss} />}
      <ListeSemasi
        ad={`Sinaptik Brief — ${tarihUzun(sayi.tarih)}`}
        ogeler={sayi.maddeler.map((madde) => ({
          ad: madde.baslik,
          yol: `/konu/${madde.konuSlug}/`,
        }))}
      />

      <SayfaBasligi
        kirintilar={[
          { ad: 'Sinaptik Brief', yol: '/brief/' },
          { ad: tarihUzun(sayi.tarih), yol: `/brief/${sayi.tarih}/` },
        ]}
        etiket={`BRIEF · ${tarihUzun(sayi.tarih)}`}
        baslik={sayi.baslik}
        ozet={
          sayi.ozet ??
          'Günün beş gelişmesi; her madde ne olduğunu değil neden önemli olduğunu söyler ve ilgili konu merkezine bağlanır.'
        }
        olcumler={[
          { deger: `${sayi.maddeler.length}`, etiket: 'Madde' },
          ...(sayi.okumaDakika ? [{ deger: `~${sayi.okumaDakika} dk`, etiket: 'Okuma' }] : []),
          { deger: tarihUzun(sayi.tarih), etiket: 'Yayın' },
        ]}
        eylemler={
          <>
            <Dugme href="/bulten/">
              <Zarf className="size-4" />
              E-postayla al
            </Dugme>
            <Dugme href="/brief/" gorunum="ikincil">
              Güncel sayı
            </Dugme>
          </>
        }
      />

      <Bolum>
        <BolumBasligi
          numara="01"
          etiket="MADDELER"
          baslik={`${tarihUzun(sayi.tarih)} gündemi`}
          aciklama="Maddeler editoryal olarak seçilir; kaynağı ve konu bağlantısı tamamlanmamış madde yayımlanmaz."
        />
        {sayi.kisaCevap && (
          <div className="mb-8 rounded-2xl border border-vurgu/30 bg-vurgu-zemin/40 p-5 sm:p-6">
            <p className="etiket-mono mb-2.5 text-vurgu-parlak">Günün özeti</p>
            <p className="olcu font-serif text-[1.0625rem] leading-relaxed text-metin sm:text-lg">
              {sayi.kisaCevap}
            </p>
          </div>
        )}
        <ol className="divide-y divide-kenar-soluk border-y border-kenar-soluk">
          {sayi.maddeler.map((madde) => {
            const capa = `madde-${madde.numara}`;
            const bolumeAtla = capalar.has(capa);
            return (
              <li key={madde.numara} className="group flex gap-5 py-6 sm:gap-8">
                <span className="font-mono text-lg text-metin-soluk transition-colors group-hover:text-vurgu-parlak">
                  {madde.numara}
                </span>
                <span className="min-w-0 flex-1">
                  <Link
                    href={bolumeAtla ? `#${capa}` : `/konu/${madde.konuSlug}/`}
                    className="block text-[1.0625rem] leading-snug font-medium tracking-tight text-metin transition-colors hover:text-vurgu-parlak"
                  >
                    {madde.baslik}
                  </Link>
                  <span className="mt-2 block text-[0.9375rem] leading-relaxed text-metin-ikincil">
                    {madde.neden}
                  </span>
                  <span className="etiket-mono mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-metin-soluk">
                    <span>Kaynak · {madde.kaynak}</span>
                    <Link
                      href={`/konu/${madde.konuSlug}/`}
                      className="text-metin-soluk transition-colors hover:text-vurgu-parlak"
                    >
                      Konu merkezi →
                    </Link>
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
      </Bolum>

      {tamMetin && (
        <Bolum zemin="derin">
          <BolumBasligi
            numara="02"
            etiket="TAM METİN"
            baslik="Sayının tamamı"
            aciklama="Her maddenin ne olduğu ve neden önemli olduğu, kaynaklarıyla."
          />
          <div className="olcu">
            <MetinGovdesi bloklar={sayi.govde ?? []} gorunum="kose" />
            {sayi.sss && sayi.sss.length > 0 && (
              <div className="mt-12">
                <SSSBolumu sorular={sayi.sss} />
              </div>
            )}
            {sayi.kaynaklar && sayi.kaynaklar.length > 0 && (
              <div className="mt-12">
                <KaynakListesi kaynaklar={sayi.kaynaklar} />
              </div>
            )}
          </div>
        </Bolum>
      )}

      {gununKosesi && (
        <Bolum>
          <BolumBasligi
            numara={tamMetin ? '03' : '02'}
            etiket="AYNI GÜN KÖŞEDE"
            baslik="Bugünün yorumu"
            baglantiYolu="/dergi/kose/"
            baglantiMetni="Köşe yazıları"
          />
          <Link
            href={gununKosesi.yol}
            className="group block rounded-2xl border border-kenar bg-yuzey/30 p-6 transition-colors hover:border-vurgu/45 sm:p-8"
          >
            <span className="etiket-mono text-vurgu-parlak">
              Köşe yazısı · {gununKosesi.yazar.ad}
            </span>
            <span className="mt-3 block font-serif text-2xl leading-snug font-semibold text-balance text-metin transition-colors group-hover:text-vurgu-parlak">
              {gununKosesi.baslik}
            </span>
            <span className="olcu mt-3 block text-[0.9375rem] leading-relaxed text-metin-ikincil">
              {gununKosesi.ozet ?? gununKosesi.kisaCevap}
            </span>
            <span className="etiket-mono mt-5 inline-flex items-center gap-1.5 text-metin-soluk">
              {gununKosesi.okumaDakika} dk
              <Ok className="size-3.5 transition-transform duration-200 ease-sinaptik group-hover:translate-x-0.5" />
            </span>
          </Link>
        </Bolum>
      )}

      {(onceki || sonraki) && (
        <Bolum zemin="derin">
          <BolumBasligi etiket="ARŞİV" baslik="Komşu sayılar" baglantiYolu="/brief/" />
          <div className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2">
            {[onceki, sonraki].map((komsu, i) =>
              komsu ? (
                <Link
                  key={komsu.tarih}
                  href={`/brief/${komsu.tarih}/`}
                  className="group flex flex-col bg-zemin p-6 transition-colors hover:bg-yuzey/60"
                >
                  <span className="etiket-mono text-metin-soluk">
                    {i === 0 ? 'Önceki sayı' : 'Sonraki sayı'} · {tarihUzun(komsu.tarih)}
                  </span>
                  <span className="mt-2 block text-[0.9375rem] font-medium text-metin group-hover:text-vurgu-parlak">
                    {komsu.baslik}
                  </span>
                  <span className="etiket-mono mt-2 inline-flex items-center gap-1.5 text-metin-soluk">
                    {komsu.maddeSayisi} madde
                    <Ok className="size-3.5 transition-transform duration-200 ease-sinaptik group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ) : (
                <div key={i} className="bg-zemin p-6" />
              ),
            )}
          </div>
        </Bolum>
      )}
    </>
  );
}
