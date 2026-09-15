import { UZMANLAR } from '@/lib/veri/yayin';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { slugla, temizle, YAYINDA, type Donusturucu } from '@/lib/tohum/tipler';

/**
 * Uzman dönüştürücüsü.
 *
 * Şema (`uzmanlar`): zorunlu `slug`, `ad`, `unvan`, `alan`; isteğe bağlı
 * `basHarfler` (maxLength 4), `ozgecmis`, `katkilar`, `durum`.
 *
 * Fixture (`UZMANLAR`) şemayla neredeyse birebir örtüşür; giderilen noktalar:
 *  1. `durum` fixture'da hiç yok → `yayinda` verilir (şemada zorunlu değil ama
 *     sorgular varsayılan olarak `durum: 'yayinda'` filtresiyle çalışır).
 *  2. `slug` SLUG desenine karşı doğrulanır; uymayan değer `slugla()` ile
 *     ASCII'ye katlanır. Slug üretilemiyorsa kayıt ATLANIR (tekil dizin alanı
 *     boş yazılamaz).
 *  3. Zorunlu metin alanları (`ad`, `unvan`, `alan`) kırpılır; biri boş kalırsa
 *     kayıt ATLANIR — eksik zorunlu alan doğrulamayı düşürür.
 *  4. `basHarfler` şemada `maxLength: 4`; daha uzun değer kırpılır. Boş değer
 *     `temizle()` ile düşer.
 *  5. Fixture'da `ozgecmis` ve `katkilar` yok; uydurulmaz, hiç yazılmaz.
 *  6. Şemada olmayan alan yazılmaz (fixture'da fazladan alan yok).
 */

const SLUG_DESENI = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const UZMANLAR_DONUSTURUCUSU: Donusturucu = {
  koleksiyon: KOLEKSIYONLAR.uzmanlar,
  anahtarAlan: 'slug',
  not: 'lib/veri/yayin.ts (UZMANLAR) — durum eklenir, basHarfler 4 karaktere kırpılır.',
  uret: () =>
    UZMANLAR.flatMap((uzman) => {
      const slug = SLUG_DESENI.test(uzman.slug) ? uzman.slug : slugla(uzman.slug);
      if (!SLUG_DESENI.test(slug)) {
        console.warn(`[tohum:uzmanlar] "${uzman.ad}" atlandı — slug üretilemedi: "${uzman.slug}"`);
        return [];
      }

      const ad = uzman.ad.trim();
      const unvan = uzman.unvan.trim();
      const alan = uzman.alan.trim();
      if (!ad || !unvan || !alan) {
        console.warn(`[tohum:uzmanlar] "${slug}" atlandı — zorunlu alan boş (ad/unvan/alan).`);
        return [];
      }

      const basHarfler = uzman.basHarfler.trim().slice(0, 4);

      return [
        temizle({
          slug,
          ad,
          unvan,
          alan,
          basHarfler: basHarfler || undefined,
          durum: YAYINDA,
        }),
      ];
    }),
};
