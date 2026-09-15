import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import {
  DURUM_ALANI,
  DURUM_SECENEKLERI,
  KAYNAKLAR_ALANI,
  SEO_ALANLARI,
  SEVIYE_SECENEKLERI,
  SLUG_ALANI,
  SSS_ALANI,
  type Alan,
  type KoleksiyonYapilandirmasi,
  type Secenek,
} from '@/lib/admin/alanlar/tipler';

/**
 * Platformun en geniş koleksiyonu: tüm editoryal formatlar burada durur.
 * Formatı `tur`, konuyu `konuSlug` belirler (MASTER-PLAN §9) — yani "rehber"
 * ayrı bir koleksiyon değil, bu koleksiyonun bir türü. Bu yüzden bazı alanlar
 * yalnızca belirli türlerde doldurulur: `adimListesi`, `onKosullar`, `araclar`,
 * `kontrolListesi` ve `tuzaklar` rehber formatının parçalarıdır.
 */

const TUR_SECENEKLERI: readonly Secenek[] = [
  { deger: 'haber', etiket: 'Haber', tarif: 'Ne oldu → neden önemli → teknik detay → yorum.' },
  { deger: 'analiz', etiket: 'Analiz', tarif: 'Tez → bağlam → kanıt → karşı görüş → ne yapmalı.' },
  { deger: 'rehber', etiket: 'Rehber', tarif: 'Adım listesi, tuzaklar ve kontrol listesi taşır.' },
  { deger: 'gorus', etiket: 'Görüş', tarif: 'İmzalı yorum; kanıt yükü yazarın üzerindedir.' },
  {
    deger: 'roportaj',
    etiket: 'Röportaj',
    tarif: 'Soru-cevap; konuşulan kişi künyede belirtilir.',
  },
  { deger: 'uygulama', etiket: 'Uygulama', tarif: 'Somut bir kurulumun uçtan uca anlatımı.' },
  { deger: 'vaka', etiket: 'Vaka', tarif: 'Sahadaki bir işin problem–çözüm–sonuç aktarımı.' },
];

/** Türe göre kanonik yol: `yol` alanı ile aynı kuralı izler. */
const TUR_YOLLARI: Record<string, string> = {
  haber: 'haber',
  analiz: 'analiz',
  gorus: 'analiz',
  roportaj: 'analiz',
  rehber: 'rehber',
};

const ADIM_LISTESI_ALANI: Alan = {
  ad: 'adimListesi',
  etiket: 'Adım listesi (rehber)',
  tip: 'nesneDizisi',
  yardim:
    'Yalnızca rehber türünde doldurulur. Adım adı emir kipiyle yazılır ("Kaynakları envanterle"); özet tek cümledir.',
  altAlanlar: [
    {
      ad: 'ad',
      etiket: 'Adım adı',
      tip: 'metin',
      zorunlu: true,
      yardim: 'Emir kipi, tek satır: "Ayrıştırma hattını kur".',
    },
    {
      ad: 'ozet',
      etiket: 'Özet',
      tip: 'uzunMetin',
      zorunlu: true,
      satir: 2,
      yardim: 'Adımın tek cümlelik karşılığı. Adım kartında bu metin görünür.',
    },
    {
      ad: 'ayrinti',
      etiket: 'Ayrıntı',
      tip: 'bloklar',
      yardim: 'Adımın uzun anlatımı. Boşsa adım yalnızca özetiyle görünür.',
    },
  ],
};

const TUZAKLAR_ALANI: Alan = {
  ad: 'tuzaklar',
  etiket: 'Tuzaklar',
  tip: 'nesneDizisi',
  yardim: 'Sahada en sık düşülen hatalar. Genel tavsiye değil, gözlenmiş hata yazılır.',
  altAlanlar: [
    {
      ad: 'baslik',
      etiket: 'Tuzak',
      tip: 'metin',
      zorunlu: true,
      yardim: 'Hatanın kısa adı: "Erişim denetimini isteme bırakmak".',
    },
    {
      ad: 'aciklama',
      etiket: 'Açıklama',
      tip: 'uzunMetin',
      zorunlu: true,
      satir: 2,
      yardim: 'Neden yanlış ve yerine ne yapılmalı.',
    },
  ],
};

export const ICERIKLER_YAPILANDIRMASI: KoleksiyonYapilandirmasi = {
  koleksiyon: KOLEKSIYONLAR.icerikler,
  ad: 'İçerik',
  cogul: 'İçerikler',
  aciklama:
    'Tüm editoryal formatlar tek koleksiyonda: haber, analiz, rehber, görüş, röportaj, uygulama, vaka. Formatı `tur`, konuyu `konuSlug` belirler (MASTER-PLAN §9).',
  anahtarAlan: 'slug',
  baslikAlani: 'baslik',
  listeKolonlari: [
    { ad: 'baslik', etiket: 'Başlık', enCok: 70 },
    { ad: 'tur', etiket: 'Tür', secenekler: TUR_SECENEKLERI },
    { ad: 'konuSlug', etiket: 'Konu' },
    { ad: 'yayinTarihi', etiket: 'Yayın', mono: true },
    { ad: 'durum', etiket: 'Durum' },
  ],
  filtreler: [
    { ad: 'durum', etiket: 'Durum', secenekler: DURUM_SECENEKLERI },
    { ad: 'tur', etiket: 'Tür', secenekler: TUR_SECENEKLERI },
    { ad: 'seviye', etiket: 'Seviye', secenekler: SEVIYE_SECENEKLERI },
  ],
  aramaAlanlari: ['baslik', 'kisaCevap', 'ozet', 'slug'],
  siralama: { yayinTarihi: -1 },
  durumluMu: true,
  siteYolu: (belge) => {
    const parca = TUR_YOLLARI[String(belge.tur)];
    if (!parca || !belge.slug) return undefined;
    return `/${parca}/${String(belge.slug)}/`;
  },
  olusturulabilir: true,
  silinebilir: true,
  alanlar: [
    {
      ad: 'baslik',
      etiket: 'Başlık',
      tip: 'metin',
      zorunlu: true,
      enAz: 8,
      enCok: 160,
      yardim:
        'Sayfanın H1 metni. Tıklama yemi değil, ne olduğunu söyleyen başlık (8–160 karakter).',
    },
    SLUG_ALANI,
    {
      ad: 'tur',
      etiket: 'Tür',
      tip: 'secim',
      zorunlu: true,
      secenekler: TUR_SECENEKLERI,
      genislik: 'yarim',
      yardim: 'Format seçimi. Adresi ve şablonu bu alan belirler; konuyla karıştırılmaz.',
    },
    {
      ad: 'yol',
      etiket: 'Kanonik yol',
      tip: 'metin',
      genislik: 'yarim',
      yardim:
        'Türden türetilir: haber → /haber/<slug>/, analiz|görüş|röportaj → /analiz/<slug>/, rehber → /rehber/<slug>/. Sondaki eğik çizgi zorunlu, tarih içermez.',
    },
    {
      ad: 'kisaCevap',
      etiket: 'Kısa cevap (answer-first)',
      tip: 'uzunMetin',
      zorunlu: true,
      satir: 3,
      enAz: 40,
      enCok: 600,
      yardim:
        'Başlıktaki sorunun tek cümlelik, alıntılanabilir cevabı. Bağlam cümlesi değil sonuç yazılır (40–600 karakter, §56).',
    },
    {
      ad: 'ozet',
      etiket: 'Özet',
      tip: 'uzunMetin',
      satir: 3,
      yardim: 'Liste ve kartlarda görünen iki-üç cümlelik giriş. Kısa cevabı tekrar etmez.',
    },
    {
      ad: 'konuSlug',
      etiket: 'Konu',
      tip: 'iliski',
      zorunlu: true,
      hedefKoleksiyon: KOLEKSIYONLAR.konular,
      genislik: 'yarim',
      yardim: 'İçeriğin bağlandığı konu merkezi. Tek konu seçilir; format bilgisi buraya yazılmaz.',
    },
    {
      ad: 'yazarSlug',
      etiket: 'Yazar',
      tip: 'iliski',
      zorunlu: true,
      hedefKoleksiyon: KOLEKSIYONLAR.yazarlar,
      genislik: 'yarim',
      yardim: 'Künyede görünen imza. Yazar kaydı yoksa önce yazar künyesi açılır.',
    },
    {
      ad: 'inceleyenSlug',
      etiket: 'Teknik inceleyen',
      tip: 'iliski',
      hedefKoleksiyon: KOLEKSIYONLAR.yazarlar,
      genislik: 'yarim',
      yardim: 'Teknik iddia taşıyan içerikte ikinci göz. Sayfada "inceleyen" olarak görünür.',
    },
    {
      ad: 'seviye',
      etiket: 'Seviye',
      tip: 'secim',
      secenekler: SEVIYE_SECENEKLERI,
      genislik: 'yarim',
      yardim: 'Okurun ön bilgi ihtiyacı. Rehber ve uygulamada doldurulur, haberde genellikle boş.',
    },
    DURUM_ALANI,
    {
      ad: 'oneCikan',
      etiket: 'Öne çıkan',
      tip: 'mantik',
      genislik: 'yarim',
      yardim: 'Ana sayfa ve konu merkezinde manşet bandına alınır. Aynı anda az sayıda içerik.',
    },
    {
      ad: 'etiketler',
      etiket: 'Etiketler',
      tip: 'metinDizisi',
      yardim:
        'Görünen ad yazılır ("Tool use"). Konunun alt kırılımı için kullanılır, konu yerine geçmez.',
    },
    {
      ad: 'yayinTarihi',
      etiket: 'Yayın tarihi',
      tip: 'tarih',
      genislik: 'yarim',
      yardim: 'Akış sıralaması bu alana göre yapılır. URL bu tarihi içermez.',
    },
    {
      ad: 'guncellemeTarihi',
      etiket: 'Güncelleme tarihi',
      tip: 'tarih',
      genislik: 'yarim',
      yardim: 'Yalnızca içerik esaslı değişiklikte güncellenir; dizgi düzeltmesi için değil.',
    },
    {
      ad: 'okumaDakika',
      etiket: 'Okuma süresi (dakika)',
      tip: 'sayi',
      enAz: 1,
      enCok: 180,
      genislik: 'yarim',
      yardim: 'Tam sayı dakika. Gövde uzunluğuyla tutarlı olmalı (1–180).',
    },
    {
      ad: 'govde',
      etiket: 'Gövde',
      tip: 'bloklar',
      yardim:
        'Haber şablonu: ne oldu → neden önemli → teknik detay → kim etkileniyor → yorum. Analizde: tez → bağlam → kanıt → karşı görüş → sonuç.',
    },
    ADIM_LISTESI_ALANI,
    {
      ad: 'onKosullar',
      etiket: 'Ön koşullar',
      tip: 'metinDizisi',
      yardim: 'Rehbere başlamadan önce gereken kavram ve yetkinlikler. Her satır bir koşul.',
    },
    {
      ad: 'araclar',
      etiket: 'Gerekli araçlar',
      tip: 'metinDizisi',
      yardim: 'Uygulama sırasında gereken araç, hesap ve erişimler. Her satır bir öge.',
    },
    {
      ad: 'kontrolListesi',
      etiket: 'Kontrol listesi',
      tip: 'metinDizisi',
      yardim:
        'Rehber bittiğinde işaretlenecek maddeler. Adım listesinin tekrarı değil, çıktı kontrolü.',
    },
    TUZAKLAR_ALANI,
    {
      ad: 'ilgiliAtlas',
      etiket: 'İlgili Atlas kavramları',
      tip: 'cokluIliski',
      hedefKoleksiyon: KOLEKSIYONLAR.atlas,
      yardim: 'Metinde geçen kavramların kalıcı referansı. Kenar çubuğunda bağlantı olarak çıkar.',
    },
    {
      ad: 'ilgiliIcerik',
      etiket: 'İlgili içerikler',
      tip: 'cokluIliski',
      hedefKoleksiyon: KOLEKSIYONLAR.icerikler,
      yardim: 'Aynı konuda devam okuması. Kendi slug’unu ekleme.',
    },
    SSS_ALANI,
    KAYNAKLAR_ALANI,
    ...SEO_ALANLARI,
  ],
};
