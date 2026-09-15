import type { Analiz, BriefMaddesi, Icerik, RadarKaydi } from '@/lib/tipler';
import { KONULAR, YAZARLAR } from './temel';
import { HABER_GOVDELERI } from './govde/haber';
import { ANALIZ_GOVDELERI } from './govde/analiz';

/** ÖRNEK VERİ — yer tutucu. Bkz. `lib/veri/temel.ts` başlığı. */

/* --- GÜNDEM KATEGORİLERİ -------------------------------------------------- */

export const GUNDEM_KATEGORILERI = [
  {
    slug: 'yapay-zeka',
    ad: 'Yapay Zekâ',
    yol: '/gundem/yapay-zeka/',
    ozet: 'Genel yapay zekâ gelişmeleri, ürün duyuruları ve ekosistem hareketleri.',
  },
  {
    slug: 'llm',
    ad: 'Büyük Dil Modelleri',
    yol: '/gundem/llm/',
    ozet: 'Model sürümleri, bağlam penceresi, muhakeme ve değerlendirme tartışmaları.',
  },
  {
    slug: 'ai-agent',
    ad: "AI Agent'lar",
    yol: '/gundem/ai-agent/',
    ozet: 'Araç kullanımı, planlama, bellek ve çok ajanlı sistemler.',
  },
  {
    slug: 'robotik',
    ad: 'Robotik & Embodied AI',
    yol: '/gundem/robotik/',
    ozet: 'Humanoid robotlar, vision-language-action modelleri ve saha uygulamaları.',
  },
  {
    slug: 'arastirma',
    ad: 'Araştırmalar',
    yol: '/gundem/arastirma/',
    ozet: 'Yeni yayınlar, benchmark sonuçları ve akademik tartışmalar.',
  },
  {
    slug: 'startuplar',
    ad: 'Startuplar',
    yol: '/gundem/startuplar/',
    ozet: 'Girişim turları, ürün çıkışları ve pazar hareketleri.',
  },
  {
    slug: 'turkiye',
    ad: 'Türkiye',
    yol: '/gundem/turkiye/',
    ozet: 'Türkiye yapay zekâ ekosistemi: şirketler, politika, yetenek ve yatırım.',
  },
  {
    slug: 'regulasyon',
    ad: 'Regülasyon',
    yol: '/gundem/regulasyon/',
    ozet: 'Mevzuat, uyum yükümlülükleri ve denetim gelişmeleri.',
  },
  {
    slug: 'is-dunyasi',
    ad: 'AI Business',
    yol: '/gundem/is-dunyasi/',
    ozet: 'Kurumsal benimseme, maliyet, organizasyon ve iş modeli etkileri.',
  },
];

/* --- MANŞET --------------------------------------------------------------- */

export const MANSET: Icerik = {
  slug: 'agentic-ai-ikinci-perde',
  yol: '/haber/agentic-ai-ikinci-perde/',
  tur: 'analiz',
  baslik: 'Agentic AI yarışı ikinci perdesine giriyor: tool-use artık farkı belirliyor',
  kisaCevap:
    'Model seçiminde belirleyici ölçüt ham dil yeteneğinden, araç çağırma güvenilirliği ve uzun ufuklu planlama tutarlılığına kayıyor.',
  ozet: 'Son çeyrekte tanıtılan ajan mimarileri, tek bir istem yerine onlarca adımlık iş akışlarını hedefliyor. Bu, değerlendirme yöntemlerini de değiştiriyor: tek seferlik doğruluk yerine görev tamamlama oranı konuşuluyor.',
  konu: KONULAR.agent!,
  yazar: YAZARLAR.sukru!,
  yayinTarihi: '2026-09-11',
  okumaDakika: 9,
  oneCikan: true,
  etiketler: ['Agentic AI', 'Tool use', 'Değerlendirme'],
  govde: [
    {
      tip: 'kisa-cevap',
      metin:
        'Ajan sistemlerinde rekabet, dil kalitesinden yürütme güvenilirliğine kaydı: bir modelin onlarca adımlık iş akışını hatasız tamamlayabilmesi, tek bir cevabı güzel yazmasından daha belirleyici hale geldi.',
    },
    { tip: 'altbaslik', metin: 'Ne değişti?', kimlik: 'ne-degisti' },
    {
      tip: 'paragraf',
      metin:
        'İlk perde, modellerin tek bir istemle ne kadar iyi cevap üretebildiğiyle ilgiliydi. İkinci perdede soru farklı: model bir hedefi alıp plan kurabiliyor mu, doğru aracı doğru parametrelerle çağırabiliyor mu, ara sonuç beklenmedik geldiğinde kendini düzeltebiliyor mu?',
    },
    {
      tip: 'liste',
      ogeler: [
        'Araç çağırma güvenilirliği: şema uyumu, parametre doğruluğu, tekrar denemede kararlılık.',
        'Uzun ufuk tutarlılığı: onlarca adım sonra ilk hedefi koruma.',
        'Hata kurtarma: başarısız adımdan sonra yeni plan üretme.',
        'Maliyet profili: adım başına token ve gecikme.',
      ],
    },
    { tip: 'altbaslik', metin: 'Neden önemli?', kimlik: 'neden-onemli' },
    {
      tip: 'paragraf',
      metin:
        'Bu kayma, satın alma kararını da değiştiriyor. Bir kurum artık "hangi model daha akıllı" sorusunu değil, "hangi model bizim iş akışımızı kaç denemede tamamlıyor ve hata durumunda ne yapıyor" sorusunu soruyor. Değerlendirme, laboratuvar testinden operasyon ölçümüne dönüşüyor.',
    },
    {
      tip: 'uyari',
      ton: 'dikkat',
      metin:
        'Tek seferlik doğruluk ölçen benchmarklar, çok adımlı iş akışlarının davranışını temsil etmiyor. Kendi görev setinizi ölçmeden model değiştirmek riskli.',
    },
    { tip: 'altbaslik', metin: 'Teknik detay', kimlik: 'teknik-detay' },
    {
      tip: 'paragraf',
      metin:
        'Ajan mimarilerinde üç katman ayrışıyor: planlayıcı, araç katmanı ve bellek. Planlayıcı hedefi alt görevlere böler; araç katmanı dış sistemlerle konuşur; bellek önceki adımların sonucunu taşır. Zincirin en kırılgan halkası genellikle bellek yönetimi: bağlam büyüdükçe model erken adımlardaki kısıtları unutuyor.',
    },
    {
      tip: 'akis',
      adimlar: [
        { ad: 'Hedef', aciklama: 'Kullanıcı niyeti ve kısıtlar toplanır.' },
        { ad: 'Plan', aciklama: 'Hedef, doğrulanabilir alt görevlere bölünür.' },
        { ad: 'Araç', aciklama: 'Her alt görev için uygun araç şemayla çağrılır.' },
        { ad: 'Doğrulama', aciklama: 'Çıktı beklenen biçime ve içeriğe göre denetlenir.' },
        { ad: 'Düzeltme', aciklama: 'Hatalı adım yeniden planlanır, döngü kapanır.' },
      ],
    },
    { tip: 'altbaslik', metin: 'Kimleri etkiliyor?', kimlik: 'kimleri-etkiliyor' },
    {
      tip: 'liste',
      ogeler: [
        'Ürün ekipleri: ajan tabanlı akışlarda başarı ölçütü yeniden tanımlanmalı.',
        'Platform ekipleri: araç şemaları ve yetki sınırları kritik hale geliyor.',
        'Güvenlik ekipleri: araç kullanan ajanlarda dolaylı istem enjeksiyonu yeni bir yetki sorunu.',
      ],
    },
    { tip: 'altbaslik', metin: 'Sinaptik yorumu', kimlik: 'sinaptik-yorumu' },
    {
      tip: 'paragraf',
      metin:
        'Bu dönemin kazananı en büyük modeli yapan değil, en güvenilir yürütme katmanını kuran olacak. Kurumlar için pratik sonuç şu: model seçiminden önce kendi görev setini ve başarı tanımını yazmak gerekiyor. Ölçemediğiniz bir akışı iyileştiremezsiniz.',
    },
  ],
  kaynaklar: [
    {
      ad: 'Sinaptik Research — ajan değerlendirme notları',
      yayinci: 'Sinaptik Lab',
      tur: 'Teknik rapor',
    },
    {
      ad: 'Sağlayıcı araç kullanımı dokümantasyonları',
      yayinci: 'Model sağlayıcıları',
      tur: 'Dokümantasyon',
    },
  ],
  ilgiliSluglar: ['ai-agent', 'mcp', 'prompt-injection'],
};

/* --- HABER AKIŞI ---------------------------------------------------------- */

const HAM_GUNDEM: Icerik[] = [
  {
    slug: 'model-baglam-penceresi-yarisi',
    yol: '/haber/model-baglam-penceresi-yarisi/',
    tur: 'haber',
    baslik: 'Bağlam penceresi yarışı yavaşlıyor, dikkat maliyeti öne çıkıyor',
    kisaCevap:
      'Uzun bağlam artık tek başına ayırt edici değil; belleği yönetme ve geri getirme stratejileri tartışılıyor.',
    konu: KONULAR.llm!,
    yazar: YAZARLAR.redaksiyon!,
    yayinTarihi: '2026-09-11',
    okumaDakika: 4,
    etiketler: ['Context window', 'Bellek'],
    ilgiliSluglar: ['rag', 'embedding'],
  },
  {
    slug: 'humanoid-robot-saha-testleri',
    yol: '/haber/humanoid-robot-saha-testleri/',
    tur: 'haber',
    baslik: 'Humanoid robotlarda saha testi dönemi: depodan üretim hattına',
    kisaCevap:
      'Vision-Language-Action modelleri, kontrollü ortamlardan gerçek operasyonlara taşınmaya başlıyor.',
    konu: KONULAR.robotik!,
    yazar: YAZARLAR.redaksiyon!,
    yayinTarihi: '2026-09-10',
    okumaDakika: 5,
    etiketler: ['Embodied AI', 'VLA'],
  },
  {
    slug: 'ab-ai-act-uygulama-takvimi',
    yol: '/haber/ab-ai-act-uygulama-takvimi/',
    tur: 'haber',
    baslik: 'AB AI Act uygulama takvimi: yüksek riskli sistemlerde yeni eşik',
    kisaCevap:
      'Yüksek riskli kabul edilen kullanım senaryolarında dokümantasyon ve izlenebilirlik yükümlülükleri kademeli olarak yürürlüğe giriyor.',
    konu: KONULAR.regulasyon!,
    yazar: YAZARLAR.redaksiyon!,
    yayinTarihi: '2026-09-10',
    okumaDakika: 6,
    etiketler: ['AI Act', 'Uyum'],
  },
  {
    slug: 'prompt-injection-kurumsal-risk',
    yol: '/haber/prompt-injection-kurumsal-risk/',
    tur: 'haber',
    baslik: 'Ajan sistemlerinde prompt injection kurumsal risk listesine giriyor',
    kisaCevap:
      'Araç kullanabilen ajanlarda dolaylı istem enjeksiyonu, klasik içerik filtrelemesiyle çözülemeyen bir yetki sorunu olarak tanımlanıyor.',
    konu: KONULAR.guvenlik!,
    yazar: YAZARLAR.redaksiyon!,
    yayinTarihi: '2026-09-09',
    okumaDakika: 7,
    etiketler: ['Güvenlik', 'Agent'],
    ilgiliSluglar: ['prompt-injection', 'ai-agent'],
  },
  {
    slug: 'turkiye-ai-yatirim-turu',
    yol: '/haber/turkiye-ai-yatirim-turu/',
    tur: 'haber',
    baslik: 'Türkiye ekosisteminde AI altyapısına yönelen yatırım turu',
    kisaCevap:
      'Yerel girişimler uygulama katmanından çıkıp değerlendirme, gözlemlenebilirlik ve veri katmanına yöneliyor.',
    konu: KONULAR.isDunyasi!,
    yazar: YAZARLAR.redaksiyon!,
    yayinTarihi: '2026-09-09',
    okumaDakika: 4,
    etiketler: ['Türkiye', 'Yatırım'],
  },
  {
    slug: 'inference-maliyeti-dususu',
    yol: '/haber/inference-maliyeti-dususu/',
    tur: 'haber',
    baslik: 'Inference maliyetinde düşüş, mimari tercihlerini nasıl değiştiriyor?',
    kisaCevap:
      'Birim token maliyeti düştükçe, tek büyük model yerine çok adımlı ve doğrulamalı akışlar ekonomik olarak mümkün hale geliyor.',
    konu: KONULAR.altyapi!,
    yazar: YAZARLAR.redaksiyon!,
    yayinTarihi: '2026-09-08',
    okumaDakika: 5,
    etiketler: ['Maliyet', 'Altyapı'],
  },
  {
    slug: 'gorev-tamamlama-benchmark',
    yol: '/haber/gorev-tamamlama-benchmark/',
    tur: 'haber',
    baslik: 'Değerlendirmede yeni ölçüt: görev tamamlama oranı',
    kisaCevap:
      'Ajan değerlendirmesinde tek seferlik doğruluk yerine, çok adımlı görevin baştan sona tamamlanma oranı raporlanmaya başlıyor.',
    konu: KONULAR.degerlendirme!,
    yazar: YAZARLAR.arastirma!,
    yayinTarihi: '2026-09-07',
    okumaDakika: 6,
    etiketler: ['Evaluation', 'Benchmark'],
  },
  {
    slug: 'acik-agirlikli-modeller-kurumsal',
    yol: '/haber/acik-agirlikli-modeller-kurumsal/',
    tur: 'haber',
    baslik: 'Açık ağırlıklı modeller kurumsal tarafta neden hızlanıyor?',
    kisaCevap:
      'Veri ikametgâhı ve maliyet öngörülebilirliği, açık ağırlıklı modelleri düzenlenmiş sektörlerde öne çıkarıyor.',
    konu: KONULAR.isDunyasi!,
    yazar: YAZARLAR.redaksiyon!,
    yayinTarihi: '2026-09-06',
    okumaDakika: 5,
    etiketler: ['Açık kaynak', 'Kurumsal'],
  },
  {
    slug: 'vektor-arama-hibrit-varsayilan',
    yol: '/haber/vektor-arama-hibrit-varsayilan/',
    tur: 'haber',
    baslik: 'Vektör veritabanlarında hibrit arama varsayılan hale geliyor',
    kisaCevap:
      'Saf anlamsal arama kurumsal belge setlerinde kesin terim eşleşmelerini kaçırdığı için lexical katman geri dönüyor.',
    konu: KONULAR.rag!,
    yazar: YAZARLAR.redaksiyon!,
    yayinTarihi: '2026-09-05',
    okumaDakika: 4,
    etiketler: ['RAG', 'Arama'],
    ilgiliSluglar: ['vector-database', 'embedding'],
  },
  {
    slug: 'llmops-gozlemlenebilirlik',
    yol: '/haber/llmops-gozlemlenebilirlik/',
    tur: 'haber',
    baslik: "LLMOps'ta gözlemlenebilirlik, model seçiminin önüne geçiyor",
    kisaCevap:
      'Üretimdeki sorunların çoğu model kalitesinden değil, izlenemeyen istem ve araç zincirlerinden kaynaklanıyor.',
    konu: KONULAR.mlops!,
    yazar: YAZARLAR.redaksiyon!,
    yayinTarihi: '2026-09-04',
    okumaDakika: 6,
    etiketler: ['LLMOps', 'Observability'],
  },
  {
    slug: 'cok-modlu-belge-isleme',
    yol: '/haber/cok-modlu-belge-isleme/',
    tur: 'haber',
    baslik: 'Çok modlu belge işleme, klasik OCR hattını ne kadar değiştiriyor?',
    kisaCevap:
      'Görsel-dil modelleri tablo ve form anlamada güçlü; ancak denetimsiz kullanımda sessiz hata oranı artıyor.',
    konu: KONULAR.gorus!,
    yazar: YAZARLAR.redaksiyon!,
    yayinTarihi: '2026-09-03',
    okumaDakika: 5,
    etiketler: ['Computer Vision', 'OCR'],
  },
  {
    slug: 'model-secim-kriterleri-degisiyor',
    yol: '/haber/model-secim-kriterleri-degisiyor/',
    tur: 'haber',
    baslik: 'Kurumsal model seçim kriterleri: gecikme ve öngörülebilirlik öne çıktı',
    kisaCevap:
      'Kurumlar en yüksek skoru değil, kabul edilebilir kalitede en öngörülebilir gecikmeyi tercih ediyor.',
    konu: KONULAR.isDunyasi!,
    yazar: YAZARLAR.redaksiyon!,
    yayinTarihi: '2026-09-02',
    okumaDakika: 4,
    etiketler: ['Model seçimi'],
  },
];

/**
 * Gövdeler `lib/veri/govde/haber.ts` içinde tutulur ve burada metadata ile
 * birleştirilir. Üretimde bu birleştirmeyi MongoDB sorgusu yapacak.
 */
export const GUNDEM: Icerik[] = HAM_GUNDEM.map((icerik) => {
  const ek = HABER_GOVDELERI[icerik.slug];
  return ek ? { ...icerik, ...ek } : icerik;
});

export const TUM_GUNDEM: Icerik[] = [MANSET, ...GUNDEM];

export function gundemBul(slug: string) {
  return TUM_GUNDEM.find((icerik) => icerik.slug === slug);
}

export function konuyaGoreGundem(konuSlug: string) {
  return TUM_GUNDEM.filter((icerik) => icerik.konu.slug === konuSlug);
}

/* --- BRIEF ---------------------------------------------------------------- */

export const BRIEF: BriefMaddesi[] = [
  {
    numara: '01',
    baslik: 'Ajan değerlendirmesinde görev tamamlama oranı standartlaşıyor',
    neden: 'Tek seferlik doğruluk ölçümü, çok adımlı iş akışlarını temsil etmiyor.',
    kaynak: 'Sinaptik Research',
    konuSlug: 'ai-agent',
  },
  {
    numara: '02',
    baslik: 'Vektör veritabanlarında hibrit arama varsayılan hale geliyor',
    neden: 'Saf anlamsal arama, kurumsal belge setlerinde kesin terim eşleşmelerini kaçırıyor.',
    kaynak: 'Ürün dokümantasyonları',
    konuSlug: 'rag',
  },
  {
    numara: '03',
    baslik: 'AB tarafında yüksek riskli sistem dokümantasyonu netleşiyor',
    neden: 'Uyum yükü, model seçiminden çok süreç tasarımını etkiliyor.',
    kaynak: 'Resmî mevzuat metni',
    konuSlug: 'regulasyon',
  },
  {
    numara: '04',
    baslik: 'Türkçe değerlendirme setlerinde kapsama açığı sürüyor',
    neden: 'Genel benchmarklar Türkçe performansı güvenilir biçimde temsil etmiyor.',
    kaynak: 'Sinaptik Benchmark notları',
    konuSlug: 'llm',
  },
  {
    numara: '05',
    baslik: 'Robotikte veri toplama maliyeti, model kalitesinin önüne geçiyor',
    neden: 'Fiziksel dünyada örnek üretmek, parametre büyütmekten pahalı.',
    kaynak: 'Araştırma özetleri',
    konuSlug: 'robotik',
  },
];

/** Brief arşivi — her gün bir sayı. */
export const BRIEF_ARSIVI = [
  { tarih: '2026-09-11', baslik: 'Ajan değerlendirmesi ve hibrit arama günü', maddeSayisi: 5 },
  { tarih: '2026-09-10', baslik: 'Regülasyon takvimi ve humanoid saha testleri', maddeSayisi: 5 },
  { tarih: '2026-09-09', baslik: 'Güvenlik: ajanlarda yetki sınırı tartışması', maddeSayisi: 5 },
  { tarih: '2026-09-08', baslik: 'Inference maliyeti ve mimari tercihleri', maddeSayisi: 5 },
  { tarih: '2026-09-07', baslik: 'Görev tamamlama oranı yeni ölçüt', maddeSayisi: 5 },
];

/* --- RADAR ---------------------------------------------------------------- */

export const RADAR: RadarKaydi[] = [
  {
    slug: 'ai-agent',
    ad: 'AI Agents',
    momentum: 96,
    yon: 'yukselen',
    degisim: 12,
    sinyaller: { yayin: 94, github: 98, modelCikisi: 88, aramaIlgisi: 92 },
    not: 'Depo aktivitesi ve model çıkışları aynı yönde artıyor; ürünleşme eşiğine yakın.',
  },
  {
    slug: 'embodied-ai',
    ad: 'Embodied AI',
    momentum: 84,
    yon: 'yukselen',
    degisim: 9,
    sinyaller: { yayin: 86, github: 72, modelCikisi: 80, aramaIlgisi: 78 },
    not: 'Yayın tarafı güçlü, açık kaynak tarafı geride — veri toplama maliyeti darboğaz.',
  },
  {
    slug: 'degerlendirme',
    ad: 'Evaluation & Evals',
    momentum: 78,
    yon: 'yukselen',
    degisim: 15,
    sinyaller: { yayin: 74, github: 88, modelCikisi: 52, aramaIlgisi: 68 },
    not: 'En hızlı yükselen başlık; araç ekosistemi olgunlaşıyor.',
  },
  {
    slug: 'rag',
    ad: 'RAG',
    momentum: 71,
    yon: 'sabit',
    degisim: 1,
    sinyaller: { yayin: 68, github: 82, modelCikisi: 44, aramaIlgisi: 76 },
    not: 'Heyecan azaldı, kurumsal uygulama arttı — olgunlaşma işareti.',
  },
  {
    slug: 'reasoning',
    ad: 'Reasoning Modelleri',
    momentum: 69,
    yon: 'sabit',
    degisim: -2,
    sinyaller: { yayin: 78, github: 60, modelCikisi: 72, aramaIlgisi: 64 },
    not: 'Araştırma ilgisi sürüyor, ürün tarafı maliyetle sınırlı.',
  },
  {
    slug: 'fine-tuning',
    ad: 'Fine-Tuning',
    momentum: 46,
    yon: 'dusen',
    degisim: -8,
    sinyaller: { yayin: 48, github: 56, modelCikisi: 30, aramaIlgisi: 50 },
    not: 'Uzun bağlam ve geri getirme, çoğu senaryoda uyarlamanın yerini aldı.',
  },
  {
    slug: 'prompt-engineering',
    ad: 'Prompt Engineering',
    momentum: 34,
    yon: 'dusen',
    degisim: -11,
    sinyaller: { yayin: 30, github: 34, modelCikisi: 18, aramaIlgisi: 54 },
    not: 'Arama ilgisi hâlâ yüksek; yayın ve depo tarafı belirgin şekilde soğudu.',
  },
];

export function radarBul(slug: string) {
  return RADAR.find((kayit) => kayit.slug === slug);
}

/* --- DERİN ANALİZLER ------------------------------------------------------ */

const HAM_ANALIZLER: Analiz[] = [
  {
    slug: 'ajanlar-yazilim-dunyasini-nasil-degistiriyor',
    baslik: "AI Agent'lar yazılım dünyasını neden değiştiriyor?",
    girizgah:
      'Kod yazan değil, iş akışını yürüten sistemler; yazılım ekiplerinin sorumluluk sınırlarını yeniden çiziyor.',
    konu: 'Agentic AI',
    okumaDakika: 14,
    yazarSlug: 'sukru-yusuf-kaya',
    tarih: '2026-09-08',
  },
  {
    slug: 'llm-doneminden-agentic-doneme',
    baslik: 'LLM döneminden agentic döneme: değerlendirme nasıl değişiyor?',
    girizgah:
      'Tek seferlik doğruluk ölçümü bitiyor; görev tamamlama, geri dönüş maliyeti ve hata kurtarma konuşuluyor.',
    konu: 'Değerlendirme',
    okumaDakika: 11,
    yazarSlug: 'sinaptik-research',
    tarih: '2026-09-04',
  },
  {
    slug: 'embodied-ai-fiziksel-dunyaya-gecis',
    baslik: 'Embodied AI: yapay zekânın fiziksel dünyaya geçişi',
    girizgah:
      'Dil modelleri veriyi ucuz buldu; robotik bulamıyor. Asıl darboğaz parametre değil, örnek toplama.',
    konu: 'Robotik',
    okumaDakika: 12,
    yazarSlug: 'sukru-yusuf-kaya',
    tarih: '2026-08-29',
  },
  {
    slug: 'kurumsal-ai-neden-pocta-kaliyor',
    baslik: "Kurumsal yapay zekâ neden PoC'ta kalıyor?",
    girizgah:
      'Sorun model kalitesi değil; başarı tanımının, veri sahipliğinin ve operasyon sorumluluğunun yazılmamış olması.',
    konu: 'AI Business',
    okumaDakika: 10,
    yazarSlug: 'sukru-yusuf-kaya',
    tarih: '2026-08-21',
  },
  {
    slug: 'turkce-icin-degerlendirme-acigi',
    baslik: 'Türkçe için değerlendirme açığı neden kapanmıyor?',
    girizgah:
      'Genel benchmarklar Türkçeyi temsil etmiyor; açık metodolojili yerel setler olmadan model seçimi tahmine dayanıyor.',
    konu: 'Değerlendirme',
    okumaDakika: 9,
    yazarSlug: 'sinaptik-research',
    tarih: '2026-08-14',
  },
  {
    slug: 'ajan-guvenliginde-yetki-tasarimi',
    baslik: 'Ajan güvenliğinde asıl mesele yetki tasarımı',
    girizgah:
      'Dolaylı istem enjeksiyonu bir metin filtreleme sorunu değil; ajanın neye erişebildiğiyle ilgili bir mimari karar.',
    konu: 'AI Güvenliği',
    okumaDakika: 13,
    yazarSlug: 'sukru-yusuf-kaya',
    tarih: '2026-08-07',
  },
];

export const ANALIZLER: Analiz[] = HAM_ANALIZLER.map((analiz) => {
  const ek = ANALIZ_GOVDELERI[analiz.slug];
  return ek ? { ...analiz, ...ek } : analiz;
});

export function analizBul(slug: string) {
  return ANALIZLER.find((analiz) => analiz.slug === slug);
}
