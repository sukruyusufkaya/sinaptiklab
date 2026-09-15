/**
 * Bağlam penceresi metnini TOKEN sayısına çevirir.
 *
 * NEDEN AYRI MODÜL: bu ayrıştırıcı üç ayrı tuzak barındırıyor ve hepsi gerçek
 * veriyle ölçüldü. Bileşen içinde yaşadığında ne yeniden kullanılabiliyor ne de
 * test edilebiliyordu — bir test betiğine elle kopyalandığında kaçış dizileri
 * bozulup sessizce 0/42 sonucu verdi. Ayrıştırıcı artık tek yerde durur.
 *
 * NEDEN AYRIŞTIRICI GEREKLİ: model seçici eskiden
 * `baglamPenceresi.includes('Uzun')` diye bakıyordu. Fixture değerleri serbest
 * metindi ("Uzun bağlam (200K)") ve bu çalışıyordu. Araştırmadan gelen gerçek
 * veri ölçülü yazılıyor ("1M token", "200K token"), yani o denetim HİÇBİR
 * kayıtta eşleşmez: araç sessizce yanlış puanlar.
 *
 * ÜÇ TUZAK — veritabanındaki 42 ayrı yazımın tamamı ölçüldü:
 *
 * 1. **Nokta binlik ayırıcıdır.** 13 kayıt "1.048.576 token" biçiminde.
 *    Noktayı ondalık saymak 1.048.576'yı 1,048'e indirir ve 1M'lik bir model
 *    kısa bağlamlı görünür. Üç haneli gruplama görülürse noktalar atılır.
 * 2. **Virgül ondalık ayırıcıdır.** "1,05M token" → 1.050.000.
 * 3. **Birim SAYIYA BAĞLI aranır.** "dizgede token geçiyor mu" denetimi
 *    yetmez: "32.900 kelime (tokenizer'sız mimari)" değeri o denetimi geçip
 *    32,9 milyon token sayılıyordu, çünkü "tokenizer" kelimesi "token"
 *    içeriyor. Bu yüzden sayıyı HEMEN İZLEYEN birimin "token" olması aranır.
 */

/** Bu eşiğin üstü "uzun bağlam" sayılır. */
export const UZUN_BAGLAM_ESIGI = 200_000;

const OLCU = /([0-9][0-9.,]*)\s*([KkMm])?\s*token\b/i;
const BINLIK_GRUPLAMA = /^[0-9]{1,3}(\.[0-9]{3})+$/;

export function baglamTokenSayisi(metin?: string): number | undefined {
  if (!metin) return undefined;

  const esleme = OLCU.exec(metin);
  const ilk = esleme?.[1];
  if (!ilk) return undefined;

  const ham = BINLIK_GRUPLAMA.test(ilk) ? ilk.replaceAll('.', '') : ilk.replace(',', '.');
  const sayi = Number(ham);
  if (!Number.isFinite(sayi) || sayi <= 0) return undefined;

  const sonek = esleme?.[2]?.toLowerCase();
  const carpan = sonek === 'm' ? 1_000_000 : sonek === 'k' ? 1_000 : 1;
  return sayi * carpan;
}

/**
 * Model "uzun bağlam" sayılır mı.
 *
 * Ölçülebilen değer eşikle kıyaslanır. Ölçülemeyen ama metinde "uzun" diyen
 * eski kayıtlar (fixture'dan kalan altı aile kaydı serbest metin taşıyor)
 * tamamen puansız kalmasın diye nitel ifadeye de bakılır — bu bir tahmin
 * değil, kaydın kendi ifadesinin okunmasıdır.
 */
export function uzunBaglamMi(metin?: string): boolean {
  const token = baglamTokenSayisi(metin);
  if (token !== undefined) return token >= UZUN_BAGLAM_ESIGI;
  return metin?.toLocaleLowerCase('tr').includes('uzun') ?? false;
}
