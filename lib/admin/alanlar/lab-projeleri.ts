import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import {
  DURUM_ALANI,
  DURUM_SECENEKLERI,
  SEO_ALANLARI,
  SLUG_ALANI,
  type KoleksiyonYapilandirmasi,
  type Secenek,
} from '@/lib/admin/alanlar/tipler';

/**
 * Lab projeleri. İki ayrı durum alanı vardır ve karıştırılmamalıdır:
 * `durum` editoryal yayın akışıdır (kayıt sitede görünür mü), `yayinDurumu`
 * ise aracın kendi olgunluğudur (çalışan arayüz var mı, yoksa hâlâ
 * geliştiriliyor mu). Yayında bir kayıt "geliştiriliyor" olabilir.
 */

const TUR_SECENEKLERI: readonly Secenek[] = [
  {
    deger: 'Araç',
    etiket: 'Araç',
    tarif: 'Çalışan hesaplayıcı veya seçici; /araclar/hesaplayicilar/ listesine girer.',
  },
  { deger: 'Deney', etiket: 'Deney', tarif: 'Sonucu belirsiz görselleştirme veya prototip.' },
  {
    deger: 'Açık Kaynak',
    etiket: 'Açık Kaynak',
    tarif: 'Depo adresi olmadan yayımlanmaz.',
  },
  { deger: 'Demo', etiket: 'Demo', tarif: 'Bir kavramı göstermek için kurulan oyun alanı.' },
];

const YAYIN_DURUMU_SECENEKLERI: readonly Secenek[] = [
  { deger: 'yayinda', etiket: 'Yayında', tarif: 'Arayüz çalışıyor ve kullanılabilir.' },
  {
    deger: 'gelistiriliyor',
    etiket: 'Geliştiriliyor',
    tarif: 'Sayfa açılır, araç yerine bilgi notu görünür.',
  },
];

export const LAB_PROJELERI_YAPILANDIRMASI: KoleksiyonYapilandirmasi = {
  koleksiyon: KOLEKSIYONLAR.labProjeleri,
  ad: 'Lab projesi',
  cogul: 'Lab projeleri',
  aciklama:
    'Sinaptik Lab: etkileşimli araçlar, deneyler, açık kaynak projeler ve demolar. Makale değil çalışan yüzey; kaydın değeri arkasındaki arayüzdedir.',
  anahtarAlan: 'slug',
  baslikAlani: 'ad',
  listeKolonlari: [
    { ad: 'ad', etiket: 'Proje' },
    { ad: 'tur', etiket: 'Tür', secenekler: TUR_SECENEKLERI },
    { ad: 'yayinDurumu', etiket: 'Olgunluk', secenekler: YAYIN_DURUMU_SECENEKLERI },
    { ad: 'bilesenAnahtari', etiket: 'Bileşen', mono: true },
    { ad: 'durum', etiket: 'Durum' },
  ],
  filtreler: [
    { ad: 'durum', etiket: 'Durum', secenekler: DURUM_SECENEKLERI },
    { ad: 'tur', etiket: 'Tür', secenekler: TUR_SECENEKLERI },
    { ad: 'yayinDurumu', etiket: 'Olgunluk', secenekler: YAYIN_DURUMU_SECENEKLERI },
  ],
  aramaAlanlari: ['ad', 'ozet', 'slug', 'bilesenAnahtari'],
  siralama: { tur: 1, ad: 1 },
  durumluMu: true,
  siteYolu: (belge) => (belge.slug ? `/lab/${String(belge.slug)}/` : undefined),
  olusturulabilir: true,
  silinebilir: true,
  alanlar: [
    {
      ad: 'ad',
      etiket: 'Proje adı',
      tip: 'metin',
      zorunlu: true,
      yardim: 'Araç sayfasının başlığı olur: "Token Hesaplayıcı", "Bağlam Penceresi Hesaplayıcı".',
      genislik: 'yarim',
    },
    SLUG_ALANI,
    {
      ad: 'tur',
      etiket: 'Tür',
      tip: 'secim',
      zorunlu: true,
      secenekler: TUR_SECENEKLERI,
      yardim:
        'Lab listesindeki gruplama bu alandan gelir. Yalnızca "Araç" türü hesaplayıcı listelerine girer.',
      genislik: 'yarim',
    },
    {
      ad: 'ozet',
      etiket: 'Özet',
      tip: 'uzunMetin',
      zorunlu: true,
      satir: 2,
      yardim:
        'Aracın ne hesapladığını tek cümlede söyleyin. Kart açıklaması ve arama açıklaması bu metni kullanır.',
    },
    {
      ad: 'yayinDurumu',
      etiket: 'Olgunluk',
      tip: 'secim',
      secenekler: YAYIN_DURUMU_SECENEKLERI,
      yardim:
        'Çalışan bir arayüz yoksa "Geliştiriliyor" seçin; sayfa boş araç yerine bilgi notu gösterir.',
      genislik: 'yarim',
    },
    DURUM_ALANI,
    {
      ad: 'bilesenAnahtari',
      etiket: 'Bileşen anahtarı',
      tip: 'metin',
      yardim:
        'Sayfaya basılacak istemci bileşeninin anahtarı. Geçerli değerler: token-hesaplayici, llm-maliyet-hesaplayici, rag-chunk-hesaplayici, gpu-bellek-hesaplayici, baglam-penceresi-hesaplayici, ai-roi-hesaplayici, model-secici. Listede olmayan bir değer yazılırsa araç basılmaz. Yeni bir araç için önce components/lab/AracKayitDefteri.tsx kayıt defterine bileşen eklenir.',
    },
    {
      ad: 'kavramlar',
      etiket: 'Atlas kavramları',
      tip: 'metinDizisi',
      yardim:
        'Her satıra bir Atlas slug değeri: rag, embedding, vector-database. Sayfada "projenin arkasındaki kavramlar" bölümünü üretir; karşılığı olmayan slug basılmaz.',
    },
    {
      ad: 'govde',
      etiket: 'Gövde',
      tip: 'bloklar',
      yardim:
        'Uzun anlatım: yöntem, varsayımlar, ölçüm düzeni ve sınırlılıklar. Araç olmayan projelerde (deney, açık kaynak, demo) sayfanın asıl içeriği burasıdır.',
    },
    {
      ad: 'girdiler',
      etiket: 'Girdiler',
      tip: 'nesneDizisi',
      yardim:
        'Aracın kullanıcıdan istediği alanlar — kart üzerinde önizleme olarak listelenir. Hesaplama mantığını değil yalnızca görünen etiketleri tanımlar.',
      altAlanlar: [
        {
          ad: 'etiket',
          etiket: 'Girdi etiketi',
          tip: 'metin',
          zorunlu: true,
          yardim: 'Formda görünen ad: "Günlük istek", "Parametre".',
          genislik: 'yarim',
        },
        {
          ad: 'birim',
          etiket: 'Birim',
          tip: 'metin',
          zorunlu: true,
          yardim: 'Değerin ölçüsü: token, adet, saat, %, milyar, seçim.',
          genislik: 'yarim',
        },
      ],
    },
    {
      ad: 'depoAdresi',
      etiket: 'Depo adresi',
      tip: 'metin',
      yardim:
        'Kaynak kodun bulunduğu genel depo. https:// ile başlar. "Açık Kaynak" türünde doldurulmazsa kayıt yayımlanmamalı.',
    },
    {
      ad: 'govde',
      etiket: 'Gövde',
      tip: 'bloklar',
      yardim:
        'Aracın altındaki açıklama: hesap nasıl yapılıyor → hangi varsayımlar kullanıldı → sonuç nasıl okunmalı → sınırları. Tahmin üreten her araç varsayımlarını yazar.',
    },
    ...SEO_ALANLARI,
  ],
};
