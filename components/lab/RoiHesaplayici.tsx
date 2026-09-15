'use client';

import { useMemo, useState } from 'react';
import {
  AnaSonuc,
  HesapDuzeni,
  KaydirmaAlani,
  SayiAlani,
  SonucSatiri,
  guvenliSayi,
  paraBirimi,
  sayi,
} from './HesapAlanlari';

/**
 * ROI hesabı bir tahmin aracıdır, iş vakası değildir. Amaç, varsayımları
 * görünür kılmak: hangi sayı değiştiğinde sonuç ne kadar değişiyor?
 */
export function RoiHesaplayici() {
  const [kisi, setKisi] = useState(25);
  const [haftalikSaat, setHaftalikSaat] = useState(4);
  const [saatMaliyeti, setSaatMaliyeti] = useState(600);
  const [benimsemeOrani, setBenimsemeOrani] = useState(60);
  const [kurulumMaliyeti, setKurulumMaliyeti] = useState(400000);
  const [aylikIsletme, setAylikIsletme] = useState(25000);
  const [hataAzaltma, setHataAzaltma] = useState(0);

  const hesap = useMemo(() => {
    const calisan = Math.max(0, guvenliSayi(kisi));
    const benimseme = Math.min(100, Math.max(0, guvenliSayi(benimsemeOrani))) / 100;
    const etkinKisi = calisan * benimseme;

    const haftalikTasarrufSaat = etkinKisi * Math.max(0, guvenliSayi(haftalikSaat));
    const aylikTasarrufSaat = haftalikTasarrufSaat * 4.33;
    const aylikZamanDegeri = aylikTasarrufSaat * Math.max(0, guvenliSayi(saatMaliyeti));
    const aylikHataDegeri = Math.max(0, guvenliSayi(hataAzaltma));

    const aylikBrut = aylikZamanDegeri + aylikHataDegeri;
    const aylikNet = aylikBrut - Math.max(0, guvenliSayi(aylikIsletme));

    const kurulum = Math.max(0, guvenliSayi(kurulumMaliyeti));
    const geriOdemeAy = aylikNet > 0 ? kurulum / aylikNet : Infinity;
    const birinciYilNet = aylikNet * 12 - kurulum;
    const birinciYilMaliyet = kurulum + Math.max(0, guvenliSayi(aylikIsletme)) * 12;
    const roi = birinciYilMaliyet > 0 ? (birinciYilNet / birinciYilMaliyet) * 100 : 0;

    return {
      etkinKisi,
      aylikTasarrufSaat,
      aylikZamanDegeri,
      aylikBrut,
      aylikNet,
      geriOdemeAy,
      birinciYilNet,
      roi,
      basabas: aylikNet > 0,
    };
  }, [
    kisi,
    haftalikSaat,
    saatMaliyeti,
    benimsemeOrani,
    kurulumMaliyeti,
    aylikIsletme,
    hataAzaltma,
  ]);

  return (
    <HesapDuzeni
      girdiler={
        <>
          <SayiAlani
            etiket="Etkilenen çalışan"
            deger={kisi}
            degisti={setKisi}
            birim="kişi"
            adim={5}
          />
          <KaydirmaAlani
            etiket="Gerçek benimseme oranı"
            deger={benimsemeOrani}
            degisti={setBenimsemeOrani}
            enAz={5}
            enCok={100}
            adim={5}
            bicimle={(deger) => `%${deger}`}
          />
          <SayiAlani
            etiket="Kişi başına haftalık tasarruf"
            deger={haftalikSaat}
            degisti={setHaftalikSaat}
            birim="saat"
            adim={0.5}
            ipucu="Ölçülmüş değer yoksa muhafazakâr bir tahmin girin; bu sayı sonucu en çok etkileyen girdidir."
          />
          <SayiAlani
            etiket="Yüklü saat maliyeti"
            deger={saatMaliyeti}
            degisti={setSaatMaliyeti}
            birim="/saat"
            adim={50}
          />
          <SayiAlani
            etiket="Kurulum maliyeti (tek seferlik)"
            deger={kurulumMaliyeti}
            degisti={setKurulumMaliyeti}
            adim={25000}
          />
          <SayiAlani
            etiket="Aylık işletme maliyeti"
            deger={aylikIsletme}
            degisti={setAylikIsletme}
            adim={5000}
            ipucu="Model çağrısı, altyapı, izleme ve bakım payı."
          />
          <SayiAlani
            etiket="Aylık hata/yeniden iş tasarrufu"
            deger={hataAzaltma}
            degisti={setHataAzaltma}
            adim={5000}
            ipucu="Ölçülebilir bir hata maliyeti yoksa sıfır bırakın."
          />
        </>
      }
      sonuclar={
        <>
          <AnaSonuc
            deger={Number.isFinite(hesap.geriOdemeAy) ? paraBirimi(hesap.geriOdemeAy, 1) : '∞'}
            birim="ay"
            etiket="Geri ödeme süresi"
            ton={hesap.basabas ? 'vurgu' : 'uyari'}
          />

          <div className="space-y-2.5 rounded-xl border border-kenar bg-yuzey/40 p-5">
            <SonucSatiri
              etiket="Etkin kullanıcı"
              deger={`${paraBirimi(hesap.etkinKisi, 1)} kişi`}
            />
            <SonucSatiri etiket="Aylık tasarruf" deger={`${sayi(hesap.aylikTasarrufSaat)} saat`} />
            <SonucSatiri etiket="Aylık brüt fayda" deger={paraBirimi(hesap.aylikBrut, 0)} />
            <SonucSatiri etiket="Aylık net fayda" deger={paraBirimi(hesap.aylikNet, 0)} vurgulu />
          </div>

          <div className="space-y-2.5 rounded-xl border border-kenar bg-yuzey/40 p-5">
            <p className="etiket-mono mb-1 text-metin-soluk">Birinci yıl</p>
            <SonucSatiri etiket="Net etki" deger={paraBirimi(hesap.birinciYilNet, 0)} vurgulu />
            <SonucSatiri etiket="ROI" deger={`%${paraBirimi(hesap.roi, 0)}`} />
          </div>

          <div
            className={`rounded-xl border p-5 ${
              hesap.basabas ? 'border-basari/30 bg-basari/8' : 'border-uyari/30 bg-uyari/8'
            }`}
          >
            <p className={`etiket-mono mb-2 ${hesap.basabas ? 'text-basari' : 'text-uyari'}`}>
              {hesap.basabas ? 'Başabaş geçilebilir' : 'Başabaş geçilemiyor'}
            </p>
            <p className="text-[0.875rem] leading-relaxed text-metin-ikincil">
              {hesap.basabas
                ? 'Aylık net fayda pozitif. En kırılgan varsayım benimseme oranı; onu düşürüp sonucun ne kadar dayandığına bakın.'
                : 'Aylık işletme maliyeti faydayı aşıyor. Kapsamı daraltmak veya benimsemeyi artırmak gerekiyor.'}
            </p>
          </div>
        </>
      }
      not={
        <>
          Bu bir tahmin aracıdır, iş vakası değildir. Sonuç büyük ölçüde iki varsayıma dayanır: kişi
          başına gerçek zaman tasarrufu ve gerçek benimseme oranı. Bu iki sayıyı pilot ölçümüyle
          doğrulamadan yatırım kararı vermeyin.
        </>
      }
    />
  );
}
