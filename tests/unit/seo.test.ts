import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { IcerikDetayDTO, YazarDetayDTO } from "../../lib/db/queries/dto";
import { cdata, feedGuncellemesi, xmlKacis, type FeedOgesi } from "../../lib/feeds";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  howToJsonLd,
  jsonLdScript,
  kisiJsonLd,
  organizasyonJsonLd,
  techArticleJsonLd,
  webSiteJsonLd,
} from "../../lib/seo/jsonld";

const ICERIK: IcerikDetayDTO = {
  id: "a1b2",
  type: "tutorial",
  slug: "ornek-uygulama",
  title: "Örnek Uygulama",
  dek: "Kısa açıklama.",
  level: "orta",
  pillar: "mlops-altyapi",
  clusters: ["yerel-llm"],
  tags: ["ollama"],
  excerptHtml: "<p>Kısa açıklama.</p>",
  readingMinutes: 5,
  publishedAt: "2026-08-08T10:00:00.000Z",
  updatedAt: "2026-08-09T10:00:00.000Z",
  lastVerifiedAt: "2026-08-09T10:00:00.000Z",
  answerFirst: "Kısa cevap.",
  body: "## Kurulum\n\nMetin.",
  toc: [
    { id: "kurulum", text: "Kurulum", depth: 2 },
    { id: "calistirma", text: "Çalıştırma", depth: 2 },
    { id: "detay", text: "Detay", depth: 3 },
  ],
  faq: [{ q: "Soru?", a: "Cevap." }],
  sources: [
    {
      label: "Resmi Doküman",
      url: "https://ornek.dev/docs",
      publisher: "Örnek",
      accessedAt: "2026-08-08T00:00:00.000Z",
      kind: "docs",
    },
  ],
  repro: null,
  seo: {},
  lang: "tr",
  changelog: [],
  version: 1,
  yazarlar: [
    { id: "y1", slug: "sukru-yusuf-kaya", name: "Şükrü Yusuf Kaya", title: "Kurucu", avatar: "" },
  ],
  teknikEditor: null,
};

const YAZAR: YazarDetayDTO = {
  id: "y1",
  slug: "sukru-yusuf-kaya",
  name: "Şükrü Yusuf Kaya",
  title: "Kurucu ve Editör",
  bio: "Kısa bio.",
  longBio: "Uzun bio.",
  avatar: "",
  credentials: [],
  sameAs: ["https://github.com/sukruyusufkaya"],
  expertise: ["RAG"],
  employer: "alfi Technology",
};

describe("JSON-LD builder'ları (BRIEF §7.2)", () => {
  it("Organization ve WebSite şemaları temel alanları taşır", () => {
    const org = organizasyonJsonLd();
    expect(org["@type"]).toBe("Organization");
    expect(org.name).toBe("Sinaptiklab");
    const site = webSiteJsonLd();
    expect(site["@type"]).toBe("WebSite");
    expect(JSON.stringify(site)).toContain("SearchAction");
  });

  it("TechArticle: sources → citation eşlemesi ve Person yazarlar", () => {
    const sema = techArticleJsonLd(ICERIK, "https://sinaptiklab.com/uygulama/ornek-uygulama");
    expect(sema["@type"]).toBe("TechArticle");
    expect(sema.citation).toHaveLength(1);
    expect(sema.citation[0]?.name).toBe("Resmi Doküman");
    expect(sema.citation[0]?.url).toBe("https://ornek.dev/docs");
    expect(sema.author[0]?.name).toBe("Şükrü Yusuf Kaya");
    expect(sema.author[0]?.url).toContain("/yazar/sukru-yusuf-kaya");
    expect(sema.inLanguage).toBe("tr");
  });

  it("HowTo: yalnız H2'lerden adım üretir", () => {
    const sema = howToJsonLd(ICERIK, "https://sinaptiklab.com/uygulama/ornek-uygulama");
    expect(sema["@type"]).toBe("HowTo");
    expect(sema.step).toHaveLength(2); // depth 3 dahil edilmez
    expect(sema.step[0]?.url).toContain("#kurulum");
  });

  it("BreadcrumbList: URL'siz ara öğe geçerli; FAQPage soru/cevap eşler", () => {
    const bc = breadcrumbJsonLd([
      { ad: "Ana sayfa", url: "https://sinaptiklab.com/" },
      { ad: "Uygulama" },
      { ad: "Örnek", url: "https://sinaptiklab.com/uygulama/ornek" },
    ]);
    expect(bc.itemListElement).toHaveLength(3);
    expect(bc.itemListElement[0]?.position).toBe(1);
    const faq = faqPageJsonLd([{ q: "Soru?", a: "Cevap." }]);
    expect(JSON.stringify(faq)).toContain("Question");
  });

  it("Person: sameAs ve işveren taşınır", () => {
    const sema = kisiJsonLd(YAZAR, "https://sinaptiklab.com/yazar/sukru-yusuf-kaya");
    expect(sema["@type"]).toBe("Person");
    expect(sema.sameAs).toContain("https://github.com/sukruyusufkaya");
    expect(JSON.stringify(sema)).toContain("alfi Technology");
  });

  it("jsonLdScript: < karakteri kaçışlanır (XSS koruması)", () => {
    const html = renderToStaticMarkup(
      jsonLdScript(faqPageJsonLd([{ q: "<script>alert(1)</script>", a: "x" }])),
    );
    expect(html).toContain("application/ld+json");
    expect(html).not.toContain("<script>alert");
    expect(html).toContain("\\u003cscript");
  });
});

describe("feed yardımcıları", () => {
  it("xmlKacis beş özel karakteri kaçışlar", () => {
    expect(xmlKacis(`<a & "b" 'c'>`)).toBe("&lt;a &amp; &quot;b&quot; &apos;c&apos;&gt;");
  });

  it("cdata ]]> dizisini böler (enjeksiyon koruması)", () => {
    const sonuc = cdata("önce]]>sonra");
    expect(sonuc.startsWith("<![CDATA[")).toBe(true);
    expect(sonuc).not.toContain("önce]]>sonra");
    expect(sonuc).toContain("]]]]><![CDATA[>");
  });

  it("feedGuncellemesi ilk (en yeni) öğenin yayın tarihini döndürür", () => {
    // Sözleşme: feedOgeleri listesi publishedAt'e göre azalan sıralı gelir.
    const ogeler: FeedOgesi[] = [
      {
        title: "b",
        dek: "d",
        excerptHtml: "<p>d</p>",
        url: "https://x/2",
        publishedAt: "2026-08-05T00:00:00.000Z",
        updatedAt: "2026-08-06T00:00:00.000Z",
      },
      {
        title: "a",
        dek: "d",
        excerptHtml: "<p>d</p>",
        url: "https://x/1",
        publishedAt: "2026-08-01T00:00:00.000Z",
        updatedAt: "2026-08-02T00:00:00.000Z",
      },
    ];
    expect(feedGuncellemesi(ogeler)).toBe("2026-08-05T00:00:00.000Z");
  });
});
