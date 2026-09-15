import 'server-only';
import type { AiModeli } from '@/lib/tipler';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { yayindakiler } from '@/lib/mongo/sorgular/site';
import {
  anahtar,
  fiyatMetni,
  modaliteleriNormalle,
  modelKategorisi,
  tokenFiyati,
  type Modalite,
  type ModelKategorisi,
  type TokenFiyati,
} from './siniflandirma';

/**
 * Karşılaştırma stüdyosunun okuma katmanı.
 *
 * NEDEN AYRI BİR OKUYUCU: `/karsilastir/` sayfası `modelListesi()` ile 340
 * kaydın TAMAMINI istemciye geçiriyordu — her kayıt `ozet`, `kaynaklar` ve
 * uzun `kullanimAlanlari` taşıdığı için sayfa 1,16 MB HTML üretiyor ve 340
 * sıralanmamış düğme basıyordu. Bir kullanıcının o yığından "Claude Fable 5.1"i
 * bulma şansı yok; tarayıcının o yığını ayrıştırma maliyeti ise her ziyarette
 * ödeniyordu.
 *
 * Katman ikiye ayrıldı:
 *
 *   - `kiyasDizini()` — SEÇİCİ için. Kayıt başına yalnızca arama, süzme ve
 *     etiketleme için gereken alanlar. İstemciye geçen tek liste budur.
 *   - `kiyasKayitlari()` — TABLO için. Yalnızca seçili 2–4 modelin tam kaydı,
 *     sunucuda okunur ve sunucuda render edilir (değişmez kural 4).
 *
 * Seçim URL'de (`?m=`) taşınır: karşılaştırma paylaşılabilir ve tarayıcı
 * geçmişinde geri gidilebilir olur. İstemci durumunda tutulsaydı, bir kıyası
 * birine göndermenin yolu ekran görüntüsü olurdu.
 */

/** Seçicinin ihtiyaç duyduğu en küçük kayıt. */
export type KiyasDizinKaydi = {
  slug: string;
  ad: string;
  saglayici: string;
  kategori: ModelKategorisi;
  modaliteler: Modalite[];
  acikAgirlik: boolean | null;
  aileMi: boolean;
  /** 1M girdi tokenı fiyatı — yalnızca token tarifeli kayıtlarda. */
  girdiFiyat: number | null;
  paraBirimi: string | null;
};

/** Tablonun ihtiyaç duyduğu tam kayıt. */
export type KiyasKaydi = {
  slug: string;
  ad: string;
  saglayici: string;
  saglayiciSlug?: string;
  tip: string;
  kategori: ModelKategorisi;
  aileMi: boolean;
  aileSlug?: string;
  baglamPenceresi?: string;
  modaliteler: Modalite[];
  acikAgirlik: boolean | null;
  lisans?: string;
  api: boolean | null;
  guncellik?: string;
  vurgu?: string;
  kullanimAlanlari: string[];
  siniriliklar: string[];
  /** Token tarifesi — yoksa `null`, bu "fiyat yok" demek değildir. */
  token: TokenFiyati | null;
  /** Token tarifesi olmayan fiyatın okunur hâli. */
  digerFiyat?: string;
  kaynakSayisi: number;
};

type ModelBelgesi = Omit<AiModeli, 'durum' | 'siniriliklar'> & {
  durum?: string;
  guncellikDurumu?: string;
  sinirliliklar?: string[];
};

/**
 * Ağır alanlar sorguda DIŞARIDA bırakılır.
 *
 * `ozet` tek başına aile hub'larında 2 KB'ı geçiyor; 340 kayıtta yalnızca bu
 * alan yarım megabayt eder ve karşılaştırma tablosunda hiç kullanılmaz.
 */
const AGIR_ALANLAR = ['ozet', 'govde', 'sss', 'yetenekler', 'seo', 'surumler'] as const;

async function belgeler(): Promise<ModelBelgesi[]> {
  return yayindakiler<ModelBelgesi>(KOLEKSIYONLAR.modeller, { haric: AGIR_ALANLAR });
}

function adaGore<T extends { ad: string }>(kayitlar: T[]): T[] {
  return [...kayitlar].sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
}

/**
 * Seçicinin dizini.
 *
 * `acikAgirlik` üç durumludur ve `null` bilinçlidir: 327 kayıtta yazılı, 13'ünde
 * değil. Bilinmeyeni `false` saymak "bu model kapalı ağırlıklı" demek olurdu —
 * uydurma veri (CLAUDE.md §5). Süzgeç bu yüzden `null` kayıtları "açık" ya da
 * "kapalı" filtresinin hiçbirine koymaz.
 */
export async function kiyasDizini(): Promise<KiyasDizinKaydi[]> {
  const kayitlar = await belgeler();
  return adaGore(
    kayitlar.map((belge) => {
      const token = tokenFiyati(belge.fiyatlandirma);
      return {
        slug: belge.slug,
        ad: belge.ad,
        saglayici: belge.saglayici,
        kategori: modelKategorisi(belge.tip),
        modaliteler: modaliteleriNormalle(belge.modaliteler),
        acikAgirlik: belge.acikAgirlik ?? belge.acikKaynak ?? null,
        aileMi: belge.aileMi === true,
        girdiFiyat: token?.girdi ?? null,
        paraBirimi: token?.paraBirimi ?? null,
      };
    }),
  );
}

/**
 * Seçili modellerin tam kaydı — İSTENEN SIRAYI korur.
 *
 * Sütun sırası kullanıcının seçim sırasıdır; ada göre sıralamak, birinin
 * paylaştığı kıyasta sütunların yer değiştirmesine yol açardı. Bulunamayan
 * slug sessizce düşer; sayfa kaç model bulduğuna kendisi karar verir.
 */
export async function kiyasKayitlari(sluglar: readonly string[]): Promise<KiyasKaydi[]> {
  if (sluglar.length === 0) return [];
  const kayitlar = await belgeler();
  const harita = new Map(kayitlar.map((belge) => [belge.slug, belge]));

  return sluglar
    .map((slug) => harita.get(slug))
    .filter((belge): belge is ModelBelgesi => Boolean(belge))
    .map((belge) => ({
      slug: belge.slug,
      ad: belge.ad,
      saglayici: belge.saglayici,
      saglayiciSlug: belge.saglayiciSlug,
      tip: belge.tip,
      kategori: modelKategorisi(belge.tip),
      aileMi: belge.aileMi === true,
      aileSlug: belge.aileSlug,
      baglamPenceresi: belge.baglamPenceresi,
      modaliteler: modaliteleriNormalle(belge.modaliteler),
      acikAgirlik: belge.acikAgirlik ?? belge.acikKaynak ?? null,
      lisans: belge.lisans,
      api: belge.api ?? null,
      guncellik: belge.guncellikDurumu,
      vurgu: belge.vurgu,
      kullanimAlanlari: belge.kullanimAlanlari ?? [],
      siniriliklar: belge.sinirliliklar ?? [],
      token: tokenFiyati(belge.fiyatlandirma),
      digerFiyat: tokenFiyati(belge.fiyatlandirma) ? undefined : fiyatMetni(belge.fiyatlandirma),
      kaynakSayisi: belge.kaynaklar?.length ?? 0,
    }));
}

/* --- URL DURUMU ----------------------------------------------------------- */

/** Aynı anda kıyaslanabilecek en çok model — dördüncü sütun mobilde taşıyor. */
export const EN_COK_KIYAS = 4;

/**
 * Açılış seçimi.
 *
 * Aile hub'ları (`gpt-ailesi`, `claude-ailesi`…) daha tanıdık adlardır ama
 * hub kaydı tek bir tarife TAŞIMAZ — bir aile dört fiyat kademesi içerir.
 * Onlarla açıldığında maliyet paneli boş geliyordu: sayfanın en ayırt edici
 * bölümü, ilk izlenimde hiçbir şey göstermiyordu.
 *
 * Bu üçlü bilinçli: üç ayrı sağlayıcı, üçünde de tam token tarifesi, biri
 * açık ağırlıklı. İlk iki modelin GİRDİ fiyatı aynı, ÇIKTI fiyatı farklı —
 * sayfanın anlattığı şeyi tablo açılır açılmaz gösteriyor: tek bir sayıya
 * bakmak yanıltır, sıralama iş yükünün girdi/çıktı oranına göre değişir.
 */
export const VARSAYILAN_KIYAS = ['claude-sonnet-5', 'gpt-5-6-terra', 'mistral-large-3'] as const;

/**
 * `?m=` parametresini temiz bir slug listesine indirir.
 *
 * Adres çubuğu kullanıcı girdisidir: tekrarlanan, boş, aşırı uzun ya da slug
 * biçiminde olmayan değerler gelebilir. Süzgeç burada, sorgudan ÖNCE uygulanır;
 * aksi hâlde 500 elemanlı bir `?m=` listesi 500 kayıtlık bir tabloya dönerdi.
 */
export function kiyasParametresi(ham: string | string[] | undefined): string[] {
  const metin = Array.isArray(ham) ? ham.join(',') : (ham ?? '');
  if (!metin.trim()) return [...VARSAYILAN_KIYAS];
  const temiz = metin
    .split(',')
    .map((parca) => parca.trim())
    .filter((parca) => /^[a-z0-9-]{1,80}$/.test(parca));
  return [...new Set(temiz)].slice(0, EN_COK_KIYAS);
}

/* --- BOYUTLAR ------------------------------------------------------------- */

export type BoyutGrubu = 'kimlik' | 'yetenek' | 'erisim' | 'maliyet' | 'karar';

export const GRUP_ADI: Record<BoyutGrubu, string> = {
  kimlik: 'Kimlik',
  yetenek: 'Yetenek',
  erisim: 'Erişim ve lisans',
  maliyet: 'Maliyet',
  karar: 'Karar notları',
};

export type Hucre =
  | { bicim: 'metin'; deger?: string }
  | { bicim: 'rozetler'; deger: string[] }
  | { bicim: 'liste'; deger: string[] }
  | { bicim: 'evet-hayir'; deger: boolean | null }
  | { bicim: 'para'; deger?: number; paraBirimi?: string; kosul?: string; kaynak?: string };

export type Boyut = {
  anahtar: string;
  ad: string;
  grup: BoyutGrubu;
  /** Satırın ne anlattığı — başlık hücresinde küçük puntoyla görünür. */
  not?: string;
  hucre: (kayit: KiyasKaydi) => Hucre;
};

/**
 * Bir hücrenin KARŞILAŞTIRMA anahtarı.
 *
 * "Yalnızca farkları göster" süzgeci bu anahtara bakar. Metin karşılaştırması
 * ham değer üzerinden yapılsaydı `Görsel` ile `gorsel` farklı sayılır, aynı
 * yeteneğe sahip iki model "farklı" satırında görünürdü.
 */
export function hucreAnahtari(hucre: Hucre): string {
  switch (hucre.bicim) {
    case 'metin':
      return anahtar(hucre.deger ?? '');
    case 'rozetler':
    case 'liste':
      return hucre.deger.map(anahtar).sort().join('|');
    case 'evet-hayir':
      return hucre.deger === null ? 'bilinmiyor' : String(hucre.deger);
    case 'para':
      return hucre.deger == null ? 'yok' : `${hucre.deger}-${hucre.paraBirimi ?? ''}`;
  }
}

const GUNCELLIK_ADI: Record<string, string> = {
  guncel: 'Güncel',
  yeni: 'Yeni',
  'onceki-surum': 'Önceki sürüm',
  emekli: 'Emekli',
};

export const KIYAS_BOYUTLARI: readonly Boyut[] = [
  {
    anahtar: 'saglayici',
    ad: 'Sağlayıcı',
    grup: 'kimlik',
    hucre: (k) => ({ bicim: 'metin', deger: k.saglayici }),
  },
  {
    anahtar: 'tip',
    ad: 'Model tipi',
    grup: 'kimlik',
    not: 'Sağlayıcının kendi tanımı',
    hucre: (k) => ({ bicim: 'metin', deger: k.tip }),
  },
  {
    anahtar: 'guncellik',
    ad: 'Güncellik',
    grup: 'kimlik',
    hucre: (k) => ({ bicim: 'metin', deger: k.guncellik ? GUNCELLIK_ADI[k.guncellik] : undefined }),
  },
  {
    anahtar: 'baglam',
    ad: 'Bağlam penceresi',
    grup: 'yetenek',
    not: 'Tek istekte taşınabilen en çok token',
    hucre: (k) => ({ bicim: 'metin', deger: k.baglamPenceresi }),
  },
  {
    anahtar: 'modaliteler',
    ad: 'Modaliteler',
    grup: 'yetenek',
    hucre: (k) => ({ bicim: 'rozetler', deger: k.modaliteler }),
  },
  {
    anahtar: 'acikAgirlik',
    ad: 'Açık ağırlık',
    grup: 'erisim',
    not: 'Ağırlıklar indirilip kendi donanımında çalıştırılabiliyor mu',
    hucre: (k) => ({ bicim: 'evet-hayir', deger: k.acikAgirlik }),
  },
  {
    anahtar: 'lisans',
    ad: 'Lisans',
    grup: 'erisim',
    hucre: (k) => ({ bicim: 'metin', deger: k.lisans }),
  },
  {
    anahtar: 'api',
    ad: 'Yönetilen API',
    grup: 'erisim',
    hucre: (k) => ({ bicim: 'evet-hayir', deger: k.api }),
  },
  {
    anahtar: 'girdiFiyat',
    ad: 'Girdi · 1M token',
    grup: 'maliyet',
    not: 'Sağlayıcının liste fiyatı',
    hucre: (k) => ({
      bicim: 'para',
      deger: k.token?.girdi,
      paraBirimi: k.token?.paraBirimi,
      kosul: k.token?.kosul,
      kaynak: k.token?.kaynakAdres,
    }),
  },
  {
    anahtar: 'ciktiFiyat',
    ad: 'Çıktı · 1M token',
    grup: 'maliyet',
    not: 'Sağlayıcının liste fiyatı',
    hucre: (k) => ({
      bicim: 'para',
      deger: k.token?.cikti,
      paraBirimi: k.token?.paraBirimi,
      kosul: k.token?.kosul,
      kaynak: k.token?.kaynakAdres,
    }),
  },
  {
    anahtar: 'kullanim',
    ad: 'Tipik kullanım',
    grup: 'karar',
    hucre: (k) => ({ bicim: 'liste', deger: k.kullanimAlanlari.slice(0, 4) }),
  },
  {
    anahtar: 'vurgu',
    ad: 'Öne çıkan',
    grup: 'karar',
    hucre: (k) => ({ bicim: 'metin', deger: k.vurgu }),
  },
  {
    anahtar: 'sinir',
    ad: 'Dikkat edilecekler',
    grup: 'karar',
    hucre: (k) => ({ bicim: 'liste', deger: k.siniriliklar.slice(0, 4) }),
  },
];

/* --- İŞ YÜKÜ SENARYOLARI -------------------------------------------------- */

/**
 * Aylık maliyet senaryoları.
 *
 * Buradaki token hacimleri ÖLÇÜM DEĞİL VARSAYIMDIR ve ekranda öyle
 * etiketlenir (CLAUDE.md §5). Hesap, sağlayıcının yayımladığı liste fiyatıyla
 * yapılan düz bir çarpımdır: `girdi × milyonGirdi + çıktı × milyonCikti`.
 * Uydurma olan tek şey hacim olurdu; onu okurun kendi rakamıyla
 * değiştirebilmesi için formül açıkça yazılır.
 *
 * Senaryolar gerçek mimari kalıplarından türer: sohbette istem kısadır, RAG'de
 * girdi bağlamla şişer, ajan akışında aynı bağlam her araç turunda yeniden
 * gönderilir. Oranlar bu yüzden farklıdır.
 */
export type IsYuku = {
  anahtar: string;
  ad: string;
  aciklama: string;
  milyonGirdi: number;
  milyonCikti: number;
};

/**
 * İlk senaryo AYRI bir sabit: `IS_YUKLERI[0]` dizi indeksidir ve
 * `noUncheckedIndexedAccess` altında `undefined` olabilir. Varsayılanı
 * adlandırmak, geri düşüşün tipini de anlamını da açık hâle getirir.
 */
const VARSAYILAN_IS_YUKU: IsYuku = {
  anahtar: 'sohbet',
  ad: 'Soru-cevap asistanı',
  aciklama: 'Kısa istem, kısa yanıt. Bağlam her turda yeniden gönderilmiyor.',
  milyonGirdi: 20,
  milyonCikti: 4,
};

export const IS_YUKLERI: readonly IsYuku[] = [
  VARSAYILAN_IS_YUKU,
  {
    anahtar: 'rag',
    ad: 'Belge üzerinden yanıt (RAG)',
    aciklama: 'Her soruya getirilen parçalar girdiyi şişirir; çıktı kısa kalır.',
    milyonGirdi: 100,
    milyonCikti: 10,
  },
  {
    anahtar: 'ajan',
    ad: 'Ajan iş akışı',
    aciklama: 'Araç turları bağlamı tekrar tekrar gönderir; hem girdi hem çıktı büyür.',
    milyonGirdi: 200,
    milyonCikti: 40,
  },
];

export function isYukuBul(anahtarDegeri: string | string[] | undefined): IsYuku {
  const metin = Array.isArray(anahtarDegeri) ? anahtarDegeri[0] : anahtarDegeri;
  return IS_YUKLERI.find((y) => y.anahtar === metin) ?? VARSAYILAN_IS_YUKU;
}

/**
 * Senaryonun aylık maliyeti.
 *
 * Girdi veya çıktı fiyatlarından biri eksikse `null` döner: yarısı bilinen bir
 * tarifeden toplam çıkarmak, eksik yarıyı sıfır saymak demektir ve modeli
 * olduğundan ucuz gösterir.
 */
export function aylikMaliyet(token: TokenFiyati | null, isYuku: IsYuku): number | null {
  if (!token || token.girdi == null || token.cikti == null) return null;
  return token.girdi * isYuku.milyonGirdi + token.cikti * isYuku.milyonCikti;
}
