import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import {
  DURUM_ALANI,
  DURUM_SECENEKLERI,
  SEO_ALANLARI,
  SLUG_ALANI,
  type KoleksiyonYapilandirmasi,
} from '@/lib/admin/alanlar/tipler';

/**
 * Meslek bir varlıktır: kalıcı `/kariyer/<slug>/` adresi vardır ve öğrenme
 * rotası ile seviye testine bağlanır. Şemada gövde, SSS, kaynak ve sürüm
 * geçmişi yoktur — bu yüzden o paylaşılan parçalar burada kullanılmaz.
 */
export const MESLEKLER_YAPILANDIRMASI: KoleksiyonYapilandirmasi = {
  koleksiyon: KOLEKSIYONLAR.meslekler,
  ad: 'Meslek',
  cogul: 'Meslekler',
  aciklama:
    'Kariyer sayfaları: meslek tanımı, günlük işler, beceri ve teknoloji listesi, önerilen öğrenme rotası.',
  anahtarAlan: 'slug',
  baslikAlani: 'ad',
  listeKolonlari: [
    { ad: 'ad', etiket: 'Meslek' },
    { ad: 'ozet', etiket: 'Özet', enCok: 70 },
    { ad: 'yolSlug', etiket: 'Rota' },
    { ad: 'testSlug', etiket: 'Test' },
    { ad: 'durum', etiket: 'Durum' },
  ],
  filtreler: [{ ad: 'durum', etiket: 'Durum', secenekler: DURUM_SECENEKLERI }],
  aramaAlanlari: ['ad', 'ozet', 'slug', 'beceriler'],
  siralama: { ad: 1 },
  durumluMu: true,
  siteYolu: (belge) => (belge.slug ? `/kariyer/${String(belge.slug)}/` : undefined),
  olusturulabilir: true,
  silinebilir: true,
  alanlar: [
    {
      ad: 'ad',
      etiket: 'Meslek adı',
      tip: 'metin',
      zorunlu: true,
      genislik: 'yarim',
      yardim: 'Sektörde kullanılan unvan ("AI Engineer"); Türkçeleştirme yapılmaz.',
    },
    SLUG_ALANI,
    {
      ad: 'ozet',
      etiket: 'Özet (answer-first)',
      tip: 'uzunMetin',
      zorunlu: true,
      satir: 3,
      yardim:
        'Bu meslek ne yapar sorusunu tek cümlede yanıtlar; kariyer listesindeki kartta da bu metin görünür.',
    },
    DURUM_ALANI,
    {
      ad: 'neYapar',
      etiket: 'Ne yapar',
      tip: 'metinDizisi',
      yardim: 'Günlük sorumluluklar; her satır fiille başlar ("Değerlendirme setleri kurar").',
    },
    {
      ad: 'beceriler',
      etiket: 'Beceriler',
      tip: 'metinDizisi',
      yardim: 'Araçtan bağımsız yetkinlikler: Python, istem tasarımı, değerlendirme okuryazarlığı.',
    },
    {
      ad: 'teknolojiler',
      etiket: 'Teknolojiler',
      tip: 'metinDizisi',
      yardim: 'Kullanılan araç ve katman türleri: vektör veritabanı, izleme yığını, MCP.',
    },
    {
      ad: 'yolSlug',
      etiket: 'Önerilen öğrenme rotası',
      tip: 'iliski',
      hedefKoleksiyon: KOLEKSIYONLAR.ogrenmeYollari,
      genislik: 'yarim',
      yardim: 'Sayfadaki "bu mesleğe hazırlan" bağlantısı bu rotaya gider.',
    },
    {
      ad: 'testSlug',
      etiket: 'İlgili test',
      tip: 'iliski',
      hedefKoleksiyon: KOLEKSIYONLAR.testler,
      genislik: 'yarim',
      yardim: 'Okurun kendini ölçebileceği test. Uygun test yoksa boş bırakılır.',
    },
    ...SEO_ALANLARI,
  ],
};
