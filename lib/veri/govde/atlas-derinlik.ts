import type { Blok, Kaynak, SSS, SurumKaydi } from '@/lib/tipler';

/**
 * ÖRNEK VERİ — Atlas derinleştirme katmanı.
 *
 * `atlas.ts` içindeki girdiler ilk yayın gövdesini taşır. Bu modül aynı
 * girdilere ek bölümler, SSS, kaynak ve sürüm kaydı ekler; `atlas.ts` iki
 * katmanı birleştirir.
 *
 * - `onGovde`: mevcut gövdenin BAŞINA eklenir (answer-first blok için).
 * - `ekGovde`: mevcut gövdenin SONUNA eklenir.
 * - `sss`: mevcut SSS'lerin sonuna eklenir.
 *
 * Sayısal örnekler TEMSİLÎ'dir; ölçüm olarak alıntılanamaz.
 */

export type AtlasEki = {
  onGovde?: Blok[];
  ekGovde?: Blok[];
  sss?: SSS[];
  kaynaklar?: Kaynak[];
  surumler?: SurumKaydi[];
};

const SAGLAYICI: Kaynak = {
  ad: 'Sağlayıcı dokümantasyonları',
  yayinci: 'Model ve altyapı sağlayıcıları',
  tur: 'Dokümantasyon',
};

const SINAPTIK: Kaynak = {
  ad: 'Sinaptik Research — kavram doğrulama notları',
  yayinci: 'Sinaptik Lab',
  tur: 'Teknik rapor',
};

export const ATLAS_EKLERI: Record<string, AtlasEki> = {
  /* ---------------------------------------------------------------------- */
  transformer: {
    onGovde: [
      {
        tip: 'kisa-cevap',
        metin:
          'Transformer, diziyi sırayla işlemek yerine her ögenin diğer tüm ögelerle ilişkisini aynı anda hesaplayan bir mimaridir. Bu iki şeyi birden sağlar: uzak bağımlılıkların korunması ve eğitimin paralelleşmesi.',
      },
    ],
    ekGovde: [
      { tip: 'altbaslik', metin: 'Bir katmanın içinde ne var?', kimlik: 'katman' },
      {
        tip: 'akis',
        adimlar: [
          { ad: 'Katman normalizasyonu', aciklama: 'Girdi, kararlı eğitim için normalize edilir.' },
          {
            ad: 'Çok başlı dikkat',
            aciklama: 'Ögeler arası ilişkiler paralel başlarla hesaplanır.',
          },
          { ad: 'Artık bağlantı', aciklama: 'Girdi, çıktıya eklenerek gradyan yolu kısaltılır.' },
          {
            ad: 'İleri beslemeli ağ',
            aciklama: 'Her öge bağımsız olarak genişletilip daraltılır.',
          },
          { ad: 'Artık bağlantı', aciklama: 'Aynı toplama işlemi tekrarlanır ve katman kapanır.' },
        ],
      },
      {
        tip: 'paragraf',
        metin:
          'Modern modeller bu katmanı onlarca kez üst üste koyar. Parametre sayısının büyük kısmı dikkat bloklarında değil, ileri beslemeli katmanlarda bulunur; Mixture of Experts mimarileri tam bu noktaya müdahale eder.',
      },
      {
        tip: 'altbaslik',
        metin: 'Kodlayıcı, kod çözücü ve yalnız kod çözücü',
        kimlik: 'varyantlar',
      },
      {
        tip: 'tablo',
        basliklar: ['Varyant', 'Yapı', 'Tipik kullanım'],
        satirlar: [
          ['Yalnız kodlayıcı', 'Çift yönlü dikkat', 'Sınıflandırma, gömme üretimi'],
          ['Kodlayıcı-kod çözücü', 'Çapraz dikkatle bağlı iki yığın', 'Çeviri, özetleme'],
          ['Yalnız kod çözücü', 'Nedensel (tek yönlü) dikkat', 'Üretken dil modelleri'],
        ],
        aciklama: 'Bugünkü büyük dil modellerinin çoğu yalnız kod çözücü ailesindendir.',
      },
      { tip: 'altbaslik', metin: 'Konum bilgisi', kimlik: 'konum' },
      {
        tip: 'paragraf',
        metin:
          'Dikkat mekanizması sırayı kendiliğinden bilmez: ögeleri bir küme gibi görür. Konum bilgisi ayrıca kodlanır. Sinüzoidal kodlama, öğrenilmiş konum gömmeleri ve döndürmeli konum kodlaması yaygın yaklaşımlardır; son grubun, eğitimde görülenden uzun dizilere daha iyi genellediği bildirilmektedir.',
      },
      {
        tip: 'uyari',
        ton: 'bilgi',
        metin:
          'Tam dikkat, dizi uzunluğuyla karesel büyür. Uzun bağlam desteği genellikle bir kısayolla (seyrek dikkat, kayan pencere, gruplandırılmış sorgu) sağlanır ve bu kısayolların modelleme bedeli vardır.',
      },
    ],
    sss: [
      {
        soru: 'Neden RNN yerine transformer kullanılıyor?',
        cevap:
          'RNN girdiyi sırayla işler; bu hem uzun bağımlılıkları zayıflatır hem eğitimi paralelleştirmeyi engeller. Transformer her ilişkiyi aynı anda hesapladığı için modern donanımda çok daha verimli eğitilir.',
      },
      {
        soru: 'Parametre sayısı yetenekle doğrudan ilişkili mi?',
        cevap:
          'Kaba bir ilişki var ama belirleyici tek değişken değil. Veri kalitesi, eğitim süresi, mimari tercihler ve çıkarım anındaki hesaplama bütçesi de sonucu belirler.',
      },
    ],
    kaynaklar: [SAGLAYICI, SINAPTIK],
    surumler: [
      {
        surum: 'v1.2',
        tarih: '2026-08-28',
        degisiklik: 'Katman yapısı, varyantlar ve konum kodlaması eklendi.',
      },
      { surum: 'v1.0', tarih: '2026-04-03', degisiklik: 'İlk yayın.' },
    ],
  },

  /* ---------------------------------------------------------------------- */
  embedding: {
    onGovde: [
      {
        tip: 'kisa-cevap',
        metin:
          'Gömme, bir metni veya görseli anlamsal yakınlığı koruyan sabit uzunlukta bir vektöre çevirir. Böylece "benzerlik" bir geometri problemine indirgenir ve arama, kümeleme, öneri aynı altyapıyla yapılabilir hale gelir.',
      },
    ],
    ekGovde: [
      { tip: 'altbaslik', metin: 'Benzerlik nasıl ölçülür?', kimlik: 'benzerlik' },
      {
        tip: 'tablo',
        basliklar: ['Ölçü', 'Neye duyarlı', 'Not'],
        satirlar: [
          ['Kosinüs benzerliği', 'Yön', 'Metin uzunluğundan bağımsız; en yaygın tercih'],
          ['İç çarpım', 'Yön ve büyüklük', 'Normalize edilmiş vektörlerde kosinüse denk'],
          ['Öklid mesafesi', 'Konum', 'Normalize vektörlerde kosinüsle sıralama olarak uyumlu'],
        ],
        aciklama: 'Vektörler normalize edildiğinde üç ölçü büyük ölçüde aynı sıralamayı üretir.',
      },
      { tip: 'altbaslik', metin: 'Nerede yanılır?', kimlik: 'yanilma' },
      {
        tip: 'liste',
        ogeler: [
          'Olumsuzluk: "faturayı iptal etmeyin" ile "faturayı iptal edin" vektörde birbirine yakın düşer.',
          'Kesin kod: "SKU 44821" gibi diziler anlamsal olarak ayırt edilemez.',
          'Sayısal karşılaştırma: "30 günden fazla" ifadesi bir eşik olarak temsil edilmez.',
          'Alan dili: genel derlemle eğitilmiş model, kurum içi jargonu yakalamaz.',
        ],
      },
      {
        tip: 'paragraf',
        metin:
          'Bu dört zayıflık, kurumsal belge setlerinde neden hibrit aramaya (gömme + lexical) ihtiyaç duyulduğunu açıklar. Gömme tek başına kullanıldığında bu sorgular sessizce yanlış sonuç üretir.',
      },
      { tip: 'altbaslik', metin: 'Model seçimi', kimlik: 'model-secimi' },
      {
        tip: 'liste',
        sirali: true,
        ogeler: [
          'Türkçe performansı ölçülmüş mü, yoksa varsayılıyor mu?',
          'Girdi token sınırı, parçalama stratejinizle uyumlu mu?',
          'Boyut: depolama ve arama maliyetini karşılıyor musunuz?',
          'Asimetrik kullanım (sorgu ve belge için ayrı önek) destekliyor mu?',
          'Sürüm politikası: model değişirse yeniden dizinleme maliyetini hesapladınız mı?',
        ],
      },
      {
        tip: 'uyari',
        ton: 'dikkat',
        metin:
          'Farklı gömme modellerinin vektörleri aynı uzayda değildir. Model değiştirirken eski ve yeni vektörleri karıştırmak, fark edilmeyen bir kalite kaybı üretir.',
      },
    ],
    sss: [
      {
        soru: 'Gömme modelini ince ayarlamak gerekir mi?',
        cevap:
          'Çoğu senaryoda gerekmez. Alan dili çok özelse ve elinizde etiketli sorgu-belge çiftleri varsa kazanç sağlayabilir; aksi hâlde önce parçalama ve hibrit arama iyileştirmeleri daha yüksek getirili.',
      },
      {
        soru: 'Görsel ve metin aynı uzayda temsil edilebilir mi?',
        cevap:
          'Evet; çok modlu gömme modelleri metin ve görseli ortak bir uzaya yerleştirir. Bu, metinle görsel arama yapmayı mümkün kılar.',
      },
    ],
    kaynaklar: [SAGLAYICI, SINAPTIK],
    surumler: [
      {
        surum: 'v1.2',
        tarih: '2026-09-01',
        degisiklik: 'Benzerlik ölçüleri ve zayıf noktalar eklendi.',
      },
      { surum: 'v1.0', tarih: '2026-04-19', degisiklik: 'İlk yayın.' },
    ],
  },

  /* ---------------------------------------------------------------------- */
  mcp: {
    onGovde: [
      {
        tip: 'kisa-cevap',
        metin:
          'Model Context Protocol, araç ve veri kaynağı tanımlarını istemciden bağımsız hale getiren açık bir protokoldür: bir kez sunucu yazılır, protokolü konuşan her istemci o aracı kullanabilir.',
      },
    ],
    ekGovde: [
      { tip: 'altbaslik', metin: 'Mimari', kimlik: 'mimari' },
      {
        tip: 'tablo',
        basliklar: ['Rol', 'Ne yapar', 'Örnek'],
        satirlar: [
          [
            'Sunucu (server)',
            'Araç, kaynak ve istem şablonu yayımlar',
            'Dosya sistemi, veritabanı, bilet sistemi bağlayıcısı',
          ],
          [
            'İstemci (client)',
            'Sunucuya bağlanır, yetenekleri modele sunar',
            'Masaüstü asistan, IDE eklentisi, ajan çerçevesi',
          ],
          [
            'Ana uygulama (host)',
            'Oturumu ve yetkileri yönetir',
            'Kullanıcının çalıştırdığı uygulama',
          ],
        ],
        aciklama: 'Ayrım, aracı yazan ile aracı kullanan tarafı birbirinden bağımsız kılar.',
      },
      { tip: 'altbaslik', metin: 'Üç yetenek tipi', kimlik: 'yetenekler' },
      {
        tip: 'liste',
        ogeler: [
          'Araçlar (tools): modelin çağırabileceği, yan etkisi olabilen işlemler.',
          'Kaynaklar (resources): modelin okuyabileceği veri; salt okunur ve adreslenebilir.',
          'İstemler (prompts): kullanıcı veya model tarafından çağrılabilen yeniden kullanılabilir şablonlar.',
        ],
      },
      {
        tip: 'paragraf',
        metin:
          'Araç ile kaynak ayrımı yalnızca semantik değil, güvenlik açısından da anlamlı: salt okunur bir kaynağın yetki profili, yan etkisi olan bir araçtan farklı yönetilebilir.',
      },
      { tip: 'altbaslik', metin: 'Güvenlik açısından ne değişir?', kimlik: 'guvenlik' },
      {
        tip: 'paragraf',
        metin:
          'Protokol, araç eklemeyi kolaylaştırdığı ölçüde yetki zarfını da genişletmeyi kolaylaştırır. Bir istemciye eklenen her sunucu, modelin erişebildiği yüzeyi büyütür. Bu yüzden sunucu ekleme kararı bir yapılandırma değil, bir güvenlik kararı olarak ele alınmalı.',
      },
      {
        tip: 'uyari',
        ton: 'dikkat',
        metin:
          'Üçüncü taraf bir sunucu, modele hem araç hem metin sunar. Güvenilmeyen bir sunucunun araç açıklamaları da dolaylı istem enjeksiyonu taşıyıcısı olabilir.',
      },
      { tip: 'altbaslik', metin: 'Nerede işe yarar?', kimlik: 'kullanim' },
      {
        tip: 'liste',
        ogeler: [
          'Aynı kurumsal entegrasyonu birden çok asistan ve ajanda kullanmak.',
          'Araç geliştirmeyi istemci yol haritasından bağımsızlaştırmak.',
          'Yerel geliştirme ortamındaki kaynakları modele denetimli biçimde açmak.',
        ],
      },
    ],
    sss: [
      {
        soru: 'MCP ile function calling aynı şey mi?',
        cevap:
          'Değil. Araç çağırma, model ile uygulama arasındaki çıktı biçimidir. MCP, araç ve kaynakların istemciden bağımsız tanımlanmasını sağlayan taşıma ve keşif protokolüdür; ikisi birlikte kullanılır.',
      },
      {
        soru: 'Bir MCP sunucusu eklemek risk taşır mı?',
        cevap:
          'Evet. Sunucu, modele yeni yetkiler açar ve açıklamaları model bağlamına girer. Kaynağı bilinmeyen sunucular, yetkisi kısıtlı bir ortamda denenmeden üretimde kullanılmamalı.',
      },
    ],
    kaynaklar: [
      {
        ad: 'Protokol belirtimi ve referans uygulamalar',
        yayinci: 'Açık kaynak topluluğu',
        tur: 'Dokümantasyon',
      },
    ],
    surumler: [
      {
        surum: 'v1.1',
        tarih: '2026-09-06',
        degisiklik: 'Mimari, yetenek tipleri ve güvenlik bölümü eklendi.',
      },
      { surum: 'v1.0', tarih: '2026-06-02', degisiklik: 'İlk yayın.' },
    ],
  },

  /* ---------------------------------------------------------------------- */
  'mixture-of-experts': {
    onGovde: [
      {
        tip: 'kisa-cevap',
        metin:
          'Mixture of Experts, modelin toplam kapasitesini artırırken her girdi için yalnızca küçük bir kısmını çalıştırır. Böylece parametre sayısı ile çıkarım maliyeti birbirinden ayrılır.',
      },
    ],
    ekGovde: [
      { tip: 'altbaslik', metin: 'Yönlendirici nasıl çalışır?', kimlik: 'yonlendirici' },
      {
        tip: 'paragraf',
        metin:
          'Her ileri beslemeli katman, tek bir blok yerine çok sayıda "uzman" bloktan oluşur. Küçük bir yönlendirici ağ, her token için hangi uzmanların çalışacağına karar verir — tipik olarak ikisi veya birkaçı. Diğer uzmanlar o token için hiç hesaplanmaz.',
      },
      {
        tip: 'tablo',
        basliklar: ['Kavram', 'Anlamı', 'Neden önemli'],
        satirlar: [
          [
            'Toplam parametre',
            'Modeldeki tüm ağırlıklar',
            'Bellek ve depolama ihtiyacını belirler',
          ],
          ['Etkin parametre', 'Bir token için çalışan ağırlıklar', 'Çıkarım maliyetini belirler'],
          [
            'top-k yönlendirme',
            'Token başına seçilen uzman sayısı',
            'Kalite ile maliyet arasındaki ayar',
          ],
          ['Yük dengesi', 'Uzmanlara işin eşit dağılması', 'Dengesizlik kapasiteyi boşa harcar'],
        ],
        aciklama:
          'MoE modellerini karşılaştırırken toplam parametre yerine etkin parametreye bakmak daha bilgilendirici.',
      },
      { tip: 'altbaslik', metin: 'Ne kazandırır, ne maliyeti var?', kimlik: 'denge' },
      {
        tip: 'liste',
        ogeler: [
          'Kazanç: aynı çıkarım maliyetiyle daha yüksek kapasite ve genellikle daha iyi kalite.',
          'Maliyet: tüm uzmanlar bellekte tutulmalı; bellek ihtiyacı etkin parametreye göre çok yüksek.',
          'Karmaşıklık: yük dengeleme ve yönlendirme kararlılığı ek eğitim zorluğu getirir.',
          'Dağıtım: uzmanların cihazlara dağıtılması ağ trafiği ve gecikme yaratır.',
        ],
      },
      {
        tip: 'uyari',
        ton: 'bilgi',
        metin:
          'MoE bir modeli "daha ucuz" yapmaz; maliyeti hesaplamadan belleğe kaydırır. Kendi altyapınızda çalıştıracaksanız belirleyici kısıt bellek olabilir.',
      },
    ],
    sss: [
      {
        soru: 'Uzmanlar konulara göre mi ayrışıyor?',
        cevap:
          'Genellikle insan için anlamlı konulara göre ayrışmaz. Yönlendirme, eğitim sırasında ortaya çıkan istatistiksel bir bölünmedir; "bu uzman hukuk metinlerine bakıyor" türü yorumlar çoğunlukla yanıltıcıdır.',
      },
      {
        soru: 'MoE modelini nicemlemek mantıklı mı?',
        cevap:
          'Bellek baskın kısıt olduğu için sıkça tercih edilir. Ancak kalite etkisi yoğun modellerden farklı olabilir; kendi görev setinizde ölçmeden üretime almayın.',
      },
    ],
    kaynaklar: [SAGLAYICI],
    surumler: [
      {
        surum: 'v1.1',
        tarih: '2026-08-22',
        degisiklik: 'Yönlendirme ve etkin parametre bölümleri eklendi.',
      },
      { surum: 'v1.0', tarih: '2026-06-16', degisiklik: 'İlk yayın.' },
    ],
  },

  /* ---------------------------------------------------------------------- */
  'prompt-injection': {
    onGovde: [
      {
        tip: 'kisa-cevap',
        metin:
          'İstem enjeksiyonu, modelin işlediği içeriğin modele talimat gibi davranmasıdır. Araç kullanabilen bir ajanda bu bir metin filtreleme sorunu değil, yetki sorunudur: saldırgan modelin değil ajanın yetkilerini kullanır.',
      },
    ],
    ekGovde: [
      { tip: 'altbaslik', metin: 'Doğrudan ve dolaylı enjeksiyon', kimlik: 'turler' },
      {
        tip: 'tablo',
        basliklar: ['Tür', 'Kim kötü niyetli', 'Taşıyıcı', 'Kurumsal risk'],
        satirlar: [
          [
            'Doğrudan',
            'Kullanıcının kendisi',
            'Kullanıcı mesajı',
            'Orta: kendi hesabının yetkisiyle sınırlı',
          ],
          [
            'Dolaylı',
            'Üçüncü taraf',
            'Web sayfası, e-posta, belge, araç çıktısı',
            'Yüksek: kullanıcı farkında değil',
          ],
        ],
        aciklama:
          'Dolaylı enjeksiyon daha risklidir çünkü iyi niyetli kullanıcı, saldırının taşıyıcısı olur.',
      },
      { tip: 'altbaslik', metin: 'Saldırı zinciri', kimlik: 'zincir' },
      {
        tip: 'akis',
        adimlar: [
          { ad: 'Yerleştirme', aciklama: 'Talimat, ajanın okuyacağı bir kaynağa gömülür.' },
          { ad: 'Alım', aciklama: 'Ajan meşru bir görev sırasında içeriği bağlamına alır.' },
          { ad: 'Karıştırma', aciklama: 'Model içeriği veri değil talimat olarak yorumlar.' },
          {
            ad: 'Kötüye kullanım',
            aciklama: 'Ajan kendi yetkileriyle saldırganın hedefini yürütür.',
          },
          {
            ad: 'Sızma',
            aciklama: 'Veri dış kanala taşınır veya geri alınamaz bir eylem yapılır.',
          },
        ],
      },
      {
        tip: 'paragraf',
        metin:
          'Savunma yatırımının ağırlığı son iki adıma verilmeli. Model tarafında karıştırmayı tamamen engellemek bugünkü bilgiyle mümkün değil; ancak kötüye kullanım ve sızma adımlarını mimariyle kesmek mümkün.',
      },
      { tip: 'altbaslik', metin: 'Neden filtre yetmez?', kimlik: 'filtre' },
      {
        tip: 'liste',
        ogeler: [
          'Kodlama ve gizleme: talimat base64, homoglif, görünmez karakter veya görüntü içinde taşınabilir.',
          'Dolaylılık: talimat doğrudan değil, modelin çıkaracağı bir sonuç olarak ifade edilebilir.',
          'Dil çeşitliliği: tek dilde eğitilmiş filtre, başka dildeki talimatı geçirir.',
          'Meşru benzerlik: "bu belgeyi özetle ve ekibe gönder" hem meşru hem saldırı olabilir.',
        ],
      },
      { tip: 'altbaslik', metin: 'Katmanlı savunma', kimlik: 'savunma' },
      {
        tip: 'tablo',
        basliklar: ['Katman', 'Ne yapar', 'Sınırı'],
        satirlar: [
          [
            'Kaynak etiketleme',
            'Dış içerik "veri" kanalında taşınır',
            'Model etiketi göz ardı edebilir',
          ],
          [
            'En az yetki',
            'Ajan yalnızca gereken araca erişir',
            'Her akış için elle tasarım gerekir',
          ],
          ['Onay kapısı', 'Geri alınamaz eylem insana bağlanır', 'Onay yorgunluğu riski'],
          [
            'Çıkış kontrolü',
            'Dış ağ izin listesiyle sınırlanır',
            'Meşru entegrasyonları yavaşlatır',
          ],
          ['Kum havuzu', 'Kod çalıştırma yalıtılır', 'Kurulum ve bakım maliyeti'],
          ['Kayıt ve tespit', 'Anormal araç deseni alarm üretir', 'Olaydan sonra çalışır'],
        ],
        aciklama: 'Tek başına yeterli olan katman yok; güvence bileşimden gelir.',
      },
      {
        tip: 'uyari',
        ton: 'dikkat',
        metin:
          'Sistem isteminde "gömülü talimatlara uymayacaksın" yazmak bir güvenlik kontrolü değil, bir tercih beyanıdır. Denetimde kanıt olarak kabul edilmez.',
      },
    ],
    sss: [
      {
        soru: 'Prompt injection tamamen çözülebilir mi?',
        cevap:
          'Bugünkü bilgiyle model düzeyinde çözülmüş sayılmıyor. Pratik hedef riski sıfırlamak değil, etkisini kabul edilebilir seviyeye indirmek.',
      },
      {
        soru: 'Jailbreak ile prompt injection aynı şey mi?',
        cevap:
          'Değil. Jailbreak, modelin güvenlik politikalarını aşmayı hedefler. İstem enjeksiyonu, modelin işlediği veriyi talimata dönüştürmeyi hedefler. İkisi birlikte de kullanılabilir.',
      },
      {
        soru: 'Kırmızı takım denemesi nasıl yapılır?',
        cevap:
          'Ajanın okuyacağı bir kaynağa gömülü talimat yerleştirip veri sızdırma veya yetkisiz eylem denemesi yapılır. Deneme, üretimden yalıtılmış bir ortamda ve yazılı kapsamla yürütülmeli.',
      },
    ],
    kaynaklar: [
      {
        ad: 'Uygulama güvenliği risk listeleri',
        yayinci: 'Açık güvenlik toplulukları',
        tur: 'Teknik rapor',
      },
      SINAPTIK,
    ],
    surumler: [
      {
        surum: 'v1.2',
        tarih: '2026-09-09',
        degisiklik: 'Katmanlı savunma tablosu ve kırmızı takım notu eklendi.',
      },
      { surum: 'v1.0', tarih: '2026-06-09', degisiklik: 'İlk yayın.' },
    ],
  },

  /* ---------------------------------------------------------------------- */
  'vector-database': {
    onGovde: [
      {
        tip: 'kisa-cevap',
        metin:
          'Vektör veritabanı, yüksek boyutlu gömme vektörlerini saklayan ve bir sorgu vektörüne en yakın kayıtları hızlıca bulan veri deposudur. Ayırt edici özelliği tam eşleşme değil yakınlık sorgusudur.',
      },
    ],
    ekGovde: [
      { tip: 'altbaslik', metin: 'Yaklaşık en yakın komşu', kimlik: 'ann' },
      {
        tip: 'paragraf',
        metin:
          'Milyonlarca vektörde tam en yakın komşuyu bulmak, her kayıtla karşılaştırma yapmayı gerektirir. Üretim sistemleri bunun yerine yaklaşık en yakın komşu (ANN) indeksleri kullanır: küçük bir geri çağırma kaybı karşılığında aramayı çok hızlandırır.',
      },
      {
        tip: 'tablo',
        basliklar: ['İndeks tipi', 'Güçlü yanı', 'Dikkat'],
        satirlar: [
          ['Düz (brute force)', 'Tam isabet', 'Yalnızca küçük veri kümelerinde uygulanabilir'],
          ['Grafik tabanlı', 'Yüksek geri çağırma, hızlı sorgu', 'Bellek kullanımı yüksek'],
          ['Kümeleme tabanlı', 'Bellek verimli', 'Küme sayısı ayarı sonucu belirgin etkiler'],
          ['Nicemlenmiş', 'Çok büyük veride ekonomik', 'Hassasiyet kaybı; geri çağırma düşer'],
        ],
        aciklama: 'Seçim veri büyüklüğü, bellek bütçesi ve gecikme hedefine göre yapılır.',
      },
      { tip: 'altbaslik', metin: 'Filtreli arama: asıl zorluk', kimlik: 'filtreli-arama' },
      {
        tip: 'paragraf',
        metin:
          'Kurumsal kullanımda arama nadiren filtresizdir: kullanıcının yetkisi, belge sürümü, dil ve tarih aralığı sorguya girer. Filtreyi aramadan sonra uygulamak ("ara, sonra filtrele") sonuç sayısını beklenmedik biçimde sıfıra düşürebilir; bu yüzden filtrenin indeks düzeyinde desteklenmesi önemlidir.',
      },
      {
        tip: 'uyari',
        ton: 'dikkat',
        metin:
          'Yetki filtresi arama sorgusunun parçası olmalı, sonradan uygulanan bir kontrol değil. Aksi hâlde kullanıcının görmemesi gereken bir belge cevaba karışabilir.',
      },
      { tip: 'altbaslik', metin: 'Ayrı bir veritabanı şart mı?', kimlik: 'gerekli-mi' },
      {
        tip: 'liste',
        ogeler: [
          'Küçük ölçek (on binler): mevcut ilişkisel veya doküman veritabanının vektör eklentisi çoğu zaman yeterli.',
          'Orta ölçek: filtreli arama ve yeniden dizinleme ihtiyaçları özel çözümleri anlamlı kılar.',
          'Büyük ölçek: dağıtık indeksleme, çoklu kiracı ve bellek yönetimi belirleyici olur.',
          'Her durumda: lexical arama yeteneğinin aynı sistemde bulunması hibrit kurulumu kolaylaştırır.',
        ],
      },
    ],
    sss: [
      {
        soru: 'Vektör veritabanı klasik veritabanının yerine mi geçer?',
        cevap:
          'Geçmez; yanına eklenir. Kaynak veri, yetkiler ve iş kayıtları klasik sistemlerde kalır; vektör deposu yalnızca arama katmanını taşır.',
      },
      {
        soru: 'Yeniden dizinleme ne zaman gerekir?',
        cevap:
          'Gömme modeli veya parçalama stratejisi değiştiğinde. İkisi de tüm vektörlerin yeniden üretilmesini gerektirir; bu maliyet geçiş planında hesaplanmalı.',
      },
    ],
    kaynaklar: [SAGLAYICI, SINAPTIK],
    surumler: [
      {
        surum: 'v1.1',
        tarih: '2026-09-02',
        degisiklik: 'ANN indeksleri ve filtreli arama bölümleri eklendi.',
      },
      { surum: 'v1.0', tarih: '2026-05-15', degisiklik: 'İlk yayın.' },
    ],
  },

  /* ---------------------------------------------------------------------- */
  tokenization: {
    onGovde: [
      {
        tip: 'kisa-cevap',
        metin:
          'Tokenizasyon, metni modelin işleyebileceği en küçük birimlere bölme işlemidir. Ne harf ne kelime: sık geçen parçalar tek token, nadir veya çok ekli kelimeler birkaç token olur.',
      },
    ],
    ekGovde: [
      { tip: 'altbaslik', metin: 'Neden alt sözcük?', kimlik: 'alt-sozcuk' },
      {
        tip: 'tablo',
        basliklar: ['Yaklaşım', 'Sözlük boyutu', 'Dizi uzunluğu', 'Sözlük dışı kelime'],
        satirlar: [
          ['Karakter', 'Çok küçük', 'Çok uzun', 'Sorun yok'],
          ['Kelime', 'Çok büyük', 'Kısa', 'İşlenemez'],
          ['Alt sözcük', 'Makul', 'Makul', 'Parçalara bölünür'],
        ],
        aciklama:
          'Alt sözcük yaklaşımı, iki uçtaki sorunları birlikte çözdüğü için standart hâle geldi.',
      },
      { tip: 'altbaslik', metin: 'Türkçenin durumu', kimlik: 'turkce' },
      {
        tip: 'paragraf',
        metin:
          'Türkçe sondan eklemeli bir dil: tek kökten çok sayıda türetilmiş biçim çıkar. Ağırlıklı olarak İngilizce derlemlerle eğitilmiş tokenizerlar bu biçimleri daha fazla parçaya böler. Sonuç üç yerde görünür: aynı içerik daha pahalı, bağlam penceresine daha az metin sığıyor ve morfolojik ipuçları daha dağınık temsil ediliyor.',
      },
      {
        tip: 'uyari',
        ton: 'dikkat',
        metin:
          'Türkçe için tek bir token çarpanı vermek yanlış olur: model, tokenizer sürümü ve metin türüne göre değişir. Kendi metin örneklerinizle ölçmek tek güvenilir yol.',
      },
      { tip: 'altbaslik', metin: 'Pratik sonuçlar', kimlik: 'pratik' },
      {
        tip: 'liste',
        ogeler: [
          'Maliyet tahminini karakter sayısından değil, ölçülmüş token sayısından yapın.',
          'Kimlik, kod ve tarih alanları beklenenden çok token tutar; gereksiz kopyalamayın.',
          'Bağlam bütçesini dört kalemde planlayın: sistem istemi, bağlam, geçmiş ve çıktı payı.',
          'Tokenizer sürümü değişirse maliyet ve kesilme davranışı da değişir; sürümü kayda alın.',
        ],
      },
    ],
    sss: [
      {
        soru: 'Token sayısı ile kelime sayısı arasında sabit bir oran var mı?',
        cevap:
          'Yok. Oran dile, metin türüne ve tokenizer sürümüne göre değişir. Sondan eklemeli dillerde kelime başına token sayısı belirgin biçimde yüksektir.',
      },
      {
        soru: 'Çıktı neden bazen ortadan kesiliyor?',
        cevap:
          'Maksimum token sınırına ulaşıldığı için. Sınır, girdi ve çıktının toplamına uygulanır; uzun bir bağlam, cevaba ayrılan payı daraltır.',
      },
    ],
    kaynaklar: [SAGLAYICI],
    surumler: [
      {
        surum: 'v1.1',
        tarih: '2026-09-03',
        degisiklik: 'Türkçe bölümü ve pratik sonuçlar eklendi.',
      },
      { surum: 'v1.0', tarih: '2026-04-22', degisiklik: 'İlk yayın.' },
    ],
  },

  /* ---------------------------------------------------------------------- */
  'context-window': {
    onGovde: [
      {
        tip: 'kisa-cevap',
        metin:
          'Bağlam penceresi, modelin tek bir çağrıda dikkate alabileceği maksimum token sayısıdır. Bir kapasite ölçüsüdür; pencereye bilgi koymak, modelin o bilgiyi kullanacağını garanti etmez.',
      },
    ],
    ekGovde: [
      { tip: 'altbaslik', metin: 'Bütçe dört kalemden oluşur', kimlik: 'butce' },
      {
        tip: 'liste',
        sirali: true,
        ogeler: [
          'Sistem istemi: sabit; her çağrıda ödenir, kısaltmanın getirisi çağrı sayısıyla çarpılır.',
          'Bağlam: geri getirilen belge parçaları; en oynak ve en kontrol edilebilir kalem.',
          'Konuşma geçmişi: her turda birikir; sınırlanmazsa sessizce büyür.',
          'Çıktı payı: modelin cevabı da pencerenin içindedir.',
        ],
      },
      { tip: 'altbaslik', metin: 'Uzun bağlamın üç bedeli', kimlik: 'bedel' },
      {
        tip: 'tablo',
        basliklar: ['Bedel', 'Nasıl artar', 'Ne yapılabilir'],
        satirlar: [
          [
            'Maliyet',
            'Girdi token hacmiyle doğrusal',
            'Geri getirmeyle daraltma, bağlam önbelleği',
          ],
          ['Gecikme', 'İlk tokene kadar süre uzar', 'Önek önbellekleme, bağlam budama'],
          [
            'Doğruluk',
            'İlgisiz bağlam dikkati seyreltir',
            'Az ve isabetli parça, yeniden sıralama',
          ],
        ],
        aciklama: 'Üç bedel birlikte hareket etmez; ürün kararında ayrı ayrı değerlendirilmeli.',
      },
      { tip: 'altbaslik', metin: 'Uzun bağlam mı, geri getirme mi?', kimlik: 'rag-vs-uzun' },
      {
        tip: 'paragraf',
        metin:
          'Bu bir "ya/ya da" tercihi değil. Pratikte en dayanıklı kurulum, geri getirmeyle daraltılmış bağlamı geniş bir pencereye yerleştirmek. Tek ve orta boy bir belgeyi analiz ederken uzun bağlam tek başına yeterli olabilir; büyük, değişken ve çok kaynaklı belge kümelerinde geri getirme kaçınılmaz.',
      },
      {
        tip: 'uyari',
        ton: 'bilgi',
        metin:
          'Uzun girdilerde modelin bilgiyi kullanması tekdüze değildir; ortadaki bölümler daha kolay gözden kaçabilir. Kritik bilgiyi bağlamın başına veya sonuna yerleştirmek pratik bir önlem.',
      },
      { tip: 'altbaslik', metin: 'Uzun oturumları yönetmek', kimlik: 'oturum' },
      {
        tip: 'liste',
        ogeler: [
          'Geçmişe üst sınır koyun; aşıldığında özetleyerek taşıyın.',
          'Özetlerken kısıtları ayrı bir alanda koruyun; özet kısıtı da beraberinde silebilir.',
          'Kritik kısıtları istemde tekrar etmek yerine araç katmanında zorlayın.',
          'Bağlamda ne olduğunu izlerde kaydedin; hata ayıklamanın tek yolu bu.',
        ],
      },
    ],
    sss: [
      {
        soru: 'Daha büyük pencereye geçmek kaliteyi artırır mı?',
        cevap:
          'Kendiliğinden artırmaz. Kazanç, pencereye konan bilginin isabetine bağlı. Geçiş kararı ölçülmüş bir doğruluk kazancına dayanmalı; aksi hâlde yalnızca maliyet ve gecikme artar.',
      },
      {
        soru: 'Bağlam önbelleği nasıl çalışır?',
        cevap:
          'Aynı uzun öneki tekrar tekrar kullanan akışlarda, önekin hesaplanmış temsili yeniden kullanılır. Önek değiştiğinde önbellek geçersizleşir; bu yüzden sabit kısımların istemin başında toplanması önemlidir.',
      },
    ],
    kaynaklar: [SAGLAYICI, SINAPTIK],
    surumler: [
      {
        surum: 'v1.1',
        tarih: '2026-09-05',
        degisiklik: 'Bütçe kalemleri ve bedel tablosu eklendi.',
      },
      { surum: 'v1.0', tarih: '2026-05-08', degisiklik: 'İlk yayın.' },
    ],
  },

  /* ---------------------------------------------------------------------- */
  'fine-tuning': {
    onGovde: [
      {
        tip: 'kisa-cevap',
        metin:
          'İnce ayar, önceden eğitilmiş bir modelin parametrelerini hedef göreve uyarlamaktır. Bilgi eklemek için değil, davranışı biçimlendirmek için iyi bir araçtır: üslup, biçim ve alan dili.',
      },
    ],
    ekGovde: [
      { tip: 'altbaslik', metin: 'Ne için uygun, ne için değil?', kimlik: 'uygunluk' },
      {
        tip: 'tablo',
        basliklar: ['İhtiyaç', 'Doğru araç', 'Neden'],
        satirlar: [
          [
            'Güncel veya kurumsal bilgi',
            'Geri getirme (RAG)',
            'Bilgi belgede kalır, güncellenebilir, kaynak gösterilebilir',
          ],
          [
            'Tutarlı çıktı biçimi',
            'İnce ayar veya şema zorlama',
            'Davranış kalıbı parametrelere işlenebilir',
          ],
          ['Alan dili ve üslup', 'İnce ayar', 'İstemle anlatmak pahalı ve kırılgan'],
          ['Daha küçük modelle aynı kalite', 'Damıtma + ince ayar', 'Maliyet ve gecikme düşer'],
          ['Nadir görev formatı', 'İnce ayar', 'Az örnekli istem yeterli olmayabilir'],
          [
            'Sık değişen kurallar',
            'Geri getirme veya kod',
            'Her değişiklikte yeniden eğitim sürdürülemez',
          ],
        ],
        aciklama: 'İnce ayar ile geri getirme alternatif değil; farklı sorunları çözer.',
      },
      { tip: 'altbaslik', metin: 'Tam ince ayar ve verimli yöntemler', kimlik: 'yontemler' },
      {
        tip: 'paragraf',
        metin:
          'Tam ince ayarda tüm parametreler güncellenir; en esnek ama en pahalı yol. Parametre verimli yöntemler (düşük ranklı uyarlama gibi) yalnızca küçük bir ek ağırlık kümesini eğitir. Bu, eğitim maliyetini düşürür, birden çok uyarlamayı aynı temel model üzerinde tutmayı mümkün kılar ve geri almayı kolaylaştırır.',
      },
      { tip: 'altbaslik', metin: 'Veri kalitesi belirleyici', kimlik: 'veri' },
      {
        tip: 'liste',
        ogeler: [
          'Az ve temiz veri, çok ve gürültülü veriden neredeyse her zaman iyidir.',
          'Örnekler tutarlı olmalı: aynı girdi tipine iki farklı biçimde cevap verilen bir set, modele kararsızlık öğretir.',
          'Sınırda kalan vakalar sete girmeli; yalnızca kolay örnekler kolay davranış öğretir.',
          'Değerlendirme kümesi eğitimden ayrı tutulmalı; aksi hâlde kazanç ölçülemez.',
        ],
      },
      {
        tip: 'uyari',
        ton: 'dikkat',
        metin:
          'İnce ayar, modelin genel yeteneklerinde gerilemeye yol açabilir (katastrofik unutma). Hedef görevdeki kazancın yanında genel yetenek setini de ölçmek gerekir.',
      },
      { tip: 'altbaslik', metin: 'Operasyonel yük', kimlik: 'operasyon' },
      {
        tip: 'paragraf',
        metin:
          'İnce ayarlı bir model, sahiplenmeniz gereken bir artefakttır: sürümlenmeli, değerlendirilmeli ve temel model güncellendiğinde yeniden üretilmelidir. Bu yük, kazancın karşılığını verip vermediğini kararlaştırmadan üstlenilmemeli.',
      },
    ],
    sss: [
      {
        soru: 'Kaç örnek gerekir?',
        cevap:
          'Göreve bağlı; biçim ve üslup uyarlaması için yüzler mertebesinde tutarlı örnek sıkça yeterli olabilir. Belirleyici olan sayı değil, örneklerin tutarlılığı ve kapsamı.',
      },
      {
        soru: 'İnce ayar halüsinasyonu azaltır mı?',
        cevap:
          'Doğrudan azaltmaz. Modelin bilmediği bir konuda ince ayar, yanlış cevabı daha tutarlı bir biçimde üretmesine yol açabilir. Olgusal doğruluk için geri getirme ve doğrulama gerekir.',
      },
      {
        soru: 'RAG ile birlikte kullanılabilir mi?',
        cevap:
          'Evet ve sıkça birlikte kullanılır: bilgi geri getirmeyle gelir, biçim ve üslup ince ayarla sağlanır.',
      },
    ],
    kaynaklar: [SAGLAYICI, SINAPTIK],
    surumler: [
      {
        surum: 'v1.1',
        tarih: '2026-09-01',
        degisiklik: 'Uygunluk tablosu ve operasyonel yük bölümü eklendi.',
      },
      { surum: 'v1.0', tarih: '2026-05-20', degisiklik: 'İlk yayın.' },
    ],
  },

  /* ---------------------------------------------------------------------- */
  hallucination: {
    onGovde: [
      {
        tip: 'kisa-cevap',
        metin:
          'Halüsinasyon, modelin akıcı ve kendinden emin biçimde gerçek dışı içerik üretmesidir. Bir hata değil, yöntemin doğal sonucudur: model doğruluğu değil olası devamı optimize eder.',
      },
    ],
    ekGovde: [
      { tip: 'altbaslik', metin: 'Neden oluyor?', kimlik: 'neden' },
      {
        tip: 'liste',
        ogeler: [
          'Hedef uyumsuzluğu: eğitim hedefi "olası devam", "doğru cevap" değil.',
          'Bilgi boşluğu: model bilmediği konuda da bir cevap üretmeye eğilimlidir.',
          'Bağlam eksikliği: geri getirme boş döndüğünde model boşluğu doldurur.',
          'Talimat baskısı: "mutlaka cevap ver" yönündeki istemler uydurmayı teşvik eder.',
          'Kalibrasyon zayıflığı: modelin güven ifadeleri doğrulukla uyumlu olmak zorunda değil.',
        ],
      },
      { tip: 'altbaslik', metin: 'Türleri', kimlik: 'turler' },
      {
        tip: 'tablo',
        basliklar: ['Tür', 'Ne olur', 'Tespit'],
        satirlar: [
          ['Olgusal uydurma', 'Var olmayan bir olgu üretilir', 'Dış kaynakla doğrulama'],
          ['Kaynak uydurma', 'Gerçek olmayan atıf verilir', 'Atıfların otomatik doğrulanması'],
          [
            'Bağlam dışı çıkarım',
            'Verilen belgede olmayan sonuç üretilir',
            'Kaynaklı cevap zorunluluğu',
          ],
          ['Biçim uydurma', 'Şemada olmayan alan eklenir', 'Şema doğrulama'],
          [
            'Sessiz atlama',
            'İstenen bilgi görmezden gelinir',
            'Beklenen alanların zorunlu kılınması',
          ],
        ],
        aciklama: 'Her türün ayrı bir tespit yöntemi var; tek bir kontrol hepsini yakalamaz.',
      },
      { tip: 'altbaslik', metin: 'Azaltma yöntemleri', kimlik: 'azaltma' },
      {
        tip: 'liste',
        sirali: true,
        ogeler: [
          'Kaynaklı cevap zorunluluğu: her iddia bağlamdaki bir parçaya bağlanmalı.',
          'Kaçış yolu: "bilgi yetersizse bilmiyorum de" talimatı ve bunun ölçülmesi.',
          'Geri getirme kalitesini ayrı ölçmek: boş dönüş, halüsinasyonun en güçlü habercisi.',
          'Şema zorlama: yapılandırılmış çıktı, biçim uydurmayı büyük ölçüde eler.',
          'İkinci geçiş doğrulama: çıktının bağlama dayandığını ayrı bir çağrıyla denetlemek.',
          'Deterministik kontroller: sayısal tutarlılık, tarih mantığı, toplam denetimi.',
        ],
      },
      {
        tip: 'uyari',
        ton: 'dikkat',
        metin:
          'RAG halüsinasyonu ortadan kaldırmaz. Geri getirme yanlış parçayı bulursa model kendinden emin biçimde yanlış cevap üretir; geri getirme kalitesi ayrı ölçülmelidir.',
      },
      { tip: 'altbaslik', metin: 'Ürün tarafı', kimlik: 'urun' },
      {
        tip: 'paragraf',
        metin:
          'Halüsinasyon tamamen ortadan kalkmadığı için arayüz tasarımı bir güvenlik katmanıdır: kaynağı göstermek, belirsizliği görünür kılmak ve kullanıcının doğrulamasını kolaylaştırmak. Cevabı tek ve kesin bir metin olarak sunan bir arayüz, riski kullanıcıya devreder.',
      },
    ],
    sss: [
      {
        soru: 'Sıcaklığı sıfıra çekmek halüsinasyonu bitirir mi?',
        cevap:
          'Bitirmez. Çıktıyı daha kararlı hale getirir ama modelin bilmediği bir konuda ürettiği yanlış cevabı da kararlı biçimde tekrarlamasına yol açabilir.',
      },
      {
        soru: 'Halüsinasyon oranı nasıl ölçülür?',
        cevap:
          'Kendi görev setinizde, çıktıdaki her iddianın bağlamda bir dayanağı olup olmadığını işaretleyerek. Tek bir genel oran yerine görev tipine göre kırılımlı raporlamak daha bilgilendirici.',
      },
    ],
    kaynaklar: [SINAPTIK, SAGLAYICI],
    surumler: [
      { surum: 'v1.1', tarih: '2026-09-06', degisiklik: 'Tür tablosu ve azaltma listesi eklendi.' },
      { surum: 'v1.0', tarih: '2026-05-25', degisiklik: 'İlk yayın.' },
    ],
  },

  /* ---------------------------------------------------------------------- */
  'multimodal-ai': {
    onGovde: [
      {
        tip: 'kisa-cevap',
        metin:
          'Çok modlu yapay zekâ, metin, görsel, ses ve video gibi farklı veri türlerini ortak bir temsil uzayında işleyen modelleri tanımlar. Böylece bir modaliteden diğerine geçiş mümkün olur.',
      },
    ],
    ekGovde: [
      { tip: 'altbaslik', metin: 'Nasıl birleştiriliyor?', kimlik: 'birlestirme' },
      {
        tip: 'paragraf',
        metin:
          'Her modalite kendi kodlayıcısıyla bir temsile çevrilir; sonra bu temsiller ortak bir uzaya izdüşürülür. Metin tarafındaki tokenlar ile görsel tarafındaki yamalar aynı dizide yer alabilir; model ikisi arasındaki ilişkiyi dikkat mekanizmasıyla kurar.',
      },
      {
        tip: 'tablo',
        basliklar: ['Yön', 'Görev', 'Tipik kullanım'],
        satirlar: [
          [
            'Görselden metne',
            'Açıklama, soru cevaplama, belge okuma',
            'Fatura çıkarma, erişilebilirlik',
          ],
          ['Metinden görsele', 'Görsel üretimi ve düzenleme', 'Tasarım taslağı, varlık üretimi'],
          ['Sesten metne', 'Konuşma tanıma, diyarizasyon', 'Toplantı notu, çağrı analizi'],
          ['Metinden sese', 'Seslendirme', 'Sesli asistan, erişilebilirlik'],
          ['Videodan metne', 'Olay tanıma, özetleme', 'Güvenlik analizi, içerik etiketleme'],
        ],
        aciklama:
          'Aynı model birden çok yönü destekleyebilir; kalite yönler arasında eşit değildir.',
      },
      { tip: 'altbaslik', metin: 'Kurumsal dikkat noktaları', kimlik: 'dikkat' },
      {
        tip: 'liste',
        ogeler: [
          'Sessiz hata: görsel-dil modelleri yanlış değeri doğru biçimde üretebilir; doğrulama katmanı zorunlu.',
          'Maliyet: görüntü ve video girdileri token cinsinden pahalıdır; çözünürlük bir maliyet ayarıdır.',
          'Gizlilik: görüntü ve ses, metinden daha fazla kişisel veri taşır; maskeleme ve saklama politikası gerekir.',
          'Kalibrasyon: modelin görselde okuduğu değere ne kadar güvendiğini beyan etmesi güvenilir değildir.',
        ],
      },
      {
        tip: 'uyari',
        ton: 'dikkat',
        metin:
          'Belge işleme akışlarında model çıktısını şemaya bağlamak ve sayısal alanlarda çapraz kontrol uygulamak, hataların büyük kısmını yakalar. Şemasız serbest metin çıktısı denetlenemez.',
      },
    ],
    sss: [
      {
        soru: 'Çok modlu model, ayrı ayrı modellerin yerine mi geçer?',
        cevap:
          'Her zaman değil. Tek bir görevde özelleşmiş bir model (örneğin konuşma tanıma) sıkça daha isabetli ve ucuz olabilir. Çok modlu modeller, modaliteler arası ilişki gerektiren görevlerde öne çıkar.',
      },
      {
        soru: 'Görüntü çözünürlüğü sonucu etkiler mi?',
        cevap:
          'Etkiler. Düşük çözünürlük küçük yazıları ve ince detayları kaybettirir; yüksek çözünürlük maliyeti artırır. Belge işlemede çözünürlük, ölçülerek ayarlanması gereken bir parametredir.',
      },
    ],
    kaynaklar: [SAGLAYICI],
    surumler: [
      {
        surum: 'v1.1',
        tarih: '2026-08-31',
        degisiklik: 'Yön tablosu ve kurumsal dikkat noktaları eklendi.',
      },
      { surum: 'v1.0', tarih: '2026-06-13', degisiklik: 'İlk yayın.' },
    ],
  },

  /* ---------------------------------------------------------------------- */
  evaluation: {
    onGovde: [
      {
        tip: 'kisa-cevap',
        metin:
          'Değerlendirme, bir yapay zekâ sisteminin işe yarayıp yaramadığını ölçülebilir hâle getirme pratiğidir. Kamuya açık skorlar kaba bir sıralama verir; üretim kararı kurumun kendi görev setiyle verilir.',
      },
    ],
    ekGovde: [
      { tip: 'altbaslik', metin: 'Üç katman', kimlik: 'katmanlar' },
      {
        tip: 'tablo',
        basliklar: ['Katman', 'Ne ölçer', 'Karar ağırlığı', 'Sınırı'],
        satirlar: [
          [
            'Kamuya açık benchmark',
            'Genel yetenek',
            'Düşük',
            'Sızıntı riski; iş yükünü temsil etmez',
          ],
          ['Alan değerlendirmesi', 'Sektör diline uyum', 'Orta', 'Kurulum maliyeti yüksek'],
          ['Görev seti (kurum içi)', 'Gerçek işin tamamlanması', 'Yüksek', 'Bakım gerektirir'],
        ],
        aciklama: 'Karar ağırlığı aşağıya doğru artar; üçü birbirini tamamlar.',
      },
      { tip: 'altbaslik', metin: 'Yedi metrik', kimlik: 'metrikler' },
      {
        tip: 'liste',
        ogeler: [
          'Tamamlama oranı: görev insan müdahalesi olmadan bitti mi.',
          'Adım verimliliği: hedefe kaç araç çağrısında ulaşıldı.',
          'Kurtarma oranı: başarısız adımdan sonra göreve dönüş sağlandı mı.',
          'Yan etki sayısı: hedef dışında kaç değişiklik oluştu.',
          'Kalibrasyon: model bilmediğinde bilmediğini söylüyor mu.',
          'Kararlılık: aynı görev tekrarlandığında sonuç ne kadar değişiyor.',
          'Birim maliyet: tamamlanmış görev başına token, süre ve para.',
        ],
      },
      {
        tip: 'uyari',
        ton: 'dikkat',
        metin:
          'Bu yedi metriği tek bir skora indirmeyin. Ağırlıklandırma iş bağlamına aittir ve tek sayı, hangi eksende bozulduğunuzu gizler.',
      },
      { tip: 'altbaslik', metin: 'Veri sızıntısı', kimlik: 'sizinti' },
      {
        tip: 'paragraf',
        metin:
          'Bir test seti yayımlandığı andan itibaren gelecekteki eğitim verisinin parçası olabilir. Bu, skorların zamanla yükselmesini gerçek yetenek artışından bağımsız hale getirir. Kurum içi ve kapalı görev setleri bu sorundan yapısal olarak muaftır — kapalı tutuldukları sürece.',
      },
      { tip: 'altbaslik', metin: 'Model yargıç kullanımı', kimlik: 'yargic' },
      {
        tip: 'paragraf',
        metin:
          'Makine tarafından doğrulanamayan öznel çıktılarda bir dil modelini yargıç olarak kullanmak pratik bir çözüm; ancak tek başına yeterli değil. Yargıç modelin kendi eğilimleri sonuca karışır: uzun cevapları veya kendi üslubuna benzeyen çıktıları tercih edebilir. En az bir insan kalibrasyon turu ve raporda yöntem beyanı gerekir.',
      },
    ],
    sss: [
      {
        soru: 'Kaç görevlik bir set yeterli?',
        cevap:
          'Karar vermeye başlamak için 20-30 görev çoğu ekipte yeterli. Önemli olan sayı değil, görevlerin gerçek işten alınmış ve son durumunun doğrulanabilir olması.',
      },
      {
        soru: 'Değerlendirme ne zaman yenilenir?',
        cevap:
          'Takvimle değil olayla: her üretim arızası, her yeni kullanım senaryosu ve her sağlayıcı sürüm değişikliği sete vaka ekleme fırsatı.',
      },
      {
        soru: 'Çevrimiçi değerlendirme nasıl yapılır?',
        cevap:
          'Üretim izleri üzerinde dolaylı sinyallerle: kaynaklı cevap oranı, boş geri getirme oranı, kullanıcı düzeltme davranışı ve örneklemeli insan denetimi.',
      },
    ],
    kaynaklar: [
      SINAPTIK,
      { ad: 'Değerlendirme metodolojisi yayınları', yayinci: 'Akademik arşivler', tur: 'Makale' },
    ],
    surumler: [
      {
        surum: 'v1.2',
        tarih: '2026-09-08',
        degisiklik: 'Yedi metrik, sızıntı ve model yargıç bölümleri eklendi.',
      },
      { surum: 'v1.0', tarih: '2026-05-04', degisiklik: 'İlk yayın.' },
    ],
  },
};
