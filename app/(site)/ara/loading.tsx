import { IskeletListeSayfasi } from '@/components/arayuz/Iskelet';

/**
 * `/ara/` yükleme iskeleti.
 *
 * Burada `loading.tsx` GÜVENLİ: arama sayfası var olmayan bir kaydı
 * reddetmiyor, yani `notFound()` veya `redirect()` çağırmıyor. Suspense
 * sınırının kabuğu 200 ile akıtması bir şey bozmaz.
 *
 * `notFound()` çağıran bir rotaya bu dosya KONULMAZ — durum kodu 200'de
 * çakılır (bkz. `docs/ADR/0002-loading-ve-durum-kodu.md`).
 */
export default function Yukleniyor() {
  return <IskeletListeSayfasi />;
}
