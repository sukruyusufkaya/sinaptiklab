// Kurumsal ve yasal sayfaların ortak sabitleri — tek kaynak.
// Tarih elle güncellenir: "son güncelleme" bir OLGUDUR, build tarihi değildir;
// otomatik `new Date()` basmak metnin gerçekten gözden geçirildiği izlenimi
// verirdi (BRIEF §1.2 "uydurma yok").

/** Kurumsal/yasal metinlerin en son elle gözden geçirildiği tarih. */
export const SON_GUNCELLEME = "9 Ağustos 2026";

/** Tek iletişim adresi (Faz 7'de rol bazlı adreslerle genişleyecek). */
export const EPOSTA = "ee.sukruyusufkaya@gmail.com";

/** Kurucu, sorumlu editör ve tek yazar. */
export const YAZAR = "Şükrü Yusuf Kaya";

/** Konu satırı önceden doldurulmuş mailto bağlantısı üretir. */
export function epostaBaglantisi(konu: string): string {
  return `mailto:${EPOSTA}?subject=${encodeURIComponent(konu)}`;
}
