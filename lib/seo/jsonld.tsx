// BRIEF §7.2 — JSON-LD katmanı: hepsi tipli builder fonksiyonlarıyla, elle
// string yok. Şema tipleri minimal tutulur (yalnız ürettiğimiz alanlar);
// schema.org'un tamamını modellemek hedef değildir. jsonLdScript çıktıyı
// `<` kaçışıyla (XSS) tek tip <script type="application/ld+json"> yapar.
// (Dosya .tsx: jsonLdScript JSX döndürür.)
import type { ReactElement } from "react";
import type { IcerikDetayDTO, YazarDetayDTO } from "@/lib/db/queries/dto";
import { env } from "@/lib/env";

// ── Şema tipleri (minimal) ───────────────────────────────────────────

const SCHEMA_BAGLAMI = "https://schema.org" as const;

interface SemaKoku {
  "@context": typeof SCHEMA_BAGLAMI;
  "@type": string;
}

/** İç içe kullanılan kısa Person referansı (TechArticle.author vb.). */
export interface KisiRefJsonLd {
  "@type": "Person";
  name: string;
  url?: string;
}

export interface OrganizasyonJsonLd extends SemaKoku {
  "@type": "Organization";
  name: string;
  url: string;
  logo: string;
  sameAs: string[];
}

export interface WebSitesiJsonLd extends SemaKoku {
  "@type": "WebSite";
  name: string;
  url: string;
  inLanguage: string;
  potentialAction: {
    "@type": "SearchAction";
    target: { "@type": "EntryPoint"; urlTemplate: string };
    "query-input": string;
  };
}

export interface AtifJsonLd {
  "@type": "CreativeWork";
  name: string;
  url: string;
}

export interface TechArticleJsonLd extends SemaKoku {
  "@type": "TechArticle";
  headline: string;
  description: string;
  inLanguage: string;
  datePublished?: string;
  dateModified: string;
  author: KisiRefJsonLd[];
  editor?: KisiRefJsonLd;
  reviewedBy?: KisiRefJsonLd;
  citation: AtifJsonLd[];
  isAccessibleForFree: true;
  mainEntityOfPage: { "@type": "WebPage"; "@id": string };
}

export interface HowToAdimJsonLd {
  "@type": "HowToStep";
  position: number;
  name: string;
  url: string;
}

export interface HowToJsonLd extends SemaKoku {
  "@type": "HowTo";
  name: string;
  description: string;
  inLanguage: string;
  step: HowToAdimJsonLd[];
}

export interface BreadcrumbOgesiJsonLd {
  "@type": "ListItem";
  position: number;
  name: string;
  /** URL'siz öğe geçerlidir: rotası henüz olmayan ara kırıntılar item taşımaz. */
  item?: string;
}

export interface BreadcrumbJsonLd extends SemaKoku {
  "@type": "BreadcrumbList";
  itemListElement: BreadcrumbOgesiJsonLd[];
}

export interface FaqSorusuJsonLd {
  "@type": "Question";
  name: string;
  acceptedAnswer: { "@type": "Answer"; text: string };
}

export interface FaqPageJsonLd extends SemaKoku {
  "@type": "FAQPage";
  mainEntity: FaqSorusuJsonLd[];
}

export interface KisiJsonLd extends SemaKoku {
  "@type": "Person";
  name: string;
  url: string;
  jobTitle: string;
  description: string;
  sameAs: string[];
  worksFor: { "@type": "Organization"; name: string };
  knowsAbout: string[];
}

export interface TanimliTerimJsonLd extends SemaKoku {
  "@type": "DefinedTerm";
  name: string;
  description: string;
  url: string;
  inLanguage: string;
  termCode: string;
  alternateName?: string[];
  inDefinedTermSet: { "@type": "DefinedTermSet"; name: string; url: string };
}

export interface TeklifJsonLd {
  "@type": "Offer";
  price: string;
  priceCurrency: string;
  url?: string;
  availability?: string;
}

export interface YazilimUygulamasiJsonLd extends SemaKoku {
  "@type": "SoftwareApplication";
  name: string;
  description: string;
  url: string;
  inLanguage: string;
  applicationCategory: string;
  dateModified: string;
  citation: AtifJsonLd[];
  offers?: TeklifJsonLd;
  operatingSystem?: string;
}

export interface VeriKumesiJsonLd extends SemaKoku {
  "@type": "Dataset";
  name: string;
  description: string;
  url: string;
  inLanguage: string;
  datePublished?: string;
  dateModified: string;
  creator: KisiRefJsonLd[];
  citation: AtifJsonLd[];
  isAccessibleForFree: true;
  keywords?: string[];
  measurementTechnique?: string;
}

export interface ListeOgesiJsonLd {
  "@type": "ListItem";
  position: number;
  name: string;
  url: string;
}

export interface KoleksiyonSayfasiJsonLd extends SemaKoku {
  "@type": "CollectionPage";
  name: string;
  description: string;
  url: string;
  inLanguage: string;
  isPartOf: { "@type": "WebSite"; name: string; url: string };
  mainEntity: {
    "@type": "ItemList";
    numberOfItems: number;
    itemListElement: ListeOgesiJsonLd[];
  };
}

interface TanimliTerimKumesiJsonLd {
  "@context": string;
  "@type": "DefinedTermSet";
  name: string;
  description: string;
  url: string;
  inLanguage: string;
  hasDefinedTerm: {
    "@type": "DefinedTerm";
    name: string;
    description: string;
    url: string;
    termCode: string;
    alternateName?: string[];
  }[];
}

export type JsonLdVerisi =
  | OrganizasyonJsonLd
  | WebSitesiJsonLd
  | TechArticleJsonLd
  | HowToJsonLd
  | BreadcrumbJsonLd
  | FaqPageJsonLd
  | KisiJsonLd
  | TanimliTerimJsonLd
  | TanimliTerimKumesiJsonLd
  | YazilimUygulamasiJsonLd
  | VeriKumesiJsonLd
  | KoleksiyonSayfasiJsonLd;

// ── Builder'lar ──────────────────────────────────────────────────────

/** Global Organization (BRIEF §8.4 varlık sinyali; logo şimdilik favicon). */
export function organizasyonJsonLd(): OrganizasyonJsonLd {
  const url = env.NEXT_PUBLIC_SITE_URL;
  return {
    "@context": SCHEMA_BAGLAMI,
    "@type": "Organization",
    name: "Sinaptiklab",
    url,
    logo: `${url}/favicon.ico`,
    sameAs: ["https://github.com/sukruyusufkaya"],
  };
}

/** Global WebSite + SearchAction (/ara rotası Faz 6'da; şema şimdiden doğru). */
export function webSiteJsonLd(): WebSitesiJsonLd {
  const url = env.NEXT_PUBLIC_SITE_URL;
  return {
    "@context": SCHEMA_BAGLAMI,
    "@type": "WebSite",
    name: "Sinaptiklab",
    url,
    inLanguage: "tr",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${url}/ara?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

const kisiRef = (kisi: { name: string; slug: string }): KisiRefJsonLd => ({
  "@type": "Person",
  name: kisi.name,
  url: `${env.NEXT_PUBLIC_SITE_URL}/yazar/${kisi.slug}`,
});

/**
 * Makale/rehber/uygulama TechArticle'ı. `citation[]` sources'tan otomatik
 * doldurulur — hem SEO hem GEO için ana kaldıraç (BRIEF §7.2).
 */
export function techArticleJsonLd(icerik: IcerikDetayDTO, mutlakUrl: string): TechArticleJsonLd {
  return {
    "@context": SCHEMA_BAGLAMI,
    "@type": "TechArticle",
    headline: icerik.title,
    description: icerik.dek,
    inLanguage: icerik.lang,
    ...(icerik.publishedAt !== null ? { datePublished: icerik.publishedAt } : {}),
    dateModified: icerik.updatedAt,
    author: icerik.yazarlar.map(kisiRef),
    ...(icerik.teknikEditor !== null
      ? { editor: kisiRef(icerik.teknikEditor), reviewedBy: kisiRef(icerik.teknikEditor) }
      : {}),
    citation: icerik.sources.map((kaynak) => ({
      "@type": "CreativeWork",
      name: kaynak.label,
      url: kaynak.url,
    })),
    isAccessibleForFree: true,
    mainEntityOfPage: { "@type": "WebPage", "@id": mutlakUrl },
  };
}

/**
 * Tutorial için HowTo — adımlar TOC'un H2'lerinden türetilir; url mutlak
 * sayfa adresi + stabil çapa (#id) taşır (Google mutlak URL bekler).
 */
export function howToJsonLd(icerik: IcerikDetayDTO, mutlakUrl: string): HowToJsonLd {
  return {
    "@context": SCHEMA_BAGLAMI,
    "@type": "HowTo",
    name: icerik.title,
    description: icerik.dek,
    inLanguage: icerik.lang,
    step: icerik.toc
      .filter((madde) => madde.depth === 2)
      .map((madde, sira) => ({
        "@type": "HowToStep",
        position: sira + 1,
        name: madde.text,
        url: `${mutlakUrl}#${madde.id}`,
      })),
  };
}

/** BreadcrumbList — url'siz parça (örn. rotasız tür etiketi) item taşımaz. */
export function breadcrumbJsonLd(parcalar: { ad: string; url?: string }[]): BreadcrumbJsonLd {
  return {
    "@context": SCHEMA_BAGLAMI,
    "@type": "BreadcrumbList",
    itemListElement: parcalar.map((parca, sira) => ({
      "@type": "ListItem",
      position: sira + 1,
      name: parca.ad,
      ...(parca.url !== undefined ? { item: parca.url } : {}),
    })),
  };
}

/** SSS bölümü olan sayfalar için FAQPage. */
export function faqPageJsonLd(faq: { q: string; a: string }[]): FaqPageJsonLd {
  return {
    "@context": SCHEMA_BAGLAMI,
    "@type": "FAQPage",
    mainEntity: faq.map((madde) => ({
      "@type": "Question",
      name: madde.q,
      acceptedAnswer: { "@type": "Answer", text: madde.a },
    })),
  };
}

/** Yazar sayfası Person'ı (BRIEF §8.4 E-E-A-T varlık sinyalleri). */
export function kisiJsonLd(yazar: YazarDetayDTO, mutlakUrl: string): KisiJsonLd {
  return {
    "@context": SCHEMA_BAGLAMI,
    "@type": "Person",
    name: yazar.name,
    url: mutlakUrl,
    jobTitle: yazar.title,
    description: yazar.bio,
    sameAs: yazar.sameAs,
    worksFor: { "@type": "Organization", name: yazar.employer },
    knowsAbout: yazar.expertise,
  };
}

/**
 * Sözlük terimi (BRIEF §4.2 → `DefinedTerm`). `inDefinedTermSet` tüm terimleri
 * tek kanonik kümeye (/sozluk) bağlar — TR YZ terminolojisinde otorite sinyali
 * bu bağdan doğar. `alternateName` İngilizce karşılık + eşanlamlıları taşır;
 * boşsa alan hiç yazılmaz.
 */
export function tanimliTerimJsonLd(
  terim: { tr: string; en: string; shortDef: string; slug: string; aliases: string[] },
  mutlakUrl: string,
): TanimliTerimJsonLd {
  const digerAdlar = [terim.en, ...terim.aliases].filter((ad) => ad.trim() !== "");
  return {
    "@context": SCHEMA_BAGLAMI,
    "@type": "DefinedTerm",
    name: terim.tr,
    description: terim.shortDef,
    url: mutlakUrl,
    inLanguage: "tr",
    termCode: terim.slug,
    ...(digerAdlar.length > 0 ? { alternateName: digerAdlar } : {}),
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "Sinaptiklab Türkçe Yapay Zeka Sözlüğü",
      url: `${env.NEXT_PUBLIC_SITE_URL}/sozluk`,
    },
  };
}

/**
 * Sözlük İNDEKSİNİN şeması (BRIEF §7.2). Tek tek terim sayfaları DefinedTerm
 * basıyordu ama indeks yalnız WebSite taşıyordu; oysa kanonik terminoloji
 * sitenin en ayırt edici varlığı ve zengin sonuç adayı. Kümenin üyeleri
 * gömülü verilir: tarayıcı tek istekte tüm sözlüğü görür.
 */
export function tanimliTerimKumesiJsonLd(
  terimler: { tr: string; en: string; shortDef: string; slug: string }[],
): TanimliTerimKumesiJsonLd {
  const site = env.NEXT_PUBLIC_SITE_URL;
  return {
    "@context": SCHEMA_BAGLAMI,
    "@type": "DefinedTermSet",
    name: "Sinaptiklab Türkçe Yapay Zeka Sözlüğü",
    description:
      "Yapay zeka terimlerinin kanonik Türkçe karşılıkları: her terimin İngilizce " +
      "aslı, tanımı ve kaynağı ile.",
    url: `${site}/sozluk`,
    inLanguage: "tr",
    hasDefinedTerm: terimler.map((t) => ({
      "@type": "DefinedTerm" as const,
      name: t.tr,
      description: t.shortDef,
      url: `${site}/sozluk/${t.slug}`,
      termCode: t.slug,
      ...(t.en.trim() !== "" ? { alternateName: [t.en] } : {}),
    })),
  };
}

/** Araç kartındaki fiyat bilgisi; çağrı yerinden AÇIKÇA verilir (aşağıya bkz.). */
export interface AracTeklifi {
  /** "0" ücretsiz katman anlamına gelir. */
  fiyat: string;
  /** ISO 4217 kodu (ör. "USD"). */
  paraBirimi: string;
  url?: string;
  availability?: string;
}

/**
 * Araç/model kartı için SoftwareApplication (BRIEF §7.2). `offers` OPSİYONELDİR
 * ve çağrı yerinden geçilir: fiyat alanı `contents` şemasında henüz yok, uydurma
 * fiyat basmak §14/7 (kaynaksız sayı) yasağına girer. Araç kartı alanları
 * şemaya eklendiğinde tek yapılacak iş burada teklifi doldurmaktır.
 * `Review` de aynı gerekçeyle dışarıda: puan verisini üretmiyoruz.
 */
export function yazilimUygulamasiJsonLd(
  icerik: IcerikDetayDTO,
  mutlakUrl: string,
  teklif?: AracTeklifi,
): YazilimUygulamasiJsonLd {
  return {
    "@context": SCHEMA_BAGLAMI,
    "@type": "SoftwareApplication",
    name: icerik.title,
    description: icerik.dek,
    url: mutlakUrl,
    inLanguage: icerik.lang,
    applicationCategory: "DeveloperApplication",
    dateModified: icerik.updatedAt,
    citation: icerik.sources.map((kaynak) => ({
      "@type": "CreativeWork",
      name: kaynak.label,
      url: kaynak.url,
    })),
    ...(teklif !== undefined
      ? {
          offers: {
            "@type": "Offer" as const,
            price: teklif.fiyat,
            priceCurrency: teklif.paraBirimi,
            ...(teklif.url !== undefined ? { url: teklif.url } : {}),
            ...(teklif.availability !== undefined ? { availability: teklif.availability } : {}),
          },
        }
      : {}),
  };
}

/**
 * Ölçüm (benchmark) için Dataset (BRIEF §7.2). Karşılaştırma verisi bir veri
 * kümesidir: `citation[]` kaynaklardan, `measurementTechnique` yeniden üretim
 * kutusundaki GERÇEK donanım bilgisinden gelir — repro yoksa alan hiç yazılmaz.
 */
export function veriKumesiJsonLd(icerik: IcerikDetayDTO, mutlakUrl: string): VeriKumesiJsonLd {
  const donanim = icerik.repro?.hardware;
  return {
    "@context": SCHEMA_BAGLAMI,
    "@type": "Dataset",
    name: icerik.title,
    description: icerik.dek,
    url: mutlakUrl,
    inLanguage: icerik.lang,
    ...(icerik.publishedAt !== null ? { datePublished: icerik.publishedAt } : {}),
    dateModified: icerik.updatedAt,
    creator: icerik.yazarlar.map(kisiRef),
    citation: icerik.sources.map((kaynak) => ({
      "@type": "CreativeWork",
      name: kaynak.label,
      url: kaynak.url,
    })),
    isAccessibleForFree: true,
    ...(icerik.tags.length > 0 ? { keywords: icerik.tags } : {}),
    ...(donanim !== undefined && donanim !== "" ? { measurementTechnique: donanim } : {}),
  };
}

/**
 * Arşiv/liste sayfaları için CollectionPage + ItemList (tür indeksleri, etiket
 * arşivi, cluster hub'ı). `toplam` verilmezse öğe sayısı kullanılır; sayfalı
 * listelerde toplam kayıt sayısı geçilir ki ItemList gerçeği söylesin.
 */
export function koleksiyonSayfasiJsonLd(params: {
  ad: string;
  aciklama: string;
  url: string;
  ogeler: { baslik: string; url: string }[];
  toplam?: number;
  /** Sayfa 2+ listelerinde ilk öğenin gerçek sırası (0 tabanlı atlama). */
  atla?: number;
}): KoleksiyonSayfasiJsonLd {
  const atla = params.atla ?? 0;
  return {
    "@context": SCHEMA_BAGLAMI,
    "@type": "CollectionPage",
    name: params.ad,
    description: params.aciklama,
    url: params.url,
    inLanguage: "tr",
    isPartOf: {
      "@type": "WebSite",
      name: "Sinaptiklab",
      url: env.NEXT_PUBLIC_SITE_URL,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: params.toplam ?? params.ogeler.length,
      itemListElement: params.ogeler.map((oge, sira) => ({
        "@type": "ListItem",
        position: atla + sira + 1,
        name: oge.baslik,
        url: oge.url,
      })),
    },
  };
}

// ── Script yardımcısı ────────────────────────────────────────────────

/**
 * JSON-LD'yi <script type="application/ld+json"> olarak basar. `<` kaçışı
 * zorunlu: içerik alanlarındaki olası `</script>` dizisi HTML bağlamında
 * script'i kapatamasın (XSS).
 */
export function jsonLdScript(veri: JsonLdVerisi): ReactElement {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(veri).replace(/</g, "\\u003c") }}
    />
  );
}
