// Fontsource paketlerindeki woff2 dosyalarını app/fonts/ altına kopyalar.
// Fontlar OFL lisanslıdır; lisans metinleri de birlikte kopyalanır.
// Çalıştır: npm run fonts:sync (bağımlılık sürümü değişince tekrar çalıştır).
import { copyFileSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const kok = join(dirname(fileURLToPath(import.meta.url)), "..");
const hedef = join(kok, "app", "fonts");
mkdirSync(hedef, { recursive: true });
for (const eski of readdirSync(hedef)) rmSync(join(hedef, eski));

// Varyant seçimi (boyut/tasarım dengesi, bkz. docs/ADR/0001):
// - Bricolage "standard" = wght+wdth+opsz (display; eksenler marka öğesi)
// - Newsreader "wght"    = yalnız ağırlık ekseni (gövde; opsz varsayılanı metin boyutu)
// - JetBrains Mono "wght"
const DOSYALAR = [
  [
    "@fontsource-variable/bricolage-grotesque",
    "files/bricolage-grotesque-latin-standard-normal.woff2",
  ],
  [
    "@fontsource-variable/bricolage-grotesque",
    "files/bricolage-grotesque-latin-ext-standard-normal.woff2",
  ],
  ["@fontsource-variable/bricolage-grotesque", "LICENSE"],
  ["@fontsource-variable/newsreader", "files/newsreader-latin-wght-normal.woff2"],
  ["@fontsource-variable/newsreader", "files/newsreader-latin-ext-wght-normal.woff2"],
  ["@fontsource-variable/newsreader", "files/newsreader-latin-wght-italic.woff2"],
  ["@fontsource-variable/newsreader", "files/newsreader-latin-ext-wght-italic.woff2"],
  ["@fontsource-variable/newsreader", "LICENSE"],
  ["@fontsource-variable/jetbrains-mono", "files/jetbrains-mono-latin-wght-normal.woff2"],
  ["@fontsource-variable/jetbrains-mono", "files/jetbrains-mono-latin-ext-wght-normal.woff2"],
  ["@fontsource-variable/jetbrains-mono", "LICENSE"],
];

for (const [paket, dosya] of DOSYALAR) {
  const kaynak = join(kok, "node_modules", paket, dosya);
  const ad = dosya === "LICENSE" ? `LICENSE-${paket.split("/")[1]}` : dosya.replace("files/", "");
  copyFileSync(kaynak, join(hedef, ad));
  console.log(`kopyalandı: ${ad}`);
}
console.log(`\n${DOSYALAR.length} dosya → app/fonts/`);
