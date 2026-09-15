import type { Ders, OgrenmeYolu, Test } from '@/lib/tipler';
import * as SORU from './sorular';
import { DERS_GOVDELERI } from './govde/ders';

/** ÖRNEK VERİ — yer tutucu. Bkz. `lib/veri/temel.ts` başlığı. */

/* --- ÖĞRENME YOLLARI ----------------------------------------------------- */

export const OGRENME_YOLLARI: OgrenmeYolu[] = [
  {
    slug: 'yapay-zekaya-baslangic',
    ad: 'Yapay Zekâya Başlangıç',
    rol: 'Herkes',
    seviyeAraligi: '0 → Temel',
    bolum: 8,
    saat: 12,
    aciklama: 'Teknik geçmiş gerektirmeden yapay zekânın çalışma mantığını kuran giriş rotası.',
    cikti: ['Temel kavramlar', 'Model türleri', 'Sorumlu kullanım'],
    kimeGore: 'Alana yeni giren herkes; kod yazmayı gerektirmez.',
    bolumler: [
      {
        ad: 'Yapay zekâ nedir?',
        ozet: 'Kural tabanlı sistemlerden öğrenen sistemlere geçiş.',
        sure: '1 sa',
        kavramlar: ['Artificial Intelligence'],
      },
      {
        ad: 'Makine öğrenmesinin mantığı',
        ozet: 'Veriden örüntü çıkarma ve genelleme.',
        sure: '1,5 sa',
        kavramlar: ['Machine Learning'],
      },
      {
        ad: 'Sinir ağları sezgisi',
        ozet: 'Katman, ağırlık ve öğrenme döngüsü.',
        sure: '1,5 sa',
        kavramlar: ['Neural Networks'],
      },
      {
        ad: 'Üretken yapay zekâ',
        ozet: 'Neden birden bire her şey değişti?',
        sure: '1,5 sa',
        kavramlar: ['Generative AI'],
      },
      {
        ad: 'Dil modelleri nasıl çalışır?',
        ozet: 'Token, olasılık ve bağlam.',
        sure: '2 sa',
        kavramlar: ['Tokenization', 'Context Window'],
      },
      {
        ad: 'Sınırlar ve hatalar',
        ozet: 'Halüsinasyon, yanlılık ve güven.',
        sure: '1,5 sa',
        kavramlar: ['Hallucination'],
      },
      {
        ad: 'Günlük işte kullanım',
        ozet: 'İyi istem yazmanın pratik kuralları.',
        sure: '1,5 sa',
        kavramlar: ['Prompt Engineering'],
      },
      {
        ad: 'Sorumlu kullanım',
        ozet: 'Gizlilik, telif ve kurumsal politika.',
        sure: '1,5 sa',
        kavramlar: ['Responsible AI'],
      },
    ],
  },
  {
    slug: 'generative-ai-engineer',
    ad: 'Generative AI Engineer',
    rol: 'Yazılımcı',
    seviyeAraligi: 'Orta → İleri',
    bolum: 13,
    saat: 46,
    aciklama:
      'Transformer temelinden RAG, fine-tuning, değerlendirme ve LLMOps’a uzanan uçtan uca mühendislik rotası.',
    cikti: ['RAG sistemi', 'Değerlendirme hattı', 'Üretime alma'],
    onkosullar: ['Python', 'Temel makine öğrenmesi'],
    kimeGore: 'Üretime kod gönderen yazılım mühendisleri.',
    bolumler: [
      {
        ad: 'AI Fundamentals',
        ozet: 'Alanın haritası ve terminoloji.',
        sure: '2 sa',
        kavramlar: ['Artificial Intelligence'],
      },
      {
        ad: 'Machine Learning Basics',
        ozet: 'Denetimli öğrenme ve değerlendirme metrikleri.',
        sure: '4 sa',
        kavramlar: ['Machine Learning'],
      },
      {
        ad: 'Deep Learning',
        ozet: 'Geri yayılım ve eğitim dinamikleri.',
        sure: '4 sa',
        kavramlar: ['Neural Networks'],
      },
      {
        ad: 'Transformers',
        ozet: 'Dikkat mekanizması ve mimari.',
        sure: '4 sa',
        kavramlar: ['Transformer'],
      },
      {
        ad: 'LLM Fundamentals',
        ozet: 'Token, örnekleme, bağlam bütçesi.',
        sure: '3 sa',
        kavramlar: ['Tokenization', 'Context Window'],
      },
      {
        ad: 'Prompt Engineering',
        ozet: 'Yapılandırılmış çıktı ve kısıt tasarımı.',
        sure: '3 sa',
        kavramlar: ['Prompt Engineering'],
      },
      {
        ad: 'Embeddings',
        ozet: 'Anlamsal temsil ve benzerlik.',
        sure: '3 sa',
        kavramlar: ['Embedding'],
      },
      {
        ad: 'Vector Databases',
        ozet: 'Dizinleme, filtreleme, hibrit arama.',
        sure: '3 sa',
        kavramlar: ['Vector Database'],
      },
      {
        ad: 'RAG',
        ozet: 'Parçalama, geri getirme, yeniden sıralama.',
        sure: '5 sa',
        kavramlar: ['RAG', 'Reranking'],
      },
      {
        ad: 'Fine-Tuning',
        ozet: 'Ne zaman gerekir, ne zaman gerekmez.',
        sure: '4 sa',
        kavramlar: ['Fine-Tuning'],
      },
      {
        ad: 'Evaluation',
        ozet: 'Görev seti, otomatik ve insan değerlendirmesi.',
        sure: '4 sa',
        kavramlar: ['Evaluation'],
      },
      {
        ad: 'AI Agents',
        ozet: 'Araç kullanımı, planlama, hata kurtarma.',
        sure: '4 sa',
        kavramlar: ['AI Agent', 'MCP'],
      },
      {
        ad: 'LLMOps',
        ozet: 'Gözlemlenebilirlik, maliyet, sürüm yönetimi.',
        sure: '3 sa',
        kavramlar: ['Evaluation'],
      },
    ],
  },
  {
    slug: 'ai-agent-developer',
    ad: 'AI Agent Developer',
    rol: 'Yazılımcı',
    seviyeAraligi: 'Orta → İleri',
    bolum: 11,
    saat: 38,
    aciklama: 'Araç kullanımı, bellek, planlama ve çok ajanlı sistemler üzerine kurulu rota.',
    cikti: ['Tool-use ajanı', 'Bellek tasarımı', 'Güvenlik sınırları'],
    onkosullar: ['Prompt Engineering', 'API geliştirme'],
    bolumler: [
      {
        ad: 'Ajan nedir?',
        ozet: 'Sohbet botundan ayıran döngü.',
        sure: '2 sa',
        kavramlar: ['AI Agent'],
      },
      {
        ad: 'Function calling',
        ozet: 'Şema tasarımı ve parametre doğrulama.',
        sure: '4 sa',
        kavramlar: ['Tool Use'],
      },
      {
        ad: 'MCP',
        ozet: 'Araç ve kaynakları protokolle sunmak.',
        sure: '3 sa',
        kavramlar: ['MCP'],
      },
      {
        ad: 'Planlama',
        ozet: 'Hedefi doğrulanabilir adımlara bölmek.',
        sure: '4 sa',
        kavramlar: ['Planning'],
      },
      {
        ad: 'Bellek',
        ozet: 'Kısa ve uzun vadeli bellek stratejileri.',
        sure: '4 sa',
        kavramlar: ['Memory'],
      },
      {
        ad: 'Hata kurtarma',
        ozet: 'Başarısız adımdan sonra yeniden planlama.',
        sure: '3 sa',
        kavramlar: ['AI Agent'],
      },
      {
        ad: 'Çok ajanlı sistemler',
        ozet: 'Ne zaman bölmeli, ne zaman bölmemeli.',
        sure: '4 sa',
        kavramlar: ['Multi-agent'],
      },
      {
        ad: 'Güvenlik',
        ozet: 'Yetki tasarımı ve istem enjeksiyonu.',
        sure: '4 sa',
        kavramlar: ['Prompt Injection'],
      },
      {
        ad: 'Değerlendirme',
        ozet: 'Görev tamamlama oranı ölçümü.',
        sure: '4 sa',
        kavramlar: ['Evaluation'],
      },
      {
        ad: 'Maliyet ve gecikme',
        ozet: 'Adım başına bütçe yönetimi.',
        sure: '3 sa',
        kavramlar: ['Context Window'],
      },
      {
        ad: 'Üretime alma',
        ozet: 'Gözlemlenebilirlik ve insan onayı.',
        sure: '3 sa',
        kavramlar: ['Evaluation'],
      },
    ],
  },
  {
    slug: 'machine-learning-engineer',
    ad: 'Machine Learning Engineer',
    rol: 'Veri bilimci',
    seviyeAraligi: 'Başlangıç → İleri',
    bolum: 14,
    saat: 52,
    aciklama: 'Klasik ML’den model dağıtımına kadar üretim odaklı mühendislik rotası.',
    cikti: ['Özellik mühendisliği', 'Model dağıtımı', 'İzleme'],
    onkosullar: ['Python', 'İstatistik'],
    bolumler: [
      {
        ad: 'Problem çerçeveleme',
        ozet: 'Hangi iş sorusu makine öğrenmesi problemine çevrilir, hangisi çevrilmez.',
        sure: '3 sa',
        kavramlar: ['Machine Learning'],
      },
      {
        ad: 'Veri toplama ve sızıntı',
        ozet: 'Etiket sızıntısı, zaman kaçağı ve örnekleme yanlılığı.',
        sure: '4 sa',
        kavramlar: ['Machine Learning'],
      },
      {
        ad: 'Keşifsel analiz',
        ozet: 'Dağılım, aykırı değer ve eksik veri stratejileri.',
        sure: '3 sa',
        kavramlar: ['Machine Learning'],
      },
      {
        ad: 'Özellik mühendisliği',
        ozet: 'Kodlama, ölçekleme, etkileşim terimleri ve özellik deposu.',
        sure: '5 sa',
        kavramlar: ['Machine Learning'],
      },
      {
        ad: 'Doğrusal ve ağaç tabanlı modeller',
        ozet: 'Regresyon, karar ağacı, rastgele orman ve gradyan artırma.',
        sure: '5 sa',
        kavramlar: ['Machine Learning'],
      },
      {
        ad: 'Doğrulama tasarımı',
        ozet: 'Çapraz doğrulama, zaman serisi ayrımı ve grup sızıntısı.',
        sure: '4 sa',
        kavramlar: ['Machine Learning'],
      },
      {
        ad: 'Metrik seçimi',
        ozet: 'Eşik, dengesiz sınıf, maliyet duyarlı ölçüm ve iş metriğine bağlama.',
        sure: '3 sa',
        kavramlar: ['Evaluation'],
      },
      {
        ad: 'Yorumlanabilirlik',
        ozet: 'Özellik önemi, kısmi bağımlılık ve yerel açıklamalar.',
        sure: '3 sa',
        kavramlar: ['Machine Learning'],
      },
      {
        ad: 'Derin öğrenmeye geçiş',
        ozet: 'Ne zaman gerekli, ne zaman fazla; tablo verisinde gerçek durum.',
        sure: '4 sa',
        kavramlar: ['Deep Learning', 'Neural Networks'],
      },
      {
        ad: 'Model paketleme',
        ozet: 'Sürümleme, bağımlılık dondurma ve tekrarlanabilir eğitim.',
        sure: '3 sa',
        kavramlar: ['MLOps'],
      },
      {
        ad: 'Servis etme',
        ozet: 'Toplu, çevrimiçi ve akış çıkarım desenleri; gecikme bütçesi.',
        sure: '5 sa',
        kavramlar: ['MLOps'],
      },
      {
        ad: 'İzleme ve sürüklenme',
        ozet: 'Veri sürüklenmesi, kavram sürüklenmesi ve alarm tasarımı.',
        sure: '4 sa',
        kavramlar: ['MLOps'],
      },
      {
        ad: 'Yeniden eğitim hattı',
        ozet: 'Tetikleyiciler, gölge dağıtım ve geri alma planı.',
        sure: '4 sa',
        kavramlar: ['MLOps'],
      },
      {
        ad: 'Vaka: uçtan uca proje',
        ozet: 'Bir tahmin problemini veriden izlemeye kadar tek başına kurmak.',
        sure: '6 sa',
        kavramlar: ['MLOps', 'Evaluation'],
      },
    ],
  },
  {
    slug: 'computer-vision-engineer',
    ad: 'Computer Vision Engineer',
    rol: 'Yazılımcı',
    seviyeAraligi: 'Başlangıç → İleri',
    bolum: 10,
    saat: 34,
    aciklama: 'Sınıflandırmadan segmentasyona ve görsel transformer’lara uzanan görü rotası.',
    cikti: ['Nesne tespiti', 'Segmentasyon', 'Kenar dağıtımı'],
    onkosullar: ['Python', 'Deep Learning'],
    bolumler: [
      {
        ad: 'Görüntü verisinin doğası',
        ozet: 'Piksel, renk uzayı, çözünürlük ve önişleme.',
        sure: '3 sa',
        kavramlar: ['Computer Vision'],
      },
      {
        ad: 'Evrişimli ağlar',
        ozet: 'Filtre, havuzlama, alıcı alan ve mimari aileleri.',
        sure: '4 sa',
        kavramlar: ['Deep Learning'],
      },
      {
        ad: 'Sınıflandırma hattı',
        ozet: 'Veri artırma, transfer öğrenme ve ince ayar.',
        sure: '4 sa',
        kavramlar: ['Computer Vision', 'Fine-Tuning'],
      },
      {
        ad: 'Nesne tespiti',
        ozet: 'Çapa tabanlı ve çapasız yaklaşımlar; IoU ve mAP.',
        sure: '4 sa',
        kavramlar: ['Computer Vision'],
      },
      {
        ad: 'Segmentasyon',
        ozet: 'Anlamsal, örnek ve panoptik segmentasyon farkları.',
        sure: '4 sa',
        kavramlar: ['Computer Vision'],
      },
      {
        ad: 'Görsel transformerlar',
        ozet: 'Yama gömme, dikkat ve evrişimle karşılaştırma.',
        sure: '4 sa',
        kavramlar: ['Transformer'],
      },
      {
        ad: 'Çok modlu modeller',
        ozet: 'Görüntü-metin eşlemesi ve sıfır örnekli sınıflandırma.',
        sure: '3 sa',
        kavramlar: ['Multimodal AI'],
      },
      {
        ad: 'Etiketleme ve veri kalitesi',
        ozet: 'Etiket rehberi, anlaşma ölçümü ve aktif öğrenme.',
        sure: '3 sa',
        kavramlar: ['Computer Vision'],
      },
      {
        ad: 'Kenarda çalıştırma',
        ozet: 'Nicemleme, budama ve gerçek zamanlı çıkarım bütçesi.',
        sure: '3 sa',
        kavramlar: ['MLOps'],
      },
      {
        ad: 'Vaka: kalite kontrol sistemi',
        ozet: 'Hat üstü görsel denetim kurulumunu uçtan uca tasarlamak.',
        sure: '2 sa',
        kavramlar: ['Computer Vision', 'MLOps'],
      },
    ],
  },
  {
    slug: 'ai-product-manager',
    ad: 'AI Product Manager',
    rol: 'Ürün',
    seviyeAraligi: 'Temel → İleri',
    bolum: 9,
    saat: 20,
    aciklama: 'Yapay zekâ ürünlerinde kapsam, değerlendirme ve risk yönetimi rotası.',
    cikti: ['Değerlendirme planı', 'Risk matrisi', 'Yol haritası'],
    kimeGore: 'Yapay zekâ özelliği sahiplenen ürün yöneticileri.',
    bolumler: [
      {
        ad: 'Yapay zekâ ürününde farklı olan ne?',
        ozet: 'Olasılıksal çıktı, belirsiz kapsam ve yeni hata sınıfları.',
        sure: '2 sa',
        kavramlar: ['Artificial Intelligence'],
      },
      {
        ad: 'Kullanım senaryosu seçimi',
        ozet: 'Değer, uygulanabilirlik ve risk üçgeninde önceliklendirme.',
        sure: '2,5 sa',
        kavramlar: ['Artificial Intelligence'],
      },
      {
        ad: 'Başarı tanımı yazmak',
        ozet: 'İş metriği, model metriği ve kabul eşiği ilişkisi.',
        sure: '2,5 sa',
        kavramlar: ['Evaluation'],
      },
      {
        ad: 'Değerlendirme planı',
        ozet: 'Görev seti kurmak, kapalı küme ayırmak ve sürüm kararı vermek.',
        sure: '3 sa',
        kavramlar: ['Evaluation'],
      },
      {
        ad: 'Hata deneyimi tasarımı',
        ozet: 'Belirsizliği arayüzde göstermek, geri alma ve onay akışları.',
        sure: '2,5 sa',
        kavramlar: ['Responsible AI'],
      },
      {
        ad: 'Maliyet ve gecikme dengesi',
        ozet: 'Token ekonomisi, kuyruk gecikmesi ve kullanıcı algısı.',
        sure: '2 sa',
        kavramlar: ['Context Window'],
      },
      {
        ad: 'Risk ve uyum',
        ozet: 'Risk matrisi, insan gözetimi ve dokümantasyon yükümlülükleri.',
        sure: '2,5 sa',
        kavramlar: ['Responsible AI'],
      },
      {
        ad: 'Veri ve gizlilik kararları',
        ozet: 'Hangi veri nerede işlenir, saklama ve maskeleme politikası.',
        sure: '2 sa',
        kavramlar: ['Responsible AI'],
      },
      {
        ad: 'Yol haritası ve iletişim',
        ozet: 'Belirsizliği yönetilebilir kilometre taşlarına bölmek.',
        sure: '1 sa',
        kavramlar: ['Artificial Intelligence'],
      },
    ],
  },
  {
    slug: 'yoneticiler-icin-yapay-zeka',
    ad: 'Yöneticiler İçin Yapay Zekâ',
    rol: 'Yönetici',
    seviyeAraligi: 'Teknik olmayan',
    bolum: 6,
    saat: 8,
    aciklama: 'Karar vericiler için yatırım, yönetişim ve organizasyon tasarımı rotası.',
    cikti: ['AI stratejisi', 'Yönetişim', 'Kullanım senaryosu seçimi'],
    kimeGore: 'Teknik olmayan üst ve orta düzey yöneticiler.',
    bolumler: [
      {
        ad: 'Yapay zekâ gerçekten ne yapar?',
        ozet: 'Abartıdan arındırılmış yetenek ve sınır haritası.',
        sure: '1,5 sa',
        kavramlar: ['Artificial Intelligence', 'Generative AI'],
      },
      {
        ad: 'Nerede değer üretir?',
        ozet: 'Maliyet, hız, kalite ve kapasite eksenlerinde somut örnekler.',
        sure: '1,5 sa',
        kavramlar: ['Artificial Intelligence'],
      },
      {
        ad: 'Yatırım kararı',
        ozet: 'Yapmak, satın almak, ortaklık: karar çerçevesi ve toplam maliyet.',
        sure: '1,5 sa',
        kavramlar: ['Artificial Intelligence'],
      },
      {
        ad: 'Yönetişim kurmak',
        ozet: 'Politika, onay mercii, risk sınıflandırması ve envanter.',
        sure: '1,5 sa',
        kavramlar: ['Responsible AI'],
      },
      {
        ad: 'Organizasyon tasarımı',
        ozet: 'Merkezî ekip mi dağıtık sahiplik mi; yetenek ve teşvik tasarımı.',
        sure: '1 sa',
        kavramlar: ['Artificial Intelligence'],
      },
      {
        ad: 'İlk 90 gün planı',
        ozet: 'Hazırlık değerlendirmesi, iki pilot ve ölçüm zemini.',
        sure: '1 sa',
        kavramlar: ['Artificial Intelligence'],
      },
    ],
  },
];

export function yolBul(slug: string) {
  return OGRENME_YOLLARI.find((yol) => yol.slug === slug);
}

export const ROLLER = [
  'Öğrenci',
  'Yazılımcı',
  'Veri bilimci',
  'Yönetici',
  'Girişimci',
  'Pazarlamacı',
];
export const HEDEFLER = [
  'Yapay zekâ öğrenmek',
  'Yapay zekâ uygulaması geliştirmek',
  'LLM geliştirmek',
  'AI Agent geliştirmek',
  'İşimde yapay zekâ kullanmak',
];

/* --- DERSLER -------------------------------------------------------------- */

const HAM_DERSLER: Ders[] = [
  {
    slug: 'token-nedir',
    ad: 'Token nedir ve neden önemli?',
    yolSlug: 'generative-ai-engineer',
    seviye: 'baslangic',
    dakika: 18,
    ozet: 'Metnin modele giren en küçük birimi ve maliyet üzerindeki etkisi.',
  },
  {
    slug: 'embedding-sezgisi',
    ad: 'Embedding sezgisi',
    yolSlug: 'generative-ai-engineer',
    seviye: 'baslangic',
    dakika: 22,
    ozet: 'Anlamı koordinat sistemine taşımak ne demek?',
  },
  {
    slug: 'parcalama-stratejileri',
    ad: 'Parçalama stratejileri',
    yolSlug: 'generative-ai-engineer',
    seviye: 'orta',
    dakika: 28,
    ozet: 'Belge yapısına göre parça uzunluğu ve örtüşme seçimi.',
  },
  {
    slug: 'hibrit-arama',
    ad: 'Hibrit arama kurmak',
    yolSlug: 'generative-ai-engineer',
    seviye: 'orta',
    dakika: 32,
    ozet: 'Anlamsal ve lexical aramayı birleştirme.',
  },
  {
    slug: 'arac-semasi-tasarimi',
    ad: 'Araç şeması tasarımı',
    yolSlug: 'ai-agent-developer',
    seviye: 'orta',
    dakika: 26,
    ozet: 'Modelin doğru parametre üretmesini kolaylaştıran şemalar.',
  },
  {
    slug: 'gorev-seti-kurmak',
    ad: 'Kendi görev setinizi kurmak',
    yolSlug: 'ai-agent-developer',
    seviye: 'ileri',
    dakika: 35,
    ozet: 'Üretim kalitesini ölçen değerlendirme hattının ilk adımı.',
  },
  {
    slug: 'yetki-tasarimi',
    ad: 'Ajanlarda yetki tasarımı',
    yolSlug: 'ai-agent-developer',
    seviye: 'ileri',
    dakika: 30,
    ozet: 'En az yetki ilkesini ajan mimarisine uygulamak.',
  },
  {
    slug: 'ai-kullanim-senaryosu-secimi',
    ad: 'Kullanım senaryosu seçimi',
    yolSlug: 'yoneticiler-icin-yapay-zeka',
    seviye: 'baslangic',
    dakika: 20,
    ozet: 'Etki ve uygulanabilirlik matrisiyle önceliklendirme.',
  },
];

/**
 * Ders gövdeleri `lib/veri/govde/ders.ts` içinde tutulur ve burada metadata ile
 * birleştirilir.
 */
export const DERSLER: Ders[] = HAM_DERSLER.map((ders) => {
  const ek = DERS_GOVDELERI[ders.slug];
  return ek ? { ...ders, ...ek } : ders;
});

export function dersBul(slug: string) {
  return DERSLER.find((ders) => ders.slug === slug);
}

/* --- TESTLER -------------------------------------------------------------- */

export const TESTLER: Test[] = [
  {
    slug: 'ai-temelleri-testi',
    ad: 'AI Temelleri Testi',
    konu: 'Artificial Intelligence',
    soruSayisi: SORU.AI_TEMELLERI.length,
    dakika: 8,
    seviye: 'baslangic',
    ozet: 'Yapay zekâ, makine öğrenmesi ve üretken yapay zekâ arasındaki ilişkiyi, model türlerini ve sorumlu kullanımı ölçen giriş testi.',
    olculenBeceriler: ['Kavram ayrımı', 'Model türleri', 'Sorumlu kullanım', 'Risk değerlendirme'],
    kimlerCozmeli: 'Alana yeni başlayan herkes; teknik geçmiş gerektirmez.',
    ogrenmeHedefleri: [
      'Temel kavramları doğru ve birbirinden ayırarak kullanmak',
      'Bir göreve hangi model türünün uygun olduğunu seçmek',
      'Model çıktısına ne zaman güvenilmeyeceğini bilmek',
    ],
    ornekSorular: SORU.AI_TEMELLERI,
  },
  {
    slug: 'machine-learning-testi',
    ad: 'Machine Learning Testi',
    konu: 'Machine Learning',
    soruSayisi: SORU.MACHINE_LEARNING.length,
    dakika: 12,
    seviye: 'orta',
    ozet: 'Genelleme, metrik seçimi, veri sızıntısı, doğrulama tasarımı ve özellik mühendisliğini ölçen test.',
    olculenBeceriler: ['Genelleme', 'Metrik seçimi', 'Deney tasarımı', 'Özellik mühendisliği'],
    kimlerCozmeli: 'Veri bilimi ve makine öğrenmesi mühendisliğiyle uğraşanlar.',
    ogrenmeHedefleri: [
      'Aşırı uyumu ve veri sızıntısını işaretlerinden tanımak',
      'Dengesiz sınıflarda doğru metriği seçmek',
      'Zaman serisinde doğru doğrulama kurmak',
    ],
    ornekSorular: SORU.MACHINE_LEARNING,
  },
  {
    slug: 'deep-learning-testi',
    ad: 'Deep Learning Testi',
    konu: 'Deep Learning',
    soruSayisi: SORU.DEEP_LEARNING.length,
    dakika: 12,
    seviye: 'ileri',
    ozet: 'Eğitim dinamikleri, düzenlileştirme, normalizasyon, transfer öğrenme ve dikkat mekanizmasının maliyetini ölçen test.',
    olculenBeceriler: ['Eğitim dinamikleri', 'Düzenlileştirme', 'Mimari', 'Teşhis'],
    kimlerCozmeli: 'Derin öğrenme modeli eğiten veya ince ayar yapan mühendisler.',
    ogrenmeHedefleri: [
      'Eğitim sırasındaki tipik arızaları teşhis etmek',
      'Normalizasyon ve düzenlileştirme seçimini gerekçelendirmek',
      'Dikkat mekanizmasının maliyet profilini bilmek',
    ],
    ornekSorular: SORU.DEEP_LEARNING,
  },
  {
    slug: 'generative-ai-testi',
    ad: 'Generative AI Testi',
    konu: 'Generative AI',
    soruSayisi: SORU.GENERATIVE_AI.length,
    dakika: 9,
    seviye: 'baslangic',
    ozet: 'Üretken modellerin türleri, örnekleme davranışı, yapılandırılmış çıktı ve sınırlarını ölçen test.',
    olculenBeceriler: ['Model türleri', 'Kısıt tasarımı', 'Kullanım alanı eşleştirme', 'Ölçüm'],
    kimlerCozmeli: 'Üretken yapay zekâyı işine katmak isteyen herkes.',
    ogrenmeHedefleri: [
      'Göreve uygun üretken model türünü seçmek',
      'Örnekleme ayarlarının çıktıya etkisini bilmek',
      'Üretken modelin kötü aday olduğu işleri tanımak',
    ],
    ornekSorular: SORU.GENERATIVE_AI,
  },
  {
    slug: 'llm-testi',
    ad: 'LLM Testi',
    konu: 'Large Language Models',
    soruSayisi: SORU.LLM.length,
    dakika: 12,
    seviye: 'orta',
    ozet: 'Tokenization, bağlam bütçesi, mimari tercihleri, uyarlama kararları ve muhakeme maliyetini ölçen test.',
    olculenBeceriler: ['Tokenization', 'Bağlam yönetimi', 'Mimari kararı', 'Retrieval'],
    kimlerCozmeli: 'Dil modeliyle uygulama geliştiren mühendisler ve teknik ürün yöneticileri.',
    ogrenmeHedefleri: [
      'Bağlam bütçesini bilinçli yönetmek',
      'RAG ile ince ayar arasında doğru seçimi yapmak',
      'Türkçede token maliyetinin farkını hesaba katmak',
    ],
    ornekSorular: SORU.LLM,
  },
  {
    slug: 'prompt-engineering-testi',
    ad: 'Prompt Engineering Testi',
    konu: 'Large Language Models',
    soruSayisi: SORU.PROMPT_ENGINEERING.length,
    dakika: 9,
    seviye: 'baslangic',
    ozet: 'Ölçülebilir kısıt yazma, örnekle öğretim, hata ayıklama ve istem güvenliğini ölçen test.',
    olculenBeceriler: ['Kısıt tasarımı', 'İstem tasarımı', 'Ölçüm', 'Yetkilendirme'],
    kimlerCozmeli: 'Günlük işinde dil modeli kullanan herkes.',
    ogrenmeHedefleri: [
      'Belirsiz istemi ölçülebilir hale getirmek',
      'Biçim sorunlarını şema kısıtıyla çözmek',
      'İstem değişikliğini ölçümle doğrulamak',
    ],
    ornekSorular: SORU.PROMPT_ENGINEERING,
  },
  {
    slug: 'rag-testi',
    ad: 'RAG Testi',
    konu: 'RAG',
    soruSayisi: SORU.RAG.length,
    dakika: 12,
    seviye: 'orta',
    ozet: 'Geri getirme hattının tasarımı, parçalama kararları, hibrit arama, erişim denetimi ve RAG ile fine-tuning ayrımını ölçen test.',
    olculenBeceriler: ['Retrieval', 'Parçalama', 'Mimari kararı', 'Yetkilendirme'],
    kimlerCozmeli:
      'Kurumsal belge üzerinde soru-cevap sistemi kuran veya kurmayı planlayan mühendisler ve ürün yöneticileri.',
    ogrenmeHedefleri: [
      'Geri getirme kalitesini üretim kalitesinden ayırt etmek',
      'RAG ile fine-tuning arasında doğru seçimi yapmak',
      'Hibrit aramanın hangi durumda gerekli olduğunu bilmek',
      'Erişim denetimini doğru katmanda kurmak',
    ],
    ornekSorular: SORU.RAG,
  },
  {
    slug: 'ai-agent-testi',
    ad: 'AI Agent Testi',
    konu: 'AI Agents',
    soruSayisi: SORU.AI_AGENT.length,
    dakika: 12,
    seviye: 'orta',
    ozet: 'Araç şeması tasarımı, bellek stratejisi, hata kurtarma, çok ajanlı mimari kararı ve yetki sınırlarını ölçen test.',
    olculenBeceriler: ['Araç şeması', 'Planlama', 'Bellek tasarımı', 'Yetkilendirme', 'Ölçüm'],
    kimlerCozmeli: 'Ajan tabanlı sistem geliştiren veya değerlendiren ekipler.',
    ogrenmeHedefleri: [
      'Ajan döngüsünün kırılma noktalarını tanımak',
      'Yetki tasarımını güvenlik önlemi olarak kurmak',
      'Görev tamamlama oranını ölçüt olarak kullanmak',
      'Çok ajanlı mimariye ne zaman geçilmeyeceğini bilmek',
    ],
    ornekSorular: SORU.AI_AGENT,
  },
  {
    slug: 'computer-vision-testi',
    ad: 'Computer Vision Testi',
    konu: 'Computer Vision',
    soruSayisi: SORU.COMPUTER_VISION.length,
    dakika: 10,
    seviye: 'orta',
    ozet: 'Görev türleri, metrik seçimi, saha kayması, etiketleme stratejisi ve gizlilik tasarımını ölçen test.',
    olculenBeceriler: ['Görü mimarileri', 'Metrikler', 'Etiketleme stratejisi', 'Dağıtım'],
    kimlerCozmeli: 'Görü projelerinde çalışan mühendisler ve saha operasyon sahipleri.',
    ogrenmeHedefleri: [
      'Göreve uygun metriği seçmek',
      'Saha kaymasının nedenlerini tanımak',
      'Etiketleme bütçesini aktif öğrenmeyle yönetmek',
    ],
    ornekSorular: SORU.COMPUTER_VISION,
  },
  {
    slug: 'degerlendirme-testi',
    ad: 'Değerlendirme Testi',
    konu: 'MLOps / LLMOps',
    soruSayisi: SORU.DEGERLENDIRME.length,
    dakika: 10,
    seviye: 'orta',
    ozet: 'Görev seti kurma, kısmi başarı puanlama, LLM yargıcı yanlılığı, regresyon ve benchmark okuryazarlığını ölçen test.',
    olculenBeceriler: ['Ölçüm tasarımı', 'Regresyon', 'İzleme', 'Ölçüm okuryazarlığı'],
    kimlerCozmeli: 'Üretimde dil modeli çalıştıran her ekip.',
    ogrenmeHedefleri: [
      'Kendi görev setini gerçek kullanımdan kurmak',
      'Kısmi başarıyı puanlayan bir ölçüm tasarlamak',
      'Bir benchmark sonucunu kullanılabilir olup olmadığına göre değerlendirmek',
    ],
    ornekSorular: SORU.DEGERLENDIRME,
  },
  {
    slug: 'ai-guvenligi-testi',
    ad: 'AI Güvenliği Testi',
    konu: 'AI Security',
    soruSayisi: SORU.AI_GUVENLIGI.length,
    dakika: 11,
    seviye: 'ileri',
    ozet: 'İstem enjeksiyonu, veri sızıntısı, en az yetki, güvenli entegrasyon, denetlenebilirlik ve kırmızı takım pratiğini ölçen test.',
    olculenBeceriler: ['Tehdit modelleme', 'Yetkilendirme', 'Veri koruma', 'Denetlenebilirlik'],
    kimlerCozmeli: 'Güvenlik ve platform ekipleri; ajan mimarisi kuran mühendisler.',
    ogrenmeHedefleri: [
      'Ajan mimarisinde saldırı yüzeyini haritalamak',
      'Model çıktısını güvenilmeyen girdi olarak ele almak',
      'Olay sonrası soruşturmayı mümkün kılan kaydı tanımlamak',
    ],
    ornekSorular: SORU.AI_GUVENLIGI,
  },
  {
    slug: 'ai-etigi-testi',
    ad: 'AI Etiği Testi',
    konu: 'Responsible AI',
    soruSayisi: SORU.AI_ETIGI.length,
    dakika: 10,
    seviye: 'baslangic',
    ozet: 'Yanlılık kaynakları, şeffaflık, yönetişim, açıklanabilirlik, insan denetimi ve risk tabanlı düzenlemeyi ölçen test.',
    olculenBeceriler: ['Yanlılık tespiti', 'Şeffaflık', 'Yönetişim', 'Açıklanabilirlik'],
    kimlerCozmeli: 'Yapay zekâ projesi yürüten veya onaylayan herkes.',
    ogrenmeHedefleri: [
      'Yanlılığın veri kaynaklı olduğunu tanımak',
      'Yönetişimin envanterle başladığını bilmek',
      'Anlamlı insan denetiminin koşullarını tanımlamak',
    ],
    ornekSorular: SORU.AI_ETIGI,
  },
];

export function testBul(slug: string) {
  return TESTLER.find((test) => test.slug === slug);
}

/* --- SEVİYE TESTİ --------------------------------------------------------- */

export const SEVIYE_BASAMAKLARI = [
  {
    ad: 'AI Curious',
    aralik: '0–35',
    altSinir: 0,
    tarif: 'Kavramları duymuş, henüz haritası yok.',
    renk: 'bg-metin-soluk',
  },
  {
    ad: 'AI Explorer',
    aralik: '36–60',
    altSinir: 36,
    tarif: 'Temelleri biliyor, uygulamada boşluklar var.',
    renk: 'bg-ikincil',
  },
  {
    ad: 'AI Practitioner',
    aralik: '61–80',
    altSinir: 61,
    tarif: 'Uygulama kurabiliyor, değerlendirme eksik.',
    renk: 'bg-vurgu',
  },
  {
    ad: 'AI Builder',
    aralik: '81–100',
    altSinir: 81,
    tarif: 'Üretim sistemi kurabiliyor ve ölçebiliyor.',
    renk: 'bg-sinyal',
  },
];

/**
 * Test sonucuna göre önerilecek öğrenme yolu — TEST BAZINDA.
 *
 * Bu tablo elle kürelenmiştir ve yalnızca ilk 12 testi kapsar. Banka 100 teste
 * çıkınca eksik kalan 88 test için `KUME_ONERILERI` devreye girer; sıralama
 * "önce test bazında, yoksa kümesi" biçimindedir. Test bazında bir satır
 * yazmak KÜME ÖNERİSİNİ EZER — belirli bir test için daha iyi bir rota
 * biliniyorsa buraya yazılır.
 */
export const TEST_ONERILERI: Record<string, string> = {
  'ai-temelleri-testi': 'yapay-zekaya-baslangic',
  'generative-ai-testi': 'yapay-zekaya-baslangic',
  'prompt-engineering-testi': 'yapay-zekaya-baslangic',
  'ai-etigi-testi': 'yoneticiler-icin-yapay-zeka',
  'llm-testi': 'generative-ai-engineer',
  'rag-testi': 'generative-ai-engineer',
  'degerlendirme-testi': 'generative-ai-engineer',
  'ai-agent-testi': 'ai-agent-developer',
  'ai-guvenligi-testi': 'ai-agent-developer',
  'machine-learning-testi': 'machine-learning-engineer',
  'deep-learning-testi': 'machine-learning-engineer',
  'computer-vision-testi': 'computer-vision-engineer',
};

export const SEVIYE_TESTI_SORULARI = SORU.SEVIYE_SORULARI;

export const SEVIYE_TESTI_ALANLARI = [
  'Temel kavramlar ve model türleri',
  'Üretken yapay zekâ ve LLM çalışma mantığı',
  'RAG, ajanlar ve araç kullanımı',
  'Değerlendirme, güvenlik ve sorumlu kullanım',
];

/**
 * Konu KÜMESİNE göre önerilecek öğrenme yolu — yedek eşleme.
 *
 * NEDEN KÜME DÜZEYİNDE: yayında 7 rota var, 55 konu. Konu başına rota
 * uydurmak, olmayan bir eşleşmeyi varmış gibi göstermek olurdu; küme düzeyinde
 * öneri ise savunulabilir bir yakınlık ifade eder ("Agentic AI kümesindeki bir
 * testten sonra AI Agent Developer rotası"). Karşılığı olmayan küme için
 * öneri BASILMAZ — sayfa bölümü hiç görünmez, uydurma rota gösterilmez.
 *
 * Anahtarlar `konular.kume` değerleridir; yeni bir küme eklenirse buraya da
 * satır gerekir (yoksa o kümenin testleri rota önerisi göstermez).
 */
export const KUME_ONERILERI: Record<string, string> = {
  Foundations: 'yapay-zekaya-baslangic',
  'Generative AI': 'generative-ai-engineer',
  'Agentic AI': 'ai-agent-developer',
  Operations: 'generative-ai-engineer',
  Infrastructure: 'machine-learning-engineer',
  Perception: 'computer-vision-engineer',
  Robotics: 'computer-vision-engineer',
  'Responsible AI': 'yoneticiler-icin-yapay-zeka',
  Enterprise: 'ai-product-manager',
  'Applied AI': 'ai-product-manager',
};
