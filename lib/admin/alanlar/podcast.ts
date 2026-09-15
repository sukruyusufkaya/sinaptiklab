import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import {
  DURUM_ALANI,
  DURUM_SECENEKLERI,
  SEO_ALANLARI,
  SLUG_ALANI,
  type KoleksiyonYapilandirmasi,
} from '@/lib/admin/alanlar/tipler';

/**
 * Podcast bölümü: ses varlığının metin karşılığı.
 *
 * Ses dosyası tek başına arama ve GEO yüzeyinde görünmez; bölüm sayfasının
 * değeri dökümde ve zaman damgalarında. Bu yüzden `dokum` şemada zorunlu
 * olmasa da yayın akışında zorunlu kabul edilir (MASTER-PLAN §67).
 */
export const PODCAST_YAPILANDIRMASI: KoleksiyonYapilandirmasi = {
  koleksiyon: KOLEKSIYONLAR.podcast,
  ad: 'Podcast bölümü',
  cogul: 'Podcast bölümleri',
  aciklama:
    'Konuk konuşmaları. Her bölüm tam döküm ve bölüm zaman damgalarıyla yayımlanır; ses tek başına yeterli değildir.',
  anahtarAlan: 'slug',
  baslikAlani: 'ad',
  listeKolonlari: [
    { ad: 'numara', etiket: 'No', mono: true },
    { ad: 'ad', etiket: 'Bölüm', enCok: 60 },
    { ad: 'konuk', etiket: 'Konuk' },
    { ad: 'tarih', etiket: 'Tarih', mono: true },
    { ad: 'durum', etiket: 'Durum' },
  ],
  filtreler: [{ ad: 'durum', etiket: 'Durum', secenekler: DURUM_SECENEKLERI }],
  aramaAlanlari: ['ad', 'konuk', 'ozet', 'slug'],
  siralama: { numara: -1 },
  durumluMu: true,
  siteYolu: (belge) => (belge.slug ? `/podcast/${String(belge.slug)}/` : undefined),
  olusturulabilir: true,
  silinebilir: true,
  alanlar: [
    {
      ad: 'numara',
      etiket: 'Bölüm numarası',
      tip: 'sayi',
      zorunlu: true,
      enAz: 1,
      genislik: 'yarim',
      yardim: 'Yayın sırası. Tekildir: aynı numarayı ikinci bir bölüme veremezsiniz.',
    },
    {
      ad: 'ad',
      etiket: 'Bölüm adı',
      tip: 'metin',
      zorunlu: true,
      yardim:
        'Konuşmanın sorusunu yazın, konuk adını değil: "Değerlendirme kültürü neden geç kuruluyor?"',
    },
    SLUG_ALANI,
    {
      ad: 'konuk',
      etiket: 'Konuk',
      tip: 'metin',
      genislik: 'yarim',
      yardim: 'Konuğun adı. Kişi adı verilemiyorsa birim yazılır ("Araştırma birimi").',
    },
    {
      ad: 'konukUnvan',
      etiket: 'Konuk unvanı',
      tip: 'metin',
      genislik: 'yarim',
      yardim:
        'Konuğu neden dinlediğimizi açıklayan unvan: "Güvenlik araştırmacısı, X Laboratuvarı".',
    },
    {
      ad: 'tarih',
      etiket: 'Yayın tarihi',
      tip: 'tarih',
      zorunlu: true,
      genislik: 'yarim',
      yardim: 'Bölümün yayına girdiği gün. Arşiv sıralaması bu alandan gelir.',
    },
    {
      ad: 'dakika',
      etiket: 'Süre (dakika)',
      tip: 'sayi',
      enAz: 1,
      genislik: 'yarim',
      yardim: 'Kayıt süresi, tam dakikaya yuvarlanır. Kartta "48 dk" olarak görünür.',
    },
    DURUM_ALANI,
    {
      ad: 'ozet',
      etiket: 'Özet',
      tip: 'uzunMetin',
      satir: 3,
      yardim:
        'Bölümün hangi soruyu tarttığını iki cümlede söyleyin. Arşiv kartında ve paylaşımda bu metin çıkar.',
    },
    {
      ad: 'cikarimlar',
      etiket: 'Çıkarımlar',
      tip: 'metinDizisi',
      yardim:
        'Her satır, konuşmadan çıkan tek bir tam cümlelik yargı. Dinlemeden okunabilir olmalı; 2–4 satır yeterli.',
    },
    {
      ad: 'bolumler',
      etiket: 'Zaman damgaları',
      tip: 'nesneDizisi',
      yardim:
        'Kayıttaki geçiş noktaları. Saniye başlangıçtan itibaren sayılır; sıralı girin, dinleyici buradan atlayacak.',
      altAlanlar: [
        {
          ad: 'saniye',
          etiket: 'Saniye',
          tip: 'sayi',
          zorunlu: true,
          genislik: 'yarim',
          yardim: 'Başlangıçtan itibaren saniye. 12:30 için 750 yazılır.',
        },
        {
          ad: 'baslik',
          etiket: 'Başlık',
          tip: 'metin',
          zorunlu: true,
          genislik: 'yarim',
          yardim: 'O noktada konuşulan konu, en fazla birkaç kelime.',
        },
      ],
    },
    {
      ad: 'dokum',
      etiket: 'Döküm',
      tip: 'bloklar',
      yardim:
        'Konuşmanın tam metni. Döküm olmadan bölüm yayımlanamaz: ses aranabilir değildir, sayfanın tüm değeri bu metinde. Konuşmacı değişimlerini altbaşlık bloğuyla ayırın; ham otomatik çıktı düzeltilmeden bırakılmaz.',
    },
    {
      ad: 'sesMedyaKimligi',
      etiket: 'Ses medya kimliği',
      tip: 'metin',
      yardim: 'Ses dosyasının medya kütüphanesindeki kimliği. Oynatıcı bu kimlikle bağlanır.',
    },
    ...SEO_ALANLARI,
  ],
};
