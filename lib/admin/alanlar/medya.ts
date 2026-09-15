import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import type { KoleksiyonYapilandirmasi, Secenek } from '@/lib/admin/alanlar/tipler';

/**
 * Medya kitaplığı: içeriğe gömülen görsel, ses, video ve belge varlıkları.
 *
 * Yayın akışı yoktur (`durum` alanı şemada bulunmaz): bir dosya ya kitaplıkta
 * vardır ya da yoktur. Kendi sayfası da yoktur; varlıklar `kimlik` üzerinden
 * içerik gövdelerinden çağrılır — bu yüzden `siteYolu` tanımlanmaz.
 */

const TUR_SECENEKLERI: readonly Secenek[] = [
  { deger: 'gorsel', etiket: 'Görsel', tarif: 'JPEG, PNG, WebP, AVIF veya SVG.' },
  { deger: 'ses', etiket: 'Ses', tarif: 'Podcast bölümü veya ses kaydı.' },
  { deger: 'video', etiket: 'Video' },
  { deger: 'belge', etiket: 'Belge', tarif: 'PDF, sunum veya veri dosyası.' },
];

const URETIM_YONTEMI_SECENEKLERI: readonly Secenek[] = [
  { deger: 'fotograf', etiket: 'Fotoğraf' },
  { deger: 'illustrasyon', etiket: 'İllüstrasyon' },
  { deger: 'ekran-goruntusu', etiket: 'Ekran görüntüsü' },
  { deger: 'diyagram', etiket: 'Diyagram' },
  {
    deger: 'yapay-zeka',
    etiket: 'Yapay zekâ ile üretildi',
    tarif: 'Seçilirse görselin altında bu bilgi okuyucuya gösterilir.',
  },
];

export const MEDYA_YAPILANDIRMASI: KoleksiyonYapilandirmasi = {
  koleksiyon: KOLEKSIYONLAR.medya,
  ad: 'Medya varlığı',
  cogul: 'Medya kitaplığı',
  aciklama:
    'Görsel, ses, video ve belge varlıkları. Alternatif metin zorunludur: ekran okuyucular ve arama motorları dosyayı yalnızca bu metinle tanır.',
  anahtarAlan: 'kimlik',
  baslikAlani: 'altMetin',
  listeKolonlari: [
    { ad: 'kimlik', etiket: 'Kimlik', mono: true },
    { ad: 'tur', etiket: 'Tür', secenekler: TUR_SECENEKLERI },
    { ad: 'altMetin', etiket: 'Alternatif metin', enCok: 60 },
    { ad: 'uretimYontemi', etiket: 'Üretim', secenekler: URETIM_YONTEMI_SECENEKLERI },
    { ad: 'boyutBayt', etiket: 'Boyut', mono: true },
  ],
  filtreler: [
    { ad: 'tur', etiket: 'Tür', secenekler: TUR_SECENEKLERI },
    { ad: 'uretimYontemi', etiket: 'Üretim yöntemi', secenekler: URETIM_YONTEMI_SECENEKLERI },
  ],
  aramaAlanlari: ['kimlik', 'altMetin', 'kaynak', 'adres'],
  siralama: { olusturuldu: -1 },
  durumluMu: false,
  olusturulabilir: true,
  silinebilir: true,
  alanlar: [
    {
      ad: 'kimlik',
      etiket: 'Kimlik',
      tip: 'slug',
      zorunlu: true,
      genislik: 'yarim',
      yardim:
        'Dosyanın tekil kodu; içerik gövdesi görseli bu kodla çağırır (ör. diyagram-transformer-01). Yayımlandıktan sonra değiştirilmez, yoksa görsel kırılır.',
    },
    {
      ad: 'tur',
      etiket: 'Tür',
      tip: 'secim',
      zorunlu: true,
      secenekler: TUR_SECENEKLERI,
      genislik: 'yarim',
      yardim:
        'Dosyanın biçim ailesi. Sayfada hangi oynatıcı veya etiketle gösterileceğini belirler.',
    },
    {
      ad: 'adres',
      etiket: 'Adres',
      tip: 'metin',
      zorunlu: true,
      yardim:
        'Dosyanın tam yolu: site içi için /medya/ ile başlayan yol, dış barındırma için https:// ile başlayan adres.',
    },
    {
      ad: 'altMetin',
      etiket: 'Alternatif metin (alt)',
      tip: 'uzunMetin',
      zorunlu: true,
      satir: 2,
      enAz: 3,
      yardim:
        'Zorunlu alan — boş bırakılamaz. Dosyayı göremeyen okuyucu için ne anlattığını yazın; "görsel" veya "grafik" gibi içi boş ifadeler yerine ne gösterdiğini betimleyin. Ekran okuyucular ve arama motorları yalnızca bu metni okur.',
    },
    {
      ad: 'genislik',
      etiket: 'Genişlik (piksel)',
      tip: 'sayi',
      genislik: 'yarim',
      yardim:
        'Dosyanın gerçek piksel genişliği. Doldurulmazsa sayfa yüklenirken düzen kayar (CLS).',
    },
    {
      ad: 'yukseklik',
      etiket: 'Yükseklik (piksel)',
      tip: 'sayi',
      genislik: 'yarim',
      yardim: 'Dosyanın gerçek piksel yüksekliği; genişlikle birlikte yazılır.',
    },
    {
      ad: 'boyutBayt',
      etiket: 'Dosya boyutu (bayt)',
      tip: 'sayi',
      genislik: 'yarim',
      yardim: 'Bayt cinsinden boyut (1 MB = 1.048.576 bayt). Ağır dosyalar burada görünür.',
    },
    {
      ad: 'medyaTuru',
      etiket: 'MIME türü',
      tip: 'metin',
      genislik: 'yarim',
      yardim: 'Dosyanın MIME türü: image/webp, image/svg+xml, audio/mpeg, application/pdf.',
    },
    {
      ad: 'kaynak',
      etiket: 'Kaynak',
      tip: 'metin',
      yardim:
        'Dosya nereden geldi: kurum, arşiv, fotoğrafçı adı veya üretimde kullanılan aracın adı.',
    },
    {
      ad: 'telifNotu',
      etiket: 'Telif notu',
      tip: 'uzunMetin',
      satir: 2,
      yardim:
        'Lisans ve atıf koşulu, sayfada gösterileceği biçimde: "CC BY 4.0 — kurum adı" gibi. Hak durumu belirsizse dosya içerikte kullanılmaz.',
    },
    {
      ad: 'uretimYontemi',
      etiket: 'Üretim yöntemi',
      tip: 'secim',
      secenekler: URETIM_YONTEMI_SECENEKLERI,
      genislik: 'yarim',
      yardim:
        'Dosya nasıl üretildi. "Yapay zekâ ile üretildi" seçilirse sayfada görselin altına bu not basılır; üretim yöntemi gizlenmez.',
    },
  ],
};
