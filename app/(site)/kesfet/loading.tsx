import { IskeletListeSayfasi } from '@/components/arayuz/Iskelet';

/**
 * `/kesfet/` yükleme iskeleti.
 *
 * Burada `loading.tsx` GÜVENLİ: keşfet hub'ı var olmayan bir kaydı
 * reddetmiyor, yani `notFound()` veya `redirect()` çağırmıyor.
 *
 * `notFound()` çağıran bir rotaya bu dosya KONULMAZ — durum kodu 200'de
 * çakılır (bkz. `docs/ADR/0002-loading-ve-durum-kodu.md`).
 */
export default function Yukleniyor() {
  return <IskeletListeSayfasi />;
}
