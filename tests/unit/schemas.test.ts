import { ObjectId } from "mongodb";
import { describe, expect, it } from "vitest";
import { authorSema } from "../../lib/db/schemas/author";
import { contentSema } from "../../lib/db/schemas/content";
import { redirectSema } from "../../lib/db/schemas/redirect";

const simdi = new Date();

const gecerliIcerik = {
  type: "article",
  slug: "rag-uretim-tuzaklari",
  title: "RAG Üretim Tuzakları",
  dek: "Üretimde RAG kurarken en sık düşülen tuzaklar ve saha verisiyle çözümleri.",
  answerFirst: "Kısa cevap metni.",
  body: "# Gövde\n\nMDX içerik.",
  excerptHtml: "<p>Özet</p>",
  level: "orta",
  pillar: "rag-bilgi-erisimi",
  clusters: ["chunking"],
  tags: ["rag"],
  authors: [new ObjectId()],
  technicalReviewer: null,
  status: "draft",
  publishedAt: null,
  updatedAt: simdi,
  lastVerifiedAt: simdi,
  readingMinutes: 8,
  toc: [{ id: "giris", text: "Giriş", depth: 2 }],
  faq: [{ q: "Soru?", a: "Cevap." }],
  sources: [
    {
      label: "MongoDB Atlas Search Docs",
      url: "https://www.mongodb.com/docs/atlas/atlas-search/",
      publisher: "MongoDB",
      accessedAt: simdi,
      kind: "docs",
    },
  ],
  repro: null,
  relatedManual: [],
  embedding: [],
  seo: {},
  i18n: { lang: "tr" },
  changelog: [],
  version: 1,
};

describe("contentSema", () => {
  it("geçerli minimal içerik parse olur ve metrics default alır", () => {
    const sonuc = contentSema.parse(gecerliIcerik);
    expect(sonuc.slug).toBe("rag-uretim-tuzaklari");
    expect(sonuc.metrics).toEqual({ views: 0, avgScrollDepth: 0, aiReferrals: 0 });
  });

  it("boş sources dizisini reddeder", () => {
    const sonuc = contentSema.safeParse({ ...gecerliIcerik, sources: [] });
    expect(sonuc.success).toBe(false);
  });
});

describe("authorSema", () => {
  it("slug'sız yazarı reddeder", () => {
    const sonuc = authorSema.safeParse({
      name: "Şükrü Yusuf Kaya",
      title: "Kurucu",
      bio: "Kısa bio",
      longBio: "Uzun bio",
      avatar: "/avatar.png",
      credentials: [],
      sameAs: ["https://github.com/sukruyusufkaya"],
      expertise: ["LLM"],
      employer: "alfi Technology",
    });
    expect(sonuc.success).toBe(false);
  });
});

describe("redirectSema", () => {
  it("302 kodunu reddeder", () => {
    const sonuc = redirectSema.safeParse({
      from: "/makale/eski-slug",
      to: "/makale/yeni-slug",
      code: 302,
      createdAt: simdi,
    });
    expect(sonuc.success).toBe(false);
  });

  it("301 ve 308 kodlarını kabul eder", () => {
    for (const code of [301, 308]) {
      const sonuc = redirectSema.safeParse({
        from: "/makale/eski-slug",
        to: "/makale/yeni-slug",
        code,
        createdAt: simdi,
      });
      expect(sonuc.success).toBe(true);
    }
  });
});
