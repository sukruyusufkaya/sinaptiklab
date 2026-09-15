import { RADAR } from '@/lib/veri/gundem';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { temizle, tarihOlarak, type Donusturucu } from '@/lib/tohum/tipler';

/**
 * Radar dönüştürücüsü.
 *
 * `radar` koleksiyonu bir ZAMAN SERİSİDİR: her kayıt bir konunun belirli bir
 * tarihteki momentum anlık görüntüsüdür (tekil dizin `slug + tarih`). Fixture
 * ise tek bir anlık görüntü taşır ve zorunlu `tarih` alanı hiç yoktur.
 *
 * Giderilen uyumsuzluklar:
 *  1. Şemada zorunlu `tarih` fixture'da yok → `ANLIK_GORUNTU_TARIHI` sabiti
 *     verilir. Bu tarih `BRIEF_ARSIVI` içindeki en güncel gün (2026-09-11);
 *     kodda SABİT yazılır, `Date.now()` kullanılmaz — aynı fixture'dan aynı
 *     belgelerin üretilmesi (tekrarlanabilirlik) için.
 *  2. Şemada `yontemSurumu` var, fixture'da yok → skorlama yöntemi sürümü
 *     olarak `v1` yazılır (§64).
 *
 * Şemada `durum` alanı YOKTUR (radar bir yayın nesnesi değil, ölçüm kaydıdır);
 * bu yüzden belgeye `durum` yazılmaz. Şemada olmayan başka alan da yazılmaz.
 *
 * `momentum` 0–100 aralığında, `yon` ise `yukselen | sabit | dusen` enum'una
 * tabidir; aralık veya enum dışı kayıt sessizce yazılmaz, ATLANIR.
 */

/** `BRIEF_ARSIVI` içindeki en güncel gün — anlık görüntü tarihi. */
const ANLIK_GORUNTU_TARIHI = '2026-09-11';

/** Skorlama yöntemi sürümü; §64. */
const YONTEM_SURUMU = 'v1';

const YONLER = new Set(['yukselen', 'sabit', 'dusen']);

const SLUG_DESENI = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const TARIH = tarihOlarak(ANLIK_GORUNTU_TARIHI);

export const RADAR_DONUSTURUCUSU: Donusturucu = {
  koleksiyon: KOLEKSIYONLAR.radar,
  anahtarAlan: 'slug',
  not: 'lib/veri/gundem.ts (RADAR) — zorunlu tarih 2026-09-11 sabitiyle eklenir, yontemSurumu: v1.',
  uret: () =>
    RADAR.flatMap((kayit) => {
      if (!SLUG_DESENI.test(kayit.slug)) {
        console.warn(`[tohum:radar] "${kayit.slug}" atlandı — slug desenine uymuyor.`);
        return [];
      }

      if (!YONLER.has(kayit.yon)) {
        console.warn(`[tohum:radar] "${kayit.slug}" atlandı — tanınmayan yön: "${kayit.yon}"`);
        return [];
      }

      if (
        typeof kayit.momentum !== 'number' ||
        !Number.isFinite(kayit.momentum) ||
        kayit.momentum < 0 ||
        kayit.momentum > 100
      ) {
        console.warn(
          `[tohum:radar] "${kayit.slug}" atlandı — momentum 0–100 dışında: ${String(kayit.momentum)}`,
        );
        return [];
      }

      if (!TARIH) {
        console.warn(`[tohum:radar] "${kayit.slug}" atlandı — anlık görüntü tarihi geçersiz.`);
        return [];
      }

      return [
        temizle({
          slug: kayit.slug,
          ad: kayit.ad,
          tarih: TARIH,
          momentum: kayit.momentum,
          yon: kayit.yon,
          degisim: kayit.degisim,
          sinyaller: {
            yayin: kayit.sinyaller.yayin,
            github: kayit.sinyaller.github,
            modelCikisi: kayit.sinyaller.modelCikisi,
            aramaIlgisi: kayit.sinyaller.aramaIlgisi,
          },
          not: kayit.not,
          yontemSurumu: YONTEM_SURUMU,
        }),
      ];
    }),
};
