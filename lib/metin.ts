/**
 * Türkçe farkındalıklı metin ilkelleri.
 *
 * NEDEN AYRI BİR MODÜL: bu üç fonksiyon model kataloğu için yazıldı ama hiçbiri
 * modellere özgü değil — arama kutusu, çapa kimliği ve sayı biçimlendirme her
 * sayfada gerekiyor. `lib/modeller/siniflandirma.ts` içinde kaldıklarında bir
 * öğrenme sayfasının model modülünden içe aktarma yapması gerekiyordu; bu, bir
 * sonraki okuru "öğrenme yolları neden model sınıflandırmasına bağlı" diye
 * düşündürür.
 *
 * TÜRKÇE TUZAĞI: `'I'.toLocaleLowerCase('tr')` sonucu `ı`, `'İ'` sonucu `i`.
 * Yerel ayara bırakılan bir küçültme, çalıştığı makinenin diline göre farklı
 * anahtar üretir ve aynı veri iki farklı sonuç verir. `kucult()` eşlemeyi
 * açıkça yazar.
 */

const KUCUK_HARF: Record<string, string> = {
  İ: 'i',
  I: 'ı',
  Ş: 'ş',
  Ğ: 'ğ',
  Ü: 'ü',
  Ö: 'ö',
  Ç: 'ç',
  Â: 'â',
  Î: 'î',
  Û: 'û',
};

const ASCII: Record<string, string> = {
  ı: 'i',
  ş: 's',
  ğ: 'g',
  ü: 'u',
  ö: 'o',
  ç: 'c',
  â: 'a',
  î: 'i',
  û: 'u',
};

/** Türkçe farkındalıklı küçük harf — yerel ayardan bağımsız. */
export function kucult(metin: string): string {
  return [...metin].map((harf) => KUCUK_HARF[harf] ?? harf.toLowerCase()).join('');
}

/**
 * Eşleştirme anahtarı: küçük harf + ASCII + tek tire.
 *
 * İki işi var: arama kutusunda "gorsel" yazanın "görsel" kaydını bulması ve
 * çapa kimliği üretmek (`id` özniteliği ile `#...` adresi Türkçe harf ve boşluk
 * taşıyamaz). Ekrana BASILMAZ; görünen metin her zaman ham değerdir.
 */
export function anahtar(metin: string): string {
  return kucult(metin)
    .replace(/[ışğüöçâîû]/g, (h) => ASCII[h] ?? h)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Türkçe ondalık ayracıyla sayı; anlamsız sıfır kuyruğu olmadan.
 *
 * Birden küçük değerlerde dört basamak gösterilir: token fiyatları 0,0043 gibi
 * değerler alabiliyor ve iki basamağa yuvarlamak onları 0,00'a düşürürdü.
 */
export function sayi(deger: number): string {
  const basamak = deger > 0 && deger < 1 ? 4 : 2;
  return deger.toLocaleString('tr-TR', { maximumFractionDigits: basamak });
}
