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

/**
 * Sinaptik işaretinin salt SVG hâli — CSS değişkeni içermez.
 *
 * `SinaptikIsareti` bileşeni token kullanır (doğrusu o); bu kopya sunucuda
 * görsel üretmek için vardır. İkisinin geometrisi AYNI tutulmalı.
 */
export function isaretSvg(boyut: number): string {
  return [
    `<svg width="${boyut}" height="${boyut}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">`,
    `<rect x="0.75" y="0.75" width="30.5" height="30.5" rx="9" fill="${MARKA.vurguZemin}" stroke="${MARKA.vurgu}" stroke-opacity="0.45" stroke-width="1.5"/>`,
    `<path d="M9.5 21.5 15 16l-2.5-2.8L22 9.5" fill="none" stroke="${MARKA.vurguParlak}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
    `<circle cx="9.5" cy="21.5" r="2.6" fill="${MARKA.ikincil}"/>`,
    `<circle cx="22" cy="9.5" r="2.6" fill="${MARKA.vurguParlak}"/>`,
    `<circle cx="15" cy="16" r="1.6" fill="${MARKA.sinyal}"/>`,
    '</svg>',
  ].join('');
}
