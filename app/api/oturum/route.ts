import { NextResponse } from 'next/server';
import { gorunenAd, uyeOturumu } from '@/lib/site/uyelik';
import { panelErisimiVarMi } from '@/lib/yetki/oturum';

/**
 * Oturum durumu — başlığın kimlik alanı için makine yüzeyi.
 *
 * NEDEN VAR: site düzeni bilerek statiktir, bu yüzden başlık sunucuda kimin
 * giriş yaptığını bilemez (gerekçe `lib/site/oturum-durumu.ts` içinde).
 * Bu uç nokta o boşluğu kapatan tek dinamik istektir.
 *
 * EN AZ VERİ İLKESİ. Yanıt yalnızca üç şey taşır: giriş var mı, görünen ad ne,
 * panel bağlantısı gösterilsin mi. E-posta, kimlik, roller ve oturum süresi
 * DÖNMEZ — başlığın hiçbirine ihtiyacı yok ve her ek alan, bu uç noktayı bir
 * profil sızıntısı yüzeyine çevirir.
 *
 * ÖNBELLEKLEME KESİNLİKLE KAPALI. `private, no-store` olmadan bir ara katman
 * (CDN, kurumsal vekil, tarayıcı) bir kullanıcının yanıtını başkasına
 * servis edebilirdi — bu sınıfın en pahalı hatası. `Vary: Cookie` aynı
 * kararı önbellek anahtarına da yazar; ikisi birden verilir çünkü biri
 * yok sayılırsa diğeri hâlâ korur.
 *
 * `/api/` robots.txt tarafında kapsam dışıdır; `X-Robots-Tag` ikinci kattır.
 */

export const dynamic = 'force-dynamic';

export async function GET() {
  const kullanici = await uyeOturumu();

  return NextResponse.json(
    kullanici
      ? { girisli: true, ad: gorunenAd(kullanici), panel: panelErisimiVarMi(kullanici) }
      : { girisli: false },
    {
      headers: {
        'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
        Vary: 'Cookie',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    },
  );
}
