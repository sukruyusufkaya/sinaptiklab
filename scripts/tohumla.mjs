/**
 * Fixture verisini MongoDB'ye tohumlar.
 *
 * Kullanım:
 *   node --experimental-strip-types scripts/tohumla.mjs
 *   node --experimental-strip-types scripts/tohumla.mjs --kuru      # yazmaz, rapor verir
 *   node --experimental-strip-types scripts/tohumla.mjs --sadece=atlas,modeller
 *
 * YIKICI DEĞİLDİR: her belge tekil anahtar alanı üzerinden UPSERT edilir.
 * Var olan kayıt güncellenir, fazlalık kayıt SİLİNMEZ. Panelden yapılmış
 * düzenlemeler fixture ile ezilir — bu yüzden tohumlama bir kereliktir ve
 * sonrasında Mongo tek doğruluk kaynağı olur.
 *
 * Dönüştürücüler `lib/tohum/*.ts` içindedir; fixture ile şema arasındaki
 * uyumsuzlukları onlar giderir (bkz. lib/tohum/tipler.ts başlığı).
 */

import { readFileSync, readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { MongoClient } from 'mongodb';

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
      /* dosya yok */
    }
  }
}

ortamYukle();

const URI = process.env.MONGODB_URI;
const VERITABANI = process.env.MONGODB_DB ?? 'sinaptiklab';
const KURU = process.argv.includes('--kuru');

const sadeceBayragi = process.argv.find((a) => a.startsWith('--sadece='));
const SADECE = sadeceBayragi
  ? new Set(
      sadeceBayragi
        .slice('--sadece='.length)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    )
  : null;

if (!URI) {
  console.error('HATA: MONGODB_URI tanımlı değil.');
  process.exit(1);
}

/* --- Dönüştürücüleri topla ---------------------------------------------- */

async function donusturuculeriYukle() {
  const dizin = resolve('lib/tohum');
  const dosyalar = readdirSync(dizin).filter((d) => d.endsWith('.ts') && d !== 'tipler.ts');

  const donusturucular = [];
  const hatalar = [];

  for (const dosya of dosyalar) {
    try {
      const modul = await import(pathToFileURL(resolve(dizin, dosya)).href);
      const bulunanlar = Object.values(modul).filter(
        (deger) =>
          deger &&
          typeof deger === 'object' &&
          typeof deger.koleksiyon === 'string' &&
          typeof deger.uret === 'function',
      );
      if (bulunanlar.length === 0) {
        hatalar.push({ dosya, ileti: 'Dönüştürücü dışa aktarılmamış.' });
        continue;
      }
      donusturucular.push(...bulunanlar);
    } catch (hata) {
      hatalar.push({ dosya, ileti: hata.message });
    }
  }

  return { donusturucular, hatalar };
}

/* --- Tohumla ------------------------------------------------------------- */

async function main() {
  const { donusturucular, hatalar } = await donusturuculeriYukle();

  if (hatalar.length) {
    console.error('Yüklenemeyen dönüştürücüler:');
    for (const h of hatalar) console.error(`  ${h.dosya}: ${h.ileti}`);
    console.error('');
  }

  const secilenler = SADECE
    ? donusturucular.filter((d) => SADECE.has(d.koleksiyon))
    : donusturucular;

  if (secilenler.length === 0) {
    console.error('HATA: Çalıştırılacak dönüştürücü yok.');
    process.exit(1);
  }

  console.log(`${secilenler.length} koleksiyon tohumlanacak${KURU ? ' (KURU ÇALIŞMA)' : ''}.`);
  console.log('');

  const istemci = new MongoClient(URI, {
    serverSelectionTimeoutMS: 20_000,
    ignoreUndefined: true,
  });
  await istemci.connect();
  const db = istemci.db(VERITABANI);

  let toplamEklenen = 0;
  let toplamGuncellenen = 0;
  const basarisizlar = [];

  for (const donusturucu of secilenler.sort((a, b) => a.koleksiyon.localeCompare(b.koleksiyon))) {
    let belgeler;
    try {
      belgeler = donusturucu.uret();
    } catch (hata) {
      console.error(`  ✗ ${donusturucu.koleksiyon}: dönüştürme hatası — ${hata.message}`);
      basarisizlar.push({ koleksiyon: donusturucu.koleksiyon, ileti: hata.message });
      continue;
    }

    if (!Array.isArray(belgeler)) {
      console.error(`  ✗ ${donusturucu.koleksiyon}: dönüştürücü dizi döndürmedi.`);
      continue;
    }

    if (KURU) {
      console.log(
        `  · ${donusturucu.koleksiyon.padEnd(22)} ${String(belgeler.length).padStart(4)} belge üretildi`,
      );
      // Kuru çalışmada ilk belgenin anahtarlarını göster — şema denetimi için.
      if (belgeler[0]) {
        console.log(`      alanlar: ${Object.keys(belgeler[0]).join(', ')}`);
      }
      continue;
    }

    let eklenen = 0;
    let guncellenen = 0;
    const belgeHatalari = [];

    for (const belge of belgeler) {
      const anahtar = belge[donusturucu.anahtarAlan];
      if (anahtar === undefined || anahtar === null) {
        belgeHatalari.push(`anahtar alanı (${donusturucu.anahtarAlan}) boş`);
        continue;
      }

      try {
        const simdi = new Date();
        const sonuc = await db
          .collection(donusturucu.koleksiyon)
          .updateOne(
            { [donusturucu.anahtarAlan]: anahtar },
            { $set: { ...belge, guncellendi: simdi }, $setOnInsert: { olusturuldu: simdi } },
            { upsert: true },
          );
        if (sonuc.upsertedCount) eklenen += 1;
        else if (sonuc.modifiedCount) guncellenen += 1;
      } catch (hata) {
        // Doğrulama hatasında hangi alanın reddedildiğini çıkar.
        const ayrinti = hata?.errInfo?.details?.schemaRulesNotSatisfied;
        const alanlar = new Set();
        const gez = (dugum) => {
          if (!dugum || typeof dugum !== 'object') return;
          if (Array.isArray(dugum)) return dugum.forEach(gez);
          if (typeof dugum.propertyName === 'string') alanlar.add(dugum.propertyName);
          if (Array.isArray(dugum.missingProperties)) {
            for (const e of dugum.missingProperties) alanlar.add(e);
          }
          Object.values(dugum).forEach(gez);
        };
        gez(ayrinti);

        belgeHatalari.push(
          `${anahtar}: ${hata.code === 121 ? `doğrulama — ${[...alanlar].join(', ') || 'bilinmeyen alan'}` : hata.message}`,
        );
      }
    }

    toplamEklenen += eklenen;
    toplamGuncellenen += guncellenen;

    const durum = belgeHatalari.length ? '✗' : '✓';
    console.log(
      `  ${durum} ${donusturucu.koleksiyon.padEnd(22)} +${String(eklenen).padStart(3)} eklendi  ~${String(guncellenen).padStart(3)} güncellendi  ${belgeHatalari.length ? `${belgeHatalari.length} HATA` : ''}`,
    );

    for (const ileti of belgeHatalari.slice(0, 5)) {
      console.error(`      ! ${ileti}`);
    }
    if (belgeHatalari.length > 5) {
      console.error(`      … ${belgeHatalari.length - 5} hata daha`);
    }
    if (belgeHatalari.length) {
      basarisizlar.push({ koleksiyon: donusturucu.koleksiyon, adet: belgeHatalari.length });
    }
  }

  console.log('');
  if (KURU) {
    console.log('Kuru çalışma tamamlandı; hiçbir şey yazılmadı.');
  } else {
    console.log(`Eklenen: ${toplamEklenen}  Güncellenen: ${toplamGuncellenen}`);
    if (basarisizlar.length) {
      console.error('');
      console.error('DOĞRULAMA HATASI ALAN KOLEKSİYONLAR:');
      for (const b of basarisizlar) {
        console.error(`  ${b.koleksiyon}: ${b.adet ?? '?'} belge`);
      }
      console.error('');
      console.error('Dönüştürücüyü şemayla karşılaştırın: lib/tohum/<koleksiyon>.ts');
      await istemci.close();
      process.exit(1);
    }
    console.log('Not: Hiçbir belge silinmedi; tümü upsert edildi.');
  }

  await istemci.close();
}

main().catch((hata) => {
  console.error('HATA:', hata.message);
  process.exitCode = 1;
});
