import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import {
  KAYNAKLAR_ALANI,
  DURUM_ALANI,
  DURUM_SECENEKLERI,
  SEO_ALANLARI,
  SLUG_ALANI,
  SON_DOGRULAMA_ALANI,
  type KoleksiyonYapilandirmasi,
  type Secenek,
} from '@/lib/admin/alanlar/tipler';

/**
 * Şirket kayıtları varlıktır, makale değil: kalıcı adres, künye bilgisi ve
 * kilometre taşları taşır. Gövde, SSS ve sürüm geçmişi alanları şemada yok.
 *
 * `tur` şemada serbest metindir (enum değil); aşağıdaki liste yalnızca listeyi
 * süzmek için kullanılan, hâlihazırda yayında olan değerlerdir.
 */
const TUR_SECENEKLERI: readonly Secenek[] = [
  { deger: 'Araştırma ve ürün şirketi', etiket: 'Araştırma ve ürün şirketi' },
  { deger: 'Araştırma birimi', etiket: 'Araştırma birimi' },
  { deger: 'Teknoloji şirketi', etiket: 'Teknoloji şirketi' },
  { deger: 'Donanım ve yazılım şirketi', etiket: 'Donanım ve yazılım şirketi' },
  { deger: 'Platform şirketi', etiket: 'Platform şirketi' },
];

export const SIRKETLER_YAPILANDIRMASI: KoleksiyonYapilandirmasi = {
  koleksiyon: KOLEKSIYONLAR.sirketler,
  ad: 'Şirket',
  cogul: 'Şirketler',
  aciklama:
    'Yapay zekâ şirketleri ve kuruluşları. Model kayıtlarına bağlanır; sağlayıcı künyesinin tek kaynağıdır.',
  anahtarAlan: 'slug',
  baslikAlani: 'ad',
  listeKolonlari: [
    { ad: 'ad', etiket: 'Şirket' },
    { ad: 'tur', etiket: 'Tür', enCok: 30, secenekler: TUR_SECENEKLERI },
    { ad: 'merkez', etiket: 'Merkez', enCok: 30 },
    { ad: 'sonDogrulama', etiket: 'Doğrulama', mono: true },
    { ad: 'durum', etiket: 'Durum' },
  ],
  filtreler: [
    { ad: 'durum', etiket: 'Durum', secenekler: DURUM_SECENEKLERI },
    { ad: 'tur', etiket: 'Tür', secenekler: TUR_SECENEKLERI },
  ],
  aramaAlanlari: ['ad', 'slug', 'ozet', 'alan'],
  siralama: { ad: 1 },
  durumluMu: true,
  siteYolu: (belge) => (belge.slug ? `/sirketler/${String(belge.slug)}/` : undefined),
  olusturulabilir: true,
  silinebilir: true,
  alanlar: [
    {
      ad: 'ad',
      etiket: 'Şirket adı',
      tip: 'metin',
      zorunlu: true,
      yardim: 'Kuruluşun kendi yazdığı biçim: "Google DeepMind", "Hugging Face".',
      genislik: 'yarim',
    },
    SLUG_ALANI,
    {
      ad: 'tur',
      etiket: 'Tür',
      tip: 'metin',
      zorunlu: true,
      yardim:
        'Kuruluşun niteliği: "Araştırma ve ürün şirketi", "Araştırma birimi", "Platform şirketi". Yeni bir tür uydurmadan önce listedeki karşılıklara bakın.',
      genislik: 'yarim',
    },
    {
      ad: 'merkez',
      etiket: 'Merkez',
      tip: 'metin',
      yardim: 'Şehir ve ülke, virgülle: "San Francisco, ABD".',
      genislik: 'yarim',
    },
    {
      ad: 'kurulus',
      etiket: 'Kuruluş yılı',
      tip: 'metin',
      yardim: 'Yalnızca yıl yazılır: 2015. Satın alınan birimlerde kendi kuruluş yılı esastır.',
      genislik: 'yarim',
    },
    {
      ad: 'alan',
      etiket: 'Çalışma alanı',
      tip: 'metin',
      yardim:
        'Tek satırda odak: "Güvenlik odaklı büyük dil modelleri". Kartlarda ve listelerde bu satır görünür.',
    },
    {
      ad: 'ozet',
      etiket: 'Özet (answer-first)',
      tip: 'uzunMetin',
      satir: 3,
      yardim:
        'İki cümle: şirket ne yapar ve neyle bilinir. Alıntılanabilir olmalı; pazarlama dili kullanılmaz.',
    },
    {
      ad: 'urunler',
      etiket: 'Ürünler',
      tip: 'metinDizisi',
      yardim: 'Her satıra bir ürün ailesi: "Claude model ailesi", "Geliştirici API".',
    },
    {
      ad: 'modelSluglari',
      etiket: 'Modelleri',
      tip: 'cokluIliski',
      hedefKoleksiyon: KOLEKSIYONLAR.modeller,
      yardim:
        'Bu şirkete ait model kayıtları. Model sayfasındaki sağlayıcı bağlantısı bu eşleşmeden kurulur.',
    },
    {
      ad: 'kilometreTaslari',
      etiket: 'Kilometre taşları',
      tip: 'nesneDizisi',
      yardim: 'Kronolojik sırayla, en fazla 5–6 dönüm noktası. Ürün duyurusu değil, kurumsal eşik.',
      altAlanlar: [
        {
          ad: 'tarih',
          etiket: 'Tarih',
          tip: 'metin',
          zorunlu: true,
          yardim: 'Yıl yeterlidir (2021); gün belliyse YYYY-AA-GG yazılabilir.',
          genislik: 'yarim',
        },
        {
          ad: 'olay',
          etiket: 'Olay',
          tip: 'metin',
          zorunlu: true,
          yardim: 'Tek cümle, noktayla biter: "Google tarafından satın alındı."',
        },
      ],
    },
    DURUM_ALANI,
    // Kuruluş yılı, merkez ve kilometre taşlarının dayanağı (§59).
    KAYNAKLAR_ALANI,
    SON_DOGRULAMA_ALANI,
    ...SEO_ALANLARI,
  ],
};
