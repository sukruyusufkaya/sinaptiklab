'use client';

import { useMemo, useState } from 'react';
import {
  AnaSonuc,
  HesapDuzeni,
  KaydirmaAlani,
  SayiAlani,
  SecimAlani,
  SonucSatiri,
  guvenliSayi,
  paraBirimi,
  sayi,
} from './HesapAlanlari';

type BelgeTuru = 'teknik' | 'hukuk' | 'sss' | 'kod';

const BELGE_TURLERI: Record<
  BelgeTuru,
  { ad: string; sayfaToken: number; oneriParca: number; oneriOrtusme: number; not: string }
> = {
  teknik: {
    ad: 'Teknik dokümantasyon',
    sayfaToken: 450,
    oneriParca: 700,
    oneriOrtusme: 15,
    not: 'Başlık hiyerarşisi güçlüdür; parçayı başlık sınırında kesmek en iyi sonucu verir.',
  },
  hukuk: {
    ad: 'Sözleşme / mevzuat',
    sayfaToken: 600,
    oneriParca: 1000,
    oneriOrtusme: 20,
    not: 'Madde bütünlüğü bozulmamalı; örtüşme yüksek tutulur.',
  },
  sss: {
    ad: 'SSS / destek kaydı',
    sayfaToken: 300,
    oneriParca: 350,
    oneriOrtusme: 5,
    not: 'Her kayıt kendi başına anlamlıdır; küçük parça ve düşük örtüşme yeterlidir.',
  },
  kod: {
    ad: 'Kod ve API referansı',
    sayfaToken: 500,
    oneriParca: 800,
    oneriOrtusme: 10,
    not: 'Fonksiyon/sınıf sınırında bölmek, sabit uzunluktan daha iyi sonuç verir.',
  },
};

export function ChunkHesaplayici() {
  const [tur, setTur] = useState<BelgeTuru>('teknik');
  const [sayfa, setSayfa] = useState(500);
  const [parcaToken, setParcaToken] = useState(700);
  const [ortusme, setOrtusme] = useState(15);
  const [getirilenParca, setGetirilenParca] = useState(6);
  const [baglamPenceresi, setBaglamPenceresi] = useState(128000);
  const [boyutBayt, setBoyutBayt] = useState(1536);

  const hesap = useMemo(() => {
    const tanim = BELGE_TURLERI[tur];
    const toplamToken = Math.max(0, guvenliSayi(sayfa)) * tanim.sayfaToken;
    const parca = Math.max(50, guvenliSayi(parcaToken, 700));
    const ortusmeOrani = Math.min(50, Math.max(0, guvenliSayi(ortusme))) / 100;

    // Örtüşme, ilerleme adımını küçültür: adım = parça × (1 - örtüşme)
    const adim = parca * (1 - ortusmeOrani);
    const parcaSayisi = adim > 0 ? Math.ceil(toplamToken / adim) : 0;
    const depolananToken = parcaSayisi * parca;
    const fazlalik = toplamToken > 0 ? depolananToken / toplamToken - 1 : 0;

    const getirilen = Math.max(1, guvenliSayi(getirilenParca, 6));
    const baglamYuku = getirilen * parca;
    const pencere = Math.max(1, guvenliSayi(baglamPenceresi, 128000));
    const pencereKullanim = (baglamYuku / pencere) * 100;

    // Vektör boyutu × 4 bayt (float32) + meta veri payı için %20 ek.
    const vektorBayt = parcaSayisi * Math.max(1, guvenliSayi(boyutBayt, 1536)) * 4 * 1.2;

    return {
      tanim,
      toplamToken,
      parcaSayisi,
      adim,
      depolananToken,
      fazlalik,
      baglamYuku,
      pencereKullanim,
      vektorMb: vektorBayt / 1024 / 1024,
      oneriUyumu: parca === tanim.oneriParca && ortusme === tanim.oneriOrtusme,
    };
  }, [tur, sayfa, parcaToken, ortusme, getirilenParca, baglamPenceresi, boyutBayt]);

  return (
    <HesapDuzeni
      girdiler={
        <>
          <SecimAlani
            etiket="Belge türü"
            deger={tur}
            degisti={(yeni) => {
              setTur(yeni);
              setParcaToken(BELGE_TURLERI[yeni].oneriParca);
              setOrtusme(BELGE_TURLERI[yeni].oneriOrtusme);
            }}
            secenekler={(Object.keys(BELGE_TURLERI) as BelgeTuru[]).map((anahtar) => ({
              deger: anahtar,
              ad: BELGE_TURLERI[anahtar].ad,
            }))}
            ipucu={BELGE_TURLERI[tur].not}
          />
          <SayiAlani
            etiket="Doküman hacmi"
            deger={sayfa}
            degisti={setSayfa}
            birim="sayfa"
            adim={50}
            ipucu={`Bu tür için sayfa başına ~${BELGE_TURLERI[tur].sayfaToken} token varsayılıyor.`}
          />
          <KaydirmaAlani
            etiket="Parça uzunluğu"
            deger={parcaToken}
            degisti={setParcaToken}
            enAz={100}
            enCok={2000}
            adim={50}
            bicimle={(deger) => `${sayi(deger)} token`}
          />
          <KaydirmaAlani
            etiket="Örtüşme"
            deger={ortusme}
            degisti={setOrtusme}
            enAz={0}
            enCok={40}
            adim={5}
            bicimle={(deger) => `%${deger}`}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SayiAlani
              etiket="Getirilen parça (top-k)"
              deger={getirilenParca}
              degisti={setGetirilenParca}
              birim="adet"
              enAz={1}
            />
            <SayiAlani
              etiket="Gömme boyutu"
              deger={boyutBayt}
              degisti={setBoyutBayt}
              birim="boyut"
              adim={128}
            />
          </div>
          <SayiAlani
            etiket="Model bağlam penceresi"
            deger={baglamPenceresi}
            degisti={setBaglamPenceresi}
            birim="token"
            adim={1000}
          />
        </>
      }
      sonuclar={
        <>
          <AnaSonuc deger={sayi(hesap.parcaSayisi)} birim="parça" etiket="Dizinlenecek parça" />

          <div className="space-y-2.5 rounded-xl border border-kenar bg-yuzey/40 p-5">
            <SonucSatiri etiket="Toplam içerik" deger={`${sayi(hesap.toplamToken)} token`} />
            <SonucSatiri etiket="İlerleme adımı" deger={`${sayi(hesap.adim)} token`} />
            <SonucSatiri etiket="Depolanan token" deger={sayi(hesap.depolananToken)} />
            <SonucSatiri
              etiket="Örtüşme fazlalığı"
              deger={`%${paraBirimi(hesap.fazlalik * 100, 1)}`}
            />
            <SonucSatiri
              etiket="Vektör dizini (tahmini)"
              deger={`${paraBirimi(hesap.vektorMb, 1)} MB`}
            />
          </div>

          <div
            className={`rounded-xl border p-5 ${
              hesap.pencereKullanim > 60 ? 'border-uyari/30 bg-uyari/8' : 'border-kenar bg-yuzey/40'
            }`}
          >
            <p className="etiket-mono mb-3 text-metin-soluk">Bağlam bütçesi</p>
            <SonucSatiri
              etiket="Getirilen bağlam"
              deger={`${sayi(hesap.baglamYuku)} token`}
              vurgulu
            />
            <div className="mt-3">
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className="text-xs text-metin-ikincil">Pencere kullanımı</span>
                <span className="font-mono text-sm tabular-nums">
                  %{paraBirimi(hesap.pencereKullanim, 1)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-yuzey-3">
                <div
                  className={`h-full rounded-full ${
                    hesap.pencereKullanim > 60
                      ? 'bg-uyari'
                      : 'bg-gradient-to-r from-vurgu to-ikincil'
                  }`}
                  style={{ width: `${Math.min(100, hesap.pencereKullanim)}%` }}
                />
              </div>
            </div>
            {hesap.pencereKullanim > 60 && (
              <p className="mt-3 text-xs leading-relaxed text-uyari">
                Getirilen bağlam pencerenin yarısından fazlasını dolduruyor. Yeniden sıralama ile
                top-k düşürmek, parça uzunluğunu büyütmekten daha iyi sonuç verir.
              </p>
            )}
          </div>
        </>
      }
      not={
        <>
          Parça sayısı, örtüşmeli kaydırmalı pencere varsayımıyla hesaplanır. Gerçekte belge sınırı,
          başlık yapısı ve tablo bütünlüğü sayıyı değiştirir. Sayfa başına token değeri belge türüne
          göre kabul edilmiş bir ortalamadır.
        </>
      }
    />
  );
}
