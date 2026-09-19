import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { Rozet } from '@/components/arayuz/Rozet';
import { Atlas, Ok, OkSagUst } from '@/components/arayuz/Ikonlar';
import { SSSBolumu } from '@/components/icerik/IcerikKenari';
import { SSSSemasi, TerimKumesiSemasi } from '@/lib/seo/jsonld';
import { sozluk, type SozlukGirdisi } from '@/lib/icerik/atlas';
import { ATLAS_KATEGORILERI } from '@/lib/taksonomi';
import { kucult } from '@/lib/metin';

/**
 * Yapay zekâ sözlüğü.
 *
 * ÖNCEDEN 35 TERİM VARDI çünkü sayfa doğrudan `atlas` koleksiyonunu okuyordu;
 * sözlüğü büyütmenin tek yolu yeni bir Atlas girdisi — yani gövdesi, SSS'si,
 * kaynakları ve sürüm geçmişi olan ağır bir editoryal ürün — açmaktı. Artık
 * sözlük kendi hafif koleksiyonundan (`terimler`) okuyor ve Atlas girdisi olan
 * terimler `atlasSlug` ile oraya bağlanıyor.
 *
 * TERİMİN KENDİ SAYFASI YOKTUR ve olmayacak: tek satırlık bir tanım için ayrı
 * bir adres açmak, arama sonuçlarını ince sayfalarla doldurur (MASTER-PLAN
 * §51). Derinlik isteyen terim Atlas'a taşınır — sözlük o zaman ona bağlanır.
 *
 * SAYFA İKİ SORUYU BİRDEN CEVAPLAR. "Bu nedir?" sorusunun cevabı tanımdır;
 * "bu hâlâ kullanılıyor mu?" sorusunun cevabı `asama` alanıdır. Hızlı değişen
 * bir alanda ikincisini atlayan sözlük, okuru kullanımdan kalkmış bir
 * özelliğin peşine yollar — MCP'nin `sampling` özelliği sözlükte yalın bir
 * tanım olarak dursaydı tam olarak bu olurdu. Aşaması yerleşik olmayan her
 * terim gerekçesini (`asamaNotu`) taşır; dayanaksız etiket basılmaz (§59).
 *
 * HARF GRUPLAMASINDA TÜRKÇE TUZAĞI: baş harfi `toLocaleUpperCase('tr-TR')` ile
 * almak "İstem" ile "Istem"i ayrı gruplara düşürür ve "I" harfi Türkçe
 * alfabede olmadığı hâlde başlık olarak görünür. `kucult()` ile küçültüp
 * görünen harfi tek bir eşlemeden almak, grubun hem doğru hem kararlı
 * olmasını sağlar.
 */

/** Türkçe alfabe sırası — `localeCompare` ile uyumlu, kararlı grup sırası. */
const ALFABE = [
  'A',
  'B',
  'C',
  'Ç',
  'D',
  'E',
  'F',
  'G',
  'Ğ',
  'H',
  'I',
  'İ',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'Ö',
  'P',
  'R',
  'S',
  'Ş',
  'T',
  'U',
  'Ü',
  'V',
  'Y',
  'Z',
];

/** Küçük harften görünen büyük harfe — `İ`/`I` çiftini doğru ayırır. */
const BUYUK_HARF: Record<string, string> = {
  a: 'A',
  b: 'B',
  c: 'C',
  ç: 'Ç',
  d: 'D',
  e: 'E',
  f: 'F',
  g: 'G',
  ğ: 'Ğ',
  h: 'H',
  ı: 'I',
  i: 'İ',
  j: 'J',
  k: 'K',
  l: 'L',
  m: 'M',
  n: 'N',
  o: 'O',
  ö: 'Ö',
  p: 'P',
  r: 'R',
  s: 'S',
  ş: 'Ş',
  t: 'T',
  u: 'U',
  ü: 'Ü',
  v: 'V',
  y: 'Y',
  z: 'Z',
};

function basHarf(terim: string): string {
  const ilk = kucult(terim).charAt(0);
  return BUYUK_HARF[ilk] ?? ilk.toUpperCase();
}

/**
 * Aşama etiketleri.
 *
 * `yerlesik` görünmez: sözlükteki terimlerin ezici çoğunluğu yerleşiktir ve
 * hepsine rozet basmak, gerçekten bilgi taşıyan iki rozeti gürültüye boğardı.
 */
const ASAMA_ETIKETI = {
  yeni: { ad: 'Yerleşmekte', ton: 'sinyal' as const },
  'kullanimdan-kalkti': { ad: 'Kullanımdan kalktı', ton: 'uyari' as const },
};

/**
 * Sayfanın alıntılanabilir çekirdeği (MASTER-PLAN §56 — answer-first).
 *
 * Bir dil modeli bu sayfayı okuduğunda "Sinaptik Lab sözlüğü nedir?" sorusuna
 * doğrudan bu paragrafı kullanabilir. Sayısı canlı sorgudan gelir; elle
 * yazılmış "500+ terim" ifadesi bir gün gerçekle çelişirdi (§59).
 */
function kisaCevap(toplam: number, kategori: number): string {
  return `Sinaptik Lab yapay zekâ sözlüğü, ${toplam} terimin Türkçe ve tek satırlık tanımını tek sayfada toplar. Her girdi terimin İngilizce karşılığını, ${kategori} alan kategorisinden birini ve alanda yerleşik mi yoksa kullanımdan kalkmış mı olduğunu gösterir; ayrıntı gerektiren terimler AI Atlas girdisine bağlanır.`;
}

export async function generateMetadata(): Promise<Metadata> {
  const TERIMLER = await sozluk();
  const kategoriSayisi = new Set(TERIMLER.map((t) => t.kategoriSlug).filter(Boolean)).size;

  /*
   * BAŞLIK VE AÇIKLAMA CANLI SAYIYLA ÜRETİLİR. Sabit "üç yüzden fazla" metni
   * sözlük 538 terime çıktığında yanlış olmuştu; bir daha olmasın diye sayı
   * tek bir yerden, verinin kendisinden geliyor.
   */
  return {
    title: `Yapay Zekâ Sözlüğü — ${TERIMLER.length} terim`,
    description: kisaCevap(TERIMLER.length, kategoriSayisi),
    alternates: { canonical: '/sozluk/' },
    openGraph: {
      title: `Yapay zekâ sözlüğü — ${TERIMLER.length} Türkçe terim`,
      description: kisaCevap(TERIMLER.length, kategoriSayisi),
      url: '/sozluk/',
      type: 'website',
    },
  };
}

const SORULAR = [
  {
    soru: 'Sözlük ile AI Atlas arasındaki fark nedir?',
    cevap:
      'Sözlük tek satırlık tanım verir: bir terimi duyup ne olduğunu öğrenmek istediğinizde bakılacak yer. Atlas ise kavramı açar — nasıl çalıştığı, hangi ödünleşimleri getirdiği, nerede yanlış kullanıldığı ve kaynakları. Bu yüzden sözlükteki her terimin Atlas girdisi yoktur; olanlar terimin yanındaki bağlantıdan erişilir.',
  },
  {
    soru: 'Terimlerin İngilizce karşılığı neden veriliyor?',
    cevap:
      'Bu alanın literatürü İngilizce üretiliyor ve okurun karşılaştığı biçim çoğunlukla İngilizce oluyor. Türkçe karşılığı vermek yeterli değil: okurun "embedding" diye gördüğü şeyin "gömme" olduğunu bilmesi gerekiyor. İki biçimi birlikte vermek, terimi hem anlamayı hem literatürde izlemeyi mümkün kılar.',
  },
  {
    soru: 'Her terimin kendi sayfası neden yok?',
    cevap:
      'Tek satırlık bir tanım için ayrı bir adres açmak, birbirine çok benzeyen yüzlerce ince sayfa üretir. Bu sayfalar okura bir şey kazandırmaz, yalnızca arama sonuçlarını doldurur. Derinlik gerektiren bir terim Atlas girdisine taşınır; sözlük de o zaman ona bağlanır.',
  },
  {
    soru: 'Türkçe karşılıklar nasıl seçiliyor?',
    cevap:
      'Ölçüt yaygın kullanım. Alanda yerleşmiş bir Türkçe karşılık varsa o kullanılır; yoksa İngilizce biçim korunur ve açıklaması Türkçe verilir. Zorlama çeviri üretmek, terimi tanınmaz hâle getirip okurun literatürle bağını koparır.',
  },
  {
    soru: '"Yerleşmekte" ve "kullanımdan kalktı" etiketleri ne anlama geliyor?',
    cevap:
      '"Yerleşmekte", terimin alanda kullanıldığını ama tanımının henüz oturmadığını gösterir — bugün yazılan tanım bir yıl sonra dar kalabilir. "Kullanımdan kalktı" ise terimin karşılığı olan özelliğin ya da yaklaşımın resmen geçersiz sayıldığını söyler; örneğin bir protokol sürümüyle bir özellik kaldırıldığında. Her iki etiket de gerekçesiyle birlikte verilir, gerekçesi olmayan etiket basılmaz.',
  },
  {
    soru: 'Kullanımdan kalkmış terimler neden siliniyor değil?',
    cevap:
      'Çünkü okur onlarla karşılaşmaya devam ediyor: eski dokümantasyonda, mevcut kod tabanında, bir yıl önce yazılmış blog yazısında. Terimi silmek okuru cevapsız bırakır. Kalması ve "artık kullanılmıyor, yerine şu geldi" demesi, hem soruyu cevaplar hem de doğru yöne çevirir.',
  },
  {
    soru: 'Terimler ne sıklıkta güncelleniyor?',
    cevap:
      'Sözlük sabit bir takvimle değil, alan değiştikçe güncelleniyor. Bir protokol sürümü bir özelliği kaldırdığında ya da yeni bir kavram literatürde tutunduğunda ilgili girdiler düzeltilir. İçerik değişmeden tarih güncellenmez; tazelik izlenimi vermek için yapılan güncelleme yanıltıcıdır.',
  },
  {
    soru: 'Sözlükteki tanımlar alıntılanabilir mi?',
    cevap:
      'Evet. Tanımlar bu amaçla, kendi başına tam ve kaynak gerektirmeyen cümleler olarak yazılıyor. Alıntılarken kanonik adresin (sinaptiklab.com/sozluk/) ve terimin çapasının (#terim-<slug>) verilmesi yeterlidir.',
  },
];

export default async function SozlukSayfasi() {
  const TERIMLER = await sozluk();

  // Harf grupları: alfabe sırasına göre kurulur, boş harf atlanır.
  const gruplar = new Map<string, SozlukGirdisi[]>();
  for (const kayit of TERIMLER) {
    const harf = basHarf(kayit.terim);
    gruplar.set(harf, [...(gruplar.get(harf) ?? []), kayit]);
  }
  const siraliGruplar = [...gruplar.entries()].sort(
    (a, b) => ALFABE.indexOf(a[0]) - ALFABE.indexOf(b[0]),
  );

  const atlasBagli = TERIMLER.filter((t) => t.atlasSlug).length;
  const kategoriSayimi = ATLAS_KATEGORILERI.map((kategori) => ({
    ...kategori,
    adet: TERIMLER.filter((t) => t.kategoriSlug === kategori.slug).length,
  })).filter((k) => k.adet > 0);

  /*
   * Aşaması yerleşik olmayan terimler ayrı bir bölümde öne çıkar. Bu bölüm
   * sözlüğün en hızlı eskiyen ve en çok aranan dilimidir: okur "MCP'de ne
   * değişti" ya da "A2A ne demek" diye geldiğinde 538 satırlık dizinde
   * aramak zorunda kalmaz.
   */
  const yeniler = TERIMLER.filter((t) => t.asama === 'yeni');
  const kalkanlar = TERIMLER.filter((t) => t.asama === 'kullanimdan-kalkti');
  const kaynakli = TERIMLER.filter((t) => t.kaynak).length;

  return (
    <>
      <TerimKumesiSemasi
        ad="Sinaptik Lab yapay zekâ sözlüğü"
        aciklama={kisaCevap(TERIMLER.length, kategoriSayimi.length)}
        yol="/sozluk/"
        terimler={TERIMLER.map((t) => ({
          ad: t.terim,
          tanim: t.tanim,
          kimlik: t.slug,
          esAd: t.ingilizce,
          kaynakAdresi: t.kaynak?.adres,
        }))}
      />
      <SSSSemasi sorular={SORULAR} />

      <SayfaBasligi
        kirintilar={[{ ad: 'Sözlük', yol: '/sozluk/' }]}
        etiket="UNDERSTAND"
        baslik="Yapay zekâ sözlüğü"
        ozet="Tek satırlık, alıntılanabilir tanımlar. Her terim Türkçe karşılığı, İngilizce biçimi ve kategorisiyle birlikte verilir; alanda yerleşmemiş ya da kullanımdan kalkmış olanlar gerekçesiyle işaretlenir."
        olcumler={[
          { deger: `${TERIMLER.length}`, etiket: 'Terim' },
          { deger: `${kategoriSayimi.length}`, etiket: 'Kategori' },
          { deger: `${atlasBagli}`, etiket: 'Atlas girdisi olan' },
          { deger: `${yeniler.length + kalkanlar.length}`, etiket: 'İşaretli' },
        ]}
        eylemler={
          <>
            <Dugme href="/atlas/">
              Ayrıntılı Atlas
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/ogren/beceri-grafigi/" gorunum="ikincil">
              Kavram ağı
            </Dugme>
          </>
        }
        desen="nokta"
      />

      {/* --- Answer-first çekirdek (§56) --- */}
      <Bolum>
        <div className="olcu">
          <p className="border-l-2 border-vurgu pl-5 text-lg leading-relaxed text-metin">
            {kisaCevap(TERIMLER.length, kategoriSayimi.length)}
          </p>
          <p className="mt-5 text-[0.9375rem] leading-relaxed text-metin-ikincil">
            Sözlük iki katmanlıdır. Tek satırlık tanım yeten terim burada kalır; nasıl çalıştığı,
            hangi ödünleşimleri getirdiği ve nerede yanlış kullanıldığı anlatılması gereken terim{' '}
            <Link href="/atlas/" className="text-vurgu-parlak hover:underline">
              AI Atlas
            </Link>{' '}
            girdisine taşınır — şu an {atlasBagli} terim böyle. Terimlerin {kaynakli} tanesi
            tanımının dayandığı birincil kaynağa (spesifikasyon, mevzuat metni ya da resmî
            dokümantasyon) doğrudan bağlanır.
          </p>
        </div>
      </Bolum>

      {/* --- Kategori dağılımı --- */}
      <Bolum zemin="derin">
        <BolumBasligi
          numara="01"
          etiket="KATEGORİLER"
          baslik="Terimler hangi alanlarda"
          aciklama="Kategori adları Atlas taksonomisiyle aynı; aynı terim iki listede farklı ada sahip olmaz. Bir kategoriye tıklamak o alanın hem Atlas girdilerini hem tüm sözlük terimlerini getirir."
          baglantiYolu="/atlas/"
          baglantiMetni="Atlas kategorileri"
        />
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-4">
          {kategoriSayimi
            .slice()
            .sort((a, b) => b.adet - a.adet)
            .map((kategori) => (
              <li key={kategori.slug}>
                <Link
                  href={`/atlas/kategori/${kategori.slug}/`}
                  className="group flex h-full flex-col bg-zemin p-5 transition-colors hover:bg-yuzey/60"
                >
                  <span className="text-[0.9375rem] font-medium text-metin group-hover:text-vurgu-parlak">
                    {kategori.ad}
                  </span>
                  <span className="mt-1.5 font-mono text-2xl tabular-nums text-vurgu-parlak">
                    {kategori.adet}
                  </span>
                  <span className="etiket-mono mt-1 text-metin-soluk">terim</span>
                </Link>
              </li>
            ))}
        </ul>
      </Bolum>

      {/* --- Aşama işaretli terimler (§60 — tazelik) --- */}
      {(yeniler.length > 0 || kalkanlar.length > 0) && (
        <Bolum>
          <BolumBasligi
            numara="02"
            etiket="DEĞİŞEN TERİMLER"
            baslik="Yerleşmekte olanlar ve kullanımdan kalkanlar"
            aciklama="Bir sözlük yalnızca “bu nedir?” sorusunu cevaplarsa hızlı değişen bir alanda yanıltır. Aşağıdaki terimler ikinci soruyu da cevaplar: bu hâlâ kullanılıyor mu? Her işaret gerekçesiyle birlikte verilir."
          />

          <div className="grid gap-8 lg:grid-cols-2">
            <AsamaListesi
              baslik="Yerleşmekte olan terimler"
              aciklama="Alanda kullanılıyor, tanımı henüz oturmadı. Burada verilen tanım bugünkü kullanımı yansıtır; değiştiğinde güncellenir."
              kayitlar={yeniler}
            />
            <AsamaListesi
              baslik="Kullanımdan kalkan terimler"
              aciklama="Karşılığı olan özellik ya da yaklaşım resmen geçersiz sayıldı. Silinmiyorlar: okur onlarla eski dokümantasyonda karşılaşmaya devam ediyor."
              kayitlar={kalkanlar}
            />
          </div>
        </Bolum>
      )}

      <Bolum zemin="derin">
        <BolumBasligi
          numara="03"
          etiket="TÜM TERİMLER"
          baslik="Alfabetik dizin"
          aciklama="Mor işaretli terimlerin ayrıntılı Atlas girdisi yayında; diğerlerinde tanım nihai biçimidir."
        />

        {/* Harf gezinmesi */}
        <nav aria-label="Harfe göre gezinme" className="mb-10 flex flex-wrap gap-1.5">
          {siraliGruplar.map(([harf, kayitlar]) => (
            <a
              key={harf}
              href={`#harf-${kucult(harf)}`}
              title={`${kayitlar.length} terim`}
              className="etiket-mono grid size-9 place-items-center rounded-lg border border-kenar text-metin-ikincil transition-colors hover:border-vurgu hover:text-metin"
            >
              {harf}
            </a>
          ))}
        </nav>

        <div className="space-y-12">
          {siraliGruplar.map(([harf, kayitlar]) => (
            <section key={harf} id={`harf-${kucult(harf)}`} className="scroll-mt-28">
              <h3 className="mb-4 flex items-center gap-4 border-b border-kenar pb-3">
                <span className="font-mono text-2xl font-medium text-vurgu-parlak">{harf}</span>
                <span className="etiket-mono text-metin-soluk">{kayitlar.length} terim</span>
              </h3>

              <dl className="divide-y divide-kenar-soluk">
                {kayitlar.map((kayit) => (
                  <TerimSatiri key={kayit.slug} kayit={kayit} />
                ))}
              </dl>
            </section>
          ))}
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

/** Aşama işaretli terimlerin kompakt listesi — çapaya götürür, tanımı tekrar etmez. */
function AsamaListesi({
  baslik,
  aciklama,
  kayitlar,
}: {
  baslik: string;
  aciklama: string;
  kayitlar: SozlukGirdisi[];
}) {
  if (kayitlar.length === 0) return null;

  return (
    <div className="rounded-2xl border border-kenar bg-zemin p-6">
      <h3 className="flex flex-wrap items-baseline gap-x-3 text-[0.9375rem] font-semibold tracking-tight text-metin">
        {baslik}
        <span className="etiket-mono text-metin-soluk tabular-nums">{kayitlar.length}</span>
      </h3>
      <p className="mt-2 text-[0.8125rem] leading-relaxed text-metin-ikincil">{aciklama}</p>

      <ul className="mt-5 space-y-4">
        {kayitlar.map((kayit) => (
          <li key={kayit.slug} className="border-t border-kenar-soluk pt-4">
            <a
              href={`#terim-${kayit.slug}`}
              className="text-[0.9375rem] font-medium text-metin transition-colors hover:text-vurgu-parlak"
            >
              {kayit.terim}
            </a>
            {kayit.ingilizce && kayit.ingilizce !== kayit.terim && (
              <span className="ml-2 text-[0.8125rem] text-metin-soluk italic">
                {kayit.ingilizce}
              </span>
            )}
            {kayit.asamaNotu && (
              <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-metin-ikincil">
                {kayit.asamaNotu}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TerimSatiri({ kayit }: { kayit: SozlukGirdisi }) {
  /*
   * ATLAS GİRDİSİ OLAN TERİM BAĞLANTILI, OLMAYAN DEĞİL.
   *
   * Eski sürüm her terimi `/atlas/<slug>/` adresine bağlıyordu; sözlük Atlas
   * koleksiyonundan okurken bu doğruydu. Terimler kendi koleksiyonuna
   * taşındığında aynı bağlantı terimlerin ezici çoğunluğunda 404 verirdi.
   * Bağlantı yalnızca hedefi olan terimde basılır.
   */
  const asama = kayit.asama === 'yerlesik' ? undefined : ASAMA_ETIKETI[kayit.asama];

  const govde = (
    <>
      <span className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span
          id={`terim-${kayit.slug}`}
          className={`sozluk-terim ${kayit.atlasSlug ? 'text-vurgu-parlak' : 'text-metin'}`}
        >
          {kayit.terim}
        </span>
        {kayit.kisaltma && (
          <span className="etiket-mono rounded border border-kenar-soluk px-1.5 py-0.5 text-metin-soluk">
            {kayit.kisaltma}
          </span>
        )}
      </span>
      {kayit.ingilizce && kayit.ingilizce !== kayit.terim && (
        <span className="sozluk-ingilizce">{kayit.ingilizce}</span>
      )}
      {asama && (
        <Rozet ton={asama.ton} className="mt-2">
          {asama.ad}
        </Rozet>
      )}
    </>
  );

  return (
    <div className="grid gap-2 py-4 md:grid-cols-[17rem_1fr] md:gap-6">
      <dt>
        {kayit.atlasSlug ? (
          <Link
            href={`/atlas/${kayit.atlasSlug}/`}
            className="block transition-opacity hover:opacity-80"
          >
            {govde}
          </Link>
        ) : (
          govde
        )}
      </dt>
      <dd className="sozluk-tanim">
        {kayit.tanim}

        {/*
         * AŞAMA NOTU TANIMDAN AYRI BİR SATIRDA. Tanıma karıştırılsaydı
         * alıntılanan cümle "…sağlıyordu. MCP 2026-07-28 ile kaldırıldı."
         * hâline gelir ve terimin tanımı ile o tanımın geçerlilik bilgisi
         * birbirine karışırdı. Şema da yalnızca `tanim` alanını `description`
         * olarak basar.
         */}
        {kayit.asamaNotu && <span className="sozluk-not">{kayit.asamaNotu}</span>}

        {kayit.ilgili.length > 0 && (
          <span className="sozluk-ilgili">
            İlgili:{' '}
            {kayit.ilgili.map((ilgi, sira) => (
              <span key={ilgi.slug}>
                {sira > 0 && <span aria-hidden="true"> · </span>}
                <a href={`#terim-${ilgi.slug}`} className="hover:text-vurgu-parlak">
                  {ilgi.terim}
                </a>
              </span>
            ))}
          </span>
        )}

        <span className="etiket-mono sozluk-kunye">
          {kayit.kategoriSlug ? (
            <Link
              href={`/atlas/kategori/${kayit.kategoriSlug}/`}
              className="hover:text-vurgu-parlak"
            >
              {kayit.kategori}
            </Link>
          ) : (
            <span>{kayit.kategori}</span>
          )}
          {kayit.atlasSlug && (
            <Link
              href={`/atlas/${kayit.atlasSlug}/`}
              className="inline-flex items-center gap-1.5 text-vurgu-sonuk hover:text-vurgu-parlak"
            >
              <Atlas className="size-3" />
              Atlas girdisi
            </Link>
          )}
          {kayit.kaynak && (
            <a
              href={kayit.kaynak.adres}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-vurgu-parlak"
            >
              {kayit.kaynak.ad}
              <OkSagUst className="size-3" />
            </a>
          )}
        </span>
      </dd>
    </div>
  );
}
