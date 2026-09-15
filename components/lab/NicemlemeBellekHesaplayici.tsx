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

type TabanGenislik = '32' | '16';
type HedefGenislik = '16' | '8' | '6' | '4' | '3';

/*
 * Bit genişliği tanım gereği sabittir: bir ağırlık n bit ile saklanıyorsa
 * parametre başına n/8 bayt yer tutar. Aşağıdaki tablolar yalnızca bu çevrimi
 * adlandırır; hiçbir modelin ölçülmüş bellek değeri, hızı veya kalitesi
 * taşımaz. Bellek, kullanıcının girdiği parametre sayısından türetilir.
 */
const TABAN: Record<TabanGenislik, { ad: string; bit: number }> = {
  '32': { ad: 'FP32 — 32 bit', bit: 32 },
  '16': { ad: 'BF16 / FP16 — 16 bit', bit: 16 },
};

const HEDEF: Record<HedefGenislik, { ad: string; bit: number }> = {
  '16': { ad: 'BF16 / FP16 — 16 bit (alt bit nicemleme yok)', bit: 16 },
  '8': { ad: 'INT8 / FP8 — 8 bit', bit: 8 },
  '6': { ad: '6 bit', bit: 6 },
  '4': { ad: 'INT4 / NF4 — 4 bit', bit: 4 },
  '3': { ad: '3 bit', bit: 3 },
};

/*
 * Nicemlenmiş ağırlık yalnızca ham biti taşımaz: her grup için bir ölçek ve
 * bir sıfır noktası da saklanır. Burada KABUL EDİLEN VARSAYIM 128 ağırlıklık
 * grup ve grup başına 32 bit üstveridir → 32/128 = 0,25 bit/parametre. Ölçüm
 * değil, yaygın bir yapılandırmanın aritmetik karşılığıdır; grup küçültülürse
 * ek yük büyür, kanal başına tek ölçek kullanılırsa neredeyse kaybolur.
 */
const GRUP_BOYUTU = 128;
const GRUP_USTVERI_BIT = 32;
const EK_BIT = GRUP_USTVERI_BIT / GRUP_BOYUTU;

/** Grup üstverisinin uygulandığı sınır: bunun altındaki hedefler tam sayı nicemlemesi sayılır. */
const ALT_BIT_SINIRI = 16;

/*
 * Bayt katları ikilik tabandan okunur (1 GB = 1024³ bayt). Tek yerde durması,
 * bir yerde 1000'lik bir yerde 1024'lük çarpan kullanma hatasını engeller.
 */
const GB = 1024 ** 3;
const MB = 1024 ** 2;

/*
 * Alan sınırları tek kaynakta: hem girdi alanının aralık/adım doğrulaması hem
 * hesabın kırpması buradan okur. Adım değerleri en küçük sınırla aynı ızgarayı
 * paylaşır — tarayıcı adım tabanını `min` alır, dolayısıyla `min` ile `step`
 * uyumsuz olursa varsayılan değer bile "geçersiz" işaretlenir. Üst sınırlar
 * gerçekçi olmaktan çok taşmayı engellemek için var: yapıştırılan çok basamaklı
 * bir sayı çarpımı sonsuza taşırsa bütün sonuçlar "—" olur ve oran çubuğunun
 * genişliği NaN kalır.
 */
const SINIR = {
  parametre: { enAz: 0.5, enCok: 100000, adim: 0.5 },
  katman: { enAz: 1, enCok: 1000, adim: 1 },
  kvKanal: { enAz: 64, enCok: 65536, adim: 64 },
  baglam: { enAz: 0, enCok: 100000000, adim: 1024 },
};

function kirp(deger: number, sinir: { enAz: number; enCok: number }, varsayilan: number) {
  return Math.min(sinir.enCok, Math.max(sinir.enAz, guvenliSayi(deger, varsayilan)));
}

/*
 * KV önbelleği bu hesapta 16 bit tutulur. Sebebi: ağırlık nicemlemesi KV
 * önbelleğini küçültmez — aracın göstermeye çalıştığı ödünleşimin merkezinde
 * tam olarak bu vardır. KV nicemlemesi ayrı bir karardır ve modellenmemiştir.
 */
const KV_BAYT = 2;

/** Ağırlık nicemlemesinin KV baskısı karşısında anlamını yitirdiği eşik. */
const KV_BASKIN_ESIK = 50;

export function NicemlemeBellekHesaplayici() {
  const [parametre, setParametre] = useState(32);
  const [aktifPay, setAktifPay] = useState(100);
  const [taban, setTaban] = useState<TabanGenislik>('16');
  const [hedef, setHedef] = useState<HedefGenislik>('4');
  const [katman, setKatman] = useState(48);
  const [kvKanal, setKvKanal] = useState(1024);
  const [baglamToplam, setBaglamToplam] = useState(32768);

  const hesap = useMemo(() => {
    const params = kirp(parametre, SINIR.parametre, 1) * 1e9;
    const tabanBit = TABAN[taban].bit;
    const hedefBit = HEDEF[hedef].bit;
    const nicemlendi = hedefBit < tabanBit;

    /*
     * Grup üstverisi yalnızca 16 bitin ALTINA inildiğinde vardır: BF16/FP16 düz
     * bir kayan nokta biçimidir, grup ölçeği ve sıfır noktası taşımaz. FP32'den
     * 16 bite geçmek hassasiyet düşürmedir, tam sayı nicemlemesi değil — bu
     * yüzden ek yük hedef bit genişliğine bakılarak eklenir, "taban değişti mi"
     * sorusuna göre değil. Aksi hâlde FP32 → BF16 seçiminde parametre başına
     * var olmayan 0,25 bit faturalanır ve seçeneğin kendi etiketi yanlış çıkar.
     */
    const altBitNicemleme = hedefBit < ALT_BIT_SINIRI;
    const etkinBit = hedefBit + (altBitNicemleme ? EK_BIT : 0);

    const agirlikTabanGb = (params * (tabanBit / 8)) / GB;
    const agirlikHedefGb = (params * (etkinBit / 8)) / GB;

    /*
     * KV önbelleği: her katmanda anahtar ve değer ayrı tutulur (2), kanal
     * genişliği gruplanmış dikkatte gizli boyuttan küçüktür, bu yüzden ayrı
     * girdi. Bağlam girdisi eş zamanlı isteklerin toplamı olduğu için batch
     * çarpanı zaten içinde.
     */
    const katmanSayisi = kirp(katman, SINIR.katman, 1);
    const kanal = kirp(kvKanal, SINIR.kvKanal, SINIR.kvKanal.enAz);
    const baglam = kirp(baglamToplam, SINIR.baglam, 0);
    const tokenBasinaKvBayt = 2 * katmanSayisi * kanal * KV_BAYT;
    const kvGb = (tokenBasinaKvBayt * baglam) / GB;

    const tabanToplam = agirlikTabanGb + kvGb;
    const hedefToplam = agirlikHedefGb + kvGb;

    /*
     * Ağırlıkta tasarruf doğrudan bit oranıdır. Toplamda görünen tasarruf ise
     * KV payı kadar seyreltilir: nicemleme KV önbelleğine dokunmadığı için
     * uzun ve çok sayıda eş zamanlı bağlamda kazanç hızla erir.
     */
    const agirlikTasarruf = agirlikTabanGb > 0 ? 1 - agirlikHedefGb / agirlikTabanGb : 0;
    const etkinTasarruf = tabanToplam > 0 ? 1 - hedefToplam / tabanToplam : 0;
    const kvPayi = hedefToplam > 0 ? (kvGb / hedefToplam) * 100 : 0;

    /*
     * İki tasarrufun oranı, ağırlık kazancının toplama geçen payıdır ve sadeleşince
     * taban toplamda ağırlığın payına eşittir. Hem yüzde hem çubuk genişliği aynı
     * değeri okusun diye burada bir kez hesaplanır; JSX içinde tekrarlanırsa iki
     * gösterim zamanla birbirinden ayrılır.
     */
    const tasarrufGecisPayi =
      agirlikTasarruf > 0 ? Math.min(100, Math.max(0, (etkinTasarruf / agirlikTasarruf) * 100)) : 0;

    /*
     * Uzman karışımında bütün uzmanlar bellekte durmak zorundadır ama token
     * başına yalnızca etkin pay okunur. Bu yüzden bellek yerleşimi toplam
     * parametreye, bant genişliği baskısı etkin paya bağlıdır.
     */
    const aktifOran = Math.min(100, Math.max(1, guvenliSayi(aktifPay, 100))) / 100;
    const tokenBasinaOkumaMb = (params * aktifOran * (etkinBit / 8)) / MB;

    /*
     * Kazanılan bellek somut bir karşılığa çevrilir: aynı geometride kaç
     * token daha önbellekte tutulabilir? Karar bu sayıyla verilir, yüzdeyle
     * değil.
     */
    const kazanilanBayt = (agirlikTabanGb - agirlikHedefGb) * GB;
    const ekBaglamToken = tokenBasinaKvBayt > 0 ? kazanilanBayt / tokenBasinaKvBayt : 0;

    return {
      nicemlendi,
      altBitNicemleme,
      tabanBit,
      hedefBit,
      etkinBit,
      agirlikTabanGb,
      agirlikHedefGb,
      kvGb,
      tabanToplam,
      hedefToplam,
      agirlikTasarruf,
      etkinTasarruf,
      tasarrufGecisPayi,
      kvPayi,
      tokenBasinaOkumaMb,
      ekBaglamToken,
      kvBaskin: kvPayi > KV_BASKIN_ESIK,
      agresif: hedefBit <= 4 && nicemlendi,
    };
  }, [parametre, aktifPay, taban, hedef, katman, kvKanal, baglamToplam]);

  return (
    <HesapDuzeni
      girdiler={
        <>
          <SayiAlani
            etiket="Parametre sayısı"
            deger={parametre}
            degisti={setParametre}
            birim="milyar"
            adim={SINIR.parametre.adim}
            enAz={SINIR.parametre.enAz}
            enCok={SINIR.parametre.enCok}
            ipucu="Uzman karışımında toplam parametre yazılır; bellekte bütün uzmanlar durur."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SecimAlani
              etiket="Taban bit genişliği"
              deger={taban}
              degisti={setTaban}
              secenekler={(Object.keys(TABAN) as TabanGenislik[]).map((anahtar) => ({
                deger: anahtar,
                ad: TABAN[anahtar].ad,
              }))}
              ipucu="Karşılaştırmanın çıkış noktası."
            />
            <SecimAlani
              etiket="Hedef bit genişliği"
              deger={hedef}
              degisti={setHedef}
              secenekler={(Object.keys(HEDEF) as HedefGenislik[]).map((anahtar) => ({
                deger: anahtar,
                ad: HEDEF[anahtar].ad,
              }))}
              ipucu={`${ALT_BIT_SINIRI} bitin altındaki hedeflerde grup başına ölçek ve sıfır noktası için parametre başına ${paraBirimi(
                EK_BIT,
                2,
              )} bit ek varsayılıyor (${GRUP_BOYUTU} ağırlıklık grup) — ölçüm değil, kabul edilmiş varsayım.`}
            />
          </div>
          <KaydirmaAlani
            etiket="Etkin parametre payı"
            deger={aktifPay}
            degisti={setAktifPay}
            enAz={5}
            enCok={100}
            adim={5}
            bicimle={(deger) => `%${deger}`}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SayiAlani
              etiket="Katman sayısı"
              deger={katman}
              degisti={setKatman}
              adim={SINIR.katman.adim}
              enAz={SINIR.katman.enAz}
              enCok={SINIR.katman.enCok}
            />
            <SayiAlani
              etiket="KV kanal genişliği"
              deger={kvKanal}
              degisti={setKvKanal}
              birim="kanal"
              adim={SINIR.kvKanal.adim}
              enAz={SINIR.kvKanal.enAz}
              enCok={SINIR.kvKanal.enCok}
              ipucu="Anahtar/değer başlık sayısı × başlık boyutu. Gruplanmış dikkatte gizli boyuttan küçüktür."
            />
          </div>
          <SayiAlani
            etiket="Bellekte tutulan bağlam"
            deger={baglamToplam}
            degisti={setBaglamToplam}
            birim="token"
            adim={SINIR.baglam.adim}
            enAz={SINIR.baglam.enAz}
            enCok={SINIR.baglam.enCok}
            ipucu="Eş zamanlı istek sayısı × istek başına bağlam uzunluğu."
          />
        </>
      }
      sonuclar={
        <>
          <AnaSonuc
            deger={paraBirimi(hesap.hedefToplam, 1)}
            birim="GB"
            etiket="Nicemleme sonrası bellek"
            ton={hesap.kvBaskin ? 'uyari' : 'vurgu'}
          />

          <div className="rounded-xl border border-kenar bg-yuzey/40 p-5">
            <p className="etiket-mono mb-3 text-metin-soluk">Tasarruf</p>
            <SonucSatiri etiket="Taban toplam" deger={`${paraBirimi(hesap.tabanToplam, 1)} GB`} />
            <SonucSatiri
              etiket="Ağırlıkta tasarruf"
              deger={`%${paraBirimi(hesap.agirlikTasarruf * 100, 1)}`}
            />
            <SonucSatiri
              etiket="Toplamda etkin tasarruf"
              deger={`%${paraBirimi(hesap.etkinTasarruf * 100, 1)}`}
              vurgulu
            />
            <div className="mt-3">
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className="text-xs text-metin-ikincil">
                  Ağırlık tasarrufunun toplama geçen payı
                </span>
                <span className="font-mono text-sm tabular-nums">
                  %{paraBirimi(hesap.tasarrufGecisPayi, 0)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-yuzey-3">
                <div
                  className={`h-full rounded-full ${
                    hesap.kvBaskin ? 'bg-uyari' : 'bg-gradient-to-r from-vurgu to-ikincil'
                  }`}
                  style={{ width: `${hesap.tasarrufGecisPayi}%` }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-kenar bg-yuzey/40 p-5">
            <p className="etiket-mono mb-3.5 text-metin-soluk">Nicemleme sonrası dağılım</p>
            <OranCubugu
              toplam={hesap.hedefToplam}
              bolumler={[
                {
                  ad: 'Ağırlıklar (GB)',
                  deger: Number(hesap.agirlikHedefGb.toFixed(2)),
                  renk: 'bg-vurgu',
                },
                {
                  ad: 'KV önbelleği (GB)',
                  deger: Number(hesap.kvGb.toFixed(2)),
                  renk: 'bg-ikincil',
                },
              ]}
            />
          </div>

          <div className="space-y-2.5 rounded-xl border border-kenar bg-yuzey/40 p-5">
            <SonucSatiri
              etiket="Parametre başına etkin bit"
              deger={`${paraBirimi(hesap.etkinBit, 2)} bit`}
            />
            <SonucSatiri
              etiket={`Ağırlıklar (${hesap.tabanBit} bit)`}
              deger={`${paraBirimi(hesap.agirlikTabanGb, 1)} GB`}
            />
            <SonucSatiri
              etiket={`Ağırlıklar (${hesap.hedefBit} bit)`}
              deger={`${paraBirimi(hesap.agirlikHedefGb, 1)} GB`}
              vurgulu
            />
            <SonucSatiri etiket="KV önbelleği" deger={`${paraBirimi(hesap.kvGb, 1)} GB`} />
            <SonucSatiri
              etiket="Token başına okunan ağırlık"
              deger={
                /* Yoğun bir modelde bu değer on binlerce MB'a çıkar; okunurluk için GB'a döner. */
                hesap.tokenBasinaOkumaMb >= 1024
                  ? `${paraBirimi(hesap.tokenBasinaOkumaMb / 1024, 1)} GB`
                  : `${paraBirimi(hesap.tokenBasinaOkumaMb, 0)} MB`
              }
            />
            <SonucSatiri
              etiket="Kazanılan belleğin bağlam karşılığı"
              deger={`${sayi(hesap.ekBaglamToken)} token`}
            />
          </div>

          {hesap.kvBaskin && (
            <div className="rounded-xl border border-uyari/30 bg-uyari/8 p-5">
              <p className="etiket-mono mb-2 text-uyari">KV önbelleği baskın</p>
              <p className="text-[0.875rem] leading-relaxed text-metin-ikincil">
                Belleğin %{paraBirimi(hesap.kvPayi, 0)} kadarı KV önbelleğinde; ağırlığı daha da
                sıkıştırmak toplamı kayda değer ölçüde küçültmez. Sırayı tersine çevirin: eş zamanlı
                bağlam toplamını düşürün, anahtar/değer başlıklarını gruplayarak kanal genişliğini
                azaltın, sayfalı dikkat ile parçalanmayı toplayın. KV nicemlemesi bundan sonra gelir
                ve kalite etkisi ayrıca ölçülmelidir.
              </p>
            </div>
          )}

          <div className="rounded-xl border border-kenar-soluk bg-yuzey/40 p-5">
            <p className="etiket-mono mb-2 text-metin-soluk">Feda edilen</p>
            <p className="text-[0.875rem] leading-relaxed text-metin-ikincil">
              {!hesap.nicemlendi
                ? 'Hedef genişlik tabanla aynı: ağırlık tarafında tasarruf yok, kalite sorusu da açılmıyor. Bellek baskısı buradaysa KV geometrisine bakın.'
                : hesap.altBitNicemleme
                  ? 'Bu hesap yalnızca bellek tarafını verir; nicemlemenin çıktı kalitesine etkisini tahmin etmez. Kayıp göreve göre değişir ve yalnızca kendi değerlendirme kümenizde ölçülebilir.'
                  : 'Tam sayı nicemlemesi yok, yalnızca hassasiyet düşürme var: ağırlıklar grup ölçeği taşımadığı için ek yük de yok. Kalite etkisi genellikle küçüktür ama sıfır değildir; sayısal olarak hassas hatlarda kendi kümenizde doğrulayın.'}
            </p>
            {hesap.agresif && (
              <p className="mt-2.5 text-[0.875rem] leading-relaxed text-uyari">
                {hesap.hedefBit} bit agresif bir seçim. Yayına almadan önce uzun bağlam, sayısal
                akıl yürütme ve biçim uyumu gibi kırılgan görevlerde taban genişlikle yan yana
                ölçün; toplu doğruluk ortalaması bu kaybı gizler.
              </p>
            )}
          </div>
        </>
      }
      not={
        <>
          Ağırlık belleği parametre sayısı × bit genişliğinden, KV önbelleği katman × kanal × bağlam
          geometrisinden türetilir; hiçbir modelin ölçülmüş değeri gömülü değildir. Grup üstverisi
          için parametre başına {paraBirimi(EK_BIT, 2)} bit ek yük varsayılmıştır ({GRUP_BOYUTU}{' '}
          ağırlıklık grup, grup başına {GRUP_USTVERI_BIT} bit) ve yalnızca {ALT_BIT_SINIRI} bitin
          altındaki hedeflere uygulanır — BF16/FP16 düz kayan nokta biçimidir, grup ölçeği taşımaz.
          Bu kabul edilmiş bir varsayımdır, ölçüm değil. KV önbelleği 16 bit kabul edilir — ağırlık
          nicemlemesi onu küçültmediği için ödünleşim böyle görünür hâle gelir. Bayt katları ikilik
          tabandadır (1 GB = 1024³ bayt). Aktivasyon belleği, çıkarım motorunun çalışma alanı,
          bellek parçalanması ve nicemlemenin kalite maliyeti hesabın dışındadır; sonuç bir alt
          sınırdır.
        </>
      }
    />
  );
}
