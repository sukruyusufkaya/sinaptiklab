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
 * Öğrenme yolları rol bazlı rotalardır: kendileri ders taşımaz, bölümler
 * üzerinden derslere referans verir. Şemada `rol` serbest metindir; liste
 * filtresi yayındaki dar değer kümesini gösterir.
 */
const ROL_SECENEKLERI: readonly Secenek[] = [
  { deger: 'Herkes', etiket: 'Herkes', tarif: 'Kod yazmayı gerektirmeyen giriş rotaları.' },
  { deger: 'Yazılımcı', etiket: 'Yazılımcı' },
  { deger: 'Veri bilimci', etiket: 'Veri bilimci' },
  { deger: 'Ürün', etiket: 'Ürün' },
  { deger: 'Yönetici', etiket: 'Yönetici' },
];

export const OGRENME_YOLLARI_YAPILANDIRMASI: KoleksiyonYapilandirmasi = {
  koleksiyon: KOLEKSIYONLAR.ogrenmeYollari,
  ad: 'Öğrenme yolu',
  cogul: 'Öğrenme yolları',
  aciklama:
    'Rolüne göre sıralı öğrenme rotası. Dersleri kendisi barındırmaz; bölümler üzerinden derslere ve Atlas kavramlarına bağlanır.',
  anahtarAlan: 'slug',
  baslikAlani: 'ad',
  listeKolonlari: [
    { ad: 'ad', etiket: 'Rota' },
    { ad: 'rol', etiket: 'Hedef rol', secenekler: ROL_SECENEKLERI },
    { ad: 'seviyeAraligi', etiket: 'Seviye aralığı' },
    { ad: 'saat', etiket: 'Saat', mono: true },
    { ad: 'durum', etiket: 'Durum' },
  ],
  filtreler: [
    { ad: 'durum', etiket: 'Durum', secenekler: DURUM_SECENEKLERI },
    { ad: 'rol', etiket: 'Hedef rol', secenekler: ROL_SECENEKLERI },
  ],
  aramaAlanlari: ['ad', 'slug', 'rol', 'aciklama'],
  siralama: { rol: 1, ad: 1 },
  durumluMu: true,
  siteYolu: (belge) => (belge.slug ? `/ogren/yollar/${String(belge.slug)}/` : undefined),
  olusturulabilir: true,
  silinebilir: true,
  alanlar: [
    {
      ad: 'ad',
      etiket: 'Rota adı',
      tip: 'metin',
      zorunlu: true,
      yardim: 'Rotanın sayfa başlığı, ör. "Generative AI Engineer".',
      genislik: 'yarim',
    },
    SLUG_ALANI,
    {
      ad: 'rol',
      etiket: 'Hedef rol',
      tip: 'metin',
      zorunlu: true,
      yardim:
        'Bu rotayı izleyecek kişinin rolü. Yayındaki değerler: Herkes, Yazılımcı, Veri bilimci, Ürün, Yönetici. Yeni bir rol yazarsanız liste filtresine de eklenmeli.',
      genislik: 'yarim',
    },
    {
      ad: 'seviyeAraligi',
      etiket: 'Seviye aralığı',
      tip: 'metin',
      zorunlu: true,
      yardim: 'Başlangıç ve bitiş seviyesi okla yazılır, ör. "Orta → İleri".',
      genislik: 'yarim',
    },
    DURUM_ALANI,
    {
      ad: 'bolum',
      etiket: 'Bölüm sayısı',
      tip: 'sayi',
      enAz: 1,
      yardim: 'Aşağıdaki bölüm listesinin uzunluğuyla aynı olmalı; kartta bu sayı gösterilir.',
      genislik: 'yarim',
    },
    {
      ad: 'saat',
      etiket: 'Toplam saat',
      tip: 'sayi',
      enAz: 1,
      yardim: 'Bölüm sürelerinin toplamı. Tahmin değil, bölümlerden hesaplanır.',
      genislik: 'yarim',
    },
    {
      ad: 'aciklama',
      etiket: 'Açıklama',
      tip: 'uzunMetin',
      satir: 3,
      yardim: 'Rotanın ne öğrettiğini tek paragrafta söyler; arşiv kartında da bu metin çıkar.',
    },
    {
      ad: 'kimeGore',
      etiket: 'Kime göre',
      tip: 'uzunMetin',
      satir: 2,
      yardim: 'Bu rota kimin için uygun, hangi arka planı varsayıyor? Tek cümle.',
    },
    {
      ad: 'cikti',
      etiket: 'Çıktılar',
      tip: 'metinDizisi',
      yardim: 'Rota bitince elde edilen somut sonuçlar, ör. "RAG sistemi". Her satır bir çıktı.',
    },
    {
      ad: 'onkosullar',
      etiket: 'Önkoşullar',
      tip: 'metinDizisi',
      yardim: 'Başlamadan önce bilinmesi gerekenler, ör. "Python". Yoksa boş bırakın.',
    },
    {
      ad: 'bolumler',
      etiket: 'Bölümler',
      tip: 'nesneDizisi',
      yardim: 'Rotanın sıralı adımları. Buradaki sıra sayfada aynen görünür.',
      altAlanlar: [
        {
          ad: 'ad',
          etiket: 'Bölüm adı',
          tip: 'metin',
          zorunlu: true,
          yardim: 'Konu başlığı, ör. "Vector Databases".',
        },
        {
          ad: 'ozet',
          etiket: 'Özet',
          tip: 'metin',
          zorunlu: true,
          yardim: 'Bölümün tek cümlelik kapsamı.',
        },
        {
          ad: 'sure',
          etiket: 'Süre',
          tip: 'metin',
          zorunlu: true,
          yardim: 'Metin olarak yazılır, ör. "1,5 sa". Toplamı üstteki saat alanını vermeli.',
          genislik: 'yarim',
        },
        {
          ad: 'kavramlar',
          etiket: 'Kavramlar',
          tip: 'metinDizisi',
          yardim: 'Atlas kavramının görünen adı yazılır; eşleşen girdiler otomatik bağlanır.',
        },
        {
          ad: 'dersSluglari',
          etiket: 'Dersler',
          tip: 'cokluIliski',
          hedefKoleksiyon: KOLEKSIYONLAR.dersler,
          yardim: 'Bu bölümü karşılayan dersler. Dersin `yolSlug` alanı da bu rotayı göstermeli.',
        },
      ],
    },
    ...SEO_ALANLARI,
  ],
};
