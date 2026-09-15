import { MODELLER } from '@/lib/veri/varliklar';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { tarihOlarak, temizle, YAYINDA, type Donusturucu } from '@/lib/tohum/tipler';

/**
 * Model dönüştürücüsü.
 *
 * Üç uyumsuzluk giderilir:
 *
 *  1. Fixture'ın `durum` alanı yayın akışı durumu DEĞİL, güncellik işaretidir
 *     ('guncel'). Şemada `durum` yayın akışıdır (`taslak`…`arsiv`) ve güncellik
 *     ayrı bir alanda (`guncellikDurumu`) tutulur. Değer doğru alana TAŞINIR,
 *     `durum` alanına `yayinda` yazılır. Tanınmayan güncellik değeri görülürse
 *     alan HİÇ yazılmaz (enum dışı değer yazmak yerine) ve uyarı basılır.
 *
 *  2. Fixture'ın `yayin` alanı serbest metindir ("Sürekli güncellenen seri",
 *     "Açık ağırlık sürümleri"); şema ISO tarih deseni ister. `tarihOlarak()`
 *     ile süzülür — tarih olmayan değer için alan hiç yazılmaz. Bu yüzden
 *     mevcut altı kayıtta `yayin` bulunmaz (`saglayiciSlug + yayin` dizini
 *     bunu tolere eder; seyrek olmayan bileşik dizin eksik alanı null sayar).
 *
 *  3. Fixture alan adı `siniriliklar` yazım hatası taşıyor; şema `sinirliliklar`
 *     bekliyor. Değer doğru ada taşınır.
 *
 * Şemada bulunan `acikAgirlik`, `lisans`, `surum`, `fiyatlandirma` ve `seo`
 * alanlarının fixture'da karşılığı yok; uydurma veri yazılmaz (CLAUDE.md §5),
 * bu alanlar boş bırakılır ve panelden doldurulur.
 */

/** Şemadaki `guncellikDurumu` enum'u — dışındaki değer yazılmaz. */
const GUNCELLIK_DURUMLARI = new Set(['guncel', 'yeni', 'onceki-surum', 'emekli']);

export const MODELLER_DONUSTURUCUSU: Donusturucu = {
  koleksiyon: KOLEKSIYONLAR.modeller,
  anahtarAlan: 'slug',
  not: 'lib/veri/varliklar.ts (MODELLER) — durum→guncellikDurumu taşınır, yayin tarih değilse atılır, siniriliklar→sinirliliklar.',
  uret: () =>
    MODELLER.map((model) => {
      const guncellikDurumu = GUNCELLIK_DURUMLARI.has(model.durum) ? model.durum : undefined;
      if (!guncellikDurumu) {
        console.warn(
          `[tohum:modeller] "${model.slug}" — tanınmayan güncellik değeri: "${model.durum}"; guncellikDurumu yazılmadı.`,
        );
      }

      return temizle({
        slug: model.slug,
        ad: model.ad,
        saglayici: model.saglayici,
        saglayiciSlug: model.saglayiciSlug,
        tip: model.tip,
        baglamPenceresi: model.baglamPenceresi,
        acikKaynak: model.acikKaynak,
        yayin: tarihOlarak(model.yayin),
        guncellikDurumu,
        durum: YAYINDA,
        vurgu: model.vurgu,
        ozet: model.ozet,
        yetenekler: model.yetenekler,
        sinirliliklar: model.siniriliklar,
        kullanimAlanlari: model.kullanimAlanlari,
        modaliteler: model.modaliteler,
        api: model.api,
        sonDogrulama: tarihOlarak(model.sonDogrulama),
      });
    }),
};
