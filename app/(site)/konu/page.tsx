import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { ListeSemasi } from '@/lib/seo/jsonld';
import { konuAgaci, type KonuDugumu } from '@/lib/icerik/temel';
import { atlasBul } from '@/lib/icerik/atlas';

export const metadata: Metadata = {
  title: 'Konu Merkezleri',
  description:
    'Bir konunun tamamı tek sayfada: tanım, rehberler, haberler, araştırmalar, dersler ve testler bir arada.',
  alternates: { canonical: '/konu/' },
};

/**
 * Konu dizini — İKİ DÜZEYLİ AĞAÇ olarak.
 *
 * Sayfa daha önce 11 konuyu düz bir kart ızgarasında listeliyordu. Taksonomi
 * 50 konuya çıkınca düz liste iki nedenle kırıldı: (1) 50 eşit ağırlıklı kart
 * arasında ana konu ile alt konu ayırt edilemiyor, (2) alfabetik sıra "Akıl
 * Yürütme"yi "Büyük Dil Modelleri"nden önce göstererek bağımlılığı tersine
 * çeviriyor. Şimdi kümeye göre gruplanıp her ana konunun altında kendi alt
 * konuları listeleniyor; sıra editörün `sira` alanından geliyor.
 *
 * Konu başına gündem sayısı BİLİNÇLİ OLARAK gösterilmiyor: 50 konu × akış
 * sorgusu, sayfayı yalnızca bir rozet için onlarca sorguya mal ediyordu.
 * Atlas karşılığı hafif bir tek belge okuması olduğu için ana konularda
 * tanım metni olarak korunuyor.
 */
export default async function KonuDizini() {
  const agac = await konuAgaci();

  // JSX içinde await beklenemez; ana konuların Atlas tanımı önceden çözülür.
  const tanimlar = new Map(
    await Promise.all(
      agac.map(async ({ konu }) => [konu.slug, (await atlasBul(konu.slug))?.kisaTanim] as const),
    ),
  );

  const kumeler = [...new Set(agac.map(({ konu }) => konu.kume))];
  const altToplam = agac.reduce((t, d) => t + d.altKonular.length, 0);

  const tumKonular = agac.flatMap(({ konu, altKonular }) => [konu, ...altKonular]);

  return (
    <>
      <ListeSemasi
        ad="Konu merkezleri"
        ogeler={tumKonular.map((konu) => ({ ad: konu.ad, yol: `/konu/${konu.slug}/` }))}
      />

      <SayfaBasligi
        kirintilar={[{ ad: 'Konu Merkezleri', yol: '/konu/' }]}
        etiket="UNDERSTAND"
        baslik="Konu merkezleri"
        ozet="Konu ile format ayrıdır. Bir konu merkezi, o konu hakkındaki her formatı — kavram, rehber, haber, araştırma, ders ve test — tek sayfada toplar."
        olcumler={[
          { deger: `${agac.length}`, etiket: 'Ana konu' },
          { deger: `${altToplam}`, etiket: 'Alt konu' },
          { deger: `${kumeler.length}`, etiket: 'Küme' },
        ]}
      />

      {kumeler.map((kume, sira) => {
        const dugumler = agac.filter(({ konu }) => konu.kume === kume);
        return (
          <Bolum key={kume} zemin={sira % 2 === 1 ? 'derin' : undefined}>
            <BolumBasligi
              numara={String(sira + 1).padStart(2, '0')}
              etiket="KÜME"
              baslik={kume}
              aciklama={`${dugumler.length} ana konu · ${dugumler.reduce((t, d) => t + d.altKonular.length, 0)} alt konu`}
            />
            <ul className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar lg:grid-cols-2">
              {dugumler.map((dugum) => (
                <KonuKarti
                  key={dugum.konu.slug}
                  dugum={dugum}
                  tanim={tanimlar.get(dugum.konu.slug)}
                />
              ))}
            </ul>
          </Bolum>
        );
      })}
    </>
  );
}

function KonuKarti({ dugum, tanim }: { dugum: KonuDugumu; tanim?: string }) {
  const { konu, altKonular } = dugum;

  return (
    <li className="flex flex-col bg-zemin p-5">
      <Link
        href={`/konu/${konu.slug}/`}
        className="group text-[0.9375rem] font-medium text-metin transition-colors hover:text-vurgu-parlak"
      >
        {konu.ad}
      </Link>

      {(konu.ozet ?? tanim) && (
        <p className="mt-2 text-xs leading-relaxed text-metin-ikincil">
          {(konu.ozet ?? tanim ?? '').slice(0, 180)}
        </p>
      )}

      {altKonular.length > 0 && (
        <ul className="mt-3.5 flex flex-wrap gap-1.5">
          {altKonular.map((alt) => (
            <li key={alt.slug}>
              <Link
                href={`/konu/${alt.slug}/`}
                className="inline-block rounded-full border border-kenar-soluk px-2.5 py-1 text-[0.6875rem] text-metin-soluk transition-colors hover:border-vurgu hover:text-metin"
              >
                {alt.ad}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
