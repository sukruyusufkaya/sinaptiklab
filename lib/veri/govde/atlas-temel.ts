import type { AtlasGirdisi } from '@/lib/tipler';

/**
 * ÖRNEK VERİ — yer tutucu.
 *
 * Atlas'ın temel katmanı: alanın omurgasını kuran kavramlar. Bunlar beceri
 * grafiğinin kök ve gövde düğümleridir; diğer tüm girdiler bunlara yaslanır.
 *
 * Her girdi MASTER-PLAN §26 kalıbını izler: tanım → nasıl çalışır → örnek →
 * yanılgılar → nerede kullanılır → ilgili kavramlar → SSS → kaynak → sürüm.
 * Sayısal örnekler TEMSİLÎ'dir; ölçüm olarak alıntılanamaz.
 */

export const ATLAS_TEMEL: AtlasGirdisi[] = [
  /* ---------------------------------------------------------------------- */
  {
    slug: 'artificial-intelligence',
    ad: 'Artificial Intelligence',
    altAd: 'AI · Yapay zekâ',
    kategori: 'Artificial Intelligence',
    kisaTanim:
      'Öğrenme, çıkarım yapma, algılama ve karar verme gibi insan zihnine atfedilen görevleri yazılım ve donanımla gerçekleştirmeyi amaçlayan bilgisayar bilimi alanıdır.',
    seviye: 'baslangic',
    ilgili: ['Machine Learning', 'Deep Learning', 'Generative AI', 'Responsible AI'],
    sonDogrulama: '2026-09-08',
    yayinTarihi: '2026-03-14',
    guncellemeTarihi: '2026-09-08',
    yazarSlug: 'sukru-yusuf-kaya',
    inceleyenSlug: 'sinaptik-research',
    govde: [
      {
        tip: 'kisa-cevap',
        metin:
          'Yapay zekâ, tek bir teknoloji değil bir alandır: içinde kural tabanlı sistemlerden makine öğrenmesine, derin öğrenmeden üretken modellere uzanan farklı yaklaşımlar bulunur. Bugün "AI" denince çoğunlukla makine öğrenmesinin bir alt kümesi olan derin öğrenme kastedilir.',
      },
      { tip: 'altbaslik', metin: 'Alanın katmanları', kimlik: 'katmanlar' },
      {
        tip: 'paragraf',
        metin:
          'Kavramları iç içe halkalar olarak düşünmek, tartışmaların çoğunu netleştirir. En geniş halka yapay zekâ; içinde makine öğrenmesi, onun içinde derin öğrenme, onun içinde de üretken modeller ve dil modelleri yer alır. Bir sistem "yapay zekâ" olabilir ama makine öğrenmesi kullanmıyor olabilir; örneğin bir uzman sistem.',
      },
      {
        tip: 'tablo',
        basliklar: ['Katman', 'Nasıl karar verir', 'Tipik örnek'],
        satirlar: [
          ['Kural tabanlı yapay zekâ', 'İnsanın yazdığı kurallarla', 'Uzman sistem, karar tablosu'],
          ['Makine öğrenmesi', 'Veriden çıkarılan örüntüyle', 'Kredi skoru, talep tahmini'],
          ['Derin öğrenme', 'Çok katmanlı sinir ağıyla', 'Görüntü sınıflandırma, konuşma tanıma'],
          ['Üretken modeller', 'Öğrenilen dağılımdan üreterek', 'Metin, görsel ve kod üretimi'],
        ],
        aciklama: 'Katmanlar birbirini dışlamaz; üretim sistemleri genellikle karışım kullanır.',
      },
      { tip: 'altbaslik', metin: 'Dar yapay zekâ ve genel yapay zekâ', kimlik: 'dar-genel' },
      {
        tip: 'paragraf',
        metin:
          'Bugün üretimde olan her sistem dar yapay zekâdır: belirli bir görev kümesinde iyi, dışına çıkıldığında güvenilmez. Genel yapay zekâ (AGI), insan düzeyinde geniş yetkinliği tanımlayan ve üzerinde ortak bir ölçüt bulunmayan bir hedef. Bu ayrım pratik açıdan önemli: bir sistemin bir görevde etkileyici olması, komşu görevde çalışacağı anlamına gelmez.',
      },
      { tip: 'altbaslik', metin: 'Sık görülen yanılgılar', kimlik: 'yanilgilar' },
      {
        tip: 'liste',
        ogeler: [
          '"Yapay zekâ düşünür" — model, olasılık dağılımından örnekleme yapar; niyeti veya inancı yoktur.',
          '"Model öğrendiği her şeyi hatırlar" — eğitim verisi bir veritabanı değildir; bilgi parametrelere dağılmıştır ve geri getirilmesi garanti değildir.',
          '"Daha fazla veri her zaman daha iyi" — veri kalitesi ve temsil gücü, hacimden önce gelir.',
          '"Yapay zekâ tarafsızdır" — model eğitim verisindeki eğilimleri taşır; tarafsızlık bir varsayım değil, ölçülmesi gereken bir özelliktir.',
        ],
      },
      { tip: 'altbaslik', metin: 'Nerede kullanılır?', kimlik: 'kullanim' },
      {
        tip: 'liste',
        ogeler: [
          'Sınıflandırma ve tahmin: risk skoru, talep planlama, arıza öngörüsü.',
          'Algılama: görüntü, ses ve sensör verisinden bilgi çıkarma.',
          'Üretim: metin, görsel, ses ve kod üretimi.',
          'Karar desteği: belge özetleme, önceliklendirme, senaryo karşılaştırma.',
          'Otomasyon: araç kullanan ajanlarla çok adımlı iş akışlarını yürütme.',
        ],
      },
      {
        tip: 'uyari',
        ton: 'bilgi',
        metin:
          'Bir işin yapay zekâya uygun olup olmadığını anlamanın en hızlı yolu üç soru: girdi veri olarak var mı, çıktı doğrulanabilir mi, hata geri alınabilir mi?',
      },
    ],
    sss: [
      {
        soru: 'Yapay zekâ ile makine öğrenmesi aynı şey mi?',
        cevap:
          'Değil. Makine öğrenmesi, yapay zekânın veriden öğrenme yaklaşımını kullanan alt alanıdır. Kural tabanlı bir uzman sistem yapay zekâdır ama makine öğrenmesi değildir.',
      },
      {
        soru: 'AGI ne zaman gelir?',
        cevap:
          'Üzerinde uzlaşılmış bir tanım ve ölçüt olmadığı için tarih vermek spekülasyondur. Kurumsal kararlar için daha faydalı soru, bugünkü dar sistemlerin hangi görevde ölçülmüş biçimde yeterli olduğu.',
      },
      {
        soru: 'Yapay zekâ projesine nereden başlanır?',
        cevap:
          'Modelden değil işten. Tekrar sayısı yüksek, çıktısı doğrulanabilir ve hatası geri alınabilir bir süreç seçmek, teknoloji seçiminden önce gelir.',
      },
    ],
    kaynaklar: [
      {
        ad: 'Sinaptik Lab — alan tanımları ve taksonomi notları',
        yayinci: 'Sinaptik Lab',
        tur: 'Teknik rapor',
      },
    ],
    surumler: [
      {
        surum: 'v1.2',
        tarih: '2026-09-08',
        degisiklik: 'Katman tablosu ve yanılgılar bölümü eklendi.',
      },
      { surum: 'v1.0', tarih: '2026-03-14', degisiklik: 'İlk yayın.' },
    ],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'machine-learning',
    ad: 'Machine Learning',
    altAd: 'ML · Makine öğrenmesi',
    kategori: 'Machine Learning',
    kisaTanim:
      'Kuralları insanın yazması yerine, örnek veriden istatistiksel örüntü çıkararak yeni veride tahmin üretmeyi öğrenen sistemlerin alanıdır.',
    seviye: 'baslangic',
    ilgili: ['Neural Networks', 'Deep Learning', 'Evaluation', 'MLOps'],
    onkosullar: ['Artificial Intelligence'],
    sonDogrulama: '2026-09-05',
    yayinTarihi: '2026-03-20',
    guncellemeTarihi: '2026-09-05',
    yazarSlug: 'sinaptik-research',
    govde: [
      {
        tip: 'kisa-cevap',
        metin:
          'Makine öğrenmesinde programcı çıktıyı değil, çıktıya ulaşma yöntemini öğrenecek bir yapıyı yazar. Model, etiketli veya etiketsiz örnekler üzerinden bir fonksiyon öğrenir ve bu fonksiyonu daha önce görmediği veriye uygular.',
      },
      { tip: 'altbaslik', metin: 'Üç temel öğrenme biçimi', kimlik: 'ogrenme-bicimleri' },
      {
        tip: 'tablo',
        basliklar: ['Biçim', 'Veri', 'Amaç', 'Örnek'],
        satirlar: [
          [
            'Gözetimli',
            'Girdi + doğru etiket',
            'Etiketi tahmin etmek',
            'Kredi riski, talep tahmini',
          ],
          ['Gözetimsiz', 'Yalnızca girdi', 'Yapı keşfetmek', 'Müşteri kümeleme, anomali tespiti'],
          [
            'Pekiştirmeli',
            'Ortam + ödül sinyali',
            'Ödülü maksimize eden politika bulmak',
            'Kaynak planlama, oyun ve kontrol',
          ],
        ],
        aciklama:
          'Pratikte melez kurulumlar da yaygın: az etiketli veriyle yarı gözetimli öğrenme, veya kendi kendini gözetleyen ön eğitim.',
      },
      { tip: 'altbaslik', metin: 'Genelleme: asıl problem', kimlik: 'genelleme' },
      {
        tip: 'paragraf',
        metin:
          'Makine öğrenmesinin tek gerçek sorusu şudur: model, eğitimde görmediği veride de çalışıyor mu? Eğitim verisini ezberleyen bir model, kendi verisinde kusursuz, sahada işe yaramaz olur. Bu duruma aşırı uyum (overfitting) denir. Tersi de mümkün: model fazla basitse örüntüyü hiç yakalayamaz (eksik uyum).',
      },
      {
        tip: 'akis',
        adimlar: [
          {
            ad: 'Problem çerçeveleme',
            aciklama: 'İş sorusu, tahmin edilecek bir hedefe çevrilir.',
          },
          {
            ad: 'Veri hazırlama',
            aciklama: 'Toplama, temizleme, sızıntı kontrolü ve özellik üretimi.',
          },
          { ad: 'Ayrım', aciklama: 'Eğitim, doğrulama ve test kümeleri sızıntısız ayrılır.' },
          { ad: 'Eğitim', aciklama: 'Model, eğitim kümesinde parametrelerini öğrenir.' },
          { ad: 'Doğrulama', aciklama: 'Hiperparametreler doğrulama kümesinde ayarlanır.' },
          { ad: 'Test', aciklama: 'Yalnızca bir kez açılan test kümesinde nihai ölçüm yapılır.' },
          { ad: 'İzleme', aciklama: 'Üretimde veri ve kavram sürüklenmesi takip edilir.' },
        ],
      },
      {
        tip: 'uyari',
        ton: 'dikkat',
        metin:
          'Etiket sızıntısı en pahalı hatadır: tahmin anında bilinemeyecek bir bilginin özelliklere karışması. Doğrulamada mükemmel görünen bir model, üretimde tamamen çöker.',
      },
      { tip: 'altbaslik', metin: 'Sık görülen yanılgılar', kimlik: 'yanilgilar' },
      {
        tip: 'liste',
        ogeler: [
          '"Doğruluk yeterli bir metriktir" — dengesiz sınıflarda %99 doğruluk hiçbir şey öğrenmemiş bir modeli de tanımlayabilir.',
          '"Korelasyon nedenselliktir" — model ilişkiyi bulur, nedeni bulmaz; müdahale kararı için nedensel çıkarım gerekir.',
          '"Model bir kez eğitilir" — veri dağılımı değişir; yeniden eğitim planı olmayan model zamanla bozulur.',
          '"Derin öğrenme her zaman daha iyidir" — yapılandırılmış tablo verisinde ağaç tabanlı yöntemler sıkça öndedir.',
        ],
      },
    ],
    sss: [
      {
        soru: 'Ne kadar veri gerekir?',
        cevap:
          'Sabit bir eşik yok; problemin karmaşıklığına, sınıf sayısına ve gürültü seviyesine bağlı. Pratik yaklaşım öğrenme eğrisi çıkarmak: veri arttıkça doğrulama başarısı platoya ulaşıyorsa veri değil yöntem sınırlıyor demektir.',
      },
      {
        soru: 'Aşırı uyum nasıl anlaşılır?',
        cevap:
          'Eğitim başarısı yükselirken doğrulama başarısının düşmesiyle. Karşı önlemler: daha fazla veri, düzenlileştirme, model basitleştirme ve erken durdurma.',
      },
      {
        soru: 'Klasik makine öğrenmesi hâlâ gerekli mi?',
        cevap:
          'Evet. Tablo verisi, küçük veri kümeleri, yorumlanabilirlik gereksinimi ve düşük gecikme bütçesi olan senaryolarda klasik yöntemler hem daha ucuz hem sıkça daha isabetli.',
      },
    ],
    kaynaklar: [
      {
        ad: 'Sinaptik Lab — model değerlendirme notları',
        yayinci: 'Sinaptik Lab',
        tur: 'Teknik rapor',
      },
    ],
    surumler: [
      { surum: 'v1.1', tarih: '2026-09-05', degisiklik: 'Genelleme ve sızıntı bölümleri eklendi.' },
      { surum: 'v1.0', tarih: '2026-03-20', degisiklik: 'İlk yayın.' },
    ],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'neural-networks',
    ad: 'Neural Networks',
    altAd: 'Sinir ağları',
    kategori: 'Deep Learning',
    kisaTanim:
      'Girdiyi ağırlıklı toplamlar ve doğrusal olmayan aktivasyonlardan geçiren katmanlar dizisiyle işleyen, hatayı geri yayarak ağırlıklarını güncelleyen model ailesidir.',
    seviye: 'orta',
    ilgili: ['Deep Learning', 'Transformer', 'Machine Learning'],
    onkosullar: ['Machine Learning'],
    sonDogrulama: '2026-09-02',
    yayinTarihi: '2026-04-01',
    yazarSlug: 'sinaptik-research',
    govde: [
      {
        tip: 'kisa-cevap',
        metin:
          'Bir sinir ağı, basit birimlerin katmanlar hâlinde bağlanmasıyla karmaşık fonksiyonları temsil eder. Her birim girdilerini ağırlıklarla çarpıp toplar, sonucu doğrusal olmayan bir fonksiyondan geçirir; öğrenme, bu ağırlıkların hatayı azaltacak yönde güncellenmesidir.',
      },
      { tip: 'altbaslik', metin: 'Öğrenme döngüsü', kimlik: 'ogrenme-dongusu' },
      {
        tip: 'akis',
        adimlar: [
          { ad: 'İleri geçiş', aciklama: 'Girdi katmanlardan geçer, bir tahmin üretilir.' },
          { ad: 'Kayıp', aciklama: 'Tahmin ile doğru cevap arasındaki fark bir sayıya indirilir.' },
          {
            ad: 'Geri yayılım',
            aciklama: 'Kaybın her ağırlığa göre türevi zincir kuralıyla hesaplanır.',
          },
          { ad: 'Güncelleme', aciklama: 'Ağırlıklar, gradyanın ters yönünde küçük bir adım atar.' },
          { ad: 'Tekrar', aciklama: 'Döngü, doğrulama başarısı platoya ulaşana kadar sürer.' },
        ],
      },
      { tip: 'altbaslik', metin: 'Doğrusal olmayanlık neden şart?', kimlik: 'dogrusal-olmayan' },
      {
        tip: 'paragraf',
        metin:
          'Aktivasyon fonksiyonu olmadan, üst üste konmuş doğrusal katmanlar tek bir doğrusal katmana indirgenir; derinliğin hiçbir getirisi olmaz. Doğrusal olmayan bir fonksiyon (ReLU ve türevleri gibi) eklendiğinde ağ, parçalı ve karmaşık karar sınırlarını temsil edebilir hale gelir.',
      },
      { tip: 'altbaslik', metin: 'Pratikte ne bozulur?', kimlik: 'sorunlar' },
      {
        tip: 'liste',
        ogeler: [
          'Kaybolan ve patlayan gradyan: derin ağlarda gradyan sinyali zayıflar veya aşırı büyür; artık bağlantılar ve normalizasyon bunu yumuşatır.',
          'Öğrenme oranı hatası: çok büyükse eğitim ıraksar, çok küçükse yakınsama pratikte bitmez.',
          'Aşırı uyum: parametre sayısı veriye göre büyükse ağ ezberler; seyreltme ve veri artırma gerekir.',
          'Yeniden üretilemezlik: rastgele tohum, donanım ve kütüphane sürümü sonucu değiştirir; deney kaydı şart.',
        ],
      },
      {
        tip: 'uyari',
        ton: 'bilgi',
        metin:
          'Bir sinir ağının "beyin gibi çalıştığı" benzetmesi tarihsel bir esinlenmedir, mekanik bir eşdeğerlik değil. Biyolojik nöronlarla matematiksel birimler arasındaki fark, benzerlikten büyüktür.',
      },
    ],
    sss: [
      {
        soru: 'Kaç katman gerekir?',
        cevap:
          'Veri miktarı ve problemin karmaşıklığına göre değişir. Pratik yol, çalışan en küçük mimariden başlayıp doğrulama başarısı artmayı bırakana kadar büyütmek.',
      },
      {
        soru: 'Geri yayılım nedir?',
        cevap:
          'Kaybın her ağırlığa göre türevini, zincir kuralını kullanarak çıkıştan girişe doğru verimli biçimde hesaplayan algoritmadır. Öğrenmenin kendisi değil, öğrenmeyi mümkün kılan hesaplama yöntemidir.',
      },
    ],
    surumler: [{ surum: 'v1.0', tarih: '2026-04-01', degisiklik: 'İlk yayın.' }],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'deep-learning',
    ad: 'Deep Learning',
    altAd: 'Derin öğrenme',
    kategori: 'Deep Learning',
    kisaTanim:
      'Çok katmanlı sinir ağlarıyla, ham veriden özellikleri elle tanımlamaya gerek kalmadan hiyerarşik temsiller öğrenen makine öğrenmesi yaklaşımıdır.',
    seviye: 'orta',
    ilgili: ['Neural Networks', 'Transformer', 'Computer Vision', 'Generative AI'],
    onkosullar: ['Neural Networks'],
    sonDogrulama: '2026-09-03',
    yayinTarihi: '2026-04-08',
    yazarSlug: 'sinaptik-research',
    govde: [
      {
        tip: 'kisa-cevap',
        metin:
          'Derin öğrenmenin ayırt edici katkısı, özellik mühendisliğini otomatikleştirmesidir. Klasik makine öğrenmesinde hangi özelliklerin önemli olduğunu insan tanımlar; derin öğrenmede ağ, katman katman giderek daha soyut temsiller öğrenir.',
      },
      { tip: 'altbaslik', metin: 'Hiyerarşik temsil', kimlik: 'hiyerarsik-temsil' },
      {
        tip: 'paragraf',
        metin:
          'Görüntü işleyen bir ağda ilk katmanlar kenar ve renk geçişi gibi ilkel desenlere, orta katmanlar doku ve parça biçimlerine, üst katmanlar nesne düzeyindeki kavramlara duyarlı hale gelir. Aynı ilke metinde de geçerli: alt katmanlar yüzeysel dil yapısını, üst katmanlar anlamsal ilişkileri taşır.',
      },
      { tip: 'altbaslik', metin: 'Neden şimdi işe yaradı?', kimlik: 'neden-simdi' },
      {
        tip: 'liste',
        sirali: true,
        ogeler: [
          'Veri: dijitalleşmeyle büyük ölçekli etiketli ve etiketsiz veri erişilebilir hale geldi.',
          'Hesaplama: paralel donanım, büyük ağların eğitimini ekonomik kıldı.',
          'Yöntem: artık bağlantılar, normalizasyon ve dikkat mekanizması derin ağların eğitilebilirliğini çözdü.',
          'Araç: açık kaynak çerçeveler deney maliyetini düşürdü.',
        ],
      },
      { tip: 'altbaslik', metin: 'Maliyeti ne?', kimlik: 'maliyet' },
      {
        tip: 'tablo',
        basliklar: ['Boyut', 'Klasik ML', 'Derin öğrenme'],
        satirlar: [
          ['Veri ihtiyacı', 'Düşük-orta', 'Yüksek'],
          ['Özellik mühendisliği', 'Elle, alan bilgisiyle', 'Büyük ölçüde öğrenilir'],
          ['Yorumlanabilirlik', 'Genellikle yüksek', 'Düşük; ek tekniklerle kısmen'],
          ['Eğitim maliyeti', 'Düşük', 'Yüksek; donanıma bağlı'],
          ['Tablo verisinde başarı', 'Sıkça öndedir', 'Çoğu zaman geride'],
          ['Görüntü, ses, metinde başarı', 'Zayıf', 'Belirgin üstün'],
        ],
        aciklama: 'Seçim veri türüne bağlı; genel bir üstünlük iddiası yanıltıcıdır.',
      },
      {
        tip: 'uyari',
        ton: 'dikkat',
        metin:
          'Derin öğrenme, veri kalitesi sorunlarını çözmez; büyütür. Kirli etiketle eğitilen büyük bir ağ, kirli örüntüyü daha güvenle öğrenir.',
      },
    ],
    sss: [
      {
        soru: 'Derin öğrenme ile sinir ağı aynı şey mi?',
        cevap:
          'Sinir ağı model ailesidir; derin öğrenme bu ailenin çok katmanlı ve temsil öğrenmeye dayanan kullanımını tanımlayan yaklaşımdır. Sığ bir sinir ağı derin öğrenme sayılmaz.',
      },
      {
        soru: 'Transfer öğrenme nedir?',
        cevap:
          'Büyük bir veri kümesinde eğitilmiş bir modelin öğrendiği temsillerin, küçük bir hedef görevde başlangıç noktası olarak kullanılmasıdır. Az veriyle yüksek başarı elde etmenin en pratik yolu.',
      },
    ],
    surumler: [{ surum: 'v1.0', tarih: '2026-04-08', degisiklik: 'İlk yayın.' }],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'llm',
    ad: 'Large Language Model',
    altAd: 'LLM · Büyük dil modeli',
    kategori: 'Large Language Models',
    kisaTanim:
      'Çok büyük metin derlemleri üzerinde bir sonraki tokeni tahmin etmeyi öğrenmiş, transformer tabanlı ve genel amaçlı dil görevlerinde kullanılabilen sinir ağı modelidir.',
    seviye: 'orta',
    ilgili: ['Transformer', 'Tokenization', 'Context Window', 'Fine-Tuning', 'RAG'],
    onkosullar: ['Transformer', 'Tokenization'],
    sonDogrulama: '2026-09-09',
    yayinTarihi: '2026-04-25',
    guncellemeTarihi: '2026-09-09',
    yazarSlug: 'sukru-yusuf-kaya',
    inceleyenSlug: 'sinaptik-research',
    govde: [
      {
        tip: 'kisa-cevap',
        metin:
          'Bir büyük dil modeli, tek bir görevi öğrenmek yerine çok geniş metin üzerinde "sıradaki token ne olmalı" sorusunu öğrenir. Bu basit hedef, ölçek büyüdüğünde özetleme, çeviri, kod yazma ve muhakeme gibi yetenekleri yan ürün olarak ortaya çıkarır.',
      },
      { tip: 'altbaslik', metin: 'Nasıl eğitilir?', kimlik: 'egitim' },
      {
        tip: 'akis',
        adimlar: [
          {
            ad: 'Ön eğitim',
            aciklama:
              'Geniş derlem üzerinde sıradaki tokeni tahmin etme hedefiyle temel yetenek kazanılır.',
          },
          {
            ad: 'Talimat uyumu',
            aciklama: 'Talimat-cevap çiftleriyle modelin istenen biçimde yanıt vermesi öğretilir.',
          },
          {
            ad: 'Tercih hizalama',
            aciklama: 'İnsan veya model tercihlerine göre yararlılık ve güvenlik ayarlanır.',
          },
          {
            ad: 'Değerlendirme',
            aciklama: 'Yetenek, güvenlik ve kalibrasyon ölçülür; sürüm kararı verilir.',
          },
        ],
      },
      { tip: 'altbaslik', metin: 'Çıkarım anında ne olur?', kimlik: 'cikarim' },
      {
        tip: 'paragraf',
        metin:
          'Model, verilen bağlama bakarak sıradaki token için bir olasılık dağılımı üretir ve bu dağılımdan bir token seçer; sonra seçilen tokeni bağlama ekleyip aynı işlemi tekrarlar. Sıcaklık (temperature) ve çekirdek örnekleme (top-p) gibi ayarlar, bu seçimin ne kadar belirleyici veya çeşitli olacağını kontrol eder.',
      },
      {
        tip: 'tablo',
        basliklar: ['Ayar', 'Düşük değer', 'Yüksek değer', 'Ne zaman'],
        satirlar: [
          [
            'Sıcaklık',
            'Tutarlı, tekrar eden',
            'Çeşitli, öngörülemez',
            'Sınıflandırmada düşük, yaratıcı metinde yüksek',
          ],
          ['top-p', 'Dar aday kümesi', 'Geniş aday kümesi', 'Yapılandırılmış çıktıda dar tutulur'],
          [
            'Maksimum token',
            'Kısa, kesilme riski',
            'Uzun, maliyetli',
            'Beklenen çıktı uzunluğuna göre',
          ],
        ],
        aciklama: 'Ayar adları ve aralıkları sağlayıcıya göre değişir.',
      },
      { tip: 'altbaslik', metin: 'Sık görülen yanılgılar', kimlik: 'yanilgilar' },
      {
        tip: 'liste',
        ogeler: [
          '"Model internete bakıyor" — bakmıyor; yalnızca araç verilirse bakabilir. Aksi hâlde yalnızca eğitim bilgisi ve bağlamla çalışır.',
          '"Aynı soruya aynı cevabı verir" — örnekleme rastgeledir; belirlenimci davranış için sıcaklık sıfıra yakın ayarlanmalı ve yine de garanti değildir.',
          '"Cevap kendinden eminse doğrudur" — dil akıcılığı ile olgusal doğruluk birbirinden bağımsız.',
          '"Bağlam penceresi büyükse her şeyi hatırlar" — uzun bağlamda modelin bilgiyi kullanması tekdüze değildir.',
        ],
      },
      {
        tip: 'uyari',
        ton: 'dikkat',
        metin:
          'Bir modelin "bilmiyorum" diyebilmesi ayrı bir yetenektir ve ayrı ölçülmelidir. Kalibrasyonu kötü bir model, insan denetimini de işlevsiz kılar.',
      },
    ],
    sss: [
      {
        soru: 'LLM ile üretken yapay zekâ aynı şey mi?',
        cevap:
          'Değil. Üretken yapay zekâ görsel, ses ve video üreten modelleri de kapsayan geniş bir başlık; büyük dil modeli bunun metin odaklı alt kümesi.',
      },
      {
        soru: 'Kurumsal bilgiyi modele nasıl öğretirim?',
        cevap:
          'Çoğu senaryoda doğru cevap geri getirmedir (RAG): bilgi belgede kalır, modele çıkarım anında verilir. Üslup ve alan dili gerekiyorsa ince ayar buna eklenebilir.',
      },
      {
        soru: 'Neden bazen yanlış ama çok inandırıcı cevap veriyor?',
        cevap:
          'Model, olasılıkla akıcı bir devam üretir; doğruluk kontrolü mimarisinde yoktur. Bu davranışa halüsinasyon denir ve dış doğrulama olmadan ortadan kalkmaz.',
      },
    ],
    kaynaklar: [
      {
        ad: 'Model kartları ve teknik raporlar',
        yayinci: 'Model sağlayıcıları',
        tur: 'Teknik rapor',
      },
      {
        ad: 'Sinaptik Research — model karşılaştırma notları',
        yayinci: 'Sinaptik Lab',
        tur: 'Teknik rapor',
      },
    ],
    surumler: [
      { surum: 'v1.2', tarih: '2026-09-09', degisiklik: 'Örnekleme ayarları tablosu eklendi.' },
      { surum: 'v1.1', tarih: '2026-07-11', degisiklik: 'Eğitim aşamaları akışı eklendi.' },
      { surum: 'v1.0', tarih: '2026-04-25', degisiklik: 'İlk yayın.' },
    ],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'generative-ai',
    ad: 'Generative AI',
    altAd: 'Üretken yapay zekâ',
    kategori: 'Generative AI',
    kisaTanim:
      'Öğrendiği veri dağılımından yeni metin, görsel, ses, video veya kod örnekleri üreten model ailesinin genel adıdır.',
    seviye: 'baslangic',
    ilgili: ['LLM', 'Multimodal AI', 'Diffusion', 'Prompt Engineering'],
    onkosullar: ['Deep Learning'],
    sonDogrulama: '2026-09-06',
    yayinTarihi: '2026-04-15',
    yazarSlug: 'sukru-yusuf-kaya',
    govde: [
      {
        tip: 'kisa-cevap',
        metin:
          'Ayırt edici (discriminative) modeller "bu nedir" sorusunu cevaplar; üretken modeller "buna benzeyen yeni bir örnek nasıl olurdu" sorusunu. Fark, sınıflandırma ile örnekleme arasındaki farktır.',
      },
      { tip: 'altbaslik', metin: 'Modalitelere göre yaklaşımlar', kimlik: 'modaliteler' },
      {
        tip: 'tablo',
        basliklar: ['Modalite', 'Baskın yaklaşım', 'Tipik kullanım'],
        satirlar: [
          ['Metin ve kod', 'Otoregresif transformer', 'Özetleme, yazım, kod üretimi'],
          ['Görsel', 'Yayılım (diffusion) modelleri', 'Görsel üretimi ve düzenleme'],
          ['Ses ve konuşma', 'Otoregresif ve yayılım melezi', 'Seslendirme, müzik, ses klonlama'],
          ['Video', 'Zamansal yayılım modelleri', 'Kısa video üretimi ve kurgu'],
          ['Çok modlu', 'Ortak temsil uzayı', 'Görselden metin, metinden görsel'],
        ],
        aciklama: 'Alan hızlı değişiyor; baskın yaklaşım modaliteye göre yer değiştiriyor.',
      },
      { tip: 'altbaslik', metin: 'Kurumsal değeri nerede?', kimlik: 'kurumsal-deger' },
      {
        tip: 'liste',
        ogeler: [
          'Taslak üretimi: sıfırdan yazma maliyetini düşürür, son karar insanda kalır.',
          'Dönüştürme: biçim değiştirme, özetleme, dil ve üslup uyarlama.',
          'Yapılandırma: serbest metinden şemaya uygun veri çıkarma.',
          'Sentetik veri: nadir senaryolar için test ve eğitim örneği üretme.',
        ],
      },
      {
        tip: 'uyari',
        ton: 'dikkat',
        metin:
          'Üretken çıktıda telif, kişisel veri ve marka riski üretim anında oluşur. Yayın öncesi insan denetimi olmayan bir akış, hukuki riski otomatikleştirir.',
      },
      { tip: 'altbaslik', metin: 'Sınırlar', kimlik: 'sinirlar' },
      {
        tip: 'paragraf',
        metin:
          'Üretken modeller olgusal doğruluk garantisi vermez, kendi çıktısını doğrulamaz ve eğitim verisindeki eğilimleri taşır. Bu üç sınır bir hata değil, yöntemin doğasıdır; bu yüzden üretim kurulumlarında doğrulama katmanı mimarinin parçası olmak zorunda.',
      },
    ],
    sss: [
      {
        soru: 'Üretken yapay zekâ çıktısı telifli midir?',
        cevap:
          'Hukuki durum ülkeye ve kullanım biçimine göre değişiyor ve gelişmeye devam ediyor. Kurumsal kullanımda pratik yaklaşım, sağlayıcı sözleşmesindeki tazminat maddelerini okumak ve yayın öncesi insan denetimi uygulamak. Bağlayıcı değerlendirme için hukuk danışmanınıza başvurun.',
      },
      {
        soru: 'Sentetik veri gerçek verinin yerini alır mı?',
        cevap:
          'Tamamen almaz. Nadir senaryoları çoğaltmak ve test kapsamını genişletmek için değerlidir; ancak yalnızca sentetik veriyle eğitim, dağılımı gerçeklikten uzaklaştırma riski taşır.',
      },
    ],
    surumler: [{ surum: 'v1.0', tarih: '2026-04-15', degisiklik: 'İlk yayın.' }],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'attention',
    ad: 'Attention',
    altAd: 'Dikkat mekanizması',
    kategori: 'Deep Learning',
    kisaTanim:
      'Bir dizideki her ögenin, çıktı üretilirken diğer ögelere ne kadar ağırlık vereceğini öğrenilebilir biçimde belirleyen mekanizmadır.',
    seviye: 'ileri',
    ilgili: ['Transformer', 'Context Window', 'Embedding'],
    onkosullar: ['Neural Networks'],
    sonDogrulama: '2026-08-30',
    yayinTarihi: '2026-05-06',
    yazarSlug: 'sinaptik-research',
    govde: [
      {
        tip: 'kisa-cevap',
        metin:
          'Dikkat, "bu ögeyi anlamak için dizinin hangi kısımlarına bakmalıyım" sorusunun öğrenilmiş cevabıdır. Sabit bir pencere veya sıra varsayımı yerine, ilişkiyi veriden öğrenir.',
      },
      { tip: 'altbaslik', metin: 'Sorgu, anahtar, değer', kimlik: 'qkv' },
      {
        tip: 'paragraf',
        metin:
          'Her öge üç temsile dönüştürülür. Sorgu (query) "ne arıyorum", anahtar (key) "ben neyim", değer (value) "taşıdığım bilgi" rolündedir. Bir ögenin sorgusu, diğer ögelerin anahtarlarıyla karşılaştırılır; çıkan benzerlikler normalize edilerek ağırlığa dönüşür ve değerlerin ağırlıklı toplamı alınır.',
      },
      {
        tip: 'kod',
        dil: 'text',
        metin: `dikkat(Q, K, V) = softmax( (Q · Kᵀ) / √d ) · V

Q: sorgu matrisi      K: anahtar matrisi      V: değer matrisi
d: anahtar boyutu (ölçeklemede kullanılır)

√d ile bölme, iç çarpımların büyümesiyle softmax'ın
doyuma gitmesini ve gradyanın kaybolmasını engeller.`,
      },
      { tip: 'altbaslik', metin: 'Çok başlı dikkat', kimlik: 'cok-basli' },
      {
        tip: 'paragraf',
        metin:
          'Tek bir dikkat hesabı, ilişkinin tek bir yönünü yakalar. Çok başlı dikkat aynı işlemi paralel ve farklı öğrenilmiş izdüşümlerle tekrarlar: bir baş sözdizimsel bağımlılığa, diğeri eş gönderime, üçüncüsü konum ilişkisine duyarlı hale gelebilir. Sonuçlar birleştirilip bir sonraki katmana verilir.',
      },
      { tip: 'altbaslik', metin: 'Maliyet ve kısayollar', kimlik: 'maliyet' },
      {
        tip: 'paragraf',
        metin:
          'Tam dikkat, dizi uzunluğuyla karesel büyür: iki katı uzun bir girdi dört katı hesap demektir. Uzun bağlamı ekonomik kılmak için seyrek dikkat kalıpları, kayan pencere, anahtar-değer önbelleği ve gruplandırılmış sorgu dikkati gibi yaklaşımlar kullanılır. Her biri hesabı azaltır ama bir modelleme bedeli getirir.',
      },
      {
        tip: 'uyari',
        ton: 'bilgi',
        metin:
          'Dikkat ağırlıkları bir açıklama aracı gibi görünse de, modelin kararının nedenini güvenilir biçimde göstermez. Yorumlanabilirlik iddiası için tek başına yeterli değildir.',
      },
    ],
    sss: [
      {
        soru: 'Kendine dikkat (self-attention) ile çapraz dikkat farkı nedir?',
        cevap:
          'Kendine dikkatte sorgu, anahtar ve değer aynı diziden gelir; öge kendi dizisinin diğer ögelerine bakar. Çapraz dikkatte sorgu bir diziden, anahtar ve değer başka bir diziden gelir; örneğin metin üretilirken görsel temsile bakılması.',
      },
      {
        soru: 'Konum bilgisi nereden geliyor?',
        cevap:
          'Dikkat, sırayı kendiliğinden bilmez. Konum bilgisi ayrıca kodlanır: sinüzoidal konum kodlaması, öğrenilmiş konum gömmeleri veya döndürmeli konum kodlaması gibi yöntemlerle.',
      },
    ],
    surumler: [{ surum: 'v1.0', tarih: '2026-05-06', degisiklik: 'İlk yayın.' }],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'reasoning',
    ad: 'Reasoning Models',
    altAd: 'Muhakeme modelleri',
    kategori: 'Large Language Models',
    kisaTanim:
      'Cevabı doğrudan üretmek yerine, çıkarım anında daha fazla hesaplama harcayarak ara adımlar üreten ve bu adımlar üzerinden sonuca varan dil modeli ailesidir.',
    seviye: 'ileri',
    ilgili: ['Chain-of-Thought', 'LLM', 'Evaluation'],
    onkosullar: ['LLM'],
    sonDogrulama: '2026-09-07',
    yayinTarihi: '2026-06-20',
    guncellemeTarihi: '2026-09-07',
    yazarSlug: 'sinaptik-research',
    govde: [
      {
        tip: 'kisa-cevap',
        metin:
          'Muhakeme modelleri, kaliteyi eğitim ölçeğiyle değil çıkarım anındaki hesaplama bütçesiyle artırır: modele "daha uzun düşün" imkânı verilir, ara adımlar üretilir ve nihai cevap bu adımların üstüne kurulur.',
      },
      { tip: 'altbaslik', metin: 'Fark nerede?', kimlik: 'fark' },
      {
        tip: 'tablo',
        basliklar: ['Boyut', 'Klasik dil modeli', 'Muhakeme modeli'],
        satirlar: [
          ['Cevap üretimi', 'Doğrudan', 'Ara adımlar üzerinden'],
          ['Gecikme', 'Düşük', 'Belirgin yüksek'],
          ['Maliyet', 'Girdi ağırlıklı', 'Çıktı ve ara adım ağırlıklı'],
          [
            'Güçlü olduğu yer',
            'Özetleme, dönüştürme, yazım',
            'Çok adımlı matematik, planlama, kod hata ayıklama',
          ],
          ['Zayıf olduğu yer', 'Çok adımlı çıkarım', 'Basit ve hız kritik görevler'],
        ],
        aciklama:
          'Muhakeme modelini her göreve uygulamak maliyeti artırır; seçici kullanım gerekir.',
      },
      { tip: 'altbaslik', metin: 'Ölçek yasasının yeni ekseni', kimlik: 'olcek' },
      {
        tip: 'paragraf',
        metin:
          'Önceki dönemde kalite, eğitim verisi ve parametre sayısıyla birlikte artıyordu. Muhakeme modelleri üçüncü bir eksen ekliyor: çıkarım anında harcanan hesaplama. Bu, ürün tarafında yeni bir ayar düğmesi demek — aynı model, aynı istem, farklı bütçeyle farklı kalite.',
      },
      {
        tip: 'uyari',
        ton: 'dikkat',
        metin:
          'Modelin ürettiği ara adımlar, kararının gerçek gerekçesi olmak zorunda değil. Okunabilir bir düşünce zinciri, doğruluk kanıtı değildir; sonuç yine dış doğrulama gerektirir.',
      },
      { tip: 'altbaslik', metin: 'Kurumsal kullanımda ne değişir?', kimlik: 'kurumsal' },
      {
        tip: 'liste',
        ogeler: [
          'Yönlendirme zorunlu hale gelir: kolay istekler hızlı modele, zor istekler muhakeme modeline.',
          'Gecikme bütçesi yeniden yazılır: etkileşimli arayüzlerde bekleme deneyimi tasarlanmalı.',
          'Maliyet ölçümü değişir: birim artık istek değil, tamamlanmış görev.',
          'Değerlendirme derinleşir: adım kalitesi ile sonuç kalitesi ayrı ayrı ölçülmeli.',
        ],
      },
    ],
    sss: [
      {
        soru: 'Muhakeme modeli her zaman daha mı doğru?',
        cevap:
          'Hayır. Çok adımlı çıkarım gerektiren görevlerde belirgin avantaj sağlar; özetleme veya biçim dönüştürme gibi tek adımlı görevlerde ek maliyet karşılığında kayda değer bir kazanç vermeyebilir.',
      },
      {
        soru: 'Ara adımları kullanıcıya göstermeli miyim?',
        cevap:
          'Genellikle hayır. Ara adımlar hem uzundur hem yanıltıcı bir kesinlik hissi verir. Gerekli olan, cevabın dayandığı kaynakları ve doğrulanabilir çıktıyı göstermek.',
      },
    ],
    surumler: [
      { surum: 'v1.1', tarih: '2026-09-07', degisiklik: 'Kurumsal kullanım bölümü eklendi.' },
      { surum: 'v1.0', tarih: '2026-06-20', degisiklik: 'İlk yayın.' },
    ],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'chain-of-thought',
    ad: 'Chain-of-Thought',
    altAd: 'CoT · Düşünce zinciri',
    kategori: 'Large Language Models',
    kisaTanim:
      'Modelin nihai cevaba gitmeden önce ara adımları açıkça üretmesini isteyen istem tekniğidir; çok adımlı görevlerde doğruluğu artırabilir.',
    seviye: 'orta',
    ilgili: ['Prompt Engineering', 'Reasoning Models', 'LLM'],
    onkosullar: ['Prompt Engineering'],
    sonDogrulama: '2026-09-01',
    yayinTarihi: '2026-05-22',
    yazarSlug: 'sukru-yusuf-kaya',
    govde: [
      {
        tip: 'kisa-cevap',
        metin:
          'Düşünce zinciri, modele "adım adım ilerle" demektir. Ara adımların bağlama yazılması, sonraki tokenlerin bu adımlara koşullanmasını sağlar; böylece tek hamlede çözülemeyen problemler parçalara bölünür.',
      },
      { tip: 'altbaslik', metin: 'Neden işe yarıyor?', kimlik: 'neden' },
      {
        tip: 'paragraf',
        metin:
          'Model her tokeni sabit bir hesap bütçesiyle üretir. Cevabı doğrudan istediğinizde, çok adımlı bir çıkarımı tek bir token seçimine sıkıştırmasını istemiş olursunuz. Ara adımları yazmak, bu hesabı zamana yayar: her adım bağlamda görünür hale gelir ve sonraki adımın girdisi olur.',
      },
      { tip: 'altbaslik', metin: 'Varyantlar', kimlik: 'varyantlar' },
      {
        tip: 'tablo',
        basliklar: ['Teknik', 'Ne yapar', 'Maliyet'],
        satirlar: [
          ['Sıfır örnekli CoT', 'İsteme "adım adım düşün" eklenir', 'Düşük'],
          ['Az örnekli CoT', 'Çözülmüş örnek zincirler isteme konur', 'Orta: istem uzar'],
          [
            'Kendi kendine tutarlılık',
            'Birden çok zincir üretilip en sık cevap seçilir',
            'Yüksek: n kat çağrı',
          ],
          ['Düşünce ağacı', 'Alternatif dallar üretilip değerlendirilir', 'Çok yüksek'],
          [
            'Programla çözme',
            'Zincir yerine çalıştırılabilir kod üretilir',
            'Orta; aritmetikte güvenilir',
          ],
        ],
        aciklama:
          'Aritmetik ve kesin hesap gerektiren görevlerde kod üretip çalıştırmak, metinsel zincirden güvenilirdir.',
      },
      {
        tip: 'uyari',
        ton: 'dikkat',
        metin:
          'Zincirin okunabilir olması doğru olduğu anlamına gelmez. Model, yanlış bir sonuca makul görünen adımlarla da varabilir; ara adımlar bir denetim aracı değil, bir üretim tekniğidir.',
      },
      { tip: 'altbaslik', metin: 'Ne zaman kullanılmamalı?', kimlik: 'kullanilmamali' },
      {
        tip: 'liste',
        ogeler: [
          'Tek adımlı sınıflandırma ve etiketleme: gereksiz token ve gecikme.',
          'Yapılandırılmış çıktı beklenen çağrılar: zincir, şema uyumunu bozabilir.',
          'Kullanıcıya doğrudan gösterilen yanıtlar: ara adımlar yanıltıcı kesinlik hissi verir.',
          'Muhakeme modelleri: bu modeller zinciri kendi içinde yürütür; ek talimat çoğu zaman gereksiz.',
        ],
      },
    ],
    sss: [
      {
        soru: 'Ara adımları çıktıdan nasıl ayırırım?',
        cevap:
          'Modelden adımları ayrı bir alanda (örneğin bir JSON alanında veya işaretli bir blokta) üretmesini isteyip bu alanı kullanıcıya göstermeden kayda almak en pratik yöntem.',
      },
      {
        soru: 'Kendi kendine tutarlılık ne kadar kazandırır?',
        cevap:
          'Kararsız görevlerde belirgin fayda verebilir ama maliyet çağrı sayısıyla doğrusal artar. Kararı kendi görev setinizde ölçerek verin; genel bir kazanç oranı iddiası yanıltıcı olur.',
      },
    ],
    surumler: [{ surum: 'v1.0', tarih: '2026-05-22', degisiklik: 'İlk yayın.' }],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'prompt-engineering',
    ad: 'Prompt Engineering',
    altAd: 'İstem mühendisliği',
    kategori: 'Generative AI',
    kisaTanim:
      'Bir dil modelinden istenen davranışı almak üzere girdinin yapısını, bağlamını ve kısıtlarını sistematik biçimde tasarlama pratiğidir.',
    seviye: 'baslangic',
    ilgili: ['Chain-of-Thought', 'LLM', 'Function Calling', 'Prompt Injection'],
    onkosullar: ['LLM'],
    sonDogrulama: '2026-09-04',
    yayinTarihi: '2026-04-29',
    guncellemeTarihi: '2026-09-04',
    yazarSlug: 'sukru-yusuf-kaya',
    govde: [
      {
        tip: 'kisa-cevap',
        metin:
          'İstem mühendisliği bir sihirli cümle arayışı değil, bir arayüz tasarımı işidir: modele hangi rolü, hangi bağlamı, hangi kısıtları ve hangi çıktı biçimini verdiğinizi belirlemek. Ölçülmeyen istem değişikliği, iyileştirme değil tahmindir.',
      },
      { tip: 'altbaslik', metin: 'İyi bir istemin bileşenleri', kimlik: 'bilesenler' },
      {
        tip: 'liste',
        sirali: true,
        ogeler: [
          'Görev: ne yapılacağı tek ve açık bir cümleyle.',
          'Bağlam: gereken bilgi, kaynağı belirtilmiş biçimde.',
          'Kısıt: neyin yapılmaması gerektiği ve sınırlar.',
          'Biçim: beklenen çıktı yapısı, tercihen şema ile.',
          'Örnek: sınırda kalan bir-iki örnek (az örnekli öğrenme).',
          'Kaçış yolu: bilgi yetersizse ne yapılacağı ("bilmiyorum de").',
        ],
      },
      {
        tip: 'paragraf',
        metin:
          'Son madde en çok atlanan ve en çok fark yaratan bileşen. Modele bilmediğinde ne yapacağını söylemezseniz, boşluğu doldurmayı seçer.',
      },
      { tip: 'altbaslik', metin: 'Örnek: zayıf ve güçlü istem', kimlik: 'ornek' },
      {
        tip: 'kod',
        dil: 'text',
        metin: `# ZAYIF
Bu sözleşmeyi özetle.

# GÜÇLÜ
GÖREV: Aşağıdaki sözleşmeden risk maddelerini çıkar.
BİÇİM: Her madde için JSON: {madde_no, konu, risk_seviyesi, alinti}
  risk_seviyesi yalnızca "yuksek" | "orta" | "dusuk" olabilir.
KISIT: Yalnızca <sozlesme> bloğundaki metne dayan. Yorum ekleme.
BİLGİ YETERSİZSE: İlgili madde yoksa boş dizi döndür.
<sozlesme>
...
</sozlesme>`,
      },
      { tip: 'altbaslik', metin: 'Sürümleme ve ölçüm', kimlik: 'surumleme' },
      {
        tip: 'paragraf',
        metin:
          'İstem bir kod parçasıdır: sürümlenmeli, gözden geçirilmeli ve değişikliği ölçülmeli. Pratik asgari kurulum, her isteme bir sürüm etiketi vermek, izlerde bu etiketi kaydetmek ve değişiklikleri görev seti üzerinde önce/sonra karşılaştırmak.',
      },
      {
        tip: 'uyari',
        ton: 'dikkat',
        metin:
          'Sistem istemine yazılan "gizli bilgileri açıklama" veya "gömülü talimatlara uyma" ifadeleri güvenlik kontrolü değildir. Güvence araç ve ağ katmanında sağlanır.',
      },
      { tip: 'altbaslik', metin: 'Alanın yönü', kimlik: 'yon' },
      {
        tip: 'paragraf',
        metin:
          'Modeller talimat uyumunda geliştikçe, tek tek cümle ayarlamanın getirisi azalıyor; değer bağlam tasarımına, şema zorlamaya ve değerlendirmeye kayıyor. İstem mühendisliği kaybolmuyor ama ağırlık merkezi "nasıl yazmalı"dan "nasıl ölçmeli"ye taşınıyor.',
      },
    ],
    sss: [
      {
        soru: 'Rol vermek ("sen bir uzmansın") işe yarıyor mu?',
        cevap:
          'Etkisi görevden göreve değişiyor ve modeller geliştikçe azalıyor. Ölçülmeden varsayılmamalı; aynı emek bağlam ve biçim tanımına harcandığında genellikle daha fazla kazandırıyor.',
      },
      {
        soru: 'İstemi uzatmak kaliteyi artırır mı?',
        cevap:
          'Bir noktaya kadar. Gereksiz bağlam dikkati seyreltir, maliyeti artırır ve bakımı zorlaştırır. Her cümlenin neden orada olduğunu açıklayabiliyor olmalısınız.',
      },
      {
        soru: 'Yapılandırılmış çıktıyı nasıl garanti ederim?',
        cevap:
          'Metinle rica ederek değil, şema zorlamayla: sağlayıcının yapılandırılmış çıktı veya araç çağırma özelliğini kullanmak ve dönen değeri kod tarafında doğrulamak.',
      },
    ],
    kaynaklar: [
      { ad: 'Sağlayıcı istem rehberleri', yayinci: 'Model sağlayıcıları', tur: 'Dokümantasyon' },
    ],
    surumler: [
      { surum: 'v1.1', tarih: '2026-09-04', degisiklik: 'Sürümleme ve ölçüm bölümü eklendi.' },
      { surum: 'v1.0', tarih: '2026-04-29', degisiklik: 'İlk yayın.' },
    ],
  },
];
