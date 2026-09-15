'use client';

import Link from 'next/link';
import { UyelikAlani, UyelikFormu } from '@/components/uyelik/UyelikFormu';
import { uyeGiris } from '@/lib/site/uyelik-eylemleri';

/**
 * Site giriş formu.
 *
 * `devam` gizli alanı giriş sonrası dönülecek yolu taşır; sunucu tarafı onu
 * `guvenliIcYol()` ile süzer, yani dış adrese yönlendirme (open redirect)
 * mümkün değildir.
 *
 * "Beni hatırma" onay kutusu KALDIRILDI: oturum süresi sunucuda sabit
 * (8 saat kayan / 7 gün mutlak) ve işaretlenmesi hiçbir şeyi değiştirmiyordu —
 * çalışmayan bir denetim, olmayan bir denetimden kötüdür.
 */

export function GirisFormu({ devam }: { devam?: string }) {
  return (
    <UyelikFormu
      eylem={uyeGiris}
      baslik="Giriş"
      dugmeMetni="Giriş yap"
      altBilgi={
        <p className="mt-4 text-center text-xs text-metin-soluk">
          <Link href="/parola-sifirla/" className="text-vurgu-parlak underline underline-offset-2">
            Parolamı unuttum
          </Link>
        </p>
      }
    >
      {(alanHatasi) => (
        <>
          {devam && <input type="hidden" name="devam" value={devam} />}
          <UyelikAlani
            ad="eposta"
            etiket="E-posta"
            tur="email"
            otomatik="email"
            hata={alanHatasi('eposta')}
          />
          <UyelikAlani
            ad="parola"
            etiket="Parola"
            tur="password"
            otomatik="current-password"
            hata={alanHatasi('parola')}
          />
        </>
      )}
    </UyelikFormu>
  );
}
