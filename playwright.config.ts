import { defineConfig, devices } from "@playwright/test";

const CI = Boolean(process.env["CI"]);

/**
 * E2E testleri üretim build'ine karşı koşar: önce `npm run build` çalıştırılmış
 * olmalı (CI'da ayrı adım; yerelde de build sonrası `npm run test:e2e`).
 */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  reporter: CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3100",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run start -- -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: !CI,
    timeout: 120_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
