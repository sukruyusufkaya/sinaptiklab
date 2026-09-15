import { KONULAR } from '@/lib/veri/temel';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { temizle, YAYINDA, type Donusturucu } from '@/lib/tohum/tipler';

/**
 * Konular dönüştürücüsü.
 *
 * Fixture (`KONULAR`) bir `Record<string, Konu>`; anahtarlar yalnızca kod içi
 * kısayoldur (`agent`, `isDunyasi`…) ve belgeye yazılmaz — kanonik kimlik
 * `slug` alanıdır. Şemada zorunlu alanlar `slug`, `ad`, `kume`, `durum`.
 *
 * Giderilen uyumsuzluk:
 *  1. `durum` alanı fixture'da hiç yok; şemada zorunlu → `yayinda` verilir
 *     (taksonomi girdileri sitede canlı gezinmede kullanılıyor).
 *
 * Yazılmayan alanlar:
 *  - `ustKonuSlug`: fixture hiyerarşiyi `kume` görünen adıyla taşıyor, üst
 *    konu slug'ı yok. Slug'ı `kume`'den üretmek var olmayan bir konu belgesine
 *    işaret eden kırık bir referans yaratırdı; alan hiç yazılmaz.
 *  - `ozet`, `sira`, `seo`: fixture'da karşılığı yok, uydurulmaz.
 *
 * Slug denetimi: tüm fixture slug'ları SLUG desenine (`^[a-z0-9]+(?:-[a-z0-9]+)*$`)
 * zaten uyuyor; uymayan bir değer görülürse kayıt ATLANIR ve raporda görünür
 * (sessizce yanlış slug yazmaktan iyidir).
 */

const SLUG_DESENI = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const KONULAR_DONUSTURUCUSU: Donusturucu = {
  koleksiyon: KOLEKSIYONLAR.konular,
  anahtarAlan: 'slug',
  not: 'lib/veri/temel.ts (KONULAR) — Record değerleri diziye çevrilir, durum eklenir.',
  uret: () =>
    Object.values(KONULAR).flatMap((konu) => {
      if (!SLUG_DESENI.test(konu.slug)) {
        console.warn(`[tohum:konular] "${konu.ad}" atlandı — geçersiz slug: "${konu.slug}"`);
        return [];
      }

      return [
        temizle({
          slug: konu.slug,
          ad: konu.ad,
          kume: konu.kume,
          durum: YAYINDA,
        }),
      ];
    }),
};
