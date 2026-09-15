/**
 * `lib/mongo/koleksiyonlar.ts` içindeki tanımları JSON'a çevirir.
 *
 * Kurulum scripti (mongo-kur.mjs) düz Node ile çalıştığı için TypeScript
 * modülünü doğrudan okuyamaz. Bu script tek doğruluk kaynağını korur: şemalar
 * yalnızca TypeScript tarafında tanımlanır, buradan türetilir.
 *
 * Kullanım:
 *   node scripts/mongo-semalari-uret.mjs
 */

import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const KAYNAK = resolve('lib/mongo/koleksiyonlar.ts');
const HEDEF = resolve('scripts/mongo-semalari.json');

const modul = await import(pathToFileURL(KAYNAK).href);

if (!Array.isArray(modul.TANIMLAR)) {
  console.error('HATA: TANIMLAR dizisi bulunamadı.');
  process.exit(1);
}

writeFileSync(HEDEF, `${JSON.stringify(modul.TANIMLAR, null, 2)}\n`, 'utf8');

const kisisel = modul.TANIMLAR.filter((t) => t.kisiselVeri).length;
const dizin = modul.TANIMLAR.reduce((t, k) => t + k.dizinler.length, 0);

console.log(`Yazıldı: scripts/mongo-semalari.json`);
console.log(`  Koleksiyon: ${modul.TANIMLAR.length}`);
console.log(`  Dizin: ${dizin}`);
console.log(`  Kişisel veri içeren: ${kisisel}`);
