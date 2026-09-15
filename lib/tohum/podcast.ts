import { PODCAST } from '@/lib/veri/yayin';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { slugla, tarihOlarak, temizle, YAYINDA, type Donusturucu } from '@/lib/tohum/tipler';

/**
 * Podcast dönüştürücüsü.
 *
 * Kaynak: `lib/veri/yayin.ts` → `PODCAST` (`PodcastBolumu[]`).
 *
 * Giderilen uyumsuzluklar:
 *  1. `durum` alanı fixture'da hiç yok; şemada zorunlu → `yayinda` verilir
 *     (fixture'da yayına hazır olmadığını gösteren bir işaret taşıyan kayıt yok).
 *  2. `slug` SLUG desenine tabi; fixture değerleri zaten uyumlu ama yeni girdi
 *     Türkçe karakter getirirse `slugla()` ile katlanır.
 *  3. `tarih` TARIH_METNI desenine tabi ve şemada ZORUNLU; desene uymayan değer
 *     `temizle()` ile düşerse belge doğrulamayı geçmez → kayıt ATLANIR.
 *  4. `numara` tekil dizinlidir (`numara_tekil`); fixture içinde çakışan numara
 *     görülürse ikinci kayıt ATLANIR (upsert anahtarı `slug` olduğu için çakışma
 *     yazma anında E11000 verirdi).
 *
 * Şemada var olup fixture'da karşılığı OLMAYAN alanlar (`konukUnvan`, `dokum`,
 * `bolumler`, `sesMedyaKimligi`, `seo`) yazılmaz; panel bunları sonradan doldurur.
 */

const SLUG_DESENI = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const PODCAST_DONUSTURUCUSU: Donusturucu = {
  koleksiyon: KOLEKSIYONLAR.podcast,
  anahtarAlan: 'slug',
  not: 'lib/veri/yayin.ts (PODCAST) — durum eklenir, numara tekilliği ve tarih deseni denetlenir.',
  uret: () => {
    const gorulenNumaralar = new Set<number>();
    const gorulenSluglar = new Set<string>();

    return PODCAST.flatMap((bolum) => {
      const slug = SLUG_DESENI.test(bolum.slug) ? bolum.slug : slugla(bolum.slug);
      if (!SLUG_DESENI.test(slug)) {
        console.warn(`[tohum:podcast] "${bolum.slug}" atlandı — slug desene uydurulamadı.`);
        return [];
      }
      if (gorulenSluglar.has(slug)) {
        console.warn(`[tohum:podcast] "${slug}" atlandı — slug çakışması (slug_tekil).`);
        return [];
      }

      const tarih = tarihOlarak(bolum.tarih);
      if (!tarih) {
        console.warn(
          `[tohum:podcast] "${slug}" atlandı — zorunlu tarih ISO desenine uymuyor: "${String(bolum.tarih)}"`,
        );
        return [];
      }

      if (!Number.isFinite(bolum.numara) || bolum.numara < 1) {
        console.warn(
          `[tohum:podcast] "${slug}" atlandı — zorunlu numara geçersiz: "${String(bolum.numara)}"`,
        );
        return [];
      }
      if (gorulenNumaralar.has(bolum.numara)) {
        console.warn(
          `[tohum:podcast] "${slug}" atlandı — numara çakışması: ${bolum.numara} (numara_tekil).`,
        );
        return [];
      }

      gorulenSluglar.add(slug);
      gorulenNumaralar.add(bolum.numara);

      const dakika =
        Number.isFinite(bolum.dakika) && bolum.dakika >= 1 ? Number(bolum.dakika) : undefined;

      return [
        temizle({
          slug,
          numara: Number(bolum.numara),
          ad: bolum.ad,
          konuk: bolum.konuk,
          dakika,
          ozet: bolum.ozet,
          cikarimlar: bolum.cikarimlar,
          tarih,
          durum: YAYINDA,
        }),
      ];
    });
  },
};
