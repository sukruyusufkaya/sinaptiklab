import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { Rozet } from '@/components/arayuz/Rozet';
import { Ok, Onay } from '@/components/arayuz/Ikonlar';
import { KapanisCagrisi } from '@/components/icerik/IcerikDuzeni';
import { dersler, ogrenmeYollari } from '@/lib/icerik/ogrenme';

export const metadata: Metadata = {
  title: 'Sinaptik Academy',
  description:
    'Üç katmanlı öğrenme yapısı: ücretsiz mikro dersler, yapılandırılmış öğrenme yolları ve premium kapsamlı programlar.',
  alternates: { canonical: '/akademi/' },
};

const KATMANLAR = [
  {
    ad: 'Learn',
    baslik: 'Ücretsiz mikro dersler',
    ozet: 'Tek konuya odaklı, 15–35 dakikalık dersler. Üyelik gerekmez, tamamı taranabilir.',
    durum: 'Açık',
    ton: 'basari' as const,
    yol: '/ogren/dersler/',
    ozellikler: ['Tek konu odaklı', 'Atlas kavramlarına bağlı', 'Ücretsiz'],
  },
  {
    ad: 'Path',
    baslik: 'Yapılandırılmış öğrenme yolları',
    ozet: 'Rolüne göre rotalar. Bölümler teori → örnek → lab → test → proje döngüsüyle ilerler.',
    durum: 'Açık',
    ton: 'vurgu' as const,
    yol: '/ogren/yollar/',
    ozellikler: ['Beceri grafiği', 'İlerleme takibi', 'Ölçüm testleri'],
  },
  {
    ad: 'Programs',
    baslik: 'Premium kapsamlı programlar',
    ozet: 'Canlı oturum, mentorluk, proje incelemesi ve sertifika içeren uzun soluklu programlar.',
    durum: 'Yakında',
    ton: 'notr' as const,
    yol: '/akademi/sertifikalar/',
    ozellikler: ['Canlı oturum', 'Proje incelemesi', 'Sertifika'],
  },
];

const PROGRAMLAR = [
  {
    ad: 'Generative AI Developer Program',
    sure: '10 hafta',
    ozet: 'RAG, değerlendirme ve üretime alma üzerine uçtan uca program.',
    yolSlug: 'generative-ai-engineer',
  },
  {
    ad: 'AI Agent Engineer Program',
    sure: '8 hafta',
    ozet: 'Araç kullanımı, planlama, bellek ve güvenlik sınırları.',
    yolSlug: 'ai-agent-developer',
  },
  {
    ad: 'Computer Vision Program',
    sure: '8 hafta',
    ozet: 'Tespit, segmentasyon ve kenar dağıtımı.',
    yolSlug: 'computer-vision-engineer',
  },
  {
    ad: 'AI for Executives',
    sure: '4 hafta',
    ozet: 'Strateji, yönetişim ve kullanım senaryosu seçimi.',
    yolSlug: 'yoneticiler-icin-yapay-zeka',
  },
];

export default async function AkademiSayfasi() {
  const [DERSLER, OGRENME_YOLLARI] = await Promise.all([dersler(), ogrenmeYollari()]);

  return (
    <>
      <SayfaBasligi
        kirintilar={[
          { ad: 'Öğren', yol: '/ogren/' },
          { ad: 'Academy', yol: '/akademi/' },
        ]}
        etiket="LEARN"
        baslik="Sinaptik Academy"
        ozet="Academy üç katmandan oluşur. Alt iki katman herkese açık ve taranabilir; üst katman canlı oturum ve mentorluk içerdiği için premium."
        olcumler={[
          { deger: `${DERSLER.length}`, etiket: 'Mikro ders' },
          { deger: `${OGRENME_YOLLARI.length}`, etiket: 'Öğrenme yolu' },
          { deger: `${PROGRAMLAR.length}`, etiket: 'Planlanan program' },
          { deger: '3', etiket: 'Katman' },
        ]}
      />

      <Bolum>
        <BolumBasligi numara="01" etiket="KATMANLAR" baslik="Üç katman" />
        <ul className="grid gap-4 lg:grid-cols-3">
          {KATMANLAR.map((katman) => (
            <li key={katman.ad}>
              <div className="flex h-full flex-col rounded-2xl border border-kenar bg-yuzey/40 p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-lg font-medium tracking-tight text-metin">
                    {katman.ad}
                  </span>
                  <Rozet ton={katman.ton}>{katman.durum}</Rozet>
                </div>

                <p className="mt-4 text-[1.0625rem] leading-snug font-semibold tracking-tight text-metin">
                  {katman.baslik}
                </p>
                <p className="mt-2.5 flex-1 text-[0.875rem] leading-relaxed text-metin-ikincil">
                  {katman.ozet}
                </p>

                <ul className="mt-5 space-y-2">
                  {katman.ozellikler.map((ozellik) => (
                    <li key={ozellik} className="flex items-center gap-2 text-xs text-metin-soluk">
                      <Onay className="size-3.5 shrink-0 text-basari" />
                      {ozellik}
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  <Dugme
                    href={katman.yol}
                    gorunum={katman.durum === 'Açık' ? 'birincil' : 'ikincil'}
                    boyut="sm"
                  >
                    {katman.durum === 'Açık' ? 'Katmanı aç' : 'Bilgi al'}
                    <Ok className="size-3.5" />
                  </Dugme>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Bolum>

      <Bolum zemin="derin">
        <BolumBasligi
          numara="02"
          etiket="PROGRAMLAR"
          baslik="Planlanan premium programlar"
          aciklama="Programlar, ilgili ücretsiz rotanın üzerine canlı oturum ve proje incelemesi ekler."
        />
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2">
          {PROGRAMLAR.map((program) => (
            <li key={program.ad} className="bg-zemin p-6">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[1.0625rem] leading-snug font-semibold tracking-tight text-metin">
                  {program.ad}
                </p>
                <span className="etiket-mono shrink-0 text-metin-soluk">{program.sure}</span>
              </div>
              <p className="mt-2.5 text-[0.875rem] leading-relaxed text-metin-ikincil">
                {program.ozet}
              </p>
              <Link
                href={`/ogren/yollar/${program.yolSlug}/`}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-vurgu-parlak"
              >
                Ücretsiz rotayı gör
                <Ok className="size-3.5" />
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-6 rounded-lg border border-kenar bg-yuzey/40 px-4 py-3 text-xs text-metin-soluk">
          Programlar henüz kayda açılmadı. Ücretsiz rotalar ve dersler bugün erişilebilir durumda;
          program takvimi bültenle duyurulacak.
        </p>
      </Bolum>

      <KapanisCagrisi
        etiket="BUGÜN"
        baslik="Programı beklemene gerek yok"
        metin="Rotalar ve dersler açık. Önce seviye testiyle nerede durduğunu gör, sonra rotana başla."
        eylemler={
          <>
            <Dugme href="/seviye-testi/">
              Seviyeni ölç
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/bulten/" gorunum="ikincil">
              Program duyurusu için bülten
            </Dugme>
          </>
        }
      />
    </>
  );
}
