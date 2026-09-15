import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { Kod, Ok } from '@/components/arayuz/Ikonlar';
import { ListeSemasi } from '@/lib/seo/jsonld';
import { hesaplayicilar, labProjeleri } from '@/lib/icerik/lab';

export const metadata: Metadata = {
  title: 'Hesaplayıcılar',
  description:
    'Token, maliyet, bağlam penceresi, GPU belleği ve RAG parça hesaplayıcıları. Hesaplama istemci tarafında çalışır.',
  alternates: { canonical: '/araclar/hesaplayicilar/' },
};

export default async function HesaplayicilarSayfasi() {
  const [HESAPLAYICILAR, LAB_PROJELERI] = await Promise.all([hesaplayicilar(), labProjeleri()]);
  const deneyler = LAB_PROJELERI.filter((proje) => proje.tur !== 'Araç');

  return (
    <>
      <ListeSemasi
        ad="Sinaptik hesaplayıcıları"
        ogeler={HESAPLAYICILAR.map((hesap) => ({ ad: hesap.ad, yol: `/lab/${hesap.slug}/` }))}
      />

      <SayfaBasligi
        kirintilar={[
          { ad: 'AI Araçları', yol: '/araclar/' },
          { ad: 'Hesaplayıcılar', yol: '/araclar/hesaplayicilar/' },
        ]}
        etiket="LAB"
        baslik="Hesaplayıcılar"
        ozet="Bir kararı hızlandıran küçük araçlar: token, maliyet, bağlam bütçesi, GPU belleği ve parça uzunluğu. Hesaplama istemci tarafında yapılır."
        olcumler={[
          { deger: `${HESAPLAYICILAR.length}`, etiket: 'Hesaplayıcı' },
          {
            deger: `${HESAPLAYICILAR.filter((h) => h.durum === 'yayinda').length}`,
            etiket: 'Yayında',
          },
          { deger: 'İstemci', etiket: 'Çalışma yeri' },
        ]}
        eylemler={
          <Dugme href="/lab/" gorunum="ikincil">
            <Kod className="size-4" />
            Lab&apos;a git
          </Dugme>
        }
        desen="nokta"
      />

      <Bolum>
        <BolumBasligi numara="01" etiket="ARAÇLAR" baslik="Hesaplayıcılar" />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HESAPLAYICILAR.map((hesap) => (
            <li key={hesap.slug}>
              <Link
                href={`/lab/${hesap.slug}/`}
                className="group flex h-full flex-col rounded-2xl border border-kenar bg-yuzey/40 p-6 transition-[border-color,background-color,transform] duration-300 ease-sinaptik hover:-translate-y-0.5 hover:border-sinyal/40 hover:bg-yuzey/70"
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="grid size-9 place-items-center rounded-lg border border-kenar bg-zemin text-metin-soluk transition-colors group-hover:border-sinyal/40 group-hover:text-sinyal">
                    <Kod className="size-4" />
                  </span>
                  {hesap.durum === 'gelistiriliyor' && (
                    <span className="etiket-mono text-metin-soluk">Yakında</span>
                  )}
                </span>

                <span className="mt-4 block text-[1.0625rem] font-semibold tracking-tight text-metin group-hover:text-sinyal">
                  {hesap.ad}
                </span>
                <span className="mt-2 flex-1 text-[0.8125rem] leading-relaxed text-metin-ikincil">
                  {hesap.ozet}
                </span>

                {hesap.girdiler && (
                  <span className="mt-4 flex flex-wrap gap-1.5 border-t border-kenar-soluk pt-3.5">
                    {hesap.girdiler.map((girdi) => (
                      <span
                        key={girdi.etiket}
                        className="rounded-md border border-kenar-soluk bg-zemin/60 px-2 py-1 text-[0.6875rem] text-metin-soluk"
                      >
                        {girdi.etiket} ({girdi.birim})
                      </span>
                    ))}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </Bolum>

      <Bolum zemin="derin">
        <BolumBasligi
          numara="02"
          etiket="DENEYLER"
          baslik="Deney ve açık kaynak"
          baglantiYolu="/lab/"
        />
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-3">
          {deneyler.map((proje) => (
            <li key={proje.slug}>
              <Link
                href={`/lab/${proje.slug}/`}
                className="group flex h-full flex-col bg-zemin p-5 transition-colors hover:bg-yuzey/60"
              >
                <span className="etiket-mono text-metin-soluk">{proje.tur}</span>
                <span className="mt-2 block text-[0.9375rem] font-medium text-metin group-hover:text-sinyal">
                  {proje.ad}
                </span>
                <span className="mt-1.5 text-xs leading-relaxed text-metin-soluk">
                  {proje.ozet}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8 rounded-xl border border-kenar bg-yuzey/40 p-5">
          <p className="etiket-mono mb-2 text-metin-soluk">Gizlilik</p>
          <p className="text-[0.875rem] leading-relaxed text-metin-ikincil">
            Hesaplayıcılara girdiğiniz metin ve değerler sunucuya gönderilmez; hesaplama tarayıcıda
            yapılır.
          </p>
        </div>
      </Bolum>

      <Bolum>
        <div className="flex flex-wrap items-center gap-3">
          <Dugme href="/araclar/">
            Araç incelemeleri
            <Ok className="size-4" />
          </Dugme>
          <Dugme href="/topluluk/katki/" gorunum="ikincil">
            Yeni hesaplayıcı öner
          </Dugme>
        </div>
      </Bolum>
    </>
  );
}
