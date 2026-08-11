import { unstable_cache } from "next/cache";
import type { Soru, Test, TestTuru } from "@/lib/db/schemas";
import { getDb } from "@/lib/mongodb";

/**
 * Testler (`quizzes`) okuma yolları. İçerik sorgularıyla aynı sözleşme:
 * dışarıya yalnız düz-serileştirilebilir DTO verir, ISR tag'iyle önbeklenir,
 * DB hatası çağrı yerinde boş duruma düşürülür (sayfa kırılmaz).
 *
 * Yalnız `status: "published"` olanlar public yüzeye çıkar — taslak test,
 * taslak içerik gibi 404'tür.
 */

export const TEST_TAG = "quizzes";
export const TEST_LISTE_TAG = "quiz-list";

export interface TestOzetDTO {
  slug: string;
  title: string;
  dek: string;
  kind: TestTuru;
  pillar: string;
  level: Test["level"];
  soruSayisi: number;
  durationMinutes: number;
  passScore: number;
  publishedAt: string | null;
  updatedAt: string;
}

export interface TestDetayDTO extends TestOzetDTO {
  tags: string[];
  lastVerifiedAt: string;
  version: number;
  sorular: Soru[];
  sources: {
    label: string;
    url: string;
    publisher: string;
    accessedAt: string;
    kind: string;
  }[];
}

const OZET_ALANLARI = {
  _id: 0,
  slug: 1,
  title: 1,
  dek: 1,
  kind: 1,
  pillar: 1,
  level: 1,
  sorular: 1,
  durationMinutes: 1,
  passScore: 1,
  publishedAt: 1,
  updatedAt: 1,
} as const;

type OzetDoc = Pick<
  Test,
  | "slug"
  | "title"
  | "dek"
  | "kind"
  | "pillar"
  | "level"
  | "sorular"
  | "durationMinutes"
  | "passScore"
  | "publishedAt"
  | "updatedAt"
>;

function ozetDTO(doc: OzetDoc): TestOzetDTO {
  return {
    slug: doc.slug,
    title: doc.title,
    dek: doc.dek,
    kind: doc.kind,
    pillar: doc.pillar,
    level: doc.level,
    soruSayisi: doc.sorular.length,
    durationMinutes: doc.durationMinutes,
    passScore: doc.passScore,
    publishedAt: doc.publishedAt === null ? null : doc.publishedAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

async function testListesiHam(): Promise<TestOzetDTO[]> {
  const db = await getDb();
  const docs = await db
    .collection<Test>("quizzes")
    .find({ status: "published" }, { projection: OZET_ALANLARI })
    .sort({ publishedAt: -1 })
    .toArray();
  return docs.map((doc) => ozetDTO(doc as unknown as OzetDoc));
}

/** Yayındaki tüm testler, yeniden eskiye. */
export function testListesi(): Promise<TestOzetDTO[]> {
  return unstable_cache(testListesiHam, ["test-listesi"], { tags: [TEST_LISTE_TAG] })();
}

async function testBySlugHam(slug: string): Promise<TestDetayDTO | null> {
  const db = await getDb();
  const doc = await db
    .collection<Test>("quizzes")
    .findOne({ slug, status: "published" }, { projection: { _id: 0 } });
  if (doc === null) return null;
  return {
    ...ozetDTO(doc),
    tags: doc.tags,
    lastVerifiedAt: doc.lastVerifiedAt.toISOString(),
    version: doc.version,
    sorular: doc.sorular,
    sources: doc.sources.map((k) => ({
      label: k.label,
      url: k.url,
      publisher: k.publisher,
      accessedAt: k.accessedAt.toISOString(),
      kind: k.kind,
    })),
  };
}

/** Slug ile yayındaki tek test; taslak/olmayan → null. */
export function testBySlug(slug: string): Promise<TestDetayDTO | null> {
  return unstable_cache(() => testBySlugHam(slug), ["test", slug], {
    tags: [TEST_TAG, `test:${slug}`],
  })();
}

async function testSayisiHam(): Promise<number> {
  const db = await getDb();
  return db.collection<Test>("quizzes").countDocuments({ status: "published" });
}

/** Yayındaki test sayısı — gezinme ve boş durum kararları için. */
export function testSayisi(): Promise<number> {
  return unstable_cache(testSayisiHam, ["test-sayisi"], { tags: [TEST_LISTE_TAG] })();
}
