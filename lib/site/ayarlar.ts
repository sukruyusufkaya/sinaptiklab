import { cache } from 'react';
import { veritabani } from '@/lib/mongo/istemci';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';

/**
 * Site ayarlarının OKUNMASI.
 *
 * Panel `ayarlar` koleksiyonuna dört anahtar yazıyordu ama hiçbiri okunmuyordu:
 * editör bakım kipini açıyor, site hiçbir şey yapmıyordu. Bu modül o boşluğu
 * kapatır.
 *
 * NEDEN `lib/admin/ayar-eylemleri.ts` İÇİNDEKİ `ayarOku` KULLANILMIYOR
 *
 * O dosya `'use server'` ile işaretli bir Server Action modülüdür. Site
 * sayfasından içe almak, sayfanın istemci paketine o modülün tüm eylem
 * referanslarını sokar ve okuma yolunu yazma yoluyla aynı dosyaya bağlar.
 * Okuma ile yazmanın ayrı modüllerde durması, site tarafının panele hiç
 * bağımlı olmaması anlamına gelir.
 *
 * STATİK ÜRETİM KORUNUR
 *
 * Buradaki okumalar `cookies()` / `headers()` / `draftMode()` gibi DİNAMİK API
 * DEĞİLDİR; sıradan veri çekmedir. Bu yüzden ayarı okuyan bir düzen ya da sayfa
 * dinamiğe düşmez, derleme anında değeri gömer. Editör ayarı değiştirdiğinde
 * `ayarKaydet` zaten `revalidatePath('/', 'layout')` çağırıyor ve sayfalar
 * yeniden üretiliyor. Ayarı `cookies()` üzerinden okumak tüm sitenin statik
 * üretimini kaybettirirdi.
 *
 * HATA DAVRANIŞI: veritabanına ulaşılamazsa varsayılan döner ve site ayakta
 * kalır. Bakım kipinin varsayılanı `false`: bağlantı hatası yüzünden site
 * kendini kapatmaz.
 */

type AyarBelgesi = { anahtar: string; deger?: unknown };

/**
 * Dört ayarı tek sorguda okur.
 *
 * `cache()` ile istek kapsamında tekillenir: düzen bakım kipini, ana sayfa
 * manşet slug'ını, altlık bülten anahtarını sorsa bile Atlas'a bir kez gidilir.
 */
const ayarlariOku = cache(async (): Promise<Map<string, unknown>> => {
  try {
    const db = await veritabani();
    const kayitlar = await db
      .collection<AyarBelgesi>(KOLEKSIYONLAR.ayarlar)
      .find({}, { projection: { _id: 0, anahtar: 1, deger: 1 } })
      .toArray();
    return new Map(kayitlar.map((k) => [k.anahtar, k.deger]));
  } catch (hata) {
    console.error('[site:ayarlar] okunamadı, varsayılanlar kullanılıyor', hata);
    return new Map();
  }
});

async function mantik(anahtar: string, varsayilan: boolean): Promise<boolean> {
  const deger = (await ayarlariOku()).get(anahtar);
  return typeof deger === 'boolean' ? deger : varsayilan;
}

async function metin(anahtar: string): Promise<string | undefined> {
  const deger = (await ayarlariOku()).get(anahtar);
  if (typeof deger !== 'string') return undefined;
  const kirpik = deger.trim();
  return kirpik.length > 0 ? kirpik : undefined;
}

/* --- DÖRT AYAR ------------------------------------------------------------ */

/**
 * Bakım kipi. Açıkken site içeriği yerine bakım ekranı gösterilir.
 *
 * Varsayılan `false` — veritabanı hatasında site kapanmaz.
 */
export function bakimKipi(): Promise<boolean> {
  return mantik('bakim-kipi', false);
}

/** Üst barın altındaki duyuru şeridi metni. Boşsa şerit hiç basılmaz. */
export function duyuruSeridi(): Promise<string | undefined> {
  return metin('duyuru-seridi');
}

/**
 * Ana sayfa manşetini ELLE seçen slug.
 *
 * Boşsa manşet içeriğin kendi `oneCikan` alanından gelir (editoryal varsayılan).
 * Doluysa o slug manşete çıkar — kırık bir slug verilirse manşet yine
 * `oneCikan`'a düşer; ana sayfa boş kalmaz.
 */
export function mansetSlugu(): Promise<string | undefined> {
  return metin('manset-slug');
}

/**
 * Bülten kayıt formu etkin mi.
 *
 * Kapalıyken form yerine "kayıtlar şu an kapalı" bilgisi gösterilir. Varsayılan
 * `true`: ayar hiç yazılmamışsa bülten çalışır (mevcut davranış korunur).
 */
export function bultenAktif(): Promise<boolean> {
  return mantik('bulten-aktif', true);
}
