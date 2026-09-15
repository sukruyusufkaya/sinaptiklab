/**
 * Arama dizini. Komut paleti (⌘K) ve /ara/ sayfası aynı dizini kullanır.
 *
 * Üretimde bu yerini hibrit aramaya (lexical + vector + reranking) bırakacak;
 * şimdilik ad, kısaltma ve slug üzerinde puanlı eşleşme yapılır.
 */

export type AramaGrubu =
  | 'Kavram'
  | 'Terim'
  | 'Konu'
  | 'Rehber'
  | 'Gündem'
  | 'Analiz'
  | 'Model'
  | 'Şirket'
  | 'Araç'
  | 'Öğren'
  | 'Ders'
  | 'Test'
  | 'Araştırma'
  | 'Dergi'
  | 'Podcast'
  | 'Kurumsal'
  | 'Sektör'
  | 'Vaka'
  | 'Lab'
  | 'Kariyer'
  | 'Sayfa';

export type AramaKaydi = {
  grup: AramaGrubu;
  ad: string;
  aciklama?: string;
  yol: string;
  /** Görünen ada ek arama anahtarları: slug, kısaltma, eş anlamlılar. */
  anahtarlar: string[];
};

/** Türkçe arama için basitleştirme: büyük/küçük ve aksan farkını yok sayar. */
export function sadelestir(metin: string) {
  return metin
    .toLocaleLowerCase('tr-TR')
    .replaceAll('ı', 'i')
    .replaceAll('ğ', 'g')
    .replaceAll('ü', 'u')
    .replaceAll('ş', 's')
    .replaceAll('ö', 'o')
    .replaceAll('ç', 'c')
    .replaceAll('â', 'a')
    .trim();
}

/*
 * FIXTURE TABANLI `aramaDizini()` KALDIRILDI.
 *
 * Dizin `lib/veri/*` fixture'larından kuruluyordu ve site MongoDB'ye taşınınca
 * donup kaldı: 234 kayıt görüyordu, yayında ~900 kayıt vardı. Yerine sunucu
 * tarafında veritabanından kurulan `lib/arama-dizini.ts` geçti. Bu dosyada
 * yalnızca SAF fonksiyonlar kaldı (`sadelestir`, `puanla`, `ara`,
 * `ARAMA_ONERILERI`); hepsi istemcide çalışabilir ve hiçbir veri kaynağına
 * bağlı değildir.
 */

/**
 * Basit sıralama: tam eşleşme > ad başlangıcı > anahtar eşleşmesi > ad içinde >
 * açıklama içinde.
 */
export function puanla(kayit: AramaKaydi, sorgu: string): number {
  const ad = sadelestir(kayit.ad);
  const anahtarlar = kayit.anahtarlar.filter(Boolean).map(sadelestir);
  const aciklama = sadelestir(kayit.aciklama ?? '');

  if (ad === sorgu || anahtarlar.includes(sorgu)) return 100;
  if (ad.startsWith(sorgu)) return 80;
  if (anahtarlar.some((anahtar) => anahtar.startsWith(sorgu))) return 60;
  if (ad.includes(sorgu)) return 40;
  if (anahtarlar.some((anahtar) => anahtar.includes(sorgu))) return 20;
  if (aciklama.includes(sorgu)) return 10;
  return 0;
}

/**
 * Verilen dizinde arar.
 *
 * DİZİN ARTIK PARAMETRE. Eskiden `aramaDizini()` ile fixture'lardan
 * okunuyordu; site Atlas'a taşınınca o dizin dondu ve arama yayındaki
 * kayıtların yalnızca dörtte birini görür oldu. Dizin sunucuda kurulur
 * (`lib/arama-dizini.ts`) ve çağırana verilir; bu fonksiyon saf kalır,
 * dolayısıyla istemcide de çalışır.
 */
export function ara(
  dizin: AramaKaydi[],
  sorgu: string,
  enCok = 12,
  grup?: AramaGrubu,
): AramaKaydi[] {
  const q = sadelestir(sorgu);
  if (!q) return [];

  return dizin
    .filter((kayit) => !grup || kayit.grup === grup)
    .map((kayit) => ({ kayit, puan: puanla(kayit, q) }))
    .filter(({ puan }) => puan > 0)
    .sort((a, b) => b.puan - a.puan || a.kayit.ad.localeCompare(b.kayit.ad, 'tr'))
    .slice(0, enCok)
    .map(({ kayit }) => kayit);
}

export const ARAMA_ONERILERI = [
  'RAG',
  'AI Agent',
  'Embedding',
  'Bağlam penceresi',
  'Model karşılaştırma',
  'AI Readiness',
  'Prompt injection',
  'Değerlendirme',
];
