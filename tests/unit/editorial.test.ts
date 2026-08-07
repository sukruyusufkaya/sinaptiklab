import { ObjectId } from "mongodb";
import { describe, expect, it } from "vitest";
import { contentSema, type Content } from "../../lib/db/schemas/content";
import {
  yayinKontrolleri,
  type DogrulamaBaglami,
  type KontrolSonucu,
} from "../../lib/editorial/dogrulayicilar";
import { gecisGecerliMi, gecisHatasi, type Durum } from "../../lib/editorial/durum-makinesi";

const simdi = new Date();

// 45 kelimelik answerFirst — 40–80 aralığının ortasında güvenli değer.
const KIRK_BES_KELIME = Array.from({ length: 45 }, (_, i) => `kelime${i + 1}`).join(" ");

// Tüm kuralları geçen gövde: 1 tutarlı <Kaynak> atıfı, alt'lı görsel,
// 3 iç link, 2 dış link.
const GECERLI_GOVDE = `## Giriş

Üretimde RAG kurarken p95 gecikme 340 ms ölçtük <Kaynak id="1">kendi saha verimiz</Kaynak>.

![RAG boru hattı mimarisi](/gorseller/rag-mimari.png)

Ayrıntı için [RAG rehberi](/rehber/rag-rehberi), [chunking stratejileri](/makale/chunking-stratejileri) ve [gömme vektörü](/sozluk/gomme-vektoru) sayfalarına bakın.

Dış kaynaklar: [Atlas Vector Search](https://www.mongodb.com/docs/atlas/atlas-vector-search/) ve [OpenAI embeddings](https://platform.openai.com/docs/guides/embeddings).
`;

function adayUret(degisiklikler: Partial<Content> = {}): Content {
  return contentSema.parse({
    type: "article",
    slug: "rag-uretim-tuzaklari",
    title: "RAG Üretim Tuzakları",
    dek: "Üretimde RAG kurarken en sık düşülen tuzaklar ve saha verisiyle çözümleri.",
    answerFirst: KIRK_BES_KELIME,
    body: GECERLI_GOVDE,
    excerptHtml: "<p>Özet</p>",
    level: "orta",
    pillar: "rag-bilgi-erisimi",
    clusters: ["chunking"],
    tags: ["rag"],
    authors: [new ObjectId()],
    technicalReviewer: null,
    status: "in_review",
    publishedAt: null,
    updatedAt: simdi,
    lastVerifiedAt: simdi,
    readingMinutes: 8,
    toc: [{ id: "giris", text: "Giriş", depth: 2 }],
    faq: [
      { q: "RAG nedir?", a: "Bilgi erişimiyle desteklenen üretim." },
      { q: "Chunk boyutu ne olmalı?", a: "Göreve göre 256–1024 token." },
    ],
    sources: [
      {
        label: "MongoDB Atlas Vector Search Docs",
        url: "https://www.mongodb.com/docs/atlas/atlas-vector-search/",
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
    ...degisiklikler,
  });
}

function baglamUret(degisiklikler: Partial<DogrulamaBaglami> = {}): DogrulamaBaglami {
  return {
    mevcutSluglar: [],
    yayindakiSluglar: [],
    linkDenetleyici: async () => true, // testler ağa ÇIKMAZ
    ...degisiklikler,
  };
}

async function kontrolAl(
  aday: Content,
  kural: string,
  baglam: DogrulamaBaglami = baglamUret(),
): Promise<KontrolSonucu> {
  const kontroller = await yayinKontrolleri(aday, baglam);
  const sonuc = kontroller.find((k) => k.kural === kural);
  if (sonuc === undefined) throw new Error(`Kural sonucu bulunamadı: ${kural}`);
  return sonuc;
}

describe("yayinKontrolleri — genel", () => {
  it("geçerli aday 10 kontrolün tümünü geçer", async () => {
    const kontroller = await yayinKontrolleri(adayUret(), baglamUret());
    expect(kontroller).toHaveLength(10);
    for (const kontrol of kontroller) {
      expect(kontrol.gecti, `${kontrol.kural}: ${kontrol.mesaj}`).toBe(true);
    }
  });

  it("kontroller sabit kural adlarıyla döner", async () => {
    const kontroller = await yayinKontrolleri(adayUret(), baglamUret());
    expect(kontroller.map((k) => k.kural)).toEqual([
      "kaynak-atiflari",
      "kisa-cevap",
      "sss",
      "icindekiler",
      "gorsel-alt",
      "repro-zorunlu",
      "veri-guncelligi",
      "link-sayisi",
      "slug",
      "kirik-link",
    ]);
  });
});

describe("kural 1 — kaynak atıfları", () => {
  it("hiç <Kaynak> atıfı yoksa kalır ve atıf eklemeyi söyler", async () => {
    const govde = GECERLI_GOVDE.replace(
      '<Kaynak id="1">kendi saha verimiz</Kaynak>',
      "kendi saha verimiz",
    );
    const sonuc = await kontrolAl(adayUret({ body: govde }), "kaynak-atiflari");
    expect(sonuc.gecti).toBe(false);
    expect(sonuc.mesaj).toContain("hiç <Kaynak> atıfı yok");
    expect(sonuc.mesaj).toContain("atıf ekleyin");
  });

  it("aralık dışı id'yi kalır sayar ve geçerli aralığı söyler", async () => {
    const govde = GECERLI_GOVDE.replace('<Kaynak id="1">', '<Kaynak id="3">');
    const sonuc = await kontrolAl(adayUret({ body: govde }), "kaynak-atiflari");
    expect(sonuc.gecti).toBe(false);
    expect(sonuc.mesaj).toContain("3");
    expect(sonuc.mesaj).toContain("1..1");
  });

  it("süslü parantezli sayısal id'yi kabul eder", async () => {
    const govde = GECERLI_GOVDE.replace('<Kaynak id="1">', "<Kaynak id={1}>");
    const sonuc = await kontrolAl(adayUret({ body: govde }), "kaynak-atiflari");
    expect(sonuc.gecti).toBe(true);
  });
});

describe("kural 2 — answerFirst 40–80 kelime", () => {
  it("kısa cevabı kalır sayar; mevcut sayıyı ve eksik kelimeyi söyler", async () => {
    const kisa = Array.from({ length: 10 }, (_, i) => `k${i}`).join(" ");
    const sonuc = await kontrolAl(adayUret({ answerFirst: kisa }), "kisa-cevap");
    expect(sonuc.gecti).toBe(false);
    expect(sonuc.mesaj).toContain("10 kelime");
    expect(sonuc.mesaj).toContain("30 kelime");
  });

  it("uzun cevabı kalır sayar; kısaltılacak miktarı söyler", async () => {
    const uzun = Array.from({ length: 100 }, (_, i) => `k${i}`).join(" ");
    const sonuc = await kontrolAl(adayUret({ answerFirst: uzun }), "kisa-cevap");
    expect(sonuc.gecti).toBe(false);
    expect(sonuc.mesaj).toContain("100 kelime");
    expect(sonuc.mesaj).toContain("20 kelime");
  });

  it("40 ve 80 sınır değerlerini geçer sayar", async () => {
    for (const adet of [40, 80]) {
      const cevap = Array.from({ length: adet }, (_, i) => `k${i}`).join(" ");
      const sonuc = await kontrolAl(adayUret({ answerFirst: cevap }), "kisa-cevap");
      expect(sonuc.gecti, `${adet} kelime sınırda geçmeli`).toBe(true);
    }
  });

  it("fazla boşluk kelime sayısını şişirmez (TR-güvenli sayım)", async () => {
    const cevap = `  ${Array.from({ length: 45 }, (_, i) => `k${i}`).join("   \n ")}  `;
    const sonuc = await kontrolAl(adayUret({ answerFirst: cevap }), "kisa-cevap");
    expect(sonuc.gecti).toBe(true);
    expect(sonuc.mesaj).toContain("45");
  });
});

describe("kural 3 — SSS", () => {
  it("tek soruyu kalır sayar ve kaç soru ekleneceğini söyler", async () => {
    const sonuc = await kontrolAl(adayUret({ faq: [{ q: "Soru?", a: "Cevap." }] }), "sss");
    expect(sonuc.gecti).toBe(false);
    expect(sonuc.mesaj).toContain("1 soru");
    expect(sonuc.mesaj).toContain("ekleyin");
  });
});

describe("kural 4 — içindekiler", () => {
  it("boş toc'u kalır sayar ve H2 eklemeyi söyler", async () => {
    const sonuc = await kontrolAl(adayUret({ toc: [] }), "icindekiler");
    expect(sonuc.gecti).toBe(false);
    expect(sonuc.mesaj).toContain("H2");
  });

  it("id'si boş maddeyi kalır sayar ve maddeyi adıyla gösterir", async () => {
    const sonuc = await kontrolAl(
      adayUret({
        toc: [
          { id: "giris", text: "Giriş", depth: 2 },
          { id: "", text: "Sonuç", depth: 2 },
        ],
      }),
      "icindekiler",
    );
    expect(sonuc.gecti).toBe(false);
    expect(sonuc.mesaj).toContain('"Sonuç"');
  });
});

describe("kural 5 — görsel alt metni", () => {
  it("markdown görselde boş alt'ı kalır sayar ve url'yi gösterir", async () => {
    const govde = `${GECERLI_GOVDE}\n![](/gorseller/altsiz.png)\n`;
    const sonuc = await kontrolAl(adayUret({ body: govde }), "gorsel-alt");
    expect(sonuc.gecti).toBe(false);
    expect(sonuc.mesaj).toContain("/gorseller/altsiz.png");
    expect(sonuc.mesaj).toContain("alt yazın");
  });

  it("alt'sız <img> etiketini kalır sayar", async () => {
    const govde = `${GECERLI_GOVDE}\n<img src="/gorseller/etiket.png" />\n`;
    const sonuc = await kontrolAl(adayUret({ body: govde }), "gorsel-alt");
    expect(sonuc.gecti).toBe(false);
    expect(sonuc.mesaj).toContain("/gorseller/etiket.png");
  });

  it('alt="" olan <img> etiketini de kalır sayar', async () => {
    const govde = `${GECERLI_GOVDE}\n<img src="/gorseller/bos-alt.png" alt="" />\n`;
    const sonuc = await kontrolAl(adayUret({ body: govde }), "gorsel-alt");
    expect(sonuc.gecti).toBe(false);
  });

  it("alt'ı dolu <img> etiketini geçer sayar", async () => {
    const govde = `${GECERLI_GOVDE}\n<img src="/gorseller/tam.png" alt="Ölçüm grafiği" />\n`;
    const sonuc = await kontrolAl(adayUret({ body: govde }), "gorsel-alt");
    expect(sonuc.gecti).toBe(true);
  });
});

describe("kural 6 — tutorial/lab repro zorunluluğu", () => {
  it("repro'suz tutorial'ı kalır sayar ve repoUrl istemeyi söyler", async () => {
    const sonuc = await kontrolAl(adayUret({ type: "tutorial", repro: null }), "repro-zorunlu");
    expect(sonuc.gecti).toBe(false);
    expect(sonuc.mesaj).toContain("repro.repoUrl");
  });

  it("repoUrl'li lab'ı geçer sayar", async () => {
    const sonuc = await kontrolAl(
      adayUret({ type: "lab", repro: { repoUrl: "https://github.com/sinaptiklab/rag-lab" } }),
      "repro-zorunlu",
    );
    expect(sonuc.gecti).toBe(true);
  });

  it("article için kuralı uygulamaz", async () => {
    const sonuc = await kontrolAl(adayUret({ type: "article", repro: null }), "repro-zorunlu");
    expect(sonuc.gecti).toBe(true);
  });
});

describe("kural 7 — tool/benchmark 90 gün doğrulama", () => {
  it("120 gün önce doğrulanan tool'u kalır sayar ve gün sayısını söyler", async () => {
    const eski = new Date(Date.now() - 120 * 86_400_000);
    const sonuc = await kontrolAl(
      adayUret({ type: "tool", lastVerifiedAt: eski }),
      "veri-guncelligi",
    );
    expect(sonuc.gecti).toBe(false);
    expect(sonuc.mesaj).toContain("120 gün");
    expect(sonuc.mesaj).toContain("lastVerifiedAt");
  });

  it("10 gün önce doğrulanan benchmark'ı geçer sayar", async () => {
    const yeni = new Date(Date.now() - 10 * 86_400_000);
    const sonuc = await kontrolAl(
      adayUret({ type: "benchmark", lastVerifiedAt: yeni }),
      "veri-guncelligi",
    );
    expect(sonuc.gecti).toBe(true);
  });

  it("article için 90 gün şartını uygulamaz", async () => {
    const cokEski = new Date(Date.now() - 400 * 86_400_000);
    const sonuc = await kontrolAl(
      adayUret({ type: "article", lastVerifiedAt: cokEski }),
      "veri-guncelligi",
    );
    expect(sonuc.gecti).toBe(true);
  });
});

describe("kural 8 — iç/dış link sayısı", () => {
  const AZ_LINKLI_GOVDE = `## Giriş

Metin <Kaynak id="1">veri</Kaynak>.

![Görsel](/g.png)

Tek dış link: [örnek](https://ornek-alan.com/sayfa).
`;

  it("yetersiz linkte kalır; sayıları ve eksikleri söyler, aynı pillar'dan 5 öneri verir", async () => {
    const baglam = baglamUret({
      yayindakiSluglar: [
        "rag-uretim-tuzaklari", // adayın kendisi — önerilere girmemeli
        "oneri-1",
        "oneri-2",
        "oneri-3",
        "oneri-4",
        "oneri-5",
        "oneri-6",
      ],
    });
    const sonuc = await kontrolAl(adayUret({ body: AZ_LINKLI_GOVDE }), "link-sayisi", baglam);
    expect(sonuc.gecti).toBe(false);
    expect(sonuc.mesaj).toContain("0 iç link");
    expect(sonuc.mesaj).toContain("1 dış link");
    expect(sonuc.mesaj).toContain("3 iç link ekleyin");
    expect(sonuc.mesaj).toContain("1 otoriter dış");
    expect(sonuc.oneriler).toEqual(["oneri-1", "oneri-2", "oneri-3", "oneri-4", "oneri-5"]);
  });

  it("html href iç linklerini de sayar", async () => {
    const govde = `${AZ_LINKLI_GOVDE}
<a href="/makale/a">a</a> <a href="/rehber/b">b</a> <a href="/konu/llm">c</a>
[dış](https://ikinci-alan.org/dok)
`;
    const sonuc = await kontrolAl(adayUret({ body: govde }), "link-sayisi");
    expect(sonuc.gecti).toBe(true);
  });

  it("kendi alanına giden mutlak URL'yi dış link saymaz", async () => {
    const govde = `${AZ_LINKLI_GOVDE}
[a](/makale/a) [b](/rehber/b) [c](/sozluk/c)
[kendi](https://sinaptiklab.com/makale/x)
`;
    const sonuc = await kontrolAl(adayUret({ body: govde }), "link-sayisi");
    expect(sonuc.gecti).toBe(false);
    expect(sonuc.mesaj).toContain("1 dış link");
  });
});

describe("kural 9 — slug", () => {
  it("norm dışı slug'ı kalır sayar ve normalize önerisini verir", async () => {
    const sonuc = await kontrolAl(adayUret({ slug: "RAG Tuzakları!" }), "slug");
    expect(sonuc.gecti).toBe(false);
    expect(sonuc.mesaj).toContain('"rag-tuzaklari"');
  });

  it("çakışan slug'ı kalır sayar ve redirect'i hatırlatır", async () => {
    const baglam = baglamUret({ mevcutSluglar: ["rag-uretim-tuzaklari"] });
    const sonuc = await kontrolAl(adayUret(), "slug", baglam);
    expect(sonuc.gecti).toBe(false);
    expect(sonuc.mesaj).toContain("zaten kullanılıyor");
    expect(sonuc.mesaj).toContain("redirect");
  });

  it("norma uygun ve benzersiz slug'ı geçer sayar", async () => {
    const sonuc = await kontrolAl(adayUret(), "slug", baglamUret({ mevcutSluglar: ["baska"] }));
    expect(sonuc.gecti).toBe(true);
  });
});

describe("kural 10 — kırık link taraması", () => {
  it("kırık linki kalır sayar ve URL'yi listeler", async () => {
    const kirikUrl = "https://platform.openai.com/docs/guides/embeddings";
    const baglam = baglamUret({
      linkDenetleyici: async (url) => url !== kirikUrl,
    });
    const sonuc = await kontrolAl(adayUret(), "kirik-link", baglam);
    expect(sonuc.gecti).toBe(false);
    expect(sonuc.mesaj).toContain(kirikUrl);
    expect(sonuc.mesaj).toContain("değiştirin");
  });

  it("aynı URL'yi bir kez denetler (tekilleştirme)", async () => {
    const denetlenenler: string[] = [];
    const govde = `${GECERLI_GOVDE}\nTekrar: [aynı](https://www.mongodb.com/docs/atlas/atlas-vector-search/)\n`;
    const baglam = baglamUret({
      linkDenetleyici: async (url) => {
        denetlenenler.push(url);
        return true;
      },
    });
    const sonuc = await kontrolAl(adayUret({ body: govde }), "kirik-link", baglam);
    expect(sonuc.gecti).toBe(true);
    expect(new Set(denetlenenler).size).toBe(denetlenenler.length);
  });

  it("http(s) bağlantısı olmayan gövdeyi denetleyicisiz de geçer sayar", async () => {
    const govde = `## Giriş\n\nMetin <Kaynak id="1">veri</Kaynak>. [iç](/makale/a)\n`;
    const baglam: DogrulamaBaglami = { mevcutSluglar: [], yayindakiSluglar: [] };
    const sonuc = await kontrolAl(adayUret({ body: govde }), "kirik-link", baglam);
    expect(sonuc.gecti).toBe(true);
  });
});

describe("kod blokları denetimlerden muaf", () => {
  const KOD_BLOKLU_GOVDE = `## Giriş

Metin <Kaynak id="1">veri</Kaynak>.

\`\`\`md
![](/kod-icindeki-altsiz.png)
[kırık](https://kod-icindeki-kirik.example.com/sayfa)
<a href="/makale/kod-icinde">sayılmaz</a>
\`\`\`

![Gerçek görsel](/gercek.png)

[a](/makale/a) [b](/rehber/b) [c](/sozluk/c)
[d](https://dis-bir.example.com) [e](https://dis-iki.example.org)
`;

  it("kod içindeki alt'sız görsel ve linkler sayılmaz, denetlenmez", async () => {
    const denetlenenler: string[] = [];
    const baglam = baglamUret({
      linkDenetleyici: async (url) => {
        denetlenenler.push(url);
        return !url.includes("kod-icindeki-kirik");
      },
    });
    const kontroller = await yayinKontrolleri(adayUret({ body: KOD_BLOKLU_GOVDE }), baglam);
    const kural = (ad: string) => kontroller.find((k) => k.kural === ad);
    expect(kural("gorsel-alt")?.gecti).toBe(true);
    expect(kural("link-sayisi")?.gecti).toBe(true);
    expect(kural("kirik-link")?.gecti).toBe(true);
    expect(denetlenenler.some((u) => u.includes("kod-icindeki-kirik"))).toBe(false);
  });
});

describe("durum makinesi", () => {
  const DURUMLAR: Durum[] = ["draft", "in_review", "scheduled", "published", "archived"];
  const BEKLENEN: Record<Durum, Durum[]> = {
    draft: ["in_review"],
    in_review: ["draft", "scheduled", "published"],
    scheduled: ["published", "draft"],
    published: ["archived"],
    archived: ["draft"],
  };

  it("25 geçişin tamamı tabloya uyar", () => {
    for (const from of DURUMLAR) {
      for (const to of DURUMLAR) {
        expect(gecisGecerliMi(from, to), `${from} → ${to}`).toBe(BEKLENEN[from].includes(to));
      }
    }
  });

  it("aynı duruma geçiş geçersizdir", () => {
    for (const durum of DURUMLAR) {
      expect(gecisGecerliMi(durum, durum)).toBe(false);
    }
  });

  it("gecisHatasi mümkün geçişleri Türkçe etiketleriyle sayar", () => {
    const mesaj = gecisHatasi("draft", "published");
    expect(mesaj).toContain('"taslak"');
    expect(mesaj).toContain('"yayında"');
    expect(mesaj).toContain("geçilemez");
    expect(mesaj).toContain('"incelemede" (in_review)');
  });

  it("gecisHatasi published için yalnız arşivi önerir", () => {
    const mesaj = gecisHatasi("published", "draft");
    expect(mesaj).toContain('"arşivde" (archived)');
    expect(mesaj).not.toContain('"zamanlanmış"');
  });
});
