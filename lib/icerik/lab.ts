import type { LabProjesi, Meslek, Blok } from '@/lib/tipler';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { slugIle, yayindakiler } from '@/lib/mongo/sorgular/site';

/**
 * Lab ve kariyer okuma modülü — `lib/veri/lab.ts` fixture'ının karşılığı.
 *
 * Fixture'ın beş dışa aktarımının hepsinin burada bir `async` eşi vardır:
 * `LAB_PROJELERI` → `labProjeleri()`, `HESAPLAYICILAR` → `hesaplayicilar()`,
 * `labBul` → `labBul()`, `MESLEKLER` → `meslekler()`, `meslekBul` →
 * `meslekBul()`. Sunum kodu değişmez; sayfa taşımak `await` eklemekten ve
 * içe alma yolunu değiştirmekten ibarettir.
 *
 * DÖNÜŞÜM 1 — `yayinDurumu` → `durum` (lab_projeleri).
 * Fixture'da `durum` alanı projenin OLGUNLUĞUNU söylüyordu
 * (`yayinda | gelistiriliyor`). Şemada bu ikili `yayinDurumu` adını aldı,
 * çünkü `durum` adı YAYIN AKIŞI için ayrılmıştır
 * (`taslak | incelemede | yayinda | arsiv`). Burada tohumlamanın tersi
 * yapılır: akış durumu dışarı çıkmaz, `yayinDurumu` site tipindeki `durum`
 * alanına geri konur. `yayinDurumu` yazılmamış bir kayıtta alan `undefined`
 * kalır — yer tutucu değer üretilmez (CLAUDE.md kural 5).
 *
 * DÖNÜŞÜM 2 — akış süzgeci.
 * Okuma ilkelleri varsayılan olarak `durum: 'yayinda'` süzer ve bu varsayılan
 * KORUNUR. Tohumlama `gelistiriliyor` projeleri TASLAK olarak yazdığından
 * sitede yalnızca çalışan projeler görünür: 11 kayıttan 7'si. `/lab/` ve
 * `/araclar/` sayfalarındaki "Geliştiriliyor" sayaçları bu yüzden 0 verir —
 * taslak sızdırmak yerine sayaç küçülür.
 *
 * DÖNÜŞÜM 3 — `bilesenAnahtari` aynen aktarılır.
 * Bu alan `components/lab/AracKayitDefteri.tsx` içindeki etkileşimli bileşeni
 * seçen bir KOD ANAHTARIDIR, görünen bir metin değil. Okuma katmanı ne üretir
 * ne de doğrular; olduğu gibi geçirir. Site tipi `LabProjesi` bu alanı
 * tanımadığı için dönen kayıtların tipi `LabProjesiKaydi`dir.
 *
 * Gövde YOKTUR: şemada `govde` tanımlı ama hiçbir lab projesinde dolu değil
 * (fixture'da da yoktu). Bu yüzden liste ve detay sorgusu aynı alanları okur;
 * `haric` ile dışarıda bırakılacak ağır alan bulunmuyor.
 *
 * Konu/yazar birleştirmesi de yoktur: iki koleksiyonun şemasında `konuSlug`
 * veya `yazarSlug` alanı yok, bu yüzden `lib/icerik/temel.ts` haritalarına
 * ihtiyaç duyulmaz.
 */

/* --- LAB PROJELERİ -------------------------------------------------------- */

/**
 * Site tipi + kod anahtarı.
 *
 * `LabProjesi` sunum alanlarını tanımlar; `bilesenAnahtari` şemada olup site
 * tipinde karşılığı olmayan tek alandır. `lib/tipler.ts` bu ajanın görevi
 * dışında olduğu için tip orada genişletilmedi, burada türetildi.
 */
export type LabProjesiKaydi = LabProjesi & {
  bilesenAnahtari?: string;
  /**
   * Projenin dayandığı Atlas kavramları — şemada var, site tipinde yok.
   *
   * Bağ eskiden sayfada koda gömülü bir slug tablosuydu; taşındı (bkz. şema
   * notu). Boş dizi "kavram bağı yazılmamış" demektir, listede bölüm hiç
   * basılmaz — uydurma kavram bağlanmaz.
   */
  kavramlar?: string[];
  /**
   * Uzun anlatım. Şemada ve panelde vardı, HİÇBİR SAYFA BASMIYORDU; bu
   * yüzden araç olmayan projeler (deney, açık kaynak, demo) sitede yalnızca
   * bir özet cümlesiyle görünüyordu. Aktarılır; listede `haric` ile dışarıda
   * bırakılır.
   */
  govde?: Blok[];
};

/**
 * Mongo belgesi: şemadaki hâl.
 *
 * Akış `durum`u ve zaman damgaları bilinçli olarak yazılmadı — `gorunume()`
 * alanları tek tek kopyaladığı için bu alanlar RSC sınırından hiç geçmez.
 * Şemadaki `depoAdresi` de burada yok: site tipinde karşılığı olmadığı gibi
 * hiçbir kayıtta dolu değil.
 *
 * `seo` ise TAŞINIR (`LabProjesi` üzerinden gelir): `/lab/<slug>/` sayfasının
 * üstverisi editörün panelden yazdığı değerden çıkmak zorunda.
 */
type LabBelgesi = Omit<LabProjesi, 'durum'> & {
  yayinDurumu?: LabProjesi['durum'];
  bilesenAnahtari?: string;
  kavramlar?: string[];
  govde?: Blok[];
};

function gorunume(belge: LabBelgesi): LabProjesiKaydi {
  return {
    slug: belge.slug,
    ad: belge.ad,
    tur: belge.tur,
    ozet: belge.ozet,
    durum: belge.yayinDurumu,
    girdiler: belge.girdiler,
    bilesenAnahtari: belge.bilesenAnahtari,
    kavramlar: belge.kavramlar,
    govde: belge.govde,
    seo: belge.seo,
  };
}

/**
 * Ada göre Türkçe sıralama.
 *
 * Fixture'daki el yapımı sıra (önce token, sonra maliyet…) şemada kodlanmadı:
 * `lab_projeleri` koleksiyonunda sıra alanı yok. Doğal sıraya güvenmek yerine
 * ada göre sıralanır, böylece derleme tekrarlanabilir kalır. Sıra anlam
 * taşıyacaksa şemaya açık bir alan eklenmesi gerekir — buradan uydurulmaz.
 */
function adaGore<T extends { ad: string }>(kayitlar: T[]): T[] {
  return [...kayitlar].sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
}

/** Yayındaki tüm lab projeleri, ada göre sıralı. */
export async function labProjeleri(): Promise<LabProjesiKaydi[]> {
  const belgeler = await yayindakiler<LabBelgesi>(KOLEKSIYONLAR.labProjeleri);
  return adaGore(belgeler.map(gorunume));
}

/**
 * Hesaplayıcılar: türü `Araç` olan projeler.
 *
 * Süzme Mongo tarafında yapılır; fixture'daki `LAB_PROJELERI.filter(...)`
 * ifadesinin karşılığıdır.
 */
export async function hesaplayicilar(): Promise<LabProjesiKaydi[]> {
  const belgeler = await yayindakiler<LabBelgesi>(KOLEKSIYONLAR.labProjeleri, {
    suzgec: { tur: 'Araç' },
  });
  return adaGore(belgeler.map(gorunume));
}

/**
 * Slug ile tek proje.
 *
 * Taslak bir projenin adresine gidildiğinde `undefined` döner ve sayfa 404
 * verir — geliştirilen bir araç, yayımlanmadan sitede açılmaz.
 */
export async function labBul(slug: string): Promise<LabProjesiKaydi | undefined> {
  const belge = await slugIle<LabBelgesi>(KOLEKSIYONLAR.labProjeleri, slug);
  return belge ? gorunume(belge) : undefined;
}

/* --- KARİYER -------------------------------------------------------------- */

/**
 * Mongo belgesi: şemadaki hâl.
 *
 * Şemada zorunlu olan alanlar yalnızca `slug`, `ad`, `ozet` ve akış `durum`u;
 * üç liste alanı isteğe bağlıdır. Site tipi `Meslek` ise bu listeleri zorunlu
 * ister, bu yüzden belgede tipleri gevşetilir ve `meslegeCevir()` içinde boş
 * diziye düşülür.
 */
type MeslekBelgesi = Omit<Meslek, 'neYapar' | 'beceriler' | 'teknolojiler'> & {
  neYapar?: string[];
  beceriler?: string[];
  teknolojiler?: string[];
  durum?: string;
  olusturuldu?: Date;
  guncellendi?: Date;
};

/**
 * Akış `durum`u dışarı çıkmaz; eksik liste alanı BOŞ DİZİ olur.
 *
 * Boş dizi uydurma veri değildir: "bu mesleğin kaydında henüz madde yok"
 * bilgisini taşır ve sayfa boş bölümü `BosDurum` ile gösterebilir. Kaydı
 * tümden düşürmek, adı ve özeti olan bir meslek sayfasını görünmez yapardı.
 *
 * BELGE ALAN ALAN KOPYALANMAZ, YAYILIR. Önceki sürüm dokuz alanı elle
 * sayıyordu; şemaya `seviyeler`, `gunlukIs`, `komsuMeslekler` gibi alanlar
 * eklendiğinde bu liste güncellenmediği için kayıtlar veritabanında dolu,
 * sitede görünmez kaldı. Bu, projede tekrar eden bir hata sınıfıdır: panel
 * yazar, hiçbir yer okumaz. Yayma biçimi bu sınıfı kapatır — okuma katmanı
 * artık yalnızca DIŞARI ÇIKMAMASI GEREKENİ sayar.
 *
 * Dışarı çıkmayanlar: yayın akışı `durum`u (site tipinde karşılığı yok) ve
 * `Date` nesneleri olan zaman damgaları (RSC sınırından geçebilir ama site
 * tipinde yer almaz, sayfalar `surumler` alanını kullanır).
 */
const MESLEKTE_SITEYE_CIKMAZ = ['durum', 'olusturuldu', 'guncellendi'] as const;

function meslegeCevir(belge: MeslekBelgesi): Meslek {
  const kalan: Record<string, unknown> = { ...belge };
  for (const alan of MESLEKTE_SITEYE_CIKMAZ) delete kalan[alan];
  return {
    ...(kalan as Omit<MeslekBelgesi, (typeof MESLEKTE_SITEYE_CIKMAZ)[number]>),
    neYapar: belge.neYapar ?? [],
    beceriler: belge.beceriler ?? [],
    teknolojiler: belge.teknolojiler ?? [],
  };
}

/**
 * Liste sayfasında gerekmeyen ağır alanlar.
 *
 * `/kariyer/` 19 mesleği kart olarak basıyor; kıdem kırılımı, günlük iş ve
 * SSS yalnızca detay sayfasında okunuyor. On dokuz kaydın tamamını tam
 * gövdesiyle okumak, hub sayfasının yükünü birkaç katına çıkarırdı.
 */
const MESLEK_AGIR_ALANLARI = [
  'seviyeler',
  'gunlukIs',
  'olcutler',
  'portfolyo',
  'yanlisAnlamalar',
  'sss',
  'kaynaklar',
] as const;

/**
 * Yayındaki meslekler, ada göre Türkçe sıralı.
 *
 * `yolSlug` ve `testSlug` öğrenme tarafına bağlar (`/patika/<yolSlug>/`,
 * `/testler/<testSlug>/`). Hedefin yayında olup olmadığı BURADA denetlenmez:
 * bağlantı denetimi rota katmanının işidir ve iki koleksiyonu birbirine
 * bağlamak bu modülü öğrenme modülüne bağımlı kılardı.
 */
export async function meslekler(): Promise<Meslek[]> {
  const belgeler = await yayindakiler<MeslekBelgesi>(KOLEKSIYONLAR.meslekler, {
    haric: MESLEK_AGIR_ALANLARI,
  });
  return adaGore(belgeler.map(meslegeCevir));
}

/** Slug ile tek meslek. */
export async function meslekBul(slug: string): Promise<Meslek | undefined> {
  const belge = await slugIle<MeslekBelgesi>(KOLEKSIYONLAR.meslekler, slug);
  return belge ? meslegeCevir(belge) : undefined;
}
