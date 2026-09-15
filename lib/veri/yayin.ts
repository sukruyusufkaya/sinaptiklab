import type { Blok, DergiSayisi, Etkinlik, Kaynak, PodcastBolumu, SSS, Uzman } from '@/lib/tipler';
import { DERGI_GOVDELERI } from './govde/dergi';
import { REHBER_EKLERI } from './govde/rehber';

/** ÖRNEK VERİ — yer tutucu. Bkz. `lib/veri/temel.ts` başlığı. */

/* --- REHBERLER ------------------------------------------------------------ */

/** Rehber adımı: özet zorunlu, ayrıntı blokları opsiyonel. */
export type RehberAdimi = {
  ad: string;
  ozet: string;
  ayrinti?: Blok[];
};

export type RehberKaydi = {
  slug: string;
  baslik: string;
  kisaCevap: string;
  konu: string;
  seviye: 'baslangic' | 'orta' | 'ileri';
  okumaDakika: number;
  yazarSlug: string;
  tarih: string;
  adimlar: number;
  adimListesi?: RehberAdimi[];
  /** Rehbere başlamadan önce gereken kavram ve yetkinlikler. */
  onKosullar?: string[];
  /** Uygulama sırasında gereken araç ve erişimler. */
  araclar?: string[];
  /** Sahada en sık düşülen hatalar. */
  tuzaklar?: { baslik: string; aciklama: string }[];
  /** Rehber tamamlandığında işaretlenecek maddeler. */
  kontrolListesi?: string[];
  kaynaklar?: Kaynak[];
  ilgiliSluglar?: string[];
  sss?: SSS[];
};

const HAM_REHBERLER: RehberKaydi[] = [
  {
    slug: 'rag-mimarisi',
    baslik: 'Kurumsal RAG mimarisi nasıl kurulur?',
    kisaCevap:
      'Kurumsal RAG mimarisi; belge ayrıştırma, parçalama, gömme, dizinleme, yeniden sıralama ve değerlendirme katmanlarının erişim denetimi korunarak birleştirilmesiyle kurulur.',
    konu: 'RAG',
    seviye: 'orta' as const,
    okumaDakika: 22,
    yazarSlug: 'sukru-yusuf-kaya',
    tarih: '2026-08-11',
    adimlar: 7,
    adimListesi: [
      {
        ad: 'Kaynakları envanterle',
        ozet: 'Hangi sistemde hangi belge var, kim erişebiliyor — erişim matrisi olmadan mimari kurulmaz.',
      },
      {
        ad: 'Ayrıştırma hattını kur',
        ozet: 'PDF, ofis dosyası ve HTML için ayrı ayrıştırıcı; tablo ve başlık yapısını koru.',
      },
      {
        ad: 'Parçalama stratejisini seç',
        ozet: 'Belge yapısına göre cümle sınırı ve örtüşme; sürüm bilgisini meta veriye yaz.',
      },
      {
        ad: 'Gömme ve dizinleme',
        ozet: 'Tek gömme modeline bağlan, model değişimini dizin yenileme işi olarak planla.',
      },
      {
        ad: 'Hibrit arama ve yeniden sıralama',
        ozet: 'Anlamsal skoru lexical skorla birleştir, adayları yeniden sırala.',
      },
      {
        ad: 'Erişim denetimini belge katmanına koy',
        ozet: 'Filtreleme model isteminde değil sorguda uygulanır.',
      },
      {
        ad: 'Geri getirmeyi ayrı ölç',
        ozet: 'Üretim kalitesinden bağımsız bir isabet metriği kur; regresyon testine bağla.',
      },
    ],
    sss: [
      {
        soru: 'Hangi adımı atlamak en pahalıya geliyor?',
        cevap:
          'Geri getirme ölçümü. Ölçüm olmadan kalite tartışması sezgiye döner ve her değişiklik risk haline gelir.',
      },
      {
        soru: 'Erişim denetimini modele bırakabilir miyim?',
        cevap:
          'Hayır. Model kendisine verilen bağlamı kullanır; görmemesi gereken belge bağlama girmişse iş bitmiştir.',
      },
    ],
  },
  {
    slug: 'ajan-degerlendirme-hatti',
    baslik: 'Ajan değerlendirme hattı kurmak',
    kisaCevap:
      'Ajan değerlendirmesi, gerçek kullanımdan toplanan görev seti üzerinde görev tamamlama oranı ve hata sınıflandırmasıyla ölçülür.',
    konu: 'Değerlendirme',
    seviye: 'ileri' as const,
    okumaDakika: 18,
    yazarSlug: 'sinaptik-research',
    tarih: '2026-08-25',
    adimlar: 5,
    adimListesi: [
      {
        ad: 'Gerçek kullanımdan görev topla',
        ozet: 'Sentetik örnek değil, üretimde karşılaşılan gerçek istekler.',
      },
      {
        ad: 'Başarı tanımını yaz',
        ozet: 'Doğru sonucun ne olduğu yazılı olmadan puanlama yapılamaz.',
      },
      {
        ad: 'Kısmi başarıyı puanla',
        ozet: 'İkili başarı/başarısızlık, iyileştirmeyi görünmez kılar.',
      },
      {
        ad: 'Hataları sınıflandır',
        ozet: 'Araç şeması, planlama, bellek, doğrulama — kök neden kategorileri.',
      },
      { ad: 'Regresyona bağla', ozet: 'Her istem ve model değişikliğinde aynı seti çalıştır.' },
    ],
    sss: [
      {
        soru: 'Kaç görev yeterli?',
        cevap:
          'Az sayıda ama gerçek görev, çok sayıda sentetik görevden daha bilgilendirici. Hata kategorilerini temsil etmesi önemli.',
      },
    ],
  },
  {
    slug: 'hibrit-arama-kurulumu',
    baslik: 'Hibrit arama kurulumu',
    kisaCevap:
      'Hibrit arama, anlamsal benzerlik skorunu lexical eşleşme skoruyla birleştirip tek bir sıralama üretir.',
    konu: 'RAG',
    seviye: 'orta' as const,
    okumaDakika: 15,
    yazarSlug: 'sukru-yusuf-kaya',
    tarih: '2026-07-19',
    adimlar: 6,
    adimListesi: [
      { ad: 'Lexical katmanı ekle', ozet: 'Kesin terim eşleşmesi için klasik metin araması.' },
      {
        ad: 'Skorları normalize et',
        ozet: 'İki farklı ölçekteki skoru karşılaştırılabilir hale getir.',
      },
      {
        ad: 'Ağırlıkları ölç',
        ozet: 'Ağırlığı tahminle değil, kendi değerlendirme setinle belirle.',
      },
      {
        ad: 'Meta veri filtrelerini bağla',
        ozet: 'Sürüm, dil ve erişim etiketleri sorgu düzeyinde uygulanır.',
      },
      {
        ad: 'Yeniden sıralayıcı ekle',
        ozet: 'İlk aşama geri çağırma odaklı, ikinci aşama kesinlik odaklı olsun.',
      },
      { ad: 'İzleme kur', ozet: 'Hangi sorgularda hangi katmanın kazandığını kaydet.' },
    ],
  },
  {
    slug: 'model-secim-karari',
    baslik: 'Kurumsal model seçim kararı',
    kisaCevap:
      'Model seçimi; kendi görev setinizde kalite, gecikme, maliyet ve veri ikametgâhı kısıtlarının birlikte değerlendirilmesiyle yapılır.',
    konu: 'AI Business',
    seviye: 'baslangic' as const,
    okumaDakika: 14,
    yazarSlug: 'sukru-yusuf-kaya',
    tarih: '2026-07-05',
    adimlar: 5,
    adimListesi: [
      { ad: 'Görev setini yaz', ozet: 'Kendi işinizi temsil eden 30–50 gerçek örnek.' },
      {
        ad: 'Kalite eşiğini belirle',
        ozet: 'En yüksek skor değil, kabul edilebilir kalite aranır.',
      },
      {
        ad: 'Gecikme ve maliyet bütçesi koy',
        ozet: 'Kullanıcı deneyimi gecikmeye, birim ekonomi maliyete bağlı.',
      },
      { ad: 'Kısıtları listele', ozet: 'Veri ikametgâhı, denetim, sözleşme ve destek.' },
      {
        ad: 'Karar kaydı tut',
        ozet: 'Neyi neden seçtiğinizi yazın; altı ay sonra tekrar tartışmayın.',
      },
    ],
  },
  {
    slug: 'ajan-yetki-tasarimi',
    baslik: 'Ajanlarda yetki tasarımı',
    kisaCevap:
      'Ajan güvenliği, her görev için en az yetki ilkesinin araç katmanında uygulanmasıyla sağlanır.',
    konu: 'AI Güvenliği',
    seviye: 'ileri' as const,
    okumaDakika: 19,
    yazarSlug: 'sukru-yusuf-kaya',
    tarih: '2026-06-28',
    adimlar: 6,
    adimListesi: [
      {
        ad: 'Araçları risk sınıfına ayır',
        ozet: 'Okuma, yazma ve geri döndürülemez işlemler ayrı sınıflar.',
      },
      {
        ad: 'Görev bazında yetki ver',
        ozet: 'Ajanın tüm oturum boyunca her şeye erişmesi gerekmez.',
      },
      {
        ad: 'Dış içeriği veri olarak işaretle',
        ozet: 'Okunan belge talimat değildir; sistem bunu bilmelidir.',
      },
      { ad: 'Onay adımı koy', ozet: 'Geri döndürülemez işlem insan onayı olmadan çalışmaz.' },
      { ad: 'Denetim kaydı tut', ozet: 'Hangi adımda hangi araç hangi parametreyle çağrıldı?' },
      {
        ad: 'Kırmızı takım testi yap',
        ozet: 'Enjeksiyon senaryolarını düzenli olarak tekrar çalıştır.',
      },
    ],
    sss: [
      {
        soru: 'Sistem istemini güçlendirmek yeterli mi?',
        cevap:
          'Değil. İstem bir savunma katmanıdır ama tek katman olamaz; asıl kontrol yetkilendirmededir.',
      },
    ],
  },
  {
    slug: 'turkce-icin-parcalama',
    baslik: 'Türkçe metinlerde parçalama stratejisi',
    kisaCevap:
      'Türkçede parçalama, eklemeli yapının anlam bütünlüğünü bölmemesi için cümle sınırı ve örtüşme temelli yapılır.',
    konu: 'RAG',
    seviye: 'orta' as const,
    okumaDakika: 12,
    yazarSlug: 'sinaptik-research',
    tarih: '2026-06-14',
    adimlar: 4,
    adimListesi: [
      { ad: 'Cümle sınırını koru', ozet: 'Eklemeli yapıda kelime ortasından bölme anlamı bozar.' },
      { ad: 'Başlık bağlamını taşı', ozet: 'Her parçaya ait olduğu bölüm başlığını ekle.' },
      { ad: 'Örtüşme bırak', ozet: 'Komşu parçalar arasında bağlam köprüsü kurar.' },
      {
        ad: 'Token maliyetini ölç',
        ozet: 'Türkçe aynı bilgi için daha fazla token harcar; bütçeyi buna göre kur.',
      },
    ],
  },
];

/**
 * Rehber ayrıntıları `lib/veri/govde/rehber.ts` içinde tutulur ve burada
 * adım özetleriyle birleştirilir: ek adımlar listeye eklenir, her adımın
 * ayrıntı blokları adına göre eşlenir.
 */
export const REHBERLER: RehberKaydi[] = HAM_REHBERLER.map((rehber) => {
  const ek = REHBER_EKLERI[rehber.slug];
  if (!ek) return rehber;

  const tumAdimlar = [...(rehber.adimListesi ?? []), ...(ek.ekAdimlar ?? [])];
  const adimListesi = tumAdimlar.map((adim) => {
    const ayrinti = ek.adimAyrintilari?.[adim.ad];
    return ayrinti ? { ...adim, ayrinti } : adim;
  });

  return {
    ...rehber,
    adimListesi,
    adimlar: adimListesi.length || rehber.adimlar,
    onKosullar: ek.onKosullar ?? rehber.onKosullar,
    araclar: ek.araclar ?? rehber.araclar,
    tuzaklar: ek.tuzaklar ?? rehber.tuzaklar,
    kontrolListesi: ek.kontrolListesi ?? rehber.kontrolListesi,
    kaynaklar: ek.kaynaklar ?? rehber.kaynaklar,
    ilgiliSluglar: ek.ilgiliSluglar ?? rehber.ilgiliSluglar,
    sss: [...(rehber.sss ?? []), ...(ek.sss ?? [])].length
      ? [...(rehber.sss ?? []), ...(ek.sss ?? [])]
      : undefined,
  };
});

export function rehberBul(slug: string) {
  return REHBERLER.find((rehber) => rehber.slug === slug);
}

/* --- DERGİ ---------------------------------------------------------------- */

const HAM_DERGI: DergiSayisi[] = [
  {
    slug: '2026-ekim',
    sayi: '2026 / Ekim',
    kapakKonusu: 'The Agentic Era',
    tarih: '2026-10-01',
    ozet: 'Ajan mimarilerinin ürünleşme eşiği, yeni nesil yapay zekâ şirketleri, embodied AI ve Türkiye ekosisteminin konumu.',
    yazilar: [
      {
        slug: 'agentic-ai-mimariden-operasyona',
        baslik: 'Agentic AI: mimariden operasyona',
        bolum: 'Dosya',
        ozet: 'Ajan sistemleri laboratuvardan operasyona geçerken sorumluluk sınırları nasıl değişiyor?',
        yazarSlug: 'sukru-yusuf-kaya',
        okumaDakika: 16,
      },
      {
        slug: 'yeni-nesil-ai-sirketlerinin-ekonomisi',
        baslik: 'Yeni nesil yapay zekâ şirketlerinin ekonomisi',
        bolum: 'Dosya',
        ozet: 'Marjlar, altyapı maliyeti ve savunulabilirlik üzerine bir okuma.',
        yazarSlug: 'sukru-yusuf-kaya',
        okumaDakika: 13,
      },
      {
        slug: 'embodied-ai-ve-fiziksel-dunya',
        baslik: 'Embodied AI ve fiziksel dünya',
        bolum: 'Dosya',
        ozet: 'Veri toplama maliyetinin robotikteki belirleyici rolü.',
        yazarSlug: 'sinaptik-research',
        okumaDakika: 11,
      },
      {
        slug: 'ai-guvenliginde-yetki-tasarimi',
        baslik: 'Yapay zekâ güvenliğinde yetki tasarımı',
        bolum: 'Görüş',
        ozet: 'Enjeksiyon bir metin sorunu değil, mimari bir karar.',
        yazarSlug: 'sukru-yusuf-kaya',
        okumaDakika: 9,
      },
      {
        slug: 'turkiye-ai-ekosistem-haritasi',
        baslik: 'Türkiye yapay zekâ ekosistemi haritası',
        bolum: 'Araştırma',
        ozet: 'Katmanlar, boşluklar ve yetenek akışı.',
        yazarSlug: 'sinaptik-research',
        okumaDakika: 14,
      },
      {
        slug: 'arastirmaci-roportaji',
        baslik: 'Araştırmacı röportajı',
        bolum: 'Röportaj',
        ozet: 'Değerlendirme kültürü neden geç kuruluyor?',
        yazarSlug: 'sinaptik-redaksiyon',
        okumaDakika: 12,
      },
    ],
  },
  {
    slug: '2026-eylul',
    sayi: '2026 / Eylül',
    kapakKonusu: 'Ölçemediğin Şeyi İyileştiremezsin',
    tarih: '2026-09-01',
    ozet: 'Değerlendirme kültürü, görev setleri ve kurumsal yapay zekâda başarı tanımı.',
    yazilar: [
      {
        slug: 'degerlendirme-kulturu',
        baslik: 'Değerlendirme kültürü',
        bolum: 'Dosya',
        ozet: 'Neden en çok ihmal edilen katman?',
        yazarSlug: 'sinaptik-research',
        okumaDakika: 15,
      },
      {
        slug: 'basari-tanimi-yazmak',
        baslik: 'Başarı tanımı yazmak',
        bolum: 'Dosya',
        ozet: 'Bir yapay zekâ projesinin en zor belgesi.',
        yazarSlug: 'sukru-yusuf-kaya',
        okumaDakika: 10,
      },
      {
        slug: 'gorev-seti-atolyesi',
        baslik: 'Görev seti atölyesi',
        bolum: 'Uygulama',
        ozet: 'Kendi setinizi iki günde kurmak.',
        yazarSlug: 'sinaptik-research',
        okumaDakika: 12,
      },
    ],
  },
  {
    slug: '2026-agustos',
    sayi: '2026 / Ağustos',
    kapakKonusu: 'Uzun Bağlamın Sınırı',
    tarih: '2026-08-01',
    ozet: 'Bağlam penceresi büyürken bellek, maliyet ve geri getirme kararları nasıl değişiyor?',
    yazilar: [
      {
        slug: 'uzun-baglam-yanilgisi',
        baslik: 'Uzun bağlam yanılgısı',
        bolum: 'Dosya',
        ozet: 'Her şeyi pencereye koymak neden çalışmıyor?',
        yazarSlug: 'sukru-yusuf-kaya',
        okumaDakika: 13,
      },
      {
        slug: 'bellek-mimarileri',
        baslik: 'Bellek mimarileri',
        bolum: 'Dosya',
        ozet: 'Kısa ve uzun vadeli belleği ayırmak.',
        yazarSlug: 'sinaptik-research',
        okumaDakika: 11,
      },
    ],
  },
];

/**
 * Dergi yazısı gövdeleri `lib/veri/govde/dergi.ts` içinde tutulur ve burada
 * künye bilgisiyle birleştirilir.
 */
export const DERGI_SAYILARI: DergiSayisi[] = HAM_DERGI.map((sayi) => ({
  ...sayi,
  yazilar: sayi.yazilar.map((yazi) => {
    const ek = DERGI_GOVDELERI[yazi.slug];
    return ek ? { ...yazi, ...ek } : yazi;
  }),
}));

export function dergiSayisiBul(slug: string) {
  return DERGI_SAYILARI.find((sayi) => sayi.slug === slug);
}

export const DERGI_BOLUMLERI = [
  {
    slug: 'dosya',
    ad: 'Dosya Konuları',
    ozet: 'Her sayının kapak dosyasını oluşturan derin incelemeler.',
  },
  {
    slug: 'roportaj',
    ad: 'Röportajlar',
    ozet: 'Araştırmacı, kurucu ve uygulayıcılarla konuşmalar.',
  },
  { slug: 'kose', ad: 'Köşe Yazıları', ozet: 'Düzenli yazarların görüş yazıları.' },
];

/* --- PODCAST -------------------------------------------------------------- */

export const PODCAST: PodcastBolumu[] = [
  {
    slug: 'degerlendirme-kulturu',
    numara: 12,
    ad: 'Değerlendirme kültürü neden geç kuruluyor?',
    konuk: 'Araştırma birimi',
    dakika: 48,
    tarih: '2026-09-05',
    ozet: 'Ekipler neden model değiştirmeye ölçmekten daha istekli? Görev seti kurmanın örgütsel maliyeti.',
    cikarimlar: [
      'Ölçüm altyapısı olmayan ekipler model değişimini iyileştirme sanıyor.',
      'Görev seti kurmak teknik değil örgütsel bir karar.',
    ],
  },
  {
    slug: 'ajan-guvenligi',
    numara: 11,
    ad: 'Ajan güvenliği: yetki mi filtre mi?',
    konuk: 'Güvenlik araştırmacısı',
    dakika: 52,
    tarih: '2026-08-22',
    ozet: 'Dolaylı istem enjeksiyonunun neden bir yetkilendirme sorunu olduğu üzerine.',
    cikarimlar: [
      'En az yetki ilkesi ajan mimarisinin temel taşı.',
      'Geri döndürülemez işlemler her zaman onay arkasında olmalı.',
    ],
  },
  {
    slug: 'turkce-nlp',
    numara: 10,
    ad: 'Türkçe için değerlendirme açığı',
    konuk: 'Dilbilim ve NLP araştırmacısı',
    dakika: 44,
    tarih: '2026-08-08',
    ozet: 'Eklemeli dil yapısının tokenizasyon ve değerlendirme üzerindeki etkisi.',
    cikarimlar: [
      'Türkçe aynı bilgi için daha fazla token harcıyor.',
      'Yerel görev setleri olmadan model seçimi tahmine dayanıyor.',
    ],
  },
];

export function podcastBul(slug: string) {
  return PODCAST.find((bolum) => bolum.slug === slug);
}

/* --- ETKİNLİKLER ---------------------------------------------------------- */

export const ETKINLIKLER: Etkinlik[] = [
  {
    slug: 'rag-atolyesi-ekim',
    ad: 'Kurumsal RAG Atölyesi',
    tur: 'Workshop',
    tarih: '2026-10-08',
    bicim: 'Çevrim içi · 3 saat',
    ozet: 'Parçalama, hibrit arama ve geri getirme değerlendirmesi üzerine uygulamalı atölye.',
    durum: 'kayit-acik',
  },
  {
    slug: 'ajan-degerlendirme-webinari',
    ad: 'Ajan Değerlendirmesi Webinarı',
    tur: 'Webinar',
    tarih: '2026-09-25',
    bicim: 'Çevrim içi · 90 dakika',
    ozet: 'Görev tamamlama oranı ölçümü ve hata sınıflandırması.',
    durum: 'kayit-acik',
  },
  {
    slug: 'yoneticiler-icin-ai-brifingi',
    ad: 'Yöneticiler İçin AI Brifingi',
    tur: 'Meetup',
    tarih: '2026-11-12',
    bicim: 'İstanbul · Yüz yüze',
    ozet: 'Kullanım senaryosu önceliklendirme ve yönetişim üzerine kapalı oturum.',
    durum: 'planlandi',
  },
  {
    slug: 'sinaptik-summit-2026',
    ad: 'Sinaptik Summit',
    tur: 'Konferans',
    tarih: '2026-12-04',
    bicim: 'İstanbul · Tam gün',
    ozet: 'Yıllık konferans: araştırma, uygulama ve ekosistem oturumları.',
    durum: 'planlandi',
  },
  {
    slug: 'benchmark-metodoloji-oturumu',
    ad: 'Benchmark Metodolojisi Oturumu',
    tur: 'Webinar',
    tarih: '2026-07-30',
    bicim: 'Çevrim içi · 60 dakika',
    ozet: 'Türkçe LLM Benchmark yönteminin açık tartışması.',
    durum: 'gecti',
  },
];

export function etkinlikBul(slug: string) {
  return ETKINLIKLER.find((etkinlik) => etkinlik.slug === slug);
}

/* --- UZMANLAR ------------------------------------------------------------- */

export const UZMANLAR: Uzman[] = [
  {
    slug: 'sukru-yusuf-kaya',
    ad: 'Şükrü Yusuf Kaya',
    unvan: 'Kurucu',
    alan: 'AI stratejisi · Platform mimarisi',
    basHarfler: 'ŞK',
  },
  {
    slug: 'uzman-agent',
    ad: 'Katkı bekleniyor',
    unvan: 'AI Agent Engineer',
    alan: 'Agentic sistemler',
    basHarfler: '+',
  },
  {
    slug: 'uzman-guvenlik',
    ad: 'Katkı bekleniyor',
    unvan: 'AI Security Researcher',
    alan: 'Model güvenliği',
    basHarfler: '+',
  },
  {
    slug: 'uzman-hukuk',
    ad: 'Katkı bekleniyor',
    unvan: 'Teknoloji Hukuku',
    alan: 'Regülasyon ve uyum',
    basHarfler: '+',
  },
  {
    slug: 'uzman-cv',
    ad: 'Katkı bekleniyor',
    unvan: 'Computer Vision Engineer',
    alan: 'Görü sistemleri',
    basHarfler: '+',
  },
  {
    slug: 'uzman-veri',
    ad: 'Katkı bekleniyor',
    unvan: 'Data Engineer',
    alan: 'Veri altyapısı',
    basHarfler: '+',
  },
];

/* --- SORU & CEVAP --------------------------------------------------------- */

export const SORU_CEVAP = [
  {
    slug: 'rag-mi-fine-tuning-mi',
    soru: 'Kurumsal belge araması için RAG mi fine-tuning mi?',
    cevapOzeti:
      'Sık değişen olgusal bilgi için RAG; sabit üslup ve biçim gereksinimi için fine-tuning. İkisi birlikte de kullanılabilir.',
    konu: 'RAG',
    tarih: '2026-09-06',
  },
  {
    slug: 'ajan-maliyetini-nasil-dusururum',
    soru: 'Ajan akışında token maliyetini nasıl düşürürüm?',
    cevapOzeti:
      'Adım sayısını azaltmak, bellek özetleme ve küçük modelleri sınıflandırma adımlarında kullanmak en hızlı kazançları veriyor.',
    konu: 'AI Agents',
    tarih: '2026-09-03',
  },
  {
    slug: 'turkce-embedding-secimi',
    soru: 'Türkçe için hangi gömme modelini seçmeliyim?',
    cevapOzeti:
      'Kendi belge setinizden küçük bir değerlendirme kümesi çıkarıp adayları karşılaştırmak, genel sıralamalara güvenmekten daha güvenilir.',
    konu: 'Embedding',
    tarih: '2026-08-28',
  },
  {
    slug: 'halusinasyonu-nasil-olcerim',
    soru: 'Halüsinasyon oranını nasıl ölçerim?',
    cevapOzeti:
      'Cevabın kaynağa dayanıp dayanmadığını kontrol eden bir doğrulama adımı ve insan örneklemesi birlikte kullanılır.',
    konu: 'Responsible AI',
    tarih: '2026-08-20',
  },
];
