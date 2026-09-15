/**
 * Node ESM çözümleyicisine iki yetenek ekler.
 *
 * 1. `@/` yol alias'ı — `tsconfig.json` içindeki `"@/*": ["./*"]` eşlemesini
 *    Node bilmez. Hem `lib/tohum/*.ts` dönüştürücüleri hem de onların içe
 *    aldığı `lib/veri/*.ts` fixture'ları bu alias'ı kullanıyor.
 *
 * 2. Uzantısız göreli import — TypeScript `./govde/atlas-derinlik` yazmaya
 *    izin verir, Node ESM vermez (uzantı zorunludur). Bundler olmadan
 *    çalıştırıldığında bu import "Cannot find module" ile düşer.
 *
 * Bu kanca olmadan `scripts/tohumla.mjs` fixture'ları hiç yükleyemez.
 * Kaydı `scripts/kanca-kaydi.mjs` yapar; betikler onu `--import` ile alır.
 */

import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve as yolCoz, dirname } from 'node:path';
import { existsSync, statSync } from 'node:fs';

const KOK = process.cwd();
const UZANTILAR = ['.ts', '.tsx', '.mjs', '.js', '.json'];

function dosyaBul(temel) {
  // Tam yol zaten bir dosyaysa onu kullan.
  if (existsSync(temel) && statSync(temel).isFile()) return temel;

  for (const uzanti of UZANTILAR) {
    const aday = temel + uzanti;
    if (existsSync(aday) && statSync(aday).isFile()) return aday;
  }

  // Dizinse index dosyasını dene.
  if (existsSync(temel) && statSync(temel).isDirectory()) {
    for (const uzanti of UZANTILAR) {
      const aday = yolCoz(temel, `index${uzanti}`);
      if (existsSync(aday)) return aday;
    }
  }

  return null;
}

export async function resolve(belirtec, baglam, sonraki) {
  // 1. Alias
  if (belirtec.startsWith('@/')) {
    const bulunan = dosyaBul(yolCoz(KOK, belirtec.slice(2)));
    if (bulunan) return { url: pathToFileURL(bulunan).href, shortCircuit: true };
  }

  // 2. Uzantısız göreli import
  if (belirtec.startsWith('./') || belirtec.startsWith('../')) {
    const temelUrl = baglam.parentURL;
    if (temelUrl?.startsWith('file:')) {
      const bulunan = dosyaBul(yolCoz(dirname(fileURLToPath(temelUrl)), belirtec));
      if (bulunan) return { url: pathToFileURL(bulunan).href, shortCircuit: true };
    }
  }

  return sonraki(belirtec, baglam);
}
