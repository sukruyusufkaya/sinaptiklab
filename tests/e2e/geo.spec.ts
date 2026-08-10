import { expect, test } from "@playwright/test";

// Faz 5 DoD: YZ tarayıcı ajanları engellenmiyor (BRIEF §8.2 fiili doğrulama)
// + beacon ucu kayıt kabul ediyor + açık içerik API'si çalışıyor.

const YZ_AJANLARI = ["GPTBot/1.0", "ClaudeBot/1.0", "PerplexityBot/1.0"];

test.describe("YZ tarayıcı erişimi (§8.2)", () => {
  for (const ajan of YZ_AJANLARI) {
    test(`${ajan.split("/")[0]} ana sayfa ve konulara erişebiliyor`, async ({ request }) => {
      for (const yol of ["/", "/konu", "/robots.txt", "/llms.txt", "/feed.xml"]) {
        const yanit = await request.get(yol, { headers: { "User-Agent": ajan } });
        expect(yanit.status(), `${ajan} → ${yol}`).toBe(200);
      }
    });
  }
});

test.describe("olay beacon'ı", () => {
  test("geçerli kayıt 204, bozuk gövde de 204 (sessiz)", async ({ request }) => {
    const gecerli = await request.post("/api/olay", {
      data: { path: "/rehber/rag-nedir", referrerHost: "chatgpt.com" },
    });
    expect(gecerli.status()).toBe(204);

    const bozuk = await request.post("/api/olay", {
      data: { path: "javascript:alert(1)", referrerHost: "<x>" },
    });
    expect(bozuk.status()).toBe(204);
  });
});

test.describe("açık içerik API'si (DB gerekli)", () => {
  let veriVar: boolean | undefined;
  test.beforeEach(async ({ request }) => {
    if (veriVar === undefined) {
      const yanit = await request.get("/api/content?adet=1");
      veriVar = yanit.status() === 200 && ((await yanit.json()).ogeler?.length ?? 0) > 0;
    }
    test.skip(!veriVar, "içerik yok — DB erişimi olmayan ortam");
  });

  test("sayfalanmış liste ve md bağlantıları döner", async ({ request }) => {
    const yanit = await request.get("/api/content?adet=5&tur=guide");
    expect(yanit.status()).toBe(200);
    const govde = await yanit.json();
    expect(govde.ogeler.length).toBeGreaterThanOrEqual(1);
    const ilk = govde.ogeler[0];
    expect(ilk.tur).toBe("guide");
    expect(ilk.url).toContain("/rehber/");
    expect(ilk.mdUrl).toMatch(/\.md$/);
    const bozukTur = await request.get("/api/content?tur=olmayan");
    expect(bozukTur.status()).toBe(400);
  });
});

test.describe("llms.txt kapsamı (§8.1)", () => {
  test("konu, sözlük, arşiv ve makine uç noktalarını duyurur", async ({ request }) => {
    const yanit = await request.get("/llms.txt");
    expect(yanit.status()).toBe(200);
    expect(yanit.headers()["content-type"]).toContain("text/plain");
    const metin = await yanit.text();

    // llmstxt.org iskeleti
    expect(metin.startsWith("# Sinaptiklab")).toBe(true);
    expect(metin).toContain("\n> ");

    // Ajanın site yapısını çıkarabilmesi için gereken bölümler
    for (const bolum of ["## Konular", "## Sözlük", "## Arşivler", "## İçerik", "## Diğer"]) {
      expect(metin, bolum).toContain(bolum);
    }

    // Makine yüzeyleri: bir ajan MCP'yi llms.txt'ten keşfedebilmeli
    expect(metin).toContain("/api/mcp");
    expect(metin).toContain("/api/content");
    expect(metin).toContain("/llms-full.txt");
    expect(metin).toContain("/sitemap.xml");

    // Boş arşivler duyurulmaz (noindex + sitemap kararıyla tutarlı)
    expect(metin).not.toContain("(0 yayın)");
  });
});

test.describe("sözlüğün makine yüzeyleri (DB gerekli)", () => {
  let terimSlug: string | null = null;
  test.beforeEach(async ({ request }) => {
    if (terimSlug === null) {
      const yanit = await request.get("/llms.txt");
      const es = /\/sozluk\/([a-z0-9-]+)\)/.exec(await yanit.text());
      terimSlug = es?.[1] ?? "";
    }
    test.skip(terimSlug === "", "sözlük tohumlanmamış — DB erişimi olmayan ortam");
  });

  test("terimin .md yüzeyi ham Markdown döner", async ({ request }) => {
    const yanit = await request.get(`/sozluk/${terimSlug}.md`);
    expect(yanit.status()).toBe(200);
    expect(yanit.headers()["content-type"]).toContain("text/markdown");
    const metin = await yanit.text();
    expect(metin.startsWith("# ")).toBe(true);
    expect(metin).toContain("İngilizce:");
    expect(metin).toContain("Kanonik URL:");
    // HTML kabuğu sızmamalı
    expect(metin).not.toContain("<!DOCTYPE");
  });

  test("olmayan terim 404", async ({ request }) => {
    const yanit = await request.get("/sozluk/boyle-bir-terim-yok-12345.md");
    expect(yanit.status()).toBe(404);
  });

  test("sözlük indeksi DefinedTermSet basar", async ({ request }) => {
    const govde = await (await request.get("/sozluk")).text();
    expect(govde).toContain('"@type":"DefinedTermSet"');
    expect(govde).toContain('"@type":"BreadcrumbList"');
  });
});

test.describe("MCP araç yüzeyi (§8.1)", () => {
  const MCP_BASLIKLARI = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
  };

  test("beş araç duyurulur ve sözlük araçları yanıt verir", async ({ request }) => {
    const liste = await request.post("/api/mcp", {
      headers: MCP_BASLIKLARI,
      data: { jsonrpc: "2.0", id: 1, method: "tools/list" },
    });
    expect(liste.status()).toBe(200);
    const govde = await liste.text();
    for (const arac of [
      "icerik_ara",
      "icerik_oku",
      "konulari_listele",
      "sozluk_ara",
      "terim_oku",
    ]) {
      expect(govde, arac).toContain(`"name":"${arac}"`);
    }
  });
});
