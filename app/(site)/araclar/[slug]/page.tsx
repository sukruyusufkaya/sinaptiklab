import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { Ok, Onay } from '@/components/arayuz/Ikonlar';
import { ustveriBirlestir } from '@/lib/seo/ustveri';
import { aracBul, aracListesi, sirketBul } from '@/lib/icerik/varliklar';

export async function generateStaticParams() {
  return (await aracListesi()).map((arac) => ({ slug: arac.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const arac = await aracBul(slug);
  if (!arac) return {};

  // Editörün panelden yazdığı SEO alanları varsayılanların üzerine uygulanır.
  return ustveriBirlestir(arac.seo, {
    baslik: arac.ad,
    aciklama: arac.neIse,
    kanonik: `/araclar/${arac.slug}/`,
  });
}

export default async function AracSayfasi({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const arac = await aracBul(slug);
  if (!arac) notFound();

  /*
   * "Diğer araçlar" YAKINLIĞA göre: aynı kategoriden başlar. Önceki hâli
   * alfabetik ilk beşti, yani 56 araç sayfasının altında hep aynı beş
   * bağlantı görünüyordu.
   */
  const TUMU = await aracListesi();
  const digerleri = TUMU.filter((diger) => diger.slug !== arac.slug)
    .map((diger) => ({ diger, yakin: diger.kategori === arac.kategori ? 0 : 1 }))
    .sort((a, b) => a.yakin - b.yakin || a.diger.ad.localeCompare(b.diger.ad, 'tr'))
    .slice(0, 5)
    .map(({ diger }) => diger);

  // Üretici şirket; `sirketSlug` yoksa ya da karşılığı yayında değilse yok.
  const uretici = await sirketBul(arac.sirketSlug);

  return (
    <>
      <SayfaBasligi
        kirintilar={[
          { ad: 'AI Araçları', yol: '/araclar/' },
          { ad: arac.ad, yol: `/araclar/${arac.slug}/` },
        ]}
        etiket={arac.kategori}
        baslik={arac.ad}
        ozet={arac.neIse}
        eylemler={
          uretici ? (
            /*
              Varlık grafiğinin eksik kenarı: araç → üretici şirket. Bağı
              olmayan araçta satır hiç basılmaz (kategori incelemeleri ve
              şirket künyesi olmayan araçlar).
            */
            <Dugme href={`/sirketler/${uretici.slug}/`} gorunum="ikincil">
              {uretici.ad} künyesi
              <Ok className="size-4" />
            </Dugme>
          ) : undefined
        }
        yan={
          <div className="rounded-2xl border border-kenar bg-yuzey/50 p-5">
            <p className="etiket-mono mb-4 border-b border-kenar-soluk pb-3.5 text-metin">
              Özet kart
            </p>
            <dl className="space-y-3 text-xs">
              <div>
                <dt className="text-metin-soluk">Kim kullanmalı?</dt>
                <dd className="mt-1 text-metin-ikincil">{arac.kimKullanmali}</dd>
              </div>
              <div>
                <dt className="text-metin-soluk">En iyi kullanım</dt>
                <dd className="mt-1 text-metin-ikincil">{arac.enIyiKullanim}</dd>
              </div>
              <div>
                <dt className="text-metin-soluk">Fiyat modeli</dt>
                <dd className="mt-1 text-metin-ikincil">{arac.fiyat}</dd>
              </div>
            </dl>
          </div>
        }
      />

      <Bolum>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-kenar bg-yuzey/40 p-6">
            <p className="etiket-mono mb-4 text-basari">Artıları</p>
            <ul className="space-y-2.5">
              {arac.artilar.map((arti) => (
                <li
                  key={arti}
                  className="flex items-start gap-2.5 text-[0.875rem] text-metin-ikincil"
                >
                  <Onay className="mt-0.5 size-4 shrink-0 text-basari" />
                  {arti}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-kenar bg-yuzey/40 p-6">
            <p className="etiket-mono mb-4 text-uyari">Eksileri</p>
            <ul className="space-y-2.5">
              {arac.eksiler.map((eksi) => (
                <li
                  key={eksi}
                  className="flex items-start gap-2.5 text-[0.875rem] text-metin-ikincil"
                >
                  <span
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-uyari"
                    aria-hidden="true"
                  />
                  {eksi}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-vurgu/30 bg-vurgu-zemin/45 p-6">
          <p className="etiket-mono mb-3 text-vurgu-parlak">Sinaptik değerlendirmesi</p>
          <p className="font-serif text-[1.0625rem] leading-relaxed text-metin">
            {arac.degerlendirme}
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-kenar bg-zemin-derin p-6">
          <p className="etiket-mono mb-4 text-metin">Alternatifler</p>
          <ul className="flex flex-wrap gap-2">
            {arac.alternatifler.map((alternatif) => (
              <li
                key={alternatif}
                className="rounded-full border border-kenar bg-yuzey/50 px-3.5 py-1.5 text-xs text-metin-ikincil"
              >
                {alternatif}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-xs text-metin-soluk">
          Bu inceleme bir ürün önerisi değil kategori değerlendirmesidir. Sponsorlu içerikler açıkça
          işaretlenir; bu sayfa sponsorlu değildir.
        </p>
      </Bolum>

      <Bolum zemin="derin">
        <BolumBasligi
          numara="01"
          etiket="DİĞER İNCELEMELER"
          baslik="Araç seçkisinden"
          baglantiYolu="/araclar/"
        />
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-3">
          {digerleri.map((diger) => (
            <li key={diger.slug}>
              <Link
                href={`/araclar/${diger.slug}/`}
                className="group flex h-full flex-col bg-zemin p-5 transition-colors hover:bg-yuzey/60"
              >
                <span className="etiket-mono text-metin-soluk">{diger.kategori}</span>
                <span className="mt-2 block text-[0.9375rem] font-medium text-metin group-hover:text-vurgu-parlak">
                  {diger.ad}
                </span>
                <span className="mt-1.5 text-xs leading-relaxed text-metin-soluk">
                  {diger.neIse}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <Dugme href="/araclar/hesaplayicilar/" gorunum="ikincil">
            Sinaptik hesaplayıcıları
            <Ok className="size-4" />
          </Dugme>
        </div>
      </Bolum>
    </>
  );
}
