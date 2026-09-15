import { ANALIZLER, GUNDEM, MANSET } from '@/lib/veri/gundem';
import { KONULAR } from '@/lib/veri/temel';
import { REHBERLER, type RehberKaydi } from '@/lib/veri/yayin';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import {
  slugla,
  tarihOlarak,
  temizle,
  YAYINDA,
  type Donusturucu,
  type TohumBelgesi,
} from '@/lib/tohum/tipler';
import type { Analiz, Icerik } from '@/lib/tipler';

/**
 * İçerik dönüştürücüsü — ÜÇ FIXTURE, TEK KOLEKSİYON.
 *
 * `icerikler` tüm editoryal formatları taşır (MASTER-PLAN §9: konu ≠ format).
 * Fixture tarafında aynı model üç ayrı şekle dağılmış durumda ve hiçbiri
 * şemayla birebir uyumlu değil:
 *
 *  (a) `MANSET` + `GUNDEM` (`Icerik`) — gömülü `konu` ve `yazar` NESNESİ taşır;
 *      şema `konuSlug` ve `yazarSlug` istiyor → `konu.slug` / `yazar.slug`
 *      olarak düzleştirilir. `tur` fixture'da var (`haber` / `analiz`).
 *      `durum` yok → `yayinda`.
 *
 *  (b) `ANALIZLER` (`Analiz`) — `tur` alanı HİÇ YOK → `analiz` sabitlenir.
 *      `girizgah` → `kisaCevap`, `tarih` → `yayinTarihi`, `yol` yok →
 *      `/analiz/<slug>/` (app/(site)/analiz/[slug] rotası). `konu` GÖRÜNEN AD
 *      taşıyor ("Agentic AI", "Robotik"…) → aşağıdaki tabloyla slug'a eşlenir.
 *      `yazarSlug` zaten mevcut.
 *
 *  (c) `REHBERLER` (`RehberKaydi`) — `tur` yok → `rehber`; `durum` yok →
 *      `yayinda`; `yol` yok → `/rehber/<slug>/`; `tarih` → `yayinTarihi`;
 *      `konu` görünen ad → slug. `adimlar` bir SAYAÇtır (şemada yok, yazılmaz);
 *      gövde `adimListesi` içinde (ad + ozet + ayrinti blokları).
 *
 * Ortak dönüşümler:
 *  - `ilgiliSluglar` şemada yok. Değerler Atlas kavram slug'ları (sayfalarda
 *    `atlasBul()` ile çözülüyor) → `ilgiliAtlas` alanına yazılır.
 *  - `adimlar` (sayaç), `konu`/`yazar` nesneleri ve `girizgah` gibi şemada
 *    karşılığı olmayan alanlar belgeye YAZILMAZ.
 *  - `slug` tekil dizinli; üç kaynak birleşirken çakışma olursa ilk kayıt
 *    korunur, ikincisi atlanır ve bildirilir.
 */

const SLUG_DESENI = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Şemadaki `tur` enum'u — `IcerikTuru` bundan geniş olduğu için denetlenir. */
const TUR_ENUMU = new Set(['haber', 'analiz', 'rehber', 'gorus', 'roportaj', 'uygulama', 'vaka']);

/** Şemadaki metin uzunluğu sınırları. */
const KISA_CEVAP_EN_AZ = 40;
const KISA_CEVAP_EN_FAZLA = 600;
const BASLIK_EN_AZ = 8;
const BASLIK_EN_FAZLA = 160;

/**
 * KONU ADI → KONU SLUG'U eşlemesi.
 *
 * `ANALIZLER.konu` ve `REHBERLER.konu` görünen ad taşır; `KONULAR` içindeki
 * `ad` alanıyla birebir örtüşmez. Eşleme elle tablolanır — `slugla()` ile
 * türetmek yanlış slug üretirdi ("Agentic AI" → `agentic-ai`, konu slug'ı ise
 * `ai-agent`).
 *
 *   Fixture değeri   | Karşılığı                              | Slug
 *   -----------------|----------------------------------------|----------------
 *   'Agentic AI'     | KONULAR.agent.kume (ad: 'AI Agents')   | ai-agent
 *   'Değerlendirme'  | KONULAR.degerlendirme.ad               | degerlendirme
 *   'Robotik'        | KONULAR.robotik (ad: 'Robotik & Emb…') | robotik
 *   'AI Business'    | KONULAR.isDunyasi.ad                   | is-dunyasi
 *   'AI Güvenliği'   | KONULAR.guvenlik.ad                    | ai-guvenlik
 *   'RAG'            | KONULAR.rag.ad                         | rag
 *   'Model seçimi'   | konu değil ölçüt; en yakın konu        | is-dunyasi
 */
const KONU_SLUGU: Record<string, string | undefined> = {
  'Agentic AI': KONULAR.agent?.slug,
  Değerlendirme: KONULAR.degerlendirme?.slug,
  Robotik: KONULAR.robotik?.slug,
  'AI Business': KONULAR.isDunyasi?.slug,
  'AI Güvenliği': KONULAR.guvenlik?.slug,
  RAG: KONULAR.rag?.slug,
  'Model seçimi': KONULAR.isDunyasi?.slug,
};

/* --- YARDIMCILAR ---------------------------------------------------------- */

/** SLUG desenine uyan bir değer döndürür; üretilemezse `undefined`. */
function slugOlarak(deger: unknown): string | undefined {
  if (typeof deger !== 'string') return undefined;
  if (SLUG_DESENI.test(deger)) return deger;
  const duzeltilmis = slugla(deger);
  return SLUG_DESENI.test(duzeltilmis) ? duzeltilmis : undefined;
}

/** `ilgiliAtlas` gibi slug dizileri: desene uymayan öğeler ayıklanır. */
function slugDizisi(liste: readonly string[] | undefined): string[] | undefined {
  if (!liste?.length) return undefined;
  const temiz = liste.flatMap((deger) => {
    const slug = slugOlarak(deger);
    return slug ? [slug] : [];
  });
  return temiz.length ? temiz : undefined;
}

/** Görünen konu adını slug'a çevirir; tabloda yoksa `undefined`. */
function konuSlugu(ad: string): string | undefined {
  return slugOlarak(KONU_SLUGU[ad.trim()]);
}

/** 8–160 karakter sınırı: kısa başlık kaydı düşürür, uzun başlık kırpılır. */
function baslikOlarak(deger: string, kimlik: string): string | undefined {
  const metin = deger.trim();
  if (metin.length < BASLIK_EN_AZ) {
    console.warn(
      `[tohum:icerikler] "${kimlik}" atlandı — başlık ${BASLIK_EN_AZ} karakterden kısa.`,
    );
    return undefined;
  }
  return metin.length > BASLIK_EN_FAZLA ? metin.slice(0, BASLIK_EN_FAZLA).trimEnd() : metin;
}

/**
 * 40–600 karakter sınırı. Kısa cevap answer-first alıntı alanıdır; eksik
 * olanı özetle tamamlamak uydurma içerik üretmek olur (MASTER-PLAN §5) —
 * kayıt ATLANIR. Uzun değer kırpılır.
 */
function kisaCevapOlarak(deger: string | undefined, kimlik: string): string | undefined {
  const metin = deger?.trim() ?? '';
  if (metin.length < KISA_CEVAP_EN_AZ) {
    console.warn(
      `[tohum:icerikler] "${kimlik}" atlandı — kisaCevap ${metin.length} karakter, şema en az ${KISA_CEVAP_EN_AZ} istiyor; özetle tamamlanmadı.`,
    );
    return undefined;
  }
  return metin.length > KISA_CEVAP_EN_FAZLA ? metin.slice(0, KISA_CEVAP_EN_FAZLA).trimEnd() : metin;
}

/** `okumaDakika` şemada 1–180 aralığında; dışındaki değer yazılmaz. */
function okumaDakikaOlarak(deger: unknown): number | undefined {
  if (typeof deger !== 'number' || !Number.isFinite(deger)) return undefined;
  return deger >= 1 && deger <= 180 ? deger : undefined;
}

/* --- (a) MANŞET + GÜNDEM -------------------------------------------------- */

function gundemBelgesi(icerik: Icerik): TohumBelgesi[] {
  const slug = slugOlarak(icerik.slug);
  if (!slug) {
    console.warn(`[tohum:icerikler] bir gündem kaydı atlandı — geçersiz slug: "${icerik.slug}"`);
    return [];
  }

  if (!TUR_ENUMU.has(icerik.tur)) {
    console.warn(`[tohum:icerikler] "${slug}" atlandı — şema dışı tür: "${icerik.tur}"`);
    return [];
  }

  // Gömülü nesneler düzleştirilir: konu.slug → konuSlug, yazar.slug → yazarSlug.
  const konuSlug = slugOlarak(icerik.konu?.slug);
  const yazarSlug = slugOlarak(icerik.yazar?.slug);
  if (!konuSlug || !yazarSlug) {
    console.warn(
      `[tohum:icerikler] "${slug}" atlandı — zorunlu konuSlug/yazarSlug üretilemedi (konu: "${icerik.konu?.slug}", yazar: "${icerik.yazar?.slug}").`,
    );
    return [];
  }

  const baslik = baslikOlarak(icerik.baslik, slug);
  const kisaCevap = kisaCevapOlarak(icerik.kisaCevap, slug);
  if (!baslik || !kisaCevap) return [];

  return [
    temizle({
      slug,
      yol: icerik.yol,
      tur: icerik.tur,
      baslik,
      kisaCevap,
      ozet: icerik.ozet?.trim() || undefined,
      konuSlug,
      etiketler: icerik.etiketler,
      yazarSlug,
      durum: YAYINDA,
      oneCikan: icerik.oneCikan,
      yayinTarihi: tarihOlarak(icerik.yayinTarihi),
      guncellemeTarihi: tarihOlarak(icerik.guncellemeTarihi),
      okumaDakika: okumaDakikaOlarak(icerik.okumaDakika),
      govde: icerik.govde,
      kaynaklar: icerik.kaynaklar,
      ilgiliAtlas: slugDizisi(icerik.ilgiliSluglar),
    }),
  ];
}

/* --- (b) DERİN ANALİZLER -------------------------------------------------- */

function analizBelgesi(analiz: Analiz): TohumBelgesi[] {
  const slug = slugOlarak(analiz.slug);
  if (!slug) {
    console.warn(`[tohum:icerikler] bir analiz kaydı atlandı — geçersiz slug: "${analiz.slug}"`);
    return [];
  }

  const konuSlug = konuSlugu(analiz.konu);
  if (!konuSlug) {
    console.warn(
      `[tohum:icerikler] "${slug}" atlandı — tanınmayan konu adı: "${analiz.konu}" (KONU_SLUGU tablosuna eklenmeli).`,
    );
    return [];
  }

  const yazarSlug = slugOlarak(analiz.yazarSlug);
  if (!yazarSlug) {
    console.warn(`[tohum:icerikler] "${slug}" atlandı — geçersiz yazarSlug: "${analiz.yazarSlug}"`);
    return [];
  }

  const baslik = baslikOlarak(analiz.baslik, slug);
  // `girizgah` alıntılanabilir tez cümlesi — şemadaki `kisaCevap` karşılığı.
  const kisaCevap = kisaCevapOlarak(analiz.girizgah, slug);
  if (!baslik || !kisaCevap) return [];

  return [
    temizle({
      slug,
      yol: `/analiz/${slug}/`,
      tur: 'analiz',
      baslik,
      kisaCevap,
      konuSlug,
      yazarSlug,
      durum: YAYINDA,
      yayinTarihi: tarihOlarak(analiz.tarih),
      guncellemeTarihi: tarihOlarak(analiz.guncellemeTarihi),
      okumaDakika: okumaDakikaOlarak(analiz.okumaDakika),
      govde: analiz.govde,
      kaynaklar: analiz.kaynaklar,
      sss: analiz.sss,
      ilgiliAtlas: slugDizisi(analiz.ilgiliSluglar),
    }),
  ];
}

/* --- (c) REHBERLER -------------------------------------------------------- */

function rehberBelgesi(rehber: RehberKaydi): TohumBelgesi[] {
  const slug = slugOlarak(rehber.slug);
  if (!slug) {
    console.warn(`[tohum:icerikler] bir rehber kaydı atlandı — geçersiz slug: "${rehber.slug}"`);
    return [];
  }

  const konuSlug = konuSlugu(rehber.konu);
  if (!konuSlug) {
    console.warn(
      `[tohum:icerikler] "${slug}" atlandı — tanınmayan konu adı: "${rehber.konu}" (KONU_SLUGU tablosuna eklenmeli).`,
    );
    return [];
  }

  const yazarSlug = slugOlarak(rehber.yazarSlug);
  if (!yazarSlug) {
    console.warn(`[tohum:icerikler] "${slug}" atlandı — geçersiz yazarSlug: "${rehber.yazarSlug}"`);
    return [];
  }

  const baslik = baslikOlarak(rehber.baslik, slug);
  const kisaCevap = kisaCevapOlarak(rehber.kisaCevap, slug);
  if (!baslik || !kisaCevap) return [];

  // items.required: ad + ozet. Eksik olan adım listeden düşer, rehber kalır.
  const adimListesi = (rehber.adimListesi ?? []).flatMap((adim) => {
    const ad = adim.ad?.trim();
    const ozet = adim.ozet?.trim();
    if (!ad || !ozet) {
      console.warn(
        `[tohum:icerikler] "${slug}" adımı atlandı — ad/ozet eksik: "${adim.ad ?? '(adsız)'}"`,
      );
      return [];
    }
    return [temizle({ ad, ozet, ayrinti: adim.ayrinti })];
  });

  return [
    temizle({
      slug,
      yol: `/rehber/${slug}/`,
      tur: 'rehber',
      baslik,
      kisaCevap,
      konuSlug,
      yazarSlug,
      seviye: rehber.seviye,
      durum: YAYINDA,
      yayinTarihi: tarihOlarak(rehber.tarih),
      okumaDakika: okumaDakikaOlarak(rehber.okumaDakika),
      kaynaklar: rehber.kaynaklar,
      sss: rehber.sss,
      adimListesi,
      onKosullar: rehber.onKosullar,
      araclar: rehber.araclar,
      kontrolListesi: rehber.kontrolListesi,
      tuzaklar: rehber.tuzaklar,
      ilgiliAtlas: slugDizisi(rehber.ilgiliSluglar),
    }),
  ];
}

/* --- DÖNÜŞTÜRÜCÜ ---------------------------------------------------------- */

export const ICERIKLER_DONUSTURUCUSU: Donusturucu = {
  koleksiyon: KOLEKSIYONLAR.icerikler,
  anahtarAlan: 'slug',
  not: 'lib/veri/gundem.ts (MANSET + GUNDEM + ANALIZLER) ve lib/veri/yayin.ts (REHBERLER) → tek koleksiyon; konu/yazar nesneleri düzleştirilir, eksik tur/durum/yol üretilir, konu adı slug’a eşlenir.',
  uret: () => {
    const belgeler = [
      ...[MANSET, ...GUNDEM].flatMap(gundemBelgesi),
      ...ANALIZLER.flatMap(analizBelgesi),
      ...REHBERLER.flatMap(rehberBelgesi),
    ];

    // `slug` tekil dizinli: çakışan kayıtlar upsert'te birbirini ezer.
    const secilenler = new Map<string, TohumBelgesi>();
    for (const belge of belgeler) {
      const slug = String(belge.slug);
      if (secilenler.has(slug)) {
        console.warn(`[tohum:icerikler] "${slug}" atlandı — bu slug başka bir fixture'da da var.`);
        continue;
      }
      secilenler.set(slug, belge);
    }

    return [...secilenler.values()];
  },
};
