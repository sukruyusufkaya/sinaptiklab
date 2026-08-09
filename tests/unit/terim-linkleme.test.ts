import { describe, expect, it } from "vitest";
import { terimleriLinkle, type LinklenecekTerim } from "../../lib/mdx/terim-linkleme";

const TERIMLER: LinklenecekTerim[] = [
  { slug: "gomme-vektoru", tr: "gömme vektörü", aliases: ["embedding"] },
  { slug: "vektor-veritabani", tr: "vektör veritabanı" },
  { slug: "halusinasyon", tr: "halüsinasyon" },
  { slug: "rag", tr: "erişim destekli üretim", aliases: ["RAG"] },
  { slug: "token", tr: "token" },
];

describe("terimleriLinkle", () => {
  it("terimin ilk geçtiği yeri sarar, ikinciyi bırakır", () => {
    const { govde, baglananlar } = terimleriLinkle(
      "Bir gömme vektörü üretilir. Sonra gömme vektörü karşılaştırılır.",
      TERIMLER,
    );
    expect(baglananlar).toContain("gomme-vektoru");
    expect(govde.match(/<Terim slug="gomme-vektoru">/g)).toHaveLength(1);
    expect(govde).toContain('<Terim slug="gomme-vektoru">gömme vektörü</Terim>');
  });

  it("Türkçe çekim ekini sarmalın içinde tutar", () => {
    const { govde } = terimleriLinkle("Metni gömme vektörüne çeviriyoruz.", TERIMLER);
    expect(govde).toContain('<Terim slug="gomme-vektoru">gömme vektörüne</Terim>');
  });

  it("eki olmayan biçimi de yakalar ve sonraki kelimeye taşmaz", () => {
    const { govde } = terimleriLinkle("Bu bir halüsinasyon örneğidir.", TERIMLER);
    expect(govde).toContain('<Terim slug="halusinasyon">halüsinasyon</Terim>');
    expect(govde).toContain("örneğidir");
    expect(govde).not.toContain("halüsinasyon örneğidir</Terim>");
  });

  it("uzun terimi kısa terimden önce eşler", () => {
    const { govde } = terimleriLinkle("Kurumsal bir vektör veritabanı seçilir.", TERIMLER);
    expect(govde).toContain('<Terim slug="vektor-veritabani">vektör veritabanı</Terim>');
  });

  it("eşanlamlıyı kanonik slug'a bağlar", () => {
    const { govde } = terimleriLinkle("Burada RAG kullanıyoruz.", TERIMLER);
    expect(govde).toContain('<Terim slug="rag">RAG</Terim>');
  });

  it("kod çitine ve satır içi koda dokunmaz", () => {
    const kaynak = [
      "Açıklama yok.",
      "```py",
      "# gömme vektörü hesapla",
      "x = embedding(metin)",
      "```",
      "Satır içi `token` sayacı.",
    ].join("\n");
    const { govde } = terimleriLinkle(kaynak, TERIMLER);
    expect(govde).toContain("# gömme vektörü hesapla");
    expect(govde).toContain("x = embedding(metin)");
    expect(govde).toContain("`token`");
    expect(govde).not.toContain("<Terim");
  });

  it("başlıkları ve mevcut markdown bağlantılarını atlar", () => {
    const kaynak = [
      "## gömme vektörü nedir?",
      "",
      "Ayrıntı [gömme vektörü sayfasında](/makale/x) anlatılıyor.",
    ].join("\n");
    const { govde } = terimleriLinkle(kaynak, TERIMLER);
    expect(govde).toContain("## gömme vektörü nedir?");
    expect(govde).toContain("[gömme vektörü sayfasında](/makale/x)");
    expect(govde).not.toContain("<Terim");
  });

  it("mevcut JSX bileşenlerinin içine girmez", () => {
    const kaynak = '<Uyari tip="tuzak">Burada halüsinasyon riski var.</Uyari>';
    const { govde } = terimleriLinkle(kaynak, TERIMLER);
    expect(govde).toBe(kaynak);
  });

  it("içeriğin kendi terimini linklemez", () => {
    const { govde, baglananlar } = terimleriLinkle("Bir halüsinasyon örneği.", TERIMLER, {
      haricSlug: "halusinasyon",
    });
    expect(baglananlar).not.toContain("halusinasyon");
    expect(govde).not.toContain("<Terim");
  });

  it("kelime ortasındaki tesadüfi eşleşmeyi almaz", () => {
    const { govde } = terimleriLinkle("ontokenizasyon diye bir şey yok.", TERIMLER);
    expect(govde).not.toContain("<Terim");
  });

  it("dört karakterden kısa terimleri atlar", () => {
    const { baglananlar } = terimleriLinkle("Bu bir ağ örneğidir.", [{ slug: "ag", tr: "ağ" }]);
    expect(baglananlar).toHaveLength(0);
  });

  it("hiç terim yoksa gövdeyi aynen döndürür", () => {
    const kaynak = "Burada eşleşecek bir şey yok.";
    expect(terimleriLinkle(kaynak, []).govde).toBe(kaynak);
  });
});

describe("kısa kök koruması", () => {
  const KISA: LinklenecekTerim[] = [
    { slug: "ajan", tr: "ajan" },
    { slug: "token", tr: "token" },
    { slug: "gomme-vektoru", tr: "gömme vektörü", aliases: ["gömme"] },
  ];

  it("kısa kökte eksiz gövdeyi bağlar", () => {
    const { govde } = terimleriLinkle("Bir ajan kurduk.", KISA);
    expect(govde).toContain('<Terim slug="ajan">ajan</Terim>');
  });

  it("kısa kökte kesmesiz eki reddeder (ajanda ≠ ajan+da)", () => {
    const { govde } = terimleriLinkle("Toplantı ajandası hazır.", KISA);
    expect(govde).not.toContain("<Terim");
  });

  it("kısa kökte fiil çekimini reddeder (gömmeye)", () => {
    const { govde } = terimleriLinkle("Veriyi gömmeye başladık.", KISA);
    expect(govde).not.toContain("<Terim");
  });

  it("kısa kökte kesme işaretli eki kabul eder", () => {
    const { govde } = terimleriLinkle("Girdi token'lar hâlinde gelir.", KISA);
    // d\u00fcz kesme i\u015fareti (U+0027) \u2014 girdideki bi\u00e7imin ayn\u0131s\u0131 korunmal\u0131
    expect(govde).toContain(`<Terim slug="token">token'lar</Terim>`);
  });
});
