import { describe, expect, it } from "vitest";
import type { IcerikDetayDTO } from "../../lib/db/queries/dto";
import {
  koleksiyonSayfasiJsonLd,
  veriKumesiJsonLd,
  yazilimUygulamasiJsonLd,
} from "../../lib/seo/jsonld";
import {
  ARSIVLI_TURLER,
  arsivliTurMu,
  TUR_ARSIV_METNI,
  turArsivSayfaYolu,
  turArsiviUstVerisi,
  turIndeksYolu,
} from "../../lib/tur-arsivi";

const ICERIK: IcerikDetayDTO = {
  id: "b1c2",
  type: "tool",
  slug: "ornek-arac",
  title: "Örnek Araç",
  dek: "Araç kartı spotu.",
  level: "orta",
  pillar: "llm-uretken-yz",
  clusters: ["acik-agirlikli-modeller"],
  tags: ["arac", "llm"],
  excerptHtml: "<p>Araç kartı spotu.</p>",
  readingMinutes: 6,
  publishedAt: "2026-08-08T10:00:00.000Z",
  updatedAt: "2026-08-09T10:00:00.000Z",
  lastVerifiedAt: "2026-08-09T10:00:00.000Z",
  answerFirst: "Kısa cevap.",
  body: "## Kurulum",
  toc: [{ id: "kurulum", text: "Kurulum", depth: 2 }],
  faq: [],
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

describe("tür arşivi rotaları (BRIEF §2.2 / §7.1)", () => {
  it("yalnız indeksi olan türler arşivli sayılır", () => {
    expect(ARSIVLI_TURLER).toEqual(["article", "guide", "tutorial"]);
    expect(arsivliTurMu("article")).toBe(true);
    expect(arsivliTurMu("tool")).toBe(false);
  });

  it("indeks yolu lib/rotalar önekinden türetilir; indekssiz türde null", () => {
    expect(turIndeksYolu("article")).toBe("/makale");
    expect(turIndeksYolu("guide")).toBe("/rehber");
    expect(turIndeksYolu("tutorial")).toBe("/uygulama");
    expect(turIndeksYolu("benchmark")).toBeNull();
  });

  it("1. sayfa parametresiz kalır, 2+ sayfa ?sayfa=N taşır", () => {
    expect(turArsivSayfaYolu("article", 1)).toBe("/makale");
    expect(turArsivSayfaYolu("article", 3)).toBe("/makale?sayfa=3");
  });

  it("her arşivli türün metni ve 155 karakteri aşmayan açıklaması var", () => {
    for (const tur of ARSIVLI_TURLER) {
      const metin = TUR_ARSIV_METNI[tur];
      expect(metin.baslik.length).toBeGreaterThan(0);
      expect(metin.bosMesaj.length).toBeGreaterThan(0);
      expect(metin.aciklama.length).toBeLessThanOrEqual(155);
    }
  });

  it("sayfa 2+ başlığa · Sayfa N ekler ve canonical KENDİNE bakar", () => {
    const ilk = turArsiviUstVerisi("article", 1);
    expect(ilk.title).toBe("Makaleler");
    expect(ilk.alternates?.canonical).toMatch(/\/makale$/);

    const ikinci = turArsiviUstVerisi("article", 2);
    expect(ikinci.title).toBe("Makaleler · Sayfa 2");
    expect(String(ikinci.alternates?.canonical)).toMatch(/\/makale\?sayfa=2$/);
  });
});

describe("arşiv ve tür JSON-LD builder'ları (BRIEF §7.2)", () => {
  it("SoftwareApplication: kaynaklar citation'a düşer, teklif verilmedikçe offers yazılmaz", () => {
    const sema = yazilimUygulamasiJsonLd(ICERIK, "https://sinaptiklab.com/arac/ornek-arac");
    expect(sema["@type"]).toBe("SoftwareApplication");
    expect(sema.citation).toHaveLength(1);
    expect(sema.offers).toBeUndefined();
  });

  it("SoftwareApplication: teklif geçilince Offer basılır", () => {
    const sema = yazilimUygulamasiJsonLd(ICERIK, "https://sinaptiklab.com/arac/ornek-arac", {
      fiyat: "0",
      paraBirimi: "USD",
    });
    expect(sema.offers).toEqual({ "@type": "Offer", price: "0", priceCurrency: "USD" });
  });

  it("Dataset: keywords etiketlerden gelir; repro yoksa measurementTechnique yazılmaz", () => {
    const sema = veriKumesiJsonLd(
      { ...ICERIK, type: "benchmark" },
      "https://sinaptiklab.com/olcum/ornek",
    );
    expect(sema["@type"]).toBe("Dataset");
    expect(sema.keywords).toEqual(["arac", "llm"]);
    expect(sema.measurementTechnique).toBeUndefined();
    expect(sema.creator[0]?.name).toBe("Şükrü Yusuf Kaya");
  });

  it("Dataset: repro donanımı measurementTechnique olur", () => {
    const sema = veriKumesiJsonLd(
      { ...ICERIK, type: "benchmark", repro: { hardware: "RTX 4090 · 24 GB" } },
      "https://sinaptiklab.com/olcum/ornek",
    );
    expect(sema.measurementTechnique).toBe("RTX 4090 · 24 GB");
  });

  it("CollectionPage: ItemList sırası atla ile kayar, toplam gerçek sayıyı söyler", () => {
    const sema = koleksiyonSayfasiJsonLd({
      ad: "Makaleler",
      aciklama: "Arşiv.",
      url: "https://sinaptiklab.com/makale?sayfa=2",
      toplam: 15,
      atla: 12,
      ogeler: [
        { baslik: "Bir", url: "https://sinaptiklab.com/makale/bir" },
        { baslik: "İki", url: "https://sinaptiklab.com/makale/iki" },
      ],
    });
    expect(sema.mainEntity.numberOfItems).toBe(15);
    expect(sema.mainEntity.itemListElement[0]?.position).toBe(13);
    expect(sema.mainEntity.itemListElement[1]?.position).toBe(14);
    expect(sema.isPartOf.name).toBe("Sinaptiklab");
  });

  it("CollectionPage: toplam verilmezse öğe sayısı kullanılır", () => {
    const sema = koleksiyonSayfasiJsonLd({
      ad: "Etiket",
      aciklama: "Arşiv.",
      url: "https://sinaptiklab.com/etiket/rag",
      ogeler: [{ baslik: "Bir", url: "https://sinaptiklab.com/makale/bir" }],
    });
    expect(sema.mainEntity.numberOfItems).toBe(1);
    expect(sema.mainEntity.itemListElement[0]?.position).toBe(1);
  });
});
