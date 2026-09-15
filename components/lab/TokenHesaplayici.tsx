'use client';

import { useMemo, useState } from 'react';
import {
  AnaSonuc,
  HesapDuzeni,
  MetinAlani,
  SayiAlani,
  SecimAlani,
  SonucSatiri,
  guvenliSayi,
  paraBirimi,
  sayi,
} from './HesapAlanlari';

/**
 * Token tahmini. Gerçek tokenizer istemciye indirilmediği için karakter/token
 * oranına dayalı bir yaklaşım kullanılır; oran dile göre değişir.
 *
 * Türkçe eklemeli bir dil olduğu için aynı bilgi için İngilizceden daha fazla
 * token harcar — bu yüzden dil seçimi oranı değiştirir.
 */

type Dil = 'tr' | 'en' | 'kod';

const KARAKTER_ORANI: Record<Dil, { oran: number; ad: string }> = {
  tr: { oran: 2.6, ad: 'Türkçe' },
  en: { oran: 4.0, ad: 'İngilizce' },
  kod: { oran: 3.2, ad: 'Kod' },
};

const ORNEK_METIN =
  'Retrieval-Augmented Generation, dil modelinin cevap üretmeden önce harici bilgi kaynaklarından ilgili bilgiyi getirip oluşturduğu bağlama eklediği bir yapay zekâ mimarisidir.';

export function TokenHesaplayici() {
  const [metin, setMetin] = useState(ORNEK_METIN);
  const [dil, setDil] = useState<Dil>('tr');
  const [girdiFiyat, setGirdiFiyat] = useState(3);
  const [cikisFiyat, setCikisFiyat] = useState(15);
  const [beklenenCikis, setBeklenenCikis] = useState(300);

  const hesap = useMemo(() => {
    const karakter = metin.length;
    const kelime = metin.trim() ? metin.trim().split(/\s+/).length : 0;
    const oran = KARAKTER_ORANI[dil].oran;
    const girdiToken = Math.ceil(karakter / oran);
    const cikisToken = Math.max(0, guvenliSayi(beklenenCikis));

    const girdiMaliyet = (girdiToken / 1_000_000) * guvenliSayi(girdiFiyat);
    const cikisMaliyet = (cikisToken / 1_000_000) * guvenliSayi(cikisFiyat);

    return {
      karakter,
      kelime,
      girdiToken,
      cikisToken,
      tokenBasinaKarakter: girdiToken > 0 ? karakter / girdiToken : 0,
      girdiMaliyet,
      cikisMaliyet,
      toplamMaliyet: girdiMaliyet + cikisMaliyet,
      binIstek: (girdiMaliyet + cikisMaliyet) * 1000,
    };
  }, [metin, dil, girdiFiyat, cikisFiyat, beklenenCikis]);

  return (
    <HesapDuzeni
      girdiler={
        <>
          <MetinAlani
            etiket="Metin"
            deger={metin}
            degisti={setMetin}
            satir={7}
            yerTutucu="Token sayısını ölçmek istediğiniz metni yapıştırın…"
            ipucu="Metin tarayıcıdan çıkmaz; hesaplama tamamen istemcide yapılır."
          />
          <SecimAlani
            etiket="Dil / içerik türü"
            deger={dil}
            degisti={setDil}
            secenekler={(Object.keys(KARAKTER_ORANI) as Dil[]).map((anahtar) => ({
              deger: anahtar,
              ad: `${KARAKTER_ORANI[anahtar].ad} (~${KARAKTER_ORANI[anahtar].oran} karakter/token)`,
            }))}
            ipucu="Türkçe, eklemeli yapısı nedeniyle aynı bilgi için daha fazla token harcar."
          />
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
            etiket="Beklenen çıktı uzunluğu"
            deger={beklenenCikis}
            degisti={setBeklenenCikis}
            birim="token"
            adim={50}
          />
        </>
      }
      sonuclar={
        <>
          <AnaSonuc deger={sayi(hesap.girdiToken)} birim="token" etiket="Tahmini girdi token" />

          <div className="space-y-2.5 rounded-xl border border-kenar bg-yuzey/40 p-5">
            <SonucSatiri etiket="Karakter" deger={sayi(hesap.karakter)} />
            <SonucSatiri etiket="Kelime" deger={sayi(hesap.kelime)} />
            <SonucSatiri
              etiket="Karakter / token"
              deger={hesap.tokenBasinaKarakter ? paraBirimi(hesap.tokenBasinaKarakter, 2) : '—'}
            />
            <SonucSatiri etiket="Çıktı token (varsayım)" deger={sayi(hesap.cikisToken)} />
          </div>

          <div className="space-y-2.5 rounded-xl border border-kenar bg-yuzey/40 p-5">
            <p className="etiket-mono mb-1 text-metin-soluk">Maliyet</p>
            <SonucSatiri etiket="Girdi" deger={paraBirimi(hesap.girdiMaliyet, 5)} />
            <SonucSatiri etiket="Çıktı" deger={paraBirimi(hesap.cikisMaliyet, 5)} />
            <SonucSatiri etiket="Tek istek" deger={paraBirimi(hesap.toplamMaliyet, 5)} vurgulu />
            <SonucSatiri etiket="1.000 istek" deger={paraBirimi(hesap.binIstek, 2)} vurgulu />
          </div>
        </>
      }
      not={
        <>
          Token sayısı gerçek tokenizer ile değil karakter/token oranıyla tahmin edilir; sapma
          %10–20 arasında olabilir. Fiyat birimi modelin fiyat listesindeki para birimidir — burada
          birim dönüşümü yapılmaz.
        </>
      }
    />
  );
}
