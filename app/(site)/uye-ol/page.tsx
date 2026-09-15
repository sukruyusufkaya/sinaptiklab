import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { KimlikKarti } from '@/components/kurumsal/KimlikKarti';
import { KayitFormu } from '@/components/uyelik/KayitFormu';
import { ROLLER } from '@/lib/veri/ogrenme';
import { konuListesi } from '@/lib/icerik/temel';
import { sektorler } from '@/lib/icerik/kurumsal';
import { uyeOturumu } from '@/lib/site/uyelik';

export const metadata: Metadata = {
  title: 'Üye Ol',
  description:
    'Sinaptik Lab üyeliği: öğrenme ilerlemeni kaydet, test sonuçlarını takip et ve kişiselleştirilmiş rota öner.',
  alternates: { canonical: '/uye-ol/' },
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

export default async function UyeOlSayfasi() {
  /*
   * İlgi alanı ve sektör seçenekleri CANLI TAKSONOMİDEN gelir; sunucu eylemi
   * de aynı kaynağa karşı doğruluyor. Kod içine kopyalanmış bir liste ilk
   * konu düzenlemesinde ayrışır ve formda görünmeyen bir slug kabul edilir
   * hâle gelirdi.
   *
   * Ana konular yeterli: 55 konunun tamamını çipe dökmek kayıt formunu
   * okunmaz yapardı ve alt konu seçimi zaten ana konuyu ima ediyor.
   */
  const [TUM_KONULAR, TUM_SEKTORLER] = await Promise.all([konuListesi(), sektorler()]);
  const KONULAR = TUM_KONULAR.filter((k) => !k.ustKonuSlug).map((k) => ({
    deger: k.slug,
    etiket: k.ad,
  }));
  const SEKTORLER = TUM_SEKTORLER.map((s) => ({ deger: s.slug, etiket: s.ad }));

  if (await uyeOturumu()) redirect('/hesabim/');

  return (
    <KimlikKarti
      etiket="ÜYELİK"
      baslik="Rotanı kur, ilerlemeni kaydet"
      ozet="Üyelik ücretsizdir. Rolünü ve hedefini söylersen sistem eksik önkoşullarına göre bir rota kurar."
      kirinti={{ ad: 'Üye Ol', yol: '/uye-ol/' }}
      faydalar={[
        {
          ad: 'Kişiselleştirilmiş rota',
          tarif: 'Rol, seviye ve hedefe göre beceri grafiğinden üretilen öğrenme sırası.',
        },
        {
          ad: 'İlerleme ve skor takibi',
          tarif: 'Tamamlanan bölümler ve test sonuçları kaydedilir.',
        },
        {
          ad: 'Proje teslimi',
          tarif: 'Rota projelerini teslim edip geri bildirim alabilirsin.',
        },
        {
          ad: 'Bülten tercihi',
          tarif: 'Dört bültenden istediklerini tek yerden yönetirsin.',
        },
      ]}
      form={<KayitFormu roller={ROLLER} konular={KONULAR} sektorler={SEKTORLER} />}
      altMetin={
        <>
          Hesabın var mı?{' '}
          <Link href="/giris/" className="text-vurgu-parlak underline underline-offset-4">
            Giriş yap
          </Link>
        </>
      }
    />
  );
}
