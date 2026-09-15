import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import {
  DURUM_ALANI,
  DURUM_SECENEKLERI,
  SEO_ALANLARI,
  SEVIYE_SECENEKLERI,
  SLUG_ALANI,
  type KoleksiyonYapilandirmasi,
} from '@/lib/admin/alanlar/tipler';

/**
 * Testler koleksiyonu: sorular burada DURMAZ. Test künyesi (ölçülen beceriler,
 * süre, geçme eşiği) bu koleksiyonda; sorular `sorular` koleksiyonunda tutulur
 * ve `soruEtiketi` ile bu teste bağlanır. Böylece aynı soru birden çok testte
 * kullanılabilir ve soru bankası tek yerden bakımlanır.
 */
export const TESTLER_YAPILANDIRMASI: KoleksiyonYapilandirmasi = {
  koleksiyon: KOLEKSIYONLAR.testler,
  ad: 'Test',
  cogul: 'Testler',
  aciklama:
    'Kendini sınama testlerinin künyesi: ölçülen beceriler, öğrenme hedefleri, süre ve soru bankası bağlantısı.',
  anahtarAlan: 'slug',
  baslikAlani: 'ad',
  listeKolonlari: [
    { ad: 'ad', etiket: 'Test' },
    { ad: 'konu', etiket: 'Konu' },
    { ad: 'seviye', etiket: 'Seviye', secenekler: SEVIYE_SECENEKLERI },
    { ad: 'soruSayisi', etiket: 'Soru', mono: true },
    { ad: 'durum', etiket: 'Durum' },
  ],
  filtreler: [
    { ad: 'durum', etiket: 'Durum', secenekler: DURUM_SECENEKLERI },
    { ad: 'seviye', etiket: 'Seviye', secenekler: SEVIYE_SECENEKLERI },
  ],
  aramaAlanlari: ['ad', 'slug', 'konu', 'ozet'],
  siralama: { ad: 1 },
  durumluMu: true,
  siteYolu: (belge) => (belge.slug ? `/testler/${String(belge.slug)}/` : undefined),
  olusturulabilir: true,
  silinebilir: true,
  alanlar: [
    {
      ad: 'ad',
      etiket: 'Test adı',
      tip: 'metin',
      zorunlu: true,
      yardim: 'Listede ve sayfa başlığında görünen ad: "Machine Learning Testi".',
      genislik: 'yarim',
    },
    SLUG_ALANI,
    {
      ad: 'konu',
      etiket: 'Konu (görünen ad)',
      tip: 'metin',
      zorunlu: true,
      yardim: 'Sayfada ve kartta basılan konu adı: "Large Language Models".',
      genislik: 'yarim',
    },
    {
      ad: 'konuSlug',
      etiket: 'Konu merkezi',
      tip: 'iliski',
      hedefKoleksiyon: KOLEKSIYONLAR.konular,
      yardim: 'Testin listeleneceği konu merkezi. Boşsa test yalnızca /testler/ altında görünür.',
      genislik: 'yarim',
    },
    {
      ad: 'seviye',
      etiket: 'Seviye',
      tip: 'secim',
      zorunlu: true,
      secenekler: SEVIYE_SECENEKLERI,
      yardim: 'Testi kimin çözebileceğini belirler; seviye testi yönlendirmesi bu alanı kullanır.',
      genislik: 'yarim',
    },
    DURUM_ALANI,
    {
      ad: 'soruSayisi',
      etiket: 'Soru sayısı',
      tip: 'sayi',
      enAz: 1,
      yardim:
        'Testte sorulacak soru adedi. Soru bankasındaki eşleşen soru sayısından fazla olamaz.',
      genislik: 'yarim',
    },
    {
      ad: 'dakika',
      etiket: 'Süre (dakika)',
      tip: 'sayi',
      zorunlu: true,
      enAz: 1,
      yardim: 'Ortalama çözüm süresi. Soru başına yaklaşık 1 dakika hesaplayın.',
      genislik: 'yarim',
    },
    {
      ad: 'gecmeEsigi',
      etiket: 'Geçme eşiği (%)',
      tip: 'sayi',
      enAz: 0,
      enCok: 100,
      yardim: 'Sonuç ekranında "geçti" yazması için gereken doğru yüzdesi. Boşsa eşik gösterilmez.',
      genislik: 'yarim',
    },
    {
      ad: 'soruEtiketi',
      etiket: 'Soru bankası etiketi',
      tip: 'metin',
      yardim:
        'Soru bankasından bu teste ait soruları seçen etiket. Sorular bu koleksiyonda değil, "sorular" koleksiyonunda durur: bir sorunun etiketler alanına buraya yazdığınız etiketi ekleyince soru bu teste dahil olur. Etiketi sonradan değiştirirseniz test soruları boşalır.',
    },
    {
      ad: 'ozet',
      etiket: 'Özet',
      tip: 'uzunMetin',
      satir: 3,
      yardim:
        'Testin neyi ölçtüğünü tek cümlede söyleyin; kartta ve arama sonucunda bu metin çıkar.',
    },
    {
      ad: 'kimlerCozmeli',
      etiket: 'Kimler çözmeli',
      tip: 'uzunMetin',
      satir: 2,
      yardim:
        'Hedef kitle ve gereken ön bilgi: "Veri bilimiyle uğraşanlar; teknik geçmiş gerekir."',
    },
    {
      ad: 'olculenBeceriler',
      etiket: 'Ölçülen beceriler',
      tip: 'metinDizisi',
      yardim:
        'Her satır bir beceri etiketi ("Metrik seçimi"). Sonuç ekranında beceri kırılımı bu listeden üretilir.',
    },
    {
      ad: 'ogrenmeHedefleri',
      etiket: 'Öğrenme hedefleri',
      tip: 'metinDizisi',
      yardim: 'Her satır bir hedef; fiille başlatın: "Veri sızıntısını işaretlerinden tanımak".',
    },
    ...SEO_ALANLARI,
  ],
};
