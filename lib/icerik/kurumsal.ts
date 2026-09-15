import type { Blok, Hizmet, SektorKaydi, VakaCalismasi } from '@/lib/tipler';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { slugIle, yayindakiler } from '@/lib/mongo/sorgular/site';

/**
 * Kurumsal okuma modülü — `hizmetler`, `sektorler`, `vakalar` koleksiyonları.
 *
 * `lib/veri/kurumsal.ts` ile AYNI ADLARI ve AYNI ŞEKİLLERİ verir; tek fark
 * fonksiyonların `async` olması (bkz. `lib/icerik/atlas.ts`). Sayfa taşımak
 * `await` eklemek ve içe alma yolunu değiştirmekten ibarettir.
 *
 * İLİŞKİ YOK. Bu üç koleksiyonun hiçbiri `konuSlug`/`yazarSlug` taşımaz, bu
 * yüzden `lib/icerik/temel.ts` birleştirmesi burada kullanılmaz. `hizmetler`
 * ve `sektorler` düz kayıtlardır; şemadaki alan adları site tipleriyle birebir
 * örtüşür, dönüşüm yalnızca "şemada opsiyonel / site tipinde zorunlu" olan
 * alanların normalleştirilmesidir (aşağıya bakın).
 *
 * ŞEMADA OPSİYONEL, SİTE TİPİNDE ZORUNLU. Üç alan ailesi:
 *  - `Hizmet.kullanimAlanlari` (kart "N kullanım alanı" basar) → `?? []`
 *  - `SektorKaydi.kullanimSayisi` → `?? 0`
 *  - `VakaCalismasi.teknolojiler` / `etki` / `dersler` → `?? []`
 * Bunlar UYDURMA DEĞER DEĞİL, yokluğun gösterimidir: boş dizi boş liste basar,
 * `0` ise "belirtilmemiş" demektir (panelde `kullanimSayisi` zorunlu alan
 * değildir). Şemada bulunmayan hiçbir alan üretilmez (CLAUDE.md §5).
 *
 * VAKA — SEKTÖR BAĞI (`sektor` + `sektorSlug`). Şema ikisini birlikte tutar:
 * `sektor` görünen addır ve etiket olarak basılır, `sektorSlug` sektör
 * sayfasına bağlanan referanstır (`sektor` dizininin alanı). Hiçbiri
 * üretilmez; ikisi de olduğu gibi aktarılır. Slug'ı olmayan vaka listede
 * adıyla görünür, sektör filtresinde görünmez — tohumlamadaki karar budur
 * (bkz. `lib/tohum/vakalar.ts`).
 *
 * VAKA — TEMSİLÎ KAYIT. `temsili` alanı, yaklaşımı göstermek için yazılmış
 * senaryoyu gerçek müşteri geçmişinden ayırır. Okuma katmanı bu alanı
 * DEĞERLENDİRMEZ, olduğu gibi aktarır: kaydı gizlemek yanlış olurdu (yöntem
 * anlatısı değerlidir), ama işareti düşürmek de yanlış olurdu (okur gerçek bir
 * iş sanır). Kararı sayfa verir ve görünür bir uyarı basar. `musteriAdi` ile
 * birlikte kullanılmaz; temsilî bir kayıtta müşteri adı hiç yazılmaz.
 *
 * VAKA — MÜŞTERİ ADI. `musteriAdi` yalnızca `onayliYayin` işaretliyse sitede
 * görünebilir (panel yardım metni: "İşaretsizken müşteri adı sitede
 * gösterilmez"). Bu kural burada UYGULANIR: onay yoksa alan döndürülen
 * nesneye hiç konmaz, böylece kuralı bilmeyen bir sayfa da adı basamaz.
 * `onayliYayin` ise AYNEN aktarılır; sayfa isterse onay durumunu kendisi
 * değerlendirir. (Taslağın sızmaması nasıl okuma katmanının işiyse, onaysız
 * müşteri adının sızmaması da öyledir.)
 *
 * ÜSTVERİ. Üç koleksiyonun da şemasında `seo` var; üç görünüme çevirme
 * fonksiyonu belgeyi YAYDIĞI için (`...belge` / `...kalan`) alan kendiliğinden
 * taşınır ve `lib/tipler.ts`te tipi açıldı. `VAKA_LISTE_HARIC` ve
 * `HIZMET_LISTE_HARIC` yalnızca ağır alanları eler; `seo` oraya eklenmemeli.
 *
 * MONGO'DA KARŞILIĞI OLMAYAN İKİ SABİT. `SUREC_ADIMLARI` ve
 * `READINESS_BOYUTLARI` hiçbir koleksiyona tohumlanmadı; şemaları da yok
 * (bkz. `lib/mongo/koleksiyonlar.ts`). Sayfaların tek bir içe alma noktası
 * olsun diye buradan yeniden aktarılırlar. Fixture modülü kaldırıldığında bu
 * ikisi Mongo'ya değil, kod düzeyinde bir modüle (`lib/taksonomi.ts` kalıbı)
 * taşınır: `SUREC_ADIMLARI` yöntem tanımıdır, `READINESS_BOYUTLARI.ornekSkor`
 * ise açıkça örnek veridir (MASTER-PLAN §59) — ikisi de editör verisi değil.
 */

export { SUREC_ADIMLARI, READINESS_BOYUTLARI } from '@/lib/veri/kurumsal';

/* --- HİZMETLER ------------------------------------------------------------ */

/** Mongo belgesi: `kullanimAlanlari` şemada zorunlu değil. */
type HizmetBelgesi = Omit<Hizmet, 'kullanimAlanlari'> & { kullanimAlanlari?: string[] };

function hizmetGorunume(belge: HizmetBelgesi): Hizmet {
  return { ...belge, kullanimAlanlari: belge.kullanimAlanlari ?? [] };
}

/** Listede gerekmeyen ağır alan: SSS yalnızca hizmet detayında basılır. */
const HIZMET_LISTE_HARIC = ['sss'] as const;

/**
 * Yayındaki hizmet hatları, ada göre Türkçe sıralı.
 *
 * Sıralama panelin `siralama: { ad: 1 }` kararıyla aynıdır. Şemada sıra alanı
 * yoktur; fixture dizisinin yazım sırası korunamaz, bu yüzden listedeki
 * "01, 02…" numaraları sunum sırasıdır, içeriğe ait bir değer değil.
 */
export async function hizmetler(): Promise<Hizmet[]> {
  const belgeler = await yayindakiler<HizmetBelgesi>(KOLEKSIYONLAR.hizmetler, {
    haric: HIZMET_LISTE_HARIC,
  });
  return belgeler.map(hizmetGorunume).sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
}

/** Tek hizmet — SSS'siyle birlikte. Taslak/yok ise `undefined` (sayfa 404 verir). */
export async function hizmetBul(slug: string): Promise<Hizmet | undefined> {
  const belge = await slugIle<HizmetBelgesi>(KOLEKSIYONLAR.hizmetler, slug);
  return belge ? hizmetGorunume(belge) : undefined;
}

/* --- SEKTÖRLER ------------------------------------------------------------ */

/** Mongo belgesi: `kullanimSayisi` şemada zorunlu değil. */
type SektorBelgesi = Omit<SektorKaydi, 'kullanimSayisi'> & { kullanimSayisi?: number };

function sektorGorunume(belge: SektorBelgesi): SektorKaydi {
  return { ...belge, kullanimSayisi: belge.kullanimSayisi ?? 0 };
}

/**
 * Yayındaki sektörler, ada göre Türkçe sıralı.
 *
 * Şemada ağır alan yoktur (gövde, SSS, kaynak, sürüm geçmişi bu koleksiyonda
 * tanımlı değil), bu yüzden liste ve detay aynı alanları okur.
 */
export async function sektorler(): Promise<SektorKaydi[]> {
  const belgeler = await yayindakiler<SektorBelgesi>(KOLEKSIYONLAR.sektorler);
  return belgeler.map(sektorGorunume).sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
}

/**
 * Slug ile tek sektör.
 *
 * İmza fixture'daki `sektorBul(slug: string)`'a göre GENİŞLETİLDİ: çağıranın
 * elindeki değer çoğu zaman `vaka.sektorSlug`'dır ve o alan opsiyoneldir
 * (`lib/icerik/temel.ts` içindeki `konuBul` ile aynı kalıp). Mevcut çağrılar
 * bir metin geçirdiği için bozulmaz.
 */
export async function sektorBul(slug?: string): Promise<SektorKaydi | undefined> {
  if (!slug) return undefined;
  const belge = await slugIle<SektorBelgesi>(KOLEKSIYONLAR.sektorler, slug);
  return belge ? sektorGorunume(belge) : undefined;
}

/* --- VAKA ÇALIŞMALARI ----------------------------------------------------- */

/**
 * Etki öğesi.
 *
 * `olcumYontemi` şemada var, site tipinde yok. Aktarılır: §59 gereği rakam
 * taşıyan bir etki satırı ancak ölçüm yöntemiyle birlikte yayımlanabilir,
 * sayfanın bu alanı görebilmesi gerekir. Tohumlanan dört vakanın hiçbirinde
 * yok (değerlerin tamamı niteliksel).
 */
export type VakaEtkisi = { etiket: string; deger: string; olcumYontemi?: string };

/**
 * Vaka kaydı: `VakaCalismasi` + şemanın üç ek alanı.
 *
 * `VakaCalismasi` bekleyen bileşenlere olduğu gibi verilebilir (ek alanların
 * hepsi opsiyonel).
 */
export type VakaKaydi = Omit<VakaCalismasi, 'etki'> & {
  etki: VakaEtkisi[];
  /**
   * Uzun anlatım. Şemada ve panelde var, site tipinde yok — bu yüzden bugün
   * hiçbir sayfa basmıyor. Aktarılır ki editörün yazdığı gövde okunabilir
   * kalsın; listede `haric` ile dışarıda bırakılır.
   */
  govde?: Blok[];
  /** Sektör sayfasına bağlanan referans. Eşlemesi olmayan vakada yok. */
  sektorSlug?: string;
  /** Müşterinin ticari adı — yalnızca `onayliYayin` doğruysa taşınır. */
  musteriAdi?: string;
  /** Müşteri adının yayımına yazılı onay var mı (şemadan olduğu gibi). */
  onayliYayin?: boolean;
  /**
   * Gerçek müşteri işi DEĞİL, yaklaşımı gösteren temsilî senaryo.
   *
   * `onayliYayin: false` ile karıştırılmamalı: o yalnızca müşteri adının
   * yayımlanamayacağını söyler, kaydın gerçekliğini değil. Bu alan doğruysa
   * sayfa görünür bir uyarı basar (değişmez kural 5) ve etki satırlarında
   * rakam beklenmez. Aktarılır, türetilmez — yazılmamışsa `undefined` kalır
   * ve sayfa uyarı basmaz.
   */
  temsili?: boolean;
};

/** Mongo belgesi: üç dizi alanı şemada zorunlu değil. */
type VakaBelgesi = Omit<VakaKaydi, 'teknolojiler' | 'etki' | 'dersler'> & {
  teknolojiler?: string[];
  etki?: VakaEtkisi[];
  dersler?: string[];
};

function vakaGorunume(belge: VakaBelgesi): VakaKaydi {
  const { musteriAdi, teknolojiler, etki, dersler, ...kalan } = belge;
  return {
    ...kalan,
    teknolojiler: teknolojiler ?? [],
    etki: etki ?? [],
    dersler: dersler ?? [],
    // Onay yoksa alan hiç konmaz — bkz. dosya başlığı "VAKA — MÜŞTERİ ADI".
    ...(kalan.onayliYayin === true && musteriAdi ? { musteriAdi } : {}),
  };
}

/** Listede gerekmeyen ağır alan. */
const VAKA_LISTE_HARIC = ['govde'] as const;

function vakaSirala(a: VakaKaydi, b: VakaKaydi): number {
  const sektor = a.sektor.localeCompare(b.sektor, 'tr');
  return sektor !== 0 ? sektor : a.baslik.localeCompare(b.baslik, 'tr');
}

/**
 * Yayındaki vaka çalışmaları; sektör adına, sonra başlığa göre sıralı
 * (panelin `siralama: { sektor: 1, baslik: 1 }` kararıyla aynı).
 */
export async function vakalar(): Promise<VakaKaydi[]> {
  const belgeler = await yayindakiler<VakaBelgesi>(KOLEKSIYONLAR.vakalar, {
    haric: VAKA_LISTE_HARIC,
  });
  return belgeler.map(vakaGorunume).sort(vakaSirala);
}

/** Tek vaka — gövdesiyle birlikte. */
export async function vakaBul(slug: string): Promise<VakaKaydi | undefined> {
  const belge = await slugIle<VakaBelgesi>(KOLEKSIYONLAR.vakalar, slug);
  return belge ? vakaGorunume(belge) : undefined;
}

/**
 * Bir sektörün vakaları — `sektorSlug` üzerinden, `sektor` dizinini kullanır.
 *
 * Fixture'da karşılığı olmayan EK yardımcı (`kategoriyeGoreAtlas` kalıbı).
 * Gerekçe: sektör sayfası bugün görünen adları karşılaştırarak süzüyor
 * (`vaka.sektor.toLocaleLowerCase('tr')`), yani ad her değiştiğinde bağ
 * kopuyor. Kalıcı bağ slug'dır. Slug'ı olmayan vaka hiçbir sektörün
 * sonucunda görünmez — var olmayan bir sayfaya bağlanmaktan iyidir.
 */
export async function sektoreGoreVakalar(sektorSlug?: string): Promise<VakaKaydi[]> {
  if (!sektorSlug) return [];
  const belgeler = await yayindakiler<VakaBelgesi>(KOLEKSIYONLAR.vakalar, {
    suzgec: { sektorSlug },
    haric: VAKA_LISTE_HARIC,
  });
  return belgeler.map(vakaGorunume).sort(vakaSirala);
}
