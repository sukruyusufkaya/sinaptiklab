import localFont from "next/font/local";

/**
 * Tipografi self-host stratejisi (BRIEF §5.3):
 * Fontsource woff2 dosyaları subset (latin / latin-ext) başına ayrı dosya olarak
 * gelir; Türkçe glifler (ğ, ş, İ…) latin-ext'tedir. next/font/local tek ailede
 * unicode-range'li çoklu subset desteklemediği için her subset ayrı aile olarak
 * tanımlanır ve font-family ZİNCİRİ ile birleştirilir: tarayıcı glif bazında bir
 * sonraki aileye düşer (CSS font matching). unicode-range declaration'ları
 * indirmeyi subset bazında sınırlar.
 *
 * DİKKAT: next/font çağrıları derleme zamanında ayrıştırılır — tüm değerler
 * YAZILI LİTERAL olmak zorunda (değişken/sabit kullanmak build'i kırar).
 */

// ── Display: Bricolage Grotesque (wght 200-800 + wdth 75-100 + opsz) ──
const bricolageLatin = localFont({
  src: "../app/fonts/bricolage-grotesque-latin-standard-normal.woff2",
  weight: "200 800",
  display: "swap",
  preload: true,
  adjustFontFallback: false,
  declarations: [
    { prop: "font-stretch", value: "75% 100%" },
    {
      prop: "unicode-range",
      value:
        "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
    },
  ],
});
const bricolageExt = localFont({
  src: "../app/fonts/bricolage-grotesque-latin-ext-standard-normal.woff2",
  weight: "200 800",
  display: "swap",
  preload: true,
  adjustFontFallback: "Arial",
  declarations: [
    { prop: "font-stretch", value: "75% 100%" },
    {
      prop: "unicode-range",
      value:
        "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF",
    },
  ],
});

// ── Gövde: Newsreader (wght 200-800, normal + italik) ──
const newsreaderLatin = localFont({
  src: [
    { path: "../app/fonts/newsreader-latin-wght-normal.woff2", style: "normal" },
    { path: "../app/fonts/newsreader-latin-wght-italic.woff2", style: "italic" },
  ],
  weight: "200 800",
  display: "swap",
  preload: true,
  adjustFontFallback: false,
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
    },
  ],
});
const newsreaderExt = localFont({
  src: [
    { path: "../app/fonts/newsreader-latin-ext-wght-normal.woff2", style: "normal" },
    { path: "../app/fonts/newsreader-latin-ext-wght-italic.woff2", style: "italic" },
  ],
  weight: "200 800",
  display: "swap",
  preload: true,
  adjustFontFallback: "Times New Roman",
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF",
    },
  ],
});

// ── Yardımcı/kod: JetBrains Mono (wght 100-800) ──
const jetbrainsLatin = localFont({
  src: "../app/fonts/jetbrains-mono-latin-wght-normal.woff2",
  weight: "100 800",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
    },
  ],
});
const jetbrainsExt = localFont({
  src: "../app/fonts/jetbrains-mono-latin-ext-wght-normal.woff2",
  weight: "100 800",
  display: "swap",
  preload: false,
  adjustFontFallback: "Arial",
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF",
    },
  ],
});

/** <html> üzerine inline CSS değişkeni olarak basılır; globals.css bunları tüketir. */
export const fontDegiskenleri = {
  "--font-display": `${bricolageLatin.style.fontFamily}, ${bricolageExt.style.fontFamily}, sans-serif`,
  "--font-govde": `${newsreaderLatin.style.fontFamily}, ${newsreaderExt.style.fontFamily}, Georgia, serif`,
  "--font-mono": `${jetbrainsLatin.style.fontFamily}, ${jetbrainsExt.style.fontFamily}, ui-monospace, monospace`,
} as const;
