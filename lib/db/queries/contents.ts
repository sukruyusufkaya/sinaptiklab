import { ObjectId } from "mongodb";
import { unstable_cache } from "next/cache";
import type { Author, Content, ContentDoc } from "@/lib/db/schemas";
import { getDb } from "@/lib/mongodb";
import { icerikDetayDTO, icerikOzetDTO, type IcerikDetayDTO, type IcerikOzetDTO } from "./dto";

/**
 * Public okuma yolları — BRIEF §3.1: okuma yolları asla istek başına DB'ye
 * gitmez; ISR + unstable_cache + revalidateTag. Yayın Server Action'ı ilgili
 * tag'leri geçersiz kılar (icerikTag + ICERIK_LISTE_TAG).
 */

export const icerikTag = (slug: string) => `content:${slug}`;
export const ICERIK_LISTE_TAG = "content-list";

const OZET_ALANLARI = {
  type: 1,
  slug: 1,
  title: 1,
  dek: 1,
  level: 1,
  pillar: 1,
  clusters: 1,
  tags: 1,
  excerptHtml: 1,
  readingMinutes: 1,
  publishedAt: 1,
  updatedAt: 1,
  lastVerifiedAt: 1,
} as const;

async function yayindakiIcerikHam(slug: string): Promise<IcerikDetayDTO | null> {
  const db = await getDb();
  const doc = await db.collection<Content>("contents").findOne({ slug, status: "published" });
  if (!doc) return null;

  const yazarIdleri = doc.authors.map((id) => new ObjectId(id));
  const aranacak = doc.technicalReviewer
    ? [...yazarIdleri, new ObjectId(doc.technicalReviewer)]
    : yazarIdleri;
  const kisiler = aranacak.length
    ? await db
        .collection<Author>("authors")
        .find({ _id: { $in: aranacak } })
        .toArray()
    : [];

  const kisiBul = (id: ObjectId) => kisiler.find((k) => k._id.equals(id)) ?? null;
  const yazarlar = yazarIdleri.map(kisiBul).filter((k): k is NonNullable<typeof k> => k !== null);
  const teknikEditor = doc.technicalReviewer ? kisiBul(new ObjectId(doc.technicalReviewer)) : null;

  return icerikDetayDTO(doc as ContentDoc, yazarlar, teknikEditor);
}

/** Slug ile yayınlanmış içerik; `content:<slug>` tag'iyle önbellekli. */
export function yayindakiIcerik(slug: string): Promise<IcerikDetayDTO | null> {
  return unstable_cache(() => yayindakiIcerikHam(slug), ["yayindaki-icerik", slug], {
    tags: [icerikTag(slug), ICERIK_LISTE_TAG],
  })();
}

export interface IcerikListesiParams {
  type?: Content["type"];
  pillar?: string;
  adet?: number;
  sayfa?: number;
}

async function yayindakiListeHam(params: IcerikListesiParams): Promise<IcerikOzetDTO[]> {
  const { type, pillar, adet = 20, sayfa = 1 } = params;
  const db = await getDb();
  const filtre: Record<string, unknown> = { status: "published" };
  if (type) filtre["type"] = type;
  if (pillar) filtre["pillar"] = pillar;

  const docs = await db
    .collection<Content>("contents")
    .find(filtre, { projection: OZET_ALANLARI })
    .sort({ publishedAt: -1 })
    .skip((sayfa - 1) * adet)
    .limit(adet)
    .toArray();

  return docs.map((d) => icerikOzetDTO(d as ContentDoc));
}

/** Yayınlanmış içerik listesi; `content-list` tag'iyle önbellekli. */
export function yayindakiIcerikListesi(params: IcerikListesiParams = {}): Promise<IcerikOzetDTO[]> {
  const anahtar = [
    "yayindaki-liste",
    params.type ?? "-",
    params.pillar ?? "-",
    String(params.adet ?? 20),
    String(params.sayfa ?? 1),
  ];
  return unstable_cache(() => yayindakiListeHam(params), anahtar, {
    tags: [ICERIK_LISTE_TAG],
  })();
}

/** Ana sayfa akışı için kısayol. */
export function sonYayinlar(adet = 6): Promise<IcerikOzetDTO[]> {
  return yayindakiIcerikListesi({ adet });
}

async function ilgiliIceriklerHam(pillar: string, haricSlug: string): Promise<IcerikOzetDTO[]> {
  const db = await getDb();
  const docs = await db
    .collection<Content>("contents")
    .find({ status: "published", pillar, slug: { $ne: haricSlug } }, { projection: OZET_ALANLARI })
    .sort({ publishedAt: -1 })
    .limit(3)
    .toArray();
  return docs.map((d) => icerikOzetDTO(d as ContentDoc));
}

/**
 * İlgili içerik (BRIEF §6.1/12) — Faz 6'ya kadar aynı pillar'ın son
 * yayınları; vektör benzerliği karışımı embedding backfill'iyle gelecek.
 */
export function ilgiliIcerikler(pillar: string, haricSlug: string): Promise<IcerikOzetDTO[]> {
  return unstable_cache(
    () => ilgiliIceriklerHam(pillar, haricSlug),
    ["ilgili-icerikler", pillar, haricSlug],
    { tags: [ICERIK_LISTE_TAG] },
  )();
}
