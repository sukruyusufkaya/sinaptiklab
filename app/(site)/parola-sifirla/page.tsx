import type { Metadata } from 'next';
import Link from 'next/link';
import { KimlikKarti } from '@/components/kurumsal/KimlikKarti';
import { SifirlamaTalebiFormu, YeniParolaFormu } from '@/components/uyelik/SifirlamaFormlari';

export const metadata: Metadata = {
  title: 'Parola sıfırlama',
  description: 'Sinaptik Lab hesabınızın parolasını sıfırlayın.',
  alternates: { canonical: '/parola-sifirla/' },
  robots: { index: false, follow: false },
};

/**
 * Parola sıfırlama — tek rota, iki aşama.
 *
 * Anahtar sorgu dizesinde gelirse yeni parola formu, gelmezse talep formu
 * gösterilir. Ayrı rota açmak yerine tek rota tutulmasının nedeni: mektuptaki
 * bağlantı ile kullanıcının elle gittiği adres aynı olur, "hangi sayfaydı"
 * sorusu doğmaz.
 *
 * Sayfa `noindex, nofollow`: hem kişiye özel hem de anahtar taşıyor.
 */
export default async function ParolaSifirlamaSayfasi({
  searchParams,
}: {
  searchParams: Promise<{ anahtar?: string }>;
}) {
  const { anahtar } = await searchParams;
  const anahtarVar = typeof anahtar === 'string' && anahtar.length > 0;

  return (
    <KimlikKarti
      etiket="HESAP"
      baslik={anahtarVar ? 'Yeni parolanı belirle' : 'Parolanı sıfırla'}
      ozet={
        anahtarVar
          ? 'Yeni parolanı gir. Parola değiştiğinde açık olan tüm oturumlar kapatılır.'
          : 'Kayıtlı e-posta adresini gir; parolanı yenilemen için tek kullanımlık bir bağlantı gönderelim.'
      }
      kirinti={{ ad: 'Parola sıfırlama', yol: '/parola-sifirla/' }}
      faydalar={[
        {
          ad: 'Tek kullanımlık bağlantı',
          tarif: 'Bağlantı bir kez kullanılır ve bir saat sonra geçersiz olur.',
        },
        {
          ad: 'Oturumlar kapanır',
          tarif: 'Parola değişince tüm cihazlardaki oturumlar iptal edilir.',
        },
        {
          ad: 'Anahtar saklanmaz',
          tarif: 'Veritabanında yalnızca anahtarın özeti tutulur.',
        },
      ]}
      form={anahtarVar ? <YeniParolaFormu anahtar={anahtar} /> : <SifirlamaTalebiFormu />}
      altMetin={
        <>
          Parolanı hatırladın mı?{' '}
          <Link href="/giris/" className="text-vurgu-parlak underline underline-offset-4">
            Giriş yap
          </Link>
        </>
      }
    />
  );
}
