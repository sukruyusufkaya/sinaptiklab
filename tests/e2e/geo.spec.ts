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
