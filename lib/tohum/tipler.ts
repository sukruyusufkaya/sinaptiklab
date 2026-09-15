/**
 * Tohumlama sözleşmesi.
 *
 * `lib/veri/*` fixture'ları Mongo şemasıyla ALAN ALAN uyumlu DEĞİL. Denetim
 * 122 uyumsuzluk buldu; fixture'ları olduğu gibi yazmak ~152 belgede
 * "Document failed validation" verir. Örnekler:
 *
 *  - 20 koleksiyonda `durum` zorunlu, fixture'ların çoğunda bu alan hiç yok.
 *  - `MODELLER.durum: 'guncel'` yanlış alana yazılmış; şemada `guncellikDurumu`.
 *  - `icerikler` gömülü `konu`/`yazar` nesnesi taşıyor, şema `konuSlug`/`yazarSlug` istiyor.
 *  - `atlas.kategori` görünen ad ("MLOps / LLMOps"), şema slug istiyor.
 *  - `RADAR` kayıtlarında zorunlu `tarih` yok.
 *  - `ETKINLIKLER.durum` değeri `etkinlikDurumu` enum'una ait.
 *
 * Bu yüzden her koleksiyonun kendi DÖNÜŞTÜRÜCÜSÜ var. Dönüştürücü saf bir
 * fonksiyondur: fixture'ı okur, şemaya uyan belgeler üretir. Veritabanına
 * dokunmaz — yazma işini `scripts/tohumla.mjs` yapar.
 */

export type TohumBelgesi = Record<string, unknown>;

export type Donusturucu = {
  /** `KOLEKSIYONLAR` içindeki koleksiyon adı. */
  koleksiyon: string;
  /** Tekil dizin alanı — upsert bu alan üzerinden yapılır. */
  anahtarAlan: string;
  /** Şemaya uyan belgeleri üretir. */
  uret: () => TohumBelgesi[];
  /** Kısa açıklama: hangi fixture'dan geldiği ve ne dönüştürüldüğü. */
  not?: string;
};

/* --- PAYLAŞILAN YARDIMCILAR ---------------------------------------------- */

/** Görünen adı slug'a çevirir. Türkçe karakterler ASCII'ye katlanır. */
export function slugla(metin: string): string {
  return metin
    .toLocaleLowerCase('tr-TR')
    .replaceAll('ı', 'i')
    .replaceAll('ğ', 'g')
    .replaceAll('ü', 'u')
    .replaceAll('ş', 's')
    .replaceAll('ö', 'o')
    .replaceAll('ç', 'c')
    .replaceAll('â', 'a')
    .replaceAll('î', 'i')
    .replaceAll('û', 'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * `undefined` alanları temizler.
 *
 * Sürücüde `ignoreUndefined: true` açık olsa da dönüştürücü çıktısını temiz
 * tutmak karşılaştırmayı ve hata ayıklamayı kolaylaştırır.
 */
export function temizle<T extends TohumBelgesi>(belge: T): T {
  const sonuc: TohumBelgesi = {};
  for (const [anahtar, deger] of Object.entries(belge)) {
    if (deger === undefined) continue;
    if (Array.isArray(deger) && deger.length === 0) continue;
    sonuc[anahtar] = deger;
  }
  return sonuc as T;
}

/** ISO tarih deseni doğrulaması; uymayan değer `undefined` döner. */
export function tarihOlarak(deger: unknown): string | undefined {
  if (typeof deger !== 'string') return undefined;
  return /^\d{4}-\d{2}-\d{2}$/.test(deger) ? deger : undefined;
}

/** Fixture'da olmayan `durum` alanı için varsayılan. */
export const YAYINDA = 'yayinda';
export const TASLAK = 'taslak';
