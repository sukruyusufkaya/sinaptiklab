import type { Izin } from '@/lib/yetki/roller';

/**
 * Alan konfigürasyon sistemi — panelin keystone'u.
 *
 * 27 koleksiyonu 27 el yazımı formla yönetmek sürdürülemez: her şema
 * değişikliği iki yerde güncelleme ister ve biri kaçınılmaz olarak geride
 * kalır. Bunun yerine her koleksiyon BİLDİRİMSEL bir konfigürasyonla tanımlanır
 * ve tek bir form motoru bunu render eder.
 *
 * Konfigürasyon `lib/mongo/koleksiyonlar.ts` şemasının panel karşılığıdır:
 * şemada `required` olan alan burada `zorunlu: true`, şemadaki `enum` burada
 * `secenekler` olur. İkisi ayrışırsa kaydetme sırasında MongoDB doğrulaması
 * devreye girer ve hata kullanıcıya gösterilir — yani ayrışma sessiz kalmaz.
 *
 * Bu modül veritabanına dokunmaz; istemci bileşenleri de içe alabilir.
 */

export type AlanTipi =
  /** Tek satır metin. */
  | 'metin'
  /** Çok satır metin; `satir` ile yükseklik verilir. */
  | 'uzunMetin'
  /** Küçük harf, tire ayrılmış kimlik. Başlıktan üretilebilir. */
  | 'slug'
  /** ISO tarih (YYYY-AA-GG). */
  | 'tarih'
  /** Tarih + saat. */
  | 'zaman'
  | 'sayi'
  | 'mantik'
  /** Tek seçim (şemadaki enum). */
  | 'secim'
  /** Çok seçim (şemadaki enum dizisi). */
  | 'cokluSecim'
  /** Serbest metin dizisi — her satır bir öge. */
  | 'metinDizisi'
  /** İç içe nesne dizisi; `altAlanlar` ile tanımlanır. */
  | 'nesneDizisi'
  /** Yapılandırılmış metin gövdesi (paragraf, altbaşlık, tablo, akış…). */
  | 'bloklar'
  /** Başka bir koleksiyona slug referansı. */
  | 'iliski'
  /** Birden çok slug referansı. */
  | 'cokluIliski'
  /** Son çare: ham JSON düzenleyici. Şemada `object` olan serbest alanlar. */
  | 'json';

export type Secenek = { deger: string; etiket: string; tarif?: string };

export type Alan = {
  ad: string;
  etiket: string;
  tip: AlanTipi;
  zorunlu?: boolean;
  yardim?: string;
  /** `secim` ve `cokluSecim` için. */
  secenekler?: readonly Secenek[];
  /**
   * `secim` değeri belgeye SAYI olarak yazılır.
   *
   * `Secenek.deger` her zaman metindir (HTML `<option value>` metin taşır),
   * ama şemada `bsonType: 'number'` olan bir enum alanı (ör. yönlendirme
   * `kod`: 301/302/308) metin kabul etmez. Bu bayrak olmadan form geçer,
   * MongoDB doğrulaması "Document failed validation" verir.
   */
  sayisalDeger?: boolean;
  /** `nesneDizisi` için alt alan tanımı. */
  altAlanlar?: readonly Alan[];
  /** `iliski` ve `cokluIliski` için hedef koleksiyon. */
  hedefKoleksiyon?: string;
  /** `uzunMetin` satır sayısı. */
  satir?: number;
  enAz?: number;
  enCok?: number;
  /** Form ızgarasında kapladığı genişlik. */
  genislik?: 'tam' | 'yarim';
  /** Alan yalnızca bu izinle düzenlenebilir (ör. hukuki metin). */
  izin?: Izin;
  /** Salt okunur gösterilir; formdan gönderilmez. */
  saltOkunur?: boolean;
  /** Kişisel veri — listede ve formda maskelenir. */
  maskeli?: boolean;
  varsayilan?: string | number | boolean;
};

export type ListeKolonu = {
  ad: string;
  etiket: string;
  /** Uzun metinleri kırpma sınırı. */
  enCok?: number;
  /** Mono ve sağa yaslı gösterim (sayı, tarih, kod). */
  mono?: boolean;
  /**
   * Alan bir enum taşıyorsa seçenek kümesi.
   *
   * NEDEN GEREKLİ: liste hücresi varsayılan olarak HAM DEĞERİ basar. `durum`
   * kolonu özel olarak rozete çevriliyordu, ama `guncellikDurumu`,
   * `yayinDurumu`, `etkinlikDurumu`, `yon` gibi diğer enum kolonları editöre
   * `guncel`, `kayit-acik` gibi kodlar gösteriyordu — oysa hemen üstteki filtre
   * çipleri "Güncel", "Kayıt açık" diye doğru yazıyordu. Aynı kümeyi kolona da
   * vermek bu tutarsızlığı kapatır.
   */
  secenekler?: readonly Secenek[];
};

export type Filtre = {
  ad: string;
  etiket: string;
  secenekler: readonly Secenek[];
};

export type KoleksiyonYapilandirmasi = {
  /** `KOLEKSIYONLAR` içindeki koleksiyon adı. */
  koleksiyon: string;
  /** Tekil görünen ad ("Atlas girdisi"). */
  ad: string;
  /** Çoğul görünen ad ("Atlas girdileri"). */
  cogul: string;
  aciklama: string;
  /** Tekil kimlik alanı — genellikle `slug`. */
  anahtarAlan: string;
  /** Listede ve başlıkta gösterilecek alan. */
  baslikAlani: string;
  listeKolonlari: readonly ListeKolonu[];
  filtreler?: readonly Filtre[];
  /** Metin aramasının tarayacağı alanlar. */
  aramaAlanlari: readonly string[];
  siralama: Record<string, 1 | -1>;
  alanlar: readonly Alan[];
  /** `durum` alanı var mı — yayın akışı düğmeleri gösterilir. */
  durumluMu: boolean;
  /**
   * Sitedeki karşılık gelen yol; önizleme bağlantısı için.
   *
   * FONKSİYONDUR: yalnızca sunucuda çağrılabilir. İstemci bileşenine
   * geçirilmeden önce `istemciYapilandirmasi()` ile ayıklanmalı — bkz. aşağı.
   */
  siteYolu?: (belge: Record<string, unknown>) => string | undefined;
  /** Yeni kayıt oluşturulabilir mi (radar gibi türetilmiş koleksiyonlarda hayır). */
  olusturulabilir?: boolean;
  /** Silinebilir mi. */
  silinebilir?: boolean;
};

/**
 * İstemci bileşenine geçirilebilir yapılandırma.
 *
 * NEDEN VAR: `KoleksiyonYapilandirmasi` bir FONKSİYON taşır (`siteYolu`).
 * React, sunucu bileşeninden istemci bileşenine fonksiyon geçirmeyi reddeder
 * ("Functions cannot be passed directly to Client Components"); yapılandırmayı
 * olduğu gibi geçirmek `siteYolu` tanımlayan her koleksiyonun düzenleme
 * sayfasını 500'e düşürür. Bu tip, sınırı derleme zamanında kapatır: istemci
 * bileşeni `IstemciYapilandirmasi` ister, dolayısıyla ham yapılandırmayı prop
 * olarak vermek tip hatası olur.
 *
 * Yeni bir fonksiyon alanı eklenirse `Omit` listesine ve `istemciYapilandirmasi`
 * ayıklamasına o alan da yazılır.
 */
export type IstemciYapilandirmasi = Omit<KoleksiyonYapilandirmasi, 'siteYolu'>;

/** Fonksiyon taşıyan alanları ayıklar; sonuç RSC sınırından geçebilir. */
export function istemciYapilandirmasi(
  yapilandirma: KoleksiyonYapilandirmasi,
): IstemciYapilandirmasi {
  const kalan: KoleksiyonYapilandirmasi = { ...yapilandirma };
  delete kalan.siteYolu;
  return kalan;
}

/* --- PAYLAŞILAN SEÇENEK KÜMELERİ ----------------------------------------- */

export const DURUM_SECENEKLERI: readonly Secenek[] = [
  { deger: 'taslak', etiket: 'Taslak', tarif: 'Yalnızca panelde görünür.' },
  { deger: 'incelemede', etiket: 'İncelemede', tarif: 'Editör onayı bekliyor.' },
  { deger: 'yayinda', etiket: 'Yayında', tarif: 'Sitede görünür.' },
  { deger: 'arsiv', etiket: 'Arşiv', tarif: 'Adresi korunur, listelerden çıkar.' },
];

export const SEVIYE_SECENEKLERI: readonly Secenek[] = [
  { deger: 'baslangic', etiket: 'Başlangıç' },
  { deger: 'orta', etiket: 'Orta' },
  { deger: 'ileri', etiket: 'İleri' },
];

export const KAYNAK_TURU_SECENEKLERI: readonly Secenek[] = [
  { deger: 'Makale', etiket: 'Makale' },
  { deger: 'Dokümantasyon', etiket: 'Dokümantasyon' },
  { deger: 'Teknik rapor', etiket: 'Teknik rapor' },
  { deger: 'Mevzuat', etiket: 'Mevzuat' },
  { deger: 'Veri seti', etiket: 'Veri seti' },
  { deger: 'Röportaj', etiket: 'Röportaj' },
];

/* --- SIK KULLANILAN ALAN PARÇALARI --------------------------------------- */

export const DURUM_ALANI: Alan = {
  ad: 'durum',
  etiket: 'Durum',
  tip: 'secim',
  zorunlu: true,
  secenekler: DURUM_SECENEKLERI,
  genislik: 'yarim',
  varsayilan: 'taslak',
};

export const SLUG_ALANI: Alan = {
  ad: 'slug',
  etiket: 'Slug',
  tip: 'slug',
  zorunlu: true,
  yardim: 'Kalıcı adresin parçası. Yayımlandıktan sonra değiştirilmemeli.',
  genislik: 'yarim',
};

export const SON_DOGRULAMA_ALANI: Alan = {
  ad: 'sonDogrulama',
  etiket: 'Son doğrulama',
  tip: 'tarih',
  yardim: 'Bilginin en son ne zaman doğrulandığı. Sayfada görünür.',
  genislik: 'yarim',
};

/** Kaynak listesi — Atlas, içerik ve araştırmada aynı yapı. */
export const KAYNAKLAR_ALANI: Alan = {
  ad: 'kaynaklar',
  etiket: 'Kaynaklar',
  tip: 'nesneDizisi',
  yardim: 'Her iddia bir kaynağa bağlanır.',
  altAlanlar: [
    { ad: 'ad', etiket: 'Kaynak adı', tip: 'metin', zorunlu: true },
    { ad: 'yayinci', etiket: 'Yayıncı', tip: 'metin', zorunlu: true, genislik: 'yarim' },
    {
      ad: 'tur',
      etiket: 'Tür',
      tip: 'secim',
      zorunlu: true,
      secenekler: KAYNAK_TURU_SECENEKLERI,
      genislik: 'yarim',
    },
    { ad: 'adres', etiket: 'Adres', tip: 'metin', yardim: 'https:// ile başlamalı.' },
    { ad: 'erisimTarihi', etiket: 'Erişim tarihi', tip: 'tarih', genislik: 'yarim' },
  ],
};

export const SSS_ALANI: Alan = {
  ad: 'sss',
  etiket: 'Sık sorulan sorular',
  tip: 'nesneDizisi',
  yardim: 'Yalnızca sayfada GÖRÜNEN sorular şemaya yazılır (MASTER-PLAN §67).',
  altAlanlar: [
    { ad: 'soru', etiket: 'Soru', tip: 'metin', zorunlu: true },
    { ad: 'cevap', etiket: 'Cevap', tip: 'uzunMetin', zorunlu: true, satir: 3 },
  ],
};

export const SURUMLER_ALANI: Alan = {
  ad: 'surumler',
  etiket: 'Sürüm geçmişi',
  tip: 'nesneDizisi',
  yardim: 'Sayfada görünen değişiklik kaydı.',
  altAlanlar: [
    { ad: 'surum', etiket: 'Sürüm', tip: 'metin', zorunlu: true, genislik: 'yarim' },
    { ad: 'tarih', etiket: 'Tarih', tip: 'tarih', zorunlu: true, genislik: 'yarim' },
    { ad: 'degisiklik', etiket: 'Değişiklik', tip: 'metin', zorunlu: true },
  ],
};

export const SEO_ALANLARI: readonly Alan[] = [
  {
    ad: 'seo.baslik',
    etiket: 'SEO başlığı',
    tip: 'metin',
    enCok: 70,
    yardim: 'Boş bırakılırsa sayfa başlığı kullanılır. En fazla 70 karakter.',
  },
  {
    ad: 'seo.aciklama',
    etiket: 'SEO açıklaması',
    tip: 'uzunMetin',
    satir: 2,
    enCok: 200,
    yardim: 'Arama sonucunda görünen özet. En fazla 200 karakter.',
  },
  {
    ad: 'seo.kanonik',
    etiket: 'Kanonik adres',
    tip: 'metin',
    yardim: 'Yalnızca başka bir sayfanın kopyasıysa doldurulur.',
  },
  {
    ad: 'seo.dizinlenmesin',
    etiket: 'Dizinlenmesin (noindex)',
    tip: 'mantik',
    genislik: 'yarim',
  },
];

/** İç içe alan adını (`seo.baslik`) belgede okumak/yazmak için. */
export function alanDegeri(belge: Record<string, unknown>, yol: string): unknown {
  if (!yol.includes('.')) return belge[yol];
  return yol.split('.').reduce<unknown>((mevcut, parca) => {
    if (mevcut && typeof mevcut === 'object') {
      return (mevcut as Record<string, unknown>)[parca];
    }
    return undefined;
  }, belge);
}

export function alanDegeriYaz(hedef: Record<string, unknown>, yol: string, deger: unknown): void {
  if (!yol.includes('.')) {
    hedef[yol] = deger;
    return;
  }
  const parcalar = yol.split('.');
  const son = parcalar.pop();
  if (!son) return;
  let kap = hedef;
  for (const parca of parcalar) {
    if (typeof kap[parca] !== 'object' || kap[parca] === null) kap[parca] = {};
    kap = kap[parca] as Record<string, unknown>;
  }
  kap[son] = deger;
}
