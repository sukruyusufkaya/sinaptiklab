import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { OGRENME_YOLLARI } from '@/lib/veri/ogrenme';
import {
  DURUM_ALANI,
  DURUM_SECENEKLERI,
  SEO_ALANLARI,
  SEVIYE_SECENEKLERI,
  SLUG_ALANI,
  SSS_ALANI,
  type KoleksiyonYapilandirmasi,
} from '@/lib/admin/alanlar/tipler';

/** Öğrenme rotaları `yolSlug` için seçenek listesi olur. */
const YOL_SECENEKLERI = OGRENME_YOLLARI.map((yol) => ({
  deger: yol.slug,
  etiket: yol.ad,
}));

/**
 * Dersler. Her ders bir öğrenme rotasına bağlıdır ve rota içinde `sira` ile
 * yerini alır; ders kalıbı teori → örnek → lab → test şeklindedir
 * (MASTER-PLAN §77).
 *
 * `alistirma` şemada iç içe bir nesnedir (`baslik`, `adimlar`, `cikti`) ve
 * kendi içinde üçünü birlikte zorunlu tutar. Nesnenin kendisi belge düzeyinde
 * zorunlu olmadığı için alt alanlar formda `zorunlu` işaretlenmez; yardım
 * metni "üçü birlikte" kuralını söyler.
 */
export const DERSLER_YAPILANDIRMASI: KoleksiyonYapilandirmasi = {
  koleksiyon: KOLEKSIYONLAR.dersler,
  ad: 'Ders',
  cogul: 'Dersler',
  aciklama:
    'Bir öğrenme rotasının tek adımı: ölçülebilir hedeflerle açılır, uygulamalı bir alıştırmayla kapanır ve bir teste bağlanır.',
  anahtarAlan: 'slug',
  baslikAlani: 'ad',
  listeKolonlari: [
    { ad: 'ad', etiket: 'Ders', enCok: 60 },
    { ad: 'yolSlug', etiket: 'Rota', secenekler: YOL_SECENEKLERI },
    { ad: 'sira', etiket: 'Sıra', mono: true },
    { ad: 'dakika', etiket: 'Dakika', mono: true },
    { ad: 'durum', etiket: 'Durum' },
  ],
  filtreler: [
    { ad: 'durum', etiket: 'Durum', secenekler: DURUM_SECENEKLERI },
    { ad: 'yolSlug', etiket: 'Rota', secenekler: YOL_SECENEKLERI },
    { ad: 'seviye', etiket: 'Seviye', secenekler: SEVIYE_SECENEKLERI },
  ],
  aramaAlanlari: ['ad', 'ozet', 'hedefler', 'slug'],
  siralama: { yolSlug: 1, sira: 1 },
  durumluMu: true,
  siteYolu: (belge) => (belge.slug ? `/ogren/dersler/${String(belge.slug)}/` : undefined),
  olusturulabilir: true,
  silinebilir: true,
  alanlar: [
    {
      ad: 'ad',
      etiket: 'Ders adı',
      tip: 'metin',
      zorunlu: true,
      yardim: 'Soru ya da eylem kalıbında: "Token nedir ve neden önemli?", "Hibrit arama kurmak".',
    },
    SLUG_ALANI,
    {
      ad: 'yolSlug',
      etiket: 'Öğrenme rotası',
      tip: 'iliski',
      zorunlu: true,
      hedefKoleksiyon: KOLEKSIYONLAR.ogrenmeYollari,
      genislik: 'yarim',
      yardim: 'Dersin bağlı olduğu rota. Rotasız ders /ogren listelerinde görünmez.',
    },
    {
      ad: 'sira',
      etiket: 'Rota içindeki sıra',
      tip: 'sayi',
      enAz: 1,
      genislik: 'yarim',
      yardim: 'Rotada kaçıncı ders — 1 ile başlar. Aynı rotada iki derse aynı numarayı vermeyin.',
    },
    {
      ad: 'seviye',
      etiket: 'Seviye',
      tip: 'secim',
      zorunlu: true,
      secenekler: SEVIYE_SECENEKLERI,
      genislik: 'yarim',
      yardim: 'Rotanın genel seviyesi değil, bu dersin kendi seviyesi.',
    },
    {
      ad: 'dakika',
      etiket: 'Süre (dakika)',
      tip: 'sayi',
      zorunlu: true,
      enAz: 1,
      enCok: 480,
      genislik: 'yarim',
      yardim: 'Okuma ve alıştırmanın toplamı. Gerçekçi ölçün: rota saati bu sayıların toplamıdır.',
    },
    DURUM_ALANI,
    {
      ad: 'ozet',
      etiket: 'Özet',
      tip: 'uzunMetin',
      satir: 2,
      yardim:
        'Ders kartında görünen tek cümle. Dersin ne öğrettiğini söyler, ne anlattığını değil.',
    },
    {
      ad: 'hedefler',
      etiket: 'Öğrenme hedefleri',
      tip: 'metinDizisi',
      yardim:
        'Her satır ölçülebilir tek yeti; "…-ebilmek" ile bitir: "Bir metnin yaklaşık token sayısını tahmin edebilmek".',
    },
    {
      ad: 'kavramlar',
      etiket: 'Geçen Atlas kavramları',
      tip: 'cokluIliski',
      hedefKoleksiyon: KOLEKSIYONLAR.atlas,
      yardim: 'Derste geçen kavramların slugları. Ders sayfasında Atlas bağlantısına dönüşür.',
    },
    {
      ad: 'onkosullar',
      etiket: 'Önkoşul kavramlar',
      tip: 'cokluIliski',
      hedefKoleksiyon: KOLEKSIYONLAR.atlas,
      yardim: 'Bu dersten önce bilinmesi gerekenler. Beceri grafiği bu alandan üretilir.',
    },
    {
      ad: 'govde',
      etiket: 'Gövde',
      tip: 'bloklar',
      yardim:
        'Kalıp: kısa cevap → teori → örnek → yaygın yanılgılar. Sayısal örnek verirken temsilî olduğunu tablo açıklamasına yaz.',
    },
    {
      ad: 'alistirma.baslik',
      etiket: 'Alıştırma başlığı',
      tip: 'metin',
      yardim:
        'Öğrencinin yapacağı işin adı: "Kendi metninizin token profilini çıkarın". Alıştırmanın üç alanı birlikte doldurulur.',
    },
    {
      ad: 'alistirma.adimlar',
      etiket: 'Alıştırma adımları',
      tip: 'metinDizisi',
      yardim:
        'Her satır sırayla uygulanabilir tek eylem. Kendi verisiyle yapılabilmeli; hazır çözüm verme.',
    },
    {
      ad: 'alistirma.cikti',
      etiket: 'Alıştırma çıktısı',
      tip: 'uzunMetin',
      satir: 2,
      yardim:
        'Adımlar bitince elde kalan somut şey: "kalem bazlı token bütçesi tablosu". Boşsa öğrenci bitirdiğini anlayamaz.',
    },
    SSS_ALANI,
    {
      ad: 'testSlug',
      etiket: 'Bağlı test',
      tip: 'iliski',
      hedefKoleksiyon: KOLEKSIYONLAR.testler,
      genislik: 'yarim',
      yardim: 'Ders sonunda önerilen test. Boş bırakılırsa sayfada test bağlantısı çıkmaz.',
    },
    ...SEO_ALANLARI,
  ],
};
