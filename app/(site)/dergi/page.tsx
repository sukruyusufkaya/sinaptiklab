import type { Metadata } from 'next';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { CokYakinda, YakindaBolumListesi } from '@/components/arayuz/CokYakinda';
import { Ok, Zarf } from '@/components/arayuz/Ikonlar';
import { DERGI_BOLUMLERI, dergiSayiListesi } from '@/lib/icerik/yayin';
import { tarihUzun } from '@/lib/bicim';

export const metadata: Metadata = {
  title: 'Sinaptik Magazine',
  description:
    'Aylık dijital dergi hazırlanıyor: kapak dosyaları, röportajlar, araştırma yazıları, uygulama notları ve köşe yazıları. İlk sayı çıktığında haber verelim.',
  alternates: { canonical: '/dergi/' },
};

/**
 * Dergi vitrini.
 *
 * SAYFA ŞU AN BOŞ VE BU BİLİNÇLİ. Dergi sayıları arşive alındı; okuma katmanı
 * yalnızca `durum: 'yayinda'` olanı gördüğü için liste boş dönüyor. Sayfa bu
 * durumda `null` dönmek yerine YAPIYI gösteriyor: derginin hangi bölümlerden
 * oluşacağı, sıklığı ve ne zaman haber verileceği.
 *
 * Boş sayfa ile hazırlanan sayfa aynı şey değildir. Birincisi okura "burada
 * bir şey yok" der ve geri döndürür; ikincisi "burada şu olacak" der ve bir
 * bekleme yolu verir. Menüdeki "Yakında" rozetleri de bu sözü önceden söyler.
 *
 * SAYI YAYINA GİRDİĞİNDE kod değişmez: `dergiSayiListesi()` dolu döndüğü anda
 * sayfa normal vitrinine geçer. Hazırlık durumu bir veri durumudur, bir kod
 * dalı değil.
 */
export default async function DergiSayfasi() {
  const DERGI_SAYILARI = await dergiSayiListesi();

  /*
   * GELECEK TARİHLİ SAYI "SON SAYI" DEĞİLDİR.
   *
   * Karşılaştırma derleme anında yapılır; aylık bir yayında bu yeterlidir ve
   * her dağıtımda tazelenir. Tarih burada içeriği etiketlemek için değil,
   * yayımlanmış ile yaklaşan sayıyı AYIRMAK için okunuyor.
   */
  const bugun = new Date().toISOString().slice(0, 10);
  const yayimlananlar = DERGI_SAYILARI.filter((s) => s.tarih <= bugun);
  const [son, ...oncekiler] = yayimlananlar;

  return (
    <>
      <SayfaBasligi
        kirintilar={[{ ad: 'Dergi', yol: '/dergi/' }]}
        etiket="DISCOVER"
        baslik="Sinaptik Magazine"
        ozet="Aylık dijital dergi. Her sayı bir kapak dosyası etrafında kurulur; röportajlar, araştırma yazıları, uygulama notları ve köşe yazılarıyla tamamlanır."
        olcumler={[
          { deger: `${DERGI_BOLUMLERI.length}`, etiket: 'Bölüm' },
          { deger: 'Aylık', etiket: 'Sıklık' },
          { deger: son ? `${yayimlananlar.length}` : 'Hazırlanıyor', etiket: 'Yayımlanan sayı' },
        ]}
        eylemler={
          <>
            <Dugme href="/bulten/">
              <Zarf className="size-4" />
              Çıkınca haber ver
            </Dugme>
            <Dugme href="/gundem/" gorunum="ikincil">
              Güncel gündem
              <Ok className="size-4" />
            </Dugme>
          </>
        }
        desen="izgara"
      />

      {son ? (
        <Bolum>
          <BolumBasligi
            numara="01"
            etiket="SON SAYI"
            baslik={son.kapakKonusu}
            aciklama={`${son.sayi} · ${tarihUzun(son.tarih)} · ${son.yazilar.length} yazı`}
            baglantiYolu={`/dergi/${son.slug}/`}
            baglantiMetni="Sayıyı oku"
          />
          <p className="olcu text-[0.9375rem] leading-relaxed text-metin-ikincil">{son.ozet}</p>
          {oncekiler.length > 0 && (
            <p className="etiket-mono mt-6 text-metin-soluk">
              Arşivde {oncekiler.length} sayı daha var.
            </p>
          )}
        </Bolum>
      ) : (
        <Bolum>
          <CokYakinda
            baslik="İlk sayı hazırlanıyor"
            metin="Sinaptik Magazine, gündemin hızına kapılmadan okunacak aylık bir yayın olarak kuruluyor. Haber akışının anlatamadığı şeyi anlatmayı hedefliyor: bir gelişmenin neden şimdi olduğunu, kimin ne kazandığını ve bir yıl sonra neyin değişmiş olacağını."
            kapsam={[
              'Her sayıda tek bir kapak dosyası ve onu derinleştiren yazı dizisi',
              'Araştırmacı, kurucu ve uygulayıcılarla birinci elden röportajlar',
              'Ölçüm ve bulgu temelli araştırma yazıları',
              'Üretimden çıkmış uygulama notları ve karar kayıtları',
              'Düzenli yazarların köşe yazıları',
              'Her yazının kalıcı ve tarihsiz kendi adresi',
            ]}
            notlar={[
              'Yayın sıklığı aylık planlanıyor; ilk sayının tarihi kesinleştiğinde bültenle duyurulacak.',
              'Dergi yazıları, gündem haberlerinden ayrı bir editoryal süreçten geçer: her yazı kaynaklarıyla ve yazar künyesiyle yayımlanır.',
            ]}
          />
        </Bolum>
      )}

      <Bolum zemin="derin">
        <BolumBasligi
          numara={son ? '02' : '01'}
          etiket="BÖLÜMLER"
          baslik="Derginin omurgası"
          aciklama="Her sayı bu bölümlerden oluşur. Bölüm arşivleri sayılar yayımlandıkça dolar."
          baglantiYolu="/dergi/arsiv/"
          baglantiMetni="Tüm sayılar"
        />
        <YakindaBolumListesi bolumler={DERGI_BOLUMLERI} temelYol="/dergi/" />
      </Bolum>
    </>
  );
}
