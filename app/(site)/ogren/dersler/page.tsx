import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { ListeSemasi } from '@/lib/seo/jsonld';
import { Ok, Saat } from '@/components/arayuz/Ikonlar';
import { dersler, ogrenmeYollari } from '@/lib/icerik/ogrenme';
import { SEVIYE_ADI } from '@/lib/taksonomi';

export const metadata: Metadata = {
  title: 'Dersler',
  description:
    'Kısa, tek konuya odaklı mikro dersler. Her ders bir öğrenme yoluna ve ilgili Atlas kavramına bağlanır.',
  alternates: { canonical: '/ogren/dersler/' },
};

export default async function DerslerSayfasi() {
  const [DERSLER, OGRENME_YOLLARI] = await Promise.all([dersler(), ogrenmeYollari()]);

  const yolaGore = new Map<string, typeof DERSLER>();
  for (const ders of DERSLER) {
    const mevcut = yolaGore.get(ders.yolSlug) ?? [];
    mevcut.push(ders);
    yolaGore.set(ders.yolSlug, mevcut);
  }

  return (
    <>
      <ListeSemasi
        ad="Dersler"
        ogeler={DERSLER.map((ders) => ({ ad: ders.ad, yol: `/ogren/dersler/${ders.slug}/` }))}
      />

      <SayfaBasligi
        kirintilar={[
          { ad: 'Öğren', yol: '/ogren/' },
          { ad: 'Dersler', yol: '/ogren/dersler/' },
        ]}
        etiket="LEARN"
        baslik="Dersler"
        ozet="Her ders tek bir konuyu kapatır ve bir rotanın içinde yerini bilir. Tek başına da okunabilir."
        olcumler={[
          { deger: `${DERSLER.length}`, etiket: 'Ders' },
          { deger: `${yolaGore.size}`, etiket: 'Rota' },
          { deger: `${DERSLER.reduce((t, d) => t + d.dakika, 0)} dk`, etiket: 'Toplam süre' },
        ]}
      />

      <Bolum>
        <div className="space-y-10">
          {[...yolaGore.entries()].map(([yolSlug, yolDersleri]) => {
            const yol = OGRENME_YOLLARI.find((y) => y.slug === yolSlug);
            return (
              <section key={yolSlug}>
                <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3 border-b border-kenar pb-3">
                  <h2 className="text-lg font-semibold tracking-tight">{yol?.ad ?? yolSlug}</h2>
                  {yol && (
                    <Link
                      href={`/ogren/yollar/${yol.slug}/`}
                      className="etiket-mono text-vurgu-parlak"
                    >
                      Rotayı aç →
                    </Link>
                  )}
                </div>

                <ul className="divide-y divide-kenar-soluk">
                  {yolDersleri.map((ders) => (
                    <li key={ders.slug} className="group">
                      <Link
                        href={`/ogren/dersler/${ders.slug}/`}
                        className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:gap-6"
                      >
                        <span className="etiket-mono w-24 shrink-0 text-metin-soluk">
                          {SEVIYE_ADI[ders.seviye]}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[0.9375rem] font-medium text-metin group-hover:text-vurgu-parlak">
                            {ders.ad}
                          </span>
                          <span className="mt-1 block text-[0.8125rem] leading-relaxed text-metin-soluk">
                            {ders.ozet}
                          </span>
                        </span>
                        <span className="etiket-mono inline-flex shrink-0 items-center gap-1.5 text-metin-soluk">
                          <Saat className="size-3.5" />
                          {ders.dakika} dk
                        </span>
                        <Ok className="hidden size-4 shrink-0 text-metin-soluk opacity-0 transition-opacity group-hover:opacity-100 sm:block" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </Bolum>
    </>
  );
}
