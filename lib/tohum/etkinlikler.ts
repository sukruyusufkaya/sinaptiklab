import { ETKINLIKLER } from '@/lib/veri/yayin';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { slugla, tarihOlarak, temizle, YAYINDA, type Donusturucu } from '@/lib/tohum/tipler';

/**
 * Etkinlik dönüştürücüsü.
 *
 * Kaynak: `lib/veri/yayin.ts` → `ETKINLIKLER` (`Etkinlik[]`).
 *
 * Giderilen uyumsuzluklar:
 *  1. Fixture'ın `durum` alanı takvim aşamasını taşıyor
 *     (`planlandi` | `kayit-acik` | `gecti`); bu değerler şemadaki `durum`
 *     enum'una (`taslak` | `incelemede` | `yayinda` | `arsiv`) DEĞİL,
 *     `etkinlikDurumu` enum'una aittir → değer `etkinlikDurumu` alanına TAŞINIR.
 *     `etkinlikDurumu` şemada zorunludur; enum dışı bir değer görülürse kayıt
 *     ATLANIR (sessizce yanlış aşama yazmaktan iyidir).
 *  2. Yayın akışı `durum` alanı fixture'da hiç yok → `yayinda` verilir. Fixture'da
 *     yayına hazır olmadığını gösteren bir işaret taşıyan kayıt yok; `gecti`
 *     etkinliği de sitede kalır (arşiv listesine düşer), bu yüzden `taslak`
 *     kullanılmaz.
 *  3. `slug` SLUG desenine tabi; fixture değerleri zaten uyumlu, yeni girdi Türkçe
 *     karakter getirirse `slugla()` ile katlanır. `slug_tekil` dizini nedeniyle
 *     çakışan ikinci kayıt ATLANIR.
 *  4. `tarih` TARIH_METNI desenine tabi ve şemada ZORUNLU; desene uymayan değer
 *     doğrulamayı geçmeyeceği için kayıt ATLANIR.
 *  5. `tur` enum'a tabi (`Webinar` | `Workshop` | `Meetup` | `Konferans`) ve
 *     zorunlu; enum dışı değer taşıyan kayıt ATLANIR.
 *
 * Şemada var olup fixture'da karşılığı OLMAYAN alanlar (`baslangicZamani`, `yer`,
 * `kayitAdresi`, `kapasite`, `konusmacilar`, `seo`) yazılmaz; panel bunları
 * sonradan doldurur — özellikle takvim durumu `kayit-acik` olan etkinliklerde
 * `kayitAdresi` (şema zorunlu kılmaz, editoryal kural ister).
 */

const SLUG_DESENI = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const TURLER = new Set(['Webinar', 'Workshop', 'Meetup', 'Konferans']);

const ETKINLIK_DURUMLARI = new Set(['planlandi', 'kayit-acik', 'gecti', 'iptal']);

export const ETKINLIKLER_DONUSTURUCUSU: Donusturucu = {
  koleksiyon: KOLEKSIYONLAR.etkinlikler,
  anahtarAlan: 'slug',
  not: 'lib/veri/yayin.ts (ETKINLIKLER) — fixture durumu etkinlikDurumu’na taşınır, yayın durumu eklenir.',
  uret: () => {
    const gorulenSluglar = new Set<string>();

    return ETKINLIKLER.flatMap((etkinlik) => {
      const slug = SLUG_DESENI.test(etkinlik.slug) ? etkinlik.slug : slugla(etkinlik.slug);
      if (!SLUG_DESENI.test(slug)) {
        console.warn(`[tohum:etkinlikler] "${etkinlik.slug}" atlandı — slug desene uydurulamadı.`);
        return [];
      }
      if (gorulenSluglar.has(slug)) {
        console.warn(`[tohum:etkinlikler] "${slug}" atlandı — slug çakışması (slug_tekil).`);
        return [];
      }

      const tarih = tarihOlarak(etkinlik.tarih);
      if (!tarih) {
        console.warn(
          `[tohum:etkinlikler] "${slug}" atlandı — zorunlu tarih ISO desenine uymuyor: "${String(etkinlik.tarih)}"`,
        );
        return [];
      }

      if (!TURLER.has(etkinlik.tur)) {
        console.warn(
          `[tohum:etkinlikler] "${slug}" atlandı — tanınmayan tür: "${String(etkinlik.tur)}"`,
        );
        return [];
      }

      // Fixture'ın `durum` alanı takvim aşamasıdır; şemanın `etkinlikDurumu` alanına gider.
      const etkinlikDurumu = etkinlik.durum;
      if (!ETKINLIK_DURUMLARI.has(etkinlikDurumu)) {
        console.warn(
          `[tohum:etkinlikler] "${slug}" atlandı — tanınmayan etkinlik durumu: "${String(etkinlikDurumu)}"`,
        );
        return [];
      }

      gorulenSluglar.add(slug);

      return [
        temizle({
          slug,
          ad: etkinlik.ad,
          tur: etkinlik.tur,
          tarih,
          bicim: etkinlik.bicim,
          ozet: etkinlik.ozet,
          etkinlikDurumu,
          durum: YAYINDA,
        }),
      ];
    });
  },
};
