import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MetinSayfasi } from '@/components/kurumsal/MetinSayfasi';
import { sayfaBul } from '@/lib/icerik/politikalar';

export const metadata: Metadata = {
  title: 'Düzeltme politikası',
  description:
    'Hata bulunduğunda ne yapılır? Düzeltme türleri, görünürlük kuralları ve hata bildirimi.',
  alternates: { canonical: '/duzeltme-politikasi/' },
};

export default async function Sayfa() {
  // Gövde `sayfalar` koleksiyonundan; künye propları sayfada kalıyor
  // (bkz. app/(site)/ai-politikasi/page.tsx).
  const kayit = await sayfaBul('duzeltme-politikasi');
  if (!kayit || kayit.bolumler.length === 0) notFound();

  return (
    <MetinSayfasi
      etiket="EDİTORYAL"
      baslik="Düzeltme politikası"
      ozet="Hata bulunduğunda ne yapılır? Düzeltme türleri, görünürlük kuralları ve hata bildirimi."
      guncelleme="2026-09-01"
      bolumler={kayit.bolumler}
      ilgili={[
        { ad: 'Editoryal ilkeler', yol: '/editoryal-ilkeler/' },
        { ad: 'İletişim', yol: '/iletisim/' },
      ]}
    />
  );
}
