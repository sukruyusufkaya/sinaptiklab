import 'server-only';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { veritabani } from '@/lib/mongo/istemci';

/**
 * Bülten çıkışı — `cikisAnahtari` ile.
 *
 * NEDEN VARDI, NEDEN ÇALIŞMIYORDU: abonelik eylemi kayıt açarken tahmin
 * edilemez bir `cikisAnahtari` üretip saklıyordu (`form-eylemleri.ts`), şema
 * `cikisTarihi` ve `cikisAnahtari` alanlarını tanımlıyordu, `/bulten/` sayfası
 * da "tek tıkla çıkabilirsiniz" diye söz veriyordu. Ama anahtarı OKUYAN bir
 * rota hiç yazılmamıştı: çıkış vaadinin arkasında hiçbir şey yoktu.
 *
 * ÜÇ KARAR:
 *
 * 1. **Anahtar e-postadan türetilmez.** Abonelik eylemi `randomUUID()`
 *    kullanıyor; burada da yalnızca anahtarla sorgulanır. Aksi hâlde adresi
 *    bilen herkes başkasını listeden çıkarabilirdi.
 * 2. **Kayıt SİLİNMEZ**, `onayDurumu: 'cikti'` yazılır. Silmek, aynı adresin
 *    yeniden abone edilip edilmediğini ve çıkış talebinin kanıtını kaybettirir;
 *    KVKK tarafında da "işlemeyi durdurduk" kaydı gerekir.
 * 3. **Geçersiz anahtar SIZDIRMAZ.** Bulunamayan anahtar ile zaten çıkmış
 *    kayıt ayrı sonuç döndürür ama ikisi de adresi göstermez; sayfa yalnızca
 *    "bu bağlantı geçerli değil" der.
 */
export type CikisSonucu = { durum: 'cikildi' } | { durum: 'zaten-cikmis' } | { durum: 'gecersiz' };

/** Anahtar biçimi: `randomUUID()` çıktısı. Desene uymayan hiç sorgulanmaz. */
const ANAHTAR_DESENI = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function bultendenCik(anahtar: string): Promise<CikisSonucu> {
  if (!ANAHTAR_DESENI.test(anahtar)) return { durum: 'gecersiz' };

  const db = await veritabani();
  const koleksiyon = db.collection(KOLEKSIYONLAR.aboneler);

  const mevcut = await koleksiyon.findOne<{ onayDurumu?: string }>(
    { cikisAnahtari: anahtar },
    { projection: { _id: 0, onayDurumu: 1 } },
  );
  if (!mevcut) return { durum: 'gecersiz' };
  if (mevcut.onayDurumu === 'cikti') return { durum: 'zaten-cikmis' };

  await koleksiyon.updateOne(
    { cikisAnahtari: anahtar },
    {
      $set: {
        onayDurumu: 'cikti',
        cikisTarihi: new Date(),
        // Listeler boşaltılır: çıkmış bir kayıt hiçbir gönderim sorgusuna
        // düşmemeli, `onayDurumu` süzgeci atlansa bile.
        listeler: [],
        guncellendi: new Date(),
      },
    },
  );

  return { durum: 'cikildi' };
}
