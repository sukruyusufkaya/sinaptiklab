import { LAB_PROJELERI } from '@/lib/veri/lab';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { slugla, temizle, TASLAK, YAYINDA, type Donusturucu } from '@/lib/tohum/tipler';

/**
 * Lab projeleri dönüştürücüsü.
 *
 * Fixture (`LAB_PROJELERI`) ile şema arasındaki uyumsuzluklar:
 *
 *  1. `durum` ADI AYNI, ANLAMI FARKLI. Fixture'daki `durum` değerleri
 *     `'yayinda' | 'gelistiriliyor'` — bu ikili şemada `yayinDurumu`
 *     enum'una ait. Değer olduğu gibi `yayinDurumu`na TAŞINIR; şemada zorunlu
 *     olan `durum` (yayın akışı: taslak/incelemede/yayinda/arsiv) ise türetilir:
 *     `yayinda` → `yayinda`, `gelistiriliyor` → `taslak` (henüz yayına hazır
 *     olmayan proje akışta taslaktır).
 *  2. `bilesenAnahtari` fixture'da yok. Çalışan bir arayüzü olan projeler için
 *     bileşen anahtarı slug ile aynıdır; liste
 *     `components/lab/AracKayitDefteri.tsx` içindeki `ARAC_BILESENLERI`
 *     anahtarlarından kopyalanmıştır. Bileşen dosyası TSX olduğu ve tohumlama
 *     `--experimental-strip-types` ile çalıştığı için oradan içe alınmaz;
 *     liste burada yinelenir.
 *  3. `slug` SLUG desenine karşı doğrulanır; uymayan değer `slugla()` ile
 *     katlanır, çevrilemezse kayıt atlanır.
 *
 * Şemada olup fixture'da karşılığı olmayan `depoAdresi`, `govde` ve `seo`
 * alanları uydurulmaz; hiç yazılmaz (zorunlu değiller).
 */

const SLUG_DESENI = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Şemadaki `tur` enum'u — dışında bir değer görülürse kayıt atlanır. */
const GECERLI_TURLER = new Set(['Araç', 'Deney', 'Açık Kaynak', 'Demo']);

/** Şemadaki `yayinDurumu` enum'u. */
const GECERLI_YAYIN_DURUMLARI = new Set(['yayinda', 'gelistiriliyor']);

/** `components/lab/AracKayitDefteri.tsx` → `ARAC_BILESENLERI` anahtarları. */
const ETKILESIMLI_SLUGLAR = new Set([
  'token-hesaplayici',
  'llm-maliyet-hesaplayici',
  'rag-chunk-hesaplayici',
  'gpu-bellek-hesaplayici',
  'baglam-penceresi-hesaplayici',
  'ai-roi-hesaplayici',
  'model-secici',
]);

export const LAB_PROJELERI_DONUSTURUCUSU: Donusturucu = {
  koleksiyon: KOLEKSIYONLAR.labProjeleri,
  anahtarAlan: 'slug',
  not: 'lib/veri/lab.ts (LAB_PROJELERI) — fixture durumu yayinDurumu’na taşınır, akış durumu türetilir, bilesenAnahtari eklenir.',
  uret: () =>
    LAB_PROJELERI.flatMap((proje) => {
      let slug = proje.slug;
      if (!SLUG_DESENI.test(slug)) {
        const katlanmis = slugla(slug);
        if (!SLUG_DESENI.test(katlanmis)) {
          console.warn(`[tohum:lab_projeleri] "${slug}" atlandı — slug desenine çevrilemedi.`);
          return [];
        }
        console.warn(`[tohum:lab_projeleri] slug düzeltildi: "${slug}" → "${katlanmis}"`);
        slug = katlanmis;
      }

      if (!GECERLI_TURLER.has(proje.tur)) {
        console.warn(`[tohum:lab_projeleri] "${slug}" atlandı — tanınmayan tür: "${proje.tur}"`);
        return [];
      }

      const yayinDurumu =
        proje.durum !== undefined && GECERLI_YAYIN_DURUMLARI.has(proje.durum)
          ? proje.durum
          : undefined;

      if (proje.durum !== undefined && yayinDurumu === undefined) {
        console.warn(
          `[tohum:lab_projeleri] "${slug}" yayınDurumu yazılmadı — enum dışı değer: "${proje.durum}"`,
        );
      }

      const girdiler = proje.girdiler?.filter((girdi) => {
        const tam = Boolean(girdi.etiket) && Boolean(girdi.birim);
        if (!tam) {
          console.warn(`[tohum:lab_projeleri] "${slug}" eksik girdi atlandı (etiket/birim boş).`);
        }
        return tam;
      });

      return [
        temizle({
          slug,
          ad: proje.ad,
          tur: proje.tur,
          ozet: proje.ozet,
          yayinDurumu,
          bilesenAnahtari: ETKILESIMLI_SLUGLAR.has(slug) ? slug : undefined,
          girdiler,
          durum: yayinDurumu === 'yayinda' ? YAYINDA : TASLAK,
        }),
      ];
    }),
};
