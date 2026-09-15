import { ARASTIRMA } from '@/lib/veri/arastirma';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { slugla, tarihOlarak, temizle, YAYINDA, type Donusturucu } from '@/lib/tohum/tipler';

/**
 * Araştırma dönüştürücüsü — `lib/veri/arastirma.ts` (ARASTIRMA).
 *
 * Giderilen uyumsuzluklar:
 *  1. `durum` alanı fixture'da hiç yok; şemada zorunlu → `yayinda` verilir.
 *  2. `sinirliliklar` şemada `minItems: 1` ile ZORUNLU (metodoloji ilkesi:
 *     "sınırlılık bölümü olmayan yayın onaylanmaz"). Boş ya da eksik olan
 *     kayıt ATLANIR; sessizce sınırlılıksız yayın üretmek ilkeyi bozar.
 *  3. `tarih` şemada zorunlu ve ISO desenine tabi → `tarihOlarak()` ile
 *     süzülür; uymayan kayıt atlanır.
 *  4. `tur` şemada kapalı bir enum; fixture değeri enum dışındaysa kayıt
 *     atlanır (yanlış tür yazmaktan iyidir).
 *  5. `kapsam` öğelerinde `etiket` ve `deger` şemada zorunlu → eksik alanlı
 *     öğeler dizinden düşürülür.
 *  6. Fixture'ın `ilgiliSluglar` alanı şemada YOK; yazılmaz (panelde
 *     görünmeyen kirlilik üretir). Şemadaki `ekler` ve `seo` alanlarının
 *     fixture karşılığı yoktur; boş bırakılır.
 */

const TUR_DEGERLERI = new Set(['Rapor', 'Benchmark', 'Veri Seti', 'Whitepaper', 'Index', 'Not']);

const SLUG_DESENI = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const ARASTIRMA_DONUSTURUCUSU: Donusturucu = {
  koleksiyon: KOLEKSIYONLAR.arastirma,
  anahtarAlan: 'slug',
  not: 'lib/veri/arastirma.ts (+ govde/arastirma.ts) — durum eklenir; sınırlılığı olmayan yayın atlanır.',
  uret: () =>
    ARASTIRMA.flatMap((yayin) => {
      const slug = SLUG_DESENI.test(yayin.slug) ? yayin.slug : slugla(yayin.slug);
      if (!SLUG_DESENI.test(slug)) {
        console.warn(`[tohum:arastirma] "${yayin.slug}" atlandı — slug desenine çevrilemedi.`);
        return [];
      }

      if (!TUR_DEGERLERI.has(yayin.tur)) {
        console.warn(`[tohum:arastirma] "${slug}" atlandı — tanınmayan tür: "${yayin.tur}"`);
        return [];
      }

      const tarih = tarihOlarak(yayin.tarih);
      if (!tarih) {
        console.warn(`[tohum:arastirma] "${slug}" atlandı — geçersiz tarih: "${yayin.tarih}"`);
        return [];
      }

      const sinirliliklar = (yayin.sinirliliklar ?? []).filter((madde) => madde.trim().length > 0);
      if (sinirliliklar.length === 0) {
        console.warn(
          `[tohum:arastirma] "${slug}" atlandı — sınırlılık bölümü boş (şemada minItems: 1).`,
        );
        return [];
      }

      const kapsam = (yayin.kapsam ?? []).filter(
        (oge) => Boolean(oge.etiket) && Boolean(oge.deger),
      );

      return [
        temizle({
          slug,
          baslik: yayin.baslik,
          tur: yayin.tur,
          ozet: yayin.ozet,
          veriNoktasi: yayin.veriNoktasi,
          veriEtiketi: yayin.veriEtiketi,
          tarih,
          yontem: yayin.yontem,
          kapsam,
          bulgular: yayin.bulgular,
          sinirliliklar,
          atifFormati: yayin.atifFormati,
          lisans: yayin.lisans,
          govde: yayin.govde,
          sss: yayin.sss,
          durum: YAYINDA,
        }),
      ];
    }),
};
