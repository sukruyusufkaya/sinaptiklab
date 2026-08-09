import { unstable_cache } from "next/cache";
import type { Term } from "@/lib/db/schemas";
import { getDb } from "@/lib/mongodb";

/**
 * Sözlük (BRIEF §4.2 `terms`) okuma yolları. Terim korpusu nadiren değişir ve
 * tamamı tek sayfada listelenir; bu yüzden liste tek sorguda çekilip
 * `terms` tag'iyle önbelleklenir (tohum/güncelleme sonrası revalidateTag).
 * Diğer sorgu modülleri gibi dışarıya yalnız düz-serileştirilebilir DTO verir.
 */

export const TERIM_TAG = "terms";

export interface TerimOzetDTO {
  slug: string;
  tr: string;
  en: string;
  shortDef: string;
  pillar: string;
}

export interface TerimBaglantisiDTO {
  slug: string;
  tr: string;
}

export interface TerimDetayDTO extends TerimOzetDTO {
  aliases: string[];
  longDef: string;
  /** related[] slug listesi çözülmüş hâli; kayıp slug'lar düşürülür. */
  ilgili: TerimBaglantisiDTO[];
  sources: { label: string; url: string; publisher: string; accessedAt: string; kind: string }[];
}

const OZET_ALANLARI = { _id: 0, slug: 1, tr: 1, en: 1, shortDef: 1, pillar: 1 } as const;

function ozetDTO(doc: Pick<Term, "slug" | "tr" | "en" | "shortDef" | "pillar">): TerimOzetDTO {
  return { slug: doc.slug, tr: doc.tr, en: doc.en, shortDef: doc.shortDef, pillar: doc.pillar };
}

async function terimListesiHam(): Promise<TerimOzetDTO[]> {
  const db = await getDb();
  const docs = await db.collection<Term>("terms").find({}, { projection: OZET_ALANLARI }).toArray();
  // Sıralama Türkçe harf sırasına göre uygulamada yapılır: Mongo collation'ı
  // "tr" için indexsiz sıralamada da çalışır ama sözlük sayfasındaki harf
  // gruplaması zaten aynı karşılaştırıcıyı kullanıyor — tek kaynak olsun.
  return docs.map(ozetDTO).sort((a, b) => a.tr.localeCompare(b.tr, "tr"));
}

/** Sözlük indeksi — tüm terimler, Türkçe alfabetik. */
export function terimListesi(): Promise<TerimOzetDTO[]> {
  return unstable_cache(terimListesiHam, ["terim-listesi"], { tags: [TERIM_TAG] })();
}

async function terimBySlugHam(slug: string): Promise<TerimDetayDTO | null> {
  const db = await getDb();
  const koleksiyon = db.collection<Term>("terms");
  const doc = await koleksiyon.findOne({ slug }, { projection: { _id: 0 } });
  if (!doc) return null;

  const ilgiliDocs =
    doc.related.length > 0
      ? await koleksiyon
          .find({ slug: { $in: doc.related } }, { projection: { _id: 0, slug: 1, tr: 1 } })
          .toArray()
      : [];
  // Sıra related[] dizisindeki editoryal sırayı korur (Mongo dönüş sırası değil).
  const ilgili = doc.related
    .map((s) => ilgiliDocs.find((d) => d.slug === s))
    .filter((d): d is NonNullable<typeof d> => d !== undefined)
    .map((d) => ({ slug: d.slug, tr: d.tr }));

  return {
    ...ozetDTO(doc),
    aliases: doc.aliases,
    longDef: doc.longDef,
    ilgili,
    sources: doc.sources.map((k) => ({
      label: k.label,
      url: k.url,
      publisher: k.publisher,
      accessedAt: k.accessedAt.toISOString(),
      kind: k.kind,
    })),
  };
}

/** Tek terim + çözülmüş ilgili terimler (sözlük detay sayfası). */
export function terimBySlug(slug: string): Promise<TerimDetayDTO | null> {
  return unstable_cache(() => terimBySlugHam(slug), ["terim-detay", slug], {
    tags: [TERIM_TAG],
  })();
}
