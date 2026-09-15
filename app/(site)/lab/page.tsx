import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { Kod, Ok } from '@/components/arayuz/Ikonlar';
import { ListeSemasi } from '@/lib/seo/jsonld';
import { labProjeleri } from '@/lib/icerik/lab';
import { arastirmaListesi } from '@/lib/icerik/arastirma';

export const metadata: Metadata = {
  title: 'Sinaptik Lab',
  description:
    'Hesaplayıcılar, deneyler, açık kaynak araçlar ve demolar. Markadaki "Lab" kelimesinin karşılığı.',
  alternates: { canonical: '/lab/' },
};

const TURLER = ['Araç', 'Deney', 'Açık Kaynak', 'Demo'] as const;

export default async function LabSayfasi() {
  const [LAB_PROJELERI, ARASTIRMA] = await Promise.all([labProjeleri(), arastirmaListesi()]);
  const yayinda = LAB_PROJELERI.filter((proje) => proje.durum === 'yayinda').length;

  return (
    <>
      <ListeSemasi
        ad="Lab projeleri"
        ogeler={LAB_PROJELERI.map((proje) => ({ ad: proje.ad, yol: `/lab/${proje.slug}/` }))}
      />

      <SayfaBasligi
        kirintilar={[{ ad: 'Lab', yol: '/lab/' }]}
        etiket="BUILD"
        baslik="Sinaptik Lab"
        ozet="Markadaki 'Lab' gerçek olmalı. Burada hesaplayıcılar, deneyler ve açık kaynak araçlar yaşar — yazının değil çalışan şeyin olduğu yer."
        olcumler={[
          { deger: `${LAB_PROJELERI.length}`, etiket: 'Proje' },
          { deger: `${yayinda}`, etiket: 'Yayında' },
          { deger: `${LAB_PROJELERI.length - yayinda}`, etiket: 'Geliştiriliyor' },
          { deger: `${ARASTIRMA.length}`, etiket: 'Araştırma yayını' },
        ]}
        eylemler={
          <>
            <Dugme href="/araclar/hesaplayicilar/">
              <Kod className="size-4" />
              Hesaplayıcılar
            </Dugme>
            <Dugme href="/arastirma/" gorunum="ikincil">
              Araştırma
            </Dugme>
          </>
        }
      />

      {TURLER.map((tur, sira) => {
        const projeler = LAB_PROJELERI.filter((proje) => proje.tur === tur);
        if (projeler.length === 0) return null;

        return (
          <Bolum key={tur} zemin={sira % 2 === 1 ? 'derin' : 'yok'}>
            <BolumBasligi
              numara={String(sira + 1).padStart(2, '0')}
              etiket={tur.toLocaleUpperCase('tr-TR')}
              baslik={
                tur === 'Araç'
                  ? 'Hesaplayıcılar ve araçlar'
                  : tur === 'Deney'
                    ? 'Deneyler'
                    : tur === 'Açık Kaynak'
                      ? 'Açık kaynak'
                      : 'Demolar'
              }
              aciklama={
                tur === 'Araç'
                  ? 'Bir kararı hızlandıran küçük araçlar. Bunlar aynı zamanda doğal bağlantı varlıklarıdır.'
                  : undefined
              }
            />
            <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-3">
              {projeler.map((proje) => (
                <li key={proje.slug}>
                  <Link
                    href={`/lab/${proje.slug}/`}
                    className="group flex h-full items-start gap-4 bg-zemin p-5 transition-colors hover:bg-yuzey/60"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-kenar bg-zemin-derin text-metin-soluk transition-colors group-hover:border-sinyal/40 group-hover:text-sinyal">
                      <Kod className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-[0.9375rem] font-medium text-metin group-hover:text-sinyal">
                          {proje.ad}
                        </span>
                        {proje.durum === 'gelistiriliyor' && (
                          <span className="etiket-mono shrink-0 text-metin-soluk">Yakında</span>
                        )}
                      </span>
                      <span className="mt-1.5 block text-xs leading-relaxed text-metin-soluk">
                        {proje.ozet}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Bolum>
        );
      })}

      <Bolum>
        <div className="rounded-2xl border border-kenar bg-yuzey/40 p-6 sm:p-8">
          <p className="etiket-mono mb-3 text-metin-soluk">Neden Lab?</p>
          <p className="olcu font-serif text-[1.0625rem] leading-relaxed text-metin-ikincil">
            Bir platform yalnızca yazı üretiyorsa, iddiaları test edilemez kalır. Lab; hesaplama
            araçları, açık kaynak kod ve deneylerle o iddiaları elle tutulur hale getirir. Aynı
            zamanda bu varlıklar, içerikten daha güçlü bağlantı kaynaklarıdır.
          </p>
          <div className="mt-7">
            <Dugme href="/topluluk/katki/" gorunum="ikincil">
              Katkıda bulun
              <Ok className="size-4" />
            </Dugme>
          </div>
        </div>
      </Bolum>
    </>
  );
}
