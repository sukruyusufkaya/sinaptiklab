import type { CreateIndexesOptions, Document, IndexSpecification } from 'mongodb';

/**
 * MongoDB koleksiyon tanımları: şema doğrulayıcıları ve dizinler.
 *
 * Tasarım ilkeleri (MASTER-PLAN §9, §10, §69, §93):
 *
 * 1. KONU ile TÜR ayrı alanlardır. Tek bir `icerikler` koleksiyonu tüm
 *    editoryal formatları (haber, analiz, rehber, görüş, röportaj) taşır;
 *    `tur` alanı formatı, `konuSlug` alanı konuyu belirtir. Bir konu hakkında
 *    beş farklı formatta içerik olabilir ve hepsi aynı konu merkezinde listelenir.
 *
 * 2. VARLIKLAR ayrı koleksiyonlardadır. Atlas kavramı, model, şirket, araç ve
 *    meslek "makale" değil varlıktır: kalıcı URL'i, sürüm geçmişi ve son
 *    doğrulama tarihi vardır. Bunları içerik akışına karıştırmak entity-first
 *    mimariyi bozar.
 *
 * 3. KİŞİSEL VERİ ayrı koleksiyonlarda ve ayrı saklama süresiyle tutulur.
 *    `saklama` alanı taşıyan koleksiyonlar TTL dizinine sahiptir.
 *
 * 4. Her koleksiyonda `durum` alanı yayın akışını temsil eder; sorgular
 *    varsayılan olarak `durum: 'yayinda'` filtresiyle çalışır.
 *
 * Şema doğrulaması `moderate` seviyesindedir: mevcut kayıtlar bozulmaz, yeni
 * ve güncellenen kayıtlar doğrulanır. `additionalProperties` kapatılmaz ki
 * şema evrimi göç (migration) gerektirmesin.
 *
 * SAYI ALANLARI: yalnızca `bsonType: 'number'` KULLANILIR — ne `'int'`
 * ne `'double'`.
 *
 * Node sürücüsü bir JavaScript sayısını değerine BAKARAK serialize eder: tam
 * sayı ve int32 aralığındaysa BSON int32, aksi hâlde double. Yani `3` int32,
 * `2.5` double olarak gider. Sonuç: `'int'` beklenen alan ondalıklı değerde,
 * `'double'` beklenen alan TAM SAYIDA "Document failed validation" verir.
 * Fiyat, puan, süre gibi alanlar her iki değeri de alabildiği için ikisi de
 * yanlıştır.
 *
 * `'number'` int, long, double ve decimal'i birlikte kabul eder; tam sayı veya
 * aralık kısıtı uygulama katmanında (zod şemaları) zorlanır.
 */

/* --- ORTAK PARÇALAR ------------------------------------------------------- */

const SLUG = {
  bsonType: 'string',
  pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
  description: 'Küçük harf, rakam ve tire; Türkçe karakter içermez.',
};

const TARIH_METNI = {
  bsonType: 'string',
  pattern: '^\\d{4}-\\d{2}-\\d{2}$',
  description: 'ISO 8601 tarih (YYYY-AA-GG).',
};

const DURUM = {
  bsonType: 'string',
  enum: ['taslak', 'incelemede', 'yayinda', 'arsiv'],
  description: 'Yayın akışı durumu.',
};

const SEVIYE = {
  bsonType: 'string',
  enum: ['baslangic', 'orta', 'ileri'],
};

const METIN_DIZISI = { bsonType: 'array', items: { bsonType: 'string' } };

/** Yapılandırılmış metin bloğu; HTML string saklanmaz. */
const BLOK = {
  bsonType: 'object',
  required: ['tip'],
  properties: {
    tip: {
      bsonType: 'string',
      enum: [
        'paragraf',
        'altbaslik',
        'liste',
        'kisa-cevap',
        'alinti',
        'kod',
        'tablo',
        'akis',
        'uyari',
      ],
    },
    metin: { bsonType: 'string' },
    kimlik: { bsonType: 'string' },
    ogeler: METIN_DIZISI,
    sirali: { bsonType: 'bool' },
    kaynak: { bsonType: 'string' },
    dil: { bsonType: 'string' },
    basliklar: METIN_DIZISI,
    satirlar: { bsonType: 'array', items: { bsonType: 'array', items: { bsonType: 'string' } } },
    aciklama: { bsonType: 'string' },
    adimlar: {
      bsonType: 'array',
      items: {
        bsonType: 'object',
        required: ['ad', 'aciklama'],
        properties: { ad: { bsonType: 'string' }, aciklama: { bsonType: 'string' } },
      },
    },
    ton: { bsonType: 'string', enum: ['bilgi', 'dikkat'] },
  },
};

const GOVDE = { bsonType: 'array', items: BLOK };

const KAYNAKLAR = {
  bsonType: 'array',
  items: {
    bsonType: 'object',
    required: ['ad', 'yayinci', 'tur'],
    properties: {
      ad: { bsonType: 'string' },
      yayinci: { bsonType: 'string' },
      tur: {
        bsonType: 'string',
        enum: ['Makale', 'Dokümantasyon', 'Teknik rapor', 'Mevzuat', 'Veri seti', 'Röportaj'],
      },
      adres: { bsonType: 'string' },
      erisimTarihi: TARIH_METNI,
    },
  },
};

const SSS = {
  bsonType: 'array',
  items: {
    bsonType: 'object',
    required: ['soru', 'cevap'],
    properties: { soru: { bsonType: 'string' }, cevap: { bsonType: 'string' } },
  },
};

const SURUMLER = {
  bsonType: 'array',
  items: {
    bsonType: 'object',
    required: ['surum', 'tarih', 'degisiklik'],
    properties: {
      surum: { bsonType: 'string' },
      tarih: TARIH_METNI,
      degisiklik: { bsonType: 'string' },
    },
  },
};

/** Sayfa başına SEO/GEO alanları. Görünmeyen içerik şemaya yazılmaz (§67). */
const SEO = {
  bsonType: 'object',
  properties: {
    baslik: { bsonType: 'string', maxLength: 70 },
    aciklama: { bsonType: 'string', maxLength: 200 },
    kanonik: { bsonType: 'string' },
    dizinlenmesin: { bsonType: 'bool' },
    ogGorsel: { bsonType: 'string' },
  },
};

const ZAMAN_DAMGALARI = {
  olusturuldu: { bsonType: 'date' },
  guncellendi: { bsonType: 'date' },
};

/* --- KOLEKSIYON ADLARI --------------------------------------------------- */

export const KOLEKSIYONLAR = {
  // İçerik akışı
  icerikler: 'icerikler',
  // Varlıklar
  atlas: 'atlas',
  modeller: 'modeller',
  sirketler: 'sirketler',
  araclar: 'araclar',
  meslekler: 'meslekler',
  // Taksonomi ve künye
  konular: 'konular',
  terimler: 'terimler',
  yazarlar: 'yazarlar',
  // Öğrenme
  ogrenmeYollari: 'ogrenme_yollari',
  dersler: 'dersler',
  testler: 'testler',
  sorular: 'sorular',
  // Yayın
  arastirma: 'arastirma',
  dergiSayilari: 'dergi_sayilari',
  podcast: 'podcast',
  briefler: 'briefler',
  radar: 'radar',
  // Kurumsal
  hizmetler: 'hizmetler',
  sektorler: 'sektorler',
  vakalar: 'vakalar',
  // Lab ve topluluk
  labProjeleri: 'lab_projeleri',
  etkinlikler: 'etkinlikler',
  uzmanlar: 'uzmanlar',
  // Statik ve hukuki
  sayfalar: 'sayfalar',
  politikalar: 'politikalar',
  // Operasyon
  yonlendirmeler: 'yonlendirmeler',
  medya: 'medya',
  aramaKayitlari: 'arama_kayitlari',
  // Kişisel veri (ayrı saklama politikası)
  kullanicilar: 'kullanicilar',
  aboneler: 'aboneler',
  formKayitlari: 'form_kayitlari',
  testSonuclari: 'test_sonuclari',
  readinessSonuclari: 'readiness_sonuclari',
  // Kimlik, denetim ve yayın altyapısı
  oturumlar: 'oturumlar',
  girisDenemeleri: 'giris_denemeleri',
  denetimKaydi: 'denetim_kaydi',
  icerikSurumleri: 'icerik_surumleri',
  onizlemeAnahtarlari: 'onizleme_anahtarlari',
  ayarlar: 'ayarlar',
} as const;

export type KoleksiyonAdi = (typeof KOLEKSIYONLAR)[keyof typeof KOLEKSIYONLAR];

/* --- TANIMLAR ------------------------------------------------------------ */

export type Dizin = {
  anahtar: IndexSpecification;
  secenekler?: CreateIndexesOptions;
};

export type KoleksiyonTanimi = {
  ad: string;
  aciklama: string;
  /** Kişisel veri içerir mi — KVKK envanterinde işaretlenir. */
  kisiselVeri?: boolean;
  sema: Document;
  dizinler: Dizin[];
};

function sema(gerekli: string[], ozellikler: Document): Document {
  return {
    $jsonSchema: {
      bsonType: 'object',
      required: gerekli,
      properties: { ...ozellikler, ...ZAMAN_DAMGALARI },
    },
  };
}

export const TANIMLAR: KoleksiyonTanimi[] = [
  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.icerikler,
    aciklama:
      'Tüm editoryal formatlar: haber, analiz, rehber, görüş, röportaj, uygulama. Formatı `tur`, konuyu `konuSlug` belirler.',
    sema: sema(['slug', 'tur', 'baslik', 'kisaCevap', 'konuSlug', 'yazarSlug', 'durum'], {
      slug: SLUG,
      yol: { bsonType: 'string', description: 'Kanonik yol; /haber/<slug>/ gibi.' },
      tur: {
        bsonType: 'string',
        enum: ['haber', 'analiz', 'rehber', 'gorus', 'roportaj', 'uygulama', 'vaka'],
      },
      baslik: { bsonType: 'string', minLength: 8, maxLength: 160 },
      kisaCevap: {
        bsonType: 'string',
        minLength: 40,
        maxLength: 600,
        description: 'Answer-first: tek cümlelik, alıntılanabilir cevap (§56).',
      },
      ozet: { bsonType: 'string' },
      konuSlug: SLUG,
      etiketler: METIN_DIZISI,
      yazarSlug: SLUG,
      inceleyenSlug: SLUG,
      seviye: SEVIYE,
      durum: DURUM,
      oneCikan: { bsonType: 'bool' },
      yayinTarihi: TARIH_METNI,
      guncellemeTarihi: TARIH_METNI,
      okumaDakika: { bsonType: 'number', minimum: 1, maximum: 180 },
      govde: GOVDE,
      kaynaklar: KAYNAKLAR,
      sss: SSS,
      /** Rehber formatında adım listesi. */
      adimListesi: {
        bsonType: 'array',
        items: {
          bsonType: 'object',
          required: ['ad', 'ozet'],
          properties: {
            ad: { bsonType: 'string' },
            ozet: { bsonType: 'string' },
            ayrinti: GOVDE,
          },
        },
      },
      onKosullar: METIN_DIZISI,
      araclar: METIN_DIZISI,
      kontrolListesi: METIN_DIZISI,
      tuzaklar: {
        bsonType: 'array',
        items: {
          bsonType: 'object',
          required: ['baslik', 'aciklama'],
          properties: { baslik: { bsonType: 'string' }, aciklama: { bsonType: 'string' } },
        },
      },
      ilgiliAtlas: { bsonType: 'array', items: SLUG },
      /*
       * ANALİZ FORMATINA ÖZGÜ İKİ ALAN.
       *
       * Bir analiz iddia üretir; iddia üreten metnin okura borcu, o iddianın
       * NE KADAR SAĞLAM olduğunu ve HANGİ GÖZLEMLE ÇÜRÜTÜLECEĞİNİ söylemektir.
       * Bu iki alan olmadan analiz ile görüş yazısı arasındaki fark yalnızca
       * tonda kalır.
       *
       * `yanlislanmaKosulu` özellikle belirleyici: bir tezin yanlışlanma
       * koşulunu yazmak, tezi savunulabilir kılan tek şeydir. Yazılamıyorsa
       * ortada bir tez değil bir temenni vardır ve metin yayımlanmamalıdır.
       */
      tezGuveni: {
        bsonType: 'string',
        enum: ['yuksek', 'orta', 'dusuk'],
        description: 'Tezin dayandığı kanıtın gücü; okura açıkça bildirilir.',
      },
      yanlislanmaKosulu: {
        bsonType: 'string',
        maxLength: 600,
        description: 'Bu tezi çürütecek gözlem. Yazılamıyorsa tez değil temennidir.',
      },
      ilgiliIcerik: { bsonType: 'array', items: SLUG },
      seo: SEO,
    }),
    dizinler: [
      { anahtar: { slug: 1 }, secenekler: { unique: true, name: 'slug_tekil' } },
      { anahtar: { durum: 1, yayinTarihi: -1 }, secenekler: { name: 'akis' } },
      { anahtar: { konuSlug: 1, durum: 1, yayinTarihi: -1 }, secenekler: { name: 'konu_akisi' } },
      { anahtar: { tur: 1, durum: 1, yayinTarihi: -1 }, secenekler: { name: 'tur_akisi' } },
      { anahtar: { yazarSlug: 1, yayinTarihi: -1 }, secenekler: { name: 'yazar_akisi' } },
      { anahtar: { etiketler: 1 }, secenekler: { name: 'etiket' } },
      {
        anahtar: { baslik: 'text', kisaCevap: 'text', ozet: 'text' },
        secenekler: {
          name: 'metin_arama',
          default_language: 'turkish',
          weights: { baslik: 10, kisaCevap: 5, ozet: 1 },
        },
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.atlas,
    aciklama:
      'AI Atlas kavram girdileri. Makale değil varlık: kalıcı URL, sürüm geçmişi ve son doğrulama tarihi taşır.',
    sema: sema(['slug', 'ad', 'kategoriSlug', 'kisaTanim', 'seviye', 'sonDogrulama', 'durum'], {
      slug: SLUG,
      ad: { bsonType: 'string', minLength: 2, maxLength: 120 },
      altAd: { bsonType: 'string', description: 'Türkçe karşılık veya kısaltma açılımı.' },
      kategoriSlug: SLUG,
      kisaTanim: {
        bsonType: 'string',
        minLength: 40,
        maxLength: 600,
        description: 'Answer-first tanım; sözlük görünümünde de kullanılır.',
      },
      seviye: SEVIYE,
      durum: DURUM,
      ilgili: METIN_DIZISI,
      onkosullar: METIN_DIZISI,
      sonDogrulama: TARIH_METNI,
      yayinTarihi: TARIH_METNI,
      guncellemeTarihi: TARIH_METNI,
      govde: GOVDE,
      sss: SSS,
      kaynaklar: KAYNAKLAR,
      surumler: SURUMLER,
      yazarSlug: SLUG,
      inceleyenSlug: SLUG,
      seo: SEO,
    }),
    dizinler: [
      { anahtar: { slug: 1 }, secenekler: { unique: true, name: 'slug_tekil' } },
      { anahtar: { kategoriSlug: 1, ad: 1 }, secenekler: { name: 'kategori' } },
      { anahtar: { seviye: 1 }, secenekler: { name: 'seviye' } },
      { anahtar: { sonDogrulama: 1 }, secenekler: { name: 'tazelik_denetimi' } },
      {
        anahtar: { ad: 'text', altAd: 'text', kisaTanim: 'text' },
        secenekler: {
          name: 'metin_arama',
          default_language: 'turkish',
          weights: { ad: 10, altAd: 8, kisaTanim: 2 },
        },
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.konular,
    aciklama:
      'Konu taksonomisi: pillar (ana konu) ve cluster (alt konu) hiyerarşisi. İçerikler bu slug ile bağlanır.',
    sema: sema(['slug', 'ad', 'kume', 'durum'], {
      slug: SLUG,
      ad: { bsonType: 'string' },
      kume: { bsonType: 'string', description: 'Üst küme adı (pillar).' },
      ustKonuSlug: SLUG,
      ozet: { bsonType: 'string' },
      durum: DURUM,
      sira: { bsonType: 'number' },
      seo: SEO,
    }),
    dizinler: [
      { anahtar: { slug: 1 }, secenekler: { unique: true, name: 'slug_tekil' } },
      { anahtar: { ustKonuSlug: 1, sira: 1 }, secenekler: { name: 'hiyerarsi' } },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.yazarlar,
    aciklama: 'Yazar ve editör künyeleri. E-E-A-T için özgeçmiş ve uzmanlık alanları zorunludur.',
    sema: sema(['slug', 'ad', 'unvan', 'basHarfler'], {
      slug: SLUG,
      ad: { bsonType: 'string' },
      unvan: { bsonType: 'string' },
      basHarfler: { bsonType: 'string', maxLength: 4 },
      ozgecmis: { bsonType: 'string' },
      uzmanlik: METIN_DIZISI,
      sosyal: {
        bsonType: 'array',
        items: {
          bsonType: 'object',
          required: ['etiket', 'adres'],
          properties: { etiket: { bsonType: 'string' }, adres: { bsonType: 'string' } },
        },
      },
      durum: DURUM,
      seo: SEO,
    }),
    dizinler: [{ anahtar: { slug: 1 }, secenekler: { unique: true, name: 'slug_tekil' } }],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.modeller,
    aciklama:
      'Yapay zekâ modelleri. Karşılaştırma sayfaları bu koleksiyondan türetilir; her alan için son doğrulama tarihi tutulur.',
    sema: sema(['slug', 'ad', 'saglayici', 'tip', 'durum'], {
      slug: SLUG,
      ad: { bsonType: 'string' },
      saglayici: { bsonType: 'string' },
      saglayiciSlug: SLUG,
      /*
       * AİLE İLİŞKİSİ — iki alan, tek yön.
       *
       * `aileSlug` bir ÜYENİN hangi aile hub'ına bağlı olduğunu söyler;
       * `aileMi` bir kaydın hub olduğunu işaretler. Hub'ın kendisinde
       * `aileSlug` BULUNMAZ (üstü yok).
       *
       * Neden üyelik hub üzerinde bir DİZİ olarak tutulmuyor: yeni bir model
       * eklendiğinde iki belge güncellemek gerekirdi ve biri kaçınılmaz olarak
       * geride kalırdı. Tek yönlü referans `saglayiciSlug` ile aynı kalıptır.
       *
       * Neden slug ÖNEKİ yetmiyor: önek aile sınırı değil. `gpt-image-2`,
       * `gpt-realtime-2` ve `gpt-oss-120b` "gpt" ile başlar ama GPT metin
       * modeli ailesine ait değildir (görsel, gerçek zamanlı ses ve açık
       * ağırlık hatları); `gemma-*` Gemini'den ayrı bir ailedir. Üyelik
       * editoryal bir karardır, dizgi kuralı değil.
       */
      aileSlug: SLUG,
      aileMi: {
        bsonType: 'bool',
        description: 'Bu kayıt bir model ailesinin hub künyesi mi (tek bir model değil).',
      },
      tip: { bsonType: 'string', description: 'Dil modeli, görsel, çok modlu, gömme vb.' },
      baglamPenceresi: { bsonType: 'string' },
      acikKaynak: { bsonType: 'bool' },
      acikAgirlik: { bsonType: 'bool' },
      lisans: { bsonType: 'string' },
      yayin: TARIH_METNI,
      surum: { bsonType: 'string' },
      guncellikDurumu: { bsonType: 'string', enum: ['guncel', 'yeni', 'onceki-surum', 'emekli'] },
      durum: DURUM,
      vurgu: { bsonType: 'string' },
      ozet: { bsonType: 'string' },
      yetenekler: METIN_DIZISI,
      sinirliliklar: METIN_DIZISI,
      kullanimAlanlari: METIN_DIZISI,
      modaliteler: METIN_DIZISI,
      api: { bsonType: 'bool' },
      fiyatlandirma: {
        bsonType: 'object',
        properties: {
          girdiBirimFiyat: { bsonType: 'number', minimum: 0 },
          ciktiBirimFiyat: { bsonType: 'number', minimum: 0 },
          birim: { bsonType: 'string', description: 'Örn. 1M token.' },
          paraBirimi: { bsonType: 'string' },
          kaynakAdres: { bsonType: 'string' },
        },
      },
      /*
       * Model künyesindeki her sayısal iddianın dayanağı (MASTER-PLAN §59).
       * Bağlam penceresi, fiyat ve yayın tarihi gibi alanlar zamanla değişir;
       * `sonDogrulama` NE ZAMAN bakıldığını, bu alan NEREYE bakıldığını söyler.
       * İkisi olmadan model tablosu doğrulanamaz bir iddia listesine döner.
       */
      kaynaklar: KAYNAKLAR,
      sonDogrulama: TARIH_METNI,
      seo: SEO,
    }),
    dizinler: [
      { anahtar: { slug: 1 }, secenekler: { unique: true, name: 'slug_tekil' } },
      { anahtar: { saglayiciSlug: 1, yayin: -1 }, secenekler: { name: 'saglayici' } },
      { anahtar: { aileSlug: 1 }, secenekler: { name: 'aile' } },
      { anahtar: { guncellikDurumu: 1 }, secenekler: { name: 'guncellik' } },
      { anahtar: { sonDogrulama: 1 }, secenekler: { name: 'tazelik_denetimi' } },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.sirketler,
    aciklama: 'Yapay zekâ şirketleri ve kuruluşları; model ve araç kayıtlarına bağlanır.',
    sema: sema(['slug', 'ad', 'tur', 'durum'], {
      slug: SLUG,
      ad: { bsonType: 'string' },
      tur: { bsonType: 'string' },
      merkez: { bsonType: 'string' },
      kurulus: { bsonType: 'string' },
      alan: { bsonType: 'string' },
      ozet: { bsonType: 'string' },
      urunler: METIN_DIZISI,
      modelSluglari: { bsonType: 'array', items: SLUG },
      kilometreTaslari: {
        bsonType: 'array',
        items: {
          bsonType: 'object',
          required: ['tarih', 'olay'],
          properties: { tarih: { bsonType: 'string' }, olay: { bsonType: 'string' } },
        },
      },
      durum: DURUM,
      /** Kuruluş yılı, merkez ve kilometre taşlarının dayanağı (§59). */
      kaynaklar: KAYNAKLAR,
      sonDogrulama: TARIH_METNI,
      seo: SEO,
    }),
    dizinler: [
      { anahtar: { slug: 1 }, secenekler: { unique: true, name: 'slug_tekil' } },
      { anahtar: { alan: 1 }, secenekler: { name: 'alan' } },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.araclar,
    aciklama: 'Araç kayıt defteri: ne işe yarar, kim kullanmalı, artı ve eksiler.',
    sema: sema(['slug', 'ad', 'kategori', 'neIse', 'durum'], {
      slug: SLUG,
      ad: { bsonType: 'string' },
      kategori: { bsonType: 'string' },
      neIse: { bsonType: 'string' },
      kimKullanmali: { bsonType: 'string' },
      enIyiKullanim: { bsonType: 'string' },
      alternatifler: METIN_DIZISI,
      fiyat: { bsonType: 'string' },
      artilar: METIN_DIZISI,
      eksiler: METIN_DIZISI,
      degerlendirme: { bsonType: 'string' },
      /*
       * Aracı yapan şirket — `sirketler` koleksiyonuna bağ.
       *
       * Varlık grafiğinde eksik olan kenar buydu: 56 araç ve 87 şirket
       * yan yana duruyordu ama aralarında hiç bağ yoktu. Cursor sayfasını
       * okuyan biri Anysphere'e, Anysphere sayfasını okuyan biri Cursor'a
       * geçemiyordu. `modeller.saglayiciSlug` ile aynı kalıp.
       *
       * OPSİYONELDİR ve öyle kalmalı: kategori incelemeleri
       * ("Kod Asistanı (kategori incelemesi)") tek bir şirkete ait değildir,
       * ve üreticisinin `sirketler` içinde karşılığı olmayan araçta alan
       * BOŞ BIRAKILIR — var olmayan bir sayfaya bağlanmaktansa bağ hiç
       * kurulmaz (`vakalar.sektorSlug` ile aynı karar).
       */
      sirketSlug: SLUG,
      durum: DURUM,
      sonDogrulama: TARIH_METNI,
      seo: SEO,
    }),
    dizinler: [
      { anahtar: { slug: 1 }, secenekler: { unique: true, name: 'slug_tekil' } },
      { anahtar: { kategori: 1, ad: 1 }, secenekler: { name: 'kategori' } },
      { anahtar: { sirketSlug: 1, ad: 1 }, secenekler: { name: 'uretici' } },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.meslekler,
    aciklama:
      'Kariyer sayfaları: meslek tanımı, kıdem kırılımı, günlük iş, çıktılar, komşu meslekler ve önerilen rota.',
    /*
     * KIDEM KIRILIMI (`seviyeler`) bu koleksiyonun omurgasıdır.
     *
     * Bir meslek sayfasının "ne yapar" listesi, işe yeni başlayan biriyle on
     * yıllık birine AYNI şeyi söyler ve ikisine de yanlış söyler. "Değerlendirme
     * seti kurar" cümlesi junior için bir hedef, senior için bir alt işidir.
     * Alanın kendisi tek bir liste olduğu sürece sayfa, okurun nerede durduğunu
     * soramaz.
     *
     * `komsuMeslekler` de aynı nedenle var: kariyer kararı çoğunlukla "bu
     * meslek nedir" değil "bu meslekle şu meslek arasındaki fark nedir"
     * sorusudur. Bu yüzden komşuluk salt bir bağlantı değil, `fark` alanını
     * ZORUNLU kılar — farkı yazılmayan komşuluk bilgi taşımaz.
     */
    sema: sema(['slug', 'ad', 'ozet', 'durum'], {
      slug: SLUG,
      ad: { bsonType: 'string' },
      ozet: { bsonType: 'string' },
      /** Answer-first paragraf (MASTER-PLAN §56) — üretken aramanın alıntıladığı yer. */
      kisaCevap: { bsonType: 'string', maxLength: 700 },
      /** İngilizce/alternatif unvanlar — arama niyetiyle sayfayı eşleştirir. */
      esAdlar: METIN_DIZISI,
      rolAilesi: { bsonType: 'string' },
      konuSlug: SLUG,
      neYapar: METIN_DIZISI,
      beceriler: METIN_DIZISI,
      teknolojiler: METIN_DIZISI,
      /** Kıdem kırılımı: aynı işin farklı basamaklarda ne anlama geldiği. */
      seviyeler: {
        bsonType: 'array',
        items: {
          bsonType: 'object',
          required: ['basamak', 'ad', 'odak'],
          properties: {
            basamak: { bsonType: 'string', enum: ['giris', 'orta', 'kidemli', 'lider'] },
            ad: { bsonType: 'string' },
            odak: { bsonType: 'string' },
            sorumluluklar: METIN_DIZISI,
            /** Bu basamakta olunduğunu gösteren doğrulanabilir işaret. */
            kanit: { bsonType: 'string' },
          },
        },
      },
      /** Bir iş gününün gerçek dağılımı — dilim + o dilimde yapılan iş. */
      gunlukIs: {
        bsonType: 'array',
        items: {
          bsonType: 'object',
          required: ['dilim', 'is'],
          properties: {
            dilim: { bsonType: 'string' },
            is: { bsonType: 'string' },
          },
        },
      },
      /** Bu rolün ürettiği somut çıktılar (belge, sistem, ölçüm). */
      ciktilar: METIN_DIZISI,
      /** Başarının nasıl ölçüldüğü — unvan değil, iş sonucu. */
      olcutler: {
        bsonType: 'array',
        items: {
          bsonType: 'object',
          required: ['ad', 'aciklama'],
          properties: { ad: { bsonType: 'string' }, aciklama: { bsonType: 'string' } },
        },
      },
      /** Bu mesleğe hangi geçmişlerden gelinir. */
      girisYollari: METIN_DIZISI,
      /** Portfolyoda işe yarayan projeler; her biri neyi kanıtlıyor. */
      portfolyo: {
        bsonType: 'array',
        items: {
          bsonType: 'object',
          required: ['ad', 'aciklama'],
          properties: {
            ad: { bsonType: 'string' },
            aciklama: { bsonType: 'string' },
            kanit: { bsonType: 'string' },
            labSlug: SLUG,
          },
        },
      },
      /** Yaygın yanlış inanış ve karşılığı. */
      yanlisAnlamalar: {
        bsonType: 'array',
        items: {
          bsonType: 'object',
          required: ['iddia', 'gercek'],
          properties: { iddia: { bsonType: 'string' }, gercek: { bsonType: 'string' } },
        },
      },
      /** Komşu meslekler — `fark` ZORUNLU: farkı yazılmayan komşuluk bilgi taşımaz. */
      komsuMeslekler: {
        bsonType: 'array',
        items: {
          bsonType: 'object',
          required: ['slug', 'fark'],
          properties: { slug: SLUG, fark: { bsonType: 'string' } },
        },
      },
      ilgiliAtlas: { bsonType: 'array', items: SLUG },
      yolSlug: SLUG,
      testSlug: SLUG,
      sss: SSS,
      kaynaklar: KAYNAKLAR,
      durum: DURUM,
      seo: SEO,
      ...ZAMAN_DAMGALARI,
    }),
    dizinler: [
      { anahtar: { slug: 1 }, secenekler: { unique: true, name: 'slug_tekil' } },
      { anahtar: { rolAilesi: 1 }, secenekler: { name: 'rol_ailesi' } },
      { anahtar: { yolSlug: 1 }, secenekler: { name: 'yol' } },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.ogrenmeYollari,
    aciklama: 'Öğrenme rotaları: bölümler, çıktılar, önkoşullar ve hedef rol.',
    sema: sema(['slug', 'ad', 'rol', 'seviyeAraligi', 'durum'], {
      slug: SLUG,
      ad: { bsonType: 'string' },
      rol: { bsonType: 'string' },
      seviyeAraligi: { bsonType: 'string' },
      bolum: { bsonType: 'number', minimum: 1 },
      saat: { bsonType: 'number', minimum: 1 },
      aciklama: { bsonType: 'string' },
      cikti: METIN_DIZISI,
      onkosullar: METIN_DIZISI,
      kimeGore: { bsonType: 'string' },
      bolumler: {
        bsonType: 'array',
        items: {
          bsonType: 'object',
          required: ['ad', 'ozet', 'sure'],
          properties: {
            ad: { bsonType: 'string' },
            ozet: { bsonType: 'string' },
            sure: { bsonType: 'string' },
            kavramlar: METIN_DIZISI,
            dersSluglari: { bsonType: 'array', items: SLUG },
          },
        },
      },
      durum: DURUM,
      seo: SEO,
    }),
    dizinler: [
      { anahtar: { slug: 1 }, secenekler: { unique: true, name: 'slug_tekil' } },
      { anahtar: { rol: 1 }, secenekler: { name: 'rol' } },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.dersler,
    aciklama: 'Dersler: hedefler, gövde, uygulamalı alıştırma ve ölçüm bağlantısı.',
    sema: sema(['slug', 'ad', 'yolSlug', 'seviye', 'dakika', 'durum'], {
      slug: SLUG,
      ad: { bsonType: 'string' },
      yolSlug: SLUG,
      sira: { bsonType: 'number', minimum: 1 },
      seviye: SEVIYE,
      dakika: { bsonType: 'number', minimum: 1, maximum: 480 },
      ozet: { bsonType: 'string' },
      hedefler: METIN_DIZISI,
      kavramlar: { bsonType: 'array', items: SLUG },
      onkosullar: { bsonType: 'array', items: SLUG },
      govde: GOVDE,
      alistirma: {
        bsonType: 'object',
        required: ['baslik', 'adimlar', 'cikti'],
        properties: {
          baslik: { bsonType: 'string' },
          adimlar: METIN_DIZISI,
          cikti: { bsonType: 'string' },
        },
      },
      sss: SSS,
      testSlug: SLUG,
      durum: DURUM,
      seo: SEO,
    }),
    dizinler: [
      { anahtar: { slug: 1 }, secenekler: { unique: true, name: 'slug_tekil' } },
      { anahtar: { yolSlug: 1, sira: 1 }, secenekler: { name: 'rota_sirasi' } },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.testler,
    aciklama: 'Testler: ölçülen beceriler, öğrenme hedefleri ve soru bankası referansı.',
    sema: sema(['slug', 'ad', 'konu', 'dakika', 'seviye', 'durum'], {
      slug: SLUG,
      ad: { bsonType: 'string' },
      konu: { bsonType: 'string' },
      konuSlug: SLUG,
      soruSayisi: { bsonType: 'number', minimum: 1 },
      dakika: { bsonType: 'number', minimum: 1 },
      seviye: SEVIYE,
      ozet: { bsonType: 'string' },
      olculenBeceriler: METIN_DIZISI,
      kimlerCozmeli: { bsonType: 'string' },
      ogrenmeHedefleri: METIN_DIZISI,
      soruEtiketi: {
        bsonType: 'string',
        description: 'Soru bankasında bu teste ait soruları seçen etiket.',
      },
      gecmeEsigi: { bsonType: 'number', minimum: 0, maximum: 100 },
      durum: DURUM,
      seo: SEO,
    }),
    dizinler: [
      { anahtar: { slug: 1 }, secenekler: { unique: true, name: 'slug_tekil' } },
      { anahtar: { seviye: 1 }, secenekler: { name: 'seviye' } },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.sorular,
    aciklama:
      'Soru bankası. Doğru cevap ve açıklama sunucu tarafında kalır; istemciye yalnızca gerekli alanlar gönderilir.',
    sema: sema(['kimlik', 'konu', 'zorluk', 'beceri', 'soru', 'secenekler', 'dogruIndeks'], {
      kimlik: { bsonType: 'string' },
      konu: { bsonType: 'string' },
      altKonu: { bsonType: 'string' },
      etiketler: METIN_DIZISI,
      zorluk: SEVIYE,
      beceri: { bsonType: 'string' },
      soru: { bsonType: 'string', minLength: 10 },
      secenekler: { bsonType: 'array', minItems: 2, maxItems: 6, items: { bsonType: 'string' } },
      dogruIndeks: { bsonType: 'number', minimum: 0, maximum: 5 },
      aciklama: { bsonType: 'string' },
      ilgiliAtlas: SLUG,
      durum: DURUM,
    }),
    dizinler: [
      { anahtar: { kimlik: 1 }, secenekler: { unique: true, name: 'kimlik_tekil' } },
      { anahtar: { etiketler: 1, zorluk: 1 }, secenekler: { name: 'secim' } },
      { anahtar: { konu: 1, zorluk: 1 }, secenekler: { name: 'konu_zorluk' } },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.arastirma,
    aciklama:
      'Sinaptik Research yayınları: rapor, benchmark, veri seti, whitepaper, index ve not. Sınırlılık bölümü zorunludur.',
    sema: sema(['slug', 'baslik', 'tur', 'ozet', 'tarih', 'sinirliliklar', 'durum'], {
      slug: SLUG,
      baslik: { bsonType: 'string' },
      tur: {
        bsonType: 'string',
        enum: ['Rapor', 'Benchmark', 'Veri Seti', 'Whitepaper', 'Index', 'Not'],
      },
      ozet: { bsonType: 'string' },
      veriNoktasi: { bsonType: 'string' },
      veriEtiketi: { bsonType: 'string' },
      tarih: TARIH_METNI,
      yontem: METIN_DIZISI,
      kapsam: {
        bsonType: 'array',
        items: {
          bsonType: 'object',
          required: ['etiket', 'deger'],
          properties: { etiket: { bsonType: 'string' }, deger: { bsonType: 'string' } },
        },
      },
      bulgular: METIN_DIZISI,
      sinirliliklar: {
        bsonType: 'array',
        minItems: 1,
        items: { bsonType: 'string' },
        description: 'Sınırlılık bölümü olmayan yayın onaylanmaz (metodoloji ilkesi).',
      },
      atifFormati: { bsonType: 'string' },
      lisans: { bsonType: 'string' },
      govde: GOVDE,
      sss: SSS,
      ekler: {
        bsonType: 'array',
        items: {
          bsonType: 'object',
          required: ['ad', 'tur'],
          properties: {
            ad: { bsonType: 'string' },
            tur: { bsonType: 'string' },
            medyaKimligi: { bsonType: 'string' },
            boyutBayt: { bsonType: 'number' },
          },
        },
      },
      durum: DURUM,
      seo: SEO,
    }),
    dizinler: [
      { anahtar: { slug: 1 }, secenekler: { unique: true, name: 'slug_tekil' } },
      { anahtar: { tur: 1, tarih: -1 }, secenekler: { name: 'tur_akisi' } },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.dergiSayilari,
    aciklama:
      'Dergi sayıları ve içindeki yazılar. Yazılar PDF içine gömülmez; her biri kendi kalıcı adresinde yayımlanır.',
    sema: sema(['slug', 'sayi', 'kapakKonusu', 'tarih', 'durum'], {
      slug: SLUG,
      sayi: { bsonType: 'string' },
      kapakKonusu: { bsonType: 'string' },
      ozet: { bsonType: 'string' },
      tarih: TARIH_METNI,
      durum: DURUM,
      yazilar: {
        bsonType: 'array',
        items: {
          bsonType: 'object',
          required: ['slug', 'baslik', 'bolum', 'yazarSlug'],
          properties: {
            slug: SLUG,
            baslik: { bsonType: 'string' },
            bolum: { bsonType: 'string' },
            ozet: { bsonType: 'string' },
            yazarSlug: SLUG,
            okumaDakika: { bsonType: 'number', minimum: 1 },
            govde: GOVDE,
            kaynaklar: KAYNAKLAR,
            ilgiliAtlas: { bsonType: 'array', items: SLUG },
          },
        },
      },
      seo: SEO,
    }),
    dizinler: [
      { anahtar: { slug: 1 }, secenekler: { unique: true, name: 'slug_tekil' } },
      { anahtar: { tarih: -1 }, secenekler: { name: 'arsiv' } },
      { anahtar: { 'yazilar.slug': 1 }, secenekler: { name: 'yazi_slug' } },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.podcast,
    aciklama: 'Podcast bölümleri: konuk, çıkarımlar, döküm ve zaman damgaları.',
    sema: sema(['slug', 'numara', 'ad', 'tarih', 'durum'], {
      slug: SLUG,
      numara: { bsonType: 'number', minimum: 1 },
      ad: { bsonType: 'string' },
      konuk: { bsonType: 'string' },
      konukUnvan: { bsonType: 'string' },
      dakika: { bsonType: 'number', minimum: 1 },
      ozet: { bsonType: 'string' },
      cikarimlar: METIN_DIZISI,
      dokum: GOVDE,
      bolumler: {
        bsonType: 'array',
        items: {
          bsonType: 'object',
          required: ['saniye', 'baslik'],
          properties: { saniye: { bsonType: 'number' }, baslik: { bsonType: 'string' } },
        },
      },
      sesMedyaKimligi: { bsonType: 'string' },
      tarih: TARIH_METNI,
      durum: DURUM,
      seo: SEO,
    }),
    dizinler: [
      { anahtar: { slug: 1 }, secenekler: { unique: true, name: 'slug_tekil' } },
      { anahtar: { numara: -1 }, secenekler: { unique: true, name: 'numara_tekil' } },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.briefler,
    aciklama:
      'Sinaptik Daily: her gün bir sayı, beş madde. Bülten gönderimi bu kayıttan türetilir.',
    sema: sema(['tarih', 'baslik', 'maddeler', 'durum'], {
      tarih: TARIH_METNI,
      baslik: { bsonType: 'string' },
      /*
       * BRIEF ARTIK TAM BİR YAYIN. Önceki şema yalnızca `maddeler` taşıyordu:
       * beş başlık ve beş "neden" cümlesi, ortalama 1.900 karakter. Haber
       * kayıtları ise gövde + answer-first cevap + SSS + kaynak taşıyor
       * (~6.300 karakter). Brief, günün derlemesi olarak haberden daha geniş
       * bir gündemi kapsıyor ama sitede en ince içerikti.
       *
       * GEO AÇISINDAN KRİTİK OLAN İKİ ALAN EKSİKTİ: `kisaCevap` (dil
       * modellerinin alıntıladığı answer-first blok) ve `sss` (FAQPage
       * şeması). İkisi olmadan brief sayfaları arama ve üretken arama
       * yüzeylerinde görünmüyordu.
       *
       * Alanlar `icerikler` şemasındaki karşılıklarıyla AYNI adları taşır;
       * aynı bileşenler (`MetinGovdesi`, `KaynakListesi`, `SSSBolumu`) hiçbir
       * uyarlama olmadan basabilsin diye.
       */
      kisaCevap: {
        bsonType: 'string',
        minLength: 40,
        maxLength: 600,
        description: 'Answer-first: günün tek paragrafta alıntılanabilir özeti (§56).',
      },
      ozet: { bsonType: 'string', description: 'Kart ve akış özeti; kisaCevap ile aynı değil.' },
      okumaDakika: { bsonType: 'number', minimum: 1, maximum: 60 },
      govde: GOVDE,
      kaynaklar: KAYNAKLAR,
      sss: SSS,
      konuSluglari: {
        bsonType: 'array',
        items: SLUG,
        description: 'Sayının dokunduğu konular; konu merkezlerinden geri bağlanır.',
      },
      maddeler: {
        bsonType: 'array',
        minItems: 1,
        items: {
          bsonType: 'object',
          required: ['numara', 'baslik', 'neden'],
          properties: {
            numara: { bsonType: 'string' },
            baslik: { bsonType: 'string' },
            neden: { bsonType: 'string' },
            kaynak: { bsonType: 'string' },
            konuSlug: SLUG,
            icerikSlug: SLUG,
          },
        },
      },
      durum: DURUM,
      gonderimZamani: { bsonType: 'date' },
      seo: SEO,
    }),
    dizinler: [{ anahtar: { tarih: -1 }, secenekler: { unique: true, name: 'tarih_tekil' } }],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.radar,
    aciklama:
      'Trend radarı anlık görüntüleri. Her kayıt bir tarih için momentum ve sinyal kırılımı taşır; zaman serisi olarak saklanır.',
    sema: sema(['slug', 'ad', 'tarih', 'momentum', 'yon'], {
      slug: SLUG,
      ad: { bsonType: 'string' },
      tarih: TARIH_METNI,
      momentum: { bsonType: 'number', minimum: 0, maximum: 100 },
      yon: { bsonType: 'string', enum: ['yukselen', 'sabit', 'dusen'] },
      degisim: { bsonType: 'number' },
      sinyaller: {
        bsonType: 'object',
        properties: {
          yayin: { bsonType: 'number' },
          github: { bsonType: 'number' },
          modelCikisi: { bsonType: 'number' },
          aramaIlgisi: { bsonType: 'number' },
        },
      },
      not: { bsonType: 'string' },
      yontemSurumu: { bsonType: 'string', description: 'Skorlama yöntemi sürümü; §64.' },
      seo: SEO,
    }),
    dizinler: [
      { anahtar: { slug: 1, tarih: -1 }, secenekler: { unique: true, name: 'konu_tarih' } },
      { anahtar: { tarih: -1, momentum: -1 }, secenekler: { name: 'gunluk_siralama' } },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.hizmetler,
    aciklama: 'Kurumsal hizmet sayfaları: problem, çözüm, mimari ve güvenlik başlıkları.',
    sema: sema(['slug', 'ad', 'ozet', 'problem', 'cozum', 'durum'], {
      slug: SLUG,
      ad: { bsonType: 'string' },
      ozet: { bsonType: 'string' },
      problem: { bsonType: 'string' },
      cozum: { bsonType: 'string' },
      kullanimAlanlari: METIN_DIZISI,
      mimari: METIN_DIZISI,
      guvenlik: METIN_DIZISI,
      sss: SSS,
      durum: DURUM,
      seo: SEO,
    }),
    dizinler: [{ anahtar: { slug: 1 }, secenekler: { unique: true, name: 'slug_tekil' } }],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.sektorler,
    aciklama: 'Sektör sayfaları: kullanım alanları, teknolojiler ve sektöre özgü riskler.',
    sema: sema(['slug', 'ad', 'ozet', 'durum'], {
      slug: SLUG,
      ad: { bsonType: 'string' },
      ozet: { bsonType: 'string' },
      kullanimSayisi: { bsonType: 'number', minimum: 0 },
      kullanimAlanlari: METIN_DIZISI,
      teknolojiler: METIN_DIZISI,
      riskler: METIN_DIZISI,
      mevzuat: METIN_DIZISI,
      durum: DURUM,
      seo: SEO,
    }),
    dizinler: [{ anahtar: { slug: 1 }, secenekler: { unique: true, name: 'slug_tekil' } }],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.vakalar,
    aciklama:
      'Vaka çalışmaları: problem, yaklaşım, etki ve dersler. Müşteri adı yalnızca yazılı onayla yayımlanır.',
    sema: sema(['slug', 'baslik', 'sektor', 'problem', 'yaklasim', 'durum'], {
      slug: SLUG,
      baslik: { bsonType: 'string' },
      sektor: { bsonType: 'string' },
      sektorSlug: SLUG,
      musteriAdi: { bsonType: 'string' },
      onayliYayin: { bsonType: 'bool', description: 'Müşteri adının yayımına yazılı onay var mı.' },
      /*
       * TEMSİLÎ VAKA — değişmez kural 5'in vaka karşılığı.
       *
       * `onayliYayin: false` yalnızca "müşteri adı yayımlanamaz" der; kaydın
       * gerçek bir işi anlatıp anlatmadığını söylemez. Yaklaşımı göstermek
       * için yazılmış senaryoyu gerçek müşteri geçmişinden ayıran alan budur.
       * Doğruysa site sayfası görünür bir uyarı basar ve sayısal sonuç
       * paylaşılmaz; benchmark tablolarındaki "örnek veri" uyarısıyla aynı
       * ilke (MASTER-PLAN §59).
       */
      temsili: {
        bsonType: 'bool',
        description: 'Gerçek müşteri işi değil, yaklaşımı gösteren temsilî senaryo.',
      },
      problem: { bsonType: 'string' },
      yaklasim: { bsonType: 'string' },
      teknolojiler: METIN_DIZISI,
      etki: {
        bsonType: 'array',
        items: {
          bsonType: 'object',
          required: ['etiket', 'deger'],
          properties: {
            etiket: { bsonType: 'string' },
            deger: { bsonType: 'string' },
            olcumYontemi: { bsonType: 'string' },
          },
        },
      },
      dersler: METIN_DIZISI,
      govde: GOVDE,
      durum: DURUM,
      seo: SEO,
    }),
    dizinler: [
      { anahtar: { slug: 1 }, secenekler: { unique: true, name: 'slug_tekil' } },
      { anahtar: { sektorSlug: 1 }, secenekler: { name: 'sektor' } },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.labProjeleri,
    aciklama: 'Sinaptik Lab: etkileşimli araçlar, deneyler, açık kaynak projeler ve demolar.',
    sema: sema(['slug', 'ad', 'tur', 'ozet', 'durum'], {
      slug: SLUG,
      ad: { bsonType: 'string' },
      tur: { bsonType: 'string', enum: ['Araç', 'Deney', 'Açık Kaynak', 'Demo'] },
      ozet: { bsonType: 'string' },
      yayinDurumu: { bsonType: 'string', enum: ['yayinda', 'gelistiriliyor'] },
      bilesenAnahtari: {
        bsonType: 'string',
        description: 'Etkileşimli aracın istemci bileşen anahtarı.',
      },
      girdiler: {
        bsonType: 'array',
        items: {
          bsonType: 'object',
          required: ['etiket', 'birim'],
          properties: { etiket: { bsonType: 'string' }, birim: { bsonType: 'string' } },
        },
      },
      depoAdresi: { bsonType: 'string' },
      /*
       * Projenin dayandığı Atlas kavramları.
       *
       * Bağ daha önce `app/(site)/lab/[slug]/page.tsx` içinde slug'a göre
       * KODA GÖMÜLÜ bir eşleme tablosuydu (`KAVRAM_ESLEMESI`). 11 projede
       * çalışıyordu; proje sayısı arttığında yeni her kayıt kavram bağı
       * OLMADAN yayına giriyor ve bağı yalnızca kod değişikliği kurabiliyordu.
       * Alan buraya taşındı: editör panelden yazar, `dersler.kavramlar` ile
       * aynı kalıp.
       */
      kavramlar: { bsonType: 'array', items: SLUG },
      govde: GOVDE,
      durum: DURUM,
      seo: SEO,
    }),
    dizinler: [{ anahtar: { slug: 1 }, secenekler: { unique: true, name: 'slug_tekil' } }],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.etkinlikler,
    aciklama: 'Webinar, workshop, meetup ve konferans kayıtları; kayıt formuna bağlanır.',
    sema: sema(['slug', 'ad', 'tur', 'tarih', 'etkinlikDurumu'], {
      slug: SLUG,
      ad: { bsonType: 'string' },
      tur: { bsonType: 'string', enum: ['Webinar', 'Workshop', 'Meetup', 'Konferans'] },
      tarih: TARIH_METNI,
      baslangicZamani: { bsonType: 'date' },
      bicim: { bsonType: 'string' },
      yer: { bsonType: 'string' },
      ozet: { bsonType: 'string' },
      etkinlikDurumu: { bsonType: 'string', enum: ['planlandi', 'kayit-acik', 'gecti', 'iptal'] },
      kayitAdresi: { bsonType: 'string' },
      kapasite: { bsonType: 'number', minimum: 1 },
      konusmacilar: { bsonType: 'array', items: SLUG },
      durum: DURUM,
      seo: SEO,
    }),
    dizinler: [
      { anahtar: { slug: 1 }, secenekler: { unique: true, name: 'slug_tekil' } },
      { anahtar: { tarih: -1 }, secenekler: { name: 'takvim' } },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.terimler,
    aciklama:
      'Sözlük terimleri: tek satırlık, alıntılanabilir tanımlar. Atlas girdisinin HAFİF eşdeğeri.',
    /*
     * NEDEN ATLAS'TAN AYRI BİR KOLEKSİYON.
     *
     * `/sozluk/` eskiden doğrudan `atlas` koleksiyonunu okuyordu ve 35 terim
     * gösteriyordu. Sözlüğü büyütmenin tek yolu Atlas girdisi açmaktı; bir
     * Atlas girdisi ise gövde, SSS, kaynak listesi ve sürüm geçmişi taşıyan
     * ağır bir editoryal üründür. Üç yüz terimi o ağırlıkla üretmek ne
     * gerçekçi ne de doğru: "perplexity"nin tek satırlık tanımı yeterlidir,
     * "RAG"in ise kendi sayfası gerekir.
     *
     * Bu yüzden iki katman var ve bilinçli olarak ÖRTÜŞÜYORLAR: bir terimin
     * Atlas girdisi varsa `atlasSlug` ile oraya bağlanır ve sözlükte tanımı
     * yine görünür. Böylece sözlük tek ve tam bir liste olur; okur "bu terim
     * neden burada yok" diye sormaz.
     *
     * TERİMİN KENDİ SAYFASI YOKTUR ve olmayacak: tek satırlık bir tanım için
     * ayrı bir adres açmak, arama sonuçlarını ince sayfalarla doldurur
     * (MASTER-PLAN §51). Derinlik isteyen terim Atlas'a taşınır.
     */
    sema: sema(['slug', 'terim', 'tanim', 'durum'], {
      slug: SLUG,
      terim: { bsonType: 'string' },
      /** İngilizce karşılık — okurun aradığı biçim çoğu zaman budur. */
      ingilizce: { bsonType: 'string' },
      /** Kısaltma ya da alternatif yazım (RAG, LLM, CoT). */
      kisaltma: { bsonType: 'string' },
      tanim: { bsonType: 'string', maxLength: 400 },
      /** `lib/taksonomi.ts` içindeki Atlas kategorisi slug'ı. */
      kategoriSlug: SLUG,
      /** Ayrıntılı Atlas girdisi varsa slug'ı. */
      atlasSlug: SLUG,
      /** Aynı koleksiyondaki ilgili terimlerin slug'ları. */
      ilgili: { bsonType: 'array', items: SLUG },
      durum: DURUM,
      ...ZAMAN_DAMGALARI,
    }),
    dizinler: [
      { anahtar: { slug: 1 }, secenekler: { unique: true, name: 'slug_tekil' } },
      { anahtar: { kategoriSlug: 1 }, secenekler: { name: 'kategori' } },
      { anahtar: { terim: 1 }, secenekler: { name: 'terim' } },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.uzmanlar,
    aciklama:
      'Topluluk uzman ağı: alan, sorumluluk kapsamı ve koltuk durumu. Açık koltuklar da kayıttır.',
    /*
     * KOLTUK DURUMU AYRI BİR ALAN.
     *
     * Önceki sürümde açık koltuklar `ad: 'Katkı bekleniyor'` yazan belgelerdi
     * ve sayfa `uzman.ad === 'Katkı bekleniyor'` karşılaştırmasıyla ayırıyordu.
     * Bu, projede tekrar eden bir hata sınıfı: GÖRÜNEN AD ile eşleştirme. Metin
     * bir kez değiştiğinde (hatta bir boşluk farkıyla) tüm açık koltuklar dolu
     * sayılırdı. Durum artık `koltukDurumu` alanında, enum olarak duruyor.
     *
     * AÇIK KOLTUK BOŞ KART DEĞİLDİR: bir rol tanımıdır. `sorumluluklar`,
     * `aranan` ve `sunulan` alanları koltuğun ne olduğunu söyler; bunlar
     * olmadan sayfa "burada biri olacak" demekten öteye geçmez ve kimse
     * başvurmaz. Uydurma uzman yayımlamak yerine GERÇEK bir çağrı yapılır.
     */
    sema: sema(['slug', 'ad', 'unvan', 'alan'], {
      slug: SLUG,
      ad: { bsonType: 'string' },
      unvan: { bsonType: 'string' },
      alan: { bsonType: 'string' },
      /** Koltuğun bağlı olduğu konu — `/konu/<slug>/` merkezine bağlanır. */
      alanSlug: SLUG,
      koltukDurumu: { bsonType: 'string', enum: ['dolu', 'acik'] },
      basHarfler: { bsonType: 'string', maxLength: 4 },
      ozgecmis: { bsonType: 'string' },
      /** Bu koltuğun üstlendiği editoryal iş. */
      sorumluluklar: METIN_DIZISI,
      /** Koltuğa başvuran kişide aranan doğrulanabilir nitelikler. */
      aranan: METIN_DIZISI,
      /** Koltuğun karşılığında sunulanlar (künye, inceleyen kaydı, profil). */
      sunulan: METIN_DIZISI,
      /** Bu uzmanın inceleyebileceği içerik türleri. */
      kapsam: METIN_DIZISI,
      katkilar: METIN_DIZISI,
      durum: DURUM,
      seo: SEO,
      ...ZAMAN_DAMGALARI,
    }),
    dizinler: [
      { anahtar: { slug: 1 }, secenekler: { unique: true, name: 'slug_tekil' } },
      { anahtar: { koltukDurumu: 1 }, secenekler: { name: 'koltuk_durumu' } },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.sayfalar,
    aciklama:
      'Statik editoryal sayfalar: hakkında, künye, iletişim, metodoloji, editoryal politika.',
    sema: sema(['slug', 'baslik', 'durum'], {
      slug: SLUG,
      yol: { bsonType: 'string' },
      baslik: { bsonType: 'string' },
      etiket: { bsonType: 'string' },
      ozet: { bsonType: 'string' },
      govde: GOVDE,
      durum: DURUM,
      guncellemeTarihi: TARIH_METNI,
      seo: SEO,
    }),
    dizinler: [{ anahtar: { slug: 1 }, secenekler: { unique: true, name: 'slug_tekil' } }],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.politikalar,
    aciklama:
      'Hukuki metinler: gizlilik, KVKK aydınlatma, çerez politikası, kullanım şartları. Sürüm geçmişi zorunludur.',
    sema: sema(['slug', 'baslik', 'yururlukTarihi', 'surum', 'durum'], {
      slug: SLUG,
      baslik: { bsonType: 'string' },
      ozet: { bsonType: 'string' },
      yururlukTarihi: TARIH_METNI,
      surum: { bsonType: 'string' },
      hukukiOnay: {
        bsonType: 'bool',
        description: 'Hukuk incelemesi tamamlandı mı; false ise sayfada taslak uyarısı gösterilir.',
      },
      govde: GOVDE,
      surumler: SURUMLER,
      durum: DURUM,
      seo: SEO,
    }),
    dizinler: [{ anahtar: { slug: 1 }, secenekler: { unique: true, name: 'slug_tekil' } }],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.medya,
    aciklama:
      'Görsel, ses, video ve belge varlıkları. Alternatif metin zorunludur (erişilebilirlik ve SEO).',
    sema: sema(['kimlik', 'tur', 'adres', 'altMetin'], {
      kimlik: { bsonType: 'string' },
      tur: { bsonType: 'string', enum: ['gorsel', 'ses', 'video', 'belge'] },
      adres: { bsonType: 'string' },
      altMetin: { bsonType: 'string', minLength: 3 },
      genislik: { bsonType: 'number' },
      yukseklik: { bsonType: 'number' },
      boyutBayt: { bsonType: 'number' },
      medyaTuru: { bsonType: 'string', description: 'MIME türü.' },
      telifNotu: { bsonType: 'string' },
      kaynak: { bsonType: 'string' },
      uretimYontemi: {
        bsonType: 'string',
        enum: ['fotograf', 'illustrasyon', 'ekran-goruntusu', 'diyagram', 'yapay-zeka'],
        description: 'Yapay zekâ ile üretilen görseller sayfada işaretlenir.',
      },
    }),
    dizinler: [
      { anahtar: { kimlik: 1 }, secenekler: { unique: true, name: 'kimlik_tekil' } },
      { anahtar: { tur: 1 }, secenekler: { name: 'tur' } },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.yonlendirmeler,
    aciklama:
      'URL yönlendirmeleri. Bir içeriğin adresi değiştiğinde eski adres kalıcı olarak yeni adrese taşınır (§48).',
    sema: sema(['kaynakYol', 'hedefYol', 'kod'], {
      kaynakYol: { bsonType: 'string', pattern: '^/' },
      hedefYol: { bsonType: 'string', pattern: '^/' },
      kod: { bsonType: 'number', enum: [301, 302, 308] },
      gerekce: { bsonType: 'string' },
      aktif: { bsonType: 'bool' },
    }),
    dizinler: [
      { anahtar: { kaynakYol: 1 }, secenekler: { unique: true, name: 'kaynak_tekil' } },
      { anahtar: { aktif: 1 }, secenekler: { name: 'aktif' } },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.aramaKayitlari,
    aciklama:
      'Site içi arama sorguları. Sonuç üretmeyen sorgular içerik açığı panosunu besler. Kişisel veri saklanmaz: yalnızca sorgu metni ve sayaç.',
    sema: sema(['sorgu', 'adet'], {
      sorgu: { bsonType: 'string', maxLength: 200 },
      adet: { bsonType: 'number', minimum: 1 },
      sonucBulundu: { bsonType: 'bool' },
      ilkSonucYolu: { bsonType: 'string' },
      sonGorulme: { bsonType: 'date' },
      inceledi: { bsonType: 'bool', description: 'Editoryal ekip bu sorguyu değerlendirdi mi.' },
    }),
    dizinler: [
      { anahtar: { sorgu: 1 }, secenekler: { unique: true, name: 'sorgu_tekil' } },
      { anahtar: { sonucBulundu: 1, adet: -1 }, secenekler: { name: 'icerik_acigi' } },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.kullanicilar,
    aciklama:
      'Kayıtlı kullanıcılar. Parola ASLA düz metin saklanmaz; yalnızca özet (hash) tutulur.',
    kisiselVeri: true,
    sema: sema(['eposta', 'durum'], {
      eposta: {
        bsonType: 'string',
        pattern: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$',
        description: 'Küçük harfe normalize edilmiş; tekil dizin bunun üzerinde.',
      },
      epostaDogrulandi: { bsonType: 'bool' },
      adSoyad: { bsonType: 'string' },
      parolaOzeti: {
        bsonType: 'string',
        description: 'scrypt$N$r$p$tuz$ozet biçiminde özet. Düz metin parola YASAK.',
      },
      parolaGuncellendi: { bsonType: 'date' },
      roller: {
        bsonType: 'array',
        minItems: 1,
        items: {
          bsonType: 'string',
          enum: ['sahip', 'yonetici', 'editor', 'yazar', 'moderator', 'uye', 'okur'],
        },
        description: 'Panel rolleri lib/yetki/roller.ts içindeki matrise karşılık gelir.',
      },
      durum: { bsonType: 'string', enum: ['aktif', 'askida', 'silindi'] },
      sonGiris: { bsonType: 'date' },
      sonGirisAdresi: { bsonType: 'string', description: 'Son girişin IP adresi (denetim için).' },
      basarisizGiris: { bsonType: 'number', minimum: 0 },
      kilitBitis: {
        bsonType: 'date',
        description: 'Bu ana kadar giriş denemesi reddedilir (oran sınırlama).',
      },
      parolaSifirlamaOzeti: { bsonType: 'string' },
      parolaSifirlamaBitis: { bsonType: 'date' },
      /*
       * E-posta doğrulama anahtarı. Parola sıfırlamayla AYNI kalıp: düz
       * anahtar yalnızca bağlantıda taşınır, veritabanında SHA-256 özeti
       * durur. Veritabanı sızsa bile anahtarlar kullanılamaz.
       */
      epostaDogrulamaOzeti: { bsonType: 'string' },
      epostaDogrulamaBitis: { bsonType: 'date' },
      /** Site üyesi kendi adını değiştirebilir; görünen ad `adSoyad`. */
      uyelikTarihi: { bsonType: 'date' },
      /**
       * Üyenin kendi bildirdiği ÖĞRENME rolü ("AI Engineer" gibi) — yetki
       * rolüyle karıştırılmamalı. `roller` alanı yetkiyi, bu alan öğrenme
       * rotasının kişiselleştirilmesini belirler (MASTER-PLAN §9 ayrımı).
       */
      ogrenmeRolu: { bsonType: 'string', maxLength: 60 },
      /*
       * ÜYELİK PROFİLİ — kişiselleştirme alanları.
       *
       * Hepsi OPSİYONELDİR ve hepsinin sitede bir karşılığı vardır; "belki
       * lazım olur" diye alan toplanmaz (KVKK veri minimizasyonu):
       *  - `deneyimSeviyesi` → hangi seviyedeki testler ve dersler önerilecek
       *  - `ilgiAlanlari`    → konu merkezlerine göre akış kişiselleştirmesi
       *  - `sektorSlug`      → sektöre uygun vaka çalışmaları
       *  - `hedef`           → rota seçimi (kariyer değişimi mi, mevcut işte
       *                        kullanım mı) — 20 rotanın rol ayrımına karşılık
       *  - `haftalikSaat`    → rotanın kaç haftaya yayılacağı
       *  - `kurum`           → yalnızca kurumsal iletişim; zorunlu değildir
       *
       * SUNUCU HER BİRİNİ BEYAZ LİSTEYE KARŞI DOĞRULAR. Enum alanları
       * formdan geldiği gibi yazılmaz; `roller` alanındaki ilkeyle aynı
       * gerekçe (bkz. `uyeKaydol`).
       */
      deneyimSeviyesi: { bsonType: 'string', enum: ['baslangic', 'orta', 'ileri'] },
      ilgiAlanlari: { bsonType: 'array', maxItems: 8, items: SLUG },
      sektorSlug: SLUG,
      hedef: {
        bsonType: 'string',
        enum: ['kariyer-degisimi', 'mevcut-iste-kullanim', 'ekip-kurma', 'akademik', 'merak'],
      },
      haftalikSaat: { bsonType: 'number', minimum: 1, maximum: 40 },
      kurum: { bsonType: 'string', maxLength: 120 },
      yazarSlug: {
        bsonType: 'string',
        description: 'Kullanıcının yazar künyesi; içerik atfı bu slug üzerinden yapılır.',
      },
      notlar: { bsonType: 'string', description: 'Yönetici notu; kullanıcıya gösterilmez.' },
      rizalar: {
        bsonType: 'object',
        description: 'KVKK açık rıza kayıtları; her rıza için tarih ve metin sürümü.',
        properties: {
          bulten: { bsonType: 'bool' },
          bultenTarihi: { bsonType: 'date' },
          politikaSurumu: { bsonType: 'string' },
          /*
           * Hangi bülten listelerine rıza verildiği. Tek bir `bulten: true`
           * bayrağı "hangi listeye" sorusunu cevaplamıyordu; KVKK açık
           * rızası amaç bazlıdır, dolayısıyla liste bazında tutulur.
           */
          bultenListeleri: {
            bsonType: 'array',
            items: { bsonType: 'string', enum: ['daily', 'weekly', 'research', 'kurumsal'] },
          },
        },
      },
    }),
    dizinler: [
      { anahtar: { eposta: 1 }, secenekler: { unique: true, name: 'eposta_tekil' } },
      { anahtar: { roller: 1 }, secenekler: { name: 'rol' } },
      { anahtar: { durum: 1, sonGiris: -1 }, secenekler: { name: 'durum_etkinlik' } },
      { anahtar: { yazarSlug: 1 }, secenekler: { name: 'yazar_baglantisi', sparse: true } },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.aboneler,
    aciklama:
      'Bülten aboneleri. Çift onay (double opt-in) zorunludur; onay tarihi ve kaynağı kayda geçer.',
    kisiselVeri: true,
    sema: sema(['eposta', 'onayDurumu'], {
      eposta: { bsonType: 'string', pattern: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$' },
      onayDurumu: { bsonType: 'string', enum: ['bekliyor', 'onayli', 'cikti'] },
      onayTarihi: { bsonType: 'date' },
      onayKaynagi: { bsonType: 'string', description: 'Formun bulunduğu sayfa yolu.' },
      politikaSurumu: { bsonType: 'string' },
      listeler: {
        bsonType: 'array',
        // 'research' SONRADAN EKLENDİ: site "Sinaptik Research" bültenini
        // sunuyordu ama enum karşılığı yoktu; o seçenek işaretlenen her kayıt
        // doğrulamadan düşüyordu. Enum'a değer eklemek geriye dönük uyumludur
        // — mevcut belgeler etkilenmez, yalnızca kabul kümesi genişler.
        items: { bsonType: 'string', enum: ['daily', 'weekly', 'research', 'kurumsal'] },
      },
      cikisTarihi: { bsonType: 'date' },
      cikisAnahtari: { bsonType: 'string' },
    }),
    dizinler: [
      { anahtar: { eposta: 1 }, secenekler: { unique: true, name: 'eposta_tekil' } },
      { anahtar: { onayDurumu: 1 }, secenekler: { name: 'onay' } },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.formKayitlari,
    aciklama:
      'İletişim, teklif ve etkinlik kayıt formları. Saklama süresi sonunda TTL dizini ile silinir.',
    kisiselVeri: true,
    sema: sema(['formTuru', 'alanlar', 'saklamaBitis'], {
      formTuru: {
        bsonType: 'string',
        enum: ['iletisim', 'teklif', 'etkinlik-kayit', 'readiness-talebi', 'katki'],
      },
      alanlar: {
        bsonType: 'object',
        description: 'Formun gönderdiği alanlar; şema forma göre değişir.',
      },
      kaynakYol: { bsonType: 'string' },
      politikaSurumu: { bsonType: 'string' },
      islemDurumu: { bsonType: 'string', enum: ['yeni', 'islemde', 'kapandi'] },
      saklamaBitis: {
        bsonType: 'date',
        description: 'TTL dizini bu alana bakar; süre dolunca kayıt silinir.',
      },
    }),
    dizinler: [
      { anahtar: { formTuru: 1, islemDurumu: 1 }, secenekler: { name: 'kuyruk' } },
      {
        anahtar: { saklamaBitis: 1 },
        secenekler: { name: 'saklama_ttl', expireAfterSeconds: 0 },
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.testSonuclari,
    aciklama:
      'Test ve seviye testi sonuçları. Anonim çözümlerde kullanıcı bağlanmaz; yalnızca toplu istatistik için tutulur.',
    kisiselVeri: true,
    sema: sema(['testSlug', 'puan', 'saklamaBitis'], {
      testSlug: SLUG,
      kullaniciKimligi: { bsonType: 'objectId' },
      oturumAnahtari: { bsonType: 'string', description: 'Anonim çözümlerde rastgele anahtar.' },
      puan: { bsonType: 'number', minimum: 0, maximum: 100 },
      dogruSayisi: { bsonType: 'number', minimum: 0 },
      soruSayisi: { bsonType: 'number', minimum: 1 },
      seviye: { bsonType: 'string' },
      beceriKirilimi: { bsonType: 'object' },
      sureSaniye: { bsonType: 'number', minimum: 0 },
      saklamaBitis: { bsonType: 'date' },
    }),
    dizinler: [
      { anahtar: { testSlug: 1, olusturuldu: -1 }, secenekler: { name: 'test_akisi' } },
      { anahtar: { kullaniciKimligi: 1 }, secenekler: { name: 'kullanici', sparse: true } },
      {
        anahtar: { saklamaBitis: 1 },
        secenekler: { name: 'saklama_ttl', expireAfterSeconds: 0 },
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.readinessSonuclari,
    aciklama:
      'AI Readiness değerlendirme sonuçları. Hesaplama istemcide yapılır; kayıt yalnızca kullanıcı açıkça paylaşmayı seçerse oluşur.',
    kisiselVeri: true,
    sema: sema(['boyutPuanlari', 'toplamPuan', 'saklamaBitis'], {
      kurumAdi: { bsonType: 'string' },
      sektorSlug: SLUG,
      calisanAraligi: { bsonType: 'string' },
      boyutPuanlari: { bsonType: 'object' },
      toplamPuan: { bsonType: 'number', minimum: 0, maximum: 100 },
      olgunlukSeviyesi: { bsonType: 'string' },
      iletisimIzni: { bsonType: 'bool' },
      eposta: { bsonType: 'string' },
      politikaSurumu: { bsonType: 'string' },
      saklamaBitis: { bsonType: 'date' },
    }),
    dizinler: [
      { anahtar: { olusturuldu: -1 }, secenekler: { name: 'akis' } },
      { anahtar: { sektorSlug: 1 }, secenekler: { name: 'sektor', sparse: true } },
      {
        anahtar: { saklamaBitis: 1 },
        secenekler: { name: 'saklama_ttl', expireAfterSeconds: 0 },
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.oturumlar,
    aciklama:
      'Aktif panel oturumları. Çerezde düz token durur, burada yalnızca SHA-256 özeti; veritabanı sızsa bile oturum çalınamaz.',
    kisiselVeri: true,
    sema: sema(['tokenOzeti', 'kullaniciKimligi', 'biterZaman', 'mutlakBitis'], {
      tokenOzeti: {
        bsonType: 'string',
        description: 'Oturum tokeninin SHA-256 özeti (base64url). Token kendisi saklanmaz.',
      },
      kullaniciKimligi: { bsonType: 'objectId' },
      biterZaman: {
        bsonType: 'date',
        description: 'Kayan süre sonu; her etkin istekte ileri alınır. TTL dizini buna bakar.',
      },
      mutlakBitis: {
        bsonType: 'date',
        description: 'Kayan süreden bağımsız üst sınır; uzatılamaz.',
      },
      sonErisim: { bsonType: 'date' },
      adres: { bsonType: 'string', description: 'Oturumun açıldığı IP.' },
      tarayici: { bsonType: 'string', description: 'User-Agent, 200 karaktere kırpılmış.' },
      iptalEdildi: { bsonType: 'bool' },
      iptalNedeni: {
        bsonType: 'string',
        enum: ['cikis', 'parola-degisti', 'yonetici-iptali', 'rol-degisti'],
      },
    }),
    dizinler: [
      { anahtar: { tokenOzeti: 1 }, secenekler: { unique: true, name: 'token_tekil' } },
      { anahtar: { kullaniciKimligi: 1, sonErisim: -1 }, secenekler: { name: 'kullanici' } },
      {
        anahtar: { biterZaman: 1 },
        secenekler: { name: 'sure_ttl', expireAfterSeconds: 0 },
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.girisDenemeleri,
    aciklama:
      'Başarısız giriş denemeleri. Oran sınırlama hem e-posta hem IP ekseninde uygulanır; kayıtlar TTL ile temizlenir.',
    kisiselVeri: true,
    sema: sema(['anahtar', 'tur', 'saklamaBitis'], {
      anahtar: {
        bsonType: 'string',
        description: 'Normalize edilmiş e-posta veya IP adresi.',
      },
      tur: { bsonType: 'string', enum: ['eposta', 'adres'] },
      adet: { bsonType: 'number', minimum: 1 },
      sonDeneme: { bsonType: 'date' },
      saklamaBitis: { bsonType: 'date' },
    }),
    dizinler: [
      { anahtar: { anahtar: 1, tur: 1 }, secenekler: { unique: true, name: 'anahtar_tekil' } },
      {
        anahtar: { saklamaBitis: 1 },
        secenekler: { name: 'saklama_ttl', expireAfterSeconds: 0 },
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.denetimKaydi,
    aciklama:
      'Panelde yapılan her yazma işleminin kaydı: kim, ne zaman, hangi belge, hangi alanlar. Silinemez — yalnızca eklenir.',
    sema: sema(['eylem', 'koleksiyon', 'zaman'], {
      eylem: {
        bsonType: 'string',
        enum: [
          'giris',
          'cikis',
          'giris-basarisiz',
          'olustur',
          'guncelle',
          'durum-degistir',
          'sil',
          'yayinla',
          'geri-al',
          'rol-degistir',
          'parola-degistir',
          'disa-aktar',
          'kisisel-veri-sil',
          'yonlendirme-ekle',
          'medya-yukle',
          'medya-sil',
          'ayar-degistir',
        ],
      },
      koleksiyon: { bsonType: 'string' },
      belgeKimligi: { bsonType: 'string' },
      belgeSlug: { bsonType: 'string' },
      kullaniciKimligi: { bsonType: 'objectId' },
      kullaniciEpostasi: { bsonType: 'string' },
      zaman: { bsonType: 'date' },
      adres: { bsonType: 'string' },
      degisenAlanlar: { bsonType: 'array', items: { bsonType: 'string' } },
      oncekiDurum: { bsonType: 'string' },
      yeniDurum: { bsonType: 'string' },
      not: { bsonType: 'string' },
      basarili: { bsonType: 'bool' },
    }),
    dizinler: [
      { anahtar: { zaman: -1 }, secenekler: { name: 'akis' } },
      { anahtar: { kullaniciKimligi: 1, zaman: -1 }, secenekler: { name: 'kullanici' } },
      { anahtar: { koleksiyon: 1, belgeKimligi: 1, zaman: -1 }, secenekler: { name: 'belge' } },
      { anahtar: { eylem: 1, zaman: -1 }, secenekler: { name: 'eylem' } },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.icerikSurumleri,
    aciklama:
      'İçerik anlık görüntüleri. Her kaydetmede önceki hâl buraya yazılır; yanlış düzenleme geri alınabilir.',
    sema: sema(['koleksiyon', 'belgeKimligi', 'surumNo', 'anlikGoruntu', 'zaman'], {
      koleksiyon: { bsonType: 'string' },
      belgeKimligi: { bsonType: 'string' },
      belgeSlug: { bsonType: 'string' },
      surumNo: { bsonType: 'number', minimum: 1 },
      anlikGoruntu: { bsonType: 'object', description: 'Belgenin değişiklikten ÖNCEKİ hâli.' },
      zaman: { bsonType: 'date' },
      kullaniciKimligi: { bsonType: 'objectId' },
      kullaniciEpostasi: { bsonType: 'string' },
      degisenAlanlar: { bsonType: 'array', items: { bsonType: 'string' } },
      not: { bsonType: 'string' },
    }),
    dizinler: [
      {
        anahtar: { koleksiyon: 1, belgeKimligi: 1, surumNo: -1 },
        secenekler: { unique: true, name: 'belge_surum' },
      },
      { anahtar: { zaman: -1 }, secenekler: { name: 'akis' } },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.onizlemeAnahtarlari,
    aciklama:
      'Taslak önizleme bağlantıları. Tek kullanımlık, kısa ömürlü ve tek belgeye kilitli; yayımlanmamış içerik başka yola sızmaz.',
    sema: sema(['anahtarOzeti', 'koleksiyon', 'belgeKimligi', 'biterZaman'], {
      anahtarOzeti: { bsonType: 'string', description: 'Önizleme anahtarının SHA-256 özeti.' },
      koleksiyon: { bsonType: 'string' },
      belgeKimligi: { bsonType: 'string' },
      belgeSlug: { bsonType: 'string' },
      biterZaman: { bsonType: 'date' },
      olusturanKimlik: { bsonType: 'objectId' },
      kullanildi: { bsonType: 'bool' },
    }),
    dizinler: [
      { anahtar: { anahtarOzeti: 1 }, secenekler: { unique: true, name: 'anahtar_tekil' } },
      {
        anahtar: { biterZaman: 1 },
        secenekler: { name: 'sure_ttl', expireAfterSeconds: 0 },
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    ad: KOLEKSIYONLAR.ayarlar,
    aciklama:
      'Anahtar-değer site ayarları: bakım kipi, ana sayfa manşeti, duyuru şeridi, özellik anahtarları.',
    sema: sema(['anahtar'], {
      anahtar: { bsonType: 'string', description: 'Örn. bakim-kipi, manset-slug, duyuru-seridi.' },
      deger: { description: 'Herhangi bir JSON değeri.' },
      aciklama: { bsonType: 'string' },
      guncelleyenKimlik: { bsonType: 'objectId' },
    }),
    dizinler: [{ anahtar: { anahtar: 1 }, secenekler: { unique: true, name: 'anahtar_tekil' } }],
  },
];

/** Kişisel veri içeren koleksiyonlar — KVKK işleme envanteri için. */
export const KISISEL_VERI_KOLEKSIYONLARI = TANIMLAR.filter((t) => t.kisiselVeri).map((t) => t.ad);
