import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { Dusen, Ok, Saat, Yukselen } from '@/components/arayuz/Ikonlar';
import { KapanisCagrisi } from '@/components/icerik/IcerikDuzeni';
import { analizler, radar, tumGundem } from '@/lib/icerik/gundem';
import { tarihKisa, tarihUzun } from '@/lib/bicim';

export const metadata: Metadata = {
  title: 'Haftanın Özeti',
  description:
    'Haftayı kapatan özet: öne çıkan gelişmeler, radar hareketleri ve haftanın analizi. Her cuma yayımlanır.',
  alternates: { canonical: '/gundem/haftanin-ozeti/' },
};

export default async function HaftaninOzetiSayfasi() {
  const [TUM_GUNDEM, RADAR, ANALIZLER] = await Promise.all([tumGundem(), radar(), analizler()]);

  const hafta = [...TUM_GUNDEM]
    .sort((a, b) => b.yayinTarihi.localeCompare(a.yayinTarihi))
    .slice(0, 7);
  const enCokHareket = [...RADAR]
    .sort((a, b) => Math.abs(b.degisim) - Math.abs(a.degisim))
    .slice(0, 4);
  const analiz = ANALIZLER[0];
  const ilk = hafta[0];

  return (
    <>
      <SayfaBasligi
        kirintilar={[
          { ad: 'Gündem', yol: '/gundem/' },
          { ad: 'Haftanın Özeti', yol: '/gundem/haftanin-ozeti/' },
        ]}
        etiket="HAFTALIK"
        baslik="Haftanın özeti"
        ozet="Haftayı tek sayfada kapatan özet: öne çıkan gelişmeler, radar hareketleri ve haftanın analizi."
        olcumler={[
          { deger: `${hafta.length}`, etiket: 'Gelişme' },
          { deger: `${enCokHareket.length}`, etiket: 'Radar hareketi' },
          { deger: ilk ? tarihKisa(ilk.yayinTarihi) : '—', etiket: 'Son güncelleme' },
          { deger: 'Her cuma', etiket: 'Yayın' },
        ]}
        eylemler={
          <>
            <Dugme href="/bulten/">
              Weekly bültenine katıl
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/brief/" gorunum="ikincil">
              Günlük Brief
            </Dugme>
          </>
        }
      />

      <Bolum>
        <BolumBasligi
          numara="01"
          etiket="HAFTA"
          baslik="Öne çıkan gelişmeler"
          baglantiYolu="/gundem/"
        />
        <ol className="divide-y divide-kenar-soluk border-y border-kenar-soluk">
          {hafta.map((icerik, sira) => (
            <li key={icerik.slug} className="group">
              <Link href={icerik.yol} className="flex items-start gap-5 py-5">
                <span className="font-mono text-sm text-metin-soluk transition-colors group-hover:text-vurgu-parlak">
                  {String(sira + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[1.0625rem] leading-snug font-medium tracking-tight text-metin transition-colors group-hover:text-vurgu-parlak">
                    {icerik.baslik}
                  </span>
                  <span className="mt-2 block text-[0.875rem] leading-relaxed text-metin-ikincil">
                    {icerik.kisaCevap}
                  </span>
                  <span className="etiket-mono mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-metin-soluk">
                    <span>{icerik.konu.ad}</span>
                    <span>{tarihUzun(icerik.yayinTarihi)}</span>
                    <span className="inline-flex items-center gap-1.5">
                      <Saat className="size-3.5" />
                      {icerik.okumaDakika} dk
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </Bolum>

      <Bolum zemin="derin">
        <BolumBasligi
          numara="02"
          etiket="RADAR"
          baslik="Haftanın en çok hareket eden başlıkları"
          baglantiYolu="/radar/"
        />
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-4">
          {enCokHareket.map((kayit) => (
            <li key={kayit.slug}>
              <Link
                href={`/radar/${kayit.slug}/`}
                className="group flex h-full flex-col bg-zemin p-5 transition-colors hover:bg-yuzey/60"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="text-[0.9375rem] font-medium text-metin group-hover:text-vurgu-parlak">
                    {kayit.ad}
                  </span>
                  {kayit.degisim > 0 ? (
                    <Yukselen className="size-4 shrink-0 text-sinyal" />
                  ) : (
                    <Dusen className="size-4 shrink-0 text-metin-soluk" />
                  )}
                </span>
                <span className="mt-3 flex items-baseline gap-1.5">
                  <span className="font-mono text-2xl font-medium tracking-tight tabular-nums">
                    {kayit.momentum}
                  </span>
                  <span
                    className={`etiket-mono tabular-nums ${kayit.degisim > 0 ? 'text-sinyal' : 'text-metin-soluk'}`}
                  >
                    {kayit.degisim > 0 ? '+' : ''}
                    {kayit.degisim}
                  </span>
                </span>
                {kayit.not && (
                  <span className="mt-3 text-xs leading-relaxed text-metin-soluk">{kayit.not}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </Bolum>

      {analiz && (
        <Bolum>
          <BolumBasligi
            numara="03"
            etiket="ANALİZ"
            baslik="Haftanın analizi"
            baglantiYolu="/analiz/"
          />
          <Link
            href={`/analiz/${analiz.slug}/`}
            className="group block rounded-2xl border border-kenar bg-yuzey/40 p-6 transition-colors hover:border-vurgu/45 sm:p-8"
          >
            <span className="etiket-mono text-vurgu-parlak">{analiz.konu}</span>
            <span className="mt-4 block max-w-2xl text-[1.375rem] leading-snug font-semibold tracking-tight text-metin group-hover:text-vurgu-parlak sm:text-2xl">
              {analiz.baslik}
            </span>
            <span className="mt-3 block max-w-2xl font-serif text-[1.0625rem] leading-relaxed text-metin-ikincil">
              {analiz.girizgah}
            </span>
            <span className="etiket-mono mt-5 inline-flex items-center gap-2 text-metin-soluk">
              {analiz.okumaDakika} dakikalık okuma
              <Ok className="size-3.5 transition-transform duration-200 ease-sinaptik group-hover:translate-x-0.5" />
            </span>
          </Link>
        </Bolum>
      )}

      <KapanisCagrisi
        etiket="BÜLTEN"
        baslik="Haftanın özeti e-postana gelsin"
        metin="Sinaptik Weekly, bu sayfadaki özeti her cuma e-postanıza gönderir."
        eylemler={
          <>
            <Dugme href="/bulten/">
              Weekly&apos;e katıl
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/gundem/" gorunum="ikincil">
              Tüm gündem
            </Dugme>
          </>
        }
      />
    </>
  );
}
