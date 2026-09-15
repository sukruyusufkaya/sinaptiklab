import type { Metadata } from 'next';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { Kart, KartEtiketi, KartIzgarasi } from '@/components/arayuz/Kart';
import { ListeSemasi } from '@/lib/seo/jsonld';
import { sirketListesi } from '@/lib/icerik/varliklar';

export const metadata: Metadata = {
  title: 'AI Şirketleri',
  description:
    'Yapay zekâ ekosisteminin şirket varlık sayfaları: kuruluş, merkez, alan, ürünler, modeller ve kilometre taşları.',
  alternates: { canonical: '/sirketler/' },
};

export default async function SirketlerSayfasi() {
  const SIRKETLER = await sirketListesi();

  return (
    <>
      <ListeSemasi
        ad="AI şirketleri"
        ogeler={SIRKETLER.map((sirket) => ({ ad: sirket.ad, yol: `/sirketler/${sirket.slug}/` }))}
      />

      <SayfaBasligi
        kirintilar={[{ ad: 'AI Şirketleri', yol: '/sirketler/' }]}
        etiket="UNDERSTAND"
        baslik="AI şirketleri"
        ozet="Her şirket bir varlık sayfasıdır. Haber yayımlandığında ilgili şirket sayfası da güncellenir; böylece bilgi grafiği tek yönlü kalmaz."
        olcumler={[
          { deger: `${SIRKETLER.length}`, etiket: 'Şirket' },
          {
            deger: `${SIRKETLER.filter((s) => (s.modelSluglari ?? []).length > 0).length}`,
            etiket: 'Model sahibi',
          },
        ]}
      />

      <Bolum>
        <KartIzgarasi kolon={3}>
          {SIRKETLER.map((sirket) => (
            <Kart
              key={sirket.slug}
              yol={`/sirketler/${sirket.slug}/`}
              ustEtiket={sirket.merkez}
              baslik={sirket.ad}
              aciklama={sirket.ozet}
              rozetler={
                <>
                  <KartEtiketi>{sirket.kurulus}</KartEtiketi>
                  <KartEtiketi>{sirket.tur}</KartEtiketi>
                </>
              }
              altBilgi={<span>{sirket.urunler.length} ürün</span>}
            />
          ))}
        </KartIzgarasi>
      </Bolum>
    </>
  );
}
