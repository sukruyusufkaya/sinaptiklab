import { YAZAR_LISTESI } from '@/lib/veri/temel';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { slugla, temizle, YAYINDA, type Donusturucu } from '@/lib/tohum/tipler';

/**
 * Yazar dönüştürücüsü.
 *
 * Fixture (`YAZARLAR`) şemayla neredeyse birebir örtüşür; giderilen noktalar:
 *  1. `durum` fixture'da hiç yok → `yayinda` verilir (şemada zorunlu değil ama
 *     sorgular varsayılan olarak `durum: 'yayinda'` filtresiyle çalışır).
 *  2. `slug` SLUG desenine karşı doğrulanır; uymayan değer `slugla()` ile
 *     ASCII'ye katlanır. Slug üretilemiyorsa kayıt ATLANIR (tekil dizin alanı
 *     boş yazılamaz).
 *  3. `basHarfler` şemada `maxLength: 4`; daha uzun değer kırpılır.
 *  4. `sosyal` öğelerinde `etiket` ve `adres` şemada zorunlu; ikisi birlikte
 *     dolu olmayan öğe dizin dışında bırakılır.
 *  5. Şemada olmayan alan yazılmaz (fixture'da fazladan alan yok).
 */

const SLUG_DESENI = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const YAZARLAR_DONUSTURUCUSU: Donusturucu = {
  koleksiyon: KOLEKSIYONLAR.yazarlar,
  anahtarAlan: 'slug',
  not: 'lib/veri/temel.ts (YAZARLAR) — durum eklenir, basHarfler 4 karaktere kırpılır.',
  uret: () =>
    YAZAR_LISTESI.flatMap((yazar) => {
      const slug = SLUG_DESENI.test(yazar.slug) ? yazar.slug : slugla(yazar.slug);
      if (!SLUG_DESENI.test(slug)) {
        console.warn(`[tohum:yazarlar] "${yazar.ad}" atlandı — slug üretilemedi: "${yazar.slug}"`);
        return [];
      }

      const sosyal = (yazar.sosyal ?? []).filter((bag) => Boolean(bag.etiket && bag.adres));

      return [
        temizle({
          slug,
          ad: yazar.ad,
          unvan: yazar.unvan,
          basHarfler: yazar.basHarfler.slice(0, 4),
          ozgecmis: yazar.ozgecmis,
          uzmanlik: yazar.uzmanlik,
          sosyal: sosyal.map((bag) => ({ etiket: bag.etiket, adres: bag.adres })),
          durum: YAYINDA,
        }),
      ];
    }),
};
