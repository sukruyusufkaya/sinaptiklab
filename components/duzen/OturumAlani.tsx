'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { Kilit } from '@/components/arayuz/Ikonlar';
import { oturumAbone, oturumOku, oturumSunucuda } from '@/lib/site/oturum-durumu';

/**
 * Başlığın kimlik alanı.
 *
 * ÖNCEDEN OTURUMDAN HABERSİZDİ: "Giriş Yap" ve "Üye Ol" bağlantıları her
 * koşulda basılıyordu. Giriş yapmış kullanıcı sitenin kendisini tanımadığını
 * görüyor ve `/hesabim/` sayfasına gezinmeden hiç ulaşamıyordu.
 *
 * Durum `lib/site/oturum-durumu.ts` deposundan okunur; neden sunucudan değil
 * de istemciden geldiği orada anlatılıyor.
 *
 * ÜÇ DURUM VE SIÇRAMA (CLS) SORUNU. `bilinmiyor` → `anonim`/`girisli` geçişi
 * hidrasyondan hemen sonra olur ve üç durumun genişliği farklıdır. Alan, bu
 * satırın en solundaki arama düğmesinin yerini oynatmasın diye SABİT
 * genişlikli bir kutuya alınır ve içerik sağa yaslanır; böylece durum
 * değişirken çevresindeki hiçbir öğe kaymaz (MASTER-PLAN §53, CLS < 0.05).
 *
 * `bilinmiyor` durumunda tıklanabilir bir şey BASILMAZ. Bir an için "Giriş
 * Yap" gösterip sonra "Hesabım"a çevirmek, tam o anda tıklayan kullanıcıyı
 * yanlış sayfaya götürürdü.
 */

export function OturumAlani() {
  const durum = useSyncExternalStore(oturumAbone, oturumOku, oturumSunucuda);

  return (
    <div className="hidden items-center justify-end gap-2 lg:flex lg:min-w-[10.5rem]">
      {durum.asama === 'bilinmiyor' && (
        <span
          aria-hidden="true"
          className="h-9 w-28 animate-pulse rounded-full border border-kenar bg-yuzey/60"
        />
      )}

      {durum.asama === 'anonim' && (
        <>
          <Link
            href="/giris/"
            className="inline-flex h-9 items-center rounded-full px-3 text-sm font-medium text-metin-ikincil transition-colors hover:text-metin"
          >
            Giriş Yap
          </Link>
          <Link
            href="/uye-ol/"
            className="inline-flex h-9 items-center rounded-full bg-vurgu px-4 text-sm font-medium text-white shadow-[0_6px_24px_-10px_var(--vurgu)] transition-colors hover:bg-vurgu-parlak"
          >
            Üye Ol
          </Link>
        </>
      )}

      {durum.asama === 'girisli' && (
        <>
          {durum.panel && (
            <Link
              href="/admin/"
              className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-metin-ikincil transition-colors hover:text-metin"
            >
              <Kilit className="size-3.5" />
              Panel
            </Link>
          )}
          <Link
            href="/hesabim/"
            className="inline-flex h-9 max-w-[11rem] items-center gap-2 rounded-full border border-kenar bg-yuzey/60 pr-3.5 pl-1.5 text-sm font-medium text-metin transition-colors hover:border-kenar-guclu"
          >
            <span
              aria-hidden="true"
              className="grid size-6 shrink-0 place-items-center rounded-full bg-vurgu-zemin text-[0.6875rem] font-semibold text-vurgu-parlak"
            >
              {basHarf(durum.ad)}
            </span>
            <span className="truncate">{durum.ad}</span>
          </Link>
        </>
      )}
    </div>
  );
}

/** Mobil menünün alt şeridi — aynı durum, dar düzen. */
export function OturumAlaniMobil({ kapat }: { kapat: () => void }) {
  const durum = useSyncExternalStore(oturumAbone, oturumOku, oturumSunucuda);

  if (durum.asama === 'bilinmiyor') {
    return (
      <span
        aria-hidden="true"
        className="h-9 w-32 animate-pulse rounded-full border border-kenar bg-yuzey/60"
      />
    );
  }

  if (durum.asama === 'girisli') {
    return (
      <div className="flex items-center gap-2">
        {durum.panel && (
          <Link
            href="/admin/"
            onClick={kapat}
            className="rounded-full px-3 py-2 text-sm font-medium text-metin-ikincil"
          >
            Panel
          </Link>
        )}
        <Link
          href="/hesabim/"
          onClick={kapat}
          className="max-w-[11rem] truncate rounded-full border border-kenar bg-yuzey/60 px-4 py-2 text-sm font-medium text-metin"
        >
          {durum.ad}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/giris/"
        onClick={kapat}
        className="rounded-full px-3 py-2 text-sm font-medium text-metin-ikincil"
      >
        Giriş Yap
      </Link>
      <Link
        href="/uye-ol/"
        onClick={kapat}
        className="rounded-full bg-vurgu px-4 py-2 text-sm font-medium text-white"
      >
        Üye Ol
      </Link>
    </div>
  );
}

/**
 * Ad baş harfi — `toLocaleUpperCase('tr-TR')` ile.
 *
 * Değişmez kural 1 CSS'teki `text-transform` içindir; buradaki dönüşüm
 * JavaScript'te ve Türkçe yerelle yapılır, yani "i" harfi doğru biçimde "İ"
 * olur. Tarayıcının yaptığı hata (yabancı adlarda "İ" üretmesi) burada söz
 * konusu değil: tek harf zaten kişinin kendi adından geliyor.
 */
function basHarf(ad: string): string {
  return (ad.trim().charAt(0) || '?').toLocaleUpperCase('tr-TR');
}
