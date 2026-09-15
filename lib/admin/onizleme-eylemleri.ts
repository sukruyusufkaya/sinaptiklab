'use server';

import { onizlemeAnahtariUret, type UretilenAnahtar } from '@/lib/admin/onizleme';
import type { EylemSonucu } from '@/lib/yetki/korumali-eylem';

/**
 * Önizleme bağlantısının Server Action yüzeyi.
 *
 * NEDEN AYRI DOSYA: `'use server'` taşıyan bir modülün DIŞA AÇTIĞI her async
 * fonksiyon çağrılabilir bir uç noktaya dönüşür. `lib/admin/onizleme.ts`
 * içinde `onizlemeAnahtariniCoz` ve `onizlemeBelgesiGetir` de var; o dosyaya
 * `'use server'` yazmak, anahtar çözen ve belge okuyan fonksiyonları da
 * ağdan erişilebilir kılardı. Üretme eylemi bu yüzden burada, tek başına
 * açılır — çözme yolu yalnızca sunucu içinden çağrılır.
 *
 * Yetki kontrolü `onizlemeAnahtariUret` içindeki `korumaliEylem`
 * sarmalayıcısındadır; eylemin ilk satırında çalışır.
 */
export async function onizlemeBaglantisiOlustur(girdi: {
  koleksiyon: string;
  kimlik: string;
}): Promise<EylemSonucu<UretilenAnahtar>> {
  return onizlemeAnahtariUret(girdi);
}
