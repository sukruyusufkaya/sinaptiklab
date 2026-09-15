import { NextResponse, type NextRequest } from 'next/server';
import { OTURUM_COOKIE } from '@/lib/yetki/oturum-sabitleri';

/**
 * Panel kapısı — SAVUNMA DERİNLİĞİ, güvenlik sınırı DEĞİL.
 *
 * DOSYA ADI: Next 16 bu kuralın adını `middleware` → `proxy` olarak değiştirdi
 * (eski ad derlemede kullanımdan kaldırma uyarısı basıyor). Çalışma yeri ve
 * semantiği aynı: istek rotalamadan önce buradan geçer.
 *
 * Proxy Edge çalışma zamanındadır: veritabanına erişemez, dolayısıyla tokeni
 * DOĞRULAYAMAZ. Yalnızca çerezin var olup olmadığına bakar ve oturumsuz
 * gezinmeyi giriş ekranına yönlendirir. Bu bir kullanıcı deneyimi
 * iyileştirmesidir.
 *
 * ASIL KORUMA iki yerdedir:
 *  1. `app/(admin)/layout.tsx` — oturumu ve panel yetkisini sunucuda doğrular.
 *  2. `lib/yetki/korumali-eylem.ts` — her yazma eyleminin ilk satırı.
 *
 * İkincisi olmadan birincisi yetmez: Next.js'te Server Action layout
 * render'ından ÖNCE çalışır, bu yüzden layout'taki `redirect()` bir eylemin
 * yan etkisini engelleyemez.
 */

export function proxy(istek: NextRequest) {
  const { pathname, search } = istek.nextUrl;

  const girisSayfasi = pathname.startsWith('/admin/giris');
  const cerezVar = Boolean(istek.cookies.get(OTURUM_COOKIE)?.value);

  // Sayfa yolunu layout'a taşı: giriş sonrası geri dönüş için gerekli.
  const basliklar = new Headers(istek.headers);
  basliklar.set('x-yol', `${pathname}${search}`);

  if (!girisSayfasi && !cerezVar) {
    const hedef = new URL('/admin/giris/', istek.url);
    hedef.searchParams.set('devam', `${pathname}${search}`);
    const yanit = NextResponse.redirect(hedef);
    yanit.headers.set('x-robots-tag', 'noindex, nofollow');
    return yanit;
  }

  const yanit = NextResponse.next({ request: { headers: basliklar } });

  // Panel hiçbir koşulda dizinlenmez; robots.txt'e ek yedek emniyet.
  yanit.headers.set('x-robots-tag', 'noindex, nofollow, noarchive');
  // Panel çerçeve içine alınamaz (clickjacking).
  yanit.headers.set('X-Frame-Options', 'DENY');
  yanit.headers.set('Referrer-Policy', 'no-referrer');

  return yanit;
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
