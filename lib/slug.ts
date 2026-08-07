// BRIEF §2.2 — Türkçe slug üretimi. toLowerCase, TR haritalamasından SONRA
// çağrılır; aksi halde "İ".toLowerCase() "i̇" (i + combining dot) üretir.
const TR_HARITA: Record<string, string> = {
  ı: "i",
  İ: "i",
  ğ: "g",
  Ğ: "g",
  ş: "s",
  Ş: "s",
  ç: "c",
  Ç: "c",
  ö: "o",
  Ö: "o",
  ü: "u",
  Ü: "u",
};

// Normalizasyon SONRASI halleriyle (mı→mi, mü→mu zaten eşlenmiş olur)
const STOP_KELIMELER = new Set(["ve", "ile", "veya", "ya", "da", "de", "ki", "mi", "mu"]);

const MAKS_UZUNLUK = 60;

export function slugla(girdi: string): string {
  const normal = girdi
    .replace(/[ıİğĞşŞçÇöÖüÜ]/g, (h) => TR_HARITA[h] ?? h)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’‘‛`´ʻʼ]/g, ""); // apostrof tire olmaz, düşer

  const kelimeler = normal.split(/[^a-z0-9]+/).filter((k) => k.length > 0);
  const kalanlar = kelimeler.filter((k) => !STOP_KELIMELER.has(k));
  // Hepsi stop-word ise boş dönme; ham kelimelere geri düş
  let slug = (kalanlar.length > 0 ? kalanlar : kelimeler).join("-");

  if (slug.length > MAKS_UZUNLUK) {
    const kesim = slug.lastIndexOf("-", MAKS_UZUNLUK);
    slug = kesim > 0 ? slug.slice(0, kesim) : slug.slice(0, MAKS_UZUNLUK);
  }
  return slug;
}
