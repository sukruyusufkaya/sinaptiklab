import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MdxDerlemeHatasi, mdxDerle, okumaSuresi } from "../../lib/mdx/derle";

// İlk mdxDerle çağrısı Shiki highlighter'ını soğuk başlatır; CI/Windows'ta
// 5 sn'lik varsayılan süre yetmeyebilir.
describe("mdxDerle", { timeout: 60_000 }, () => {
  it("basit MDX'i derleyip render edilebilir içerik döner", async () => {
    const { icerik, toc } = await mdxDerle("# Merhaba\n\nSinaptiklab bir ölçüm laboratuvarıdır.");
    const html = renderToStaticMarkup(icerik);
    expect(html).toContain("Merhaba");
    expect(html).toContain("ölçüm laboratuvarıdır");
    expect(toc).toEqual([]); // H1 TOC'a girmez; yalnız H2/H3
  });

  it("H2/H3'e stabil Türkçe id verir ve TOC'u toplar", async () => {
    const kaynak = [
      "## Gömme Vektörleri",
      "",
      "Metin.",
      "",
      "### Çıkarım Süresi",
      "",
      "Metin.",
    ].join("\n");
    const { icerik, toc } = await mdxDerle(kaynak);
    const html = renderToStaticMarkup(icerik);

    expect(toc).toEqual([
      { id: "gomme-vektorleri", text: "Gömme Vektörleri", depth: 2 },
      { id: "cikarim-suresi", text: "Çıkarım Süresi", depth: 3 },
    ]);
    expect(html).toContain('<h2 id="gomme-vektorleri">');
    expect(html).toContain('<h3 id="cikarim-suresi">');
  });

  it("çakışan başlıklara -2/-3 eki verir", async () => {
    const kaynak = ["## Kurulum", "", "## Kurulum", "", "## Kurulum"].join("\n");
    const { toc } = await mdxDerle(kaynak);
    expect(toc.map((m) => m.id)).toEqual(["kurulum", "kurulum-2", "kurulum-3"]);
  });

  it("kod fence'lerini Shiki çift temayla vurgular ve [!code highlight] satırını işaretler", async () => {
    const kaynak = [
      "```ts",
      "const a = 1;",
      "const b = 2; // [!code highlight]",
      "const c = 3;",
      "```",
    ].join("\n");
    const { icerik } = await mdxDerle(kaynak);
    const html = renderToStaticMarkup(icerik);

    expect(html).toContain("shiki"); // Shiki çıktısı
    expect(html).toContain("--shiki-dark"); // defaultColor:false çift tema değişkenleri
    expect(html).toContain("highlighted"); // satır vurgusu sınıfı
    expect(html).not.toContain("[!code highlight]"); // notasyon çıktıdan temizlenir
  });

  it("özel MDX bileşenlerini haritadan render eder", async () => {
    const kaynak = "<KisaCevap>RAG, üretimden önce ölçülür.</KisaCevap>";
    const { icerik } = await mdxDerle(kaynak);
    const html = renderToStaticMarkup(icerik);
    // metin DOM'da küçük harf; büyük görünüm CSS (uppercase) ile
    expect(html).toContain("kısa cevap");
    expect(html).toContain("RAG, üretimden önce ölçülür.");
  });

  it("bozuk MDX'te satır bilgili MdxDerlemeHatasi fırlatır", async () => {
    const hata = await mdxDerle("# Başlık\n\n<KapanmayanEtiket>").then(
      () => null,
      (h: unknown) => h,
    );
    expect(hata).toBeInstanceOf(MdxDerlemeHatasi);
    if (hata instanceof MdxDerlemeHatasi) {
      expect(hata.message).toContain("MDX derlenemedi");
      expect(hata.message).toContain("satır 3");
      expect(hata.satir).toBe(3);
    }
  });

  it("konum bilgisi taşımayan bozuk MDX'te de MdxDerlemeHatasi fırlatır", async () => {
    // `>` bile yok: derleyici konumsuz "unexpected end of file" üretir.
    const hata = await mdxDerle("<Yarim").then(
      () => null,
      (h: unknown) => h,
    );
    expect(hata).toBeInstanceOf(MdxDerlemeHatasi);
    if (hata instanceof MdxDerlemeHatasi) {
      expect(hata.message).toContain("MDX derlenemedi");
      expect(hata.satir).toBeNull();
    }
  });
});

describe("okumaSuresi", () => {
  it("boş ve çok kısa metinde en az 1 döner", () => {
    expect(okumaSuresi("")).toBe(1);
    expect(okumaSuresi("tek cümle.")).toBe(1);
  });

  it("230 kelime/dakika üzerinden yuvarlar", () => {
    expect(okumaSuresi("kelime ".repeat(230))).toBe(1);
    expect(okumaSuresi("kelime ".repeat(700))).toBe(3); // 700/230 ≈ 3.04 → 3
  });

  it("kod bloklarını saymaz", () => {
    const kod = "```py\n" + "satir_kelimesi ".repeat(2000) + "\n```";
    const kaynak = "kelime ".repeat(100) + "\n\n" + kod + "\n\nson kelimeler";
    expect(okumaSuresi(kaynak)).toBe(1); // 102 kelime; kod bloğu hariç
  });
});

describe("diff notasyonu", () => {
  it("[!code ++] ve [!code --] satırlarına diff sınıfları basılır, işaret silinir", async () => {
    const kaynak = [
      "```ts",
      'const eski = "kaldir"; // [!code --]',
      'const yeni = "ekle"; // [!code ++]',
      "const normal = 1;",
      "```",
    ].join("\n");
    const { icerik } = await mdxDerle(kaynak);
    const html = renderToStaticMarkup(icerik);
    expect(html).toContain("diff-sil");
    expect(html).toContain("diff-ekle");
    expect(html).not.toContain("[!code");
  });
});
