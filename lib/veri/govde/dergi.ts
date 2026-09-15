import type { Blok, Kaynak } from '@/lib/tipler';

/**
 * ÖRNEK VERİ — dergi yazısı gövdeleri.
 *
 * Dergi kalıbı haber ve analizden farklıdır: tablo ve liste azdır, argüman
 * düz metinle kurulur. Her yazı bir tezle açılır ve bir sonuçla kapanır;
 * dergi yazıları PDF'e gömülmez, her biri kendi kalıcı adresinde yayımlanır.
 *
 * Sayısal örnekler TEMSİLÎ'dir; ölçüm olarak alıntılanamaz.
 */

export type DergiGovdesi = {
  govde: Blok[];
  kaynaklar?: Kaynak[];
  ilgiliSluglar?: string[];
};

const SINAPTIK: Kaynak = {
  ad: 'Sinaptik Research — dergi dosyası notları',
  yayinci: 'Sinaptik Lab',
  tur: 'Teknik rapor',
};

export const DERGI_GOVDELERI: Record<string, DergiGovdesi> = {
  /* --- 2026 / EKİM — The Agentic Era ------------------------------------ */
  'agentic-ai-mimariden-operasyona': {
    govde: [
      {
        tip: 'paragraf',
        metin:
          'Bir teknolojinin olgunlaştığını gösteren en güvenilir işaret, hakkında konuşulan şeyin değişmesidir. Ajan sistemlerinde bu değişim son bir yılda gerçekleşti: konuşma "model bunu yapabiliyor mu"dan "bunu her gün, aynı kalitede, kimin sorumluluğunda yapıyor"a kaydı. Bu, bir yetenek tartışmasının bir operasyon tartışmasına dönüşmesi demek — ve operasyon tartışmaları her zaman daha sıkıcı, her zaman daha belirleyicidir.',
      },
      { tip: 'altbaslik', metin: 'Demonun bittiği yer', kimlik: 'demo' },
      {
        tip: 'paragraf',
        metin:
          'Ajan demolarının ortak bir dramaturjisi var: bir hedef verilir, sistem birkaç araç çağırır, sonuç ekranda görünür. Bu gösterinin gizlediği şey varyans. Aynı görev yüz kez koşulduğunda kaç kez tamamlanıyor? Tamamlanmadığı durumlarda ne oluyor — duruyor mu, yarım bir iş bırakıyor mu, yoksa yanlış bir şeyi geri alınamaz biçimde değiştiriyor mu? Demo bu soruların hiçbirini cevaplamaz, çünkü demo tek bir örnektir.',
      },
      {
        tip: 'paragraf',
        metin:
          'Operasyona geçiş, tam bu soruların cevabını zorunlu kılar. Bir ajanı üretime almak, onun hakkında bir dağılım bilgisine sahip olmayı gerektirir: tamamlama oranı, adım verimliliği, hata sonrası kurtarma, yan etki profili. Bu dört sayı olmadan bir ajan "çalışıyor" sayılamaz; sadece "bir kez çalıştı" sayılır.',
      },
      { tip: 'altbaslik', metin: 'Sorumluluk sınırı yeniden çiziliyor', kimlik: 'sorumluluk' },
      {
        tip: 'paragraf',
        metin:
          'Klasik yazılımda sorumluluk sınırı okunabilir: kod ne yapıyorsa sistem onu yapar. Ajan sistemlerinde bu sınır bulanıklaşıyor. Ekip artık bir davranış dizisi değil, bir davranış alanı teslim ediyor: hedef, araçlar, yetkiler ve kısıtlar. Bu alanın içinde sistem kendi yolunu çiziyor.',
      },
      {
        tip: 'alinti',
        metin:
          'Yazdığınız şey artık bir fonksiyon değil, bir yetki zarfı. Ve bir yetki zarfının en önemli özelliği ne kadar geniş olduğu değil, ne kadar iyi tanımlandığı.',
      },
      {
        tip: 'paragraf',
        metin:
          'Bu kayma, kurumsal tarafta yeni bir soru doğuruyor: bir ajanın yaptığı geri alınamaz işlemden kim sorumlu? Cevap teknik değil örgütsel, ve çoğu kurumda yazılmamış durumda. Yazılmadığı sürece de ajan projeleri pilot aşamasını geçemiyor — çünkü kimse imzalamak istemiyor.',
      },
      { tip: 'altbaslik', metin: 'Dar kapsam bir erdem', kimlik: 'dar-kapsam' },
      {
        tip: 'paragraf',
        metin:
          'Sahada işe yarayan ajan kurulumlarının ortak özelliği etkileyici olmamaları. Tek bir görevi yapıyorlar, beş araçtan azını kullanıyorlar, geri alınamaz her eylemi insana soruyorlar ve her adımı kaydediyorlar. Sıkıcı, ama üç ay sonra hâlâ çalışıyorlar. Geniş kapsamlı ajanlar ise genellikle demo aşamasında kalıyor; çünkü kapsam büyüdükçe hata yüzeyi kapsamdan daha hızlı büyüyor.',
      },
      {
        tip: 'paragraf',
        metin:
          'Bu, bir mühendislik disiplini olarak ajan tasarımının temel gerilimi. Kullanıcı geniş yetenek istiyor; dayanıklılık dar kapsam gerektiriyor. Uzlaşma noktası, dar kapsamlı ajanları birbirine bağlamak — her biri kendi hesabını verebilen küçük parçalar.',
      },
      { tip: 'altbaslik', metin: 'Ne bekleniyor', kimlik: 'beklenti' },
      {
        tip: 'paragraf',
        metin:
          'Önümüzdeki dönemin ayrıştırıcısı, en yetenekli modeli kullanan ekip değil; en iyi ölçüm ve yetki altyapısını kuran ekip olacak. Model herkese açık, istem kopyalanabilir, araçlar benzer. Kopyalanamayan şey, bir kurumun kendi işini ölçebilme ve sorumluluğu tanımlayabilme yeteneği. Ajanik dönemin gerçek rekabeti burada.',
      },
    ],
    kaynaklar: [SINAPTIK],
    ilgiliSluglar: ['ai-agent', 'evaluation', 'prompt-injection'],
  },

  'yeni-nesil-ai-sirketlerinin-ekonomisi': {
    govde: [
      {
        tip: 'paragraf',
        metin:
          'Yazılım sektörünün son yirmi yılını şekillendiren şey, marjinal maliyetin sıfıra yakın olmasıydı. Bir SaaS ürününün bir kullanıcı daha alması neredeyse bedavaydı; bu yüzden ölçek, kârlılığın kendisi anlamına geliyordu. Yapay zekâ ürünlerinde bu denklem bozuldu: her istek gerçek bir hesaplama maliyeti taşıyor.',
      },
      { tip: 'altbaslik', metin: 'Marjın geri dönüşü', kimlik: 'marj' },
      {
        tip: 'paragraf',
        metin:
          'Kullanım arttıkça maliyetin de artması, yazılım dünyasına yabancı bir disiplin getiriyor: birim ekonomisi. Bir kullanıcının ayda kaç istek yaptığı, her isteğin kaç token tükettiği ve bunun abonelik ücretine oranı, artık ürün kararlarının merkezinde. Sınırsız kullanım vaat eden bir fiyatlandırma, ağır kullanıcıların maliyetini hafif kullanıcılara yayma üzerine kurulu bir bahis haline geliyor.',
      },
      {
        tip: 'paragraf',
        metin:
          'Bu durum iki yönde baskı yaratıyor. Bir yandan model maliyetleri düşüyor ve düşmeye devam edeceği varsayılıyor; bu, bugünkü olumsuz marjı geleceğe yazılmış bir çek olarak görmeyi kolaylaştırıyor. Öte yandan kullanıcı beklentileri de yükseliyor: daha uzun bağlam, daha fazla adım, daha derin muhakeme. Maliyet düşüşü, talebin büyümesiyle yarışıyor.',
      },
      { tip: 'altbaslik', metin: 'Savunulabilirlik nerede?', kimlik: 'savunulabilirlik' },
      {
        tip: 'paragraf',
        metin:
          'Bir modelin üzerine ince bir arayüz koyan ürünler, sağlayıcı bir özellik eklediğinde konumlarını kaybediyor. Bu, ilk dalganın en acı dersi oldu. Savunulabilirliğin biriktiği yerler farklı: kuruma özgü veri, süreçle iç içe geçmiş iş akışı, ölçüm altyapısı ve dağıtım kanalı. Bunların hiçbiri model kalitesiyle ilgili değil.',
      },
      {
        tip: 'alinti',
        metin:
          'Model bir girdi maliyetidir, bir ürün değil. Bir kurumun rekabet avantajı, modeli kimden aldığında değil, onu neyin etrafına kurduğunda birikiyor.',
      },
      {
        tip: 'paragraf',
        metin:
          'Bu okuma, dikey ürünleri yatay platformlardan daha avantajlı hale getiriyor. Bir sektörün diline, mevzuatına ve iş akışına gömülmüş bir ürün, sağlayıcı değişikliğinden daha az etkilenir; çünkü sattığı şey model erişimi değil süreç.',
      },
      { tip: 'altbaslik', metin: 'Altyapı katmanının sessiz avantajı', kimlik: 'altyapi' },
      {
        tip: 'paragraf',
        metin:
          'Değerlendirme, gözlemlenebilirlik, veri hazırlığı ve yetki yönetimi gibi altyapı ürünleri, uygulama katmanından daha az göz alıcı ama daha dayanıklı bir konumda. Sebep basit: bunlar model değiştiğinde atılmıyor, tam tersine geçişin kendisini yönetiyor. Bir kurumun değerlendirme setine girmiş bir araç, sağlayıcı değişikliğinden değer kazanarak çıkıyor.',
      },
      { tip: 'altbaslik', metin: 'Sonuç', kimlik: 'sonuc' },
      {
        tip: 'paragraf',
        metin:
          'Yeni nesil yapay zekâ şirketlerinin ekonomisi, yazılımın değil endüstriyel ürünlerin ekonomisine benziyor: birim maliyet, kapasite planlaması, tedarikçi bağımlılığı. Bu, sektöre daha eski ve daha sıkıcı bir disiplin getiriyor. Kazananlar, bu disiplini erken benimseyenler olacak.',
      },
    ],
    kaynaklar: [SINAPTIK],
    ilgiliSluglar: ['llm', 'llmops'],
  },

  'embodied-ai-ve-fiziksel-dunya': {
    govde: [
      {
        tip: 'paragraf',
        metin:
          'Dil modellerinin yükselişi, bir kaynak bolluğunun hikâyesiydi. İnternet, onlarca yıl boyunca hiç kimse bir yapay zekâ modeli eğitmeyi düşünmediği hâlde, tam olarak bunun için gereken şeyi üretti: muazzam miktarda, insan tarafından yazılmış, dijital metin. Robotikte böyle bir armağan yok.',
      },
      { tip: 'altbaslik', metin: 'Veri, fiziksel bir maliyet', kimlik: 'veri-maliyeti' },
      {
        tip: 'paragraf',
        metin:
          'Bir robotun bir kutuyu kavrama denemesi, zaman alır, donanımı yorar, bazen bir şeyi kırar ve bir insanın gözetimini gerektirir. Yani her örnek para. Bu, ölçek yasalarının robotikte neden aynı biçimde işlemediğini tek başına açıklıyor: parametre sayısını on kat büyütmek bir mühendislik kararıyken, örnek sayısını on kat büyütmek bir tedarik zinciri problemi.',
      },
      {
        tip: 'paragraf',
        metin:
          'Alanın bu darboğazı aşmak için dört yol denediği görülüyor: insanın robotu sürerek örnek üretmesi, simülasyonda milyonlarca deneme, insan videolarından eylem çıkarma ve sahadaki robot filosundan öğrenme. Dördünün de sınırı var; hiçbiri tek başına internetin dil modellerine sağladığı bolluğu vermiyor.',
      },
      { tip: 'altbaslik', metin: 'Simülasyonun sınırı', kimlik: 'simulasyon' },
      {
        tip: 'paragraf',
        metin:
          'Simülasyon, görsel çeşitlilik üretmekte artık oldukça iyi. Zorluk görüntüde değil temasta: sürtünme, malzeme deformasyonu, kayma, esneme. Ve ne yazık ki ekonomik değeri en yüksek görevler — kavrama, montaj, yumuşak nesne taşıma — tam bu fiziğin içinde. Gerçeklik açığı kapanıyor ama en dar olduğu yerde değil, en geniş olduğu yerde açık kalmaya devam ediyor.',
      },
      {
        tip: 'alinti',
        metin:
          'Bir robotun bir kapıyı açtığını görmek etkileyici. Bin kapıyı, farklı kollarla, insan müdahalesi olmadan açtığını görmek bir sektör kurar.',
      },
      { tip: 'altbaslik', metin: 'Filo etkisi', kimlik: 'filo' },
      {
        tip: 'paragraf',
        metin:
          'Dört veri kaynağından yalnızca biri bileşik getirili: filo. Sahada ne kadar robot çalışırsa o kadar veri, o kadar veri ne kadar iyi politika, o kadar iyi politika ne kadar fazla saha. Bu döngüyü ilk kuran oyuncu, sonradan gelenlerin para ile kapatamayacağı bir fark açabilir. Robotikteki asıl yarış, bu döngüyü kimin daha erken çevirmeye başlayacağı üzerine.',
      },
      { tip: 'altbaslik', metin: 'Doğru metrik', kimlik: 'metrik' },
      {
        tip: 'paragraf',
        metin:
          'Bu alanı izlemenin en dürüst yolu, başarılı demo sayısını değil müdahalesiz çalışma süresini takip etmek. İki insan müdahalesi arasındaki ortalama süre bir vardiya uzunluğuna yaklaştığında, humanoid robotlar bir araştırma başlığından bir satın alma kalemine dönüşecek. O eşiğe ne kadar yaklaşıldığı, tanıtım videolarından değil saha raporlarından okunur.',
      },
    ],
    kaynaklar: [SINAPTIK],
    ilgiliSluglar: ['embodied-ai', 'computer-vision'],
  },

  'ai-guvenliginde-yetki-tasarimi': {
    govde: [
      {
        tip: 'paragraf',
        metin:
          'Güvenlik tartışmalarında bir kalıp tekrar ediyor: yeni bir teknoloji geliyor, ilk saldırılar görülüyor, sektör bunu bir tespit problemi olarak ele alıyor ve yıllar sonra bunun bir yetkilendirme problemi olduğu anlaşılıyor. Yapay zekâ ajanlarında bu döngüyü hızlandırma şansımız var — çünkü dersi daha önce öğrendik.',
      },
      { tip: 'altbaslik', metin: 'Filtrenin çekiciliği', kimlik: 'filtre' },
      {
        tip: 'paragraf',
        metin:
          'Dolaylı istem enjeksiyonuna ilk tepki neredeyse her zaman aynı: kötü niyetli metni tespit edip engelleyelim. Bu yaklaşımın çekiciliği anlaşılır — mevcut güvenlik araçlarına benziyor, ölçülebilir görünüyor ve bir ürün olarak satılabiliyor. Sorun, serbest metinde talimat ile veriyi güvenilir biçimde ayırmanın bir yolu olmaması. Kodlama, gizleme, dil değiştirme ve dolaylı ifade, filtreyi her zaman bir adım geriye düşürüyor.',
      },
      {
        tip: 'paragraf',
        metin:
          'Filtreyi tek savunma olarak kullanmanın gerçek maliyeti, yakaladığı saldırılar değil yarattığı güven. "Korunuyoruz" varsayımı, ajana geniş yetkiler vermeyi normalleştiriyor. Böylece bir kontrol, riski azaltmak yerine büyütüyor.',
      },
      { tip: 'altbaslik', metin: 'Doğru soru', kimlik: 'dogru-soru' },
      {
        tip: 'paragraf',
        metin:
          'Tasarım masasında sorulması gereken soru "modelim kandırılabilir mi" değil. Kandırılabilir; bunu bir veri noktası olarak kabul edip geçmek gerekiyor. Asıl soru şu: tamamen ele geçirilse, bu ajan en fazla ne yapabilir? Cevap kabul edilemezse, iyileştirilecek şey model değil mimaridir.',
      },
      {
        tip: 'alinti',
        metin:
          'Bir ajanın yapabileceği en kötü şey, en yüksek yetkili aracının yapabileceği en kötü şeydir. Güvenlik çalışması, bu cümleyi küçültme çalışmasıdır.',
      },
      { tip: 'altbaslik', metin: 'Kullanılabilirlikle uzlaşma', kimlik: 'uzlasma' },
      {
        tip: 'paragraf',
        metin:
          'Yetkiyi kısmanın bir bedeli var ve bu bedeli görmezden gelmek dürüst değil: aşırı kısıtlanmış bir ajan işe yaramaz hale gelir. Her eylem onay isterse kullanıcı onay yorgunluğuna girer ve her şeyi refleksle onaylar — bu, hiç onay olmamasından daha kötüdür, çünkü güvenlik hissi verirken kontrol sağlamaz.',
      },
      {
        tip: 'paragraf',
        metin:
          'Uzlaşma noktası, onayı eylemin geri alınabilirliğine göre dağıtmak. Geri alınamaz ve dışa dönük eylemler onay kapısından geçer; geri alınabilir iç işlemler için doğru mekanizma onay değil, denetim kaydı ve geri alma. Bu ayrım kullanılabilirliği korurken güvenceyi doğru yere koyuyor.',
      },
      { tip: 'altbaslik', metin: 'Sonuç', kimlik: 'sonuc' },
      {
        tip: 'paragraf',
        metin:
          'Ajan güvenliği bir metin problemi olarak ele alındığı sürece çözülmeyecek. Mimari bir problem olarak ele alındığında ise büyük ölçüde çözülebilir — hem de bugünün araçlarıyla. En az yetki, onay kapısı, çıkış kontrolü ve kum havuzu yeni fikirler değil; yalnızca yeni bir yere uygulanmayı bekliyorlar.',
      },
    ],
    kaynaklar: [SINAPTIK],
    ilgiliSluglar: ['prompt-injection', 'guardrails', 'ai-agent'],
  },

  'turkiye-ai-ekosistem-haritasi': {
    govde: [
      {
        tip: 'paragraf',
        metin:
          'Bir ekosistemi anlamak için şirket saymak yetmez; katmanlara bakmak gerekir. Yapay zekâ değer zinciri kabaca dört katmandan oluşuyor: donanım ve bulut, temel modeller, altyapı ve araçlar, uygulamalar. Türkiye ekosisteminin ağırlığı bugün açık biçimde son katmanda toplanıyor.',
      },
      { tip: 'altbaslik', metin: 'Uygulama katmanının cazibesi ve tuzağı', kimlik: 'uygulama' },
      {
        tip: 'paragraf',
        metin:
          'Uygulama katmanında başlamak rasyonel: giriş maliyeti düşük, pazara çıkış hızlı, müşteri ihtiyacı görünür. Tuzak, farklılaşmanın zorluğunda. Hazır bir modelin üzerine ince bir arayüz koyan ürün, sağlayıcı benzer bir özellik eklediğinde konumunu kaybediyor. İlk dalgada bu döngüyü çok kez gördük.',
      },
      {
        tip: 'paragraf',
        metin:
          'Dayanıklı olanlar, uygulama katmanında kalsa bile farklılaşmayı başka yere yerleştirenler: sektör mevzuatına gömülmüş iş akışları, kurumla paylaşılan veri döngüleri, satış ve uygulama kabiliyeti. Bunların hiçbiri model erişimiyle ilgili değil.',
      },
      { tip: 'altbaslik', metin: 'Boş kalan katman', kimlik: 'bos-katman' },
      {
        tip: 'paragraf',
        metin:
          'Ekosistemin en belirgin boşluğu altyapı ve araç katmanında: değerlendirme, gözlemlenebilirlik, veri hazırlığı ve Türkçe dil kaynakları. Bu katman göz alıcı değil ama iki nedenle kritik. Birincisi, model sağlayıcısı değiştiğinde ayakta kalan konum burada. İkincisi, kurumsal alıcının gerçekten ödeme yaptığı yer giderek burası.',
      },
      {
        tip: 'alinti',
        metin:
          'Türkçe için eksik olan şey model değil, ölçüm zemini. Açık metodolojili ve tekrarlanabilir bir değerlendirme altyapısı, tek tek ürünlerden daha fazla ortak değer üretir.',
      },
      { tip: 'altbaslik', metin: 'İki teknik kısıt', kimlik: 'kisitlar' },
      {
        tip: 'paragraf',
        metin:
          'Türkçe özelinde iki kısıt tekrar ediyor. Birincisi tokenizasyon: sondan eklemeli yapı nedeniyle Türkçe metin, aynı anlamı taşıyan İngilizce metinden daha fazla tokene bölünüyor; bu hem maliyeti hem bağlam penceresinin etkin kapasitesini etkiliyor. İkincisi değerlendirme: çeviriyle üretilmiş test setleri dilin kendine özgü belirsizliklerini ölçmüyor, dolayısıyla ölçülen şey büyük ölçüde dilden bağımsız muhakeme oluyor.',
      },
      { tip: 'altbaslik', metin: 'Yetenek akışı', kimlik: 'yetenek' },
      {
        tip: 'paragraf',
        metin:
          'Ekosistemdeki profil talebi de değişiyor. İstem yazarlığı bir uzmanlık olarak hızla sıradanlaşırken, değerlendirme mühendisliği, veri mühendisliği ve alan uzmanlığı öne geçiyor. Bu, eğitim tarafında bir uyum gecikmesi yaratıyor: talep edilen beceri ile yetiştirilen beceri arasındaki fark açılıyor.',
      },
      { tip: 'altbaslik', metin: 'Ne yapmalı', kimlik: 'ne-yapmali' },
      {
        tip: 'paragraf',
        metin:
          'Ekosistem düzeyinde en yüksek getirili yatırım, kamuya açık ve açık metodolojili bir Türkçe değerlendirme altyapısı. Bu zemin kurulmadan model seçimi tahmine, ürün iddiaları da denetlenemez beyanlara dayanıyor. Şirket düzeyinde ise tavsiye daha sade: farklılaşmayı modelde değil veride ve süreçte arayın.',
      },
    ],
    kaynaklar: [SINAPTIK],
    ilgiliSluglar: ['tokenization', 'evaluation'],
  },

  'arastirmaci-roportaji': {
    govde: [
      {
        tip: 'paragraf',
        metin:
          'Bu sayının röportaj bölümünde, değerlendirme kültürünün kurumlarda neden geç kurulduğunu konuştuk. Aşağıdaki metin, Sinaptik Lab editoryal ekibinin yürüttüğü söyleşinin düzenlenmiş özetidir; konuşmacı, kurumsal yapay zekâ projelerinde değerlendirme hattı kuran bir araştırmacıdır.',
      },
      {
        tip: 'uyari',
        ton: 'bilgi',
        metin:
          'Bu röportaj, platformun içerik modelini göstermek üzere hazırlanmış örnek bir metindir. Gerçek bir kişiye atfedilmemiştir; yayına girdiğinde konuşmacı künyesi ve tam döküm eklenecektir.',
      },
      { tip: 'altbaslik', metin: 'Değerlendirme neden geç kuruluyor?', kimlik: 'neden-gec' },
      {
        tip: 'paragraf',
        metin:
          'Çünkü hiçbir zaman "bugün yapılması gereken iş" olmuyor. Bir ekip demo hazırlarken değerlendirme kurmaz; sunum yaklaşıyordur. Pilot koşarken kurmaz; kullanıcı geri bildirimi vardır. Üretime geçerken kurmaz; acele edilir. Değerlendirme, ilk ciddi arıza yaşandığında gündeme geliyor — yani en pahalı anda.',
      },
      { tip: 'altbaslik', metin: 'Peki nasıl başlamalı?', kimlik: 'nasil' },
      {
        tip: 'paragraf',
        metin:
          'Küçük başlamak gerekiyor ve bu tavsiye sanıldığından daha radikal. Yirmi görev yeter. Ama bu yirmi görevin gerçek olması, beklenen çıktısının elle yazılmış olması ve sonucunun makine tarafından kontrol edilebilmesi şart. Yüz görevlik ama doğrulanamayan bir set, yirmi görevlik doğrulanabilir bir setten daha az işe yarar.',
      },
      {
        tip: 'alinti',
        metin:
          'Ekiplere şunu söylüyorum: elinizde yirmi görev varsa model seçimi bir haftalık iş. Yoksa altı aylık bir tartışma.',
      },
      { tip: 'altbaslik', metin: 'En sık yapılan hata?', kimlik: 'hata' },
      {
        tip: 'paragraf',
        metin:
          'Her şeyi tek bir skora indirmek. Yönetim tek sayı istiyor, ekip de veriyor. Ama tek sayı, hangi eksende bozulduğunuzu gizler. Tamamlama oranı yükselirken yan etki sayısı da yükseliyorsa, ortalamada iyileşme görünür; üretimde ise durum kötüleşmiştir. Yedi metriği ayrı ayrı raporlamak zor bir alışkanlık ama tek gerçek yol.',
      },
      { tip: 'altbaslik', metin: 'Modelin modeli değerlendirmesi?', kimlik: 'yargic' },
      {
        tip: 'paragraf',
        metin:
          'Pratik, ama tek başına kör. Yargıç model kendi eğilimlerini sonuca taşır: uzun cevapları, kendi üslubuna benzeyen çıktıları tercih edebiliyor. En az bir insan kalibrasyon turu yapmadan kullanmamak gerekiyor. Ve raporda yöntemi yazmak gerekiyor — "otomatik değerlendirme" yeterli bir açıklama değil.',
      },
      { tip: 'altbaslik', metin: 'Son bir tavsiye?', kimlik: 'tavsiye' },
      {
        tip: 'paragraf',
        metin:
          'Her üretim arızasından sonra o vakayı görev setine ekleyin. Bu tek alışkanlık, zamanla kurumun en değerli varlığını üretiyor: kendi işini ölçebilen bir set. Kopyalanamayan şey de tam olarak bu.',
      },
    ],
    kaynaklar: [SINAPTIK],
    ilgiliSluglar: ['evaluation'],
  },

  /* --- 2026 / EYLÜL — Ölçemediğin Şeyi İyileştiremezsin ---------------- */
  'degerlendirme-kulturu': {
    govde: [
      {
        tip: 'paragraf',
        metin:
          'Yapay zekâ projelerinde bir tuhaflık var: en çok konuşulan şey model, en az yatırım yapılan şey ölçüm. Bu, tesadüf değil bir teşvik sorunu. Model seçimi görünür bir karar, bir toplantıda alınabilir ve anlatılması kolay. Değerlendirme hattı kurmak ise haftalarca süren, kimsenin sunumunda yer almayan, sıkıcı bir mühendislik işi.',
      },
      { tip: 'altbaslik', metin: 'Ölçüm bir kültür meselesi', kimlik: 'kultur' },
      {
        tip: 'paragraf',
        metin:
          'Bir ekibin değerlendirme olgunluğu, araçlarından değil alışkanlıklarından okunur. Sürüm öncesi görev seti koşuluyor mu? Arıza sonrası vaka sete ekleniyor mu? Rapor tek skora mı iniyor, yoksa eksenler ayrı ayrı mı konuşuluyor? Bu üç soruya verilen cevap, bir ekibin kaç ay sonra hâlâ kontrol sahibi olacağını büyük ölçüde belirliyor.',
      },
      {
        tip: 'paragraf',
        metin:
          'Kültürün eksik olduğu yerde ölçüm, bir uyum gereği olarak yapılır: rapor üretilir, dosyaya konur, kimse okumaz. Kültürün olduğu yerde ölçüm bir karar aracıdır: sürüm geçmez, dağıtım geri alınır, kapsam daraltılır.',
      },
      { tip: 'altbaslik', metin: 'Benchmark bağımlılığı', kimlik: 'benchmark' },
      {
        tip: 'paragraf',
        metin:
          'Kamuya açık skorlara yaslanmanın çekiciliği bedava olması. Maliyeti, ölçtüğü şeyle yapılacak iş arasındaki mesafe. Bir model genel muhakemede öndedir ama sizin belge setinizde kaynaklı cevap üretmekte geride olabilir. Bu iki bilgi arasında tercih yapmak zorunda değilsiniz; ama yalnızca birine sahipsiniz.',
      },
      {
        tip: 'paragraf',
        metin:
          'Buna bir de sızıntı ekleniyor. Yayımlanmış bir test seti, gelecekteki eğitim verisinin parçası olabiliyor. Skorların zamanla yükselmesi, modelin gerçekten iyileşmesinden bağımsız hale geliyor. Kurum içi kapalı setler bu sorundan yapısal olarak muaf — kapalı tutuldukları sürece.',
      },
      {
        tip: 'alinti',
        metin:
          'Yirmi gerçek görevi olan bir set, kamuya açık en büyük benchmarktan daha fazla karar bilgisi üretir. Çünkü ölçtüğü şey, gerçekten yapılacak iş.',
      },
      { tip: 'altbaslik', metin: 'Ölçümün gizli faydası', kimlik: 'fayda' },
      {
        tip: 'paragraf',
        metin:
          'Değerlendirme hattı kurmanın en çok atlanan getirisi, iyileştirme hızı. Ölçüm olmadan yapılan her değişiklik bir tahmindir: istem değişti, kalite arttı mı belli değil. Ölçüm varken aynı değişiklik bir deneye dönüşüyor. Ekiplerin hız kazandığı yer burası; ölçüm yavaşlatmıyor, hızlandırıyor.',
      },
      { tip: 'altbaslik', metin: 'Nereden başlamalı', kimlik: 'baslangic' },
      {
        tip: 'paragraf',
        metin:
          'Üretimdeki gerçek isteklerden otuz örnek seçip beklenen çıktıyı elle yazmak. Üçte birini kapalı tutmak. Doğrulama kodunu yazmak. Yedi metriği ayrı ayrı raporlamak. Her arızada bir vaka eklemek. Beş adım, birkaç hafta — ve ondan sonra her model tartışması kısalıyor.',
      },
    ],
    kaynaklar: [SINAPTIK],
    ilgiliSluglar: ['evaluation', 'llmops'],
  },

  'basari-tanimi-yazmak': {
    govde: [
      {
        tip: 'paragraf',
        metin:
          'Bir yapay zekâ projesinin en zor belgesi, en kısa olanıdır: tek sayfalık başarı tanımı. Zorluğu teknik değil. Zorluk, o sayfayı yazmanın belirsizliği ortadan kaldırması — ve belirsizliğin çoğu paydaş için konforlu olması.',
      },
      { tip: 'altbaslik', metin: 'Neden yazılmıyor?', kimlik: 'neden' },
      {
        tip: 'paragraf',
        metin:
          '"Verimliliği artıracağız" cümlesi kimseyi rahatsız etmez. "Bu kuyruktaki ortalama işlem süresini şu değerden şu değere indireceğiz" cümlesi ise bir taahhüt. Taahhüt, sorumluluk demek; sorumluluk, başarısızlık ihtimalini görünür kılıyor. Bu yüzden başarı tanımı yazma işi genellikle nazikçe erteleniyor.',
      },
      {
        tip: 'paragraf',
        metin:
          'Ertelemenin bedeli projenin sonunda ödeniyor. Ölçülecek bir şey tanımlanmadığı için, pilotun işe yarayıp yaramadığı bir kanaat tartışmasına dönüşüyor. Kanaat tartışmalarında en yüksek sesli görüş kazanıyor — ve bu, projenin kalitesiyle ilgisiz bir sonuç üretiyor.',
      },
      { tip: 'altbaslik', metin: 'Belgenin beş satırı', kimlik: 'bes-satir' },
      {
        tip: 'paragraf',
        metin:
          'İyi bir başarı tanımı beş şeyi söylüyor: hangi metrik ölçülecek, bugünkü değeri ne, hedef değer ne, nasıl ve kim ölçecek, karar hangi tarihte verilecek. Beşinci satır en çok atlanandır ve belki en önemlisidir: karar tarihi olmayan bir pilot, kapanmak yerine sürünüyor.',
      },
      {
        tip: 'alinti',
        metin:
          'Bir pilotun en değerli çıktısı "devam" kararı değil, gerekçeli bir "durdur" kararıdır. İkincisi, portföyün sağlıklı işlediğinin kanıtı.',
      },
      { tip: 'altbaslik', metin: 'Model metriği ile iş metriği', kimlik: 'metrikler' },
      {
        tip: 'paragraf',
        metin:
          'Yaygın bir karışıklık, model metriğini başarı tanımı yerine koymak. Doğruluk, tamamlama oranı ve kaynaklı cevap oranı mühendislik metrikleridir: sistemin nasıl çalıştığını söyler. İş metriği ise farklı bir soruyu cevaplar: bu, kurum için neyi değiştirdi? İkisi arasındaki bağ yazılmazsa, teknik başarı ile kurumsal başarı birbirinden kopuyor.',
      },
      { tip: 'altbaslik', metin: 'Hata tarafını da yazmak', kimlik: 'hata' },
      {
        tip: 'paragraf',
        metin:
          'Başarı tanımının eksik kalan yarısı, başarısızlığın tanımı. Model yanlış cevap verdiğinde ne olacak? Kim fark edecek, kim düzeltecek, kullanıcıya ne söylenecek? Bu akış, doğru çalıştığı akış kadar ayrıntılı tasarlanmadığında, ilk gerçek hata projenin güvenilirliğini götürüyor.',
      },
      {
        tip: 'paragraf',
        metin:
          'Tek sayfalık belgenin sonuna yazılacak en faydalı cümle şu olabilir: "Bu sistem şu koşulda kapatılır." Çıkış koşulu tanımlanmış bir proje, tanımlanmamış olandan daha kolay onay alıyor — çünkü riski sınırlı.',
      },
    ],
    kaynaklar: [SINAPTIK],
    ilgiliSluglar: ['evaluation', 'responsible-ai'],
  },

  'gorev-seti-atolyesi': {
    govde: [
      {
        tip: 'paragraf',
        metin:
          'Bu yazı bir uygulama rehberidir: kendi görev setinizi iki günde kurmak için izlenebilir bir plan. Amaç kusursuz bir set değil, karar verilebilir bir set. Kusursuzluk zaten mümkün değil; karar verilebilirlik ise iki günde mümkün.',
      },
      { tip: 'altbaslik', metin: 'Birinci gün: toplama', kimlik: 'birinci-gun' },
      {
        tip: 'paragraf',
        metin:
          'Sabah, üretim kayıtlarından ya da gerçek kullanıcı taleplerinden otuz vaka seçin. Seçim ölçütü tekrar sayısı değil çeşitlilik: on kolay, on orta, on zor. Zor vakaların çoğu sınırda kalanlar olacak — politikanın tam eşiğinde, belgenin iki maddesi arasında, kullanıcının yarım bıraktığı cümlede.',
      },
      {
        tip: 'paragraf',
        metin:
          'Öğleden sonra, her vaka için beklenen çıktıyı yazın. Burada bir kural var ve ihlal edilmemeli: beklenen çıktıyı iki kişi bağımsız olarak yazsın. Farkların olduğu yerler, aslında sizin süreç belirsizliklerinizin haritası. O farkları tartışıp uzlaşmak, setten önce gelen bir kazanç.',
      },
      { tip: 'altbaslik', metin: 'İkinci gün: doğrulama', kimlik: 'ikinci-gun' },
      {
        tip: 'paragraf',
        metin:
          'Sabah, doğrulama kodunu yazın: son durumu otomatik kontrol eden fonksiyonlar. Kontrol edilmesi gereken şey çıktı metni değil sonuç: doğru kuyruğa mı düştü, doğru kayıt mı güncellendi, hedef dışında bir şey değişti mi. Bu kod setin kalbi; onsuz set bir belge, onunla bir araç.',
      },
      {
        tip: 'paragraf',
        metin:
          'Öğleden sonra iki iş var. On vakayı karar kümesi olarak ayırıp kilitlemek — geliştirme sırasında açılmayacak. Ve mevcut kurulumunuzu koşturup yedi metriği raporlamak: tamamlama, adım verimliliği, kurtarma, yan etki, kalibrasyon, kararlılık, birim maliyet. Bu rapor sizin temel çizginiz.',
      },
      {
        tip: 'alinti',
        metin:
          'İki gün sonunda elinizde bir skor olmayacak. Bir zemin olacak — ve bundan sonraki her değişiklik ölçülebilir hale gelecek.',
      },
      { tip: 'altbaslik', metin: 'Sık düşülen dört tuzak', kimlik: 'tuzaklar' },
      {
        tip: 'paragraf',
        metin:
          'Birincisi: vakaları uydurmak. Uydurulmuş vaka, gerçek dağılımı temsil etmez ve size yanlış bir güven verir. İkincisi: beklenen çıktıyı modele yazdırmak — modelin eğilimlerini setinize kodlar. Üçüncüsü: karar kümesini sık açmak; her açılış onu bir geliştirme kümesine dönüştürüyor. Dördüncüsü: yedi metriği tek skora indirmek.',
      },
      { tip: 'altbaslik', metin: 'Sonrası', kimlik: 'sonrasi' },
      {
        tip: 'paragraf',
        metin:
          'Setin bakımı, kurulmasından kolay ama daha kolay ihmal edilir. Tek bir alışkanlık yeterli: her üretim arızasından sonra o vakayı sete ekleyin. Altı ay sonra elinizde kurumun kendi işini ölçebilen, kimsenin kopyalayamayacağı bir varlık olacak.',
      },
    ],
    kaynaklar: [SINAPTIK],
    ilgiliSluglar: ['evaluation', 'ai-agent'],
  },

  /* --- 2026 / AĞUSTOS — Uzun Bağlamın Sınırı --------------------------- */
  'uzun-baglam-yanilgisi': {
    govde: [
      {
        tip: 'paragraf',
        metin:
          'Bağlam penceresi, pazarlama açısından mükemmel bir sayı: tek boyutlu, kolay karşılaştırılabilir, büyüdükçe daha iyi görünen. Mühendislik açısından ise yanıltıcı bir sayı, çünkü bir kapasite ölçüsünü bir kalite ölçüsü gibi okumaya davet ediyor.',
      },
      { tip: 'altbaslik', metin: 'Koymak ile kullanmak', kimlik: 'koymak-kullanmak' },
      {
        tip: 'paragraf',
        metin:
          'Bir bilgiyi pencereye koymak, modelin o bilgiyi kullanacağını garanti etmiyor. Uzun girdilerde modelin bilgiyi değerlendirmesi tekdüze değil; ortadaki bölümler daha kolay gözden kaçıyor. Bu, dokümantasyonlarda artık bilinen bir davranış olarak tarif ediliyor ve pratikte "her şeyi isteme koy" stratejisinin neden beklendiği kadar iyi çalışmadığını açıklıyor.',
      },
      {
        tip: 'paragraf',
        metin:
          'İkinci sorun dikkat seyrelmesi. İlgisiz bağlam, modelin ilgili bilgiye ayırdığı ağırlığı azaltıyor. Yani bağlama fazladan bilgi eklemek, bazı durumlarda doğruluğu artırmak yerine düşürüyor. Bu, sezgiye aykırı ve tam bu yüzden çok pahalı bir yanılgı.',
      },
      { tip: 'altbaslik', metin: 'Üç bedel', kimlik: 'bedel' },
      {
        tip: 'paragraf',
        metin:
          'Uzun bağlamın bedeli üç kalemde birikiyor ve üçü aynı yönde hareket etmiyor. Maliyet, girdi token hacmiyle doğrusal artıyor. Gecikme, ilk tokene kadar geçen süreyi uzatıyor. Doğruluk ise ilgisiz bağlam eklendiğinde düşebiliyor. Bir ürün kararı verirken üçünü ayrı ayrı ölçmek gerekiyor; tek bir "daha iyi" yok.',
      },
      {
        tip: 'alinti',
        metin:
          'Bir isteme giren her token, oraya neden girdiğini açıklayabiliyor olmalı. Açıklayamıyorsa, penceresi ne kadar büyük olursa olsun bakımı zor bir sistem kuruyorsunuz.',
      },
      { tip: 'altbaslik', metin: 'Rakip değil, tamamlayıcı', kimlik: 'tamamlayici' },
      {
        tip: 'paragraf',
        metin:
          'Uzun bağlam ile geri getirme uzun süre alternatif olarak konuşuldu. Sahadaki kurulumlar bu çerçeveyi terk ediyor: en dayanıklı yapı, geri getirmeyle daraltılmış bağlamı geniş bir pencereye yerleştirmek. Geri getirme neyin okunacağına karar veriyor; geniş pencere de o kararın rahat bir alanda uygulanmasını sağlıyor.',
      },
      { tip: 'altbaslik', metin: 'Bağlamı yönetmek', kimlik: 'yonetim' },
      {
        tip: 'paragraf',
        metin:
          'Bağlam bütçesini dört kalemde planlamak pratik bir disiplin: sistem istemi, geri getirilen bağlam, konuşma geçmişi ve çıktı için ayrılan pay. Bu dördü ölçülmediğinde bütçe sessizce aşılıyor ve en görünür belirti cevabın ortadan kesilmesi oluyor — oysa sorun modelde değil, muhasebede.',
      },
      {
        tip: 'paragraf',
        metin:
          'Uzun oturumlarda ek bir tehlike var: özetleyerek taşıma. Geçmişi özetlemek gerekli, ama özet kısıtları da beraberinde silebiliyor. Oturumun başında verilen "asla üretim veritabanına yazma" talimatı, yirminci adımda özetin dışında kalmış olabilir. Kritik kısıtlar istemde tekrar edilmek yerine araç katmanında zorlanmalı.',
      },
    ],
    kaynaklar: [SINAPTIK],
    ilgiliSluglar: ['context-window', 'rag', 'chunking'],
  },

  'bellek-mimarileri': {
    govde: [
      {
        tip: 'paragraf',
        metin:
          'Bir dil modelinin belleği yok. Her çağrı, bağlamda ne varsa ondan ibaret. "Hatırlama" dediğimiz şey, uygulamanın önceki bilgiyi yeniden bağlama koymasıdır. Bu basit gerçek, bellek mimarisinin neden bir model özelliği değil bir sistem tasarımı olduğunu açıklıyor.',
      },
      { tip: 'altbaslik', metin: 'Dört tür bellek', kimlik: 'turler' },
      {
        tip: 'paragraf',
        metin:
          'Pratikte dört farklı ihtiyaç, dört farklı mekanizma gerektiriyor. Çalışma belleği, mevcut görevin ara sonuçlarını taşır ve görev bitince atılır. Oturum belleği, konuşma geçmişini tutar ve sınırlanması gerekir. Kalıcı kullanıcı belleği, tercihleri ve bağlamı saklar ve gizlilik kuralları gerektirir. Bilgi belleği ise kurumsal belgeler — yani geri getirme katmanı.',
      },
      {
        tip: 'paragraf',
        metin:
          'Bu dördü karıştırıldığında tipik arızalar çıkıyor: konuşma geçmişi sonsuz büyüyor, kullanıcı tercihi bir görevden diğerine sızıyor, kurumsal bilgi oturum belleğine kopyalanıp eskiyor. Her birinin ayrı bir saklama süresi ve ayrı bir erişim kuralı olması gerekiyor.',
      },
      { tip: 'altbaslik', metin: 'Sınırlama stratejileri', kimlik: 'sinirlama' },
      {
        tip: 'paragraf',
        metin:
          'Oturum belleğini sınırlamanın üç yaygın yolu var. Kayan pencere: en eski turları düşürmek; basit ama erken kısıtları kaybediyor. Özetleme: geçmişi sıkıştırmak; yer kazandırıyor ama ayrıntı ve kısıt kaybı riski taşıyor. Seçici geri getirme: geçmişi de bir dizin olarak ele alıp yalnızca ilgili turları geri getirmek; en iyi sonucu veriyor, en fazla mühendislik istiyor.',
      },
      {
        tip: 'alinti',
        metin:
          'Kısıtları özete emanet etmeyin. Bir kısıt önemliyse, istemde tekrar edilmesi değil araç katmanında zorlanması gerekir.',
      },
      { tip: 'altbaslik', metin: 'Kalıcı bellek ve gizlilik', kimlik: 'gizlilik' },
      {
        tip: 'paragraf',
        metin:
          'Kullanıcı hakkında bilgi saklamak ürünü belirgin biçimde iyileştiriyor; aynı oranda risk de ekliyor. Kalıcı bellek tasarımının ilk kararı teknik değil politika: ne saklanır, ne kadar süre, kim görebilir, kullanıcı nasıl siler. Bu dört soruya cevap verilmeden yazılan bir bellek katmanı, sonradan temizlenmesi çok pahalı bir yük oluyor.',
      },
      { tip: 'altbaslik', metin: 'Ajanlarda bellek', kimlik: 'ajan' },
      {
        tip: 'paragraf',
        metin:
          'Uzun ufuklu ajanlarda bellek, zincirin en kırılgan halkası. Yirmi adımlık bir görevde erken adımdaki bir karar, sonraki adımlar için bir kısıt oluşturuyor; bu kısıt bağlamdan düştüğünde ajan kendi kararıyla çelişiyor. Dayanıklı kurulumlar, görev durumunu bağlamda değil yapılandırılmış bir dış kayıtta tutuyor ve her adımda ilgili kısmı geri okuyor.',
      },
      {
        tip: 'paragraf',
        metin:
          'Bu yaklaşımın güzelliği, belleği denetlenebilir kılması. Bağlamda taşınan bellek görünmez ve hata ayıklanamaz; dış bir kayıtta tutulan bellek okunabilir, test edilebilir ve gerektiğinde düzeltilebilir.',
      },
    ],
    kaynaklar: [SINAPTIK],
    ilgiliSluglar: ['context-window', 'ai-agent', 'rag'],
  },
};
