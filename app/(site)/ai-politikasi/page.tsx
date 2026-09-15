import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MetinSayfasi } from '@/components/kurumsal/MetinSayfasi';
import { sayfaBul } from '@/lib/icerik/politikalar';

export const metadata: Metadata = {
  title: 'AI kullanım politikası',
  description:
    'Sinaptik Lab yapay zekâ araçlarını nerede kullanır, nerede kullanmaz? Editoryal sorumluluk her zaman insandadır.',
  alternates: { canonical: '/ai-politikasi/' },
};

export default async function Sayfa() {
  // Gövde `sayfalar` koleksiyonundan gelir. Künye propları (etiket, başlık,
  // özet, güncelleme) sayfada kalır: `etiket` yalnızca bu şemada var, hukuki
  // metinlerin şemasında yok; ayrıca statik `metadata` ile aynı metni taşıyor.
  const kayit = await sayfaBul('ai-politikasi');
  // Kayıt taslağa çekilirse boş bir politika sayfası basmak yerine 404:
  // gövdesiz bir ilke metni, hazır olmayan bölümü dolu göstermek olurdu.
  if (!kayit || kayit.bolumler.length === 0) notFound();

  return (
    <MetinSayfasi
      etiket="ŞEFFAFLIK"
      baslik="AI kullanım politikası"
      ozet="Sinaptik Lab yapay zekâ araçlarını nerede kullanır, nerede kullanmaz? Editoryal sorumluluk her zaman insandadır."
      guncelleme="2026-09-01"
      bolumler={kayit.bolumler}
      ilgili={[
        { ad: 'Editoryal ilkeler', yol: '/editoryal-ilkeler/' },
        { ad: 'Düzeltme politikası', yol: '/duzeltme-politikasi/' },
      ]}
    />
  );
}
