import { ObjectId } from "mongodb";
import type { Author, AuthorDoc, Content, ContentDoc, Kaynak, Topic } from "@/lib/db/schemas";
import { getDb } from "@/lib/mongodb";

/**
 * Admin okuma yolları — public sorguların (contents.ts) aksine ÖNBELLEKSİZ:
 * panel her istekte taze veri görmeli (sayfalar force-dynamic). ObjectId/Date →
 * string dönüşümleri burada yapılır ki client bileşenlere düz props geçilsin.
 * Yazma yolları lib/editorial/actions.ts'te; burada yalnız okuma var.
 */

const OBJECT_ID_HEX = /^[0-9a-f]{24}$/i;

// ── Liste görünümü ───────────────────────────────────────────────────

export interface AdminIcerikOzeti {
  id: string;
  type: Content["type"];
  slug: string;
  title: string;
  status: Content["status"];
  updatedAt: string;
  publishedAt: string | null;
}

/** Tüm içerikler (her durum), skinny projection, son güncellenen önce. */
export async function tumIcerikler(): Promise<AdminIcerikOzeti[]> {
  const db = await getDb();
  const docs = await db
    .collection<Content>("contents")
    .find(
      {},
      { projection: { type: 1, slug: 1, title: 1, status: 1, updatedAt: 1, publishedAt: 1 } },
    )
    .sort({ updatedAt: -1 })
    .toArray();

  return docs.map((doc) => ({
    id: doc._id.toHexString(),
    type: doc.type,
    slug: doc.slug,
    title: doc.title,
    status: doc.status,
    updatedAt: doc.updatedAt.toISOString(),
    publishedAt: doc.publishedAt ? doc.publishedAt.toISOString() : null,
  }));
}

// ── Editör görünümü ──────────────────────────────────────────────────

export interface AdminKaynakDTO {
  label: string;
  url: string;
  publisher: string;
  accessedAt: string;
  kind: Kaynak["kind"];
}

export interface AdminReproDTO {
  repoUrl?: string;
  notebookUrl?: string;
  modelIds?: string[];
  hardware?: string;
  runDate?: string;
  approxCostUsd?: number;
}

/** Editör formunun okuduğu düz gösterim: ObjectId → hex, Date → ISO string. */
export interface AdminIcerikDTO {
  id: string;
  type: Content["type"];
  slug: string;
  title: string;
  dek: string;
  answerFirst: string;
  body: string;
  level: Content["level"];
  pillar: string;
  clusters: string[];
  tags: string[];
  authors: string[];
  technicalReviewer: string | null;
  status: Content["status"];
  publishedAt: string | null;
  updatedAt: string;
  lastVerifiedAt: string;
  faq: { q: string; a: string }[];
  sources: AdminKaynakDTO[];
  repro: AdminReproDTO | null;
  relatedManual: string[];
  seo: Content["seo"];
  i18n: { lang: "tr" | "en"; translationOf?: string };
}

function adminIcerikDTO(doc: ContentDoc): AdminIcerikDTO {
  return {
    id: doc._id.toHexString(),
    type: doc.type,
    slug: doc.slug,
    title: doc.title,
    dek: doc.dek,
    answerFirst: doc.answerFirst,
    body: doc.body,
    level: doc.level,
    pillar: doc.pillar,
    clusters: doc.clusters,
    tags: doc.tags,
    authors: doc.authors.map((yazar) => yazar.toHexString()),
    technicalReviewer: doc.technicalReviewer ? doc.technicalReviewer.toHexString() : null,
    status: doc.status,
    publishedAt: doc.publishedAt ? doc.publishedAt.toISOString() : null,
    updatedAt: doc.updatedAt.toISOString(),
    lastVerifiedAt: doc.lastVerifiedAt.toISOString(),
    faq: doc.faq,
    sources: doc.sources.map((kaynak) => ({
      label: kaynak.label,
      url: kaynak.url,
      publisher: kaynak.publisher,
      accessedAt: kaynak.accessedAt.toISOString(),
      kind: kaynak.kind,
    })),
    repro: doc.repro
      ? {
          ...doc.repro,
          runDate: doc.repro.runDate ? doc.repro.runDate.toISOString() : undefined,
        }
      : null,
    relatedManual: doc.relatedManual.map((ilgili) => ilgili.toHexString()),
    seo: doc.seo,
    i18n: {
      lang: doc.i18n.lang,
      translationOf: doc.i18n.translationOf ? doc.i18n.translationOf.toHexString() : undefined,
    },
  };
}

/** id ile içerik — HER durumda (taslak dahil); geçersiz/bulunamayan id → null. */
export async function icerikById(id: string): Promise<AdminIcerikDTO | null> {
  if (!OBJECT_ID_HEX.test(id)) return null;
  const db = await getDb();
  const doc = await db.collection<Content>("contents").findOne({ _id: new ObjectId(id) });
  return doc === null ? null : adminIcerikDTO(doc);
}

// ── Önizleme ─────────────────────────────────────────────────────────

export interface OnizlemeVerisi {
  doc: ContentDoc;
  yazarlar: AuthorDoc[];
  teknikEditor: AuthorDoc | null;
}

/**
 * Önizleme sayfası için HAM belge + yazar belgeleri (icerikDetayDTO'ya girdi).
 * Önbellek sınırından geçmediği için ObjectId/Date burada serileştirilmez.
 */
export async function icerikOnizlemeVerisi(id: string): Promise<OnizlemeVerisi | null> {
  if (!OBJECT_ID_HEX.test(id)) return null;
  const db = await getDb();
  const doc = await db.collection<Content>("contents").findOne({ _id: new ObjectId(id) });
  if (doc === null) return null;

  const aranacak = doc.technicalReviewer ? [...doc.authors, doc.technicalReviewer] : doc.authors;
  const kisiler =
    aranacak.length > 0
      ? await db
          .collection<Author>("authors")
          .find({ _id: { $in: aranacak } })
          .toArray()
      : [];

  const kisiBul = (kisiId: ObjectId) => kisiler.find((k) => k._id.equals(kisiId)) ?? null;
  const yazarlar = doc.authors.map(kisiBul).filter((kisi): kisi is AuthorDoc => kisi !== null);
  const teknikEditor = doc.technicalReviewer ? kisiBul(doc.technicalReviewer) : null;

  return { doc, yazarlar, teknikEditor };
}

// ── Form seçenekleri ─────────────────────────────────────────────────

export interface KonuSecenegiDTO {
  slug: string;
  kind: Topic["kind"];
  parent: string | null;
  title: string;
}

/** Pillar/cluster ağacının tamamı — editör pillar seçimine göre filtreler. */
export async function tumTopics(): Promise<KonuSecenegiDTO[]> {
  const db = await getDb();
  const docs = await db
    .collection<Topic>("topics")
    .find({}, { projection: { slug: 1, kind: 1, parent: 1, title: 1 } })
    .sort({ title: 1 })
    .toArray();
  return docs.map((doc) => ({
    slug: doc.slug,
    kind: doc.kind,
    parent: doc.parent,
    title: doc.title,
  }));
}

export interface YazarSecenegiDTO {
  id: string;
  name: string;
  title: string;
}

export async function tumYazarlar(): Promise<YazarSecenegiDTO[]> {
  const db = await getDb();
  const docs = await db
    .collection<Author>("authors")
    .find({}, { projection: { name: 1, title: 1 } })
    .sort({ name: 1 })
    .toArray();
  return docs.map((doc) => ({ id: doc._id.toHexString(), name: doc.name, title: doc.title }));
}
