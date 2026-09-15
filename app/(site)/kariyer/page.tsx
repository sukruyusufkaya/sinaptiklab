import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { Katman, Ok, Onay, Saat } from '@/components/arayuz/Ikonlar';
import { BosDurum } from '@/components/arayuz/Filtreler';
import { SSSBolumu } from '@/components/icerik/IcerikKenari';
import { ListeSemasi, SSSSemasi } from '@/lib/seo/jsonld';
import { meslekler } from '@/lib/icerik/lab';
import { ogrenmeYollari } from '@/lib/icerik/ogrenme';
import type { Meslek } from '@/lib/tipler';

export const metadata: Metadata = {
  title: 'AI Kariyerleri',
  description:
    'On dokuz yapay zekâ mesleği: ne yapar, kıdem basamakları nasıl ayrışır, günlük iş neye benzer, hangi öğrenme rotası oraya çıkar. Uydurma maaş verisi yok.',
  alternates: { canonical: '/kariyer/' },
};

/**
 * Kariyer dizini — ROL AİLESİNE göre.
 *
 * Sayfa daha önce yedi mesleği tek bir kart ızgarasında, ada göre alfabetik
 * listeliyordu. Kütüphane on dokuza çıkınca bu düzen iki nedenle kırıldı:
 * (1) "AI Altyapı Mühendisi" ile "AI Uyum Sorumlusu" alfabede komşu ama işleri
 * birbirine uzak, (2) kariyer kararı tek tek meslek okuyarak değil ALANLAR
 * arasında seçim yaparak verilir — okur önce hangi aileye ait olduğunu, sonra
 * o ailede hangi rolün kendisine uyduğunu sorar.
 *
 * Aynı kalıp `/rehber/` ve `/testler/` arşivlerinde de kullanılıyor: liste
 * büyüdüğünde düzen taksonomiyi izler.
 *
 * KOMŞULUK bu sayfanın ikinci işi. Bir mesleğe bakan kişinin asıl sorusu
 * çoğunlukla "bu nedir" değil "bununla şu arasındaki fark nedir" olduğu için
 * her kayıt komşularını FARKIYLA birlikte taşır ve fark detay sayfasında
 * basılır.
 */

const AILE_SIRASI = [
  'Mühendislik',
  'Veri ve model',
  'Platform',
  'Kalite ve güvenlik',
  'Yönetişim ve uyum',
  'Ürün ve operasyon',
] as const;

const AILE_TARIFI: Record<string, string> = {
  Mühendislik: 'Dil modelini çalışan bir ürüne çeviren roller. Ortak zemin yazılım mühendisliği.',
  'Veri ve model': 'Veriden model üreten ve veriyi güvenilir kılan roller.',
  Platform: 'Modellerin üzerinde çalıştığı kapasiteyi ve yayın hattını işleten roller.',
  'Kalite ve güvenlik': 'Sistemin iyi ve güvenli çalıştığını kanıtlamakla yükümlü roller.',
  'Yönetişim ve uyum': 'Neyin yapılabileceğine karar veren ve bunu belgeleyen roller.',
  'Ürün ve operasyon': 'Hangi sorunun çözüleceğini tanımlayan ve çözümü işe yerleştiren roller.',
};

const DIGER = 'Diğer';

const SORULAR = [
  {
    soru: 'Yapay zekâ alanında hangi meslek benim için uygun?',
    cevap:
      'Seçimi unvandan değil, günün nasıl geçtiğinden yapmak daha isabetlidir. Kod yazarak sistem kurmak istiyorsanız mühendislik ailesi, veriden model çıkarmak istiyorsanız veri ve model ailesi, bir sistemin doğru çalıştığını kanıtlamak sizi çekiyorsa kalite ve güvenlik ailesi uygundur. Her meslek sayfasında bir iş gününün dilim dilim nasıl geçtiği yazılıdır; üç meslek sayfasının günlük iş bölümünü okumak, unvan listesi taramaktan daha hızlı sonuç verir.',
  },
  {
    soru: 'Bu mesleklere geçmek için üniversite diploması şart mı?',
    cevap:
      'Mühendislik rollerinin çoğunda belirleyici olan diploma değil, üretime alınmış ve ölçülmüş bir iştir. Uyum ve yönetişim rollerinde ise hukuk ya da ilgili alan formasyonu pratikte daha belirleyicidir çünkü iş doğrudan mevzuat metniyle çalışmayı gerektirir. Her meslek sayfasındaki giriş yolları bölümü, o role fiilen hangi geçmişlerden gelindiğini listeler.',
  },
  {
    soru: 'Neden maaş aralığı yayımlamıyorsunuz?',
    cevap:
      'Doğrulanmamış maaş aralığı yayımlamak, en çok okunan ve en kolay yanlış yönlendiren veridir. Sinaptik Lab, örneklemi ve yöntemi yayımlanmamış hiçbir sayıyı yayımlamaz. Sinaptik Research bir saha araştırması tamamladığında aralıklar, örneklem büyüklüğü ve toplama yöntemiyle birlikte bu sayfalara eklenecektir.',
  },
  {
    soru: 'Kıdem basamakları kurumdan kuruma değişmiyor mu?',
    cevap:
      'Unvanlar değişir, sorumluluk sınıfları büyük ölçüde değişmez. Bu yüzden sayfalarda basamaklar unvan olarak değil sorumluluk olarak tanımlanır ve her basamak bir kanıtla eşleştirilir: o basamakta olunduğunu gösteren, gösterilebilir bir iş. Farklı kurumlarda aynı kanıt farklı unvanlarla adlandırılabilir.',
  },
];

export default async function KariyerSayfasi() {
  const [MESLEKLER, YOLLAR] = await Promise.all([meslekler(), ogrenmeYollari()]);
  const yolHaritasi = new Map(YOLLAR.map((yol) => [yol.slug, yol]));

  const aileler = new Map<string, Meslek[]>();
  for (const meslek of MESLEKLER) {
    const aile = meslek.rolAilesi ?? DIGER;
    if (!aileler.has(aile)) aileler.set(aile, []);
    aileler.get(aile)!.push(meslek);
  }

  const bolumler = [...aileler.entries()].sort((a, b) => {
    const sa = AILE_SIRASI.indexOf(a[0] as (typeof AILE_SIRASI)[number]);
    const sb = AILE_SIRASI.indexOf(b[0] as (typeof AILE_SIRASI)[number]);
    return (sa === -1 ? 99 : sa) - (sb === -1 ? 99 : sb);
  });

  const rotayaBagli = MESLEKLER.filter((m) => m.yolSlug && yolHaritasi.has(m.yolSlug)).length;
  const basamakSayisi = MESLEKLER.reduce((t, m) => t + (m.seviyeler?.length ?? 0), 0);

  return (
    <>
      <ListeSemasi
        ad="AI meslekleri"
        ogeler={MESLEKLER.map((meslek) => ({ ad: meslek.ad, yol: `/kariyer/${meslek.slug}/` }))}
      />
      <SSSSemasi sorular={SORULAR} />

      <SayfaBasligi
        kirintilar={[{ ad: 'Kariyer', yol: '/kariyer/' }]}
        etiket="UNDERSTAND"
        baslik="AI kariyerleri"
        ozet="Unvanlar hızla değişiyor, işin kendisi daha yavaş. Her meslek sayfası ne yapıldığını, kıdem basamaklarının nasıl ayrıştığını, bir iş gününün neye benzediğini ve hangi rotanın oraya çıktığını söyler."
        olcumler={[
          { deger: `${MESLEKLER.length}`, etiket: 'Meslek' },
          { deger: `${bolumler.length}`, etiket: 'Rol ailesi' },
          { deger: `${basamakSayisi}`, etiket: 'Kıdem basamağı' },
          { deger: `${rotayaBagli}`, etiket: 'Rotaya bağlı' },
        ]}
        eylemler={
          <>
            <Dugme href="/seviye-testi/">
              Seviyeni ölç
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/ogren/yollar/" gorunum="ikincil">
              Öğrenme rotaları
            </Dugme>
          </>
        }
        desen="izgara"
      />

      {MESLEKLER.length === 0 ? (
        <Bolum>
          <BosDurum
            baslik="Meslek sayfaları hazırlanıyor"
            metin="Yayına girmiş meslek kaydı bulunmuyor. Hazır olduklarında iş tanımı, kıdem kırılımı ve bağlı öğrenme rotasıyla birlikte burada listelenecek."
          />
        </Bolum>
      ) : (
        bolumler.map(([aile, kayitlar], sira) => (
          <Bolum key={aile} zemin={sira % 2 === 0 ? 'derin' : undefined}>
            <BolumBasligi
              numara={String(sira + 1).padStart(2, '0')}
              etiket="ROL AİLESİ"
              baslik={aile}
              aciklama={AILE_TARIFI[aile] ?? `${kayitlar.length} meslek`}
            />
            <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar md:grid-cols-2">
              {kayitlar.map((meslek) => (
                <MeslekSatiri
                  key={meslek.slug}
                  meslek={meslek}
                  yolAdi={meslek.yolSlug ? yolHaritasi.get(meslek.yolSlug)?.ad : undefined}
                  yolSaat={meslek.yolSlug ? yolHaritasi.get(meslek.yolSlug)?.saat : undefined}
                />
              ))}
            </ul>
          </Bolum>
        ))
      )}

      <Bolum>
        <div className="olcu">
          <SSSBolumu sorular={SORULAR} />
        </div>
      </Bolum>
    </>
  );
}

function MeslekSatiri({
  meslek,
  yolAdi,
  yolSaat,
}: {
  meslek: Meslek;
  yolAdi?: string;
  yolSaat?: number;
}) {
  return (
    <li>
      <Link
        href={`/kariyer/${meslek.slug}/`}
        className="group flex h-full flex-col bg-zemin p-6 transition-colors hover:bg-yuzey/60"
      >
        <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-[1.0625rem] font-semibold tracking-tight text-metin group-hover:text-vurgu-parlak">
            {meslek.ad}
          </span>
          {meslek.seviyeler?.length ? (
            <span className="etiket-mono text-metin-soluk">{meslek.seviyeler.length} basamak</span>
          ) : null}
        </span>

        {/* İngilizce karşılık arama niyetiyle eşleşir ve okura aynı işin
            piyasadaki diğer adını söyler. */}
        {meslek.esAdlar?.length ? (
          <span className="etiket-mono mt-1.5 block text-metin-soluk">
            {meslek.esAdlar.slice(0, 2).join(' · ')}
          </span>
        ) : null}

        <span className="mt-3 block text-[0.875rem] leading-relaxed text-metin-ikincil">
          {meslek.ozet}
        </span>

        <span className="mt-4 flex flex-wrap gap-1.5">
          {meslek.beceriler.slice(0, 4).map((beceri) => (
            <span
              key={beceri}
              className="rounded-md border border-kenar-soluk bg-yuzey/50 px-2 py-0.5 text-[0.6875rem] text-metin-soluk"
            >
              {beceri}
            </span>
          ))}
        </span>

        <span className="etiket-mono mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-5 text-metin-soluk">
          {yolAdi ? (
            <>
              <span className="inline-flex items-center gap-1.5 text-basari">
                <Onay className="size-3.5" />
                Rota var
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Katman className="size-3.5" />
                {yolAdi}
              </span>
              {yolSaat ? (
                <span className="inline-flex items-center gap-1.5">
                  <Saat className="size-3.5" />~{yolSaat} sa
                </span>
              ) : null}
            </>
          ) : (
            <span>Rota hazırlanıyor</span>
          )}
          <Ok className="ml-auto size-3.5 transition-transform duration-200 ease-sinaptik group-hover:translate-x-0.5" />
        </span>
      </Link>
    </li>
  );
}
