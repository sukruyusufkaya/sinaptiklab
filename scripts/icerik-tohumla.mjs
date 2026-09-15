/**
 * Araştırma/üretim çıktısını (JSON) herhangi bir koleksiyona tohumlar.
 *
 * Kullanım:
 *   node scripts/icerik-tohumla.mjs --dizin=<yol>
 *   node scripts/icerik-tohumla.mjs --dizin=<yol> --kuru          # yazmaz, denetler
 *   node scripts/icerik-tohumla.mjs --dizin=<yol> --sadece=konular,araclar
 *
 * Girdi biçimi: { "<koleksiyon adı>": [ ...belgeler... ] }
 * Bir dosya birden çok koleksiyon taşıyabilir; birden çok dosya aynı koleksiyona
 * yazabilir (parçalara bölünmüş üretim böyle birleşir).
 *
 * `arastirma-tohumla.mjs` yalnızca `modeller` ve `sirketler` biliyordu. Bu betik
 * koleksiyon adını DOSYADAN okur, dolayısıyla yeni bir koleksiyon eklendiğinde
 * betik değişmez.
 *
 * DÖRT AŞAMA
 *
 * 1. **Birleştirme.** Aynı anahtar iki dosyada varsa ilki korunur, çakışma
 *    bildirilir — sessizce ezmek hangi ajanın verisinin kazandığını belirsiz
 *    bırakırdı.
 * 2. **Kategori yazımını birleştirme.** `tip`, `tur`, `kategori`, `kume` gibi
 *    FİLTRE alanlarında "Görsel üretimi" ile "Gorsel uretimi" aynı şeydir; iki
 *    yazım panelde iki filtre çipi demek. Türkçe aksanlı biçim kazanır.
 * 3. **Şemaya karşı ön denetim.** Her belge Atlas'taki CANLI doğrulayıcıya
 *    sorulur — HİÇBİR ŞEY YAZILMADAN. Geçersiz belge yazılmaz ve suçlu alan
 *    adıyla bildirilir.
 * 4. **Upsert.** Koleksiyonun anahtar alanı üzerinden. YIKICI DEĞİLDİR.
 */

import { readFileSync, readdirSync } from 'node:fs';
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
const dizinBayragi = process.argv.find((a) => a.startsWith('--dizin='));
const DIZIN = dizinBayragi ? dizinBayragi.slice('--dizin='.length) : null;
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
if (!DIZIN) {
  console.error('HATA: --dizin=<yol> gerekli.');
  process.exit(1);
}

/**
 * Koleksiyonun tekil anahtar alanı.
 *
 * Varsayılan `slug`; yalnızca istisnalar yazılır. `sorular` koleksiyonu `slug`
 * TAŞIMAZ — anahtarı `kimlik`'tir (soru bankası kimlikleri `rag_013` gibi).
 */
const ANAHTAR_ALAN = {
  sorular: 'kimlik',
  briefler: 'tarih',
  medya: 'kimlik',
  ayarlar: 'anahtar',
  yonlendirmeler: 'kaynakYol',
};

/** Filtre yüzeyi olan, yazım birliği gereken alanlar. */
const KATEGORI_ALANLARI = ['tip', 'tur', 'kategori', 'kume', 'rol', 'seviye', 'zorluk'];

/* --- Kategori yazımını birleştirme -------------------------------------- */

/** Türkçe harfleri ASCII'ye katlar — yalnızca KARŞILAŞTIRMA için. */
function asciiyeKatla(metin) {
  const es = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' };
  return [...metin.toLowerCase()].map((h) => es[h] ?? h).join('');
}

const AKSANLAR = 'çğıöşüÇĞİÖŞÜâîû';

/**
 * Aynı kategoriyi farklı yazan kayıtları tek yazıma indirir.
 *
 * KAZANAN: Türkçe aksan taşıyan biçim, SAYIDAN BAĞIMSIZ. Sıklık burada yanlış
 * sinyaldir — ASCII varyantlar üretim brifinglerindeki ASCII örneklerden doğuyor
 * ve çoğunluğa ulaşabiliyor; çoğunluk editoryal tercihi değil, brifing hatasının
 * yayılmasını ölçer. Türkçe bir sitede filtre etiketi doğru yazılır.
 */
function kategorileriBirlestir(belgeler, alan) {
  const sayac = new Map();
  for (const belge of belgeler) {
    const deger = belge[alan];
    if (typeof deger !== 'string' || !deger) continue;
    sayac.set(deger, (sayac.get(deger) ?? 0) + 1);
  }

  const gruplar = new Map();
  for (const [deger, adet] of sayac) {
    const anahtar = asciiyeKatla(deger);
    if (!gruplar.has(anahtar)) gruplar.set(anahtar, []);
    gruplar.get(anahtar).push({ deger, adet });
  }

  const esleme = new Map();
  const birlesenler = [];

  for (const uyeler of gruplar.values()) {
    if (uyeler.length < 2) continue;
    uyeler.sort((a, b) => {
      const aksan = (m) => [...m].filter((h) => AKSANLAR.includes(h)).length;
      const fark = aksan(b.deger) - aksan(a.deger);
      return fark !== 0 ? fark : b.adet - a.adet;
    });
    const [kazanan, ...kaybedenler] = uyeler;
    for (const k of kaybedenler) esleme.set(k.deger, kazanan.deger);
    birlesenler.push(
      `${alan}: "${kazanan.deger}" <- ${kaybedenler.map((k) => `"${k.deger}" (${k.adet})`).join(', ')}`,
    );
  }

  let degisen = 0;
  for (const belge of belgeler) {
    const yeni = esleme.get(belge[alan]);
    if (yeni) {
      belge[alan] = yeni;
      degisen += 1;
    }
  }

  return { birlesenler, degisen };
}

/* --- Şema ön denetimi ---------------------------------------------------- */

async function semayaSor(db, sema, belge) {
  const sonuc = await db
    .aggregate([{ $documents: [belge] }, { $match: { $jsonSchema: sema } }])
    .toArray();
  return sonuc.length > 0;
}

/** Geçersiz belgede suçlu alanı alan alan daraltır. */
async function sucluAlanlar(db, sema, belge) {
  const zorunlular = new Set(sema.required ?? []);
  const eksikZorunlu = [...zorunlular].filter((a) => belge[a] === undefined);
  if (eksikZorunlu.length) return { suclular: [], eksikZorunlu };

  const suclular = [];
  for (const alan of Object.keys(belge)) {
    if (zorunlular.has(alan)) continue;
    const kirpik = { ...belge };
    delete kirpik[alan];
    if (await semayaSor(db, sema, kirpik)) suclular.push(alan);
  }
  return { suclular, eksikZorunlu };
}

/* --- Ana akış ------------------------------------------------------------ */

async function main() {
  const yol = resolve(DIZIN);
  let adlar;
  try {
    adlar = readdirSync(yol).filter((d) => d.endsWith('.json'));
  } catch (hata) {
    console.error(`HATA: dizin okunamadı (${yol}): ${hata.message}`);
    process.exit(1);
  }

  /** koleksiyon -> [{ dosya, belge }] */
  const toplam = new Map();
  const bozuk = [];

  for (const ad of adlar.sort()) {
    let icerik;
    try {
      icerik = JSON.parse(readFileSync(resolve(yol, ad), 'utf8'));
    } catch (hata) {
      bozuk.push(`${ad}: ${hata.message}`);
      continue;
    }
    for (const [koleksiyon, belgeler] of Object.entries(icerik)) {
      if (!Array.isArray(belgeler)) continue;
      if (SADECE && !SADECE.has(koleksiyon)) continue;
      if (!toplam.has(koleksiyon)) toplam.set(koleksiyon, []);
      for (const belge of belgeler) toplam.get(koleksiyon).push({ dosya: ad, belge });
    }
  }

  console.log(`${adlar.length} JSON dosyası okundu: ${adlar.join(', ')}`);
  if (bozuk.length) {
    console.error('');
    console.error('BOZUK JSON:');
    for (const b of bozuk) console.error(`  ${b}`);
  }
  if (toplam.size === 0) {
    console.error('HATA: işlenecek kayıt yok.');
    process.exit(1);
  }

  const istemci = new MongoClient(URI, { serverSelectionTimeoutMS: 20_000, ignoreUndefined: true });
  await istemci.connect();
  const db = istemci.db(VERITABANI);

  let toplamEklenen = 0;
  let toplamGuncellenen = 0;
  const gecersizler = [];

  for (const [koleksiyon, girdiler] of [...toplam].sort()) {
    const anahtar = ANAHTAR_ALAN[koleksiyon] ?? 'slug';

    const [tanim] = await db.listCollections({ name: koleksiyon }).toArray();
    const sema = tanim?.options?.validator?.$jsonSchema;
    if (!sema) {
      console.error(`\n${koleksiyon}: doğrulayıcı yok (koleksiyon tanımsız mı?). ATLANDI.`);
      continue;
    }

    /* Birleştirme: aynı anahtar iki dosyada varsa ilki kazanır. */
    const harita = new Map();
    const cakismalar = [];
    for (const { dosya, belge } of girdiler) {
      const deger = belge?.[anahtar];
      if (deger === undefined || deger === null || deger === '') {
        cakismalar.push(`${dosya}: "${anahtar}" alanı boş bir kayıt atlandı`);
        continue;
      }
      if (harita.has(deger)) {
        cakismalar.push(`${deger}: ${harita.get(deger).dosya} korundu, ${dosya} atlandı`);
        continue;
      }
      harita.set(deger, { dosya, belge });
    }

    const belgeler = [...harita.values()].map((x) => x.belge);

    /* Kategori yazımı birliği. */
    const birlesenler = [];
    let normalize = 0;
    for (const alan of KATEGORI_ALANLARI) {
      const sonuc = kategorileriBirlestir(belgeler, alan);
      birlesenler.push(...sonuc.birlesenler);
      normalize += sonuc.degisen;
    }

    /* Ön denetim. */
    const gecerli = [];
    for (const belge of belgeler) {
      if (await semayaSor(db, sema, belge)) {
        gecerli.push(belge);
      } else {
        const { suclular, eksikZorunlu } = await sucluAlanlar(db, sema, belge);
        gecersizler.push({ koleksiyon, anahtar: belge[anahtar], suclular, eksikZorunlu });
      }
    }

    console.log('');
    console.log(
      `${koleksiyon}  (anahtar: ${anahtar})  ${belgeler.length} tekil, ${gecerli.length} geçerli`,
    );
    for (const c of cakismalar.slice(0, 5)) console.log(`  ÇAKIŞMA ${c}`);
    if (cakismalar.length > 5) console.log(`  … ${cakismalar.length - 5} çakışma daha`);
    for (const b of birlesenler) console.log(`  YAZIM   ${b}`);
    if (normalize) console.log(`  → ${normalize} kayıtta kategori yazımı birleştirildi`);

    if (KURU) continue;

    let eklenen = 0;
    let guncellenen = 0;
    const yazmaHatalari = [];
    for (const belge of gecerli) {
      const simdi = new Date();
      try {
        const sonuc = await db
          .collection(koleksiyon)
          .updateOne(
            { [anahtar]: belge[anahtar] },
            { $set: { ...belge, guncellendi: simdi }, $setOnInsert: { olusturuldu: simdi } },
            { upsert: true },
          );
        if (sonuc.upsertedCount) eklenen += 1;
        else if (sonuc.modifiedCount) guncellenen += 1;
      } catch (hata) {
        yazmaHatalari.push(`${belge[anahtar]}: ${hata.message}`);
      }
    }
    toplamEklenen += eklenen;
    toplamGuncellenen += guncellenen;
    console.log(`  +${eklenen} eklendi  ~${guncellenen} güncellendi`);
    for (const h of yazmaHatalari.slice(0, 5)) console.error(`  YAZMA HATASI ${h}`);
  }

  if (gecersizler.length) {
    console.error('');
    console.error(`GEÇERSİZ (${gecersizler.length} kayıt, YAZILMADI):`);
    for (const g of gecersizler.slice(0, 25)) {
      const parcalar = [];
      if (g.eksikZorunlu.length) parcalar.push(`eksik zorunlu: ${g.eksikZorunlu.join(', ')}`);
      if (g.suclular.length) parcalar.push(`suçlu alan: ${g.suclular.join(', ')}`);
      console.error(
        `  ${g.koleksiyon}/${g.anahtar ?? '(anahtar yok)'} — ${parcalar.join(' | ') || 'neden belirlenemedi'}`,
      );
    }
    if (gecersizler.length > 25) console.error(`  … ${gecersizler.length - 25} tane daha`);
  }

  console.log('');
  if (KURU) {
    console.log('Kuru çalışma tamamlandı; hiçbir şey yazılmadı.');
  } else {
    console.log(`TOPLAM  Eklenen: ${toplamEklenen}  Güncellenen: ${toplamGuncellenen}`);
    console.log('Not: Hiçbir belge silinmedi; tümü upsert edildi.');
    for (const koleksiyon of [...toplam.keys()].sort()) {
      console.log(`  ${koleksiyon}: ${await db.collection(koleksiyon).countDocuments()} belge`);
    }
  }

  await istemci.close();
  if (gecersizler.length) process.exit(1);
}

main().catch((hata) => {
  console.error('HATA:', hata.message);
  process.exitCode = 1;
});
