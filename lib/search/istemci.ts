import { MongoClient, type Collection, type Document } from "mongodb";
import { env } from "@/lib/env";

/**
 * Atlas Search'e özel MongoClient — tek kaynak (BRIEF §4.1 `content_search`).
 *
 * GEREKÇE: `serverApi` **strict** `$search`'ü reddeder — Atlas'ta bile
 * "$search is not allowed with 'apiStrict: true' in API Version 1" hatası
 * döner (fiilen doğrulandı). lib/mongodb.ts'teki ana client Stable API strict
 * kurulu olduğundan aggregation'da $search kullanan her yol bu modülden
 * geçer; scripts/ensure-indexes.ts'teki "search index komutları için düz
 * client" emsaliyle aynı çözümdür.
 *
 * Yalnız arama bu client'tan geçer; okuma yolları (unstable_cache + getDb)
 * değişmez. Havuz küçük tutulur (maxPoolSize 5): serverless'ta ikinci bir
 * havuz açtığımız için Atlas bağlantı bütçesini yemesin.
 */

declare global {
  var _aramaClientPromise: Promise<MongoClient> | undefined;
}

let aramaClientPromise: Promise<MongoClient> | undefined;

/** Lazy tekil client; development'ta HMR sızıntısına karşı global cache. */
export function aramaClientAl(): Promise<MongoClient> {
  const uri = env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI tanımlı değil; Atlas Search sorgusu yapılamaz.");
  }
  const kur = () =>
    new MongoClient(uri, { maxPoolSize: 5, minPoolSize: 0, maxIdleTimeMS: 30_000 }).connect();

  if (env.NODE_ENV === "development") {
    global._aramaClientPromise ??= kur();
    return global._aramaClientPromise;
  }
  aramaClientPromise ??= kur();
  return aramaClientPromise;
}

/** Arama client'ından koleksiyon (varsayılan veritabanı: env.MONGODB_DB). */
export async function aramaKoleksiyonu<T extends Document>(ad: string): Promise<Collection<T>> {
  const client = await aramaClientAl();
  return client.db(env.MONGODB_DB).collection<T>(ad);
}
