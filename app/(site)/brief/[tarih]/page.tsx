import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { Ok, Zarf } from '@/components/arayuz/Ikonlar';
import { ListeSemasi } from '@/lib/seo/jsonld';
import { briefArsivi, briefBul } from '@/lib/icerik/gundem';
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

  return {
    title: `${sayi.baslik} — ${tarihUzun(sayi.tarih)}`,
    description: `Sinaptik Brief, ${tarihUzun(sayi.tarih)}: ${sayi.maddeler
      .map((m) => m.baslik)
      .slice(0, 3)
      .join(' · ')}`,
    alternates: { canonical: `/brief/${sayi.tarih}/` },
  };
}

export default async function BriefSayisiSayfasi({
  params,
}: {
  params: Promise<{ tarih: string }>;
}) {
  const { tarih } = await params;
  const sayi = await briefBul(tarih);
  if (!sayi) notFound();

  const ARSIV = await briefArsivi();
  const sira = ARSIV.findIndex((s) => s.tarih === sayi.tarih);
  // Arşiv yeniden eskiye sıralı: bir SONRAKİ sayı listede bir ÖNCEKİ satırdır.
  const sonraki = sira > 0 ? ARSIV[sira - 1] : undefined;
  const onceki = sira >= 0 && sira < ARSIV.length - 1 ? ARSIV[sira + 1] : undefined;

  return (
    <>
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
        ozet="Günün beş gelişmesi; her madde ne olduğunu değil neden önemli olduğunu söyler ve ilgili konu merkezine bağlanır."
        olcumler={[
          { deger: `${sayi.maddeler.length}`, etiket: 'Madde' },
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
        <ol className="divide-y divide-kenar-soluk border-y border-kenar-soluk">
          {sayi.maddeler.map((madde) => (
            <li key={madde.numara} className="group">
              <Link href={`/konu/${madde.konuSlug}/`} className="flex gap-5 py-6 sm:gap-8">
                <span className="font-mono text-lg text-metin-soluk transition-colors group-hover:text-vurgu-parlak">
                  {madde.numara}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[1.0625rem] leading-snug font-medium tracking-tight text-metin group-hover:text-vurgu-parlak">
                    {madde.baslik}
                  </span>
                  <span className="mt-2 block text-[0.9375rem] leading-relaxed text-metin-ikincil">
                    {madde.neden}
                  </span>
                  <span className="etiket-mono mt-2.5 block text-metin-soluk">{madde.kaynak}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </Bolum>

      {(onceki || sonraki) && (
        <Bolum zemin="derin">
          <BolumBasligi numara="02" etiket="ARŞİV" baslik="Komşu sayılar" baglantiYolu="/brief/" />
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
