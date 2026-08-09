import { unstable_cache } from "next/cache";
import type { Content, ContentDoc, Topic } from "@/lib/db/schemas";
import { getDb } from "@/lib/mongodb";
import type { IcerikTuru } from "@/lib/rotalar";
import { slugla } from "@/lib/slug";
import { ICERIK_LISTE_TAG, yayindakiIcerikListesi } from "./contents";
import { icerikOzetDTO, type IcerikOzetDTO } from "./dto";

/**
 * Arşiv okuma yolları — tür indeksleri (/makale, /rehber, /uygulama), etiket
 * arşivi (/etiket/<slug>) ve cluster hub'ı (/konu/<pillar>/<cluster>).
 * contents.ts tekil + genel liste sorgularını taşır; buradaki sorgular ondan
 * ayrı yaşar ama AYNI ISR tag'ini (ICERIK_LISTE_TAG) kullanır: yayın aksiyonu
 * tek revalidateTag ile bütün arşivleri tazeler (BRIEF §3.1).
 *
 * Hepsi DB hatasında patlar (unstable_cache içinden throw); çağrı yerleri
 * try/catch ile boş duruma düşer — sayfa kırılmaz.
 */

/** Tür indekslerinde sayfa başına kart (BRIEF §7.1 sayfalama kanoniği). */
export const ARSIV_SAYFA_ADEDI = 12;

// contents.ts'teki OZET_ALANLARI'nın kopyası (o dosya dışa açmıyor).
// icerikOzetDTO'nun okuduğu her alan burada olmak ZORUNDA.
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

// ── Tür indeksleri ───────────────────────────────────────────────────

/**
 * Bir türün yayındaki içerikleri, sayfalanmış. contents.ts'teki liste
 * sorgusuna delege eder — önbellek anahtarı ve tag'i orada tanımlı.
 */
export function turListesi(
  tur: IcerikTuru,
  sayfa = 1,
  adet: number = ARSIV_SAYFA_ADEDI,
): Promise<IcerikOzetDTO[]> {
  return yayindakiIcerikListesi({ type: tur, sayfa, adet });
}

async function turSayisiHam(tur: IcerikTuru): Promise<number> {
  const db = await getDb();
  return db.collection<Content>("contents").countDocuments({ type: tur, status: "published" });
}

/** Türün yayındaki toplam içerik sayısı — sayfalama ve veri rayı için. */
export function turSayisi(tur: IcerikTuru): Promise<number> {
  return unstable_cache(() => turSayisiHam(tur), ["tur-sayisi", tur], {
    tags: [ICERIK_LISTE_TAG],
  })();
}

// ── Etiket arşivi ────────────────────────────────────────────────────

export interface EtiketArsiviDTO {
  /** URL'deki ASCII-normalize slug. */
  slug: string;
  /** Ekranda gösterilen ad: en sık kullanılan yazım. */
  etiket: string;
  /** Bu slug'a düşen tüm yazımlar ("RAG", "rag", ...). */
  varyantlar: string[];
  icerikler: IcerikOzetDTO[];
}

async function etiketIcerikleriHam(slug: string): Promise<EtiketArsiviDTO | null> {
  const db = await getDb();
  const koleksiyon = db.collection<Content>("contents");

  // Etiket sayımı $unwind + $group ile yapılır; collection.distinct() BURADA
  // KULLANILAMAZ: lib/mongodb.ts serverApi'yi apiStrict:true ile açar ve
  // `distinct` komutu Stable API v1'de yoktur (sunucu hata döndürür).
  const sayimlar = await koleksiyon
    .aggregate<{ _id: string; adet: number }>([
      { $match: { status: "published" } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", adet: { $sum: 1 } } },
      { $sort: { adet: -1, _id: 1 } },
    ])
    .toArray();

  // Etiketler serbest metindir ("RAG", "rag", "vektör arama"); URL slug'ı ise
  // ASCII-normalize (BRIEF §2.2). Eşleşme bu yüzden slugla() üzerinden kurulur
  // ki aynı etiketin farklı yazımları tek arşivde toplansın. Liste sayıya göre
  // sıralı geldiği için ilk eleman "en sık kullanılan yazım"dır.
  const varyantlar = sayimlar.map((s) => s._id).filter((etiket) => slugla(etiket) === slug);
  const gorunenAd = varyantlar[0];
  if (gorunenAd === undefined) return null;

  const docs = await koleksiyon
    .find({ status: "published", tags: { $in: varyantlar } }, { projection: OZET_ALANLARI })
    .sort({ publishedAt: -1 })
    .toArray();

  return {
    slug,
    etiket: gorunenAd,
    varyantlar,
    icerikler: docs.map((d) => icerikOzetDTO(d as ContentDoc)),
  };
}

/** Etiket arşivi; etiket hiçbir yayında geçmiyorsa null (rota 404'e düşer). */
export function etiketIcerikleri(slug: string): Promise<EtiketArsiviDTO | null> {
  return unstable_cache(() => etiketIcerikleriHam(slug), ["etiket-icerikleri", slug], {
    tags: [ICERIK_LISTE_TAG],
  })();
}

// ── Cluster hub'ı ────────────────────────────────────────────────────

export interface ClusterDetayDTO {
  slug: string;
  title: string;
  intro: string;
  pillarSlug: string;
  pillarTitle: string;
  icerikSayisi: number;
}

async function clusterDetayHam(pillar: string, cluster: string): Promise<ClusterDetayDTO | null> {
  const db = await getDb();
  const konular = db.collection<Topic>("topics");

  // parent kontrolü sorgunun içinde: /konu/<yanlis-pillar>/<cluster> 404 olmalı
  const [clusterKaydi, pillarKaydi] = await Promise.all([
    konular.findOne({ slug: cluster, kind: "cluster", parent: pillar }),
    konular.findOne({ slug: pillar, kind: "pillar" }),
  ]);
  if (clusterKaydi === null || pillarKaydi === null) return null;

  const icerikSayisi = await db
    .collection<Content>("contents")
    .countDocuments({ status: "published", pillar, clusters: cluster });

  return {
    slug: clusterKaydi.slug,
    title: clusterKaydi.title,
    intro: clusterKaydi.intro,
    pillarSlug: pillarKaydi.slug,
    pillarTitle: pillarKaydi.title,
    icerikSayisi,
  };
}

/** Cluster kaydı + üst pillar'ı; geçersiz kombinasyonda null. */
export function clusterDetay(pillar: string, cluster: string): Promise<ClusterDetayDTO | null> {
  return unstable_cache(
    () => clusterDetayHam(pillar, cluster),
    ["cluster-detay", pillar, cluster],
    {
      tags: [ICERIK_LISTE_TAG],
    },
  )();
}

async function clusterIcerikleriHam(pillar: string, cluster: string): Promise<IcerikOzetDTO[]> {
  const db = await getDb();
  const docs = await db
    .collection<Content>("contents")
    .find({ status: "published", pillar, clusters: cluster }, { projection: OZET_ALANLARI })
    .sort({ publishedAt: -1 })
    .toArray();
  return docs.map((d) => icerikOzetDTO(d as ContentDoc));
}

/** Cluster'ı `clusters[]` içinde taşıyan yayınlar (yeniden eskiye). */
export function clusterIcerikleri(pillar: string, cluster: string): Promise<IcerikOzetDTO[]> {
  return unstable_cache(
    () => clusterIcerikleriHam(pillar, cluster),
    ["cluster-icerikleri", pillar, cluster],
    { tags: [ICERIK_LISTE_TAG] },
  )();
}
