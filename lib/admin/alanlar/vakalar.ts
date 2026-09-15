import { SEKTORLER } from '@/lib/veri/kurumsal';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import {
  DURUM_ALANI,
  DURUM_SECENEKLERI,
  SEO_ALANLARI,
  SLUG_ALANI,
  type KoleksiyonYapilandirmasi,
} from '@/lib/admin/alanlar/tipler';

/**
 * Vaka çalışmaları. İki alan hukuki ağırlık taşır:
 *
 * - `musteriAdi` yalnızca `onayliYayin` işaretliyse sayfada görünür; onay
 *   dosyada yoksa vaka sektör düzeyinde anlatılır.
 * - `etki` içindeki her rakam `olcumYontemi` ile birlikte yayımlanır
 *   (MASTER-PLAN §59: ölçüm yöntemi olmayan sayı gerçek ölçüm gibi sunulamaz).
 *
 * - `temsili` işaretliyse kayıt gerçek bir müşteri işi değildir; site sayfası
 *   görünür bir uyarı basar (değişmez kural 5). `onayliYayin` ile karıştırmayın:
 *   o yalnızca müşteri adının yayımlanabilirliğini söyler.
 *
 * Şemada `sektor` serbest metindir (görünen ad); `sektorSlug` sektör sayfasına
 * bağlanan referanstır. Filtre seçenekleri `SEKTORLER` listesinden üretilir.
 */
const SEKTOR_SECENEKLERI = SEKTORLER.map((sektor) => ({
  deger: sektor.slug,
  etiket: sektor.ad,
}));

export const VAKALAR_YAPILANDIRMASI: KoleksiyonYapilandirmasi = {
  koleksiyon: KOLEKSIYONLAR.vakalar,
  ad: 'Vaka çalışması',
  cogul: 'Vaka çalışmaları',
  aciklama:
    'Problem, yaklaşım, etki ve dersler. Müşteri adı yalnızca yazılı onayla, etki rakamı yalnızca ölçüm yöntemiyle yayımlanır.',
  anahtarAlan: 'slug',
  baslikAlani: 'baslik',
  listeKolonlari: [
    { ad: 'baslik', etiket: 'Vaka', enCok: 70 },
    { ad: 'sektor', etiket: 'Sektör' },
    { ad: 'musteriAdi', etiket: 'Müşteri', enCok: 30 },
    { ad: 'onayliYayin', etiket: 'Ad onayı' },
    { ad: 'temsili', etiket: 'Temsilî' },
    { ad: 'durum', etiket: 'Durum' },
  ],
  filtreler: [
    { ad: 'durum', etiket: 'Durum', secenekler: DURUM_SECENEKLERI },
    { ad: 'sektorSlug', etiket: 'Sektör', secenekler: SEKTOR_SECENEKLERI },
  ],
  aramaAlanlari: ['baslik', 'sektor', 'problem', 'yaklasim', 'slug'],
  siralama: { sektor: 1, baslik: 1 },
  durumluMu: true,
  siteYolu: (belge) => (belge.slug ? `/vaka-calismalari/${String(belge.slug)}/` : undefined),
  olusturulabilir: true,
  silinebilir: true,
  alanlar: [
    {
      ad: 'baslik',
      etiket: 'Vaka başlığı',
      tip: 'metin',
      zorunlu: true,
      yardim:
        'Yapılan işi anlatan başlık, müşteri adı geçmeden: "Teknik destekte kaynak gösteren cevap katmanı".',
      genislik: 'yarim',
    },
    SLUG_ALANI,
    {
      ad: 'sektor',
      etiket: 'Sektör (görünen ad)',
      tip: 'metin',
      zorunlu: true,
      yardim:
        'Sayfada ve kartta yazan sektör adı: "Üretim", "Lojistik". Sektör sayfası varsa adı birebir aynı yazın.',
      genislik: 'yarim',
    },
    {
      ad: 'sektorSlug',
      etiket: 'Sektör sayfası',
      tip: 'iliski',
      hedefKoleksiyon: KOLEKSIYONLAR.sektorler,
      yardim:
        'Vakayı sektör sayfasına bağlar; sayfadaki "sektöre git" bağlantısı ve sektör filtresi bu alandan gelir.',
      genislik: 'yarim',
    },
    {
      ad: 'musteriAdi',
      etiket: 'Müşteri adı',
      tip: 'metin',
      yardim:
        'Müşterinin ticari adı. Yazılı onay yoksa boş bırakın; vakayı "bir üretim firması" gibi sektör düzeyinde anlatmak yeterlidir.',
      genislik: 'yarim',
    },
    {
      ad: 'onayliYayin',
      etiket: 'Müşteri adının yayımına onay var',
      tip: 'mantik',
      varsayilan: false,
      yardim:
        'Yalnızca müşteri adının yayımlanmasına dair yazılı onay dosyada duruyorsa işaretleyin. İşaretsizken müşteri adı sitede gösterilmez.',
      genislik: 'yarim',
    },
    {
      ad: 'temsili',
      etiket: 'Temsilî senaryo (gerçek müşteri işi değil)',
      tip: 'mantik',
      varsayilan: false,
      yardim:
        'Yaklaşımı göstermek için yazılmış örnek vakada işaretleyin. İşaretliyken sayfa görünür bir uyarı basar; müşteri adı ve sayısal sonuç yazılmaz.',
      genislik: 'yarim',
    },
    {
      ad: 'problem',
      etiket: 'Problem',
      tip: 'uzunMetin',
      zorunlu: true,
      satir: 3,
      yardim:
        'Çözüm öncesindeki durum: kim neyi nasıl yapıyordu, ne ölçülemiyordu. Ürün anlatmayın, sıkıntıyı anlatın.',
    },
    {
      ad: 'yaklasim',
      etiket: 'Yaklaşım',
      tip: 'uzunMetin',
      zorunlu: true,
      satir: 4,
      yardim:
        'Ne kuruldu ve neden o şekilde kuruldu. Kararların gerekçesi yazılır; teknoloji adları listesi aşağıdaki alana girer.',
    },
    {
      ad: 'teknolojiler',
      etiket: 'Teknolojiler',
      tip: 'metinDizisi',
      yardim:
        'Her satıra bir yaklaşım veya bileşen: "RAG", "Hibrit arama", "Denetim kaydı". Ürün markası değil yöntem yazın.',
    },
    {
      ad: 'etki',
      etiket: 'Etki',
      tip: 'nesneDizisi',
      yardim:
        'Ölçüm yöntemi yazılmayan rakam yayımlanmaz (MASTER-PLAN §59). Yöntemi yoksa sayı yerine niteliksel sonuç yazın.',
      altAlanlar: [
        {
          ad: 'etiket',
          etiket: 'Etiket',
          tip: 'metin',
          zorunlu: true,
          yardim: 'Neyin ölçüldüğü, tek kelime ya da kısa öbek: "Çözüm süresi", "Kapsam".',
          genislik: 'yarim',
        },
        {
          ad: 'deger',
          etiket: 'Değer',
          tip: 'metin',
          zorunlu: true,
          yardim:
            'Sonuç: "Numune yerine tam kontrol" ya da rakam. Rakam yazdıysanız ölçüm yöntemi alanı boş kalamaz.',
          genislik: 'yarim',
        },
        {
          ad: 'olcumYontemi',
          etiket: 'Ölçüm yöntemi',
          tip: 'metin',
          yardim:
            'Rakam nasıl çıktı: karşılaştırma tabanı, dönem ve örneklem. Örnek: "2025 Q1 ile Q3 arası, 412 iş emri".',
        },
      ],
    },
    {
      ad: 'dersler',
      etiket: 'Dersler',
      tip: 'metinDizisi',
      yardim:
        'Her satıra bir ders. Başka bir ekibin işine yarayacak, yanıldığınız veya sürpriz olan noktayı yazın; övgü cümlesi ders değildir.',
    },
    {
      ad: 'govde',
      etiket: 'Gövde',
      tip: 'bloklar',
      yardim:
        'Uzun anlatım: mimari, kararlar, ölçüm düzeni. Şablon: bağlam → kurulum → ölçüm → devir. Problem ve yaklaşım metinlerini tekrar etmeyin.',
    },
    DURUM_ALANI,
    ...SEO_ALANLARI,
  ],
};
