import type { WithId } from "mongodb";
import { z } from "zod";
import type { IndexTanimi } from "./ortak";

// BRIEF §4.2 topics — pillar/cluster ağacı; parent, üst düğümün slug'ı
export const topicSema = z.object({
  slug: z.string().min(1),
  kind: z.enum(["pillar", "cluster"]),
  parent: z.string().nullable(),
  title: z.string().min(1),
  intro: z.string(),
  seo: z
    .object({
      title: z.string(),
      description: z.string(),
      canonical: z.string(),
      noindex: z.boolean(),
      ogImageOverride: z.string(),
    })
    .partial(),
});

export type Topic = z.infer<typeof topicSema>;
export type TopicDoc = WithId<Topic>;

export const topicIndexes: IndexTanimi[] = [
  { key: { slug: 1 }, options: { unique: true } },
  { key: { kind: 1, parent: 1 } },
];
