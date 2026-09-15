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

type GuvenDuzeyi = '90' | '95' | '99';
type GucDuzeyi = '80' | '90' | '95';
type Duzen = 'bagimsiz' | 'eslestirilmis';

/**
 * Standart normal dağılımın kuantilleri. Bunlar ölçüm değil, tanım gereği
 * sabit sayılardır: iki yanlı güven için z(1 - α/2), güç için z(1 - β).
 */
const Z_GUVEN: Record<GuvenDuzeyi, number> = { '90': 1.6449, '95': 1.96, '99': 2.5758 };
const Z_GUC: Record<GucDuzeyi, number> = { '80': 0.8416, '90': 1.2816, '95': 1.6449 };

const GUVEN_SECENEKLERI: { deger: GuvenDuzeyi; ad: string }[] = [
  { deger: '90', ad: '%90 — keşif amaçlı ölçüm' },
  { deger: '95', ad: '%95 — yaygın varsayılan' },
  { deger: '99', ad: '%99 — yayına alma kararı' },
];

const GUC_SECENEKLERI: { deger: GucDuzeyi; ad: string }[] = [
  { deger: '80', ad: '%80 — gerçek farkı 5 denemede 4 yakalar' },
  { deger: '90', ad: '%90 — daha az kaçırır, daha çok örnek ister' },
  { deger: '95', ad: '%95 — geri dönüşü zor kararlar' },
];

const DUZEN_SECENEKLERI: { deger: Duzen; ad: string }[] = [
  { deger: 'bagimsiz', ad: 'Bağımsız iki örneklem' },
  { deger: 'eslestirilmis', ad: 'Eşleştirilmiş — aynı örnekler, iki model' },
];

export function OrneklemBuyukluguHesaplayici() {
  const [duzen, setDuzen] = useState<Duzen>('eslestirilmis');
  const [basariOrani, setBasariOrani] = useState(80);
  const [yariGenislik, setYariGenislik] = useState(3);
  const [guvenDuzeyi, setGuvenDuzeyi] = useState<GuvenDuzeyi>('95');
  const [gucDuzeyi, setGucDuzeyi] = useState<GucDuzeyi>('80');
  const [anlasmazlik, setAnlasmazlik] = useState(15);
  const [eldekiOrnek, setEldekiOrnek] = useState(200);

  const hesap = useMemo(() => {
    // Oranlar 0 ve 1 uçlarında varyansı sıfırlar; bu da örneklemi anlamsızca
    // küçültür. Bu yüzden girdiler kapalı aralığa sıkıştırılır.
    const p = Math.min(0.99, Math.max(0.01, guvenliSayi(basariOrani, 80) / 100));
    const hedefFark = Math.min(0.5, Math.max(0.001, guvenliSayi(yariGenislik, 3) / 100));
    const zGuven = Z_GUVEN[guvenDuzeyi];
    const zGuc = Z_GUC[gucDuzeyi];

    // Bernoulli varyansı: bir örneğin geçti/geçmedi çıktısı p(1-p) taşır.
    // Varyans p = 0,5 civarında en büyüktür; bu yüzden başarı oranı %50
    // dolayındaki bir ölçüt en pahalı ölçüttür.
    const varyans = p * (1 - p);

    // Tek oranın güven aralığı (normal yaklaşım): yarı genişlik
    // e = z · sqrt(p(1-p)/n) eşitliği n için çözülür.
    const nAralik = Math.ceil((zGuven * zGuven * varyans) / (hedefFark * hedefFark));

    // Fark testinin varyansı düzene göre değişir:
    // - Bağımsız kollarda iki ayrı örneklemin varyansı toplanır → 2p(1-p).
    // - Eşleştirilmiş düzende (McNemar) yalnızca iki modelin ayrıştığı çiftler
    //   bilgi taşır; bilgi tabanı anlaşmazlık oranıdır.
    const anlasmazlikOrani = Math.min(0.99, Math.max(0.01, guvenliSayi(anlasmazlik, 15) / 100));
    const farkVaryansi = duzen === 'bagimsiz' ? 2 * varyans : anlasmazlikOrani;

    // İki yanlı test için gereken örneklem: n = (z_güven + z_güç)² · V / δ²
    const zToplam = zGuven + zGuc;
    const nFark = Math.ceil((zToplam * zToplam * farkVaryansi) / (hedefFark * hedefFark));

    // Eşleştirilmiş düzende iki modelin oran farkı, en çok ayrıştıkları
    // çiftlerin payı kadar olabilir: δ ≤ a. Hedef bu tavanı aşarsa yukarıdaki
    // yaklaşım matematiksel olarak imkânsız bir senaryo için küçücük bir
    // örneklem üretir (kesin McNemar formülünde √(a − δ²) tanımsız kalır),
    // bu yüzden sonuç ayrıca işaretlenir.
    const hedefTutarsiz = duzen === 'eslestirilmis' && hedefFark >= anlasmazlikOrani;

    // Bağımsız düzende n kol başınadır; etiketleme yükü iki katıdır.
    const etiketlemeYuku = duzen === 'bagimsiz' ? nFark * 2 : nFark;

    const eldeki = Math.max(1, Math.round(guvenliSayi(eldekiOrnek, 200)));
    // Bağımsız düzende eldeki örnek iki kola bölünür.
    const kolBasinaEldeki = duzen === 'bagimsiz' ? Math.max(1, Math.floor(eldeki / 2)) : eldeki;

    // Tek bir modelin oranı, yalnızca o modelin gördüğü örneklerden kestirilir.
    // Bağımsız düzende bu kol başına düşen sayıdır; havuzun tamamı kullanılırsa
    // aralık olduğundan √2 kat dar çıkar.
    const eldekiYariGenislik = zGuven * Math.sqrt(varyans / kolBasinaEldeki) * 100;
    // Ayırt edilebilir en küçük fark: aynı eşitlik δ için çözülür.
    const ayirtEdilebilirFark = zToplam * Math.sqrt(farkVaryansi / kolBasinaEldeki) * 100;

    const kapsama = etiketlemeYuku > 0 ? (eldeki / etiketlemeYuku) * 100 : 0;
    const eksik = Math.max(0, etiketlemeYuku - eldeki);
    const yedek = Math.max(0, eldeki - etiketlemeYuku);

    // Normal yaklaşım, beklenen başarı ve başarısızlık sayısı 10 altına
    // düştüğünde aralığı olduğundan dar gösterir; bu eşik literatürdeki
    // yaygın kaba kuraldır. Eşik, aralığın kurulduğu örneklem üzerinden
    // bakılır: bağımsız düzende bu kol başına düşen sayıdır.
    const yaklasimTabani = Math.min(kolBasinaEldeki * p, kolBasinaEldeki * (1 - p));

    // Eşleştirilmiş düzenin kazancı: bağımsız düzenin toplam yükü (2 × 2p(1-p))
    // ile anlaşmazlık oranının oranı.
    const eslestirmeKazanci = anlasmazlikOrani > 0 ? (4 * varyans) / anlasmazlikOrani : 0;

    // Hedefi bir puan gevşetmenin etkisi: n, δ² ile ters orantılı olduğu için
    // yarı genişliği büyütmek en hızlı tasarruf kalemidir.
    const gevsekFark = hedefFark + 0.01;
    const gevsekYuk =
      Math.ceil((zToplam * zToplam * farkVaryansi) / (gevsekFark * gevsekFark)) *
      (duzen === 'bagimsiz' ? 2 : 1);

    return {
      zGuven,
      zGuc,
      varyans,
      nAralik,
      nFark,
      etiketlemeYuku,
      eldeki,
      kolBasinaEldeki,
      eldekiYariGenislik,
      ayirtEdilebilirFark,
      kapsama,
      eksik,
      yedek,
      yaklasimTabani,
      eslestirmeKazanci,
      gevsekYuk,
      hedefTutarsiz,
      anlasmazlikPuan: anlasmazlikOrani * 100,
      hedefPuan: hedefFark * 100,
      gevsekPuan: gevsekFark * 100,
      bagimsizMi: duzen === 'bagimsiz',
    };
  }, [duzen, basariOrani, yariGenislik, guvenDuzeyi, gucDuzeyi, anlasmazlik, eldekiOrnek]);

  return (
    <HesapDuzeni
      girdiler={
        <>
          <SecimAlani
            etiket="Karşılaştırma düzeni"
            deger={duzen}
            degisti={setDuzen}
            secenekler={DUZEN_SECENEKLERI}
            ipucu="Eşleştirilmiş düzende her örnek iki modele de verilir; ortak zorluk sadeleştiği için aynı çözünürlük daha az örnekle elde edilir."
          />
          <KaydirmaAlani
            etiket="Beklenen başarı oranı"
            deger={basariOrani}
            degisti={setBasariOrani}
            enAz={5}
            enCok={99}
            adim={1}
            bicimle={(deger) => `%${deger}`}
          />
          <SayiAlani
            etiket="Hedeflenen yarı genişlik"
            deger={yariGenislik}
            degisti={setYariGenislik}
            birim="± puan"
            enAz={0.5}
            enCok={25}
            adim={0.5}
            ipucu="Güven aralığının ± kaç yüzde puan olmasını istiyorsun? Aynı değer, iki modeli ayırt etmek istediğin en küçük fark olarak da kullanılır."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SecimAlani
              etiket="Güven düzeyi"
              deger={guvenDuzeyi}
              degisti={setGuvenDuzeyi}
              secenekler={GUVEN_SECENEKLERI}
            />
            <SecimAlani
              etiket="İstatistiksel güç"
              deger={gucDuzeyi}
              degisti={setGucDuzeyi}
              secenekler={GUC_SECENEKLERI}
            />
          </div>
          <SayiAlani
            etiket="Anlaşmazlık oranı"
            deger={anlasmazlik}
            degisti={setAnlasmazlik}
            birim="%"
            enAz={1}
            enCok={99}
            ipucu="İki modelin farklı sonuç verdiği örneklerin beklenen payı; bir varsayımdır, pilot ölçümle yerine gerçek oran konmalı. Eşleştirilmiş düzende örneklemi doğrudan belirler; bağımsız düzende yalnızca eşleştirmeye geçmenin kazancını kestirmek için kullanılır."
          />
          <SayiAlani
            etiket="Eldeki etiketli örnek"
            deger={eldekiOrnek}
            degisti={setEldekiOrnek}
            birim="örnek"
            enAz={1}
            adim={50}
            ipucu="Bugün elinde olan, güvenilir referans cevabı bulunan örnek sayısı."
          />
        </>
      }
      sonuclar={
        <>
          <AnaSonuc
            deger={sayi(hesap.nAralik)}
            birim={hesap.bagimsizMi ? 'örnek (model başına)' : 'örnek'}
            etiket={`Güven aralığını ±${paraBirimi(hesap.hedefPuan, 1)} puana indirmek için`}
          />

          <AnaSonuc
            deger={sayi(hesap.etiketlemeYuku)}
            birim={hesap.bagimsizMi ? 'örnek (iki kol)' : 'çift'}
            etiket={`${paraBirimi(hesap.hedefPuan, 1)} puanlık farkı ayırt etmek için`}
            ton={hesap.hedefTutarsiz || hesap.kapsama < 100 ? 'uyari' : 'ikincil'}
          />

          <div className="space-y-2.5 rounded-xl border border-kenar bg-yuzey/40 p-5">
            <SonucSatiri
              etiket={
                hesap.bagimsizMi
                  ? `Kol başına ${sayi(hesap.kolBasinaEldeki)} örnekle güven aralığı`
                  : 'Eldeki örnekle güven aralığı'
              }
              deger={`±${paraBirimi(hesap.eldekiYariGenislik, 2)} puan`}
              vurgulu
            />
            <SonucSatiri
              etiket="Ayırt edilebilir en küçük fark"
              deger={`${paraBirimi(hesap.ayirtEdilebilirFark, 2)} puan`}
              vurgulu
            />
            <SonucSatiri
              etiket={hesap.bagimsizMi ? 'Kol başına gereken' : 'Gereken çift sayısı'}
              deger={`${sayi(hesap.nFark)} örnek`}
            />
            <SonucSatiri etiket="Güven katsayısı (z)" deger={paraBirimi(hesap.zGuven, 4)} />
            <SonucSatiri etiket="Güç katsayısı (z)" deger={paraBirimi(hesap.zGuc, 4)} />
            <SonucSatiri
              etiket="Örnek başına varyans p(1-p)"
              deger={paraBirimi(hesap.varyans, 4)}
            />
          </div>

          <div className="rounded-xl border border-kenar bg-yuzey/40 p-5">
            <p className="etiket-mono mb-3.5 text-metin-soluk">Etiketleme bütçesi</p>
            <OranCubugu
              toplam={Math.max(hesap.etiketlemeYuku, hesap.eldeki)}
              bolumler={[
                {
                  ad: 'Karşılanan örnek',
                  deger: Math.min(hesap.eldeki, hesap.etiketlemeYuku),
                  renk: 'bg-vurgu',
                },
                ...(hesap.eksik > 0
                  ? [{ ad: 'Eksik örnek', deger: hesap.eksik, renk: 'bg-uyari' }]
                  : []),
                ...(hesap.yedek > 0
                  ? [{ ad: 'Yedek pay', deger: hesap.yedek, renk: 'bg-ikincil' }]
                  : []),
              ]}
            />
            <div className="mt-4 border-t border-kenar-soluk pt-3.5">
              <SonucSatiri
                etiket="Hedefin karşılanma oranı"
                deger={`%${paraBirimi(Math.min(999, hesap.kapsama), 0)}`}
                vurgulu
              />
            </div>
          </div>

          {hesap.hedefTutarsiz && (
            <div className="rounded-xl border border-uyari/30 bg-uyari/8 p-5">
              <p className="etiket-mono mb-3 text-uyari">Hedef, düzenle tutarsız</p>
              <p className="text-xs leading-relaxed text-metin-ikincil">
                Eşleştirilmiş düzende iki modelin oran farkı, ayrıştıkları çiftlerin payından büyük
                olamaz: hedeflenen ±{paraBirimi(hesap.hedefPuan, 1)} puan, girilen{' '}
                {`%${paraBirimi(hesap.anlasmazlikPuan, 1)}`} anlaşmazlık oranına eşit ya da ondan
                büyük. Yukarıdaki çift sayısı bu yüzden imkânsız bir senaryonun sayısıdır; olduğu
                gibi kullanılmamalı. Ya anlaşmazlık oranı olduğundan düşük tahmin edilmiştir — pilot
                ölçümle gerçek oranı gir — ya da hedeflenen fark bu ölçüt için gerçekçi değildir,
                küçült.
              </p>
            </div>
          )}

          {hesap.eksik > 0 && (
            <div className="rounded-xl border border-uyari/30 bg-uyari/8 p-5">
              <p className="etiket-mono mb-3 text-uyari">Örneklem yetersiz</p>
              <p className="text-xs leading-relaxed text-metin-ikincil">
                Eldeki küme, hedeflenen çözünürlük için {sayi(hesap.eksik)} örnek eksik. Bu
                büyüklükte bir kümeyle yalnızca {paraBirimi(hesap.ayirtEdilebilirFark, 2)} puandan
                büyük farklar ayırt edilebilir; daha küçük bir fark ölçülse bile gürültüden
                ayrılamaz.
              </p>
              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-metin-ikincil">
                {hesap.bagimsizMi && hesap.eslestirmeKazanci > 1.1 && (
                  <li>
                    Eşleştirilmiş düzene geçmek — aynı örnekleri iki modele vermek — bu çözünürlüğü
                    yaklaşık {paraBirimi(hesap.eslestirmeKazanci, 1)} kat daha az örnekle verir.
                  </li>
                )}
                <li>
                  Hedefi ±{paraBirimi(hesap.gevsekPuan, 1)} puana gevşetmek yükü{' '}
                  {sayi(hesap.gevsekYuk)} örneğe düşürür: örneklem, farkın karesiyle ters orantılı
                  büyür.
                </li>
                <li>
                  Küme büyütülemiyorsa karar tek sayıya değil, aralığın tamamına bakılarak verilir:
                  aralıklar örtüşüyorsa sonuç &quot;fark yok&quot; değil &quot;fark görünmedi&quot;
                  demektir.
                </li>
              </ul>
            </div>
          )}

          {hesap.yaklasimTabani < 10 && (
            <div className="rounded-xl border border-kenar-guclu bg-zemin p-5">
              <p className="etiket-mono mb-3 text-sinyal">Yaklaşım sınırında</p>
              <p className="text-xs leading-relaxed text-metin-ikincil">
                Eldeki örneklemde beklenen az görülen sonuç sayısı{' '}
                {paraBirimi(hesap.yaklasimTabani, 1)} — 10 eşiğinin altında. Normal yaklaşım bu
                bölgede aralığı olduğundan dar gösterir. Wilson veya Clopper-Pearson aralığı kullan;
                buradaki sayıyı alt sınır kabul et.
              </p>
            </div>
          )}
        </>
      }
      not={
        <>
          Hesap, örneklerin birbirinden bağımsız çekildiği ve her örneğin ikili (geçti/geçmedi) bir
          çıktı verdiği varsayımına dayanır; oranın güven aralığı normal yaklaşımla, iki yanlı test
          için kurulur. Eşleştirilmiş düzendeki anlaşmazlık oranı sen giriyorsun ve bir varsayımdır
          — pilot bir ölçümle yerine gerçek oran konmalıdır; o düzende ayırt edilebilir fark, bu
          oranın üstüne çıkamaz. Aynı test kümesinde birden fazla ölçüt karşılaştırılıyorsa çoklu
          karşılaştırma düzeltmesi gerekir, bu hesapta yoktur. Örnekler aynı belgeden veya aynı
          kullanıcıdan kümelenmişse etkin örneklem burada çıkandan küçüktür. Hesap, örneklerin
          ölçmek istediğin dağılımı temsil edip etmediği hakkında hiçbir şey söylemez.
        </>
      }
    />
  );
}
