import { ARAC_KATEGORILERI } from '@/lib/taksonomi';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import {
  DURUM_ALANI,
  DURUM_SECENEKLERI,
  SEO_ALANLARI,
  SLUG_ALANI,
  SON_DOGRULAMA_ALANI,
  type KoleksiyonYapilandirmasi,
} from '@/lib/admin/alanlar/tipler';

/**
 * Araç kayıt defteri. Şemada `kategori` serbest metindir; editörün rastgele
 * kategori uydurmasını engellemek için seçenekler `ARAC_KATEGORILERI`
 * listesinden üretilir (Atlas'ta `kategoriSlug` ile aynı yaklaşım).
 */
const KATEGORI_SECENEKLERI = ARAC_KATEGORILERI.map((kategori: string) => ({
  deger: kategori,
  etiket: kategori,
}));

export const ARACLAR_YAPILANDIRMASI: KoleksiyonYapilandirmasi = {
  koleksiyon: KOLEKSIYONLAR.araclar,
  ad: 'Araç',
  cogul: 'Araçlar',
  aciklama:
    'Araç kayıt defteri: ne işe yarar, kim kullanmalı, artı ve eksiler. Reklam değil editoryal değerlendirme; her kayıt bir tavsiye kararı taşır.',
  anahtarAlan: 'slug',
  baslikAlani: 'ad',
  listeKolonlari: [
    { ad: 'ad', etiket: 'Araç' },
    { ad: 'kategori', etiket: 'Kategori', secenekler: KATEGORI_SECENEKLERI },
    { ad: 'fiyat', etiket: 'Fiyat', enCok: 40 },
    { ad: 'sonDogrulama', etiket: 'Doğrulama', mono: true },
    { ad: 'durum', etiket: 'Durum' },
  ],
  filtreler: [
    { ad: 'durum', etiket: 'Durum', secenekler: DURUM_SECENEKLERI },
    { ad: 'kategori', etiket: 'Kategori', secenekler: KATEGORI_SECENEKLERI },
  ],
  aramaAlanlari: ['ad', 'neIse', 'kimKullanmali', 'slug'],
  siralama: { kategori: 1, ad: 1 },
  durumluMu: true,
  siteYolu: (belge) => (belge.slug ? `/araclar/${String(belge.slug)}/` : undefined),
  olusturulabilir: true,
  silinebilir: true,
  alanlar: [
    {
      ad: 'ad',
      etiket: 'Araç adı',
      tip: 'metin',
      zorunlu: true,
      yardim:
        'Ürünün kendi yazdığı ad. Tek bir ürün değil ürün sınıfı inceleniyorsa parantezle belirtin: "Kod Asistanı (kategori incelemesi)".',
      genislik: 'yarim',
    },
    SLUG_ALANI,
    {
      ad: 'sirketSlug',
      etiket: 'Üretici şirket',
      tip: 'iliski',
      hedefKoleksiyon: KOLEKSIYONLAR.sirketler,
      yardim:
        'Aracı yapan şirket. Şirket sayfası varsa bağlayın; kategori incelemelerinde ve şirket künyesi olmayan araçlarda boş bırakın — var olmayan sayfaya bağlanmaz.',
      genislik: 'yarim',
    },
    {
      ad: 'kategori',
      etiket: 'Kategori',
      tip: 'secim',
      zorunlu: true,
      secenekler: KATEGORI_SECENEKLERI,
      yardim: 'Araç listesindeki filtre bu alandan üretilir. Tek kategori seçin, en baskın işlevi.',
      genislik: 'yarim',
    },
    {
      ad: 'neIse',
      etiket: 'Ne işe yarar',
      tip: 'uzunMetin',
      zorunlu: true,
      satir: 3,
      yardim:
        'Tek cümlede aracın yaptığı iş. Sayfa özeti ve arama açıklaması bu metni kullanır; pazarlama sıfatı değil işlev yazın.',
    },
    {
      ad: 'kimKullanmali',
      etiket: 'Kim kullanmalı',
      tip: 'metin',
      yardim: 'Hedef kitleyi rol olarak yazın: "Aktif geliştirme yapan yazılım ekipleri".',
    },
    {
      ad: 'enIyiKullanim',
      etiket: 'En iyi kullanım',
      tip: 'metin',
      yardim: 'Aracın açık ara en çok işe yaradığı tek senaryo. Kullanım listesi değil, tek durum.',
    },
    {
      ad: 'alternatifler',
      etiket: 'Alternatifler',
      tip: 'metinDizisi',
      yardim:
        'Her satıra bir alternatif yaklaşım ya da ürün sınıfı. Okuyucu bu aracı almadan önce neyi değerlendirmeli?',
    },
    {
      ad: 'fiyat',
      etiket: 'Fiyat modeli',
      tip: 'metin',
      yardim:
        'Tutar değil model yazın: "Kullanıcı başına aylık abonelik", "Tüketim bazlı". Rakam yazarsanız eskir.',
      genislik: 'yarim',
    },
    {
      ad: 'artilar',
      etiket: 'Artılar',
      tip: 'metinDizisi',
      yardim:
        'Her satıra bir madde. Artılar ve eksiler birlikte doldurulur: yalnızca artı listelenen kayıt tanıtım metnine dönüşür ve yayımlanmaz.',
    },
    {
      ad: 'eksiler',
      etiket: 'Eksiler',
      tip: 'metinDizisi',
      yardim:
        'Her satıra bir madde. Artılarla birlikte doldurulması zorunludur; en az bir gerçek sınırlılık veya risk yazın.',
    },
    {
      ad: 'degerlendirme',
      etiket: 'Editör değerlendirmesi',
      tip: 'uzunMetin',
      satir: 3,
      yardim:
        'Artı ve eksileri tartıp verdiğiniz karar: kim için değer, kim için değil. Özellik tekrarı değil yargı cümlesi.',
    },
    DURUM_ALANI,
    SON_DOGRULAMA_ALANI,
    ...SEO_ALANLARI,
  ],
};
