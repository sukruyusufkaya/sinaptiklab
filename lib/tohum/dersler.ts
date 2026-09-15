import { DERSLER } from '@/lib/veri/ogrenme';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { slugla, TASLAK, temizle, YAYINDA, type Donusturucu } from '@/lib/tohum/tipler';

/**
 * Dersler dönüştürücüsü — `lib/veri/ogrenme.ts` içindeki `DERSLER` dizisi
 * (`HAM_DERSLER` künyesi + `lib/veri/govde/ders.ts` gövdeleriyle birleşmiş hâli).
 *
 * İki uyumsuzluk giderilir:
 *
 *  1. `durum` şemada zorunlu; fixture'da (ve `Ders` tipinde) bu alan hiç yok.
 *     Dersler yayında olduğu için `yayinda` verilir. Yayına hazır olmadığını
 *     gösteren bir işaret (gövdesi olmayan ders) görülürse `taslak` yazılır.
 *  2. `sira` şemada var, fixture'da yok. `yolSlug` + `sira` bileşik dizini
 *     (`rota_sirasi`) rota içi sıralamayı bu alandan okuyor; değer, dersin
 *     kendi rotası içindeki fixture sırasından 1'den başlayarak üretilir.
 *
 * Diğer alanlar (`ad`, `yolSlug`, `seviye`, `dakika`, `ozet`, `hedefler`,
 * `kavramlar`, `onkosullar`, `govde`, `alistirma`, `sss`, `testSlug`) şemadaki
 * karşılıklarıyla birebir örtüşür. Şemada olmayan alan yazılmaz (`seo`
 * fixture'da bulunmuyor).
 *
 * Savunma amaçlı doğrulamalar: SLUG deseni katlanır, `seviye` enum dışıysa
 * kayıt atlanır, `dakika` şema aralığına (1–480) kırpılır ve `alistirma`
 * `items.required` (baslik, adimlar, cikti) üçlüsünü taşımıyorsa alan hiç
 * yazılmaz — sessizce reddedilecek belge üretmekten iyidir.
 */

const SLUG_DESENI = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SEVIYELER = new Set(['baslangic', 'orta', 'ileri']);

const DAKIKA_EN_AZ = 1;
const DAKIKA_EN_COK = 480;

/** Desene uymayan slug'ı katlar; `undefined` girdiyi olduğu gibi geçirir. */
function slugAlani(deger: string | undefined, baglam: string): string | undefined {
  if (deger === undefined) return undefined;
  if (SLUG_DESENI.test(deger)) return deger;
  const duzeltilmis = slugla(deger);
  console.warn(`[tohum:dersler] ${baglam} slug deseni ihlali: "${deger}" → "${duzeltilmis}"`);
  return duzeltilmis || undefined;
}

/** Slug dizisini eler; desene katlanamayan öğe düşer. */
function slugDizisi(degerler: string[] | undefined, baglam: string): string[] | undefined {
  if (!degerler) return undefined;
  const temiz = degerler.flatMap((deger) => {
    const katlanmis = slugAlani(deger, baglam);
    return katlanmis ? [katlanmis] : [];
  });
  return temiz.length ? temiz : undefined;
}

/** Şema aralığına kırpar. */
function dakikaAlani(deger: number, baglam: string): number {
  if (!Number.isFinite(deger)) {
    console.warn(`[tohum:dersler] ${baglam} dakika sayı değil; ${DAKIKA_EN_AZ} yazıldı.`);
    return DAKIKA_EN_AZ;
  }
  const kirpik = Math.min(DAKIKA_EN_COK, Math.max(DAKIKA_EN_AZ, Math.round(deger)));
  if (kirpik !== deger) {
    console.warn(`[tohum:dersler] ${baglam} dakika kırpıldı: ${deger} → ${kirpik}`);
  }
  return kirpik;
}

type Alistirma = { baslik: string; adimlar: string[]; cikti: string };

/** `items.required` üçlüsü tam değilse alanı hiç yazma. */
function alistirmaAlani(deger: Alistirma | undefined, baglam: string): Alistirma | undefined {
  if (!deger) return undefined;
  if (!deger.baslik || !Array.isArray(deger.adimlar) || !deger.cikti) {
    console.warn(`[tohum:dersler] ${baglam} alistirma eksik alan taşıyor; alan yazılmadı.`);
    return undefined;
  }
  return { baslik: deger.baslik, adimlar: deger.adimlar, cikti: deger.cikti };
}

export const DERSLER_DONUSTURUCUSU: Donusturucu = {
  koleksiyon: KOLEKSIYONLAR.dersler,
  anahtarAlan: 'slug',
  not: 'lib/veri/ogrenme.ts (DERSLER) — durum alanı yok, yayinda verilir; sira alanı rota içi fixture indeksinden üretilir.',
  uret: () => {
    // Rota başına sayaç: `sira` 1'den başlar ve fixture sırasını korur.
    const rotaSayaci = new Map<string, number>();

    return DERSLER.flatMap((ders) => {
      const slug = slugAlani(ders.slug, `"${ders.ad}" slug`);
      if (!slug) {
        console.warn(`[tohum:dersler] "${ders.ad}" atlandı — geçerli slug üretilemedi.`);
        return [];
      }

      const yolSlug = slugAlani(ders.yolSlug, `"${slug}" yolSlug`);
      if (!yolSlug) {
        console.warn(`[tohum:dersler] "${slug}" atlandı — zorunlu yolSlug üretilemedi.`);
        return [];
      }

      if (!SEVIYELER.has(ders.seviye)) {
        console.warn(`[tohum:dersler] "${slug}" atlandı — enum dışı seviye: "${ders.seviye}"`);
        return [];
      }

      const sira = (rotaSayaci.get(yolSlug) ?? 0) + 1;
      rotaSayaci.set(yolSlug, sira);

      const govde = ders.govde;
      if (!govde?.length) {
        console.warn(`[tohum:dersler] "${slug}" gövdesiz — durum taslak yazıldı.`);
      }

      return [
        temizle({
          slug,
          ad: ders.ad,
          yolSlug,
          sira,
          seviye: ders.seviye,
          dakika: dakikaAlani(ders.dakika, `"${slug}"`),
          ozet: ders.ozet,
          hedefler: ders.hedefler,
          kavramlar: slugDizisi(ders.kavramlar, `"${slug}" kavramlar`),
          onkosullar: slugDizisi(ders.onkosullar, `"${slug}" onkosullar`),
          govde,
          alistirma: alistirmaAlani(ders.alistirma, `"${slug}"`),
          sss: ders.sss,
          testSlug: slugAlani(ders.testSlug, `"${slug}" testSlug`),
          durum: govde?.length ? YAYINDA : TASLAK,
        }),
      ];
    });
  },
};
