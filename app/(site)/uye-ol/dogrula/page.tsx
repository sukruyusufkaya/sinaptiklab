import type { Metadata } from 'next';
import Link from 'next/link';
import { Dugme } from '@/components/arayuz/Dugme';
import { Ok } from '@/components/arayuz/Ikonlar';
import { epostaDogrula } from '@/lib/site/uyelik-eylemleri';

export const metadata: Metadata = {
  title: 'E-posta doğrulama',
  robots: { index: false, follow: false },
};

/**
 * E-posta doğrulama iniş sayfası.
 *
 * Doğrulama SAYFA RENDER'INDA yapılır, bir düğmeye basılarak değil: mektuptaki
 * bağlantıya tıklayan kişiden ikinci bir eylem beklemek gereksiz sürtünmedir.
 *
 * Bu, render sırasında yazma yapmak demektir — bu yüzden rota `force-dynamic`
 * olmak ZORUNDA; aksi hâlde Next sonucu önbelleğe alır ve ikinci bir anahtar
 * hiç işlenmezdi.
 */
export const dynamic = 'force-dynamic';

export default async function DogrulamaSayfasi({
  searchParams,
}: {
  searchParams: Promise<{ anahtar?: string }>;
}) {
  const { anahtar } = await searchParams;
  const sonuc = await epostaDogrula(String(anahtar ?? ''));

  return (
    <div className="kap flex min-h-[60vh] flex-col justify-center py-20">
      <p className="etiket-mono text-metin-soluk">ÜYELİK</p>
      <h1 className="mt-4 max-w-2xl text-3xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-4xl">
        {sonuc.tamam ? 'E-posta adresin doğrulandı.' : 'Bağlantı işlenemedi.'}
      </h1>
      <p className="mt-4 max-w-lg text-[0.9375rem] leading-relaxed text-metin-ikincil">
        {sonuc.tamam
          ? 'Üyelik özellikleri artık açık. Hesap sayfandan bülten tercihlerini ve bilgilerini yönetebilirsin.'
          : sonuc.hata}
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Dugme href="/hesabim/">
          Hesabıma git
          <Ok className="size-4" />
        </Dugme>
        {!sonuc.tamam && (
          <Link
            href="/hesabim/"
            className="text-sm text-metin-ikincil underline underline-offset-4 transition-colors hover:text-metin"
          >
            yeni bağlantı iste
          </Link>
        )}
      </div>
    </div>
  );
}
