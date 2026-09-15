/**
 * Biçimlendirme yardımcıları.
 *
 * İçerik değil, sunumdur: `lib/veri/*` fixture'ları MongoDB'ye taşınırken bu
 * fonksiyonlar kodda kalır. Daha önce `lib/veri/temel.ts` içinde duruyorlardı
 * ve o dosya silindiğinde onlarca sayfa kırılacaktı.
 */

/** "2026-09-12" → "12 Eylül 2026". */
export function tarihUzun(tarih: string) {
  return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'long' }).format(new Date(tarih));
}

/** "2026-09-12" → "12 Eyl". */
export function tarihKisa(tarih: string) {
  return new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short' }).format(
    new Date(tarih),
  );
}
