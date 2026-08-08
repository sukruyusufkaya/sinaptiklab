import { unstable_cache } from "next/cache";
import type { Redirect } from "@/lib/db/schemas";
import { getDb } from "@/lib/mongodb";

/**
 * Slug değişimlerinde 301/308 kayıtları (BRIEF §2.2: slug değişirse redirect
 * zorunlu). İçerik rotaları notFound() öncesi buraya bakar; middleware'e
 * konmadı çünkü Edge runtime'da mongodb driver çalışmaz (Upstash cache'i
 * Faz 7+'da Redis geldiğinde middleware'e taşınabilir — şimdilik ISR tag'li
 * sorgu yeterli: yönlendirme kayıtları nadiren değişir).
 */

export const YONLENDIRME_TAG = "redirects";

async function yonlendirmeBulHam(from: string): Promise<Redirect | null> {
  const db = await getDb();
  return db.collection<Redirect>("redirects").findOne({ from });
}

/** Verilen yol için yönlendirme kaydı; `redirects` tag'iyle önbellekli. */
export function yonlendirmeBul(from: string): Promise<Redirect | null> {
  return unstable_cache(() => yonlendirmeBulHam(from), ["yonlendirme", from], {
    tags: [YONLENDIRME_TAG],
  })();
}

/** Rota kancaları için güvenli sürüm: DB yoksa/hata varsa null (404'e düşer). */
export async function guvenliYonlendirmeBul(from: string): Promise<string | null> {
  try {
    const kayit = await yonlendirmeBul(from);
    return kayit?.to ?? null;
  } catch {
    return null;
  }
}
