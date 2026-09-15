'use client';

import { useMemo, useState } from 'react';
import {
  AnaSonuc,
  HesapDuzeni,
  KaydirmaAlani,
  OranCubugu,
  SayiAlani,
  SecimAlani,
  SonucSatiri,
  guvenliSayi,
  paraBirimi,
  sayi,
} from './HesapAlanlari';

type SayiTipi = 'float32' | 'float16' | 'int8';

/*
 * Bayt genişlikleri tanım gereği sabittir (IEEE 754 tek/yarı duyarlık, 8 bit
 * tamsayı) — ölçüm iddiası değil. `ekBayt` ise yapısal bir maliyettir: skaler
 * nicelemede her vektörün ölçekleme aralığı (en küçük/en büyük) iki float32
 * olarak saklanır, yani vektör başına 8 bayt geri gelir.
 */
const SAYI_TIPLERI: Record<SayiTipi, { ad: string; bayt: number; ekBayt: number; not: string }> = {
  float32: {
    ad: 'float32 — 4 bayt',
    bayt: 4,
    ekBayt: 0,
    not: 'Gömme modellerinin doğal çıktısı. Hiçbir dönüşüm kaybı yok, en çok yer tutan seçenek.',
  },
  float16: {
    ad: 'float16 — 2 bayt',
    bayt: 2,
    ekBayt: 0,
    not: 'Vektör gövdesi yarıya iner. Geri çağırma kaybı olup olmadığını kendi sorgu kümenizde ölçmeden varsaymayın.',
  },
  int8: {
    ad: 'int8 — 1 bayt',
    bayt: 1,
    ekBayt: 8,
    not: 'Vektör gövdesi dörde iner; ölçekleme aralığı vektör başına 8 bayt olarak geri gelir.',
  },
};

/*
 * HNSW grafında bir komşu, düğüm kimliği olarak saklanır; kimlik 32 bitlik
 * tamsayıdır. Bu da tanım gereği sabit: 4 bayt.
 */
const KOMSU_BAYT = 4;

/**
 * Tek düğümde bellekte tutulan dizin için kabul edilmiş bir çalışma eşiği.
 * Ölçülmüş bir sınır değil — makineye göre değişir; yalnızca "artık parçalama
 * kararını düşün" uyarısını tetiklemek için varsayım olarak kullanılıyor.
 */
const TEK_DUGUM_ESIK_GB = 32;

/**
 * Graf payının "kararı artık M üzerinden ver" uyarısını tetiklediği oran. Bu da
 * ölçülmüş bir sınır değil, kabul edilmiş bir okuma eşiği: bu oranın üstünde
 * vektör gövdesini küçültmek toplamı belirgin biçimde aşağı çekmiyor.
 */
const GRAF_AGIR_ESIK = 0.35;

const GIGABAYT = 1024 * 1024 * 1024;

/** Büyüklüğe göre MB/GB seçer; tek bir birimde göstermek okumayı zorlaştırıyor. */
function boyutBicimle(bayt: number) {
  if (!Number.isFinite(bayt)) return '—';
  const mb = bayt / 1024 / 1024;
  if (mb < 1024) return `${paraBirimi(mb, mb < 10 ? 2 : 1)} MB`;
  return `${paraBirimi(mb / 1024, 2)} GB`;
}

export function GommeDepolamaHesaplayici() {
  const [parcaSayisi, setParcaSayisi] = useState(120000);
  const [vektorBoyutu, setVektorBoyutu] = useState(768);
  const [kopyaSayisi, setKopyaSayisi] = useState(1);
  const [sayiTipi, setSayiTipi] = useState<SayiTipi>('float32');
  const [komsuSayisi, setKomsuSayisi] = useState(16);
  const [metaBayt, setMetaBayt] = useState(256);
  const [yenilenme, setYenilenme] = useState(10);

  const hesap = useMemo(() => {
    const tip = SAYI_TIPLERI[sayiTipi];
    const vektor = Math.max(0, guvenliSayi(parcaSayisi));
    const boyut = Math.max(1, guvenliSayi(vektorBoyutu, 768));
    const komsu = Math.max(4, guvenliSayi(komsuSayisi, 16));
    const meta = Math.max(0, guvenliSayi(metaBayt));
    const kopya = Math.max(1, guvenliSayi(kopyaSayisi, 1));
    const yenilenmeOrani = Math.min(100, Math.max(0, guvenliSayi(yenilenme))) / 100;

    // Bir vektörün gövdesi: boyut × sayı tipinin bayt genişliği. Nicelemede
    // ölçekleme aralığı vektör başına ayrıca saklandığı için ek bayt eklenir.
    const vektorBayt = boyut * tip.bayt + tip.ekBayt;
    const hamBayt = vektor * vektorBayt;

    // HNSW'de taban katmanın komşu sınırı 2M'dir. Seviye ataması geometrik
    // olduğu için üst katmanlara yaklaşık N/(M−1) düğüm çıkar ve her biri M
    // bağlantı taşır; bu yüzden üst katman payı taban katmanın yanında küçük
    // kalır ama sıfır değildir.
    const tabanBaglanti = vektor * 2 * komsu;
    const ustBaglanti = (vektor / (komsu - 1)) * komsu;
    const grafBayt = (tabanBaglanti + ustBaglanti) * KOMSU_BAYT;

    const metaToplam = vektor * meta;
    const tekKopya = hamBayt + grafBayt + metaToplam;
    const toplam = tekKopya * kopya;

    // Graf payı yükseldiğinde büyüyen şey veri değil veri yapısıdır; kararı
    // M üzerinden vermek gerekir, vektörü küçültmek işe yaramaz.
    const grafOrani = tekKopya > 0 ? grafBayt / tekKopya : 0;

    // float32 tabanıyla karşılaştırma: yalnızca vektör gövdesi değişir, graf
    // ve meta veri sayı tipinden bağımsızdır — tasarruf bu yüzden hiçbir zaman
    // dört kat olmaz.
    const float32Bayt = vektor * boyut * 4 + grafBayt + metaToplam;
    const tasarruf = float32Bayt > 0 ? 1 - tekKopya / float32Bayt : 0;

    // Yeniden dizinleme: yenilenen parçalar baştan gömülür, gövdesi ve meta
    // verisi yeniden yazılır, bağlantıları yeniden kurulur.
    const aylikVektor = vektor * yenilenmeOrani;
    const aylikBayt = aylikVektor * (vektorBayt + meta) + grafBayt * yenilenmeOrani;

    const toplamGb = toplam / GIGABAYT;

    return {
      vektor,
      vektorBayt,
      hamBayt,
      grafBayt,
      metaToplam,
      tekKopya,
      toplam,
      toplamGb,
      grafOrani,
      tasarruf,
      aylikVektor,
      aylikBayt,
      yillikVektor: aylikVektor * 12,
      esikAsildi: toplamGb > TEK_DUGUM_ESIK_GB,
      grafAgir: grafOrani > GRAF_AGIR_ESIK,
    };
  }, [parcaSayisi, vektorBoyutu, kopyaSayisi, sayiTipi, komsuSayisi, metaBayt, yenilenme]);

  const anaDeger =
    hesap.toplamGb >= 1 ? paraBirimi(hesap.toplamGb, 2) : paraBirimi(hesap.toplam / 1024 / 1024, 1);
  const anaBirim = hesap.toplamGb >= 1 ? 'GB' : 'MB';

  /*
   * Niceleme her zaman kazanç değildir: int8'in vektör başına eklediği 8 baytlık
   * ölçekleme aralığı, çok küçük vektör boyutlarında gövdeden kazanılanı aşabilir
   * ve sonuç float32 tabanından büyük çıkar. Bu durumda "taban seçenek" yazmak
   * okuru yanıltır; üç durum ayrı ayrı yazılıyor.
   */
  const tasarrufMetni =
    hesap.tasarruf > 0
      ? `%${paraBirimi(hesap.tasarruf * 100, 1)} daha küçük`
      : hesap.tasarruf < 0
        ? `%${paraBirimi(-hesap.tasarruf * 100, 1)} daha büyük`
        : 'taban seçenek';

  return (
    <HesapDuzeni
      girdiler={
        <>
          <SayiAlani
            etiket="Parça sayısı"
            deger={parcaSayisi}
            degisti={setParcaSayisi}
            birim="vektör"
            adim={1000}
            ipucu="Dizine yazılacak parça (chunk) sayısı; her parça bir vektöre karşılık gelir."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SayiAlani
              etiket="Vektör boyutu"
              deger={vektorBoyutu}
              degisti={setVektorBoyutu}
              birim="boyut"
              enAz={1}
              adim={128}
            />
            <SayiAlani
              etiket="Kopya sayısı"
              deger={kopyaSayisi}
              degisti={setKopyaSayisi}
              birim="kopya"
              enAz={1}
              ipucu="Erişilebilirlik için tutulan replika sayısı."
            />
          </div>
          <SecimAlani
            etiket="Sayı tipi"
            deger={sayiTipi}
            degisti={setSayiTipi}
            secenekler={(Object.keys(SAYI_TIPLERI) as SayiTipi[]).map((anahtar) => ({
              deger: anahtar,
              ad: SAYI_TIPLERI[anahtar].ad,
            }))}
            ipucu={SAYI_TIPLERI[sayiTipi].not}
          />
          <KaydirmaAlani
            etiket="HNSW komşu sayısı"
            deger={komsuSayisi}
            degisti={setKomsuSayisi}
            enAz={4}
            enCok={64}
            adim={4}
            bicimle={(deger) => `M = ${deger}`}
          />
          <SayiAlani
            etiket="Parça başına meta veri"
            deger={metaBayt}
            degisti={setMetaBayt}
            birim="bayt"
            adim={64}
            ipucu="Kaynak yolu, parça kimliği ve filtre alanlarının parça başına kapladığı yer; kendi şemanıza göre girin."
          />
          <KaydirmaAlani
            etiket="Aylık yenilenen içerik"
            deger={yenilenme}
            degisti={setYenilenme}
            enAz={0}
            enCok={100}
            adim={5}
            bicimle={(deger) => `%${deger}`}
          />
        </>
      }
      sonuclar={
        <>
          <AnaSonuc
            deger={anaDeger}
            birim={anaBirim}
            etiket="Dizin boyutu — tüm kopyalar"
            ton={hesap.esikAsildi ? 'uyari' : 'vurgu'}
          />

          <div className="space-y-2.5 rounded-xl border border-kenar bg-yuzey/40 p-5">
            <SonucSatiri etiket="Vektör başına gövde" deger={`${sayi(hesap.vektorBayt)} bayt`} />
            <SonucSatiri etiket="Vektör verisi" deger={boyutBicimle(hesap.hamBayt)} />
            <SonucSatiri etiket="HNSW grafı" deger={boyutBicimle(hesap.grafBayt)} />
            <SonucSatiri etiket="Meta veri" deger={boyutBicimle(hesap.metaToplam)} />
            <SonucSatiri etiket="Tek kopya" deger={boyutBicimle(hesap.tekKopya)} vurgulu />
            <SonucSatiri etiket="float32 tabanına göre" deger={tasarrufMetni} />
          </div>

          {hesap.esikAsildi && (
            <div className="rounded-xl border border-uyari/30 bg-uyari/8 p-5">
              <p className="etiket-mono mb-2 text-uyari">Tek düğüm eşiği aşıldı</p>
              <p className="text-xs leading-relaxed text-uyari">
                Toplam {paraBirimi(hesap.toplamGb, 1)} GB, tek düğümde bellekte tutulan dizin için
                varsaydığımız {TEK_DUGUM_ESIK_GB} GB çalışma eşiğini geçiyor. Buradan sonraki karar
                depolama değil mimari: dizini parçalara (shard) bölmek, disk tabanlı bir dizine
                geçmek ya da niceleme uygulayıp boyutu düşürmek. Üçünün geri çağırma ve gecikme
                etkisi farklıdır; eşiği kendi makinenizin belleğine göre yeniden okuyun.
              </p>
            </div>
          )}

          <div className="rounded-xl border border-kenar bg-yuzey/40 p-5">
            <p className="etiket-mono mb-3 text-metin-soluk">Tek kopyanın dağılımı</p>
            <OranCubugu
              toplam={hesap.tekKopya / 1024 / 1024}
              bolumler={[
                {
                  ad: 'Vektör verisi (MB)',
                  deger: Number((hesap.hamBayt / 1024 / 1024).toFixed(1)),
                  renk: 'bg-vurgu',
                },
                {
                  ad: 'HNSW grafı (MB)',
                  deger: Number((hesap.grafBayt / 1024 / 1024).toFixed(1)),
                  renk: 'bg-ikincil',
                },
                {
                  ad: 'Meta veri (MB)',
                  deger: Number((hesap.metaToplam / 1024 / 1024).toFixed(1)),
                  renk: 'bg-metin-soluk',
                },
              ]}
            />
            {hesap.grafAgir && (
              <p className="mt-3 text-xs leading-relaxed text-uyari">
                Graf, tek kopyanın %{paraBirimi(hesap.grafOrani * 100, 0)} kadarını tutuyor. Bu
                durumda vektörü daha da küçültmek yer kazandırmaz; M değerini düşürmek kazandırır. M
                yarıya inerse graf payı da yaklaşık yarıya iner — geri çağırma kaybını kendi
                doğrulama kümenizde ölçüp karar verin.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-kenar bg-yuzey/40 p-5">
            <p className="etiket-mono mb-3 text-metin-soluk">Yeniden dizinleme yükü</p>
            <div className="space-y-2.5">
              <SonucSatiri
                etiket="Aylık yeniden gömülen vektör"
                deger={sayi(hesap.aylikVektor)}
                vurgulu
              />
              <SonucSatiri
                etiket="Aylık yeniden yazılan veri"
                deger={boyutBicimle(hesap.aylikBayt)}
              />
              <SonucSatiri
                etiket="Yıllık yeniden gömülen vektör"
                deger={sayi(hesap.yillikVektor)}
              />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-metin-soluk">
              Yenilenen parçalar baştan gömülür: gövdesi ve meta verisi yeniden yazılır,
              bağlantıları yeniden kurulur. Sayı yeniden yazılan veri hacmidir, geçen süre değil.
            </p>
          </div>
        </>
      }
      not={
        <>
          Bayt genişlikleri tanım gereği sabittir (float32 = 4, float16 = 2, int8 = 1 bayt); int8
          için vektör başına 8 baytlık ölçekleme aralığı, graf için komşu başına 4 baytlık düğüm
          kimliği varsayılır. HNSW payı, taban katmanda 2M komşu ve geometrik seviye dağılımı
          varsayımıyla hesaplanır — sağlayıcının kendi ek yükü, boş alan payı ve silinen kayıtların
          bıraktığı artık bu hesapta yok. Uyarıları tetikleyen iki eşik —tek düğüm için{' '}
          {TEK_DUGUM_ESIK_GB} GB ve graf payı için %{GRAF_AGIR_ESIK * 100}— ölçülmüş sınırlar değil,
          okumayı yönlendirmek için kabul edilmiş varsayımlardır; kendi makinenize göre yeniden
          okunmaları gerekir. Araç yer hesabı yapar; nicelemenin geri çağırma kaybını, sorgu
          gecikmesini, gömme çağrılarının ücretini ve yeniden dizinlemenin ne kadar süreceğini
          ölçmez.
        </>
      }
    />
  );
}
