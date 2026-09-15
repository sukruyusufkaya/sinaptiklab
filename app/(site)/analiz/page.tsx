import type { Metadata } from 'next';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { Kart, KartEtiketi, KartIzgarasi } from '@/components/arayuz/Kart';
import { BosDurum } from '@/components/arayuz/Filtreler';
import { ListeSemasi } from '@/lib/seo/jsonld';
import { analizler } from '@/lib/icerik/gundem';
import { yazarBul } from '@/lib/icerik/temel';
import { tarihUzun } from '@/lib/bicim';

export const metadata: Metadata = {
  title: 'Derin Analizler',
  description:
    'Haber ne olduğunu söyler, analiz bunun ne anlama geldiğini. Agentic AI, değerlendirme, robotik ve kurumsal yapay zekâ üzerine derin incelemeler.',
  alternates: { canonical: '/analiz/' },
};

export default async function AnalizArsivi() {
  const ANALIZLER = await analizler();
  const sirali = [...ANALIZLER].sort((a, b) => b.tarih.localeCompare(a.tarih));

  // İmzalar JSX içinde beklenemez; analiz slug'ı başına bir kez çözülür.
  const yazarlar = new Map(
    await Promise.all(
      sirali.map(async (analiz) => [analiz.slug, await yazarBul(analiz.yazarSlug)] as const),
    ),
  );

  // Liste boşken ortalama tanımsızdır; sıfır dakika diye gösterilmez.
  const ortalamaDakika = ANALIZLER.length
    ? Math.round(ANALIZLER.reduce((t, a) => t + a.okumaDakika, 0) / ANALIZLER.length)
    : undefined;

  return (
    <>
      <ListeSemasi
        ad="Derin analizler"
        ogeler={ANALIZLER.map((analiz) => ({ ad: analiz.baslik, yol: `/analiz/${analiz.slug}/` }))}
      />

      <SayfaBasligi
        kirintilar={[{ ad: 'Analizler', yol: '/analiz/' }]}
        etiket="THOUGHT LEADERSHIP"
        baslik="Derinlemesine"
        ozet="Her analiz tek soruya cevap arar: peki bunun anlamı ne? Kaynaklandırılmış iddia, açık varsayım, net sonuç."
        olcumler={[
          { deger: `${ANALIZLER.length}`, etiket: 'Analiz' },
          ...(ortalamaDakika ? [{ deger: `${ortalamaDakika}`, etiket: 'Ortalama dk' }] : []),
        ]}
      />

      <Bolum>
        {sirali.length > 0 ? (
          <KartIzgarasi kolon={2}>
            {sirali.map((analiz) => {
              const yazar = yazarlar.get(analiz.slug);
              return (
                <Kart
                  key={analiz.slug}
                  yol={`/analiz/${analiz.slug}/`}
                  ustEtiket={analiz.konu}
                  baslik={analiz.baslik}
                  aciklama={analiz.girizgah}
                  rozetler={<KartEtiketi>{analiz.okumaDakika} dakikalık okuma</KartEtiketi>}
                  altBilgi={
                    <span>
                      {yazar ? `${yazar.ad} · ` : ''}
                      {tarihUzun(analiz.tarih)}
                    </span>
                  }
                />
              );
            })}
          </KartIzgarasi>
        ) : (
          <BosDurum
            baslik="Analiz arşivi hazırlanıyor"
            metin="Henüz yayımlanmış derin analiz yok. Bölüm, anlamlı minimum içerik kümesi oluşmadan dolu gösterilmez."
          />
        )}
      </Bolum>
    </>
  );
}
