/**
 * Toplanan veri ekranlarının enum ve etiketleri.
 *
 * Değerler `lib/mongo/koleksiyonlar.ts` şemasındaki `enum` listelerinin
 * birebir karşılığıdır; ayrışırlarsa süzgeç sessizce boş sonuç döndürür, bu
 * yüzden ikisi birlikte güncellenir.
 *
 * Bu modül veritabanına DOKUNMAZ ve yalnızca ilkel değer taşır: istemci
 * bileşenleri (durum düğmeleri) de güvenle içe alabilir. Sorgu modülü
 * (`lib/mongo/sorgular/gelen.ts`) sunucu tarafıdır ve istemciye giremez.
 */

export const ONAY_DURUMLARI = ['bekliyor', 'onayli', 'cikti'] as const;
export type OnayDurumu = (typeof ONAY_DURUMLARI)[number];

export const ONAY_DURUMU_ADI: Record<string, string> = {
  bekliyor: 'onay bekliyor',
  onayli: 'onaylı',
  cikti: 'çıktı',
};

export const FORM_TURLERI = [
  'iletisim',
  'teklif',
  'etkinlik-kayit',
  'readiness-talebi',
  'katki',
] as const;
export type FormTuru = (typeof FORM_TURLERI)[number];

export const FORM_TURU_ADI: Record<string, string> = {
  iletisim: 'iletişim',
  teklif: 'teklif',
  'etkinlik-kayit': 'etkinlik kaydı',
  'readiness-talebi': 'readiness talebi',
  katki: 'katkı',
};

export const ISLEM_DURUMLARI = ['yeni', 'islemde', 'kapandi'] as const;
export type IslemDurumu = (typeof ISLEM_DURUMLARI)[number];

export const ISLEM_DURUMU_ADI: Record<IslemDurumu, string> = {
  yeni: 'yeni',
  islemde: 'işlemde',
  kapandi: 'kapandı',
};

export const ARAMA_GORUNUMLERI = ['acik', 'sonuclu', 'incelenmedi'] as const;
export type AramaGorunumu = (typeof ARAMA_GORUNUMLERI)[number];

/** Gelen metnin iş akışı durumu olup olmadığını doğrular (URL ve form girdisi). */
export function islemDurumuMu(deger: unknown): deger is IslemDurumu {
  return typeof deger === 'string' && (ISLEM_DURUMLARI as readonly string[]).includes(deger);
}
