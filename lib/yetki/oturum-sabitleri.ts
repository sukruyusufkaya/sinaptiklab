/**
 * Oturum sabitleri — Edge çalışma zamanında da içe alınabilir.
 *
 * `lib/yetki/oturum.ts` mongodb ve node:crypto kullanır; `proxy.ts` (Edge)
 * o modülü içe alamaz. Çerez adı gibi paylaşılan sabitler bu yüzden ayrı
 * ve bağımlılıksız bir dosyada durur.
 */

export const OTURUM_COOKIE = 'sinaptik_oturum';

/** Kayan pencere: etkin kullanımda ileri alınır. */
export const KAYAN_SURE_MS = 8 * 60 * 60 * 1000;

/** Uzatılamaz üst sınır. */
export const MUTLAK_SURE_MS = 7 * 24 * 60 * 60 * 1000;

/** Her istekte veritabanına yazmamak için kaydırma eşiği. */
export const KAYDIRMA_ESIGI_MS = 5 * 60 * 1000;
