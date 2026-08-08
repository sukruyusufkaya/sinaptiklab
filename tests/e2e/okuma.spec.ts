import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Faz 3 DoD — gerçek makalede okuma deneyimi: axe 0 ihlal (çift tema),
// sinyal izi bölüm haritası klavyeyle çalışır, reduced-motion'da anlık
// atlama, mobilde iz gizli + üst bant var, kenar notları xl'de görünür.

const MAKALE = "/rehber/rag-nedir";

test.describe("okuma deneyimi (gerçek makale)", () => {
  test("erişilebilirlik: makalede axe ihlali yok (açık + koyu)", async ({ page }) => {
    await page.goto(MAKALE);
    const acik = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(acik.violations).toEqual([]);

    await page.emulateMedia({ colorScheme: "dark" });
    await page.waitForTimeout(300);
    const koyu = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(koyu.violations).toEqual([]);
  });

  test("sinyal izi: bölüm haritası var, klavye + reduced-motion ile gezilir", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(MAKALE);

    const harita = page.getByRole("navigation", { name: "Bölüm haritası" });
    await expect(harita).toBeVisible();
    const spikeler = harita.getByRole("link");
    expect(await spikeler.count()).toBeGreaterThanOrEqual(3);

    // klavye ile odaklan ve etkinleştir → reduced-motion'da ANLIK atlama
    const hedef = spikeler.nth(2);
    const hedefId = await hedef.getAttribute("href");
    await hedef.focus();
    await expect(hedef).toBeFocused();
    await hedef.press("Enter");
    await page.waitForTimeout(200);
    expect(page.url()).toContain(hedefId ?? "");
    const kaydi = await page.evaluate(() => window.scrollY);
    expect(kaydi).toBeGreaterThan(500);
  });

  test("okuma ilerlemesi iz dolgusuna yansıyor", async ({ page }) => {
    await page.goto(MAKALE);
    const dolgu = page.locator('nav[aria-label="Bölüm haritası"] svg path').nth(1);
    const bastaOffset = Number(await dolgu.getAttribute("stroke-dashoffset"));
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(300);
    const sonraOffset = Number(await dolgu.getAttribute("stroke-dashoffset"));
    expect(sonraOffset).toBeLessThan(bastaOffset);
  });

  test("mobilde iz gizli, üst ilerleme bandı var, yatay taşma yok", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(MAKALE);
    await expect(page.getByRole("navigation", { name: "Bölüm haritası" })).toBeHidden();
    const bant = page.locator("div.fixed.inset-x-0.top-0");
    await expect(bant).toBeAttached();
    const tasma = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(tasma).toBeLessThanOrEqual(0);
  });

  test("kenar notları xl'de görünür, mobilde gizli", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(MAKALE);
    const notlar = page.locator(".kenar-notu");
    expect(await notlar.count()).toBeGreaterThanOrEqual(1);
    await expect(notlar.first()).toBeVisible();

    await page.setViewportSize({ width: 375, height: 812 });
    await expect(notlar.first()).toBeHidden();
  });

  test("klavye ile makale gezilebilir: skip-link → içerik → kaynak çapası", async ({ page }) => {
    await page.goto(MAKALE);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "İçeriğe atla" })).toBeFocused();
    // gövdedeki ilk dipnot linkine odaklanıp etkinleştir → kaynak listesine iner
    const dipnot = page.locator('#icerik-govde sup a[href^="#kaynak-"]').first();
    await dipnot.focus();
    await dipnot.press("Enter");
    await page.waitForTimeout(300);
    expect(page.url()).toMatch(/#kaynak-\d+$/);
  });
});
