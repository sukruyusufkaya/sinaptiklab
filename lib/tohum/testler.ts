import { ATLAS_KATEGORILERI } from '@/lib/veri/atlas';
import { TESTLER } from '@/lib/veri/ogrenme';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { slugla, temizle, YAYINDA, type Donusturucu } from '@/lib/tohum/tipler';

/**
 * Testler dönüştürücüsü.
 *
 * Giderilen uyumsuzluklar:
 *  1. `durum` fixture'da yok; şemada zorunlu → `yayinda` verilir (hiçbir testte
 *     yayına hazır olmama işareti yok).
 *  2. `ornekSorular` fixture'da tam `Soru` nesneleri taşıyor; şemada `testler`
 *     koleksiyonunun böyle bir alanı YOK — sorular `sorular` koleksiyonunda
 *     durur. Alan yazılmaz; yerine soru bankasından bu teste ait soruları
 *     seçecek `soruEtiketi` üretilir (slug'ın sonundaki `-testi` atılır:
 *     `ai-temelleri-testi` → `ai-temelleri`, bu da soru bankasındaki grup
 *     adıyla — `AI_TEMELLERI` — birebir örtüşür).
 *  3. `konu` görünen ad taşıyor ("MLOps / LLMOps"); şemadaki `konuSlug` SLUG
 *     desenine tabi. Eşleme Atlas kategorileri üzerinden yapılır, karşılığı
 *     olmayan konu (örn. "RAG") `slugla()` ile slug'a çevrilir.
 *  4. `soruSayisi` şemada `minimum: 1`; soru grubu boşalırsa alan hiç
 *     yazılmaz (alan zorunlu değil) ve uyarı basılır.
 *
 * Fixture'da karşılığı olmadığı için yazılmayan isteğe bağlı alanlar:
 * `gecmeEsigi`, `seo`.
 */

const KATEGORI_SLUGU = new Map(ATLAS_KATEGORILERI.map((k) => [k.ad, k.slug]));

/** Test slug'ından soru bankası etiketi: `rag-testi` → `rag`. */
function soruEtiketiUret(slug: string): string {
  return slug.endsWith('-testi') ? slug.slice(0, -'-testi'.length) : slug;
}

export const TESTLER_DONUSTURUCUSU: Donusturucu = {
  koleksiyon: KOLEKSIYONLAR.testler,
  anahtarAlan: 'slug',
  not: 'lib/veri/ogrenme.ts (TESTLER) — ornekSorular düşürülür, soruEtiketi üretilir, konu slug’a çevrilir, durum eklenir.',
  uret: () =>
    TESTLER.map((test) => {
      const konuSlug = KATEGORI_SLUGU.get(test.konu) ?? slugla(test.konu);

      const soruSayisi =
        typeof test.soruSayisi === 'number' && test.soruSayisi >= 1 ? test.soruSayisi : undefined;
      if (soruSayisi === undefined) {
        console.warn(
          `[tohum:testler] "${test.slug}" için soruSayisi yazılmadı — soru bankası grubu boş.`,
        );
      }

      return temizle({
        slug: test.slug,
        ad: test.ad,
        konu: test.konu,
        konuSlug,
        soruSayisi,
        dakika: test.dakika,
        seviye: test.seviye,
        ozet: test.ozet,
        olculenBeceriler: test.olculenBeceriler,
        kimlerCozmeli: test.kimlerCozmeli,
        ogrenmeHedefleri: test.ogrenmeHedefleri,
        soruEtiketi: soruEtiketiUret(test.slug),
        durum: YAYINDA,
      });
    }),
};
