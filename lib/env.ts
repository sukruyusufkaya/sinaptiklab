import { z } from "zod";

/**
 * Ortam değişkenlerinin tek doğrulanmış girişi (BRIEF §14/2: doğrulanmamış
 * process.env erişimi yasak). Sunucu tarafında import edilir; client bundle'a
 * yalnızca NEXT_PUBLIC_* değerleri sızabilir.
 *
 * MONGODB_* Faz 1'de opsiyoneldir: değer yoksa uygulama ayağa kalkar, DB
 * gerektiren yol `getDb()` içinde anlaşılır bir hatayla durur.
 */
const envSema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_SITE_URL: z.url().default("https://sinaptiklab.com"),
  MONGODB_URI: z.string().min(1).optional(),
  MONGODB_DB: z.string().min(1).default("sinaptiklab"),
  // Geçici /admin koruması (ADR 0007) — Faz 7'de Auth.js rol sistemiyle değişecek
  ADMIN_USER: z.string().min(1).optional(),
  ADMIN_PASS: z.string().min(8).optional(),
  // IndexNow anahtarı (public/<key>.txt ile eşleşir; yoksa bildirim atlanır)
  INDEXNOW_KEY: z.string().min(8).optional(),
});

/**
 * CI ortamları tanımsız secret'ları BOŞ STRING olarak geçirir (GitHub Actions
 * `env: X: ${{ secrets.X }}`); boş string "değer yok" sayılır ki optional ve
 * default'lar doğru işlesin.
 */
const bosluklariTemizle = (deger: string | undefined) =>
  deger === undefined || deger.trim() === "" ? undefined : deger;

const sonuc = envSema.safeParse({
  NODE_ENV: bosluklariTemizle(process.env.NODE_ENV),
  NEXT_PUBLIC_SITE_URL: bosluklariTemizle(process.env.NEXT_PUBLIC_SITE_URL),
  MONGODB_URI: bosluklariTemizle(process.env.MONGODB_URI),
  MONGODB_DB: bosluklariTemizle(process.env.MONGODB_DB),
  ADMIN_USER: bosluklariTemizle(process.env.ADMIN_USER),
  ADMIN_PASS: bosluklariTemizle(process.env.ADMIN_PASS),
  INDEXNOW_KEY: bosluklariTemizle(process.env.INDEXNOW_KEY),
});

if (!sonuc.success) {
  throw new Error(
    `Ortam değişkenleri geçersiz:\n${JSON.stringify(z.treeifyError(sonuc.error), null, 2)}`,
  );
}

export const env = sonuc.data;
export type Env = typeof env;
