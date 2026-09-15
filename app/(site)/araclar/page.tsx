import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Kart, KartEtiketi, KartIzgarasi } from '@/components/arayuz/Kart';
import { Dugme } from '@/components/arayuz/Dugme';
import { Kod, Ok } from '@/components/arayuz/Ikonlar';
import { ListeSemasi } from '@/lib/seo/jsonld';
import { aracListesi, ARAC_KATEGORILERI } from '@/lib/icerik/varliklar';
import { hesaplayicilar } from '@/lib/icerik/lab';

export const metadata: Metadata = {
  title: 'AI Araçları',
  description:
    'Editoryal seçkiyle hazırlanmış yapay zekâ araç incelemeleri: ne işe yarar, kim kullanmalı, alternatifleri ve Sinaptik değerlendirmesi.',
  alternates: { canonical: '/araclar/' },
};

export default async function AraclarSayfasi() {
  const [ARACLAR, HESAPLAYICILAR] = await Promise.all([aracListesi(), hesaplayicilar()]);

  return (
    <>
      <ListeSemasi
        ad="AI araç incelemeleri"
        ogeler={ARACLAR.map((arac) => ({ ad: arac.ad, yol: `/araclar/${arac.slug}/` }))}
      />

      <SayfaBasligi
        kirintilar={[{ ad: 'AI Araçları', yol: '/araclar/' }]}
        etiket="UNDERSTAND"
        baslik="AI araçları"
        ozet="Burada on bin araç listesi yok. Kategori bazında editoryal inceleme var: hangi sınıf araç hangi işi çözer, nerede yetersiz kalır."
        olcumler={[
          { deger: `${ARACLAR.length}`, etiket: 'İnceleme' },
          { deger: `${ARAC_KATEGORILERI.length}`, etiket: 'Kategori' },
          { deger: `${HESAPLAYICILAR.length}`, etiket: 'Hesaplayıcı' },
          { deger: 'Editoryal', etiket: 'Seçki' },
        ]}
        eylemler={
          <Dugme href="/araclar/hesaplayicilar/">
            <Kod className="size-4" />
            Hesaplayıcılar
          </Dugme>
        }
      />

      <Bolum>
        <BolumBasligi
          numara="01"
          etiket="İNCELEMELER"
          baslik="Kategori incelemeleri"
          aciklama="Tek tek ürün adı yerine araç sınıfı incelenir; ürünler hızla değişir, sınıfın çözdüğü problem değişmez."
        />

        <KartIzgarasi kolon={3}>
          {ARACLAR.map((arac) => (
            <Kart
              key={arac.slug}
              yol={`/araclar/${arac.slug}/`}
              ustEtiket={arac.kategori}
              baslik={arac.ad}
              aciklama={arac.neIse}
              rozetler={
                <>
                  <KartEtiketi>{arac.fiyat}</KartEtiketi>
                </>
              }
              altBilgi={<span>{arac.alternatifler.length} alternatif</span>}
            />
          ))}
        </KartIzgarasi>
      </Bolum>

      <Bolum zemin="derin">
        <BolumBasligi
          numara="02"
          etiket="KATEGORİLER"
          baslik="Araç kategorileri"
          aciklama="Kategori sayfaları, o kategoride anlamlı sayıda inceleme oluştuğunda açılır."
        />
        <ul className="flex flex-wrap gap-2">
          {ARAC_KATEGORILERI.map((kategori) => {
            const adet = ARACLAR.filter((arac) => arac.kategori === kategori).length;
            return (
              <li
                key={kategori}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${
                  adet > 0
                    ? 'border-kenar bg-yuzey/40 text-metin-ikincil'
                    : 'border-dashed border-kenar-soluk text-metin-soluk'
                }`}
              >
                {kategori}
                <span className="etiket-mono tabular-nums">{adet}</span>
              </li>
            );
          })}
        </ul>
      </Bolum>

      <Bolum>
        <BolumBasligi
          numara="03"
          etiket="LAB"
          baslik="Sinaptik hesaplayıcıları"
          baglantiYolu="/araclar/hesaplayicilar/"
          baglantiMetni="Tümü"
        />
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-3">
          {HESAPLAYICILAR.map((hesap) => (
            <li key={hesap.slug}>
              <Link
                href={`/lab/${hesap.slug}/`}
                className="group flex h-full flex-col bg-zemin p-5 transition-colors hover:bg-yuzey/60"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="text-[0.9375rem] font-medium text-metin group-hover:text-sinyal">
                    {hesap.ad}
                  </span>
                  {hesap.durum === 'gelistiriliyor' && (
                    <span className="etiket-mono shrink-0 text-metin-soluk">Yakında</span>
                  )}
                </span>
                <span className="mt-2 text-xs leading-relaxed text-metin-soluk">{hesap.ozet}</span>
                <Ok className="mt-4 size-4 text-metin-soluk transition-transform duration-200 ease-sinaptik group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      </Bolum>
    </>
  );
}
