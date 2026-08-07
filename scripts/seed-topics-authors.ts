/**
 * Onaylı pillar/cluster ağacını (docs/arastirma/pillar-cluster-agaci.md, ADR 0006
 * Ek A) `topics` koleksiyonuna, kurucu yazarı `authors`'a tohumlar. İdempotent:
 * slug üzerinden upsert; tekrar koşmak güvenlidir.
 * Çalıştır: npx tsx scripts/seed-topics-authors.ts
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { MongoClient, ServerApiVersion } from "mongodb";

const KOK = join(import.meta.dirname, "..");

// .env.local'i elle yükle (harici paket yok; mevcut env ezilmez)
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

interface TopicKaydi {
  slug: string;
  kind: "pillar" | "cluster";
  parent: string | null;
  title: string;
  intro: string;
  seo: Record<string, never>;
}

function agaciAyristir(md: string): TopicKaydi[] {
  const kayitlar: TopicKaydi[] = [];
  let aktifPillar: string | null = null;
  let pillarIntroBekleniyor = false;

  for (const ham of md.split("\n")) {
    const satir = ham.trim();

    const pillarEs = satir.match(/^## (.+?) — `([a-z0-9-]+)`$/);
    if (pillarEs) {
      const [, title, slug] = pillarEs;
      if (!title || !slug) continue;
      aktifPillar = slug;
      pillarIntroBekleniyor = true;
      kayitlar.push({ slug, kind: "pillar", parent: null, title, intro: "", seo: {} });
      continue;
    }

    // Pillar başlığından sonraki ilk düz paragraf = kapsam cümlesi
    if (pillarIntroBekleniyor && satir && !satir.startsWith("|") && !satir.startsWith("#")) {
      const sonPillar = kayitlar[kayitlar.length - 1];
      if (sonPillar && sonPillar.kind === "pillar") sonPillar.intro = satir;
      pillarIntroBekleniyor = false;
      continue;
    }

    // Cluster tablo satırı: | Başlık | `slug` | Kapsam | Örnekler |
    const clusterEs = satir.match(/^\| (.+?) \| `([a-z0-9-]+)` \| (.+?) \|/);
    if (clusterEs && aktifPillar) {
      const [, title, slug, kapsam] = clusterEs;
      if (!title || !slug || title === "Cluster") continue;
      kayitlar.push({
        slug,
        kind: "cluster",
        parent: aktifPillar,
        title,
        intro: kapsam ?? "",
        seo: {},
      });
    }
  }
  return kayitlar;
}

async function ana() {
  const uri = process.env["MONGODB_URI"];
  if (!uri) {
    console.log("MONGODB_URI tanımlı değil; tohumlama atlanıyor.");
    return;
  }

  const md = readFileSync(join(KOK, "docs", "arastirma", "pillar-cluster-agaci.md"), "utf8");
  const topics = agaciAyristir(md);
  const pillarSayisi = topics.filter((t) => t.kind === "pillar").length;
  console.log(`Ayrıştırıldı: ${pillarSayisi} pillar, ${topics.length - pillarSayisi} cluster`);
  if (pillarSayisi !== 12) throw new Error(`12 pillar bekleniyordu, ${pillarSayisi} bulundu`);

  const client = await new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
  }).connect();
  const db = client.db(process.env["MONGODB_DB"] ?? "sinaptiklab");

  for (const t of topics) {
    await db.collection("topics").updateOne({ slug: t.slug }, { $set: t }, { upsert: true });
  }
  console.log(`topics → ${topics.length} kayıt upsert edildi`);

  await db.collection("authors").updateOne(
    { slug: "sukru-yusuf-kaya" },
    {
      $set: {
        slug: "sukru-yusuf-kaya",
        name: "Şükrü Yusuf Kaya",
        title: "Kurucu ve Editör",
        bio: "Sinaptiklab'ın kurucusu. Yapay zeka sistemleri geliştiriyor; burada üretim sahasından öğrendiklerini kaynaklı ve yeniden üretilebilir biçimde yazıyor.",
        longBio:
          "Şükrü Yusuf Kaya, Sinaptiklab'ın kurucusu ve editörüdür. Kurumsal yazılım ve yapay zeka projeleri geliştiriyor; RAG sistemleri, LLM entegrasyonları ve üretim altyapıları üzerine çalışıyor. Sinaptiklab'daki her içerik, sahada denenmiş desenleri kaynak göstererek aktarma ilkesiyle yazılır.",
        avatar: "",
        credentials: [],
        sameAs: ["https://github.com/sukruyusufkaya"],
        expertise: ["Büyük Dil Modelleri", "RAG Sistemleri", "Yazılım Mühendisliği"],
        employer: "alfi Technology",
      },
    },
    { upsert: true },
  );
  console.log("authors → sukru-yusuf-kaya upsert edildi");

  await client.close();
}

ana().catch((hata: unknown) => {
  console.error("seed hata:", hata instanceof Error ? hata.message : hata);
  process.exit(1);
});
