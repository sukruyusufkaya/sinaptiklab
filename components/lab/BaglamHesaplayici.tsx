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
 * Bağlam penceresi bir bütçedir: sistem istemi, araç şemaları, geri getirilen
 * bağlam, sohbet geçmişi ve üretilecek cevap aynı havuzu paylaşır.
 */
export function BaglamHesaplayici() {
  const [pencere, setPencere] = useState(128000);
  const [sistemIstemi, setSistemIstemi] = useState(800);
  const [aracSemalari, setAracSemalari] = useState(1200);
  const [getirilenBaglam, setGetirilenBaglam] = useState(4200);
  const [gecmisTur, setGecmisTur] = useState(8);
  const [turBasinaToken, setTurBasinaToken] = useState(320);
  const [cikis, setCikis] = useState(800);

  const hesap = useMemo(() => {
    const toplamPencere = Math.max(1, guvenliSayi(pencere, 128000));
    const sistem = Math.max(0, guvenliSayi(sistemIstemi));
    const araclar = Math.max(0, guvenliSayi(aracSemalari));
    const baglam = Math.max(0, guvenliSayi(getirilenBaglam));
    const gecmis = Math.max(0, guvenliSayi(gecmisTur)) * Math.max(0, guvenliSayi(turBasinaToken));
    const cevap = Math.max(0, guvenliSayi(cikis));

    const kullanilan = sistem + araclar + baglam + gecmis + cevap;
    const kalan = toplamPencere - kullanilan;
    const oran = (kullanilan / toplamPencere) * 100;

    // Kalan bütçe kaç tur daha sohbet taşır?
    const turMaliyeti = Math.max(1, guvenliSayi(turBasinaToken, 320)) + cevap;
    const kalanTur = kalan > 0 ? Math.floor(kalan / turMaliyeti) : 0;

    return {
      toplamPencere,
      sistem,
      araclar,
      baglam,
      gecmis,
      cevap,
      kullanilan,
      kalan,
      oran,
      kalanTur,
      durum: oran > 100 ? 'tasma' : oran > 75 ? 'riskli' : oran > 50 ? 'dikkat' : 'rahat',
    };
  }, [pencere, sistemIstemi, aracSemalari, getirilenBaglam, gecmisTur, turBasinaToken, cikis]);

  const DURUM_METNI: Record<string, { ad: string; ton: string; tarif: string }> = {
    rahat: {
      ad: 'Rahat',
      ton: 'text-basari',
      tarif: 'Bütçenin yarısından azı kullanılıyor; sohbet uzayabilir.',
    },
    dikkat: {
      ad: 'Dikkat',
      ton: 'text-uyari',
      tarif:
        'Pencerenin yarısı doldu. Uzun pencerelerde ortadaki bilgiyi gözden kaçırma eğilimi artar.',
    },
    riskli: {
      ad: 'Riskli',
      ton: 'text-uyari',
      tarif: 'Bütçe dolmak üzere. Geçmiş özetleme veya top-k düşürme olmadan cevap kalitesi düşer.',
    },
    tasma: {
      ad: 'Taşma',
      ton: 'text-tehlike',
      tarif: 'Bütçe aşıldı. İstek hata verir veya bağlam sessizce kırpılır.',
    },
  };

  const durum = DURUM_METNI[hesap.durum]!;

  return (
    <HesapDuzeni
      girdiler={
        <>
          <SayiAlani
            etiket="Model bağlam penceresi"
            deger={pencere}
            degisti={setPencere}
            birim="token"
            adim={1000}
          />
          <SayiAlani
            etiket="Sistem istemi"
            deger={sistemIstemi}
            degisti={setSistemIstemi}
            birim="token"
            adim={50}
          />
          <SayiAlani
            etiket="Araç şemaları"
            deger={aracSemalari}
            degisti={setAracSemalari}
            birim="token"
            adim={100}
            ipucu="Ajan akışlarında araç tanımları sabit bir maliyet olarak her istekte gider."
          />
          <SayiAlani
            etiket="Geri getirilen bağlam"
            deger={getirilenBaglam}
            degisti={setGetirilenBaglam}
            birim="token"
            adim={200}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SayiAlani etiket="Geçmiş tur sayısı" deger={gecmisTur} degisti={setGecmisTur} />
            <SayiAlani
              etiket="Tur başına token"
              deger={turBasinaToken}
              degisti={setTurBasinaToken}
              adim={20}
            />
          </div>
          <SayiAlani
            etiket="Ayrılan çıktı bütçesi"
            deger={cikis}
            degisti={setCikis}
            birim="token"
            adim={100}
          />
        </>
      }
      sonuclar={
        <>
          <AnaSonuc
            deger={`%${paraBirimi(hesap.oran, 1)}`}
            etiket="Pencere kullanımı"
            ton={hesap.durum === 'tasma' ? 'uyari' : hesap.durum === 'rahat' ? 'vurgu' : 'uyari'}
          />

          <div className="rounded-xl border border-kenar bg-yuzey/40 p-5">
            <p className="etiket-mono mb-3.5 text-metin-soluk">Bütçe dağılımı</p>
            <OranCubugu
              toplam={hesap.toplamPencere}
              bolumler={[
                { ad: 'Sistem istemi', deger: hesap.sistem, renk: 'bg-vurgu' },
                { ad: 'Araç şemaları', deger: hesap.araclar, renk: 'bg-vurgu-sonuk' },
                { ad: 'Geri getirilen bağlam', deger: hesap.baglam, renk: 'bg-ikincil' },
                { ad: 'Sohbet geçmişi', deger: hesap.gecmis, renk: 'bg-sinyal' },
                { ad: 'Çıktı bütçesi', deger: hesap.cevap, renk: 'bg-metin-soluk' },
              ]}
            />
          </div>

          <div className="space-y-2.5 rounded-xl border border-kenar bg-yuzey/40 p-5">
            <SonucSatiri etiket="Kullanılan" deger={`${sayi(hesap.kullanilan)} token`} vurgulu />
            <SonucSatiri
              etiket="Kalan"
              deger={hesap.kalan >= 0 ? `${sayi(hesap.kalan)} token` : `${sayi(hesap.kalan)} token`}
            />
            <SonucSatiri etiket="Kalan bütçeyle ek tur" deger={`${sayi(hesap.kalanTur)} tur`} />
          </div>

          <div
            className={`rounded-xl border p-5 ${
              hesap.durum === 'rahat'
                ? 'border-basari/30 bg-basari/8'
                : hesap.durum === 'tasma'
                  ? 'border-tehlike/30 bg-tehlike/8'
                  : 'border-uyari/30 bg-uyari/8'
            }`}
          >
            <p className={`etiket-mono mb-2 ${durum.ton}`}>{durum.ad}</p>
            <p className="text-[0.875rem] leading-relaxed text-metin-ikincil">{durum.tarif}</p>
          </div>
        </>
      }
      not={
        <>
          Doğru soru &quot;kaç token sığıyor&quot; değil &quot;hangi bilgiyi pencereye
          koymalıyım&quot; sorusudur. Pencere büyüdükçe maliyet ve ortadaki bilgiyi kaçırma eğilimi
          artar; geri getirme kalitesi bu yüzden pencere boyutundan daha belirleyicidir.
        </>
      }
    />
  );
}
