import type {
  Analiz,
  Blok,
  BriefMaddesi,
  Icerik,
  IcerikTuru,
  Kaynak,
  Konu,
  RadarKaydi,
  RadarYonu,
  SeoAlanlari,
  SSS,
  Yazar,
} from '@/lib/tipler';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { slugIle, yayindakiler } from '@/lib/mongo/sorgular/site';
import { iliskileriCoz, konuHaritasi, yazarHaritasi } from '@/lib/icerik/temel';
import { mansetSlugu } from '@/lib/site/ayarlar';

/**
 * Gündem okuma modülü — haber akışı, derin analizler, brief ve radar.
 *
 * `lib/veri/gundem.ts` ile AYNI ADLARI ve AYNI ŞEKİLLERİ verir; tek fark
 * fonksiyonların `async` olması. Sayfa taşımak `await` eklemek ve içe alma
 * yolunu değiştirmekten ibarettir; sunum kodu değişmez.
 *
 * ÜÇ KOLEKSİYON, DÖRT GÖRÜNÜM
 *
 *   icerikler (tur: haber|analiz) → gündem akışı (`Icerik`) + derin analizler
 *                                   (`Analiz`)
 *   briefler                      → günün maddeleri + arşiv listesi
 *   radar                         → konu başına en güncel anlık görüntü
 *
 * GÜNDEM AKIŞI ↔ DERİN ANALİZ AYRIMI
 *
 * Şemada ikisi de `icerikler` içindedir ve `tur` alanı ayırmaya yetmez:
 * manşet `tur: 'analiz'` taşır ama kanonik adresi `/haber/<slug>/`, derin
 * analizlerin adresi ise `/analiz/<slug>/`. Ayırt edici tek alan `yol`dur —
 * tohumlama sırasında da böyle üretilmişti (`lib/tohum/icerikler.ts`). Bu
 * yüzden:
 *
 *   derin analiz := tur === 'analiz' && yol `/analiz/` ile başlıyor
 *   gündem akışı := kalan haber ve analiz kayıtları
 *
 * İki küme AYRIKTIR. `tur: 'analiz'` olan her kaydı her iki listeye de koymak
 * aynı metni iki kanonik adreste yayımlamak olurdu: `/haber/[slug]`
 * `generateStaticParams`'ı `tumGundem()`den, `/analiz/[slug]` ise
 * `analizler()`den besleniyor.
 *
 * DÖNÜŞÜMLER (şema şekli → site tipi şekli)
 *
 * (a) İLİŞKİ: şema `konuSlug`/`yazarSlug` (metin) tutar, `Icerik` ise
 *     `konu: Konu` ve `yazar: Yazar` (nesne) ister; ikisi de ZORUNLU.
 *     Birleştirme `lib/icerik/temel.ts` haritalarıyla yapılır. Çözülemeyen
 *     kayıt ATLANIR + uyarı basılır — atıfta bulunulan konu/yazar taslakta
 *     demektir ve bu gerçek bir bütünlük sorunudur.
 * (b) AD/SLUG: `Analiz.konu` görünen ADDIR, slug değil. Eşleme `konular`
 *     koleksiyonundan (`konu.ad`) gelir; `slugla()` ile ÜRETİLMEZ.
 * (c) YENİDEN ADLANDIRMA: `ilgiliAtlas` → `ilgiliSluglar`,
 *     `kisaCevap` → `girizgah` (analizde), `yayinTarihi` → `tarih` (analizde).
 *     `maddeSayisi` şemada yoktur, `maddeler.length` ile HESAPLANIR.
 *
 * Liste sorgularında gövde, kaynaklar ve SSS okunmaz; detay sorgularında
 * (`gundemBul`, `analizBul`) tam belge gelir.
 *
 * ÜSTVERİ: editörün panelden yazdığı `seo` nesnesi görünüme AKTARILIR (bkz.
 * `gundemGorunumu`, `analizGorunumu`, `radarGorunumu`). Bu fonksiyonlar alanları
 * tek tek yazdığı için taşınmayan her alan sessizce düşüyordu; sayfanın
 * `generateMetadata`'sı `lib/seo/ustveri.ts` içindeki `ustveriBirlestir()` ile
 * bu nesneyi okur.
 *
 * MANŞET: hangi kaydın manşete çıkacağı artık `manset-slug` ayarına da bakar;
 * gerekçesi ve kırık ayar davranışı `mansetiSec()` başlığında.
 */

/* --- KOD DÜZEYİ TAKSONOMİ -------------------------------------------------- */

export type GundemKategorisi = {
  slug: string;
  ad: string;
  yol: string;
  ozet: string;
};

/**
 * Gündem kategorileri — MongoDB'ye TAŞINMAZ.
 *
 * Bu liste içerik değil rota sözleşmesidir: `/gundem/<slug>/` sayfalarının
 * `generateStaticParams` kaynağı burasıdır ve bir kategori silindiğinde rota
 * kırılır (bkz. `lib/taksonomi.ts` başlığındaki aynı gerekçe). Kategori
 * slug'ları `konular` koleksiyonunun slug'larıyla KISMEN örtüşür; örtüşmeyen
 * kategoriler (`yapay-zeka`, `arastirma`, `startuplar`, `turkiye`) henüz konu
 * kaydı olmadığı için boş listelenir — bu fixture'daki davranışın aynısıdır,
 * eksik kategori uydurma konuyla doldurulmaz.
 *
 * Kalıcı yeri `lib/taksonomi.ts`tir; bu dosyaya alınmasının tek nedeni
 * taşımanın tek dosyada tutulmasıdır (bkz. rapor).
 */
export const GUNDEM_KATEGORILERI: readonly GundemKategorisi[] = [
  {
    slug: 'yapay-zeka',
    ad: 'Yapay Zekâ',
    yol: '/gundem/yapay-zeka/',
    ozet: 'Genel yapay zekâ gelişmeleri, ürün duyuruları ve ekosistem hareketleri.',
  },
  {
    slug: 'llm',
    ad: 'Büyük Dil Modelleri',
    yol: '/gundem/llm/',
    ozet: 'Model sürümleri, bağlam penceresi, muhakeme ve değerlendirme tartışmaları.',
  },
  {
    slug: 'ai-agent',
    ad: "AI Agent'lar",
    yol: '/gundem/ai-agent/',
    ozet: 'Araç kullanımı, planlama, bellek ve çok ajanlı sistemler.',
  },
  {
    slug: 'robotik',
    ad: 'Robotik & Embodied AI',
    yol: '/gundem/robotik/',
    ozet: 'Humanoid robotlar, vision-language-action modelleri ve saha uygulamaları.',
  },
  {
    slug: 'arastirma',
    ad: 'Araştırmalar',
    yol: '/gundem/arastirma/',
    ozet: 'Yeni yayınlar, benchmark sonuçları ve akademik tartışmalar.',
  },
  {
    slug: 'startuplar',
    ad: 'Startuplar',
    yol: '/gundem/startuplar/',
    ozet: 'Girişim turları, ürün çıkışları ve pazar hareketleri.',
  },
  {
    slug: 'turkiye',
    ad: 'Türkiye',
    yol: '/gundem/turkiye/',
    ozet: 'Türkiye yapay zekâ ekosistemi: şirketler, politika, yetenek ve yatırım.',
  },
  {
    slug: 'regulasyon',
    ad: 'Regülasyon',
    yol: '/gundem/regulasyon/',
    ozet: 'Mevzuat, uyum yükümlülükleri ve denetim gelişmeleri.',
  },
  {
    slug: 'is-dunyasi',
    ad: 'AI Business',
    yol: '/gundem/is-dunyasi/',
    ozet: 'Kurumsal benimseme, maliyet, organizasyon ve iş modeli etkileri.',
  },
];

/* --- ŞEMADAKİ BELGE ŞEKİLLERİ --------------------------------------------- */

/** `icerikler` belgesi: ilişkiler slug olarak durur, `ilgiliAtlas` adıyla. */
type IcerikBelgesi = {
  slug: string;
  yol?: string;
  tur: IcerikTuru;
  baslik: string;
  kisaCevap: string;
  ozet?: string;
  konuSlug?: string;
  yazarSlug?: string;
  yayinTarihi?: string;
  guncellemeTarihi?: string;
  okumaDakika?: number;
  oneCikan?: boolean;
  etiketler?: string[];
  govde?: Blok[];
  kaynaklar?: Kaynak[];
  sss?: SSS[];
  /** Site tipindeki karşılığı `ilgiliSluglar`. */
  ilgiliAtlas?: string[];
  /** Editörün yazdığı üstveri; `generateMetadata` bunu okur. */
  seo?: SeoAlanlari;
  tezGuveni?: 'yuksek' | 'orta' | 'dusuk';
  yanlislanmaKosulu?: string;
};

/** `briefler` belgesi: tarih anahtarlı bir sayı ve maddeleri. */
type BriefBelgesi = {
  tarih: string;
  baslik: string;
  maddeler?: {
    numara: string;
    baslik: string;
    neden: string;
    kaynak?: string;
    konuSlug?: string;
    icerikSlug?: string;
  }[];
};

/** `radar` belgesi: bir konunun belirli bir tarihteki anlık görüntüsü. */
type RadarBelgesi = {
  slug: string;
  ad: string;
  tarih: string;
  momentum: number;
  yon: string;
  degisim?: number;
  sinyaller?: {
    yayin?: number;
    github?: number;
    modelCikisi?: number;
    aramaIlgisi?: number;
  };
  not?: string;
  seo?: SeoAlanlari;
};

/* --- SORGU SABİTLERİ ------------------------------------------------------- */

/** Gündem modülüne ait türler; `rehber` BU MODÜLE AİT DEĞİL (`yayin.ts` alır). */
const GUNDEM_TURLERI = ['haber', 'analiz'] as const;

/**
 * Liste görünümlerinde okunmayan ağır alanlar.
 *
 * `seo` burada YOKTUR ve olmamalı: beş kısa alandan oluşan hafif bir nesnedir,
 * listeden çıkarmanın kazancı yoktur; buna karşılık detay yolunda eksilmesi
 * editörün yazdığı başlığın sessizce kaybolması anlamına gelir.
 */
const LISTE_HARIC = ['govde', 'kaynaklar', 'sss'] as const;

/** Derin analizin kanonik adres öneki — akış/analiz ayrımının tek ölçütü. */
const ANALIZ_ONEKI = '/analiz/';

/* --- YARDIMCILAR ---------------------------------------------------------- */

/**
 * Kanonik yol. Şemada `yol` zorunlu değil; boşsa rota tablosundan türetilir
 * (`/analiz/<slug>/` ya da `/haber/<slug>/`). Bu bir veri değeri değil, var
 * olan bir rotanın adresidir — tohumlama da aynısını yapıyordu.
 */
function yolu(belge: IcerikBelgesi): string {
  const yol = belge.yol?.trim();
  if (yol) return yol;
  return belge.tur === 'analiz' ? `${ANALIZ_ONEKI}${belge.slug}/` : `/haber/${belge.slug}/`;
}

/** Derin analiz mi, gündem akışı mı? Bkz. dosya başlığı. */
function derinAnaliz(belge: IcerikBelgesi): boolean {
  return belge.tur === 'analiz' && yolu(belge).startsWith(ANALIZ_ONEKI);
}

/** Gündem modülünün ilgilendiği tür mü? */
function gundemTuru(belge: IcerikBelgesi): boolean {
  return belge.tur === 'haber' || belge.tur === 'analiz';
}

/**
 * Site tipinin ZORUNLU saydığı ama şemanın zorunlu tutmadığı iki alan:
 * `yayinTarihi` ve `okumaDakika`. Eksikse kayıt atlanır; tarih veya okuma
 * süresi uydurulmaz (CLAUDE.md kural 5).
 */
function kunye(belge: IcerikBelgesi): { yayinTarihi: string; okumaDakika: number } | null {
  if (!belge.yayinTarihi || typeof belge.okumaDakika !== 'number') {
    console.warn(
      `[icerik:gundem] "${belge.slug}" atlandı — zorunlu künye eksik (yayinTarihi: "${belge.yayinTarihi ?? '-'}", okumaDakika: "${String(belge.okumaDakika)}").`,
    );
    return null;
  }
  return { yayinTarihi: belge.yayinTarihi, okumaDakika: belge.okumaDakika };
}

/** Yayındaki gündem/analiz belgeleri; sıralama tarihe göre yeniden eskiye. */
function icerikBelgeleri(
  ekSuzgec: Record<string, unknown>,
  hafif: boolean,
): Promise<IcerikBelgesi[]> {
  return yayindakiler<IcerikBelgesi>(KOLEKSIYONLAR.icerikler, {
    suzgec: { tur: { $in: [...GUNDEM_TURLERI] }, ...ekSuzgec },
    siralama: { yayinTarihi: -1, slug: 1 },
    haric: hafif ? LISTE_HARIC : undefined,
  });
}

/* --- GÜNDEM AKIŞI (Icerik) ------------------------------------------------- */

/**
 * `konuSlug`/`yazarSlug` → `konu`/`yazar` nesnesi; `ilgiliAtlas` →
 * `ilgiliSluglar`. İlişkisi çözülemeyen kayıt atlanır.
 */
function gundemGorunumu(
  belge: IcerikBelgesi,
  konular: Map<string, Konu>,
  yazarlar: Map<string, Yazar>,
): Icerik | null {
  const { konu, yazar } = iliskileriCoz(belge, konular, yazarlar);
  if (!konu || !yazar) {
    console.warn(
      `[icerik:gundem] "${belge.slug}" atlandı — ilişki çözülemedi (konuSlug: "${belge.konuSlug ?? '-'}", yazarSlug: "${belge.yazarSlug ?? '-'}"); atıfta bulunulan kayıt taslakta veya slug'ı değişmiş.`,
    );
    return null;
  }

  const kimlik = kunye(belge);
  if (!kimlik) return null;

  return {
    slug: belge.slug,
    yol: yolu(belge),
    tur: belge.tur,
    baslik: belge.baslik,
    kisaCevap: belge.kisaCevap,
    ozet: belge.ozet,
    konu,
    yazar,
    yayinTarihi: kimlik.yayinTarihi,
    guncellemeTarihi: belge.guncellemeTarihi,
    okumaDakika: kimlik.okumaDakika,
    oneCikan: belge.oneCikan,
    etiketler: belge.etiketler,
    govde: belge.govde,
    kaynaklar: belge.kaynaklar,
    ilgiliSluglar: belge.ilgiliAtlas,
    seo: belge.seo,
  };
}

/** Bir belge listesini gündem akışı görünümüne çevirir. */
async function gundemeCevir(belgeler: IcerikBelgesi[]): Promise<Icerik[]> {
  const [konular, yazarlar] = await Promise.all([konuHaritasi(), yazarHaritasi()]);
  return belgeler
    .filter((belge) => !derinAnaliz(belge))
    .map((belge) => gundemGorunumu(belge, konular, yazarlar))
    .filter((icerik): icerik is Icerik => icerik !== null);
}

/** Manşet dahil tüm gündem akışı; liste görünümü (gövde okunmaz). */
async function akis(): Promise<Icerik[]> {
  return gundemeCevir(await icerikBelgeleri({}, true));
}

/**
 * MANŞET SEÇİMİ — ayar önce, editoryal işaret sonra.
 *
 * İki kaynak var ve ikisi de gerçek bir editoryal karar:
 *   1. `manset-slug` ayarı (panel → `ayarlar` koleksiyonu) ELLE seçimdir;
 *      bugün öne çıkarılmış kayıt hangisi olursa olsun onu geçersiz kılar.
 *   2. Ayar boşsa `oneCikan: true` taşıyan en yeni kayıt manşete çıkar.
 *
 * Ayarın işaret ettiği slug gündem akışında bulunamazsa (kayıt silinmiş,
 * taslağa alınmış, slug yanlış yazılmış veya kanonik adresi `/analiz/` olan
 * bir derin analiz) SESSİZCE 2. maddeye düşülür ve uyarı basılır. Ana sayfa
 * manşeti kırık bir ayar yüzünden BOŞ KALMAZ: yanlış yazılmış bir ayar
 * değerinin bedeli, sitenin en görünür bloğunun kaybolması olmamalı.
 *
 * `kayitlar` her zaman AKIŞIN kendisidir (yayında, `/haber/` kanonikli): üç
 * çağıran da aynı listeden seçtiği için manşete çıkan kayıt akıştan tam olarak
 * bir kez çıkarılır — aynı haber iki yerde görünmez.
 */
async function mansetiSec(kayitlar: Icerik[]): Promise<Icerik | undefined> {
  const varsayilan = () => kayitlar.find((icerik) => icerik.oneCikan === true);
  const secilen = await mansetSlugu();
  if (!secilen) return varsayilan();

  const elle = kayitlar.find((icerik) => icerik.slug === secilen);
  if (elle) return elle;

  console.warn(
    `[icerik:gundem] "manset-slug" ayarı "${secilen}" gösteriyor ama gündem akışında yayında böyle bir kayıt yok; manşet "oneCikan" varsayılanına düştü.`,
  );
  return varsayilan();
}

/**
 * MANŞET — `manset-slug` ayarı ya da `oneCikan: true` taşıyan en yeni kayıt.
 *
 * `undefined` dönebilir: ayar boş VE hiçbir kayıt öne çıkarılmamış olabilir.
 * Çağıran sayfa bu durumda manşet bloğunu basmaz (uydurma manşet üretilmez).
 * Birden fazla öne çıkan kayıt varsa en yeni `yayinTarihi` kazanır.
 *
 * Manşet her zaman gündem akışındandır: derin analiz manşete alınırsa
 * kanonik adresi `/analiz/` olduğu için `/haber/` akışına giremez.
 */
export async function manset(): Promise<Icerik | undefined> {
  return mansetiSec(await akis());
}

/** Manşet HARİÇ gündem akışı — fixture'daki `GUNDEM` karşılığı. */
export async function gundem(): Promise<Icerik[]> {
  const kayitlar = await akis();
  const one = await mansetiSec(kayitlar);
  return one ? kayitlar.filter((icerik) => icerik.slug !== one.slug) : kayitlar;
}

/** Manşet başta olacak şekilde tüm gündem akışı — `TUM_GUNDEM` karşılığı. */
export async function tumGundem(): Promise<Icerik[]> {
  const kayitlar = await akis();
  const one = await mansetiSec(kayitlar);
  return one ? [one, ...kayitlar.filter((icerik) => icerik.slug !== one.slug)] : kayitlar;
}

/**
 * Tek gündem kaydı, gövdesiyle. `/haber/<slug>/` sayfasının kaynağı.
 *
 * Derin analiz, rehber veya taslak bir slug için `undefined` döner: aynı metin
 * iki adreste açılmaz, yayımlanmamış kayıt sitede görünmez.
 */
export async function gundemBul(slug: string): Promise<Icerik | undefined> {
  const belge = await slugIle<IcerikBelgesi>(KOLEKSIYONLAR.icerikler, slug);
  if (!belge || !gundemTuru(belge) || derinAnaliz(belge)) return undefined;
  return (await gundemeCevir([belge]))[0];
}

/** Bir konunun gündem akışı. Bilinmeyen konuda boş dizi. */
export async function konuyaGoreGundem(konuSlug: string): Promise<Icerik[]> {
  if (!konuSlug) return [];
  return gundemeCevir(await icerikBelgeleri({ konuSlug }, true));
}

/* --- DERİN ANALİZLER (Analiz) --------------------------------------------- */

/**
 * `Analiz`, `Icerik`ten farklı alanlar taşır: `girizgah` (şemada `kisaCevap`),
 * `tarih` (şemada `yayinTarihi`), `konu` GÖRÜNEN AD (şemada `konuSlug`) ve
 * yazar NESNE değil SLUG.
 */
function analizGorunumu(belge: IcerikBelgesi, konular: Map<string, Konu>): Analiz | null {
  const konu = belge.konuSlug ? konular.get(belge.konuSlug) : undefined;
  if (!konu) {
    console.warn(
      `[icerik:gundem] "${belge.slug}" atlandı — konu çözülemedi: "${belge.konuSlug ?? '-'}"; atıfta bulunulan konu taslakta veya slug'ı değişmiş.`,
    );
    return null;
  }
  if (!belge.yazarSlug) {
    console.warn(`[icerik:gundem] "${belge.slug}" atlandı — zorunlu yazarSlug yok.`);
    return null;
  }

  const kimlik = kunye(belge);
  if (!kimlik) return null;

  return {
    slug: belge.slug,
    baslik: belge.baslik,
    girizgah: belge.kisaCevap,
    konu: konu.ad,
    okumaDakika: kimlik.okumaDakika,
    yazarSlug: belge.yazarSlug,
    tarih: kimlik.yayinTarihi,
    guncellemeTarihi: belge.guncellemeTarihi,
    tezGuveni: belge.tezGuveni,
    yanlislanmaKosulu: belge.yanlislanmaKosulu,
    govde: belge.govde,
    kaynaklar: belge.kaynaklar,
    sss: belge.sss,
    ilgiliSluglar: belge.ilgiliAtlas,
    seo: belge.seo,
  };
}

/** Bir belge listesini derin analiz görünümüne çevirir. */
async function analizeCevir(belgeler: IcerikBelgesi[]): Promise<Analiz[]> {
  const konular = await konuHaritasi();
  return belgeler
    .filter(derinAnaliz)
    .map((belge) => analizGorunumu(belge, konular))
    .filter((analiz): analiz is Analiz => analiz !== null);
}

/** Derin analiz listesi, tarihe göre yeniden eskiye. Gövde okunmaz. */
export async function analizler(): Promise<Analiz[]> {
  return analizeCevir(await icerikBelgeleri({ tur: 'analiz' }, true));
}

/** Tek analiz, gövdesi ve SSS'siyle. `/analiz/<slug>/` sayfasının kaynağı. */
export async function analizBul(slug: string): Promise<Analiz | undefined> {
  const belge = await slugIle<IcerikBelgesi>(KOLEKSIYONLAR.icerikler, slug);
  if (!belge || !derinAnaliz(belge)) return undefined;
  return (await analizeCevir([belge]))[0];
}

/* --- BRIEF ---------------------------------------------------------------- */

export type BriefArsivKaydi = {
  tarih: string;
  baslik: string;
  /** Şemada YOK — `maddeler.length` ile hesaplanır. */
  maddeSayisi: number;
};

/** Yayındaki brief sayıları, tarihe göre yeniden eskiye. */
function briefBelgeleri(): Promise<BriefBelgesi[]> {
  return yayindakiler<BriefBelgesi>(KOLEKSIYONLAR.briefler, {
    siralama: { tarih: -1 },
  });
}

/**
 * `maddeler.items` → `BriefMaddesi`.
 *
 * Şema yalnızca `numara`, `baslik` ve `neden` istiyor; site tipi `kaynak` ve
 * `konuSlug`u da zorunlu sayıyor. İkisinden biri boş olan madde ATLANIR:
 * kaynağı yazılmamış bir madde kaynaklı gösterilemez (içerik kalite kuralı),
 * konusu olmayan madde de konu bağlantısı basamaz.
 */
function briefMaddeleri(belge: BriefBelgesi): BriefMaddesi[] {
  return (belge.maddeler ?? []).flatMap((madde) => {
    if (!madde.kaynak || !madde.konuSlug) {
      console.warn(
        `[icerik:gundem] ${belge.tarih} sayısında bir madde atlandı — kaynak/konuSlug eksik: "${madde.baslik}".`,
      );
      return [];
    }
    return [
      {
        numara: madde.numara,
        baslik: madde.baslik,
        neden: madde.neden,
        kaynak: madde.kaynak,
        konuSlug: madde.konuSlug,
      },
    ];
  });
}

/** En güncel sayının maddeleri — `BRIEF` karşılığı. Sayı yoksa boş dizi. */
export async function brief(): Promise<BriefMaddesi[]> {
  const guncel = (await briefBelgeleri())[0];
  return guncel ? briefMaddeleri(guncel) : [];
}

/**
 * Brief arşivi: tarih + başlık + madde sayısı.
 *
 * `maddeSayisi` şemada tutulmaz, `maddeler.length` ile hesaplanır.
 * Veritabanında şu an TEK sayı vardır: fixture'daki beş arşiv kaydının dördünde madde
 * gövdesi yoktu ve şema `minItems: 1` istediği için madde uydurulmadı
 * (bkz. `lib/tohum/briefler.ts`). `/brief/` ve `/bulten/` arşiv listesinin
 * tek satır göstermesi BEKLENEN durumdur.
 */
/**
 * Tek bir brief sayısı — tarihiyle.
 *
 * NEDEN GEREKLİ: arşivde 45 sayı var ama yalnızca en yenisi okunabiliyordu.
 * `/brief/` sayfasındaki arşiv listesi her satırı yine `/brief/`'e
 * bağlıyordu, yani 44 sayı veritabanında durup hiçbir adresten
 * görünmüyordu — "veri var, hiçbir şey okumuyor" hatasının bir örneği daha.
 */
export async function briefBul(
  tarih: string,
): Promise<{ tarih: string; baslik: string; maddeler: BriefMaddesi[] } | undefined> {
  const belge = (await briefBelgeleri()).find((b) => b.tarih === tarih);
  if (!belge) return undefined;
  return { tarih: belge.tarih, baslik: belge.baslik, maddeler: briefMaddeleri(belge) };
}

export async function briefArsivi(): Promise<BriefArsivKaydi[]> {
  return (await briefBelgeleri()).map((belge) => ({
    tarih: belge.tarih,
    baslik: belge.baslik,
    maddeSayisi: (belge.maddeler ?? []).length,
  }));
}

/* --- RADAR ---------------------------------------------------------------- */

/** Enum denetimi: şema dışı bir yön site tipine sokulmaz. */
function radarYonu(deger: string): RadarYonu | undefined {
  if (deger === 'yukselen' || deger === 'sabit' || deger === 'dusen') return deger;
  return undefined;
}

/**
 * `radar` belgesi → `RadarKaydi`.
 *
 * `degisim` ve dört sinyalin tamamı site tipinde zorunlu, şemada değil.
 * Eksik sinyal sıfırla tamamlanmaz (ölçüm uydurulmaz) — kayıt atlanır.
 */
function radarGorunumu(belge: RadarBelgesi): RadarKaydi | null {
  const yon = radarYonu(belge.yon);
  if (!yon) {
    console.warn(`[icerik:gundem] radar "${belge.slug}" atlandı — tanınmayan yön: "${belge.yon}".`);
    return null;
  }

  const s = belge.sinyaller;
  if (
    !s ||
    typeof belge.degisim !== 'number' ||
    typeof s.yayin !== 'number' ||
    typeof s.github !== 'number' ||
    typeof s.modelCikisi !== 'number' ||
    typeof s.aramaIlgisi !== 'number'
  ) {
    console.warn(
      `[icerik:gundem] radar "${belge.slug}" atlandı — degisim veya sinyal kırılımı eksik; ölçüm tamamlanmaz.`,
    );
    return null;
  }

  return {
    slug: belge.slug,
    ad: belge.ad,
    momentum: belge.momentum,
    yon,
    degisim: belge.degisim,
    sinyaller: {
      yayin: s.yayin,
      github: s.github,
      modelCikisi: s.modelCikisi,
      aramaIlgisi: s.aramaIlgisi,
    },
    not: belge.not,
    seo: belge.seo,
  };
}

/**
 * Radar — her konunun EN GÜNCEL anlık görüntüsü, momentuma göre azalan.
 *
 * `radar` bir zaman serisidir (tekillik `slug + tarih`) ve `durum` alanı
 * YOKTUR; bu yüzden `durumsuz: true` verilir — ölçüm kaydı yayın nesnesi
 * değildir. Sitenin istediği tek bir anlık görüntü olduğu için slug başına
 * en yeni tarih seçilir; belge sayısı onlarla ölçüldüğünden gruplama
 * uygulamada yapılır, `aggregate` gerekmez.
 */
export async function radar(): Promise<RadarKaydi[]> {
  const belgeler = await yayindakiler<RadarBelgesi>(KOLEKSIYONLAR.radar, {
    siralama: { tarih: -1, momentum: -1 },
    durumsuz: true,
  });

  const enGuncel = new Map<string, RadarBelgesi>();
  for (const belge of belgeler) {
    const varolan = enGuncel.get(belge.slug);
    if (!varolan || belge.tarih > varolan.tarih) enGuncel.set(belge.slug, belge);
  }

  return [...enGuncel.values()]
    .map(radarGorunumu)
    .filter((kayit): kayit is RadarKaydi => kayit !== null)
    .sort((a, b) => b.momentum - a.momentum);
}

/** Bir konunun en güncel radar kaydı; yoksa `undefined`. */
export async function radarBul(slug: string): Promise<RadarKaydi | undefined> {
  return (await radar()).find((kayit) => kayit.slug === slug);
}
