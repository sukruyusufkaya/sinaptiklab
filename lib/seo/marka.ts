/**
 * Marka renklerinin SABİT (statik) karşılıkları.
 *
 * NEDEN TOKEN DEĞİL: `app/globals.css` içindeki `--vurgu` gibi CSS değişkenleri
 * yalnızca tarayıcıda çözülür. `icon.tsx`, `opengraph-image.tsx` ve
 * `manifest.ts` ise SUNUCUDA, CSS olmadan görsel üretir; bir CSS değişkenine
 * başvurulursa renk hiç uygulanmaz ve görsel şeffaf/siyah çıkar.
 *
 * CLAUDE.md değişmez kural 2 ("token dışı renk yok") BİLEŞENLER için geçerlidir.
 * Burası bileşen değil, CSS'in ulaşamadığı görsel üretim sınırıdır — bu yüzden
 * tek istisna burada tanımlanır ve BAŞKA HİÇBİR YERDE çıplak renk yazılmaz.
 *
 * Değerler `globals.css` içindeki KARANLIK tema tokenlarının sRGB karşılığıdır;
 * paylaşım kartları ve simge her iki temada aynı görünür (sosyal ağlar tema
 * bilgisi göndermez). Token değiştirilirse buradaki karşılığı da güncellenir.
 */

export const MARKA = {
  /** --zemin-derin */
  zemin: '#14161f',
  /** --zemin */
  zeminAcik: '#1b1e29',
  /** --metin */
  metin: '#f4f5f8',
  /** --metin-ikincil yaklaşığı */
  metinIkincil: '#a8adbd',
  /** --vurgu */
  vurgu: '#7b5cf0',
  /** --vurgu-parlak */
  vurguParlak: '#9b83f7',
  /** --vurgu-zemin */
  vurguZemin: '#2a2145',
  /** --ikincil */
  ikincil: '#4fc3e8',
  /** --sinyal */
  sinyal: '#a8e838',
  /** --kenar yaklaşığı */
  kenar: '#2c3040',
} as const;
