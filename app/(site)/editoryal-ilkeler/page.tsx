import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MetinSayfasi } from '@/components/kurumsal/MetinSayfasi';
import { sayfaBul } from '@/lib/icerik/politikalar';

export const metadata: Metadata = {
  title: 'Editoryal ilkeler',
  description:
    'Yayımlanan her içeriğin uymak zorunda olduğu kurallar: kaynak politikası, yazarlık, yapay zekâ kullanımı, bağımsızlık, tazelik ve düzeltme.',
  alternates: { canonical: '/editoryal-ilkeler/' },
};

export default async function Sayfa() {
  // Gövde `sayfalar` koleksiyonundan; künye propları sayfada kalıyor
  // (bkz. app/(site)/ai-politikasi/page.tsx).
  const kayit = await sayfaBul('editoryal-ilkeler');
  if (!kayit || kayit.bolumler.length === 0) notFound();

  return (
    <MetinSayfasi
      etiket="EDİTORYAL"
      baslik="Editoryal ilkeler"
      ozet="Yayımlanan her içeriğin uymak zorunda olduğu kurallar: kaynak politikası, yazarlık, yapay zekâ kullanımı, bağımsızlık, tazelik ve düzeltme."
      guncelleme="2026-09-01"
      bolumler={kayit.bolumler}
      ilgili={[
        { ad: 'AI kullanım politikası', yol: '/ai-politikasi/' },
        { ad: 'Düzeltme politikası', yol: '/duzeltme-politikasi/' },
        { ad: 'Metodoloji', yol: '/metodoloji/' },
        { ad: 'Künye', yol: '/kunye/' },
      ]}
    />
  );
}
