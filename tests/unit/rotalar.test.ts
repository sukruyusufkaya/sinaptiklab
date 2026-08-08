import { describe, expect, it } from "vitest";
import { icerikYolu, seviyeEtiketi, turEtiketi } from "../../lib/rotalar";

describe("icerikYolu", () => {
  it("dokuz içerik türünün tamamını URL şemasına eşler (BRIEF §2.2)", () => {
    expect(icerikYolu("article", "abc")).toBe("/makale/abc");
    expect(icerikYolu("guide", "abc")).toBe("/rehber/abc");
    expect(icerikYolu("tutorial", "abc")).toBe("/uygulama/abc");
    expect(icerikYolu("lab", "abc")).toBe("/laboratuvar/abc");
    expect(icerikYolu("tool", "abc")).toBe("/arac/abc");
    expect(icerikYolu("benchmark", "abc")).toBe("/olcum/abc");
    expect(icerikYolu("case", "abc")).toBe("/vaka/abc");
    expect(icerikYolu("compliance", "abc")).toBe("/uyum/abc");
    expect(icerikYolu("issue", "abc")).toBe("/bulten/abc");
  });
});

describe("etiketler", () => {
  it("tür ve seviye etiketleri Türkçe", () => {
    expect(turEtiketi("article")).toBe("Makale");
    expect(turEtiketi("guide")).toBe("Rehber");
    expect(turEtiketi("tutorial")).toBe("Uygulama");
    expect(seviyeEtiketi("giris")).toBe("Giriş");
    expect(seviyeEtiketi("uzman")).toBe("Uzman");
  });
});
