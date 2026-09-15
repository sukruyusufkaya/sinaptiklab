/**
 * Model ailesi künyelerini ve üyeliklerini uygular.
 *
 * Kullanım:
 *   node scripts/aile-tohumla.mjs --dizin=<yol>
 *   node scripts/aile-tohumla.mjs --dizin=<yol> --kuru    # yazmaz, denetler
 *
 * Girdi biçimi (her aile için bir JSON):
 *   { "hub": { ...model kaydı, aileMi: true... }, "uyeler": ["slug", ...] }
 *
 * NEDEN AYRI BETİK: `arastirma-tohumla.mjs` bağımsız kayıtları upsert eder.
 * Aile uygulaması İLİŞKİ yazar ve ilişkinin bütünlüğü ayrı denetim ister:
 * var olmayan üyeye bağ kurulamaz, bir model iki aileye ait olamaz, hub bir
 * başka ailenin üyesi olamaz. Bu denetimler geçmeden HİÇBİR ŞEY yazılmaz.
 *
 * YIKICI DEĞİLDİR: hiçbir belge silinmez. Tek "geri alma" işlemi, artık hiçbir
 * ailenin üyesi olmayan modellerden `aileSlug` alanının kaldırılmasıdır —
 * aksi hâlde listeden çıkarılan bir üye hub sayfasında yaşamaya devam ederdi.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { MongoClient } from 'mongodb';

function ortamYukle() {
  for (const dosya of ['.env.local', '.env']) {
    try {
      for (const satir of readFileSync(dosya, 'utf8').split(/\r?\n/)) {
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
      /* dosya yok */
    }
  }
}

ortamYukle();

const URI = process.env.MONGODB_URI;
const VERITABANI = process.env.MONGODB_DB ?? 'sinaptiklab';
const KURU = process.argv.includes('--kuru');
const dizinBayragi = process.argv.find((a) => a.startsWith('--dizin='));
const DIZIN = dizinBayragi ? dizinBayragi.slice('--dizin='.length) : null;

if (!URI) {
  console.error('HATA: MONGODB_URI tanımlı değil.');
  process.exit(1);
}
if (!DIZIN) {
  console.error('HATA: --dizin=<yol> gerekli.');
  process.exit(1);
}

async function semayaSor(db, sema, belge) {
  const sonuc = await db
    .aggregate([{ $documents: [belge] }, { $match: { $jsonSchema: sema } }])
    .toArray();
  return sonuc.length > 0;
}

async function main() {
  const yol = resolve(DIZIN);
  let adlar;
  try {
    adlar = readdirSync(yol).filter((d) => d.endsWith('.json'));
  } catch (hata) {
    console.error(`HATA: dizin okunamadı (${yol}): ${hata.message}`);
    process.exit(1);
  }

  const aileler = [];
  for (const ad of adlar.sort()) {
    try {
      const icerik = JSON.parse(readFileSync(resolve(yol, ad), 'utf8'));
      if (!icerik.hub?.slug) {
        console.error(`  ${ad}: hub.slug yok, atlandı`);
        continue;
      }
      aileler.push({ dosya: ad, hub: icerik.hub, uyeler: icerik.uyeler ?? [] });
    } catch (hata) {
      console.error(`  ${ad}: bozuk JSON — ${hata.message}`);
    }
  }

  console.log(
    `${aileler.length} aile dosyası okundu: ${aileler.map((a) => a.hub.slug).join(', ')}`,
  );

  const istemci = new MongoClient(URI, { serverSelectionTimeoutMS: 20_000, ignoreUndefined: true });
  await istemci.connect();
  const db = istemci.db(VERITABANI);
  const koleksiyon = db.collection('modeller');

  const [tanim] = await db.listCollections({ name: 'modeller' }).toArray();
  const sema = tanim?.options?.validator?.$jsonSchema;
  if (!sema) {
    console.error('HATA: modeller koleksiyonunda doğrulayıcı yok. Önce: npm run mongo:kur');
    await istemci.close();
    process.exit(1);
  }

  const mevcutSluglar = new Set(await koleksiyon.distinct('slug'));
  const hubSluglari = new Set(aileler.map((a) => a.hub.slug));

  /* --- Bütünlük denetimleri: hiçbiri geçmezse yazma yok ----------------- */

  const sorunlar = [];
  const sahip = new Map(); // uye slug -> aile slug

  for (const aile of aileler) {
    if (!mevcutSluglar.has(aile.hub.slug)) {
      sorunlar.push(`${aile.hub.slug}: hub kaydı veritabanında YOK (yeni hub oluşturulmuyor)`);
    }
    if (aile.hub.aileMi !== true) {
      sorunlar.push(`${aile.hub.slug}: hub kaydında aileMi: true eksik`);
    }
    if (aile.hub.aileSlug !== undefined) {
      sorunlar.push(`${aile.hub.slug}: hub kaydında aileSlug YAZILMAMALI (üstü yok)`);
    }

    for (const uye of aile.uyeler) {
      if (!mevcutSluglar.has(uye)) {
        sorunlar.push(`${aile.hub.slug}: üye "${uye}" veritabanında yok`);
        continue;
      }
      if (hubSluglari.has(uye)) {
        sorunlar.push(`${aile.hub.slug}: üye "${uye}" bir aile hub'ı — üye olamaz`);
        continue;
      }
      const oncekiSahip = sahip.get(uye);
      if (oncekiSahip && oncekiSahip !== aile.hub.slug) {
        sorunlar.push(`"${uye}" iki aileye ait: ${oncekiSahip} ve ${aile.hub.slug}`);
        continue;
      }
      sahip.set(uye, aile.hub.slug);
    }

    // `aileSlug` hub'da bulunmamalı; doğrulamaya da o hâliyle sorulur.
    const temizHub = { ...aile.hub };
    delete temizHub.aileSlug;
    if (!(await semayaSor(db, sema, temizHub))) {
      sorunlar.push(`${aile.hub.slug}: hub kaydı şema doğrulamasını GEÇMİYOR`);
    }
  }

  console.log('');
  for (const aile of aileler) {
    const gecerli = aile.uyeler.filter((u) => sahip.get(u) === aile.hub.slug);
    console.log(`  ${aile.hub.slug.padEnd(16)} ${String(gecerli.length).padStart(3)} üye`);
  }

  if (sorunlar.length) {
    console.error('');
    console.error(`BÜTÜNLÜK SORUNLARI (${sorunlar.length}):`);
    for (const s of sorunlar) console.error(`  ${s}`);
  }

  /* --- Artık üye olmayanlar --------------------------------------------- */

  const eskiUyeler = await koleksiyon.distinct('aileSlug');
  const bosaltilacak = [];
  if (eskiUyeler.length) {
    for (const belge of await koleksiyon
      .find({ aileSlug: { $exists: true } }, { projection: { slug: 1, aileSlug: 1, _id: 0 } })
      .toArray()) {
      if (sahip.get(belge.slug) !== belge.aileSlug) bosaltilacak.push(belge.slug);
    }
  }

  if (bosaltilacak.length) {
    console.log('');
    console.log(`Aile bağı KALDIRILACAK (${bosaltilacak.length}): ${bosaltilacak.join(', ')}`);
  }

  if (KURU) {
    console.log('');
    console.log('Kuru çalışma tamamlandı; hiçbir şey yazılmadı.');
    await istemci.close();
    process.exit(sorunlar.length ? 1 : 0);
  }

  if (sorunlar.length) {
    console.error('');
    console.error('Bütünlük sorunları var; HİÇBİR ŞEY YAZILMADI. Önce sorunları giderin.');
    await istemci.close();
    process.exit(1);
  }

  /* --- Uygula ----------------------------------------------------------- */

  const simdi = new Date();
  let hubGuncellenen = 0;
  let uyeGuncellenen = 0;

  for (const aile of aileler) {
    const hub = { ...aile.hub };
    delete hub.aileSlug;
    const sonuc = await koleksiyon.updateOne(
      { slug: hub.slug },
      { $set: { ...hub, guncellendi: simdi }, $unset: { aileSlug: '' } },
    );
    if (sonuc.modifiedCount) hubGuncellenen += 1;
  }

  for (const [uye, aileSlug] of sahip) {
    const sonuc = await koleksiyon.updateOne(
      { slug: uye },
      { $set: { aileSlug, guncellendi: simdi } },
    );
    if (sonuc.modifiedCount) uyeGuncellenen += 1;
  }

  let temizlenen = 0;
  if (bosaltilacak.length) {
    const sonuc = await koleksiyon.updateMany(
      { slug: { $in: bosaltilacak } },
      { $unset: { aileSlug: '' }, $set: { guncellendi: simdi } },
    );
    temizlenen = sonuc.modifiedCount;
  }

  console.log('');
  console.log(`Hub güncellendi: ${hubGuncellenen}  Üye bağı yazıldı: ${uyeGuncellenen}`);
  if (temizlenen) console.log(`Eski aile bağı kaldırıldı: ${temizlenen}`);
  console.log('Not: Hiçbir belge silinmedi.');

  const hubAdet = await koleksiyon.countDocuments({ aileMi: true });
  const bagliAdet = await koleksiyon.countDocuments({ aileSlug: { $exists: true } });
  console.log(`  aile hub'ı: ${hubAdet}  |  aileye bağlı model: ${bagliAdet}`);

  await istemci.close();
}

main().catch((hata) => {
  console.error('HATA:', hata.message);
  process.exitCode = 1;
});
