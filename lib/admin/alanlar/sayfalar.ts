import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import {
  DURUM_ALANI,
  DURUM_SECENEKLERI,
  SEO_ALANLARI,
  SLUG_ALANI,
  type KoleksiyonYapilandirmasi,
} from '@/lib/admin/alanlar/tipler';

/**
 * Statik editoryal sayfalar: hakkında, künye, iletişim, metodoloji.
 *
 * Bu koleksiyon akış içeriği taşımaz: her belge sitede kodla tanımlı, tek ve
 * kalıcı bir rotayı besler (`/hakkinda/`, `/kunye/`, `/iletisim/`,
 * `/metodoloji/`). Bu yüzden yazar, konu, tür, kaynak ve sürüm geçmişi alanları
 * yoktur — hukuki metinlerin sürüm geçmişi `politikalar` koleksiyonundadır.
 *
 * `silinebilir: false`: belgeyi silmek karşılığı olan rotayı boşa düşürür.
 * Yayından çıkarmak için `durum` alanı arşive alınır.
 */
export const SAYFALAR_YAPILANDIRMASI: KoleksiyonYapilandirmasi = {
  koleksiyon: KOLEKSIYONLAR.sayfalar,
  ad: 'Sayfa',
  cogul: 'Sayfalar',
  aciklama:
    'Kurumsal ve editoryal tekil sayfalar. Her belge sitede sabit bir adrese karşılık gelir; tarih içermez ve listelerde akış olarak görünmez.',
  anahtarAlan: 'slug',
  baslikAlani: 'baslik',
  listeKolonlari: [
    { ad: 'baslik', etiket: 'Sayfa' },
    { ad: 'yol', etiket: 'Adres', mono: true },
    { ad: 'ozet', etiket: 'Özet', enCok: 60 },
    { ad: 'guncellemeTarihi', etiket: 'Güncelleme', mono: true },
    { ad: 'durum', etiket: 'Durum' },
  ],
  filtreler: [{ ad: 'durum', etiket: 'Durum', secenekler: DURUM_SECENEKLERI }],
  aramaAlanlari: ['baslik', 'slug', 'yol', 'ozet'],
  siralama: { baslik: 1 },
  durumluMu: true,
  siteYolu: (belge) => {
    if (typeof belge.yol === 'string' && belge.yol.startsWith('/')) return belge.yol;
    return belge.slug ? `/${String(belge.slug)}/` : undefined;
  },
  olusturulabilir: true,
  silinebilir: false,
  alanlar: [
    {
      ad: 'baslik',
      etiket: 'Sayfa başlığı',
      tip: 'metin',
      zorunlu: true,
      genislik: 'yarim',
      yardim: 'Sayfanın H1 metni. Menüde görünen adla aynı olmak zorunda değil.',
    },
    SLUG_ALANI,
    {
      ad: 'yol',
      etiket: 'Adres',
      tip: 'metin',
      genislik: 'yarim',
      yardim:
        'Sitedeki tam adres; eğik çizgiyle başlar ve biter: /hakkinda/. Boş bırakılırsa /<slug>/ varsayılır.',
    },
    {
      ad: 'etiket',
      etiket: 'Üst etiket',
      tip: 'metin',
      genislik: 'yarim',
      yardim:
        'Başlığın üstünde görünen kısa etiket ("KÜNYE", "METODOLOJİ"). Büyük harf isteniyorsa buraya büyük yazın; tarayıcı dönüştürmez.',
    },
    {
      ad: 'ozet',
      etiket: 'Özet',
      tip: 'uzunMetin',
      satir: 3,
      yardim:
        'Başlığın hemen altında görünen tek paragraf. Sayfanın ne söylediğini okuyucuya baştan verir.',
    },
    DURUM_ALANI,
    {
      ad: 'guncellemeTarihi',
      etiket: 'Güncelleme tarihi',
      tip: 'tarih',
      genislik: 'yarim',
      yardim:
        'Yalnızca metin gerçekten değiştiğinde güncellenir; içerik aynı kaldıysa dokunulmaz (editoryal ilkeler).',
    },
    {
      ad: 'govde',
      etiket: 'Gövde',
      tip: 'bloklar',
      yardim:
        'Sayfanın bölümleri. Her bölüm bir altbaşlıkla açılır; altbaşlık kimliği çapa bağlantısı ve içindekiler tablosunu üretir.',
    },
    ...SEO_ALANLARI,
  ],
};
