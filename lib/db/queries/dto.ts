import type { AuthorDoc, ContentDoc } from "@/lib/db/schemas";

/**
 * Okuma yolları ISR önbelleğinden (unstable_cache) geçer; önbellek serileştirme
 * sınırında ObjectId/Date örnekleri düz nesneye dönüşüp tip yalanı üretir.
 * Bu yüzden sorgu katmanı dışarıya YALNIZCA düz-serileştirilebilir DTO döndürür
 * (id: string, tarihler: ISO string).
 */

export interface YazarKartiDTO {
  id: string;
  slug: string;
  name: string;
  title: string;
  avatar: string;
}

/** Yazar sayfası (E-E-A-T) + Person JSON-LD girdisi — AuthorDoc'un düz hâli. */
export interface YazarDetayDTO {
  id: string;
  slug: string;
  name: string;
  title: string;
  bio: string;
  longBio: string;
  avatar: string;
  credentials: string[];
  sameAs: string[];
  expertise: string[];
  employer: string;
}

export interface IcerikOzetDTO {
  id: string;
  type: ContentDoc["type"];
  slug: string;
  title: string;
  dek: string;
  level: ContentDoc["level"];
  pillar: string;
  clusters: string[];
  tags: string[];
  excerptHtml: string;
  readingMinutes: number;
  publishedAt: string | null;
  updatedAt: string;
  lastVerifiedAt: string;
}

export interface IcerikDetayDTO extends IcerikOzetDTO {
  answerFirst: string;
  body: string;
  toc: { id: string; text: string; depth: number }[];
  faq: { q: string; a: string }[];
  sources: {
    label: string;
    url: string;
    publisher: string;
    accessedAt: string;
    kind: string;
  }[];
  repro: {
    repoUrl?: string;
    notebookUrl?: string;
    modelIds?: string[];
    hardware?: string;
    runDate?: string;
    approxCostUsd?: number;
  } | null;
  seo: ContentDoc["seo"];
  lang: "tr" | "en";
  changelog: { at: string; note: string; kind: "minor" | "major" | "correction" }[];
  version: number;
  yazarlar: YazarKartiDTO[];
  teknikEditor: YazarKartiDTO | null;
}

export function yazarDetayDTO(doc: AuthorDoc): YazarDetayDTO {
  return {
    id: doc._id.toHexString(),
    slug: doc.slug,
    name: doc.name,
    title: doc.title,
    bio: doc.bio,
    longBio: doc.longBio,
    avatar: doc.avatar,
    credentials: doc.credentials,
    sameAs: doc.sameAs,
    expertise: doc.expertise,
    employer: doc.employer,
  };
}

export function yazarKartiDTO(doc: AuthorDoc): YazarKartiDTO {
  return {
    id: doc._id.toHexString(),
    slug: doc.slug,
    name: doc.name,
    title: doc.title,
    avatar: doc.avatar,
  };
}

export function icerikOzetDTO(doc: ContentDoc): IcerikOzetDTO {
  return {
    id: doc._id.toHexString(),
    type: doc.type,
    slug: doc.slug,
    title: doc.title,
    dek: doc.dek,
    level: doc.level,
    pillar: doc.pillar,
    clusters: doc.clusters,
    tags: doc.tags,
    excerptHtml: doc.excerptHtml,
    readingMinutes: doc.readingMinutes,
    publishedAt: doc.publishedAt ? doc.publishedAt.toISOString() : null,
    updatedAt: doc.updatedAt.toISOString(),
    lastVerifiedAt: doc.lastVerifiedAt.toISOString(),
  };
}

export function icerikDetayDTO(
  doc: ContentDoc,
  yazarlar: AuthorDoc[],
  teknikEditor: AuthorDoc | null,
): IcerikDetayDTO {
  return {
    ...icerikOzetDTO(doc),
    answerFirst: doc.answerFirst,
    body: doc.body,
    toc: doc.toc,
    faq: doc.faq,
    sources: doc.sources.map((k) => ({
      label: k.label,
      url: k.url,
      publisher: k.publisher,
      accessedAt: k.accessedAt.toISOString(),
      kind: k.kind,
    })),
    repro: doc.repro
      ? {
          ...doc.repro,
          runDate: doc.repro.runDate ? doc.repro.runDate.toISOString() : undefined,
        }
      : null,
    seo: doc.seo,
    lang: doc.i18n.lang,
    changelog: doc.changelog.map((c) => ({
      at: c.at.toISOString(),
      note: c.note,
      kind: c.kind,
    })),
    version: doc.version,
    yazarlar: yazarlar.map(yazarKartiDTO),
    teknikEditor: teknikEditor ? yazarKartiDTO(teknikEditor) : null,
  };
}
