import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import {
  DURUM_ALANI,
  DURUM_SECENEKLERI,
  SEO_ALANLARI,
  type KoleksiyonYapilandirmasi,
} from '@/lib/admin/alanlar/tipler';

/**
 * Sinaptik Brief: günde bir sayı, beş madde.
 *
 * Kimlik alanı `slug` değil `tarih`: bir güne yalnızca bir sayı düşer ve
 * şemadaki `tarih_tekil` dizini bunu veritabanı seviyesinde zorlar. Bu yüzden
 * `SLUG_ALANI` bu koleksiyonda kullanılmaz.
 *
 * Bülten gönderimi bu kayıttan türetildiği için `gonderimZamani` yayın akışının
 * parçasıdır: doldurulmuş bir kayıt e-postayla dağıtılmış sayılır.
 */
export const BRIEFLER_YAPILANDIRMASI: KoleksiyonYapilandirmasi = {
  koleksiyon: KOLEKSIYONLAR.briefler,
  ad: 'Brief sayısı',
  cogul: 'Brief sayıları',
  aciklama:
    'Günlük beş maddelik özet. Her madde ne olduğunu değil neden önemli olduğunu söyler ve kaynağını yanında taşır.',
  anahtarAlan: 'tarih',
  baslikAlani: 'baslik',
  listeKolonlari: [
    { ad: 'tarih', etiket: 'Tarih', mono: true },
    { ad: 'baslik', etiket: 'Sayı başlığı', enCok: 70 },
    { ad: 'durum', etiket: 'Durum' },
    { ad: 'gonderimZamani', etiket: 'Gönderim', mono: true },
  ],
  filtreler: [{ ad: 'durum', etiket: 'Durum', secenekler: DURUM_SECENEKLERI }],
  aramaAlanlari: ['baslik', 'tarih', 'maddeler.baslik'],
  siralama: { tarih: -1 },
  durumluMu: true,
  /**
   * Sayı başına kalıcı adres henüz yayında değil; site yalnızca `/brief/`
   * altında günün sayısını gösteriyor. Arşiv rotası açıldığında bu yol
   * tarihe göre üretilecek.
   */
  siteYolu: () => '/brief/',
  olusturulabilir: true,
  silinebilir: true,
  alanlar: [
    {
      ad: 'tarih',
      etiket: 'Sayı tarihi',
      tip: 'tarih',
      zorunlu: true,
      genislik: 'yarim',
      yardim:
        'Sayının ait olduğu gün. Kaydın kimliği bu alandır: aynı güne ikinci bir sayı açılamaz.',
    },
    DURUM_ALANI,
    {
      ad: 'baslik',
      etiket: 'Sayı başlığı',
      tip: 'metin',
      zorunlu: true,
      yardim:
        'Günün iki baskın başlığını tek satırda birleştirin: "Regülasyon takvimi ve humanoid saha testleri". Arşiv listesinde bu metin görünür.',
    },
    {
      ad: 'gonderimZamani',
      etiket: 'Bülten gönderim zamanı',
      tip: 'zaman',
      yardim:
        'Sayı e-postayla dağıtıldığında işaretlenir. Boşsa gönderim yapılmamış sayılır; geçmiş bir zaman elle yazılmaz.',
    },
    {
      ad: 'maddeler',
      etiket: 'Maddeler',
      tip: 'nesneDizisi',
      zorunlu: true,
      enAz: 1,
      yardim:
        'Sayının gövdesi. Hedef beş madde; en az bir madde olmadan sayı kaydedilemez. Sıra okuma sırasıdır, önem sırası değil.',
      altAlanlar: [
        {
          ad: 'numara',
          etiket: 'Madde numarası',
          tip: 'metin',
          zorunlu: true,
          genislik: 'yarim',
          yardim: 'İki haneli yazılır: 01, 02, 03. Sayfada tek başına görünür.',
        },
        {
          ad: 'kaynak',
          etiket: 'Kaynak',
          tip: 'metin',
          genislik: 'yarim',
          yardim:
            'Maddenin dayandığı yer: "Resmî mevzuat metni", "Ürün dokümantasyonu". Kaynağı olmayan madde yayımlanmaz.',
        },
        {
          ad: 'baslik',
          etiket: 'Madde başlığı',
          tip: 'metin',
          zorunlu: true,
          yardim:
            'Gelişmeyi tek cümlede bildirin, soru sormayın: "Vektör veritabanlarında hibrit arama varsayılan hale geliyor".',
        },
        {
          ad: 'neden',
          etiket: 'Neden önemli',
          tip: 'uzunMetin',
          zorunlu: true,
          satir: 2,
          yardim:
            'Haberi tekrar etmeyin; okuyucunun kararını nasıl değiştirdiğini yazın. Bir ya da iki cümle.',
        },
        {
          ad: 'konuSlug',
          etiket: 'Konu',
          tip: 'iliski',
          hedefKoleksiyon: KOLEKSIYONLAR.konular,
          genislik: 'yarim',
          yardim: 'Madde başlığı bu konu merkezine bağlanır. Her maddeye bir konu verin.',
        },
        {
          ad: 'icerikSlug',
          etiket: 'İlgili içerik',
          tip: 'iliski',
          hedefKoleksiyon: KOLEKSIYONLAR.icerikler,
          genislik: 'yarim',
          yardim:
            'Aynı gelişmeyi ayrıntılı işleyen haber veya analiz varsa seçin. Yoksa boş bırakın.',
        },
      ],
    },
    ...SEO_ALANLARI,
  ],
};
