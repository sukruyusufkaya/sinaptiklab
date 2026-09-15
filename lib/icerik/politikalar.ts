import type { MetinBolumu } from '@/components/kurumsal/MetinSayfasi';
import type { Blok, SurumKaydi, SeoAlanlari } from '@/lib/tipler';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { slugIle, yayindakiler, yayindakiSluglar } from '@/lib/mongo/sorgular/site';

/**
 * Politika ve editoryal sayfa okuma modülü — `lib/veri/politikalar.ts`'in
 * MongoDB karşılığı.
 *
 * İKİ KOLEKSİYON, TEK MODÜL. Fixture yedi `MetinBolumu[]` dizisi taşıyordu;
 * tohumlama bunları iki koleksiyona böldü:
 *
 *  - `politikalar` — hukuki metinler. Şema `yururlukTarihi`, `surum` ve
 *    `surumler`i zorunlu kılar, `hukukiOnay` bayrağını taşır.
 *  - `sayfalar` — editoryal metinler. Şema `yol`, `etiket`, `seo` ve
 *    `guncellemeTarihi` taşır; sürüm kavramı yoktur.
 *
 * ÇAKIŞMA. Tohumlamada üç editoryal metin (editoryal ilkeler, AI politikası,
 * düzeltme politikası) HER İKİ koleksiyona da yazıldı: `lib/tohum/sayfalar.ts`
 * bunları `sayfalar`a alırken `lib/tohum/politikalar.ts` yedisini birlikte
 * `politikalar`a yazdı. Okuma katmanı çakışmayı kaynak seçerek çözer: bu üç
 * metin `sayfalar`dan okunur, çünkü sayfaların bastığı `etiket` ("EDİTORYAL",
 * "ŞEFFAFLIK") ve `guncelleme` alanları yalnızca o şemada var; dört hukuki
 * metin `politikalar`dan okunur. `politikalar` koleksiyonundaki üç kopya
 * okunmaz — şema değiştirilmediği için burada bırakılıyor, temizliği tohumlama
 * katmanına ait (rapora yazıldı).
 *
 * TEK GERÇEK DÖNÜŞÜM — `govde` (Blok[]) → `bolumler` (MetinBolumu[]):
 * Şema yapılandırılmış blok dizisi tutar; `MetinSayfasi` ise başlık altında
 * gruplanmış bölüm nesnesi ister. `altbaslik` bloğu yeni bölüm açar, sonraki
 * `paragraf`/`liste`/`tablo` blokları o bölümü doldurur. Tohumlamanın tersidir.
 *
 * `POLITIKA_TASLAK_UYARISI` Mongo'da DURMAZ: koleksiyonda karşılığı
 * `hukukiOnay: false` bayrağıdır, uyarının metni değil. Metin bu yüzden kod
 * düzeyinde sabit kalır (taksonomi gibi) ve `politikaTaslakUyarisi()` bayrağa
 * bakarak döndürür. Uyarı kaldırılmadı: yedi kaydın hepsinde `hukukiOnay`
 * false.
 */

/**
 * Hukuk incelemesinden geçmemiş metinlerin sayfada bastığı uyarı.
 *
 * Bu bir içerik alanı değil, `hukukiOnay: false` bayrağının insan okunur
 * karşılığıdır; koleksiyonda böyle bir alan yoktur ve uydurulmuş bir değer de
 * değildir — fixture'daki metin birebir korunmuştur.
 */
export const POLITIKA_TASLAK_UYARISI =
  'Bu metin editoryal taslaktır ve hukuki görüş yerine geçmez. Yayına alınmadan önce hukuk danışmanlığıyla gözden geçirilecektir.';

/* --- ŞEMADAKİ HÂL --------------------------------------------------------- */

type PolitikaBelgesi = {
  slug: string;
  baslik: string;
  ozet?: string;
  yururlukTarihi: string;
  surum: string;
  hukukiOnay?: boolean;
  govde?: Blok[];
  surumler?: SurumKaydi[];
  seo?: SeoAlanlari;
};

type SayfaBelgesi = {
  slug: string;
  yol?: string;
  baslik: string;
  etiket?: string;
  ozet?: string;
  govde?: Blok[];
  guncellemeTarihi?: string;
  seo?: SeoAlanlari;
};

/* --- GÖRÜNÜM TİPLERİ ------------------------------------------------------ */

/** Hukuki metin — `MetinSayfasi` proplarının tamamını taşır. */
export type Politika = {
  slug: string;
  /** Kanonik adres. `politikalar` şemasında `yol` alanı yok: `/<slug>/`. */
  yol: string;
  baslik: string;
  ozet?: string;
  /** ISO tarih; sayfa `guncelleme` propuna verir. */
  yururlukTarihi: string;
  surum: string;
  hukukiOnay: boolean;
  /** `hukukiOnay` false ise taslak uyarısı, değilse `undefined`. */
  taslakUyarisi?: string;
  bolumler: MetinBolumu[];
  surumler?: SurumKaydi[];
  seo?: SeoAlanlari;
};

/** Listede gövde okunmaz; bölüm dizisi taşımayan hafif görünüm. */
export type PolitikaOzeti = Omit<Politika, 'bolumler' | 'surumler'>;

/** Editoryal sayfa (hakkında, künye, metodoloji, editoryal metinler). */
export type EditoryalSayfa = {
  slug: string;
  /** `yol` alanı varsa kanonik adres odur, yoksa `/<slug>/`. */
  yol: string;
  baslik: string;
  etiket?: string;
  ozet?: string;
  guncellemeTarihi?: string;
  bolumler: MetinBolumu[];
  seo?: SeoAlanlari;
};

export type EditoryalSayfaOzeti = Omit<EditoryalSayfa, 'bolumler'>;

/* --- GÖVDE → BÖLÜM ------------------------------------------------------- */

/** Liste sorgularında okunmayan ağır alanlar. */
const POLITIKA_AGIR = ['govde', 'surumler'] as const;
const SAYFA_AGIR = ['govde'] as const;

function yolla(slug: string, yol?: string): string {
  const temiz = yol?.trim();
  return temiz && temiz.length > 0 ? temiz : `/${slug}/`;
}

/**
 * Blok dizisini `MetinSayfasi`'nin beklediği bölüm dizisine toplar.
 *
 * `MetinBolumu` yalnızca dört şeyi sunabilir: başlık, paragraflar, tek bir
 * madde listesi ve tek bir tablo. Bunun dışındaki blok tipleri (`alinti`,
 * `kod`, `akis`, `uyari`) bileşende karşılıksızdır; paragrafa çevirmek
 * alıntının kaynağını, kodun dilini ve uyarının tonunu kaybettireceği için
 * bu bloklar ATLANIR ve uyarı basılır. `kisa-cevap` düz metindir, paragraf
 * olarak sunulmasında bilgi kaybı yoktur.
 *
 * İlk `altbaslik`ten önce gelen bloklar da atlanır: bölüm nesnesi başlık ve
 * çapa kimliği zorunlu kıldığı için başlıksız içeriği taşımanın yolu, olmayan
 * bir başlık uydurmaktan geçer.
 */
function bolumlere(kaynak: string, slug: string, govde?: Blok[]): MetinBolumu[] {
  const bolumler: MetinBolumu[] = [];
  let acik: MetinBolumu | undefined;

  for (const blok of govde ?? []) {
    if (blok.tip === 'altbaslik') {
      const baslik = blok.metin.trim();
      if (baslik.length === 0) {
        console.warn(`[icerik:politikalar] ${kaynak}/${slug} — başlıksız altbaslik bloğu atlandı.`);
        acik = undefined;
        continue;
      }
      const kimlik = blok.kimlik?.trim();
      if (!kimlik) {
        console.warn(
          `[icerik:politikalar] ${kaynak}/${slug} — "${baslik}" bloğunda çapa kimliği yok; sıra numarası kullanıldı.`,
        );
      }
      acik = { kimlik: kimlik || `bolum-${bolumler.length + 1}`, baslik };
      bolumler.push(acik);
      continue;
    }

    if (!acik) {
      console.warn(
        `[icerik:politikalar] ${kaynak}/${slug} — ilk başlıktan önceki "${blok.tip}" bloğu atlandı.`,
      );
      continue;
    }

    switch (blok.tip) {
      case 'paragraf':
      case 'kisa-cevap': {
        const metin = blok.metin.trim();
        if (metin.length > 0) acik.paragraflar = [...(acik.paragraflar ?? []), metin];
        break;
      }
      case 'liste': {
        const ogeler = blok.ogeler.map((oge) => oge.trim()).filter((oge) => oge.length > 0);
        if (ogeler.length > 0) acik.liste = [...(acik.liste ?? []), ...ogeler];
        break;
      }
      case 'tablo': {
        if (acik.tablo) {
          console.warn(
            `[icerik:politikalar] ${kaynak}/${slug} — "${acik.baslik}" bölümünde ikinci tablo atlandı; bölüm tek tablo sunabiliyor.`,
          );
          break;
        }
        acik.tablo = { basliklar: blok.basliklar, satirlar: blok.satirlar };
        break;
      }
      default:
        console.warn(
          `[icerik:politikalar] ${kaynak}/${slug} — "${blok.tip}" bloğu atlandı; MetinSayfasi bu tipi sunamıyor.`,
        );
    }
  }

  return bolumler;
}

/* --- POLİTİKALAR (hukuki metinler) --------------------------------------- */

function politikaOzetine(belge: PolitikaBelgesi): PolitikaOzeti {
  const hukukiOnay = belge.hukukiOnay === true;
  return {
    slug: belge.slug,
    yol: yolla(belge.slug),
    baslik: belge.baslik,
    ozet: belge.ozet,
    yururlukTarihi: belge.yururlukTarihi,
    surum: belge.surum,
    hukukiOnay,
    taslakUyarisi: hukukiOnay ? undefined : POLITIKA_TASLAK_UYARISI,
    seo: belge.seo,
  };
}

function politikaGorunume(belge: PolitikaBelgesi): Politika {
  return {
    ...politikaOzetine(belge),
    bolumler: bolumlere('politikalar', belge.slug, belge.govde),
    surumler: belge.surumler,
  };
}

/** Yayındaki hukuki metinler, başlığa göre Türkçe sıralı. Gövde okunmaz. */
export async function politikaListesi(): Promise<PolitikaOzeti[]> {
  const belgeler = await yayindakiler<PolitikaBelgesi>(KOLEKSIYONLAR.politikalar, {
    haric: POLITIKA_AGIR,
  });
  return belgeler.map(politikaOzetine).sort((a, b) => a.baslik.localeCompare(b.baslik, 'tr'));
}

/** Tek hukuki metin, gövdesi ve sürüm geçmişiyle. Taslakta `undefined`. */
export async function politikaBul(slug: string): Promise<Politika | undefined> {
  const belge = await slugIle<PolitikaBelgesi>(KOLEKSIYONLAR.politikalar, slug);
  return belge ? politikaGorunume(belge) : undefined;
}

/** `generateStaticParams` için politika slug listesi. */
export async function politikaSluglari(): Promise<string[]> {
  return yayindakiSluglar(KOLEKSIYONLAR.politikalar);
}

/**
 * Bir metnin basacağı taslak uyarısı; hukuk onayı varsa `undefined`.
 *
 * Kayıt bulunamazsa da `undefined` döner — olmayan bir metnin uyarısı
 * basılmaz.
 */
export async function politikaTaslakUyarisi(slug: string): Promise<string | undefined> {
  const belge = await slugIle<PolitikaBelgesi>(KOLEKSIYONLAR.politikalar, slug);
  if (!belge) return undefined;
  return belge.hukukiOnay === true ? undefined : POLITIKA_TASLAK_UYARISI;
}

/* --- SAYFALAR (editoryal metinler) --------------------------------------- */

function sayfaOzetine(belge: SayfaBelgesi): EditoryalSayfaOzeti {
  return {
    slug: belge.slug,
    yol: yolla(belge.slug, belge.yol),
    baslik: belge.baslik,
    etiket: belge.etiket,
    ozet: belge.ozet,
    guncellemeTarihi: belge.guncellemeTarihi,
    seo: belge.seo,
  };
}

function sayfaGorunume(belge: SayfaBelgesi): EditoryalSayfa {
  return {
    ...sayfaOzetine(belge),
    bolumler: bolumlere('sayfalar', belge.slug, belge.govde),
  };
}

/** Yayındaki editoryal sayfalar, başlığa göre Türkçe sıralı. Gövde okunmaz. */
export async function sayfaListesi(): Promise<EditoryalSayfaOzeti[]> {
  const belgeler = await yayindakiler<SayfaBelgesi>(KOLEKSIYONLAR.sayfalar, {
    haric: SAYFA_AGIR,
  });
  return belgeler.map(sayfaOzetine).sort((a, b) => a.baslik.localeCompare(b.baslik, 'tr'));
}

/** Tek editoryal sayfa, gövdesiyle. Taslakta `undefined`. */
export async function sayfaBul(slug: string): Promise<EditoryalSayfa | undefined> {
  const belge = await slugIle<SayfaBelgesi>(KOLEKSIYONLAR.sayfalar, slug);
  return belge ? sayfaGorunume(belge) : undefined;
}

/** `generateStaticParams` için editoryal sayfa slug listesi. */
export async function sayfaSluglari(): Promise<string[]> {
  return yayindakiSluglar(KOLEKSIYONLAR.sayfalar);
}

/* --- FIXTURE ADLARININ KARŞILIKLARI -------------------------------------- */

/**
 * Aşağıdaki yedi fonksiyon, fixture'ın yedi sabit dizisinin yerini alır.
 * Adlandırma `lib/icerik/temel.ts`'teki kalıbı izler (`KONULAR` → `konular()`):
 * sabit adı camelCase bir `async` fonksiyona dönüşür.
 *
 * Dönen değer yalnızca bölüm dizisidir; böylece `bolumler={EDITORYAL_ILKELER}`
 * yerine `bolumler={await editoryalIlkeler()}` yazmak sayfayı taşımaya yeter.
 * Ancak künye (başlık, özet, etiket, güncelleme, sürüm) artık Mongo'da
 * olduğundan sayfaların `sayfaBul()` / `politikaBul()` kullanması ve kayıt
 * yoksa `notFound()` vermesi tercih edilir: boş bir bölüm dizisi, gövdesiz bir
 * politika sayfası basar.
 */

async function sayfaBolumleri(slug: string): Promise<MetinBolumu[]> {
  return (await sayfaBul(slug))?.bolumler ?? [];
}

async function politikaBolumleri(slug: string): Promise<MetinBolumu[]> {
  return (await politikaBul(slug))?.bolumler ?? [];
}

/** `EDITORYAL_ILKELER` karşılığı — `sayfalar` koleksiyonundan. */
export async function editoryalIlkeler(): Promise<MetinBolumu[]> {
  return sayfaBolumleri('editoryal-ilkeler');
}

/** `AI_POLITIKASI` karşılığı — `sayfalar` koleksiyonundan. */
export async function aiPolitikasi(): Promise<MetinBolumu[]> {
  return sayfaBolumleri('ai-politikasi');
}

/** `DUZELTME_POLITIKASI` karşılığı — `sayfalar` koleksiyonundan. */
export async function duzeltmePolitikasi(): Promise<MetinBolumu[]> {
  return sayfaBolumleri('duzeltme-politikasi');
}

/** `KVKK_AYDINLATMA` karşılığı — `politikalar` koleksiyonundan. */
export async function kvkkAydinlatma(): Promise<MetinBolumu[]> {
  return politikaBolumleri('kvkk-aydinlatma');
}

/** `GIZLILIK` karşılığı — `politikalar` koleksiyonundan. */
export async function gizlilik(): Promise<MetinBolumu[]> {
  return politikaBolumleri('gizlilik');
}

/** `CEREZ_POLITIKASI` karşılığı — `politikalar` koleksiyonundan. */
export async function cerezPolitikasi(): Promise<MetinBolumu[]> {
  return politikaBolumleri('cerez-politikasi');
}

/** `KULLANIM_SARTLARI` karşılığı — `politikalar` koleksiyonundan. */
export async function kullanimSartlari(): Promise<MetinBolumu[]> {
  return politikaBolumleri('kullanim-sartlari');
}
