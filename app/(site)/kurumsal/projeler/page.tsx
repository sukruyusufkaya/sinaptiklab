import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { Ok, Onay } from '@/components/arayuz/Ikonlar';
import { KapanisCagrisi } from '@/components/icerik/IcerikDuzeni';
import { hizmetler, SUREC_ADIMLARI, vakalar } from '@/lib/icerik/kurumsal';

export const metadata: Metadata = {
  title: 'AI Projeleri',
  description:
    'Uçtan uca yapay zekâ proje geliştirme: discovery, PoC, üretim ve devir. Çalışma modelleri, teslim edilenler ve sorumluluk sınırları.',
  alternates: { canonical: '/kurumsal/projeler/' },
};

const MODELLER = [
  {
    ad: 'Discovery & Assessment',
    sure: '2–4 hafta',
    ozet: 'Senaryo, veri ve kısıt envanteri; uygulanabilirlik ve öncelik değerlendirmesi.',
    teslim: ['Senaryo portföyü', 'Veri değerlendirmesi', 'Yol haritası'],
  },
  {
    ad: 'Prototype & PoC',
    sure: '4–8 hafta',
    ozet: 'Tanımlı başarı ölçütüyle çalışan ilk sürüm ve kanıt çalışması.',
    teslim: ['Çalışan prototip', 'Değerlendirme raporu', 'Karar önerisi'],
  },
  {
    ad: 'Production',
    sure: '8–16 hafta',
    ozet: 'Güvenlik, ölçek, gözlemlenebilirlik ve operasyon devri.',
    teslim: ['Üretim sistemi', 'İzleme', 'Dokümantasyon'],
  },
  {
    ad: 'Ortak ekip modeli',
    sure: 'Sürekli',
    ozet: 'Kurum ekibiyle birlikte çalışma; yetkinlik transferi öncelikli.',
    teslim: ['Ortak sprint', 'Kod incelemesi', 'Eğitim'],
  },
];

export default async function KurumsalProjelerSayfasi() {
  const [HIZMETLER, VAKALAR] = await Promise.all([hizmetler(), vakalar()]);

  return (
    <>
      <SayfaBasligi
        kirintilar={[
          { ad: 'Kurumsal', yol: '/kurumsal/' },
          { ad: 'AI Projeleri', yol: '/kurumsal/projeler/' },
        ]}
        etiket="BUILD"
        baslik="AI projeleri"
        ozet="Proje, slayt değil çalışan sistemle kapanır. Her aşamanın teslim edilenleri ve bir sonraki aşamaya geçiş ölçütü baştan yazılır."
        olcumler={[
          { deger: `${MODELLER.length}`, etiket: 'Çalışma modeli' },
          { deger: `${SUREC_ADIMLARI.length}`, etiket: 'Süreç adımı' },
          { deger: `${VAKALAR.length}`, etiket: 'Vaka çalışması' },
          { deger: `${HIZMETLER.length}`, etiket: 'Hizmet hattı' },
        ]}
        eylemler={
          <>
            <Dugme href="/iletisim/">
              Proje değerlendirmesi
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/vaka-calismalari/" gorunum="ikincil">
              Vaka çalışmaları
            </Dugme>
          </>
        }
      />

      <Bolum>
        <BolumBasligi
          numara="01"
          etiket="ÇALIŞMA MODELLERİ"
          baslik="Nasıl çalışıyoruz?"
          aciklama="Model seçimi, kurumun olgunluk seviyesine ve iç ekip kapasitesine göre yapılır."
        />
        <ul className="grid gap-4 md:grid-cols-2">
          {MODELLER.map((model) => (
            <li
              key={model.ad}
              className="flex flex-col rounded-2xl border border-kenar bg-yuzey/40 p-6"
            >
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[1.0625rem] font-semibold tracking-tight text-metin">
                  {model.ad}
                </p>
                <span className="etiket-mono shrink-0 text-metin-soluk">{model.sure}</span>
              </div>
              <p className="mt-2.5 flex-1 text-[0.875rem] leading-relaxed text-metin-ikincil">
                {model.ozet}
              </p>
              <p className="etiket-mono mt-5 mb-2.5 text-metin-soluk">Teslim edilenler</p>
              <ul className="space-y-1.5">
                {model.teslim.map((teslim) => (
                  <li key={teslim} className="flex items-center gap-2 text-xs text-metin-ikincil">
                    <Onay className="size-3.5 shrink-0 text-basari" />
                    {teslim}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Bolum>

      <Bolum zemin="derin">
        <BolumBasligi numara="02" etiket="SÜREÇ" baslik="Aşamalar" />
        <ol className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-3 lg:grid-cols-6">
          {SUREC_ADIMLARI.map((adim, sira) => (
            <li key={adim.ad} className="bg-zemin p-5">
              <span className="etiket-mono text-vurgu-parlak">
                {String(sira + 1).padStart(2, '0')}
              </span>
              <p className="mt-2.5 text-[0.9375rem] font-medium text-metin">{adim.ad}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-metin-soluk">{adim.ozet}</p>
            </li>
          ))}
        </ol>

        <div className="mt-6 rounded-xl border border-kenar bg-yuzey/40 p-5">
          <p className="etiket-mono mb-2 text-metin-soluk">Sorumluluk sınırı</p>
          <p className="text-[0.875rem] leading-relaxed text-metin-ikincil">
            Üretime alınan her sistem için operasyon sahipliği, izleme eşikleri ve olay müdahale
            sorumluluğu yazılı olarak devredilir. Devri tanımlanmamış sistem üretim sayılmaz.
          </p>
        </div>
      </Bolum>

      <Bolum>
        <BolumBasligi
          numara="03"
          etiket="HİZMET HATLARI"
          baslik="Hangi alanda proje?"
          baglantiYolu="/kurumsal/"
        />
        <ul className="flex flex-wrap gap-2">
          {HIZMETLER.map((hizmet) => (
            <li key={hizmet.slug}>
              <Link
                href={`/kurumsal/${hizmet.slug}/`}
                className="rounded-full border border-kenar bg-yuzey/40 px-4 py-2 text-sm text-metin-ikincil transition-colors hover:border-vurgu/45 hover:text-metin"
              >
                {hizmet.ad}
              </Link>
            </li>
          ))}
        </ul>
      </Bolum>

      <KapanisCagrisi
        etiket="İLETİŞİM"
        baslik="Projenizi birlikte değerlendirelim"
        metin="İlk görüşme ücretsizdir ve teknik bir teklif değil, uygulanabilirlik değerlendirmesiyle sonuçlanır."
        eylemler={
          <>
            <Dugme href="/iletisim/">
              Görüşme talep et
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/kurumsal/ai-readiness/" gorunum="ikincil">
              AI Readiness
            </Dugme>
          </>
        }
      />
    </>
  );
}
