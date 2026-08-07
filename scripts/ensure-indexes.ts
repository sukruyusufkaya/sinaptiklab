// Idempotent index kurulumu: npx tsx scripts/ensure-indexes.ts
// CI'da MONGODB_URI yoksa "atlanıyor" der ve 0 ile çıkar.
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { MongoClient, type Db, type SearchIndexDescription } from "mongodb";
import { TUM_KOLEKSIYONLAR } from "../lib/db/schemas";

// .env.local'ı harici paket olmadan parse eder; mevcut process.env değerlerini ezmez.
function envLocalYukle(): void {
  const yol = resolve(process.cwd(), ".env.local");
  if (!existsSync(yol)) return;
  const ham = readFileSync(yol, "utf8");
  const icerik = ham.charCodeAt(0) === 0xfeff ? ham.slice(1) : ham; // BOM soy
  for (const satir of icerik.split(/\r?\n/)) {
    const temiz = satir.trim().replace(/^export\s+/, "");
    if (temiz === "" || temiz.startsWith("#")) continue;
    const esit = temiz.indexOf("=");
    if (esit <= 0) continue;
    const anahtar = temiz.slice(0, esit).trim();
    let deger = temiz.slice(esit + 1).trim();
    if (
      (deger.startsWith('"') && deger.endsWith('"') && deger.length >= 2) ||
      (deger.startsWith("'") && deger.endsWith("'") && deger.length >= 2)
    ) {
      deger = deger.slice(1, -1);
    }
    if (deger !== "" && process.env[anahtar] === undefined) {
      process.env[anahtar] = deger;
    }
  }
}

function hataMesaji(hata: unknown): string {
  return hata instanceof Error ? hata.message : String(hata);
}

// Atlas Search + Vector Search — yalnız Atlas'ta desteklenir, hata süreci kırmaz.
async function aramaIndeksleriniKur(db: Db): Promise<void> {
  const koleksiyon = db.collection("contents");
  const tanimlar: (SearchIndexDescription & { name: string })[] = [
    {
      name: "content_search",
      type: "search",
      definition: {
        mappings: {
          dynamic: false,
          fields: {
            title: { type: "string", analyzer: "lucene.turkish" },
            dek: { type: "string", analyzer: "lucene.turkish" },
            body: { type: "string", analyzer: "lucene.turkish" },
            tags: { type: "string", analyzer: "lucene.turkish" },
          },
        },
      },
    },
    {
      name: "content_vector",
      type: "vectorSearch",
      definition: {
        fields: [{ type: "vector", path: "embedding", numDimensions: 1536, similarity: "cosine" }],
      },
    },
  ];

  for (const tanim of tanimlar) {
    try {
      const mevcut = await koleksiyon.listSearchIndexes(tanim.name).toArray();
      if (mevcut.length > 0) {
        console.log(`contents.${tanim.name} → zaten var`);
        continue;
      }
      await koleksiyon.createSearchIndex(tanim);
      console.log(`contents.${tanim.name} → ok`);
    } catch (hata) {
      console.warn(
        `Atlas Search index'i kurulamadı (yalnız Atlas'ta desteklenir): ${hataMesaji(hata)}`,
      );
    }
  }
}

async function main(): Promise<void> {
  envLocalYukle();
  // env.ts import anında process.env'i okur; loader'dan SONRA yüklenmeli
  const { env } = await import("../lib/env");

  if (!env.MONGODB_URI) {
    console.log("MONGODB_URI tanımlı değil; index kurulumu atlanıyor.");
    return;
  }

  // Script'e özel düz client: serverApi strict, search index komutlarını engeller
  const client = new MongoClient(env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(env.MONGODB_DB);

    for (const { ad, indexler } of TUM_KOLEKSIYONLAR) {
      const koleksiyon = db.collection(ad);
      for (const tanim of indexler) {
        const isim = await koleksiyon.createIndex(tanim.key, tanim.options ?? {});
        console.log(`${ad}.${isim} → ok`);
      }
    }

    await aramaIndeksleriniKur(db);
  } finally {
    await client.close();
  }
}

main()
  .then(() => process.exit(0))
  .catch((hata: unknown) => {
    console.error(`ensure-indexes hata: ${hataMesaji(hata)}`);
    process.exit(1);
  });
