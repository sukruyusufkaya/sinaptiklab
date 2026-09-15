import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { Kod, Ok } from '@/components/arayuz/Ikonlar';
import { ogrenmeYollari } from '@/lib/icerik/ogrenme';

export const metadata: Metadata = {
  title: 'Projeler',
  description:
    'Her öğrenme yolu bir projeyle kapanır. Projeler, öğrenilen kavramların çalışan bir sisteme dönüştüğü yerdir.',
  alternates: { canonical: '/ogren/projeler/' },
};

const PROJELER = [
  {
    slug: 'kurumsal-belge-asistani',
    ad: 'Kurumsal belge asistanı',
    yolSlug: 'generative-ai-engineer',
    seviye: 'Orta',
    ozet: 'Kendi doküman setiniz üzerinde kaynak gösteren bir soru-cevap sistemi kurun; geri getirme kalitesini ayrı ölçün.',
    cikti: ['Hibrit arama', 'Kaynak referansı', 'Geri getirme metriği'],
  },
  {
    slug: 'arac-kullanan-ajan',
    ad: 'Araç kullanan ajan',
    yolSlug: 'ai-agent-developer',
    seviye: 'İleri',
    ozet: 'Üç araçlı bir ajan tasarlayın: şema doğrulama, hata kurtarma ve insan onayı adımını dahil edin.',
    cikti: ['Araç şeması', 'Hata kurtarma', 'Denetim kaydı'],
  },
  {
    slug: 'degerlendirme-hatti',
    ad: 'Değerlendirme hattı',
    yolSlug: 'generative-ai-engineer',
    seviye: 'İleri',
    ozet: 'Gerçek kullanımdan 30 görev toplayın, başarı tanımını yazın ve regresyon testine bağlayın.',
    cikti: ['Görev seti', 'Puanlama', 'Regresyon'],
  },
  {
    slug: 'gorsel-kalite-kontrol',
    ad: 'Görsel kalite kontrol',
    yolSlug: 'computer-vision-engineer',
    seviye: 'Orta',
    ozet: 'Küçük bir veri setiyle kusur tespiti modeli eğitin; belirsizlik eşiğiyle insan kontrolüne yönlendirin.',
    cikti: ['Etiketleme', 'Model eğitimi', 'Belirsizlik eşiği'],
  },
  {
    slug: 'kullanim-senaryosu-portfoyu',
    ad: 'Kullanım senaryosu portföyü',
    yolSlug: 'yoneticiler-icin-yapay-zeka',
    seviye: 'Temel',
    ozet: 'Kurumunuz için 10 senaryo çıkarın, etki ve uygulanabilirlik eksenlerinde haritalayın.',
    cikti: ['Senaryo haritası', 'Önceliklendirme', 'Başarı tanımı'],
  },
  {
    slug: 'ai-ozellik-plani',
    ad: 'AI özellik planı',
    yolSlug: 'ai-product-manager',
    seviye: 'Orta',
    ozet: 'Bir ürün özelliği için değerlendirme planı, risk matrisi ve kabul ölçütlerini yazın.',
    cikti: ['Değerlendirme planı', 'Risk matrisi', 'Kabul ölçütü'],
  },
];

export default async function ProjelerSayfasi() {
  const OGRENME_YOLLARI = await ogrenmeYollari();

  return (
    <>
      <SayfaBasligi
        kirintilar={[
          { ad: 'Öğren', yol: '/ogren/' },
          { ad: 'Projeler', yol: '/ogren/projeler/' },
        ]}
        etiket="LEARN"
        baslik="Projeler"
        ozet="Bir rotanın son bölümü her zaman projedir. Öğrenmenin kanıtı sertifika değil çalışan bir sistemdir."
        olcumler={[
          { deger: `${PROJELER.length}`, etiket: 'Proje' },
          { deger: `${OGRENME_YOLLARI.length}`, etiket: 'Rota' },
          { deger: 'Teslim', etiket: 'Çıktı biçimi' },
        ]}
        eylemler={
          <Dugme href="/lab/" gorunum="ikincil">
            <Kod className="size-4" />
            Lab araçları
          </Dugme>
        }
      />

      <Bolum>
        <BolumBasligi
          numara="01"
          etiket="PROJELER"
          baslik="Rotaların kapanış projeleri"
          aciklama="Her proje bir rotaya bağlıdır ve o rotada öğrenilen kavramların hepsini kullanır."
        />

        <ul className="space-y-4">
          {PROJELER.map((proje) => {
            const yol = OGRENME_YOLLARI.find((y) => y.slug === proje.yolSlug);
            return (
              <li
                key={proje.slug}
                className="rounded-2xl border border-kenar bg-yuzey/40 p-6 transition-colors hover:border-vurgu/40"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <span className="etiket-mono text-vurgu-parlak">{proje.seviye}</span>
                      {yol && (
                        <>
                          <span className="size-1 rounded-full bg-kenar-guclu" aria-hidden="true" />
                          <Link
                            href={`/ogren/yollar/${yol.slug}/`}
                            className="etiket-mono text-metin-soluk transition-colors hover:text-metin"
                          >
                            {yol.ad}
                          </Link>
                        </>
                      )}
                    </div>

                    <h3 className="mt-3 text-[1.125rem] font-semibold tracking-tight text-metin">
                      {proje.ad}
                    </h3>
                    <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-metin-ikincil">
                      {proje.ozet}
                    </p>
                  </div>

                  <div className="lg:w-64 lg:shrink-0 lg:border-l lg:border-kenar-soluk lg:pl-6">
                    <p className="etiket-mono mb-2.5 text-metin-soluk">Teslim edilecekler</p>
                    <ul className="space-y-1.5">
                      {proje.cikti.map((cikti) => (
                        <li
                          key={cikti}
                          className="flex items-center gap-2 text-xs text-metin-ikincil"
                        >
                          <span
                            className="size-1.5 shrink-0 rounded-full bg-vurgu-sonuk"
                            aria-hidden="true"
                          />
                          {cikti}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <p className="mt-6 text-xs text-metin-soluk">
          Proje teslim ve inceleme akışı üyelikle birlikte açılacak. Proje tanımları bugün açık.
        </p>
      </Bolum>

      <Bolum zemin="derin">
        <BolumBasligi numara="02" etiket="NEDEN PROJE" baslik="Sertifika değil çıktı" />
        <div className="olcu">
          <p className="font-serif text-[1.0625rem] leading-relaxed text-metin-ikincil">
            Bir kavramı anlayıp anlamadığınızı en iyi ölçen şey, onu çalışan bir sisteme
            dönüştürmeye çalışmaktır. Ders izlerken her şey açık görünür; parçalama uzunluğunu
            seçmek gerektiğinde açık olmadığı fark edilir.
          </p>
          <p className="mt-5 font-serif text-[1.0625rem] leading-relaxed text-metin-ikincil">
            Bu yüzden her rota bir projeyle kapanır ve proje çıktısı, rotanın kavram listesiyle
            birebir eşleşir.
          </p>
        </div>
        <div className="mt-7">
          <Dugme href="/ogren/yollar/">
            Rotaları incele
            <Ok className="size-4" />
          </Dugme>
        </div>
      </Bolum>
    </>
  );
}
