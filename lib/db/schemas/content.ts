import type { WithId } from "mongodb";
import { z } from "zod";
import { kaynakSema, objectIdSema, type IndexTanimi } from "./ortak";

// BRIEF §4.1 — tüm yayın türleri tek koleksiyonda, `type` ile ayrışır
export const icerikTuruSema = z.enum([
  "article",
  "guide",
  "tutorial",
  "lab",
  "tool",
  "benchmark",
  "case",
  "compliance",
  "issue",
]);
export const seviyeSema = z.enum(["giris", "orta", "ileri", "uzman"]);
export const durumSema = z.enum(["draft", "in_review", "scheduled", "published", "archived"]);

export const contentSema = z.object({
  type: icerikTuruSema,
  slug: z.string().min(1),
  title: z.string().min(1),
  dek: z.string(),
  answerFirst: z.string(),
  body: z.string(),
  excerptHtml: z.string(),
  level: seviyeSema,
  pillar: z.string().min(1),
  clusters: z.array(z.string()),
  tags: z.array(z.string()),
  authors: z.array(objectIdSema),
  technicalReviewer: objectIdSema.nullable(),
  status: durumSema,
  publishedAt: z.date().nullable(),
  updatedAt: z.date(),
  lastVerifiedAt: z.date(),
  readingMinutes: z.number(),
  toc: z.array(z.object({ id: z.string(), text: z.string(), depth: z.number() })),
  faq: z.array(z.object({ q: z.string(), a: z.string() })),
  sources: z.array(kaynakSema).min(1), // §4.3 — kaynak zorunlu
  repro: z
    .object({
      repoUrl: z.string().optional(),
      notebookUrl: z.string().optional(),
      modelIds: z.array(z.string()).optional(),
      hardware: z.string().optional(),
      runDate: z.date().optional(),
      approxCostUsd: z.number().optional(),
    })
    .nullable(),
  relatedManual: z.array(objectIdSema),
  embedding: z.array(z.number()), // boş olabilir; 1536 kontrolü yayın anında
  seo: z
    .object({
      title: z.string(),
      description: z.string(),
      canonical: z.string(),
      noindex: z.boolean(),
      ogImageOverride: z.string(),
    })
    .partial(),
  i18n: z.object({
    lang: z.enum(["tr", "en"]),
    translationOf: objectIdSema.optional(),
  }),
  changelog: z.array(
    z.object({
      at: z.date(),
      by: objectIdSema,
      note: z.string(),
      kind: z.enum(["minor", "major", "correction"]),
    }),
  ),
  metrics: z
    .object({
      views: z.number().default(0),
      avgScrollDepth: z.number().default(0),
      aiReferrals: z.number().default(0),
    })
    .default({ views: 0, avgScrollDepth: 0, aiReferrals: 0 }),
  version: z.number().int(),
});

export type Content = z.infer<typeof contentSema>;
export type ContentDoc = WithId<Content>;

export const contentIndexes: IndexTanimi[] = [
  { key: { slug: 1 }, options: { unique: true } },
  { key: { status: 1, publishedAt: -1 } },
  { key: { pillar: 1, status: 1, publishedAt: -1 } },
  { key: { tags: 1 } },
  { key: { type: 1, status: 1 } },
  { key: { "i18n.lang": 1, "i18n.translationOf": 1 } },
];
