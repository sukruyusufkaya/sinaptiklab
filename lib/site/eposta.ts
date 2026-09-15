import { SITE } from '@/lib/site';

/**
 * E-posta gönderimi — TAŞIMA KATMANI TAKILABİLİR.
 *
 * DURUM: projede yapılandırılmış bir e-posta sağlayıcısı YOK. Bu modül akışı
 * eksiksiz kurar ama mektubu ancak `EPOSTA_SAGLAYICI` ortam değişkeni
 * tanımlıysa gönderir; tanımlı değilse gönderimi sunucu günlüğüne yazar ve
 * çağırana "gönderilmedi" bilgisini döner.
 *
 * NEDEN BÖYLE: doğrulama ve parola sıfırlama akışlarının kodu sağlayıcı
 * seçiminden bağımsızdır. Sağlayıcı gelmediği için akışı hiç yazmamak,
 * üyeliği bütünüyle bloke etmek olurdu; sahte bir "gönderildi" demek ise
 * kullanıcıyı hiç gelmeyecek bir mektubu beklemeye bırakırdı. Üçüncü yol
 * seçildi: akış çalışır, gönderim durumu DÜRÜSTÇE bildirilir, arayüz buna göre
 * mesaj gösterir.
 *
 * SAĞLAYICI EKLEMEK: `gonder()` içindeki tek `if` bloğuna bir dal eklenir.
 * Anahtar `.env.local` içinde durur (CLAUDE.md kural 8 — sır kodda durmaz).
 *
 * GÜVENLİK: bu modül ASLA düz parola, oturum tokeni ya da tam anahtar
 * günlüğe yazmaz. Bağlantılar günlüğe yazılırken anahtar kısmı kısaltılır.
 */

export type EpostaSonucu =
  { gonderildi: true } | { gonderildi: false; neden: 'saglayici-yok' | 'hata' };

export type Mektup = {
  alici: string;
  konu: string;
  /** Düz metin gövde. HTML gövde bilinçli olarak yok: taşıma basit kalsın. */
  govde: string;
};

/** Bağlantıdaki anahtarı günlükte kısaltır. */
function gunlukIcinKisalt(metin: string): string {
  return metin.replace(/([?&](anahtar|token)=)[^&\s]+/gi, '$1…');
}

export async function gonder(mektup: Mektup): Promise<EpostaSonucu> {
  const saglayici = process.env.EPOSTA_SAGLAYICI;

  if (!saglayici) {
    /*
     * Sağlayıcı yok. Geliştirme ve ilk kurulum sırasında bağlantının
     * kaybolmaması için gövde günlüğe yazılır — üretimde sağlayıcı
     * tanımlanmadan üyelik akışı açılmamalı.
     */
    console.warn(
      [
        '[eposta] SAĞLAYICI TANIMLI DEĞİL — mektup gönderilmedi.',
        `  alıcı : ${mektup.alici}`,
        `  konu  : ${mektup.konu}`,
        `  gövde : ${gunlukIcinKisalt(mektup.govde)}`,
      ].join('\n'),
    );
    return { gonderildi: false, neden: 'saglayici-yok' };
  }

  try {
    // Sağlayıcı dalları buraya eklenir (Resend, Postmark, SES…).
    console.error(`[eposta] tanınmayan sağlayıcı: ${saglayici}`);
    return { gonderildi: false, neden: 'hata' };
  } catch (hata) {
    console.error('[eposta] gönderim hatası:', hata);
    return { gonderildi: false, neden: 'hata' };
  }
}

/* --- MEKTUP ŞABLONLARI ---------------------------------------------------- */

export function dogrulamaMektubu(alici: string, adres: string): Mektup {
  return {
    alici,
    konu: `${SITE.ad} — e-posta adresinizi doğrulayın`,
    govde: [
      'Merhaba,',
      '',
      `${SITE.ad} üyeliğinizi tamamlamak için aşağıdaki bağlantıya gidin:`,
      adres,
      '',
      'Bağlantı 48 saat geçerlidir.',
      '',
      'Bu kaydı siz yapmadıysanız bu mektubu yok sayabilirsiniz; hesap',
      'doğrulanmadan üyelik özellikleri açılmaz.',
    ].join('\n'),
  };
}

export function parolaSifirlamaMektubu(alici: string, adres: string): Mektup {
  return {
    alici,
    konu: `${SITE.ad} — parola sıfırlama`,
    govde: [
      'Merhaba,',
      '',
      'Parolanızı sıfırlamak için aşağıdaki bağlantıya gidin:',
      adres,
      '',
      'Bağlantı 1 saat geçerlidir ve yalnızca bir kez kullanılabilir.',
      '',
      'Bu talebi siz yapmadıysanız hiçbir şey yapmanız gerekmez; parolanız',
      'değişmedi.',
    ].join('\n'),
  };
}

/**
 * Gönderim sağlayıcısı yapılandırılmış mı?
 *
 * NEDEN AYRI BİR SORU: parola sıfırlama akışı kullanıcıya "gönderildi" der,
 * ama sağlayıcı yoksa hiçbir mektup gitmez. İletiyi düzeltmek için "gönderildi
 * mi" bilgisi gerekir — ne var ki bunu `gonder()` sonucundan okumak HESAP
 * VARLIĞINI SIZDIRIR: mektup yalnızca hesap varsa gönderilir, dolayısıyla
 * "gönderilemedi" iletisi ancak hesap varken görünür ve saldırgan adres
 * kayıtlı mı diye sorabilir hâle gelir.
 *
 * Bu fonksiyon hesaptan BAĞIMSIZ bir olguyu söyler (ortam değişkeni var mı),
 * yani her iki dalda da aynı cevabı üretir. Sızıntı kanalı açmadan dürüst
 * ileti kurmanın yolu budur.
 */
export function gonderimYapilandirildiMi(): boolean {
  return Boolean(process.env.EPOSTA_SAGLAYICI);
}
