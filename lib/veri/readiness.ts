/**
 * AI Readiness değerlendirme soru seti (MASTER-PLAN §103).
 *
 * Her boyut, gözlemlenebilir ifadelerle ölçülür: "stratejiniz var mı?" gibi
 * yoruma açık sorular yerine "yazılı mı, sahibi kim, bütçesi var mı" gibi
 * doğrulanabilir ifadeler kullanılır.
 */

export type OlgunlukSeviyesi = {
  ad: string;
  altSinir: number;
  aralik: string;
  tarif: string;
  renk: string;
};

export type ReadinessIfadesi = {
  kimlik: string;
  metin: string;
  /** Bu ifade zayıfsa önerilecek ilk adım. */
  oneri: string;
};

export type ReadinessBoyutu = {
  slug: string;
  ad: string;
  agirlik: number;
  tarif: string;
  ifadeler: ReadinessIfadesi[];
};

export const CEVAP_SECENEKLERI = [
  { deger: 0, ad: 'Hayır', tarif: 'Henüz yok' },
  { deger: 1, ad: 'Kısmen', tarif: 'Başlanmış ama eksik' },
  { deger: 2, ad: 'Büyük ölçüde', tarif: 'Var, yaygınlaşmamış' },
  { deger: 3, ad: 'Evet', tarif: 'Kurumsallaşmış' },
] as const;

export const READINESS_BOYUTLARI_TAM: ReadinessBoyutu[] = [
  {
    slug: 'strateji',
    ad: 'Strateji',
    agirlik: 1.2,
    tarif: 'Yazılı hedef, sahiplik, bütçe ve iş sonucuna bağlanma.',
    ifadeler: [
      {
        kimlik: 'str_1',
        metin: 'Yapay zekâ hedeflerimiz yazılı ve iş hedeflerine bağlı.',
        oneri: 'Kullanım senaryolarını iş sonucuna bağlayan bir strateji notu yazın.',
      },
      {
        kimlik: 'str_2',
        metin: 'Her girişimin adı belli bir sahibi ve ayrılmış bütçesi var.',
        oneri: 'Her senaryoya isim bazında sahip ve bütçe atayın; sahibi olmayan pilot kapatılır.',
      },
      {
        kimlik: 'str_3',
        metin: 'Pilotların üretime geçiş kriterleri baştan tanımlanıyor.',
        oneri: 'PoC başlamadan önce üretime geçiş eşiğini yazılı hale getirin.',
      },
    ],
  },
  {
    slug: 'veri',
    ad: 'Veri',
    agirlik: 1.2,
    tarif: 'Erişilebilirlik, kalite, sahiplik ve kataloglama olgunluğu.',
    ifadeler: [
      {
        kimlik: 'ver_1',
        metin: 'İhtiyaç duyulan veriye makul sürede ve izinli biçimde erişilebiliyor.',
        oneri: 'Kritik senaryolar için veri erişim matrisi çıkarın ve onay sürelerini ölçün.',
      },
      {
        kimlik: 'ver_2',
        metin: 'Veri kalitesi düzenli olarak ölçülüyor ve sahipleri belli.',
        oneri: 'Kritik veri kümeleri için kalite kontrolleri ve veri sahibi atayın.',
      },
      {
        kimlik: 'ver_3',
        metin: 'Belgeler ve kurumsal bilgi aranabilir biçimde kataloglanmış.',
        oneri: 'Belge envanteri ve erişim etiketleriyle başlayın; RAG bunun üzerine kurulur.',
      },
    ],
  },
  {
    slug: 'altyapi',
    ad: 'Altyapı',
    agirlik: 1,
    tarif: 'Hesaplama, dağıtım, entegrasyon ve gözlemlenebilirlik kapasitesi.',
    ifadeler: [
      {
        kimlik: 'alt_1',
        metin: 'Yeni bir servisi üretime almak için standart bir dağıtım hattımız var.',
        oneri: 'Model servislerini de kapsayan standart bir dağıtım hattı kurun.',
      },
      {
        kimlik: 'alt_2',
        metin: 'Model çağrılarının maliyeti ve gecikmesi izlenebiliyor.',
        oneri: 'İstem, araç çağrısı ve maliyet izlemesini ilk günden devreye alın.',
      },
      {
        kimlik: 'alt_3',
        metin: 'Kurumsal sistemlerle entegrasyon için API katmanımız hazır.',
        oneri: 'Ajanların kullanacağı araçları şemalı API olarak standartlaştırın.',
      },
    ],
  },
  {
    slug: 'yetenek',
    ad: 'Yetenek',
    agirlik: 1.1,
    tarif: 'İç yetkinlik, işe alma kapasitesi ve eğitim.',
    ifadeler: [
      {
        kimlik: 'yet_1',
        metin: 'Ekibimizde yapay zekâ uygulaması geliştirebilen kişiler var.',
        oneri: 'Mevcut yazılım ekibine hedefli bir rota ile yetkinlik kazandırın.',
      },
      {
        kimlik: 'yet_2',
        metin: 'Karar vericiler yapay zekâ kısıtlarını ve risklerini biliyor.',
        oneri: 'Yöneticiler için kısa ve senaryo odaklı bir brifing programı kurun.',
      },
      {
        kimlik: 'yet_3',
        metin: 'Yeni araçların kullanımı için düzenli iç eğitim veriliyor.',
        oneri: 'Rol bazlı eğitim takvimi oluşturun; tek seferlik eğitim yerleşmez.',
      },
    ],
  },
  {
    slug: 'yonetisim',
    ad: 'Yönetişim',
    agirlik: 1.2,
    tarif: 'Envanter, risk sınıflandırması, politika ve denetim.',
    ifadeler: [
      {
        kimlik: 'yon_1',
        metin: 'Hangi birimde hangi yapay zekâ aracının kullanıldığını biliyoruz.',
        oneri: 'Kullanım ve model envanteri çıkarın — yönetişim buradan başlar.',
      },
      {
        kimlik: 'yon_2',
        metin: 'Kullanım senaryoları risk seviyesine göre sınıflandırılıyor.',
        oneri: 'Risk tabanlı bir sınıflandırma tablosu kurun; yükümlülüğü kullanıma bağlayın.',
      },
      {
        kimlik: 'yon_3',
        metin: 'Yazılı bir yapay zekâ kullanım politikamız var ve çalışanlar biliyor.',
        oneri: 'Kısa, uygulanabilir bir kullanım politikası yazıp duyurun.',
      },
    ],
  },
  {
    slug: 'senaryolar',
    ad: 'Kullanım senaryoları',
    agirlik: 1,
    tarif: 'Portföyün önceliklendirilmiş ve ölçülebilir olması.',
    ifadeler: [
      {
        kimlik: 'sen_1',
        metin: 'Senaryo portföyümüz etki ve uygulanabilirlik eksenlerinde önceliklendirilmiş.',
        oneri: 'Senaryoları etki/uygulanabilirlik matrisine yerleştirip ilk üçü seçin.',
      },
      {
        kimlik: 'sen_2',
        metin: 'Her senaryonun ölçülebilir bir başarı tanımı var.',
        oneri: 'Her senaryo için tek cümlelik, sayısal bir başarı tanımı yazın.',
      },
      {
        kimlik: 'sen_3',
        metin: 'En az bir senaryo üretimde çalışıyor ve ölçülüyor.',
        oneri: 'En yüksek getirili senaryoda küçük kapsamlı bir üretim kurulumu hedefleyin.',
      },
    ],
  },
  {
    slug: 'guvenlik',
    ad: 'Güvenlik',
    agirlik: 1.3,
    tarif: 'Yetkilendirme, veri koruma, denetim kaydı ve test pratiği.',
    ifadeler: [
      {
        kimlik: 'guv_1',
        metin: 'Yapay zekâ sistemlerinin veri erişimi en az yetki ilkesine göre sınırlı.',
        oneri: 'Araç ve veri erişimini görev bazında daraltın; oturum boyu geniş yetki vermeyin.',
      },
      {
        kimlik: 'guv_2',
        metin: 'Geri döndürülemez işlemler insan onayı arkasında.',
        oneri: 'Ödeme, silme ve gönderim işlemlerine zorunlu onay adımı ekleyin.',
      },
      {
        kimlik: 'guv_3',
        metin: 'İstem enjeksiyonu ve veri sızıntısı senaryoları düzenli test ediliyor.',
        oneri: 'Enjeksiyon senaryolarını regresyon testinin parçası haline getirin.',
      },
      {
        kimlik: 'guv_4',
        metin: 'Her model çağrısı denetim kaydına yazılıyor.',
        oneri: 'Adım, araç ve parametre düzeyinde değişmez denetim kaydı kurun.',
      },
    ],
  },
];

export const OLGUNLUK_SEVIYELERI: OlgunlukSeviyesi[] = [
  {
    ad: 'Exploring',
    altSinir: 0,
    aralik: '0–39',
    tarif: 'Dağınık denemeler var, yazılı strateji ve envanter yok.',
    renk: 'bg-metin-soluk',
  },
  {
    ad: 'Experimenting',
    altSinir: 40,
    aralik: '40–59',
    tarif: 'Pilotlar çalışıyor ama üretime geçiş ve ölçüm zayıf.',
    renk: 'bg-uyari',
  },
  {
    ad: 'Operating',
    altSinir: 60,
    aralik: '60–79',
    tarif: 'Üretimde sistemler var; ölçüm ve yönetişim kurulma aşamasında.',
    renk: 'bg-vurgu',
  },
  {
    ad: 'Scaling',
    altSinir: 80,
    aralik: '80–100',
    tarif: 'Ölçüm, yönetişim ve güvenlik kurumsallaşmış; ölçeklendirme aşaması.',
    renk: 'bg-sinyal',
  },
];

/** Boyut zayıflığına göre önerilecek hizmet sayfası. */
export const BOYUT_HIZMET_ESLEMESI: Record<string, { ad: string; yol: string }> = {
  strateji: { ad: 'AI Stratejisi & Dönüşüm', yol: '/kurumsal/yapay-zeka-stratejisi/' },
  veri: { ad: 'Kurumsal RAG Sistemleri', yol: '/kurumsal/rag/' },
  altyapi: { ad: 'MLOps / LLMOps', yol: '/kurumsal/mlops/' },
  yetenek: { ad: 'Kurumsal Eğitim', yol: '/kurumsal/egitim/' },
  yonetisim: { ad: 'AI Governance', yol: '/kurumsal/ai-governance/' },
  senaryolar: { ad: 'AI Stratejisi & Dönüşüm', yol: '/kurumsal/yapay-zeka-stratejisi/' },
  guvenlik: { ad: 'AI Agent & Otomasyon', yol: '/kurumsal/ai-agent/' },
};
