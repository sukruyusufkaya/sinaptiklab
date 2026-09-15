/**
 * Bir metinde ÖLÇÜM SONUCU iddiası var mı? — değişmez kural 5'in denetleyicisi.
 *
 * Temsilî bir vaka ("gerçek müşteri işi değil") yöntemi anlatır, sonuç
 * iddia etmez: "%38 azaldı", "4 haftada devreye alındı", "412 iş emri" gibi
 * ifadeler uydurma ölçümdür. Bu modül o ifadeleri arar.
 *
 * KENDİ MODÜLÜNDE DURUYOR, denetim betiğinin içinde değil. Gerekçe
 * `lib/icerik/baglam-penceresi.ts` ile aynı: kalıbı betiğin içine gömdüğümde
 * test etmek için kopyalamak gerekti, kopya kaçış karakterlerini bozdu ve
 * "doğru çalışıyor" sanılan bir sürüm ortaya çıktı. Tek tanım, tek test.
 *
 * ÜÇ TÜRKÇE TUZAĞI — üçü de gerçek hata olarak yaşandı:
 *
 * 1. **`\b` KULLANILAMAZ.** JavaScript'te `\w` yalnızca `[A-Za-z0-9_]`dir;
 *    `ı ş ğ ü ö ç` sözcük karakteri sayılmaz. Bu yüzden `\bkat\b` kalıbı
 *    "katılım" içinde, `\btl\b` ise "kayıtlı" içinde eşleşir. İlk sürüm tam
 *    bunu yaptı: içinde hiç rakam olmayan iki vakayı "ölçüm yöntemsiz rakam"
 *    diye işaretledi. Sınır bu yüzden Türkçe harfleri de kapsayan AÇIK
 *    karakter sınıfıyla kurulur.
 *
 * 2. **TÜRKÇE EKLEMELİDİR.** Birimden sonra sınır koymak "4 hafta**da**",
 *    "üç kat**ına**", "12 gün**de**" ifadelerini kaçırır. Bu yüzden birimin
 *    ardından yaygın çekim ekleri açıkça kabul edilir. Ekleri serbest bırakmak
 *    da olmaz: "üç kat**manlı**" bir ölçüm iddiası değildir, o yüzden ek
 *    listesi kapalıdır.
 *
 * 3. **SAYI YAZIYLA DA YAZILIR.** Yalnızca rakam aramak "üç kat arttı" ve
 *    "iki hafta sürdü" ifadelerini göremez. Türkçe sayı sözcükleri de aranır.
 *
 * SEZGİ OLDUĞU BİLİNEREK KULLANILIR: teknik yapılandırma sayıları (parça
 * boyutu, top-k) bu kalıplara takılabilir. Bu yüzden çağıran taraf bulguyu
 * doğrudan "hata" saymaz — ölçüm yöntemi yazılmamışsa bildirir, kararı editör
 * verir.
 */

/** Türkçe dâhil sözcük karakterleri — `\w` yerine bu kullanılır (tuzak 1). */
const TR_HARF = 'a-zA-ZçğıöşüÇĞİÖŞÜâîûÂÎÛ0-9';

/** Birimden sonra kabul edilen çekim ekleri (tuzak 2). Kapalı liste. */
const EK = '(?:ı|i|u|ü|a|e|da|de|ta|te|dan|den|tan|ten|lık|lik|luk|lük|na|ne|ında|inde|ında)?';

/** Ölçü birimleri — sonuç iddiasında bunlardan biri geçer. */
const BIRIM =
  'kat|gün|hafta|ay|yıl|saat|dakika|saniye|puan|kişi|adet|işlem|belge|çağrı|vaka|soru|sayfa';

/** Türkçe sayı sözcükleri (tuzak 3). */
const SAYI_SOZCUGU =
  'bir|iki|üç|dört|beş|altı|yedi|sekiz|dokuz|on|yirmi|otuz|kırk|elli|altmış|yetmiş|seksen|doksan|yüz|bin|milyon|milyar';

/** Büyüklük sözcükleri — "2,1 milyon TL" gibi rakam ile birim arasına girer. */
const BUYUKLUK = '(?:\\s*(?:bin|milyon|milyar))?';

const KALIPLAR = [
  // Yüzde: "%38", "38 %"
  { ad: 'yuzde', kalip: /%\s*\d|\d\s*%/ },
  // Para: "2,1 milyon TL", "450 USD", "1200₺"
  {
    ad: 'para',
    kalip: new RegExp(`\\d[\\d.,]*${BUYUKLUK}\\s*(?:tl|try|usd|eur|₺|\\$|€)`, 'i'),
  },
  // Rakam + birim (ekli olabilir): "4 haftada", "412 belge", "12 dakika"
  {
    ad: 'rakam-birim',
    kalip: new RegExp(`\\d[\\d.,]*${BUYUKLUK}\\s*(?:${BIRIM})${EK}(?![${TR_HARF}])`, 'i'),
  },
  // Yazıyla sayı + birim: "üç kat", "iki haftada"
  {
    ad: 'yazi-birim',
    kalip: new RegExp(
      `(?:^|[^${TR_HARF}])(?:${SAYI_SOZCUGU})(?![${TR_HARF}])\\s+(?:${BIRIM})${EK}(?![${TR_HARF}])`,
      'i',
    ),
  },
  // Üç+ haneli sayı: neredeyse her zaman bir ölçüm ya da hacim iddiası
  { ad: 'buyuk-sayi', kalip: /\d{3,}/ },
];

/**
 * İddia bulunursa hangi kalıbın yakaladığını döndürür, yoksa `null`.
 *
 * Kalıp adını döndürmek bilinçli: denetim çıktısında "neden işaretlendi"
 * sorusunun cevabı çıktının içinde durur, editör yanlış pozitifi kendisi
 * ayırt edebilir.
 */
export function olcumIddiasi(metin) {
  if (typeof metin !== 'string' || metin === '') return null;
  for (const { ad, kalip } of KALIPLAR) {
    const eslesme = metin.match(kalip);
    if (eslesme) return { kalip: ad, parca: eslesme[0].trim() };
  }
  return null;
}
