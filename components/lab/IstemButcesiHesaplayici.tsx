'use client';

import { useMemo, useState } from 'react';
import {
  AnaSonuc,
  HesapDuzeni,
  OranCubugu,
  SayiAlani,
  SonucSatiri,
  guvenliSayi,
  paraBirimi,
  sayi,
} from './HesapAlanlari';

/**
 * Bağlam penceresi tek bir bütçedir: sistem istemi, örnekler, getirilen
 * parçalar, konuşma geçmişi ve cevap için ayrılan pay aynı havuzdan yer alır.
 * Araç havuzu bu beş paya böler; çünkü "pencere yetmiyor" cümlesi tek başına
 * bir hamle önermez: hangi payın büyüdüğü bilinmeden nereden kısılacağı belli
 * olmaz. Beş pay da kullanıcının kendi tahmini; araç hiçbir model değeri tutmaz.
 */

type BilesenAnahtari = 'sistem' | 'ornekler' | 'getirilen' | 'gecmis' | 'cikti';

/** Payın adı, çubuktaki rengi ve baskın çıktığında ilk denenecek hamle. */
const BILESENLER: Record<BilesenAnahtari, { ad: string; renk: string; hamle: string }> = {
  sistem: {
    ad: 'Sistem istemi ve araç şemaları',
    renk: 'bg-vurgu',
    hamle:
      'Sabit yük en büyük pay: araç tanımlarını her istekte göndermek yerine göreve göre yükle, yönergedeki tekrar eden maddeleri birleştir. Bu pay her istekte aynen tekrar eder.',
  },
  ornekler: {
    ad: 'Örnekler',
    renk: 'bg-vurgu-sonuk',
    hamle:
      'Örnek yükü baskın: önce örnek sayısını düşür, sonra her örneği kısalt. Biçim kuralı örnekle değil yönergeyle anlatılabiliyorsa örnek bütçesi boşa gidiyor.',
  },
  getirilen: {
    ad: 'Getirilen parçalar',
    renk: 'bg-ikincil',
    hamle:
      'Getirme payı baskın: bu pay parça sayısı ile parça uzunluğunun çarpımıdır, bu yüzden getirilen parça sayısını düşürmek payı en hızlı küçülten hamledir. Kaç parçanın yeterli olduğunu araç bilemez; bunu kendi getirme kayıtlarınla sınamalısın.',
  },
  gecmis: {
    ad: 'Konuşma geçmişi',
    renk: 'bg-sinyal',
    hamle:
      'Geçmiş baskın: eski turları özete indir veya kayan pencereyle kes. Kesme kuralı yoksa bu pay her turda tek yönde büyür ve bir noktada taşmayı kendi başına yaratır.',
  },
  cikti: {
    ad: 'Çıktı payı',
    renk: 'bg-metin-soluk',
    hamle:
      'Cevaba ayrılan rezerv baskın: beklenen cevap uzunluğunu kendi kayıtlarından ölç ve payı ona indir. Kullanılmayan rezerv, istemin geri kalanını boşuna sıkıştırır.',
  },
};

/** Çubuk ve sonuç listesinde payların görünme sırası. */
const BILESEN_SIRASI: BilesenAnahtari[] = ['sistem', 'ornekler', 'getirilen', 'gecmis', 'cikti'];

type Durum = 'rahat' | 'dikkat' | 'riskli' | 'tasma';

const DURUMLAR: Record<Durum, { ad: string; renk: string; cerceve: string; tarif: string }> = {
  rahat: {
    ad: 'Rahat',
    renk: 'text-basari',
    cerceve: 'border-basari/30 bg-basari/8',
    tarif:
      'Talep pencerenin rahat tarafında. Kısma gerekmiyor; pay dağılımı yine de hangi bileşenin büyümeye açık olduğunu gösterir.',
  },
  dikkat: {
    ad: 'Dikkat',
    renk: 'text-uyari',
    cerceve: 'border-uyari/30 bg-uyari/8',
    tarif:
      'Pencerenin yarısından fazlası dolu. Konuşma uzadıkça geçmiş payı büyüyeceği için bugün yeten bütçe birkaç tur sonra yetmeyebilir; kesme kuralını şimdi tanımla.',
  },
  riskli: {
    ad: 'Riskli',
    renk: 'text-uyari',
    cerceve: 'border-uyari/30 bg-uyari/8',
    tarif:
      'Talep pencereye hâlâ sığıyor ama ayırdığın çıktı payının ötesinde çok az boşluk kaldı. Cevap beklediğinden uzun olursa ya da geçmiş bir tur daha büyürse sınır bu aralıkta aşılır; payları şimdi kıs.',
  },
  tasma: {
    ad: 'Taşma',
    renk: 'text-tehlike',
    cerceve: 'border-tehlike/30 bg-tehlike/8',
    tarif:
      'Talep pencereyi aşıyor. Bu noktada isteğin hata mı döneceği yoksa bağlamın mı kırpılacağı sağlayıcının ve kullandığın çerçevenin davranışına bağlıdır; araç bunu öngörmez, yalnızca aşımın büyüklüğünü verir.',
  },
};

export function IstemButcesiHesaplayici() {
  const [pencere, setPencere] = useState(128000);
  const [sistemIstemi, setSistemIstemi] = useState(900);
  const [ornekSayisi, setOrnekSayisi] = useState(4);
  const [ornekUzunlugu, setOrnekUzunlugu] = useState(180);
  const [getirilenBaglam, setGetirilenBaglam] = useState(3600);
  const [konusmaGecmisi, setKonusmaGecmisi] = useState(2400);
  const [ciktiPayi, setCiktiPayi] = useState(900);

  const hesap = useMemo(() => {
    // Pencere bölen olarak kullanılıyor; boş ve geçersiz girdide 1'e sabitlenir
    // ki oran hesabı NaN veya Infinity üretmesin.
    const toplamPencere = Math.max(1, guvenliSayi(pencere, 128000));

    const paylar: Record<BilesenAnahtari, number> = {
      sistem: Math.max(0, guvenliSayi(sistemIstemi)),
      // Örnek yükü tek bir alan değil, adet × uzunluk çarpımı: few-shot
      // maliyetinin neden hızlı büyüdüğü ancak çarpım ayrık tutulunca görünür.
      ornekler:
        Math.max(0, Math.floor(guvenliSayi(ornekSayisi))) * Math.max(0, guvenliSayi(ornekUzunlugu)),
      getirilen: Math.max(0, guvenliSayi(getirilenBaglam)),
      gecmis: Math.max(0, guvenliSayi(konusmaGecmisi)),
      cikti: Math.max(0, guvenliSayi(ciktiPayi)),
    };

    // İstem: modele gönderilen kısım. Çıktı payı henüz yazılmadı ama pencereden
    // yer tuttuğu için talebe eklenir — pencere istem ile cevabı ayırmaz.
    const istemToplam = paylar.sistem + paylar.ornekler + paylar.getirilen + paylar.gecmis;
    const talep = istemToplam + paylar.cikti;
    const doluluk = (talep / toplamPencere) * 100;
    const kalan = toplamPencere - talep;
    const tasma = Math.max(0, -kalan);

    // Sistem istemi ile örnekler istekler arasında değişmediği sürece istemin
    // kararlı ön ekidir; getirme ve geçmiş her istekte yeniden yazılır. Ön ekin
    // payı büyükse bütçe tartışması sabit yükün tartışmasıdır.
    const kararliOnEk = paylar.sistem + paylar.ornekler;
    const kararliPay = talep > 0 ? (kararliOnEk / talep) * 100 : 0;
    const ornekPay = istemToplam > 0 ? (paylar.ornekler / istemToplam) * 100 : 0;

    // Taşmanın faili en büyük paydır; ilk hamle her zaman oradan çıkar.
    const baskinAnahtar = BILESEN_SIRASI.reduce<BilesenAnahtari>(
      (enBuyuk, anahtar) => (paylar[anahtar] > paylar[enBuyuk] ? anahtar : enBuyuk),
      'sistem',
    );
    const baskinDeger = paylar[baskinAnahtar];
    const baskinPay = talep > 0 ? (baskinDeger / talep) * 100 : 0;
    // Taşmayı yalnızca baskın paydan kapatmak istenirse o payın yüzde kaçı
    // gitmeli? %100'ü aşıyorsa tek paydan kapatmak matematiksel olarak mümkün
    // değildir; bu durumda birden fazla payı kısmak gerekir.
    const baskinKisma = baskinDeger > 0 ? (tasma / baskinDeger) * 100 : 0;
    // Aşım yalnız baskın paydan kapanabiliyor mu? Oran %100'ü aşarsa hayır.
    // Karşılaştırma bu yönde yazıldı ki çok büyük girdilerde oranın sonlu
    // çıkmadığı durumda da "yetmez" tarafına düşsün, sessizce boş kalmasın.
    const tekPayYetmez = tasma > 0 && !(baskinKisma <= 100);

    const durum: Durum =
      doluluk > 100 ? 'tasma' : doluluk > 85 ? 'riskli' : doluluk > 60 ? 'dikkat' : 'rahat';

    return {
      toplamPencere,
      paylar,
      istemToplam,
      talep,
      doluluk,
      kalan,
      tasma,
      kararliOnEk,
      kararliPay,
      ornekPay,
      baskinAnahtar,
      baskinPay,
      baskinKisma,
      tekPayYetmez,
      durum,
    };
  }, [
    pencere,
    sistemIstemi,
    ornekSayisi,
    ornekUzunlugu,
    getirilenBaglam,
    konusmaGecmisi,
    ciktiPayi,
  ]);

  const durum = DURUMLAR[hesap.durum];
  const baskin = BILESENLER[hesap.baskinAnahtar];

  return (
    <HesapDuzeni
      girdiler={
        <>
          <SayiAlani
            etiket="Bağlam penceresi"
            deger={pencere}
            degisti={setPencere}
            birim="token"
            enAz={1}
            adim={1000}
            ipucu="Kullandığın modelin belgelenmiş pencere değerini kendin gir; araç hiçbir model değeri tutmaz."
          />
          <SayiAlani
            etiket="Sistem istemi ve araç şemaları"
            deger={sistemIstemi}
            degisti={setSistemIstemi}
            birim="token"
            adim={50}
            ipucu="Yönerge, biçim kuralları ve araç tanımlarının toplamı. Bu pay her istekte aynen tekrar gider."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SayiAlani
              etiket="Örnek sayısı"
              deger={ornekSayisi}
              degisti={setOrnekSayisi}
              birim="adet"
            />
            <SayiAlani
              etiket="Örnek başına uzunluk"
              deger={ornekUzunlugu}
              degisti={setOrnekUzunlugu}
              birim="token"
              adim={20}
            />
          </div>
          <SayiAlani
            etiket="Getirilen parçalar"
            deger={getirilenBaglam}
            degisti={setGetirilenBaglam}
            birim="token"
            adim={200}
            ipucu="Getirme katmanının isteme eklediği toplam: parça sayısı çarpı parça uzunluğu."
          />
          <SayiAlani
            etiket="Konuşma geçmişi"
            deger={konusmaGecmisi}
            degisti={setKonusmaGecmisi}
            birim="token"
            adim={100}
            ipucu="Taşınan önceki turların toplamı. Kesme kuralı yoksa bu alan her turda büyür."
          />
          <SayiAlani
            etiket="Ayrılan çıktı payı"
            deger={ciktiPayi}
            degisti={setCiktiPayi}
            birim="token"
            adim={100}
            ipucu="Cevap için tutulan rezerv. Başlangıç değerleri örnek bir düzendir, ölçüm değil; kendi kayıtlarınla değiştir."
          />
        </>
      }
      sonuclar={
        <>
          <AnaSonuc
            deger={`%${paraBirimi(hesap.doluluk, 1)}`}
            etiket="Pencere doluluğu"
            ton={hesap.durum === 'rahat' ? 'vurgu' : 'uyari'}
          />

          <div className="rounded-xl border border-kenar bg-yuzey/40 p-5">
            <p className="etiket-mono mb-3.5 text-metin-soluk">Bütçe dağılımı</p>
            <OranCubugu
              toplam={hesap.toplamPencere}
              bolumler={BILESEN_SIRASI.map((anahtar) => ({
                ad: BILESENLER[anahtar].ad,
                deger: hesap.paylar[anahtar],
                renk: BILESENLER[anahtar].renk,
              }))}
            />
          </div>

          <div className="space-y-2.5 rounded-xl border border-kenar bg-yuzey/40 p-5">
            <SonucSatiri
              etiket="İstem toplamı"
              deger={`${sayi(hesap.istemToplam)} token`}
              vurgulu
            />
            <SonucSatiri etiket="Çıktı payıyla toplam talep" deger={`${sayi(hesap.talep)} token`} />
            <SonucSatiri
              etiket={hesap.kalan >= 0 ? 'Kalan bütçe' : 'Pencere aşımı'}
              deger={
                hesap.kalan >= 0 ? `${sayi(hesap.kalan)} token` : `${sayi(hesap.tasma)} token fazla`
              }
            />
            <SonucSatiri
              etiket="Kararlı ön ekin payı"
              deger={`%${paraBirimi(hesap.kararliPay, 1)}`}
            />
            <SonucSatiri
              etiket="Örneklerin istem içindeki payı"
              deger={`%${paraBirimi(hesap.ornekPay, 1)}`}
            />
          </div>

          <div className={`rounded-xl border p-5 ${durum.cerceve}`}>
            <p className={`etiket-mono mb-2 ${durum.renk}`}>{durum.ad}</p>
            <p className="text-sm leading-relaxed text-metin-ikincil">{durum.tarif}</p>

            <div className="mt-4 space-y-2.5">
              <SonucSatiri etiket="Bütçeyi en çok kullanan" deger={baskin.ad} vurgulu />
              <SonucSatiri
                etiket="Bu payın talepteki ağırlığı"
                deger={`%${paraBirimi(hesap.baskinPay, 1)}`}
              />
              {hesap.tasma > 0 && (
                <SonucSatiri
                  etiket="Aşımı yalnız bu paydan kapatmak"
                  deger={
                    hesap.tekPayYetmez
                      ? 'tek başına yetmez'
                      : `%${paraBirimi(hesap.baskinKisma, 1)} kısma`
                  }
                />
              )}
            </div>

            {hesap.durum !== 'rahat' && (
              <p className="mt-4 text-xs leading-relaxed text-metin-ikincil">{baskin.hamle}</p>
            )}
            {hesap.tekPayYetmez && (
              <p className="mt-2 text-xs leading-relaxed text-uyari">
                Aşım, en büyük pay tamamen boşaltılsa bile kapanmıyor. En az iki payı birlikte
                kısmak ya da pencereyi büyütmek gerekir.
              </p>
            )}
          </div>
        </>
      }
      not={
        <>
          Girilen bütün token değerleri senin kendi tahminindir; araç hiçbir model penceresi, fiyat
          ya da ölçüm değeri tutmaz ve başlangıçta görünen sayılar yalnızca çalışır bir örnek
          düzendir. Aynı metin farklı tokenlaştırıcılarda farklı sayıda tokena bölünür, bu yüzden
          sonucu tam sayı değil eşiğe olan uzaklık olarak oku. Hesap yalnızca yer kaplamayı ölçer:
          cevap kalitesini, gecikmeyi, maliyeti ve uzun pencerede ortadaki bilginin gözden kaçma
          eğilimini ölçmez. Çıktı payı da bir rezervdir; modelin o payı kullanacağı anlamına gelmez.
          Örnek yükü adet ile uzunluğun çarpımı alınır; bu, örneklerin birbirine yakın uzunlukta
          olduğunu varsayar. Rahat, Dikkat, Riskli ve Taşma eşikleri (%60, %85 ve %100) aracın kendi
          seçimidir, ölçülmüş bir kalite sınırı değildir.
        </>
      }
    />
  );
}
