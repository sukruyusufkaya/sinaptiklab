/**
 * İçerik grafiğinin BÜTÜNLÜK DENETİMİ — kopuk referansları bulur.
 *
 * Kullanım:
 *   npm run icerik:denetim
 *   npm run icerik:denetim -- --ayrinti     # her bulguyu tek tek yazar
 *
 * NEDEN GEREKLİ. Şema doğrulayıcısı bir alanın BİÇİMİNİ denetler (`SLUG`
 * kalıbı, `enum`, zorunluluk) ama KARŞILIĞININ VAR OLDUĞUNU denetleyemez:
 * MongoDB'de yabancı anahtar yoktur. Bu yüzden `konuSlug: "machine-learning"`
 * yazan bir test şemadan sorunsuz geçer, sitede hiçbir konu merkezinde
 * görünmez ve kimse fark etmez. Nitekim 12 testin tamamı aylarca böyle durdu.
 *
 * Denetim YALNIZCA OKUR; hiçbir belgeyi değiştirmez. Bulgu varsa çıkış kodu 1
 * olur, böylece CI'da kapı olarak kullanılabilir.
 *
 * KAPSAM — üç bulgu sınıfı:
 *
 *  1. KOPUK REFERANS. Bir alan başka koleksiyonun anahtarını göstermeli ama
 *     karşılığı yok. Ağırlığı `hata`.
 *  2. GÖRÜNMEZ HEDEF. Referans çözülüyor ama hedef YAYINDA DEĞİL. Sitede
 *     bağlantı üretilmez; kasıtlı olabilir (taslak hazırlanıyor), bu yüzden
 *     ağırlığı `uyari`.
 *  3. TUTARSIZLIK. İki alan birbirini doğrulamıyor (testin `zorluk`u ile
 *     sorusunun `zorluk`u, `soruSayisi` ile bankadaki gerçek sayı gibi).
 *
 * YENİ BAĞ EKLERKEN: `BAGLAR` dizisine bir satır ekle. Alan yoksa veya boşsa
 * denetim o belgeyi atlar — opsiyonel bağ "kopuk" sayılmaz, yokluk bir karar
 * olabilir.
 */

import { readFileSync } from 'node:fs';
import { MongoClient } from 'mongodb';
import { olcumIddiasi } from './olcum-iddiasi.mjs';

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
const AYRINTI = process.argv.includes('--ayrinti');

if (!URI) {
  console.error('HATA: MONGODB_URI tanımlı değil.');
  process.exit(1);
}

/* --- Bağ tanımları ------------------------------------------------------- */

/**
 * Her satır: bir koleksiyonun bir alanı, başka bir koleksiyonun anahtarını
 * gösterir.
 *
 * `dizi: true` → alan slug DİZİSİ taşır, her öğe tek tek denetlenir.
 * `anahtar` → hedef koleksiyonun anahtar alanı (varsayılan `slug`).
 * `gomulu` → bağ bir alt nesne dizisinin içinde (`bolumler[].dersSluglari`).
 */
const BAGLAR = [
  // Taksonomi
  { kaynak: 'konular', alan: 'ustKonuSlug', hedef: 'konular' },
  { kaynak: 'testler', alan: 'konuSlug', hedef: 'konular' },
  { kaynak: 'terimler', alan: 'atlasSlug', hedef: 'atlas' },
  /*
   * Sözlüğün KENDİ İÇİNDEKİ bağı. `ilgili`, terimleri birbirine bağlayan
   * semantik ağdır (MASTER-PLAN §48); okuma katmanı kopuk bir slug'ı sessizce
   * düşürdüğü için sitede hata GÖRÜNMEZ — bağ bir gün taslağa alınırsa
   * sözlükteki geçiş yolu sessizce kaybolur. Denetim o sessizliği bozar.
   */
  { kaynak: 'terimler', alan: 'ilgili', hedef: 'terimler', dizi: true },
  { kaynak: 'icerikler', alan: 'konuSlug', hedef: 'konular' },
  { kaynak: 'icerikler', alan: 'yazarSlug', hedef: 'yazarlar' },
  { kaynak: 'arastirma', alan: 'yazarSlug', hedef: 'yazarlar' },
  // Öğrenme
  { kaynak: 'dersler', alan: 'yolSlug', hedef: 'ogrenme_yollari' },
  { kaynak: 'dersler', alan: 'testSlug', hedef: 'testler' },
  { kaynak: 'dersler', alan: 'kavramlar', hedef: 'atlas', dizi: true },
  { kaynak: 'dersler', alan: 'onkosullar', hedef: 'atlas', dizi: true },
  { kaynak: 'sorular', alan: 'ilgiliAtlas', hedef: 'atlas' },
  { kaynak: 'lab_projeleri', alan: 'kavramlar', hedef: 'atlas', dizi: true },
  { kaynak: 'meslekler', alan: 'yolSlug', hedef: 'ogrenme_yollari' },
  { kaynak: 'meslekler', alan: 'testSlug', hedef: 'testler' },
  { kaynak: 'meslekler', alan: 'konuSlug', hedef: 'konular' },
  { kaynak: 'meslekler', alan: 'ilgiliAtlas', hedef: 'atlas', dizi: true },
  // Komşuluk meslekler koleksiyonunun KENDİ İÇİNDE: bir mesleğin komşusu
  // arşivden kaldırıldığında sayfa kopuk bir karta bağlanır.
  { kaynak: 'meslekler', alan: 'slug', hedef: 'meslekler', gomulu: 'komsuMeslekler' },
  { kaynak: 'meslekler', alan: 'labSlug', hedef: 'lab_projeleri', gomulu: 'portfolyo' },
  {
    kaynak: 'ogrenme_yollari',
    alan: 'dersSluglari',
    hedef: 'dersler',
    dizi: true,
    gomulu: 'bolumler',
  },
  // Kurumsal
  { kaynak: 'vakalar', alan: 'sektorSlug', hedef: 'sektorler' },
  { kaynak: 'hizmetler', alan: 'sektorSluglari', hedef: 'sektorler', dizi: true },
  // Varlıklar
  { kaynak: 'modeller', alan: 'saglayiciSlug', hedef: 'sirketler' },
  { kaynak: 'modeller', alan: 'aileSlug', hedef: 'modeller' },
  { kaynak: 'araclar', alan: 'sirketSlug', hedef: 'sirketler' },
];

/* --- Yardımcılar --------------------------------------------------------- */

const bulgular = [];

function bulgu(agirlik, sinif, ileti, ayrinti) {
  bulgular.push({ agirlik, sinif, ileti, ayrinti: ayrinti ?? [] });
}

/** Bir belgeden bağ değerlerini çıkarır; `gomulu` alt diziyi de gezer. */
function degerler(belge, bag) {
  const cikar = (nesne) => {
    const deger = nesne?.[bag.alan];
    if (deger === undefined || deger === null || deger === '') return [];
    return bag.dizi ? (Array.isArray(deger) ? deger : []) : [deger];
  };
  if (!bag.gomulu) return cikar(belge);
  const alt = belge[bag.gomulu];
  if (!Array.isArray(alt)) return [];
  return alt.flatMap(cikar);
}

/* --- Ana ----------------------------------------------------------------- */

const istemci = new MongoClient(URI, { ignoreUndefined: true });
await istemci.connect();
const vt = istemci.db(VERITABANI);

const varOlanKoleksiyonlar = new Set(
  (await vt.listCollections({}, { nameOnly: true }).toArray()).map((k) => k.name),
);

/* 1 + 2 — kopuk referans ve görünmez hedef ------------------------------- */

console.log('BAĞ DENETİMİ');

/** Hedef koleksiyonun anahtar → yayında mı haritası (bir kez okunur). */
const anahtarOnbellek = new Map();

async function anahtarlar(koleksiyon, anahtarAlan) {
  const onbellekAnahtari = `${koleksiyon}.${anahtarAlan}`;
  if (anahtarOnbellek.has(onbellekAnahtari)) return anahtarOnbellek.get(onbellekAnahtari);
  const harita = new Map();
  if (varOlanKoleksiyonlar.has(koleksiyon)) {
    const belgeler = await vt
      .collection(koleksiyon)
      .find({}, { projection: { [anahtarAlan]: 1, durum: 1, _id: 0 } })
      .toArray();
    for (const belge of belgeler) {
      const deger = belge[anahtarAlan];
      if (typeof deger === 'string') {
        // `durum` alanı olmayan koleksiyon (radar gibi) "yayın nesnesi
        // değildir"; görünmezlik uyarısı üretilmemesi için yayında sayılır.
        harita.set(deger, belge.durum === undefined || belge.durum === 'yayinda');
      }
    }
  }
  anahtarOnbellek.set(onbellekAnahtari, harita);
  return harita;
}

for (const bag of BAGLAR) {
  if (!varOlanKoleksiyonlar.has(bag.kaynak)) continue;
  const anahtarAlan = bag.anahtar ?? 'slug';
  const hedefler = await anahtarlar(bag.hedef, anahtarAlan);
  if (hedefler.size === 0) {
    bulgu(
      'uyari',
      'bos-hedef',
      `${bag.hedef} koleksiyonu boş — ${bag.kaynak}.${bag.alan} denetlenemedi`,
    );
    continue;
  }

  const belgeler = await vt
    .collection(bag.kaynak)
    .find({}, { projection: { _id: 0 } })
    .toArray();
  const kopuk = [];
  const gorunmez = [];
  let bagliBelge = 0;

  for (const belge of belgeler) {
    const liste = degerler(belge, bag);
    if (liste.length === 0) continue;
    bagliBelge += 1;
    const kimlik = belge.slug ?? belge.kimlik ?? belge.anahtar ?? '(anahtarsız)';
    for (const deger of liste) {
      if (!hedefler.has(deger)) kopuk.push(`${kimlik} → ${deger}`);
      else if (!hedefler.get(deger)) gorunmez.push(`${kimlik} → ${deger}`);
    }
  }

  const etiket = `${bag.kaynak}.${bag.alan} → ${bag.hedef}.${anahtarAlan}`;
  if (kopuk.length === 0 && gorunmez.length === 0) {
    console.log(`  ✓ ${etiket.padEnd(46)} ${bagliBelge} bağ`);
  } else {
    const parcalar = [];
    if (kopuk.length) parcalar.push(`${kopuk.length} kopuk`);
    if (gorunmez.length) parcalar.push(`${gorunmez.length} görünmez hedef`);
    console.log(`  ✗ ${etiket.padEnd(46)} ${bagliBelge} bağ — ${parcalar.join(', ')}`);
    if (kopuk.length) bulgu('hata', 'kopuk-referans', `${etiket}: ${kopuk.length} kopuk`, kopuk);
    if (gorunmez.length)
      bulgu(
        'uyari',
        'gorunmez-hedef',
        `${etiket}: ${gorunmez.length} yayında olmayan hedef`,
        gorunmez,
      );
  }
}

/* 3 — tutarsızlıklar ------------------------------------------------------ */

console.log('\nTUTARLILIK DENETİMİ');

/** Test ile soru bankası arasındaki dört tutarlılık kuralı. */
if (varOlanKoleksiyonlar.has('testler') && varOlanKoleksiyonlar.has('sorular')) {
  const testler = await vt
    .collection('testler')
    .find({}, { projection: { _id: 0 } })
    .toArray();
  const sorular = await vt
    .collection('sorular')
    .find({}, { projection: { _id: 0 } })
    .toArray();

  const etiketeGore = new Map();
  for (const soru of sorular) {
    for (const etiket of soru.etiketler ?? []) {
      if (!etiketeGore.has(etiket)) etiketeGore.set(etiket, []);
      etiketeGore.get(etiket).push(soru);
    }
  }

  const etiketsiz = [];
  const bankaBos = [];
  const sayiUyusmaz = [];
  const zorlukUyusmaz = [];
  const beceriDisi = [];

  for (const test of testler) {
    if (!test.soruEtiketi) {
      etiketsiz.push(test.slug);
      continue;
    }
    const banka = (etiketeGore.get(test.soruEtiketi) ?? []).filter((s) => s.durum === 'yayinda');
    if (banka.length === 0) {
      bankaBos.push(`${test.slug} (etiket: ${test.soruEtiketi})`);
      continue;
    }
    if (typeof test.soruSayisi === 'number' && test.soruSayisi !== banka.length) {
      sayiUyusmaz.push(`${test.slug}: künye ${test.soruSayisi}, bankada ${banka.length}`);
    }
    const beceriler = new Set(test.olculenBeceriler ?? []);
    for (const soru of banka) {
      if (soru.zorluk !== test.seviye) {
        zorlukUyusmaz.push(`${soru.kimlik}: soru ${soru.zorluk}, test ${test.seviye}`);
      }
      if (beceriler.size > 0 && soru.beceri && !beceriler.has(soru.beceri)) {
        beceriDisi.push(`${soru.kimlik}: "${soru.beceri}" testin ölçülen becerilerinde yok`);
      }
    }
  }

  // Seçenek sınırları ve kimlik tekilliği — soru bazlı.
  const indeksTasan = [];
  const kimlikler = new Map();
  for (const soru of sorular) {
    const adet = Array.isArray(soru.secenekler) ? soru.secenekler.length : 0;
    if (typeof soru.dogruIndeks !== 'number' || soru.dogruIndeks < 0 || soru.dogruIndeks >= adet) {
      indeksTasan.push(`${soru.kimlik}: dogruIndeks ${soru.dogruIndeks}, ${adet} seçenek`);
    }
    kimlikler.set(soru.kimlik, (kimlikler.get(soru.kimlik) ?? 0) + 1);
  }
  const kopyaKimlik = [...kimlikler].filter(([, n]) => n > 1).map(([k, n]) => `${k} ×${n}`);

  const kurallar = [
    ['hata', 'soru-bankasi-bos', 'soru bankasında karşılığı olmayan test', bankaBos],
    ['hata', 'dogru-indeks-tasiyor', 'dogruIndeks seçenek sayısının dışında', indeksTasan],
    ['hata', 'kopya-kimlik', 'aynı kimlikle birden çok soru', kopyaKimlik],
    ['uyari', 'soru-etiketi-yok', 'soruEtiketi yazılmamış test', etiketsiz],
    ['uyari', 'soru-sayisi-uyusmaz', 'künyedeki soruSayisi bankayla uyuşmuyor', sayiUyusmaz],
    ['uyari', 'zorluk-uyusmaz', 'sorunun zorluğu testin seviyesinden farklı', zorlukUyusmaz],
    ['uyari', 'beceri-disi', 'sorunun becerisi testin listesinde yok', beceriDisi],
  ];
  for (const [agirlik, sinif, ileti, liste] of kurallar) {
    if (liste.length === 0) continue;
    bulgu(agirlik, sinif, `${ileti}: ${liste.length}`, liste);
  }
  console.log(
    `  testler ↔ sorular: ${testler.length} test, ${sorular.length} soru, ` +
      `${kurallar.reduce((t, [, , , l]) => t + l.length, 0)} bulgu`,
  );
}

/** Temsilî vaka, sonuç iddiası taşıyan rakam taşımaz (değişmez kural 5). */
if (varOlanKoleksiyonlar.has('vakalar')) {
  const vakalar = await vt
    .collection('vakalar')
    .find({}, { projection: { _id: 0 } })
    .toArray();
  const rakamliEtki = [];
  const adliTemsili = [];
  const isaretsiz = [];
  for (const vaka of vakalar) {
    if (vaka.temsili === undefined) isaretsiz.push(vaka.slug);
    if (vaka.temsili === true && vaka.musteriAdi) adliTemsili.push(vaka.slug);
    for (const olcum of vaka.etki ?? []) {
      const deger = String(olcum.deger ?? '');
      const iddia = vaka.temsili === true && !olcum.olcumYontemi ? olcumIddiasi(deger) : null;
      if (iddia) {
        // Kalıp adı çıktıda durur: editör yanlış pozitifi kendisi ayırt edebilir.
        rakamliEtki.push(
          `${vaka.slug}: "${olcum.etiket}: ${deger}"  [${iddia.kalip}: "${iddia.parca}"]`,
        );
      }
    }
  }
  if (rakamliEtki.length)
    bulgu(
      'hata',
      'temsili-rakam',
      `temsilî vakada ölçüm yöntemsiz rakam: ${rakamliEtki.length}`,
      rakamliEtki,
    );
  if (adliTemsili.length)
    bulgu(
      'hata',
      'temsili-musteri-adi',
      `temsilî vakada müşteri adı: ${adliTemsili.length}`,
      adliTemsili,
    );
  if (isaretsiz.length)
    bulgu(
      'uyari',
      'temsili-isaretsiz',
      `temsili alanı yazılmamış vaka: ${isaretsiz.length}`,
      isaretsiz,
    );
  console.log(
    `  vakalar: ${vakalar.length} kayıt, ${rakamliEtki.length + adliTemsili.length + isaretsiz.length} bulgu`,
  );
}

/** Gövde blokları: tablo satır genişliği ve altbaşlık kimlik tekilliği. */
const GOVDELI = [
  'vakalar',
  'atlas',
  'icerikler',
  'arastirma',
  'dersler',
  'hizmetler',
  'politikalar',
];
let blokBulgusu = 0;
for (const koleksiyon of GOVDELI) {
  if (!varOlanKoleksiyonlar.has(koleksiyon)) continue;
  const belgeler = await vt
    .collection(koleksiyon)
    .find({ govde: { $exists: true } }, { projection: { _id: 0, slug: 1, govde: 1 } })
    .toArray();
  const tabloBozuk = [];
  const kopyaKimlik = [];
  for (const belge of belgeler) {
    const kimlikler = new Set();
    for (const [sira, blok] of (belge.govde ?? []).entries()) {
      if (blok.tip === 'tablo') {
        const genislik = Array.isArray(blok.basliklar) ? blok.basliklar.length : 0;
        for (const [s, satir] of (blok.satirlar ?? []).entries()) {
          if (!Array.isArray(satir) || satir.length !== genislik) {
            tabloBozuk.push(
              `${belge.slug} blok ${sira} satır ${s}: ${Array.isArray(satir) ? satir.length : '?'} hücre, ${genislik} başlık`,
            );
          }
        }
      }
      if (blok.tip === 'altbaslik' && blok.kimlik) {
        if (kimlikler.has(blok.kimlik)) kopyaKimlik.push(`${belge.slug}: #${blok.kimlik}`);
        kimlikler.add(blok.kimlik);
      }
    }
  }
  if (tabloBozuk.length)
    bulgu(
      'hata',
      'tablo-satir-genisligi',
      `${koleksiyon}: ${tabloBozuk.length} bozuk tablo satırı`,
      tabloBozuk,
    );
  if (kopyaKimlik.length)
    bulgu(
      'uyari',
      'kopya-altbaslik-kimligi',
      `${koleksiyon}: ${kopyaKimlik.length} kopya altbaşlık kimliği`,
      kopyaKimlik,
    );
  blokBulgusu += tabloBozuk.length + kopyaKimlik.length;
}
console.log(`  gövde blokları: ${blokBulgusu} bulgu`);

/* --- Beceri ağı ---------------------------------------------------------- */

/*
 * İKİ ÖNKOŞUL KAYNAĞI BİRBİRİNİ DENETLER.
 *
 * `lib/ogrenme/beceri-agi.ts` çizgenin DOĞRUDAN kenarlarını taşır; Atlas
 * kayıtlarındaki `onkosullar` alanı ise aynı bilgiyi GÖRÜNEN AD ile ve
 * eksik biçimde taşır (35 kaydın 22'sinde dolu). İkisi ayrı yerlerde
 * yaşadığı için sessizce ayrışabilirler: birine eklenen bir önkoşul
 * diğerinde hiç görünmez ve rota üretici yanlış bir sıra çıkarır.
 *
 * Denetim GEÇİŞLİ yapılır: Atlas "Transformer için Neural Networks gerekir"
 * diyorsa, çizgede doğrudan böyle bir kenar olması gerekmez —
 * `transformer ← attention ← deep-learning ← neural-networks` zinciri bunu
 * zaten karşılar. Yalnızca hiçbir yoldan ulaşılamayan önkoşullar bildirilir.
 */
const agKaynagi = readFileSync(new URL('../lib/ogrenme/beceri-agi.ts', import.meta.url), 'utf8');
const agDesen =
  /slug: '([a-z0-9-]+)',\s*\n\s*konuSlug: '[a-z0-9-]+',\s*\n\s*onkosullar: \[([^\]]*)\]/g;
const agKenarlari = new Map(
  [...agKaynagi.matchAll(agDesen)].map((eslesme) => [
    eslesme[1],
    eslesme[2]
      .split(',')
      .map((p) => p.trim().replace(/'/g, ''))
      .filter(Boolean),
  ]),
);

const atlasKayitlari = await vt
  .collection('atlas')
  .find({ durum: 'yayinda' })
  .project({ slug: 1, ad: 1, altAd: 1, onkosullar: 1 })
  .toArray();

const adaSlug = new Map();
for (const kayit of atlasKayitlari) {
  adaSlug.set(kayit.ad.toLowerCase(), kayit.slug);
  if (kayit.altAd) adaSlug.set(kayit.altAd.toLowerCase(), kayit.slug);
  // Kısaltmalar: `atlas.onkosullar` "LLM" yazarken kaydın `ad` alanı
  // "Large Language Model" olabiliyor. Slug'ın kendisi küçük harfli kısaltmadır
  // ("llm", "rag", "mcp"), bu yüzden ad olarak da kabul edilir.
  adaSlug.set(kayit.slug, kayit.slug);
}

/** `hedef`, `slug`un önkoşul ataları arasında mı (geçişli). */
function atasiMi(slug, hedef, gorulen = new Set()) {
  if (gorulen.has(slug)) return false;
  gorulen.add(slug);
  for (const onkosul of agKenarlari.get(slug) ?? []) {
    if (onkosul === hedef) return true;
    if (atasiMi(onkosul, hedef, gorulen)) return true;
  }
  return false;
}

const agdaYok = [];
const cozulemeyenAd = [];
const atlastaYok = [];

for (const kayit of atlasKayitlari) {
  if (!agKenarlari.has(kayit.slug)) {
    atlastaYok.push(kayit.slug);
    continue;
  }
  for (const ham of kayit.onkosullar ?? []) {
    const hedef = adaSlug.get(String(ham).toLowerCase());
    if (!hedef) {
      cozulemeyenAd.push(`${kayit.slug}: "${ham}"`);
      continue;
    }
    if (!atasiMi(kayit.slug, hedef)) agdaYok.push(`${kayit.slug} ← ${hedef}`);
  }
}

console.log(
  `  beceri ağı: ${agKenarlari.size} düğüm, ${[...agKenarlari.values()].reduce((t, l) => t + l.length, 0)} kenar, ` +
    `${agdaYok.length + cozulemeyenAd.length + atlastaYok.length} bulgu`,
);

if (agdaYok.length)
  bulgu(
    'hata',
    'beceri-agi-eksik-kenar',
    `Atlas'ta yazılı ama beceri ağında hiçbir yoldan karşılanmayan önkoşul: ${agdaYok.length}`,
    agdaYok,
  );
if (cozulemeyenAd.length)
  bulgu(
    'uyari',
    'beceri-agi-cozulemeyen-ad',
    `atlas.onkosullar içinde Atlas adına karşılık gelmeyen değer: ${cozulemeyenAd.length}`,
    cozulemeyenAd,
  );
if (atlastaYok.length)
  bulgu(
    'uyari',
    'beceri-agi-kapsam-disi',
    `Yayında olup beceri ağına alınmamış Atlas girdisi: ${atlastaYok.length}`,
    atlastaYok,
  );

/* --- Rapor --------------------------------------------------------------- */

const hatalar = bulgular.filter((b) => b.agirlik === 'hata');
const uyarilar = bulgular.filter((b) => b.agirlik === 'uyari');

console.log(`\nSONUÇ  ${hatalar.length} hata, ${uyarilar.length} uyarı`);

for (const grup of [
  ['HATA', hatalar],
  ['UYARI', uyarilar],
]) {
  const [etiket, liste] = grup;
  if (liste.length === 0) continue;
  console.log(`\n${etiket}`);
  for (const b of liste) {
    console.log(`  [${b.sinif}] ${b.ileti}`);
    const gosterilecek = AYRINTI ? b.ayrinti : b.ayrinti.slice(0, 5);
    for (const satir of gosterilecek) console.log(`      ${satir}`);
    if (!AYRINTI && b.ayrinti.length > 5) {
      console.log(`      … ${b.ayrinti.length - 5} tane daha (--ayrinti ile tamamı)`);
    }
  }
}

if (hatalar.length === 0 && uyarilar.length === 0) {
  console.log('Kopuk referans ve tutarsızlık bulunmadı.');
}

await istemci.close();
process.exit(hatalar.length > 0 ? 1 : 0);
