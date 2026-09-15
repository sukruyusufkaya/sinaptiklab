import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import {
  DURUM_ALANI,
  DURUM_SECENEKLERI,
  SEO_ALANLARI,
  SLUG_ALANI,
  SSS_ALANI,
  type KoleksiyonYapilandirmasi,
  type Secenek,
} from '@/lib/admin/alanlar/tipler';

/**
 * Sinaptik Research yayınları. Şemadaki `tur` enum'unun panel karşılığı;
 * arşiv sayfalarındaki tür listesiyle (`ARASTIRMA_TURLERI`) aynı altı değer.
 */
const TUR_SECENEKLERI: readonly Secenek[] = [
  { deger: 'Rapor', etiket: 'Rapor', tarif: 'Saha araştırması veya yıllık durum raporu.' },
  {
    deger: 'Benchmark',
    etiket: 'Benchmark',
    tarif: 'Metodolojisi yayımlanan karşılaştırmalı ölçüm.',
  },
  { deger: 'Veri Seti', etiket: 'Veri Seti', tarif: 'Lisansı ve üretim yöntemi belgelenmiş veri.' },
  { deger: 'Whitepaper', etiket: 'Whitepaper', tarif: 'Mimari veya yöntem dokümanı.' },
  { deger: 'Index', etiket: 'Index', tarif: 'Düzenli güncellenen endeks.' },
  { deger: 'Not', etiket: 'Not', tarif: 'Kısa yöntem veya gözlem notu (Research Note).' },
];

export const ARASTIRMA_YAPILANDIRMASI: KoleksiyonYapilandirmasi = {
  koleksiyon: KOLEKSIYONLAR.arastirma,
  ad: 'Araştırma yayını',
  cogul: 'Araştırma yayınları',
  aciklama:
    'Rapor, benchmark, veri seti, whitepaper, index ve not. Sınırlılık bölümü olmayan yayın onaylanmaz (metodoloji ilkesi).',
  anahtarAlan: 'slug',
  baslikAlani: 'baslik',
  listeKolonlari: [
    { ad: 'baslik', etiket: 'Yayın', enCok: 60 },
    { ad: 'tur', etiket: 'Tür', secenekler: TUR_SECENEKLERI },
    { ad: 'tarih', etiket: 'Tarih', mono: true },
    { ad: 'lisans', etiket: 'Lisans' },
    { ad: 'durum', etiket: 'Durum' },
  ],
  filtreler: [
    { ad: 'durum', etiket: 'Durum', secenekler: DURUM_SECENEKLERI },
    { ad: 'tur', etiket: 'Tür', secenekler: TUR_SECENEKLERI },
  ],
  aramaAlanlari: ['baslik', 'ozet', 'slug'],
  siralama: { tarih: -1 },
  durumluMu: true,
  siteYolu: (belge) => (belge.slug ? `/arastirma/${String(belge.slug)}/` : undefined),
  olusturulabilir: true,
  silinebilir: true,
  alanlar: [
    {
      ad: 'baslik',
      etiket: 'Yayın başlığı',
      tip: 'metin',
      zorunlu: true,
      yardim: 'Atıfta geçecek ad. Yayımlandıktan sonra değiştirilirse atıf formatı da güncellenir.',
    },
    SLUG_ALANI,
    {
      ad: 'tur',
      etiket: 'Tür',
      tip: 'secim',
      zorunlu: true,
      secenekler: TUR_SECENEKLERI,
      genislik: 'yarim',
      yardim: 'Yayının hangi tür arşivinde listeleneceğini belirler (/arastirma/benchmark/ gibi).',
    },
    DURUM_ALANI,
    {
      ad: 'ozet',
      etiket: 'Özet (answer-first)',
      tip: 'uzunMetin',
      zorunlu: true,
      satir: 3,
      yardim:
        'Yayının ne ölçtüğünü tek paragrafta söyleyin; kartlarda ve arama sonucunda bu metin görünür.',
    },
    {
      ad: 'tarih',
      etiket: 'Yayın tarihi',
      tip: 'tarih',
      zorunlu: true,
      genislik: 'yarim',
      yardim: 'Ölçümün yayımlandığı tarih. Tür arşivi bu alana göre sıralanır.',
    },
    {
      ad: 'veriNoktasi',
      etiket: 'Öne çıkan veri',
      tip: 'metin',
      genislik: 'yarim',
      yardim: 'Kartta büyük punto ile basılan kısa değer: "Yıllık", "7 boyut", "CC-BY".',
    },
    {
      ad: 'veriEtiketi',
      etiket: 'Veri etiketi',
      tip: 'metin',
      genislik: 'yarim',
      yardim:
        'Öne çıkan verinin altındaki açıklama: "Amiral gemisi rapor", "Metodoloji yayımlanır".',
    },
    {
      ad: 'yontem',
      etiket: 'Yöntem',
      tip: 'metinDizisi',
      yardim:
        'Her satır bir yöntem adımı: görev seti, örnekleme ayarları, puanlama, tekrar sayısı. Ölçüm tekrar üretilebilir olmalı.',
    },
    {
      ad: 'kapsam',
      etiket: 'Kapsam künyesi',
      tip: 'nesneDizisi',
      yardim: 'Sayfa başındaki künye tablosu. Etiket kısa tutulur: "Dönem" → "Yıllık".',
      altAlanlar: [
        {
          ad: 'etiket',
          etiket: 'Etiket',
          tip: 'metin',
          zorunlu: true,
          genislik: 'yarim',
          yardim: 'Ölçütün adı: Kapsam, Dönem, Dil, Lisans, Biçim.',
        },
        {
          ad: 'deger',
          etiket: 'Değer',
          tip: 'metin',
          zorunlu: true,
          genislik: 'yarim',
          yardim: 'Ölçütün karşılığı: Türkiye, Yıllık, Türkçe, CC BY 4.0, JSONL.',
        },
      ],
    },
    {
      ad: 'bulgular',
      etiket: 'Bulgular',
      tip: 'metinDizisi',
      yardim:
        'Her satır tek bir bulgu; veriden okunabilen bir iddia olsun. Yorum ve öneri gövdeye yazılır.',
    },
    {
      ad: 'sinirliliklar',
      etiket: 'Sınırlılıklar',
      tip: 'metinDizisi',
      zorunlu: true,
      enAz: 1,
      yardim:
        'ZORUNLU, en az bir madde: sonucun ne söylemediğini yazın (örneklem yanlılığı, ölçüm tarihi, kapsam dışı bırakılanlar). Sınırlılık bölümü olmayan yayın onaylanmaz.',
    },
    {
      ad: 'atifFormati',
      etiket: 'Atıf formatı',
      tip: 'metin',
      yardim:
        'Başkalarının kopyalayacağı satır: Sinaptik Research, "Yayın adı", Sinaptik Lab, 2026.',
    },
    {
      ad: 'lisans',
      etiket: 'Lisans',
      tip: 'metin',
      genislik: 'yarim',
      yardim: 'Yeniden kullanım koşulu, örneğin CC BY 4.0. Veri setlerinde boş bırakılmaz.',
    },
    {
      ad: 'govde',
      etiket: 'Gövde',
      tip: 'bloklar',
      yardim:
        'Şablon: yönetici özeti → yöntem → bulgular → tablolar → sınırlılıklar → sonuç. Sayı içeren her blok tarih ve sürüm bilgisi taşır.',
    },
    SSS_ALANI,
    {
      ad: 'ekler',
      etiket: 'Ekler',
      tip: 'nesneDizisi',
      yardim: 'İndirilebilir dosyalar (PDF, CSV, JSONL). Dosya medya kütüphanesine yüklenir.',
      altAlanlar: [
        {
          ad: 'ad',
          etiket: 'Ek adı',
          tip: 'metin',
          zorunlu: true,
          yardim: 'İndirme bağlantısında görünen ad: "Ham anket verisi (CSV)".',
        },
        {
          ad: 'tur',
          etiket: 'Dosya türü',
          tip: 'metin',
          zorunlu: true,
          genislik: 'yarim',
          yardim: 'Uzantı veya MIME karşılığı: pdf, csv, jsonl, xlsx.',
        },
        {
          ad: 'medyaKimligi',
          etiket: 'Medya kimliği',
          tip: 'metin',
          genislik: 'yarim',
          yardim: 'Medya kütüphanesindeki kayıt kimliği; dosya adı değil.',
        },
        {
          ad: 'boyutBayt',
          etiket: 'Boyut (bayt)',
          tip: 'sayi',
          enAz: 0,
          genislik: 'yarim',
          yardim: 'Bağlantının yanında okunabilir boyuta çevrilir. Yükleme sırasında doldurulur.',
        },
      ],
    },
    ...SEO_ALANLARI,
  ],
};
