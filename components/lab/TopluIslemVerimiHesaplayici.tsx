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
 * Kaydırıcının üst sınırı. Aynı sınır yığın taramasında da kullanılır ki
 * "gecikmeyi en küçükleyen yığın" önerisi kullanıcının seçebileceği
 * aralığın dışına düşmesin.
 */
const EN_BUYUK_YIGIN = 128;

type YiginGirdisi = {
  /** İstek/sn — tüm kopyalara gelen toplam hız. */
  istekHizi: number;
  girdiToken: number;
  ciktiToken: number;
  /** 0–1 arası: yığın kazancının doğrusala oranı. Kullanıcının varsayımı. */
  olcekVerimi: number;
  /** Token/sn — kullanıcının yığın boyutu 1 ile kendi ortamında ölçtüğü hız. */
  tekAkisHizi: number;
  kopya: number;
};

type YiginOlcumu = {
  kopyaTokenHizi: number;
  akisTokenHizi: number;
  yiginToken: number;
  hizmetSuresi: number;
  kopyaVerimi: number;
  kapasite: number;
  doluluk: number;
  doygun: boolean;
  doldurmaBekleme: number;
  kuyrukBekleme: number;
  gecikme: number;
};

/**
 * Tek bir yığın boyutu için verim ve gecikme bileşenleri.
 *
 * Fonksiyon dışarıda duruyor çünkü hem seçili yığın için bir kez, hem de
 * "en iyi yığın" taramasında 1..EN_BUYUK_YIGIN için çağrılıyor; aynı
 * aritmetiğin iki kopyası olmasın.
 */
function yiginOlcumu(yigin: number, p: YiginGirdisi): YiginOlcumu {
  /*
   * Yığın, tek akışın hızını yığın boyutu katına çıkarmaz. Kazanç tek bir
   * katsayıyla modelleniyor: ölçekleme verimi 1 ise doğrusal (yığın katı),
   * 0 ise hiç kazanç yok. Gerçek sistemde kazanç yığın büyüdükçe azalır —
   * burada sabit kabul ediliyor, bu bir basitleştirme.
   */
  const kopyaTokenHizi = p.tekAkisHizi * (1 + (yigin - 1) * p.olcekVerimi);

  /*
   * Ön dolum ve kod çözme tek bir token bütçesi sayılıyor: gerçekte ön dolum
   * token başına daha hızlıdır, bu yüzden uzun istemli isteklerde hesap
   * gecikmeyi yukarı doğru şişirir. Ayrı ölçüm varsa karma hız alana yazılır.
   */
  const yiginToken = yigin * (p.girdiToken + p.ciktiToken);
  const hizmetSuresi = yiginToken / kopyaTokenHizi;

  // Bir yığın bittiğinde `yigin` kadar istek tamamlanmış olur.
  const kopyaVerimi = yigin / hizmetSuresi;
  const kapasite = kopyaVerimi * p.kopya;
  const doluluk = p.istekHizi / kapasite;

  /*
   * Yığın dolma beklemesi: istekler kopyalara eşit dağıldığında bir yığının
   * dolması için geçen ortalama bekleme (yigin - 1) / (2 * kopya hızı).
   * Yığın büyüdükçe doğrusal artan bileşen budur. Trafik yokken yığın hiç
   * dolmaz: sonsuz döner, sıfırla doldurulmaz.
   */
  const kopyaIstekHizi = p.istekHizi / p.kopya;
  const doldurmaBekleme =
    yigin <= 1
      ? 0
      : kopyaIstekHizi > 0
        ? (yigin - 1) / (2 * kopyaIstekHizi)
        : Number.POSITIVE_INFINITY;

  /*
   * Doluluk 1'e yaklaşırken kuyruk sınırsız büyür; M/M/1 yaklaşımı
   * (doluluk / (1 - doluluk)) × hizmet süresi. Doygun durumda sayı üretmek
   * yanıltıcı olur, sonsuz bırakılıyor.
   */
  const doygun = doluluk >= 1;
  const kuyrukBekleme = doygun
    ? Number.POSITIVE_INFINITY
    : (doluluk / (1 - doluluk)) * hizmetSuresi;

  return {
    kopyaTokenHizi,
    akisTokenHizi: kopyaTokenHizi / yigin,
    yiginToken,
    hizmetSuresi,
    kopyaVerimi,
    kapasite,
    doluluk,
    doygun,
    doldurmaBekleme,
    kuyrukBekleme,
    gecikme: doldurmaBekleme + kuyrukBekleme + hizmetSuresi,
  };
}

/** Saniye altı değerler milisaniye okunur; ölçülemeyen değer tire ile geçilir. */
function sureBicimle(saniye: number) {
  if (!Number.isFinite(saniye)) return '—';
  if (saniye < 1) return `${sayi(saniye * 1000)} ms`;
  return `${paraBirimi(saniye, 2)} sn`;
}

export function TopluIslemVerimiHesaplayici() {
  /*
   * Başlangıç değerleri bir ölçüm iddiası değil; aracın açıldığı anda doygun
   * olmayan, panellerin hepsinin sayı gösterdiği bir noktada durması için
   * seçildi. Kullanıcı kendi ölçtüğü değerleri yazınca hepsi değişir.
   */
  const [istekHizi, setIstekHizi] = useState(3);
  const [girdiToken, setGirdiToken] = useState(400);
  const [ciktiToken, setCiktiToken] = useState(300);
  const [yigin, setYigin] = useState(16);
  const [olcekVerimi, setOlcekVerimi] = useState(60);
  const [tekAkisHizi, setTekAkisHizi] = useState(90);
  const [kopya, setKopya] = useState(4);

  const hesap = useMemo(() => {
    // Her kullanıcı girdisi NaN'a ve anlamsız aralığa karşı kapatılıyor.
    const p: YiginGirdisi = {
      istekHizi: Math.max(0, guvenliSayi(istekHizi)),
      girdiToken: Math.max(0, guvenliSayi(girdiToken)),
      ciktiToken: Math.max(1, guvenliSayi(ciktiToken, 1)),
      olcekVerimi: Math.min(100, Math.max(0, guvenliSayi(olcekVerimi))) / 100,
      tekAkisHizi: Math.max(1, guvenliSayi(tekAkisHizi, 1)),
      kopya: Math.max(1, Math.round(guvenliSayi(kopya, 1))),
    };

    const secili = Math.min(EN_BUYUK_YIGIN, Math.max(1, Math.round(guvenliSayi(yigin, 1))));
    const olcum = yiginOlcumu(secili, p);

    /*
     * Yığın 1'e göre kazanç. Yığın 1'de kopya token hızı tam olarak tek akış
     * hızıdır, dolayısıyla kapasite oranı (1 + (yigin - 1) × verim)'e eşit
     * çıkar; yine de tarama ile aynı fonksiyondan alınıyor ki formül bir
     * yerde değişirse ikisi ayrışmasın.
     */
    const tekilOlcum = yiginOlcumu(1, p);
    const kazanc = olcum.kapasite / tekilOlcum.kapasite;

    /*
     * Gecikmeyi en küçükleyen yığın: hizmet süresi yığınla birlikte artar,
     * dolma beklemesi de artar, ama kapasite arttığı için kuyruk beklemesi
     * düşer. En küçük noktayı kapalı formülle çözmek yerine izin verilen
     * aralık taranıyor — 128 adım, her girdi değişiminde bir kez.
     */
    let enIyiYigin = 1;
    let enIyiGecikme = Number.POSITIVE_INFINITY;
    for (let deneme = 1; deneme <= EN_BUYUK_YIGIN; deneme += 1) {
      const denemeOlcumu = yiginOlcumu(deneme, p);
      if (denemeOlcumu.doygun || !Number.isFinite(denemeOlcumu.gecikme)) continue;
      if (denemeOlcumu.gecikme < enIyiGecikme) {
        enIyiGecikme = denemeOlcumu.gecikme;
        enIyiYigin = deneme;
      }
    }
    const cozumVar = Number.isFinite(enIyiGecikme);

    // Kapasite gelen hızın altındaysa fazlası işlenmez, kuyrukta birikir.
    const karsilanan = Math.min(p.istekHizi, olcum.kapasite);
    const asan = Math.max(0, p.istekHizi - olcum.kapasite);

    return {
      ...olcum,
      secili,
      kazanc,
      enIyiYigin,
      enIyiGecikme,
      cozumVar,
      karsilanan,
      asan,
      ciktiVerimi: karsilanan * p.ciktiToken,
      // Dolma beklemesi hizmet süresini geçtiğinde araç asıl işten çok bekliyor.
      doldurmaBaskin: olcum.doldurmaBekleme > olcum.hizmetSuresi,
    };
  }, [istekHizi, girdiToken, ciktiToken, yigin, olcekVerimi, tekAkisHizi, kopya]);

  const dolulukYuzde = Math.min(100, hesap.doluluk * 100);

  return (
    <HesapDuzeni
      girdiler={
        <>
          <SayiAlani
            etiket="Gelen istek hızı"
            deger={istekHizi}
            degisti={setIstekHizi}
            birim="istek/sn"
            adim={1}
            ipucu="Tüm kopyalara gelen toplam hız. Sıfır bırakılırsa yığın hiç dolmaz ve gecikme tanımsız kalır."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SayiAlani
              etiket="İstek başına girdi token"
              deger={girdiToken}
              degisti={setGirdiToken}
              birim="token"
              adim={100}
              ipucu="Girdi token'ı çıktı ile aynı token hızından geçiyor kabul edilir; gerçekte ön dolum daha hızlıdır, bu yüzden uzun istemde süre yukarı sapar."
            />
            <SayiAlani
              etiket="İstek başına çıktı token"
              deger={ciktiToken}
              degisti={setCiktiToken}
              birim="token"
              enAz={1}
              adim={50}
              ipucu="En az 1: çıktısı olmayan istek hizmet süresi üretmez, hesap da bölünecek bir iş bulamaz."
            />
          </div>
          <KaydirmaAlani
            etiket="Yığın boyutu"
            deger={yigin}
            degisti={setYigin}
            enAz={1}
            enCok={EN_BUYUK_YIGIN}
            adim={1}
            bicimle={(deger) => `${sayi(deger)} istek`}
          />
          <KaydirmaAlani
            etiket="Yığın ölçekleme verimi"
            deger={olcekVerimi}
            degisti={setOlcekVerimi}
            enAz={0}
            enCok={100}
            adim={5}
            bicimle={(deger) => `%${deger}`}
          />
          <SayiAlani
            etiket="Tek akışta ölçülen token hızı"
            deger={tekAkisHizi}
            degisti={setTekAkisHizi}
            birim="token/sn"
            enAz={1}
            adim={5}
            ipucu="Kendi donanımınızda yığın boyutu 1 ile ölçtüğünüz hız. Bileşende gömülü bir model hızı yok; bu alan boş varsayımla doldurulursa tüm sonuçlar varsayım olur."
          />
          <SayiAlani
            etiket="Eşzamanlı kopya"
            deger={kopya}
            degisti={setKopya}
            birim="adet"
            enAz={1}
            adim={1}
            ipucu="Yükü paylaşan eşit yapılandırmalı sunucu kopyası. Yönlendirme maliyeti sıfır sayılıyor."
          />
        </>
      }
      sonuclar={
        <>
          <AnaSonuc
            deger={sayi(hesap.ciktiVerimi)}
            birim="token/sn"
            etiket="Karşılanan çıktı verimi"
          />

          <AnaSonuc
            deger={Number.isFinite(hesap.gecikme) ? paraBirimi(hesap.gecikme, 2) : '—'}
            birim="sn"
            etiket="İstek başına ortalama gecikme"
            ton={hesap.doygun || !Number.isFinite(hesap.gecikme) ? 'uyari' : 'ikincil'}
          />

          <div className="space-y-2.5 rounded-xl border border-kenar bg-yuzey/40 p-5">
            <SonucSatiri etiket="Yığın başına token" deger={sayi(hesap.yiginToken)} />
            <SonucSatiri
              etiket="Kopya başına token hızı"
              deger={`${sayi(hesap.kopyaTokenHizi)} token/sn`}
            />
            <SonucSatiri
              etiket="Tek isteğin akış hızı"
              deger={`${paraBirimi(hesap.akisTokenHizi, 1)} token/sn`}
            />
            <SonucSatiri etiket="Yığın hizmet süresi" deger={sureBicimle(hesap.hizmetSuresi)} />
            <SonucSatiri
              etiket="Kopya başına verim"
              deger={`${paraBirimi(hesap.kopyaVerimi, 2)} istek/sn`}
            />
            <SonucSatiri
              etiket="Toplam kapasite"
              deger={`${paraBirimi(hesap.kapasite, 2)} istek/sn`}
              vurgulu
            />
            <SonucSatiri etiket="Yığın 1'e göre kazanç" deger={`×${paraBirimi(hesap.kazanc, 2)}`} />
            <SonucSatiri
              etiket="Karşılanamayan istek"
              deger={`${paraBirimi(hesap.asan, 2)} istek/sn`}
            />
          </div>

          <div
            className={`rounded-xl border p-5 ${
              hesap.doygun || hesap.doluluk > 0.8
                ? 'border-uyari/30 bg-uyari/8'
                : 'border-kenar bg-yuzey/40'
            }`}
          >
            <p className="etiket-mono mb-3 text-metin-soluk">Doluluk</p>
            <SonucSatiri
              etiket="Gelen hız / kapasite"
              deger={`%${paraBirimi(hesap.doluluk * 100, 1)}`}
              vurgulu
            />
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-yuzey-3">
              <div
                className={`h-full rounded-full ${
                  hesap.doygun || hesap.doluluk > 0.8
                    ? 'bg-uyari'
                    : 'bg-gradient-to-r from-vurgu to-ikincil'
                }`}
                style={{ width: `${dolulukYuzde}%` }}
              />
            </div>
            {hesap.doygun ? (
              <p className="mt-3 text-xs leading-relaxed text-uyari">
                Kapasite gelen hızın altında: kuyruk sınırsız büyür, gecikme bir değere oturmaz.
                Saniyede {paraBirimi(hesap.asan, 2)} isteklik açığı kapatmak için kopya sayısını
                artırın veya istek başına çıktı token&apos;ını düşürün; yığını büyütmek ölçekleme
                verimi %100 olmadığı sürece açığı kapatmaz.
              </p>
            ) : hesap.doluluk > 0.8 ? (
              <p className="mt-3 text-xs leading-relaxed text-uyari">
                Doluluk %80&apos;i geçti. Bu bölgede kuyruk beklemesi hizmet süresinin dört katından
                fazladır ve gelen hızdaki küçük bir artış gecikmeyi katlar. Kopya eklemeden önce baş
                etme payı bırakın: %70 civarı doluluk hedefleyin.
              </p>
            ) : null}
          </div>

          <div className="rounded-xl border border-kenar bg-yuzey/40 p-5">
            <p className="etiket-mono mb-3 text-metin-soluk">Gecikme nereye gidiyor</p>
            {Number.isFinite(hesap.gecikme) ? (
              <OranCubugu
                bolumler={[
                  {
                    ad: 'Yığın dolma beklemesi (ms)',
                    deger: Math.round(hesap.doldurmaBekleme * 1000),
                    renk: 'bg-vurgu',
                  },
                  {
                    ad: 'Kuyruk beklemesi (ms)',
                    deger: Math.round(hesap.kuyrukBekleme * 1000),
                    renk: 'bg-ikincil',
                  },
                  {
                    ad: 'Yığın hizmet süresi (ms)',
                    deger: Math.round(hesap.hizmetSuresi * 1000),
                    renk: 'bg-sinyal',
                  },
                ]}
                toplam={Math.round(hesap.gecikme * 1000)}
              />
            ) : (
              <p className="text-xs leading-relaxed text-metin-ikincil">
                Bu girdilerle gecikme bir sayıya oturmuyor: kapasite gelen hızın altındaysa kuyruk,
                gelen hız sıfırsa yığının dolması sınırsız bekler. Gelen istek hızını yazın ya da
                yığını küçültün.
              </p>
            )}
            {hesap.doldurmaBaskin && Number.isFinite(hesap.doldurmaBekleme) && hesap.cozumVar && (
              <p className="mt-3 text-xs leading-relaxed text-uyari">
                Yığının dolmasını bekleme, yığının işlenmesinden uzun sürüyor. Yığına zaman aşımı
                koyun (dolmasa da gönder) veya yığını küçültün: bu girdilerle gecikmeyi en
                küçükleyen yığın {sayi(hesap.enIyiYigin)} istek.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-kenar bg-yuzey/40 p-5">
            <p className="etiket-mono mb-3 text-metin-soluk">Yığın taraması</p>
            <SonucSatiri
              etiket="Gecikmeyi en küçükleyen yığın"
              deger={hesap.cozumVar ? `${sayi(hesap.enIyiYigin)} istek` : '—'}
              vurgulu
            />
            <SonucSatiri
              etiket="O yığındaki gecikme"
              deger={hesap.cozumVar ? sureBicimle(hesap.enIyiGecikme) : '—'}
            />
            <SonucSatiri etiket="Seçili yığın" deger={`${sayi(hesap.secili)} istek`} />
            <p className="mt-3 text-xs leading-relaxed text-metin-ikincil">
              {hesap.cozumVar
                ? hesap.enIyiYigin === hesap.secili
                  ? 'Seçili yığın, izin verilen aralıkta gecikmeyi en küçükleyen değer. Verim daha büyük yığınla artmaya devam eder; karar gecikme ile verim arasındadır.'
                  : `Tarama 1 ile ${EN_BUYUK_YIGIN} arasındaki yığınları aynı formülle karşılaştırır. Verim büyük yığında daha yüksektir; en küçük gecikme ile en yüksek verim aynı yığında olmak zorunda değil.`
                : 'İzin verilen aralıkta hiçbir yığın gelen hızı karşılamıyor. Önce kopya sayısını artırın, sonra yığını ayarlayın.'}
            </p>
          </div>
        </>
      }
      not={
        <>
          Hesap yalnızca girdiğiniz sayılar üzerinde çalışır; bileşene hiçbir model hızı, fiyatı
          veya ölçüm sonucu gömülmemiştir. Alanların açılış değerleri de ölçüm değil, aracın doygun
          olmayan bir noktada açılması için seçilmiş başlangıç sayılarıdır — kendi ölçtüğünüz
          değerlerle değiştirmeden çıkan sonuç sizin sisteminiz hakkında bir şey söylemez. Tek akış
          token hızı sizin ortamınızda yığın boyutu 1 ile ölçülmüş olmalıdır; ölçekleme verimini iki
          ölçümden çıkarırken kazancı yığın boyutuna bölmeyin, verim = (gözlenen kazanç − 1) ÷
          (yığın boyutu − 1) olur. Üç basitleştirme var: yığın kazancı tek bir verim katsayısıyla
          doğrusal modellenir (gerçekte kazanç yığın büyüdükçe azalır ve bellek bandı doyduğunda
          durur); ön dolum ile kod çözme tek token bütçesinde sayılır (gerçekte ön dolum token
          başına daha hızlıdır, bu yüzden uzun istemli senaryolarda gecikme yukarı doğru şişer); ve
          gecikme üç bileşenin toplamı sayılır, oysa yüklü bir sistemde kuyrukta beklerken yığın da
          dolmaya devam eder — bu iki bekleme kısmen üst üste bindiği için toplam gecikme olduğundan
          yüksek çıkar. Kuyruk beklemesi M/M/1 yaklaşımıyla bulunur: ortalama verir, p95/p99 kuyruğu
          değil. KV önbelleği bellek sınırı, sürekli yığınlama ile statik yığınlama farkı, ağ
          gecikmesi ve hız sınırları hesabın dışındadır.
        </>
      }
    />
  );
}
