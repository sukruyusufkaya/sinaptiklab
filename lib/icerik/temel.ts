import type { Konu, Yazar } from '@/lib/tipler';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { yayindakiler } from '@/lib/mongo/sorgular/site';
import { KONU_ANAHTARLARI, SEVIYE_ADI, TUR_ADI, type KonuAnahtari } from '@/lib/taksonomi';

/**
 * Konu ve yazar okuma modülü — DİĞER TÜM ALAN MODÜLLERİNİN TEMELİ.
 *
 * NEDEN ÖNCE BU: şema, içeriğin konusunu ve yazarını `konuSlug` / `yazarSlug`
 * olarak tutar (ilişki normalize edilmiştir). Site tipleri ise gömülü NESNE
 * ister: `icerik.yazar.ad`, `icerik.konu.kume`. Aradaki birleştirmeyi
 * `konuHaritasi()` / `yazarHaritasi()` yapar; `lib/icerik/gundem.ts`,
 * `yayin.ts` ve `ogrenme.ts` bu iki fonksiyona dayanır.
 *
 * Birleştirme UYGULAMADA yapılır, `$lookup` ile değil: konu ve yazar sayısı
 * onlarla ölçülür, her istekte bir kez okunup `cache()` ile paylaşılır. Bu,
 * her içerik sorgusuna bir toplama aşaması eklemekten hem daha hızlı hem de
 * hata ayıklaması daha kolaydır.
 *
 * ÜSTVERİ: `konular` ve `yazarlar` şemalarında `seo` alanı var ve her ikisinin
 * kamuya açık detay sayfası da var (`/konu/<slug>/`, `/yazar/<slug>/`). Belge
 * buradan hiç alan atlanmadan geçtiği için alan kendiliğinden taşınır; dönüşüm
 * eklenmesi gerekmedi. Yan etki: `iliskileriCoz()` ile gömülen `konu`/`yazar`
 * nesneleri de `seo`yu taşır — küçük bir yük, ama konu sayfasının üstverisini
 * tek kaynaktan okumak buna değer.
 */

export { SEVIYE_ADI, TUR_ADI, KONU_ANAHTARLARI };
export type { KonuAnahtari };

/* --- KONULAR -------------------------------------------------------------- */

/** Yayındaki konular, slug'a göre. */
export async function konuHaritasi(): Promise<Map<string, Konu>> {
  const belgeler = await yayindakiler<Konu>(KOLEKSIYONLAR.konular);
  return new Map(belgeler.map((k) => [k.slug, k]));
}

/**
 * Kod içindeki kısa anahtarla erişilen konu kaydı — fixture'daki
 * `KONULAR` nesnesinin karşılığı.
 *
 * Anahtarın karşılığı veritabanında yoksa (konu taslağa alınmış veya slug'ı
 * değişmiş) o anahtar sonuçta BULUNMAZ. `KONULAR.agent!` gibi bir kullanım
 * bu yüzden çalışmaz; çağıran `?.` ile ilerler ya da `konuBul` kullanır.
 */
export async function konular(): Promise<Partial<Record<KonuAnahtari, Konu>>> {
  const harita = await konuHaritasi();
  const sonuc: Partial<Record<KonuAnahtari, Konu>> = {};
  for (const [anahtar, slug] of Object.entries(KONU_ANAHTARLARI) as [KonuAnahtari, string][]) {
    const konu = harita.get(slug);
    if (konu) sonuc[anahtar] = konu;
  }
  return sonuc;
}

/** Yayındaki konu listesi, ada göre Türkçe sıralı. */
export async function konuListesi(): Promise<Konu[]> {
  const belgeler = await yayindakiler<Konu>(KOLEKSIYONLAR.konular);
  return [...belgeler].sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
}

/* --- HİYERARŞİ ------------------------------------------------------------ */

/**
 * Konuları KÜME ve SIRA'ya göre dizer.
 *
 * `konuListesi()` ada göre alfabetik sıralar; bu okuma sırası DEĞİLDİR.
 * Editör `sira` alanını küme içinde okuma sırası olarak dolduruyor (ana konu
 * önce, alt konuları hemen ardından). Alfabetik liste "Akıl Yürütme"yi "Büyük
 * Dil Modelleri"nden önce göstererek bağımlılığı tersine çevirir.
 */
function siraya(kayitlar: readonly Konu[]): Konu[] {
  return [...kayitlar].sort((a, b) => {
    const kume = a.kume.localeCompare(b.kume, 'tr');
    if (kume !== 0) return kume;
    const sira = (a.sira ?? Number.MAX_SAFE_INTEGER) - (b.sira ?? Number.MAX_SAFE_INTEGER);
    return sira !== 0 ? sira : a.ad.localeCompare(b.ad, 'tr');
  });
}

export type KonuDugumu = { konu: Konu; altKonular: Konu[] };

/**
 * İki düzeyli konu ağacı: ana konular ve her birinin alt konuları.
 *
 * Ağaç UYGULAMADA kurulur, `$graphLookup` ile değil: 50 konu tek sorguda
 * gelir ve `cache()` ile paylaşılır; bir toplama aşaması eklemek hem yavaş
 * hem hata ayıklaması zor olurdu.
 *
 * Üstü YAYINDA OLMAYAN bir alt konu ağaçta kaybolmaz — kendi ana konusu gibi
 * davranır ve kök düzeyde görünür. Aksi hâlde ana konu taslağa alındığında
 * alt konularının tamamı sessizce gezinmeden düşerdi.
 */
export async function konuAgaci(): Promise<KonuDugumu[]> {
  const hepsi = siraya(await yayindakiler<Konu>(KOLEKSIYONLAR.konular));
  const varOlan = new Set(hepsi.map((k) => k.slug));

  const kokler = hepsi.filter((k) => !k.ustKonuSlug || !varOlan.has(k.ustKonuSlug));
  return kokler.map((konu) => ({
    konu,
    altKonular: hepsi.filter((k) => k.ustKonuSlug === konu.slug),
  }));
}

/** Bir ana konunun alt konuları; alt konuda veya bilinmeyen slug'da boş dizi. */
export async function altKonular(ustKonuSlug?: string): Promise<Konu[]> {
  if (!ustKonuSlug) return [];
  const belgeler = await yayindakiler<Konu>(KOLEKSIYONLAR.konular, {
    suzgec: { ustKonuSlug },
  });
  return siraya(belgeler);
}

/** Bir alt konunun ana konusu; ana konuda `undefined`. */
export async function ustKonu(konu?: Konu): Promise<Konu | undefined> {
  if (!konu?.ustKonuSlug) return undefined;
  return konuBul(konu.ustKonuSlug);
}

/** Slug ile tek konu. */
export async function konuBul(slug?: string): Promise<Konu | undefined> {
  if (!slug) return undefined;
  return (await konuHaritasi()).get(slug);
}

/**
 * Görünen addan konu — ESKİ VERİ İÇİN.
 *
 * Bazı fixture kayıtları konuyu adıyla taşıyordu ("AI Business"). Tohumlama
 * bunları slug'a çevirdi; bu yardımcı yalnızca elde yalnızca ad kaldığında
 * (ör. eski bir dış bağlantı) kullanılır. Yeni kod SLUG ile çalışır.
 */
export async function konuAdIle(ad?: string): Promise<Konu | undefined> {
  if (!ad) return undefined;
  return (await konuListesi()).find((k) => k.ad === ad);
}

/* --- YAZARLAR ------------------------------------------------------------- */

/** Yayındaki yazarlar, slug'a göre. */
export async function yazarHaritasi(): Promise<Map<string, Yazar>> {
  const belgeler = await yayindakiler<Yazar>(KOLEKSIYONLAR.yazarlar);
  return new Map(belgeler.map((y) => [y.slug, y]));
}

/** Yayındaki yazar listesi, ada göre Türkçe sıralı. */
export async function yazarListesi(): Promise<Yazar[]> {
  const belgeler = await yayindakiler<Yazar>(KOLEKSIYONLAR.yazarlar);
  return [...belgeler].sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
}

/**
 * Künye için yedek imza.
 *
 * Fixture'daki `yazarBul` her zaman bir yazar döndürüyordu; imzasız içerik
 * olmaması için haber masasına düşüyordu. Aynı davranış korunur — ama yedek
 * de veritabanından okunur, koda gömülmez. Hiç yazar kaydı yoksa `undefined`
 * döner ve çağıran imza şeridini basmaz (uydurma imza atılmaz).
 */
const YEDEK_YAZAR_SLUGU = 'sinaptik-redaksiyon';

export async function yazarBul(slug?: string): Promise<Yazar | undefined> {
  const harita = await yazarHaritasi();
  if (slug) {
    const yazar = harita.get(slug);
    if (yazar) return yazar;
  }
  return harita.get(YEDEK_YAZAR_SLUGU);
}

/* --- İÇERİK BİRLEŞTİRME ---------------------------------------------------- */

/** Şemadaki normalize edilmiş hâl: konu ve yazar slug olarak durur. */
export type SluglarIle = {
  konuSlug?: string;
  yazarSlug?: string;
};

/**
 * `konuSlug`/`yazarSlug` taşıyan bir belgeyi gömülü nesnelere çevirir.
 *
 * Konusu veya yazarı çözülemeyen kayıt için ilgili alan `undefined` kalır;
 * kayıt DÜŞÜRÜLMEZ. Gerekçe: imzası çözülemeyen bir haberi sitede hiç
 * göstermemek, imzasız göstermekten daha çok bilgi kaybettirir. Çağıran alan
 * modülü, zorunlu bir ilişki varsa kendi kararını verir.
 */
export function iliskileriCoz<T extends SluglarIle>(
  belge: T,
  konular: Map<string, Konu>,
  yazarlar: Map<string, Yazar>,
): Omit<T, 'konuSlug' | 'yazarSlug'> & { konu?: Konu; yazar?: Yazar } {
  const { konuSlug, yazarSlug, ...kalan } = belge;
  return {
    ...kalan,
    konu: konuSlug ? konular.get(konuSlug) : undefined,
    yazar: yazarSlug ? yazarlar.get(yazarSlug) : undefined,
  };
}
