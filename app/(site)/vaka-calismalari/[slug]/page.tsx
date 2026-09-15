import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { Ok } from '@/components/arayuz/Ikonlar';
import { Rozet } from '@/components/arayuz/Rozet';
import { KapanisCagrisi } from '@/components/icerik/IcerikDuzeni';
import { MetinGovdesi } from '@/components/icerik/MetinGovdesi';
import { ustveriBirlestir } from '@/lib/seo/ustveri';
import { sektorBul, vakaBul, vakalar } from '@/lib/icerik/kurumsal';

export async function generateStaticParams() {
  return (await vakalar()).map((vaka) => ({ slug: vaka.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const vaka = await vakaBul(slug);
  if (!vaka) return {};

  // Editörün panelden yazdığı SEO alanları varsayılanların üzerine uygulanır.
  return ustveriBirlestir(vaka.seo, {
    baslik: vaka.baslik,
    aciklama: vaka.problem,
    kanonik: `/vaka-calismalari/${vaka.slug}/`,
  });
}

export default async function VakaSayfasi({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vaka = await vakaBul(slug);
  if (!vaka) notFound();

  const [sektor, VAKALAR] = await Promise.all([sektorBul(vaka.sektorSlug), vakalar()]);
  const digerleri = VAKALAR.filter((diger) => diger.slug !== vaka.slug).slice(0, 3);

  return (
    <>
      <SayfaBasligi
        kirintilar={[
          { ad: 'Vaka Çalışmaları', yol: '/vaka-calismalari/' },
          { ad: vaka.baslik, yol: `/vaka-calismalari/${vaka.slug}/` },
        ]}
        etiket={`${vaka.temsili ? 'TEMSİLÎ VAKA' : 'VAKA ÇALIŞMASI'} · ${vaka.sektor.toLocaleUpperCase('tr-TR')}`}
        baslik={vaka.baslik}
        ozet={vaka.problem}
        eylemler={
          <>
            <Dugme href="/iletisim/">
              Benzer bir proje konuşalım
              <Ok className="size-4" />
            </Dugme>
            {sektor && (
              <Dugme href={`/sektor/${sektor.slug}/`} gorunum="ikincil">
                {sektor.ad} sektörü
              </Dugme>
            )}
          </>
        }
        yan={
          <div className="rounded-2xl border border-kenar bg-yuzey/50 p-5">
            <p className="etiket-mono mb-4 border-b border-kenar-soluk pb-3.5 text-metin">
              {vaka.temsili ? 'Beklenen etki' : 'Ölçülebilir etki'}
            </p>
            <dl className="space-y-3">
              {vaka.etki.map((olcum) => (
                <div key={olcum.etiket}>
                  <dt className="etiket-mono text-metin-soluk">{olcum.etiket}</dt>
                  <dd className="mt-1 text-sm text-metin-ikincil">{olcum.deger}</dd>
                </div>
              ))}
            </dl>
            <p
              className={`mt-4 border-t border-kenar-soluk pt-3.5 text-[0.6875rem] leading-relaxed ${vaka.temsili ? 'text-uyari' : 'text-metin-soluk'}`}
            >
              {vaka.temsili
                ? 'Temsilî senaryo: buradaki satırlar ölçüm sonucu değil, bu kurulumda hangi büyüklüğün izlenmesi gerektiğini gösterir.'
                : 'Müşteri onayı olmayan projelerde sayısal sonuç paylaşılmaz; yalnızca yöntem aktarılır.'}
            </p>
          </div>
        }
      />

      <Bolum>
        {/*
         * Değişmez kural 5'in vaka karşılığı: temsilî kayıt, gerçek müşteri
         * geçmişi gibi okunamayacak biçimde işaretlenir. Uyarı sayfanın ilk
         * bölümünde ve kırpılmadan durur — kart rozeti tek başına yeterli
         * değildir, çünkü detay sayfasına doğrudan arama sonucundan girilir.
         */}
        {vaka.temsili && (
          <div className="mb-6 rounded-2xl border border-uyari/30 bg-uyari/8 p-5 sm:p-6">
            <Rozet ton="uyari">TEMSİLÎ SENARYO</Rozet>
            <p className="mt-3.5 text-sm leading-relaxed text-metin-ikincil">
              Bu kayıt gerçek bir müşteri işi <strong className="text-metin">değildir</strong>.
              Sinaptik Lab&apos;in bu problemde izlediği yaklaşımı, mimari kararları ve ölçüm
              düzenini göstermek için yazılmış temsilî bir senaryodur: kurum adı taşımaz, içindeki
              hiçbir değer gerçek ölçüm değildir ve referans olarak gösterilemez. Gerçek projelerden
              vakalar müşteri onayı alındıkça bu kütüphaneye eklenir.
            </p>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-uyari/25 bg-uyari/8 p-6 sm:p-8">
            <p className="etiket-mono mb-4 text-uyari">Problem</p>
            <p className="font-serif text-[1.0625rem] leading-relaxed text-metin">{vaka.problem}</p>
          </div>
          <div className="rounded-2xl border border-vurgu/30 bg-vurgu-zemin/45 p-6 sm:p-8">
            <p className="etiket-mono mb-4 text-vurgu-parlak">Yaklaşım</p>
            <p className="font-serif text-[1.0625rem] leading-relaxed text-metin">
              {vaka.yaklasim}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-kenar bg-zemin-derin p-6">
          <p className="etiket-mono mb-4 text-metin">Kullanılan teknolojiler</p>
          <ul className="flex flex-wrap gap-2">
            {vaka.teknolojiler.map((teknoloji) => (
              <li
                key={teknoloji}
                className="rounded-full border border-kenar bg-yuzey/50 px-3.5 py-1.5 text-xs text-metin-ikincil"
              >
                {teknoloji}
              </li>
            ))}
          </ul>
        </div>
      </Bolum>

      {vaka.govde && vaka.govde.length > 0 && (
        <Bolum>
          {/*
           * `govde` şemada ve panelde vardı, hiçbir sayfa basmıyordu — editörün
           * yazdığı uzun anlatım okura hiç ulaşmıyordu. Problem/yaklaşım
           * kartları özet, bu bölüm mimari ve ölçüm düzeninin kendisidir.
           */}
          <BolumBasligi
            numara="01"
            etiket="VAKA ANLATIMI"
            baslik="Bağlam, kurulum ve ölçüm"
            aciklama="Problem ve yaklaşım özetin üstünde; burada kararların gerekçesi ve mimarinin ayrıntısı var."
          />
          <div className="mt-6 max-w-[72ch]">
            <MetinGovdesi bloklar={vaka.govde} />
          </div>
        </Bolum>
      )}

      <Bolum zemin="derin">
        <BolumBasligi
          numara={vaka.govde && vaka.govde.length > 0 ? '02' : '01'}
          etiket="ÖĞRENİLEN DERSLER"
          baslik="Bir sonraki projede ne değişir?"
          aciklama="Bir vakanın en değerli bölümü sonuç değil, tekrar edilebilir dersidir."
        />
        <ol className="divide-y divide-kenar-soluk overflow-hidden rounded-2xl border border-kenar">
          {vaka.dersler.map((ders, sira) => (
            <li key={ders} className="flex gap-5 bg-yuzey/30 p-6">
              <span className="etiket-mono grid size-8 shrink-0 place-items-center rounded-full border border-vurgu/35 bg-vurgu-zemin text-vurgu-parlak">
                {String(sira + 1).padStart(2, '0')}
              </span>
              <p className="pt-1 font-serif text-[1.0625rem] leading-relaxed text-metin-ikincil">
                {ders}
              </p>
            </li>
          ))}
        </ol>
      </Bolum>

      <Bolum>
        <BolumBasligi
          numara={vaka.govde && vaka.govde.length > 0 ? '03' : '02'}
          etiket="DİĞER VAKALAR"
          baslik="Vaka kütüphanesinden"
          baglantiYolu="/vaka-calismalari/"
        />
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-3">
          {digerleri.map((diger) => (
            <li key={diger.slug}>
              <Link
                href={`/vaka-calismalari/${diger.slug}/`}
                className="group flex h-full flex-col bg-zemin p-6 transition-colors hover:bg-yuzey/60"
              >
                <span className="etiket-mono text-metin-soluk">{diger.sektor}</span>
                <span className="mt-2.5 block text-[0.9375rem] font-semibold tracking-tight text-metin group-hover:text-vurgu-parlak">
                  {diger.baslik}
                </span>
                <span className="mt-2 flex-1 text-xs leading-relaxed text-metin-soluk">
                  {diger.problem}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Bolum>

      <KapanisCagrisi
        etiket="BUILD"
        baslik="Aynı yaklaşımı kurumunuzda kurmak ister misiniz?"
        metin="Discovery oturumunda mevcut durumunuzu, veri erişiminizi ve başarı tanımınızı birlikte yazıyoruz."
        eylemler={
          <>
            <Dugme href="/iletisim/">
              Görüşme talep et
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/kurumsal/" gorunum="ikincil">
              Kurumsal hizmetler
            </Dugme>
          </>
        }
      />
    </>
  );
}
