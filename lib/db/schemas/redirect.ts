import type { WithId } from "mongodb";
import { z } from "zod";
import type { IndexTanimi } from "./ortak";

// BRIEF §4.2 redirects — slug değişince 301/308 kaydı zorunlu (§2.2)
export const redirectSema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  code: z.union([z.literal(301), z.literal(308)]),
  createdAt: z.date(),
});

export type Redirect = z.infer<typeof redirectSema>;
export type RedirectDoc = WithId<Redirect>;

export const redirectIndexes: IndexTanimi[] = [{ key: { from: 1 }, options: { unique: true } }];
