import { SEKTORLER, VAKALAR } from '@/lib/veri/kurumsal';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { slugla, temizle, YAYINDA, type Donusturucu } from '@/lib/tohum/tipler';

/**
 * Vaka çalışmaları dönüştürücüsü.
 *
 * Şemada zorunlu alanlar: `slug`, `baslik`, `sektor`, `problem`, `yaklasim`,
 * `durum`. Fixture (`VAKALAR`) ilk beşini taşıyor; yapılan dönüşümler:
 *
 *  1. `durum` fixture'da hiç yok, şemada zorunlu → `yayinda` verilir. Dört
 *     kaydın hiçbirinde "geliştiriliyor / yakında" gibi yayına hazır olmama
 *     işareti yok; hepsi sitede (`/vaka-calismalari/`) yayımlanmış vakalar.
 *  2. `sektor` görünen ad ("Üretim", "Lojistik") ve şemada serbest metin →
 *     olduğu gibi yazılır. Şemadaki `sektorSlug` (SLUG desenli, sektör
 *     sayfasına bağlanan referans ve `sektor` dizininin alanı) fixture'da yok;
 *     `SEKTORLER` içinden görünen ada göre eşlenir. Karşılığı olmayan ad
 *     ("Kurumsal" — sektör listesinde yer almıyor) için alan HİÇ yazılmaz:
 *     var olmayan bir sektör sayfasına işaret eden slug uydurmaktansa kaydı
 *     sektör filtresi dışında bırakmak doğru. Zorunlu olmadığı için kayıt
 *     atılmaz, yalnızca uyarı basılır.
 *  3. `musteriAdi` fixture'da yok (vakalar bilinçli olarak sektör düzeyinde
 *     anlatılıyor); şemadaki `onayliYayin` bu yüzden `false` yazılır — yazılı
 *     onay dosyada olmadığı sürece müşteri adı yayımlanamaz.
 *  4. `etki` öğeleri şemadaki `items.required: ['etiket', 'deger']` kuralına
 *     uyacak biçimde yalnızca bu iki alanla yazılır. Fixture'da `olcumYontemi`
 *     yok (değerlerin tamamı niteliksel: "Numune yerine tam kontrol" gibi),
 *     bu yüzden alan uydurulmaz; MASTER-PLAN §59 gereği yöntemsiz rakam da
 *     yok. Etiketi veya değeri boş olan öğe düşürülür.
 *  5. `slug` SLUG desenine (`^[a-z0-9]+(?:-[a-z0-9]+)*$`) karşı doğrulanır;
 *     uymayan değer `slugla()` ile katlanır, çevrilemezse kayıt atlanır.
 *
 * Şemada olup fixture'da karşılığı olmayan `govde` ve `seo` alanları
 * uydurulmaz; hiç yazılmaz (zorunlu değiller).
 */

const SLUG_DESENI = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const SEKTOR_SLUGU = new Map(SEKTORLER.map((sektor) => [sektor.ad, sektor.slug]));
const SEKTOR_SLUGLARI = new Set(SEKTORLER.map((sektor) => sektor.slug));

/** Görünen sektör adını sektör sayfası slug'ına çevirir; karşılığı yoksa `undefined`. */
function sektorSluguBul(sektor: string): string | undefined {
  const eslesen = SEKTOR_SLUGU.get(sektor);
  if (eslesen) return eslesen;
  const katlanmis = slugla(sektor);
  return SEKTOR_SLUGLARI.has(katlanmis) ? katlanmis : undefined;
}

export const VAKALAR_DONUSTURUCUSU: Donusturucu = {
  koleksiyon: KOLEKSIYONLAR.vakalar,
  anahtarAlan: 'slug',
  not: 'lib/veri/kurumsal.ts (VAKALAR) — durum eklenir, sektör adı sektorSlug’a eşlenir, onayliYayin false.',
  uret: () =>
    VAKALAR.flatMap((vaka) => {
      let slug = vaka.slug;
      if (!SLUG_DESENI.test(slug)) {
        const katlanmis = slugla(slug);
        if (!SLUG_DESENI.test(katlanmis)) {
          console.warn(`[tohum:vakalar] "${slug}" atlandı — slug desenine çevrilemedi.`);
          return [];
        }
        console.warn(`[tohum:vakalar] slug düzeltildi: "${slug}" → "${katlanmis}"`);
        slug = katlanmis;
      }

      const sektorSlug = sektorSluguBul(vaka.sektor);
      if (!sektorSlug) {
        console.warn(
          `[tohum:vakalar] "${slug}" için sektorSlug yazılmadı — "${vaka.sektor}" SEKTORLER içinde yok; sektör filtresinde görünmez.`,
        );
      }

      const etki = vaka.etki
        .filter((oge) => Boolean(oge.etiket) && Boolean(oge.deger))
        .map((oge) => ({ etiket: oge.etiket, deger: oge.deger }));

      return [
        temizle({
          slug,
          baslik: vaka.baslik,
          sektor: vaka.sektor,
          sektorSlug,
          onayliYayin: false,
          problem: vaka.problem,
          yaklasim: vaka.yaklasim,
          teknolojiler: vaka.teknolojiler,
          etki,
          dersler: vaka.dersler,
          durum: YAYINDA,
        }),
      ];
    }),
};
