import type { AtlasGirdisi, Blok } from '@/lib/tipler';
import { ATLAS_KATEGORILERI } from '@/lib/taksonomi';
import { ATLAS_EKLERI } from './govde/atlas-derinlik';
import { ATLAS_TEMEL } from './govde/atlas-temel';
import { ATLAS_UYGULAMA } from './govde/atlas-uygulama';

/** ÖRNEK VERİ — yer tutucu. Bkz. `lib/veri/temel.ts` başlığı. */

/**
 * Kategori listesi taksonomidir, fixture değil: `lib/taksonomi.ts` içinde
 * durur ve buradan yeniden yayımlanır (mevcut içe alımlar kırılmasın diye).
 */
export { ATLAS_KATEGORILERI };

const ATLAS_CEKIRDEK: AtlasGirdisi[] = [
  {
    slug: 'rag',
    ad: 'Retrieval-Augmented Generation',
    altAd: 'RAG · Geri getirmeyle güçlendirilmiş üretim',
    kategori: 'Large Language Models',
    kisaTanim:
      'Dil modelinin cevap üretmeden önce harici bilgi kaynaklarından ilgili bilgiyi getirip oluşturduğu bağlama eklediği yapay zekâ mimarisidir.',
    seviye: 'orta',
    ilgili: ['Embedding', 'Vector Database', 'Reranking', 'Chunking'],
    onkosullar: ['Embedding', 'Tokenization'],
    sonDogrulama: '2026-09-04',
    yayinTarihi: '2026-06-12',
    guncellemeTarihi: '2026-09-04',
    yazarSlug: 'sukru-yusuf-kaya',
    inceleyenSlug: 'sinaptik-research',
    govde: [
      {
        tip: 'altbaslik',
        metin: '30 saniyede RAG',
        kimlik: 'otuz-saniyede',
      },
      {
        tip: 'paragraf',
        metin:
          'Bir dil modeli yalnızca eğitim verisindeki bilgiyi taşır ve bu bilgi zamanla eskir. RAG, modele soru sorulduğunda önce bir arama yapar, bulduğu ilgili belge parçalarını istemin içine yerleştirir ve modelden cevabı bu parçalara dayanarak üretmesini ister. Böylece model, eğitimde görmediği kurumsal veya güncel bilgiyi kullanabilir.',
      },
      { tip: 'altbaslik', metin: 'RAG nasıl çalışır?', kimlik: 'nasil-calisir' },
      {
        tip: 'akis',
        adimlar: [
          { ad: 'Parçalama', aciklama: 'Belgeler anlamlı bütünlüğü koruyan parçalara bölünür.' },
          { ad: 'Gömme', aciklama: 'Her parça, anlamını taşıyan bir vektöre dönüştürülür.' },
          { ad: 'Dizinleme', aciklama: 'Vektörler bir vektör veritabanında saklanır.' },
          { ad: 'Geri getirme', aciklama: 'Soru da vektöre çevrilir, en yakın parçalar bulunur.' },
          { ad: 'Yeniden sıralama', aciklama: 'Adaylar alaka düzeyine göre yeniden sıralanır.' },
          { ad: 'Üretim', aciklama: 'Model, seçilen parçaları bağlam alarak cevabı yazar.' },
        ],
      },
      {
        tip: 'altbaslik',
        metin: 'RAG ile fine-tuning arasındaki fark',
        kimlik: 'rag-vs-fine-tuning',
      },
      {
        tip: 'tablo',
        basliklar: ['Boyut', 'RAG', 'Fine-tuning'],
        satirlar: [
          ['Neyi değiştirir', 'Çıkarım anındaki bağlamı', 'Model parametrelerini'],
          ['Güncelleme', 'Belgeyi değiştirmek yeter', 'Yeniden eğitim gerekir'],
          ['Kaynak gösterme', 'Doğal olarak mümkün', 'Doğrudan mümkün değil'],
          ['Tipik kullanım', 'Değişen bilgi, kurumsal belge', 'Biçim, üslup, alan dili'],
        ],
        aciklama: 'İkisi birbirinin alternatifi değildir; sıkça birlikte kullanılır.',
      },
      { tip: 'altbaslik', metin: 'Avantajlar ve sınırlılıklar', kimlik: 'artilar-eksiler' },
      {
        tip: 'liste',
        ogeler: [
          'Bilgi güncellemesi için modele dokunmak gerekmez.',
          'Cevap, dayandığı kaynağa bağlanabilir — denetlenebilirlik artar.',
          'Erişim denetimi belge katmanında uygulanabilir.',
        ],
      },
      {
        tip: 'uyari',
        ton: 'dikkat',
        metin:
          'RAG halüsinasyonu ortadan kaldırmaz. Geri getirme yanlış parçayı bulursa model kendinden emin biçimde yanlış cevap üretir. Bu yüzden geri getirme kalitesi ayrı ölçülmelidir.',
      },
      { tip: 'altbaslik', metin: 'Kullanım alanları', kimlik: 'kullanim-alanlari' },
      {
        tip: 'liste',
        ogeler: [
          'Teknik destek: ürün dokümantasyonu üzerinden cevap üretme.',
          'Bakım: ekipman el kitaplarında arıza kodu arama.',
          'Hukuk ve uyum: sözleşme ve mevzuat metinlerinde dayanak bulma.',
          'İK: iç politika ve prosedür soruları.',
        ],
      },
    ],
    sss: [
      {
        soru: 'RAG için fine-tuning gerekir mi?',
        cevap:
          'Hayır. RAG, model parametrelerine dokunmadan çalışır. Üslup veya alan diline uyum gerekiyorsa ikisi birlikte kullanılabilir.',
      },
      {
        soru: 'Parça uzunluğu ne olmalı?',
        cevap:
          'Tek bir doğru değer yoktur; belgenin yapısına bağlıdır. Anlamlı bütünlüğü bölmeyen, örtüşmeli parçalar genellikle daha iyi sonuç verir.',
      },
      {
        soru: 'RAG neden yanlış cevap veriyor?',
        cevap:
          'Sorunun kaynağı çoğunlukla üretim değil geri getirmedir. İlk adımda doğru parça bulunmuyorsa modelin yapabileceği bir şey yoktur.',
      },
    ],
    kaynaklar: [
      {
        ad: 'Vektör veritabanı ürün dokümantasyonları',
        yayinci: 'Sağlayıcılar',
        tur: 'Dokümantasyon',
      },
      {
        ad: 'Sinaptik Research — geri getirme kalitesi notları',
        yayinci: 'Sinaptik Lab',
        tur: 'Teknik rapor',
      },
    ],
    surumler: [
      {
        surum: 'v1.2',
        tarih: '2026-09-04',
        degisiklik: 'Yeniden sıralama bölümü ve hibrit arama notu eklendi.',
      },
      {
        surum: 'v1.1',
        tarih: '2026-07-30',
        degisiklik: 'RAG ile fine-tuning karşılaştırma tablosu eklendi.',
      },
      { surum: 'v1.0', tarih: '2026-06-12', degisiklik: 'İlk yayın.' },
    ],
  },
  {
    slug: 'ai-agent',
    ad: 'AI Agent',
    altAd: 'Yapay zekâ ajanı',
    kategori: 'AI Agents',
    kisaTanim:
      'Bir hedefi gerçekleştirmek için plan kuran, araç çağıran ve ara sonuçlara göre kendi adımlarını güncelleyen yapay zekâ sistemidir.',
    seviye: 'orta',
    ilgili: ['Tool Use', 'Planning', 'Memory', 'MCP'],
    onkosullar: ['Prompt Engineering', 'Function Calling'],
    sonDogrulama: '2026-09-07',
    yayinTarihi: '2026-05-28',
    guncellemeTarihi: '2026-09-07',
    yazarSlug: 'sukru-yusuf-kaya',
    govde: [
      { tip: 'altbaslik', metin: 'Ajanı sohbet botundan ayıran ne?', kimlik: 'fark' },
      {
        tip: 'paragraf',
        metin:
          'Sohbet botu bir istem alır ve bir cevap üretir. Ajan bir hedef alır: hedefi alt görevlere böler, her görev için uygun aracı çağırır, dönen sonucu değerlendirir ve gerekirse planını değiştirir. Fark tek bir cevapta değil, döngüde.',
      },
      { tip: 'altbaslik', metin: 'Bileşenler', kimlik: 'bilesenler' },
      {
        tip: 'liste',
        ogeler: [
          'Planlayıcı: hedefi doğrulanabilir adımlara böler.',
          'Araç katmanı: dış sistemlerle şemaya uygun biçimde konuşur.',
          'Bellek: önceki adımların sonucunu ve kısıtları taşır.',
          'Doğrulayıcı: çıktının beklenen biçim ve içerikte olup olmadığını denetler.',
        ],
      },
      { tip: 'altbaslik', metin: 'Nerede kırılıyor?', kimlik: 'kirilma-noktalari' },
      {
        tip: 'paragraf',
        metin:
          'Pratikte en sık görülen üç arıza: bağlam büyüdükçe erken adımdaki kısıtların unutulması, araç şemasına uymayan parametre üretimi ve başarısız adımdan sonra aynı hatayı tekrarlayan döngüler. Üçü de model kalitesinden çok sistem tasarımıyla çözülür.',
      },
      {
        tip: 'uyari',
        ton: 'dikkat',
        metin:
          'Araç kullanabilen bir ajan, eriştiği her sistemde o aracın yetkisine sahiptir. Dolaylı istem enjeksiyonu bu yüzden bir metin filtreleme değil yetkilendirme sorunudur.',
      },
    ],
    sss: [
      {
        soru: 'Ajan için hangi model gerekir?',
        cevap:
          'Araç çağırmayı ve yapılandırılmış çıktıyı güvenilir üreten bir model gerekir. En büyük model her zaman en iyi seçim değildir; adım başına gecikme ve maliyet belirleyicidir.',
      },
      {
        soru: 'Çok ajanlı sistem her zaman daha mı iyi?',
        cevap:
          'Hayır. Her ek ajan yeni bir hata yüzeyi ve gecikme ekler. Tek ajanla çözülebilen bir akışı bölmek genellikle kaliteyi düşürür.',
      },
    ],
    surumler: [
      {
        surum: 'v1.3',
        tarih: '2026-09-07',
        degisiklik: 'Kırılma noktaları ve yetki uyarısı eklendi.',
      },
      { surum: 'v1.0', tarih: '2026-05-28', degisiklik: 'İlk yayın.' },
    ],
  },
  {
    slug: 'transformer',
    ad: 'Transformer',
    kategori: 'Deep Learning',
    kisaTanim:
      'Dizideki her ögenin diğerleriyle ilişkisini dikkat mekanizmasıyla hesaplayan, modern dil ve görü modellerinin temelindeki sinir ağı mimarisidir.',
    seviye: 'ileri',
    ilgili: ['Attention', 'Embedding', 'Tokenization', 'Mixture of Experts'],
    onkosullar: ['Neural Networks'],
    sonDogrulama: '2026-08-28',
    yayinTarihi: '2026-04-03',
    yazarSlug: 'sinaptik-research',
    govde: [
      { tip: 'altbaslik', metin: 'Temel fikir', kimlik: 'temel-fikir' },
      {
        tip: 'paragraf',
        metin:
          'Önceki dizi modelleri girdiyi sırayla işliyordu; bu hem uzun bağımlılıkları zayıflatıyor hem paralelleşmeyi engelliyordu. Transformer, her ögenin diğer tüm ögelerle ilişkisini aynı anda hesaplayan dikkat mekanizmasını kullanır. Böylece uzak bağımlılıklar korunur ve eğitim paralelleşir.',
      },
      { tip: 'altbaslik', metin: 'Dikkat neyi hesaplar?', kimlik: 'dikkat' },
      {
        tip: 'paragraf',
        metin:
          'Her öge için üç temsil üretilir: sorgu, anahtar ve değer. Bir ögenin sorgusu diğer ögelerin anahtarlarıyla karşılaştırılır; çıkan benzerlik ağırlıkları, o ögelerin değerlerini ne kadar dikkate alacağını belirler.',
      },
      {
        tip: 'alinti',
        metin:
          'Dikkat, "bu kelimeyi anlamak için cümlenin hangi kısımlarına bakmalıyım?" sorusunun öğrenilebilir bir cevabıdır.',
      },
    ],
    sss: [
      {
        soru: 'Transformer yalnızca metin için mi kullanılır?',
        cevap:
          'Hayır. Görsel, ses ve çok modlu modellerde de aynı mimari kullanılır; değişen şey girdinin nasıl parçalara bölündüğüdür.',
      },
    ],
  },
  {
    slug: 'embedding',
    ad: 'Embedding',
    altAd: 'Gömme vektörü',
    kategori: 'Large Language Models',
    kisaTanim:
      'Metin, görsel veya sesin anlamsal yakınlığı koruyacak biçimde sayısal vektörlere dönüştürülmüş temsilidir.',
    seviye: 'baslangic',
    ilgili: ['Vector Database', 'Semantic Search', 'RAG', 'Tokenization'],
    sonDogrulama: '2026-09-01',
    yayinTarihi: '2026-04-19',
    yazarSlug: 'sinaptik-research',
    govde: [
      { tip: 'altbaslik', metin: 'Neden vektör?', kimlik: 'neden-vektor' },
      {
        tip: 'paragraf',
        metin:
          'Bilgisayar "kedi" ile "kedigil" arasındaki yakınlığı harf benzerliğinden anlayamaz. Gömme, anlamı bir koordinat sistemine taşır: benzer anlamlı ifadeler birbirine yakın noktalara düşer. Böylece anlam, mesafe hesabına indirgenir.',
      },
      { tip: 'altbaslik', metin: 'Nerede kullanılır?', kimlik: 'kullanim' },
      {
        tip: 'liste',
        ogeler: [
          'Anlamsal arama ve öneri.',
          'RAG hattında ilgili belge parçasını bulma.',
          'Kümeleme ve konu keşfi.',
          'Yinelenen kayıt tespiti.',
        ],
      },
      {
        tip: 'uyari',
        ton: 'bilgi',
        metin:
          'Farklı gömme modellerinin vektörleri birbiriyle karşılaştırılamaz. Model değiştirirseniz tüm dizini yeniden üretmeniz gerekir.',
      },
    ],
    sss: [
      {
        soru: 'Kaç boyut gerekir?',
        cevap:
          'Boyut sayısı modelin kararıdır; daha yüksek boyut her zaman daha iyi sonuç vermez ama depolama ve arama maliyetini artırır.',
      },
    ],
  },
  {
    slug: 'mcp',
    ad: 'Model Context Protocol',
    altAd: 'MCP',
    kategori: 'AI Agents',
    kisaTanim:
      'Dil modeli uygulamalarının harici araç ve veri kaynaklarına standart bir arayüz üzerinden bağlanmasını sağlayan açık protokoldür.',
    seviye: 'orta',
    ilgili: ['Tool Use', 'Function Calling', 'AI Agent'],
    sonDogrulama: '2026-09-06',
    yayinTarihi: '2026-06-02',
    govde: [
      { tip: 'altbaslik', metin: 'Hangi sorunu çözüyor?', kimlik: 'sorun' },
      {
        tip: 'paragraf',
        metin:
          'Her model sağlayıcısının araç tanımlama biçimi farklı olduğunda, aynı aracı her istemci için yeniden yazmak gerekir. MCP, araç ve veri kaynağı tanımını istemciden bağımsız hale getirir: bir kez sunucu yazılır, protokolü konuşan her istemci kullanabilir.',
      },
      {
        tip: 'liste',
        ogeler: [
          'Araçlar: modelin çağırabileceği işlemler.',
          'Kaynaklar: modelin okuyabileceği veri.',
          'İstemler: yeniden kullanılabilir şablonlar.',
        ],
      },
    ],
  },
  {
    slug: 'mixture-of-experts',
    ad: 'Mixture of Experts',
    altAd: 'MoE · Uzmanlar karışımı',
    kategori: 'Large Language Models',
    kisaTanim:
      'Her girdi için ağdaki uzman alt bloklardan yalnızca birkaçını etkinleştirerek kapasiteyi maliyetten ayıran model mimarisidir.',
    seviye: 'ileri',
    ilgili: ['Routing', 'Quantization', 'Transformer'],
    sonDogrulama: '2026-08-22',
    yayinTarihi: '2026-05-10',
    govde: [
      { tip: 'altbaslik', metin: 'Kapasite ile maliyeti ayırmak', kimlik: 'kapasite' },
      {
        tip: 'paragraf',
        metin:
          'Yoğun bir modelde her girdi tüm parametrelerden geçer; parametre artışı doğrudan maliyet artışıdır. MoE mimarisinde bir yönlendirici, girdiyi yalnızca birkaç uzman bloğa gönderir. Toplam parametre büyür ama girdi başına yapılan işlem sabit kalır.',
      },
      {
        tip: 'uyari',
        ton: 'dikkat',
        metin:
          'Kazanç bedava değil: tüm uzmanlar bellekte tutulmak zorunda olduğu için bellek ihtiyacı yoğun modele göre yüksektir.',
      },
    ],
  },
  {
    slug: 'prompt-injection',
    ad: 'Prompt Injection',
    altAd: 'İstem enjeksiyonu',
    kategori: 'AI Security',
    kisaTanim:
      'Modelin işlediği içeriğe gizlenen yönergelerle sistem talimatlarının geçersiz kılınmaya çalışıldığı saldırı sınıfıdır.',
    seviye: 'orta',
    ilgili: ['Jailbreaking', 'Tool Use', 'AI Agent'],
    sonDogrulama: '2026-09-08',
    yayinTarihi: '2026-06-25',
    yazarSlug: 'sukru-yusuf-kaya',
    govde: [
      { tip: 'altbaslik', metin: 'Doğrudan ve dolaylı enjeksiyon', kimlik: 'turler' },
      {
        tip: 'paragraf',
        metin:
          'Doğrudan enjeksiyonda kullanıcı, modele sistem talimatını yok saymasını söyler. Dolaylı enjeksiyonda talimat modelin okuduğu bir belgeye, web sayfasına veya e-postaya gizlenir — kullanıcı saldırgan değildir, içerik saldırgandır.',
      },
      {
        tip: 'uyari',
        ton: 'dikkat',
        metin:
          'Araç kullanan ajanlarda dolaylı enjeksiyon, modelin yetkisiyle işlem yapılması anlamına gelir. Çözüm yalnızca metin filtrelemek değil, ajanın erişimini en az yetkiye indirmektir.',
      },
      { tip: 'altbaslik', metin: 'Azaltma yöntemleri', kimlik: 'azaltma' },
      {
        tip: 'liste',
        ogeler: [
          'Araç yetkilerini görev bazında daraltmak.',
          'Geri döndürülemez işlemler için insan onayı istemek.',
          'Dış içeriği veri olarak işaretleyip talimat olarak değerlendirmemek.',
          'Çıktı doğrulaması ve denetim kaydı.',
        ],
      },
    ],
  },
  {
    slug: 'vector-database',
    ad: 'Vector Database',
    altAd: 'Vektör veritabanı',
    kategori: 'AI Infrastructure',
    kisaTanim:
      'Yüksek boyutlu vektörleri saklayıp anlamsal yakınlığa göre hızlı komşu araması yapabilen veri tabanıdır.',
    seviye: 'orta',
    ilgili: ['Embedding', 'RAG', 'Semantic Search'],
    sonDogrulama: '2026-08-30',
    yayinTarihi: '2026-05-02',
    govde: [
      { tip: 'altbaslik', metin: 'Yaklaşık komşu araması', kimlik: 'ann' },
      {
        tip: 'paragraf',
        metin:
          'Milyonlarca vektör arasında kesin en yakın komşuyu bulmak pahalıdır. Bu yüzden pratikte yaklaşık algoritmalar kullanılır: küçük bir doğruluk kaybı karşılığında arama süresi büyük ölçüde düşer.',
      },
      {
        tip: 'paragraf',
        metin:
          'Kurumsal kullanımda saf anlamsal arama tek başına yetmez; ürün kodu veya madde numarası gibi kesin eşleşmeler için lexical katmanla birleştirilen hibrit arama tercih edilir.',
      },
    ],
  },
  {
    slug: 'tokenization',
    ad: 'Tokenization',
    altAd: 'Simgeleştirme',
    kategori: 'Large Language Models',
    kisaTanim: 'Metnin, modelin işleyebileceği en küçük birimlere (token) bölünmesi işlemidir.',
    seviye: 'baslangic',
    ilgili: ['Embedding', 'Context Window', 'Transformer'],
    sonDogrulama: '2026-08-18',
    govde: [
      { tip: 'altbaslik', metin: 'Neden kelime değil token?', kimlik: 'neden-token' },
      {
        tip: 'paragraf',
        metin:
          'Kelime temelli bir sözlük, görülmemiş kelimeler karşısında çaresizdir. Alt kelime parçaları kullanıldığında model, daha önce hiç görmediği bir kelimeyi bile parçalarından oluşturabilir. Bu, eklemeli bir dil olan Türkçe için özellikle önemlidir.',
      },
      {
        tip: 'uyari',
        ton: 'bilgi',
        metin:
          'Türkçe metinler aynı bilgi için genellikle İngilizceden daha fazla token harcar; maliyet ve bağlam hesaplarında bu farkı göz önünde tutun.',
      },
    ],
  },
  {
    slug: 'context-window',
    ad: 'Context Window',
    altAd: 'Bağlam penceresi',
    kategori: 'Large Language Models',
    kisaTanim:
      'Bir modelin tek seferde dikkate alabileceği toplam token miktarıdır; istem, ek bağlam ve üretilen cevap bu bütçeyi paylaşır.',
    seviye: 'baslangic',
    ilgili: ['Tokenization', 'RAG', 'Memory'],
    sonDogrulama: '2026-09-02',
    govde: [
      { tip: 'altbaslik', metin: 'Büyük pencere her şeyi çözer mi?', kimlik: 'buyuk-pencere' },
      {
        tip: 'paragraf',
        metin:
          'Hayır. Pencere büyüdükçe modelin ortadaki bilgiyi gözden kaçırma eğilimi ve maliyet artar. Pratikte doğru soru "kaç token sığıyor" değil, "hangi bilgiyi pencereye koymalıyım" sorusudur.',
      },
    ],
  },
  {
    slug: 'fine-tuning',
    ad: 'Fine-Tuning',
    altAd: 'İnce ayar',
    kategori: 'Large Language Models',
    kisaTanim:
      'Önceden eğitilmiş bir modelin, belirli bir görev veya alana uyum sağlaması için ek veriyle yeniden eğitilmesidir.',
    seviye: 'ileri',
    ilgili: ['RAG', 'Quantization', 'Evaluation'],
    sonDogrulama: '2026-08-26',
    govde: [
      { tip: 'altbaslik', metin: 'Ne zaman gerekir?', kimlik: 'ne-zaman' },
      {
        tip: 'liste',
        ogeler: [
          'Sabit bir çıktı biçimi veya üslup gerektiğinde.',
          'Alan diline özgü terminoloji yoğun olduğunda.',
          'Gecikme bütçesi uzun istemlere izin vermediğinde.',
        ],
      },
      {
        tip: 'uyari',
        ton: 'dikkat',
        metin:
          'Sık değişen olgusal bilgi için ince ayar yanlış araçtır; bu iş geri getirmeye (RAG) aittir.',
      },
    ],
  },
  {
    slug: 'hallucination',
    ad: 'Hallucination',
    altAd: 'Halüsinasyon',
    kategori: 'Responsible AI',
    kisaTanim: 'Modelin akıcı ve kendinden emin biçimde, gerçekle uyuşmayan bilgi üretmesidir.',
    seviye: 'baslangic',
    ilgili: ['RAG', 'Evaluation', 'Grounding'],
    sonDogrulama: '2026-09-05',
    govde: [
      { tip: 'altbaslik', metin: 'Neden oluyor?', kimlik: 'neden' },
      {
        tip: 'paragraf',
        metin:
          'Dil modeli bir doğruluk veritabanı değil, olasılık modelidir: en olası devamı üretir. Bilmediği bir konuda da en olası görünen metni ürettiği için sonuç akıcı ama yanlış olabilir.',
      },
      {
        tip: 'liste',
        ogeler: [
          'Kaynağa dayandırma (grounding) ve alıntı gösterme.',
          'Cevabı doğrulayan ikinci bir adım eklemek.',
          '"Bilmiyorum" cevabını ödüllendiren değerlendirme tasarlamak.',
        ],
      },
    ],
  },
  {
    slug: 'multimodal-ai',
    ad: 'Multimodal AI',
    altAd: 'Çok modlu yapay zekâ',
    kategori: 'Generative AI',
    kisaTanim:
      'Metin, görsel, ses ve video gibi birden fazla veri türünü aynı model içinde birlikte işleyen yapay zekâ yaklaşımıdır.',
    seviye: 'orta',
    ilgili: ['Transformer', 'Computer Vision', 'Embedding'],
    sonDogrulama: '2026-08-31',
    govde: [
      { tip: 'altbaslik', metin: 'Ortak temsil uzayı', kimlik: 'ortak-uzay' },
      {
        tip: 'paragraf',
        metin:
          'Çok modlu modellerin temel fikri, farklı veri türlerini aynı vektör uzayına taşımaktır. Bir görselin ve onu tarif eden cümlenin birbirine yakın noktalara düşmesi, modele modaliteler arasında geçiş yapma imkânı verir.',
      },
    ],
  },
  {
    slug: 'evaluation',
    ad: 'Evaluation',
    altAd: 'Değerlendirme · Evals',
    kategori: 'MLOps / LLMOps',
    kisaTanim:
      'Bir yapay zekâ sisteminin çıktısının, tanımlı ölçütlere göre sistematik biçimde ölçülmesidir.',
    seviye: 'orta',
    ilgili: ['Benchmark', 'AI Agent', 'Observability'],
    sonDogrulama: '2026-09-09',
    yazarSlug: 'sinaptik-research',
    govde: [
      { tip: 'altbaslik', metin: 'Genel benchmark yeterli değil', kimlik: 'genel-benchmark' },
      {
        tip: 'paragraf',
        metin:
          'Kamuya açık benchmarklar modelleri karşılaştırmak için yararlıdır ama sizin iş akışınızı temsil etmez. Üretim kalitesini ölçmek için kendi görev setinizi, kendi başarı tanımınızla kurmanız gerekir.',
      },
      {
        tip: 'akis',
        adimlar: [
          { ad: 'Görev seti', aciklama: 'Gerçek kullanımdan örnekler toplanır.' },
          { ad: 'Başarı tanımı', aciklama: 'Doğru cevabın ne olduğu yazılı hale getirilir.' },
          { ad: 'Ölçüm', aciklama: 'Otomatik ve insan değerlendirmesi birlikte yürütülür.' },
          { ad: 'Regresyon', aciklama: 'Her değişiklikte aynı set tekrar çalıştırılır.' },
        ],
      },
    ],
  },
];

/**
 * Birleşen gövdelerde ALTBAŞLIK KİMLİKLERİNİ tekilleştirir.
 *
 * NEDEN GEREKLİ: birleştirme üç gövdeyi ardı ardına ekliyor
 * (`onGovde + govde + ekGovde`) ve derinleştirme katmanını yazan, çekirdek
 * girdide hangi başlıkların bulunduğunu bilmiyor. Sonuç: aynı `kimlik` iki
 * blokta görünüyor. Bunun iki görünür sonucu var — `<h2 id>` iki kez basılıyor
 * (geçersiz HTML) ve içindekiler tablosundaki iki madde aynı çıpaya gidiyor,
 * yani ikinci bölüme hiçbir bağlantı ulaşmıyor. Üç girdide gerçekleşmişti:
 * `hallucination` (#neden), `prompt-injection` (#turler), `vector-database`
 * (#ann).
 *
 * İKİ AYRI DURUM, İKİ AYRI KARAR:
 *
 * 1. Kimlik VE başlık metni aynı → derinleştirme katmanı var olan bölümün
 *    derin sürümünü yazmış. Sonraki BAŞLIK BLOĞU düşürülür, altındaki
 *    içerik durur: iki bölüm tek bölüm olur. İçerik kaybı olmaz.
 * 2. Kimlik aynı, başlık metni farklı → gerçekten başka bir bölüm, kimliği
 *    yanlış yazılmış. Bu kez başlık KORUNUR, kimliğe sayı eklenir. Başlığı
 *    düşürmek burada içerik kaybı olurdu.
 *
 * Düzeltme birleştirme anında yapılır, elle değil: yeni bir derinleştirme
 * bölümü eklendiğinde aynı çakışma sessizce geri gelmesin.
 */
function kimlikleriTekille(bloklar: Blok[]): Blok[] {
  const gorulen = new Map<string, string>();
  const sonuc: Blok[] = [];

  for (const blok of bloklar) {
    if (blok.tip !== 'altbaslik' || !blok.kimlik) {
      sonuc.push(blok);
      continue;
    }
    const oncekiMetin = gorulen.get(blok.kimlik);
    if (oncekiMetin === undefined) {
      gorulen.set(blok.kimlik, blok.metin);
      sonuc.push(blok);
      continue;
    }
    // 1. durum: aynı bölümün derin sürümü — başlığı bir kez bas.
    if (oncekiMetin === blok.metin) continue;
    // 2. durum: başka bölüm, kimliği çakışmış — kimliği ayrıştır.
    let sayi = 2;
    let yeniKimlik = `${blok.kimlik}-${sayi}`;
    while (gorulen.has(yeniKimlik)) {
      sayi += 1;
      yeniKimlik = `${blok.kimlik}-${sayi}`;
    }
    gorulen.set(yeniKimlik, blok.metin);
    sonuc.push({ ...blok, kimlik: yeniKimlik });
  }

  return sonuc;
}

/**
 * Atlas üç kaynaktan birleşir:
 * 1. `ATLAS_CEKIRDEK` — bu dosyadaki ilk yayın girdileri.
 * 2. `ATLAS_EKLERI` — derinleştirme katmanı (ek bölüm, SSS, kaynak, sürüm).
 * 3. `ATLAS_TEMEL` + `ATLAS_UYGULAMA` — ayrı modüllerde tutulan girdiler.
 *
 * Üretimde bu birleştirmeyi MongoDB sorgusu yapacak; şimdilik derleme anında
 * yapılıyor ve sonuç ada göre sıralanıyor.
 */
const DERINLESTIRILMIS: AtlasGirdisi[] = ATLAS_CEKIRDEK.map((girdi) => {
  const ek = ATLAS_EKLERI[girdi.slug];
  if (!ek) return girdi;
  return {
    ...girdi,
    govde: kimlikleriTekille([
      ...(ek.onGovde ?? []),
      ...(girdi.govde ?? []),
      ...(ek.ekGovde ?? []),
    ]),
    sss: [...(girdi.sss ?? []), ...(ek.sss ?? [])].length
      ? [...(girdi.sss ?? []), ...(ek.sss ?? [])]
      : undefined,
    kaynaklar: girdi.kaynaklar ?? ek.kaynaklar,
    surumler: girdi.surumler ?? ek.surumler,
  };
});

export const ATLAS: AtlasGirdisi[] = [...DERINLESTIRILMIS, ...ATLAS_TEMEL, ...ATLAS_UYGULAMA].sort(
  (a, b) => a.ad.localeCompare(b.ad, 'tr'),
);

export function atlasBul(slug: string) {
  return ATLAS.find((girdi) => girdi.slug === slug);
}

export function kategoriyeGoreAtlas(kategoriSlug: string) {
  const kategori = ATLAS_KATEGORILERI.find((k) => k.slug === kategoriSlug);
  if (!kategori) return [];
  return ATLAS.filter((girdi) => girdi.kategori === kategori.ad);
}

/** Kategori bazında yayında olan girdi sayısı. */
export function kategoriAdedi(kategoriSlug: string) {
  const kategori = ATLAS_KATEGORILERI.find((k) => k.slug === kategoriSlug);
  if (!kategori) return 0;
  return ATLAS.filter((girdi) => girdi.kategori === kategori.ad).length;
}

/** Sözlük görünümü: Atlas girdilerinin tek satırlık tanımları. */
export const SOZLUK = ATLAS.map((girdi) => ({
  slug: girdi.slug,
  terim: girdi.ad,
  kisaltma: girdi.altAd,
  tanim: girdi.kisaTanim,
  kategori: girdi.kategori,
}));
