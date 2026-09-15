import { MESLEKLER } from '@/lib/veri/lab';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { slugla, temizle, YAYINDA, type Donusturucu } from '@/lib/tohum/tipler';

/**
 * Meslekler dönüştürücüsü — `lib/veri/lab.ts` içindeki `MESLEKLER` dizisi.
 *
 * Tek uyumsuzluk: şemada `durum` zorunlu, fixture'da bu alan hiç yok
 * (`Meslek` tipinde de tanımlı değil). Kariyer sayfaları yayında olduğu için
 * `yayinda` verilir.
 *
 * Fixture'ın diğer alanları (`ad`, `ozet`, `neYapar`, `beceriler`,
 * `teknolojiler`, `yolSlug`, `testSlug`) şemadaki karşılıklarıyla birebir
 * örtüşür. `yolSlug`/`testSlug` isteğe bağlıdır; yoksa `temizle()` alanı atar.
 * Şemada olmayan alan yazılmaz (`seo` fixture'da bulunmuyor).
 *
 * SLUG deseni (`^[a-z0-9]+(?:-[a-z0-9]+)*$`) savunma amaçlı doğrulanır;
 * uymayan bir değer görülürse `slugla()` ile düzeltilir ve rapora düşer.
 */

const SLUG_DESENI = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Desene uymayan slug'ı katlar; `undefined` girdiyi olduğu gibi geçirir. */
function slugAlani(deger: string | undefined, baglam: string): string | undefined {
  if (deger === undefined) return undefined;
  if (SLUG_DESENI.test(deger)) return deger;
  const duzeltilmis = slugla(deger);
  console.warn(`[tohum:meslekler] ${baglam} slug deseni ihlali: "${deger}" → "${duzeltilmis}"`);
  return duzeltilmis || undefined;
}

export const MESLEKLER_DONUSTURUCUSU: Donusturucu = {
  koleksiyon: KOLEKSIYONLAR.meslekler,
  anahtarAlan: 'slug',
  not: 'lib/veri/lab.ts (MESLEKLER) — durum alanı yok, yayinda verilir; slug alanları desene karşı doğrulanır.',
  uret: () =>
    MESLEKLER.flatMap((meslek) => {
      const slug = slugAlani(meslek.slug, `"${meslek.ad}" slug`);
      if (!slug) {
        console.warn(`[tohum:meslekler] "${meslek.ad}" atlandı — geçerli slug üretilemedi.`);
        return [];
      }

      return [
        temizle({
          slug,
          ad: meslek.ad,
          ozet: meslek.ozet,
          neYapar: meslek.neYapar,
          beceriler: meslek.beceriler,
          teknolojiler: meslek.teknolojiler,
          yolSlug: slugAlani(meslek.yolSlug, `"${slug}" yolSlug`),
          testSlug: slugAlani(meslek.testSlug, `"${slug}" testSlug`),
          durum: YAYINDA,
        }),
      ];
    }),
};
