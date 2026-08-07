import type { WithId } from "mongodb";
import { z } from "zod";
import type { IndexTanimi } from "./ortak";

// BRIEF §4.2 authors — Person JSON-LD kaynağı (E-E-A-T)
export const authorSema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  title: z.string(),
  bio: z.string(),
  longBio: z.string(),
  avatar: z.string(),
  credentials: z.array(z.string()),
  sameAs: z.array(z.url()),
  expertise: z.array(z.string()),
  employer: z.string(),
});

export type Author = z.infer<typeof authorSema>;
export type AuthorDoc = WithId<Author>;

export const authorIndexes: IndexTanimi[] = [{ key: { slug: 1 }, options: { unique: true } }];
