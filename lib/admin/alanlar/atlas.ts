import { ATLAS_KATEGORILERI } from '@/lib/veri/atlas';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import {
  DURUM_ALANI,
  DURUM_SECENEKLERI,
  KAYNAKLAR_ALANI,
  SEO_ALANLARI,
  SEVIYE_SECENEKLERI,
  SLUG_ALANI,
  SON_DOGRULAMA_ALANI,
  SSS_ALANI,
  SURUMLER_ALANI,
  type KoleksiyonYapilandirmasi,
} from '@/lib/admin/alanlar/tipler';

/** Atlas kategorileri şemadaki `kategoriSlug` için seçenek listesi olur. */
const KATEGORI_SECENEKLERI = ATLAS_KATEGORILERI.map((k) => ({
  deger: k.slug,
  etiket: k.ad,
}));

export const ATLAS_YAPILANDIRMASI: KoleksiyonYapilandirmasi = {
  koleksiyon: KOLEKSIYONLAR.atlas,
  ad: 'Atlas girdisi',
  cogul: 'Atlas girdileri',
  aciklama:
    'Kavramların kalıcı referansı. Makale değil varlık: sürüm geçmişi ve son doğrulama tarihi taşır.',
  anahtarAlan: 'slug',
  baslikAlani: 'ad',
  listeKolonlari: [
    { ad: 'ad', etiket: 'Kavram' },
    { ad: 'kategoriSlug', etiket: 'Kategori', secenekler: KATEGORI_SECENEKLERI },
    { ad: 'seviye', etiket: 'Seviye', secenekler: SEVIYE_SECENEKLERI },
    { ad: 'sonDogrulama', etiket: 'Doğrulama', mono: true },
    { ad: 'durum', etiket: 'Durum' },
  ],
  filtreler: [
    { ad: 'durum', etiket: 'Durum', secenekler: DURUM_SECENEKLERI },
    { ad: 'kategoriSlug', etiket: 'Kategori', secenekler: KATEGORI_SECENEKLERI },
    { ad: 'seviye', etiket: 'Seviye', secenekler: SEVIYE_SECENEKLERI },
  ],
  aramaAlanlari: ['ad', 'altAd', 'kisaTanim', 'slug'],
  siralama: { ad: 1 },
  durumluMu: true,
  siteYolu: (belge) => (belge.slug ? `/atlas/${String(belge.slug)}/` : undefined),
  olusturulabilir: true,
  silinebilir: true,
  alanlar: [
    { ad: 'ad', etiket: 'Kavram adı', tip: 'metin', zorunlu: true, genislik: 'yarim' },
    SLUG_ALANI,
    {
      ad: 'altAd',
      etiket: 'Alt ad',
      tip: 'metin',
      yardim: 'Türkçe karşılık veya kısaltmanın açılımı.',
      genislik: 'yarim',
    },
    {
      ad: 'kategoriSlug',
      etiket: 'Kategori',
      tip: 'secim',
      zorunlu: true,
      secenekler: KATEGORI_SECENEKLERI,
      genislik: 'yarim',
    },
    {
      ad: 'kisaTanim',
      etiket: 'Kısa tanım (answer-first)',
      tip: 'uzunMetin',
      zorunlu: true,
      satir: 3,
      enAz: 40,
      enCok: 600,
      yardim:
        'Tek cümlelik, alıntılanabilir tanım. Sözlük görünümünde de bu metin kullanılır (40–600 karakter).',
    },
    {
      ad: 'seviye',
      etiket: 'Seviye',
      tip: 'secim',
      zorunlu: true,
      secenekler: SEVIYE_SECENEKLERI,
      genislik: 'yarim',
    },
    DURUM_ALANI,
    {
      ad: 'ilgili',
      etiket: 'İlgili kavramlar',
      tip: 'metinDizisi',
      yardim: 'Görünen ad yazılır; eşleşen Atlas girdileri otomatik bağlanır.',
    },
    {
      ad: 'onkosullar',
      etiket: 'Önkoşullar',
      tip: 'metinDizisi',
      yardim: 'Beceri grafiği bu alandan üretilir.',
    },
    // Şemada `sonDogrulama` atlas için `required`; paylaşılan alanda isteğe
    // bağlı olduğu için burada zorunluya çevrilir (yoksa form geçer, MongoDB
    // doğrulaması reddeder).
    { ...SON_DOGRULAMA_ALANI, zorunlu: true },
    { ad: 'yayinTarihi', etiket: 'Yayın tarihi', tip: 'tarih', genislik: 'yarim' },
    { ad: 'guncellemeTarihi', etiket: 'Güncelleme tarihi', tip: 'tarih', genislik: 'yarim' },
    {
      ad: 'yazarSlug',
      etiket: 'Yazar',
      tip: 'iliski',
      hedefKoleksiyon: KOLEKSIYONLAR.yazarlar,
      genislik: 'yarim',
    },
    {
      ad: 'inceleyenSlug',
      etiket: 'Teknik inceleyen',
      tip: 'iliski',
      hedefKoleksiyon: KOLEKSIYONLAR.yazarlar,
      genislik: 'yarim',
    },
    {
      ad: 'govde',
      etiket: 'Gövde',
      tip: 'bloklar',
      yardim:
        'Şablon: tanım → nasıl çalışır → örnek → yanılgılar → nerede kullanılır → ilgili kavramlar.',
    },
    SSS_ALANI,
    KAYNAKLAR_ALANI,
    SURUMLER_ALANI,
    ...SEO_ALANLARI,
  ],
};
