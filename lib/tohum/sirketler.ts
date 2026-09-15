import { SIRKETLER } from '@/lib/veri/varliklar';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { slugla, temizle, YAYINDA, type Donusturucu } from '@/lib/tohum/tipler';

/**
 * Şirket dönüştürücüsü — `lib/veri/varliklar.ts` içindeki `SIRKETLER`.
 *
 * Giderilen uyumsuzluklar:
 *  1. `durum` alanı fixture'da hiç yok; şemada zorunlu → `yayinda` verilir.
 *     Fixture'ın tamamı yayına hazır künye verisidir; yayına hazır olmadığını
 *     gösteren bir işaret (örn. "gelistiriliyor") taşıyan kayıt yoktur.
 *  2. `slug` ve `modelSluglari` öğeleri SLUG desenine tabidir. Fixture'ın
 *     tamamı desene uyuyor; yine de desen denetlenir. Kayıt slug'ı uymazsa
 *     `slugla()` ile düzeltilir, model slug'ı uymayan öğe dizi dışında
 *     bırakılır ve raporlanır (sessizce yanlış slug yazmaktan iyidir).
 *  3. `kilometreTaslari` öğeleri şemada `tarih` ve `olay` alanlarını zorunlu
 *     kılar; eksik olan öğe atılır. `tarih` burada serbest metindir
 *     (TARIH_METNI DEĞİL), bu yüzden fixture'daki yıl değerleri ("2015")
 *     olduğu gibi yazılır.
 *
 * Şemada olmayan alan yazılmaz; fixture'da `sonDogrulama` ve `seo` yoktur,
 * bu yüzden bu alanlar hiç üretilmez.
 */

const SLUG_DESENI = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const SIRKETLER_DONUSTURUCUSU: Donusturucu = {
  koleksiyon: KOLEKSIYONLAR.sirketler,
  anahtarAlan: 'slug',
  not: 'lib/veri/varliklar.ts (SIRKETLER) — durum eklenir, slug desenleri denetlenir.',
  uret: () =>
    SIRKETLER.flatMap((sirket) => {
      const slug = SLUG_DESENI.test(sirket.slug) ? sirket.slug : slugla(sirket.slug);
      if (!SLUG_DESENI.test(slug)) {
        console.warn(`[tohum:sirketler] "${sirket.slug}" atlandı — slug desene uymuyor.`);
        return [];
      }

      const modelSluglari = (sirket.modelSluglari ?? []).filter((modelSlug) => {
        if (SLUG_DESENI.test(modelSlug)) return true;
        console.warn(
          `[tohum:sirketler] "${slug}" — model slug'ı desene uymadığı için atıldı: "${modelSlug}"`,
        );
        return false;
      });

      const kilometreTaslari = (sirket.kilometreTaslari ?? []).filter((tas) => {
        if (tas.tarih && tas.olay) return true;
        console.warn(
          `[tohum:sirketler] "${slug}" — eksik kilometre taşı atıldı: ${JSON.stringify(tas)}`,
        );
        return false;
      });

      return [
        temizle({
          slug,
          ad: sirket.ad,
          tur: sirket.tur,
          merkez: sirket.merkez,
          kurulus: sirket.kurulus,
          alan: sirket.alan,
          ozet: sirket.ozet,
          urunler: sirket.urunler,
          modelSluglari,
          kilometreTaslari,
          durum: YAYINDA,
        }),
      ];
    }),
};
