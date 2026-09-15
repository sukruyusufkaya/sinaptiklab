import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MetinSayfasi } from '@/components/kurumsal/MetinSayfasi';
import { politikaBul } from '@/lib/icerik/politikalar';

export const metadata: Metadata = {
  title: 'Gizlilik politikası',
  description:
    'Hangi veriler toplanıyor, ne için kullanılıyor, kimlerle paylaşılıyor ve ne kadar süre saklanıyor?',
  alternates: { canonical: '/gizlilik/' },
};

export default async function Sayfa() {
  // Gövde `politikalar` koleksiyonundan; künye propları sayfada kalıyor
  // (bkz. app/(site)/cerez-politikasi/page.tsx).
  const kayit = await politikaBul('gizlilik');
  if (!kayit || kayit.bolumler.length === 0) notFound();

  return (
    <MetinSayfasi
      etiket="YASAL"
      baslik="Gizlilik politikası"
      ozet="Hangi veriler toplanıyor, ne için kullanılıyor, kimlerle paylaşılıyor ve ne kadar süre saklanıyor?"
      guncelleme="2026-09-01"
      bolumler={kayit.bolumler}
      ilgili={[
        { ad: 'KVKK aydınlatma', yol: '/kvkk-aydinlatma/' },
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
