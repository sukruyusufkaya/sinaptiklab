import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import {
  DURUM_ALANI,
  DURUM_SECENEKLERI,
  SEO_ALANLARI,
  SLUG_ALANI,
  type KoleksiyonYapilandirmasi,
} from '@/lib/admin/alanlar/tipler';

/**
 * Sektör bir varlıktır: kalıcı `/sektor/<slug>/` adresi vardır ve vaka
 * çalışmaları `sektorSlug` ile buraya bağlanır. Şemada gövde, SSS, kaynak ve
 * sürüm geçmişi yoktur — o paylaşılan parçalar burada kullanılmaz. Sayfa
 * içeriği dört listeden oluşur: kullanım alanları, teknolojiler, riskler ve
 * mevzuat.
 */
export const SEKTORLER_YAPILANDIRMASI: KoleksiyonYapilandirmasi = {
  koleksiyon: KOLEKSIYONLAR.sektorler,
  ad: 'Sektör',
  cogul: 'Sektörler',
  aciklama:
    'Sektör sayfaları: yapay zekânın o sektördeki kullanım alanları, kullanılan teknolojiler ve sektöre özgü risk ile mevzuat başlıkları.',
  anahtarAlan: 'slug',
  baslikAlani: 'ad',
  listeKolonlari: [
    { ad: 'ad', etiket: 'Sektör' },
    { ad: 'slug', etiket: 'Adres', mono: true },
    { ad: 'ozet', etiket: 'Özet', enCok: 70 },
    { ad: 'kullanimSayisi', etiket: 'Kullanım', mono: true },
    { ad: 'durum', etiket: 'Durum' },
  ],
  filtreler: [{ ad: 'durum', etiket: 'Durum', secenekler: DURUM_SECENEKLERI }],
  aramaAlanlari: ['ad', 'ozet', 'slug', 'kullanimAlanlari', 'teknolojiler'],
  siralama: { ad: 1 },
  durumluMu: true,
  siteYolu: (belge) => (belge.slug ? `/sektor/${String(belge.slug)}/` : undefined),
  olusturulabilir: true,
  silinebilir: true,
  alanlar: [
    {
      ad: 'ad',
      etiket: 'Sektör adı',
      tip: 'metin',
      zorunlu: true,
      genislik: 'yarim',
      yardim: 'Tek kelimelik yerleşik ad: Finans, Sağlık, Üretim, Lojistik.',
    },
    SLUG_ALANI,
    {
      ad: 'ozet',
      etiket: 'Özet (answer-first)',
      tip: 'uzunMetin',
      zorunlu: true,
      satir: 2,
      yardim:
        'Bu sektörde yapay zekânın en çok işe yaradığı üç başlığı virgülle sıralar; sektör listesindeki kartta da bu metin görünür.',
    },
    DURUM_ALANI,
    {
      ad: 'kullanimSayisi',
      etiket: 'Kullanım alanı sayısı',
      tip: 'sayi',
      enAz: 0,
      genislik: 'yarim',
      yardim:
        'Kartta "14 kullanım alanı" olarak basılır ve sektör sayfasındaki toplam sayacına eklenir. Aşağıdaki listeden fazla olabilir; yalnızca sayılabilen gerçek örnekleri yazın.',
    },
    {
      ad: 'kullanimAlanlari',
      etiket: 'Kullanım alanları',
      tip: 'metinDizisi',
      yardim:
        'Her satır tek bir iş senaryosu: "Sözleşme analizi", "Kredi risk modelleme". Ürün adı değil, yapılan iş yazılır.',
    },
    {
      ad: 'teknolojiler',
      etiket: 'Teknolojiler',
      tip: 'metinDizisi',
      yardim:
        'Bu senaryoları çalıştıran katman türleri: RAG, Computer Vision, Predictive AI, belge işleme.',
    },
    {
      ad: 'riskler',
      etiket: 'Sektöre özgü riskler',
      tip: 'metinDizisi',
      yardim:
        'Yalnızca bu sektörde öne çıkan riskler: "Hasta verisi gizliliği", "Saha koşullarında model kayması". Her sektörde geçerli genel uyarılar yazılmaz.',
    },
    {
      ad: 'mevzuat',
      etiket: 'İlgili mevzuat',
      tip: 'metinDizisi',
      yardim:
        'Sektörü bağlayan düzenleme adları: KVKK, AB AI Act, BDDK tebliği. Yorum değil, yalnızca düzenlemenin adı ve varsa maddesi.',
    },
    ...SEO_ALANLARI,
  ],
};
