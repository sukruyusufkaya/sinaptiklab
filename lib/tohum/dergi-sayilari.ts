import { DERGI_SAYILARI } from '@/lib/veri/yayin';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { slugla, tarihOlarak, temizle, YAYINDA, type Donusturucu } from '@/lib/tohum/tipler';

/**
 * Dergi sayıları dönüştürücüsü.
 *
 * Kaynak: `lib/veri/yayin.ts` → `DERGI_SAYILARI` (`DergiSayisi[]`). Bu dizi
 * `HAM_DERGI` künyesi ile `lib/veri/govde/dergi.ts` içindeki gövde/kaynak
 * bloklarının birleşimidir; dönüştürücü birleşmiş hâli okur ki yazı gövdeleri
 * ve kaynakları belgeye birlikte gitsin (CLAUDE.md §10).
 *
 * Giderilen uyumsuzluklar:
 *  1. `durum` alanı fixture'da hiç yok; şemada ZORUNLU → `yayinda` verilir
 *     (fixture'da yayına hazır olmadığını gösteren işaret taşıyan sayı yok).
 *  2. Yazı düzeyinde `ilgiliSluglar` alanı şemada YOK; şemanın karşılığı
 *     `yazilar[].ilgiliAtlas` (SLUG dizisi) → alan adı taşınır, desene uymayan
 *     tek tek sluglar düşürülür.
 *  3. `slug`, `yazilar[].slug` ve `yazilar[].yazarSlug` SLUG desenine tabi;
 *     fixture değerleri uyumlu ama yeni girdi Türkçe karakter getirirse
 *     `slugla()` ile katlanır, katlanamayan değer kaydı ATLATIR.
 *  4. `tarih` TARIH_METNI desenine tabi ve ZORUNLU; desene uymayan değer
 *     taşıyan sayı ATLANIR (alanı hiç yazmamak da doğrulamayı geçmez).
 *  5. `yazilar` items.required = slug + baslik + bolum + yazarSlug; bunlardan
 *     biri eksik/geçersiz olan YAZI atlanır, sayı kabuğu korunur.
 *  6. `okumaDakika` şemada `minimum: 1`; altında kalan veya sayı olmayan değer
 *     hiç yazılmaz (alan zorunlu değil).
 *  7. `kaynaklar` items.required = ad + yayinci + tur ve `tur` bir enum;
 *     eksik alanlı veya enum dışı türü olan kaynak düşürülür.
 *  8. `slug` tekil dizinlidir (`slug_tekil`); çakışan ikinci sayı ATLANIR.
 *     Sayı içindeki yazı slugları da (`yazi_slug`) tekilleştirilir.
 *
 * Şemada var olup fixture'da karşılığı OLMAYAN alan (`seo`) yazılmaz; panel
 * bunu sonradan doldurur.
 */

const SLUG_DESENI = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const KAYNAK_TURLERI = new Set([
  'Makale',
  'Dokümantasyon',
  'Teknik rapor',
  'Mevzuat',
  'Veri seti',
  'Röportaj',
]);

/** Değeri SLUG desenine uydurur; uyduramazsa `undefined` döner. */
function slugaUydur(deger: unknown): string | undefined {
  if (typeof deger !== 'string') return undefined;
  if (SLUG_DESENI.test(deger)) return deger;
  const katlanmis = slugla(deger);
  return SLUG_DESENI.test(katlanmis) ? katlanmis : undefined;
}

/** Boş olmayan metin; şemadaki zorunlu metin alanları için. */
function metinOlarak(deger: unknown): string | undefined {
  if (typeof deger !== 'string') return undefined;
  const kirpik = deger.trim();
  return kirpik === '' ? undefined : kirpik;
}

type HamKaynak = { ad?: unknown; yayinci?: unknown; tur?: unknown; adres?: unknown };

/** `KAYNAKLAR` items.required ve `tur` enum'una uymayan kaynakları düşürür. */
function kaynaklariSuz(kaynaklar: readonly HamKaynak[] | undefined, etiket: string) {
  if (!kaynaklar?.length) return undefined;

  const gecerli = kaynaklar.flatMap((kaynak) => {
    const ad = metinOlarak(kaynak.ad);
    const yayinci = metinOlarak(kaynak.yayinci);
    const tur = metinOlarak(kaynak.tur);
    if (!ad || !yayinci || !tur || !KAYNAK_TURLERI.has(tur)) {
      console.warn(
        `[tohum:dergi-sayilari] ${etiket} — kaynak düşürüldü (ad/yayinci/tur eksik ya da tür enum dışı): "${String(kaynak.ad)}"`,
      );
      return [];
    }
    return [temizle({ ad, yayinci, tur, adres: metinOlarak(kaynak.adres) })];
  });

  return gecerli.length ? gecerli : undefined;
}

export const DERGI_SAYILARI_DONUSTURUCUSU: Donusturucu = {
  koleksiyon: KOLEKSIYONLAR.dergiSayilari,
  anahtarAlan: 'slug',
  not: 'lib/veri/yayin.ts (DERGI_SAYILARI) — durum eklenir, ilgiliSluglar → yazilar[].ilgiliAtlas taşınır, yazı zorunluları denetlenir.',
  uret: () => {
    const gorulenSayiSluglari = new Set<string>();

    return DERGI_SAYILARI.flatMap((sayi) => {
      const slug = slugaUydur(sayi.slug);
      if (!slug) {
        console.warn(
          `[tohum:dergi-sayilari] "${String(sayi.slug)}" atlandı — slug desene uydurulamadı.`,
        );
        return [];
      }
      if (gorulenSayiSluglari.has(slug)) {
        console.warn(`[tohum:dergi-sayilari] "${slug}" atlandı — slug çakışması (slug_tekil).`);
        return [];
      }

      const tarih = tarihOlarak(sayi.tarih);
      if (!tarih) {
        console.warn(
          `[tohum:dergi-sayilari] "${slug}" atlandı — zorunlu tarih ISO desenine uymuyor: "${String(sayi.tarih)}"`,
        );
        return [];
      }

      const sayiAdi = metinOlarak(sayi.sayi);
      const kapakKonusu = metinOlarak(sayi.kapakKonusu);
      if (!sayiAdi || !kapakKonusu) {
        console.warn(
          `[tohum:dergi-sayilari] "${slug}" atlandı — zorunlu alan boş (sayi: "${String(sayi.sayi)}", kapakKonusu: "${String(sayi.kapakKonusu)}").`,
        );
        return [];
      }

      gorulenSayiSluglari.add(slug);

      const gorulenYaziSluglari = new Set<string>();

      const yazilar = sayi.yazilar.flatMap((yazi) => {
        const yaziSlug = slugaUydur(yazi.slug);
        const baslik = metinOlarak(yazi.baslik);
        const bolum = metinOlarak(yazi.bolum);
        const yazarSlug = slugaUydur(yazi.yazarSlug);

        if (!yaziSlug || !baslik || !bolum || !yazarSlug) {
          console.warn(
            `[tohum:dergi-sayilari] ${slug} → "${String(yazi.slug)}" yazısı atlandı — items.required eksik (slug/baslik/bolum/yazarSlug).`,
          );
          return [];
        }
        if (gorulenYaziSluglari.has(yaziSlug)) {
          console.warn(
            `[tohum:dergi-sayilari] ${slug} → "${yaziSlug}" yazısı atlandı — sayı içinde slug çakışması.`,
          );
          return [];
        }
        gorulenYaziSluglari.add(yaziSlug);

        const okumaDakika =
          typeof yazi.okumaDakika === 'number' &&
          Number.isFinite(yazi.okumaDakika) &&
          yazi.okumaDakika >= 1
            ? Number(yazi.okumaDakika)
            : undefined;

        const ilgiliAtlas = yazi.ilgiliSluglar
          ?.map((deger) => slugaUydur(deger))
          .filter((deger): deger is string => Boolean(deger));

        return [
          temizle({
            slug: yaziSlug,
            baslik,
            bolum,
            ozet: metinOlarak(yazi.ozet),
            yazarSlug,
            okumaDakika,
            govde: yazi.govde,
            kaynaklar: kaynaklariSuz(yazi.kaynaklar, `${slug} → ${yaziSlug}`),
            ilgiliAtlas,
          }),
        ];
      });

      return [
        temizle({
          slug,
          sayi: sayiAdi,
          kapakKonusu,
          ozet: metinOlarak(sayi.ozet),
          tarih,
          durum: YAYINDA,
          yazilar,
        }),
      ];
    });
  },
};
