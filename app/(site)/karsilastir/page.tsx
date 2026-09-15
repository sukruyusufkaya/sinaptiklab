import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { Ok, Terazi } from '@/components/arayuz/Ikonlar';
import { SSSBolumu } from '@/components/icerik/IcerikKenari';
import { ListeSemasi, SSSSemasi } from '@/lib/seo/jsonld';
import { KiyasSecici } from '@/components/kiyas/KiyasSecici';
import { KiyasTablosu } from '@/components/kiyas/KiyasTablosu';
import { MaliyetPaneli } from '@/components/kiyas/MaliyetPaneli';
import {
  EN_COK_KIYAS,
  isYukuBul,
  kiyasDizini,
  kiyasKayitlari,
  kiyasParametresi,
} from '@/lib/modeller/kiyas';
import { KARSILASTIRMALAR, modelListesi } from '@/lib/icerik/varliklar';
import { KATEGORI_ADI } from '@/lib/modeller/siniflandirma';

export const metadata: Metadata = {
  title: 'Model Karşılaştırma Stüdyosu',
  description:
    'Yayımlanmış liste fiyatı, bağlam penceresi, modalite ve lisans üzerinden dört modele kadar karşılaştırma. Skor yok, kaynaklı veri var; kurduğunuz kıyasın adresi paylaşılabilir.',
  alternates: { canonical: '/karsilastir/' },
};

/**
 * Model karşılaştırma stüdyosu.
 *
 * ÖNCEKİ HÂLİN ÜÇ KIRIĞI vardı ve üçü de aynı kökten geliyordu — sayfa
 * kataloğu bir LİSTE sanıyordu, oysa katalog 340 kayıtlık bir VERİ KÜMESİ:
 *
 *   1. 340 model, sıralanmamış 340 düğme olarak istemciye basılıyordu. HTML
 *      1,16 MB'tı ve aradığı modeli bulmanın yolu Ctrl+F'ti.
 *   2. Seçim `useState` içinde yaşıyordu: kurulan karşılaştırma
 *      paylaşılamıyor, yer imine eklenemiyor, geri tuşuyla dönülemiyordu.
 *   3. 135 kayıtta dolu olan `fiyatlandirma` alanı sitenin HİÇBİR yerinde
 *      basılmıyordu. Model seçiminin en belirleyici boyutu görünmezdi.
 *
 * Şimdi: seçici istemcide (arama ve süzgeç kişisel ve anlıktır), seçim URL'de
 * (`?m=`), tablo ve maliyet paneli sunucuda. `?fark=1` ortak satırları gizler.
 *
 * SAYFA DİNAMİK: `searchParams` okunduğu için önceden üretilmiyor. Bu bilinçli
 * bir takas — bir aracın çıktısı parametrelerine bağlıdır ve o parametreleri
 * adrese yazmak, karşılaştırmayı paylaşılabilir kılmanın tek yolu. Sayfanın
 * arama karşılığını taşıyan statik yüzeyler editoryal kıyaslardır
 * (`/karsilastir/<slug>/`), onlar önceden üretilmeye devam ediyor.
 *
 * PROGRAMATİK ÇOĞALTMA YOK: stüdyo istediğiniz kombinasyonu üretir ama her
 * kombinasyon için bir sayfa YAYIMLANMAZ (§03'teki politika). Bu ayrım
 * kasıtlıdır: araç kullanıcıya hizmet eder, sayfa dizine.
 */

const SORULAR = [
  {
    soru: 'Karşılaştırma tablosunda neden benchmark skoru yok?',
    cevap:
      'Bir skoru yayımlamak için hangi test setinin, hangi model sürümünün, hangi örnekleme ayarlarının ve kaç örneklemin kullanıldığının yayımlanmış olması gerekir. Bu bilgi olmadan basılan bir skor, karşılaştırılamaz iki ölçümü aynı sütuna koyar. Tabloda yalnızca sağlayıcının kendi yayımladığı ve kayıtta kaynak adresiyle bağlı olan alanlar bulunur.',
  },
  {
    soru: 'Aylık maliyet rakamları gerçek fatura mı?',
    cevap:
      'Hayır. Birim fiyatlar sağlayıcının yayımladığı liste fiyatlarıdır ve her hücre tarifesine bağlıdır; token hacimleri ise açıkça belirtilmiş varsayımlardır. Hesap düz bir çarpımdır ve toplu iş indirimi, istem önbelleği indirimi, bağlam eşiği üstü çarpanlar ile taahhütlü anlaşmaları içermez. Amaç faturayı bilmek değil, iki modelin aynı iş yükünde hangi büyüklük sırasında ayrıştığını görmek.',
  },
  {
    soru: 'Bazı modellerde fiyat sütunu neden boş?',
    cevap:
      'İki ayrı neden var. Kimi kayıtta sağlayıcı token tarifesi yayımlamamıştır. Kimisinde ise fiyat vardır ama birimi token değildir — görsel başına, video saniyesi başına veya ses saati başına. Bu fiyatları token sütununa koymak, bir modeli yüzlerce kat ucuz gösterirdi; bu yüzden sütun bilinçli olarak boş bırakılır ve modelin kendi sayfasında kendi biriminde gösterilir.',
  },
  {
    soru: 'Açık ağırlık ile açık kaynak aynı şey mi?',
    cevap:
      'Değil. Açık ağırlık, model ağırlıklarının indirilip kendi donanımınızda çalıştırılabilmesi demektir. Açık kaynak ise eğitim verisi, eğitim kodu ve lisansın da açık olmasını gerektirir. Katalogdaki pek çok model ağırlıklarını yayımlar ama kullanımını kısıtlayan özel bir lisansla gelir; tablodaki Lisans satırı bu ayrımı görünür kılar.',
  },
  {
    soru: 'Kurduğum karşılaştırmayı paylaşabilir miyim?',
    cevap:
      'Evet. Seçim adres çubuğuna yazılır, dolayısıyla adresi kopyalayıp gönderdiğinizde karşı taraf aynı tabloyu görür. Aynı nedenle tarayıcının geri tuşu önceki karşılaştırmaya döner ve kıyası yer imine ekleyebilirsiniz.',
  },
];

export default async function KarsilastirmaSayfasi({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const parametre = await searchParams;
  const secili = kiyasParametresi(parametre.m);
  const isYuku = isYukuBul(parametre.is);
  const yalnizFarklar = parametre.fark === '1';

  const [dizin, kayitlar, MODELLER] = await Promise.all([
    kiyasDizini(),
    kiyasKayitlari(secili),
    modelListesi(),
  ]);

  const modelHaritasi = new Map(MODELLER.map((model) => [model.slug, model]));
  const fiyatliAdet = dizin.filter((k) => k.girdiFiyat != null).length;
  const saglayiciAdet = new Set(dizin.map((k) => k.saglayici)).size;

  const seciliSorgu = kayitlar.map((k) => k.slug).join(',');
  const farkBaglantisi = () => {
    const p = new URLSearchParams({ m: seciliSorgu, is: isYuku.anahtar });
    if (!yalnizFarklar) p.set('fark', '1');
    return `/karsilastir/?${p.toString()}#studyo`;
  };

  return (
    <>
      <ListeSemasi
        ad="Editoryal model karşılaştırmaları"
        ogeler={KARSILASTIRMALAR.map((kiyas) => ({
          ad: kiyas.baslik,
          yol: `/karsilastir/${kiyas.slug}/`,
        }))}
      />
      <SSSSemasi sorular={SORULAR} />

      <SayfaBasligi
        kirintilar={[{ ad: 'Karşılaştırmalar', yol: '/karsilastir/' }]}
        etiket="UNDERSTAND"
        baslik="Model karşılaştırma stüdyosu"
        ozet="Dört modele kadar yan yana koyun. Tabloda yalnızca doğrulanabilir alanlar var: sağlayıcının yayımladığı liste fiyatı, bağlam penceresi, modalite, lisans ve erişim biçimi."
        olcumler={[
          { deger: `${dizin.length}`, etiket: 'Kıyaslanabilir model' },
          { deger: `${saglayiciAdet}`, etiket: 'Sağlayıcı' },
          { deger: `${fiyatliAdet}`, etiket: 'Token tarifeli' },
          { deger: `${KARSILASTIRMALAR.length}`, etiket: 'Editoryal kıyas' },
        ]}
        eylemler={
          <>
            <Dugme href="#studyo">
              Kıyası kur
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/lab/model-secici/" gorunum="ikincil">
              Kısıta göre öneri al
            </Dugme>
          </>
        }
        desen="nokta"
      />

      {/* --- Stüdyo --- */}
      <Bolum kimlik="studyo" zemin="derin">
        <BolumBasligi
          numara="01"
          etiket="STÜDYO"
          baslik="Kendi karşılaştırmanı kur"
          aciklama={`${dizin.length} model arasından en fazla ${EN_COK_KIYAS} tanesini seçin. Seçim adres çubuğuna yazılır: kurduğunuz kıyası paylaşabilir, yer imine ekleyebilir, geri tuşuyla önceki hâline dönebilirsiniz.`}
          arac={
            kayitlar.length >= 2 ? (
              <Link
                href={farkBaglantisi()}
                scroll={false}
                className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[0.8125rem] font-medium transition-colors ${
                  yalnizFarklar
                    ? 'border-vurgu/50 bg-vurgu-zemin text-vurgu-parlak'
                    : 'border-kenar-guclu bg-yuzey/60 text-metin hover:border-vurgu'
                }`}
              >
                {yalnizFarklar ? 'Tüm satırları göster' : 'Yalnızca farkları göster'}
              </Link>
            ) : undefined
          }
        />

        <div className="space-y-6">
          <KiyasSecici
            dizin={dizin}
            secili={kayitlar.map((k) => k.slug)}
            enCok={EN_COK_KIYAS}
            isYuku={isYuku.anahtar}
          />

          {kayitlar.length >= 2 ? (
            <KiyasTablosu kayitlar={kayitlar} yalnizFarklar={yalnizFarklar} />
          ) : (
            <div className="rounded-2xl border border-dashed border-kenar-guclu bg-zemin/60 px-6 py-12 text-center">
              <p className="etiket-mono mb-3 text-metin-soluk">En az iki model seçin</p>
              <p className="mx-auto max-w-md text-[0.875rem] leading-relaxed text-metin-ikincil">
                Tablo iki sütunla anlam kazanır. Yukarıdaki seçiciden ikinci bir model seçtiğinizde
                karşılaştırma kurulur.
              </p>
            </div>
          )}
        </div>
      </Bolum>

      {/* --- Maliyet --- */}
      <Bolum kimlik="maliyet">
        <BolumBasligi
          numara="02"
          etiket="MALİYET"
          baslik="Aynı iş yükünde aylık maliyet"
          aciklama="Girdi ve çıktı fiyatları tek başına karar verdirmez; hangi modelin ucuz olduğu iş yükünüzün girdi/çıktı oranına bağlıdır. Senaryoyu değiştirin, sıralamanın değiştiğini görün."
        />
        {kayitlar.length >= 1 ? (
          <MaliyetPaneli
            kayitlar={kayitlar}
            isYuku={isYuku}
            sorgu={{ m: seciliSorgu, fark: yalnizFarklar }}
          />
        ) : (
          <p className="text-[0.875rem] text-metin-ikincil">
            Maliyet karşılaştırması için yukarıdan model seçin.
          </p>
        )}
      </Bolum>

      {/* --- Editoryal kıyaslar --- */}
      <Bolum zemin="derin">
        <BolumBasligi
          numara="03"
          etiket="KIYASLAR"
          baslik="Editoryal kıyaslar"
          aciklama="Stüdyo boyutları yan yana koyar; editoryal kıyas hangi senaryoda hangisinin tercih edileceğini yazar."
        />

        <ul className="space-y-4">
          {KARSILASTIRMALAR.map((kiyas) => {
            const sol = modelHaritasi.get(kiyas.sol);
            const sag = modelHaritasi.get(kiyas.sag);
            return (
              <li key={kiyas.slug}>
                <Link
                  href={`/karsilastir/${kiyas.slug}/`}
                  className="group relative flex flex-col gap-5 rounded-2xl border border-kenar bg-yuzey/40 p-6 transition-[border-color,background-color] duration-300 hover:border-vurgu/45 hover:bg-yuzey/70 sm:flex-row sm:items-center"
                >
                  <span className="flex flex-1 items-center gap-4">
                    <span className="min-w-0 flex-1 text-right">
                      <span className="block text-[0.9375rem] font-semibold tracking-tight text-metin">
                        {sol?.ad}
                      </span>
                      <span className="etiket-mono mt-1 block text-metin-soluk">
                        {sol?.saglayici}
                      </span>
                    </span>

                    <span className="etiket-mono grid size-9 shrink-0 place-items-center rounded-full border border-kenar bg-zemin text-metin-soluk">
                      <Terazi className="size-4" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.9375rem] font-semibold tracking-tight text-metin">
                        {sag?.ad}
                      </span>
                      <span className="etiket-mono mt-1 block text-metin-soluk">
                        {sag?.saglayici}
                      </span>
                    </span>
                  </span>

                  <span className="min-w-0 sm:max-w-sm sm:border-l sm:border-kenar-soluk sm:pl-6">
                    <span className="block text-[0.8125rem] leading-relaxed text-metin-ikincil">
                      {kiyas.ozet}
                    </span>
                    <span className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-vurgu-parlak">
                      Kıyası aç
                      <Ok className="size-3.5 transition-transform duration-200 ease-sinaptik group-hover:translate-x-0.5" />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Bolum>

      {/* --- Katalog kapsamı --- */}
      <Bolum>
        <BolumBasligi
          numara="04"
          etiket="KAPSAM"
          baslik="Stüdyonun gördüğü katalog"
          aciklama="Seçici, model tipini serbest metinden değil kanonik kategoriden okur; böylece 'Gömme' ile 'Gömme (embedding)' aynı süzgeçte toplanır."
          baglantiYolu="/modeller/"
          baglantiMetni="Model kataloğu"
        />
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-3">
          {(
            Object.entries(
              dizin.reduce<Record<string, number>>((toplam, kayit) => {
                toplam[kayit.kategori] = (toplam[kayit.kategori] ?? 0) + 1;
                return toplam;
              }, {}),
            ) as [keyof typeof KATEGORI_ADI, number][]
          )
            .sort((a, b) => b[1] - a[1])
            .map(([kategori, adet]) => {
              const fiyatli = dizin.filter(
                (k) => k.kategori === kategori && k.girdiFiyat != null,
              ).length;
              return (
                <li key={kategori} className="bg-zemin p-5">
                  <p className="text-[0.9375rem] font-medium text-metin">
                    {KATEGORI_ADI[kategori]}
                  </p>
                  <p className="mt-1.5 font-mono text-2xl tabular-nums text-vurgu-parlak">{adet}</p>
                  <p className="etiket-mono mt-1 text-metin-soluk">
                    {fiyatli} tanesinde token tarifesi yayımlı
                  </p>
                </li>
              );
            })}
        </ul>
      </Bolum>

      {/* --- Politika --- */}
      <Bolum zemin="derin">
        <BolumBasligi
          numara="05"
          etiket="POLİTİKA"
          baslik="Neden binlerce karşılaştırma sayfası yok?"
        />
        <div className="olcu">
          <p className="font-serif text-[1.0625rem] leading-relaxed text-metin-ikincil">
            Şablonu aynı olan, yalnızca iki adın değiştiği sayfalar üretmek teknik olarak kolaydır.
            Ancak bu sayfalar okuyucuya karar verdirmez; yalnızca arama sonuçlarını doldurur.
          </p>
          <p className="mt-5 font-serif text-[1.0625rem] leading-relaxed text-metin-ikincil">
            Yukarıdaki stüdyo bu politikanın aksi değil, tam karşılığıdır: istediğiniz kombinasyonu{' '}
            <em>kurabilirsiniz</em>, ama hiçbiri ayrı bir sayfa olarak
            <em> yayımlanmaz</em>. Araç okura hizmet eder, sayfa dizine — ikisi karıştırıldığında
            ortaya çıkan şey, kimsenin okumadığı milyonlarca adres olur.
          </p>
          <p className="mt-5 font-serif text-[1.0625rem] leading-relaxed text-metin-ikincil">
            Sinaptik Lab&apos;de bir karşılaştırma ancak üç koşulu birlikte sağlıyorsa yayımlanır:
            karşılaştırılan boyutlar sizin kararınızı etkiliyor, veriler doğrulanmış, ve hangi
            senaryoda hangisinin tercih edileceği açıkça yazılmış.
          </p>
        </div>
      </Bolum>

      <Bolum>
        <div className="olcu">
          <SSSBolumu sorular={SORULAR} />
        </div>
      </Bolum>
    </>
  );
}
