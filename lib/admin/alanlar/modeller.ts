import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import {
  KAYNAKLAR_ALANI,
  DURUM_ALANI,
  DURUM_SECENEKLERI,
  SEO_ALANLARI,
  SLUG_ALANI,
  SON_DOGRULAMA_ALANI,
  type KoleksiyonYapilandirmasi,
  type Secenek,
} from '@/lib/admin/alanlar/tipler';

/**
 * Model kaydında BİRBİRİNDEN AYRI iki durum alanı vardır; karıştırılmamalı:
 *
 * - `durum`            → panelin yayın akışı (taslak / incelemede / yayında / arşiv).
 *                        Sayfanın sitede görünüp görünmeyeceğini belirler.
 * - `guncellikDurumu`  → modelin kendi yaşam döngüsü (güncel / yeni / önceki sürüm / emekli).
 *                        Sayfa yayında olsa bile modelin tazeliğini anlatır.
 *
 * Emekli bir model "yayında" kalabilir: adresi korunur, kartında emekli etiketi çıkar.
 */
const GUNCELLIK_SECENEKLERI: readonly Secenek[] = [
  { deger: 'guncel', etiket: 'Güncel', tarif: 'Sağlayıcının bugün önerdiği aktif sürüm.' },
  {
    deger: 'yeni',
    etiket: 'Yeni',
    tarif: 'Yeni duyuruldu; ölçümler ve fiyat bilgisi henüz oturmadı.',
  },
  {
    deger: 'onceki-surum',
    etiket: 'Önceki sürüm',
    tarif: 'Hâlâ erişilebilir, ancak yerine yeni bir sürüm geçti.',
  },
  {
    deger: 'emekli',
    etiket: 'Emekli',
    tarif: 'API erişimi kapandı; kayıt tarihsel referans olarak kalır.',
  },
];

export const MODELLER_YAPILANDIRMASI: KoleksiyonYapilandirmasi = {
  koleksiyon: KOLEKSIYONLAR.modeller,
  ad: 'Model',
  cogul: 'Modeller',
  aciklama:
    'Yapay zekâ modelleri varlık olarak tutulur: kalıcı adres, sağlayıcı bağı ve alan başına son doğrulama tarihi. Model seçici ve karşılaştırma sayfaları bu koleksiyondan türetilir.',
  anahtarAlan: 'slug',
  baslikAlani: 'ad',
  listeKolonlari: [
    { ad: 'ad', etiket: 'Model' },
    { ad: 'saglayici', etiket: 'Sağlayıcı' },
    { ad: 'tip', etiket: 'Tip', enCok: 28 },
    { ad: 'guncellikDurumu', etiket: 'Güncellik', secenekler: GUNCELLIK_SECENEKLERI },
    { ad: 'durum', etiket: 'Durum' },
  ],
  filtreler: [
    { ad: 'durum', etiket: 'Yayın durumu', secenekler: DURUM_SECENEKLERI },
    { ad: 'guncellikDurumu', etiket: 'Güncellik', secenekler: GUNCELLIK_SECENEKLERI },
  ],
  aramaAlanlari: ['ad', 'saglayici', 'slug', 'ozet', 'vurgu'],
  siralama: { ad: 1 },
  durumluMu: true,
  siteYolu: (belge) => (belge.slug ? `/modeller/${String(belge.slug)}/` : undefined),
  olusturulabilir: true,
  silinebilir: true,
  alanlar: [
    {
      ad: 'ad',
      etiket: 'Model adı',
      tip: 'metin',
      zorunlu: true,
      yardim: 'Sağlayıcının yazdığı biçimde: "Claude Ailesi", "Llama Ailesi".',
      genislik: 'yarim',
    },
    SLUG_ALANI,
    {
      ad: 'saglayici',
      etiket: 'Sağlayıcı adı',
      tip: 'metin',
      zorunlu: true,
      yardim: 'Görünen ad: OpenAI, Anthropic, Google DeepMind. Kartta bu metin basılır.',
      genislik: 'yarim',
    },
    {
      ad: 'saglayiciSlug',
      etiket: 'Sağlayıcı kaydı',
      tip: 'iliski',
      hedefKoleksiyon: KOLEKSIYONLAR.sirketler,
      yardim: 'Şirket kaydına bağlar; şirket sayfasındaki model listesi buradan doldurulur.',
      genislik: 'yarim',
    },
    {
      ad: 'aileMi',
      etiket: 'Aile künyesi mi',
      tip: 'mantik',
      genislik: 'yarim',
      yardim:
        'Bu kayıt tek bir modeli değil bir MODEL AİLESİNİ anlatıyorsa işaretlenir ' +
        '(ör. "GPT Ailesi"). Aile künyesi üyelerini toplayan hub sayfasıdır.',
    },
    {
      ad: 'aileSlug',
      etiket: 'Bağlı olduğu aile',
      tip: 'iliski',
      hedefKoleksiyon: KOLEKSIYONLAR.modeller,
      genislik: 'yarim',
      yardim:
        'Bu model bir ailenin üyesiyse ailenin künye kaydı. Aile künyesinin kendisinde ' +
        'boş bırakılır. Slug öneki yeterli değildir: gpt-image ve gpt-oss, GPT metin ' +
        'modeli ailesine ait DEĞİLDİR.',
    },
    {
      ad: 'tip',
      etiket: 'Model tipi',
      tip: 'metin',
      zorunlu: true,
      yardim: 'Örnek: Multimodal LLM, Açık ağırlıklı LLM, Gömme modeli, Görsel üretim.',
      genislik: 'yarim',
    },
    {
      ad: 'guncellikDurumu',
      etiket: 'Güncellik durumu',
      tip: 'secim',
      secenekler: GUNCELLIK_SECENEKLERI,
      yardim: 'Modelin yaşam döngüsü. Yayın akışı değil — onu yandaki Durum alanı belirler.',
      genislik: 'yarim',
    },
    DURUM_ALANI,
    {
      ad: 'surum',
      etiket: 'Sürüm etiketi',
      tip: 'metin',
      yardim: 'Sağlayıcının sürüm adı veya numarası. Aile kaydıysa boş bırakılır.',
      genislik: 'yarim',
    },
    {
      ad: 'yayin',
      etiket: 'Yayın tarihi',
      tip: 'tarih',
      yardim: 'Modelin duyurulduğu gün (YYYY-AA-GG). Sağlayıcı kesin gün vermiyorsa boş bırakın.',
      genislik: 'yarim',
    },
    {
      ad: 'baglamPenceresi',
      etiket: 'Bağlam penceresi',
      tip: 'metin',
      yardim: 'Sağlayıcının açıkladığı değer: "200K token". Ölçüm yoksa aralık yazın.',
      genislik: 'yarim',
    },
    {
      ad: 'modaliteler',
      etiket: 'Modaliteler',
      tip: 'metinDizisi',
      yardim: 'Her satıra bir girdi türü: Metin, Görsel, Ses, Video.',
    },
    {
      ad: 'acikKaynak',
      etiket: 'Açık kaynak',
      tip: 'mantik',
      yardim: 'Eğitim kodu ve veri hattı açık yayımlandıysa işaretlenir.',
      genislik: 'yarim',
    },
    {
      ad: 'acikAgirlik',
      etiket: 'Açık ağırlık',
      tip: 'mantik',
      yardim: 'Ağırlıklar indirilebiliyorsa işaretlenir. Açık ağırlık açık kaynak demek değildir.',
      genislik: 'yarim',
    },
    {
      ad: 'lisans',
      etiket: 'Lisans',
      tip: 'metin',
      yardim: 'Ağırlıkların lisans adı: Apache-2.0, Llama Community License, kapalı.',
      genislik: 'yarim',
    },
    {
      ad: 'api',
      etiket: 'Genel API var',
      tip: 'mantik',
      yardim: 'Herkese açık, ücretli veya ücretsiz bir API uç noktası varsa işaretlenir.',
      genislik: 'yarim',
    },
    {
      ad: 'vurgu',
      etiket: 'Öne çıkan yön',
      tip: 'metin',
      yardim: 'Tek satır: bu model hangi işte tercih ediliyor? Model seçicide bu metin görünür.',
    },
    {
      ad: 'ozet',
      etiket: 'Özet (answer-first)',
      tip: 'uzunMetin',
      satir: 4,
      yardim:
        'İlk cümle "nedir" sorusunu tek başına cevaplar; ardından ne zaman seçildiğini yazın.',
    },
    {
      ad: 'yetenekler',
      etiket: 'Yetenekler',
      tip: 'metinDizisi',
      yardim: 'Her satıra bir yetenek: Araç çağırma, Yapılandırılmış çıktı, Görsel anlama.',
    },
    {
      ad: 'sinirliliklar',
      etiket: 'Sınırlılıklar',
      tip: 'metinDizisi',
      yardim: 'Her satıra bir kısıt: kapalı ağırlıklar, veri ikametgâhı, kota. Pazarlama dili yok.',
    },
    {
      ad: 'kullanimAlanlari',
      etiket: 'Kullanım alanları',
      tip: 'metinDizisi',
      yardim: 'Somut senaryolar: Sohbet arayüzleri, Ajan iş akışları, Kod inceleme.',
    },
    {
      ad: 'fiyatlandirma',
      etiket: 'Fiyatlandırma',
      tip: 'json',
      yardim:
        'Anahtarlar: girdiBirimFiyat, ciktiBirimFiyat (sayı), birim ("1M token"), paraBirimi ("USD"), kaynakAdres (sağlayıcının fiyat sayfası). Kaynak adresi yoksa fiyat girilmez.',
    },
    // Bağlam penceresi, fiyat ve yayın tarihi zamanla değişir; kaynak olmadan model tablosu doğrulanamaz bir iddia listesine döner (§59).
    KAYNAKLAR_ALANI,
    SON_DOGRULAMA_ALANI,
    ...SEO_ALANLARI,
  ],
};
