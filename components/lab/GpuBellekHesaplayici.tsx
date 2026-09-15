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
} from './HesapAlanlari';

type Niceleme = '16' | '8' | '4';
type Kip = 'cikarim' | 'lora' | 'tam';

const NICELEME: Record<Niceleme, { ad: string; bayt: number }> = {
  '16': { ad: 'BF16 / FP16 (16 bit)', bayt: 2 },
  '8': { ad: 'INT8 (8 bit)', bayt: 1 },
  '4': { ad: 'INT4 (4 bit)', bayt: 0.5 },
};

const KIPLER: Record<Kip, { ad: string; ekCarpan: number; tarif: string }> = {
  cikarim: {
    ad: 'Çıkarım',
    ekCarpan: 0,
    tarif: 'Yalnızca ağırlıklar ve KV önbelleği bellekte tutulur.',
  },
  lora: {
    ad: 'LoRA ince ayar',
    ekCarpan: 0.2,
    tarif: 'Ağırlıklar donuk; yalnızca adaptör gradyanları ve optimizasyon durumu eklenir.',
  },
  tam: {
    ad: 'Tam ince ayar',
    ekCarpan: 3,
    tarif: 'Gradyan ve optimizasyon durumu ağırlıkların birkaç katı bellek ister.',
  },
};

const GPU_SECENEKLERI = [24, 40, 48, 80, 141];

export function GpuBellekHesaplayici() {
  const [parametre, setParametre] = useState(8);
  const [niceleme, setNiceleme] = useState<Niceleme>('16');
  const [kip, setKip] = useState<Kip>('cikarim');
  const [baglam, setBaglam] = useState(8192);
  const [esZamanli, setEsZamanli] = useState(4);
  const [katman, setKatman] = useState(32);
  const [gizliBoyut, setGizliBoyut] = useState(4096);

  const hesap = useMemo(() => {
    const params = Math.max(0.1, guvenliSayi(parametre, 8)) * 1e9;
    const baytParam = NICELEME[niceleme].bayt;
    const agirlikGb = (params * baytParam) / 1024 ** 3;

    // KV önbelleği: 2 (key+value) × katman × gizli boyut × bağlam × batch × 2 bayt
    const kvBayt =
      2 *
      Math.max(1, guvenliSayi(katman, 32)) *
      Math.max(1, guvenliSayi(gizliBoyut, 4096)) *
      Math.max(1, guvenliSayi(baglam, 8192)) *
      Math.max(1, guvenliSayi(esZamanli, 1)) *
      2;
    const kvGb = kvBayt / 1024 ** 3;

    const egitimEk = agirlikGb * KIPLER[kip].ekCarpan;
    // Aktivasyon ve çalışma alanı için %15 pay.
    const calismaAlani = (agirlikGb + kvGb + egitimEk) * 0.15;
    const toplam = agirlikGb + kvGb + egitimEk + calismaAlani;

    const uygunGpu = GPU_SECENEKLERI.find((boyut) => boyut >= toplam);
    const gerekenKart = uygunGpu ? 1 : Math.ceil(toplam / 141);

    return { agirlikGb, kvGb, egitimEk, calismaAlani, toplam, uygunGpu, gerekenKart };
  }, [parametre, niceleme, kip, baglam, esZamanli, katman, gizliBoyut]);

  return (
    <HesapDuzeni
      girdiler={
        <>
          <SayiAlani
            etiket="Parametre sayısı"
            deger={parametre}
            degisti={setParametre}
            birim="milyar"
            adim={1}
            enAz={0.1}
          />
          <SecimAlani
            etiket="Niceleme"
            deger={niceleme}
            degisti={setNiceleme}
            secenekler={(Object.keys(NICELEME) as Niceleme[]).map((anahtar) => ({
              deger: anahtar,
              ad: NICELEME[anahtar].ad,
            }))}
            ipucu="Niceleme belleği düşürür ama kalite kaybı riski taşır; kendi görev setinizde ölçün."
          />
          <SecimAlani
            etiket="Kullanım kipi"
            deger={kip}
            degisti={setKip}
            secenekler={(Object.keys(KIPLER) as Kip[]).map((anahtar) => ({
              deger: anahtar,
              ad: KIPLER[anahtar].ad,
            }))}
            ipucu={KIPLER[kip].tarif}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SayiAlani
              etiket="Bağlam uzunluğu"
              deger={baglam}
              degisti={setBaglam}
              birim="token"
              adim={1024}
            />
            <SayiAlani
              etiket="Eş zamanlı istek"
              deger={esZamanli}
              degisti={setEsZamanli}
              birim="batch"
              enAz={1}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SayiAlani etiket="Katman sayısı" deger={katman} degisti={setKatman} enAz={1} />
            <SayiAlani
              etiket="Gizli boyut"
              deger={gizliBoyut}
              degisti={setGizliBoyut}
              adim={256}
              enAz={1}
            />
          </div>
        </>
      }
      sonuclar={
        <>
          <AnaSonuc
            deger={paraBirimi(hesap.toplam, 1)}
            birim="GB"
            etiket="Tahmini bellek ihtiyacı"
            ton={hesap.uygunGpu ? 'vurgu' : 'uyari'}
          />

          <div className="rounded-xl border border-kenar bg-yuzey/40 p-5">
            <p className="etiket-mono mb-3.5 text-metin-soluk">Bellek dağılımı</p>
            <OranCubugu
              toplam={hesap.toplam}
              bolumler={[
                { ad: 'Ağırlıklar', deger: Number(hesap.agirlikGb.toFixed(1)), renk: 'bg-vurgu' },
                { ad: 'KV önbelleği', deger: Number(hesap.kvGb.toFixed(1)), renk: 'bg-ikincil' },
                ...(hesap.egitimEk > 0
                  ? [
                      {
                        ad: 'Eğitim durumu',
                        deger: Number(hesap.egitimEk.toFixed(1)),
                        renk: 'bg-sinyal',
                      },
                    ]
                  : []),
                {
                  ad: 'Çalışma alanı',
                  deger: Number(hesap.calismaAlani.toFixed(1)),
                  renk: 'bg-metin-soluk',
                },
              ]}
            />
          </div>

          <div className="space-y-2.5 rounded-xl border border-kenar bg-yuzey/40 p-5">
            <SonucSatiri etiket="Ağırlıklar" deger={`${paraBirimi(hesap.agirlikGb, 1)} GB`} />
            <SonucSatiri etiket="KV önbelleği" deger={`${paraBirimi(hesap.kvGb, 1)} GB`} />
            {hesap.egitimEk > 0 && (
              <SonucSatiri etiket="Eğitim durumu" deger={`${paraBirimi(hesap.egitimEk, 1)} GB`} />
            )}
            <SonucSatiri etiket="Toplam" deger={`${paraBirimi(hesap.toplam, 1)} GB`} vurgulu />
          </div>

          <div
            className={`rounded-xl border p-5 ${
              hesap.uygunGpu ? 'border-basari/30 bg-basari/8' : 'border-uyari/30 bg-uyari/8'
            }`}
          >
            <p className={`etiket-mono mb-2 ${hesap.uygunGpu ? 'text-basari' : 'text-uyari'}`}>
              Donanım
            </p>
            <p className="text-[0.875rem] leading-relaxed text-metin-ikincil">
              {hesap.uygunGpu
                ? `Tek ${hesap.uygunGpu} GB'lık hızlandırıcı yeterli görünüyor.`
                : `Tek kartta sığmıyor; yaklaşık ${hesap.gerekenKart} kart veya daha agresif niceleme gerekiyor.`}
            </p>
          </div>
        </>
      }
      not={
        <>
          Hesap; ağırlık boyutu, KV önbelleği ve çalışma alanı için yaygın kabul edilen yaklaşımlara
          dayanır. Gerçek kullanım; çıkarım motoru, dikkat uygulaması (ör. paged attention), parçalı
          yükleme ve bellek parçalanmasına göre değişir. Üretim kararından önce kendi yığınınızda
          ölçün.
        </>
      }
    />
  );
}
