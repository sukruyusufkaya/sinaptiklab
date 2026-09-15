import type { Soru } from '@/lib/tipler';

/**
 * SORU BANKASI.
 *
 * Her soru bir metadata kaydıdır (MASTER-PLAN §26): konu, alt konu, zorluk,
 * ölçtüğü beceri, doğru cevap, açıklama ve ilgili Atlas girdisi.
 *
 * Açıklamalar "neden doğru" değil "neden diğerleri yanlış" mantığını da taşır;
 * test bir ölçüm aracı olduğu kadar öğretim aracıdır.
 */

/* --- AI TEMELLERİ --------------------------------------------------------- */

export const AI_TEMELLERI: Soru[] = [
  {
    kimlik: 'ai_001',
    konu: 'Artificial Intelligence',
    altKonu: 'Terminoloji',
    zorluk: 'baslangic',
    beceri: 'Kavram ayrımı',
    soru: 'Makine öğrenmesi ile yapay zekâ arasındaki ilişki nedir?',
    secenekler: [
      'Aynı şeyin iki farklı adıdır',
      'Makine öğrenmesi, yapay zekânın bir alt alanıdır',
      'Yapay zekâ, makine öğrenmesinin bir alt alanıdır',
      'İkisi birbirinden tamamen bağımsız alanlardır',
    ],
    dogruIndeks: 1,
    aciklama:
      'Yapay zekâ, makine zekâsı üretmeyi amaçlayan geniş bir alandır; makine öğrenmesi ise bunu veriden örüntü çıkararak yapan alt alandır. Kural tabanlı uzman sistemler de yapay zekâdır ama makine öğrenmesi değildir.',
  },
  {
    kimlik: 'ai_004',
    konu: 'Artificial Intelligence',
    altKonu: 'Öğrenme türleri',
    zorluk: 'baslangic',
    beceri: 'Model türleri',
    soru: 'Etiketlenmiş veri olmadan veri içindeki grupları bulmaya çalışan yaklaşım hangisidir?',
    secenekler: [
      'Denetimli öğrenme',
      'Denetimsiz öğrenme',
      'Pekiştirmeli öğrenme',
      'Transfer öğrenme',
    ],
    dogruIndeks: 1,
    aciklama:
      'Denetimsiz öğrenmede hedef etiket yoktur; model verinin kendi yapısını (kümeler, boyut indirgeme) çıkarır. Denetimli öğrenme etiket gerektirir, pekiştirmeli öğrenme ödül sinyali ile çalışır.',
  },
  {
    kimlik: 'ai_007',
    konu: 'Artificial Intelligence',
    altKonu: 'Üretken modeller',
    zorluk: 'baslangic',
    beceri: 'Kavram ayrımı',
    soru: 'Bir dil modeli neden "bilgi veritabanı" gibi davranmaz?',
    secenekler: [
      'Çok fazla veriyle eğitildiği için karışır',
      'En olası devamı üreten bir olasılık modelidir; doğruluğu garanti etmez',
      'Yalnızca İngilizce bildiği için Türkçe bilgiyi kaybeder',
      'Veritabanı bağlantısı olmadığı için hiç bilgi taşımaz',
    ],
    dogruIndeks: 1,
    aciklama:
      'Model, eğitim verisindeki istatistiksel örüntüye göre en olası devamı üretir. Bilmediği bir konuda da akıcı ve olası görünen metin üretebilir; bu, halüsinasyonun temel nedenidir.',
    ilgiliAtlas: 'hallucination',
  },
  {
    kimlik: 'ai_011',
    konu: 'Artificial Intelligence',
    altKonu: 'Sorumlu kullanım',
    zorluk: 'baslangic',
    beceri: 'Sorumlu kullanım',
    soru: 'Kurumsal bir asistana hangi veriyi girmek en yüksek riski taşır?',
    secenekler: [
      'Kamuya açık ürün dokümantasyonu',
      'Şirket içi ama gizli olmayan süreç adımları',
      'Müşteri kimlik ve iletişim bilgileri',
      'Genel sektör terminolojisi',
    ],
    dogruIndeks: 2,
    aciklama:
      'Kişisel veri, hem mevzuat hem sözleşme açısından en yüksek riski taşır. Veri işleme sözleşmesi ve saklama politikası doğrulanmadan kişisel veri üçüncü taraf modele girilmez.',
  },
  {
    kimlik: 'ai_014',
    konu: 'Artificial Intelligence',
    altKonu: 'Model türleri',
    zorluk: 'baslangic',
    beceri: 'Kullanım alanı eşleştirme',
    soru: 'Fatura görüntülerinden alan çıkarmak için hangi model türü birincil adaydır?',
    secenekler: [
      'Zaman serisi tahmin modeli',
      'Çok modlu (görsel + metin) model',
      'Kümeleme algoritması',
      'Pekiştirmeli öğrenme ajanı',
    ],
    dogruIndeks: 1,
    aciklama:
      'Görsel girdiden yapılandırılmış alan çıkarmak çok modlu bir görevdir. Zaman serisi modelleri sayısal dizileri, kümeleme etiketlenmemiş grupları, pekiştirmeli öğrenme ise ardışık karar problemlerini hedefler.',
    ilgiliAtlas: 'multimodal-ai',
  },
  {
    kimlik: 'ai_018',
    konu: 'Artificial Intelligence',
    altKonu: 'Sınırlar',
    zorluk: 'baslangic',
    beceri: 'Risk değerlendirme',
    soru: 'Bir modelin çıktısına en çok hangi durumda güvenilmemelidir?',
    secenekler: [
      'Cevap kısa olduğunda',
      'Cevap kendinden emin bir dille yazıldığında',
      'Cevap dayandığı kaynağı göstermediğinde',
      'Cevap İngilizce terim içerdiğinde',
    ],
    dogruIndeks: 2,
    aciklama:
      'Kendinden emin dil doğruluk göstergesi değildir — modeller yanlış cevapları da aynı tonda yazar. Denetlenebilirliği sağlayan şey cevabın dayandığı kaynağa bağlanabilmesidir.',
  },
  {
    kimlik: 'ai_021',
    konu: 'Artificial Intelligence',
    altKonu: 'Terminoloji',
    zorluk: 'orta',
    beceri: 'Kavram ayrımı',
    soru: 'Üretken yapay zekâ ile ayırt edici (discriminative) modeller arasındaki temel fark nedir?',
    secenekler: [
      'Üretken modeller daha hızlıdır',
      'Ayırt edici modeller sınıf sınırını öğrenir, üretken modeller veriyi üretebilir',
      'Üretken modeller etiket gerektirmez, ayırt edici modeller gerektirir',
      'Aralarında matematiksel bir fark yoktur',
    ],
    dogruIndeks: 1,
    aciklama:
      'Ayırt edici model "bu örnek hangi sınıfa ait?" sorusuna cevap verir. Üretken model verinin dağılımını modellediği için o dağılımdan yeni örnek üretebilir. Etiket ihtiyacı ikisinde de göreve göre değişir.',
  },
];

/* --- MACHINE LEARNING ----------------------------------------------------- */

export const MACHINE_LEARNING: Soru[] = [
  {
    kimlik: 'ml_003',
    konu: 'Machine Learning',
    altKonu: 'Genelleme',
    zorluk: 'orta',
    beceri: 'Genelleme',
    soru: 'Eğitim doğruluğu %98, doğrulama doğruluğu %71 olan bir modelin temel sorunu nedir?',
    secenekler: [
      'Yetersiz uyum (underfitting)',
      'Aşırı uyum (overfitting)',
      'Veri sızıntısı',
      'Sınıf dengesizliği',
    ],
    dogruIndeks: 1,
    aciklama:
      'Eğitim ve doğrulama arasındaki büyük fark aşırı uyumun klasik işaretidir: model veriyi öğrenmek yerine ezberlemiştir. Yetersiz uyumda iki skor da düşük olurdu.',
  },
  {
    kimlik: 'ml_006',
    konu: 'Machine Learning',
    altKonu: 'Metrikler',
    zorluk: 'orta',
    beceri: 'Metrik seçimi',
    soru: 'Dolandırıcılık tespitinde (pozitif sınıf %0,3) hangi metrik yanıltıcıdır?',
    secenekler: ['Kesinlik (precision)', 'Duyarlılık (recall)', 'Doğruluk (accuracy)', 'F1 skoru'],
    dogruIndeks: 2,
    aciklama:
      'Her örneği "dolandırıcılık değil" diyen bir model %99,7 doğruluk alır ama hiçbir dolandırıcılığı yakalamaz. Dengesiz sınıflarda kesinlik, duyarlılık ve F1 anlamlı; doğruluk yanıltıcıdır.',
  },
  {
    kimlik: 'ml_009',
    konu: 'Machine Learning',
    altKonu: 'Veri sızıntısı',
    zorluk: 'ileri',
    beceri: 'Deney tasarımı',
    soru: 'Özellik ölçekleme (normalizasyon) hangi aşamada yapılmalıdır?',
    secenekler: [
      'Tüm veri seti üzerinde, eğitim/test ayrımından önce',
      'Yalnızca eğitim kümesinde öğrenilip test kümesine uygulanmalı',
      'Her katlamada (fold) tüm veriden yeniden öğrenilmeli',
      'Ölçekleme sırası sonucu etkilemez',
    ],
    dogruIndeks: 1,
    aciklama:
      'Ölçekleme parametreleri (ortalama, standart sapma) test verisini görürse sızıntı oluşur ve skor gerçekte olduğundan iyi çıkar. Parametreler yalnızca eğitim kümesinden öğrenilip teste uygulanır.',
  },
  {
    kimlik: 'ml_012',
    konu: 'Machine Learning',
    altKonu: 'Model seçimi',
    zorluk: 'orta',
    beceri: 'Model seçimi',
    soru: 'Tablo verisinde güçlü bir temel çizgi (baseline) kurmak için en makul ilk tercih hangisidir?',
    secenekler: [
      'Derin sinir ağı',
      'Gradyan artırmalı ağaç modelleri',
      'Transformer',
      'K-ortalama kümeleme',
    ],
    dogruIndeks: 1,
    aciklama:
      'Yapılandırılmış tablo verisinde gradyan artırmalı ağaçlar hâlâ güçlü ve hızlı bir temel çizgi verir. Derin ağlar bu veri türünde genellikle daha fazla ayar ve veri ister; kümeleme ise denetimsiz bir yöntemdir.',
  },
  {
    kimlik: 'ml_015',
    konu: 'Machine Learning',
    altKonu: 'Üretim',
    zorluk: 'orta',
    beceri: 'İzleme',
    soru: 'Üretimdeki bir modelin doğruluğu zamanla düşüyorsa ilk bakılacak olasılık nedir?',
    secenekler: [
      'Modelin ağırlıkları bozulmuş',
      'Girdi verisinin dağılımı değişmiş (veri kayması)',
      'Sunucu belleği yetersiz',
      'Model fazla küçük seçilmiş',
    ],
    dogruIndeks: 1,
    aciklama:
      'Ağırlıklar kendiliğinden değişmez. Kalite düşüşünün en yaygın nedeni girdi dağılımının veya hedef ilişkisinin kaymasıdır; bu yüzden üretimde dağılım izleme kurulur.',
  },
  {
    kimlik: 'ml_018',
    konu: 'Machine Learning',
    altKonu: 'Doğrulama',
    zorluk: 'ileri',
    beceri: 'Deney tasarımı',
    soru: 'Zaman serisi verisinde rastgele k-katlamalı çapraz doğrulama neden sakıncalıdır?',
    secenekler: [
      'Hesaplama maliyeti yüksektir',
      'Gelecekteki veriyle geçmişi tahmin etme durumu oluşur',
      'Katlama sayısı yeterli olmaz',
      'Sınıf dengesi bozulur',
    ],
    dogruIndeks: 1,
    aciklama:
      'Rastgele ayırma, modelin eğitiminde gelecek verinin bulunmasına yol açar; bu gerçek kullanımı temsil etmez. Zaman serisinde ileriye dönük (rolling/expanding) doğrulama kullanılır.',
  },
  {
    kimlik: 'ml_021',
    konu: 'Machine Learning',
    altKonu: 'Özellik mühendisliği',
    zorluk: 'orta',
    beceri: 'Özellik mühendisliği',
    soru: 'Kategorik bir değişkende 5.000 farklı değer varsa hangi yaklaşım daha uygundur?',
    secenekler: [
      'Her değer için ayrı ikili sütun (one-hot)',
      'Hedef veya frekans tabanlı kodlama',
      'Değerleri alfabetik sıraya göre sayıya çevirmek',
      'Değişkeni tamamen çıkarmak',
    ],
    dogruIndeks: 1,
    aciklama:
      'One-hot kodlama 5.000 sütun üretir ve seyreklik sorunu yaratır. Alfabetik sıralama yapay bir büyüklük ilişkisi uydurur. Hedef/frekans kodlaması boyutu korur; sızıntıya karşı katlama içinde hesaplanmalıdır.',
  },
];

/* --- DEEP LEARNING -------------------------------------------------------- */

export const DEEP_LEARNING: Soru[] = [
  {
    kimlik: 'dl_002',
    konu: 'Deep Learning',
    altKonu: 'Eğitim dinamikleri',
    zorluk: 'ileri',
    beceri: 'Teşhis',
    soru: 'Eğitim kaybı bir süre düştükten sonra aniden NaN oluyorsa en olası neden nedir?',
    secenekler: [
      'Veri seti çok küçük',
      'Öğrenme oranı çok yüksek / gradyan patlaması',
      'Katman sayısı yetersiz',
      'Toplu boyut (batch size) çok küçük',
    ],
    dogruIndeks: 1,
    aciklama:
      'NaN genellikle sayısal taşmadan gelir: yüksek öğrenme oranı veya gradyan patlaması. Çözüm; öğrenme oranını düşürmek, gradyan kırpma ve karma hassasiyette ölçekleyici kullanmaktır.',
  },
  {
    kimlik: 'dl_005',
    konu: 'Deep Learning',
    altKonu: 'Düzenlileştirme',
    zorluk: 'orta',
    beceri: 'Düzenlileştirme',
    soru: 'Dropout eğitim ve çıkarım sırasında nasıl davranır?',
    secenekler: [
      'İkisinde de aynı oranda nöron kapatır',
      'Yalnızca eğitimde nöron kapatır, çıkarımda devre dışıdır',
      'Yalnızca çıkarımda çalışır',
      'Yalnızca son katmanda çalışır',
    ],
    dogruIndeks: 1,
    aciklama:
      'Dropout bir düzenlileştirme yöntemidir ve yalnızca eğitimde uygulanır. Çıkarımda tüm nöronlar etkindir; çıktı ölçeklemesi eğitim sırasında telafi edilir.',
  },
  {
    kimlik: 'dl_008',
    konu: 'Deep Learning',
    altKonu: 'Mimari',
    zorluk: 'ileri',
    beceri: 'Mimari seçimi',
    soru: 'Artık (residual) bağlantıların temel katkısı nedir?',
    secenekler: [
      'Parametre sayısını azaltır',
      'Derin ağlarda gradyan akışını koruyarak eğitimi mümkün kılar',
      'Modelin bellek kullanımını düşürür',
      'Aşırı uyumu tamamen engeller',
    ],
    dogruIndeks: 1,
    aciklama:
      'Artık bağlantılar gradyanın katmanları atlayarak geriye akmasına izin verir; bu, çok derin ağlarda kaybolan gradyan sorununu hafifletir. Parametre veya bellek tasarrufu sağlamaz.',
  },
  {
    kimlik: 'dl_011',
    konu: 'Deep Learning',
    altKonu: 'Transfer öğrenme',
    zorluk: 'orta',
    beceri: 'Transfer öğrenme',
    soru: 'Küçük bir etiketli veri setiyle görsel sınıflandırma yapılacaksa en makul strateji nedir?',
    secenekler: [
      'Modeli sıfırdan eğitmek',
      'Önceden eğitilmiş bir modelin son katmanlarını ince ayarlamak',
      'Veriyi rastgele çoğaltıp sıfırdan eğitmek',
      'Daha derin bir mimari seçmek',
    ],
    dogruIndeks: 1,
    aciklama:
      'Küçük veride sıfırdan eğitim aşırı uyuma gider. Önceden eğitilmiş temsil üzerine ince ayar, az veriyle yüksek başarı sağlayan standart yaklaşımdır.',
  },
  {
    kimlik: 'dl_014',
    konu: 'Deep Learning',
    altKonu: 'Normalizasyon',
    zorluk: 'ileri',
    beceri: 'Eğitim dinamikleri',
    soru: 'Toplu normalizasyon (batch norm) küçük toplu boyutlarda neden sorun çıkarır?',
    secenekler: [
      'Hesaplama maliyeti artar',
      'Toplu istatistikleri gürültülü olur ve kararsızlık yaratır',
      'Gradyanları tamamen sıfırlar',
      'Yalnızca evrişimli ağlarda çalışır',
    ],
    dogruIndeks: 1,
    aciklama:
      'Batch norm toplu içi ortalama ve varyansa dayanır; küçük toplularda bu istatistikler gürültülüdür. Bu durumda katman normalizasyonu veya grup normalizasyonu tercih edilir.',
  },
  {
    kimlik: 'dl_017',
    konu: 'Deep Learning',
    altKonu: 'Dikkat',
    zorluk: 'ileri',
    beceri: 'Mimari',
    soru: 'Öz-dikkat mekanizmasının dizi uzunluğuna göre hesaplama karmaşıklığı nedir?',
    secenekler: ['Doğrusal (O(n))', 'Kareli (O(n²))', 'Logaritmik (O(log n))', 'Sabit (O(1))'],
    dogruIndeks: 1,
    aciklama:
      'Her öge diğer tüm ögelerle karşılaştırıldığı için karmaşıklık dizi uzunluğunun karesiyle artar. Uzun bağlamın pahalı olmasının temel nedeni budur; seyrek ve doğrusal dikkat varyantları bu maliyeti azaltmayı hedefler.',
    ilgiliAtlas: 'transformer',
  },
];

/* --- GENERATIVE AI -------------------------------------------------------- */

export const GENERATIVE_AI: Soru[] = [
  {
    kimlik: 'gen_002',
    konu: 'Generative AI',
    altKonu: 'Model türleri',
    zorluk: 'baslangic',
    beceri: 'Kullanım alanı eşleştirme',
    soru: 'Metinden görsel üretmek için yaygın olarak hangi model ailesi kullanılır?',
    secenekler: [
      'Difüzyon modelleri',
      'Karar ağaçları',
      'Destek vektör makineleri',
      'Gizli Markov modelleri',
    ],
    dogruIndeks: 0,
    aciklama:
      'Difüzyon modelleri gürültüden başlayıp adım adım görüntü oluşturur ve metinden görsel üretiminde baskın yaklaşımdır. Diğer seçenekler klasik makine öğrenmesi yöntemleridir.',
  },
  {
    kimlik: 'gen_005',
    konu: 'Generative AI',
    altKonu: 'Örnekleme',
    zorluk: 'baslangic',
    beceri: 'Model davranışı',
    soru: 'Sıcaklık (temperature) değerini düşürmek çıktıyı nasıl etkiler?',
    secenekler: [
      'Daha yaratıcı ve çeşitli yapar',
      'Daha belirlenimci ve tekrarlanabilir yapar',
      'Cevabı kısaltır',
      'Halüsinasyonu tamamen engeller',
    ],
    dogruIndeks: 1,
    aciklama:
      'Düşük sıcaklık olasılık dağılımını keskinleştirir; model en olası devamı seçmeye yaklaşır. Bu tekrarlanabilirliği artırır ama doğruluğu garanti etmez.',
  },
  {
    kimlik: 'gen_008',
    konu: 'Generative AI',
    altKonu: 'Yapılandırılmış çıktı',
    zorluk: 'orta',
    beceri: 'Kısıt tasarımı',
    soru: 'Modelin her zaman geçerli JSON döndürmesini sağlamanın en güvenilir yolu nedir?',
    secenekler: [
      'İstemde "lütfen geçerli JSON döndür" yazmak',
      'Şema kısıtlı çıktı (structured output) özelliğini kullanmak',
      'Sıcaklığı sıfıra çekmek',
      'Cevabı daha uzun tutmasını istemek',
    ],
    dogruIndeks: 1,
    aciklama:
      'İstem talimatı bir istektir, garanti değildir. Şema kısıtlı çıktı, üretimi biçimsel olarak sınırlar; ek olarak sunucu tarafında şema doğrulaması yapılmalıdır.',
  },
  {
    kimlik: 'gen_011',
    konu: 'Generative AI',
    altKonu: 'Sınırlar',
    zorluk: 'baslangic',
    beceri: 'Risk değerlendirme',
    soru: 'Üretken bir modelin çıktısı telif açısından neden dikkat gerektirir?',
    secenekler: [
      'Çıktı her zaman eğitim verisinin birebir kopyasıdır',
      'Eğitim verisine benzeyen çıktı üretebilir ve kullanım hakları belirsiz olabilir',
      'Üretken modeller telif kapsamına girmez',
      'Yalnızca görsel modellerde risk vardır',
    ],
    dogruIndeks: 1,
    aciklama:
      'Çıktı genellikle birebir kopya değildir ama eğitim verisine yakın olabilir ve hak durumu sağlayıcı sözleşmesine göre değişir. Ticari kullanımda sözleşme şartları kontrol edilmelidir.',
  },
  {
    kimlik: 'gen_014',
    konu: 'Generative AI',
    altKonu: 'Değerlendirme',
    zorluk: 'orta',
    beceri: 'Ölçüm',
    soru: 'Üretken çıktının kalitesini ölçmek neden klasik sınıflandırmadan zordur?',
    secenekler: [
      'Modeller çok büyük olduğu için',
      'Tek bir doğru cevap olmadığı için ölçüt tanımı gerekir',
      'Çıktı her zaman rastgeledir',
      'Ölçüm için etiketli veri bulunamaz',
    ],
    dogruIndeks: 1,
    aciklama:
      'Sınıflandırmada doğru etiket tektir. Üretimde birden fazla kabul edilebilir cevap olabildiği için önce "başarı nedir?" sorusunun yazılı olarak yanıtlanması gerekir.',
    ilgiliAtlas: 'evaluation',
  },
  {
    kimlik: 'gen_017',
    konu: 'Generative AI',
    altKonu: 'Kullanım alanı',
    zorluk: 'baslangic',
    beceri: 'Kullanım alanı eşleştirme',
    soru: 'Aşağıdaki görevlerden hangisi üretken model için en kötü adaydır?',
    secenekler: [
      'Uzun bir raporu özetlemek',
      'Müşteri e-postasına taslak cevap yazmak',
      'Kesin hesap bakiyesi hesaplamak',
      'Ürün açıklaması varyantları üretmek',
    ],
    dogruIndeks: 2,
    aciklama:
      'Kesin aritmetik ve kayıt doğruluğu gerektiren işler deterministik sistemlere aittir. Model bu işi aracı çağırarak yapabilir ama hesabı kendisi üretmemelidir.',
  },
];

/* --- LARGE LANGUAGE MODELS ------------------------------------------------ */

export const LLM: Soru[] = [
  {
    kimlik: 'llm_003',
    konu: 'Large Language Models',
    altKonu: 'Tokenization',
    zorluk: 'orta',
    beceri: 'Tokenization',
    soru: 'Türkçe metinler aynı bilgi için neden genellikle daha fazla token harcar?',
    secenekler: [
      'Türkçe alfabede daha fazla harf olduğu için',
      'Eklemeli yapı nedeniyle kelimeler alt parçalara daha çok bölündüğü için',
      'Türkçe metinler daha uzun yazıldığı için',
      'Modeller Türkçeyi desteklemediği için',
    ],
    dogruIndeks: 1,
    aciklama:
      'Tokenizer sözlükleri ağırlıklı olarak İngilizce metinle oluşturulur. Türkçenin eklemeli yapısı, kelimelerin daha fazla alt parçaya bölünmesine yol açar; bu da maliyet ve bağlam hesabını etkiler.',
    ilgiliAtlas: 'tokenization',
  },
  {
    kimlik: 'llm_006',
    konu: 'Large Language Models',
    altKonu: 'Bağlam yönetimi',
    zorluk: 'orta',
    beceri: 'Bağlam yönetimi',
    soru: 'Bağlam penceresini tamamen doldurmak neden her zaman iyi bir fikir değildir?',
    secenekler: [
      'Model uzun girdileri reddeder',
      'Maliyet artar ve ortadaki bilgiyi gözden kaçırma eğilimi yükselir',
      'Çıktı her zaman kısalır',
      'Tokenizer hata verir',
    ],
    dogruIndeks: 1,
    aciklama:
      'Uzun bağlamda hem token maliyeti hem gecikme artar; ayrıca modeller pencerenin ortasındaki bilgiye daha az ağırlık verme eğilimi gösterir. Doğru soru "ne sığıyor" değil "hangi bilgiyi koymalıyım".',
    ilgiliAtlas: 'context-window',
  },
  {
    kimlik: 'llm_009',
    konu: 'Large Language Models',
    altKonu: 'Mimari',
    zorluk: 'ileri',
    beceri: 'Mimari',
    soru: 'Mixture of Experts mimarisinin temel kazancı nedir?',
    secenekler: [
      'Bellek ihtiyacını düşürür',
      'Toplam parametreyi büyütürken girdi başına işlem maliyetini sabit tutar',
      'Eğitim verisi ihtiyacını ortadan kaldırır',
      'Halüsinasyonu engeller',
    ],
    dogruIndeks: 1,
    aciklama:
      'Yönlendirici her girdiyi yalnızca birkaç uzman bloğa gönderir; böylece kapasite maliyetten ayrışır. Ancak tüm uzmanlar bellekte tutulmak zorunda olduğu için bellek ihtiyacı düşmez, aksine artar.',
    ilgiliAtlas: 'mixture-of-experts',
  },
  {
    kimlik: 'llm_012',
    konu: 'Large Language Models',
    altKonu: 'Uyarlama',
    zorluk: 'orta',
    beceri: 'Mimari kararı',
    soru: 'Modelin çıktı üslubunu ve biçimini kalıcı olarak değiştirmek için hangisi uygundur?',
    secenekler: ['RAG', 'İnce ayar', 'Bağlam penceresini büyütmek', 'Niceleme'],
    dogruIndeks: 1,
    aciklama:
      'Üslup ve biçim davranışsal bir özelliktir ve ince ayarla öğretilir. RAG olgusal bilgiyi taşır; niceleme bellek/performans ile ilgilidir.',
    ilgiliAtlas: 'fine-tuning',
  },
  {
    kimlik: 'llm_015',
    konu: 'Large Language Models',
    altKonu: 'Örnekleme',
    zorluk: 'orta',
    beceri: 'Model davranışı',
    soru: 'Aynı istemle aynı modele iki kez sorulduğunda farklı cevap gelmesinin ana nedeni nedir?',
    secenekler: [
      'Model her seferinde yeniden eğitilir',
      'Örnekleme rastgeleliği (sıcaklık, üst-p) devrededir',
      'Sunucu farklı model sürümü kullanır',
      'Tokenizer değişkendir',
    ],
    dogruIndeks: 1,
    aciklama:
      'Üretim adımı olasılık dağılımından örnekleme yapar. Sıcaklık ve üst-p ayarları bu rastgeleliği belirler; tekrarlanabilirlik isteniyorsa bunlar sabitlenir.',
  },
  {
    kimlik: 'llm_018',
    konu: 'Large Language Models',
    altKonu: 'Gömme',
    zorluk: 'orta',
    beceri: 'Retrieval',
    soru: 'Gömme modelini değiştirdiğinizde mevcut vektör dizinine ne olur?',
    secenekler: [
      'Hiçbir şey; vektörler uyumludur',
      'Dizinin tamamının yeniden üretilmesi gerekir',
      'Yalnızca yeni belgeler için yeni model kullanılır',
      'Dizin otomatik olarak dönüştürülür',
    ],
    dogruIndeks: 1,
    aciklama:
      'Farklı gömme modellerinin vektör uzayları birbiriyle karşılaştırılamaz. Model değişimi, tüm korpusun yeniden gömülmesi anlamına gelir — bu bir operasyon ve maliyet kararıdır.',
    ilgiliAtlas: 'embedding',
  },
  {
    kimlik: 'llm_021',
    konu: 'Large Language Models',
    altKonu: 'Muhakeme',
    zorluk: 'ileri',
    beceri: 'Model davranışı',
    soru: 'Muhakeme (reasoning) modellerinin maliyeti neden yüksektir?',
    secenekler: [
      'Daha büyük bağlam penceresi kullanırlar',
      'Cevap öncesinde çok daha fazla ara token üretirler',
      'Her istekte yeniden eğitilirler',
      'Yalnızca özel donanımda çalışırlar',
    ],
    dogruIndeks: 1,
    aciklama:
      'Muhakeme modelleri cevaba varmadan önce uzun bir düşünme zinciri üretir; bu tokenlar da faturalanır ve gecikmeyi artırır. Kazanç, zor görevlerde doğruluk artışıdır.',
  },
];

/* --- PROMPT ENGINEERING --------------------------------------------------- */

export const PROMPT_ENGINEERING: Soru[] = [
  {
    kimlik: 'pe_002',
    konu: 'Large Language Models',
    altKonu: 'Kısıt tasarımı',
    zorluk: 'baslangic',
    beceri: 'Kısıt tasarımı',
    soru: 'Aşağıdaki istemlerden hangisi ölçülebilir bir çıktı üretir?',
    secenekler: [
      '"Bu metni güzelce özetle."',
      '"Bu metni en fazla 3 madde halinde, her madde 15 kelimeyi geçmeyecek şekilde özetle."',
      '"Bu metni profesyonel bir dille özetle."',
      '"Bu metni kısaca özetle."',
    ],
    dogruIndeks: 1,
    aciklama:
      '"Güzel", "profesyonel" ve "kısa" öznel ifadelerdir; sonucu doğrulayamazsınız. Sayısal kısıt hem modele yön verir hem otomatik kontrol edilebilir bir kabul ölçütü üretir.',
  },
  {
    kimlik: 'pe_005',
    konu: 'Large Language Models',
    altKonu: 'Örnekle öğretim',
    zorluk: 'baslangic',
    beceri: 'İstem tasarımı',
    soru: 'Few-shot örnek eklemek en çok hangi durumda işe yarar?',
    secenekler: [
      'Modelin bilmediği güncel olguları öğretmek gerektiğinde',
      'İstenen çıktı biçimini göstermek gerektiğinde',
      'Bağlam penceresini doldurmak gerektiğinde',
      'Maliyeti düşürmek gerektiğinde',
    ],
    dogruIndeks: 1,
    aciklama:
      'Örnekler biçim ve üslup öğretmede çok etkilidir. Güncel olgu için geri getirme (RAG) gerekir; örnek eklemek bağlamı büyüttüğü için maliyeti artırır, düşürmez.',
  },
  {
    kimlik: 'pe_008',
    konu: 'Large Language Models',
    altKonu: 'Hata ayıklama',
    zorluk: 'orta',
    beceri: 'İstem tasarımı',
    soru: 'Model bazı isteklerde talimatı yok sayıyorsa ilk denenecek müdahale nedir?',
    secenekler: [
      'Sıcaklığı yükseltmek',
      'Talimatı istemin sonuna taşımak ve kısıtları numaralandırmak',
      'Daha fazla few-shot örnek eklemek',
      'Daha büyük bir model seçmek',
    ],
    dogruIndeks: 1,
    aciklama:
      'Uzun bağlamda başta verilen talimatlar zayıflayabilir. Talimatı sona taşımak, kısıtları numaralandırmak ve çıktı şemasını netleştirmek en düşük maliyetli ilk müdahaledir.',
  },
  {
    kimlik: 'pe_011',
    konu: 'Large Language Models',
    altKonu: 'Rol tanımı',
    zorluk: 'baslangic',
    beceri: 'İstem tasarımı',
    soru: '"Sen bir uzmansın" gibi rol ifadelerinin sınırı nedir?',
    secenekler: [
      'Modelin bilgisini gerçekten artırır',
      'Üslubu etkiler ama bilmediği bilgiyi üretmesini sağlamaz',
      'Halüsinasyonu engeller',
      'Çıktı biçimini garanti eder',
    ],
    dogruIndeks: 1,
    aciklama:
      'Rol ataması ton ve yaklaşımı etkiler; modelin eğitim verisinde olmayan bilgiyi ortaya çıkarmaz. Olgusal doğruluk için kaynak sağlanmalıdır.',
  },
  {
    kimlik: 'pe_014',
    konu: 'Large Language Models',
    altKonu: 'Güvenlik',
    zorluk: 'orta',
    beceri: 'Yetkilendirme',
    soru: 'Kullanıcı girdisini sistem istemine doğrudan birleştirmek neden risklidir?',
    secenekler: [
      'Token maliyetini artırır',
      'Kullanıcı, sistem talimatını geçersiz kılmayı deneyebilir',
      'Model yavaşlar',
      'Çıktı biçimi bozulur',
    ],
    dogruIndeks: 1,
    aciklama:
      'Bu, istem enjeksiyonunun temel yüzeyidir. Kullanıcı ve sistem içeriği ayrı kanallarda tutulmalı; dış içerik veri olarak işaretlenip talimat gibi değerlendirilmemelidir.',
    ilgiliAtlas: 'prompt-injection',
  },
  {
    kimlik: 'pe_017',
    konu: 'Large Language Models',
    altKonu: 'Değerlendirme',
    zorluk: 'orta',
    beceri: 'Ölçüm',
    soru: 'İstem değişikliğinin gerçekten iyileştirme olduğunu nasıl anlarsınız?',
    secenekler: [
      'Birkaç örnekte gözle kontrol ederek',
      'Sabit bir görev setinde önce/sonra ölçüm yaparak',
      'Cevapların uzunluğuna bakarak',
      'Modelin kendisine sorarak',
    ],
    dogruIndeks: 1,
    aciklama:
      'Gözlem yanlılığa açıktır. Aynı görev setinde tekrarlanabilir ölçüm, istem değişikliklerini regresyon testine bağlamanın tek yoludur.',
    ilgiliAtlas: 'evaluation',
  },
];

/* --- RAG ------------------------------------------------------------------ */

export const RAG: Soru[] = [
  {
    kimlik: 'rag_013',
    konu: 'RAG',
    altKonu: 'Chunking',
    zorluk: 'orta',
    beceri: 'Retrieval',
    soru: 'Bir RAG hattında cevaplar sürekli eksik bilgi içeriyorsa ilk bakılacak yer neresidir?',
    secenekler: [
      'Modelin sıcaklık değeri',
      'Geri getirme adımının doğru parçaları bulup bulmadığı',
      'Sistem isteminin uzunluğu',
      'Çıktı biçimlendirme şablonu',
    ],
    dogruIndeks: 1,
    aciklama:
      'Üretim adımı yalnızca kendisine verilen bağlamı kullanabilir. Doğru parça getirilmediyse modelin yapabileceği bir şey yoktur; bu yüzden geri getirme kalitesi ayrı ölçülmelidir.',
    ilgiliAtlas: 'rag',
  },
  {
    kimlik: 'rag_021',
    konu: 'RAG',
    altKonu: 'Fine-tuning karşılaştırması',
    zorluk: 'orta',
    beceri: 'Mimari kararı',
    soru: 'Sık değişen fiyat bilgisini modele taşımak için hangisi uygundur?',
    secenekler: ['Fine-tuning', 'RAG', 'Niceleme', 'Damıtma'],
    dogruIndeks: 1,
    aciklama:
      'Fine-tuning model parametrelerini değiştirir ve her güncellemede yeniden eğitim gerektirir. Sık değişen olgusal bilgi için geri getirme doğru araçtır.',
    ilgiliAtlas: 'rag',
  },
  {
    kimlik: 'rag_034',
    konu: 'RAG',
    altKonu: 'Hibrit arama',
    zorluk: 'ileri',
    beceri: 'Retrieval',
    soru: 'Kurumsal belge aramasında saf anlamsal arama neden tek başına yetersiz kalır?',
    secenekler: [
      'Vektör araması çok yavaştır',
      'Ürün kodu gibi kesin eşleşmeleri kaçırabilir',
      'Meta veri filtrelemeyi desteklemez',
      'Yalnızca İngilizce çalışır',
    ],
    dogruIndeks: 1,
    aciklama:
      'Anlamsal arama yakın anlamı bulur ama birebir eşleşmesi gereken kodlarda zayıftır. Lexical katmanla birleştirilen hibrit arama bu açığı kapatır.',
    ilgiliAtlas: 'vector-database',
  },
  {
    kimlik: 'rag_042',
    konu: 'RAG',
    altKonu: 'Yeniden sıralama',
    zorluk: 'orta',
    beceri: 'Retrieval',
    soru: 'Yeniden sıralayıcı (reranker) hattın neresinde çalışır ve ne yapar?',
    secenekler: [
      'Gömme öncesinde belgeleri temizler',
      'İlk aşamada getirilen adayları alaka düzeyine göre yeniden sıralar',
      'Modelin cevabını düzeltir',
      'Vektör dizinini sıkıştırır',
    ],
    dogruIndeks: 1,
    aciklama:
      'İlk aşama geri çağırma odaklıdır: geniş bir aday kümesi getirir. Yeniden sıralayıcı bu adayları kesinlik odaklı değerlendirip en alakalı olanları öne alır; böylece top-k düşürülebilir.',
    ilgiliAtlas: 'rag',
  },
  {
    kimlik: 'rag_048',
    konu: 'RAG',
    altKonu: 'Erişim denetimi',
    zorluk: 'ileri',
    beceri: 'Yetkilendirme',
    soru: 'Rol bazlı erişim denetimi RAG hattında nerede uygulanmalıdır?',
    secenekler: [
      'Sistem isteminde "bu kullanıcı şunu görmemeli" talimatıyla',
      'Geri getirme sorgusunda, belge meta verisi üzerinde filtreleyerek',
      'Modelin cevabını sonradan sansürleyerek',
      'Kullanıcı arayüzünde sonuçları gizleyerek',
    ],
    dogruIndeks: 1,
    aciklama:
      'Yetkisiz belge bağlama girdiyse iş bitmiştir; model onu kullanır. Filtreleme sorgu düzeyinde yapılmalı, yani yetkisiz belge hiç getirilmemelidir.',
    ilgiliAtlas: 'rag',
  },
  {
    kimlik: 'rag_055',
    konu: 'RAG',
    altKonu: 'Parçalama',
    zorluk: 'orta',
    beceri: 'Parçalama',
    soru: 'Parçalar arasında örtüşme bırakmanın temel amacı nedir?',
    secenekler: [
      'Dizin boyutunu küçültmek',
      'Sınırda kesilen bağlamın her iki parçada da bulunmasını sağlamak',
      'Gömme maliyetini düşürmek',
      'Arama hızını artırmak',
    ],
    dogruIndeks: 1,
    aciklama:
      'Örtüşme, anlamın parça sınırında kopmasını engeller. Bedeli depolanan token miktarının artmasıdır; bu yüzden örtüşme oranı belge yapısına göre ayarlanır.',
  },
  {
    kimlik: 'rag_061',
    konu: 'RAG',
    altKonu: 'Sürüm yönetimi',
    zorluk: 'ileri',
    beceri: 'Retrieval',
    soru: 'Aynı dokümanın birden çok sürümü dizindeyse en sık görülen arıza nedir?',
    secenekler: [
      'Arama yavaşlar',
      'Model eski talimatı güncel sanarak cevap üretir',
      'Vektörler bozulur',
      'Gömme modeli hata verir',
    ],
    dogruIndeks: 1,
    aciklama:
      'Model getirilen parçaya güvenir; hangi sürüme ait olduğunu bilmez. Sürüm ve geçerlilik bilgisi meta veriye yazılmalı ve sorgu düzeyinde filtrelenmelidir.',
  },
];

/* --- AI AGENTS ------------------------------------------------------------ */

export const AI_AGENT: Soru[] = [
  {
    kimlik: 'agent_007',
    konu: 'AI Agents',
    altKonu: 'Güvenlik',
    zorluk: 'orta',
    beceri: 'Yetkilendirme',
    soru: 'Dolaylı istem enjeksiyonuna karşı en etkili yapısal önlem hangisidir?',
    secenekler: [
      'Daha uzun sistem istemi yazmak',
      'Ajanın araç yetkilerini görev bazında daraltmak',
      'Sıcaklık değerini düşürmek',
      'Daha büyük bir model kullanmak',
    ],
    dogruIndeks: 1,
    aciklama:
      'Enjeksiyon bir metin filtreleme sorunu değil yetkilendirme sorunudur. Ajan neye erişemiyorsa, enjekte edilen talimat da onu yapamaz.',
    ilgiliAtlas: 'prompt-injection',
  },
  {
    kimlik: 'agent_012',
    konu: 'AI Agents',
    altKonu: 'Değerlendirme',
    zorluk: 'orta',
    beceri: 'Ölçüm',
    soru: 'Çok adımlı bir ajan akışını değerlendirmek için hangisi daha uygundur?',
    secenekler: [
      'Tek seferlik cevap doğruluğu',
      'Görev tamamlama oranı',
      'Token başına maliyet',
      'Kelime benzerliği skoru',
    ],
    dogruIndeks: 1,
    aciklama:
      'Tek adımlık doğruluk, onlarca adımlık bir akışın davranışını temsil etmez. Ölçülmesi gereken, görevin baştan sona tamamlanıp tamamlanmadığıdır.',
    ilgiliAtlas: 'evaluation',
  },
  {
    kimlik: 'agent_018',
    konu: 'AI Agents',
    altKonu: 'Araç şeması',
    zorluk: 'orta',
    beceri: 'Araç şeması',
    soru: 'Modelin araç parametrelerini yanlış üretme oranını düşürmenin en etkili yolu nedir?',
    secenekler: [
      'Araç sayısını artırmak',
      'Şemayı daraltmak: zorunlu alanları azaltmak, enum ve açık tip kullanmak',
      'Sıcaklığı yükseltmek',
      'Araç adlarını kısaltmak',
    ],
    dogruIndeks: 1,
    aciklama:
      'Serbest metin alanları hata yüzeyidir. Enum, sayısal aralık ve zorunlu alan sayısını azaltmak, modelin geçerli çağrı üretme olasılığını belirgin biçimde artırır.',
    ilgiliAtlas: 'mcp',
  },
  {
    kimlik: 'agent_024',
    konu: 'AI Agents',
    altKonu: 'Bellek',
    zorluk: 'ileri',
    beceri: 'Bellek tasarımı',
    soru: 'Uzun bir ajan oturumunda model erken adımdaki kısıtları unutuyorsa ne yapılmalıdır?',
    secenekler: [
      'Bağlam penceresini büyütmek yeterlidir',
      'Kısıtları her adımda yeniden enjekte eden bir kalıcı bellek katmanı kurmak',
      'Adım sayısını artırmak',
      'Daha yüksek sıcaklık kullanmak',
    ],
    dogruIndeks: 1,
    aciklama:
      'Pencereyi büyütmek unutmayı azaltmaz; ortadaki bilgiyi gözden kaçırma eğilimi sürer. Değişmez kısıtlar özetlenip her adımda yeniden verilmelidir.',
    ilgiliAtlas: 'ai-agent',
  },
  {
    kimlik: 'agent_029',
    konu: 'AI Agents',
    altKonu: 'Çok ajanlı sistemler',
    zorluk: 'ileri',
    beceri: 'Mimari kararı',
    soru: 'Bir akışı birden çok ajana bölmek ne zaman zarar verir?',
    secenekler: [
      'Görev tek ajanla güvenilir biçimde tamamlanabiliyorken',
      'Görev birbirinden bağımsız alt görevlere ayrılabiliyorken',
      'Farklı araç yetkileri gerektiğinde',
      'Uzmanlaşmış istemler gerektiğinde',
    ],
    dogruIndeks: 0,
    aciklama:
      'Her ek ajan yeni bir hata yüzeyi, gecikme ve koordinasyon maliyeti getirir. Bölme kararı, tek ajanın yetersiz kaldığı ölçümle gerekçelendirilmelidir.',
  },
  {
    kimlik: 'agent_035',
    konu: 'AI Agents',
    altKonu: 'Hata kurtarma',
    zorluk: 'orta',
    beceri: 'Planlama',
    soru: 'Ajan aynı başarısız adımı tekrar tekrar deniyorsa tasarımda eksik olan nedir?',
    secenekler: [
      'Daha fazla araç',
      'Başarısızlığı tanıyıp planı değiştiren bir doğrulama ve yeniden planlama adımı',
      'Daha uzun sistem istemi',
      'Daha büyük bağlam penceresi',
    ],
    dogruIndeks: 1,
    aciklama:
      'Döngü, ajanın sonucu değerlendirmediğini gösterir. Her adımın çıktısı beklenen biçim ve içerikle karşılaştırılmalı; başarısızlıkta strateji değişmelidir.',
  },
  {
    kimlik: 'agent_041',
    konu: 'AI Agents',
    altKonu: 'Onay akışı',
    zorluk: 'orta',
    beceri: 'Yetkilendirme',
    soru: 'Hangi işlem türü mutlaka insan onayı arkasında olmalıdır?',
    secenekler: [
      'Veritabanından okuma',
      'Rapor oluşturma',
      'Geri döndürülemez işlem (ödeme, silme, gönderim)',
      'Belge özetleme',
    ],
    dogruIndeks: 2,
    aciklama:
      'Okuma ve üretim işlemleri geri alınabilir. Geri döndürülemez işlemlerde model hatasının maliyeti kalıcı olduğu için onay adımı mimari bir zorunluluktur.',
  },
];

/* --- COMPUTER VISION ------------------------------------------------------ */

export const COMPUTER_VISION: Soru[] = [
  {
    kimlik: 'cv_003',
    konu: 'Computer Vision',
    altKonu: 'Görev türleri',
    zorluk: 'orta',
    beceri: 'Görü mimarileri',
    soru: 'Her pikselin hangi nesneye ait olduğunu belirleyen görev hangisidir?',
    secenekler: ['Görüntü sınıflandırma', 'Nesne tespiti', 'Anlamsal segmentasyon', 'Poz tahmini'],
    dogruIndeks: 2,
    aciklama:
      'Sınıflandırma tüm görüntüye bir etiket verir, tespit sınırlayıcı kutu üretir, segmentasyon piksel düzeyinde maske çıkarır. Poz tahmini eklem noktalarını bulur.',
  },
  {
    kimlik: 'cv_006',
    konu: 'Computer Vision',
    altKonu: 'Metrikler',
    zorluk: 'orta',
    beceri: 'Metrikler',
    soru: 'Nesne tespitinde mAP metriği neyi ölçer?',
    secenekler: [
      'Modelin çıkarım hızını',
      'Farklı IoU eşiklerinde ortalama kesinlik performansını',
      'Yalnızca en büyük nesnenin doğruluğunu',
      'Piksel düzeyinde örtüşmeyi',
    ],
    dogruIndeks: 1,
    aciklama:
      'mAP, sınıflar ve IoU eşikleri üzerinden ortalama kesinliği birleştirir. Tek bir eşikteki skora bakmak, modelin sınır hassasiyetini gizler.',
  },
  {
    kimlik: 'cv_009',
    konu: 'Computer Vision',
    altKonu: 'Saha dağıtımı',
    zorluk: 'orta',
    beceri: 'Dağıtım',
    soru: 'Üretim hattındaki bir görü modelinin doğruluğu aylar içinde düşüyorsa en olası saha nedeni nedir?',
    secenekler: [
      'Modelin ağırlıkları bozulmuş',
      'Aydınlatma, kamera açısı veya ürün görünümü değişmiş',
      'Kamera çözünürlüğü düşmüş',
      'Etiketler silinmiş',
    ],
    dogruIndeks: 1,
    aciklama:
      'Görü sistemlerinde en yaygın kayma nedeni çevresel değişimdir: aydınlatma, kirlenme, açı veya ürün varyantı. Bu yüzden saha görüntüleri düzenli örneklenip etiketlenmeli.',
  },
  {
    kimlik: 'cv_012',
    konu: 'Computer Vision',
    altKonu: 'Etiketleme',
    zorluk: 'orta',
    beceri: 'Etiketleme stratejisi',
    soru: 'Sınırlı etiketleme bütçesi varken hangi örnekler öncelikle etiketlenmelidir?',
    secenekler: [
      'Rastgele seçilen örnekler',
      'Modelin en emin olduğu örnekler',
      'Modelin en emin olmadığı ve sınıra yakın örnekler',
      'En eski örnekler',
    ],
    dogruIndeks: 2,
    aciklama:
      'Aktif öğrenme mantığı: modelin kararsız kaldığı örnekler en çok bilgi taşır. Emin olduğu örnekleri etiketlemek bütçeyi boşa harcar.',
  },
  {
    kimlik: 'cv_015',
    konu: 'Computer Vision',
    altKonu: 'Çok modlu',
    zorluk: 'orta',
    beceri: 'Mimari seçimi',
    soru: 'Görsel-dil modelleri klasik OCR hattına göre nerede daha güçlüdür?',
    secenekler: [
      'Karakter düzeyinde kesin okumada',
      'Tablo ve form yapısını anlamada',
      'Çıkarım hızında',
      'Bellek kullanımında',
    ],
    dogruIndeks: 1,
    aciklama:
      'Görsel-dil modelleri düzen ve ilişki anlamada güçlüdür. Ancak karakter düzeyinde kesinlik ve hız gerektiren işlerde klasik OCR hâlâ üstündür; ikisi birlikte kullanılabilir.',
  },
  {
    kimlik: 'cv_018',
    konu: 'Computer Vision',
    altKonu: 'Gizlilik',
    zorluk: 'ileri',
    beceri: 'Risk yönetimi',
    soru: 'İş güvenliği kamerası projesinde gizlilik riskini azaltmanın en etkili yolu nedir?',
    secenekler: [
      'Görüntüleri daha uzun saklamak',
      'İşlemeyi kenar cihazda yapıp yalnızca olay meta verisini merkeze göndermek',
      'Çözünürlüğü artırmak',
      'Tüm görüntüleri buluta yüklemek',
    ],
    dogruIndeks: 1,
    aciklama:
      'Görüntü merkeze hiç gitmiyorsa sızma yüzeyi büyük ölçüde daralır. Kenar işleme + meta veri aktarımı, hem gizlilik hem bant genişliği açısından tercih edilir.',
  },
];

/* --- DEĞERLENDİRME -------------------------------------------------------- */

export const DEGERLENDIRME: Soru[] = [
  {
    kimlik: 'eval_002',
    konu: 'MLOps / LLMOps',
    altKonu: 'Görev seti',
    zorluk: 'orta',
    beceri: 'Ölçüm tasarımı',
    soru: 'Değerlendirme görev seti nereden toplanmalıdır?',
    secenekler: [
      'Sentetik olarak modelden üretilerek',
      'Gerçek kullanımdan gelen isteklerden',
      'Kamuya açık benchmark setlerinden',
      'Ekibin aklına gelen örneklerden',
    ],
    dogruIndeks: 1,
    aciklama:
      'Gerçek istekler, kullanıcıların nasıl yazdığını ve hangi uç durumların çıktığını taşır. Sentetik ve kamuya açık setler destekleyici olabilir ama üretim kalitesini temsil etmez.',
    ilgiliAtlas: 'evaluation',
  },
  {
    kimlik: 'eval_005',
    konu: 'MLOps / LLMOps',
    altKonu: 'Puanlama',
    zorluk: 'orta',
    beceri: 'Ölçüm tasarımı',
    soru: 'Çok adımlı görevlerde ikili (başarılı/başarısız) puanlamanın sakıncası nedir?',
    secenekler: [
      'Hesaplaması zordur',
      'Kısmi iyileşmeyi görünmez kılar',
      'İnsan değerlendirici gerektirir',
      'Regresyon testine bağlanamaz',
    ],
    dogruIndeks: 1,
    aciklama:
      'Yedi adımın altısını doğru yapan bir akış ile hiçbirini yapmayan akış aynı skoru alır. Kısmi başarı puanlanmazsa iyileştirme çalışmaları ölçülemez.',
  },
  {
    kimlik: 'eval_008',
    konu: 'MLOps / LLMOps',
    altKonu: 'LLM yargıcı',
    zorluk: 'ileri',
    beceri: 'Ölçüm tasarımı',
    soru: 'Model çıktısını başka bir modele puanlatırken en büyük risk nedir?',
    secenekler: [
      'Maliyet',
      'Yargıç modelin sistematik yanlılığı ve kendi çıktısını kayırması',
      'Gecikme',
      'Token sınırı',
    ],
    dogruIndeks: 1,
    aciklama:
      'LLM yargıçları uzun, kendinden emin ve kendi üslubuna benzeyen cevapları kayırma eğilimi gösterir. Bu yüzden yargıç puanları insan örneklemesiyle kalibre edilmelidir.',
  },
  {
    kimlik: 'eval_011',
    konu: 'MLOps / LLMOps',
    altKonu: 'Regresyon',
    zorluk: 'orta',
    beceri: 'Regresyon',
    soru: 'İstem değişikliği yapıldığında değerlendirme ne zaman çalıştırılmalıdır?',
    secenekler: [
      'Ayda bir',
      'Her değişiklikte, aynı görev seti üzerinde',
      'Yalnızca şikâyet geldiğinde',
      'Model sürümü değişince',
    ],
    dogruIndeks: 1,
    aciklama:
      'İstem de bir kod değişikliğidir. Aynı set üzerinde her değişiklikte çalıştırılan regresyon testi, sessiz kalite düşüşünü yakalamanın tek yoludur.',
  },
  {
    kimlik: 'eval_014',
    konu: 'MLOps / LLMOps',
    altKonu: 'Gözlemlenebilirlik',
    zorluk: 'orta',
    beceri: 'İzleme',
    soru: 'Üretimdeki bir ajan akışında kök neden analizi için en gerekli kayıt nedir?',
    secenekler: [
      'Yalnızca son cevap',
      'Her adımdaki istem, araç çağrısı, parametreler ve dönen sonuç',
      'Yalnızca toplam gecikme',
      'Kullanıcı kimliği',
    ],
    dogruIndeks: 1,
    aciklama:
      'Son cevaba bakarak zincirin neresinde hata olduğu anlaşılamaz. Adım adım izleme kaydı olmadan ajan hatası teşhis edilemez.',
  },
  {
    kimlik: 'eval_017',
    konu: 'MLOps / LLMOps',
    altKonu: 'Benchmark okuma',
    zorluk: 'ileri',
    beceri: 'Ölçüm okuryazarlığı',
    soru: 'Bir benchmark sonucunu değerlendirirken hangi bilgi eksikse sonuç kullanılamaz?',
    secenekler: [
      'Modelin fiyatı',
      'Ölçüm tarihi, model sürümü ve örnekleme ayarları',
      'Sonucu yayımlayan kişinin unvanı',
      'Testin İngilizce olması',
    ],
    dogruIndeks: 1,
    aciklama:
      'Aynı model ailesinin farklı sürümleri çok farklı sonuç verir; örnekleme ayarları da skoru değiştirir. Bu üçü olmadan sonuç yeniden üretilemez, dolayısıyla karşılaştırılamaz.',
  },
];

/* --- AI GÜVENLİĞİ --------------------------------------------------------- */

export const AI_GUVENLIGI: Soru[] = [
  {
    kimlik: 'sec_003',
    konu: 'AI Security',
    altKonu: 'İstem enjeksiyonu',
    zorluk: 'ileri',
    beceri: 'Tehdit modelleme',
    soru: 'Dolaylı istem enjeksiyonunda saldırgan kim veya nedir?',
    secenekler: [
      'Sistemi kullanan kişi',
      'Modelin okuduğu dış içerik',
      'Model sağlayıcısı',
      'Vektör veritabanı',
    ],
    dogruIndeks: 1,
    aciklama:
      'Dolaylı enjeksiyonda kullanıcı masumdur; talimat, modelin işlediği bir belgeye, web sayfasına veya e-postaya gizlenmiştir. Bu yüzden dış içerik asla talimat olarak değerlendirilmemelidir.',
    ilgiliAtlas: 'prompt-injection',
  },
  {
    kimlik: 'sec_007',
    konu: 'AI Security',
    altKonu: 'Veri sızıntısı',
    zorluk: 'ileri',
    beceri: 'Veri koruma',
    soru: 'Bir kurumsal asistanda veri sızıntısı riskini artıran en yaygın tasarım hatası nedir?',
    secenekler: [
      'Çok fazla araç tanımlamak',
      'Erişim denetimini model istemine bırakmak',
      'Sıcaklığı yüksek tutmak',
      'Uzun bağlam penceresi kullanmak',
    ],
    dogruIndeks: 1,
    aciklama:
      'Model, bağlamına giren her şeyi kullanabilir. "Bu kullanıcıya şunu göstermeyin" talimatı bir güvenlik kontrolü değildir; filtreleme veri katmanında yapılmalıdır.',
  },
  {
    kimlik: 'sec_011',
    konu: 'AI Security',
    altKonu: 'Yetkilendirme',
    zorluk: 'ileri',
    beceri: 'Yetkilendirme',
    soru: 'En az yetki ilkesi bir ajan için pratikte ne anlama gelir?',
    secenekler: [
      'Ajanın hiç araç kullanmaması',
      'Ajanın yalnızca o görev için gereken araç ve veriye erişebilmesi',
      'Ajanın yalnızca okuma yapması',
      'Ajanın tüm oturum boyunca sabit yetkiye sahip olması',
    ],
    dogruIndeks: 1,
    aciklama:
      'Yetki görev bazında verilir ve görev bitince kalkar. Oturum boyunca geniş yetki tutmak, tek bir enjeksiyonun etkisini tüm oturuma yaymak demektir.',
  },
  {
    kimlik: 'sec_015',
    konu: 'AI Security',
    altKonu: 'Model çıktısı',
    zorluk: 'orta',
    beceri: 'Güvenli entegrasyon',
    soru: 'Model çıktısı bir sistem komutuna veya sorguya dönüştürülecekse ne yapılmalıdır?',
    secenekler: [
      'Çıktıya doğrudan güvenilmeli',
      'Çıktı güvenilmeyen girdi kabul edilip doğrulanmalı ve parametreleştirilmeli',
      'Çıktı kısaltılmalı',
      'Çıktı loglanmamalı',
    ],
    dogruIndeks: 1,
    aciklama:
      'Model çıktısı kullanıcı girdisi gibi ele alınmalıdır. Doğrudan komut veya sorgu olarak çalıştırmak, klasik enjeksiyon açıklarının yapay zekâ sürümünü yaratır.',
  },
  {
    kimlik: 'sec_019',
    konu: 'AI Security',
    altKonu: 'Denetim',
    zorluk: 'orta',
    beceri: 'Denetlenebilirlik',
    soru: 'Bir yapay zekâ olayı sonrası soruşturma yapabilmek için asgari gereksinim nedir?',
    secenekler: [
      'Modelin ağırlıklarına erişim',
      'Her adımı, girdisini ve çıktısını kapsayan değişmez denetim kaydı',
      'Sağlayıcının destek bileti',
      'Kullanıcı anketleri',
    ],
    dogruIndeks: 1,
    aciklama:
      'Ne olduğu yazılı değilse soruşturma yapılamaz. Hangi adımda hangi araç hangi parametreyle çağrıldı sorusuna cevap veren kayıt, olay müdahalesinin temelidir.',
  },
  {
    kimlik: 'sec_023',
    konu: 'AI Security',
    altKonu: 'Kırmızı takım',
    zorluk: 'ileri',
    beceri: 'Tehdit modelleme',
    soru: 'Enjeksiyon testleri neden bir kez yapılıp bırakılmamalıdır?',
    secenekler: [
      'Test maliyeti düşük olduğu için',
      'Model sürümü, istem ve araç kümesi değiştikçe saldırı yüzeyi değişir',
      'Kullanıcı sayısı arttığı için',
      'Regülasyon zorunlu kıldığı için',
    ],
    dogruIndeks: 1,
    aciklama:
      'Her model yükseltmesi, yeni araç veya istem değişikliği yeni açıklar getirebilir. Kırmızı takım senaryoları regresyon testinin parçası olmalıdır.',
  },
];

/* --- AI ETİĞİ ------------------------------------------------------------- */

export const AI_ETIGI: Soru[] = [
  {
    kimlik: 'eth_002',
    konu: 'Responsible AI',
    altKonu: 'Yanlılık',
    zorluk: 'baslangic',
    beceri: 'Yanlılık tespiti',
    soru: 'Bir işe alım modeli belirli bir grubu sistematik olarak düşük puanlıyorsa ilk şüphelenilecek kaynak nedir?',
    secenekler: [
      'Model mimarisi',
      'Eğitim verisindeki geçmiş kararların yanlılığı',
      'Sunucu yapılandırması',
      'Kullanıcı arayüzü',
    ],
    dogruIndeks: 1,
    aciklama:
      'Model geçmiş kararları öğrenir. Geçmişte yanlı kararlar verilmişse model bunu kalıcılaştırır; bu yüzden veri denetimi mimariden önce gelir.',
  },
  {
    kimlik: 'eth_006',
    konu: 'Responsible AI',
    altKonu: 'Şeffaflık',
    zorluk: 'baslangic',
    beceri: 'Şeffaflık',
    soru: 'Kullanıcıya yapay zekâ ile etkileşimde olduğunu bildirmek neden gerekir?',
    secenekler: [
      'Yasal zorunluluk olmadığı için gerekmez',
      'Kullanıcının cevabı nasıl değerlendireceğini ve ne zaman doğrulama yapacağını bilmesi için',
      'Modelin performansını artırdığı için',
      'Maliyet hesabı için',
    ],
    dogruIndeks: 1,
    aciklama:
      'Kaynağı bilmeyen kullanıcı, cevaba ne kadar güvenmesi gerektiğine karar veremez. Şeffaflık, kullanıcının doğrulama sorumluluğunu üstlenebilmesi için ön koşuldur.',
  },
  {
    kimlik: 'eth_010',
    konu: 'Responsible AI',
    altKonu: 'Yönetişim',
    zorluk: 'orta',
    beceri: 'Yönetişim',
    soru: 'Kurumsal yapay zekâ yönetişiminin ilk adımı nedir?',
    secenekler: [
      'Bir model seçmek',
      'Kullanım ve model envanteri çıkarıp risk sınıflandırması yapmak',
      'Eğitim programı başlatmak',
      'Bütçe ayırmak',
    ],
    dogruIndeks: 1,
    aciklama:
      'Neyin nerede, hangi veriyle kullanıldığı bilinmiyorsa politika yazılamaz ve denetim yapılamaz. Envanter ve risk sınıflandırması yönetişimin temelidir.',
  },
  {
    kimlik: 'eth_014',
    konu: 'Responsible AI',
    altKonu: 'Açıklanabilirlik',
    zorluk: 'orta',
    beceri: 'Açıklanabilirlik',
    soru: 'Kredi reddi gibi yüksek etkili kararlarda açıklanabilirlik neden zorunludur?',
    secenekler: [
      'Model doğruluğunu artırdığı için',
      'Etkilenen kişinin itiraz edebilmesi ve kararın denetlenebilmesi için',
      'Hesaplama maliyetini düşürdüğü için',
      'Veri setini küçülttüğü için',
    ],
    dogruIndeks: 1,
    aciklama:
      'Gerekçe bilinmiyorsa itiraz hakkı işlevsizleşir ve denetim yapılamaz. Bu yüzden yüksek riskli kararlarda gerekçe üretimi sistem gereksinimidir.',
  },
  {
    kimlik: 'eth_018',
    konu: 'Responsible AI',
    altKonu: 'İnsan denetimi',
    zorluk: 'baslangic',
    beceri: 'Risk yönetimi',
    soru: '"İnsan döngüde" (human-in-the-loop) yaklaşımının etkili olması için ne gerekir?',
    secenekler: [
      'İnsanın her çıktıyı onaylaması',
      'İnsanın kararı gerçekten değerlendirebileceği bilgi ve zamana sahip olması',
      'Onay ekranının hızlı olması',
      'Modelin kendinden emin olması',
    ],
    dogruIndeks: 1,
    aciklama:
      'Saniyede onaylanan bir akışta insan denetimi biçimseldir. Anlamlı denetim için gerekçe, kaynak ve yeterli zaman sağlanmalıdır.',
  },
  {
    kimlik: 'eth_022',
    konu: 'Responsible AI',
    altKonu: 'Regülasyon',
    zorluk: 'orta',
    beceri: 'Uyum',
    soru: 'Risk tabanlı düzenleyici yaklaşımların temel mantığı nedir?',
    secenekler: [
      'Tüm yapay zekâ sistemlerine aynı yükümlülükleri getirmek',
      'Yükümlülüğü kullanım senaryosunun yaratabileceği zarara göre ölçeklendirmek',
      'Yalnızca büyük şirketleri düzenlemek',
      'Yalnızca açık kaynak modelleri düzenlemek',
    ],
    dogruIndeks: 1,
    aciklama:
      'Aynı model, film önerisinde düşük riskli, kredi kararında yüksek riskli olabilir. Risk tabanlı yaklaşım yükümlülüğü teknolojiye değil kullanıma bağlar.',
  },
];

/* --- SEVİYE TESTİ (genel) ------------------------------------------------- */

export const SEVIYE_SORULARI: Soru[] = [
  AI_TEMELLERI[0]!,
  AI_TEMELLERI[2]!,
  AI_TEMELLERI[4]!,
  AI_TEMELLERI[5]!,
  GENERATIVE_AI[1]!,
  GENERATIVE_AI[5]!,
  LLM[0]!,
  LLM[1]!,
  LLM[3]!,
  RAG[0]!,
  RAG[1]!,
  AI_AGENT[0]!,
  AI_AGENT[1]!,
  DEGERLENDIRME[0]!,
  AI_ETIGI[1]!,
];
