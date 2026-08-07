import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("iskelet dumanı testi", () => {
  test("ana sayfa yükleniyor ve dili Türkçe", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "tr");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Saha verisi");
    await expect(page.getByRole("navigation", { name: "Ana gezinme" })).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });

  test("tema anahtarı çalışıyor ve tercih kalıcı", async ({ page }) => {
    await page.goto("/");
    const anahtar = page.getByRole("button", { name: /tema/i });
    await anahtar.click();
    const secilen = await page.locator("html").getAttribute("data-theme");
    expect(secilen === "dark" || secilen === "light").toBe(true);
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", secilen ?? "");
  });

  test("skip-link klavye ile erişilebilir", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "İçeriğe atla" })).toBeFocused();
  });

  test("404 sayfası markalı", async ({ page }) => {
    const yanit = await page.goto("/boyle-bir-sayfa-yok");
    expect(yanit?.status()).toBe(404);
    await expect(page.getByText("SİNYAL YOK — 404")).toBeVisible();
  });

  test("erişilebilirlik: axe ihlali yok (açık ve koyu tema)", async ({ page }) => {
    await page.goto("/");
    const acik = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(acik.violations).toEqual([]);

    await page.getByRole("button", { name: /tema/i }).click();
    // Link rengi 120ms geçişle değişir; axe ara (interpolasyon) rengini
    // yakalamasın diye geçişin bitmesi beklenir.
    await page.waitForTimeout(300);
    const koyu = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(koyu.violations).toEqual([]);
  });
});
