import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Kirintilar } from '@/components/arayuz/Kirintilar';
import { Rozet } from '@/components/arayuz/Rozet';
import { Dugme } from '@/components/arayuz/Dugme';
import { Ok } from '@/components/arayuz/Ikonlar';
import { IcerikDuzeni, KapanisCagrisi } from '@/components/icerik/IcerikDuzeni';
import { OkumaCubugu } from '@/components/icerik/OkumaCubugu';
import { IcindekilerTakipli } from '@/components/icerik/IcindekilerTakipli';
import { MetinGovdesi, altBasliklar } from '@/components/icerik/MetinGovdesi';
import {
  IlgiliBaglantilar,
  KaynakListesi,
  SSSBolumu,
  YazarSeridi,
} from '@/components/icerik/IcerikKenari';
import { MakaleSemasi, SSSSemasi } from '@/lib/seo/jsonld';
import { ustveriBirlestir } from '@/lib/seo/ustveri';
import { analizBul, analizler } from '@/lib/icerik/gundem';
import { atlasBul } from '@/lib/icerik/atlas';
import { yazarBul } from '@/lib/icerik/temel';
import { tarihUzun } from '@/lib/bicim';

export async function generateStaticParams() {
  return (await analizler()).map((analiz) => ({ slug: analiz.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const analiz = await analizBul(slug);
  if (!analiz) return {};

  // Editorun panelden yazdigi SEO alanlari varsayilanlarin uzerine uygulanir.
  return ustveriBirlestir(analiz.seo, {
    baslik: analiz.baslik,
    aciklama: analiz.girizgah,
    kanonik: `/analiz/${analiz.slug}/`,
    openGraph: { type: 'article' },
  });
}

export default async function AnalizSayfasi({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const analiz = await analizBul(slug);
  if (!analiz) notFound();

  const yazar = await yazarBul(analiz.yazarSlug);
  const digerleri = (await analizler()).filter((diger) => diger.slug !== analiz.slug).slice(0, 4);
  const basliklar = altBasliklar(analiz.govde);
  const kavramlar = (
    await Promise.all((analiz.ilgiliSluglar ?? []).map((slug) => atlasBul(slug)))
  ).filter((girdi): girdi is NonNullable<typeof girdi> => Boolean(girdi));

  return (
    <>
      <OkumaCubugu />
      {analiz.sss && <SSSSemasi sorular={analiz.sss} />}
      {yazar && (
        <MakaleSemasi
          baslik={analiz.baslik}
          aciklama={analiz.girizgah}
          yol={`/analiz/${analiz.slug}/`}
          yazar={yazar}
          yayinTarihi={analiz.tarih}
          bolum={analiz.konu}
        />
      )}

      <section className="relative overflow-hidden border-b border-kenar bg-zemin-derin">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="nokta-zemin absolute inset-0 opacity-40" />
          <div className="absolute -top-24 right-1/4 h-60 w-96 rounded-full bg-ikincil/14 blur-[100px]" />
        </div>

        <div className="kap relative py-10 md:py-14">
          <Kirintilar
            ogeler={[
              { ad: 'Analizler', yol: '/analiz/' },
              { ad: analiz.baslik, yol: `/analiz/${analiz.slug}/` },
            ]}
          />

          <div className="flex flex-wrap items-center gap-2">
            <Rozet ton="ikincil">Analiz</Rozet>
            <Rozet>{analiz.konu}</Rozet>
          </div>

          <h1 className="mt-5 max-w-4xl text-[1.875rem] leading-[1.1] font-semibold tracking-[-0.028em] text-balance sm:text-[2.375rem]">
            {analiz.baslik}
          </h1>

          <p className="mt-6 max-w-3xl font-serif text-lg leading-relaxed text-metin-ikincil sm:text-xl">
            {analiz.girizgah}
          </p>

          <p className="mt-7 text-xs text-metin-soluk">
            {yazar ? `${yazar.ad} · ` : ''}
            <time dateTime={analiz.tarih}>{tarihUzun(analiz.tarih)}</time> · {analiz.okumaDakika}{' '}
            dakikalık okuma
          </p>
        </div>
      </section>

      <IcerikDuzeni
        kenar={
          <>
            <TezKunyesi
              guven={analiz.tezGuveni}
              yanlislanma={analiz.yanlislanmaKosulu}
              konu={analiz.konu}
            />
            {basliklar.length > 0 && <IcindekilerTakipli basliklar={basliklar} />}
            {yazar && (
              <YazarSeridi
                yazar={yazar}
                yayinTarihi={analiz.tarih}
                guncellemeTarihi={analiz.guncellemeTarihi}
                okumaDakika={analiz.okumaDakika}
              />
            )}
            {kavramlar.length > 0 && (
              <IlgiliBaglantilar
                baslik="Geçen kavramlar"
                ogeler={kavramlar.map((girdi) => ({
                  ad: girdi.ad,
                  yol: `/atlas/${girdi.slug}/`,
                  not: girdi.kategori,
                }))}
              />
            )}
            {digerleri.length > 0 && (
              <IlgiliBaglantilar
                baslik="Diğer analizler"
                ogeler={digerleri.map((diger) => ({
                  ad: diger.baslik,
                  yol: `/analiz/${diger.slug}/`,
                  not: diger.konu,
                }))}
              />
            )}
          </>
        }
      >
        {analiz.govde ? (
          <MetinGovdesi bloklar={analiz.govde} />
        ) : (
          <div className="rounded-xl border border-kenar bg-yuzey/40 p-6">
            <p className="etiket-mono mb-3 text-metin-soluk">Editoryal not</p>
            <p className="text-[0.9375rem] leading-relaxed text-metin-ikincil">
              Bu analizin tam metni hazırlanıyor. Yayına girdiğinde iddiaların her biri birincil
              kaynağa bağlanacak; sayısal karşılaştırmalar tablo ile desteklenecek.
            </p>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-metin-ikincil">
              Yukarıdaki girizgâh, metnin alıntılanabilir tezidir.
            </p>
          </div>
        )}

        {analiz.yanlislanmaKosulu && (
          <div className="mt-12 rounded-2xl border border-uyari/30 bg-uyari/8 p-6">
            <p className="etiket-mono mb-2.5 text-uyari">Bu tezi ne çürütür?</p>
            <p className="text-[0.9375rem] leading-relaxed text-metin-ikincil">
              {analiz.yanlislanmaKosulu}
            </p>
            <p className="mt-4 border-t border-uyari/20 pt-3.5 text-xs leading-relaxed text-metin-soluk">
              Her analiz kendi yanlışlanma koşulunu yazar. Bir tezin hangi gözlemle çürütüleceğini
              söyleyemiyorsak ortada tez değil temenni vardır; o metin yayımlanmaz.
            </p>
          </div>
        )}

        {analiz.sss && (
          <div className="mt-12">
            <SSSBolumu sorular={analiz.sss} />
          </div>
        )}

        {analiz.kaynaklar && (
          <div className="mt-12">
            <KaynakListesi kaynaklar={analiz.kaynaklar} />
          </div>
        )}
      </IcerikDuzeni>

      <KapanisCagrisi
        etiket="UNDERSTAND"
        baslik="Analizin dayandığı kavramları da oku"
        metin="Her analiz, Atlas'taki kalıcı kavram girdilerine yaslanır. Terimleri oradan derinleştirebilirsin."
        eylemler={
          <>
            <Dugme href="/atlas/">
              AI Atlas
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/analiz/" gorunum="ikincil">
              Tüm analizler
            </Dugme>
          </>
        }
      />
    </>
  );
}

/* --- TEZ KÜNYESİ ---------------------------------------------------------- */

const GUVEN_ADI: Record<string, { ad: string; tarif: string; ton: string }> = {
  yuksek: {
    ad: 'Yüksek',
    tarif: 'Tez, birden çok bağımsız kaynakla ve saha gözlemiyle destekleniyor.',
    ton: 'text-basari',
  },
  orta: {
    ad: 'Orta',
    tarif: 'Tezin yönü destekleniyor ama büyüklüğü ve kalıcılığı belirsiz.',
    ton: 'text-uyari',
  },
  dusuk: {
    ad: 'Düşük',
    tarif: 'Tez erken bir okuma; kanıt sınırlı ve hızla değişebilir.',
    ton: 'text-tehlike',
  },
};

/**
 * Analizin kendi iddiası üzerine künyesi.
 *
 * NEDEN VAR: analiz ile görüş yazısı arasındaki fark tonda değil, iddianın
 * statüsünün açıklanmasında. Bir okurun "buna ne kadar güvenebilirim"
 * sorusuna cevap vermeyen metin, okuru kendi sezgisine bırakır — ve bu
 * alandaki en yaygın hata tam olarak budur: kesin tonla yazılmış belirsiz
 * iddialar.
 *
 * Güven seviyesi yazılmamışsa kutu HİÇ BASILMAZ. Varsayılan bir seviye
 * atamak ("orta" demek), yazarın vermediği bir kararı yazara atfetmek olurdu.
 */
function TezKunyesi({
  guven,
  yanlislanma,
  konu,
}: {
  guven?: string;
  yanlislanma?: string;
  konu: string;
}) {
  if (!guven && !yanlislanma) return null;
  const kayit = guven ? GUVEN_ADI[guven] : undefined;

  return (
    <div className="rounded-xl border border-kenar bg-yuzey/40 p-5">
      <p className="etiket-mono mb-3 text-metin-soluk">Tez künyesi</p>
      <dl className="space-y-3">
        <div>
          <dt className="etiket-mono text-metin-soluk">Alan</dt>
          <dd className="mt-0.5 text-[0.875rem] text-metin-ikincil">{konu}</dd>
        </div>
        {kayit && (
          <div>
            <dt className="etiket-mono text-metin-soluk">Kanıt gücü</dt>
            <dd className={`mt-0.5 text-[0.875rem] font-medium ${kayit.ton}`}>{kayit.ad}</dd>
            <dd className="mt-1 text-xs leading-relaxed text-metin-soluk">{kayit.tarif}</dd>
          </div>
        )}
        {yanlislanma && (
          <div>
            <dt className="etiket-mono text-metin-soluk">Yanlışlanma koşulu</dt>
            <dd className="mt-0.5 text-xs leading-relaxed text-metin-ikincil">
              Metnin sonunda yazılı.
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
