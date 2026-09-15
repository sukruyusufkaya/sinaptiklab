import type { MetinBolumu } from '@/components/kurumsal/MetinSayfasi';

/**
 * Politika metinleri (MASTER-PLAN §64–§65).
 *
 * UYARI: Bu metinler editoryal taslaklardır, hukuki görüş değildir. KVKK,
 * gizlilik ve kullanım şartları metinleri yayına alınmadan önce hukuk
 * danışmanlığıyla gözden geçirilmelidir.
 */

export const POLITIKA_TASLAK_UYARISI =
  'Bu metin editoryal taslaktır ve hukuki görüş yerine geçmez. Yayına alınmadan önce hukuk danışmanlığıyla gözden geçirilecektir.';

export const EDITORYAL_ILKELER: MetinBolumu[] = [
  {
    kimlik: 'amac',
    baslik: 'Amaç',
    paragraflar: [
      'Sinaptik Lab, yapay zekâ alanında karar verecek kişilere güvenilir bilgi sunmayı amaçlar. Bu metin, yayımlanan her içeriğin uymak zorunda olduğu editoryal ilkeleri tanımlar.',
      'İlkeler bağlayıcıdır: bir içerik ne kadar ilgi çekici olursa olsun, bu ilkelerden birini karşılamıyorsa yayımlanmaz.',
    ],
  },
  {
    kimlik: 'kaynak',
    baslik: 'Kaynak politikası',
    paragraflar: [
      'Sayısal her iddia kaynaklandırılır. "Yüzde otuz daha iyi" gibi ifadeler yerine ölçümün hangi testte, hangi sürümle ve hangi tarihte yapıldığı yazılır.',
    ],
    liste: [
      'Birincil kaynak tercih edilir: araştırma yayını, resmî dokümantasyon, teknik rapor, mevzuat metni, birinci elden röportaj veya veri seti.',
      'İkincil kaynak kullanıldığında birincil kaynağa ulaşılamadığı belirtilir.',
      'Kaynağı doğrulanamayan iddia yayımlanmaz.',
    ],
  },
  {
    kimlik: 'yazarlik',
    baslik: 'Yazarlık ve inceleme',
    paragraflar: [
      'Her içeriğin yazarı görünürdür ve yazar profiline bağlanır. Yazar profili; uzmanlık alanı, deneyim ve varsa yayınları içerir.',
      'Teknik derinliği yüksek veya sonuçları riskli içeriklerde ayrı bir inceleyen görevlendirilir. İnceleme, biçimsel bir etiket değil gerçek bir editoryal adımdır.',
    ],
  },
  {
    kimlik: 'yapay-zeka',
    baslik: 'Yapay zekâ kullanımı',
    paragraflar: [
      'Yapay zekâ araçları araştırma, transkripsiyon, editoryal destek veya metin geliştirme amacıyla kullanılabilir. Yayımlanan içeriklerden editoryal ekip sorumludur ve tüm içerikler insan incelemesinden geçer.',
      'Yapay zekâ tarafından üretilmiş metin doğrudan yayımlanmaz. Araç önerir, editör karar verir.',
    ],
  },
  {
    kimlik: 'bagimsizlik',
    baslik: 'Editoryal bağımsızlık',
    paragraflar: [
      'Kurumsal danışmanlık hizmetleri ile editoryal içerik arasında ayrım vardır. Bir şirketin müşteri olması, değerlendirmelerde lehine sonuç üretmez.',
      'Benchmark ve araştırma çalışmaları ticari ilişkilerden bağımsız yürütülür; benchmark sayfalarında sponsorluk kabul edilmez.',
    ],
    liste: [
      'Sponsorlu içerikler açıkça "Sponsorlu" etiketiyle yayımlanır.',
      'Bağlı kuruluş bağlantısı kullanılırsa sayfada belirtilir.',
      'Editoryal kararlar reklam ilişkilerinden etkilenmez.',
    ],
  },
  {
    kimlik: 'tazelik',
    baslik: 'Güncelleme ve tazelik',
    paragraflar: [
      'İçerik değişmeden "son güncelleme" tarihi güncellenmez. Yalnızca doğrulama yapıldığında ayrı bir "son doğrulama" alanı güncellenir.',
      'Hızla eskiyen içeriklerde (model sürümleri, fiyatlar, mevzuat) güncelleme geçmişi tutulur ve neyin değiştiği yazılır.',
    ],
  },
  {
    kimlik: 'duzeltme',
    baslik: 'Düzeltme',
    paragraflar: [
      'Hata bulunduğunda sayfa sessizce düzeltilmez: güncelleme geçmişine kayıt eklenir ve neyin neden değiştiği belirtilir.',
    ],
  },
];

export const AI_POLITIKASI: MetinBolumu[] = [
  {
    kimlik: 'ilke',
    baslik: 'Temel ilke',
    paragraflar: [
      'Sinaptik Lab yapay zekâ hakkında yayın yapan bir platformdur; bu yüzden kendi araç kullanımında özellikle şeffaf olmak zorundadır.',
      'Yapay zekâ araçları araştırma, transkripsiyon, editoryal destek veya metin geliştirme amacıyla kullanılabilir. Yayımlanan içeriklerden editoryal ekip sorumludur ve içerikler insan incelemesinden geçer.',
    ],
  },
  {
    kimlik: 'nerede',
    baslik: 'Nerede kullanılır',
    liste: [
      'Araştırma: kaynak tarama, özet çıkarma ve ilk okuma.',
      'Transkripsiyon: röportaj ve podcast kayıtlarının metne dönüştürülmesi.',
      'Editoryal destek: başlık alternatifi, yapı önerisi, dil kontrolü.',
      'Kontrol: eksik iç link, entity tutarlılığı ve şema doğrulama.',
    ],
  },
  {
    kimlik: 'nerede-kullanilmaz',
    baslik: 'Nerede kullanılmaz',
    liste: [
      'Doğrudan yayın: yapay zekâ çıktısı insan incelemesinden geçmeden yayımlanmaz.',
      'Olgu üretimi: sayı, tarih, alıntı veya kaynak yapay zekâya sorularak üretilmez.',
      'Benchmark sonucu: ölçümler araçla değil tanımlı yöntemle üretilir.',
      'Yazar kimliği: hiçbir içerik yapay zekâ adına veya sahte bir yazar adına yayımlanmaz.',
    ],
  },
  {
    kimlik: 'gorsel',
    baslik: 'Görseller',
    paragraflar: [
      'Yapay zekâ ile üretilmiş görseller kullanıldığında bu durum görsel altında belirtilir. Haber görsellerinde üretken görsel kullanılmaz.',
      'Teknik diyagramlar platforma özgü olarak elle tasarlanır.',
    ],
  },
  {
    kimlik: 'veri',
    baslik: 'Veri ve gizlilik',
    paragraflar: [
      'Editoryal süreçte kullanılan üçüncü taraf yapay zekâ araçlarına, kaynak kimliği gizli tutulması gereken bilgi veya kişisel veri girilmez.',
    ],
  },
];

export const DUZELTME_POLITIKASI: MetinBolumu[] = [
  {
    kimlik: 'yaklasim',
    baslik: 'Yaklaşım',
    paragraflar: [
      'Hata yapmak kaçınılmazdır; hatayı gizlemek editoryal bir tercihtir. Sinaptik Lab hataları görünür biçimde düzeltir.',
    ],
  },
  {
    kimlik: 'siniflandirma',
    baslik: 'Düzeltme sınıflandırması',
    tablo: {
      basliklar: ['Tür', 'Ne yapılır', 'Görünürlük'],
      satirlar: [
        ['Yazım/biçim', 'Sessizce düzeltilir', 'Kayıt tutulmaz'],
        ['Olgusal hata', 'Düzeltilir ve not eklenir', 'Sayfada düzeltme notu'],
        ['Ölçüm hatası', 'Sonuç geri çekilir veya düzeltilir', 'Güncelleme geçmişi + not'],
        ['Temel yanlışlık', 'İçerik geri çekilir', 'Geri çekme açıklaması yayımlanır'],
      ],
    },
  },
  {
    kimlik: 'bildirim',
    baslik: 'Hata bildirimi',
    paragraflar: [
      'Okuyucular iletişim sayfası üzerinden hata bildirebilir. Bildirimler değerlendirilir ve doğrulanan hatalar düzeltilir.',
    ],
  },
];

export const KVKK_AYDINLATMA: MetinBolumu[] = [
  {
    kimlik: 'veri-sorumlusu',
    baslik: 'Veri sorumlusu',
    paragraflar: [
      'Sinaptik Lab, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında veri sorumlusudur. Bu metin, platformu kullanırken işlenen kişisel verilere ilişkin aydınlatma yükümlülüğünü yerine getirmek amacıyla hazırlanmıştır.',
    ],
  },
  {
    kimlik: 'islenen-veriler',
    baslik: 'İşlenen kişisel veriler',
    liste: [
      'Kimlik ve iletişim verisi: bülten aboneliği veya üyelik sırasında verilen ad ve e-posta adresi.',
      'İşlem güvenliği verisi: oturum kayıtları ve teknik günlükler.',
      'Kullanım verisi: sayfa görüntüleme ve etkileşim istatistikleri (toplu ve anonim).',
      'Talep verisi: kurumsal iletişim formu üzerinden iletilen bilgiler.',
    ],
  },
  {
    kimlik: 'amac',
    baslik: 'İşleme amaçları',
    liste: [
      'Bülten ve içerik gönderimi.',
      'Üyelik hizmetlerinin sunulması ve öğrenme ilerlemesinin kaydedilmesi.',
      'Kurumsal taleplerin değerlendirilmesi.',
      'Platform güvenliğinin sağlanması ve hizmet kalitesinin ölçülmesi.',
    ],
  },
  {
    kimlik: 'hukuki-sebep',
    baslik: 'Hukuki sebep',
    paragraflar: [
      'Kişisel veriler; açık rıza, sözleşmenin kurulması veya ifası, veri sorumlusunun meşru menfaati ve hukuki yükümlülüklerin yerine getirilmesi hukuki sebeplerine dayanılarak işlenir.',
    ],
  },
  {
    kimlik: 'aktarim',
    baslik: 'Aktarım',
    paragraflar: [
      'Veriler; barındırma, e-posta gönderimi ve analitik hizmetleri için kullanılan tedarikçilere, hizmetin gerektirdiği ölçüde aktarılabilir. Yurt dışına aktarım yapılması hâlinde mevzuatın öngördüğü koşullar sağlanır.',
    ],
  },
  {
    kimlik: 'haklar',
    baslik: 'İlgili kişinin hakları',
    liste: [
      'Kişisel verisinin işlenip işlenmediğini öğrenme.',
      'İşlenmişse buna ilişkin bilgi talep etme.',
      'Eksik veya yanlış işlenmiş verinin düzeltilmesini isteme.',
      'Silinmesini veya yok edilmesini isteme.',
      'İşlemeye itiraz etme ve zararın giderilmesini talep etme.',
    ],
  },
];

export const GIZLILIK: MetinBolumu[] = [
  {
    kimlik: 'kapsam',
    baslik: 'Kapsam',
    paragraflar: [
      'Bu gizlilik politikası, sinaptiklab.com üzerinde toplanan verilerin nasıl kullanıldığını açıklar.',
    ],
  },
  {
    kimlik: 'toplanan',
    baslik: 'Toplanan veriler',
    liste: [
      'Bülten aboneliği için e-posta adresi.',
      'Üyelik hesabı bilgileri ve öğrenme ilerlemesi.',
      'Toplu ve anonim kullanım istatistikleri.',
      'Teknik günlükler (güvenlik ve hata takibi).',
    ],
  },
  {
    kimlik: 'paylasim',
    baslik: 'Üçüncü taraflarla paylaşım',
    paragraflar: [
      'E-posta adresleri üçüncü taraflarla pazarlama amacıyla paylaşılmaz. Yalnızca hizmetin sunulması için gereken tedarikçiler (barındırma, e-posta, analitik) veri işleyen olarak devreye girer.',
    ],
  },
  {
    kimlik: 'saklama',
    baslik: 'Saklama süresi',
    paragraflar: [
      'Veriler, işleme amacının gerektirdiği süre boyunca ve mevzuatın öngördüğü saklama süreleri kadar tutulur. Bülten aboneliği tek tıkla iptal edilebilir; iptal sonrası adres listeden çıkarılır.',
    ],
  },
  {
    kimlik: 'lab-araclari',
    baslik: 'Lab araçları',
    paragraflar: [
      'Hesaplayıcılara girilen metin ve değerler sunucuya gönderilmez; hesaplama tarayıcıda yapılır.',
    ],
  },
];

export const CEREZ_POLITIKASI: MetinBolumu[] = [
  {
    kimlik: 'nedir',
    baslik: 'Çerez nedir?',
    paragraflar: [
      'Çerezler, bir web sitesini ziyaret ettiğinizde tarayıcınıza kaydedilen küçük metin dosyalarıdır. Bu sayfa, Sinaptik Lab üzerinde hangi çerezlerin kullanıldığını açıklar.',
    ],
  },
  {
    kimlik: 'turler',
    baslik: 'Kullanılan çerez türleri',
    tablo: {
      basliklar: ['Tür', 'Amaç', 'Zorunlu mu?'],
      satirlar: [
        ['Zorunlu', 'Oturum yönetimi ve güvenlik', 'Evet'],
        ['Tercih', 'Tema seçimi (açık/koyu) gibi ayarlar', 'Hayır'],
        ['Ölçüm', 'Toplu ve anonim kullanım istatistikleri', 'Hayır'],
      ],
    },
  },
  {
    kimlik: 'tema',
    baslik: 'Tema tercihi',
    paragraflar: [
      'Tema seçimi (sistem, açık, koyu) tarayıcınızın yerel deposunda tutulur ve sunucuya gönderilmez. Depolama kapalıysa tema yalnızca o oturum için uygulanır.',
    ],
  },
  {
    kimlik: 'yonetim',
    baslik: 'Çerez yönetimi',
    paragraflar: [
      'Tarayıcı ayarlarınızdan çerezleri silebilir veya engelleyebilirsiniz. Zorunlu çerezlerin engellenmesi bazı işlevlerin çalışmamasına yol açabilir.',
    ],
  },
];

export const KULLANIM_SARTLARI: MetinBolumu[] = [
  {
    kimlik: 'kabul',
    baslik: 'Şartların kabulü',
    paragraflar: [
      'Sinaptik Lab platformunu kullanarak bu kullanım şartlarını kabul etmiş olursunuz. Şartlar zaman zaman güncellenebilir; güncelleme tarihi sayfada belirtilir.',
    ],
  },
  {
    kimlik: 'icerik-kullanimi',
    baslik: 'İçerik kullanımı',
    liste: [
      'İçerikler kişisel ve kurumsal bilgilenme amacıyla okunabilir ve kaynak gösterilerek alıntılanabilir.',
      'Alıntı yapılırken içeriğin adı ve bağlantısı verilir.',
      'İçeriklerin tamamının izinsiz çoğaltılması veya yeniden yayımlanması yapılamaz.',
      'Araştırma ve veri setleri için ilgili sayfada belirtilen lisans ve atıf formatı geçerlidir.',
    ],
  },
  {
    kimlik: 'sorumluluk',
    baslik: 'Sorumluluğun sınırı',
    paragraflar: [
      'Platformdaki içerikler bilgilendirme amaçlıdır; hukuki, finansal veya teknik danışmanlık yerine geçmez. Kararlarınızı kendi değerlendirmenizle almalısınız.',
      'Benchmark ve ölçüm sonuçları, yayımlandıkları tarihteki model sürümlerine aittir ve zamanla geçerliliğini yitirebilir.',
    ],
  },
  {
    kimlik: 'uyelik',
    baslik: 'Üyelik',
    paragraflar: [
      'Üyelik hesabı kişisel kullanım içindir. Hesap bilgilerinin güvenliği kullanıcının sorumluluğundadır. Kötüye kullanım hâlinde hesap askıya alınabilir.',
    ],
  },
  {
    kimlik: 'degisiklik',
    baslik: 'Değişiklikler',
    paragraflar: [
      'Sinaptik Lab, hizmet kapsamını ve bu şartları değiştirme hakkını saklı tutar. Önemli değişiklikler platformda duyurulur.',
    ],
  },
];
