import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { CokYakinda } from '@/components/arayuz/CokYakinda';
import { ListeSemasi } from '@/lib/seo/jsonld';
import { dergiSayiListesi } from '@/lib/icerik/yayin';
import { tarihUzun } from '@/lib/bicim';

export const metadata: Metadata = {
  title: 'Dergi Arşivi',
  description:
    'Sinaptik Magazine tüm sayıları. Her sayı ve her yazı kalıcı adresinde erişilebilir.',
  alternates: { canonical: '/dergi/arsiv/' },
};

export default async function DergiArsiviSayfasi() {
  const DERGI_SAYILARI = await dergiSayiListesi();

  return (
    <>
      <ListeSemasi
        ad="Sinaptik Magazine sayıları"
        ogeler={DERGI_SAYILARI.map((sayi) => ({
          ad: `${sayi.sayi} — ${sayi.kapakKonusu}`,
          yol: `/dergi/${sayi.slug}/`,
        }))}
      />

      <SayfaBasligi
        kirintilar={[
          { ad: 'Dergi', yol: '/dergi/' },
          { ad: 'Arşiv', yol: '/dergi/arsiv/' },
        ]}
        etiket="MAGAZINE"
        baslik="Dergi arşivi"
        ozet="Sayılar arşive düşmez, adreslerinde kalır. Her yazı ayrı ayrı bağlanabilir ve alıntılanabilir."
        olcumler={[
          { deger: `${DERGI_SAYILARI.length}`, etiket: 'Sayı' },
          {
            deger: `${DERGI_SAYILARI.reduce((t, s) => t + s.yazilar.length, 0)}`,
            etiket: 'Yazı',
          },
        ]}
        desen="nokta"
      />

      <Bolum>
        <div className="space-y-8">
          {DERGI_SAYILARI.length === 0 && (
            <CokYakinda
              baslik="Arşiv ilk sayıyı bekliyor"
              metin="Sinaptik Magazine aylık olarak planlanıyor. Yayımlanan her sayı, içindeki yazıların kalıcı adresleriyle birlikte burada birikecek; sayılar arşive DÜŞMEZ, adreslerinde kalır."
              kapsam={[
                'Sayı sayı tam içindekiler listesi',
                'Her yazının bölümü, yazarı ve okuma süresi',
                'Yazı başına kalıcı, tarihsiz adres',
                'Bölüme göre çapraz gezinme',
              ]}
              notlar={['PDF sürümü ikincil formattır; birincil ve kanonik yayın bu sayfalardır.']}
            />
          )}
          {DERGI_SAYILARI.map((sayi) => (
            <section key={sayi.slug} className="rounded-2xl border border-kenar bg-yuzey/40 p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-kenar-soluk pb-4">
                <div>
                  <p className="etiket-mono text-metin-soluk">
                    {sayi.sayi} · {tarihUzun(sayi.tarih)}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight">
                    <Link
                      href={`/dergi/${sayi.slug}/`}
                      className="transition-colors hover:text-vurgu-parlak"
                    >
                      {sayi.kapakKonusu}
                    </Link>
                  </h2>
                </div>
                <Link href={`/dergi/${sayi.slug}/`} className="etiket-mono text-vurgu-parlak">
                  Sayıyı aç →
                </Link>
              </div>

              <ul className="mt-4 divide-y divide-kenar-soluk">
                {sayi.yazilar.map((yazi) => (
                  <li key={yazi.slug} className="group">
                    <Link
                      href={`/dergi/${sayi.slug}/${yazi.slug}/`}
                      className="flex flex-col gap-1.5 py-3 sm:flex-row sm:items-center sm:gap-5"
                    >
                      <span className="etiket-mono w-20 shrink-0 text-metin-soluk">
                        {yazi.bolum}
                      </span>
                      <span className="min-w-0 flex-1 text-[0.9375rem] font-medium text-metin transition-colors group-hover:text-vurgu-parlak">
                        {yazi.baslik}
                      </span>
                      <span className="etiket-mono shrink-0 text-metin-soluk">
                        {yazi.okumaDakika} dk
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Bolum>
    </>
  );
}
