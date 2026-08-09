import { unstable_cache } from "next/cache";
import type { Content, Topic } from "@/lib/db/schemas";
import { getDb } from "@/lib/mongodb";
import { ICERIK_LISTE_TAG } from "./contents";

/**
 * Konu (pillar/cluster) okuma yolları. Topics ağacı nadiren değişir; içerik
 * sayıları yayınla değiştiği için ICERIK_LISTE_TAG ile birlikte düşer.
 */

export interface PillarOzetDTO {
  slug: string;
  title: string;
  intro: string;
  icerikSayisi: number;
}

export interface ClusterDTO {
  slug: string;
  title: string;
  intro: string;
}

export interface PillarDetayDTO extends PillarOzetDTO {
  clusters: ClusterDTO[];
}

async function pillarlarHam(): Promise<PillarOzetDTO[]> {
  const db = await getDb();
  const [pillarlar, sayilar] = await Promise.all([
    db.collection<Topic>("topics").find({ kind: "pillar" }).sort({ title: 1 }).toArray(),
    db
      .collection<Content>("contents")
      .aggregate<{ _id: string; adet: number }>([
        { $match: { status: "published" } },
        { $group: { _id: "$pillar", adet: { $sum: 1 } } },
      ])
      .toArray(),
  ]);
  const sayiHaritasi = new Map(sayilar.map((s) => [s._id, s.adet]));
  return pillarlar.map((p) => ({
    slug: p.slug,
    title: p.title,
    intro: p.intro,
    icerikSayisi: sayiHaritasi.get(p.slug) ?? 0,
  }));
}

/** 12 pillar + yayınlanmış içerik sayıları (konu haritası). */
export function pillarlar(): Promise<PillarOzetDTO[]> {
  return unstable_cache(pillarlarHam, ["pillarlar"], { tags: [ICERIK_LISTE_TAG] })();
}

async function pillarDetayHam(slug: string): Promise<PillarDetayDTO | null> {
  const db = await getDb();
  const pillar = await db.collection<Topic>("topics").findOne({ slug, kind: "pillar" });
  if (!pillar) return null;
  const [clusterlar, adet] = await Promise.all([
    db
      .collection<Topic>("topics")
      .find({ kind: "cluster", parent: slug })
      .sort({ title: 1 })
      .toArray(),
    db.collection<Content>("contents").countDocuments({ pillar: slug, status: "published" }),
  ]);
  return {
    slug: pillar.slug,
    title: pillar.title,
    intro: pillar.intro,
    icerikSayisi: adet,
    clusters: clusterlar.map((c) => ({ slug: c.slug, title: c.title, intro: c.intro })),
  };
}

/** Tek pillar + cluster listesi (hub sayfası). */
export function pillarDetay(slug: string): Promise<PillarDetayDTO | null> {
  return unstable_cache(() => pillarDetayHam(slug), ["pillar-detay", slug], {
    tags: [ICERIK_LISTE_TAG],
  })();
}

export interface ClusterYoluDTO {
  pillar: string;
  slug: string;
}

async function tumClusterlarHam(): Promise<ClusterYoluDTO[]> {
  const db = await getDb();
  const kayitlar = await db
    .collection<Topic>("topics")
    .find({ kind: "cluster", parent: { $ne: null } })
    .project<{ slug: string; parent: string | null }>({ slug: 1, parent: 1 })
    .toArray();
  return kayitlar
    .filter((k): k is { slug: string; parent: string } => typeof k.parent === "string")
    .map((k) => ({ pillar: k.parent, slug: k.slug }));
}

/** Tüm cluster yolları (sitemap'in konular parçası için). */
export function tumClusterlar(): Promise<ClusterYoluDTO[]> {
  return unstable_cache(tumClusterlarHam, ["tum-clusterlar"], {
    tags: [ICERIK_LISTE_TAG],
  })();
}

export interface SiteIstatistikleriDTO {
  yayindaIcerik: number;
  pillarSayisi: number;
  clusterSayisi: number;
  toplamKaynak: number;
}

async function istatistiklerHam(): Promise<SiteIstatistikleriDTO> {
  const db = await getDb();
  const [yayindaIcerik, pillarSayisi, clusterSayisi, kaynakToplami] = await Promise.all([
    db.collection<Content>("contents").countDocuments({ status: "published" }),
    db.collection<Topic>("topics").countDocuments({ kind: "pillar" }),
    db.collection<Topic>("topics").countDocuments({ kind: "cluster" }),
    db
      .collection<Content>("contents")
      .aggregate<{ toplam: number }>([
        { $match: { status: "published" } },
        { $group: { _id: null, toplam: { $sum: { $size: "$sources" } } } },
      ])
      .toArray(),
  ]);
  return {
    yayindaIcerik,
    pillarSayisi,
    clusterSayisi,
    toplamKaynak: kaynakToplami[0]?.toplam ?? 0,
  };
}

/** Ana sayfa ölçüm şeridi — kendi verimizden gerçek sayılar (§14/7 uyumlu). */
export function siteIstatistikleri(): Promise<SiteIstatistikleriDTO> {
  return unstable_cache(istatistiklerHam, ["site-istatistikleri"], {
    tags: [ICERIK_LISTE_TAG],
  })();
}
