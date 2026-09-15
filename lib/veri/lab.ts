import type { LabProjesi, Meslek } from '@/lib/tipler';

/** ÖRNEK VERİ — yer tutucu. Bkz. `lib/veri/temel.ts` başlığı. */

export const LAB_PROJELERI: LabProjesi[] = [
  {
    slug: 'token-hesaplayici',
    ad: 'Token Hesaplayıcı',
    tur: 'Araç',
    ozet: 'Metnin token karşılığını ve tahmini maliyetini anında hesaplar.',
    durum: 'yayinda',
    girdiler: [
      { etiket: 'Metin', birim: 'karakter' },
      { etiket: 'Birim fiyat', birim: '1M token' },
    ],
  },
  {
    slug: 'llm-maliyet-hesaplayici',
    ad: 'LLM Maliyet Hesaplayıcı',
    tur: 'Araç',
    ozet: 'Trafik hacmine göre aylık çıkarım maliyetini modelleyen hesaplayıcı.',
    durum: 'yayinda',
    girdiler: [
      { etiket: 'Günlük istek', birim: 'adet' },
      { etiket: 'Girdi uzunluğu', birim: 'token' },
      { etiket: 'Çıktı uzunluğu', birim: 'token' },
    ],
  },
  {
    slug: 'rag-chunk-hesaplayici',
    ad: 'RAG Chunk Hesaplayıcı',
    tur: 'Araç',
    ozet: 'Doküman boyutuna göre parça uzunluğu ve örtüşme önerisi üretir.',
    durum: 'yayinda',
    girdiler: [
      { etiket: 'Doküman', birim: 'sayfa' },
      { etiket: 'Parça uzunluğu', birim: 'token' },
    ],
  },
  {
    slug: 'gpu-bellek-hesaplayici',
    ad: 'GPU Bellek Hesaplayıcı',
    tur: 'Araç',
    ozet: 'Model boyutu ve niceleme seçimine göre gereken bellek tahmini.',
    durum: 'yayinda',
    girdiler: [
      { etiket: 'Parametre', birim: 'milyar' },
      { etiket: 'Niceleme', birim: 'bit' },
    ],
  },
  {
    slug: 'baglam-penceresi-hesaplayici',
    ad: 'Bağlam Penceresi Hesaplayıcı',
    tur: 'Araç',
    ozet: 'İstem, bağlam ve cevabın bağlam bütçesini nasıl paylaştığını gösterir.',
    durum: 'yayinda',
    girdiler: [
      { etiket: 'Pencere', birim: 'token' },
      { etiket: 'Sistem istemi', birim: 'token' },
      { etiket: 'Geri getirilen bağlam', birim: 'token' },
    ],
  },
  {
    slug: 'ai-roi-hesaplayici',
    ad: 'AI ROI Hesaplayıcı',
    tur: 'Araç',
    ozet: 'Süre tasarrufu ve hata azaltma üzerinden yatırım geri dönüşü tahmini.',
    durum: 'yayinda',
    girdiler: [
      { etiket: 'Etkilenen çalışan', birim: 'kişi' },
      { etiket: 'Haftalık tasarruf', birim: 'saat' },
      { etiket: 'Benimseme oranı', birim: '%' },
    ],
  },
  {
    slug: 'model-secici',
    ad: 'Model Seçici',
    tur: 'Deney',
    ozet: 'Kullanım senaryosu ve kısıtlara göre model kısa listesi önerir.',
    durum: 'yayinda',
    girdiler: [
      { etiket: 'Senaryo', birim: 'seçim' },
      { etiket: 'Barındırma kısıtı', birim: 'seçim' },
      { etiket: 'Öncelik', birim: 'seçim' },
    ],
  },
  {
    slug: 'embedding-gorsellestirici',
    ad: 'Embedding Görselleştirici',
    tur: 'Deney',
    ozet: 'Vektör uzayındaki anlamsal komşulukları iki boyuta indirger.',
    durum: 'gelistiriliyor',
  },
  {
    slug: 'prompt-tokenizer',
    ad: 'Prompt Tokenizer',
    tur: 'Açık Kaynak',
    ozet: 'Türkçe metinlerde token dağılımını gösteren açık kaynak araç.',
    durum: 'gelistiriliyor',
  },
  {
    slug: 'playground',
    ad: 'Sinaptik Playground',
    tur: 'Demo',
    ozet: 'İstem, bağlam ve örnekleme ayarlarının çıktıya etkisini yan yana deneme alanı.',
    durum: 'gelistiriliyor',
  },
  {
    slug: 'ornekler',
    ad: 'Kod Örnekleri',
    tur: 'Açık Kaynak',
    ozet: 'Rehberlerde geçen mimarilerin çalışan minimal kod örnekleri.',
    durum: 'gelistiriliyor',
  },
];

export function labBul(slug: string) {
  return LAB_PROJELERI.find((proje) => proje.slug === slug);
}

export const HESAPLAYICILAR = LAB_PROJELERI.filter((proje) => proje.tur === 'Araç');

/* --- KARİYER -------------------------------------------------------------- */

export const MESLEKLER: Meslek[] = [
  {
    slug: 'ai-engineer',
    ad: 'AI Engineer',
    ozet: 'Dil modeli ve geri getirme sistemlerini üretime alan, değerlendirme hattını kuran mühendis.',
    neYapar: [
      'RAG ve ajan akışlarını tasarlar ve üretime alır',
      'Değerlendirme setleri kurar, regresyon testlerini yürütür',
      'Maliyet ve gecikme bütçesini yönetir',
    ],
    beceriler: ['Python', 'İstem tasarımı', 'Geri getirme', 'Değerlendirme', 'Gözlemlenebilirlik'],
    teknolojiler: ['Vektör veritabanı', 'Sağlayıcı SDK’ları', 'Değerlendirme araçları'],
    yolSlug: 'generative-ai-engineer',
    testSlug: 'rag-testi',
  },
  {
    slug: 'ml-engineer',
    ad: 'Machine Learning Engineer',
    ozet: 'Tahmin modellerini veri hattından üretim izlemesine kadar sahiplenen mühendis.',
    neYapar: [
      'Veri hattı ve özellik mühendisliği kurar',
      'Model eğitir, dağıtır ve izler',
      'Kayma ve performans düşüşünü tespit eder',
    ],
    beceriler: ['Python', 'İstatistik', 'Özellik mühendisliği', 'MLOps'],
    teknolojiler: ['Eğitim çerçeveleri', 'Özellik deposu', 'İzleme araçları'],
    yolSlug: 'machine-learning-engineer',
    testSlug: 'machine-learning-testi',
  },
  {
    slug: 'ai-agent-developer',
    ad: 'AI Agent Developer',
    ozet: 'Araç kullanan, planlayan ve hata kurtaran ajan sistemleri geliştiren mühendis.',
    neYapar: [
      'Araç şemaları tasarlar',
      'Planlama ve bellek stratejisi kurar',
      'Yetki sınırlarını ve onay adımlarını tanımlar',
    ],
    beceriler: ['API tasarımı', 'Şema doğrulama', 'Güvenlik', 'Değerlendirme'],
    teknolojiler: ['MCP', 'Ajan çerçeveleri', 'Gözlemlenebilirlik'],
    yolSlug: 'ai-agent-developer',
    testSlug: 'ai-agent-testi',
  },
  {
    slug: 'ai-product-manager',
    ad: 'AI Product Manager',
    ozet: 'Yapay zekâ özelliklerinin kapsamını, başarı tanımını ve risklerini sahiplenen ürün yöneticisi.',
    neYapar: [
      'Başarı tanımını ve değerlendirme planını yazar',
      'Risk ve yönetişim gereksinimlerini yönetir',
      'Teknik kısıtları yol haritasına çevirir',
    ],
    beceriler: ['Ürün keşfi', 'Değerlendirme okuryazarlığı', 'Risk yönetimi'],
    teknolojiler: ['Analitik araçlar', 'Değerlendirme panoları'],
    yolSlug: 'ai-product-manager',
  },
  {
    slug: 'computer-vision-engineer',
    ad: 'Computer Vision Engineer',
    ozet: 'Görsel veriden operasyonel sinyal üreten modelleri kuran ve sahaya alan mühendis.',
    neYapar: [
      'Veri toplama ve etiketleme süreçlerini tasarlar',
      'Tespit ve segmentasyon modelleri eğitir',
      'Kenar cihaz dağıtımını yönetir',
    ],
    beceriler: ['Python', 'Derin öğrenme', 'Etiketleme stratejisi', 'Kenar dağıtımı'],
    teknolojiler: ['Görü kütüphaneleri', 'Kenar çıkarım motorları'],
    yolSlug: 'computer-vision-engineer',
    testSlug: 'computer-vision-testi',
  },
  {
    slug: 'mlops-engineer',
    ad: 'MLOps Engineer',
    ozet: 'Model ve istem zincirlerinin sürüm, izleme ve maliyet yönetimini kuran mühendis.',
    neYapar: [
      'Gözlemlenebilirlik ve kayıt altyapısı kurar',
      'Değerlendirme hattını otomatikleştirir',
      'Sürüm ve geri alma süreçlerini işletir',
    ],
    beceriler: ['Altyapı', 'CI/CD', 'İzleme', 'Maliyet yönetimi'],
    teknolojiler: ['Konteyner orkestrasyonu', 'İzleme yığını', 'Model kayıt defteri'],
  },
  {
    slug: 'data-engineer',
    ad: 'Data Engineer',
    ozet: 'Yapay zekâ sistemlerini besleyen veri hatlarını ve kalite kontrollerini kuran mühendis.',
    neYapar: [
      'Veri hatlarını tasarlar ve işletir',
      'Veri kalitesi kontrollerini kurar',
      'Erişim denetimini ve kataloglamayı yönetir',
    ],
    beceriler: ['SQL', 'Veri modelleme', 'Akış işleme', 'Veri yönetişimi'],
    teknolojiler: ['Veri ambarı', 'Akış platformları', 'Katalog araçları'],
  },
];

export function meslekBul(slug: string) {
  return MESLEKLER.find((meslek) => meslek.slug === slug);
}
