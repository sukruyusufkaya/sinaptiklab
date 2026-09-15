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
 * İnsan onayı (human-in-the-loop) kuyruğunun kapasite hesabı.
 *
 * Bütün sayılar kullanıcının girdiği değerlerden türetilir; hiçbir model, sağlayıcı
 * veya sektör ölçümü gömülü değildir. Tek yapısal varsayım kuyruk modelidir: gelen
 * kararlar bağımsız, inceleyiciler tek bir ortak kuyruktan besleniyor kabul edilir.
 */
export function InsanOnayKapasitesi() {
  const [gunlukHacim, setGunlukHacim] = useState(4000);
  const [otomatikGecis, setOtomatikGecis] = useState(85);
  const [incelemeSuresi, setIncelemeSuresi] = useState(90);
  const [inceleyici, setInceleyici] = useState(4);
  const [vardiyaSaat, setVardiyaSaat] = useState(8);
  const [verimliPay, setVerimliPay] = useState(65);
  const [zirveKatsayisi, setZirveKatsayisi] = useState(1.8);

  const hesap = useMemo(() => {
    // Girdiler sınırlandırılır: negatif hacim, sıfır süre ve sıfır inceleyici
    // hesabı tanımsız yapardı (sıfıra bölme). Alt sınırlar bunu engeller.
    const hacim = Math.max(0, guvenliSayi(gunlukHacim));
    const otomatikOran = Math.min(100, Math.max(0, guvenliSayi(otomatikGecis))) / 100;
    const sure = Math.max(1, guvenliSayi(incelemeSuresi, 90));
    const kisi = Math.max(1, guvenliSayi(inceleyici, 1));
    const vardiya = Math.min(24, Math.max(0.5, guvenliSayi(vardiyaSaat, 8)));
    const verimPayi = Math.min(100, Math.max(10, guvenliSayi(verimliPay, 65))) / 100;
    const zirve = Math.min(3, Math.max(1, guvenliSayi(zirveKatsayisi, 1.8)));

    // Otomatik geçen kararlar insan kuyruğuna hiç girmez; kapasite hesabı yalnızca
    // kalan paya bakar. Kuyruğun büyüklüğünü belirleyen şey hacim değil, bu paydır.
    const otomatikKarar = hacim * otomatikOran;
    const insanKarar = hacim - otomatikKarar;

    // Bir kişinin günde gerçekten incelemeye ayırdığı saniye: vardiyanın tamamı
    // değil, verimli payı. Kalan süre toplantı, mola ve bağlam değiştirmedir.
    const kisiSaniye = vardiya * 3600 * verimPayi;
    const kisiKapasite = kisiSaniye / sure;
    const kapasite = kisi * kisiKapasite;

    const gerekenSaniye = insanKarar * sure;
    const gerekenSaat = gerekenSaniye / 3600;
    // Ondalık bırakılır; tam sayıya yuvarlama kararı gösterim katmanında verilir,
    // çünkü 4,2 kişi ile 5 kişi arasındaki fark okurun görmesi gereken bir şey.
    const gerekenKisi = gerekenSaniye / kisiSaniye;

    // Doluluk = talep / kapasite. 1'e yaklaştıkça bekleme süresi patlar; bu yüzden
    // "kapasite yeterli mi" sorusunun cevabı ikili değil, doluluk oranıdır.
    const doluluk = insanKarar / kapasite;

    // Gelen kararlar vardiyaya düzgün dağılmaz. Zirve katsayısı, en yoğun saatin
    // ortalama saate oranıdır; darboğaz günlük toplamda değil o saatte oluşur.
    const saatlikKapasite = (kisi * 3600 * verimPayi) / sure;
    const ortalamaGelen = insanKarar / vardiya;
    const zirveGelen = ortalamaGelen * zirve;
    const zirveDoluluk = zirveGelen / saatlikKapasite;

    // Aynı gün kapatılamayan kararlar ertesi güne devreder; devir her gün tekrar
    // ederse kuyruk kalıcı hale gelir.
    const karsilanan = Math.min(insanKarar, kapasite);
    const devreden = Math.max(0, insanKarar - kapasite);

    // Bir kararın duvar saatinde kapladığı süre, inceleme süresinin kendisi değil
    // verimli paya bölünmüş hâlidir: inceleyici saatin yalnızca verimli payını
    // incelemeye ayırdığı için 90 saniyelik bir karar, %65 verimli payda saatin
    // ~138 saniyesini tutar. Kuyruk hesabı bu duvar saati süresiyle yapılmalı.
    const hizmetSaniye = sure / verimPayi;

    // Kuyruk beklemesi: çok sunuculu kuyruk için kaba yaklaşım —
    // bekleme ≈ (ρ / (1 − ρ)) × (hizmet süresi / inceleyici sayısı).
    // ρ (zirveDoluluk) verimli payı içeren kapasiteye göre tanımlı olduğundan
    // hizmet süresine aynı düzeltmeyi uygulamamak beklemeyi 1/verimli pay kadar
    // eksik gösterirdi. ρ ≥ 1'de kuyruk sınırsız büyür, sonlu bekleme yoktur.
    const beklemeSaniye =
      zirveDoluluk < 1
        ? (zirveDoluluk / (1 - zirveDoluluk)) * (hizmetSaniye / kisi)
        : Number.POSITIVE_INFINITY;

    // Mevcut ekibin zirve saatte bile yetmesi için gereken en düşük otomatik geçiş
    // oranı: kalan payın saatlik kapasiteyi aşmaması koşulundan çözülür.
    const esikOran = hacim > 0 ? Math.max(0, 1 - (saatlikKapasite * vardiya) / (hacim * zirve)) : 0;

    // Zirve saati kuyruk biriktirmeden karşılamak için gereken kişi sayısı.
    const zirveKisi = gerekenKisi * zirve;

    return {
      hacim,
      insanKarar,
      otomatikKarar,
      kisiKapasite,
      kapasite,
      gerekenSaat,
      gerekenKisi,
      doluluk,
      saatlikKapasite,
      zirveGelen,
      zirveDoluluk,
      karsilanan,
      devreden,
      beklemeDakika: beklemeSaniye / 60,
      esikOran,
      zirveKisi,
      yetersiz: Math.ceil(gerekenKisi) > kisi,
      zirveAsim: zirveDoluluk >= 1,
      // Kapasite yetiyor ama tampon yok. Eşik %80'de çünkü ρ/(1−ρ) bu noktadan
      // sonra dikleşir: doluluk %80'den %90'a çıktığında bekleme iki katına biner.
      gergin: zirveDoluluk > 0.8 && zirveDoluluk < 1,
      // Eşik oranın 0'a kırpıldığı hâl: mevcut kadro hacmin tamamını otomasyon
      // olmadan taşıyor, "en az şu kadar otomatik geçiş" cümlesi anlamsız olur.
      esikGereksiz: esikOran <= 0,
    };
  }, [
    gunlukHacim,
    otomatikGecis,
    incelemeSuresi,
    inceleyici,
    vardiyaSaat,
    verimliPay,
    zirveKatsayisi,
  ]);

  return (
    <HesapDuzeni
      girdiler={
        <>
          <SayiAlani
            etiket="Günlük karar hacmi"
            deger={gunlukHacim}
            degisti={setGunlukHacim}
            birim="karar/gün"
            adim={100}
            ipucu="Sisteme günde giren, onay ya da ret kararı gerektiren toplam öğe."
          />
          <KaydirmaAlani
            etiket="Otomatik geçiş oranı"
            deger={otomatikGecis}
            degisti={setOtomatikGecis}
            enAz={0}
            enCok={100}
            adim={1}
            bicimle={(deger) => `%${deger}`}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SayiAlani
              etiket="Ortalama inceleme süresi"
              deger={incelemeSuresi}
              degisti={setIncelemeSuresi}
              birim="saniye/karar"
              enAz={1}
              adim={10}
              ipucu="Kendi kuyruk kaydınızdan ölçülmüş değeri girin; buradaki başlangıç değeri bir referans değil, yalnızca örnek."
            />
            <SayiAlani
              etiket="İnceleyici sayısı"
              deger={inceleyici}
              degisti={setInceleyici}
              birim="kişi"
              enAz={1}
            />
          </div>
          <SayiAlani
            etiket="Vardiya uzunluğu"
            deger={vardiyaSaat}
            degisti={setVardiyaSaat}
            birim="saat/gün"
            enAz={0.5}
            enCok={24}
            adim={0.5}
            ipucu="Kuyruğun aktif olarak boşaltıldığı süre; 7/24 kapsama için 24 girilir."
          />
          <KaydirmaAlani
            etiket="Verimli inceleme payı"
            deger={verimliPay}
            degisti={setVerimliPay}
            enAz={10}
            enCok={100}
            adim={5}
            bicimle={(deger) => `%${deger}`}
          />
          <KaydirmaAlani
            etiket="Zirve yoğunluk katsayısı"
            deger={zirveKatsayisi}
            degisti={setZirveKatsayisi}
            enAz={1}
            enCok={3}
            adim={0.1}
            bicimle={(deger) => `${paraBirimi(deger, 1)}×`}
          />
        </>
      }
      sonuclar={
        <>
          {/*
            Ana sayı ortalama günü anlatır, oysa darboğaz zirve saatte oluşur:
            zirve kapasiteyi aşarken ana sonucu nötr tonda bırakmak okura
            yanlış güven verirdi, bu yüzden ton zirve durumunu da dinler.
          */}
          <AnaSonuc
            deger={sayi(Math.ceil(hesap.gerekenKisi))}
            birim="kişi"
            etiket="Gereken inceleyici (ortalama gün)"
            ton={hesap.yetersiz || hesap.zirveAsim ? 'uyari' : hesap.gergin ? 'sinyal' : 'vurgu'}
          />

          <div className="space-y-2.5 rounded-xl border border-kenar bg-yuzey/40 p-5">
            <SonucSatiri
              etiket="İnsan incelemesine düşen"
              deger={`${sayi(hesap.insanKarar)} karar/gün`}
              vurgulu
            />
            <SonucSatiri
              etiket="Gereken net inceleme emeği"
              deger={`${paraBirimi(hesap.gerekenSaat, 1)} saat/gün`}
            />
            <SonucSatiri
              etiket="Kişi başı günlük kapasite"
              deger={`${sayi(hesap.kisiKapasite)} karar`}
            />
            <SonucSatiri
              etiket="Ekibin günlük kapasitesi"
              deger={`${sayi(hesap.kapasite)} karar`}
            />
            <SonucSatiri
              etiket="Zirve saati karşılayan kadro"
              deger={`${sayi(Math.ceil(hesap.zirveKisi))} kişi`}
            />
          </div>

          <div
            className={`rounded-xl border p-5 ${
              hesap.zirveAsim ? 'border-uyari/30 bg-uyari/8' : 'border-kenar bg-yuzey/40'
            }`}
          >
            <p className="etiket-mono mb-3 text-metin-soluk">Kuyruk doluluğu</p>
            <SonucSatiri
              etiket="Ortalama saat"
              deger={`%${paraBirimi(hesap.doluluk * 100, 1)}`}
              vurgulu
            />
            <SonucSatiri
              etiket="Zirve saat"
              deger={`%${paraBirimi(hesap.zirveDoluluk * 100, 1)}`}
            />
            <div className="mt-3">
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className="text-xs text-metin-ikincil">Zirve saatte gelen / kapasite</span>
                <span className="font-mono text-sm tabular-nums">
                  {sayi(hesap.zirveGelen)} / {sayi(hesap.saatlikKapasite)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-yuzey-3">
                <div
                  className={`h-full rounded-full ${
                    hesap.zirveAsim
                      ? 'bg-uyari'
                      : hesap.gergin
                        ? 'bg-sinyal'
                        : 'bg-gradient-to-r from-vurgu to-ikincil'
                  }`}
                  style={{ width: `${Math.min(100, hesap.zirveDoluluk * 100)}%` }}
                />
              </div>
            </div>
            <div className="mt-3">
              <SonucSatiri
                etiket="Zirvede ortalama bekleme"
                deger={
                  Number.isFinite(hesap.beklemeDakika)
                    ? `${paraBirimi(hesap.beklemeDakika, 1)} dk`
                    : 'kuyruk büyüyor'
                }
              />
            </div>
            {hesap.zirveAsim ? (
              <p className="mt-3 text-xs leading-relaxed text-uyari">
                Zirve saatte gelen karar sayısı kapasiteyi aşıyor; o saat boyunca kuyruk birikmeye
                devam eder ve bekleme sonlu bir değerde durmaz. Dört kaldıraç var: kadroyu zirve
                saatte {sayi(Math.ceil(hesap.zirveKisi))} kişiye çıkarmak, otomatik geçiş oranını en
                az %{paraBirimi(hesap.esikOran * 100, 1)} seviyesine taşımak, karar ekranını
                sadeleştirerek inceleme süresini kısaltmak, ya da vardiyayı zirveyi daha geniş bir
                pencereye yayacak şekilde bölmek.
              </p>
            ) : hesap.gergin ? (
              <p className="mt-3 text-xs leading-relaxed text-sinyal">
                Zirve doluluk %80 sınırının üzerinde: kapasite yetiyor ama tampon yok. Bir kişinin
                izinli olduğu ya da hacmin beklenmedik arttığı günde kuyruk aynı gün kapanmaz. Zirve
                saate bir kişi eklemek ya da otomatik geçiş eşiğini birkaç puan yukarı almak tamponu
                geri getirir.
              </p>
            ) : (
              <p className="mt-3 text-xs leading-relaxed text-metin-soluk">
                Zirve saat dahil kapasite yeterli.{' '}
                {hesap.esikGereksiz
                  ? 'Mevcut kadro bu hacmi otomatik geçiş olmadan da zirve saatte karşılıyor; kuyruk şu an otomasyon eşiğine bağlı değil, hacim büyüdüğünde bağlanır.'
                  : `Bu girdilerle mevcut kadronun taşıyabileceği en düşük otomatik geçiş oranı %${paraBirimi(hesap.esikOran * 100, 1)}; eşiği bunun altına indirmek kuyruğu darboğaza sokar.`}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-kenar bg-yuzey/40 p-5">
            <p className="etiket-mono mb-3 text-metin-soluk">Günlük hacmin dağılımı</p>
            <OranCubugu
              bolumler={[
                { ad: 'Otomatik geçen', deger: Math.round(hesap.otomatikKarar), renk: 'bg-vurgu' },
                {
                  ad: 'Aynı gün incelenen',
                  deger: Math.round(hesap.karsilanan),
                  renk: 'bg-ikincil',
                },
                { ad: 'Ertesi güne devreden', deger: Math.round(hesap.devreden), renk: 'bg-uyari' },
              ]}
              toplam={hesap.hacim}
            />
          </div>
        </>
      }
      not={
        <>
          Hesap dört varsayıma dayanır ve hiçbiri ölçüm değildir: inceleme süresi bütün kararlar
          için aynı kabul edilir, inceleyiciler tek ortak kuyruktan beslenir, vardiyanın yalnızca
          girdiğiniz verimli payı incelemeye gider, gelen kararlar birbirinden bağımsız sayılır.
          Alanlardaki başlangıç değerleri — 90 saniye inceleme, %65 verimli pay, 1,8× zirve — formun
          nasıl doldurulacağını göstermek için konmuş örneklerdir; referans değil ve kendi
          kayıtlarınızdan gelen sayılarla değiştirilmeleri gerekir. Zirve beklemesi çok sunuculu
          kuyruk için kaba bir yaklaşımdır (ρ/(1−ρ) biçimi); doluluk tam doygunluğa yaklaştıkça
          gerçek bekleme bu tahminden hızla sapar. Araç itiraz, ikinci imza ve yeniden inceleme
          turlarını ayrı iş olarak saymaz — bunlar varsa hacme elle eklenmelidir. Otomatik geçiş
          oranının kalite maliyetini, yani insan görmeden geçen kararlardaki hata payını ölçmez; o
          ayrı bir örnekleme işidir.
        </>
      }
    />
  );
}
