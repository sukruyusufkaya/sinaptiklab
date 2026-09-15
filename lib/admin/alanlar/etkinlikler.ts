import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import {
  DURUM_ALANI,
  DURUM_SECENEKLERI,
  SEO_ALANLARI,
  SLUG_ALANI,
  type KoleksiyonYapilandirmasi,
  type Secenek,
} from '@/lib/admin/alanlar/tipler';

/** Etkinliğin formatı; şemadaki `tur` enum'unun panel karşılığı. */
const TUR_SECENEKLERI: readonly Secenek[] = [
  { deger: 'Webinar', etiket: 'Webinar', tarif: 'Çevrim içi, tek oturumlu anlatım.' },
  { deger: 'Workshop', etiket: 'Workshop', tarif: 'Uygulamalı atölye; katılımcı sayısı sınırlı.' },
  { deger: 'Meetup', etiket: 'Meetup', tarif: 'Kapalı veya açık buluşma.' },
  { deger: 'Konferans', etiket: 'Konferans', tarif: 'Çok oturumlu, tam günlük program.' },
];

/**
 * Takvim durumu — yayın akışı `durum` alanından AYRIDIR.
 * `durum` girdinin sitede görünüp görünmediğini, `etkinlikDurumu` etkinliğin
 * kayıt/takvim aşamasını anlatır. Yayında olan bir etkinlik "iptal" olabilir.
 */
const ETKINLIK_DURUMU_SECENEKLERI: readonly Secenek[] = [
  { deger: 'planlandi', etiket: 'Planlandı', tarif: 'Tarih belli, kayıt henüz açılmadı.' },
  { deger: 'kayit-acik', etiket: 'Kayıt açık', tarif: 'Kayıt adresi doldurulmuş olmalı.' },
  { deger: 'gecti', etiket: 'Geçti', tarif: 'Arşiv listesine düşer.' },
  { deger: 'iptal', etiket: 'İptal', tarif: 'Sayfa korunur, kayıt bağlantısı kapatılır.' },
];

export const ETKINLIKLER_YAPILANDIRMASI: KoleksiyonYapilandirmasi = {
  koleksiyon: KOLEKSIYONLAR.etkinlikler,
  ad: 'Etkinlik',
  cogul: 'Etkinlikler',
  aciklama:
    'Webinar, atölye, meetup ve konferans kayıtları. Takvim durumu (planlandı/kayıt açık/geçti/iptal) yayın durumundan ayrı tutulur.',
  anahtarAlan: 'slug',
  baslikAlani: 'ad',
  listeKolonlari: [
    { ad: 'ad', etiket: 'Etkinlik' },
    { ad: 'tur', etiket: 'Tür', secenekler: TUR_SECENEKLERI },
    { ad: 'tarih', etiket: 'Tarih', mono: true },
    { ad: 'etkinlikDurumu', etiket: 'Takvim', secenekler: ETKINLIK_DURUMU_SECENEKLERI },
    { ad: 'durum', etiket: 'Durum' },
  ],
  filtreler: [
    { ad: 'durum', etiket: 'Durum', secenekler: DURUM_SECENEKLERI },
    { ad: 'tur', etiket: 'Tür', secenekler: TUR_SECENEKLERI },
    { ad: 'etkinlikDurumu', etiket: 'Takvim durumu', secenekler: ETKINLIK_DURUMU_SECENEKLERI },
  ],
  aramaAlanlari: ['ad', 'ozet', 'yer', 'slug'],
  siralama: { tarih: -1 },
  durumluMu: true,
  siteYolu: (belge) => (belge.slug ? `/etkinlikler/${String(belge.slug)}/` : undefined),
  olusturulabilir: true,
  silinebilir: true,
  alanlar: [
    {
      ad: 'ad',
      etiket: 'Etkinlik adı',
      tip: 'metin',
      zorunlu: true,
      yardim: 'Duyuruda görünen ad. Yıl yazmayın; tarih alanı zaten gösterilir.',
      genislik: 'yarim',
    },
    SLUG_ALANI,
    {
      ad: 'tur',
      etiket: 'Tür',
      tip: 'secim',
      zorunlu: true,
      secenekler: TUR_SECENEKLERI,
      yardim: 'Format seçimi listeleme ve filtrelemeyi belirler.',
      genislik: 'yarim',
    },
    {
      ad: 'tarih',
      etiket: 'Tarih',
      tip: 'tarih',
      zorunlu: true,
      yardim: 'YYYY-AA-GG. Takvim sıralaması ve sitemap tarihi bu alandan gelir.',
      genislik: 'yarim',
    },
    {
      ad: 'baslangicZamani',
      etiket: 'Başlangıç zamanı',
      tip: 'zaman',
      yardim: 'Saat dahil başlangıç. Doldurulursa etkinlik şemasına saat bilgisi de yazılır.',
      genislik: 'yarim',
    },
    {
      ad: 'bicim',
      etiket: 'Biçim',
      tip: 'metin',
      yardim: 'Kartta görünen kısa satır: "Çevrim içi · 90 dakika" veya "İstanbul · Tam gün".',
      genislik: 'yarim',
    },
    {
      ad: 'yer',
      etiket: 'Yer',
      tip: 'metin',
      yardim: 'Yüz yüze etkinlikte mekân ve ilçe; çevrim içi ise platform adı.',
      genislik: 'yarim',
    },
    {
      ad: 'ozet',
      etiket: 'Özet',
      tip: 'uzunMetin',
      satir: 3,
      yardim:
        'Katılımcının ne öğreneceğini iki cümlede söyleyin. Kartta ve SEO açıklamasında kullanılır.',
    },
    {
      ad: 'etkinlikDurumu',
      etiket: 'Takvim durumu',
      tip: 'secim',
      zorunlu: true,
      secenekler: ETKINLIK_DURUMU_SECENEKLERI,
      varsayilan: 'planlandi',
      yardim: 'Yayın durumundan ayrıdır: "Yayında" bir etkinlik aynı anda "İptal" olabilir.',
      genislik: 'yarim',
    },
    {
      ad: 'kayitAdresi',
      etiket: 'Kayıt adresi',
      tip: 'metin',
      yardim:
        'Kayıt formunun tam adresi (https:// ile). Takvim durumu "Kayıt açık" ise zorunludur.',
      genislik: 'yarim',
    },
    {
      ad: 'kapasite',
      etiket: 'Kapasite',
      tip: 'sayi',
      enAz: 1,
      yardim: 'Kontenjan sınırı varsa katılımcı sayısı. Sınırsızsa boş bırakın.',
      genislik: 'yarim',
    },
    {
      ad: 'konusmacilar',
      etiket: 'Konuşmacılar',
      tip: 'cokluIliski',
      hedefKoleksiyon: KOLEKSIYONLAR.uzmanlar,
      yardim: 'Uzman kayıtlarının slugları. Etkinlik sayfasında uzman profillerine bağlanır.',
    },
    DURUM_ALANI,
    ...SEO_ALANLARI,
  ],
};
