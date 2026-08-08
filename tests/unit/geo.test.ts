import { describe, expect, it } from "vitest";
import type { IcerikDetayDTO } from "../../lib/db/queries/dto";
import { icerikMarkdown, mdxTemizle } from "../../lib/geo/markdown-disa-aktar";

const KAYNAKLAR = [
  { label: "Lewis vd. 2020", url: "https://arxiv.org/abs/2005.11401", publisher: "arXiv" },
  { label: "RAG taraması", url: "https://arxiv.org/abs/2312.10997", publisher: "arXiv" },
  {
    label: "Contextual Retrieval",
    url: "https://www.anthropic.com/news/contextual-retrieval",
    publisher: "Anthropic",
  },
];

describe("mdxTemizle", () => {
  it('Kaynak atfı "metin [N]" biçimine iner (çok satırlı dahil)', () => {
    expect(
      mdxTemizle('<Kaynak id="1">terimi Lewis ve arkadaşları ortaya attı</Kaynak>.', KAYNAKLAR),
    ).toBe("terimi Lewis ve arkadaşları ortaya attı [1].\n");
    expect(mdxTemizle('<Kaynak id="2">birinci satır\nikinci satır</Kaynak>', KAYNAKLAR)).toContain(
      "birinci satır\nikinci satır [2]",
    );
  });

  it("kaynak listesinde karşılığı olmayan atıf numarası düşer, metin kalır", () => {
    expect(mdxTemizle('<Kaynak id="9">metin</Kaynak>', KAYNAKLAR)).toBe("metin\n");
  });

  it("Uyari blockquote'a iner ve tip etiketi taşınır", () => {
    const cikti = mdxTemizle(
      '<Uyari tip="tuzak">\nÖnce ölç, sonra karmaşıklaştır.\n</Uyari>',
      KAYNAKLAR,
    );
    expect(cikti).toContain("> **Uyarı (tuzak):** Önce ölç, sonra karmaşıklaştır.");
  });

  it('tip verilmeyen Uyari varsayılan "dikkat" etiketi alır; çok satırlı içerik satır satır alıntılanır', () => {
    const cikti = mdxTemizle("<Uyari>\nilk paragraf\n\nikinci paragraf\n</Uyari>", KAYNAKLAR);
    expect(cikti).toContain("> **Uyarı (dikkat):** ilk paragraf");
    expect(cikti).toContain(">\n> ikinci paragraf");
  });

  it('Adim "### Adım X: B" başlığına dönüşür, içerik korunur', () => {
    const girdi = '<Adim n="1" baslik="Ollama\'yı kurun">\nKurulum tek satırdır.\n</Adim>';
    const cikti = mdxTemizle(girdi, KAYNAKLAR);
    expect(cikti).toContain("### Adım 1: Ollama'yı kurun");
    expect(cikti).toContain("Kurulum tek satırdır.");
  });

  it("baslik'sız Adim yalnız numarayla başlık üretir", () => {
    expect(mdxTemizle('<Adim n="2">içerik</Adim>', KAYNAKLAR)).toContain("### Adım 2\n\niçerik");
  });

  it("Karsilastirma sarmalayıcısı düşer, markdown tablo olduğu gibi kalır", () => {
    const tablo = "| Kriter | RAG |\n|---|---|\n| Boyut | Büyük |";
    expect(mdxTemizle(`<Karsilastirma>\n${tablo}\n</Karsilastirma>`, KAYNAKLAR)).toBe(`${tablo}\n`);
  });

  it("Terim ve KisaCevap sarmalayıcıları düşer, metinleri kalır", () => {
    expect(mdxTemizle('<Terim slug="rag">RAG</Terim> deseni', KAYNAKLAR)).toBe("RAG deseni\n");
    expect(mdxTemizle("<KisaCevap>Kısa cevap metni.</KisaCevap>", KAYNAKLAR)).toBe(
      "Kısa cevap metni.\n",
    );
  });

  it("YoneticiOzeti yönetici özeti blockquote'una iner", () => {
    expect(mdxTemizle("<YoneticiOzeti>Durum özeti.</YoneticiOzeti>", KAYNAKLAR)).toContain(
      "> **Yönetici özeti:** Durum özeti.",
    );
  });

  it("Diyagram mermaid çitli kod bloğuna iner (şablon dizgeli çok satırlı kod dahil)", () => {
    const girdi = '<Diyagram kod={`graph TD\nA --> B`} baslik="Akış" />';
    expect(mdxTemizle(girdi, KAYNAKLAR)).toContain("```mermaid\ngraph TD\nA --> B\n```");
    expect(mdxTemizle('<Diyagram kod="graph LR" />', KAYNAKLAR)).toContain(
      "```mermaid\ngraph LR\n```",
    );
  });

  it("Olcum ve Video düşer", () => {
    const girdi = 'önce\n\n<Olcum id="x" />\n\n<Video videoId="abc" baslik="B" />\n\nsonra';
    expect(mdxTemizle(girdi, KAYNAKLAR)).toBe("önce\n\nsonra\n");
  });

  it("Kod sarmalayıcısı düşer, içindeki çit korunur", () => {
    const girdi = '<Kod dosya="eval.py">\n\n```py\nprint("x")\n```\n\n</Kod>';
    const cikti = mdxTemizle(girdi, KAYNAKLAR);
    expect(cikti).toContain('```py\nprint("x")\n```');
    expect(cikti).not.toContain("<Kod");
  });

  it("bilinmeyen etiket silinir, içeriği korunur; kendi kapanan bilinmeyen tamamen düşer", () => {
    expect(mdxTemizle('<Bilinmeyen a="1">içerik</Bilinmeyen>', KAYNAKLAR)).toBe("içerik\n");
    expect(mdxTemizle('kala kala <Yalniz veri="x" /> bu kaldı', KAYNAKLAR)).toBe(
      "kala kala  bu kaldı\n",
    );
  });

  it("kod çitindeki ve satır içi koddaki JSX görünümlü metne dokunulmaz", () => {
    const cit = '```tsx\n<Bilesen prop="x" />\n```';
    expect(mdxTemizle(cit, KAYNAKLAR)).toContain('<Bilesen prop="x" />');
    expect(mdxTemizle("satır içi `<Kaynak id=1>` örneği", KAYNAKLAR)).toBe(
      "satır içi `<Kaynak id=1>` örneği\n",
    );
  });

  it("çok satırlı iç içe kullanım çözülür: Adim içindeki Kaynak ve çit birlikte", () => {
    const girdi =
      '<Adim n="1" baslik="Kurun">\n<Kaynak id="1">Resmi kurulum komutları</Kaynak>:\n\n' +
      "```bash\ncurl -fsSL https://ollama.com/install.sh | sh\n```\n</Adim>";
    const cikti = mdxTemizle(girdi, KAYNAKLAR);
    expect(cikti).toContain("### Adım 1: Kurun");
    expect(cikti).toContain("Resmi kurulum komutları [1]:");
    expect(cikti).toContain("```bash\ncurl -fsSL https://ollama.com/install.sh | sh\n```");
    expect(cikti).not.toMatch(/<[A-Z]/);
  });
});

function ornekIcerik(): IcerikDetayDTO {
  return {
    id: "6650f0a1b2c3d4e5f6a7b8c9",
    type: "guide",
    slug: "rag-nedir",
    title: "RAG nedir?",
    dek: "RAG'in tanımı ve üretim notları.",
    level: "giris",
    pillar: "rag-bilgi-erisimi",
    clusters: ["rag-temelleri"],
    tags: ["rag"],
    excerptHtml: "<p>özet</p>",
    readingMinutes: 12,
    publishedAt: "2026-08-08T10:00:00.000Z",
    updatedAt: "2026-08-08T12:00:00.000Z",
    lastVerifiedAt: "2026-08-08T12:00:00.000Z",
    answerFirst: "RAG, model cevap üretmeden önce harici kaynaktan bilgi getirir.",
    body:
      '## Tanım\n\n<Kaynak id="1">terimi 2020 makalesi ortaya attı</Kaynak>.\n\n' +
      '<Uyari tip="tuzak">\nÖnce ölçün.\n</Uyari>\n',
    toc: [{ id: "tanim", text: "Tanım", depth: 2 }],
    faq: [{ q: "RAG pahalı mı?", a: "Kuruluma göre değişir." }],
    sources: [
      {
        label: "Lewis vd. 2020",
        url: "https://arxiv.org/abs/2005.11401",
        publisher: "arXiv",
        accessedAt: "2026-08-01T00:00:00.000Z",
        kind: "paper",
      },
    ],
    repro: null,
    seo: {},
    lang: "tr",
    changelog: [],
    version: 1,
    yazarlar: [
      { id: "1", slug: "sukru-yusuf-kaya", name: "Şükrü Yusuf Kaya", title: "Kurucu", avatar: "" },
    ],
    teknikEditor: null,
  };
}

describe("icerikMarkdown", () => {
  it("tam belge iskeleti: başlık, dek, meta, kısa cevap, kaynaklar, SSS, kanonik not", () => {
    const belge = icerikMarkdown(ornekIcerik());
    expect(belge.startsWith("# RAG nedir?\n\n> RAG'in tanımı ve üretim notları.")).toBe(true);
    expect(belge).toContain("Yazar: Şükrü Yusuf Kaya");
    expect(belge).toContain("Yayın: 2026-08-08");
    expect(belge).toContain("Tür: Rehber");
    expect(belge).toContain("Pillar: rag-bilgi-erisimi");
    expect(belge).toContain("Seviye: Giriş");
    expect(belge).toContain("## Kısa cevap\n\nRAG, model cevap üretmeden önce");
    expect(belge).toContain(
      "## Kaynaklar\n\n1. Lewis vd. 2020 — arXiv — https://arxiv.org/abs/2005.11401",
    );
    expect(belge).toContain("## SSS\n\n**RAG pahalı mı?**\n\nKuruluma göre değişir.");
    expect(belge).toContain("Kanonik sürüm: https://sinaptiklab.com/rehber/rag-nedir");
  });

  it("gövde temizlenmiş gelir: MDX etiketi kalmaz, atıf ve blockquote yerinde", () => {
    const belge = icerikMarkdown(ornekIcerik());
    expect(belge).toContain("terimi 2020 makalesi ortaya attı [1].");
    expect(belge).toContain("> **Uyarı (tuzak):** Önce ölçün.");
    expect(belge).not.toMatch(/<[A-Z]/);
  });

  it("teknik editör ve yayın tarihi yoksa meta satırı o parçaları atlar", () => {
    const icerik = { ...ornekIcerik(), publishedAt: null, teknikEditor: null };
    const belge = icerikMarkdown(icerik);
    expect(belge).not.toContain("Yayın:");
    expect(belge).not.toContain("Teknik editör:");
    expect(belge).toContain("Güncelleme: 2026-08-08");
  });
});
