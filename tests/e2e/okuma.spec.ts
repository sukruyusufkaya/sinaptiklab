import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Faz 3 DoD — gerçek makalede okuma deneyimi: axe 0 ihlal (çift tema),
// sinyal izi bölüm haritası klavyeyle çalışır, reduced-motion'da anlık
// atlama, mobilde iz gizli + üst bant var, kenar notları xl'de görünür.

const MAKALE = "/rehber/rag-nedir";

test.describe("okuma deneyimi (gerçek makale)", () => {
  // Bu testler tohum makaleye (DB) ihtiyaç duyar; MONGODB_URI'siz ortamda
  // (örn. secret bağlanmamış CI) sayfa 404 döner → suite atlanır.
  let makaleVar: boolean | undefined;
  test.beforeEach(async ({ request }) => {
    makaleVar ??= (await request.get(MAKALE)).status() === 200;
    test.skip(!makaleVar, "tohum makale yayında değil — DB erişimi olmayan ortam");
  });

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
    // ölçüm bir rAF sonrasında dolar — spike'ların oluşmasını bekle
    const spikeler = harita.getByRole("link");
    await expect.poll(() => spikeler.count()).toBeGreaterThanOrEqual(3);

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
    // dolgu path'i ilk ölçümden bir kare sonra oluşur — var olmasını bekle
    await expect(dolgu).toBeAttached();
    const bastaOffset = Number(await dolgu.getAttribute("stroke-dashoffset"));
    expect(Number.isFinite(bastaOffset)).toBe(true);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await expect
      .poll(async () => Number(await dolgu.getAttribute("stroke-dashoffset")))
      .toBeLessThan(bastaOffset);
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
    // Sabit bekleme yerine gerçek sinyal: çapa URL'e yazılana kadar bekle.
    // (waitForTimeout yüklü makinede dönüşümlü olarak erken bitiyordu.)
    await page.waitForURL(/#kaynak-\d+$/);
  });
});

test.describe("konu haritası (DB gerekli)", () => {
  // Sayfa DB'siz de 200 döner (dayanıklı prerender); bu yüzden sonda durum
  // koduna değil, gerçek pillar kartının varlığına bakar.
  let konuVar: boolean | undefined;
  test.beforeEach(async ({ request }) => {
    if (konuVar === undefined) {
      const yanit = await request.get("/konu");
      konuVar = yanit.status() === 200 && (await yanit.text()).includes('href="/konu/');
    }
    test.skip(!konuVar, "topics tohumlanmamış — DB erişimi olmayan ortam");
  });

  test("12 pillar listelenir, hub açılır, axe temiz", async ({ page }) => {
    await page.goto("/konu");
    const kartlar = page.locator('a[href^="/konu/"]');
    await expect.poll(() => kartlar.count()).toBe(12);
    await kartlar.first().click();
    // İstemci tarafı geçiş bitmeden axe koşarsa yarı takas edilmiş DOM'u
    // ölçüyor ("<title> boş" dahil 40+ sahte ihlal). Üç gerçek sinyal:
    // URL pillar rotasına döndü, belge başlığı yazıldı, hub'ın kendi
    // başlığı basıldı.
    await page.waitForURL(/\/konu\/[a-z0-9-]+$/);
    await expect(page).toHaveTitle(/.+/);
    await expect(page.getByRole("heading", { name: "Yayındaki içerik" })).toBeVisible();
    const sonuc = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(sonuc.violations).toEqual([]);
  });
});

test.describe("testler modülü (DB gerekli)", () => {
  let testSlug: string | null = null;
  test.beforeEach(async ({ request }) => {
    if (testSlug === null) {
      const govde = await (await request.get("/testler")).text();
      testSlug = /href="\/testler\/([a-z0-9-]+)"/.exec(govde)?.[1] ?? "";
    }
    test.skip(testSlug === "", "test tohumlanmamış — DB erişimi olmayan ortam");
  });

  test("soru, şık ve gerekçe JS'siz de HTML'de gelir", async ({ page }) => {
    await page.goto(`/testler/${testSlug}`);
    // Sunucu render'ı: soru metni ve açıklama kaynakta olmalı (SEO + JS'siz okuma)
    const govde = await page.content();
    expect(govde).toContain("Açıklama");
    await expect(page.getByRole("radio").first()).toBeVisible();
    // Quiz şeması zengin sonuç adayı
    expect(govde).toContain('"@type":"Quiz"');
    expect(govde).toContain('"@type":"Question"');
  });

  test("şık işaretlenince soru kilitlenir ve gerekçe açılır", async ({ page }) => {
    await page.goto(`/testler/${testSlug}`);
    const ilkSik = page.getByRole("radio").first();
    await ilkSik.check();
    // Aynı sorunun tüm şıkları kilitlenir — tahmin sonrası düzeltme olmaz
    await expect(ilkSik).toBeDisabled();
    await expect(page.getByText(/^(Doğru\.|Yanlış\.)$/).first()).toBeVisible();
  });

  test("tüm sorular cevaplanınca sonuç görünür", async ({ page }) => {
    await page.goto(`/testler/${testSlug}`);
    const gruplar = page.locator("fieldset");
    const adet = await gruplar.count();
    for (let i = 0; i < adet; i++) {
      await gruplar.nth(i).getByRole("radio").first().check();
    }
    // Sonuç bloğu yalnız tüm sorular cevaplanınca basılır; kendi
    // düğmesiyle hedefle ("sonuç" kelimesi sayfada birden çok yerde geçiyor).
    await expect(page.getByRole("button", { name: /Baştan dene/ })).toBeVisible();
    // Skor satırı: N / M biçiminde, M soru sayısı
    await expect(
      page
        .locator("p")
        .filter({ hasText: `/ ${adet}` })
        .first(),
    ).toBeVisible();
  });

  test("erişilebilirlik: test sayfasında axe ihlali yok", async ({ page }) => {
    await page.goto(`/testler/${testSlug}`);
    const sonuc = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(sonuc.violations).toEqual([]);
  });
});
