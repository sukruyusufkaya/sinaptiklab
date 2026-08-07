import { describe, expect, it } from "vitest";
import { slugla } from "../../lib/slug";

describe("slugla", () => {
  it("stop-word'leri bağımsız kelimeyken düşürür", () => {
    expect(slugla("Büyük Dil Modelleri ve RAG")).toBe("buyuk-dil-modelleri-rag");
  });

  it("İ→i dönüşümü yapar ve apostrofu düşürür", () => {
    expect(slugla("İstanbul'da LLM Eğitimi")).toBe("istanbulda-llm-egitimi");
  });

  it("Türkçe karakter haritasının tamamını uygular", () => {
    expect(slugla("ığĞÜüŞşÇçÖö")).toBe("igguussccoo");
  });

  it("60 karakter sınırını kelime sınırında keser", () => {
    const girdi = Array.from({ length: 10 }, () => "abcdefghij").join(" ");
    const sonuc = slugla(girdi);
    expect(sonuc).toBe("abcdefghij-abcdefghij-abcdefghij-abcdefghij-abcdefghij");
    expect(sonuc.length).toBeLessThanOrEqual(60);
    expect(sonuc.endsWith("-")).toBe(false);
    // hiçbir kelime ortadan bölünmemiş olmalı
    expect(sonuc.split("-").every((k) => k === "abcdefghij")).toBe(true);
  });

  it("kelime İÇİNDEKİ stop-word dizisini korur", () => {
    expect(slugla("veri bilimi ile makine")).toBe("veri-bilimi-makine");
  });

  it("mı/mi soru eklerini bağımsız kelimeyken düşürür", () => {
    expect(slugla("RAG mı fine-tuning mi")).toBe("rag-fine-tuning");
  });

  it("tamamı stop-word olan girdide boş dönmez", () => {
    expect(slugla("ve")).toBe("ve");
  });

  it("alfanumerik içermeyen girdide boş string döner", () => {
    expect(slugla("!!! ???")).toBe("");
  });

  it("aksanlı latin karakterleri NFD ile soyar", () => {
    expect(slugla("Café Résumé")).toBe("cafe-resume");
  });
});
