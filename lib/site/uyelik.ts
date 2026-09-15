import { createHash, randomBytes } from 'node:crypto';
import { oturumKullanicisi, type OturumKullanicisi } from '@/lib/yetki/oturum';

/**
 * Site üyeliği — paylaşılan yardımcılar.
 *
 * ÜYE Mİ EDİTÖR Mİ: ikisi de `kullanicilar` koleksiyonunda durur ve AYNI
 * oturum mekanizmasını kullanır. Ayrımı ROL yapar: `uye`/`okur` site üyesi,
 * `sahip`/`yonetici`/`editor`/`yazar`/`moderator` panel rolleri.
 *
 * Neden ayrı bir üye oturumu / ayrı çerez KURULMADI: iki paralel oturum
 * mekanizması iki kez iptal mantığı, iki kez süre yönetimi ve iki kez
 * güvenlik denetimi demektir — hata yüzeyi ikiye katlanır. Tek mekanizma
 * korunur; panele erişim `panelErisimiVarMi()` ile ayrıca kapılıdır, yani bir
 * üye oturumu panel yetkisi kazanmaz.
 *
 * ANAHTAR SAKLAMA: doğrulama ve sıfırlama anahtarları parola ve oturum
 * tokeniyle aynı kalıptadır — düz değer yalnızca bağlantıda taşınır,
 * veritabanında SHA-256 özeti durur.
 */

/** Site üyesi rolleri. */
export const UYE_ROLLERI = ['uye', 'okur'] as const;

/** Kayıt sırasında verilen rol. Girdiden ASLA rol okunmaz. */
export const VARSAYILAN_UYE_ROLU = 'uye';

/** E-posta doğrulama bağlantısının ömrü. */
export const DOGRULAMA_SURESI_MS = 48 * 60 * 60 * 1000;

/**
 * Parola sıfırlama bağlantısının ömrü.
 *
 * Doğrulamadan çok daha kısa: sıfırlama anahtarı ele geçirilirse hesabın
 * tamamı devralınır, doğrulama anahtarı ise yalnızca bir bayrağı çevirir.
 */
export const SIFIRLAMA_SURESI_MS = 60 * 60 * 1000;

/** Anahtarı özetler. Karşılaştırma her zaman özet üzerinde yapılır. */
export function anahtarOzetle(anahtar: string): string {
  return createHash('sha256').update(anahtar).digest('base64url');
}

/** Yeni anahtar üretir. 32 bayt = 256 bit entropi. */
export function anahtarUret(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * Oturumdaki kullanıcı bir site üyesi mi.
 *
 * Panel rolü olan bir kullanıcı da sitede oturum açmış sayılır (editör de
 * okuyucudur); bu yüzden ölçüt "üye rolü var" değil "oturum var".
 */
export async function uyeOturumu(): Promise<OturumKullanicisi | null> {
  return oturumKullanicisi();
}

/**
 * Üyelik gerektiren sayfalar için: oturum yoksa giriş yoluna gönderilecek
 * adresi döndürür.
 *
 * `redirect()` BURADA ÇAĞRILMAZ — çağıran sayfa kendi `redirect()`'ini yapar;
 * böylece bu modül Server Action içinden de güvenle kullanılabilir (eylem
 * sarmalayıcısının catch bloğu redirect istisnasını yutardı).
 */
export function girisYolu(devam: string): string {
  const guvenli = devam.startsWith('/') ? devam : '/hesabim/';
  return `/giris/?devam=${encodeURIComponent(guvenli)}`;
}

/** Üyenin görünen adı; yoksa e-postanın yerel parçası. */
export function gorunenAd(kullanici: OturumKullanicisi): string {
  if (kullanici.adSoyad && kullanici.adSoyad.trim()) return kullanici.adSoyad.trim();
  const [yerel] = kullanici.eposta.split('@');
  return yerel ?? kullanici.eposta;
}
