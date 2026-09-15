'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Dugme } from '@/components/arayuz/Dugme';
import { Ok } from '@/components/arayuz/Ikonlar';

/**
 * Site tarafı hata sınırı.
 *
 * Kapsam: `(site)` düzeninin altındaki her sayfa. Düzenin kendisi (başlık,
 * gezinme, altlık) ayakta kalır — yalnızca sayfa gövdesi bu ekranla değişir.
 * Düzenin KENDİSİ hata verirse bu sınır yakalamaz; onu `app/global-error.tsx`
 * karşılar.
 *
 * HATA METNİ GÖSTERİLMEZ. Üretimde Next zaten iletiyi maskeler ve yerine bir
 * `digest` verir; burada da yalnızca o özet basılır. Yığın izi veya sorgu
 * ayrıntısı okuyucuya sızmaz — hata ayıklama sunucu günlüğünden yapılır.
 */

export default function SiteHataSinir({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Tarayıcı konsoluna yazmak, hatayı ilk bildiren kişinin ekran görüntüsünü
    // işe yarar hâle getirir. Sunucu tarafı kaydı Next'in kendisi tutar.
    console.error('[sinaptiklab] sayfa hatası', error.digest ?? error.message);
  }, [error]);

  return (
    <div className="kap flex min-h-[70vh] flex-col justify-center py-20">
      <p className="etiket-mono text-metin-soluk">HATA</p>
      <h1 className="mt-4 max-w-2xl text-3xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-4xl">
        Bu sayfa yüklenirken bir şey ters gitti.
      </h1>
      <p className="mt-4 max-w-lg text-[0.9375rem] leading-relaxed text-metin-ikincil">
        Hata bizde kaydedildi. Sayfayı yeniden denemek çoğu zaman yeterli olur; sorun sürerse
        aşağıdaki numarayı bize iletin.
      </p>

      {error.digest && (
        <p className="mt-4 font-mono text-xs text-metin-soluk">
          Hata numarası: <span className="text-metin-ikincil">{error.digest}</span>
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Dugme onClick={reset}>
          Yeniden dene
          <Ok className="size-4" />
        </Dugme>
        <Link
          href="/"
          className="text-sm text-metin-ikincil underline underline-offset-4 transition-colors hover:text-metin"
        >
          ana sayfaya dön
        </Link>
        <Link
          href="/iletisim/"
          className="text-sm text-metin-ikincil underline underline-offset-4 transition-colors hover:text-metin"
        >
          durumu bildir
        </Link>
      </div>
    </div>
  );
}
