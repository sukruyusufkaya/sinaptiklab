import { Bricolage_Grotesque, JetBrains_Mono, Newsreader } from 'next/font/google';

/**
 * Yazı tipleri build zamanında indirilip self-host edilir; runtime'da Google CDN'e
 * istek gitmez. Türkçe için `latin-ext` alt kümesi zorunludur.
 */

/** Başlık ve arayüz — editoryal karakterli modern grotesk. */
export const yaziDisplay = Bricolage_Grotesque({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--yazi-display',
  axes: ['opsz'],
});

/** Uzun metin gövdesi — ekran için tasarlanmış editoryal serif. */
export const yaziSerif = Newsreader({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--yazi-serif',
  style: ['normal', 'italic'],
});

/** Veri, etiket ve kod — ölçüm hissi veren monospace. */
export const yaziMono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--yazi-mono',
});

export const yaziSinifi = [yaziDisplay.variable, yaziSerif.variable, yaziMono.variable].join(' ');
