import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { KimlikKarti } from '@/components/kurumsal/KimlikKarti';
import { GirisFormu } from '@/components/uyelik/GirisFormu';
import { uyeOturumu } from '@/lib/site/uyelik';

export const metadata: Metadata = {
  title: 'Giriş Yap',
  description:
    'Sinaptik Lab hesabınıza giriş yapın; öğrenme ilerlemenize ve test sonuçlarınıza erişin.',
  alternates: { canonical: '/giris/' },
  robots: { index: false, follow: true },
};

/**
 * Oturum açmış kullanıcı hesabına gönderilir.
 *
 * Bu sayfa böylece DİNAMİK olur — kabul edilebilir: `noindex` taşıyor ve
 * içerik yüzeyinin parçası değil. Oturum kontrolünü SİTE DÜZENİNE koymak
 * cazip görünür (başlıkta "Hesabım" yazardı) ama `cookies()` dinamik bir
 * API'dir: düzende okunursa 300'den fazla sayfanın tamamı statik üretimi
 * kaybeder. Bu yüzden başlık statik kalır, yönlendirme burada yapılır.
 */
export const dynamic = 'force-dynamic';

export default async function GirisSayfasi({
  searchParams,
}: {
  searchParams: Promise<{ devam?: string }>;
}) {
  const { devam } = await searchParams;
  if (await uyeOturumu()) redirect('/hesabim/');

  return (
    <KimlikKarti
      etiket="ÜYELİK"
      baslik="Kaldığın yerden devam et"
      ozet="Hesabınla öğrenme ilerlemen, test sonuçların ve beceri grafiğindeki durumun kaydedilir."
      kirinti={{ ad: 'Giriş Yap', yol: '/giris/' }}
      faydalar={[
        {
          ad: 'İlerleme kaydı',
          tarif: 'Tamamlanan bölümler ve dersler beceri grafiğine işlenir.',
        },
        {
          ad: 'Test geçmişi',
          tarif: 'Skorların zaman içindeki değişimini görürsün.',
        },
        {
          ad: 'Kişisel öneri',
          tarif: 'Eksik önkoşullara göre sıradaki adım önerilir.',
        },
      ]}
      form={<GirisFormu devam={devam} />}
      altMetin={
        <>
          Hesabın yok mu?{' '}
          <Link href="/uye-ol/" className="text-vurgu-parlak underline underline-offset-4">
            Üye ol
          </Link>
        </>
      }
    />
  );
}
