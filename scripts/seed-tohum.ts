/**
 * content-ops/tohum/<slug>.json + <slug>.mdx çiftlerini Atlas'a taslak olarak
 * alır (slug üzerinden idempotent upsert). `--yayinla` bayrağıyla,
 * onerilenDurum "published" olanları GERÇEK §4.3 yayın kapısından
 * (lib/editorial/dogrulayicilar) geçirir; geçenleri yayınlar, kalanları
 * gerekçeleriyle raporlar.
 * Çalıştır: npx tsx scripts/seed-tohum.ts [--yayinla]
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import { z } from "zod";
import { yayinKontrolleri } from "../lib/editorial/dogrulayicilar";
import { mdxDerle, okumaSuresi } from "../lib/mdx/derle";
import type { Content } from "../lib/db/schemas";

const KOK = join(import.meta.dirname, "..");
const TOHUM_DIZINI = join(KOK, "content-ops", "tohum");

// .env.local loader (mevcut env ezilmez)
const envYolu = join(KOK, ".env.local");
if (existsSync(envYolu)) {
  for (const satir of readFileSync(envYolu, "utf8").split("\n")) {
    const temiz = satir.replace(/^﻿/, "").trim();
    if (!temiz || temiz.startsWith("#")) continue;
    const esit = temiz.indexOf("=");
    if (esit === -1) continue;
    const anahtar = temiz
      .slice(0, esit)
      .replace(/^export\s+/, "")
      .trim();
    const deger = temiz
      .slice(esit + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (anahtar && deger && !(anahtar in process.env)) process.env[anahtar] = deger;
  }
}

const metaSema = z.object({
  type: z.enum([
    "article",
    "guide",
    "tutorial",
    "lab",
    "tool",
    "benchmark",
    "case",
    "compliance",
    "issue",
  ]),
  slug: z.string().min(1),
  title: z.string().min(1).max(70),
  dek: z.string().min(80),
  answerFirst: z.string().min(1),
  level: z.enum(["giris", "orta", "ileri", "uzman"]),
  pillar: z.string().min(1),
  clusters: z.array(z.string()).min(1),
  tags: z.array(z.string()),
  faq: z.array(z.object({ q: z.string(), a: z.string() })).min(2),
  sources: z
    .array(
      z.object({
        label: z.string(),
        url: z.url(),
        publisher: z.string(),
        accessedAt: z.string(),
        kind: z.enum(["paper", "docs", "vendor", "data", "news", "own_field_data"]),
      }),
    )
    .min(1),
  seo: z.object({ description: z.string().max(170) }).partial(),
  onerilenDurum: z.enum(["published", "draft"]).default("draft"),
  notlar: z.string().optional(),
});

async function ana() {
  const yayinla = process.argv.includes("--yayinla");
  const uri = process.env["MONGODB_URI"];
  if (!uri) throw new Error("MONGODB_URI tanımlı değil (.env.local)");
  if (!existsSync(TOHUM_DIZINI)) throw new Error(`Tohum dizini yok: ${TOHUM_DIZINI}`);

  const jsonlar = readdirSync(TOHUM_DIZINI).filter((d) => d.endsWith(".json"));
  console.log(`${jsonlar.length} tohum meta dosyası bulundu.\n`);

  const client = await new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
  }).connect();
  const db = client.db(process.env["MONGODB_DB"] ?? "sinaptiklab");

  const yazar = await db.collection("authors").findOne({ slug: "sukru-yusuf-kaya" });
  if (!yazar) throw new Error("Yazar kaydı yok — önce seed-topics-authors.ts koşun");
  const yazarId = yazar._id as ObjectId;

  const simdi = new Date();
  const alinanlar: { slug: string; onerilen: "published" | "draft" }[] = [];
  const hatalilar: { dosya: string; hata: string }[] = [];

  for (const dosya of jsonlar) {
    try {
      const meta = metaSema.parse(JSON.parse(readFileSync(join(TOHUM_DIZINI, dosya), "utf8")));
      const mdxYolu = join(TOHUM_DIZINI, `${meta.slug}.mdx`);
      if (!existsSync(mdxYolu)) throw new Error("eşleşen .mdx yok");
      const body = readFileSync(mdxYolu, "utf8");

      const { toc } = await mdxDerle(body); // derlenemeyen MDX burada patlar
      const icerik: Content = {
        type: meta.type,
        slug: meta.slug,
        title: meta.title,
        dek: meta.dek,
        answerFirst: meta.answerFirst,
        body,
        excerptHtml: `<p>${meta.dek}</p>`,
        level: meta.level,
        pillar: meta.pillar,
        clusters: meta.clusters,
        tags: meta.tags,
        authors: [yazarId],
        technicalReviewer: null,
        status: "draft",
        publishedAt: null,
        updatedAt: simdi,
        lastVerifiedAt: simdi,
        readingMinutes: okumaSuresi(body),
        toc,
        faq: meta.faq,
        sources: meta.sources.map((s) => ({ ...s, accessedAt: new Date(s.accessedAt) })),
        repro: null,
        relatedManual: [],
        embedding: [],
        seo: meta.seo,
        i18n: { lang: "tr" },
        changelog: [],
        metrics: { views: 0, avgScrollDepth: 0, aiReferrals: 0 },
        version: 1,
      };

      // yayınlanmışsa durumunu/yayın tarihini EZME — yalnız içerik alanları tazelenir
      // (dikkat: sürücü undefined'ı null'a çevirir; alanları nesneden tamamen çıkar)
      const guncellenecek: Record<string, unknown> = { ...icerik };
      delete guncellenecek["status"];
      delete guncellenecek["publishedAt"];
      await db.collection("contents").updateOne(
        { slug: meta.slug },
        {
          $set: guncellenecek,
          $setOnInsert: { status: "draft", publishedAt: null },
        },
        { upsert: true },
      );
      alinanlar.push({ slug: meta.slug, onerilen: meta.onerilenDurum });
      console.log(`✓ taslak upsert: ${meta.slug}`);
    } catch (h) {
      hatalilar.push({ dosya, hata: h instanceof Error ? h.message : String(h) });
      console.log(`✗ ${dosya}: ${h instanceof Error ? h.message : h}`);
    }
  }

  if (yayinla) {
    console.log("\n— Yayın kapısı (§4.3) —");
    const tumSluglar = alinanlar.map((a) => a.slug);
    let yayinlanan = 0;
    for (const { slug, onerilen } of alinanlar) {
      if (onerilen !== "published") {
        console.log(`○ ${slug}: taslakta bırakıldı (öneri: draft)`);
        continue;
      }
      const doc = await db.collection<Content>("contents").findOne({ slug });
      if (!doc) continue;
      const yayindakiler = await db
        .collection<Content>("contents")
        .find({ status: "published", slug: { $ne: slug } })
        .project<{ slug: string }>({ slug: 1 })
        .toArray();
      const kontroller = await yayinKontrolleri(doc, {
        mevcutSluglar: tumSluglar.filter((s) => s !== slug),
        yayindakiSluglar: yayindakiler.map((y) => y.slug),
      });
      const kalanlar = kontroller.filter((k) => !k.gecti);
      if (kalanlar.length === 0) {
        await db.collection<Content>("contents").updateOne(
          { slug },
          {
            $set: {
              status: "published",
              publishedAt: doc.publishedAt ?? simdi,
              lastVerifiedAt: simdi,
            },
            $push: {
              changelog: { at: simdi, by: yazarId, note: "İlk yayın (tohum)", kind: "major" },
            },
          },
        );
        yayinlanan++;
        console.log(`✔ YAYINDA: ${slug}`);
      } else {
        console.log(`✗ reddedildi: ${slug}`);
        for (const k of kalanlar) console.log(`    · [${k.kural}] ${k.mesaj}`);
      }
    }
    console.log(`\nToplam yayınlanan: ${yayinlanan}/${alinanlar.length}`);
  }

  if (hatalilar.length) {
    console.log(`\nHatalı dosyalar (${hatalilar.length}):`);
    for (const h of hatalilar) console.log(`  ${h.dosya}: ${h.hata}`);
  }
  await client.close();
  console.log("\nNot: canlı ISR önbelleği için yayın sonrası bir kez redeploy veya");
  console.log("admin üzerinden herhangi bir içeriği yeniden yayınlamak yeterli.");
}

ana().catch((h: unknown) => {
  console.error("seed-tohum hata:", h instanceof Error ? h.message : h);
  process.exit(1);
});
