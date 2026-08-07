import type { WithId } from "mongodb";
import { z } from "zod";
import { kaynakSema, type IndexTanimi } from "./ortak";

// BRIEF §4.2 terms — kanonik Türkçe YZ sözlüğü + otomatik terim linkleme
export const termSema = z.object({
  slug: z.string().min(1),
  tr: z.string().min(1),
  en: z.string().min(1),
  aliases: z.array(z.string()),
  shortDef: z.string(), // maks 25 kelime — editoryal kontrol yayın anında
  longDef: z.string(), // MDX
  pillar: z.string(),
  related: z.array(z.string()),
  sources: z.array(kaynakSema),
});

export type Term = z.infer<typeof termSema>;
export type TermDoc = WithId<Term>;

export const termIndexes: IndexTanimi[] = [
  { key: { slug: 1 }, options: { unique: true } },
  { key: { pillar: 1 } },
];
