import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import {
  DURUM_ALANI,
  DURUM_SECENEKLERI,
  SEO_ALANLARI,
  SLUG_ALANI,
  SSS_ALANI,
  type KoleksiyonYapilandirmasi,
} from '@/lib/admin/alanlar/tipler';

/**
 * Kurumsal hizmet sayfaları. Şema gövde, kaynak ve sürüm geçmişi taşımaz:
 * sayfa problem → çözüm → kullanım alanları → mimari → güvenlik sırasıyla
 * sabit bölümlerden kurulur, o yüzden metin serbest blok yerine adlandırılmış
 * alanlara yazılır.
 *
 * `mimari` ve `guvenlik` sitede sıralı akış ve liste olarak basılır; sıra
 * editörün girdiği sıradır.
 */
export const HIZMETLER_YAPILANDIRMASI: KoleksiyonYapilandirmasi = {
  koleksiyon: KOLEKSIYONLAR.hizmetler,
  ad: 'Hizmet',
  cogul: 'Hizmetler',
  aciklama:
    'Kurumsal danışmanlık hizmetleri. Her kayıt /kurumsal/ altında kalıcı bir sayfaya karşılık gelir; pazarlama dili değil, problem ve çözüm tanımı yazılır.',
  anahtarAlan: 'slug',
  baslikAlani: 'ad',
  listeKolonlari: [
    { ad: 'ad', etiket: 'Hizmet' },
    { ad: 'slug', etiket: 'Adres', mono: true },
    { ad: 'ozet', etiket: 'Özet', enCok: 60 },
    { ad: 'durum', etiket: 'Durum' },
  ],
  filtreler: [{ ad: 'durum', etiket: 'Durum', secenekler: DURUM_SECENEKLERI }],
  aramaAlanlari: ['ad', 'slug', 'ozet', 'problem'],
  siralama: { ad: 1 },
  durumluMu: true,
  siteYolu: (belge) => (belge.slug ? `/kurumsal/${String(belge.slug)}/` : undefined),
  olusturulabilir: true,
  silinebilir: true,
  alanlar: [
    {
      ad: 'ad',
      etiket: 'Hizmet adı',
      tip: 'metin',
      zorunlu: true,
      yardim: 'Menüde ve sayfa başlığında görünen ad: "Kurumsal RAG Sistemleri", "MLOps / LLMOps".',
      genislik: 'yarim',
    },
    SLUG_ALANI,
    {
      ad: 'ozet',
      etiket: 'Özet',
      tip: 'uzunMetin',
      zorunlu: true,
      satir: 2,
      yardim:
        'Tek cümle: hizmet ne yapar. Kartlarda, menüde ve arama sonucunda bu satır görünür; fiille biten bir eylem tanımı yazın.',
    },
    {
      ad: 'problem',
      etiket: 'Problem',
      tip: 'uzunMetin',
      zorunlu: true,
      satir: 3,
      yardim:
        'Kurumun bu hizmete gelmeden önce yaşadığı somut tıkanma. Çözümden söz etmeyin; yalnızca mevcut durumu yazın.',
    },
    {
      ad: 'cozum',
      etiket: 'Çözüm',
      tip: 'uzunMetin',
      zorunlu: true,
      satir: 3,
      yardim:
        'Yukarıdaki probleme verilen yanıt: ne kuruyoruz ve neyi ölçülebilir kılıyoruz. Rakam vaadi verilmez.',
    },
    DURUM_ALANI,
    {
      ad: 'kullanimAlanlari',
      etiket: 'Kullanım alanları',
      tip: 'metinDizisi',
      yardim:
        'Her satıra bir senaryo: "Teknik destek ve çağrı merkezi", "Kestirimci bakım". Sayfada kart ızgarası olarak basılır; 4–6 satır yeterlidir.',
    },
    {
      ad: 'mimari',
      etiket: 'Mimari katmanları',
      tip: 'metinDizisi',
      yardim:
        'Veri veya işin aktığı sırayla, her satıra bir katman: "Belge kaynakları", "Parçalama", "Vektör veritabanı". Sayfada oklu akış olarak basılır, bu yüzden sıra önemlidir.',
    },
    {
      ad: 'guvenlik',
      etiket: 'Güvenlik ve uyum',
      tip: 'metinDizisi',
      yardim:
        'Verilen somut güvence: "Rol tabanlı erişim denetimi (RBAC)", "Denetim kaydı ve izlenebilirlik". Sağlanmayan bir güvence yazılmaz.',
    },
    SSS_ALANI,
    ...SEO_ALANLARI,
  ],
};
