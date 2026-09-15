import type { Blok, SSS } from '@/lib/tipler';

/**
 * ÖRNEK VERİ — araştırma yayınlarının tam metni.
 *
 * Yayın kalıbı (MASTER-PLAN §61): yönetici özeti → neden bu çalışma → yöntem →
 * bulgular → yorum → sınırlılıklar → tekrarlanabilirlik → atıf.
 *
 * ÖNEMLİ: Bu metinlerde geçen sayısal örnekler TEMSİLÎ'dir; gerçek bir saha
 * çalışmasının sonucu DEĞİLDİR ve ölçüm olarak alıntılanamaz. Yayın canlıya
 * alındığında bu gövdeler gerçek ölçüm sonuçlarıyla değiştirilecektir.
 */

export type ArastirmaGovdesi = {
  govde: Blok[];
  sss?: SSS[];
  ilgiliSluglar?: string[];
};

const ORNEK_VERI_UYARISI: Blok = {
  tip: 'uyari',
  ton: 'dikkat',
  metin:
    'Bu sayfadaki sayısal ifadeler platformun içerik modelini göstermek üzere hazırlanmış TEMSİLÎ değerlerdir; yürütülmüş bir saha çalışmasının sonucu değildir ve kaynak olarak gösterilemez.',
};

export const ARASTIRMA_GOVDELERI: Record<string, ArastirmaGovdesi> = {
  /* ---------------------------------------------------------------------- */
  'state-of-ai-turkiye': {
    govde: [
      ORNEK_VERI_UYARISI,
      { tip: 'altbaslik', metin: 'Yönetici özeti', kimlik: 'yonetici-ozeti' },
      {
        tip: 'kisa-cevap',
        metin:
          'Türkiye ekosisteminde yapay zekâ denemesi yaygın, üretime geçiş seyrek. Olgunluğun asıl göstergesi benimseme oranı değil, denemeden üretime geçiş oranı; ve bu oranı en çok sınırlayan şey model erişimi değil yönetişim ve yetenek.',
      },
      {
        tip: 'paragraf',
        metin:
          'Çalışma, üç soruya cevap aramak üzere tasarlandı: kurumlar yapay zekâyı nerede kullanıyor, denemelerin ne kadarı üretime geçiyor, geçmeyenleri ne engelliyor? Bulgular, engelin büyük ölçüde örgütsel olduğunu gösteriyor — teknik değil.',
      },
      { tip: 'altbaslik', metin: 'Neden bu çalışma?', kimlik: 'neden' },
      {
        tip: 'paragraf',
        metin:
          'Türkiye ekosistemine dair mevcut veri iki kaynaktan geliyor: küresel raporların ülke kesitleri ve tedarikçi anketleri. İlki örneklem büyüklüğü nedeniyle zayıf, ikincisi yapısal olarak taraflı. Açık metodolojiyle yürütülen, sınırlılıkları yazılı ve tekrarlanabilir bir çalışma boşluğu var. Bu rapor o boşluğu doldurmayı amaçlıyor.',
      },
      { tip: 'altbaslik', metin: 'Bulgular', kimlik: 'bulgular' },
      {
        tip: 'paragraf',
        metin:
          'Bulgular dört başlıkta toplanıyor. Birincisi benimseme-üretim makası: kurumların büyük kısmı en az bir yapay zekâ denemesi başlatmış, ancak üretimde çalışan akış sayısı belirgin biçimde düşük. İkincisi engel dağılımı: en sık dile getirilen engeller veri erişimi, başarı tanımının yazılmamış olması ve operasyon sorumluluğunun tanımsızlığı. Üçüncüsü yetenek: talep edilen profil istem yazarlığından değerlendirme ve veri mühendisliğine kaymış. Dördüncüsü yönetişim: yedi olgunluk boyutu içinde en düşük skorlanan boyut.',
      },
      {
        tip: 'tablo',
        basliklar: ['Olgunluk boyutu', 'Gözlenen eğilim', 'Yorum'],
        satirlar: [
          ['Strateji', 'Orta', 'Üst yönetim ilgisi yüksek, önceliklendirme zayıf'],
          ['Veri', 'Orta-düşük', 'Erişim izni süreçleri en sık dile getirilen darboğaz'],
          ['Altyapı', 'Orta', 'Bulut kullanımı yaygın, izleme katmanı eksik'],
          ['Yetenek', 'Düşük', 'Değerlendirme ve veri mühendisliği profili kıt'],
          ['Yönetişim', 'En düşük', 'Envanter, risk sınıflandırması ve sahiplik eksik'],
          ['Kullanım senaryosu', 'Orta', 'Seçim çoğunlukla görünürlüğe göre yapılıyor'],
          ['Güvenlik', 'Orta-düşük', 'Ajan yetkileri ve kayıt altyapısı yeni gündemde'],
        ],
        aciklama:
          'Eğilimler temsilî niteliktedir; kesin skorlar yayının veri ekinde raporlanacaktır.',
      },
      { tip: 'altbaslik', metin: 'Yorum', kimlik: 'yorum' },
      {
        tip: 'paragraf',
        metin:
          'Benimseme-üretim makasını kapatmak için gereken müdahaleler teknoloji satın almakla ilgili değil. Üç madde tekrar ediyor: başarı tanımının pilot öncesinde yazılması, süreç sahibi iş biriminin projeyi sahiplenmesi ve hata durumunda izlenecek akışın doğru çalışan akış kadar ayrıntılı tasarlanması. Bu üçü yazılmadan başlayan projeler, hangi modelle kurulursa kurulsun pilot aşamasını geçmekte zorlanıyor.',
      },
      { tip: 'altbaslik', metin: 'Tekrarlanabilirlik', kimlik: 'tekrarlanabilirlik' },
      {
        tip: 'liste',
        ogeler: [
          'Anket soru seti, yayının veri ekinde değişmeden paylaşılır.',
          'Görüşme rehberi ve kodlama şeması yayımlanır.',
          'Ham veri anonimleştirilmiş biçimde, kurum adı olmadan paylaşılır.',
          'Sonraki yıl aynı soru seti kullanılır; değişen sorular ayrıca işaretlenir.',
        ],
      },
      {
        tip: 'uyari',
        ton: 'bilgi',
        metin:
          'Yıllar arası karşılaştırma yapılabilmesi için soru setinin sabit tutulması gerekiyor. Soru değiştiğinde o göstergenin serisi kesilir ve raporda açıkça belirtilir.',
      },
    ],
    sss: [
      {
        soru: 'Rapor ücretli mi?',
        cevap:
          'Ana bulgular açık erişimdir. Sektör kırılımlı ek analizler ve ham veri eki, kurumsal abonelik kapsamında sunulur.',
      },
      {
        soru: 'Kendi kurumumu bu çerçevede ölçebilir miyim?',
        cevap:
          'Evet. Aynı yedi boyut, AI Readiness değerlendirmesinde öz değerlendirme olarak uygulanabilir; sonuç raporun genel eğilimiyle karşılaştırılabilir.',
      },
    ],
    ilgiliSluglar: ['responsible-ai', 'evaluation'],
  },

  /* ---------------------------------------------------------------------- */
  'turkce-llm-benchmark': {
    govde: [
      ORNEK_VERI_UYARISI,
      { tip: 'altbaslik', metin: 'Yönetici özeti', kimlik: 'yonetici-ozeti' },
      {
        tip: 'kisa-cevap',
        metin:
          'Genel benchmark sıralaması ile Türkçe sıralama her zaman örtüşmüyor. Bir modelin İngilizce muhakemede önde olması, Türkçe talimat takibinde ve biçim uyumunda da önde olacağını garanti etmiyor; bu yüzden model seçimi dil özelinde ölçülmelidir.',
      },
      { tip: 'altbaslik', metin: 'Neden bu çalışma?', kimlik: 'neden' },
      {
        tip: 'paragraf',
        metin:
          'Türkçe performansı ölçmek isteyen bir kurumun önünde üç seçenek var: çok dilli benchmarkların Türkçe kesitine bakmak, İngilizce setlerin çevirisini kullanmak veya kendi setini kurmak. İlk ikisi ucuz ama ölçtüğü şey büyük ölçüde dilden bağımsız muhakeme; üçüncüsü doğru ama pahalı. Bu benchmark, açık metodolojiyle bir ortak zemin kurmayı amaçlıyor.',
      },
      { tip: 'altbaslik', metin: 'Dört alt küme', kimlik: 'alt-kumeler' },
      {
        tip: 'tablo',
        basliklar: ['Alt küme', 'Ne ölçer', 'Puanlama'],
        satirlar: [
          ['Anlama', 'Ek yapısından doğan belirsizliği çözme, gönderim takibi', 'Kural tabanlı'],
          ['Üretim', 'Akıcılık, üslup uyumu, resmî yazı kalıpları', 'İki insan değerlendirici'],
          ['Talimat takibi', 'Çok kısıtlı talimatlara uyum, kaçış yolu kullanımı', 'Kural tabanlı'],
          ['Biçim uyumu', 'Verilen JSON şemasına birebir uyum', 'Şema doğrulama'],
        ],
        aciklama:
          'Biçim uyumu alt kümesi tamamen deterministik puanlanır; bu yüzden en tekrarlanabilir göstergedir.',
      },
      { tip: 'altbaslik', metin: 'Bulgular', kimlik: 'bulgular' },
      {
        tip: 'liste',
        ogeler: [
          'Anlama ve üretim alt kümelerinde sıralama, genel benchmarklarla büyük ölçüde uyumlu.',
          'Talimat takibi ve biçim uyumunda sıralama değişebiliyor; aynı ailenin sürümleri arasında bile fark görülüyor.',
          'Token verimliliği modeller arasında anlamlı biçimde farklılaşıyor; kalite eşit olsa bile maliyet eşit olmuyor.',
          'Kod anahtarlamalı (Türkçe-İngilizce karışık) girdilerde tüm modellerde performans düşüşü gözleniyor.',
        ],
      },
      {
        tip: 'paragraf',
        metin:
          'Son madde pratik açıdan en önemlisi: gerçek kullanımda kullanıcılar sıkça karışık dil kullanıyor ("bu invoice u özetle"). Yalnızca temiz Türkçe ile ölçüm yapan bir değerlendirme, üretimdeki davranışı temsil etmiyor.',
      },
      { tip: 'altbaslik', metin: 'Token verimliliği', kimlik: 'token' },
      {
        tip: 'paragraf',
        metin:
          'Benchmark, doğruluğun yanında görev başına token tüketimini de raporluyor. Sebep şu: iki model aynı kalite eşiğini geçiyorsa, karar birim maliyete kalıyor. Türkçe metinlerin tokenizasyonu modeller arasında farklılaştığı için bu fark küçük değil. Raporda her model için görev başına ortalama girdi ve çıktı tokeni birlikte verilir.',
      },
      { tip: 'altbaslik', metin: 'Sınırlılıklar ve tekrarlanabilirlik', kimlik: 'sinirliliklar' },
      {
        tip: 'liste',
        ogeler: [
          'Sonuçlar ölçüm tarihindeki model sürümüne aittir; sürüm değiştiğinde geçersizleşir.',
          'Görev seti tüm alan dillerini (hukuk, tıp, mühendislik) kapsamaz.',
          'İnsan değerlendirmesi içeren alt kümelerde değerlendiriciler arası anlaşma oranı raporlanır.',
          'Örnekleme ayarları (sıcaklık, top-p) sabit tutulur ve yayında belirtilir.',
          'Görev setinin bir bölümü, sızıntıyı önlemek için kapalı tutulur.',
        ],
      },
      {
        tip: 'uyari',
        ton: 'dikkat',
        metin:
          'Kapalı tutulan bölümün varlığı metodolojinin parçasıdır: yayımlanan bir test seti, gelecekteki eğitim verisinin parçası olabilir ve skorların yükselmesi gerçek yetenek artışından bağımsız hale gelir.',
      },
    ],
    sss: [
      {
        soru: 'Hangi modeller değerlendiriliyor?',
        cevap:
          'Değerlendirilen model listesi her sürümde yayının künyesinde, sürüm etiketleriyle birlikte verilir. Sürüm belirtilmeyen bir skor, karşılaştırma için kullanılamaz.',
      },
      {
        soru: 'Kendi modelimi bu sette değerlendirebilir miyim?',
        cevap:
          'Açık alt kümeler ve puanlama kodu yayımlanır; aynı yöntemle kendi modelinizi koşturabilirsiniz. Kapalı alt küme paylaşılmaz.',
      },
      {
        soru: 'Sonuçlar neden sıralama olarak değil eşik olarak sunuluyor?',
        cevap:
          'Çünkü kurumsal karar bir sıralama kararı değil eşik kararıdır: "bizim görevimizde kabul sınırını geçiyor mu?" Sıralama, bu soruya cevap vermez.',
      },
    ],
    ilgiliSluglar: ['tokenization', 'evaluation', 'llm'],
  },

  /* ---------------------------------------------------------------------- */
  'turkish-prompt-injection-dataset': {
    govde: [
      ORNEK_VERI_UYARISI,
      { tip: 'altbaslik', metin: 'Yönetici özeti', kimlik: 'yonetici-ozeti' },
      {
        tip: 'kisa-cevap',
        metin:
          'Bu veri seti, Türkçe dolaylı istem enjeksiyonu örneklerini savunma değerlendirmesi için bir araya getirir. Amaç saldırı üretmek değil, kurumların kendi koruma katmanlarını ölçülebilir biçimde test edebilmesi.',
      },
      {
        tip: 'uyari',
        ton: 'dikkat',
        metin:
          'Veri seti yalnızca savunma testi için sunulur. Yetkisi olmayan sistemlere karşı kullanılması hukuka aykırıdır. Erişim, kullanım amacı beyanı ve lisans kabulüyle verilir.',
      },
      { tip: 'altbaslik', metin: 'Neden Türkçe özelinde?', kimlik: 'neden' },
      {
        tip: 'paragraf',
        metin:
          'Enjeksiyon tespiti yapan sınıflandırıcıların çoğu ağırlıklı olarak İngilizce örneklerle eğitiliyor. Bunun pratik sonucu şu: aynı saldırı deseni Türkçe yazıldığında filtreyi geçebiliyor. Kurumların Türkçe içerik işleyen akışlarında bu açığı ölçebilmesi için dile özgü bir örnek kümesi gerekiyor.',
      },
      { tip: 'altbaslik', metin: 'Veri şeması', kimlik: 'sema' },
      {
        tip: 'kod',
        dil: 'json',
        metin: `{
  "kimlik": "tpi-0142",
  "tasiyici": "belge",
  "saldiri_turu": "veri-sizdirma",
  "hedef_yetki": "eposta_gonder",
  "gizleme": "yok",
  "metin": "... güvenilmeyen belge içeriği ...",
  "beklenen_savunma": ["cikis-kontrolu", "onay-kapisi"],
  "beklenen_davranis": "araç çağrısı yapılmaz, kullanıcıya bildirilir",
  "zorluk": "orta",
  "surum": "v1.2"
}`,
      },
      {
        tip: 'paragraf',
        metin:
          '`beklenen_savunma` alanı setin ayırt edici özelliği: her kayıt, hangi mimari katmanın o saldırıyı durdurması gerektiğini söylüyor. Böylece test sonucu yalnızca "geçti/geçmedi" değil, "hangi katman eksik" bilgisini de üretiyor.',
      },
      { tip: 'altbaslik', metin: 'Taşıyıcı ve saldırı türü dağılımı', kimlik: 'dagilim' },
      {
        tip: 'tablo',
        basliklar: ['Taşıyıcı', 'Örnek senaryo', 'Beklenen savunma katmanı'],
        satirlar: [
          [
            'Web sayfası',
            'Ajan bir sayfayı özetlerken gömülü talimat okur',
            'Kaynak etiketleme, çıkış kontrolü',
          ],
          ['E-posta', 'Gelen kutusunu tarayan ajan yönlendirilir', 'Onay kapısı, en az yetki'],
          ['Belge', 'Yüklenen PDF içine gizlenmiş talimat', 'Şema zorlama, çıkış kontrolü'],
          [
            'Araç çıktısı',
            'Üçüncü taraf API yanıtına gömülü talimat',
            'En az yetki, kayıt ve tespit',
          ],
          ['Kod deposu', 'README içine gömülmüş talimat', 'Kum havuzu, ağ kesme'],
        ],
        aciklama: 'Dağılım oranları sürüm notlarında verilir; her sürümde değişebilir.',
      },
      { tip: 'altbaslik', metin: 'Nasıl kullanılır?', kimlik: 'kullanim' },
      {
        tip: 'liste',
        sirali: true,
        ogeler: [
          'Test ortamınızı üretimden yalıtın; gerçek yetkilerle çalıştırmayın.',
          'Her kaydı ajan akışınıza güvenilmeyen içerik olarak besleyin.',
          'Sonucu üç kategoride işaretleyin: durduruldu, kısmen durduruldu, geçti.',
          'Geçen kayıtlarda `beklenen_savunma` alanına bakıp eksik katmanı belirleyin.',
          'Eksik katmanı kurun ve aynı testi tekrarlayın; önce/sonra oranını raporlayın.',
        ],
      },
      { tip: 'altbaslik', metin: 'Sınırlılıklar', kimlik: 'sinirliliklar' },
      {
        tip: 'paragraf',
        metin:
          'Bir enjeksiyon veri seti yaşlanır: modeller ve savunmalar geliştikçe örneklerin bir kısmı etkisini yitirir. Bu yüzden set sürümlenir ve eskiyen kayıtlar kaldırılmak yerine "etkisiz" olarak işaretlenir; tarihsel karşılaştırma için değeri sürer. Set ayrıca kapsamlı değildir: yeni saldırı desenleri sürekli ortaya çıkar ve testi geçmek güvenlik garantisi vermez.',
      },
    ],
    sss: [
      {
        soru: 'Bu veri setiyle testi geçmek güvenli olduğum anlamına gelir mi?',
        cevap:
          'Hayır. Set bilinen desenleri kapsar; bilinmeyen desenler için bir şey söylemez. Testi geçmek bir alt sınırdır, bir garanti değil.',
      },
      {
        soru: 'Set nasıl güncelleniyor?',
        cevap:
          'Sürümlü olarak. Yeni desenler eklenir, etkisini yitiren kayıtlar kaldırılmaz ama işaretlenir; böylece yıllar arası karşılaştırma mümkün kalır.',
      },
    ],
    ilgiliSluglar: ['prompt-injection', 'guardrails', 'ai-agent'],
  },

  /* ---------------------------------------------------------------------- */
  'enterprise-ai-readiness-index': {
    govde: [
      ORNEK_VERI_UYARISI,
      { tip: 'altbaslik', metin: 'Yönetici özeti', kimlik: 'yonetici-ozeti' },
      {
        tip: 'kisa-cevap',
        metin:
          'Endeks, bir kurumun yapay zekâ hazırlığını yedi boyutta ölçer. Amacı puan üretmek değil sıralama yapmak: hangi proje bugün yapılabilir, hangi boyut önce kapatılmalı?',
      },
      { tip: 'altbaslik', metin: 'Yedi boyut ve ağırlıkları', kimlik: 'boyutlar' },
      {
        tip: 'tablo',
        basliklar: ['Boyut', 'Ne ölçer', 'Zayıfsa ne olur'],
        satirlar: [
          [
            'Strateji ve sahiplik',
            'Önceliklendirme, bütçe, karar mercii',
            'Projeler dağılır, hiçbiri bitmez',
          ],
          ['Veri', 'Erişim, kalite, izin süreçleri', 'Pilot veri beklerken ölür'],
          [
            'Altyapı',
            'Bulut, kimlik, izleme, maliyet görünürlüğü',
            'Üretime geçiş teknik borç üretir',
          ],
          [
            'Yetenek',
            'Değerlendirme, veri ve platform mühendisliği',
            'Dış bağımlılık kalıcı hale gelir',
          ],
          [
            'Yönetişim',
            'Envanter, risk sınıflandırması, gözetim',
            'Uyum yükü sonradan ve pahalı gelir',
          ],
          [
            'Kullanım senaryosu',
            'Seçim disiplini, başarı tanımı',
            'Görünür ama değersiz projeler seçilir',
          ],
          ['Güvenlik', 'Yetki tasarımı, kayıt, kırmızı takım', 'İlk ciddi olay programı durdurur'],
        ],
        aciklama:
          'Ağırlıklar sektöre göre değişir; varsayılan ağırlıklar yayının metodoloji ekinde verilir.',
      },
      { tip: 'altbaslik', metin: 'Olgunluk seviyeleri', kimlik: 'seviyeler' },
      {
        tip: 'tablo',
        basliklar: ['Seviye', 'Aralık', 'Tipik görüntü', 'Sonraki adım'],
        satirlar: [
          [
            'Exploring',
            '0–39',
            'Dağınık denemeler, sahipsiz projeler',
            'Envanter ve tek bir pilot',
          ],
          ['Experimenting', '40–59', 'Pilotlar var, üretim yok', 'Başarı tanımı ve veri erişimi'],
          [
            'Operating',
            '60–79',
            'Üretimde akışlar var, izleme zayıf',
            'Gözlemlenebilirlik ve değerlendirme',
          ],
          [
            'Scaling',
            '80–100',
            'Çoklu akış, ölçüm kültürü kurulu',
            'Yönetişim ve portföy disiplini',
          ],
        ],
        aciklama: 'Seviye sınırları yönlendiricidir; kurumun kendi ağırlıklarıyla kayabilir.',
      },
      { tip: 'altbaslik', metin: 'Bulgular', kimlik: 'bulgular' },
      {
        tip: 'paragraf',
        metin:
          'Değerlendirmelerde tekrar eden örüntü şu: teknik boyutlar (altyapı, veri) beklenenden iyi, örgütsel boyutlar (yönetişim, sahiplik) beklenenden kötü. Bu, kurumsal yapay zekâ projelerinin neden teknik değil örgütsel nedenlerle durduğunu açıklıyor. Yönetişim ve yetenek, çoğu değerlendirmede en zayıf iki halka olarak çıkıyor.',
      },
      { tip: 'altbaslik', metin: 'Nasıl kullanılır?', kimlik: 'kullanim' },
      {
        tip: 'liste',
        sirali: true,
        ogeler: [
          'Öz değerlendirmeyi iki farklı ekip bağımsız doldurur (iş ve teknoloji).',
          'Farkların olduğu ifadeler tartışılır; fark, algı boşluğunun haritasıdır.',
          'En düşük iki boyut için üç aylık bir kapatma planı yazılır.',
          'Aynı değerlendirme altı ay sonra tekrarlanır; skor değil yön izlenir.',
        ],
      },
      {
        tip: 'uyari',
        ton: 'bilgi',
        metin:
          'Endeksin amacı bir kurumu başka kurumlarla kıyaslamak değil, kendi zaman serisini oluşturmak. Tek bir ölçüm bir fotoğraf; iki ölçüm bir yön gösterir.',
      },
    ],
    sss: [
      {
        soru: 'Skor düşükse yapay zekâ projesi başlatmamalı mıyız?',
        cevap:
          'Hayır. Düşük skor, kapsamın küçük tutulması gerektiğini gösterir. Dar kapsamlı, geri alınabilir ve doğrulanabilir bir pilot, düşük olgunlukta da öğrenme üretir.',
      },
      {
        soru: 'Öz değerlendirme güvenilir mi?',
        cevap:
          'Tek başına değil; kurum içi algıyı yansıtır. Bu yüzden iki ekibin bağımsız doldurması ve seçili ifadelerin kanıtla desteklenmesi isteniyor.',
      },
    ],
    ilgiliSluglar: ['responsible-ai', 'evaluation'],
  },

  /* ---------------------------------------------------------------------- */
  'ajan-degerlendirme-notlari': {
    govde: [
      ORNEK_VERI_UYARISI,
      { tip: 'altbaslik', metin: 'Yönetici özeti', kimlik: 'yonetici-ozeti' },
      {
        tip: 'kisa-cevap',
        metin:
          'Çok adımlı ajan akışlarında tek seferlik doğruluk yanıltıcıdır. Ölçülmesi gereken şey görevin son durumu: ajan hedefi tamamladı mı, kaç adımda, hangi yan etkilerle ve hatadan sonra toparlanabildi mi?',
      },
      { tip: 'altbaslik', metin: 'Ortam tabanlı değerlendirme', kimlik: 'ortam' },
      {
        tip: 'paragraf',
        metin:
          'Ajan değerlendirmesi bir metin karşılaştırması değil, bir ortam simülasyonudur. Ajana sahte bir dosya sistemi, sahte bir API ve doğrulanabilir bir hedef durum verilir; puanlama çıktı metnine değil ortamın son durumuna bakılarak yapılır. Bu, değerlendirme altyapısını bir mühendislik projesi haline getiriyor — ve bu yüzden çoğu ekipte ertelenen iş bu.',
      },
      {
        tip: 'kod',
        dil: 'yaml',
        metin: `kimlik: fatura-esleme-007
hedef: "Gelen faturayı doğru siparişle eşleştir ve onaya gönder."
ortam:
  siparisler: fixtures/siparisler.json
  faturalar: fixtures/faturalar.json
  araclar: [siparis_ara, fatura_oku, onaya_gonder]
beklenen_son_durum:
  eslesen_siparis: SIP-2026-0412
  onay_kuyrugu: true
  degistirilen_kayit_sayisi: 1
kabul:
  yan_etki_yok: true
  maksimum_arac_cagrisi: 6
zorluk: orta`,
      },
      { tip: 'altbaslik', metin: 'Adım doğruluğu yanılgısı', kimlik: 'adim-yanilgisi' },
      {
        tip: 'paragraf',
        metin:
          'Ekipler sıkça adım başına doğruluğa bakıp iyimser sonuca varıyor. Adımların bağımsız olduğu varsayımıyla bile, adım sayısı arttıkça tamamlama olasılığı hızla düşüyor. Aşağıdaki tablo bu aritmetiği gösteriyor — bir ölçüm değil, bir hatırlatma.',
      },
      {
        tip: 'tablo',
        basliklar: ['Adım başına doğruluk', '5 adım', '10 adım', '20 adım'],
        satirlar: [
          ['%95', '≈ %77', '≈ %60', '≈ %36'],
          ['%98', '≈ %90', '≈ %82', '≈ %67'],
          ['%99', '≈ %95', '≈ %90', '≈ %82'],
        ],
        aciklama:
          'Bağımsızlık varsayımıyla yapılmış aritmetik bir örnek; ölçüm değildir. Gerçek sistemlerde hatalar bağımsız değil birikimlidir.',
      },
      {
        tip: 'paragraf',
        metin:
          'Bu tablonun pratik sonucu şu: uzun ufuklu ajanlarda tek başına adım kalitesini artırmak yetmiyor; hata kurtarma mekanizması kurmak gerekiyor. Kurtarma oranı, tamamlama oranını adım doğruluğundan daha çok etkiliyor.',
      },
      { tip: 'altbaslik', metin: 'Karşılaşılan tuzaklar', kimlik: 'tuzaklar' },
      {
        tip: 'liste',
        ogeler: [
          'Yan etkiyi ölçmemek: görevi tamamlayan ama yolda üç gereksiz kayıt değiştiren ajan üretimde başarısızdır.',
          'Ortamı sıfırlamamak: önceki koşunun bıraktığı durum sonraki sonucu bozar.',
          'Tek koşuya bakmak: kararsız bir ajanda bir koşu bilgi vermez; en az beş tekrar gerekir.',
          'Araç çağrısı sayısını sınırsız bırakmak: ajan hedefe ulaşır ama maliyet öngörülemez olur.',
          'Model yargıcına tek başına güvenmek: insan kalibrasyonu olmadan ölçüm körleşir.',
        ],
      },
      { tip: 'altbaslik', metin: 'Raporlama', kimlik: 'raporlama' },
      {
        tip: 'paragraf',
        metin:
          'Notlar, yedi metriğin tek bir skora indirilmemesini öneriyor: tamamlama oranı, adım verimliliği, kurtarma oranı, yan etki sayısı, kalibrasyon, kararlılık ve tamamlanmış görev başına maliyet. Ağırlıklandırma iş bağlamına ait bir karardır ve tek sayı, hangi eksende bozulduğunuzu gizler.',
      },
    ],
    sss: [
      {
        soru: 'Kaç tekrar yeterli?',
        cevap:
          'Kararlılığı görmek için görev başına en az beş koşu öneriliyor. Kararsızlığı yüksek akışlarda bu sayının artırılması gerekir; raporda tekrar sayısı her zaman belirtilmeli.',
      },
      {
        soru: 'Gerçek sistemlere karşı test edilebilir mi?',
        cevap:
          'Yan etkileri geri alınabilir bir kopya ortamda evet. Üretim sistemlerinde değerlendirme koşusu yapmak, ölçümün kendisini bir risk kaynağına dönüştürür.',
      },
    ],
    ilgiliSluglar: ['ai-agent', 'evaluation', 'function-calling'],
  },

  /* ---------------------------------------------------------------------- */
  'kurumsal-rag-mimari-rehberi': {
    govde: [
      ORNEK_VERI_UYARISI,
      { tip: 'altbaslik', metin: 'Yönetici özeti', kimlik: 'yonetici-ozeti' },
      {
        tip: 'kisa-cevap',
        metin:
          'Kurumsal RAG kalitesinde en büyük kayıp modelde değil geri getirme adımında oluşur. İlgili parça bağlama girmediyse modelin kalitesi fark etmez; bu yüzden iyileştirme bütçesinin ağırlığı arama hattına ayrılmalıdır.',
      },
      { tip: 'altbaslik', metin: 'Referans mimari', kimlik: 'mimari' },
      {
        tip: 'akis',
        adimlar: [
          { ad: 'Kaynak envanteri', aciklama: 'Hangi sistemde hangi belge var, kim erişebiliyor.' },
          {
            ad: 'Ayrıştırma',
            aciklama: 'PDF, ofis dosyası ve HTML için ayrı ayrıştırıcı; tablo yapısı korunur.',
          },
          {
            ad: 'Parçalama',
            aciklama: 'Belge yapısına göre bölme; başlık yolu önek olarak eklenir.',
          },
          { ad: 'Üst veri', aciklama: 'Sürüm, yürürlük, erişim grubu ve dil parçayla saklanır.' },
          { ad: 'Gömme ve dizinleme', aciklama: 'Vektör ve lexical dizin birlikte kurulur.' },
          {
            ad: 'Hibrit arama',
            aciklama: 'İki liste sıra tabanlı birleştirmeyle tek listeye iner.',
          },
          { ad: 'Yeniden sıralama', aciklama: 'İlk adaylar cross-encoder ile puanlanır.' },
          {
            ad: 'Bağlam kurma',
            aciklama: 'Seçilen parçalar kaynak künyesiyle isteme yerleştirilir.',
          },
          {
            ad: 'Üretim ve doğrulama',
            aciklama: 'Cevap kaynaklı üretilir, iddialar bağlama karşı denetlenir.',
          },
          { ad: 'Ölçüm', aciklama: 'Geri getirme ve cevap kalitesi ayrı ayrı izlenir.' },
        ],
      },
      { tip: 'altbaslik', metin: 'Erişim denetimi mimarinin parçası', kimlik: 'erisim' },
      {
        tip: 'paragraf',
        metin:
          'En sık yapılan mimari hata, yetki filtresini arama sonrasına bırakmak. Bu iki sorun üretir: kullanıcının görmemesi gereken belge cevaba karışabilir ve filtre sonrası sonuç sayısı beklenmedik biçimde sıfıra düşebilir. Yetki grubu üst veride tutulmalı ve arama sorgusunun parçası olmalı.',
      },
      {
        tip: 'uyari',
        ton: 'dikkat',
        metin:
          'Bir RAG sistemi, bağlı olduğu belge deposunun erişim modelini miras almaz; onu yeniden uygulamak zorundadır. Bu, güvenlik incelemesinde en çok atlanan noktadır.',
      },
      { tip: 'altbaslik', metin: 'Ölçüm: iki ayrı hat', kimlik: 'olcum' },
      {
        tip: 'tablo',
        basliklar: ['Hat', 'Metrik', 'Ne söyler'],
        satirlar: [
          ['Geri getirme', 'Recall@k', 'Doğru parça ilk k sonuçta var mı'],
          ['Geri getirme', 'MRR', 'Doğru parça ne kadar üstte'],
          ['Geri getirme', 'Boş dönüş oranı', 'İçerik açığının göstergesi'],
          ['Cevap', 'Kaynaklı iddia oranı', 'Her iddia bağlamda dayanağı var mı'],
          ['Cevap', 'Kaçış kullanımı', 'Bilgi yetersizken bilmiyorum diyor mu'],
          ['Cevap', 'Biçim uyumu', 'Şemaya uyuyor mu'],
        ],
        aciklama:
          'İki hattı ayrı ölçmek zorunlu: cevap kalitesindeki düşüşün nedeni genellikle geri getirmedir.',
      },
      { tip: 'altbaslik', metin: 'Sık görülen dört arıza', kimlik: 'arizalar' },
      {
        tip: 'liste',
        ogeler: [
          'Doğru belge, yanlış bölüm → parça çok büyük; yapısal bölmeye geçin.',
          'Kesin terim bulunmuyor → lexical katman eksik; hibrit aramaya geçin.',
          'Eski sürüm cevaba karışıyor → üst veride yürürlük filtresi yok.',
          'Tablo cevapları tutarsız → başlık satırı parçalara kopyalanmamış.',
        ],
      },
      { tip: 'altbaslik', metin: 'Geçiş planı', kimlik: 'gecis' },
      {
        tip: 'paragraf',
        metin:
          'Gömme modeli veya parçalama stratejisi değiştiğinde tüm vektörlerin yeniden üretilmesi gerekir; eski ve yeni vektörler aynı uzayda değildir ve karıştırılması sessiz kalite kaybı üretir. Bu yüzden yeniden dizinleme maliyeti mimarinin ilk gününde hesaplanmalı ve bir bakım penceresi olarak planlanmalı.',
      },
    ],
    sss: [
      {
        soru: 'RAG mı fine-tuning mi?',
        cevap:
          'Farklı sorunları çözüyorlar. Değişen ve kaynak gösterilmesi gereken bilgi için RAG; üslup, biçim ve alan dili için ince ayar. Sıkça birlikte kullanılırlar.',
      },
      {
        soru: 'Geri getirme kalitesini ölçmeye nereden başlanır?',
        cevap:
          '20 gerçek sorgu seçip her biri için doğru kabul edilen parçaları elle işaretleyerek. Bu küçük set, Recall@5 ölçümü için yeterli bir başlangıçtır.',
      },
      {
        soru: 'Hibrit arama her zaman gerekli mi?',
        cevap:
          'Kurumsal belge setlerinde neredeyse her zaman: kod, madde numarası ve kısaltma sorguları kaçınılmaz. Yalnızca kavramsal sorgu gelen setlerde anlamsal arama tek başına yeterli olabilir.',
      },
    ],
    ilgiliSluglar: ['rag', 'chunking', 'reranking', 'semantic-search'],
  },
};
