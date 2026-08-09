import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Kapsam testi: BRIEF §2.2 URL şemasında AÇIK olması gereken her rota
 * gerçekten 200 dönüyor mu, ve her sayfa tipinde axe temiz mi.
 * Sonraki fazlara ait rotalar (forum, kurs, patika, giriş) bilinçli olarak
 * listede değildir — açıldıklarında buraya eklenir.
 */

// DB'siz ortamda da 200 dönmesi gereken rotalar (içerik gerektirmez)
const HER_ZAMAN = [
  "/",
  "/konu",
  "/ara",
  "/sozluk",
  "/bulten",
  "/makale",
  "/rehber",
  "/uygulama",
  "/hakkinda",
  "/iletisim",
  "/editoryal-politika",
  "/kunye",
  "/gizlilik",
  "/kvkk-aydinlatma",
  "/cerez-politikasi",
  "/kullanim-sartlari",
] as const;

// Makine okunabilir yüzeyler (BRIEF §8.1)
const MAKINE = ["/robots.txt", "/sitemap.xml", "/feed.xml", "/atom.xml", "/feed.json", "/llms.txt"] as const;

test.describe("rota kapsamı", () => {
  for (const yol of HER_ZAMAN) {
    test(`${yol} → 200`, async ({ request }) => {
      const yanit = await request.get(yol);
      expect(yanit.status(), yol).toBe(200);
    });
  }

  for (const yol of MAKINE) {
    test(`${yol} → 200 (makine yüzeyi)`, async ({ request }) => {
      const yanit = await request.get(yol);
      expect(yanit.status(), yol).toBe(200);
    });
  }

  test("bilinmeyen rota 404 döner", async ({ request }) => {
    expect((await request.get("/kesinlikle-olmayan-bir-yol")).status()).toBe(404);
  });
});

test.describe("erişilebilirlik taraması (tüm sayfa tipleri)", () => {
  // İçerik gerektiren sayfalar DB'siz ortamda boş görünür ama yine de
  // erişilebilir olmalı; bu yüzden hepsi taranır.
  const TARANACAK = [
    "/",
    "/konu",
    "/ara",
    "/sozluk",
    "/bulten",
    "/makale",
    "/hakkinda",
    "/kvkk-aydinlatma",
  ] as const;

  for (const yol of TARANACAK) {
    test(`${yol} axe ihlali yok`, async ({ page }) => {
      await page.goto(yol);
      const sonuc = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(sonuc.violations, yol).toEqual([]);
    });
  }
});

test.describe("mobil taşma kontrolü", () => {
  const MOBIL_YOLLAR = ["/", "/konu", "/sozluk", "/hakkinda", "/bulten"] as const;

  for (const yol of MOBIL_YOLLAR) {
    test(`${yol} 375px'te yatay taşma yok`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(yol);
      const tasma = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(tasma, yol).toBeLessThanOrEqual(0);
    });
  }
});
