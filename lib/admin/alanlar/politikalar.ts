import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import {
  DURUM_ALANI,
  DURUM_SECENEKLERI,
  SEO_ALANLARI,
  SLUG_ALANI,
  SURUMLER_ALANI,
  type Alan,
  type KoleksiyonYapilandirmasi,
} from '@/lib/admin/alanlar/tipler';
import type { Izin } from '@/lib/yetki/roller';

/**
 * Hukuki metin koleksiyonu: gizlilik, KVKK aydınlatma, çerez politikası,
 * kullanım şartları, editoryal ilkeler.
 *
 * Politika metni editoryal içerik değildir: tek bir cümlesi bile
 * `icerik:yaz` iznine bırakılmaz. Bu yüzden yapılandırmadaki HER alan
 * `politika:yaz` iznini taşır (bkz. `lib/yetki/roller.ts` — izin yalnızca
 * `yonetici` rolünde). Paylaşılan alan parçaları da aynı izinle sarılır.
 */
const IZIN: Izin = 'politika:yaz';

/** Paylaşılan parçayı yeniden yazmadan izinle sarar. */
function izinli(alan: Alan): Alan {
  return { ...alan, izin: IZIN };
}

export const POLITIKALAR_YAPILANDIRMASI: KoleksiyonYapilandirmasi = {
  koleksiyon: KOLEKSIYONLAR.politikalar,
  ad: 'Politika metni',
  cogul: 'Politika metinleri',
  aciklama:
    'Hukuki metinler: gizlilik, KVKK aydınlatma, çerez politikası, kullanım şartları. Her değişiklik sürüm numarası ve yürürlük tarihiyle kayda geçer (MASTER-PLAN §64–§65).',
  anahtarAlan: 'slug',
  baslikAlani: 'baslik',
  listeKolonlari: [
    { ad: 'baslik', etiket: 'Metin' },
    { ad: 'surum', etiket: 'Sürüm', mono: true },
    { ad: 'yururlukTarihi', etiket: 'Yürürlük', mono: true },
    { ad: 'hukukiOnay', etiket: 'Hukuki onay' },
    { ad: 'durum', etiket: 'Durum' },
  ],
  filtreler: [
    { ad: 'durum', etiket: 'Durum', secenekler: DURUM_SECENEKLERI },
    {
      ad: 'hukukiOnay',
      etiket: 'Hukuki onay',
      secenekler: [
        { deger: 'true', etiket: 'Onaylı', tarif: 'Hukuk incelemesi tamamlandı.' },
        { deger: 'false', etiket: 'Onaysız', tarif: 'Sayfada taslak uyarısı görünür.' },
      ],
    },
  ],
  aramaAlanlari: ['baslik', 'ozet', 'slug'],
  siralama: { baslik: 1 },
  durumluMu: true,
  // Politika metinleri kök dizinde yaşar: /gizlilik/, /kvkk-aydinlatma/ …
  siteYolu: (belge) => (belge.slug ? `/${String(belge.slug)}/` : undefined),
  olusturulabilir: true,
  // Yürürlükten kalkan metin silinmez, arşive alınır: eski sürüme atıf yapılabilmeli.
  silinebilir: false,
  alanlar: [
    {
      ad: 'baslik',
      etiket: 'Metin adı',
      tip: 'metin',
      zorunlu: true,
      izin: IZIN,
      genislik: 'yarim',
      yardim: 'Sayfa başlığıyla aynı yazılır: "Gizlilik politikası", "KVKK aydınlatma metni".',
    },
    {
      ...izinli(SLUG_ALANI),
      yardim:
        'Sayfanın kök adresi bundan üretilir: "gizlilik" → /gizlilik/. Yayımlanmış bir politikanın slug\'ı değiştirilmez; değişecekse yönlendirme kaydı da açılır.',
    },
    {
      ad: 'surum',
      etiket: 'Sürüm',
      tip: 'metin',
      zorunlu: true,
      izin: IZIN,
      genislik: 'yarim',
      yardim:
        'Anlam değişmediyse 1.1, hak ve yükümlülük değiştiyse 2.0 gibi artırın. Sürüm geçmişindeki son kayıtla aynı olmalı.',
    },
    {
      ad: 'yururlukTarihi',
      etiket: 'Yürürlük tarihi',
      tip: 'tarih',
      zorunlu: true,
      izin: IZIN,
      genislik: 'yarim',
      yardim:
        'Bu sürümün bağlayıcı olduğu tarih (YYYY-AA-GG). Yazım tarihi değil: ileri tarihli yürürlük verilebilir.',
    },
    izinli(DURUM_ALANI),
    {
      ad: 'hukukiOnay',
      etiket: 'Hukuki onay alındı',
      tip: 'mantik',
      izin: IZIN,
      genislik: 'yarim',
      varsayilan: false,
      yardim:
        'İşaretli değilse sayfada "Bu metin editoryal taslaktır ve hukuki görüş yerine geçmez" uyarısı gösterilir. Yalnızca hukuk incelemesi tamamlandığında işaretleyin.',
    },
    {
      ad: 'ozet',
      etiket: 'Özet',
      tip: 'uzunMetin',
      izin: IZIN,
      satir: 3,
      yardim:
        'Metnin başında görünen bir–iki cümle: hangi soruyu cevaplıyor? Örnek: "Hangi veriler toplanıyor, ne için kullanılıyor, ne kadar süre saklanıyor?"',
    },
    {
      ad: 'govde',
      etiket: 'Gövde',
      tip: 'bloklar',
      izin: IZIN,
      yardim:
        'Her bölüm bir altbaşlıkla açılır (amaç, işlenen veriler, haklar, iletişim…). Altbaşlık kimliği kalıcı bağlantı olur, sonradan değiştirilmez.',
    },
    {
      ...izinli(SURUMLER_ALANI),
      yardim:
        'Politikalarda zorunlu: her yayımlanan sürüm için bir satır. "Neyin değiştiği" hukuken izlenebilir olmalı — "küçük düzeltmeler" yazmayın, değişen maddeyi yazın.',
    },
    ...SEO_ALANLARI.map(izinli),
    {
      ad: 'seo.ogGorsel',
      etiket: 'Paylaşım görseli',
      tip: 'metin',
      izin: IZIN,
      yardim:
        'Bağlantı paylaşıldığında görünen görselin adresi. Boş bırakılırsa site geneli görsel kullanılır.',
    },
  ],
};
