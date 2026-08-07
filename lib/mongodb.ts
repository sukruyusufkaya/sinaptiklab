import { MongoClient, ServerApiVersion, type Db, type MongoClientOptions } from "mongodb";
import { env } from "@/lib/env";

// BRIEF §3.1 — serverless bağlantı deseni. Tek fark: URI env üzerinden gelir
// ve client LAZY kurulur; URI yoksa import patlamaz, ilk getDb() çağrısı
// anlaşılır bir hatayla durur.
const options: MongoClientOptions = {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
  maxPoolSize: 10,
  minPoolSize: 0,
  maxIdleTimeMS: 30_000,
};

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient> | undefined;

function clientPromiseAl(): Promise<MongoClient> {
  const uri = env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI tanımlı değil; .env.local dosyasına ekleyin " +
        '(ör. MONGODB_URI="mongodb+srv://kullanici:sifre@cluster.mongodb.net"). ' +
        "Üretimde Vercel ortam değişkenlerine de eklemeyi unutmayın.",
    );
  }
  // development'ta HMR yeniden yüklemelerinde bağlantı sızmasın diye global cache
  if (env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = new MongoClient(uri, options).connect();
    }
    return global._mongoClientPromise;
  }
  if (!clientPromise) {
    clientPromise = new MongoClient(uri, options).connect();
  }
  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await clientPromiseAl();
  return client.db(env.MONGODB_DB);
}
