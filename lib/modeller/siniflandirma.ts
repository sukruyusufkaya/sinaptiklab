/**
 * Model kayıtlarının SINIFLANDIRMA katmanı.
 *
 * NEDEN VAR: `modeller` koleksiyonundaki üç alan serbest metindir ve zamanla
 * birbirine benzemeyen yazımlar birikti. 340 yayındaki kayıtta:
 *
 *   - `tip` 35 ayrı değer taşıyor. "Gömme" ile "Gömme (embedding)" aynı şey,
 *     "Kodlama LLM" / "Kodlama" / "Kod odaklı LLM" / "Kod modeli" dört ayrı
 *     kutu. Ham `tip` üzerinden kurulan bir filtre 35 seçenek gösterir ve
 *     hiçbirini doğru saymaz.
 *   - `modaliteler` hem `gorsel` (103) hem `görsel` (85) hem `Görsel` (3)
 *     içeriyor. "Görsel girdiyi destekleyen modeller" filtresi bugün
 *     kayıtların yarısını kaçırır.
 *   - `fiyatlandirma.birim` 30 ayrı değer taşıyor: 84 kayıt "1M token" derken
 *     kimi "1 görsel", kimi "1 saat ses", kimi "1K karakter" diyor. Bunları
 *     aynı sütunda toplayıp karşılaştırmak, bir modelin yüzlerce kat ucuz
 *     görünmesine yol açar.
 *
 * Çözüm veriyi toplu güncellemek DEĞİL: kayıtlar sağlayıcı dokümanından
 * alındıkları biçimi koruyor ve `kaynakAdres` ile doğrulanabiliyor. Yazımı
 * bozmak kaynakla bağı koparır. Bunun yerine OKUMA anında kanonik bir anahtar
 * türetilir; ham değer görüntülenmeye devam eder.
 *
 * TÜRKÇE FARKINDALIKLI eşleştirme `lib/metin.ts` içindeki `anahtar()`
 * fonksiyonundan gelir: `görsel` ile `gorsel` aynı anahtara düşsün diye
 * küçültme yerel ayardan bağımsız yapılır ve sonuç ASCII'ye indirilir.
 */

import { anahtar, sayi } from '@/lib/metin';

export { anahtar, kucult, sayi } from '@/lib/metin';

/* --- MODEL KATEGORİSİ ----------------------------------------------------- */

export type ModelKategorisi =
  'dil-modeli' | 'kodlama' | 'gorsel-uretim' | 'video-uretim' | 'ses' | 'gomme' | 'diger';

export const KATEGORI_ADI: Record<ModelKategorisi, string> = {
  'dil-modeli': 'Dil modeli',
  kodlama: 'Kodlama modeli',
  'gorsel-uretim': 'Görsel üretimi',
  'video-uretim': 'Video üretimi',
  ses: 'Ses ve konuşma',
  gomme: 'Gömme ve sıralama',
  diger: 'Diğer',
};

/** Ekranda bu sırayla görünür. */
export const KATEGORI_SIRASI: readonly ModelKategorisi[] = [
  'dil-modeli',
  'kodlama',
  'gorsel-uretim',
  'video-uretim',
  'ses',
  'gomme',
  'diger',
];

/**
 * SIRA ÖNEMLİ: "Kod odaklı çok modlu LLM" hem `kod` hem `llm` içerir ve
 * kodlama kutusuna girmelidir; bu yüzden kodlama kuralı dil modelinden ÖNCE
 * denenir. Aynı nedenle gömme kuralı da en başta: "Gömme ve kodlayıcı modeli"
 * bir kodlama modeli değildir.
 */
const KATEGORI_KURALLARI: readonly { kategori: ModelKategorisi; desen: RegExp }[] = [
  { kategori: 'gomme', desen: /gomme|embedding|reranker|yeniden-siralama/ },
  { kategori: 'kodlama', desen: /kod/ },
  { kategori: 'video-uretim', desen: /video/ },
  { kategori: 'ses', desen: /ses|konusma|muzik|tts|stt/ },
  { kategori: 'gorsel-uretim', desen: /gorsel-uretim|goruntu-uretim/ },
  { kategori: 'dil-modeli', desen: /llm|dil-modeli|ajan-modeli|belge-anlama|temel-modeli/ },
];

/** `tip` serbest metnini kanonik kategoriye indirir. */
export function modelKategorisi(tip: string | undefined): ModelKategorisi {
  if (!tip) return 'diger';
  const a = anahtar(tip);
  for (const kural of KATEGORI_KURALLARI) if (kural.desen.test(a)) return kural.kategori;
  return 'diger';
}

/* --- MODALİTE ------------------------------------------------------------- */

export type Modalite = 'metin' | 'gorsel' | 'ses' | 'video' | 'kod';

export const MODALITE_ADI: Record<Modalite, string> = {
  metin: 'Metin',
  gorsel: 'Görsel',
  ses: 'Ses',
  video: 'Video',
  kod: 'Kod',
};

export const MODALITE_SIRASI: readonly Modalite[] = ['metin', 'gorsel', 'ses', 'video', 'kod'];

const MODALITE_KURALLARI: readonly { modalite: Modalite; desen: RegExp }[] = [
  { modalite: 'metin', desen: /^metin/ },
  { modalite: 'gorsel', desen: /^gorsel|^goruntu|^resim/ },
  { modalite: 'ses', desen: /^ses|^konusma|^audio/ },
  { modalite: 'video', desen: /^video/ },
  { modalite: 'kod', desen: /^kod/ },
];

/**
 * Ham modalite dizisini kanonik kümeye indirir.
 *
 * `Metin girdisi`, `Metin çıktısı` ve `metin` tek bir `metin` değerine düşer:
 * bu alan hangi YÖNDE desteklendiğini güvenilir biçimde taşımıyor (340 kaydın
 * yalnızca üçünde yön yazılı), dolayısıyla yön varmış gibi göstermek uydurma
 * olurdu. Tanınmayan değer sessizce düşürülür, uydurma bir kutuya atılmaz.
 */
export function modaliteleriNormalle(ham: readonly string[] | undefined): Modalite[] {
  const kume = new Set<Modalite>();
  for (const parca of ham ?? []) {
    const a = anahtar(parca);
    for (const kural of MODALITE_KURALLARI) {
      if (kural.desen.test(a)) {
        kume.add(kural.modalite);
        break;
      }
    }
  }
  return MODALITE_SIRASI.filter((m) => kume.has(m));
}

/* --- FİYAT ---------------------------------------------------------------- */

export type HamFiyat = {
  girdiBirimFiyat?: number;
  ciktiBirimFiyat?: number;
  birim?: string;
  paraBirimi?: string;
  kaynakAdres?: string;
};

export type TokenFiyati = {
  girdi?: number;
  cikti?: number;
  paraBirimi: string;
  /** `birim` alanındaki parantezli kayıt — hücrede dipnot olarak görünür. */
  kosul?: string;
  kaynakAdres?: string;
};

/**
 * Fiyatı yalnızca 1M METİN TOKENI birimindeyse döndürür.
 *
 * `null` dönmesi "fiyat yok" demek değildir; "bu fiyat token başına DEĞİL,
 * dolayısıyla token tabanlı bir sütunda gösterilemez" demektir. 135 fiyatlı
 * kayıttan 84'ü düz `1M token`, 22'si parantezli koşullu bir token tarifesi,
 * kalanı görsel/saniye/saat/karakter başına. Sonuncuları aynı sütuna koymak
 * bir modeli yüzlerce kat ucuz gösterirdi.
 *
 * `1M ses token'ı` bilinçli olarak DIŞARIDA: birim adı token olsa da ses
 * tokenı metin tokenıyla aynı şey değildir ve yan yana konursa yanıltır.
 */
export function tokenFiyati(ham: HamFiyat | undefined): TokenFiyati | null {
  if (!ham) return null;
  const birim = ham.birim ?? '';
  const a = anahtar(birim);
  if (!a.startsWith('1m-token')) return null;
  if (a.includes('ses-token')) return null;
  if (ham.girdiBirimFiyat == null && ham.ciktiBirimFiyat == null) return null;

  const parantez = birim.match(/\(([^)]*)\)/);
  return {
    girdi: ham.girdiBirimFiyat,
    cikti: ham.ciktiBirimFiyat,
    paraBirimi: ham.paraBirimi ?? 'USD',
    kosul: parantez?.[1],
    kaynakAdres: ham.kaynakAdres,
  };
}

/** Token tarifesi olmayan fiyatın okunur hâli: "girdi 0,04 USD / 1 görsel". */
export function fiyatMetni(ham: HamFiyat | undefined): string | undefined {
  if (!ham) return undefined;
  const birim = ham.birim ?? 'birim';
  const para = ham.paraBirimi ?? 'USD';
  const parcalar: string[] = [];
  if (ham.girdiBirimFiyat != null) parcalar.push(`girdi ${sayi(ham.girdiBirimFiyat)}`);
  if (ham.ciktiBirimFiyat != null) parcalar.push(`çıktı ${sayi(ham.ciktiBirimFiyat)}`);
  if (parcalar.length === 0) return undefined;
  return `${parcalar.join(' · ')} ${para} / ${birim}`;
}
