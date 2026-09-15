/**
 * MongoDB koleksiyonlarını, şema doğrulayıcılarını ve dizinlerini kurar.
 *
 * Kullanım:
 *   node scripts/mongo-kur.mjs            # kur / güncelle
 *   node scripts/mongo-kur.mjs --kontrol  # yalnızca mevcut durumu raporla
 *
 * Bağlantı dizesi `.env.local` içindeki MONGODB_URI değerinden okunur.
 * Script yıkıcı değildir: var olan koleksiyonu silmez, yalnızca doğrulayıcıyı
 * ve dizinleri günceller. Veri asla silinmez.
 */

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { MongoClient } from 'mongodb';

const require = createRequire(import.meta.url);

/* --- Ortam değişkenleri -------------------------------------------------- */

function ortamYukle() {
  for (const dosya of ['.env.local', '.env']) {
    try {
      const metin = readFileSync(dosya, 'utf8');
      for (const satir of metin.split(/\r?\n/)) {
        const kirpik = satir.trim();
        if (!kirpik || kirpik.startsWith('#')) continue;
        const esittir = kirpik.indexOf('=');
        if (esittir === -1) continue;
        const anahtar = kirpik.slice(0, esittir).trim();
        let deger = kirpik.slice(esittir + 1).trim();
        if (
          (deger.startsWith('"') && deger.endsWith('"')) ||
          (deger.startsWith("'") && deger.endsWith("'"))
        ) {
          deger = deger.slice(1, -1);
        }
        if (!(anahtar in process.env)) process.env[anahtar] = deger;
      }
    } catch {
      // dosya yok — sorun değil
    }
  }
}

ortamYukle();

const URI = process.env.MONGODB_URI;
const VERITABANI = process.env.MONGODB_DB ?? 'sinaptiklab';
const YALNIZ_KONTROL = process.argv.includes('--kontrol');

if (!URI) {
  console.error('HATA: MONGODB_URI tanımlı değil. `.env.local` dosyasını kontrol edin.');
  process.exit(1);
}

/* --- Tanımları TypeScript modülünden al --------------------------------- */
/* Node, .ts dosyasını doğrudan çalıştıramadığı için tanımlar JSON olarak
   dışa aktarılır. `mongo-semalari-uret.mjs` bu dosyayı üretir. */

let TANIMLAR;
try {
  TANIMLAR = require('./mongo-semalari.json');
} catch {
  console.error(
    'HATA: scripts/mongo-semalari.json bulunamadı.\n' +
      'Önce şema dosyasını üretin:  node scripts/mongo-semalari-uret.mjs',
  );
  process.exit(1);
}

/* --- Kurulum ------------------------------------------------------------- */

function maskeliUri(uri) {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
}

async function main() {
  console.log(`Bağlanıyor: ${maskeliUri(URI)}`);
  const istemci = new MongoClient(URI, { serverSelectionTimeoutMS: 15_000, ignoreUndefined: true });
  await istemci.connect();

  const db = istemci.db(VERITABANI);
  const mevcut = new Set(
    (await db.listCollections({}, { nameOnly: true }).toArray()).map((k) => k.name),
  );

  console.log(`Veritabanı: ${VERITABANI}`);
  console.log(`Mevcut koleksiyon sayısı: ${mevcut.size}`);
  console.log(`Tanımlı koleksiyon sayısı: ${TANIMLAR.length}`);
  console.log('');

  let olusturulan = 0;
  let guncellenen = 0;
  let dizinSayisi = 0;
  const dizinHatalari = [];

  for (const tanim of TANIMLAR) {
    const { ad, sema, dizinler, aciklama, kisiselVeri } = tanim;
    const etiket = kisiselVeri ? ' [kişisel veri]' : '';

    if (YALNIZ_KONTROL) {
      const durum = mevcut.has(ad) ? 'var' : 'YOK';
      const adet = mevcut.has(ad) ? await db.collection(ad).countDocuments() : 0;
      const dizin = mevcut.has(ad) ? (await db.collection(ad).indexes()).length : 0;
      console.log(
        `  ${ad.padEnd(24)} ${durum.padEnd(4)} belge: ${String(adet).padStart(6)}  dizin: ${dizin}${etiket}`,
      );
      continue;
    }

    if (!mevcut.has(ad)) {
      await db.createCollection(ad, {
        validator: sema,
        validationLevel: 'moderate',
        validationAction: 'error',
      });
      olusturulan++;
      console.log(`  + ${ad}${etiket}`);
    } else {
      await db.command({
        collMod: ad,
        validator: sema,
        validationLevel: 'moderate',
        validationAction: 'error',
      });
      guncellenen++;
      console.log(`  ~ ${ad}${etiket}`);
    }

    // Koleksiyon açıklamasını ayrı bir üst veri koleksiyonunda tut.
    await db.collection('_koleksiyon_kunyesi').updateOne(
      { ad },
      {
        $set: {
          ad,
          aciklama,
          kisiselVeri: Boolean(kisiselVeri),
          dizinSayisi: dizinler.length,
          guncellendi: new Date(),
        },
      },
      { upsert: true },
    );

    for (const { anahtar, secenekler } of dizinler) {
      try {
        await db.collection(ad).createIndex(anahtar, secenekler ?? {});
        dizinSayisi++;
      } catch (hata) {
        // Dizin hatası YUTULMAZ. Sessizce kurulmayan bir TTL dizini
        // "oturumlar hiç süresi dolmuyor" veya "kişisel veri hiç silinmiyor"
        // demektir; betik başarı raporlarsa bu fark edilmez.
        dizinHatalari.push({
          koleksiyon: ad,
          dizin: secenekler?.name ?? 'adsız',
          ileti: hata.message,
        });
        console.error(`    ! DİZİN HATASI (${secenekler?.name ?? 'adsız'}): ${hata.message}`);
      }
    }
  }

  console.log('');
  if (YALNIZ_KONTROL) {
    console.log('Kontrol tamamlandı (hiçbir şey değiştirilmedi).');
  } else {
    console.log(`Oluşturulan: ${olusturulan}  Güncellenen: ${guncellenen}  Dizin: ${dizinSayisi}`);
    console.log('Not: Hiçbir koleksiyon veya belge silinmedi.');

    if (dizinHatalari.length) {
      console.error('');
      console.error(`${dizinHatalari.length} DİZİN KURULAMADI — bu ölümcül sayılır:`);
      for (const h of dizinHatalari) {
        console.error(`  ${h.koleksiyon}.${h.dizin}: ${h.ileti}`);
      }
      console.error('');
      console.error('Aynı adla farklı seçeneklere sahip bir dizin varsa önce onu düşürün:');
      console.error('  db.<koleksiyon>.dropIndex("<dizin-adı>")');
      await istemci.close();
      process.exit(1);
    }
  }

  await istemci.close();
}

main().catch((hata) => {
  console.error('HATA:', hata.message);
  process.exitCode = 1;
});
