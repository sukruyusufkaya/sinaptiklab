import type { Ders, OgrenmeYolu, SeoAlanlari, Seviye, Soru, Test, YolBolumu } from '@/lib/tipler';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { slugIle, yayindakiler, yayindaSayisi } from '@/lib/mongo/sorgular/site';
import { ATLAS_KATEGORI_ADI } from '@/lib/taksonomi';

/**
 * Öğrenme okuma modülü — `ogrenme_yollari`, `dersler`, `testler`, `sorular`.
 *
 * `lib/veri/ogrenme.ts` ve `lib/veri/sorular.ts` fixture'larının yerine geçer;
 * `lib/icerik/atlas.ts` kalıbını izler (aynı adlar, `async` sürümler).
 *
 * ÜÇ ŞEKİL FARKI — hepsi burada, okuma katmanında çözülür:
 *
 * 1. **`ornekSorular` şemada YOK.** Fixture'da test kaydı soruların tamamını
 *    gömülü taşıyordu; tohumlama bunu düşürdü ve yerine `soruEtiketi` yazdı.
 *    Sorular `sorular` koleksiyonunda durur ve `etiketler` dizisiyle testine
 *    bağlanır (`ai-temelleri-testi` → etiket `ai-temelleri`). Bu yüzden liste
 *    fonksiyonu `TestKunyesi` döndürür (soru taşımaz) ve sorular ayrı
 *    fonksiyonla okunur: `testinSorulari(soruEtiketi)`. Detay sayfası için
 *    ikisini birleştiren `testiSorulariylaBul()` var; dönüşü `Test` tipiyle
 *    yapısal olarak uyumludur. Ayrımın nedeni yalnızca tipler değil: doğru
 *    cevap ve açıklama liste sayfalarına hiç gitmesin (şema notu: "doğru cevap
 *    ve açıklama sunucu tarafında kalır").
 *
 * 2. **`sorular` koleksiyonunun anahtarı `kimlik`, slug değil.** `slugIle`
 *    burada kullanılmaz; süzgeç `{ etiketler: <etiket> }` ile kurulur
 *    (`secim` dizini: `etiketler + zorluk`). Seviye testinin soruları da aynı
 *    yerdedir, `seviye` etiketiyle işaretli — `SEVIYE_SORULARI` fixture'ı yeni
 *    soru tanımlamıyordu, var olanları referans ediyordu.
 *
 * 3. **Hesaplanan değerler.** Fixture `soruSayisi`'nı `SORU.X.length` ile
 *    üretiyordu. Şemada alan var ve tohumlama doldurdu; yine de eksikse değer
 *    UYDURULMAZ, soru bankasından SAYILIR (`yayindaSayisi`). Aynı ilke rota
 *    künyesinde de geçerli: `bolum` yoksa `bolumler.length`, `saat` yoksa
 *    bölüm sürelerinin toplamı hesaplanır.
 *
 * İLİŞKİ NOTU: bu dört koleksiyonun hiçbirinde `konuSlug`/`yazarSlug` ile
 * gömülü `Konu`/`Yazar` isteyen bir alan yok — `Test.konu` ve `Soru.konu` düz
 * metindir (görünen ad). Bu yüzden `lib/icerik/temel.ts` birleştiricilerine
 * ihtiyaç duyulmaz. `testler.konuSlug` ise ARTIK `konular` koleksiyonunun
 * slug'ıdır. Eskiden değildi: ilk tohumlama onu Atlas kategorilerinden
 * (`ATLAS_KATEGORILERI`) üretmişti, yani hiçbir konu merkezi kendi testini
 * bulamıyordu. Alan taksonomiye taşındı ve bağ `konuyaGoreTestler()` ile
 * kurulur. `ATLAS_KATEGORI_ADI` eşlemesi `testKunyesine` içinde YEDEK olarak
 * kalıyor — `konu` adı yazılmamış eski bir kaydı düşürmemek için.
 *
 * SIRALAMA: `ogrenme_yollari` ve `testler` şemalarında `sira` alanı yok, yani
 * fixture'daki kürasyon sırası Mongo'ya HİÇ taşınmadı. Uydurma bir sıra
 * üretmemek için ada göre Türkçe sıralanırlar (Atlas modülündeki ilke).
 * `dersler` sıralanabilir: tohumlama rota içi sırayı `sira` alanına yazdı,
 * `rota_sirasi` dizini de bunun üzerine kurulu.
 *
 * ÜSTVERİ: `ogrenme_yollari`, `dersler` ve `testler` şemalarında `seo` alanı
 * var; üç görünüme çevirme fonksiyonu da alanları TEK TEK yazdığı için alan
 * sessizce düşüyordu. Şimdi üçü de taşır (`yolGorunume`, `dersGorunume`,
 * `testKunyesine`) ve rota/ders/test sayfalarının `generateMetadata`'sı
 * `ustveriBirlestir()` ile okuyabilir. `sorular` şemasında `seo` yoktur —
 * sorunun kendi adresi de yok.
 *
 * DURUM: dört koleksiyonun tamamında `durum` alanı var, hiçbirinde
 * `durumsuz: true` verilmez. `sorular` şemasında `durum` ZORUNLU alanlar
 * arasında değil; `durum` yazılmamış bir soru yayında sayılmaz ve sitede
 * görünmez — panelden soru eklenirken bu alan doldurulmalıdır.
 */

/* --- ÖĞRENME YOLLARI ------------------------------------------------------ */

/** Şemadaki bölüm: `dersSluglari` şemada var, `YolBolumu` tipinde yok. */
type YolBolumuBelgesi = {
  ad: string;
  ozet: string;
  sure: string;
  kavramlar?: string[];
  dersSluglari?: string[];
};

/**
 * Şemadaki hâl. `bolum`, `saat`, `aciklama`, `cikti` site tipinde ZORUNLU ama
 * şemada isteğe bağlı; burada gerçek durum yazılır, eksiklik `yolGorunume()`
 * içinde karşılanır.
 */
type YolBelgesi = {
  slug: string;
  ad: string;
  rol: string;
  seviyeAraligi: string;
  bolum?: number;
  saat?: number;
  aciklama?: string;
  cikti?: string[];
  onkosullar?: string[];
  kimeGore?: string;
  bolumler?: YolBolumuBelgesi[];
  seo?: SeoAlanlari;
};

/** Bölüm süresi metni ("1,5 sa", "45 dk") → saat. Çözülemezse 0. */
function sureSaate(sure: string): number {
  const sayi = Number.parseFloat(sure.replace(',', '.'));
  if (!Number.isFinite(sayi)) return 0;
  return /dk|dakika/i.test(sure) ? sayi / 60 : sayi;
}

function yolGorunume(belge: YolBelgesi): OgrenmeYolu {
  const bolumler: YolBolumu[] = (belge.bolumler ?? []).map((bolum) => ({
    ad: bolum.ad,
    ozet: bolum.ozet,
    sure: bolum.sure,
    // Şemada isteğe bağlı, tipte zorunlu: kavramı olmayan bölüm boş liste alır.
    kavramlar: bolum.kavramlar ?? [],
  }));

  const yol: OgrenmeYolu = {
    slug: belge.slug,
    ad: belge.ad,
    rol: belge.rol,
    seviyeAraligi: belge.seviyeAraligi,
    bolum: belge.bolum ?? bolumler.length,
    saat: belge.saat ?? Math.round(bolumler.reduce((t, b) => t + sureSaate(b.sure), 0)),
    aciklama: belge.aciklama ?? '',
    cikti: belge.cikti ?? [],
    onkosullar: belge.onkosullar,
    kimeGore: belge.kimeGore,
    seo: belge.seo,
  };

  return bolumler.length ? { ...yol, bolumler } : yol;
}

/** Yayındaki öğrenme rotaları, ada göre Türkçe sıralı. */
export async function ogrenmeYollari(): Promise<OgrenmeYolu[]> {
  const belgeler = await yayindakiler<YolBelgesi>(KOLEKSIYONLAR.ogrenmeYollari);
  return belgeler.map(yolGorunume).sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
}

/** Slug ile tek rota; taslak veya yok ise `undefined` (sayfa 404 verir). */
export async function yolBul(slug: string): Promise<OgrenmeYolu | undefined> {
  const belge = await slugIle<YolBelgesi>(KOLEKSIYONLAR.ogrenmeYollari, slug);
  return belge ? yolGorunume(belge) : undefined;
}

/* --- DERSLER -------------------------------------------------------------- */

/**
 * `sira` şemada var, `Ders` tipinde yok — rota içi sırayı sayfanın yeniden
 * hesaplaması gerekmesin diye künyede taşınır.
 */
export type DersKaydi = Ders & { sira?: number };

type DersBelgesi = Omit<Ders, 'ozet'> & {
  ozet?: string;
  sira?: number;
  durum?: string;
};

/** Listede taşınmayan ağır alanlar. Detay sorgusunda hepsi gelir. */
const AGIR_DERS_ALANLARI = ['govde', 'sss'] as const;

/**
 * Alanlar tek tek yazılır (belge yayılmaz): yayın akışı `durum`u dışarı çıkmaz
 * ve şemaya sonradan eklenecek bir alan sessizce istemciye sızmaz.
 *
 * `seo` bu kuralın DIŞINDADIR ve bilinçli olarak taşınır: sayfanın
 * `generateMetadata`'sı onu `ustveriBirlestir()` ile okur. Taşınmadığı sürece
 * editörün panelden yazdığı ders başlığı `<title>` etiketine hiç çıkmıyordu.
 */
function dersGorunume(belge: DersBelgesi): DersKaydi {
  return {
    slug: belge.slug,
    ad: belge.ad,
    yolSlug: belge.yolSlug,
    sira: belge.sira,
    seviye: belge.seviye,
    dakika: belge.dakika,
    ozet: belge.ozet ?? '',
    hedefler: belge.hedefler,
    kavramlar: belge.kavramlar,
    onkosullar: belge.onkosullar,
    govde: belge.govde,
    alistirma: belge.alistirma,
    sss: belge.sss,
    testSlug: belge.testSlug,
    seo: belge.seo,
  };
}

/** Yayındaki dersler; rota ve rota içi sıraya göre. Gövde okunmaz. */
export async function dersler(): Promise<DersKaydi[]> {
  const belgeler = await yayindakiler<DersBelgesi>(KOLEKSIYONLAR.dersler, {
    siralama: { yolSlug: 1, sira: 1 },
    haric: AGIR_DERS_ALANLARI,
  });
  return belgeler.map(dersGorunume);
}

/**
 * Bir rotanın dersleri, `sira` alanına göre.
 *
 * Rota başına ders SAYISI ve toplam süre fixture'da hesaplanıyordu; burada da
 * hesaplanır — çağıran `(await yolunDersleri(slug)).length` ve dakikaların
 * toplamını kullanır, künyeye sahte bir sayaç yazılmaz.
 */
export async function yolunDersleri(yolSlug: string): Promise<DersKaydi[]> {
  const belgeler = await yayindakiler<DersBelgesi>(KOLEKSIYONLAR.dersler, {
    suzgec: { yolSlug },
    siralama: { sira: 1 },
    haric: AGIR_DERS_ALANLARI,
  });
  return belgeler.map(dersGorunume);
}

/** Tek ders — gövdesi, alıştırması ve SSS'siyle. */
export async function dersBul(slug: string): Promise<DersKaydi | undefined> {
  const belge = await slugIle<DersBelgesi>(KOLEKSIYONLAR.dersler, slug);
  return belge ? dersGorunume(belge) : undefined;
}

/* --- SORU BANKASI --------------------------------------------------------- */

/** Seviye testinin sorularını işaretleyen etiket (tohumlamadaki değer). */
const SEVIYE_ETIKETI = 'seviye';

const ZORLUK_SIRASI: Record<Seviye, number> = { baslangic: 0, orta: 1, ileri: 2 };

type SoruBelgesi = {
  kimlik: string;
  konu: string;
  altKonu?: string;
  etiketler?: string[];
  zorluk: Seviye;
  beceri: string;
  soru: string;
  secenekler: string[];
  dogruIndeks: number;
  aciklama?: string;
  ilgiliAtlas?: string;
  durum?: string;
};

/**
 * `altKonu` ve `aciklama` şemada isteğe bağlı, `Soru` tipinde zorunlu.
 *
 * Eksikse soru ATLANIR ve uyarı basılır (Atlas modülündeki kalıp): test motoru
 * her cevaptan sonra açıklamayı gösteriyor, açıklaması olmayan soru sınavın
 * öğretici yarısını sessizce boş bırakır. Yer tutucu metin üretmek yerine soru
 * gösterilmez ve eksiklik günlüğe düşer.
 */
function soruGorunume(belge: SoruBelgesi): Soru | null {
  const eksik = !belge.altKonu ? 'altKonu' : !belge.aciklama ? 'aciklama' : undefined;
  if (!belge.altKonu || !belge.aciklama) {
    console.warn(`[icerik:ogrenme] "${belge.kimlik}" sorusu atlandı — "${eksik}" alanı yok.`);
    return null;
  }
  return {
    kimlik: belge.kimlik,
    konu: belge.konu,
    altKonu: belge.altKonu,
    zorluk: belge.zorluk,
    beceri: belge.beceri,
    soru: belge.soru,
    secenekler: belge.secenekler,
    dogruIndeks: belge.dogruIndeks,
    aciklama: belge.aciklama,
    ilgiliAtlas: belge.ilgiliAtlas,
  };
}

async function etiketliSorular(etiket: string): Promise<Soru[]> {
  const belgeler = await yayindakiler<SoruBelgesi>(KOLEKSIYONLAR.sorular, {
    suzgec: { etiketler: etiket },
    siralama: { kimlik: 1 },
  });
  return belgeler.map(soruGorunume).filter((s): s is Soru => s !== null);
}

/**
 * Bir testin soruları. Anahtar `test.soruEtiketi`'dir, test slug'ı değil.
 *
 * `kimlik` sıralaması bankadaki yazım sırasını birebir geri verir (`ai_001`,
 * `ai_004`, `ai_007`… sıfır dolgulu), böylece soru akışı fixture'daki akışla
 * aynı kalır. Etiket verilmezse boş liste döner — testin bankada karşılığı
 * yoktur, uydurma soru üretilmez.
 */
export async function testinSorulari(soruEtiketi?: string): Promise<Soru[]> {
  if (!soruEtiketi) return [];
  return etiketliSorular(soruEtiketi);
}

/**
 * ÇOK etiketin sorularını TEK sorguda okur.
 *
 * NEDEN GEREKLİ: `atlas/[slug]` ve `konu/[slug]` sayfaları
 * `Promise.all(TESTLER.map((t) => testinSorulari(t.soruEtiketi)))` yazıyordu.
 * Bu, test başına bir sorgu demek: 12 testte fark edilmezdi, 100 testte her
 * sayfa 100 sorgu açar ve 35 Atlas + 50 konu sayfasıyla çarpılınca derleme
 * anında sekiz binden fazla sorguya çıkar.
 *
 * Burada `$in` ile hepsi bir kez okunur ve etikete göre gruplanır. Bir soru
 * birden çok etiket taşıyabildiği için (ör. `rag_013` hem "rag" hem "seviye"
 * etiketli) aynı belge birden çok grupta görünebilir — bu doğrudur, kopya
 * değildir.
 */
export async function etiketlereGoreSorular(
  etiketler: readonly (string | undefined)[],
): Promise<Map<string, Soru[]>> {
  const tekil = [...new Set(etiketler.filter((e): e is string => Boolean(e)))];
  const harita = new Map<string, Soru[]>();
  if (tekil.length === 0) return harita;

  const belgeler = await yayindakiler<SoruBelgesi>(KOLEKSIYONLAR.sorular, {
    suzgec: { etiketler: { $in: tekil } },
    siralama: { kimlik: 1 },
  });

  for (const etiket of tekil) harita.set(etiket, []);
  for (const belge of belgeler) {
    const soru = soruGorunume(belge);
    if (!soru) continue;
    for (const etiket of belge.etiketler ?? []) {
      harita.get(etiket)?.push(soru);
    }
  }

  return harita;
}

/**
 * Seviye testi (AI Knowledge Test) soruları.
 *
 * Fixture'daki kürasyon sırası (konu konu ilerleyen 15 soru) Mongo'da
 * saklanmıyor: kayıtlar yalnızca `seviye` etiketiyle işaretli. Sıra bu yüzden
 * saklanan veriden türetilir — zorluk artan, eşitlikte `kimlik`.
 */
export async function seviyeTestiSorulari(): Promise<Soru[]> {
  const sorular = await etiketliSorular(SEVIYE_ETIKETI);
  return sorular.sort(
    (a, b) => ZORLUK_SIRASI[a.zorluk] - ZORLUK_SIRASI[b.zorluk] || a.kimlik.localeCompare(b.kimlik),
  );
}

/* --- TESTLER -------------------------------------------------------------- */

/**
 * Test künyesi: `Test` tipinin soru taşımayan hâli.
 *
 * `ornekSorular` yoktur (bkz. dosya başlığı, 1. fark); yerine bankaya bağlayan
 * `soruEtiketi` ve şemada bulunup site tipinde olmayan `konuSlug`/`gecmeEsigi`
 * taşınır.
 */
export type TestKunyesi = Omit<Test, 'ornekSorular'> & {
  konuSlug?: string;
  soruEtiketi?: string;
  gecmeEsigi?: number;
};

/** Künye + sorular. `Test` tipini yapısal olarak karşılar. */
export type TestTam = TestKunyesi & { ornekSorular: Soru[] };

type TestBelgesi = {
  slug: string;
  ad: string;
  konu?: string;
  konuSlug?: string;
  soruSayisi?: number;
  dakika: number;
  seviye: Seviye;
  ozet?: string;
  olculenBeceriler?: string[];
  kimlerCozmeli?: string;
  ogrenmeHedefleri?: string[];
  soruEtiketi?: string;
  gecmeEsigi?: number;
  durum?: string;
  seo?: SeoAlanlari;
};

/**
 * Soru sayısı: önce saklanan değer, yoksa bankadan sayım.
 *
 * Etiketi olmayan testte 0 döner — bu bir yer tutucu değil, "bu testin
 * bankada sorusu yok" bilgisinin kendisidir.
 */
async function soruSayisiCoz(belge: TestBelgesi): Promise<number> {
  if (typeof belge.soruSayisi === 'number') return belge.soruSayisi;
  if (!belge.soruEtiketi) return 0;
  return yayindaSayisi(KOLEKSIYONLAR.sorular, { etiketler: belge.soruEtiketi });
}

/**
 * Görünen konu adı: şema `konu`yu (ad) ve `konuSlug`u ayrı tutuyor, site tipi
 * adı istiyor. Ad eksikse eşleme TAKSONOMİDEN yapılır, slug'dan ad
 * ÜRETİLMEZ; ikisi de yoksa test atlanır — konusu olmayan test konu
 * merkezlerinde yanlış yerde durur.
 */
async function testKunyesine(belge: TestBelgesi): Promise<TestKunyesi | null> {
  const konu = belge.konu ?? (belge.konuSlug ? ATLAS_KATEGORI_ADI.get(belge.konuSlug) : undefined);
  if (!konu) {
    console.warn(
      `[icerik:ogrenme] "${belge.slug}" testi atlandı — konu çözülemedi (konuSlug: "${belge.konuSlug ?? '—'}").`,
    );
    return null;
  }

  return {
    slug: belge.slug,
    ad: belge.ad,
    konu,
    konuSlug: belge.konuSlug,
    soruSayisi: await soruSayisiCoz(belge),
    dakika: belge.dakika,
    seviye: belge.seviye,
    ozet: belge.ozet ?? '',
    olculenBeceriler: belge.olculenBeceriler ?? [],
    kimlerCozmeli: belge.kimlerCozmeli ?? '',
    ogrenmeHedefleri: belge.ogrenmeHedefleri ?? [],
    soruEtiketi: belge.soruEtiketi,
    gecmeEsigi: belge.gecmeEsigi,
    seo: belge.seo,
  };
}

/** Yayındaki testler, ada göre Türkçe sıralı. Soru taşımaz. */
export async function testler(): Promise<TestKunyesi[]> {
  const belgeler = await yayindakiler<TestBelgesi>(KOLEKSIYONLAR.testler);
  const kunyeler = await Promise.all(belgeler.map(testKunyesine));
  return kunyeler
    .filter((t): t is TestKunyesi => t !== null)
    .sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
}

/**
 * Bir konunun (ve istenirse alt konularının) testleri.
 *
 * NEDEN SLUG İLE: konu merkezi testleri daha önce GÖRÜNEN ADI karşılaştırarak
 * süzüyordu (`test.konu === konu.ad`). Bu iki yerden kırılır: konu adı
 * düzeltildiğinde bağ sessizce kopar, ve bankadaki 12 eski testin `konuSlug`u
 * Atlas kategorilerinden üretilmişti — `konular` koleksiyonunda karşılığı
 * yoktu, yani hiçbir konu merkezi kendi testini bulamıyordu. Kalıcı bağ
 * slug'dır; `konuSlug`u olmayan test hiçbir konu merkezinde görünmez, yanlış
 * konuda görünmesinden iyidir.
 *
 * Ana konu sayfası alt konularının testlerini de gösterir (`altSluglar`):
 * "Büyük Dil Modelleri" merkezi, prompt mühendisliği testini de listelemeli.
 * Sıra korunur — önce konunun kendi testleri, sonra alt konuların.
 */
export async function konuyaGoreTestler(
  konuSlug: string,
  altSluglar: readonly string[] = [],
): Promise<TestKunyesi[]> {
  const hepsi = await testler();
  const kendi = hepsi.filter((test) => test.konuSlug === konuSlug);
  if (altSluglar.length === 0) return kendi;
  const altKume = new Set(altSluglar);
  return [...kendi, ...hepsi.filter((test) => test.konuSlug && altKume.has(test.konuSlug))];
}

/** Slug ile tek test künyesi. Soruları için `testinSorulari()`. */
export async function testBul(slug: string): Promise<TestKunyesi | undefined> {
  const belge = await slugIle<TestBelgesi>(KOLEKSIYONLAR.testler, slug);
  if (!belge) return undefined;
  return (await testKunyesine(belge)) ?? undefined;
}

/**
 * Test + soruları — test detay sayfasının ihtiyacı.
 *
 * Doğru cevap ve açıklama yalnızca bu yolla okunur; liste sorgusu (`testler()`)
 * bankaya hiç gitmez.
 */
export async function testiSorulariylaBul(slug: string): Promise<TestTam | undefined> {
  const kunye = await testBul(slug);
  if (!kunye) return undefined;
  return { ...kunye, ornekSorular: await testinSorulari(kunye.soruEtiketi) };
}
