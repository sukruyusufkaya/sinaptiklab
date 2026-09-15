import { ATLAS, ATLAS_KATEGORILERI } from '@/lib/veri/atlas';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { temizle, YAYINDA, type Donusturucu } from '@/lib/tohum/tipler';

/**
 * Atlas dönüştürücüsü — ÖRNEK DÖNÜŞTÜRÜCÜ.
 *
 * İki uyumsuzluk giderilir:
 *  1. `durum` alanı fixture'da yok; şemada zorunlu → `yayinda` verilir.
 *  2. `kategori` görünen ad taşıyor ("Large Language Models", "MLOps / LLMOps");
 *     şema `kategoriSlug` istiyor ve SLUG desenine tabi. Eşleme
 *     `ATLAS_KATEGORILERI` üzerinden yapılır; karşılığı olmayan kategori
 *     görülürse kayıt ATLANIR ve raporda görünür (sessizce yanlış slug
 *     yazmaktan iyidir).
 */

const KATEGORI_SLUGU = new Map(ATLAS_KATEGORILERI.map((k) => [k.ad, k.slug]));

export const ATLAS_DONUSTURUCUSU: Donusturucu = {
  koleksiyon: KOLEKSIYONLAR.atlas,
  anahtarAlan: 'slug',
  not: 'lib/veri/atlas.ts (+ govde/atlas-*.ts) — kategori adı slug’a çevrilir, durum eklenir.',
  uret: () =>
    ATLAS.flatMap((girdi) => {
      const kategoriSlug = KATEGORI_SLUGU.get(girdi.kategori);
      if (!kategoriSlug) {
        console.warn(
          `[tohum:atlas] "${girdi.slug}" atlandı — tanınmayan kategori: "${girdi.kategori}"`,
        );
        return [];
      }

      return [
        temizle({
          slug: girdi.slug,
          ad: girdi.ad,
          altAd: girdi.altAd,
          kategoriSlug,
          kisaTanim: girdi.kisaTanim,
          seviye: girdi.seviye,
          durum: YAYINDA,
          ilgili: girdi.ilgili,
          onkosullar: girdi.onkosullar,
          sonDogrulama: girdi.sonDogrulama,
          yayinTarihi: girdi.yayinTarihi,
          guncellemeTarihi: girdi.guncellemeTarihi,
          govde: girdi.govde,
          sss: girdi.sss,
          kaynaklar: girdi.kaynaklar,
          surumler: girdi.surumler,
          yazarSlug: girdi.yazarSlug,
          inceleyenSlug: girdi.inceleyenSlug,
        }),
      ];
    }),
};
