import { OGRENME_YOLLARI } from '@/lib/veri/ogrenme';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { temizle, YAYINDA, type Donusturucu } from '@/lib/tohum/tipler';

/**
 * Öğrenme yolları dönüştürücüsü.
 *
 * Fixture (`OGRENME_YOLLARI`) ile `ogrenme_yollari` şeması arasındaki tek
 * uyumsuzluk zorunlu `durum` alanıdır; fixture'da hiç yok → `yayinda` verilir.
 * Yedi rotanın tamamı bölümlü ve yayına hazır (CLAUDE.md "Şu anki durum"),
 * hiçbirinde "geliştiriliyor" benzeri bir işaret yoktur.
 *
 * Şema uyum notları:
 *  - `slug` değerlerinin yedisi de SLUG desenine uyuyor; `slugla()` gerekmedi.
 *  - `bolumler[]` alt nesneleri `items.required` (ad, ozet, sure) kuralını
 *    karşılıyor; `kavramlar` görünen ad taşır ve şemada düz metin dizisi
 *    olduğu için olduğu gibi yazılır.
 *  - `dersSluglari` fixture'da yok; bölüm–ders eşlemesi güvenilir biçimde
 *    türetilemediği için alan hiç yazılmaz (şemada isteğe bağlı).
 *  - `seo` fixture'da yok; yazılmaz.
 *  - Şemada olmayan alan üretilmez; bir bölümde zorunlu alt alan eksikse
 *    kayıt ATLANIR ve konsola bildirilir.
 */

type YolBolumuBelgesi = {
  ad: string;
  ozet: string;
  sure: string;
  kavramlar?: string[];
};

export const OGRENME_YOLLARI_DONUSTURUCUSU: Donusturucu = {
  koleksiyon: KOLEKSIYONLAR.ogrenmeYollari,
  anahtarAlan: 'slug',
  not: 'lib/veri/ogrenme.ts (OGRENME_YOLLARI) — zorunlu durum alanı eklenir; bölümler items.required doğrulanır.',
  uret: () =>
    OGRENME_YOLLARI.flatMap((yol) => {
      const bolumler: YolBolumuBelgesi[] = [];
      let eksikBolum: string | undefined;

      for (const bolum of yol.bolumler ?? []) {
        if (!bolum.ad || !bolum.ozet || !bolum.sure) {
          eksikBolum = bolum.ad || '(adsız bölüm)';
          break;
        }
        bolumler.push(
          temizle({
            ad: bolum.ad,
            ozet: bolum.ozet,
            sure: bolum.sure,
            kavramlar: bolum.kavramlar,
          }),
        );
      }

      if (eksikBolum) {
        console.warn(
          `[tohum:ogrenme_yollari] "${yol.slug}" atlandı — "${eksikBolum}" bölümünde ad/ozet/sure eksik.`,
        );
        return [];
      }

      return [
        temizle({
          slug: yol.slug,
          ad: yol.ad,
          rol: yol.rol,
          seviyeAraligi: yol.seviyeAraligi,
          bolum: yol.bolum,
          saat: yol.saat,
          aciklama: yol.aciklama,
          cikti: yol.cikti,
          onkosullar: yol.onkosullar,
          kimeGore: yol.kimeGore,
          bolumler,
          durum: YAYINDA,
        }),
      ];
    }),
};
