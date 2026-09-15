import { SEKTORLER } from '@/lib/veri/kurumsal';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { temizle, YAYINDA, type Donusturucu } from '@/lib/tohum/tipler';

/**
 * Sektörler dönüştürücüsü.
 *
 * Fixture (`SEKTORLER`) 10 sektör kaydı taşır. Şemada zorunlu alanlar `slug`,
 * `ad`, `ozet`, `durum`.
 *
 * Giderilen uyumsuzluk:
 *  1. `durum` alanı fixture'da hiç yok; şemada zorunlu → `yayinda` verilir.
 *     Sektör sayfaları (`/sektor/<slug>/`) sitede canlı; hiçbir kayıtta
 *     "gelişiyor/hazırlanıyor" gibi yayına hazır olmadığını gösteren işaret
 *     yok, bu yüzden hepsi `yayinda`.
 *
 * Yazılmayan alanlar:
 *  - `mevzuat`: şemada var, fixture'da yok. `riskler` içindeki ifadeler
 *    ("Veri ikametgâhı", "Hasta verisi gizliliği") mevzuat maddesi değil;
 *    mevzuat listesi uydurulmaz (§5) — alan hiç yazılmaz.
 *  - `seo`: fixture'da karşılığı yok.
 *
 * Slug denetimi: tüm fixture slug'ları SLUG desenine
 * (`^[a-z0-9]+(?:-[a-z0-9]+)*$`) zaten uyuyor (ASCII katlanmış: `saglik`,
 * `uretim`, `insaat`, `egitim`); uymayan bir değer görülürse kayıt ATLANIR ve
 * raporda görünür (sessizce yanlış slug yazmaktan iyidir).
 *
 * `kullanimSayisi` şemada `number` ve `minimum: 0`; fixture değerleri 5–14
 * arası JS sayısı olduğu için olduğu gibi yazılır (bkz. koleksiyonlar.ts'teki
 * "SAYI ALANLARI" notu — `int` kullanılmaz).
 */

const SLUG_DESENI = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const SEKTORLER_DONUSTURUCUSU: Donusturucu = {
  koleksiyon: KOLEKSIYONLAR.sektorler,
  anahtarAlan: 'slug',
  not: 'lib/veri/kurumsal.ts (SEKTORLER) — durum eklenir; mevzuat/seo yazılmaz.',
  uret: () =>
    SEKTORLER.flatMap((sektor) => {
      if (!SLUG_DESENI.test(sektor.slug)) {
        console.warn(`[tohum:sektorler] "${sektor.ad}" atlandı — geçersiz slug: "${sektor.slug}"`);
        return [];
      }

      return [
        temizle({
          slug: sektor.slug,
          ad: sektor.ad,
          ozet: sektor.ozet,
          kullanimSayisi: sektor.kullanimSayisi,
          kullanimAlanlari: sektor.kullanimAlanlari,
          teknolojiler: sektor.teknolojiler,
          riskler: sektor.riskler,
          durum: YAYINDA,
        }),
      ];
    }),
};
