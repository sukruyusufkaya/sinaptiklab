/**
 * Araştırma çıktısını (JSON) MongoDB'ye tohumlar.
 *
 * Kullanım:
 *   node scripts/arastirma-tohumla.mjs --dizin=<yol>
 *   node scripts/arastirma-tohumla.mjs --dizin=<yol> --kuru    # yazmaz, denetler
 *
 * `scripts/tohumla.mjs` fixture'ları dönüştürür; bu betik ise web
 * araştırmasından gelen hazır JSON kayıtlarını alır. Ayrı tutulmasının nedeni:
 * fixture dönüştürücüleri saf fonksiyonlardır ve kaynağı koddadır; araştırma
 * çıktısı ise dış veridir ve YAZMADAN ÖNCE DOĞRULANMASI gerekir.
 *
 * ÜÇ AŞAMA
 *
 * 1. **Birleştirme.** Dizindeki tüm `*.json` dosyaları okunur. Aynı slug iki
 *    dosyada varsa ilki korunur ve çakışma bildirilir — sessizce üzerine
 *    yazmak, hangi ajanın verisinin kazandığını belirsiz bırakırdı.
 * 2. **Şemaya karşı ön denetim.** Her belge, Atlas'taki CANLI doğrulayıcıya
 *    `$jsonSchema` ile sorulur — HİÇBİR ŞEY YAZILMADAN. Böylece 50 kaydın
 *    30'unu yazıp 20'sinde patlamak yerine, hangi kaydın hangi alanı yüzünden
 *    geçersiz olduğu önceden görülür.
 * 3. **Upsert.** Yalnızca ön denetimi geçen belgeler `slug` üzerinden upsert
 *    edilir. YIKICI DEĞİLDİR: hiçbir belge silinmez.
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

if (!URI) {
  console.error('HATA: MONGODB_URI tanımlı değil.');
  process.exit(1);
}
if (!DIZIN) {
  console.error('HATA: --dizin=<yol> gerekli.');
  process.exit(1);
}

/* --- Birleştirme --------------------------------------------------------- */

/* --- Kategori yazımını birleştirme ------------------------------------- */

/**
 * Türkçe harfleri ASCII'ye katlar — yalnızca KARŞILAŞTIRMA için.
 *
 * `toLocaleLowerCase('tr-TR')` BİLİNÇLİ OLARAK kullanılmaz: burada amaç Türkçe
 * yerel kuralı uygulamak değil, "Çok" ile "Cok"u aynı anahtara düşürmek.
 */
function asciiyeKatla(metin) {
  const es = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' };
  return [...metin.toLowerCase()].map((h) => es[h] ?? h).join('');
}

/**
 * Aynı kategoriyi farklı yazan kayıtları tek yazıma indirir.
 *
 * NEDEN GEREKLİ: araştırma brifingindeki örnek değerler ASCII yazıldığı için
 * (`"Cok modlu LLM"`) bazı ajanlar onu birebir kopyaladı, bazıları doğru
 * Türkçesini yazdı. `tip` ve `tur` alanları hem panelde hem sitede FİLTRE
 * YÜZEYİ: iki yazım, aynı şey için iki filtre çipi demek. Kullanıcı "Çok modlu
 * LLM"i seçtiğinde "Cok modlu LLM" kayıtları listeden düşerdi.
 *
 * KAZANAN YAZIM: Türkçe aksan taşıyan biçim, SAYIDAN BAĞIMSIZ olarak kazanır.
 *
 * Bu kural başta "en çok kullanılan kazanır" biçiminde yazılmıştı ve YANLIŞTI:
 * ASCII varyantlar araştırma brifingimdeki ASCII örneklerden doğduğu için
 * bazı kategorilerde sayıca çoğunluğa ulaştı ve kanonik etiket "Cok modlu LLM",
 * "Gorsel uretimi" olarak seçildi. Sıklık burada yanlış sinyal: çoğunluk
 * editoryal bir tercihi değil, benim brifing hatamın yayılmasını ölçüyor.
 * Türkçe bir sitede kullanıcıya görünen filtre etiketi doğru yazılır.
 *
 * Sıklık yalnızca aynı derecede "Türkçe" iki varyant arasında ayırıcıdır.
 * Sabit eşleme listesi tutmak her yeni kategoride bu betiği güncelletirdi.
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
      // 1. Türkçe aksan sayısı — çok olan kazanır, SIKLIKTAN ÖNCE gelir.
      const aksan = (metin) => [...metin].filter((h) => 'çğıöşüÇĞİÖŞÜâîû'.includes(h)).length;
      const fark = aksan(b.deger) - aksan(a.deger);
      if (fark !== 0) return fark;
      // 2. Aynı derecede Türkçe ise sıklık ayırır.
      return b.adet - a.adet;
    });
    const [kazanan, ...kaybedenler] = uyeler;
    for (const k of kaybedenler) esleme.set(k.deger, kazanan.deger);
    birlesenler.push(
      `${alan}: "${kazanan.deger}" (${kazanan.adet}) <- ${kaybedenler
        .map((k) => `"${k.deger}" (${k.adet})`)
        .join(', ')}`,
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

/** Slug'a göre tekilleştirir; çakışmayı bildirir. */
function birlestir(kayitlar, ad) {
  const harita = new Map();
  const cakismalar = [];

  for (const { dosya, belgeler } of kayitlar) {
    for (const belge of belgeler) {
      const slug = belge?.slug;
      if (typeof slug !== 'string' || !slug) {
        cakismalar.push(`${dosya}: slug'ı olmayan ${ad} kaydı atlandı`);
        continue;
      }
      if (harita.has(slug)) {
        cakismalar.push(`${slug}: ${harita.get(slug).kaynakDosya} korundu, ${dosya} atlandı`);
        continue;
      }
      harita.set(slug, { ...belge, kaynakDosya: dosya });
    }
  }

  return { belgeler: [...harita.values()], cakismalar };
}

function dosyalariOku() {
  const yol = resolve(DIZIN);
  let adlar;
  try {
    adlar = readdirSync(yol).filter((d) => d.endsWith('.json'));
  } catch (hata) {
    console.error(`HATA: dizin okunamadı (${yol}): ${hata.message}`);
    process.exit(1);
  }

  const modeller = [];
  const sirketler = [];
  const bozuk = [];

  for (const ad of adlar.sort()) {
    try {
      const icerik = JSON.parse(readFileSync(resolve(yol, ad), 'utf8'));
      modeller.push({ dosya: ad, belgeler: icerik.modeller ?? [] });
      sirketler.push({ dosya: ad, belgeler: icerik.sirketler ?? [] });
    } catch (hata) {
      bozuk.push(`${ad}: ${hata.message}`);
    }
  }

  return { adlar, modeller, sirketler, bozuk };
}

/* --- Şema ön denetimi ---------------------------------------------------- */

/**
 * Belgeyi Atlas'ın canlı doğrulayıcısına sorar, HİÇBİR ŞEY YAZMADAN.
 *
 * `$documents` ile sentetik bir belge akışı kurulur ve `$match: { $jsonSchema }`
 * onu koleksiyonun kendi kuralına göre süzer. Sonuç boşsa belge geçersizdir.
 */
async function semayaSor(db, sema, belge) {
  const sonuc = await db
    .aggregate([{ $documents: [belge] }, { $match: { $jsonSchema: sema } }])
    .toArray();
  return sonuc.length > 0;
}

/** Geçersiz belgede hangi alanın suçlu olduğunu alan alan daraltır. */
async function sucluAlanlar(db, sema, belge) {
  const suclular = [];
  const zorunlular = new Set(sema.required ?? []);

  for (const alan of Object.keys(belge)) {
    if (alan === 'kaynakDosya') continue;
    const kirpik = { ...belge };
    delete kirpik[alan];
    // Alanı çıkarınca geçerli oluyorsa suçlu o alandır.
    if (!zorunlular.has(alan) && (await semayaSor(db, sema, kirpik))) {
      suclular.push(alan);
    }
  }

  const eksikZorunlu = [...zorunlular].filter((a) => belge[a] === undefined);
  return { suclular, eksikZorunlu };
}

/* --- Ana akış ------------------------------------------------------------ */

async function main() {
  const { adlar, modeller, sirketler, bozuk } = dosyalariOku();

  console.log(`${adlar.length} JSON dosyası okundu: ${adlar.join(', ')}`);
  if (bozuk.length) {
    console.error('');
    console.error('BOZUK JSON:');
    for (const b of bozuk) console.error(`  ${b}`);
  }

  const m = birlestir(modeller, 'model');
  const s = birlestir(sirketler, 'şirket');

  console.log('');
  console.log(`Model kaydı  : ${m.belgeler.length} tekil`);
  console.log(`Şirket kaydı : ${s.belgeler.length} tekil`);

  if (m.cakismalar.length || s.cakismalar.length) {
    console.log('');
    console.log('ÇAKIŞMALAR (ilk kayıt korundu):');
    for (const c of [...m.cakismalar, ...s.cakismalar]) console.log(`  ${c}`);
  }

  /*
   * Filtre yüzeylerinin yazımı birleştirilir. Doğrulamadan ÖNCE yapılır:
   * şemada bu alanlar serbest metin olduğu için iki yazım da geçerli sayılır,
   * yani doğrulama bu kusuru yakalamaz — yakalayan tek şey bu adım.
   */
  const tipBirlesme = kategorileriBirlestir(m.belgeler, 'tip');
  const turBirlesme = kategorileriBirlestir(s.belgeler, 'tur');

  if (tipBirlesme.birlesenler.length || turBirlesme.birlesenler.length) {
    console.log('');
    console.log('KATEGORİ YAZIMI BİRLEŞTİRİLDİ:');
    for (const b of [...tipBirlesme.birlesenler, ...turBirlesme.birlesenler]) {
      console.log(`  ${b}`);
    }
    console.log(`  → ${tipBirlesme.degisen + turBirlesme.degisen} kayıt güncellendi`);
  }

  const istemci = new MongoClient(URI, { serverSelectionTimeoutMS: 20_000, ignoreUndefined: true });
  await istemci.connect();
  const db = istemci.db(VERITABANI);

  const semalar = {};
  for (const ad of ['modeller', 'sirketler']) {
    const [tanim] = await db.listCollections({ name: ad }).toArray();
    semalar[ad] = tanim?.options?.validator?.$jsonSchema;
    if (!semalar[ad]) {
      console.error(`HATA: ${ad} koleksiyonunda doğrulayıcı yok. Önce: npm run mongo:kur`);
      await istemci.close();
      process.exit(1);
    }
  }

  /* --- İlişki tutarlılığı: model.saglayiciSlug <-> sirket.slug ----------- */

  const sirketSluglari = new Set(s.belgeler.map((b) => b.slug));
  const kopukBag = m.belgeler
    .filter((b) => b.saglayiciSlug && !sirketSluglari.has(b.saglayiciSlug))
    .map((b) => `${b.slug} -> ${b.saglayiciSlug}`);

  if (kopukBag.length) {
    console.log('');
    console.log('UYARI — sağlayıcısı bu partide olmayan modeller (panelde ilişki boş görünür):');
    for (const k of kopukBag.slice(0, 20)) console.log(`  ${k}`);
    if (kopukBag.length > 20) console.log(`  … ${kopukBag.length - 20} tane daha`);
  }

  /* --- Ön denetim -------------------------------------------------------- */

  const gecerli = { modeller: [], sirketler: [] };
  const gecersiz = [];

  for (const [ad, kume] of [
    ['modeller', m.belgeler],
    ['sirketler', s.belgeler],
  ]) {
    for (const belge of kume) {
      const { kaynakDosya, ...temiz } = belge;
      if (await semayaSor(db, semalar[ad], temiz)) {
        gecerli[ad].push(temiz);
      } else {
        const { suclular, eksikZorunlu } = await sucluAlanlar(db, semalar[ad], temiz);
        gecersiz.push({
          koleksiyon: ad,
          slug: temiz.slug,
          dosya: kaynakDosya,
          suclular,
          eksikZorunlu,
        });
      }
    }
  }

  console.log('');
  console.log(
    `Ön denetim: ${gecerli.modeller.length} model, ${gecerli.sirketler.length} şirket GEÇERLİ`,
  );

  if (gecersiz.length) {
    console.error('');
    console.error(`GEÇERSİZ (${gecersiz.length} kayıt, YAZILMAYACAK):`);
    for (const g of gecersiz) {
      const parcalar = [];
      if (g.eksikZorunlu.length) parcalar.push(`eksik zorunlu: ${g.eksikZorunlu.join(', ')}`);
      if (g.suclular.length) parcalar.push(`suçlu alan: ${g.suclular.join(', ')}`);
      console.error(
        `  ${g.koleksiyon}/${g.slug ?? '(slug yok)'} [${g.dosya}] — ${parcalar.join(' | ') || 'neden belirlenemedi'}`,
      );
    }
  }

  if (KURU) {
    console.log('');
    console.log('Kuru çalışma tamamlandı; hiçbir şey yazılmadı.');
    await istemci.close();
    process.exit(gecersiz.length ? 1 : 0);
  }

  /* --- Upsert ------------------------------------------------------------ */

  let eklenen = 0;
  let guncellenen = 0;
  const yazmaHatalari = [];

  for (const ad of ['modeller', 'sirketler']) {
    for (const belge of gecerli[ad]) {
      const simdi = new Date();
      try {
        const sonuc = await db
          .collection(ad)
          .updateOne(
            { slug: belge.slug },
            { $set: { ...belge, guncellendi: simdi }, $setOnInsert: { olusturuldu: simdi } },
            { upsert: true },
          );
        if (sonuc.upsertedCount) eklenen += 1;
        else if (sonuc.modifiedCount) guncellenen += 1;
      } catch (hata) {
        yazmaHatalari.push(`${ad}/${belge.slug}: ${hata.message}`);
      }
    }
  }

  console.log('');
  console.log(`Eklenen: ${eklenen}  Güncellenen: ${guncellenen}`);
  if (yazmaHatalari.length) {
    console.error('YAZMA HATALARI:');
    for (const h of yazmaHatalari) console.error(`  ${h}`);
  }
  console.log('Not: Hiçbir belge silinmedi; tümü upsert edildi.');

  for (const ad of ['modeller', 'sirketler']) {
    console.log(`  ${ad}: ${await db.collection(ad).countDocuments()} belge`);
  }

  await istemci.close();
  if (gecersiz.length || yazmaHatalari.length) process.exit(1);
}

main().catch((hata) => {
  console.error('HATA:', hata.message);
  process.exitCode = 1;
});
