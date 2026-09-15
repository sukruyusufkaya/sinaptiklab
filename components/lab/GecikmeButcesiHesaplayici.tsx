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

type AdimAnahtari = 'getirme' | 'siralama' | 'ilkToken' | 'uretim' | 'sonIslem';

/**
 * Darboğaz hangi adımdaysa okura verilecek karar. Metinler mühendislik
 * müdahalesini söyler; hiçbiri "şu model şu kadar hızlı" türü ölçüm iddiası
 * taşımaz — o iddia yalnızca kullanıcının kendi girdiği sayıdan gelir.
 */
const ADIM_OGUDU: Record<AdimAnahtari, string> = {
  getirme:
    'Bütçeyi getirme yiyor. Aday sayısını düşürmek ve filtreyi vektör aramasından önce uygulamak, gömme modelini değiştirmekten önce denenir.',
  siralama:
    'Bütçeyi yeniden sıralama yiyor. Çapraz kodlayıcının gördüğü aday havuzunu küçültmek süreyi doğrudan kısaltır; sıralamayı yalnızca ilk adaylara uygulamak da seçenektir.',
  ilkToken:
    'Bütçeyi ilk token beklemesi yiyor. İstemin sabit kısmını öne alıp istem önbelleğine uygun hale getirmek ve taşınan bağlamı kısaltmak bu payı düşürür.',
  uretim:
    'Bütçeyi üretim yiyor. Çıktı uzunluğunu sınırlamak (zorunlu alanlı şema, madde sayısı sınırı) doğrusal kazanç verir; akışa geçmek toplamı değiştirmez, yalnızca algılanan gecikmeyi düşürür.',
  sonIslem:
    'Bütçeyi son işlem yiyor. Doğrulama, biçimlendirme ve güvenlik süzgeçlerini tek geçişte birleştirmek veya yanıt akarken çalıştırmak gerekir.',
};

const ADIM_RENGI: Record<AdimAnahtari, string> = {
  getirme: 'bg-vurgu',
  siralama: 'bg-ikincil',
  ilkToken: 'bg-sinyal',
  uretim: 'bg-basari',
  sonIslem: 'bg-metin-soluk',
};

export function GecikmeButcesiHesaplayici() {
  // Başlangıç değerleri yalnızca aracın ilk açılışta bir şey göstermesi için
  // konmuş örneklerdir; ölçüm değeri taşımazlar (aşağıdaki not bunu söyler).
  const [butce, setButce] = useState(3000);
  const [getirme, setGetirme] = useState(180);
  const [siralama, setSiralama] = useState(140);
  const [ilkToken, setIlkToken] = useState(600);
  const [tokenSayisi, setTokenSayisi] = useState(320);
  const [uretimHizi, setUretimHizi] = useState(40);
  const [sonIslem, setSonIslem] = useState(90);

  const hesap = useMemo(() => {
    const getirmeMs = Math.max(0, guvenliSayi(getirme));
    const siralamaMs = Math.max(0, guvenliSayi(siralama));
    const ilkTokenMs = Math.max(0, guvenliSayi(ilkToken));
    const sonIslemMs = Math.max(0, guvenliSayi(sonIslem));
    const token = Math.max(0, guvenliSayi(tokenSayisi));

    // Alan boşaltıldığında veya 0 girildiğinde bölme patlamasın diye 1 token/s
    // tabanı uygulanıyor; sonuç abartılı çıkar ama NaN sızmaz.
    const hiz = Math.max(1, guvenliSayi(uretimHizi, 1));

    // Üretim süresi sabit çözme hızı varsayımıyla: token ÷ (token/s) × 1000 ms.
    // İlk token hem "ilk token gecikmesi" payında hem burada sayılıyor; yani
    // toplam bir token süresi (1 ÷ hız saniye) kadar yukarı yuvarlı. Kabul
    // edilmiş bir varsayım: araç bilerek üst sınır tarafında duruyor ve bunu
    // aşağıdaki not ile yazılı olarak söylüyor.
    const uretimMs = (token / hiz) * 1000;

    const getirmeAdimi = { anahtar: 'getirme' as const, ad: 'Getirme', ms: getirmeMs };
    const siralamaAdimi = { anahtar: 'siralama' as const, ad: 'Yeniden sıralama', ms: siralamaMs };
    const ilkTokenAdimi = {
      anahtar: 'ilkToken' as const,
      ad: 'İlk token beklemesi',
      ms: ilkTokenMs,
    };
    const uretimAdimi = { anahtar: 'uretim' as const, ad: 'Üretim', ms: uretimMs };
    const sonIslemAdimi = { anahtar: 'sonIslem' as const, ad: 'Son işlem', ms: sonIslemMs };

    const adimlar = [getirmeAdimi, siralamaAdimi, ilkTokenAdimi, uretimAdimi, sonIslemAdimi];

    // Adımlar seri çalışıyor varsayılıyor: örtüşme yok, bu yüzden uçtan uca
    // süre payların basit toplamıdır.
    const toplam = adimlar.reduce((birikim, adim) => birikim + adim.ms, 0);

    // Akışlı arayüzde kullanıcı ilk tokeni görene kadar bekler; üretimin kalanı
    // ve son işlem bu beklemeye girmez.
    const ilkTokeneKadar = getirmeMs + siralamaMs + ilkTokenMs;

    // Üretim dışındaki paylar çıktı uzunluğundan bağımsızdır; bütçeye sığma
    // hesabının değiştirilemez tabanı budur. Toplamdan çıkarmak yerine doğrudan
    // toplanıyor: kayan nokta artığı `sabitPay >= butceMs` eşiğini kaydırmasın.
    const sabitPay = getirmeMs + siralamaMs + ilkTokenMs + sonIslemMs;

    const butceMs = Math.max(1, guvenliSayi(butce, 1));
    const butceKullanim = (toplam / butceMs) * 100;
    const kalan = butceMs - toplam;

    // Sabit paylar bütçeyi tek başına doldurduysa hızı artırmak çözüm değildir;
    // bu durumda gereken hız tanımsız bırakılıyor.
    const uretimeKalanMs = butceMs - sabitPay;
    const gerekenHiz = uretimeKalanMs > 0 && token > 0 ? token / (uretimeKalanMs / 1000) : null;

    // Aynı bütçeyi mevcut hızla tutmak için çıktının inmesi gereken uzunluk.
    const sigacakToken = uretimeKalanMs > 0 ? (uretimeKalanMs / 1000) * hiz : 0;

    const darbogaz = adimlar.reduce(
      (enBuyuk, adim) => (adim.ms > enBuyuk.ms ? adim : enBuyuk),
      getirmeAdimi,
    );

    return {
      adimlar,
      toplam,
      ilkTokeneKadar,
      uretimMs,
      sabitPay,
      butceMs,
      butceKullanim,
      kalan,
      gerekenHiz,
      sigacakToken,
      darbogaz,
      darbogazPayi: toplam > 0 ? (darbogaz.ms / toplam) * 100 : 0,
      asildi: toplam > butceMs,
      sabitPayButceyiDolduruyor: sabitPay >= butceMs,
    };
  }, [butce, getirme, siralama, ilkToken, tokenSayisi, uretimHizi, sonIslem]);

  return (
    <HesapDuzeni
      girdiler={
        <>
          <SayiAlani
            etiket="Gecikme bütçesi"
            deger={butce}
            degisti={setButce}
            birim="ms"
            enAz={1}
            adim={100}
            ipucu="Ürün tarafında söz verilen üst sınır. Bu sayı bir ölçüm değil, sizin kabul ettiğiniz hedeftir."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SayiAlani
              etiket="Getirme (retrieval)"
              deger={getirme}
              degisti={setGetirme}
              birim="ms"
              adim={10}
            />
            <SayiAlani
              etiket="Yeniden sıralama"
              deger={siralama}
              degisti={setSiralama}
              birim="ms"
              adim={10}
            />
          </div>
          <SayiAlani
            etiket="İlk token gecikmesi"
            deger={ilkToken}
            degisti={setIlkToken}
            birim="ms"
            adim={50}
            ipucu="İstem gönderildikten sonra ilk tokenin dönmesine kadar geçen süre; kendi izleme kaydınızdan girin."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SayiAlani
              etiket="Üretilecek token"
              deger={tokenSayisi}
              degisti={setTokenSayisi}
              birim="adet"
              adim={20}
            />
            <SayiAlani
              etiket="Üretim hızı"
              deger={uretimHizi}
              degisti={setUretimHizi}
              birim="token/s"
              enAz={1}
              adim={5}
              ipucu="Çözme hızı; yanıt boyunca sabit kabul edilir. Alan boş kalırsa hesap 1 token/s tabanına düşer."
            />
          </div>
          <SayiAlani
            etiket="Son işlem"
            deger={sonIslem}
            degisti={setSonIslem}
            birim="ms"
            adim={10}
            ipucu="Şema doğrulama, alıntı eşleme, güvenlik süzgeci ve biçimlendirme için harcanan süre."
          />
        </>
      }
      sonuclar={
        <>
          <AnaSonuc
            deger={paraBirimi(hesap.toplam / 1000, 2)}
            birim="s"
            etiket="Uçtan uca gecikme (tam yanıt)"
            ton={hesap.asildi ? 'uyari' : 'vurgu'}
          />

          <div className="space-y-2.5 rounded-xl border border-kenar bg-yuzey/40 p-5">
            {hesap.adimlar.map((adim) => (
              <SonucSatiri
                key={adim.anahtar}
                etiket={adim.ad}
                deger={`${sayi(adim.ms)} ms · %${paraBirimi(
                  hesap.toplam > 0 ? (adim.ms / hesap.toplam) * 100 : 0,
                  1,
                )}`}
              />
            ))}
            <SonucSatiri etiket="Toplam" deger={`${sayi(hesap.toplam)} ms`} vurgulu />
            <SonucSatiri
              etiket="İlk tokene kadar (akışlı algı)"
              deger={`${sayi(hesap.ilkTokeneKadar)} ms`}
            />
          </div>

          <div className="rounded-xl border border-kenar bg-yuzey/40 p-5">
            <p className="etiket-mono mb-3.5 text-metin-soluk">Bütçe dağılımı (ms)</p>
            <OranCubugu
              toplam={hesap.toplam}
              bolumler={hesap.adimlar.map((adim) => ({
                ad: adim.ad,
                deger: Math.round(adim.ms),
                renk: ADIM_RENGI[adim.anahtar],
              }))}
            />
          </div>

          <div
            className={`rounded-xl border p-5 ${
              hesap.asildi ? 'border-uyari/30 bg-uyari/8' : 'border-basari/30 bg-basari/8'
            }`}
          >
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="text-xs text-metin-ikincil">Bütçe kullanımı</span>
              <span className="font-mono text-sm tabular-nums">
                %{paraBirimi(hesap.butceKullanim, 1)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-yuzey-3">
              <div
                className={`h-full rounded-full ${
                  hesap.asildi ? 'bg-uyari' : 'bg-gradient-to-r from-vurgu to-ikincil'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, hesap.butceKullanim))}%` }}
              />
            </div>
            <p className="mt-3 text-[0.8125rem] leading-relaxed text-metin-ikincil">
              {hesap.asildi
                ? `Bütçe ${sayi(Math.abs(hesap.kalan))} ms aşılıyor.`
                : `Bütçede ${sayi(hesap.kalan)} ms pay kalıyor.`}
            </p>
          </div>

          <div className="rounded-xl border border-kenar bg-yuzey/40 p-5">
            <p className="etiket-mono mb-2 text-metin-soluk">Darboğaz</p>
            {hesap.toplam > 0 ? (
              <>
                <p className="text-sm leading-relaxed text-metin">
                  {hesap.darbogaz.ad} · {sayi(hesap.darbogaz.ms)} ms (toplamın %
                  {paraBirimi(hesap.darbogazPayi, 1)}&apos;i)
                </p>
                <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-metin-ikincil">
                  {ADIM_OGUDU[hesap.darbogaz.anahtar]}
                </p>
              </>
            ) : (
              // Bütün paylar sıfırken en büyük pay da sıfırdır; o durumda bir
              // adımı darboğaz ilan etmek okura yanlış bilgi verir.
              <p className="text-[0.8125rem] leading-relaxed text-metin-ikincil">
                Bütün paylar sıfır. Darboğaz, adım süreleri girildikten sonra belirlenir.
              </p>
            )}
          </div>

          {hesap.asildi && (
            <div className="rounded-xl border border-uyari/30 bg-uyari/8 p-5">
              <p className="etiket-mono mb-2 text-uyari">Bütçeye sığmak için</p>
              {hesap.sabitPayButceyiDolduruyor ? (
                <p className="text-[0.8125rem] leading-relaxed text-metin-ikincil">
                  Üretim dışı paylar ({sayi(hesap.sabitPay)} ms) bütçeyi tek başına dolduruyor.
                  Çıktıyı kısaltmak veya hızlı bir model seçmek bu durumda yetmez; getirme, yeniden
                  sıralama veya son işlem adımlarından biri kaldırılmalı ya da bütçe yeniden
                  konuşulmalı.
                </p>
              ) : (
                <ul className="space-y-1.5 text-[0.8125rem] leading-relaxed text-metin-ikincil">
                  <li>
                    Aynı çıktı uzunluğunda gereken üretim hızı:{' '}
                    <span className="font-mono text-metin tabular-nums">
                      {hesap.gerekenHiz === null
                        ? '—'
                        : `${paraBirimi(hesap.gerekenHiz, 1)} token/s`}
                    </span>
                  </li>
                  <li>
                    Aynı hızda sığacak çıktı uzunluğu:{' '}
                    <span className="font-mono text-metin tabular-nums">
                      {sayi(hesap.sigacakToken)} token
                    </span>
                  </li>
                  <li>
                    Akışa geçmek toplamı kısaltmaz; kullanıcının gördüğü ilk yanıt süresini{' '}
                    {sayi(hesap.ilkTokeneKadar)} ms&apos;ye indirir.
                  </li>
                </ul>
              )}
            </div>
          )}
        </>
      }
      not={
        <>
          Hesap, adımların seri çalıştığını ve üretim hızının yanıt boyunca sabit kaldığını
          varsayar; adımların bir kısmı paralelleşiyorsa toplam olduğundan yüksek çıkar. İlk token
          hem ilk token gecikmesi payında hem üretim payında sayıldığı için toplam, bir token süresi
          (1 ÷ hız saniye) kadar yukarı yuvarlıdır — araç bilerek üst sınır tarafında durur.
          Alanlardaki başlangıç sayıları yalnızca aracın çalıştığını göstermek için konmuş
          örneklerdir — her değeri kendi izleme kaydınızdan girin. Alan boş bırakılırsa bölme
          patlamasın diye hız 1 token/s, bütçe 1 ms tabanına düşer; o anda ekranda duran sonuç
          anlamlı değildir. Yüzdelikler toplanamaz: her adıma p95 girerseniz çıkan toplam, uçtan uca
          p95 değil ondan yüksek bir üst sınırdır. Kuyruk bekleme, hız sınırı yeniden denemeleri ve
          soğuk başlatma bu bütçeye dahil değildir.
        </>
      }
    />
  );
}
