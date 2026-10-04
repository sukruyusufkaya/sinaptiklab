import type { Blok, Kaynak, Konu, SeoAlanlari, Yazar } from '@/lib/tipler';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { yayindaTek, yayindakiler } from '@/lib/mongo/sorgular/site';
import { konuHaritasi, yazarHaritasi } from '@/lib/icerik/temel';

/**
 * Köşe yazısı (görüş) okuma modülü.
 *
 * Görüş yazısı `icerikler` koleksiyonunda `tur: 'gorus'` olarak durur ve
 * kanonik adresi `/dergi/kose/<slug>/`dir (gerekçe: ADR 0004). Bir dergi
 * SAYISINA bağlı değildir — köşe yazısı aylık sayıyı beklemez, yayımlandığı
 * gün kendi kalıcı adresiyle yayına girer.
 *
 * İKİ İLİŞKİ ÇÖZÜLÜR:
 *  - `yazarSlug` → `Yazar`. Görüş yazısı İMZALIDIR: yazarı çözülemeyen kayıt
 *    ATLANIR ve uyarı basılır. İmzasız görüş, kanıt yükünü taşıyacak kimse
 *    olmayan bir iddiadır; haber masasına düşürülerek yayımlanmaz (bu, haber
 *    akışındaki `yazarBul` yedeğinin bilerek uygulanmadığı tek yerdir).
 *  - `konuSlug` → `Konu`. Konusu çözülemeyen yazı yine basılır; yalnızca konu
 *    rozeti düşer — görüşün varlık nedeni yazarıdır, konusu değil.
 *
 * Şema adları geri alınır: `yayinTarihi` → `tarih`, `ilgiliAtlas` →
 * `ilgiliSluglar` (`lib/icerik/gundem.ts` ile aynı sözleşme).
 */

export type VeriNoktasi = {
  deger: string;
  aciklama: string;
  kaynak: string;
  adres: string;
};

export type KoseYazisi = {
  slug: string;
  yol: string;
  baslik: string;
  /** Yazının tezi; answer-first (§56). */
  kisaCevap: string;
  ozet?: string;
  konu?: Konu;
  yazar: Yazar;
  tarih: string;
  guncellemeTarihi?: string;
  okumaDakika: number;
  etiketler?: string[];
  govde?: Blok[];
  kaynaklar?: Kaynak[];
  veriNoktalari?: VeriNoktasi[];
  ilgiliSluglar?: string[];
  ilgiliIcerik?: string[];
  seo?: SeoAlanlari;
};

type KoseBelgesi = {
  slug: string;
  baslik: string;
  kisaCevap: string;
  ozet?: string;
  konuSlug: string;
  yazarSlug: string;
  yayinTarihi: string;
  guncellemeTarihi?: string;
  okumaDakika?: number;
  etiketler?: string[];
  govde?: Blok[];
  kaynaklar?: Kaynak[];
  veriNoktalari?: VeriNoktasi[];
  ilgiliAtlas?: string[];
  ilgiliIcerik?: string[];
  seo?: SeoAlanlari;
};

const GORUS = 'gorus';

/** Kanonik yol tek yerde üretilir; `yol` alanı ondan türetilmiş bir kopyadır. */
export function koseYolu(slug: string) {
  return `/dergi/kose/${slug}/`;
}

function koseGorunume(
  belge: KoseBelgesi,
  yazarlar: Map<string, Yazar>,
  konular: Map<string, Konu>,
): KoseYazisi | null {
  const yazar = yazarlar.get(belge.yazarSlug);
  if (!yazar) {
    console.warn(
      `[icerik:kose] "${belge.slug}" atlandı — yayında olmayan yazar: "${belge.yazarSlug}"`,
    );
    return null;
  }

  return {
    slug: belge.slug,
    yol: koseYolu(belge.slug),
    baslik: belge.baslik,
    kisaCevap: belge.kisaCevap,
    ozet: belge.ozet,
    konu: konular.get(belge.konuSlug),
    yazar,
    tarih: belge.yayinTarihi,
    guncellemeTarihi: belge.guncellemeTarihi,
    okumaDakika: belge.okumaDakika ?? 1,
    etiketler: belge.etiketler,
    govde: belge.govde,
    kaynaklar: belge.kaynaklar,
    veriNoktalari: belge.veriNoktalari,
    ilgiliSluglar: belge.ilgiliAtlas,
    ilgiliIcerik: belge.ilgiliIcerik,
    seo: belge.seo,
  };
}

/** Yayındaki köşe yazıları, yeniden eskiye. Gövde ve kaynaklar listede okunmaz. */
export async function koseYazilari(): Promise<KoseYazisi[]> {
  const [belgeler, yazarlar, konular] = await Promise.all([
    yayindakiler<KoseBelgesi>(KOLEKSIYONLAR.icerikler, {
      suzgec: { tur: GORUS },
      siralama: { yayinTarihi: -1 },
      haric: ['govde', 'kaynaklar', 'sss'],
    }),
    yazarHaritasi(),
    konuHaritasi(),
  ]);

  return belgeler
    .map((belge) => koseGorunume(belge, yazarlar, konular))
    .filter((yazi): yazi is KoseYazisi => yazi !== null);
}

/**
 * Tek köşe yazısı, gövdesiyle.
 *
 * Süzgece `tur` yazılır: aynı koleksiyondaki bir analizin slug'ı
 * `/dergi/kose/<slug>/` altında açılmasın.
 */
export async function koseYazisiBul(slug: string): Promise<KoseYazisi | undefined> {
  const [belge, yazarlar, konular] = await Promise.all([
    yayindaTek<KoseBelgesi>(KOLEKSIYONLAR.icerikler, { slug, tur: GORUS }),
    yazarHaritasi(),
    konuHaritasi(),
  ]);
  if (!belge) return undefined;
  return koseGorunume(belge, yazarlar, konular) ?? undefined;
}
