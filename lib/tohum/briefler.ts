import { BRIEF, BRIEF_ARSIVI } from '@/lib/veri/gundem';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { slugla, temizle, tarihOlarak, YAYINDA, type Donusturucu } from '@/lib/tohum/tipler';

/**
 * Brief (Sinaptik Daily) dönüştürücüsü.
 *
 * Fixture iki parçaya ayrılmış durumda:
 *  - `BRIEF`        → yalnızca BUGÜNÜN maddeleri (`BriefMaddesi[]`), tarihi yok.
 *  - `BRIEF_ARSIVI` → tarih + başlık + `maddeSayisi`; madde gövdesi yok.
 *
 * Şema `['tarih', 'baslik', 'maddeler', 'durum']` istiyor ve `maddeler` için
 * `minItems: 1` şartı var. Bu yüzden:
 *
 *  1. En güncel arşiv tarihi (`BRIEF_ARSIVI` içindeki en büyük tarih) `BRIEF`
 *     maddeleriyle eşleştirilir — sayının gövdesi budur.
 *  2. Geri kalan arşiv kayıtlarının maddesi fixture'da HİÇ YOK. `maddeSayisi`
 *     bir sayaçtır, madde değildir; uydurma madde üretmek MASTER-PLAN §5'e
 *     aykırı olur ve boş dizi `minItems: 1` doğrulamasını geçmez. Bu kayıtlar
 *     ATLANIR ve `console.warn` ile bildirilir.
 *  3. `durum` fixture'da yok; şemada zorunlu → `yayinda`.
 *  4. `maddeSayisi` şemada olmayan bir alan olduğu için belgeye YAZILMAZ.
 *  5. `konuSlug` SLUG desenine tabi; desene uymayan değer `slugla()` ile
 *     düzeltilir, düzeltilemiyorsa (boş kalıyorsa) alan hiç yazılmaz.
 */

const SLUG_DESENI = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** SLUG desenine uyan bir değer döndürür; üretilemezse `undefined`. */
function slugOlarak(deger: unknown): string | undefined {
  if (typeof deger !== 'string') return undefined;
  if (SLUG_DESENI.test(deger)) return deger;
  const duzeltilmis = slugla(deger);
  return SLUG_DESENI.test(duzeltilmis) ? duzeltilmis : undefined;
}

/** `BriefMaddesi` → şemanın `maddeler.items` biçimi. */
function maddeleriDonustur(tarih: string) {
  return BRIEF.flatMap((madde) => {
    // items.required: numara, baslik, neden — üçü de dolu olmalı.
    if (!madde.numara?.trim() || !madde.baslik?.trim() || !madde.neden?.trim()) {
      console.warn(
        `[tohum:briefler] ${tarih} sayısında bir madde atlandı — numara/baslik/neden eksik: "${madde.baslik ?? '(başlıksız)'}"`,
      );
      return [];
    }

    return [
      temizle({
        numara: madde.numara,
        baslik: madde.baslik,
        neden: madde.neden,
        kaynak: madde.kaynak?.trim() ? madde.kaynak : undefined,
        konuSlug: slugOlarak(madde.konuSlug),
      }),
    ];
  });
}

export const BRIEFLER_DONUSTURUCUSU: Donusturucu = {
  koleksiyon: KOLEKSIYONLAR.briefler,
  anahtarAlan: 'tarih',
  not: 'lib/veri/gundem.ts (BRIEF + BRIEF_ARSIVI) — en güncel arşiv tarihi BRIEF maddeleriyle eşleştirilir; maddesi olmayan arşiv kayıtları atlanır.',
  uret: () => {
    const tarihliArsiv = BRIEF_ARSIVI.flatMap((kayit) => {
      const tarih = tarihOlarak(kayit.tarih);
      if (!tarih) {
        console.warn(
          `[tohum:briefler] "${kayit.baslik}" atlandı — geçersiz tarih: "${kayit.tarih}"`,
        );
        return [];
      }
      return [{ ...kayit, tarih }];
    }).sort((a, b) => (a.tarih < b.tarih ? 1 : -1));

    const guncelTarih = tarihliArsiv[0]?.tarih;

    return tarihliArsiv.flatMap((kayit) => {
      // Maddeler yalnızca en güncel sayı için fixture'da mevcut.
      const maddeler = kayit.tarih === guncelTarih ? maddeleriDonustur(kayit.tarih) : [];

      if (maddeler.length === 0) {
        console.warn(
          `[tohum:briefler] ${kayit.tarih} atlandı — fixture'da madde gövdesi yok (maddeSayisi: ${kayit.maddeSayisi}); şema minItems: 1 istiyor, madde uydurulmaz.`,
        );
        return [];
      }

      const baslik = kayit.baslik.trim();
      if (!baslik) {
        console.warn(`[tohum:briefler] ${kayit.tarih} atlandı — başlık boş.`);
        return [];
      }

      return [
        temizle({
          tarih: kayit.tarih,
          baslik,
          maddeler,
          durum: YAYINDA,
        }),
      ];
    });
  },
};
