import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MetinSayfasi } from '@/components/kurumsal/MetinSayfasi';
import { politikaBul } from '@/lib/icerik/politikalar';

export const metadata: Metadata = {
  title: 'KVKK aydınlatma metni',
  description:
    '6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında işlenen kişisel verilere ilişkin aydınlatma metni.',
  alternates: { canonical: '/kvkk-aydinlatma/' },
};

export default async function Sayfa() {
  // Gövde `politikalar` koleksiyonundan; künye propları sayfada kalıyor
  // (bkz. app/(site)/cerez-politikasi/page.tsx).
  const kayit = await politikaBul('kvkk-aydinlatma');
  if (!kayit || kayit.bolumler.length === 0) notFound();

  return (
    <MetinSayfasi
      etiket="YASAL"
      baslik="KVKK aydınlatma metni"
      ozet="6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında işlenen kişisel verilere ilişkin aydınlatma metni."
      guncelleme="2026-09-01"
      bolumler={kayit.bolumler}
      ilgili={[
        { ad: 'Gizlilik politikası', yol: '/gizlilik/' },
        { ad: 'Çerez politikası', yol: '/cerez-politikasi/' },
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
