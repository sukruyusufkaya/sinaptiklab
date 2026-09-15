/**
 * Kod düzeyinde taksonomi.
 *
 * Burada duran listeler İÇERİK DEĞİL, SINIFLANDIRMADIR: kategori kümesi
 * editörün panelden değiştireceği bir şey değil, rotaların ve gezinmenin
 * bağlı olduğu bir sözleşmedir (bir kategori silinirse `/atlas/kategori/<slug>/`
 * rotası kırılır). Bu yüzden MongoDB'ye taşınmaz, sürüm kontrolünde kalır.
 *
 * `lib/veri/*` fixture'larından ayrı bir dosyada tutulmasının nedeni: site
 * okuma katmanı (`lib/icerik/*`) taksonomiye ihtiyaç duyuyor ve onu fixture
 * modülünden alması, silinmek üzere olan yüzlerce kilobaytlık gövde metnini
 * üretim paketine geri sokar.
 */

export type AtlasKategorisi = {
  slug: string;
  ad: string;
  /** Kavram evreninin tahmini genişliği — yayındaki girdi sayısı DEĞİL. */
  adet: number;
};

export const ATLAS_KATEGORILERI: readonly AtlasKategorisi[] = [
  { slug: 'artificial-intelligence', ad: 'Artificial Intelligence', adet: 18 },
  { slug: 'machine-learning', ad: 'Machine Learning', adet: 26 },
  { slug: 'deep-learning', ad: 'Deep Learning', adet: 24 },
  { slug: 'generative-ai', ad: 'Generative AI', adet: 22 },
  { slug: 'large-language-models', ad: 'Large Language Models', adet: 31 },
  { slug: 'ai-agents', ad: 'AI Agents', adet: 19 },
  { slug: 'computer-vision', ad: 'Computer Vision', adet: 17 },
  { slug: 'nlp', ad: 'NLP', adet: 14 },
  { slug: 'robotics', ad: 'Robotics', adet: 12 },
  { slug: 'data-science', ad: 'Data Science', adet: 15 },
  { slug: 'ai-infrastructure', ad: 'AI Infrastructure', adet: 16 },
  { slug: 'mlops-llmops', ad: 'MLOps / LLMOps', adet: 13 },
  { slug: 'ai-security', ad: 'AI Security', adet: 11 },
  { slug: 'responsible-ai', ad: 'Responsible AI', adet: 14 },
];

/** Kategori slug'ından görünen ada. */
export const ATLAS_KATEGORI_ADI = new Map(ATLAS_KATEGORILERI.map((k) => [k.slug, k.ad]));

/** Görünen addan slug'a — dönüştürücülerin ve okuma katmanının ihtiyacı. */
export const ATLAS_KATEGORI_SLUGU = new Map(ATLAS_KATEGORILERI.map((k) => [k.ad, k.slug]));

/* --- KONU TAKMA ADLARI ---------------------------------------------------- */

/**
 * Konunun KOD İÇİNDEKİ kısa adından kalıcı slug'ına.
 *
 * Sayfalar konuya `KONULAR.agent` gibi kısa bir anahtarla atıfta bulunuyor.
 * Bu anahtarlar veri değil, kaynak kodun okunabilirliği içindir; konunun
 * kendisi `konular` koleksiyonunda `slug` ile durur. Eşleme burada tutulur ki
 * fixture silindiğinde `KONULAR.agent` yazan sayfalar kırılmasın.
 *
 * Bir konunun slug'ı DEĞİŞTİRİLİRSE buradaki karşılığı da değişir; slug
 * değişimi ayrıca `yonlendirmeler` koleksiyonuna 301 kaydı gerektirir (§46).
 */
export const KONU_ANAHTARLARI = {
  agent: 'ai-agent',
  llm: 'llm',
  rag: 'rag',
  robotik: 'robotik',
  guvenlik: 'ai-guvenlik',
  regulasyon: 'regulasyon',
  altyapi: 'ai-altyapi',
  mlops: 'mlops',
  gorus: 'computer-vision',
  isDunyasi: 'is-dunyasi',
  degerlendirme: 'degerlendirme',
} as const satisfies Record<string, string>;

export type KonuAnahtari = keyof typeof KONU_ANAHTARLARI;

/* --- ETİKET SÖZLÜKLERİ ---------------------------------------------------- */

/** Seviye kodundan görünen ada. */
export const SEVIYE_ADI: Record<string, string> = {
  baslangic: 'Başlangıç',
  orta: 'Orta',
  ileri: 'İleri',
};

/**
 * İçerik TÜRÜ kodundan görünen ada.
 *
 * Tür formattır, konu değil (MASTER-PLAN §9 — CLAUDE.md değişmez kural 7).
 */
export const TUR_ADI: Record<string, string> = {
  haber: 'Haber',
  analiz: 'Analiz',
  rehber: 'Rehber',
  atlas: 'Atlas',
  uygulama: 'Uygulama',
  arastirma: 'Araştırma',
  rapor: 'Rapor',
  benchmark: 'Benchmark',
  'veri-seti': 'Veri seti',
  arac: 'Araç',
  model: 'Model',
  karsilastirma: 'Karşılaştırma',
  vaka: 'Vaka çalışması',
  ders: 'Ders',
  'ogrenme-yolu': 'Öğrenme yolu',
  test: 'Test',
  dergi: 'Dergi',
  gorus: 'Görüş',
  roportaj: 'Röportaj',
  video: 'Video',
};

/* --- ARAÇ KATEGORİLERİ ----------------------------------------------------- */

/**
 * Araç kayıt defterinin kategori taksonomisi.
 *
 * BURADA DURUYOR, `lib/veri/*` içinde DEĞİL. Eski liste 12 İNGİLİZCE değer
 * taşıyordu ("AI Writing", "Coding", "Productivity") ve veriyle hiç
 * örtüşmüyordu: 56 aracın 50'sinin kategorisi o listede yoktu. Panelde alan
 * `tip: 'secim', zorunlu: true` olduğu için editör herhangi bir aracı açıp
 * kaydettiğinde kategori, seçicinin ilk değeriyle SESSİZCE değişiyordu —
 * yayındaki veriyi bozan bir yoldu ve kimse fark etmezdi.
 *
 * Liste artık verinin kendisinden türetilmiş, Türkçe ve tekil. Yeni bir
 * kategori gerektiğinde ÖNCE buraya eklenir; panel ve site filtresi aynı
 * kaynaktan beslenir.
 */
export const ARAC_KATEGORILERI: readonly string[] = [
  'Ajan çerçevesi',
  'Araştırma asistanı',
  'Değerlendirme',
  'Görsel üretimi',
  'Gözlemlenebilirlik',
  'İş akışı otomasyonu',
  'Kod asistanı',
  'Müşteri ve satış',
  'Ses ve müzik',
  'Sohbet arayüzü',
  'Toplantı ve not',
  'Veri işleme',
  'Vektör veritabanı',
  'Video üretimi',
  'Yazma asistanı',
  'Çıkarım ve sunum',
];
