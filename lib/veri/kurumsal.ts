import type { Hizmet, SektorKaydi, VakaCalismasi } from '@/lib/tipler';

/** ÖRNEK VERİ — yer tutucu. Bkz. `lib/veri/temel.ts` başlığı. */

/* --- HİZMETLER ------------------------------------------------------------ */

export const HIZMETLER: Hizmet[] = [
  {
    slug: 'yapay-zeka-stratejisi',
    ad: 'AI Stratejisi & Dönüşüm',
    ozet: 'Kullanım senaryosu portföyü, önceliklendirme ve uygulama yol haritası.',
    problem:
      'Yapay zekâ girişimleri birbirinden kopuk pilotlar halinde yürüyor; hangisinin iş sonucuna bağlandığı belirsiz.',
    cozum:
      'Kullanım senaryolarını etki ve uygulanabilirlik eksenlerinde haritalayıp, ölçülebilir başarı tanımlarıyla bir portföy ve yol haritası kuruyoruz.',
    kullanimAlanlari: [
      'Kullanım senaryosu envanteri ve önceliklendirme',
      'Yatırım ve organizasyon tasarımı',
      'Yetkinlik açığı analizi',
      'Yol haritası ve yönetişim modeli',
    ],
    mimari: ['Mevcut durum analizi', 'Senaryo portföyü', 'Başarı tanımları', 'Yol haritası'],
    sss: [
      {
        soru: 'Teknik ekibimiz yoksa nereden başlamalıyız?',
        cevap:
          'Önce iş sonucuna en yakın bir senaryoda küçük ve ölçülebilir bir PoC kurulur; kalıcı ekip yapısı bu deneyimden sonra tasarlanır.',
      },
    ],
  },
  {
    slug: 'rag',
    ad: 'Kurumsal RAG Sistemleri',
    ozet: 'Dağınık kurumsal bilgiyi erişim denetimli, kaynak gösteren bir cevap katmanına bağlama.',
    problem: 'Şirket bilgisi farklı sistemlerde dağınık; çalışan doğru belgeyi bulamıyor.',
    cozum:
      'Kurumsal bilgi kaynaklarını erişim denetimi korunarak dil modeline bağlıyoruz; her cevap dayandığı belgeye referans verir.',
    kullanimAlanlari: [
      'Teknik destek ve çağrı merkezi',
      'Bakım ve saha operasyonları',
      'Hukuk ve uyum',
      'İnsan kaynakları',
      'Satış ve teklif hazırlama',
      'Finans ve raporlama',
    ],
    mimari: [
      'Belge kaynakları',
      'Ayrıştırma',
      'Parçalama',
      'Gömme',
      'Vektör veritabanı',
      'Yeniden sıralama',
      'Dil modeli',
      'Değerlendirme',
    ],
    guvenlik: [
      'Rol tabanlı erişim denetimi (RBAC)',
      'Şirket içi veya özel bulut dağıtımı',
      'Denetim kaydı ve izlenebilirlik',
      'Veri ikametgâhı',
    ],
    sss: [
      {
        soru: 'Verimiz dışarı çıkar mı?',
        cevap:
          'Dağıtım modeline göre değişir. Şirket içi veya özel bulut kurulumda veri kurum sınırları içinde kalır; karar mimari aşamasında birlikte verilir.',
      },
      {
        soru: 'Yanlış cevap riskini nasıl yönetiyoruz?',
        cevap:
          'Geri getirme kalitesi üretimden ayrı ölçülür, cevaplar kaynak gösterir ve kritik akışlarda insan onayı adımı bulunur.',
      },
    ],
  },
  {
    slug: 'ai-agent',
    ad: 'AI Agent & Otomasyon',
    ozet: 'Çok adımlı iş akışlarını araç kullanan ajanlarla yürütme.',
    problem:
      'Tekrarlayan iş akışları çok sistemli olduğu için klasik otomasyonla çözülemiyor; her istisna elle ele alınıyor.',
    cozum:
      'Hedefi alt görevlere bölen, araçları şemaya uygun çağıran ve hata durumunda yeniden planlayan ajan akışları kuruyoruz.',
    kullanimAlanlari: [
      'Sipariş ve talep işleme',
      'Belge doğrulama ve veri girişi',
      'Raporlama ve mutabakat',
      'İç destek talepleri',
    ],
    mimari: ['Hedef', 'Planlayıcı', 'Araç katmanı', 'Doğrulama', 'İnsan onayı', 'Denetim kaydı'],
    guvenlik: [
      'Görev bazında en az yetki',
      'Geri döndürülemez işlemlerde insan onayı',
      'Dolaylı istem enjeksiyonuna karşı yetki sınırlaması',
    ],
    sss: [
      {
        soru: 'Ajan yanlış bir işlem yaparsa ne olur?',
        cevap:
          'Geri döndürülemez işlemler onay adımının arkasındadır ve her adım denetim kaydına yazılır; yetkiler görev bazında daraltılır.',
      },
    ],
  },
  {
    slug: 'computer-vision',
    ad: 'Computer Vision',
    ozet: 'Görsel veriden ölçülebilir operasyon sinyali üretme.',
    problem: 'Kameralar kayıt alıyor ama kayıtlardan operasyonel karar üretilemiyor.',
    cozum:
      'Tespit, sınıflandırma ve segmentasyon modellerini saha koşullarına göre kurup, çıktıyı mevcut operasyon akışına bağlıyoruz.',
    kullanimAlanlari: [
      'Görsel kalite kontrol',
      'İş güvenliği ihlali tespiti',
      'Stok ve raf takibi',
      'Belge ve form okuma',
    ],
    mimari: ['Veri toplama', 'Etiketleme', 'Model eğitimi', 'Kenar dağıtımı', 'İzleme'],
    guvenlik: ['Kişisel veri maskeleme', 'Kenar cihazda işleme', 'Saklama süresi politikası'],
  },
  {
    slug: 'machine-learning',
    ad: 'Predictive AI',
    ozet: 'Talep, risk ve arıza tahmini için klasik makine öğrenmesi çözümleri.',
    problem: 'Karar süreçleri geçmiş veriden yararlanmıyor; tahminler sezgiye dayanıyor.',
    cozum:
      'Mevcut veriyi özellik mühendisliğiyle işleyip, üretimde izlenebilen tahmin modelleri kuruyoruz.',
    kullanimAlanlari: [
      'Talep tahmini',
      'Kestirimci bakım',
      'Kredi ve sigorta riski',
      'Kayıp müşteri tahmini',
    ],
    mimari: ['Veri hattı', 'Özellik deposu', 'Model eğitimi', 'Dağıtım', 'Kayma izleme'],
  },
  {
    slug: 'ai-governance',
    ad: 'AI Governance',
    ozet: 'Yapay zekâ kullanımını politika, envanter ve denetimle yönetilebilir hale getirme.',
    problem:
      'Kurum içinde kimin hangi modeli hangi veriyle kullandığı bilinmiyor; uyum yükümlülükleri belirsiz.',
    cozum:
      'Model ve kullanım envanteri, risk sınıflandırması, politika seti ve denetim mekanizmasını birlikte kuruyoruz.',
    kullanimAlanlari: [
      'Model envanteri ve risk sınıflandırması',
      'Kullanım politikası ve eğitim',
      'Tedarikçi değerlendirmesi',
      'Denetim ve raporlama',
    ],
    mimari: ['Envanter', 'Risk sınıflandırması', 'Politika', 'Kontroller', 'Denetim'],
    sss: [
      {
        soru: 'Regülasyon uyumu için yeterli mi?',
        cevap:
          'Yönetişim çerçevesi uyumun temelini kurar; nihai hukuki değerlendirme kurumun hukuk birimiyle birlikte yapılır.',
      },
    ],
  },
  {
    slug: 'mlops',
    ad: 'MLOps / LLMOps',
    ozet: 'Model ve istem zincirlerini izlenebilir, sürümlenebilir ve ölçülebilir hale getirme.',
    problem:
      'Üretimdeki sorunların kök nedeni bulunamıyor; hangi değişikliğin kaliteyi düşürdüğü bilinmiyor.',
    cozum:
      'Gözlemlenebilirlik, değerlendirme hattı ve sürüm yönetimini kurup her değişikliği regresyon testine bağlıyoruz.',
    kullanimAlanlari: [
      'Gözlemlenebilirlik',
      'Değerlendirme hattı',
      'Maliyet yönetimi',
      'Sürüm yönetimi',
    ],
    mimari: ['Kayıt', 'İzleme', 'Değerlendirme', 'Sürüm', 'Geri alma'],
  },
  {
    slug: 'egitim',
    ad: 'Kurumsal Eğitim',
    ozet: 'Role göre tasarlanmış, kurumun kendi verisiyle uygulamalı yapay zekâ programları.',
    problem: 'Genel eğitimler günlük işe dokunmuyor; katılımcı öğrendiğini uygulayamıyor.',
    cozum:
      'Yönetici, ürün ve mühendis rollerine göre ayrılmış programlar; her modül kurumun gerçek senaryosu üzerinde uygulamayla kapanır.',
    kullanimAlanlari: [
      'Yöneticiler için yapay zekâ',
      'Ürün ekipleri için değerlendirme',
      'Mühendisler için RAG ve ajan geliştirme',
      'Sorumlu kullanım ve güvenlik',
    ],
  },
];

export function hizmetBul(slug: string) {
  return HIZMETLER.find((hizmet) => hizmet.slug === slug);
}

/* --- SEKTÖRLER ------------------------------------------------------------ */

export const SEKTORLER: SektorKaydi[] = [
  {
    slug: 'finans',
    ad: 'Finans',
    ozet: 'Risk, uyum, doküman otomasyonu',
    kullanimSayisi: 14,
    kullanimAlanlari: [
      'Sözleşme analizi',
      'Kredi risk modelleme',
      'Uyum raporlama',
      'Müşteri destek asistanı',
    ],
    teknolojiler: ['RAG', 'Predictive AI', 'Belge işleme'],
    riskler: ['Açıklanabilirlik yükümlülüğü', 'Veri ikametgâhı', 'Model yanlılığı denetimi'],
  },
  {
    slug: 'saglik',
    ad: 'Sağlık',
    ozet: 'Klinik doküman, görüntüleme desteği',
    kullanimSayisi: 11,
    kullanimAlanlari: [
      'Klinik not özetleme',
      'Görüntüleme ön değerlendirme',
      'Randevu ve triyaj desteği',
    ],
    teknolojiler: ['Computer Vision', 'RAG', 'Konuşma tanıma'],
    riskler: ['Hasta verisi gizliliği', 'Klinik doğrulama zorunluluğu', 'Sorumluluk sınırı'],
  },
  {
    slug: 'uretim',
    ad: 'Üretim',
    ozet: 'Kestirimci bakım, görsel kalite',
    kullanimSayisi: 13,
    kullanimAlanlari: [
      'Görsel kalite kontrol',
      'Kestirimci bakım',
      'Üretim planlama',
      'Bakım el kitabı asistanı',
    ],
    teknolojiler: ['Computer Vision', 'Predictive AI', 'RAG'],
    riskler: ['Saha koşullarında model kayması', 'Kenar donanım kısıtları'],
  },
  {
    slug: 'enerji',
    ad: 'Enerji',
    ozet: 'Talep tahmini, saha operasyonları',
    kullanimSayisi: 9,
    kullanimAlanlari: ['Talep ve üretim tahmini', 'Şebeke anomali tespiti', 'Saha bakım desteği'],
    teknolojiler: ['Predictive AI', 'Zaman serisi', 'RAG'],
    riskler: ['Kritik altyapı güvenliği', 'Gerçek zamanlı karar gereksinimi'],
  },
  {
    slug: 'lojistik',
    ad: 'Lojistik',
    ozet: 'Rota, kapasite, belge işleme',
    kullanimSayisi: 10,
    kullanimAlanlari: ['Rota optimizasyonu', 'Sevkiyat belgesi işleme', 'Kapasite tahmini'],
    teknolojiler: ['Belge işleme', 'Predictive AI', 'Ajan otomasyonu'],
    riskler: ['Çok taraflı veri paylaşımı', 'Operasyonel istisna yoğunluğu'],
  },
  {
    slug: 'perakende',
    ad: 'Perakende',
    ozet: 'Öneri, fiyatlama, müşteri desteği',
    kullanimSayisi: 12,
    kullanimAlanlari: ['Ürün öneri', 'Dinamik fiyatlama', 'Müşteri destek asistanı', 'Raf takibi'],
    teknolojiler: ['Öneri sistemleri', 'Computer Vision', 'RAG'],
    riskler: ['Kişiselleştirmede gizlilik', 'Fiyat algoritması şeffaflığı'],
  },
  {
    slug: 'insaat',
    ad: 'İnşaat',
    ozet: 'Saha güvenliği, ilerleme takibi',
    kullanimSayisi: 7,
    kullanimAlanlari: ['İş güvenliği ihlali tespiti', 'İlerleme takibi', 'Teknik şartname analizi'],
    teknolojiler: ['Computer Vision', 'RAG'],
    riskler: ['Saha görüntüsünde kişisel veri', 'Değişken çevre koşulları'],
  },
  {
    slug: 'egitim',
    ad: 'Eğitim',
    ozet: 'Kişiselleştirme, değerlendirme',
    kullanimSayisi: 8,
    kullanimAlanlari: [
      'Kişiselleştirilmiş öğrenme yolu',
      'Otomatik geri bildirim',
      'İçerik üretim desteği',
    ],
    teknolojiler: ['LLM', 'Değerlendirme', 'RAG'],
    riskler: ['Öğrenci verisi koruması', 'Akademik dürüstlük'],
  },
  {
    slug: 'turizm',
    ad: 'Turizm',
    ozet: 'Çok dilli destek, talep tahmini',
    kullanimSayisi: 6,
    kullanimAlanlari: [
      'Çok dilli müşteri desteği',
      'Talep ve fiyat tahmini',
      'İçerik yerelleştirme',
    ],
    teknolojiler: ['LLM', 'Predictive AI'],
    riskler: ['Sezonluk veri seyrekliği', 'Çok dilli kalite tutarlılığı'],
  },
  {
    slug: 'madencilik',
    ad: 'Madencilik',
    ozet: 'Güvenlik, ekipman sağlığı',
    kullanimSayisi: 5,
    kullanimAlanlari: [
      'Ekipman sağlığı izleme',
      'Güvenlik ihlali tespiti',
      'Cevher görsel sınıflandırma',
    ],
    teknolojiler: ['Computer Vision', 'Predictive AI'],
    riskler: ['Zorlu saha koşulları', 'Bağlantısız çalışma gereksinimi'],
  },
];

export function sektorBul(slug: string) {
  return SEKTORLER.find((sektor) => sektor.slug === slug);
}

/* --- VAKA ÇALIŞMALARI ---------------------------------------------------- */

export const VAKALAR: VakaCalismasi[] = [
  {
    slug: 'teknik-destek-rag',
    baslik: 'Teknik destekte kaynak gösteren cevap katmanı',
    sektor: 'Üretim',
    problem:
      'Saha teknisyenleri arıza kodlarını farklı sürümlerdeki el kitaplarında arıyordu; ortalama çözüm süresi öngörülemezdi.',
    yaklasim:
      'El kitapları sürüm etiketleriyle parçalandı, hibrit arama kuruldu ve her cevap dayandığı sayfaya referans verecek biçimde tasarlandı. Geri getirme kalitesi üretim kalitesinden ayrı ölçüldü.',
    teknolojiler: ['RAG', 'Hibrit arama', 'Değerlendirme hattı', 'RBAC'],
    etki: [
      { etiket: 'Ölçüm', deger: 'Geri getirme isabeti ayrı izleniyor' },
      { etiket: 'Kaynak', deger: 'Her cevap referanslı' },
      { etiket: 'Kapsam', deger: 'Sürüm farkındalığı' },
    ],
    dersler: [
      'Sürüm bilgisi meta veriye yazılmadığında model eski talimatı güncel sanıyor.',
      'Geri getirme ölçümü olmadan kalite tartışması sezgiye dönüyor.',
    ],
  },
  {
    slug: 'belge-dogrulama-ajani',
    baslik: 'Belge doğrulamada insan onaylı ajan akışı',
    sektor: 'Lojistik',
    problem: 'Sevkiyat belgelerinin kontrolü elle yapılıyor, istisnalar operasyonu kilitliyordu.',
    yaklasim:
      'Ajan; belgeyi okuyor, alanları çıkarıyor, kurallara göre doğruluyor ve yalnızca belirsiz vakaları insana yönlendiriyor. Geri döndürülemez işlemler onay adımının arkasında.',
    teknolojiler: ['Belge işleme', 'Ajan akışı', 'İnsan onayı', 'Denetim kaydı'],
    etki: [
      { etiket: 'Akış', deger: 'İstisna odaklı insan müdahalesi' },
      { etiket: 'İzlenebilirlik', deger: 'Adım adım denetim kaydı' },
    ],
    dersler: [
      'Ajanın "emin değilim" diyebilmesi, doğruluk oranından daha değerli.',
      'Onay adımı olmayan otomasyon kurumsal olarak kabul edilmiyor.',
    ],
  },
  {
    slug: 'gorsel-kalite-kontrol',
    baslik: 'Üretim hattında görsel kalite kontrol',
    sektor: 'Üretim',
    problem: 'Yüzey kusurları numune bazlı kontrolle yakalanıyor, kaçak oranı bilinmiyordu.',
    yaklasim:
      'Hat üstü kamera görüntüleri kenar cihazda işlendi; belirsiz vakalar insan kontrolüne yönlendirildi ve etiketlenerek eğitim setine geri beslendi.',
    teknolojiler: ['Computer Vision', 'Kenar dağıtımı', 'Aktif öğrenme'],
    etki: [
      { etiket: 'Kapsam', deger: 'Numune yerine tam kontrol' },
      { etiket: 'Döngü', deger: 'İnsan etiketi eğitime geri besleniyor' },
    ],
    dersler: [
      'Aydınlatma değişimi model kaymasının en sık nedeni.',
      'Belirsizlik eşiği doğru ayarlanmazsa insan yükü azalmıyor.',
    ],
  },
  {
    slug: 'ik-politika-asistani',
    baslik: 'İK politika asistanı ve erişim denetimi',
    sektor: 'Kurumsal',
    problem: 'Çalışanlar politika sorularını İK ekibine soruyordu; aynı sorular tekrar ediyordu.',
    yaklasim:
      'Politika belgeleri rol bazlı erişim etiketleriyle dizinlendi; asistan yalnızca kullanıcının görmeye yetkili olduğu belgelerden cevap üretiyor.',
    teknolojiler: ['RAG', 'RBAC', 'Denetim kaydı'],
    etki: [
      { etiket: 'Erişim', deger: 'Rol bazlı belge filtreleme' },
      { etiket: 'Kaynak', deger: 'Politika maddesine referans' },
    ],
    dersler: [
      'Erişim denetimi model katmanında değil belge katmanında kurulmalı.',
      'Kaynak gösterme, kullanıcı güvenini doğruluktan daha hızlı artırıyor.',
    ],
  },
];

export function vakaBul(slug: string) {
  return VAKALAR.find((vaka) => vaka.slug === slug);
}

export const SUREC_ADIMLARI = [
  { ad: 'Discovery', ozet: 'Senaryo, veri ve kısıtların çıkarılması.' },
  { ad: 'Assessment', ozet: 'Olgunluk ve uygulanabilirlik değerlendirmesi.' },
  { ad: 'Prototype', ozet: 'En kısa yoldan çalışan ilk sürüm.' },
  { ad: 'PoC', ozet: 'Tanımlı başarı ölçütüyle kanıt çalışması.' },
  { ad: 'Production', ozet: 'Güvenlik, ölçek ve operasyon devri.' },
  { ad: 'Monitoring', ozet: 'Kalite, maliyet ve kayma izleme.' },
];

export const READINESS_BOYUTLARI = [
  { ad: 'Strateji', ornekSkor: 74 },
  { ad: 'Veri', ornekSkor: 58 },
  { ad: 'Altyapı', ornekSkor: 66 },
  { ad: 'Yetenek', ornekSkor: 49 },
  { ad: 'Yönetişim', ornekSkor: 41 },
  { ad: 'Kullanım senaryoları', ornekSkor: 63 },
  { ad: 'Güvenlik', ornekSkor: 55 },
];
