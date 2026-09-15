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

type KayitTuru = 'uygulama' | 'istem' | 'erisim' | 'form';
type VeriDurumu = 'iceriyor' | 'takmaAdli' | 'yok';

/*
 * Kayıt türlerinin `ortalamaBayt` değerleri ölçüm değil, başlangıç
 * varsayımıdır: bir kurumun kendi kayıt şeması bunu iki katına da çıkarır,
 * yarıya da indirir. Bu yüzden alan salt okunur değil — tür seçimi yalnızca
 * "Kayıt başına boyut" alanına bir başlangıç değeri yazar, kullanıcı üzerine
 * kendi ortalamasını girer.
 */
const KAYIT_TURLERI: Record<KayitTuru, { ad: string; ortalamaBayt: number; not: string }> = {
  uygulama: {
    ad: 'Uygulama günlüğü (JSON satırı)',
    ortalamaBayt: 800,
    not: 'Hata ayıklama amacı kısa sürede tükenir; saklama süresini bu amacın ne zaman bittiğine göre gerekçelendirin.',
  },
  istem: {
    ad: 'İstem ve yanıt kaydı',
    ortalamaBayt: 4000,
    not: 'Kullanıcının yazdığı metin kişisel veri taşıyabilir; bu tablodaki başlangıç varsayımları içinde en büyük boyut da buna verilmiştir.',
  },
  erisim: {
    ad: 'Erişim / denetim kaydı',
    ortalamaBayt: 500,
    not: 'Denetim izi güvenlik gereği tutulur; süreyi kısaltmadan önce kendi yükümlülüğünüzü kontrol edin.',
  },
  form: {
    ad: 'Form ve başvuru kaydı',
    ortalamaBayt: 2000,
    not: 'Kimlik alanları doğrudan tanımlayıcıdır; amaç bittiğinde silme veya anonimleştirme gerekir.',
  },
};

/*
 * Kişisel veri durumu hesabın kendisini değiştirmez; hacim aynıdır. Neyi
 * değiştirdiği yorumdur: kişisel veride fazla tutulan gün bir uyum riski,
 * kişisel olmayan veride yalnızca bir depolama gideridir.
 */
const VERI_DURUMLARI: Record<VeriDurumu, { ad: string; kisisel: boolean; not: string }> = {
  iceriyor: {
    ad: 'Doğrudan kişisel veri içeriyor',
    kisisel: true,
    not: 'Veri minimizasyonu ilkesi saklama süresinin amaçla sınırlı olmasını gerektirir: politikanın ötesinde geçen her gün gerekçesiz tutulan gündür.',
  },
  takmaAdli: {
    ad: 'Takma adlı (kimlik ayrı tutuluyor)',
    kisisel: true,
    not: 'Takma ad kaydı kişisel veri olmaktan çıkarmaz; eşleştirme tablosu duruyorsa saklama süresi o tablo için de geçerlidir.',
  },
  yok: {
    ad: 'Kişisel veri içermiyor',
    kisisel: false,
    not: 'Kişisel veri yoksa saklama süresi bir uyum sorusu değil, depolama gideri ve sorgu maliyeti sorusudur.',
  },
};

/*
 * Hacmi okunur büyüklüğe çevirir; MB altındaki gürültüyü göstermenin faydası yok.
 * Sonlu olmayan değere (girdi taşması, boş alan) "0 MB" yazmak hesabın bir şey
 * ölçtüğü izlenimini verirdi; bu yüzden tire basılır ve birim gizlenir.
 */
function hacimParcala(bayt: number): { deger: string; birim: string } {
  if (!Number.isFinite(bayt)) return { deger: '—', birim: '' };
  if (bayt <= 0) return { deger: '0', birim: 'MB' };
  const gb = bayt / 1024 ** 3;
  if (gb >= 1024) return { deger: paraBirimi(gb / 1024, 2), birim: 'TB' };
  if (gb >= 1) return { deger: paraBirimi(gb, 2), birim: 'GB' };
  return { deger: paraBirimi(bayt / 1024 ** 2, 1), birim: 'MB' };
}

function hacimMetni(bayt: number): string {
  const parca = hacimParcala(bayt);
  return parca.birim ? `${parca.deger} ${parca.birim}` : parca.deger;
}

export function SaklamaTakvimiHesaplayici() {
  const [tur, setTur] = useState<KayitTuru>('istem');
  const [gunlukKayit, setGunlukKayit] = useState(50000);
  const [kayitBayt, setKayitBayt] = useState(KAYIT_TURLERI.istem.ortalamaBayt);
  const [saklamaGun, setSaklamaGun] = useState(180);
  const [veriDurumu, setVeriDurumu] = useState<VeriDurumu>('iceriyor');
  const [kopya, setKopya] = useState(3);
  const [silmeAralik, setSilmeAralik] = useState(30);

  const hesap = useMemo(() => {
    const turTanimi = KAYIT_TURLERI[tur];
    const durumTanimi = VERI_DURUMLARI[veriDurumu];

    const gunluk = Math.max(0, guvenliSayi(gunlukKayit));
    const bayt = Math.max(1, guvenliSayi(kayitBayt, turTanimi.ortalamaBayt));
    const politikaGun = Math.max(1, guvenliSayi(saklamaGun, 180));
    // Kopya sayısı ve silme aralığı tam sayı olmak zorunda; 0 aralık sonsuz döngü demek.
    const kopyaSayisi = Math.max(1, Math.round(guvenliSayi(kopya, 1)));
    const silmeGun = Math.max(1, Math.round(guvenliSayi(silmeAralik, 1)));

    /*
     * Asıl mesele: politika süresi bitince kayıt anında gitmez, bir sonraki
     * silme işini bekler. İşten hemen sonra süresi dolan kayıt en kötü
     * durumda silmeGun - 1 gün daha yaşar. Politikada yazan süre ile gerçek
     * saklama süresi arasındaki fark budur.
     */
    const fazlaGun = silmeGun - 1;
    const enUzunYasam = politikaGun + fazlaGun;

    /*
     * Durağan durum: her gün `gunluk` kayıt girer, silme işi çalıştığında
     * biriken en yaşlı günler birlikte gider. Hacim sonsuza gitmez, iki iş
     * arasında salınan bir platoya oturur. Buradaki sayı platonun TEPESİDİR:
     * işten hemen önce depoda politikaGun + silmeGun - 1 günlük kayıt durur,
     * iş sonrasında taban politikaKayit'e iner. Kapasite kararı tepeye göre
     * verildiği için gösterilen değer tepedir.
     */
    const politikaKayit = gunluk * politikaGun;
    const fazlaKayit = gunluk * fazlaGun;
    const duraganKayit = politikaKayit + fazlaKayit;

    // Silme yükümlülüğü yedekleri de kapsar: hacim kopya sayısıyla çarpılır.
    const birincilBayt = duraganKayit * bayt;
    const toplamBayt = birincilBayt * kopyaSayisi;
    const yedekBayt = toplamBayt - birincilBayt;
    const politikaBayt = politikaKayit * bayt * kopyaSayisi;
    const fazlaBayt = fazlaKayit * bayt * kopyaSayisi;

    // Plato öncesi günlük artış: silme başlamadan önce depo bu hızla büyür.
    const gunlukArtisBayt = gunluk * bayt * kopyaSayisi;

    /*
     * İlk silme: politikaGun gününde süresi dolan kayıt, takvimin o günden
     * sonraki ilk iş çalışmasında gider. İş günü silmeGun'ün katlarına denk
     * geldiği için yukarı yuvarlanır.
     */
    const ilkSilmeGunu = Math.ceil(politikaGun / silmeGun) * silmeGun;
    const partiKayit = gunluk * silmeGun;
    const partiBayt = partiKayit * bayt * kopyaSayisi;
    const yillikIsSayisi = Math.floor(365 / silmeGun);

    // Fazla tutulan günün toplam yaşam süresi içindeki payı — uyarı eşiği bu.
    const fazlaPay = enUzunYasam > 0 ? fazlaGun / enUzunYasam : 0;

    /*
     * Minimizasyon karşılaştırması: politika süresi yarıya inerse politika
     * penceresindeki kaydın yarısı depodan düşer. Silme gecikmesinden kalan
     * pay değişmediği için ona dokunulmaz.
     */
    const yariSureKazanci = politikaBayt / 2;

    return {
      turTanimi,
      durumTanimi,
      politikaGun,
      silmeGun,
      kopyaSayisi,
      fazlaGun,
      enUzunYasam,
      politikaKayit,
      fazlaKayit,
      duraganKayit,
      toplamBayt,
      yedekBayt,
      politikaBayt,
      fazlaBayt,
      gunlukArtisBayt,
      ilkSilmeGunu,
      partiKayit,
      partiBayt,
      yillikIsSayisi,
      fazlaPay,
      yariSureKazanci,
      /*
       * Eşik iki durumda da aynı: fazla tutulan pay tepe hacmin onda birini
       * geçtiğinde yapılacak ilk iş silme aralığını düşürmektir. Ayrım
       * yorumdadır — kişisel veride bunun adı uyum riski (uyarı tonu),
       * dışında yalnızca depolama gideri.
       */
      gecikmeBelirgin: fazlaPay > 0.1,
      gecikmeUyarisi: durumTanimi.kisisel && fazlaPay > 0.1,
    };
  }, [tur, gunlukKayit, kayitBayt, saklamaGun, veriDurumu, kopya, silmeAralik]);

  const toplamHacim = hacimParcala(hesap.toplamBayt);

  /*
   * Oran çubuğu tek bir birimle çalışmak zorunda; hacim GB'a çıktığında MB
   * göstermek altı haneli sayı demek. Birim toplama göre seçilir ki iki bölüm
   * aynı ölçekte kalsın. Tam sayı yerine iki basamak: MB altındaki paylar
   * çubuktan tamamen kaybolmasın.
   */
  const dagilimBirimi =
    hesap.toplamBayt >= 1024 ** 3 ? { ad: 'GB', bolen: 1024 ** 3 } : { ad: 'MB', bolen: 1024 ** 2 };
  const dagilimOlcegi = (bayt: number) =>
    Number.isFinite(bayt) ? Number((bayt / dagilimBirimi.bolen).toFixed(2)) : 0;

  return (
    <HesapDuzeni
      girdiler={
        <>
          <SecimAlani
            etiket="Kayıt türü"
            deger={tur}
            degisti={(yeni) => {
              setTur(yeni);
              setKayitBayt(KAYIT_TURLERI[yeni].ortalamaBayt);
            }}
            secenekler={(Object.keys(KAYIT_TURLERI) as KayitTuru[]).map((anahtar) => ({
              deger: anahtar,
              ad: KAYIT_TURLERI[anahtar].ad,
            }))}
            ipucu={KAYIT_TURLERI[tur].not}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SayiAlani
              etiket="Günlük kayıt hacmi"
              deger={gunlukKayit}
              degisti={setGunlukKayit}
              birim="kayıt/gün"
              adim={1000}
            />
            <SayiAlani
              etiket="Kayıt başına boyut"
              deger={kayitBayt}
              degisti={setKayitBayt}
              birim="bayt"
              enAz={1}
              adim={100}
              ipucu={`Tür için başlangıç değeri ~${sayi(KAYIT_TURLERI[tur].ortalamaBayt)} bayt varsayılıyor; kendi ortalamanızı girin.`}
            />
          </div>
          {/* Adım 5 gün: 30, 90, 180, 365, 730 ve 1095 gibi politika değerlerinin
              hepsi ızgaraya düşsün. Adım 7 iken başlangıç değeri 180, çubukta
              bir daha erişilemeyen bir noktaydı. */}
          <KaydirmaAlani
            etiket="Saklama süresi"
            deger={saklamaGun}
            degisti={setSaklamaGun}
            enAz={5}
            enCok={1095}
            adim={5}
            bicimle={(deger) => `${sayi(deger)} gün (~${paraBirimi(deger / 30, 1)} ay)`}
          />
          <KaydirmaAlani
            etiket="Silme işi aralığı"
            deger={silmeAralik}
            degisti={setSilmeAralik}
            enAz={1}
            enCok={90}
            adim={1}
            bicimle={(deger) => (deger === 1 ? 'her gün' : `${sayi(deger)} günde bir`)}
          />
          <SecimAlani
            etiket="Kişisel veri durumu"
            deger={veriDurumu}
            degisti={setVeriDurumu}
            secenekler={(Object.keys(VERI_DURUMLARI) as VeriDurumu[]).map((anahtar) => ({
              deger: anahtar,
              ad: VERI_DURUMLARI[anahtar].ad,
            }))}
            ipucu={VERI_DURUMLARI[veriDurumu].not}
          />
          <SayiAlani
            etiket="Tutulan kopya sayısı"
            deger={kopya}
            degisti={setKopya}
            birim="kopya"
            enAz={1}
            enCok={12}
            ipucu="Birincil depo, replikalar ve saklanan yedekler toplamı. Silme talebi bu kopyaların tamamını kapsar."
          />
        </>
      }
      sonuclar={
        <>
          <AnaSonuc
            deger={toplamHacim.deger}
            birim={toplamHacim.birim}
            etiket="Durağan durumda tepe hacim"
          />

          <AnaSonuc
            deger={sayi(hesap.enUzunYasam)}
            birim="gün"
            etiket="Bir kaydın en uzun yaşam süresi"
            ton={hesap.gecikmeUyarisi ? 'uyari' : 'ikincil'}
          />

          <div className="space-y-2.5 rounded-xl border border-kenar bg-yuzey/40 p-5">
            <SonucSatiri
              etiket="Tepe kayıt sayısı (silme öncesi)"
              deger={`${sayi(hesap.duraganKayit)} kayıt`}
              vurgulu
            />
            <SonucSatiri
              etiket="Politika penceresinde"
              deger={`${sayi(hesap.politikaKayit)} kayıt`}
            />
            <SonucSatiri etiket="Silme işini bekleyen" deger={`${sayi(hesap.fazlaKayit)} kayıt`} />
            <SonucSatiri etiket="Yedek kopyaların payı" deger={hacimMetni(hesap.yedekBayt)} />
            <SonucSatiri
              etiket="Plato öncesi günlük artış"
              deger={`${hacimMetni(hesap.gunlukArtisBayt)}/gün`}
            />
          </div>

          <div className="rounded-xl border border-kenar bg-yuzey/40 p-5">
            <p className="etiket-mono mb-3 text-metin-soluk">
              Hacmin dağılımı ({dagilimBirimi.ad})
            </p>
            <OranCubugu
              toplam={dagilimOlcegi(hesap.toplamBayt)}
              bolumler={[
                {
                  ad: 'Politika süresi içinde',
                  deger: dagilimOlcegi(hesap.politikaBayt),
                  renk: 'bg-vurgu',
                },
                {
                  ad: 'Silme gecikmesinde bekleyen',
                  deger: dagilimOlcegi(hesap.fazlaBayt),
                  renk: 'bg-uyari',
                },
              ]}
            />
          </div>

          <div
            className={`rounded-xl border p-5 ${
              hesap.gecikmeUyarisi ? 'border-uyari/30 bg-uyari/8' : 'border-kenar bg-yuzey/40'
            }`}
          >
            <p className="etiket-mono mb-3 text-metin-soluk">Silme takvimi</p>
            <div className="space-y-2.5">
              <SonucSatiri
                etiket="İlk silmenin gerçekleştiği gün"
                deger={`${sayi(hesap.ilkSilmeGunu)}. gün`}
                vurgulu
              />
              <SonucSatiri
                etiket="Her işte silinen kayıt"
                deger={`${sayi(hesap.partiKayit)} kayıt`}
              />
              <SonucSatiri etiket="Her işte boşalan hacim" deger={hacimMetni(hesap.partiBayt)} />
              <SonucSatiri etiket="Yılda silme işi" deger={`${sayi(hesap.yillikIsSayisi)} kez`} />
            </div>

            {hesap.gecikmeBelirgin ? (
              <p
                className={`mt-3 text-xs leading-relaxed ${
                  hesap.gecikmeUyarisi ? 'text-uyari' : 'text-metin-ikincil'
                }`}
              >
                Silme işi {sayi(hesap.silmeGun)} günde bir çalıştığı için kayıtlar politikanın{' '}
                {sayi(hesap.fazlaGun)} gün ötesine taşıyor — tepe hacmin %
                {paraBirimi(hesap.fazlaPay * 100, 1)} kadarı{' '}
                {hesap.gecikmeUyarisi
                  ? 'politikanın gerekçelendirmediği paydır'
                  : 'yalnızca takvim gecikmesinin getirdiği depolama gideridir'}
                . İşi günlük çalıştırmak en uzun yaşam süresini {sayi(hesap.politikaGun)} güne
                indirir ve {hacimMetni(hesap.fazlaBayt)} boşaltır; politika süresini kısaltmadan
                önce yapılacak ilk iş budur.
              </p>
            ) : (
              <p className="mt-3 text-xs leading-relaxed text-metin-soluk">
                Saklama süresini yarıya indirmek politika penceresindeki kaydın yarısını düşürür:{' '}
                {hacimMetni(hesap.yariSureKazanci)} boşalır. Kısaltmadan önce kaydın hangi amaca
                hizmet ettiğini ve o amacın ne zaman tükendiğini yazılı hale getirin.
              </p>
            )}
          </div>

          {hesap.durumTanimi.kisisel && hesap.kopyaSayisi > 1 && (
            <div className="rounded-xl border border-kenar-soluk bg-yuzey/40 p-5">
              <p className="text-xs leading-relaxed text-metin-ikincil">
                Bir silme talebi geldiğinde kaydın {sayi(hesap.kopyaSayisi)} kopyasının tamamı
                aranmalıdır. Yedek rotasyonu politikadan uzunsa gerçek saklama süresini yedek
                belirler; takvimi birincil depoya göre değil en uzun yaşayan kopyaya göre yazın.
              </p>
            </div>
          )}
        </>
      }
      not={
        <>
          Hesap, günlük hacmin sabit olduğu ve silme işinin her çalıştığında süresi dolan tüm
          kayıtları gerçekten sildiği durağan durumu varsayar. Gösterilen hacim bu durumun
          tepesidir: silme işinden hemen önce depoda duran en yüksek değerdir, iş sonrasında
          politika penceresindeki paya iner. Tepe, silme işinin o günün kayıtları girmeden önce
          çalıştığı kabulüyle sayılır; iş gün sonunda çalışıyorsa tepeye bir günlük hacim daha
          eklenir. Kayıt başına boyut, tür için verilen başlangıç değeri değiştirilmediyse kabul
          edilmiş bir varsayımdır — gerçek ortalama kendi şemanızdan ölçülür. Takvim bir ayı 30, bir
          yılı 365 gün kabul eder; kaydırma çubuğundaki ay karşılığı ile yıllık silme işi sayısı bu
          kabulle yazılır. Sıkıştırma, dizin ve günlük şemasının kendi ek yükü hesaba katılmaz;
          dizinli bir kayıt deposunda gerçek hacim buradaki sayının üzerine çıkar. Araç hiçbir
          hukuki saklama süresi önermez: politika süresi sizin girdiğiniz değerdir, mevzuattan gelen
          asgari ve azami süreleri ayrıca doğrulamanız gerekir.
        </>
      }
    />
  );
}
