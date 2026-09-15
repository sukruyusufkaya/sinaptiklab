import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MetinSayfasi } from '@/components/kurumsal/MetinSayfasi';
import { politikaBul } from '@/lib/icerik/politikalar';

export const metadata: Metadata = {
  title: 'Kullanım şartları',
  description:
    'Platformun kullanımına, içeriklerin alıntılanmasına, üyeliğe ve sorumluluğun sınırlarına ilişkin şartlar.',
  alternates: { canonical: '/kullanim-sartlari/' },
};

export default async function Sayfa() {
  // Gövde `politikalar` koleksiyonundan; künye propları sayfada kalıyor
  // (bkz. app/(site)/cerez-politikasi/page.tsx).
  const kayit = await politikaBul('kullanim-sartlari');
  if (!kayit || kayit.bolumler.length === 0) notFound();

  return (
    <MetinSayfasi
      etiket="YASAL"
      baslik="Kullanım şartları"
      ozet="Platformun kullanımına, içeriklerin alıntılanmasına, üyeliğe ve sorumluluğun sınırlarına ilişkin şartlar."
      guncelleme="2026-09-01"
      bolumler={kayit.bolumler}
      ilgili={[
        { ad: 'Gizlilik politikası', yol: '/gizlilik/' },
        { ad: 'Editoryal ilkeler', yol: '/editoryal-ilkeler/' },
      ]}
      ek={
        kayit.taslakUyarisi ? (
          <div className="mt-10 rounded-xl border border-uyari/25 bg-uyari/8 p-5">
            <p className="etiket-mono mb-2 text-uyari">Taslak uyarısı</p>
            <p className="text-[0.875rem] leading-relaxed text-metin-ikincil">
              {kayit.taslakUyarisi}
            </p>
          </div>
        ) : undefined
      }
    />
  );
}
