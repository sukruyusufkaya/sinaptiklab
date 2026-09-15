import type { Metadata } from 'next';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { Ok, Onay } from '@/components/arayuz/Ikonlar';
import { KapanisCagrisi } from '@/components/icerik/IcerikDuzeni';
import { uzmanListesi } from '@/lib/icerik/yayin';

export const metadata: Metadata = {
  title: 'Katkıda Bulun',
  description:
    'Atlas girdisi yazma, teknik inceleme, podcast konukluğu ve açık kaynak katkısı. Katkı biçimleri ve editoryal süreç.',
  alternates: { canonical: '/topluluk/katki/' },
};

const BICIMLER = [
  {
    ad: 'Atlas girdisi yazmak',
    tarif:
      'Bir kavramı answer-first formatla, kaynaklarıyla ve karşılaştırmalarıyla yazmak. En kalıcı katkı biçimi.',
    beklenen: ['Alanda uygulama deneyimi', 'Birincil kaynak kullanımı', 'Türkçe yazım hâkimiyeti'],
  },
  {
    ad: 'Teknik inceleme',
    tarif:
      'Yayımlanmadan önce bir içeriğin teknik doğruluğunu denetlemek. İnceleyen adı sayfada görünür.',
    beklenen: ['İlgili alanda derinlik', 'Eleştirel okuma', 'Zamanında dönüş'],
  },
  {
    ad: 'Podcast konukluğu',
    tarif: 'Sinaptik Sessions bölümlerinde alanınızdaki pratiği anlatmak.',
    beklenen: ['Saha deneyimi', 'Somut örnekler'],
  },
  {
    ad: 'Açık kaynak katkısı',
    tarif: 'Lab araçlarına ve kod örneklerine katkı; hesaplayıcı önerileri.',
    beklenen: ['Çalışan kod', 'Kısa dokümantasyon'],
  },
  {
    ad: 'Veri ve araştırma',
    tarif: 'Benchmark tasarımı, veri seti hazırlığı veya saha araştırması desteği.',
    beklenen: ['Yöntem bilgisi', 'Sınırlılıkları yazma disiplini'],
  },
  {
    ad: 'Düzeltme bildirimi',
    tarif: 'Bir hatayı bildirmek de katkıdır. Doğrulanan düzeltmeler güncelleme geçmişine işlenir.',
    beklenen: ['Kaynak veya gerekçe'],
  },
];

const SUREC = [
  { ad: 'Başvuru', tarif: 'Hangi biçimde katkı vermek istediğinizi yazarsınız.' },
  { ad: 'Kapsam', tarif: 'Konu, açı ve teslim tarihi birlikte belirlenir.' },
  { ad: 'Taslak', tarif: 'İlk taslak editoryal kontrole girer.' },
  { ad: 'İnceleme', tarif: 'Kaynak doğrulaması ve gerekirse teknik inceleme yapılır.' },
  { ad: 'Yayın', tarif: 'İçerik adınızla ve profil bağlantınızla yayımlanır.' },
];

export default async function KatkiSayfasi() {
  const acikKoltuklar = (await uzmanListesi()).filter((uzman) => uzman.ad === 'Katkı bekleniyor');

  return (
    <>
      <SayfaBasligi
        kirintilar={[
          { ad: 'Topluluk', yol: '/topluluk/' },
          { ad: 'Katkıda Bulun', yol: '/topluluk/katki/' },
        ]}
        etiket="TOPLULUK"
        baslik="Katkıda bulun"
        ozet="Katkı, yorum yazmak değil. Bir kavramı kalıcı biçimde yazmak, bir içeriği teknik olarak incelemek veya bir aracı çalışır hale getirmek."
        olcumler={[
          { deger: `${BICIMLER.length}`, etiket: 'Katkı biçimi' },
          { deger: `${acikKoltuklar.length}`, etiket: 'Açık uzman koltuğu' },
          { deger: `${SUREC.length}`, etiket: 'Süreç adımı' },
        ]}
        eylemler={
          <Dugme href="/iletisim/">
            Başvuru gönder
            <Ok className="size-4" />
          </Dugme>
        }
        desen="nokta"
      />

      <Bolum>
        <BolumBasligi numara="01" etiket="BİÇİMLER" baslik="Nasıl katkı verebilirsin?" />
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {BICIMLER.map((bicim) => (
            <li
              key={bicim.ad}
              className="flex flex-col rounded-2xl border border-kenar bg-yuzey/40 p-6"
            >
              <p className="text-[1.0625rem] font-semibold tracking-tight text-metin">{bicim.ad}</p>
              <p className="mt-2.5 flex-1 text-[0.875rem] leading-relaxed text-metin-ikincil">
                {bicim.tarif}
              </p>
              <p className="etiket-mono mt-5 mb-2.5 text-metin-soluk">Beklenen</p>
              <ul className="space-y-1.5">
                {bicim.beklenen.map((madde) => (
                  <li key={madde} className="flex items-center gap-2 text-xs text-metin-ikincil">
                    <Onay className="size-3.5 shrink-0 text-basari" />
                    {madde}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Bolum>

      <Bolum zemin="derin">
        <BolumBasligi numara="02" etiket="SÜREÇ" baslik="Katkı süreci" />
        <ol className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-3 lg:grid-cols-5">
          {SUREC.map((adim, sira) => (
            <li key={adim.ad} className="bg-zemin p-5">
              <span className="etiket-mono grid size-7 place-items-center rounded-full border border-vurgu/35 bg-vurgu-zemin text-vurgu-parlak">
                {sira + 1}
              </span>
              <p className="mt-3.5 text-[0.9375rem] font-medium text-metin">{adim.ad}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-metin-soluk">{adim.tarif}</p>
            </li>
          ))}
        </ol>

        <div className="mt-6 rounded-xl border border-kenar bg-yuzey/40 p-5">
          <p className="etiket-mono mb-2 text-metin-soluk">Editoryal kural</p>
          <p className="text-[0.875rem] leading-relaxed text-metin-ikincil">
            Katkılar yazarın adıyla yayımlanır. Yapay zekâ ile üretilmiş taslaklar kabul edilir
            ancak insan tarafından doğrulanıp sahiplenilmesi gerekir; kaynaksız iddia içeren metin
            yayımlanmaz.
          </p>
        </div>
      </Bolum>

      {acikKoltuklar.length > 0 && (
        <Bolum>
          <BolumBasligi
            numara="03"
            etiket="AÇIK KOLTUKLAR"
            baslik="Şu alanlarda uzman arıyoruz"
            baglantiYolu="/uzmanlar/"
          />
          <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-4">
            {acikKoltuklar.map((uzman) => (
              <li key={uzman.slug} className="bg-zemin p-5">
                <p className="text-[0.9375rem] font-medium text-metin">{uzman.unvan}</p>
                <p className="etiket-mono mt-2 text-metin-soluk">{uzman.alan}</p>
              </li>
            ))}
          </ul>
        </Bolum>
      )}

      <KapanisCagrisi
        etiket="BAŞVURU"
        baslik="Hangi biçimde katkı vermek istersin?"
        metin="İletişim formundan 'Uzman katkısı' konusunu seçip kısaca deneyiminizi ve ilgilendiğiniz konuyu yazın."
        eylemler={
          <>
            <Dugme href="/iletisim/">
              Başvuru gönder
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/editoryal-ilkeler/" gorunum="ikincil">
              Editoryal ilkeler
            </Dugme>
          </>
        }
      />
    </>
  );
}
