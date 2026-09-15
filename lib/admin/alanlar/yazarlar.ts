import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import {
  DURUM_ALANI,
  DURUM_SECENEKLERI,
  SEO_ALANLARI,
  SLUG_ALANI,
  type KoleksiyonYapilandirmasi,
} from '@/lib/admin/alanlar/tipler';

/**
 * Yazar künyeleri. İçerik koleksiyonlarındaki `yazarSlug` ve `inceleyenSlug`
 * alanları buraya bağlanır; gövde, SSS ve kaynak alanı yoktur. SEO alanları
 * /yazar/<slug>/ sayfasının arama ve paylaşım başlığını yönetir.
 *
 * Şema yalnızca slug, ad, unvan ve basHarfler alanlarını `required` sayar ama
 * özgeçmiş ve uzmanlık alanı boş bırakılan bir künye E-E-A-T açısından imzasız
 * içerik üretir — yardım metinleri bunu editöre söyler.
 */
export const YAZARLAR_YAPILANDIRMASI: KoleksiyonYapilandirmasi = {
  koleksiyon: KOLEKSIYONLAR.yazarlar,
  ad: 'Yazar',
  cogul: 'Yazarlar',
  aciklama:
    'Yazar ve editör künyeleri. Her içeriğin imzası buradan gelir; özgeçmiş ve uzmanlık alanları E-E-A-T için doldurulur.',
  anahtarAlan: 'slug',
  baslikAlani: 'ad',
  listeKolonlari: [
    { ad: 'ad', etiket: 'Ad' },
    { ad: 'unvan', etiket: 'Unvan', enCok: 40 },
    { ad: 'basHarfler', etiket: 'Baş harf', mono: true },
    { ad: 'uzmanlik', etiket: 'Uzmanlık', enCok: 48 },
    { ad: 'durum', etiket: 'Durum' },
  ],
  filtreler: [{ ad: 'durum', etiket: 'Durum', secenekler: DURUM_SECENEKLERI }],
  aramaAlanlari: ['ad', 'unvan', 'ozgecmis', 'slug'],
  siralama: { ad: 1 },
  durumluMu: true,
  siteYolu: (belge) => (belge.slug ? `/yazar/${String(belge.slug)}/` : undefined),
  olusturulabilir: true,
  silinebilir: true,
  alanlar: [
    {
      ad: 'ad',
      etiket: 'Ad',
      tip: 'metin',
      zorunlu: true,
      yardim: 'Künyede görünecek tam ad. Ekip hesaplarında birim adı yazılır (Sinaptik Research).',
      genislik: 'yarim',
    },
    SLUG_ALANI,
    {
      ad: 'unvan',
      etiket: 'Unvan',
      tip: 'metin',
      zorunlu: true,
      yardim: 'Rol ve sorumluluk: "Kurucu & Genel Yayın Yönetmeni", "Haber Masası".',
      genislik: 'yarim',
    },
    {
      ad: 'basHarfler',
      etiket: 'Baş harfler',
      tip: 'metin',
      zorunlu: true,
      enCok: 4,
      yardim: 'Avatar yerine basılan kısaltma; ad ve soyadın ilk harfleri. En fazla 4 karakter.',
      genislik: 'yarim',
    },
    DURUM_ALANI,
    {
      ad: 'ozgecmis',
      etiket: 'Özgeçmiş',
      tip: 'uzunMetin',
      satir: 4,
      yardim:
        'E-E-A-T için zorunlu sayın: bu kişiyi bu konuda yazmaya yetkili kılan deneyimi iki üç cümlede anlatın. Yazar sayfasında ve içerik altındaki imza şeridinde görünür.',
    },
    {
      ad: 'uzmanlik',
      etiket: 'Uzmanlık alanları',
      tip: 'metinDizisi',
      yardim:
        'E-E-A-T için zorunlu sayın: her satıra bir alan yazın ("Benchmark tasarımı"). Boş bırakılan künye imzasız içerik üretir.',
    },
    {
      ad: 'sosyal',
      etiket: 'Sosyal bağlantılar',
      tip: 'nesneDizisi',
      yardim: 'Doğrulanabilir profiller. Kişisel hesap yoksa kurum hesabı verilir.',
      altAlanlar: [
        {
          ad: 'etiket',
          etiket: 'Etiket',
          tip: 'metin',
          zorunlu: true,
          yardim: 'Platform adı: LinkedIn, X, GitHub.',
          genislik: 'yarim',
        },
        {
          ad: 'adres',
          etiket: 'Adres',
          tip: 'metin',
          zorunlu: true,
          yardim: 'Profilin tam adresi; https:// ile başlar.',
          genislik: 'yarim',
        },
      ],
    },
    ...SEO_ALANLARI,
  ],
};
