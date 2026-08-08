import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
    coverage: {
      provider: "v8",
      // Kapsam saf mantık katmanını ölçer (Faz 2 DoD ≥ %70). Dışlananlar birim
      // testle anlamlı ölçülemeyen yapıştırıcı katmanlardır ve E2E ile test edilir:
      // mongodb/queries/actions → DB + next/cache; fonts → next/font build-time;
      // env → import anında parse (testte içe aktarım yeter, dallar CI ortamına bağlı).
      include: ["lib/**"],
      exclude: [
        "lib/mongodb.ts",
        "lib/fonts.ts",
        "lib/env.ts",
        "lib/db/queries/**",
        "lib/editorial/actions.ts",
        "lib/seo/indexnow.ts", // ağ yapıştırıcısı (en-iyi-çaba fetch)
        "lib/og.tsx", // satori/ImageResponse görseli — CI curl'i doğrular
      ],
      thresholds: {
        statements: 70,
        lines: 70,
        functions: 70,
        branches: 50,
      },
    },
  },
});
