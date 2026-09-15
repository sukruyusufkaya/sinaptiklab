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
 * Yeniden sıralamanın (reranking) bağlam yükü ve gecikme üzerindeki etkisi.
 *
 * Karşılaştırma tabanı bilinçli olarak şudur: yeniden sıralayıcı yokken aday
 * havuzunun tamamı modele verilir — havuzu güvenle kırpacak bir sıralama
 * sinyali olmadığı için. Yeniden sıralayıcı varken yalnızca ilk k parça gider.
 * Araç bu iki durumun token ve süre farkını hesaplar; sıralama kalitesini
 * (geri çağırma, isabet) ölçmez.
 *
 * Bileşene hiçbir model ölçümü gömülmez: aday başına sıralama süresi ve ön
 * dolum hızı kullanıcının kendi kurulumunda ölçtüğü değerlerdir.
 */

export function YenidenSiralamaEtkisi() {
  const [adayHavuzu, setAdayHavuzu] = useState(50);
  const [nihaiSecim, setNihaiSecim] = useState(5);
  const [parcaToken, setParcaToken] = useState(700);
  const [adayGecikmesi, setAdayGecikmesi] = useState(2.5);
  const [onDolumHizi, setOnDolumHizi] = useState(1200);
  const [baglamPenceresi, setBaglamPenceresi] = useState(32000);

  const hesap = useMemo(() => {
    // Aday ve seçim adet olduğu için tam sayıya yuvarlanır; en az bir aday gerekir.
    const aday = Math.max(1, Math.round(guvenliSayi(adayHavuzu, 1)));
    const istenenSecim = Math.max(1, Math.round(guvenliSayi(nihaiSecim, 1)));
    // Seçim havuzdan büyük olamaz; büyük girilirse sıralama yalnızca sıra değiştirir.
    const secim = Math.min(aday, istenenSecim);
    const secimTasti = istenenSecim > aday;

    const parca = Math.max(1, guvenliSayi(parcaToken, 700));
    const adayMs = Math.max(0, guvenliSayi(adayGecikmesi, 0));
    // Sıfır hız sonsuz süre demek olurdu; alt sınır 1 token/s.
    const hiz = Math.max(1, guvenliSayi(onDolumHizi, 1));
    const pencere = Math.max(1, guvenliSayi(baglamPenceresi, 1));

    // Tüm parçalar eşit uzunlukta varsayılır: yük = adet × parça uzunluğu.
    const havuzToken = aday * parca;
    const secilenToken = secim * parca;
    const elenenToken = havuzToken - secilenToken;
    const tasarrufOrani = havuzToken > 0 ? elenenToken / havuzToken : 0;
    // Değerlendirme genişliği: modele giden her parça için kaç aday puanlanıyor.
    const genislik = aday / secim;

    // Yeniden sıralayıcı her adayı ayrı ayrı puanlar; süre aday sayısıyla doğrusal.
    const siralamaSuresi = aday * adayMs;
    // Elenen tokenlar ön dolumdan tümüyle düşer: kazanç = elenen token / hız.
    const onDolumKazanci = (elenenToken / hiz) * 1000;
    const netto = siralamaSuresi - onDolumKazanci;

    // Tek bir parçayı elemenin kazandırdığı süre; iki eşiğin de ortak birimi.
    const parcaBasiKazanc = (parca / hiz) * 1000;

    // Başa baş parça uzunluğu (alt eşik): netto = 0'ın parça için çözümü.
    // Parça bundan uzunsa eleme kazancı puanlama maliyetini aşar. Havuz
    // kırpılmıyorsa (aday = secim) eleme kazancı sıfır olduğu için eşik yok.
    const basaBasParca = aday > secim ? (aday * adayMs * hiz) / (1000 * (aday - secim)) : null;

    // Başa baş top-k (üst eşik): netto = 0'ın seçim için çözümü,
    // secim* = aday × (1 − adayMs / parcaBasiKazanc). Bir adayı puanlamak bir
    // parçayı elemekten pahalıysa hiçbir top-k değeri hesabı çevirmez.
    const basaBasSecim = parcaBasiKazanc > adayMs ? aday * (1 - adayMs / parcaBasiKazanc) : null;

    // Eşik kesirli çıkar, kullanıcı ise tam sayı top-k girer; okura verilecek
    // sayı eşiğin kendisi değil, doğru yöne yuvarlanmış hâli olmalı. Net kazanç
    // koşulu secim < basaBasSecim olduğu için kazançlı en büyük tam sayı
    // ceil(eşik) − 1'dir: eşiğe eşit seçim nettoyu sıfırlar, kazanca çevirmez.
    // Zarar etmeyen (netto ≤ 0) en büyük tam sayı ise floor(eşik).
    const kazancliSecim = basaBasSecim === null ? null : Math.ceil(basaBasSecim) - 1;
    const zararsizSecim = basaBasSecim === null ? null : Math.floor(basaBasSecim);

    const havuzKullanim = (havuzToken / pencere) * 100;
    const secilenKullanim = (secilenToken / pencere) * 100;
    // Pencereye kaç parça sığar: taşma uyarısında somut bir hedef vermek için.
    const sigacakParca = Math.floor(pencere / parca);

    return {
      aday,
      secim,
      secimTasti,
      havuzToken,
      secilenToken,
      elenenToken,
      tasarrufOrani,
      genislik,
      siralamaSuresi,
      onDolumKazanci,
      netto,
      parcaBasiKazanc,
      basaBasParca,
      kazancliSecim,
      zararsizSecim,
      havuzKullanim,
      secilenKullanim,
      sigacakParca,
    };
  }, [adayHavuzu, nihaiSecim, parcaToken, adayGecikmesi, onDolumHizi, baglamPenceresi]);

  const nettoIsaret = hesap.netto > 0 ? '+' : hesap.netto < 0 ? '−' : '';

  return (
    <HesapDuzeni
      girdiler={
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <SayiAlani
              etiket="Aday havuzu (top-n)"
              deger={adayHavuzu}
              degisti={setAdayHavuzu}
              birim="parça"
              enAz={1}
              adim={5}
              ipucu="Vektör aramasının yeniden sıralayıcıya verdiği aday sayısı."
            />
            <SayiAlani
              etiket="Nihai seçim (top-k)"
              deger={nihaiSecim}
              degisti={setNihaiSecim}
              birim="parça"
              enAz={1}
              ipucu="Sıralamadan sonra modele giden parça sayısı."
            />
          </div>
          <KaydirmaAlani
            etiket="Parça uzunluğu"
            deger={parcaToken}
            degisti={setParcaToken}
            enAz={100}
            enCok={2000}
            adim={50}
            bicimle={(deger) => `${sayi(deger)} token`}
          />
          <SayiAlani
            etiket="Aday başına sıralama süresi"
            deger={adayGecikmesi}
            degisti={setAdayGecikmesi}
            birim="ms"
            enAz={0}
            adim={0.5}
            ipucu="Kendi kurulumunuzda ölçtüğünüz değer. Burada gömülü bir yeniden sıralayıcı ölçümü yok."
          />
          <SayiAlani
            etiket="Ön dolum hızı"
            deger={onDolumHizi}
            degisti={setOnDolumHizi}
            birim="token/s"
            enAz={1}
            adim={100}
            ipucu="Modelin istemi işleme hızı — sağlayıcı iddiası değil, sizin ölçümünüz."
          />
          <SayiAlani
            etiket="Model bağlam penceresi"
            deger={baglamPenceresi}
            degisti={setBaglamPenceresi}
            birim="token"
            enAz={1}
            adim={1000}
            ipucu="Yalnızca havuzun pencereye sığıp sığmadığını görmek için kullanılır."
          />
        </>
      }
      sonuclar={
        <>
          <AnaSonuc
            deger={`${nettoIsaret}${sayi(Math.abs(hesap.netto))}`}
            birim="ms"
            etiket="Uçtan uca gecikme değişimi"
            ton={hesap.netto > 0 ? 'uyari' : hesap.netto < 0 ? 'sinyal' : 'ikincil'}
          />

          <div className="space-y-2.5 rounded-xl border border-kenar bg-yuzey/40 p-5">
            <SonucSatiri
              etiket="Sıralama yok: havuzun tamamı"
              deger={`${sayi(hesap.havuzToken)} token`}
            />
            <SonucSatiri
              etiket="Sıralama var: seçilen parçalar"
              deger={`${sayi(hesap.secilenToken)} token`}
              vurgulu
            />
            <SonucSatiri
              etiket="Bağlamdan düşen yük"
              deger={`${sayi(hesap.elenenToken)} token (%${paraBirimi(hesap.tasarrufOrani * 100, 1)})`}
            />
            <SonucSatiri
              etiket="Değerlendirme genişliği"
              deger={`${paraBirimi(hesap.genislik, 1)} aday / parça`}
            />
            <SonucSatiri
              etiket="Pencere kullanımı (seçilen)"
              deger={`%${paraBirimi(hesap.secilenKullanim, 1)}`}
            />
          </div>

          <div className="rounded-xl border border-kenar bg-yuzey/40 p-5">
            <p className="etiket-mono mb-3 text-metin-soluk">Havuzun dağılımı</p>
            <OranCubugu
              bolumler={[
                { ad: 'Modele giden (top-k)', deger: hesap.secilenToken, renk: 'bg-vurgu' },
                { ad: 'Sıralamada elenen', deger: hesap.elenenToken, renk: 'bg-metin-soluk' },
              ]}
              toplam={hesap.havuzToken}
            />
            {hesap.secilenKullanim > 100 && (
              <p className="mt-3 text-xs leading-relaxed text-uyari">
                Seçilen parçalar tek başına bağlam penceresini aşıyor (%
                {paraBirimi(hesap.secilenKullanim, 0)}). İstem modele hiç ulaşmadığı için yukarıdaki
                süre hesabının karşılığı yok:{' '}
                {hesap.sigacakParca >= 1
                  ? `top-k en çok ${sayi(hesap.sigacakParca)} parça olabilir`
                  : 'tek bir parça bile pencereye sığmıyor, parça uzunluğunu düşürmek gerekir'}
                .
              </p>
            )}
            {hesap.secilenKullanim <= 100 && hesap.havuzKullanim > 100 && (
              <p className="mt-3 text-xs leading-relaxed text-uyari">
                Aday havuzu tek başına bağlam penceresini aşıyor (%
                {paraBirimi(hesap.havuzKullanim, 0)}). Havuzun tamamını verme tabanı bu pencerede
                uygulanamadığı için hesaplanan kazanç bir iyileştirme değil, havuzu modele
                sığdırmanın koşulu: ya top-k düşürülür ya havuz küçültülür.
              </p>
            )}
            {hesap.secimTasti && (
              <p className="mt-3 text-xs leading-relaxed text-uyari">
                Nihai seçim aday havuzundan büyük girildi; hesap {sayi(hesap.secim)} parça ile
                yapıldı. Havuzun tamamı modele gidiyorsa yeniden sıralama yük düşürmez, yalnızca
                parçaların sırasını değiştirir.
              </p>
            )}
          </div>

          <div
            className={`rounded-xl border p-5 ${
              hesap.netto > 0 ? 'border-uyari/30 bg-uyari/8' : 'border-kenar bg-yuzey/40'
            }`}
          >
            <p className="etiket-mono mb-3 text-metin-soluk">Süre bütçesi</p>
            <SonucSatiri
              etiket="Sıralamanın eklediği"
              deger={`+${sayi(hesap.siralamaSuresi)} ms`}
            />
            <SonucSatiri
              etiket="Ön dolumdan kazanılan"
              deger={`−${sayi(hesap.onDolumKazanci)} ms`}
            />
            <SonucSatiri
              etiket="Bir parça elemenin kazancı"
              deger={`${paraBirimi(hesap.parcaBasiKazanc, 1)} ms`}
            />
            <SonucSatiri
              etiket="Başa baş parça uzunluğu (alt eşik)"
              deger={
                hesap.basaBasParca === null
                  ? '—'
                  : `${
                      hesap.basaBasParca < 10
                        ? paraBirimi(hesap.basaBasParca, 1)
                        : sayi(hesap.basaBasParca)
                    } token`
              }
            />
            <SonucSatiri
              etiket="Başa baş top-k (üst eşik)"
              deger={
                hesap.zararsizSecim === null || hesap.zararsizSecim < 1
                  ? '—'
                  : `${sayi(hesap.zararsizSecim)} parça`
              }
            />

            {hesap.netto > 0 && hesap.kazancliSecim !== null && hesap.kazancliSecim >= 1 && (
              <p className="mt-3 text-xs leading-relaxed text-uyari">
                Puanlama maliyeti, elemenin kazancını aşıyor: bu havuzda yeniden sıralama yeterince
                parça düşürmüyor. Top-k değerini {sayi(hesap.kazancliSecim)} parçaya indirmek hesabı
                net kazanca çevirir; seçimi daraltmak istemiyorsanız bu havuz genişliğinde
                sıralamanın gerekçesi süre değil, kalite olmalı.
              </p>
            )}
            {hesap.netto > 0 && (hesap.kazancliSecim === null || hesap.kazancliSecim < 1) && (
              <p className="mt-3 text-xs leading-relaxed text-uyari">
                Bir parçayı elemek {paraBirimi(hesap.parcaBasiKazanc, 1)} ms kazandırırken bir adayı
                puanlamak daha pahalıya geliyor; hiçbir top-k değeri bu dengeyi çevirmez. Aday
                başına sıralama süresini düşürmek (daha küçük sıralayıcı, toplu puanlama) ya da daha
                uzun parçalarla çalışmak gerekir.
              </p>
            )}
            {hesap.netto <= 0 && hesap.zararsizSecim !== null && hesap.zararsizSecim >= 1 && (
              <p className="mt-3 text-xs leading-relaxed text-metin-ikincil">
                Eleme, puanlama maliyetini karşılıyor. Aynı havuzda top-k{' '}
                {sayi(hesap.zararsizSecim)} parçaya kadar açılsa bile hesap süre tarafında net kayba
                geçmez; kalite tarafını ayrıca ölçmek gerekir.
              </p>
            )}
          </div>
        </>
      }
      not={
        <>
          Hesap üç varsayıma dayanır: parçalar eşit uzunlukta, sıralama süresi aday sayısıyla
          doğrusal (toplu puanlama veya paralellik yok) ve ön dolum süresi token sayısıyla doğrusal
          — istem ön eki önbelleğe alınıyorsa gerçek kazanç bu hesaptan küçük kalır. Karşılaştırma
          tabanı, yeniden sıralayıcı yokken aday havuzunun tamamının modele verilmesidir; havuzu
          körlemesine kırpan bir kurulumla karşılaştırıldığında tasarruf bundan küçüktür. Vektör
          aramasının kendi süresi iki durumda da aynı olduğu için hesaba girmez. Araç yalnızca token
          ve süre bütçesini ölçer: yeniden sıralamanın doğru parçayı ilk k içine taşıyıp taşımadığı,
          yani geri çağırma ve isabet, burada ölçülmez. Formdaki başlangıç sayıları yalnızca formun
          boş durmaması içindir; hiçbiri ölçülmüş bir model ya da sıralayıcı değeri değildir.
        </>
      }
    />
  );
}
