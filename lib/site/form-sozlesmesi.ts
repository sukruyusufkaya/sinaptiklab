/**
 * Site formlarının PAYLAŞILAN sözleşmesi: sonuç tipi, seçenek listeleri ve
 * uzunluk sınırları.
 *
 * NEDEN AYRI MODÜL
 *
 * `lib/site/form-eylemleri.ts` `'use server'` ile işaretlidir ve yalnızca
 * `async` fonksiyon dışa açabilir: sabit, tip veya seçenek dizisi oradan
 * çıkamaz. Formu çizen istemci bileşeni ile gönderimi doğrulayan sunucu
 * eyleminin AYNI listeye bakması gerektiği için liste burada durur. Bu modül
 * veritabanına dokunmaz, `next/headers` içe almaz; istemci bileşeni de güvenle
 * içe alabilir.
 *
 * SINIRLAR ŞEMADAN GELİR
 *
 * `arama_kayitlari.sorgu` şemada `maxLength: 200`, `aboneler.eposta` ve
 * `kullanicilar.eposta` şemada `^[^@\s]+@[^@\s]+\.[^@\s]+$` desenini taşır.
 * Buradaki değerler o şemanın (bkz. `lib/mongo/koleksiyonlar.ts`) birebir
 * karşılığıdır; ayrışırlarsa yazma "Document failed validation" ile düşer.
 * Şemanın sınır koymadığı serbest alanlar (`form_kayitlari.alanlar` bir
 * `object`) için sınır BURADA tanımlanır — sınırsız metin kabul eden bir form,
 * koleksiyonu tek istekle şişirmenin en kolay yoludur.
 */

/* --- SONUÇ TİPİ ----------------------------------------------------------- */

/**
 * Form eyleminin sonucu.
 *
 * Ayrık birleşim (discriminated union): `tamam` false iken `hata` alanı
 * KESİN vardır, bu yüzden istemci bileşeni "sessiz başarısızlık" üretemez —
 * hata dalını çizmeyi unutursa TypeScript derlemez.
 */
export type FormSonucu =
  | { tamam: true; ileti: string }
  | { tamam: false; hata: string; alanHatalari?: Record<string, string> };

/** `useActionState` başlangıç durumu: henüz gönderim yok. */
export const FORM_BASLANGICI: FormSonucu | null = null;

/* --- E-POSTA -------------------------------------------------------------- */

/**
 * Şemadaki desenin BİREBİR aynısı (`aboneler.eposta`, `kullanicilar.eposta`).
 *
 * Uygulama katmanında daha gevşek bir desen kullanmak, doğrulamayı Atlas'a
 * bırakmak demektir: kullanıcı "geçersiz e-posta" yerine "İşlem tamamlanamadı"
 * görür. Daha sıkı bir desen ise şemanın kabul ettiği adresi reddeder.
 */
export const EPOSTA_DESENI = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** RFC 5321'in adres üst sınırı. Şemada uzunluk kısıtı yok; burada var. */
export const EPOSTA_EN_COK = 254;

/* --- İLETİŞİM FORMU ------------------------------------------------------- */

export const AD_EN_AZ = 2;
export const AD_EN_COK = 120;
export const MESAJ_EN_AZ = 10;
export const MESAJ_EN_COK = 4000;

/**
 * İletişim formunun konu seçenekleri ve her konunun düştüğü kuyruk.
 *
 * `formTuru`, `form_kayitlari` şemasındaki enum değerlerinden biridir
 * (`iletisim`, `teklif`, `etkinlik-kayit`, `readiness-talebi`, `katki`) ve
 * panelin kuyruk süzgecini besler: kurumsal proje talebi "teklif" kuyruğuna,
 * uzman katkısı "katkı" kuyruğuna düşer. Eşleme dize türetmesiyle DEĞİL, açık
 * haritayla yapılır.
 */
export const ILETISIM_KONULARI = [
  { deger: 'kurumsal', ad: 'Kurumsal proje / danışmanlık', formTuru: 'teklif' },
  { deger: 'egitim', ad: 'Kurumsal eğitim', formTuru: 'teklif' },
  { deger: 'duzeltme', ad: 'İçerik düzeltmesi', formTuru: 'iletisim' },
  { deger: 'katki', ad: 'Uzman katkısı', formTuru: 'katki' },
  { deger: 'basin', ad: 'Basın ve veri talebi', formTuru: 'iletisim' },
  { deger: 'diger', ad: 'Diğer', formTuru: 'iletisim' },
] as const satisfies readonly { deger: string; ad: string; formTuru: string }[];

export type IletisimKonusu = (typeof ILETISIM_KONULARI)[number]['deger'];

/* --- BÜLTEN LİSTELERİ ----------------------------------------------------- */

/**
 * Bülten seçenekleri: GÖRÜNEN AD ile ŞEMA DEĞERİ arasındaki tek eşleme yeri.
 *
 * Neden burada: ana sayfa ve `/bulten/` sayfası aynı dört bülteni kendi
 * dizilerinde tutuyordu; hiçbiri şemadaki `aboneler.listeler` enum değerini
 * taşımıyordu. "Sinaptik Enterprise" adının şema karşılığı `kurumsal` —
 * addan türetilemez, harita gerekir. `deger` alanı doğrudan onay kutusunun
 * `value`'su olur; sunucu tarafı gelen değeri bu listeye karşı doğrular, ad
 * üzerinden arama yapmaz (ad değişince bağ sessizce kopmasın diye).
 *
 * `varsayilan`, formun ilk hâlinde işaretli gelen bültenleri belirtir; bu bir
 * KVKK sorunu değildir çünkü listeler onayın KENDİSİ değil, onayın kapsamıdır
 * — abonelik `onayDurumu: 'bekliyor'` ile başlar ve çift onayla tamamlanır.
 */
export const BULTEN_SECENEKLERI = [
  { deger: 'daily', ad: 'Sinaptik Daily', varsayilan: true },
  { deger: 'weekly', ad: 'Sinaptik Weekly', varsayilan: true },
  { deger: 'research', ad: 'Sinaptik Research', varsayilan: false },
  { deger: 'kurumsal', ad: 'Sinaptik Enterprise', varsayilan: false },
] as const satisfies readonly { deger: string; ad: string; varsayilan: boolean }[];

/** Şemadaki `aboneler.listeler` enum'unun uygulama karşılığı. */
export type BultenListesi = (typeof BULTEN_SECENEKLERI)[number]['deger'];

export const BULTEN_DEGERLERI: readonly BultenListesi[] = BULTEN_SECENEKLERI.map((b) => b.deger);

/** Gelen dizenin şema enum'unda olup olmadığını söyler (form girdisi denetimi). */
export function bultenListesiMi(deger: unknown): deger is BultenListesi {
  return typeof deger === 'string' && (BULTEN_DEGERLERI as readonly string[]).includes(deger);
}

/** Bülten kayıtları kapalıyken formun yerine basılan bilgi. */
export const BULTEN_KAPALI_ILETISI =
  'Bülten kayıtları şu an kapalı. Kısa süre içinde yeniden açılacak.';

/* --- ARAMA KAYDI ---------------------------------------------------------- */

/** Şemadaki `arama_kayitlari.sorgu` `maxLength` değeri. */
export const SORGU_EN_COK = 200;

/**
 * Kaydedilecek en kısa sorgu.
 *
 * Tek ve iki harfli sorgular kullanıcı yazmayı bitirmeden oluşur; bunları
 * kaydetmek içerik açığı panosunu "a", "ra", "ai" gibi kırıntılarla doldurur.
 */
export const SORGU_EN_AZ = 3;

/* --- READINESS PAYLAŞIMI -------------------------------------------------- */

export const KURUM_ADI_EN_COK = 160;

/** Serbest metin yerine kapalı liste: panelde gruplanabilir olsun. */
export const CALISAN_ARALIKLARI = ['1-49', '50-249', '250-999', '1000+'] as const;

export type CalisanAraligi = (typeof CALISAN_ARALIKLARI)[number];

export function calisanAraligiMi(deger: unknown): deger is CalisanAraligi {
  return typeof deger === 'string' && (CALISAN_ARALIKLARI as readonly string[]).includes(deger);
}

/* --- EYLEM GİRDİ TİPLERİ -------------------------------------------------- */

/**
 * Test ve readiness eylemleri `FormData` yerine nesne alır: ikisi de bir HTML
 * formundan değil, hesaplamayı yapan istemci bileşeninden çağrılır.
 *
 * Tipler `'use server'` modülünde değil BURADA durur: o modülün dışa açtığı
 * her şey çalışma zamanında bir eylem referansına dönüşür, tipler ise yalnızca
 * derleme zamanı sözleşmesidir ve istemci tarafı da bunları içe alır.
 */
export type TestSonucuGirdisi = {
  testSlug: string;
  puan: number;
  dogruSayisi: number;
  soruSayisi: number;
  seviye?: string;
  /** Beceri adı → yüzde. Şemada serbest `object`. */
  beceriKirilimi?: Record<string, number>;
  sureSaniye?: number;
  /** Anonim çözümde tarayıcıda üretilen rastgele anahtar. */
  oturumAnahtari?: string;
};

export type ReadinessSonucuGirdisi = {
  /** Boyut slug'ı → yüzde. Şemada serbest `object`, şemada ZORUNLU. */
  boyutPuanlari: Record<string, number>;
  toplamPuan: number;
  olgunlukSeviyesi?: string;
  kurumAdi?: string;
  calisanAraligi?: string;
  /** Açık rıza; yalnızca kullanıcı işaretlerse `true` gelir. */
  iletisimIzni?: boolean;
  /** YALNIZCA `iletisimIzni` true ise yazılır. */
  eposta?: string;
};
