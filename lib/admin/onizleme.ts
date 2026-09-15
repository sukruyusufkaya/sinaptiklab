import { createHash, randomBytes } from 'node:crypto';
import { ObjectId } from 'mongodb';
import { yapilandirmaBul } from '@/lib/admin/alanlar/kayit';
import { veritabani } from '@/lib/mongo/istemci';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { basarili, basarisiz, korumaliEylem } from '@/lib/yetki/korumali-eylem';
import { izinVarMi, KOLEKSIYON_IZNI, nesneYetkisi } from '@/lib/yetki/roller';

/**
 * Taslak önizleme anahtarları.
 *
 * NEDEN AYRI BİR ROTA — `draftMode()` DEĞİL:
 * `draftMode()` dinamik bir API'dir; render sırasında okunması o rotayı
 * dinamiğe çevirir. Site sayfaları statik üretilip `revalidatePath` ile
 * tazeleniyor. Site sayfalarına draftMode eklemek tüm statik üretimi
 * düşürürdü. Bu yüzden önizleme kendi rotasında yaşar:
 * `app/onizleme/[anahtar]/page.tsx` — site rota grubunun dışında,
 * force-dynamic ve noindex.
 *
 * GÜVENLİK MODELİ (oturum tokeniyle aynı):
 *  - Anahtar URL'de DÜZ durur, veritabanında yalnızca SHA-256 özeti. Koleksiyon
 *    sızarsa anahtarlar geri üretilemez.
 *  - 32 bayt `randomBytes` — tahmin edilemez.
 *  - Ömür kısa (48 saat) ve `biterZaman` üzerinde TTL dizini var; süresi geçen
 *    kayıt Mongo tarafından temizlenir. Okuma yolu yine de `biterZaman`
 *    kontrolü yapar: TTL gözcüsü dakikada bir çalışır, yani "süresi geçti ama
 *    henüz silinmedi" penceresi gerçektir.
 *  - Anahtar TEK BELGEYE kilitlidir; başka bir kaydı açmaya yaramaz.
 *
 * `kullanildi` alanı bu akışta İPTAL bayrağı olarak yorumlanır: okuma yolu
 * `true` ise 404 verir, ama render anahtarı yakmaz. Aksi hâlde tarayıcının ön
 * yüklemesi veya tek bir yenileme bağlantıyı öldürür ve "onay için birine
 * gösterme" amacı çalışmaz.
 */

/** Önizleme bağlantısının ömrü. Kısa tutulur; bir onay turu için yeterli. */
export const ONIZLEME_SURESI_MS = 48 * 60 * 60 * 1000;

/** Oturum tokeniyle aynı kalıp (bkz. `lib/yetki/oturum.ts`). */
function ozetle(anahtar: string): string {
  return createHash('sha256').update(anahtar).digest('base64url');
}

/** `randomBytes(32).toString('base64url')` çıktısının alfabesi. */
const ANAHTAR_KALIBI = /^[A-Za-z0-9_-]{32,200}$/;

export function onizlemeYolu(anahtar: string): string {
  return `/onizleme/${anahtar}/`;
}

type OnizlemeBelgesi = {
  anahtarOzeti: string;
  koleksiyon: string;
  belgeKimligi: string;
  belgeSlug?: string;
  biterZaman: Date;
  olusturanKimlik?: ObjectId;
  kullanildi?: boolean;
  olusturuldu?: Date;
};

export type UretilenAnahtar = {
  anahtar: string;
  /** Kopyalanabilir göreli yol; mutlak adresi istemci kendi kökünden kurar. */
  yol: string;
  /** ISO 8601 — istemci bileşenine Date geçirmemek için metin. */
  biterZaman: string;
};

export type OnizlemeKaydi = {
  koleksiyon: string;
  kimlik: string;
  belgeSlug?: string;
  biterZaman: Date;
};

/* --- ÜRETME --------------------------------------------------------------- */

/**
 * Bir kayıt için önizleme anahtarı üretir; DÜZ anahtarı döndürür, özetini yazar.
 *
 * Düz anahtar yalnızca bu dönüşte görünür — veritabanında yalnızca özeti durur,
 * yani bağlantı kaybolursa yenisi üretilir, eskisi kurtarılamaz.
 *
 * `kullanici` GİRDİDEN ALINMAZ: `korumaliEylem` bağlamından gelir. Aksi hâlde
 * çağıran kendi kimliğini uydurabilirdi.
 *
 * Sarmalayıcının kapısı `icerik:yaz`; hedef koleksiyonun kendi yazma izni ve
 * nesne düzeyindeki sahiplik kararı gövdede ayrıca kontrol edilir. Okuma izni
 * (`icerik:oku`) kapı olarak YETMEZ: önizleme bağlantısı yayın durumunu
 * atlatır, yani onu ancak içeriği düzenleyebilen biri üretebilir.
 */
export const onizlemeAnahtariUret = korumaliEylem<
  { koleksiyon: string; kimlik: string },
  UretilenAnahtar
>('icerik:yaz', async ({ koleksiyon, kimlik }, { kullanici, kaydet }) => {
  const yapilandirma = yapilandirmaBul(koleksiyon);
  if (!yapilandirma) {
    return basarisiz<UretilenAnahtar>('Bu koleksiyon panelden yönetilmiyor.');
  }
  if (!ObjectId.isValid(kimlik)) {
    return basarisiz<UretilenAnahtar>('Geçersiz kayıt kimliği.');
  }

  const izinler = KOLEKSIYON_IZNI[koleksiyon];
  if (!izinler || !izinVarMi(kullanici.roller, izinler.yaz)) {
    return basarisiz<UretilenAnahtar>('Bu koleksiyonda önizleme bağlantısı üretemezsiniz.', {
      kod: 'izin-yok',
    });
  }

  const db = await veritabani();
  const belge = await db.collection(koleksiyon).findOne({ _id: new ObjectId(kimlik) });
  if (!belge) return basarisiz<UretilenAnahtar>('Kayıt bulunamadı.');

  const karar = nesneYetkisi({ kullanici, koleksiyon, belge, eylem: 'yaz' });
  if (!karar.izinli) return basarisiz<UretilenAnahtar>(karar.neden, { kod: 'izin-yok' });

  const anahtar = randomBytes(32).toString('base64url');
  const biterZaman = new Date(Date.now() + ONIZLEME_SURESI_MS);
  const anahtarAlani = belge[yapilandirma.anahtarAlan];
  const belgeSlug = typeof anahtarAlani === 'string' ? anahtarAlani : undefined;

  await db.collection<OnizlemeBelgesi>(KOLEKSIYONLAR.onizlemeAnahtarlari).insertOne({
    anahtarOzeti: ozetle(anahtar),
    koleksiyon,
    belgeKimligi: kimlik,
    belgeSlug,
    biterZaman,
    olusturanKimlik: new ObjectId(kullanici.kimlik),
    kullanildi: false,
    olusturuldu: new Date(),
  });

  /**
   * Denetim eylemi `DenetimEylemi` birleşiminden seçilir; şema enum'u
   * tanımadığı değeri reddeder. Önizlemeye özel bir eylem adı YOK, bu yüzden
   * kayıt `olustur` olarak önizleme koleksiyonu adına yazılır.
   */
  await kaydet({
    eylem: 'olustur',
    koleksiyon: KOLEKSIYONLAR.onizlemeAnahtarlari,
    belgeKimligi: kimlik,
    belgeSlug,
    not: `Önizleme bağlantısı üretildi (${koleksiyon}); ${biterZaman.toISOString()} tarihinde biter.`,
  });

  return basarili<UretilenAnahtar>(
    { anahtar, yol: onizlemeYolu(anahtar), biterZaman: biterZaman.toISOString() },
    'Önizleme bağlantısı hazır. Bağlantıyı bilen herkes bu taslağı görebilir.',
  );
});

/* --- ÇÖZME ---------------------------------------------------------------- */

/**
 * URL'deki düz anahtarı kayda çevirir. Geçersiz, süresi geçmiş veya iptal
 * edilmiş anahtarda `null` döner — çağıran taraf `notFound()` verir.
 *
 * Ret nedenleri AYRIŞTIRILMAZ: "anahtar yok" ile "süresi geçmiş" aynı yanıtı
 * üretir, böylece geçerli anahtar arayan biri yanıttan bilgi çıkaramaz.
 */
export async function onizlemeAnahtariniCoz(anahtar: string): Promise<OnizlemeKaydi | null> {
  if (typeof anahtar !== 'string' || !ANAHTAR_KALIBI.test(anahtar)) return null;

  const db = await veritabani();
  const kayit = await db
    .collection<OnizlemeBelgesi>(KOLEKSIYONLAR.onizlemeAnahtarlari)
    .findOne({ anahtarOzeti: ozetle(anahtar) });

  if (!kayit) return null;
  if (kayit.kullanildi === true) return null;
  if (!(kayit.biterZaman instanceof Date)) return null;
  if (kayit.biterZaman.getTime() <= Date.now()) return null;
  if (typeof kayit.koleksiyon !== 'string' || typeof kayit.belgeKimligi !== 'string') return null;

  return {
    koleksiyon: kayit.koleksiyon,
    kimlik: kayit.belgeKimligi,
    belgeSlug: kayit.belgeSlug,
    biterZaman: kayit.biterZaman,
  };
}

/**
 * Önizlenen belgeyi DURUMUNA BAKMADAN okur — taslağı göstermenin tek yolu bu.
 *
 * Koleksiyon, panelde yönetilen koleksiyonlarla sınırlıdır: `kullanicilar`,
 * `oturumlar` veya `aboneler` gibi kişisel veri koleksiyonları kayıt
 * defterinde olmadığı için elle üretilmiş bir kayıtla bile buradan okunamaz.
 */
export async function onizlemeBelgesiGetir(
  kayit: OnizlemeKaydi,
): Promise<Record<string, unknown> | null> {
  if (!yapilandirmaBul(kayit.koleksiyon)) return null;
  if (!ObjectId.isValid(kayit.kimlik)) return null;

  const db = await veritabani();
  const belge = await db.collection(kayit.koleksiyon).findOne({ _id: new ObjectId(kayit.kimlik) });
  return belge ? { ...belge, _id: String(belge._id) } : null;
}
