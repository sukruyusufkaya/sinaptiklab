import { HIZMETLER } from '@/lib/veri/kurumsal';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { slugla, temizle, YAYINDA, type Donusturucu } from '@/lib/tohum/tipler';

/**
 * Hizmet dönüştürücüsü — `lib/veri/kurumsal.ts` içindeki `HIZMETLER`.
 *
 * Giderilen uyumsuzluklar:
 *  1. `durum` alanı fixture'da hiç yok; şemada zorunlu → `yayinda` verilir.
 *     Fixture'daki sekiz kaydın hiçbirinde yayına hazır olmadığını gösteren
 *     bir işaret (örn. "gelistiriliyor") yoktur.
 *  2. `slug` SLUG desenine tabidir. Fixture'ın tamamı desene uyuyor; yine de
 *     desen denetlenir, uymayan slug `slugla()` ile düzeltilir, düzelmezse
 *     kayıt ATLANIR ve raporlanır (sessizce yanlış slug yazmaktan iyidir).
 *  3. `sss` öğeleri şemada `soru` ve `cevap` alanlarını zorunlu kılar; eksik
 *     olan öğe dizi dışında bırakılır ve raporlanır.
 *
 * Şemada olmayan alan yazılmaz. Şemadaki `seo` fixture'da yoktur, bu yüzden
 * hiç üretilmez; `mimari`, `guvenlik` ve `sss` yalnızca kayıtta varsa yazılır
 * (`temizle()` boş diziyi de atar).
 */

const SLUG_DESENI = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const HIZMETLER_DONUSTURUCUSU: Donusturucu = {
  koleksiyon: KOLEKSIYONLAR.hizmetler,
  anahtarAlan: 'slug',
  not: 'lib/veri/kurumsal.ts (HIZMETLER) — durum eklenir, slug deseni ve SSS öğeleri denetlenir.',
  uret: () =>
    HIZMETLER.flatMap((hizmet) => {
      const slug = SLUG_DESENI.test(hizmet.slug) ? hizmet.slug : slugla(hizmet.slug);
      if (!SLUG_DESENI.test(slug)) {
        console.warn(`[tohum:hizmetler] "${hizmet.slug}" atlandı — slug desene uymuyor.`);
        return [];
      }

      const sss = (hizmet.sss ?? []).filter((oge) => {
        if (oge.soru && oge.cevap) return true;
        console.warn(
          `[tohum:hizmetler] "${slug}" — eksik SSS öğesi atıldı: ${JSON.stringify(oge)}`,
        );
        return false;
      });

      return [
        temizle({
          slug,
          ad: hizmet.ad,
          ozet: hizmet.ozet,
          problem: hizmet.problem,
          cozum: hizmet.cozum,
          kullanimAlanlari: hizmet.kullanimAlanlari,
          mimari: hizmet.mimari,
          guvenlik: hizmet.guvenlik,
          sss,
          durum: YAYINDA,
        }),
      ];
    }),
};
