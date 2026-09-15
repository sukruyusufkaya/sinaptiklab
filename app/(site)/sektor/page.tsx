import type { Metadata } from 'next';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { Kart, KartEtiketi, KartIzgarasi } from '@/components/arayuz/Kart';
import { ListeSemasi } from '@/lib/seo/jsonld';
import { sektorler } from '@/lib/icerik/kurumsal';

export const metadata: Metadata = {
  title: 'Sektörlerde Yapay Zekâ',
  description:
    'Finans, sağlık, üretim, enerji, lojistik, perakende, inşaat, eğitim, turizm ve madencilikte yapay zekâ kullanım alanları, teknolojiler ve riskler.',
  alternates: { canonical: '/sektor/' },
};

export default async function SektorlerSayfasi() {
  const SEKTORLER = await sektorler();

  return (
    <>
      <ListeSemasi
        ad="Sektörler"
        ogeler={SEKTORLER.map((sektor) => ({ ad: sektor.ad, yol: `/sektor/${sektor.slug}/` }))}
      />

      <SayfaBasligi
        kirintilar={[{ ad: 'Sektörler', yol: '/sektor/' }]}
        etiket="BUILD"
        baslik="Sektörlerde yapay zekâ"
        ozet="Aynı teknoloji her sektörde aynı işi yapmaz. Kullanım senaryosu, veri yapısı ve risk profili sektöre göre değişir."
        olcumler={[
          { deger: `${SEKTORLER.length}`, etiket: 'Sektör' },
          {
            deger: `${SEKTORLER.reduce((t, s) => t + s.kullanimSayisi, 0)}`,
            etiket: 'Kullanım alanı',
          },
        ]}
      />

      <Bolum>
        <KartIzgarasi kolon={3}>
          {SEKTORLER.map((sektor) => (
            <Kart
              key={sektor.slug}
              yol={`/sektor/${sektor.slug}/`}
              ustEtiket={`${sektor.kullanimSayisi} kullanım alanı`}
              baslik={sektor.ad}
              aciklama={sektor.ozet}
              rozetler={(sektor.teknolojiler ?? []).map((teknoloji) => (
                <KartEtiketi key={teknoloji}>{teknoloji}</KartEtiketi>
              ))}
              altBilgi={<span>{(sektor.riskler ?? []).length} risk başlığı</span>}
            />
          ))}
        </KartIzgarasi>
      </Bolum>
    </>
  );
}
