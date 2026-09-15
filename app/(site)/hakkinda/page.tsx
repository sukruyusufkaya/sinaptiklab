import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { Ok } from '@/components/arayuz/Ikonlar';
import { KapanisCagrisi } from '@/components/icerik/IcerikDuzeni';
import { KATMANLAR, SITE } from '@/lib/site';
import { atlasListesi } from '@/lib/icerik/atlas';
import { ogrenmeYollari, testler } from '@/lib/icerik/ogrenme';
import { arastirmaListesi } from '@/lib/icerik/arastirma';

export const metadata: Metadata = {
  title: 'Hakkında',
  description:
    'Sinaptik Lab nedir, neyi amaçlar ve nasıl çalışır? Discover → Understand → Learn → Build katmanları ve editoryal duruş.',
  alternates: { canonical: '/hakkinda/' },
};

const MOAT = [
  {
    ad: 'Bilgi grafiği',
    tarif: 'Kavramların, modellerin, şirketlerin ve becerilerin ilişkisel haritası.',
  },
  { ad: 'Özgün veri', tarif: 'Benchmarklar, saha araştırmaları ve lisanslı veri setleri.' },
  { ad: 'Uzman ağı', tarif: 'Gerçek isimler, gerçek inceleme süreci.' },
  {
    ad: 'Öğrenme grafiği',
    tarif: 'Test → beceri → içerik → rota arasındaki ölçülebilir ilişki.',
  },
  {
    ad: 'Saha deneyimi',
    tarif: 'Kurumsal projelerden gelen ve içeriğe geri dönen know-how.',
  },
];

export default async function HakkindaSayfasi() {
  const [ATLAS, OGRENME_YOLLARI, TESTLER, ARASTIRMA] = await Promise.all([
    atlasListesi(),
    ogrenmeYollari(),
    testler(),
    arastirmaListesi(),
  ]);

  return (
    <>
      <SayfaBasligi
        kirintilar={[{ ad: 'Hakkında', yol: '/hakkinda/' }]}
        etiket="SINAPTIK LAB"
        baslik={SITE.vaat}
        ozet="Sinaptik Lab, yapay zekâ hakkında yazan bir site değil; ne olduğunu anlamak, bir konuyu öğrenmek, bilgiyi doğrulamak ve bunu gerçek bir projeye dönüştürmek isteyen kişinin başladığı platform."
        olcumler={[
          { deger: `${ATLAS.length}`, etiket: 'Atlas girdisi' },
          { deger: `${OGRENME_YOLLARI.length}`, etiket: 'Öğrenme yolu' },
          { deger: `${TESTLER.length}`, etiket: 'Test' },
          { deger: `${ARASTIRMA.length}`, etiket: 'Araştırma yayını' },
        ]}
        eylemler={
          <>
            <Dugme href="/editoryal-ilkeler/">
              Editoryal ilkeler
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/kunye/" gorunum="ikincil">
              Künye
            </Dugme>
          </>
        }
      />

      {/* --- Katmanlar --- */}
      <Bolum>
        <BolumBasligi
          numara="01"
          etiket="YAPI"
          baslik="Dört katman"
          aciklama="Platform, dört farklı ihtiyacın kesişiminde konumlanır. Her katman bir soruya cevap verir."
        />
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-4">
          {KATMANLAR.map((katman, sira) => (
            <li key={katman.anahtar} className="bg-zemin p-6">
              <span className="etiket-mono text-metin-soluk">
                {String(sira + 1).padStart(2, '0')}
              </span>
              <p className="etiket-mono mt-2 text-vurgu-parlak">{katman.ad}</p>
              <p className="mt-3 text-[1.0625rem] leading-snug font-semibold tracking-tight text-metin">
                {katman.soru}
              </p>
              <p className="mt-2.5 text-xs leading-relaxed text-metin-soluk">{katman.urun}</p>
            </li>
          ))}
        </ul>
      </Bolum>

      {/* --- Duruş --- */}
      <Bolum zemin="derin">
        <BolumBasligi numara="02" etiket="DURUŞ" baslik="Nasıl çalışıyoruz?" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="olcu">
            <p className="font-serif text-[1.0625rem] leading-relaxed text-metin-ikincil">
              İçerik organizasyonu &quot;hangi kategoride yazı yayınlayalım?&quot; sorusundan
              başlamıyor. Temel soru şu: yapay zekâ bilgisini nasıl modellenebilir bir yapıya
              dönüştürürüz?
            </p>
            <p className="mt-5 font-serif text-[1.0625rem] leading-relaxed text-metin-ikincil">
              Bu yüzden mimarinin temel nesnesi makale değil{' '}
              <strong className="text-metin">varlık</strong>. Makale varlık hakkında bilgi verir,
              ders onu öğretir, test ölçer, haber değişimini bildirir, araştırma yeni bilgi üretir,
              danışmanlık gerçek dünyaya uygular.
            </p>
          </div>

          <ul className="space-y-3">
            {[
              'Sayısal her iddia kaynaklandırılır.',
              'Her içeriğin görünür bir yazarı vardır.',
              'Yapay zekâ üretimi içerik doğrudan yayımlanmaz.',
              'İçerik değişmeden güncelleme tarihi değiştirilmez.',
              'Benchmark metodolojisi her zaman açıktır.',
              'Araştırma, danışmanlık müşterilerinden bağımsız yürütülür.',
            ].map((ilke) => (
              <li
                key={ilke}
                className="flex items-start gap-3 rounded-xl border border-kenar bg-yuzey/40 p-4"
              >
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-vurgu" aria-hidden="true" />
                <span className="text-[0.9375rem] leading-relaxed text-metin-ikincil">{ilke}</span>
              </li>
            ))}
          </ul>
        </div>
      </Bolum>

      {/* --- Moat --- */}
      <Bolum>
        <BolumBasligi
          numara="03"
          etiket="UZUN VADE"
          baslik="Savunulabilir olan ne?"
          aciklama="Haber moat değildir; başkası da yazabilir. Blog moat değildir; yapay zekâ ile herkes üretebilir."
        />
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-5">
          {MOAT.map((madde, sira) => (
            <li key={madde.ad} className="bg-zemin p-5">
              <span className="etiket-mono text-vurgu-parlak">
                {String(sira + 1).padStart(2, '0')}
              </span>
              <p className="mt-3 text-[0.9375rem] font-semibold tracking-tight text-metin">
                {madde.ad}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-metin-soluk">{madde.tarif}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-[0.875rem] leading-relaxed text-metin-soluk">
          Bu beşinin birleşimini kopyalamak, tek tek kopyalamaktan çok daha zordur.
        </p>
      </Bolum>

      {/* --- Şeffaflık --- */}
      <Bolum zemin="derin">
        <BolumBasligi numara="04" etiket="ŞEFFAFLIK" baslik="Politikalar" />
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-3">
          {[
            { ad: 'Editoryal ilkeler', yol: '/editoryal-ilkeler/' },
            { ad: 'AI kullanım politikası', yol: '/ai-politikasi/' },
            { ad: 'Düzeltme politikası', yol: '/duzeltme-politikasi/' },
            { ad: 'Metodoloji', yol: '/metodoloji/' },
            { ad: 'Künye', yol: '/kunye/' },
            { ad: 'Gizlilik', yol: '/gizlilik/' },
          ].map((sayfa) => (
            <li key={sayfa.yol}>
              <Link
                href={sayfa.yol}
                className="group flex items-center justify-between gap-3 bg-zemin px-5 py-4 transition-colors hover:bg-yuzey/60"
              >
                <span className="text-[0.9375rem] text-metin-ikincil group-hover:text-metin">
                  {sayfa.ad}
                </span>
                <Ok className="size-4 shrink-0 text-metin-soluk opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            </li>
          ))}
        </ul>
      </Bolum>

      <KapanisCagrisi
        etiket="İLETİŞİM"
        baslik="Katkı vermek veya birlikte çalışmak"
        metin="Uzman katkısı, kurumsal proje veya editoryal iş birliği için iletişime geçebilirsiniz."
        eylemler={
          <>
            <Dugme href="/iletisim/">
              İletişim
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/topluluk/katki/" gorunum="ikincil">
              Katkıda bulun
            </Dugme>
          </>
        }
      />
    </>
  );
}
