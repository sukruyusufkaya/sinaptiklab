import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { Atlas, Ok } from '@/components/arayuz/Ikonlar';
import { SSSBolumu } from '@/components/icerik/IcerikKenari';
import { SSSSemasi, TerimKumesiSemasi } from '@/lib/seo/jsonld';
import { sozluk, type SozlukGirdisi } from '@/lib/icerik/atlas';
import { ATLAS_KATEGORILERI } from '@/lib/taksonomi';
import { kucult } from '@/lib/metin';

export const metadata: Metadata = {
  title: 'Yapay Zekâ Sözlüğü',
  description:
    'Üç yüzden fazla yapay zekâ teriminin tek satırlık, alıntılanabilir Türkçe tanımı. İngilizce karşılığı, kategorisi ve varsa ayrıntılı Atlas girdisiyle birlikte.',
  alternates: { canonical: '/sozluk/' },
};

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

  return (
    <>
      <TerimKumesiSemasi
        ad="Sinaptik Lab yapay zekâ sözlüğü"
        aciklama="Yapay zekâ terimlerinin Türkçe, tek satırlık ve alıntılanabilir tanımları."
        yol="/sozluk/"
        terimler={TERIMLER.map((t) => ({
          ad: t.terim,
          tanim: t.tanim,
          kimlik: t.slug,
          esAd: t.ingilizce,
        }))}
      />
      <SSSSemasi sorular={SORULAR} />

      <SayfaBasligi
        kirintilar={[{ ad: 'Sözlük', yol: '/sozluk/' }]}
        etiket="UNDERSTAND"
        baslik="Yapay zekâ sözlüğü"
        ozet="Tek satırlık, alıntılanabilir tanımlar. Her terim Türkçe karşılığı, İngilizce biçimi ve kategorisiyle birlikte verilir; ayrıntı gerektiren terimler Atlas girdisine bağlanır."
        olcumler={[
          { deger: `${TERIMLER.length}`, etiket: 'Terim' },
          { deger: `${siraliGruplar.length}`, etiket: 'Harf grubu' },
          { deger: `${kategoriSayimi.length}`, etiket: 'Kategori' },
          { deger: `${atlasBagli}`, etiket: 'Atlas girdisi olan' },
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

      {/* --- Kategori dağılımı --- */}
      <Bolum>
        <BolumBasligi
          numara="01"
          etiket="KATEGORİLER"
          baslik="Terimler hangi alanlarda"
          aciklama="Kategori adları Atlas taksonomisiyle aynı; aynı terim iki listede farklı ada sahip olmaz."
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

      <Bolum zemin="derin">
        <BolumBasligi
          numara="02"
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

function TerimSatiri({ kayit }: { kayit: SozlukGirdisi }) {
  /*
   * ATLAS GİRDİSİ OLAN TERİM BAĞLANTILI, OLMAYAN DEĞİL.
   *
   * Eski sürüm her terimi `/atlas/<slug>/` adresine bağlıyordu; sözlük Atlas
   * koleksiyonundan okurken bu doğruydu. Terimler kendi koleksiyonuna
   * taşındığında aynı bağlantı 324 terimin 289'unda 404 verirdi. Bağlantı
   * yalnızca hedefi olan terimde basılır.
   */
  const govde = (
    <>
      <span className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span
          id={`terim-${kayit.slug}`}
          className={`scroll-mt-28 text-[0.9375rem] font-semibold tracking-tight ${
            kayit.atlasSlug ? 'text-vurgu-parlak' : 'text-metin'
          }`}
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
        <span className="mt-1 block text-[0.8125rem] text-metin-soluk italic">
          {kayit.ingilizce}
        </span>
      )}
    </>
  );

  return (
    <div className="group grid gap-2 py-4 md:grid-cols-[17rem_1fr] md:gap-6">
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
      <dd className="text-[0.9375rem] leading-relaxed text-metin-ikincil">
        {kayit.tanim}
        <span className="etiket-mono mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-metin-soluk">
          {kayit.kategoriSlug ? (
            <Link
              href={`/atlas/kategori/${kayit.kategoriSlug}/`}
              className="transition-colors hover:text-vurgu-parlak"
            >
              {kayit.kategori}
            </Link>
          ) : (
            <span>{kayit.kategori}</span>
          )}
          {kayit.atlasSlug && (
            <Link
              href={`/atlas/${kayit.atlasSlug}/`}
              className="inline-flex items-center gap-1.5 text-vurgu-sonuk transition-colors hover:text-vurgu-parlak"
            >
              <Atlas className="size-3" />
              Atlas girdisi
            </Link>
          )}
        </span>
      </dd>
    </div>
  );
}
