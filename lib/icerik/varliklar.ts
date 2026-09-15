import type { AiModeli, Arac, Sirket } from '@/lib/tipler';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { slugIle, yayindakiler } from '@/lib/mongo/sorgular/site';

/**
 * Varlık okuma modülü — `modeller`, `sirketler`, `araclar`.
 *
 * `lib/veri/varliklar.ts` ile AYNI ADLARI verir; diziler (`MODELLER`,
 * `SIRKETLER`, `ARACLAR`) fonksiyona dönüşür (`modelListesi()`,
 * `sirketListesi()`, `aracListesi()` — `lib/icerik/atlas.ts` içindeki
 * `ATLAS` → `atlasListesi()` kalıbı), arama fonksiyonlarının adı aynı kalır ve
 * yalnızca `async` olur. Böylece sayfa taşımak `await` eklemekten ibarettir.
 *
 * ŞİRKETLER ve ARAÇLAR: şema alan adları site tipiyle birebir örtüşüyor;
 * dönüşüm yok, belge doğrudan görünüme geçer. (Şema bu iki koleksiyonda site
 * tipinin zorunlu saydığı bazı alanları zorunlu kılmaz — ör. `Arac.fiyat`.
 * `lib/icerik/atlas.ts` aynı durumu `AtlasGirdisi.ilgili` için nasıl ele
 * alıyorsa burada da öyle: alan alan doğrulama YAPILMAZ, sözleşme şema
 * doğrulayıcısına bırakılır. Panelden eksik doldurulmuş bir kayıt sitede eksik
 * görünür; bu, kaydın sessizce kaybolmasından daha az bilgi kaybettirir.)
 *
 * MODELLER: üç uyumsuzluk var, hepsi `lib/tohum/modeller.ts`'in TERSİ.
 *
 *  1. `guncellikDurumu` → `durum`. Tohumlama, fixture'ın güncellik işaretini
 *     (`'guncel'`) şemadaki `guncellikDurumu` alanına taşımış ve `durum`
 *     alanını YAYIN AKIŞI için kullanmıştı. Okuma bunu geri çevirir: şemadaki
 *     `durum` (yayın akışı) site tipine HİÇ çıkmaz, `guncellikDurumu` site
 *     tipindeki `durum` olur. İki fark kalıcıdır ve `ModelKaydi` tipinde
 *     görünür: alan şemada zorunlu değildir (panelden boş bırakılabilir) ve
 *     şema enum'u `'emekli'` değerini de kabul eder — `AiModeli.durum` ise bu
 *     değeri tanımıyordu. Bu yüzden alan OPSİYONEL ve enum GENİŞ tutulur;
 *     eksik değere `'guncel'` yazmak uydurma veri olurdu (CLAUDE.md §5),
 *     `'emekli'` modelleri düşürmek ise gerçek kayıtları gizlerdi.
 *
 *  2. `sinirliliklar` → `siniriliklar`. Fixture alan adı yazım hatası
 *     taşıyordu; tohumlama şemaya doğru yazımla yazdı. Site tipi (ve ona
 *     bakan sayfalar) hatalı yazımı kullanıyor, okuma katmanı da onu üretir.
 *     Doğru yer `lib/tipler.ts`'te düzeltmektir; bu modül şekil sözleşmesini
 *     değiştirmez.
 *
 *  3. `yayin` alanı MongoDB'de YOK. Fixture değeri serbest metindi ("Sürekli
 *     güncellenen seri"), şema ISO tarih deseni istiyor, bu yüzden tohumlama
 *     alanı hiç yazmadı. `AiModeli.yayin` ise zorunlu `string`. Uydurma tarih
 *     üretilmez; `ModelKaydi.yayin` OPSİYONEL'dir ve bugün her kayıtta
 *     `undefined` döner. Alanı basan sayfa (`/modeller/<slug>/` künyesi)
 *     satırı atlamalı ya da panelden gerçek tarih girilene kadar
 *     göstermemelidir.
 *
 * Ağır alan (`govde`, `sss`, `kaynaklar`, `surumler`) bu üç koleksiyonun
 * hiçbirinde yok; liste sorgularında `haric` gerekmiyor.
 *
 * ÜSTVERİ: üç koleksiyonun da şemasında `seo` var ve KENDİLİĞİNDEN taşınır —
 * şirket ve araç belgesi doğrudan görünüme geçiyor, `modelGorunume()` de
 * belgeyi yayıyor (`...kalan`). Tip tarafı `lib/tipler.ts`te açıldı; burada
 * alan alan yazan bir dönüşüm olmadığı için ek bir satır gerekmez.
 *
 * Sıralama: MongoDB doğal sırası garanti değildir, bu yüzden üç liste de ada
 * göre Türkçe sıralanır (`lib/icerik/atlas.ts` ile aynı). Fixture'ın elle
 * dizilmiş sırası (önem sırası) korunmaz.
 */

/* --- MODELLER ------------------------------------------------------------- */

/** Şemadaki `guncellikDurumu` enum'u — `AiModeli.durum`'dan geniş. */
export type ModelGuncelligi = 'guncel' | 'yeni' | 'onceki-surum' | 'emekli';

/**
 * Modelin SİTE şekli.
 *
 * `AiModeli` ile iki noktada ayrılır; ikisinin de gerekçesi dosya başlığında:
 * `durum` güncellik işaretidir ve opsiyoneldir, `yayin` MongoDB'de bulunmaz.
 */
export type ModelKaydi = Omit<AiModeli, 'durum' | 'yayin'> & {
  /** Güncellik işareti — şemadaki `guncellikDurumu`. Yayın akışı durumu DEĞİL. */
  durum?: ModelGuncelligi;
  /** MongoDB'de karşılığı olmayan alan; bugün her kayıtta `undefined`. */
  yayin?: string;
};

/** Mongo belgesi: şemadaki hâl (`guncellikDurumu` + `sinirliliklar` taşır). */
type ModelBelgesi = Omit<AiModeli, 'durum' | 'yayin' | 'siniriliklar'> & {
  /** Yayın akışı durumu (`yayinda`) — site tipine çıkmaz. */
  durum?: string;
  guncellikDurumu?: ModelGuncelligi;
  sinirliliklar?: string[];
};

/**
 * `durum` alanı KASITLI olarak üzerine yazılır: `kalan` içinde şemadan gelen
 * yayın akışı değeri (`'yayinda'`) durur, sonraki açık atama onun yerine
 * güncellik işaretini koyar. `guncellikDurumu` boşsa alan `undefined` olur —
 * yayın akışı değeri sızmaz.
 */
function modelGorunume({ guncellikDurumu, sinirliliklar, ...kalan }: ModelBelgesi): ModelKaydi {
  return { ...kalan, durum: guncellikDurumu, siniriliklar: sinirliliklar };
}

function adaGore<T extends { ad: string }>(kayitlar: T[]): T[] {
  return [...kayitlar].sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
}

/** Yayındaki tüm modeller, ada göre Türkçe sıralı. */
export async function modelListesi(): Promise<ModelKaydi[]> {
  const belgeler = await yayindakiler<ModelBelgesi>(KOLEKSIYONLAR.modeller);
  return adaGore(belgeler.map(modelGorunume));
}

/** Slug ile tek model; taslak veya bilinmeyen slug'da `undefined`. */
export async function modelBul(slug?: string): Promise<ModelKaydi | undefined> {
  if (!slug) return undefined;
  const belge = await slugIle<ModelBelgesi>(KOLEKSIYONLAR.modeller, slug);
  return belge ? modelGorunume(belge) : undefined;
}

/**
 * Birden çok model — karşılaştırma sayfaları için.
 *
 * Sonuç İSTENEN SIRAYI korur (`/karsilastir/<slug>/` sayfasında sol ve sağ
 * kolonun hangi model olduğu sıraya bağlıdır), ada göre sıralanmaz. Yayında
 * olmayan veya bulunamayan slug sessizce dizi dışında kalır; çağıran sayfa
 * beklediği model sayısını bulamazsa 404 vermeye kendi karar verir.
 */
export async function modelleriGetir(sluglar: readonly string[]): Promise<ModelKaydi[]> {
  if (sluglar.length === 0) return [];
  const belgeler = await yayindakiler<ModelBelgesi>(KOLEKSIYONLAR.modeller, {
    suzgec: { slug: { $in: [...sluglar] } },
  });
  const harita = new Map(belgeler.map((belge) => [belge.slug, modelGorunume(belge)]));
  return sluglar
    .map((slug) => harita.get(slug))
    .filter((model): model is ModelKaydi => model !== undefined);
}

/**
 * Bir şirketin modelleri — `sirketler` ile `modeller` arasındaki BİRLEŞTİRME.
 *
 * İlişki iki yönlü kurulmuş: model `saglayiciSlug` ile şirketi işaret ediyor,
 * şirket de `modelSluglari` ile modelleri. İki küme BİRLEŞTİRİLİR, çünkü
 * ikisi de gerçek bir bağ ifade ediyor ve yalnızca birine bakmak (fixture
 * çağında sayfa yalnızca `saglayiciSlug`'a bakıyordu) elle işaretlenmiş
 * modelleri görünmez kılar. Sonuç tekilleştirilir ve ada göre sıralanır.
 */
export async function sirketinModelleri(sirketSlug: string): Promise<ModelKaydi[]> {
  const sirket = await sirketBul(sirketSlug);
  const isaretliler = sirket?.modelSluglari ?? [];
  const bag =
    isaretliler.length > 0
      ? { $or: [{ saglayiciSlug: sirketSlug }, { slug: { $in: [...isaretliler] } }] }
      : { saglayiciSlug: sirketSlug };

  /*
   * AİLE HUB'LARI DIŞARIDA BIRAKILIR. Hub'lar modellerle aynı koleksiyonda
   * durur ve `saglayiciSlug` taşır, bu yüzden bu sorguya kendiliğinden
   * giriyorlardı: `/sirketler/openai/` sayfasında "GPT Ailesi" ile "GPT-6
   * Astra" aynı listede yan yana görünüyordu ve okuyucu hangisinin gerçek bir
   * model olduğunu ayırt edemiyordu — `/modeller/` sayfasında düzeltilen
   * karışıklığın aynısı.
   *
   * Aile, üyesinin kendi sayfasındaki bağlantıdan ve `/modeller/` listesinin
   * aileler bölümünden erişilebilir; burada tekrar edilmesi gerekmiyor.
   */
  const suzgec = { $and: [bag, { aileMi: { $ne: true } }] };

  const belgeler = await yayindakiler<ModelBelgesi>(KOLEKSIYONLAR.modeller, { suzgec });
  return adaGore(belgeler.map(modelGorunume));
}

/* --- MODEL AİLELERİ ------------------------------------------------------- */

/**
 * Bir ailenin yayındaki üyeleri.
 *
 * Aile hub'ı (`/modeller/gpt-ailesi/` gibi) tek bir modeli değil bir ürün
 * hattını anlatır; sayfası üyeleri listeler. Üyelik `aileSlug` ile TEK YÖNLÜ
 * kurulmuştur — hub bir üye dizisi tutmaz, böylece yeni model eklendiğinde
 * güncellenecek ikinci bir belge olmaz.
 *
 * Sıralama ada göre DEĞİL: aile içinde okuyucunun beklediği sıra güncellikten
 * eskiye doğrudur. `guncellikDurumu` sırası (güncel → yeni → önceki → emekli)
 * uygulanır, eşitlikte ada göre Türkçe sıralanır.
 */
const GUNCELLIK_SIRASI: Record<ModelGuncelligi, number> = {
  guncel: 0,
  yeni: 1,
  'onceki-surum': 2,
  emekli: 3,
};

export async function aileUyeleri(aileSlug?: string): Promise<ModelKaydi[]> {
  if (!aileSlug) return [];
  const belgeler = await yayindakiler<ModelBelgesi>(KOLEKSIYONLAR.modeller, {
    suzgec: { aileSlug },
  });
  return belgeler.map(modelGorunume).sort((a, b) => {
    const fark =
      (a.durum ? GUNCELLIK_SIRASI[a.durum] : 9) - (b.durum ? GUNCELLIK_SIRASI[b.durum] : 9);
    return fark !== 0 ? fark : a.ad.localeCompare(b.ad, 'tr');
  });
}

/**
 * Aile hub künyeleri — `/modeller/` listesinde ayrı gösterilir.
 *
 * Hub"lar normal modellerle aynı koleksiyonda durur (canlı adresleri korunsun
 * diye), bu yüzden liste sayfası ikisini `aileMi` ile ayırır. Ayırmazsa "GPT
 * Ailesi" ile "GPT-6 Astra" aynı düzlemde görünür ve okuyucu hangisinin
 * gerçek model olduğunu bilemez.
 */
export async function aileHublari(): Promise<ModelKaydi[]> {
  const belgeler = await yayindakiler<ModelBelgesi>(KOLEKSIYONLAR.modeller, {
    suzgec: { aileMi: true },
  });
  return adaGore(belgeler.map(modelGorunume));
}

/* --- KARŞILAŞTIRMALAR ----------------------------------------------------- */

export type Karsilastirma = {
  slug: string;
  baslik: string;
  /** Sol kolondaki modelin slug'ı. */
  sol: string;
  /** Sağ kolondaki modelin slug'ı. */
  sag: string;
  ozet: string;
};

/**
 * Yayındaki model karşılaştırmaları — HENÜZ MONGO'DA DEĞİL.
 *
 * `karsilastirmalar` diye bir koleksiyon yok (`lib/mongo/koleksiyonlar.ts`) ve
 * fixture'daki bu üç kayıt tohumlanmadı. Kayıtlar `/karsilastir/<slug>/`
 * rotasını üreten rota sözleşmesi olduğu için kaynakta kalıyor; başlık ve özet
 * metni editoryaldir ve panelden düzenlenemez. Koleksiyon açıldığında bu sabit
 * kaldırılır, `karsilastirmaBul()` imzası değişmez.
 */
export const KARSILASTIRMALAR: readonly Karsilastirma[] = [
  {
    slug: 'gpt-ailesi-vs-claude-ailesi',
    baslik: 'GPT Ailesi ile Claude Ailesi karşılaştırması',
    sol: 'gpt-ailesi',
    sag: 'claude-ailesi',
    ozet: 'İki kapalı ağırlıklı ailenin araç kullanımı, uzun bağlam davranışı ve ekosistem farkları.',
  },
  {
    slug: 'llama-ailesi-vs-mistral-ailesi',
    baslik: 'Llama Ailesi ile Mistral Ailesi karşılaştırması',
    sol: 'llama-ailesi',
    sag: 'mistral-ailesi',
    ozet: 'Açık ağırlıklı iki ailenin boyut, verimlilik ve barındırma profili.',
  },
  {
    slug: 'gemini-ailesi-vs-gpt-ailesi',
    baslik: 'Gemini Ailesi ile GPT Ailesi karşılaştırması',
    sol: 'gemini-ailesi',
    sag: 'gpt-ailesi',
    ozet: 'Çok modlu girdi kapsamı ve platform entegrasyonu açısından iki aile.',
  },
];

/**
 * Slug ile tek karşılaştırma.
 *
 * Bugün kaynaktaki sabitten okuyor ama `async`: koleksiyon açıldığında gövdesi
 * değişir, çağıran sayfalar değişmez.
 */
export async function karsilastirmaBul(slug: string): Promise<Karsilastirma | undefined> {
  return KARSILASTIRMALAR.find((kiyas) => kiyas.slug === slug);
}

/**
 * Karşılaştırma tablosunun satırları — KOD DÜZEYİ SÖZLEŞME, içerik değil.
 *
 * `anahtar` değerleri `ModelKaydi` alan adlarıdır ve sayfadaki/bileşendeki
 * `deger()` switch'iyle birebir eşleşir. Panelden değiştirilecek bir liste
 * olmadığı için MongoDB'ye taşınmaz (bkz. `lib/taksonomi.ts` başlığı).
 */
export const KARSILASTIRMA_BOYUTLARI: readonly { anahtar: string; ad: string }[] = [
  { anahtar: 'tip', ad: 'Model tipi' },
  { anahtar: 'baglamPenceresi', ad: 'Bağlam' },
  { anahtar: 'modaliteler', ad: 'Modaliteler' },
  { anahtar: 'acikKaynak', ad: 'Açık ağırlık' },
  { anahtar: 'api', ad: 'Yönetilen API' },
  { anahtar: 'kullanimAlanlari', ad: 'Tipik kullanım' },
];

/**
 * ÖRNEK VERİ — doğrulanmış ölçüm DEĞİLDİR, model adları da gerçek değildir.
 *
 * Bir benchmark koleksiyonu yok; bu tablo ana sayfadaki karşılaştırma
 * modülünün düzenini gösteren yer tutucudur ve basıldığı yerde görünür bir
 * "örnek veri" uyarısı taşır (MASTER-PLAN §59, CLAUDE.md §5). Gerçek ölçüm
 * geldiğinde `arastirma` koleksiyonundaki benchmark yayınından okunacak.
 */
export const BENCHMARK_ORNEGI = {
  boyutlar: ['Reasoning', 'Kodlama', 'Türkçe', 'RAG', 'Araç Kullanımı'],
  satirlar: [
    { ad: 'Model A', skorlar: [91, 92, 74, 90, 88] },
    { ad: 'Model B', skorlar: [89, 95, 71, 92, 91] },
    { ad: 'Model C', skorlar: [86, 88, 83, 87, 84] },
  ],
};

/* --- ŞİRKETLER ------------------------------------------------------------ */

/** Yayındaki şirketler, ada göre Türkçe sıralı. */
export async function sirketListesi(): Promise<Sirket[]> {
  const belgeler = await yayindakiler<Sirket>(KOLEKSIYONLAR.sirketler);
  return adaGore(belgeler);
}

/** Slug ile tek şirket. Model sayfası `saglayiciSlug` ile çağırır. */
export async function sirketBul(slug?: string): Promise<Sirket | undefined> {
  if (!slug) return undefined;
  return slugIle<Sirket>(KOLEKSIYONLAR.sirketler, slug);
}

/* --- ARAÇLAR -------------------------------------------------------------- */

/**
 * Araç kategorileri — KOD DÜZEYİ TAKSONOMİ.
 *
 * Filtre şeridinin ve panelin seçenek kümesi; editörün panelden
 * değiştireceği bir şey değil (bkz. `lib/taksonomi.ts` başlığı) ve `araclar`
 * şemasında enum olarak durmuyor, bu yüzden MongoDB'ye taşınmaz. Uzun vadede
 * yeri `lib/taksonomi.ts`'tir; fixture silinirken oraya taşınmalı ki tek
 * kaynak kalsın (şimdilik `lib/admin/alanlar/araclar.ts` ile bu modül aynı
 * listeyi ayrı yerlerden okuyor).
 */
export const ARAC_KATEGORILERI: readonly string[] = [
  'AI Writing',
  'Coding',
  'Research',
  'Image',
  'Video',
  'Audio',
  'Productivity',
  'Automation',
  'Data Analysis',
  'Marketing',
  'Design',
  'Education',
];

/** Yayındaki araç incelemeleri, ada göre Türkçe sıralı. */
export async function aracListesi(): Promise<Arac[]> {
  const belgeler = await yayindakiler<Arac>(KOLEKSIYONLAR.araclar);
  return adaGore(belgeler);
}

/** Slug ile tek araç incelemesi. */
export async function aracBul(slug?: string): Promise<Arac | undefined> {
  if (!slug) return undefined;
  return slugIle<Arac>(KOLEKSIYONLAR.araclar, slug);
}

/**
 * Bir şirketin yaptığı araçlar — `sirketSlug` üzerinden.
 *
 * `sirketinModelleri` ile aynı yön: şirket sayfası kendi varlıklarını
 * listeler. Bağı olmayan araç hiçbir şirket sayfasında görünmez; bu doğrudur,
 * çünkü kategori incelemelerinin ve üreticisi kayıtlı olmayan araçların
 * sahibi yoktur.
 */
export async function sirketinAraclari(sirketSlug?: string): Promise<Arac[]> {
  if (!sirketSlug) return [];
  const belgeler = await yayindakiler<Arac>(KOLEKSIYONLAR.araclar, {
    suzgec: { sirketSlug },
  });
  return [...belgeler].sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
}
