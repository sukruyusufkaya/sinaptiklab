// Mongo yardımcısı: node m.mjs '<js ifadesi>'  (db değişkeni hazır)
import { MongoClient } from 'mongodb';
import { readFileSync } from 'node:fs';

const kok = 'C:/Users/sukruyusuf/Desktop/Software Projects/sinaptiklab';
const ham = readFileSync(kok + '/.env.local', 'utf8');
const env = {};
for (const satir of ham.split(/\r?\n/)) {
  const m = satir.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const istemci = new MongoClient(env.MONGODB_URI, { ignoreUndefined: true });
await istemci.connect();
const db = istemci.db(env.MONGODB_DB || 'sinaptiklab');
const kod = process.argv[2];
const fn = new Function('db', 'MongoClient', `return (async () => { ${kod} })()`);
const sonuc = await fn(db, MongoClient);
if (sonuc !== undefined) console.log(JSON.stringify(sonuc, null, 2));
await istemci.close();
