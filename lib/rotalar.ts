/**
 * Gezinme mimarisinin tek kaynağı (MASTER-PLAN §4, §130).
 * Header mega menü, mobil menü, footer ve site haritası buradan beslenir.
 */

export type MenuOgesi = {
  ad: string;
  yol: string;
  aciklama?: string;
  rozet?: 'yeni' | 'canli' | 'yakinda';
};

export type MenuSutunu = {
  baslik: string;
  ogeler: MenuOgesi[];
};

export type AnaMenuOgesi = {
  anahtar: string;
  ad: string;
  yol: string;
  ozet: string;
  sutunlar: MenuSutunu[];
  vitrin?: {
    etiket: string;
    baslik: string;
    metin: string;
    yol: string;
    baglantiMetni: string;
    /** Menü öğelerindeki `rozet` ile aynı küme; vitrin de durumunu söyleyebilsin. */
    rozet?: 'yeni' | 'canli' | 'yakinda';
  };
};

export const ANA_MENU: AnaMenuOgesi[] = [
  {
    anahtar: 'gundem',
    ad: 'Gündem',
    yol: '/gundem/',
    ozet: 'Yapay zekâ dünyasında bugün ne oluyor?',
    sutunlar: [
      {
        baslik: 'Akış',
        ogeler: [
          { ad: 'Son Haberler', yol: '/gundem/', aciklama: 'Dakika dakika AI gündemi' },
          {
            ad: 'Sinaptik Brief',
            yol: '/brief/',
            aciklama: 'Bugünün 5 dakikalık özeti',
            rozet: 'canli',
          },
          {
            ad: 'Haftanın Özeti',
            yol: '/gundem/haftanin-ozeti/',
            aciklama: 'Haftayı kapatan analiz',
          },
          {
            ad: 'AI Radar',
            yol: '/radar/',
            aciklama: 'Teknoloji momentum endeksi',
            rozet: 'canli',
          },
        ],
      },
      {
        baslik: 'Konu',
        ogeler: [
          { ad: 'Yapay Zekâ', yol: '/gundem/yapay-zeka/' },
          { ad: 'Büyük Dil Modelleri', yol: '/gundem/llm/' },
          { ad: "AI Agent'lar", yol: '/gundem/ai-agent/' },
          { ad: 'Robotik & Embodied AI', yol: '/gundem/robotik/' },
          { ad: 'Araştırmalar', yol: '/gundem/arastirma/' },
        ],
      },
      {
        baslik: 'Ekosistem',
        ogeler: [
          { ad: 'Şirketler', yol: '/sirketler/' },
          { ad: 'Startuplar', yol: '/gundem/startuplar/' },
          { ad: 'Türkiye', yol: '/gundem/turkiye/' },
          { ad: 'Regülasyon', yol: '/gundem/regulasyon/' },
          { ad: 'AI Business', yol: '/gundem/is-dunyasi/' },
        ],
      },
    ],
    vitrin: {
      etiket: 'Bugünün başlığı',
      baslik: 'Agentic AI yarışı ikinci perdesine giriyor',
      metin:
        'Tool-use ve uzun ufuklu planlama yetenekleri, model seçimini bir kez daha altüst ediyor. Ne değişti, kimi etkiliyor?',
      yol: '/gundem/',
      baglantiMetni: 'Gündemi aç',
    },
  },
  {
    anahtar: 'kesfet',
    ad: 'Keşfet',
    yol: '/kesfet/',
    ozet: 'Kavramlar, modeller, araçlar ve şirketlerin bilgi grafiği.',
    sutunlar: [
      {
        baslik: 'Bilgi',
        ogeler: [
          {
            ad: 'AI Atlas',
            yol: '/atlas/',
            aciklama: 'Kavramların kalıcı referansı',
            rozet: 'yeni',
          },
          { ad: 'Rehberler', yol: '/rehber/', aciklama: 'Uçtan uca uygulama rehberleri' },
          { ad: 'Konu Merkezleri', yol: '/konu/', aciklama: 'Bir konunun tamamı tek sayfada' },
          { ad: 'Sözlük', yol: '/sozluk/', aciklama: 'Hızlı tanımlar' },
        ],
      },
      {
        baslik: 'Varlıklar',
        ogeler: [
          { ad: 'AI Modelleri', yol: '/modeller/', aciklama: 'Model veritabanı ve benchmarklar' },
          {
            ad: 'Karşılaştırmalar',
            yol: '/karsilastir/',
            aciklama: 'Fiyat, bağlam ve lisans kıyası',
          },
          { ad: 'AI Araçları', yol: '/araclar/', aciklama: 'Editoryal seçki' },
          { ad: 'AI Şirketleri', yol: '/sirketler/' },
        ],
      },
      {
        baslik: 'Uygulama',
        ogeler: [
          { ad: 'Sektörler', yol: '/sektor/' },
          { ad: 'Kariyerler', yol: '/kariyer/', aciklama: 'On dokuz meslek, kıdem kırılımıyla' },
          {
            ad: 'Hesaplayıcılar',
            yol: '/araclar/hesaplayicilar/',
            aciklama: 'Token, maliyet, GPU',
          },
          { ad: 'Vaka Çalışmaları', yol: '/vaka-calismalari/' },
        ],
      },
    ],
    vitrin: {
      etiket: 'Atlas girdisi',
      baslik: 'RAG nedir?',
      metin:
        'Dil modelinin cevap üretmeden önce harici bilgi kaynaklarından ilgili bilgiyi getirip bağlama eklediği mimari.',
      yol: '/atlas/rag/',
      baglantiMetni: '30 saniyede oku',
    },
  },
  {
    anahtar: 'ogren',
    ad: 'Öğren',
    yol: '/ogren/',
    ozet: 'Yapay zekâyı öğrenmenin en sistematik yolu.',
    sutunlar: [
      {
        baslik: 'Yol haritası',
        ogeler: [
          { ad: 'Öğrenme Yolları', yol: '/ogren/yollar/', aciklama: 'Rolüne göre 7 rota' },
          {
            ad: 'Beceri Ağı',
            yol: '/ogren/beceri-grafigi/',
            aciklama: 'Önkoşul haritası ve rota üretici',
          },
          { ad: 'Dersler', yol: '/ogren/dersler/' },
          { ad: 'Sinaptik Academy', yol: '/akademi/', rozet: 'yakinda' },
        ],
      },
      {
        baslik: 'Ölçüm',
        ogeler: [
          { ad: 'Seviyeni Ölç', yol: '/seviye-testi/', aciklama: '15 soruda AI seviyesi' },
          { ad: 'Testler', yol: '/testler/', aciklama: '12 konu başlığı' },
          { ad: 'Sertifikalar', yol: '/akademi/sertifikalar/', rozet: 'yakinda' },
        ],
      },
      {
        baslik: 'Uygulama',
        ogeler: [
          { ad: 'Projeler', yol: '/ogren/projeler/' },
          // Lab Playground ve Kod Örnekleri, hedef kayıtları TASLAK olduğu için
          // menüden çıkarıldı: yayımlanmamış bir kaydın adresi 404 verir ve
          // gezinmede kırık bağlantı bırakmak "boş bölüm dolu gösterilmez"
          // kuralına aykırıdır. Kayıtlar yayına alındığında geri eklenmeli.
          { ad: 'Sinaptik Lab', yol: '/lab/' },
        ],
      },
    ],
    vitrin: {
      etiket: 'En çok başlanan',
      baslik: 'Generative AI Engineer',
      metin: '13 bölüm · Teori → Örnek → Lab → Test → Proje döngüsüyle ilerleyen rota.',
      yol: '/ogren/yollar/generative-ai-engineer/',
      baglantiMetni: 'Rotayı incele',
    },
  },
  {
    anahtar: 'dergi',
    ad: 'Dergi',
    yol: '/dergi/',
    ozet: 'Aylık dosya konuları, röportajlar ve editoryal analiz.',
    sutunlar: [
      {
        baslik: 'Sayılar',
        ogeler: [
          { ad: 'Son Sayı', yol: '/dergi/', rozet: 'yakinda' },
          { ad: 'Tüm Sayılar', yol: '/dergi/arsiv/', rozet: 'yakinda' },
        ],
      },
      {
        baslik: 'Bölümler',
        ogeler: [
          { ad: 'Dosya Konuları', yol: '/dergi/dosya/', rozet: 'yakinda' },
          { ad: 'Röportajlar', yol: '/dergi/roportaj/', rozet: 'yakinda' },
          { ad: 'Araştırma Yazıları', yol: '/dergi/arastirma-yazilari/', rozet: 'yakinda' },
          { ad: 'Uygulama Notları', yol: '/dergi/uygulama/', rozet: 'yakinda' },
          { ad: 'Köşe Yazıları', yol: '/dergi/kose/', rozet: 'yakinda' },
          /*
           * "Derin Analizler" Dergi menüsünde duruyor ama DERGİ VERİSİ DEĞİL:
           * içerik `icerikler` koleksiyonunda `tur: 'analiz'` olarak yaşıyor
           * ve 7 yazı yayında. Dergi sayıları arşive alınırken bu satır
           * bilerek rozetsiz bırakıldı — arkasında gerçekten okunabilir
           * içerik olan bir bağlantıya "Yakında" yazmak, rozetin taşıdığı
           * sözü bozar ve okuru geri çevirir.
           */
          { ad: 'Derin Analizler', yol: '/analiz/' },
        ],
      },
    ],
    /*
     * Ekim sayısı 1 Ekim tarihli, yani HENÜZ YAYIMLANMADI. Vitrin onu
     * "Sayıyı oku" çağrısıyla tanıtıyordu: menüye bakan okur çıkmamış bir
     * sayıyı okuyabileceğini sanıyordu. Rozet ve çağrı metni gerçeğe
     * getirildi; `/dergi/` sayfasındaki "Yakında" bloğuyla da tutarlı.
     */
    vitrin: {
      etiket: 'Kapak dosyası',
      baslik: 'The Agentic Era',
      metin: 'Ekim sayısı: ajan mimarileri, yeni nesil AI şirketleri ve Türkiye ekosistemi.',
      yol: '/dergi/',
      baglantiMetni: 'Çıkınca haber ver',
      rozet: 'yakinda',
    },
  },
  {
    anahtar: 'arastirma',
    ad: 'Araştırma',
    yol: '/arastirma/',
    ozet: 'Özgün veri, benchmark ve raporlar.',
    sutunlar: [
      {
        baslik: 'Yayınlar',
        ogeler: [
          { ad: 'Raporlar', yol: '/arastirma/raporlar/', rozet: 'yakinda' },
          { ad: 'Whitepaper', yol: '/arastirma/whitepaper/', rozet: 'yakinda' },
          { ad: 'Research Notes', yol: '/arastirma/notlar/', rozet: 'yakinda' },
        ],
      },
      {
        baslik: 'Veri',
        ogeler: [
          {
            ad: 'Benchmarklar',
            yol: '/arastirma/benchmark/',
            aciklama: 'Metodoloji açık',
            rozet: 'yakinda',
          },
          { ad: 'Veri Setleri', yol: '/arastirma/veri-setleri/', rozet: 'yakinda' },
          { ad: 'Sinaptik AI Index', yol: '/arastirma/ai-index/', rozet: 'yakinda' },
          { ad: 'Metodoloji', yol: '/metodoloji/' },
        ],
      },
    ],
    vitrin: {
      etiket: 'Amiral gemisi',
      baslik: 'State of AI Türkiye',
      metin:
        'Şirket adoption, yatırım, yetenek açığı ve model tercihleri üzerine yıllık saha çalışması.',
      yol: '/arastirma/raporlar/',
      baglantiMetni: 'Çıkınca haber ver',
      rozet: 'yakinda',
    },
  },
  {
    anahtar: 'kurumsal',
    ad: 'Kurumsal',
    yol: '/kurumsal/',
    ozet: 'Yapay zekâyı gerçek iş sonuçlarına dönüştürün.',
    sutunlar: [
      {
        baslik: 'Hizmetler',
        ogeler: [
          { ad: 'AI Stratejisi', yol: '/kurumsal/yapay-zeka-stratejisi/' },
          { ad: 'Kurumsal RAG', yol: '/kurumsal/rag/' },
          { ad: 'AI Agent & Otomasyon', yol: '/kurumsal/ai-agent/' },
          { ad: 'Computer Vision', yol: '/kurumsal/computer-vision/' },
          { ad: 'MLOps / LLMOps', yol: '/kurumsal/mlops/' },
        ],
      },
      {
        baslik: 'Program',
        ogeler: [
          {
            ad: 'AI Readiness',
            yol: '/kurumsal/ai-readiness/',
            aciklama: '7 boyutlu değerlendirme',
          },
          { ad: 'AI Governance', yol: '/kurumsal/ai-governance/' },
          { ad: 'Kurumsal Eğitim', yol: '/kurumsal/egitim/' },
          { ad: 'AI Projeleri', yol: '/kurumsal/projeler/' },
        ],
      },
      {
        baslik: 'Kanıt',
        ogeler: [
          { ad: 'Vaka Çalışmaları', yol: '/vaka-calismalari/' },
          { ad: 'Sektörler', yol: '/sektor/' },
          { ad: 'Lab Projeleri', yol: '/lab/' },
        ],
      },
    ],
    vitrin: {
      etiket: 'Ücretsiz değerlendirme',
      baslik: 'AI Readiness Score',
      metin:
        'Strateji, veri, altyapı, yetenek, yönetişim ve güvenlik boyutlarında 100 üzerinden skor.',
      yol: '/kurumsal/ai-readiness/',
      baglantiMetni: 'Değerlendirmeyi başlat',
    },
  },
  {
    anahtar: 'topluluk',
    ad: 'Topluluk',
    yol: '/topluluk/',
    ozet: 'Uzmanlar, etkinlikler ve tartışma.',
    sutunlar: [
      {
        baslik: 'İnsanlar',
        ogeler: [
          { ad: 'Uzmanlar', yol: '/uzmanlar/' },
          { ad: 'Yazarlar', yol: '/yazar/' },
          { ad: 'Katkıda Bulun', yol: '/topluluk/katki/' },
        ],
      },
      {
        baslik: 'Kanallar',
        ogeler: [
          { ad: 'Etkinlikler', yol: '/etkinlikler/' },
          { ad: 'Soru & Cevap', yol: '/soru-cevap/' },
          { ad: 'Podcast', yol: '/podcast/' },
          { ad: 'Bülten', yol: '/bulten/' },
        ],
      },
    ],
  },
];

export const UST_CUBUK: MenuOgesi[] = [
  { ad: 'AI Radar', yol: '/radar/' },
  { ad: 'Sinaptik Brief', yol: '/brief/' },
  { ad: 'Haftalık Bülten', yol: '/bulten/' },
  { ad: 'Etkinlikler', yol: '/etkinlikler/' },
];

export const ALTLIK_SUTUNLARI: MenuSutunu[] = [
  {
    baslik: 'Keşfet',
    ogeler: [
      { ad: 'AI Atlas', yol: '/atlas/' },
      { ad: 'AI Modelleri', yol: '/modeller/' },
      { ad: 'AI Araçları', yol: '/araclar/' },
      { ad: 'AI Şirketleri', yol: '/sirketler/' },
      { ad: 'Karşılaştırmalar', yol: '/karsilastir/' },
      { ad: 'Kariyerler', yol: '/kariyer/' },
    ],
  },
  {
    baslik: 'Öğren',
    ogeler: [
      { ad: 'Öğrenme Yolları', yol: '/ogren/yollar/' },
      { ad: 'Dersler', yol: '/ogren/dersler/' },
      { ad: 'Testler', yol: '/testler/' },
      { ad: 'Seviyeni Ölç', yol: '/seviye-testi/' },
      { ad: 'Academy', yol: '/akademi/' },
    ],
  },
  {
    baslik: 'Araştırma',
    ogeler: [
      { ad: 'Raporlar', yol: '/arastirma/raporlar/' },
      { ad: 'Benchmarklar', yol: '/arastirma/benchmark/' },
      { ad: 'Veri Setleri', yol: '/arastirma/veri-setleri/' },
      { ad: 'AI Index', yol: '/arastirma/ai-index/' },
      { ad: 'Metodoloji', yol: '/metodoloji/' },
    ],
  },
  {
    baslik: 'Kurumsal',
    ogeler: [
      { ad: 'AI Danışmanlığı', yol: '/kurumsal/' },
      { ad: 'AI Readiness', yol: '/kurumsal/ai-readiness/' },
      { ad: 'Kurumsal Eğitim', yol: '/kurumsal/egitim/' },
      { ad: 'Vaka Çalışmaları', yol: '/vaka-calismalari/' },
      { ad: 'Sektörler', yol: '/sektor/' },
    ],
  },
  {
    baslik: 'Sinaptik',
    ogeler: [
      { ad: 'Hakkımızda', yol: '/hakkinda/' },
      { ad: 'Yazarlar', yol: '/yazar/' },
      { ad: 'Editoryal İlkeler', yol: '/editoryal-ilkeler/' },
      { ad: 'AI Kullanım Politikası', yol: '/ai-politikasi/' },
      { ad: 'Künye', yol: '/kunye/' },
      { ad: 'İletişim', yol: '/iletisim/' },
    ],
  },
];

export const ALTLIK_YASAL: MenuOgesi[] = [
  { ad: 'KVKK Aydınlatma', yol: '/kvkk-aydinlatma/' },
  { ad: 'Gizlilik', yol: '/gizlilik/' },
  { ad: 'Çerez Politikası', yol: '/cerez-politikasi/' },
  { ad: 'Kullanım Şartları', yol: '/kullanim-sartlari/' },
  { ad: 'Düzeltme Politikası', yol: '/duzeltme-politikasi/' },
];
