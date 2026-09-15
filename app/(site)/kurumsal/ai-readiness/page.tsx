import type { Metadata } from 'next';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { Hedef, Ok } from '@/components/arayuz/Ikonlar';
import { KapanisCagrisi } from '@/components/icerik/IcerikDuzeni';
import { ReadinessDegerlendirmesi } from '@/components/kurumsal/ReadinessDegerlendirmesi';
import { READINESS_BOYUTLARI } from '@/lib/icerik/kurumsal';
import { READINESS_BOYUTLARI_TAM } from '@/lib/veri/readiness';

export const metadata: Metadata = {
  title: 'AI Readiness Assessment',
  description:
    'Strateji, veri, altyapı, yetenek, yönetişim, kullanım senaryoları ve güvenlik boyutlarında kurumsal yapay zekâ olgunluk değerlendirmesi.',
  alternates: { canonical: '/kurumsal/ai-readiness/' },
};

const OLGUNLUK = [
  { ad: 'Exploring', aralik: '0–39', tarif: 'Dağınık denemeler, yazılı strateji yok.' },
  { ad: 'Experimenting', aralik: '40–59', tarif: 'Pilotlar var, üretime geçiş zayıf.' },
  { ad: 'Operating', aralik: '60–79', tarif: 'Üretimde sistemler var, ölçüm kuruluyor.' },
  { ad: 'Scaling', aralik: '80–100', tarif: 'Yönetişim ve ölçüm kurumsallaşmış.' },
];

const ORNEK_SKOR = 62;

export default function AiReadinessSayfasi() {
  return (
    <>
      <SayfaBasligi
        kirintilar={[
          { ad: 'Kurumsal', yol: '/kurumsal/' },
          { ad: 'AI Readiness', yol: '/kurumsal/ai-readiness/' },
        ]}
        etiket="ÜCRETSİZ DEĞERLENDİRME"
        baslik="AI Readiness Assessment"
        ozet="Yapay zekâ olgunluğu tek bir soruyla ölçülmez. Yedi boyutta yapılandırılmış değerlendirme, en yüksek getirili ilk adımı işaret eder."
        olcumler={[
          { deger: `${READINESS_BOYUTLARI.length}`, etiket: 'Boyut' },
          { deger: '0–100', etiket: 'Ölçek' },
          { deger: `${OLGUNLUK.length}`, etiket: 'Olgunluk seviyesi' },
          {
            deger: `${READINESS_BOYUTLARI_TAM.reduce((t, b) => t + b.ifadeler.length, 0)}`,
            etiket: 'İfade',
          },
        ]}
        eylemler={
          <>
            <Dugme href="/kurumsal/ai-readiness/#degerlendirme" boyut="lg">
              <Hedef className="size-4" />
              Değerlendirmeyi başlat
            </Dugme>
            <Dugme href="/arastirma/enterprise-ai-readiness-index/" gorunum="ikincil" boyut="lg">
              Endeks metodolojisi
            </Dugme>
          </>
        }
        yan={
          <div className="rounded-2xl border border-vurgu/30 bg-gradient-to-b from-vurgu-zemin/50 to-zemin-derin p-6">
            <p className="etiket-mono mb-4 text-vurgu-parlak">Örnek çıktı</p>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-5xl font-medium tracking-tighter tabular-nums">
                {ORNEK_SKOR}
              </span>
              <span className="font-mono text-lg text-metin-soluk">/100</span>
            </div>
            <p className="mt-1 text-sm font-medium text-uyari">Experimenting</p>

            <div className="mt-5 space-y-2">
              {READINESS_BOYUTLARI.map((boyut) => (
                <div key={boyut.ad} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-[0.6875rem] text-metin-soluk">
                    {boyut.ad}
                  </span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-yuzey-3">
                    <span
                      className="block h-full rounded-full bg-vurgu"
                      style={{ width: `${boyut.ornekSkor}%` }}
                    />
                  </span>
                  <span className="etiket-mono w-6 text-right text-metin-soluk tabular-nums">
                    {boyut.ornekSkor}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-4 border-t border-kenar-soluk pt-3.5 text-[0.6875rem] leading-relaxed text-uyari">
              Örnek değerler. Gerçek skorunuz değerlendirme sonucunda üretilir.
            </p>
          </div>
        }
      />

      {/* --- Etkileşimli değerlendirme --- */}
      <Bolum kimlik="degerlendirme">
        <BolumBasligi
          numara="01"
          etiket="DEĞERLENDİRME"
          baslik="Kurumunuzu ölçün"
          aciklama="Yedi boyutta gözlemlenebilir ifadeler. Skor ağırlıklı ortalamadır; sonunda en yüksek getirili ilk üç adımı görürsünüz."
        />
        <ReadinessDegerlendirmesi />
      </Bolum>

      {/* --- Boyutlar --- */}
      <Bolum zemin="derin">
        <BolumBasligi
          numara="02"
          etiket="BOYUTLAR"
          baslik="Yedi boyut"
          aciklama="Boyutlar birbirini dengeler: güçlü altyapı, zayıf yönetişimle birlikte risk üretir."
        />
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-4">
          {READINESS_BOYUTLARI.map((boyut, sira) => (
            <li key={boyut.ad} className="bg-zemin p-6">
              <span className="etiket-mono text-metin-soluk">
                {String(sira + 1).padStart(2, '0')}
              </span>
              <p className="mt-3 text-[1.0625rem] font-semibold tracking-tight text-metin">
                {boyut.ad}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-metin-soluk">
                {BOYUT_TARIFLERI[boyut.ad] ?? 'Olgunluk göstergeleriyle ayrı ayrı puanlanır.'}
              </p>
            </li>
          ))}
        </ul>
      </Bolum>

      {/* --- Olgunluk --- */}
      <Bolum>
        <BolumBasligi numara="03" etiket="SEVİYELER" baslik="Skor ne anlama geliyor?" />
        <ul className="space-y-3">
          {OLGUNLUK.map((seviye) => (
            <li
              key={seviye.ad}
              className="flex flex-col gap-3 rounded-2xl border border-kenar bg-yuzey/40 p-5 sm:flex-row sm:items-center sm:gap-6"
            >
              <span className="text-[0.9375rem] font-semibold tracking-tight text-metin sm:w-40">
                {seviye.ad}
              </span>
              <span className="etiket-mono w-16 shrink-0 text-metin-soluk tabular-nums">
                {seviye.aralik}
              </span>
              <span className="flex-1 text-[0.875rem] leading-relaxed text-metin-ikincil">
                {seviye.tarif}
              </span>
            </li>
          ))}
        </ul>
      </Bolum>

      {/* --- Süreç --- */}
      <Bolum zemin="derin">
        <BolumBasligi numara="04" etiket="NASIL İŞLİYOR" baslik="Değerlendirme akışı" />
        <ol className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-4">
          {[
            { ad: 'Anket', tarif: 'Yedi boyutta yapılandırılmış öz değerlendirme.' },
            { ad: 'Görüşme', tarif: 'Teknik ve iş tarafıyla doğrulama oturumu.' },
            { ad: 'Skorlama', tarif: 'Boyut bazında ağırlıklı puan ve olgunluk seviyesi.' },
            { ad: 'Yol haritası', tarif: 'En yüksek getirili ilk üç adım ve başarı tanımı.' },
          ].map((adim, sira) => (
            <li key={adim.ad} className="bg-zemin p-6">
              <span className="etiket-mono grid size-7 place-items-center rounded-full border border-vurgu/35 bg-vurgu-zemin text-vurgu-parlak">
                {sira + 1}
              </span>
              <p className="mt-3.5 text-[0.9375rem] font-medium text-metin">{adim.ad}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-metin-soluk">{adim.tarif}</p>
            </li>
          ))}
        </ol>

        <div className="mt-6 rounded-xl border border-kenar bg-yuzey/40 p-5">
          <p className="etiket-mono mb-2 text-metin-soluk">Veri kullanımı</p>
          <p className="text-[0.875rem] leading-relaxed text-metin-ikincil">
            Değerlendirme verileri yalnızca kurumunuzun raporunu üretmek için kullanılır. Anonim ve
            toplu istatistikler, izniniz olmadan endeks yayınlarına dâhil edilmez.
          </p>
        </div>
      </Bolum>

      <KapanisCagrisi
        etiket="SONRAKİ ADIM"
        baslik="Skoru bir yol haritasına çevirelim"
        metin="Değerlendirme sonrası oturumda en yüksek getirili ilk üç adımı ve ölçülebilir başarı tanımlarını birlikte yazıyoruz."
        eylemler={
          <>
            <Dugme href="/iletisim/">
              Değerlendirme talep et
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/vaka-calismalari/" gorunum="ikincil">
              Vaka çalışmaları
            </Dugme>
          </>
        }
      />
    </>
  );
}

const BOYUT_TARIFLERI: Record<string, string> = {
  Strateji: 'Yazılı hedef, sahiplik ve bütçe; pilotların iş sonucuna bağlanma biçimi.',
  Veri: 'Erişilebilirlik, kalite, sahiplik ve kataloglama olgunluğu.',
  Altyapı: 'Hesaplama, dağıtım ve entegrasyon kapasitesi.',
  Yetenek: 'İç yetkinlik, işe alma ve eğitim kapasitesi.',
  Yönetişim: 'Politika, envanter, risk sınıflandırması ve denetim.',
  'Kullanım senaryoları': 'Senaryo portföyünün önceliklendirilmiş ve ölçülebilir olması.',
  Güvenlik: 'Yetkilendirme, veri koruma ve model güvenliği kontrolleri.',
};
