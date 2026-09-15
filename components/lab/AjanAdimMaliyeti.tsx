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
 * Ajan döngüsünde maliyetin adım sayısıyla neden doğrusal değil kare şeklinde
 * büyüdüğünü gösterir.
 *
 * Dayandığı tek yapısal varsayım şu: model her adımda konuşmanın tamamını
 * yeniden okur. Bu yüzden n. adımın girdisi, kendinden önceki (n-1) adımın
 * biriktirdiği her şeyi taşır. N adımlık döngünün toplam girdisi bir aritmetik
 * dizinin toplamıdır: N ile doğrusal büyüyen bir terim ile N² ile büyüyen bir
 * terimin toplamı. Döngü uzadıkça ikinci terim baskın hâle gelir; bu yüzden
 * adım sınırını iki katına çıkarmak faturayı iki kattan fazla artırır.
 *
 * Hiçbir model adı, sürüm veya ölçüm iddiası gömülü değildir. Alanlardaki
 * başlangıç değerleri (fiyat, pencere, token büyüklükleri) yalnızca formu
 * doldurmaya yarayan YER TUTUCULARDIR — bir sağlayıcının fiyat listesi veya
 * bir modelin penceresi değildir; okur kendi sayılarıyla değiştirir.
 */

/** Büyüme grafiğinde en çok bu kadar çubuk çizilir; uzun döngüler örneklenir. */
const EN_COK_CUBUK = 20;

export function AjanAdimMaliyeti() {
  const [adimSayisi, setAdimSayisi] = useState(12);
  const [baslangicBaglam, setBaslangicBaglam] = useState(2500);
  const [aracSonucu, setAracSonucu] = useState(800);
  const [modelCiktisi, setModelCiktisi] = useState(350);
  const [baglamPenceresi, setBaglamPenceresi] = useState(128000);
  const [girdiFiyat, setGirdiFiyat] = useState(3);
  const [ciktiFiyat, setCiktiFiyat] = useState(15);

  const hesap = useMemo(() => {
    const adim = Math.max(1, Math.round(guvenliSayi(adimSayisi, 1)));
    const taban = Math.max(0, guvenliSayi(baslangicBaglam));
    const arac = Math.max(0, guvenliSayi(aracSonucu));
    const cikti = Math.max(0, guvenliSayi(modelCiktisi));
    const pencere = Math.max(1, guvenliSayi(baglamPenceresi, 1));
    const girdiBirim = Math.max(0, guvenliSayi(girdiFiyat));
    const ciktiBirim = Math.max(0, guvenliSayi(ciktiFiyat));

    // Bir adımın konuşmaya kalıcı olarak eklediği hacim: aracın döndürdüğü
    // metin ile modelin o adımda yazdığı araç çağrısı ve gerekçe. İkisi de
    // sonraki her adımın girdisinde yeniden okunur; bu yüzden birlikte sayılır.
    const adimArtisi = arac + cikti;

    // n. adımın okuduğu bağlam = başlangıç + (n-1) × adım artışı.
    const adimBaglami = (n: number) => taban + (n - 1) * adimArtisi;

    // Σ(n=1..N) [taban + (n-1)×artış] = N×taban + artış × N(N-1)/2.
    // Sol terim adım sayısıyla doğrusal, sağ terim N² ile büyür. Faturanın
    // "kare" davranışı tümüyle sağ terimden gelir.
    const tekrarEdilenTaban = adim * taban;
    const birikenGecmis = (adimArtisi * adim * (adim - 1)) / 2;
    const toplamGirdi = tekrarEdilenTaban + birikenGecmis;
    const toplamCikti = adim * cikti;

    const girdiMaliyet = (toplamGirdi / 1_000_000) * girdiBirim;
    const ciktiMaliyet = (toplamCikti / 1_000_000) * ciktiBirim;
    const toplamMaliyet = girdiMaliyet + ciktiMaliyet;

    // Karşılaştırma tabanı: bağlam hiç birikmeseydi, yani her adım yalnızca
    // başlangıç bağlamını okusaydı fatura ne olurdu. Oran, birikimin payıdır.
    const sabitBaglamMaliyet = (tekrarEdilenTaban / 1_000_000) * girdiBirim + ciktiMaliyet;
    // Taban sıfırsa (fiyat veya token boş girilmiş) oran tanımsızdır; sıfır
    // yazmak "birikim bedava" gibi okunur, bu yüzden null döner ve metin
    // yerine tire basılır.
    const maliyetCarpani = sabitBaglamMaliyet > 0 ? toplamMaliyet / sabitBaglamMaliyet : null;

    // Adım sınırını tartışmanın en anlaşılır yolu: sınırı iki katına çıkarmanın
    // faturayı kaça katladığını söylemek.
    const ikiKatAdim = adim * 2;
    const ikiKatGirdi = ikiKatAdim * taban + (adimArtisi * ikiKatAdim * (ikiKatAdim - 1)) / 2;
    const ikiKatMaliyet =
      (ikiKatGirdi / 1_000_000) * girdiBirim + ((ikiKatAdim * cikti) / 1_000_000) * ciktiBirim;
    const ikiKatOran = toplamMaliyet > 0 ? ikiKatMaliyet / toplamMaliyet : null;

    const ilkAdim = adimBaglami(1);
    const sonAdim = adimBaglami(adim);
    const ilkAdimMaliyeti = (ilkAdim * girdiBirim + cikti * ciktiBirim) / 1_000_000;
    const sonAdimMaliyeti = (sonAdim * girdiBirim + cikti * ciktiBirim) / 1_000_000;
    const adimMaliyetOrani = ilkAdimMaliyeti > 0 ? sonAdimMaliyeti / ilkAdimMaliyeti : null;

    const pencereKullanim = (sonAdim / pencere) * 100;
    // Pencereye sığan son adım: taban + (n-1)×artış ≤ pencere. Artış sıfırsa
    // bağlam büyümüyor demektir; o durumda "dolacağı adım" diye bir şey yok.
    const siganAdim =
      taban > pencere ? 0 : adimArtisi > 0 ? Math.floor((pencere - taban) / adimArtisi) + 1 : null;
    const pencereAsildi = siganAdim !== null && siganAdim < adim;

    // Grafik, adımları son adımın bağlamına göre ölçekler; pencere çizgisi
    // yalnızca ölçeğin içine düşüyorsa çizilir.
    const ust = Math.max(sonAdim, 1);
    const cubukSayisi = Math.min(EN_COK_CUBUK, adim);
    const cubuklar = Array.from({ length: cubukSayisi }, (_, sira) => {
      const n = cubukSayisi === 1 ? 1 : Math.round(1 + (sira * (adim - 1)) / (cubukSayisi - 1));
      const baglam = adimBaglami(n);
      return { adim: n, baglam, asiyor: baglam > pencere, oran: (baglam / ust) * 100 };
    });

    return {
      adim,
      adimArtisi,
      tekrarEdilenTaban,
      birikenGecmis,
      toplamGirdi,
      toplamCikti,
      girdiMaliyet,
      ciktiMaliyet,
      toplamMaliyet,
      maliyetCarpani,
      ikiKatAdim,
      ikiKatMaliyet,
      ikiKatOran,
      ilkAdim,
      sonAdim,
      ilkAdimMaliyeti,
      sonAdimMaliyeti,
      adimMaliyetOrani,
      pencereKullanim,
      siganAdim,
      pencereAsildi,
      cubuklar,
      pencereCizgisiGorunur: pencere <= ust,
      pencereCizgiOrani: (pencere / ust) * 100,
    };
  }, [
    adimSayisi,
    baslangicBaglam,
    aracSonucu,
    modelCiktisi,
    baglamPenceresi,
    girdiFiyat,
    ciktiFiyat,
  ]);

  return (
    <HesapDuzeni
      girdiler={
        <>
          <KaydirmaAlani
            etiket="Adım sayısı"
            deger={adimSayisi}
            degisti={setAdimSayisi}
            enAz={1}
            enCok={60}
            adim={1}
            bicimle={(deger) => `${sayi(deger)} adım`}
          />
          <SayiAlani
            etiket="Başlangıç bağlamı"
            deger={baslangicBaglam}
            degisti={setBaslangicBaglam}
            birim="token"
            adim={250}
            ipucu="Sistem istemi, araç tanımları ve görev tarifi — her adımda yeniden okunan sabit kısım."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SayiAlani
              etiket="Araç sonucu / adım"
              deger={aracSonucu}
              degisti={setAracSonucu}
              birim="token"
              adim={100}
              ipucu="Adım başına sabit büyüklük varsayılır; gerçekte araca göre dalgalanır."
            />
            <SayiAlani
              etiket="Model çıktısı / adım"
              deger={modelCiktisi}
              degisti={setModelCiktisi}
              birim="token"
              adim={50}
              ipucu="Araç çağrısı ve gerekçe; hem faturalanır hem de bağlama eklenir."
            />
          </div>
          <SayiAlani
            etiket="Bağlam penceresi"
            deger={baglamPenceresi}
            degisti={setBaglamPenceresi}
            birim="token"
            adim={1000}
            ipucu="Başlangıçtaki değer yalnızca bir yer tutucudur, herhangi bir modelin penceresi değil; kullandığınız modelin penceresini kendiniz girin."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SayiAlani
              etiket="Girdi fiyatı"
              deger={girdiFiyat}
              degisti={setGirdiFiyat}
              birim="/1M"
              adim={0.1}
              ipucu="1M girdi tokenı için kendi fiyat listenizden okuduğunuz değer; başlangıçtaki sayı yer tutucudur. Sonuç, girdiğiniz para biriminde çıkar."
            />
            <SayiAlani
              etiket="Çıktı fiyatı"
              deger={ciktiFiyat}
              degisti={setCiktiFiyat}
              birim="/1M"
              adim={0.1}
              ipucu="1M çıktı tokenı için aynı fiyat listesinden okunan değer; iki alan da aynı para biriminde olmalı."
            />
          </div>
        </>
      }
      sonuclar={
        <>
          <AnaSonuc
            deger={paraBirimi(hesap.toplamMaliyet, 3)}
            etiket={`${sayi(hesap.adim)} adımlık döngünün maliyeti`}
            ton={hesap.pencereAsildi ? 'uyari' : 'vurgu'}
          />

          <div className="space-y-2.5 rounded-xl border border-kenar bg-yuzey/40 p-5">
            <SonucSatiri
              etiket="Adım başına bağlam artışı"
              deger={`${sayi(hesap.adimArtisi)} token`}
            />
            <SonucSatiri etiket="İlk adımın bağlamı" deger={`${sayi(hesap.ilkAdim)} token`} />
            <SonucSatiri
              etiket="Son adımın bağlamı"
              deger={`${sayi(hesap.sonAdim)} token`}
              vurgulu
            />
            <SonucSatiri etiket="Toplam okunan girdi" deger={`${sayi(hesap.toplamGirdi)} token`} />
            <SonucSatiri
              etiket="Toplam üretilen çıktı"
              deger={`${sayi(hesap.toplamCikti)} token`}
            />
            <SonucSatiri
              etiket="Son adım / ilk adım maliyeti"
              deger={
                hesap.adimMaliyetOrani === null ? '—' : `×${paraBirimi(hesap.adimMaliyetOrani, 1)}`
              }
            />
          </div>

          <div className="rounded-xl border border-kenar bg-yuzey/40 p-5">
            <p className="etiket-mono mb-3.5 text-metin-soluk">Token hacmi nereye gidiyor</p>
            <OranCubugu
              toplam={hesap.toplamGirdi + hesap.toplamCikti}
              bolumler={[
                {
                  ad: 'Tekrar okunan başlangıç bağlamı',
                  deger: Math.round(hesap.tekrarEdilenTaban),
                  renk: 'bg-vurgu',
                },
                {
                  ad: 'Biriken geçmiş (kare büyüyen kısım)',
                  deger: Math.round(hesap.birikenGecmis),
                  renk: 'bg-ikincil',
                },
                {
                  ad: 'Üretilen çıktı',
                  deger: Math.round(hesap.toplamCikti),
                  renk: 'bg-sinyal',
                },
              ]}
            />
            <p className="mt-4 border-t border-kenar-soluk pt-3 text-xs leading-relaxed text-metin-soluk">
              Çubuk token hacmini gösterir, parayı değil: çıktı tokenı genellikle girdiden farklı
              fiyatlandığı için faturadaki paylar bu paylarla aynı olmaz.
              {hesap.maliyetCarpani !== null && hesap.ikiKatOran !== null ? (
                <>
                  {' '}
                  Fiyatlarınızla hesaplandığında bağlam hiç birikmeseydi aynı döngü ×
                  {paraBirimi(hesap.maliyetCarpani, 2)} daha ucuz olurdu; adım sınırı iki katına (
                  {sayi(hesap.ikiKatAdim)} adım) çıkarılırsa fatura ×
                  {paraBirimi(hesap.ikiKatOran, 2)} olur — doğrusal büyüme bunu ×2 gösterirdi.
                </>
              ) : (
                <> Fiyat alanları boş olduğu için para cinsinden karşılaştırma yapılmadı.</>
              )}
            </p>
          </div>

          <div className="rounded-xl border border-kenar bg-yuzey/40 p-5">
            <p className="etiket-mono mb-4 text-metin-soluk">Adım başına okunan bağlam</p>
            <div className="relative flex h-24 items-end gap-1">
              {hesap.cubuklar.map((cubuk) => (
                <div
                  key={cubuk.adim}
                  className={`min-h-px flex-1 rounded-t-sm ${cubuk.asiyor ? 'bg-tehlike' : 'bg-vurgu'}`}
                  style={{ height: `${Math.max(2, Math.min(100, cubuk.oran))}%` }}
                  title={`${cubuk.adim}. adım: ${sayi(cubuk.baglam)} token`}
                />
              ))}
              {hesap.pencereCizgisiGorunur && (
                <div
                  className="pointer-events-none absolute inset-x-0 border-t border-dashed border-uyari"
                  style={{ bottom: `${Math.min(100, hesap.pencereCizgiOrani)}%` }}
                  aria-hidden="true"
                />
              )}
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-3 text-[0.6875rem] text-metin-soluk">
              <span>1. adım</span>
              <span>{sayi(hesap.adim)}. adım</span>
            </div>
            <p className="mt-3 border-t border-kenar-soluk pt-3 text-xs leading-relaxed text-metin-soluk">
              Çubuklar doğrusal yükselir, altında kalan alan ise kare büyür. Fatura çubukların
              yüksekliğine değil, alanına bakar.
            </p>
          </div>

          <div
            className={`rounded-xl border p-5 ${
              hesap.pencereAsildi
                ? 'border-uyari/30 bg-uyari/8'
                : hesap.pencereKullanim > 70
                  ? 'border-kenar-guclu bg-yuzey/40'
                  : 'border-kenar bg-yuzey/40'
            }`}
          >
            <p className="etiket-mono mb-3 text-metin-soluk">Pencere bütçesi</p>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="text-xs text-metin-ikincil">Son adımın pencere kullanımı</span>
              <span className="font-mono text-sm tabular-nums">
                %{paraBirimi(hesap.pencereKullanim, 1)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-yuzey-3">
              <div
                className={`h-full rounded-full ${
                  hesap.pencereAsildi ? 'bg-uyari' : 'bg-gradient-to-r from-vurgu to-ikincil'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, hesap.pencereKullanim))}%` }}
              />
            </div>
            <div className="mt-3 space-y-2.5">
              <SonucSatiri
                etiket="Pencereye sığan son adım"
                deger={
                  hesap.siganAdim === null
                    ? 'bağlam büyümüyor'
                    : hesap.siganAdim === 0
                      ? 'başlangıç bağlamı bile sığmıyor'
                      : `${sayi(hesap.siganAdim)}. adım`
                }
                vurgulu={hesap.pencereAsildi}
              />
              <SonucSatiri
                etiket="Son adımın tek başına maliyeti"
                deger={paraBirimi(hesap.sonAdimMaliyeti, 4)}
              />
            </div>
            {hesap.pencereAsildi && hesap.siganAdim === 0 && (
              <p className="mt-3 text-xs leading-relaxed text-uyari">
                Başlangıç bağlamı tek başına pencereden büyük; döngü ilk adımda bile çalışmaz.
                Sistem istemini, araç tanımlarını ve görev tarifini pencerenin altına indirin ya da
                daha büyük pencereli bir model seçin.
              </p>
            )}
            {hesap.pencereAsildi && hesap.siganAdim !== null && hesap.siganAdim > 0 && (
              <p className="mt-3 text-xs leading-relaxed text-uyari">
                Döngü {sayi(hesap.siganAdim)}. adımdan sonra pencereyi taşırıyor. Adım sınırını
                buranın altına çekin; daha uzun bir döngü gerekiyorsa araç sonucunu döndürmeden önce
                özetleyin veya geçmişi belirli aralıklarla sıkıştırıp yeniden başlatın. Pencereyi
                büyütmek maliyeti düşürmez, yalnızca taşmayı erteler.
              </p>
            )}
            {!hesap.pencereAsildi && hesap.birikenGecmis > hesap.tekrarEdilenTaban && (
              <p className="mt-3 text-xs leading-relaxed text-metin-ikincil">
                Girdi faturasının yarısından fazlası biriken geçmiş. Adım sınırını düşürmek ya da
                araç sonuçlarını kısaltmak, model değiştirmekten daha çok tasarruf getirir.
              </p>
            )}
          </div>
        </>
      }
      not={
        <>
          Hesap, modelin her adımda konuşmanın tamamını yeniden okuduğu varsayımına dayanır; istem
          önbelleği, bağlam özetleme ve geçmiş sıkıştırma modellenmez — bunlar devredeyse gerçek
          fatura bu sayının altında kalır, yani çıkan sayı bir üst sınırdır. Araç sonucu ve model
          çıktısı her adımda sabit büyüklükte varsayılmıştır; gerçek döngülerde adımlar birbirine
          benzemez. Alanlardaki başlangıç sayıları (fiyatlar, pencere, token büyüklükleri) yalnızca
          formu doldurmaya yarayan yer tutuculardır; bir sağlayıcının fiyat listesi veya bir modelin
          penceresi değildir ve kendi değerlerinizle değiştirilmeden çıkan sonuç hiçbir şeyi
          göstermez. Para birimi girdiğiniz fiyatın birimidir; araç bir dönüşüm yapmaz. Gecikme,
          paralel araç çağrısı, başarısız adımların yeniden denenmesi, adım sayısının doğruluğa
          etkisi ve araç tarafındaki altyapı maliyeti bu hesabın dışındadır.
        </>
      }
    />
  );
}
