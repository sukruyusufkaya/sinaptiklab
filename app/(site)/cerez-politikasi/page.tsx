import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MetinSayfasi } from '@/components/kurumsal/MetinSayfasi';
import { politikaBul } from '@/lib/icerik/politikalar';

export const metadata: Metadata = {
  title: 'Çerez politikası',
  description: 'Sinaptik Lab üzerinde kullanılan çerez türleri, amaçları ve nasıl yönetilecekleri.',
  alternates: { canonical: '/cerez-politikasi/' },
};

export default async function Sayfa() {
  // Gövde `politikalar` koleksiyonundan gelir. Künye propları (etiket, başlık,
  // özet, güncelleme) sayfada kalır: `etiket` bu şemada yok, başlık ve özet de
  // statik `metadata` ile aynı metni taşıyor.
  const kayit = await politikaBul('cerez-politikasi');
  // Kayıt taslağa çekilirse gövdesiz bir hukuki metin basmak yerine 404.
  if (!kayit || kayit.bolumler.length === 0) notFound();

  return (
    <MetinSayfasi
      etiket="YASAL"
      baslik="Çerez politikası"
      ozet="Sinaptik Lab üzerinde kullanılan çerez türleri, amaçları ve nasıl yönetilecekleri."
      guncelleme="2026-09-01"
      bolumler={kayit.bolumler}
      ilgili={[
        { ad: 'Gizlilik politikası', yol: '/gizlilik/' },
        { ad: 'KVKK aydınlatma', yol: '/kvkk-aydinlatma/' },
      ]}
      ek={
        // Uyarı artık sabit değil: kaydın `hukukiOnay` bayrağından geliyor.
        // Panelde hukuk onayı işaretlenirse blok kendiliğinden kalkar.
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
