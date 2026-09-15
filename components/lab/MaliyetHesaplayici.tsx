'use client';

import { useMemo, useState } from 'react';
import {
  AnaSonuc,
  HesapDuzeni,
  OranCubugu,
  SayiAlani,
  SecimAlani,
  SonucSatiri,
  guvenliSayi,
  paraBirimi,
  sayi,
} from './HesapAlanlari';

type Akis = 'tek' | 'rag' | 'ajan';

const AKISLAR: Record<Akis, { ad: string; cagriCarpani: number; tarif: string }> = {
  tek: { ad: 'Tek çağrı', cagriCarpani: 1, tarif: 'Bir istek = bir model çağrısı.' },
  rag: {
    ad: 'RAG (geri getirme + üretim)',
    cagriCarpani: 1.2,
    tarif: 'Gömme ve yeniden sıralama için ek küçük çağrılar.',
  },
  ajan: {
    ad: 'Ajan (çok adımlı)',
    cagriCarpani: 6,
    tarif: 'Ortalama adım sayısı kadar model çağrısı.',
  },
};

export function MaliyetHesaplayici() {
  const [gunlukIstek, setGunlukIstek] = useState(2000);
  const [girdiToken, setGirdiToken] = useState(1800);
  const [cikisToken, setCikisToken] = useState(400);
  const [girdiFiyat, setGirdiFiyat] = useState(3);
  const [cikisFiyat, setCikisFiyat] = useState(15);
  const [akis, setAkis] = useState<Akis>('rag');
  const [onbellekOrani, setOnbellekOrani] = useState(30);

  const hesap = useMemo(() => {
    const istek = Math.max(0, guvenliSayi(gunlukIstek));
    const carpan = AKISLAR[akis].cagriCarpani;
    const cagri = istek * carpan;

    const girdi = Math.max(0, guvenliSayi(girdiToken));
    const cikis = Math.max(0, guvenliSayi(cikisToken));
    const onbellek = Math.min(100, Math.max(0, guvenliSayi(onbellekOrani))) / 100;

    // Önbelleğe alınan girdi tokenları tipik olarak indirimli faturalanır; burada
    // basitleştirilmiş bir yaklaşım olarak %90 indirim varsayılır.
    const etkinGirdiFiyat = guvenliSayi(girdiFiyat) * (1 - onbellek * 0.9);

    const gunlukGirdiToken = cagri * girdi;
    const gunlukCikisToken = cagri * cikis;

    const gunlukGirdi = (gunlukGirdiToken / 1_000_000) * etkinGirdiFiyat;
    const gunlukCikis = (gunlukCikisToken / 1_000_000) * guvenliSayi(cikisFiyat);
    const gunluk = gunlukGirdi + gunlukCikis;

    return {
      cagri,
      gunlukGirdiToken,
      gunlukCikisToken,
      gunlukGirdi,
      gunlukCikis,
      gunluk,
      aylik: gunluk * 30,
      yillik: gunluk * 365,
      istekBasi: istek > 0 ? gunluk / istek : 0,
      etkinGirdiFiyat,
    };
  }, [gunlukIstek, girdiToken, cikisToken, girdiFiyat, cikisFiyat, akis, onbellekOrani]);

  return (
    <HesapDuzeni
      girdiler={
        <>
          <SecimAlani
            etiket="Akış tipi"
            deger={akis}
            degisti={setAkis}
            secenekler={(Object.keys(AKISLAR) as Akis[]).map((anahtar) => ({
              deger: anahtar,
              ad: `${AKISLAR[anahtar].ad} (×${AKISLAR[anahtar].cagriCarpani})`,
            }))}
            ipucu={AKISLAR[akis].tarif}
          />
          <SayiAlani
            etiket="Günlük istek"
            deger={gunlukIstek}
            degisti={setGunlukIstek}
            birim="adet"
            adim={100}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SayiAlani
              etiket="Girdi / çağrı"
              deger={girdiToken}
              degisti={setGirdiToken}
              birim="token"
              adim={100}
            />
            <SayiAlani
              etiket="Çıktı / çağrı"
              deger={cikisToken}
              degisti={setCikisToken}
              birim="token"
              adim={50}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SayiAlani
              etiket="Girdi fiyatı"
              deger={girdiFiyat}
              degisti={setGirdiFiyat}
              birim="/1M"
              adim={0.1}
            />
            <SayiAlani
              etiket="Çıktı fiyatı"
              deger={cikisFiyat}
              degisti={setCikisFiyat}
              birim="/1M"
              adim={0.1}
            />
          </div>
          <SayiAlani
            etiket="Önbellek isabet oranı"
            deger={onbellekOrani}
            degisti={setOnbellekOrani}
            birim="%"
            enCok={100}
            adim={5}
            ipucu="Sabit sistem istemi ve belge bağlamı tekrar ediyorsa isabet oranı yükselir."
          />
        </>
      }
      sonuclar={
        <>
          <AnaSonuc deger={paraBirimi(hesap.aylik, 0)} etiket="Aylık tahmini maliyet" />

          <div className="space-y-2.5 rounded-xl border border-kenar bg-yuzey/40 p-5">
            <SonucSatiri etiket="Günlük model çağrısı" deger={sayi(hesap.cagri)} />
            <SonucSatiri etiket="İstek başına maliyet" deger={paraBirimi(hesap.istekBasi, 5)} />
            <SonucSatiri etiket="Günlük" deger={paraBirimi(hesap.gunluk, 2)} />
            <SonucSatiri etiket="Aylık (30 gün)" deger={paraBirimi(hesap.aylik, 2)} vurgulu />
            <SonucSatiri etiket="Yıllık (365 gün)" deger={paraBirimi(hesap.yillik, 0)} />
          </div>

          <div className="rounded-xl border border-kenar bg-yuzey/40 p-5">
            <p className="etiket-mono mb-3.5 text-metin-soluk">Maliyet dağılımı (günlük)</p>
            <OranCubugu
              toplam={hesap.gunluk}
              bolumler={[
                { ad: 'Girdi', deger: Number(hesap.gunlukGirdi.toFixed(2)), renk: 'bg-vurgu' },
                { ad: 'Çıktı', deger: Number(hesap.gunlukCikis.toFixed(2)), renk: 'bg-ikincil' },
              ]}
            />
            <p className="mt-4 border-t border-kenar-soluk pt-3 text-xs text-metin-soluk">
              Etkin girdi fiyatı: {paraBirimi(hesap.etkinGirdiFiyat, 2)} / 1M token
            </p>
          </div>
        </>
      }
      not={
        <>
          Önbellek indirimi %90 varsayımıyla hesaplanır; gerçek oran sağlayıcıya göre değişir.
          Gömme, yeniden sıralama ve altyapı maliyetleri çağrı çarpanına yaklaşık olarak dâhil
          edilmiştir — ayrı hesaplanması gerekiyorsa kendi çarpanınızı girin.
        </>
      }
    />
  );
}
