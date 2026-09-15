import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { ListeSemasi } from '@/lib/seo/jsonld';
import { Ok } from '@/components/arayuz/Ikonlar';
import { Rozet } from '@/components/arayuz/Rozet';
import { vakalar } from '@/lib/icerik/kurumsal';

export const metadata: Metadata = {
  title: 'Vaka Çalışmaları',
  description:
    'Vaka çalışmaları: problem, yaklaşım, mimari, kullanılan teknoloji, etki ve öğrenilen dersler. Temsilî senaryolar ayrıca işaretlenir.',
  alternates: { canonical: '/vaka-calismalari/' },
};

export default async function VakalarSayfasi() {
  const VAKALAR = await vakalar();
  const sektorler = [...new Set(VAKALAR.map((vaka) => vaka.sektor))];
  // Değişmez kural 5: temsilî kayıt sayısı gizlenmez, sayfanın üstünde yazar.
  const temsiliSayisi = VAKALAR.filter((vaka) => vaka.temsili).length;

  return (
    <>
      <ListeSemasi
        ad="Vaka çalışmaları"
        ogeler={VAKALAR.map((vaka) => ({
          ad: vaka.baslik,
          yol: `/vaka-calismalari/${vaka.slug}/`,
        }))}
      />

      <SayfaBasligi
        kirintilar={[{ ad: 'Vaka Çalışmaları', yol: '/vaka-calismalari/' }]}
        etiket="BUILD"
        baslik="Vaka çalışmaları"
        ozet="Her vaka aynı yapıyı izler: problem, veri, yaklaşım, mimari, güvenlik, ölçülebilir etki ve öğrenilen dersler. Başarı hikâyesi değil, kayıt."
        olcumler={[
          { deger: `${VAKALAR.length}`, etiket: 'Vaka' },
          { deger: `${sektorler.length}`, etiket: 'Sektör' },
          {
            deger: `${VAKALAR.reduce((t, v) => t + v.dersler.length, 0)}`,
            etiket: 'Öğrenilen ders',
          },
        ]}
      />

      <Bolum>
        <ul className="space-y-4">
          {VAKALAR.map((vaka) => (
            <li key={vaka.slug}>
              <Link
                href={`/vaka-calismalari/${vaka.slug}/`}
                className="group flex flex-col gap-6 rounded-2xl border border-kenar bg-yuzey/40 p-6 transition-[border-color,background-color] duration-300 hover:border-vurgu/45 hover:bg-yuzey/70 lg:flex-row"
              >
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2.5">
                    <span className="etiket-mono text-vurgu-parlak">{vaka.sektor}</span>
                    {vaka.temsili && <Rozet ton="uyari">TEMSİLÎ SENARYO</Rozet>}
                  </span>
                  <span className="mt-3 block text-[1.25rem] leading-snug font-semibold tracking-tight text-metin group-hover:text-vurgu-parlak">
                    {vaka.baslik}
                  </span>
                  <span className="mt-2.5 block text-[0.9375rem] leading-relaxed text-metin-ikincil">
                    {vaka.problem}
                  </span>
                  <span className="mt-4 flex flex-wrap gap-1.5">
                    {vaka.teknolojiler.map((teknoloji) => (
                      <span
                        key={teknoloji}
                        className="rounded-md border border-kenar-soluk bg-zemin/60 px-2 py-1 text-[0.6875rem] text-metin-soluk"
                      >
                        {teknoloji}
                      </span>
                    ))}
                  </span>
                </span>

                <span className="lg:w-64 lg:shrink-0 lg:border-l lg:border-kenar-soluk lg:pl-6">
                  <span className="etiket-mono mb-3 block text-metin-soluk">Etki</span>
                  <dl className="space-y-2.5">
                    {vaka.etki.map((olcum) => (
                      <div key={olcum.etiket}>
                        <dt className="text-[0.6875rem] text-metin-soluk">{olcum.etiket}</dt>
                        <dd className="text-[0.8125rem] text-metin-ikincil">{olcum.deger}</dd>
                      </div>
                    ))}
                  </dl>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-vurgu-parlak">
                    Vakayı oku
                    <Ok className="size-3.5 transition-transform duration-200 ease-sinaptik group-hover:translate-x-0.5" />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8 space-y-3 rounded-lg border border-kenar bg-yuzey/40 px-4 py-3.5 text-xs leading-relaxed text-metin-soluk">
          <p>
            Vakalar müşteri onayıyla yayımlanır. Onay verilmeyen projelerde kurum adı ve sayısal
            sonuçlar paylaşılmaz; yalnızca yöntem ve öğrenilen dersler aktarılır.
          </p>
          {temsiliSayisi > 0 && (
            <p className="text-uyari">
              Bu listedeki {temsiliSayisi} kayıt <strong>TEMSİLÎ SENARYO</strong> olarak
              işaretlidir: gerçek bir müşteri işini değil, o problemde izlenen yaklaşımı anlatır.
              Kurum adı taşımaz ve içindeki hiçbir değer gerçek ölçüm değildir.
            </p>
          )}
        </div>
      </Bolum>
    </>
  );
}
