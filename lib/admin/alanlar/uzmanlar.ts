import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import {
  DURUM_ALANI,
  DURUM_SECENEKLERI,
  SEO_ALANLARI,
  SLUG_ALANI,
  type KoleksiyonYapilandirmasi,
} from '@/lib/admin/alanlar/tipler';

/**
 * Topluluk uzman ağı. Yazar künyesinden farkı: uzman bir içeriği imzalamaz,
 * bir alanı temsil eder — koltuk boşken de kayıt durur ve `/topluluk/katki/`
 * çağrısına bağlanır. Bu yüzden `ad` alanı "Katkı bekleniyor" olabilir.
 *
 * Gövde, SSS, kaynak ve sürüm geçmişi alanı şemada yoktur; profil gövdesi
 * `yazarlar` koleksiyonundaki künyeden gelir. SEO alanları ise koltuğun kendi
 * sayfasını (/yazar/<slug>/, yazar künyesi olmayan slug'larda uzman koltuğu
 * render edilir) yönetir.
 */
export const UZMANLAR_YAPILANDIRMASI: KoleksiyonYapilandirmasi = {
  koleksiyon: KOLEKSIYONLAR.uzmanlar,
  ad: 'Uzman',
  cogul: 'Uzmanlar',
  aciklama:
    'Topluluk uzman ağındaki koltuklar: alan, unvan ve katkı geçmişi. Dolu koltuk profile, boş koltuk katkı çağrısına bağlanır.',
  anahtarAlan: 'slug',
  baslikAlani: 'ad',
  listeKolonlari: [
    { ad: 'ad', etiket: 'Ad' },
    { ad: 'unvan', etiket: 'Unvan', enCok: 40 },
    { ad: 'alan', etiket: 'Alan', enCok: 48 },
    { ad: 'basHarfler', etiket: 'Baş harf', mono: true },
    { ad: 'durum', etiket: 'Durum' },
  ],
  filtreler: [{ ad: 'durum', etiket: 'Durum', secenekler: DURUM_SECENEKLERI }],
  aramaAlanlari: ['ad', 'unvan', 'alan', 'ozgecmis', 'slug'],
  siralama: { ad: 1 },
  durumluMu: true,
  siteYolu: (belge) => (belge.slug ? `/yazar/${String(belge.slug)}/` : undefined),
  olusturulabilir: true,
  silinebilir: true,
  alanlar: [
    {
      ad: 'ad',
      etiket: 'Ad',
      tip: 'metin',
      zorunlu: true,
      yardim:
        'Koltuğu dolduran kişinin tam adı. Koltuk henüz boşsa tam olarak "Katkı bekleniyor" yazılır — site bu değeri boş koltuk işareti sayar.',
      genislik: 'yarim',
    },
    SLUG_ALANI,
    {
      ad: 'unvan',
      etiket: 'Unvan',
      tip: 'metin',
      zorunlu: true,
      yardim:
        'Koltuğun rolü: "AI Agent Engineer", "AI Security Researcher". Boş koltukta da doldurulur; kart başlığı budur.',
      genislik: 'yarim',
    },
    {
      ad: 'alan',
      etiket: 'Alan',
      tip: 'metin',
      zorunlu: true,
      yardim:
        'Uzmanlığın kapsamı, kartın alt satırında görünür: "Agentic sistemler". İki kapsam varsa orta nokta ile ayırın (·).',
      genislik: 'yarim',
    },
    {
      ad: 'basHarfler',
      etiket: 'Baş harfler',
      tip: 'metin',
      enCok: 4,
      yardim:
        'Avatar yerine basılan kısaltma; ad ve soyadın ilk harfleri. Boş koltukta artı işareti (+) kullanılır. En fazla 4 karakter.',
      genislik: 'yarim',
    },
    DURUM_ALANI,
    {
      ad: 'ozgecmis',
      etiket: 'Özgeçmiş',
      tip: 'uzunMetin',
      satir: 4,
      yardim:
        'Bu kişiyi bu alanda söz sahibi kılan deneyim, iki üç cümle. Profil sayfasında görünür; boş koltukta boş bırakılır.',
    },
    {
      ad: 'katkilar',
      etiket: 'Katkılar',
      tip: 'metinDizisi',
      yardim:
        'Her satıra bir katkı: incelenen Atlas girdisi, yazılan rehber, konuşulan etkinlik. Doğrulanabilir olmayan katkı yazılmaz.',
    },
    ...SEO_ALANLARI,
  ],
};
