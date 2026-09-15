import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Kart, KartEtiketi, KartIzgarasi } from '@/components/arayuz/Kart';
import { Bolum } from '@/components/arayuz/Bolum';
import { FiltreSeridi, BosDurum } from '@/components/arayuz/Filtreler';
import { Dugme } from '@/components/arayuz/Dugme';
import { Onay } from '@/components/arayuz/Ikonlar';
import { ATLAS_KATEGORILERI, kategoriyeGoreAtlas } from '@/lib/icerik/atlas';
import { SEVIYE_ADI, tarihUzun } from '@/lib/veri/temel';

export function generateStaticParams() {
  return ATLAS_KATEGORILERI.map((kategori) => ({ slug: kategori.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const kategori = ATLAS_KATEGORILERI.find((k) => k.slug === slug);
  if (!kategori) return {};

  return {
    title: `${kategori.ad} kavramları`,
    description: `${kategori.ad} kümesindeki yapay zekâ kavramlarının Sinaptik AI Atlas girdileri.`,
    alternates: { canonical: `/atlas/kategori/${kategori.slug}/` },
  };
}

export default async function AtlasKategoriSayfasi({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const kategori = ATLAS_KATEGORILERI.find((k) => k.slug === slug);
  if (!kategori) notFound();

  const girdiler = await kategoriyeGoreAtlas(kategori.slug);

  return (
    <>
      <SayfaBasligi
        kirintilar={[
          { ad: 'AI Atlas', yol: '/atlas/' },
          { ad: kategori.ad, yol: `/atlas/kategori/${kategori.slug}/` },
        ]}
        etiket="ATLAS KATEGORİSİ"
        baslik={kategori.ad}
        ozet={`${kategori.ad} kümesindeki kavramlar. Bu küme için hedeflenen girdi sayısı ${kategori.adet}; aşağıda yayında olanlar listelenir.`}
        olcumler={[
          { deger: `${girdiler.length}`, etiket: 'Yayında' },
          { deger: `${kategori.adet}`, etiket: 'Hedef' },
        ]}
        desen="nokta"
      />

      <Bolum>
        <div className="mb-8">
          <FiltreSeridi
            etiket="Atlas kategorileri"
            aktifYol={`/atlas/kategori/${kategori.slug}/`}
            ogeler={ATLAS_KATEGORILERI.map((k) => ({
              ad: k.ad,
              yol: `/atlas/kategori/${k.slug}/`,
            }))}
          />
        </div>

        {girdiler.length > 0 ? (
          <KartIzgarasi kolon={3}>
            {girdiler.map((girdi) => (
              <Kart
                key={girdi.slug}
                yol={`/atlas/${girdi.slug}/`}
                ustEtiket={SEVIYE_ADI[girdi.seviye]}
                baslik={girdi.ad}
                aciklama={girdi.kisaTanim}
                rozetler={girdi.ilgili.slice(0, 3).map((ilgi) => (
                  <KartEtiketi key={ilgi}>{ilgi}</KartEtiketi>
                ))}
                altBilgi={
                  <span className="inline-flex items-center gap-1.5">
                    <Onay className="size-3.5 text-basari" />
                    {tarihUzun(girdi.sonDogrulama)}
                  </span>
                }
              />
            ))}
          </KartIzgarasi>
        ) : (
          <BosDurum
            baslik={`${kategori.ad} girdileri hazırlanıyor`}
            metin="Bu küme, anlamlı minimum içerik kümesi oluşmadan menüde öne çıkarılmaz. Şimdilik yayında olan diğer kategorilere göz atabilirsiniz."
            eylem={<Dugme href="/atlas/">Atlas&apos;a dön</Dugme>}
          />
        )}
      </Bolum>
    </>
  );
}
