import { unstable_cache } from "next/cache";
import type { Author } from "@/lib/db/schemas";
import { getDb } from "@/lib/mongodb";
import { ICERIK_LISTE_TAG } from "./contents";
import { yazarDetayDTO, type YazarDetayDTO } from "./dto";

/**
 * Yazar okuma yolları — /yazar/<slug> E-E-A-T sayfası (BRIEF §8.4). Yazar
 * belgeleri nadiren değişir; ayrı bir tag açmak yerine içerik yayın döngüsüyle
 * (ICERIK_LISTE_TAG) birlikte tazelenir.
 */

async function yazarBySlugHam(slug: string): Promise<YazarDetayDTO | null> {
  const db = await getDb();
  const doc = await db.collection<Author>("authors").findOne({ slug });
  return doc === null ? null : yazarDetayDTO(doc);
}

/** Slug ile yazar; bulunamazsa null (rota notFound basar). */
export function yazarBySlug(slug: string): Promise<YazarDetayDTO | null> {
  return unstable_cache(() => yazarBySlugHam(slug), ["yazar-by-slug", slug], {
    tags: [ICERIK_LISTE_TAG],
  })();
}
