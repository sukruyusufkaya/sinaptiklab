import { describe, expect, it } from "vitest";
import {
  atlasAsamasi,
  highlightParcasi,
  icerikFiltresi,
  regexKacis,
  sayfaNoOku,
  sayfalama,
  sorguTemizle,
  terimFiltresi,
} from "../../lib/search/ara";
import { harfAnahtari, harfCipasi, harfleGrupla } from "../../lib/sozluk";

// Bu dosya DB'ye BAĞLANMAZ: yalnız saf yardımcılar ve sorgu şekilleri test
// edilir. Atlas'a bağlı davranış (sıralama, highlight içeriği) E2E'nin işi.

describe("sorgu temizleme", () => {
  it("kırpar ve iç boşlukları teke indirir", () => {
    expect(sorguTemizle("  rag   sistemleri \n ")).toBe("rag sistemleri");
  });

  it("kontrol ve biçim karakterlerini boşluğa çevirir", () => {
    expect(sorguTemizle("rag\u0000\u0007sistem")).toBe("rag sistem");
    expect(sorguTemizle("rag\u200bsistem")).toBe("rag sistem");
  });

  it("uzunluğu 120 karaktere sabitler", () => {
    expect(sorguTemizle("a".repeat(500))).toHaveLength(120);
  });

  it("yalnız boşluktan oluşan sorgu boş string olur", () => {
    expect(sorguTemizle("   \t \n ")).toBe("");
  });

  it("Türkçe karakterleri bozmaz", () => {
    expect(sorguTemizle(" İnce ayar ğüşöç ")).toBe("İnce ayar ğüşöç");
  });
});

describe("regex kaçışı", () => {
  it("desen karakterlerini literal hâle getirir", () => {
    expect(regexKacis("c++ (v2) [x]")).toBe("c\\+\\+ \\(v2\\) \\[x\\]");
  });

  it("kaçışlı desen literal eşleşir, joker gibi davranmaz", () => {
    const desen = new RegExp(regexKacis("a.c"), "i");
    expect(desen.test("a.c")).toBe(true);
    expect(desen.test("abc")).toBe(false);
  });

  it("ReDoS üreten girdi zararsız literal olur", () => {
    const desen = new RegExp(regexKacis("(a+)+$"), "i");
    expect(desen.test("(a+)+$")).toBe(true);
    expect(desen.test("aaaaaaaaaaaaaaaaaaaaaaa")).toBe(false);
  });
});

describe("sayfalama hesabı", () => {
  it("ilk sayfa: önceki yok, sonraki var", () => {
    const s = sayfalama(30, 12, 1);
    expect(s).toMatchObject({
      sayfa: 1,
      atla: 0,
      sayfaSayisi: 3,
      oncekiVar: false,
      sonrakiVar: true,
    });
  });

  it("orta sayfa doğru atlama üretir", () => {
    expect(sayfalama(30, 12, 2).atla).toBe(12);
    expect(sayfalama(30, 12, 3)).toMatchObject({ atla: 24, sonrakiVar: false, oncekiVar: true });
  });

  it("aralık dışı sayfa son sayfaya kelepçelenir", () => {
    expect(sayfalama(30, 12, 99).sayfa).toBe(3);
    expect(sayfalama(30, 12, -5).sayfa).toBe(1);
    expect(sayfalama(30, 12, Number.NaN).sayfa).toBe(1);
  });

  it("sonuç yokken tek sayfa varsayılır (0'a bölme yok)", () => {
    expect(sayfalama(0, 12, 1)).toMatchObject({
      sayfa: 1,
      atla: 0,
      sayfaSayisi: 1,
      oncekiVar: false,
      sonrakiVar: false,
    });
  });

  it("bozuk adet değeri en az 1'e çekilir", () => {
    expect(sayfalama(5, 0, 1).sayfaSayisi).toBe(5);
  });
});

describe("sayfa parametresi okuma", () => {
  it("geçersiz/eksik değerde 1 döner", () => {
    expect(sayfaNoOku(undefined)).toBe(1);
    expect(sayfaNoOku("")).toBe(1);
    expect(sayfaNoOku("abc")).toBe(1);
    expect(sayfaNoOku("0")).toBe(1);
    expect(sayfaNoOku("-3")).toBe(1);
  });

  it("geçerli sayıyı okur", () => {
    expect(sayfaNoOku("4")).toBe(4);
  });
});

describe("içerik filtresi", () => {
  it("varsayılan yalnız yayındakileri kapsar", () => {
    expect(icerikFiltresi({})).toEqual({ status: "published" });
  });

  it("tür/pillar/seviye alan adlarına eşlenir", () => {
    expect(icerikFiltresi({ tur: "guide", pillar: "rag-bilgi-erisimi", seviye: "ileri" })).toEqual({
      status: "published",
      type: "guide",
      pillar: "rag-bilgi-erisimi",
      level: "ileri",
    });
  });
});

describe("Atlas $search aşaması", () => {
  const asama = atlasAsamasi("rag");

  it("BRIEF §4.1 index'ini ve ağırlıkları taşır (title^5, dek^3, tags^2, body)", () => {
    expect(asama["index"]).toBe("content_search");
    const should = (asama["compound"] as { should: Record<string, unknown>[] }).should;
    const agirliklar = should.map((madde) => {
      const metin = madde["text"] as {
        path: string;
        score?: { boost: { value: number } };
      };
      return [metin.path, metin.score?.boost.value ?? 1] as const;
    });
    expect(agirliklar).toEqual([
      ["title", 5],
      ["dek", 3],
      ["tags", 2],
      ["body", 1],
    ]);
  });

  it("sorgu metnini her should maddesine geçirir ve highlight ister", () => {
    const should = (asama["compound"] as { should: Record<string, unknown>[] }).should;
    for (const madde of should) {
      expect((madde["text"] as { query: string }).query).toBe("rag");
    }
    expect(asama["highlight"]).toEqual({ path: ["title", "dek", "body"] });
  });
});

describe("highlight parçası", () => {
  it("texts değerlerini tek satırlık metne birleştirir", () => {
    const parca = highlightParcasi([
      { path: "body", texts: [{ value: "RAG  \n mimarisi ", type: "hit" }, { value: "kurulumu" }] },
    ]);
    expect(parca).toBe("RAG mimarisi kurulumu");
  });

  it("beklenmedik/boş şekillerde undefined döner (sunucu şekli değişse de kırılmaz)", () => {
    expect(highlightParcasi(undefined)).toBeUndefined();
    expect(highlightParcasi([])).toBeUndefined();
    expect(highlightParcasi([{ texts: "hatalı" }])).toBeUndefined();
    expect(highlightParcasi([{ texts: [{ value: 42 }] }])).toBeUndefined();
  });

  it("uzun parçayı 220 karakterde keser", () => {
    const parca = highlightParcasi([{ texts: [{ value: "x".repeat(500) }] }]);
    expect(parca).toHaveLength(220);
  });
});

describe("terim sorgu şekli", () => {
  it("tr / en / aliases üzerinde büyük-küçük duyarsız $or üretir", () => {
    const filtre = terimFiltresi("gömme") as {
      $or: { tr?: RegExp; en?: RegExp; aliases?: RegExp }[];
    };
    expect(filtre.$or).toHaveLength(3);
    expect(Object.keys(filtre.$or[0] ?? {})).toEqual(["tr"]);
    expect(Object.keys(filtre.$or[1] ?? {})).toEqual(["en"]);
    expect(Object.keys(filtre.$or[2] ?? {})).toEqual(["aliases"]);
    expect(filtre.$or[0]?.tr?.flags).toBe("i");
    expect(filtre.$or[0]?.tr?.test("Gömme vektörü")).toBe(true);
  });

  it("desen karakterleri kaçışlanır", () => {
    const filtre = terimFiltresi("c++") as { $or: { tr?: RegExp }[] };
    expect(filtre.$or[0]?.tr?.source).toBe("c\\+\\+");
  });
});

describe("sözlük harf grupları", () => {
  it("Türkçe büyük harfe göre gruplar (i → İ, ı → I)", () => {
    expect(harfAnahtari("ince ayar")).toBe("İ");
    expect(harfAnahtari("ışın")).toBe("I");
    expect(harfAnahtari("çıkarım")).toBe("Ç");
  });

  it("alfabe dışı başlangıçlar # grubuna düşer", () => {
    expect(harfAnahtari("3B model")).toBe("#");
    expect(harfAnahtari("Q-öğrenme")).toBe("#");
    expect(harfAnahtari("")).toBe("#");
  });

  it("çıpa id'si ASCII slug üretir ve çakışan harfleri ayırır", () => {
    expect(harfCipasi("C")).toBe("harf-c");
    expect(harfCipasi("Ç")).toBe("harf-c-2"); // C ile aynı tabana düşer
    expect(harfCipasi("I")).toBe("harf-i");
    expect(harfCipasi("İ")).toBe("harf-i-2");
    expect(harfCipasi("#")).toBe("harf-diger");
  });

  it("29 harfin tamamı benzersiz çapa üretir (id çakışması yok)", () => {
    const harfler = [..."ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ"];
    const cipalar = harfler.map(harfCipasi);
    expect(new Set(cipalar).size).toBe(harfler.length);
  });

  it("grupları ve grup içini Türkçe sıraya sokar, # sona gider", () => {
    const gruplar = harfleGrupla([
      { tr: "Zaman serisi" },
      { tr: "3B görü" },
      { tr: "Çıkarım" },
      { tr: "Ajan" },
      { tr: "Araç çağırma" },
    ]);
    expect(gruplar.map((g) => g.harf)).toEqual(["A", "Ç", "Z", "#"]);
    expect(gruplar[0]?.terimler.map((t) => t.tr)).toEqual(["Ajan", "Araç çağırma"]);
  });

  it("boş listede boş dizi döner", () => {
    expect(harfleGrupla([])).toEqual([]);
  });
});
