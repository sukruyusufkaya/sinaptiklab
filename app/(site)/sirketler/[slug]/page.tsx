import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { Ok, Saat } from '@/components/arayuz/Ikonlar';
import { ustveriBirlestir } from '@/lib/seo/ustveri';
import {
  sirketBul,
  sirketinAraclari,
  sirketinModelleri,
  sirketListesi,
} from '@/lib/icerik/varliklar';
import { tumGundem } from '@/lib/icerik/gundem';
import { tarihKisa } from '@/lib/bicim';

export async function generateStaticParams() {
  return (await sirketListesi()).map((sirket) => ({ slug: sirket.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sirket = await sirketBul(slug);
  if (!sirket) return {};

  // Editörün panelden yazdığı SEO alanları varsayılanların üzerine uygulanır.
  return ustveriBirlestir(sirket.seo, {
    baslik: sirket.ad,
    aciklama: sirket.ozet,
    kanonik: `/sirketler/${sirket.slug}/`,
  });
}

export default async function SirketSayfasi({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sirket = await sirketBul(slug);
  if (!sirket) notFound();

  const [modeller, araclar] = await Promise.all([
    sirketinModelleri(sirket.slug),
    // Varlık grafiğinin ters yönü: şirket → yaptığı araçlar.
    sirketinAraclari(sirket.slug),
  ]);
  const digerSirketler = (await sirketListesi()).filter((diger) => diger.slug !== sirket.slug);
  // Basit entity eşlemesi: haber metninde şirket adı geçiyorsa bağlanır.
  const haberler = (await tumGundem())
    .filter(
      (icerik) =>
        icerik.baslik.includes(sirket.ad) ||
        icerik.kisaCevap.includes(sirket.ad) ||
        (icerik.ozet ?? '').includes(sirket.ad),
    )
    .slice(0, 5);

  const kunye = [
    { etiket: 'Tür', deger: sirket.tur },
    { etiket: 'Merkez', deger: sirket.merkez },
    { etiket: 'Kuruluş', deger: sirket.kurulus },
    { etiket: 'Alan', deger: sirket.alan },
  ];

  return (
    <>
      <SayfaBasligi
        kirintilar={[
          { ad: 'AI Şirketleri', yol: '/sirketler/' },
          { ad: sirket.ad, yol: `/sirketler/${sirket.slug}/` },
        ]}
        etiket="ŞİRKET VARLIĞI"
        baslik={sirket.ad}
        ozet={sirket.ozet}
        eylemler={
          modeller.length > 0 ? (
            <Dugme href={`/modeller/${modeller[0]!.slug}/`}>
              {modeller[0]!.ad}
              <Ok className="size-4" />
            </Dugme>
          ) : undefined
        }
        yan={
          <div className="rounded-2xl border border-kenar bg-yuzey/50 p-5">
            <p className="etiket-mono mb-4 border-b border-kenar-soluk pb-3.5 text-metin">Künye</p>
            <dl className="space-y-2.5 text-xs">
              {kunye.map((satir) => (
                <div key={satir.etiket} className="flex justify-between gap-4">
                  <dt className="shrink-0 text-metin-soluk">{satir.etiket}</dt>
                  <dd className="text-right text-metin-ikincil">{satir.deger}</dd>
                </div>
              ))}
            </dl>
          </div>
        }
        desen="nokta"
      />

      <Bolum>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-kenar bg-yuzey/40 p-6">
            <p className="etiket-mono mb-4 text-metin">Ürünler</p>
            <ul className="space-y-2.5">
              {sirket.urunler.map((urun) => (
                <li
                  key={urun}
                  className="flex items-start gap-2.5 text-[0.875rem] text-metin-ikincil"
                >
                  <span
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-vurgu-sonuk"
                    aria-hidden="true"
                  />
                  {urun}
                </li>
              ))}
            </ul>
          </div>

          {sirket.kilometreTaslari && (
            <div className="rounded-2xl border border-kenar bg-yuzey/40 p-6">
              <p className="etiket-mono mb-4 text-metin">Kilometre taşları</p>
              <ol className="space-y-3.5">
                {sirket.kilometreTaslari.map((tas) => (
                  <li key={tas.tarih} className="flex gap-4">
                    <span className="etiket-mono w-10 shrink-0 text-vurgu-parlak">{tas.tarih}</span>
                    <span className="text-[0.875rem] leading-relaxed text-metin-ikincil">
                      {tas.olay}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </Bolum>

      {modeller.length > 0 && (
        <Bolum zemin="derin">
          <BolumBasligi
            numara="01"
            etiket="MODELLER"
            baslik={`${sirket.ad} modelleri`}
            baglantiYolu="/modeller/"
          />
          <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2">
            {modeller.map((model) => (
              <li key={model.slug}>
                <Link
                  href={`/modeller/${model.slug}/`}
                  className="group flex h-full flex-col bg-zemin p-6 transition-colors hover:bg-yuzey/60"
                >
                  <span className="etiket-mono text-metin-soluk">{model.tip}</span>
                  <span className="mt-2.5 block text-[1.0625rem] font-semibold tracking-tight text-metin group-hover:text-vurgu-parlak">
                    {model.ad}
                  </span>
                  <span className="mt-2 flex-1 text-[0.8125rem] leading-relaxed text-metin-ikincil">
                    {model.vurgu}
                  </span>
                  <span className="etiket-mono mt-4 text-metin-soluk">
                    {model.acikKaynak ? 'Açık ağırlık' : 'Kapalı ağırlık'} · {model.baglamPenceresi}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Bolum>
      )}

      {araclar.length > 0 && (
        <Bolum>
          {/*
           * Şirket → araç bağı. `modeller` ile aynı ilke: şirket sayfası
           * kendi varlıklarını listeler, böylece Cursor ile Anysphere, Claude
           * Code ile Anthropic arasındaki geçiş iki yönlü çalışır.
           */}
          <BolumBasligi
            numara="02"
            etiket="ARAÇLAR"
            baslik={`${sirket.ad} araçları`}
            aciklama="Bu şirketin yaptığı, araç kayıt defterinde incelenen ürünler."
            baglantiYolu="/araclar/"
          />
          <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-3">
            {araclar.map((arac) => (
              <li key={arac.slug}>
                <Link
                  href={`/araclar/${arac.slug}/`}
                  className="group flex h-full flex-col bg-zemin p-5 transition-colors hover:bg-yuzey/60"
                >
                  <span className="etiket-mono text-metin-soluk">{arac.kategori}</span>
                  <span className="mt-2 block text-[0.9375rem] font-medium text-metin group-hover:text-vurgu-parlak">
                    {arac.ad}
                  </span>
                  <span className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-metin-soluk">
                    {arac.neIse}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Bolum>
      )}

      {haberler.length > 0 && (
        <Bolum zemin={araclar.length > 0 ? 'derin' : undefined}>
          <BolumBasligi
            numara={araclar.length > 0 ? '03' : '02'}
            etiket="GÜNDEM"
            baslik={`${sirket.ad} ile ilgili gelişmeler`}
            baglantiYolu="/gundem/"
          />
          <ul className="divide-y divide-kenar-soluk border-y border-kenar-soluk">
            {haberler.map((haber) => (
              <li key={haber.slug} className="group">
                <Link href={haber.yol} className="flex items-start gap-5 py-4">
                  <span className="etiket-mono mt-1 w-14 shrink-0 text-metin-soluk">
                    {tarihKisa(haber.yayinTarihi)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.9375rem] font-medium text-metin group-hover:text-vurgu-parlak">
                      {haber.baslik}
                    </span>
                    <span className="mt-1.5 block text-[0.8125rem] leading-relaxed text-metin-soluk">
                      {haber.kisaCevap}
                    </span>
                  </span>
                  <span className="etiket-mono mt-1 hidden shrink-0 items-center gap-1.5 text-metin-soluk sm:inline-flex">
                    <Saat className="size-3.5" />
                    {haber.okumaDakika} dk
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Bolum>
      )}

      <Bolum zemin={haberler.length > 0 && araclar.length > 0 ? undefined : 'derin'}>
        <BolumBasligi
          numara={String(2 + (araclar.length > 0 ? 1 : 0) + (haberler.length > 0 ? 1 : 0)).padStart(
            2,
            '0',
          )}
          etiket="EKOSİSTEM"
          baslik="Diğer şirketler"
          baglantiYolu="/sirketler/"
        />
        <ul className="flex flex-wrap gap-2">
          {digerSirketler.map((diger) => (
            <li key={diger.slug}>
              <Link
                href={`/sirketler/${diger.slug}/`}
                className="rounded-full border border-kenar bg-yuzey/40 px-4 py-2 text-sm text-metin-ikincil transition-colors hover:border-vurgu/45 hover:text-metin"
              >
                {diger.ad}
              </Link>
            </li>
          ))}
        </ul>
      </Bolum>
    </>
  );
}
