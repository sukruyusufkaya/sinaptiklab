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

/*
 * Karışıklık matrisinin her ölçütü bir bölmedir ve bölen gerçekten sıfır
 * olabilir: hiç pozitif tahmin yoksa kesinliğin tanımı yoktur, hiç gerçek
 * negatif yoksa özgüllüğün yoktur. Tanımsız oranı %0 diye göstermek "model
 * kötü" yanlış okumasını üretir; bu yüzden tanımsız ayrı yazılır.
 */
function oran(pay: number, bolen: number) {
  return bolen > 0 ? pay / bolen : Number.NaN;
}

function yuzde(deger: number, basamak = 1) {
  if (!Number.isFinite(deger)) return 'tanımsız';
  return `%${paraBirimi(deger * 100, basamak)}`;
}

/** Girdi sayacı: negatif ve kesirli örnek sayısı anlamsız. */
function sayac(deger: number, varsayilan = 0) {
  return Math.max(0, Math.round(guvenliSayi(deger, varsayilan)));
}

/*
 * Eşik kaydırıcısının kapsadığı aralık. Hem girdinin sınırı hem de hesaptaki
 * kırpma buradan okunur; iki yere ayrı ayrı yazıldığında biri değişip diğeri
 * kalıyor ve kırpılan eşik kaydırıcının gösterdiğinden farklı oluyordu.
 */
const ESIK_EN_AZ = 0.05;
const ESIK_EN_COK = 0.95;

export function KarisiklikMatrisiHesaplayici() {
  const [gercekPozitif, setGercekPozitif] = useState(180);
  const [yanlisNegatif, setYanlisNegatif] = useState(20);
  const [yanlisPozitif, setYanlisPozitif] = useState(120);
  const [gercekNegatif, setGercekNegatif] = useState(1680);
  const [fpMaliyeti, setFpMaliyeti] = useState(1);
  const [fnMaliyeti, setFnMaliyeti] = useState(10);
  const [esik, setEsik] = useState(0.5);

  const hesap = useMemo(() => {
    const tp = sayac(gercekPozitif);
    const fn = sayac(yanlisNegatif);
    const fp = sayac(yanlisPozitif);
    const tn = sayac(gercekNegatif);

    const toplam = tp + fn + fp + tn;
    const pozitifSinif = tp + fn;
    const negatifSinif = fp + tn;
    const pozitifTahmin = tp + fp;

    // Kesinlik: pozitif dediklerimin kaçı doğruydu — sütun bazlı okuma.
    const kesinlik = oran(tp, pozitifTahmin);
    // Duyarlılık: gerçek pozitiflerin kaçını yakaladım — satır bazlı okuma.
    const duyarlilik = oran(tp, pozitifSinif);
    // Özgüllük: gerçek negatiflerin kaçını rahat bıraktım.
    const ozgulluk = oran(tn, negatifSinif);
    const yanlisPozitifOrani = oran(fp, negatifSinif);
    const dogruluk = oran(tp + tn, toplam);
    const yayginlik = oran(pozitifSinif, toplam);

    /*
     * Dengeli doğruluk iki sınıfı eşit ağırlıklar; dengesiz veride "doğruluk"
     * sayısının gizlediği çöküşü açığa çıkarır.
     */
    const dengeliDogruluk =
      Number.isFinite(duyarlilik) && Number.isFinite(ozgulluk)
        ? (duyarlilik + ozgulluk) / 2
        : Number.NaN;

    // F1 kesinlik ile duyarlılığın harmonik ortalamasıdır: biri çökerse düşer.
    const f1 =
      Number.isFinite(kesinlik) && Number.isFinite(duyarlilik) && kesinlik + duyarlilik > 0
        ? (2 * kesinlik * duyarlilik) / (kesinlik + duyarlilik)
        : Number.NaN;

    /*
     * İki maliyet alanı tek yerde temizlenir. Önceden β ham `fpMaliyeti` ile ve
     * `fnMaliyeti` için 1 varsayılanıyla okunuyordu, maliyet yükü ise 0
     * varsayılanıyla: boş bırakılan bir maliyet alanı iki paneli birbiriyle
     * çelişir hâle getiriyordu (β "maliyetler eşit" derken en iyi eşik "yanlış
     * pozitif sonsuz pahalı" diyordu).
     */
    const fpMaliyetBirim = Math.max(0, guvenliSayi(fpMaliyeti));
    const fnMaliyetBirim = Math.max(0, guvenliSayi(fnMaliyeti));

    /*
     * Fβ tanımı gereği duyarlılığı kesinlikten β kat önemli sayar. Maliyetleri
     * ölçüte bağlamak için β'yı maliyet oranından alıyoruz: yanlış negatif
     * yanlış pozitiften 10 kat pahalıysa duyarlılık 10 kat önemli sayılır.
     * Bu bir teorem değil, yaygın kabul edilen bir eşlemedir.
     */
    const beta = fpMaliyetBirim > 0 ? fnMaliyetBirim / fpMaliyetBirim : Number.NaN;
    // β² uç maliyet oranlarında taşar; taşan bölenle Fβ sessizce NaN olur.
    const betaKare = beta * beta;
    const fBeta =
      Number.isFinite(kesinlik) &&
      Number.isFinite(duyarlilik) &&
      Number.isFinite(betaKare) &&
      betaKare * kesinlik + duyarlilik > 0
        ? ((1 + betaKare) * kesinlik * duyarlilik) / (betaKare * kesinlik + duyarlilik)
        : Number.NaN;

    const fpYuku = fp * fpMaliyetBirim;
    const fnYuku = fn * fnMaliyetBirim;
    const toplamMaliyet = fpYuku + fnYuku;
    const ornekBasinaMaliyet = oran(toplamMaliyet, toplam);

    /*
     * Maliyet en iyi eşik. Kalibre edilmiş bir olasılık p için pozitif demenin
     * beklenen maliyeti (1 - p) · C_FP, negatif demenin p · C_FN'dir (doğru
     * kararın maliyeti sıfır sayılır). İkisi eşitlendiğinde
     * p* = C_FP / (C_FP + C_FN) çıkar. 0,50 eşiği yalnızca iki maliyet eşitken
     * doğru eşiktir.
     */
    const maliyetToplami = fpMaliyetBirim + fnMaliyetBirim;
    const enIyiEsik = maliyetToplami > 0 ? fpMaliyetBirim / maliyetToplami : Number.NaN;
    const suAndakiEsik = Math.min(ESIK_EN_COK, Math.max(ESIK_EN_AZ, guvenliSayi(esik, 0.5)));
    const kayma = Number.isFinite(enIyiEsik) ? enIyiEsik - suAndakiEsik : Number.NaN;

    /*
     * Önerilen eşik kaydırıcının aralığının dışına düşebilir: 100'e 1 maliyet
     * oranı 0,01 eşiği ister. Bu durumda okura bu araçtan giremeyeceği bir sayı
     * söylemek yerine sınırın dışında kaldığını söylüyoruz.
     */
    const esikAralikDisi =
      Number.isFinite(enIyiEsik) && (enIyiEsik < ESIK_EN_AZ || enIyiEsik > ESIK_EN_COK);

    /*
     * Kaymanın yönü ile hangi hatanın pahalı olduğu ayrı sorulardır: şu anki
     * eşik serbest bir girdi olduğu için, yanlış pozitif daha pahalıyken de
     * eşiğin aşağı inmesi gerekebilir (eşik maliyet dengesinin gerektirdiğinden
     * daha ihtiyatlı kurulmuşsa). Bu yüzden gerekçe maliyet karşılaştırmasından,
     * yön kaymadan okunur; ikisini tek koşula bağlamak — kayma negatifse
     * "yanlış negatif daha pahalı" demek — ters gerekçe üretiyordu.
     */
    const kaymaBelirgin = Number.isFinite(kayma) && Math.abs(kayma) >= 0.05;
    const asagiIniyor = kayma < 0;
    const fnDahaPahali = fnMaliyetBirim > fpMaliyetBirim;
    const maliyetlerEsit = fnMaliyetBirim === fpMaliyetBirim;
    // Pahalı hata ile kaymanın yönü örtüşüyorsa gerekçe doğrudan maliyettir.
    const gerekceMaliyetten = fnDahaPahali === asagiIniyor;
    const gerekce = !kaymaBelirgin
      ? ''
      : maliyetlerEsit
        ? `İki hatanın maliyeti eşit olduğu için denge noktası 0,50 ve şu anki ayar bunun ${
            asagiIniyor ? 'üstünde' : 'altında'
          } kaldığından`
        : gerekceMaliyetten
          ? `Yanlış ${asagiIniyor ? 'negatif' : 'pozitif'} daha pahalı olduğu için`
          : `Yanlış ${
              asagiIniyor ? 'pozitif' : 'negatif'
            } daha pahalı olsa da şu anki eşik maliyet dengesinin gerektirdiğinden daha ${
              asagiIniyor ? 'ihtiyatlı' : 'gevşek'
            } olduğu için`;

    /*
     * Çoğunluk sınıfı temeli: hiçbir şey öğrenmeyip hep çoğunluğu söyleyen
     * modelin doğruluğu. Ölçülen doğruluk bunun altındaysa doğruluk sayısı
     * model hakkında hiçbir şey söylemiyor.
     */
    const temelDogruluk = oran(Math.max(pozitifSinif, negatifSinif), toplam);
    const dogrulukTuzagi =
      toplam > 0 &&
      Number.isFinite(dogruluk) &&
      Number.isFinite(temelDogruluk) &&
      dogruluk <= temelDogruluk;

    return {
      tp,
      fn,
      fp,
      tn,
      toplam,
      kesinlik,
      duyarlilik,
      ozgulluk,
      yanlisPozitifOrani,
      dogruluk,
      yayginlik,
      dengeliDogruluk,
      f1,
      beta,
      fBeta,
      fpYuku,
      fnYuku,
      toplamMaliyet,
      ornekBasinaMaliyet,
      enIyiEsik,
      suAndakiEsik,
      kayma,
      kaymaBelirgin,
      asagiIniyor,
      gerekce,
      esikAralikDisi,
      temelDogruluk,
      dogrulukTuzagi,
    };
  }, [gercekPozitif, yanlisNegatif, yanlisPozitif, gercekNegatif, fpMaliyeti, fnMaliyeti, esik]);

  return (
    <HesapDuzeni
      girdiler={
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <SayiAlani
              etiket="Gerçek pozitif (TP)"
              deger={gercekPozitif}
              degisti={setGercekPozitif}
              birim="örnek"
              adim={10}
              ipucu="Pozitif dendi, gerçekten pozitifti."
            />
            <SayiAlani
              etiket="Yanlış negatif (FN)"
              deger={yanlisNegatif}
              degisti={setYanlisNegatif}
              birim="örnek"
              adim={10}
              ipucu="Kaçırılan pozitifler."
            />
            <SayiAlani
              etiket="Yanlış pozitif (FP)"
              deger={yanlisPozitif}
              degisti={setYanlisPozitif}
              birim="örnek"
              adim={10}
              ipucu="Boşa çalan alarmlar."
            />
            <SayiAlani
              etiket="Gerçek negatif (TN)"
              deger={gercekNegatif}
              degisti={setGercekNegatif}
              birim="örnek"
              adim={10}
              ipucu="Doğru şekilde rahat bırakılanlar."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SayiAlani
              etiket="Yanlış pozitif maliyeti"
              deger={fpMaliyeti}
              degisti={setFpMaliyeti}
              birim="birim"
              adim={1}
              ipucu="Gereksiz inceleme, boşa giden operatör zamanı."
            />
            <SayiAlani
              etiket="Yanlış negatif maliyeti"
              deger={fnMaliyeti}
              degisti={setFnMaliyeti}
              birim="birim"
              adim={1}
              ipucu="Kaçan vakanın bedeli. Birim sizin seçtiğiniz ölçek."
            />
          </div>

          <KaydirmaAlani
            etiket="Şu anki karar eşiği"
            deger={esik}
            degisti={setEsik}
            enAz={ESIK_EN_AZ}
            enCok={ESIK_EN_COK}
            adim={0.05}
            bicimle={(deger) => paraBirimi(deger, 2)}
          />
        </>
      }
      sonuclar={
        <>
          <AnaSonuc deger={yuzde(hesap.f1)} etiket="F1 puanı (maliyetten bağımsız)" />

          <div className="rounded-xl border border-kenar bg-yuzey/40 p-5">
            <p className="etiket-mono mb-3 text-metin-soluk">Matris — satır gerçek, sütun tahmin</p>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-kenar">
              <div className="bg-zemin p-3">
                <p className="text-[0.6875rem] leading-tight text-metin-soluk">
                  Gerçek pozitif · doğru
                </p>
                <p className="mt-1 font-mono text-lg text-basari tabular-nums">{sayi(hesap.tp)}</p>
              </div>
              <div className="bg-zemin p-3">
                <p className="text-[0.6875rem] leading-tight text-metin-soluk">
                  Kaçırılan pozitif · FN
                </p>
                <p className="mt-1 font-mono text-lg text-tehlike tabular-nums">{sayi(hesap.fn)}</p>
              </div>
              <div className="bg-zemin p-3">
                <p className="text-[0.6875rem] leading-tight text-metin-soluk">Boşa alarm · FP</p>
                <p className="mt-1 font-mono text-lg text-uyari tabular-nums">{sayi(hesap.fp)}</p>
              </div>
              <div className="bg-zemin p-3">
                <p className="text-[0.6875rem] leading-tight text-metin-soluk">
                  Gerçek negatif · doğru
                </p>
                <p className="mt-1 font-mono text-lg text-metin-ikincil tabular-nums">
                  {sayi(hesap.tn)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 rounded-xl border border-kenar bg-yuzey/40 p-5">
            <SonucSatiri etiket="Kesinlik" deger={yuzde(hesap.kesinlik)} vurgulu />
            <SonucSatiri etiket="Duyarlılık" deger={yuzde(hesap.duyarlilik)} vurgulu />
            <SonucSatiri etiket="Özgüllük" deger={yuzde(hesap.ozgulluk)} />
            <SonucSatiri etiket="Yanlış pozitif oranı" deger={yuzde(hesap.yanlisPozitifOrani)} />
            <SonucSatiri etiket="Doğruluk" deger={yuzde(hesap.dogruluk)} />
            <SonucSatiri etiket="Dengeli doğruluk" deger={yuzde(hesap.dengeliDogruluk)} />
            <SonucSatiri etiket="Pozitif sınıf yaygınlığı" deger={yuzde(hesap.yayginlik)} />
            <SonucSatiri etiket="Değerlendirilen örnek" deger={sayi(hesap.toplam)} />
          </div>

          {hesap.dogrulukTuzagi && (
            <div className="rounded-xl border border-uyari/30 bg-uyari/8 p-5">
              <p className="etiket-mono mb-2 text-uyari">Doğruluk tuzağı</p>
              <p className="text-xs leading-relaxed text-uyari">
                Ölçülen doğruluk ({yuzde(hesap.dogruluk)}), hep çoğunluk sınıfını söyleyen bir
                modelin doğruluğunun ({yuzde(hesap.temelDogruluk)}) üstüne çıkmıyor. Bu tabloda
                doğruluğu raporlamayı bırakın; kararı duyarlılık, kesinlik ve maliyet üzerinden
                verin.
              </p>
            </div>
          )}

          <div className="space-y-2.5 rounded-xl border border-kenar bg-yuzey/40 p-5">
            <p className="etiket-mono mb-3 text-metin-soluk">Maliyete göre ağırlık</p>
            <SonucSatiri
              etiket="Maliyet oranı (β)"
              deger={Number.isFinite(hesap.beta) ? paraBirimi(hesap.beta, 2) : 'tanımsız'}
            />
            <SonucSatiri etiket="Fβ puanı" deger={yuzde(hesap.fBeta)} vurgulu />
            <SonucSatiri
              etiket="Toplam hata maliyeti"
              deger={paraBirimi(hesap.toplamMaliyet, 2)}
              vurgulu
            />
            <SonucSatiri
              etiket="Örnek başına maliyet"
              deger={
                Number.isFinite(hesap.ornekBasinaMaliyet)
                  ? paraBirimi(hesap.ornekBasinaMaliyet, 3)
                  : 'tanımsız'
              }
            />
            <div className="pt-3">
              <OranCubugu
                bolumler={[
                  { ad: 'Yanlış pozitif yükü', deger: hesap.fpYuku, renk: 'bg-uyari' },
                  { ad: 'Yanlış negatif yükü', deger: hesap.fnYuku, renk: 'bg-tehlike' },
                ]}
                toplam={hesap.toplamMaliyet}
              />
            </div>
          </div>

          <AnaSonuc
            deger={Number.isFinite(hesap.enIyiEsik) ? paraBirimi(hesap.enIyiEsik, 2) : '—'}
            birim="olasılık"
            etiket="Maliyet en iyi karar eşiği"
            ton={hesap.kaymaBelirgin ? 'uyari' : 'ikincil'}
          />

          <div
            className={`rounded-xl border p-5 ${
              hesap.kaymaBelirgin ? 'border-uyari/30 bg-uyari/8' : 'border-kenar bg-yuzey/40'
            }`}
          >
            <p className="etiket-mono mb-3 text-metin-soluk">Eşik nereye gitmeli</p>
            <div className="space-y-2.5">
              <SonucSatiri etiket="Şu anki eşik" deger={paraBirimi(hesap.suAndakiEsik, 2)} />
              <SonucSatiri
                etiket="Kayma"
                deger={Number.isFinite(hesap.kayma) ? paraBirimi(hesap.kayma, 2) : '—'}
                vurgulu
              />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-metin-ikincil">
              {!Number.isFinite(hesap.enIyiEsik)
                ? 'İki maliyet de sıfır olduğu için eşiğin gideceği bir yön yok; en az birine sıfırdan büyük bir bedel verin.'
                : !hesap.kaymaBelirgin
                  ? 'Şu anki eşik maliyet dengesine yakın. Kazanç artık eşikten değil, modelin ayırt etme gücünden gelir: özellik ve veri tarafına bakın.'
                  : `${hesap.gerekce} eşiği ${paraBirimi(hesap.suAndakiEsik, 2)} yerine ${paraBirimi(hesap.enIyiEsik, 2)} yapın: ${
                      hesap.asagiIniyor
                        ? 'model daha kolay "pozitif" der, duyarlılık artar, karşılığında daha çok boşa alarm ve düşen kesinlik gelir. İnceleme kapasitesinin bu alarm hacmini kaldırdığını doğrulayın.'
                        : 'model daha seçici olur, kesinlik artar, karşılığında daha çok pozitif kaçar. Kaçan vakayı yakalayacak ikinci bir kontrol kurmadan bu kaymayı yapmayın.'
                    }${
                      hesap.esikAralikDisi
                        ? ` Bu sayı buradaki kaydırıcının ${paraBirimi(ESIK_EN_AZ, 2)}–${paraBirimi(ESIK_EN_COK, 2)} aralığının dışında: maliyet oranı bu kadar sertken eşiği kaydırıcıdan değil doğrudan modelin çıktısında ayarlayın.`
                        : ''
                    }`}
            </p>
          </div>
        </>
      }
      not={
        <>
          Ölçütler yalnızca girdiğiniz dört sayıdan türetilir; başlangıçtaki değerler alanları
          doldurmak için konmuş örnektir, bir ölçüm değildir. Dört sayının tek bir doğrulama
          kümesinden ve tek bir eşikten geldiği varsayılır — farklı eşiklerin matrisleri
          karıştırılırsa sonuç anlamsızdır. Maliyet en iyi eşik,{' '}
          <span className="font-mono">C_FP / (C_FP + C_FN)</span> formülünden gelir ve iki varsayıma
          dayanır: modelin verdiği skor kalibre edilmiş bir olasılıktır ve doğru kararların maliyeti
          sıfırdır. β değerinin maliyet oranına eşitlenmesi de bir teorem değil, yaygın kabul edilen
          bir eşlemedir. Araç eşik değiştiğinde matrisin nasıl değişeceğini bilmez — yeni eşikteki
          TP, FP, FN, TN sayıları ancak doğrulama kümesi yeniden puanlanarak ölçülür. Tek bir matris
          belirsizlik de taşımaz: küçük kümelerde bu oranların güven aralığı geniştir.
        </>
      }
    />
  );
}
