import { Bricolage_Grotesque, JetBrains_Mono, Newsreader } from "next/font/google";

/**
 * Tipografi self-host stratejisi (BRIEF §5.3 + ADR 0001 sapma notu):
 * next/font/google fontları BUILD ZAMANINDA indirir ve /_next/static altından
 * servis eder — runtime'da Google CDN'e tek istek gitmez. localFont yerine bunu
 * kullanmamızın nedeni: latin + latin-ext subset'lerini TEK aile içinde
 * unicode-range'li @font-face'lerle birleştirip size-adjust'lı fallback'i
 * ailenin arkasına koyabilmesi. (Subset başına ayrı localFont ailesi + zincir
 * denemesi, yanlış metrikli fallback yüzünden CLS 0.337 / LCP 4.4s üretti —
 * ölçüm: 2026-08-08 Lighthouse koşusu.)
 */

/**
 * display stratejisi (LCP ölçümüne dayalı, bkz. ADR 0001):
 * - Başlık (Bricolage): "swap" — marka kimliği; başlıklar nadiren LCP elemanı.
 * - Gövde/mono: "optional" — LCP elemanı gövde metnidir; swap yeniden boyaması
 *   LCP'yi font inişine kilitliyordu (ölçüm: 4.4s). optional + preload ile hızlı
 *   bağlantıda font ilk boyamada girer, yavaş bağlantıda metrik-uyumlu fallback
 *   kalır ve LCP ≈ FCP olur. İtalik ve wdth ekseni kullanılmaya başlanınca
 *   (Faz 3, MDX) yeniden eklenecek — şimdilik preload yükünü şişirmesin.
 */
const display = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  weight: "variable",
  axes: ["opsz"],
  display: "swap",
});

const govde = Newsreader({
  subsets: ["latin", "latin-ext"],
  weight: "variable",
  display: "optional",
});

const mono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  weight: "variable",
  display: "optional",
  preload: false,
});

/** <html> üzerine inline CSS değişkeni olarak basılır; globals.css bunları tüketir. */
export const fontDegiskenleri = {
  "--font-display": `${display.style.fontFamily}, sans-serif`,
  "--font-govde": `${govde.style.fontFamily}, Georgia, serif`,
  "--font-mono": `${mono.style.fontFamily}, ui-monospace, monospace`,
} as const;
