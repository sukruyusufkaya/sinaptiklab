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

export type JsonLdVerisi =
  | OrganizasyonJsonLd
  | WebSitesiJsonLd
  | TechArticleJsonLd
  | HowToJsonLd
  | BreadcrumbJsonLd
  | FaqPageJsonLd
  | KisiJsonLd;

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
