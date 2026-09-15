import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import {
  DURUM_ALANI,
  DURUM_SECENEKLERI,
  KAYNAKLAR_ALANI,
  SEO_ALANLARI,
  SLUG_ALANI,
  type KoleksiyonYapilandirmasi,
} from '@/lib/admin/alanlar/tipler';

/**
 * En derin iç içe yapı: sayı → yazılar (nesne dizisi) → gövde blokları,
 * kaynaklar ve ilgili Atlas bağlantıları. Yazılar PDF içine gömülmez; her biri
 * `/dergi/<sayi>/<yazi>/` adresinde kendi sayfasını alır.
 */
export const DERGI_SAYILARI_YAPILANDIRMASI: KoleksiyonYapilandirmasi = {
  koleksiyon: KOLEKSIYONLAR.dergiSayilari,
  ad: 'Dergi sayısı',
  cogul: 'Dergi sayıları',
  aciklama:
    'Aylık sayılar ve içindeki yazılar. Sayı kabuğu künye taşır; okunan metin her yazının kendi gövdesindedir.',
  anahtarAlan: 'slug',
  baslikAlani: 'sayi',
  listeKolonlari: [
    { ad: 'sayi', etiket: 'Sayı' },
    { ad: 'kapakKonusu', etiket: 'Kapak konusu' },
    { ad: 'tarih', etiket: 'Tarih', mono: true },
    { ad: 'durum', etiket: 'Durum' },
    { ad: 'ozet', etiket: 'Özet', enCok: 60 },
  ],
  filtreler: [{ ad: 'durum', etiket: 'Durum', secenekler: DURUM_SECENEKLERI }],
  aramaAlanlari: ['sayi', 'kapakKonusu', 'ozet', 'slug', 'yazilar.baslik'],
  siralama: { tarih: -1 },
  durumluMu: true,
  siteYolu: (belge) => (belge.slug ? `/dergi/${String(belge.slug)}/` : undefined),
  olusturulabilir: true,
  silinebilir: true,
  alanlar: [
    SLUG_ALANI,
    {
      ad: 'sayi',
      etiket: 'Sayı adı',
      tip: 'metin',
      zorunlu: true,
      yardim: 'Okurun gördüğü ad: "2026 / Ekim". Slug ise "2026-ekim" olur.',
      genislik: 'yarim',
    },
    {
      ad: 'tarih',
      etiket: 'Yayın tarihi',
      tip: 'tarih',
      zorunlu: true,
      yardim: 'Sayının ilk günü (2026-10-01). Arşiv sıralaması bu alana göre yapılır.',
      genislik: 'yarim',
    },
    {
      ad: 'kapakKonusu',
      etiket: 'Kapak konusu',
      tip: 'metin',
      zorunlu: true,
      yardim: 'Sayının kapak dosyası başlığı; sayı sayfasının H1 metni olur.',
    },
    {
      ad: 'ozet',
      etiket: 'Özet',
      tip: 'uzunMetin',
      satir: 3,
      yardim:
        'Sayıda ne var? Arşiv kartında ve SEO açıklaması boşsa burada yazan metin kullanılır.',
    },
    DURUM_ALANI,
    {
      ad: 'yazilar',
      etiket: 'Yazılar',
      tip: 'nesneDizisi',
      yardim:
        'Sayının içindekiler listesi. Sıralama burada ne yazıyorsa sayfada da odur; her yazı kendi adresinde yayımlanır.',
      altAlanlar: [
        {
          ad: 'slug',
          etiket: 'Yazı slug',
          tip: 'slug',
          zorunlu: true,
          yardim: 'Adresin son parçası: /dergi/2026-ekim/<slug>/. Sayı içinde tekil olmalı.',
          genislik: 'yarim',
        },
        {
          ad: 'bolum',
          etiket: 'Bölüm',
          tip: 'metin',
          zorunlu: true,
          yardim: 'Kullanımdaki bölüm adları: Dosya, Görüş, Araştırma, Röportaj, Uygulama.',
          genislik: 'yarim',
        },
        {
          ad: 'baslik',
          etiket: 'Başlık',
          tip: 'metin',
          zorunlu: true,
          yardim: 'Yazının kendi başlığı; kapak konusunu tekrarlamayın.',
        },
        {
          ad: 'ozet',
          etiket: 'Özet',
          tip: 'uzunMetin',
          satir: 2,
          yardim: 'İçindekiler listesinde başlığın altında görünen tek cümle.',
        },
        {
          ad: 'yazarSlug',
          etiket: 'Yazar',
          tip: 'iliski',
          zorunlu: true,
          hedefKoleksiyon: KOLEKSIYONLAR.yazarlar,
          yardim: 'Künye imzası. Yazar kaydı yoksa önce yazarlar koleksiyonunda açın.',
          genislik: 'yarim',
        },
        {
          ad: 'okumaDakika',
          etiket: 'Okuma süresi (dakika)',
          tip: 'sayi',
          enAz: 1,
          yardim: 'Tam sayı dakika. Sayı sayfasındaki toplam süre bu alanların toplamıdır.',
          genislik: 'yarim',
        },
        {
          ad: 'govde',
          etiket: 'Gövde',
          tip: 'bloklar',
          yardim:
            'Yazının tam metni. Boş bırakılırsa içindekilerde görünür ama yazı sayfası boş açılır.',
        },
        KAYNAKLAR_ALANI,
        {
          ad: 'ilgiliAtlas',
          etiket: 'İlgili Atlas kavramları',
          tip: 'cokluIliski',
          hedefKoleksiyon: KOLEKSIYONLAR.atlas,
          yardim: 'Yazıda geçen kavramların slugları; yazı sayfasından Atlas girdilerine bağlanır.',
        },
      ],
    },
    ...SEO_ALANLARI,
  ],
};
