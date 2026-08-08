import { expect, test } from "@playwright/test";

/**
 * /admin Basic Auth kapısı (middleware.ts, ADR 0007). Kimlik bilgileri ortamdan
 * gelir; Playwright süreci .env dosyası OKUMAZ — ADMIN_USER/ADMIN_PASS ortamda
 * tanımlı değilse testler atlanır (CI'da secret olarak verilir).
 */
const KULLANICI = process.env["ADMIN_USER"];
const PAROLA = process.env["ADMIN_PASS"];
const KIMLIK_VAR = KULLANICI !== undefined && PAROLA !== undefined;

test.describe("admin paneli erişimi", () => {
  test.skip(!KIMLIK_VAR, "ADMIN_USER/ADMIN_PASS tanımlı değil — admin testleri atlandı");

  test.describe("kimlikli", () => {
    test.use({ httpCredentials: { username: KULLANICI ?? "", password: PAROLA ?? "" } });

    test("/admin 200 döner ve İçerikler görünür", async ({ page }) => {
      const yanit = await page.goto("/admin");
      expect(yanit?.status()).toBe(200);
      await expect(page.getByRole("heading", { name: "İçerikler" })).toBeVisible();
    });
  });

  // Ayrı test = ayrı context; httpCredentials bilinçli olarak YOK.
  test.describe("kimliksiz", () => {
    test("/admin kimliksiz istekte 401 döner", async ({ request }) => {
      const yanit = await request.get("/admin");
      expect(yanit.status()).toBe(401);
    });
  });
});
