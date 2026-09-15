'use client';

import { useMemo, useState } from 'react';
import {
  AnaSonuc,
  HesapDuzeni,
  KaydirmaAlani,
  OranCubugu,
  SayiAlani,
  SonucSatiri,
  guvenliSayi,
  paraBirimi,
  sayi,
} from './HesapAlanlari';

/**
 * Veri seti bölme hesaplayıcı.
 *
 * Bütün sayılar kullanıcının girdiği hacim ve oranlardan türetilir; gömülü
 * veri seti, model veya ölçüm değeri yoktur. Tanım gereği sabit olanlar:
 * yüzdeyi orana çeviren 100 ve %95 iki yanlı normal aralığın z değeri olan
 * 1,96. Bunların dışında kalan sabitler aracın kendi karar sınırlarıdır;
 * ölçülmüş eşikler olmadıkları için hem ayrı ayrı adlandırıldılar hem de
 * `not` bölümünde varsayım olarak yazılı.
 */

const Z95 = 1.96;

/*
 * Kaydırıcıların üst sınırı. Hesaptaki kırpma ile aynı sabitten okunmalı:
 * ikisi ayrı yazıldığında kaydırıcının ulaşamadığı bir kırpma sınırı kalıyor
 * ve test + doğrulama payı %100'ü aşabildiği için üç kümenin toplamı veri
 * setini aşıyordu.
 */
const PAY_ENCOK = 40;

/*
 * Karar sınırları — aracın kabulü, literatürden alınmış değer değil.
 * SIFIR_OLASILIK_ESIGI: sınıfın test kümesinde hiç görünmeme olasılığı bunu
 * aşarsa rastgele bölme kabul edilmez. BAGIL_SALINIM_ESIGI: sapma/beklenen
 * oranı bunu aşarsa aynı model iki bölmede iki ayrı skor verir sayılır.
 * BELIRSIZLIK_ESIGI: doğruluğun %95 yarı genişliği kaç puanı aşınca test
 * kümesi "modelleri ayırt edemez" sayılır.
 */
const SIFIR_OLASILIK_ESIGI = 0.01;
const BAGIL_SALINIM_ESIGI = 0.2;
const BELIRSIZLIK_ESIGI = 3;

/* Belirsizlik çubuğunun dolduğu puan; yalnızca görsel ölçek. */
const BELIRSIZLIK_TAM_OLCEK = 10;

export function VeriSetiBolmeHesaplayici() {
  const [toplamOrnek, setToplamOrnek] = useState(4000);
  const [sinifSayisi, setSinifSayisi] = useState(8);
  const [enKucukPay, setEnKucukPay] = useState(2);
  const [dogrulamaPay, setDogrulamaPay] = useState(15);
  const [testPay, setTestPay] = useState(15);
  const [esikOrnek, setEsikOrnek] = useState(30);
  const [beklenenDogruluk, setBeklenenDogruluk] = useState(85);

  const hesap = useMemo(() => {
    const toplam = Math.max(0, Math.floor(guvenliSayi(toplamOrnek)));
    const sinif = Math.max(2, Math.floor(guvenliSayi(sinifSayisi, 2)));

    /*
     * Bir sınıfın payı, örnekler sınıflara eşit dağıldığında en çok 100/sınıf
     * olabilir. Kullanıcı bunun üstünü girdiğinde "en küçük sınıf" tanımı
     * kendisiyle çelişir; o yüzden pay tepeden kırpılır ve kırpıldığı sonuçta
     * görünür kalır — sessizce düzeltilen girdi, okurun kendi girmediği bir
     * sayıya bakmasına yol açar.
     */
    const esitPay = 100 / sinif;
    const kucukPayHam = Math.max(0, guvenliSayi(enKucukPay));
    const kucukPay = Math.min(kucukPayHam, esitPay);
    const payKirpildi = kucukPayHam > esitPay;

    const testOran = Math.min(PAY_ENCOK, Math.max(1, guvenliSayi(testPay, 15))) / 100;
    /*
     * Doğrulama payı, testten artan payı aşamaz: aşsaydı eğitim payı eksiye
     * düşer ve üç kümenin toplamı veri setini geçerdi. Kaydırıcı sınırları
     * bugün buna izin vermiyor; sınır değişirse hesap yine tutarlı kalsın diye
     * bağ burada da kuruluyor.
     */
    const dogrulamaOran = Math.min(
      Math.min(PAY_ENCOK, Math.max(0, guvenliSayi(dogrulamaPay, 15))) / 100,
      1 - testOran,
    );
    // Eğitim payı girdi değil artıktır: test ve doğrulamadan kalan ne varsa eğitime gider.
    const egitimOran = 1 - testOran - dogrulamaOran;

    const testSayisi = Math.round(toplam * testOran);
    const dogrulamaSayisi = Math.round(toplam * dogrulamaOran);
    /*
     * Yuvarlama artığı eğitime yazılır. Paylar toplamı 1'i aşamadığı için
     * çıkarma negatife düşmez; Math.max yalnızca son savunma olarak duruyor.
     */
    const egitimSayisi = Math.max(0, toplam - testSayisi - dogrulamaSayisi);

    const kucukToplam = Math.floor(toplam * (kucukPay / 100));

    /*
     * Katmanlı bölme oranı sınıf İÇİNDE de korur: her sınıf kendi içinde
     * bölünür. Bir örnek ikiye ayrılamayacağı için aşağı yuvarlanır — bu,
     * hesabın en küçük sınıf için verdiği garanti alt sınırdır.
     */
    const katmanliTest = Math.floor(kucukToplam * testOran);
    const katmanliDogrulama = Math.floor(kucukToplam * dogrulamaOran);

    /*
     * Rastgele bölmede sınıf üyeliği şansa kalır. Her örneğin test kümesine
     * düşmesi p = test payı olasılığıyla bağımsız kabul edilirse, en küçük
     * sınıftan test kümesine düşen örnek sayısı Binom(n, p) dağılır: beklenen
     * değer katmanlı bölmeyle aynıdır, sapma ise sıfır değildir. Asıl dağılım
     * hipergeometriktir (küme boyutu sabit); binom, sapmayı bir tık yüksek
     * veren güvenli yaklaşımdır.
     */
    const beklenen = kucukToplam * testOran;
    const sapma = Math.sqrt(kucukToplam * testOran * (1 - testOran));
    const altBant = Math.max(0, Math.floor(beklenen - Z95 * sapma));
    const ustBant = Math.ceil(beklenen + Z95 * sapma);
    const bagilSalinim = beklenen > 0 ? sapma / beklenen : 0;
    // Test kümesine sınıftan hiç örnek düşmeme olasılığı: (1 - p) üzeri n.
    const sifirOlasilik = kucukToplam > 0 ? Math.pow(1 - testOran, kucukToplam) : 1;

    /*
     * Katmanlı bölme, rastgele bölmenin salınımı ölçümü taşıyamayacak kadar
     * büyüdüğünde zorunlu hâle gelir. İki tetikleyici: sınıfın test kümesinde
     * hiç görünmeme olasılığının yüzde biri ya da bağıl sapmanın beşte biri
     * geçmesi. İkisi de aracın koyduğu sınır.
     */
    const katmanliZorunlu =
      kucukToplam > 0 &&
      (sifirOlasilik > SIFIR_OLASILIK_ESIGI || bagilSalinim > BAGIL_SALINIM_ESIGI);

    // Test kümesindeki tek bir örneğin genel doğruluk yüzdesi üzerindeki ağırlığı.
    const ornekAgirligi = testSayisi > 0 ? 100 / testSayisi : 0;
    /*
     * Aynı ağırlık sınıf düzeyinde çok daha büyüktür: en küçük sınıfın kendi
     * doğruluğunu tek bir hata 100/katmanliTest puan oynatır. İki sayı ayrı
     * büyüklüktür, ikisine de "doğruluk" denip karıştırılmamalı.
     */
    const sinifOrnekAgirligi = katmanliTest > 0 ? 100 / katmanliTest : 0;

    /*
     * Ölçümün belirsizlik payı: oran için Wald aralığının yarı genişliği,
     * z × karekök(p(1-p)/n). p kullanıcının beklediği doğruluk; aralık p = 0,5
     * civarında en geniştir, uçlara doğru daralır.
     */
    const dogrulukOran = Math.min(0.999, Math.max(0.001, guvenliSayi(beklenenDogruluk, 85) / 100));
    const dogrulukYuzde = dogrulukOran * 100;
    const belirsizlik =
      testSayisi > 0 ? Z95 * Math.sqrt((dogrulukOran * (1 - dogrulukOran)) / testSayisi) * 100 : 0;
    /*
     * Wald aralığı küçük test kümesinde [0, 1] dışına taşar; %105 doğruluk
     * diye bir şey olmadığı için gösterilen bant iki uçtan kırpılır. Kırpma
     * gerekiyorsa aralığın kendisi zaten güvenilmezdir — `not` bunu yazıyor.
     */
    const dogrulukAltBant = Math.max(0, dogrulukYuzde - belirsizlik);
    const dogrulukUstBant = Math.min(100, dogrulukYuzde + belirsizlik);

    const esik = Math.max(1, Math.floor(guvenliSayi(esikOrnek, 30)));
    const esikKarsilaniyor = katmanliTest >= esik;

    // Eşiği aynı veri hacmiyle karşılamak için gereken en küçük test payı.
    const gerekenTestPay = kucukToplam > 0 ? (esik / kucukToplam) * 100 : 0;
    /*
     * Eşiği mevcut oranlarla karşılamak için gereken en küçük veri seti. Bu
     * sayı, sınıf payının KORUNDUĞU varsayımına dayanır: büyüme bütün
     * sınıflara aynı oranda dağılır. Artışın tamamı en küçük sınıftan gelirse
     * gereken hacim çok daha küçüktür, o yüzden ikinci sayı ayrı hesaplanıyor.
     */
    const gerekenToplam =
      testOran > 0 && kucukPay > 0 ? Math.ceil(esik / (testOran * (kucukPay / 100))) : 0;
    const gerekenKucuk = Math.ceil(esik / testOran);
    const hedefliEkleme = Math.max(0, gerekenKucuk - kucukToplam);

    /*
     * Tek bölme yetmediğinde kalan seçenek k-kat çapraz doğrulamadır: test
     * kümesi ayrıldıktan sonra kalan havuz k kata bölünür ve her kat sırayla
     * doğrulama olur. Her katta en küçük sınıftan eşik kadar örnek kalması
     * gerektiği için k, havuz/eşik ile sınırlıdır. 2'nin altına düşerse veri
     * ne tek bölmeye ne çapraz doğrulamaya yeter.
     */
    const kucukHavuz = Math.max(0, kucukToplam - katmanliTest);
    const enCokKat = Math.floor(kucukHavuz / esik);

    return {
      sinif,
      esitPay,
      kucukPay,
      payKirpildi,
      egitimOran,
      dogrulamaOran,
      testOran,
      egitimSayisi,
      dogrulamaSayisi,
      testSayisi,
      toplam,
      kucukToplam,
      katmanliTest,
      katmanliDogrulama,
      sinifBasinaOrtalama: testSayisi / sinif,
      beklenen,
      altBant,
      ustBant,
      bagilSalinim,
      sifirOlasilik,
      katmanliZorunlu,
      ornekAgirligi,
      sinifOrnekAgirligi,
      dogrulukYuzde,
      belirsizlik,
      dogrulukAltBant,
      dogrulukUstBant,
      esik,
      esikKarsilaniyor,
      gerekenTestPay,
      gerekenToplam,
      hedefliEkleme,
      enCokKat,
    };
  }, [toplamOrnek, sinifSayisi, enKucukPay, dogrulamaPay, testPay, esikOrnek, beklenenDogruluk]);

  return (
    <HesapDuzeni
      girdiler={
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <SayiAlani
              etiket="Toplam örnek sayısı"
              deger={toplamOrnek}
              degisti={setToplamOrnek}
              birim="örnek"
              enAz={0}
              adim={500}
            />
            <SayiAlani
              etiket="Sınıf sayısı"
              deger={sinifSayisi}
              degisti={setSinifSayisi}
              birim="sınıf"
              enAz={2}
              adim={1}
            />
          </div>
          <SayiAlani
            etiket="En küçük sınıfın payı"
            deger={enKucukPay}
            degisti={setEnKucukPay}
            birim="%"
            enAz={0}
            enCok={hesap.esitPay}
            adim={0.5}
            ipucu={`Etiketli veride en seyrek sınıfın oranı. Örnekler ${sayi(hesap.sinif)} sınıfa dağıldığında bir sınıfın payı en çok %${paraBirimi(hesap.esitPay, 1)} olabilir; üstü hesapta kırpılır.`}
          />
          <KaydirmaAlani
            etiket="Doğrulama payı"
            deger={dogrulamaPay}
            degisti={setDogrulamaPay}
            enAz={0}
            enCok={PAY_ENCOK}
            adim={1}
            bicimle={(deger) => `%${deger}`}
          />
          <KaydirmaAlani
            etiket="Test payı"
            deger={testPay}
            degisti={setTestPay}
            enAz={1}
            enCok={PAY_ENCOK}
            adim={1}
            bicimle={(deger) => `%${deger}`}
          />
          <SayiAlani
            etiket="Sınıf başına en az test örneği"
            deger={esikOrnek}
            degisti={setEsikOrnek}
            birim="örnek"
            enAz={1}
            adim={5}
            ipucu="Bir sınıf için ölçümü anlamlı saydığın alt sınır. 30 yaygın bir başlangıç kabulüdür, ölçülmüş bir eşik değil — kendi hata maliyetine göre değiştir."
          />
          <KaydirmaAlani
            etiket="Beklenen doğruluk"
            deger={beklenenDogruluk}
            degisti={setBeklenenDogruluk}
            enAz={50}
            enCok={99}
            adim={1}
            bicimle={(deger) => `%${deger}`}
          />
        </>
      }
      sonuclar={
        <>
          <AnaSonuc
            deger={sayi(hesap.katmanliTest)}
            birim="örnek"
            etiket="En küçük sınıftan test kümesine düşen"
            ton={hesap.esikKarsilaniyor ? 'vurgu' : 'uyari'}
          />

          <div className="rounded-xl border border-kenar bg-yuzey/40 p-5">
            <p className="etiket-mono mb-3.5 text-metin-soluk">Küme dağılımı</p>
            <OranCubugu
              toplam={hesap.toplam}
              bolumler={[
                { ad: 'Eğitim', deger: hesap.egitimSayisi, renk: 'bg-vurgu' },
                { ad: 'Doğrulama', deger: hesap.dogrulamaSayisi, renk: 'bg-ikincil' },
                { ad: 'Test', deger: hesap.testSayisi, renk: 'bg-sinyal' },
              ]}
            />
            <p className="mt-3 text-xs leading-relaxed text-metin-soluk">
              Eğitim payı %{paraBirimi(hesap.egitimOran * 100, 0)} — girdi değil, test ve
              doğrulamadan kalan artık.
            </p>
          </div>

          <div className="space-y-2.5 rounded-xl border border-kenar bg-yuzey/40 p-5">
            <SonucSatiri
              etiket="En küçük sınıfın toplam örneği"
              deger={`${sayi(hesap.kucukToplam)} örnek`}
              vurgulu
            />
            <SonucSatiri
              etiket="Katmanlı bölmede doğrulamaya düşen"
              deger={`${sayi(hesap.katmanliDogrulama)} örnek`}
            />
            <SonucSatiri
              etiket="Test kümesinde sınıf başına ortalama"
              deger={`${paraBirimi(hesap.sinifBasinaOrtalama, 0)} örnek`}
            />
            <SonucSatiri
              etiket="Eşik"
              deger={`${sayi(hesap.esik)} örnek — ${hesap.esikKarsilaniyor ? 'karşılanıyor' : 'karşılanmıyor'}`}
            />
            {hesap.payKirpildi && (
              <p className="pt-1 text-[0.6875rem] leading-relaxed text-uyari">
                Girilen sınıf payı %{paraBirimi(hesap.esitPay, 1)} üst sınırına kırpıldı:{' '}
                {sayi(hesap.sinif)} sınıf varken en seyrek sınıfın payı bundan büyük olamaz.
              </p>
            )}
          </div>

          {!hesap.esikKarsilaniyor && (
            <div className="rounded-xl border border-uyari/30 bg-uyari/8 p-5">
              <p className="etiket-mono mb-3 text-uyari">Eşik karşılanmıyor</p>
              {hesap.kucukToplam === 0 ? (
                <p className="text-xs leading-relaxed text-metin-ikincil">
                  En küçük sınıfa hiç örnek düşmüyor: toplam örnek sayısı ya da sınıf payı sıfır. Bu
                  girdilerle sınıf düzeyinde hesaplanacak bir şey yok; iki alanı da sıfırın üstüne
                  çıkarmadan çıkış yolları sayısallaşmaz.
                </p>
              ) : (
                <>
                  <p className="text-xs leading-relaxed text-metin-ikincil">
                    {hesap.katmanliTest > 0
                      ? `En küçük sınıf test kümesinde ${sayi(hesap.katmanliTest)} örnekle temsil ediliyor; bu sayıda örnekte tek bir hata o sınıfın doğruluğunu %${paraBirimi(hesap.sinifOrnekAgirligi, 1)} oynatır.`
                      : 'En küçük sınıftan test kümesine hiç örnek düşmüyor: bu sınıf için ölçüm yok ve genel doğruluk sınıfı hiç görmeden de yüksek çıkabilir.'}{' '}
                    Sırayla şu üç seçenek var:
                  </p>
                  <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-metin-ikincil">
                    <li>
                      Test payını %{paraBirimi(hesap.gerekenTestPay, 1)} seviyesine çıkarmak —
                      {hesap.gerekenTestPay <= PAY_ENCOK
                        ? ' eğitim kümesi daralır, küçük veride bu bedel genelde ağırdır.'
                        : ` kaydırıcının üst sınırı %${sayi(PAY_ENCOK)}, bu pay eğitimden fazlasını alacağı için pratikte uygulanamaz.`}
                    </li>
                    <li>
                      Sınıf payı korunarak veri setini {sayi(hesap.gerekenToplam)} örneğe çıkarmak;
                      artış bütün sınıflara aynı oranda dağılırsa gereken hacim budur. Toplama
                      yalnızca en küçük sınıfa yapılacaksa {sayi(hesap.hedefliEkleme)} örnek
                      yeterlidir.
                    </li>
                    <li>
                      {hesap.enCokKat >= 2
                        ? `Doğrulamayı tek bölme yerine en çok ${sayi(hesap.enCokKat)} katlı çapraz doğrulamayla yapmak; ölçüm tüm havuzdan toplanır, test kümesi ayrı kalır.`
                        : 'Çapraz doğrulama da kurtarmıyor: havuz iki kata bile yetmiyor. Sınıfları birleştirmek ya da hedefli veri toplamak dışında yol yok.'}
                    </li>
                  </ul>
                </>
              )}
            </div>
          )}

          <div
            className={`rounded-xl border p-5 ${
              hesap.katmanliZorunlu ? 'border-uyari/30 bg-uyari/8' : 'border-kenar bg-yuzey/40'
            }`}
          >
            <p className="etiket-mono mb-3 text-metin-soluk">Rastgele bölme yapılsaydı</p>
            <div className="space-y-2.5">
              <SonucSatiri
                etiket="Beklenen değer"
                deger={`${paraBirimi(hesap.beklenen, 1)} örnek`}
              />
              <SonucSatiri
                etiket="%95 salınım bandı"
                deger={`${sayi(hesap.altBant)} – ${sayi(hesap.ustBant)} örnek`}
                vurgulu
              />
              <SonucSatiri
                etiket="Sınıf test kümesinde hiç görünmeme olasılığı"
                deger={
                  hesap.sifirOlasilik < 0.001
                    ? '< %0,1'
                    : `%${paraBirimi(hesap.sifirOlasilik * 100, 1)}`
                }
              />
            </div>
            {hesap.katmanliZorunlu ? (
              <p className="mt-3 text-xs leading-relaxed text-uyari">
                Katmanlı bölme burada tercih değil zorunluluk: rastgele bölme en küçük sınıfın test
                örneğini bandın iki ucu arasında oynatıyor, yani aynı model iki ayrı bölmede iki
                ayrı skor verir. Bölmeyi sınıf etiketine göre katmanla ve bölme tohumunu (seed)
                kayda geç.
              </p>
            ) : (
              <p className="mt-3 text-xs leading-relaxed text-metin-soluk">
                Bu hacimde rastgele bölmenin salınımı en küçük sınıf için dar kalıyor. Katmanlı
                bölme yine de ücretsiz bir garanti: oranı sınıf içinde sabitler.
              </p>
            )}
          </div>

          <div
            className={`rounded-xl border p-5 ${
              hesap.belirsizlik > BELIRSIZLIK_ESIGI
                ? 'border-uyari/30 bg-uyari/8'
                : 'border-kenar bg-yuzey/40'
            }`}
          >
            <p className="etiket-mono mb-3 text-metin-soluk">Ölçüm çözünürlüğü</p>
            <div className="space-y-2.5">
              <SonucSatiri etiket="Test kümesi" deger={`${sayi(hesap.testSayisi)} örnek`} />
              <SonucSatiri
                etiket="Tek örneğin genel doğruluğa etkisi"
                deger={`%${paraBirimi(hesap.ornekAgirligi, 2)}`}
              />
              <SonucSatiri
                etiket="Genel doğruluğun belirsizlik payı (%95)"
                deger={`±%${paraBirimi(hesap.belirsizlik, 2)}`}
                vurgulu
              />
            </div>
            <div className="mt-3">
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className="text-xs text-metin-ikincil">Beklenen doğruluk ve aralığı</span>
                <span className="font-mono text-sm text-metin tabular-nums">
                  %{paraBirimi(hesap.dogrulukAltBant, 1)} – %{paraBirimi(hesap.dogrulukUstBant, 1)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-yuzey-3">
                <div
                  className={`h-full rounded-full ${
                    hesap.belirsizlik > BELIRSIZLIK_ESIGI
                      ? 'bg-uyari'
                      : 'bg-gradient-to-r from-vurgu to-ikincil'
                  }`}
                  style={{
                    width: `${Math.min(100, (hesap.belirsizlik / BELIRSIZLIK_TAM_OLCEK) * 100)}%`,
                  }}
                />
              </div>
            </div>
            {hesap.belirsizlik > BELIRSIZLIK_ESIGI && (
              <p className="mt-3 text-xs leading-relaxed text-uyari">
                Bu test kümesi, aralarındaki fark belirsizlik payından küçük olan iki modeli ayırt
                edemez. Karar bir eşiğe bağlıysa test payını yükselt; veri kısıtlıysa tek bölme
                yerine çapraz doğrulama kullan ve skoru aralıkla birlikte raporla.
              </p>
            )}
          </div>
        </>
      }
      not={
        <>
          Hesap, bölmenin örnek düzeyinde ve bağımsız yapıldığını varsayar. Aynı kullanıcıya,
          belgeye veya oturuma ait örnekler varsa bölme grup düzeyinde yapılmalıdır; aksi hâlde
          sızıntı skoru olduğundan yüksek gösterir ve bu araç bunu göremez. Zaman serisinde de
          rastgele bölme geçersizdir: bölme tarihe göre yapılır, oranlar korunmaz. Rastgele bölme
          bandı binom yaklaşımıyla, doğruluk aralığı Wald yaklaşımıyla üretilir; her ikisi de örnek
          sayısı küçüldükçe kabalaşır — Wald aralığı küçük test kümesinde %0–%100 dışına taştığı
          için gösterilen bant iki uçtan kırpılır, kırpma görüyorsan aralığa güvenme. &quot;Sınıf
          başına en az test örneği&quot; eşiği kabul edilmiş bir varsayımdır, ölçülmüş bir sınır
          değildir. Katmanlı bölmeyi zorunlu sayan iki sınır (hiç görünmeme olasılığının %1&apos;i,
          bağıl sapmanın 0,2&apos;yi aşması) ve test kümesini &quot;ayırt edemez&quot; sayan{' '}
          {BELIRSIZLIK_ESIGI} puanlık belirsizlik sınırı da aracın kendi kabulüdür; literatürden
          alınmış değerler değil. &quot;Veri setini N örneğe çıkarmak&quot; sayısı sınıf payının
          korunduğu, yani büyümenin bütün sınıflara aynı oranda dağıldığı varsayımına dayanır. Araç
          sınıf dengesizliğini yalnızca en küçük sınıf üzerinden görür; ortadaki sınıfların
          dağılımını, etiket gürültüsünü ve örneklerin zorluk dağılımını ölçmez.
        </>
      }
    />
  );
}
