import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Ok } from '@/components/arayuz/Ikonlar';
import { IletisimFormu } from '@/components/form/IletisimFormu';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'İletişim',
  description:
    'Kurumsal proje, editoryal düzeltme, uzman katkısı veya basın talepleri için Sinaptik Lab ile iletişime geçin.',
  alternates: { canonical: '/iletisim/' },
};

const KANALLAR = [
  {
    ad: 'Kurumsal talepler',
    tarif: 'Proje değerlendirmesi, AI Readiness ve eğitim talepleri.',
    yol: '/kurumsal/',
    baglantiMetni: 'Kurumsal hizmetler',
  },
  {
    ad: 'İçerik düzeltmesi',
    tarif: 'Hata bildirimleri değerlendirilir ve doğrulanan hatalar düzeltme kaydıyla düzeltilir.',
    yol: '/duzeltme-politikasi/',
    baglantiMetni: 'Düzeltme politikası',
  },
  {
    ad: 'Uzman katkısı',
    tarif: 'Atlas girdisi yazma, teknik inceleme ve podcast konukluğu.',
    yol: '/topluluk/katki/',
    baglantiMetni: 'Katkı biçimleri',
  },
  {
    ad: 'Basın ve veri',
    tarif: 'Araştırma verilerimizi kaynak göstererek kullanabilirsiniz.',
    yol: '/arastirma/',
    baglantiMetni: 'Araştırma yayınları',
  },
];

export default function IletisimSayfasi() {
  return (
    <>
      <SayfaBasligi
        kirintilar={[{ ad: 'İletişim', yol: '/iletisim/' }]}
        etiket="KURUMSAL"
        baslik="İletişim"
        ozet="Hangi konuda yazdığınızı seçin; talep doğru masaya düşsün. Kurumsal taleplerde ilk görüşme uygulanabilirlik değerlendirmesiyle sonuçlanır."
        yan={<IletisimFormu />}
      />

      <Bolum>
        <BolumBasligi numara="01" etiket="KANALLAR" baslik="Hangi konuda yazıyorsunuz?" />
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2">
          {KANALLAR.map((kanal) => (
            <li key={kanal.ad} className="bg-zemin p-6">
              <p className="text-[1.0625rem] font-semibold tracking-tight text-metin">{kanal.ad}</p>
              <p className="mt-2 text-[0.875rem] leading-relaxed text-metin-ikincil">
                {kanal.tarif}
              </p>
              <Link
                href={kanal.yol}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-vurgu-parlak"
              >
                {kanal.baglantiMetni}
                <Ok className="size-3.5" />
              </Link>
            </li>
          ))}
        </ul>
      </Bolum>

      <Bolum zemin="derin">
        <BolumBasligi numara="02" etiket="SOSYAL" baslik="Diğer kanallar" />
        <ul className="flex flex-wrap gap-2">
          {[
            { ad: 'LinkedIn', yol: SITE.sosyal.linkedin },
            { ad: 'X', yol: SITE.sosyal.x },
            { ad: 'GitHub', yol: SITE.sosyal.github },
            { ad: 'YouTube', yol: SITE.sosyal.youtube },
          ].map((sosyal) => (
            <li key={sosyal.ad}>
              <a
                href={sosyal.yol}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-kenar bg-yuzey/40 px-4 py-2 text-sm text-metin-ikincil transition-colors hover:border-kenar-guclu hover:text-metin"
              >
                {sosyal.ad}
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-6 rounded-lg border border-kenar bg-yuzey/40 px-4 py-3 text-xs text-metin-soluk">
          Sosyal medya hesapları yayına alındığında bu bağlantılar etkinleşecek.
        </p>
      </Bolum>
    </>
  );
}
