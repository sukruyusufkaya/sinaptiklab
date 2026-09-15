import { MongoClient, type Db } from 'mongodb';

/**
 * MongoDB bağlantısı.
 *
 * Next.js geliştirme modunda modüller sıcak yeniden yüklendiği için istemci
 * `globalThis` üzerinde önbelleğe alınır; aksi hâlde her yeniden yüklemede yeni
 * bir bağlantı havuzu açılır ve Atlas bağlantı limiti tükenir.
 *
 * Bağlantı dizesi ASLA kod içine yazılmaz; `MONGODB_URI` ortam değişkeninden
 * okunur (bkz. `.env.example`).
 */

const URI = process.env.MONGODB_URI;
const VERITABANI = process.env.MONGODB_DB ?? 'sinaptiklab';

declare global {
  var __sinaptikMongo: Promise<MongoClient> | undefined;
}

function istemciKur(): Promise<MongoClient> {
  if (!URI) {
    throw new Error(
      'MONGODB_URI tanımlı değil. `.env.local` dosyasına Atlas bağlantı dizesini ekleyin.',
    );
  }

  const istemci = new MongoClient(URI, {
    // Yazma işlemleri çoğunluk tarafından onaylanmadan başarılı sayılmaz.
    writeConcern: { w: 'majority' },
    retryWrites: true,
    /**
     * `undefined` alanlar BELGEYE HİÇ YAZILMAZ.
     *
     * Varsayılan davranış `undefined` değeri `null` olarak serialize eder;
     * şemada `bsonType: 'objectId'` veya `'date'` olan opsiyonel bir alan
     * null geldiğinde "Document failed validation" ile reddedilir. İsteğe
     * bağlı alanları olan her belgede bu tuzağa düşülür.
     */
    ignoreUndefined: true,
    // Vercel'de soğuk başlangıçta havuzu küçük tutmak gecikmeyi düşürür.
    maxPoolSize: 10,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 10_000,
  });

  return istemci.connect();
}

/** Üretimde süreç başına tek bağlantı sözü; modül kapsamı bunun için yeterli. */
let uretimSozu: Promise<MongoClient> | undefined;

/**
 * Bağlantı sözünü kurar ve REDDEDİLİRSE kendini önbellekten düşürür.
 *
 * Reddedilmiş bir söz önbellekte kalsaydı, tek bir geçici ağ hatası o
 * süreçteki bütün sonraki sayfaları kalıcı olarak zehirlerdi: hiçbiri
 * yeniden bağlanmayı denemezdi.
 */
function sozKur(): Promise<MongoClient> {
  const soz: Promise<MongoClient> = istemciKur().catch((hata: unknown) => {
    if (uretimSozu === soz) uretimSozu = undefined;
    if (globalThis.__sinaptikMongo === soz) globalThis.__sinaptikMongo = undefined;
    throw hata;
  });
  return soz;
}

/**
 * Paylaşılan bağlantı havuzu.
 *
 * HER ÇAĞRIDA YENİ İSTEMCİ KURULMAZ. `veritabani()` sayfa başına onlarca kez
 * çağrılır; derlemede Next bunu onlarca işçi sürecine dağıtır. Her çağrı kendi
 * istemcisini kursa her biri kendi TLS el sıkışmasını ve havuzunu açar, Atlas
 * eşzamanlı bağlantı sınırı aşılır ve derleme
 * `SystemOverloadedError: tlsv1 alert internal error` ile düşer.
 *
 * Geliştirmede söz `globalThis` üzerinde tutulur (sıcak yeniden yükleme modül
 * kapsamını sıfırlar); üretimde modül kapsamı kalıcıdır.
 */
export function mongoIstemcisi(): Promise<MongoClient> {
  if (process.env.NODE_ENV === 'production') {
    return (uretimSozu ??= sozKur());
  }
  return (globalThis.__sinaptikMongo ??= sozKur());
}

export async function veritabani(): Promise<Db> {
  const istemci = await mongoIstemcisi();
  return istemci.db(VERITABANI);
}

/** Ortam değişkeni yoksa `false` döner; sayfalar yer tutucu veriye düşebilir. */
export function mongoYapilandirildiMi() {
  return Boolean(URI);
}

export const VERITABANI_ADI = VERITABANI;
