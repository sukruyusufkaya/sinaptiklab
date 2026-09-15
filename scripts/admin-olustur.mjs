/**
 * Panel kullanıcısı oluşturur veya günceller.
 *
 * Parola KOMUT SATIRINDA veya .env.local içinde ortam değişkeni olarak verilir;
 * scripte gömülmez ve veritabanına yalnızca scrypt özeti yazılır.
 *
 * Kullanım:
 *   ADMIN_EPOSTA=... ADMIN_PAROLA=... node --experimental-strip-types scripts/admin-olustur.mjs
 *
 * Seçenekler:
 *   --rol=sahip|yonetici|editor|yazar|moderator   (varsayılan: sahip)
 *   --ad="Ad Soyad"
 *   --yazar-slug=sukru-yusuf-kaya
 *   --parola-yenile        var olan kullanıcının parolasını değiştirir ve
 *                          tüm oturumlarını iptal eder
 *
 * Var olan bir e-posta için parola verilmişse parola güncellenir; verilmemişse
 * yalnızca rol/ad güncellenir. Hiçbir kullanıcı silinmez.
 */

import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { MongoClient, ObjectId } from 'mongodb';

/**
 * TypeScript modülü dinamik olarak alınır: Node'un tür soyma (strip-types)
 * desteği .mjs içinden STATİK `.ts` import'unu çözemiyor.
 */
const { parolaGucunuDenetle, parolaOzetle } = await import(
  pathToFileURL(resolve('lib/yetki/parola.ts')).href
);

/* --- Ortam --------------------------------------------------------------- */

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
      /* dosya yok — sorun değil */
    }
  }
}

ortamYukle();

function bayrak(ad, varsayilan = undefined) {
  const onek = `--${ad}=`;
  const bulunan = process.argv.find((a) => a.startsWith(onek));
  return bulunan ? bulunan.slice(onek.length) : varsayilan;
}

const URI = process.env.MONGODB_URI;
const VERITABANI = process.env.MONGODB_DB ?? 'sinaptiklab';
const EPOSTA = (process.env.ADMIN_EPOSTA ?? '').trim().toLowerCase();
const PAROLA = process.env.ADMIN_PAROLA ?? '';
const ROL = bayrak('rol', 'sahip');
const AD = bayrak('ad');
const YAZAR_SLUG = bayrak('yazar-slug');
const PAROLA_YENILE = process.argv.includes('--parola-yenile');

const GECERLI_ROLLER = ['sahip', 'yonetici', 'editor', 'yazar', 'moderator'];

if (!URI) {
  console.error('HATA: MONGODB_URI tanımlı değil.');
  process.exit(1);
}
if (!EPOSTA || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(EPOSTA)) {
  console.error('HATA: ADMIN_EPOSTA geçerli bir e-posta olmalı.');
  process.exit(1);
}
if (!GECERLI_ROLLER.includes(ROL)) {
  console.error(`HATA: --rol şunlardan biri olmalı: ${GECERLI_ROLLER.join(', ')}`);
  process.exit(1);
}

/* --- Kurulum ------------------------------------------------------------- */

async function main() {
  console.log('Bağlanıyor…');
  const istemci = new MongoClient(URI, { serverSelectionTimeoutMS: 15_000, ignoreUndefined: true });
  await istemci.connect();
  console.log('bağlandı.');
  const db = istemci.db(VERITABANI);
  const kullanicilar = db.collection('kullanicilar');

  const mevcut = await kullanicilar.findOne({ eposta: EPOSTA });
  const simdi = new Date();

  // Parola yalnızca yeni kullanıcıda veya açıkça istendiğinde yazılır.
  const parolaYazilacak = PAROLA && (!mevcut || PAROLA_YENILE);

  if (!mevcut && !PAROLA) {
    console.error('HATA: Yeni kullanıcı için ADMIN_PAROLA gerekli.');
    await istemci.close();
    process.exit(1);
  }

  let parolaOzeti;
  if (parolaYazilacak) {
    const guc = parolaGucunuDenetle(PAROLA, EPOSTA);
    if (!guc.gecerli) {
      console.error('HATA: Parola politikayı karşılamıyor:');
      for (const sorun of guc.sorunlar) console.error(`  · ${sorun}`);
      await istemci.close();
      process.exit(1);
    }
    parolaOzeti = await parolaOzetle(PAROLA);
  }

  const guncelleme = {
    eposta: EPOSTA,
    durum: 'aktif',
    epostaDogrulandi: true,
    roller: [ROL],
    guncellendi: simdi,
  };
  if (AD) guncelleme.adSoyad = AD;
  if (YAZAR_SLUG) guncelleme.yazarSlug = YAZAR_SLUG;
  if (parolaOzeti) {
    guncelleme.parolaOzeti = parolaOzeti;
    guncelleme.parolaGuncellendi = simdi;
    guncelleme.basarisizGiris = 0;
  }

  // Kilit varsa parola değişiminde kaldırılır.
  const kilitKaldir = parolaOzeti ? { $unset: { kilitBitis: '' } } : {};

  const sonuc = await kullanicilar.findOneAndUpdate(
    { eposta: EPOSTA },
    {
      $set: guncelleme,
      $setOnInsert: { olusturuldu: simdi },
      ...kilitKaldir,
    },
    { upsert: true, returnDocument: 'after' },
  );

  const kimlik = sonuc?._id ?? (await kullanicilar.findOne({ eposta: EPOSTA }))?._id;

  // Parola değiştiyse eski oturumlar geçersiz kılınır.
  let iptalEdilen = 0;
  if (parolaOzeti && mevcut) {
    const iptal = await db
      .collection('oturumlar')
      .updateMany(
        { kullaniciKimligi: new ObjectId(kimlik), iptalEdildi: { $ne: true } },
        { $set: { iptalEdildi: true, iptalNedeni: 'parola-degisti', biterZaman: simdi } },
      );
    iptalEdilen = iptal.modifiedCount;
  }

  await db.collection('denetim_kaydi').insertOne({
    eylem: mevcut ? 'guncelle' : 'olustur',
    koleksiyon: 'kullanicilar',
    belgeKimligi: String(kimlik),
    kullaniciEpostasi: EPOSTA,
    zaman: simdi,
    not: `scripts/admin-olustur.mjs ile ${mevcut ? 'güncellendi' : 'oluşturuldu'} (rol: ${ROL}${parolaOzeti ? ', parola yazıldı' : ''})`,
    basarili: true,
    olusturuldu: simdi,
  });

  /* --- Rapor --- */
  console.log('');
  console.log(mevcut ? 'Kullanıcı güncellendi.' : 'Kullanıcı oluşturuldu.');
  console.log(`  E-posta   : ${EPOSTA}`);
  console.log(`  Kimlik    : ${kimlik}`);
  console.log(`  Rol       : ${ROL}`);
  if (AD) console.log(`  Ad        : ${AD}`);
  if (YAZAR_SLUG) console.log(`  Yazar     : ${YAZAR_SLUG}`);
  console.log(`  Durum     : aktif`);
  if (parolaOzeti) {
    // Parolanın kendisi DEĞİL, yalnızca özetin parmak izi yazdırılır.
    const parmakIzi = createHash('sha256').update(parolaOzeti).digest('hex').slice(0, 12);
    console.log(`  Parola    : scrypt özeti yazıldı (parmak izi ${parmakIzi})`);
    if (iptalEdilen) console.log(`  Oturumlar : ${iptalEdilen} oturum iptal edildi`);
  } else {
    console.log('  Parola    : değiştirilmedi');
  }
  console.log('');
  console.log('Panel: /admin/giris/');
  console.log('');

  await istemci.close();
}

main().catch((hata) => {
  console.error('HATA:', hata.message);
  process.exitCode = 1;
});
