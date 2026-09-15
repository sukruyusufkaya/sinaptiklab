import { ARACLAR, ARAC_KATEGORILERI } from '@/lib/veri/varliklar';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { slugla, temizle, YAYINDA, type Donusturucu } from '@/lib/tohum/tipler';

/**
 * Araçlar dönüştürücüsü.
 *
 * Fixture (`ARACLAR`) alan adları şemayla birebir örtüşüyor; tek eksik zorunlu
 * alan `durum`. Yapılan dönüşümler:
 *
 *  1. `durum` fixture'da hiç yok, şemada zorunlu → `yayinda` verilir. Kayıtların
 *     hiçbirinde "geliştiriliyor / yakında" benzeri bir yayına hazır olmama
 *     işareti yok; hepsi sitede yayımlanmış kategori incelemeleri.
 *  2. `slug` SLUG desenine (`^[a-z0-9]+(?:-[a-z0-9]+)*$`) karşı doğrulanır;
 *     uymayan değer `slugla()` ile katlanır ve uyarı basılır.
 *  3. `kategori` şemada serbest metin (enum yok), bu yüzden olduğu gibi yazılır.
 *     Yine de `ARAC_KATEGORILERI` dışında bir değer görülürse uyarı basılır:
 *     böyle bir kayıt filtre şeridinde görünmez.
 *
 * Şemada olup fixture'da karşılığı olmayan `sonDogrulama` ve `seo` alanları
 * uydurulmaz; hiç yazılmaz (zorunlu değiller).
 */

const SLUG_DESENI = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const BILINEN_KATEGORILER = new Set<string>(ARAC_KATEGORILERI);

export const ARACLAR_DONUSTURUCUSU: Donusturucu = {
  koleksiyon: KOLEKSIYONLAR.araclar,
  anahtarAlan: 'slug',
  not: 'lib/veri/varliklar.ts (ARACLAR) — durum eklenir, slug deseni doğrulanır.',
  uret: () =>
    ARACLAR.flatMap((arac) => {
      let slug = arac.slug;
      if (!SLUG_DESENI.test(slug)) {
        const katlanmis = slugla(slug);
        if (!SLUG_DESENI.test(katlanmis)) {
          console.warn(`[tohum:araclar] "${slug}" atlandı — slug desenine çevrilemedi.`);
          return [];
        }
        console.warn(`[tohum:araclar] slug düzeltildi: "${slug}" → "${katlanmis}"`);
        slug = katlanmis;
      }

      if (!BILINEN_KATEGORILER.has(arac.kategori)) {
        console.warn(
          `[tohum:araclar] "${slug}" tanınmayan kategori taşıyor: "${arac.kategori}" — filtre şeridinde görünmez.`,
        );
      }

      return [
        temizle({
          slug,
          ad: arac.ad,
          kategori: arac.kategori,
          neIse: arac.neIse,
          kimKullanmali: arac.kimKullanmali,
          enIyiKullanim: arac.enIyiKullanim,
          alternatifler: arac.alternatifler,
          fiyat: arac.fiyat,
          artilar: arac.artilar,
          eksiler: arac.eksiler,
          degerlendirme: arac.degerlendirme,
          durum: YAYINDA,
        }),
      ];
    }),
};
