import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { BosDurum } from '@/components/arayuz/Filtreler';
import { Ok, Saat } from '@/components/arayuz/Ikonlar';
import { ListeSemasi } from '@/lib/seo/jsonld';
import { rehberListesi, type RehberKaydi } from '@/lib/icerik/yayin';
import { konuHaritasi } from '@/lib/icerik/temel';
import { SEVIYE_ADI } from '@/lib/taksonomi';

export const metadata: Metadata = {
  title: 'Rehberler',
  description:
    'Uçtan uca uygulama rehberleri: her rehber tek cümlelik bir cevapla başlar, numaralı adımlara iner; tuzaklar, kontrol listesi ve kaynaklarla biter.',
  alternates: { canonical: '/rehber/' },
};

/**
 * Rehber dizini — KÜME ve KONUYA göre.
 *
 * Sayfa daha önce tüm rehberleri tarihe göre azalan tek bir kart ızgarasında
 * listeliyordu. 6 rehberde çalışıyordu; kütüphane 56 rehbere çıkınca iki
 * nedenle kırıldı: (1) 56 eşit ağırlıklı kart arasında hangi alanda rehber
 * olduğu görünmüyor, (2) tarih sırası okuma sırası DEĞİL — "Ajan belleği
 * kurmak" ile "İlk ajanı kurmak" arasındaki bağımlılığı tersine çevirebiliyor.
 *
 * Düzen artık taksonomiyi izliyor: küme → konu → rehber. Aynı konunun
 * rehberleri tek satırda toplanır ve seviye rozetiyle ayrılır; okur önce
 * "hangi alan" sonra "hangi seviye" kararını verir. `testler` arşiviyle aynı
 * kalıp — iki sayfa da aynı soruna aynı cevabı veriyor.
 *
 * KÜME BİLGİSİ rehberde YOK, konudadır. Birleştirme burada, tek
 * `konuHaritasi()` okumasıyla ve SLUG üzerinden yapılır (ada göre değil:
 * bkz. `RehberKaydi.konuSlug` notu).
 */

const SEVIYE_SIRASI: Record<string, number> = { baslangic: 0, orta: 1, ileri: 2 };
const DIGER = 'Diğer';

type KonuSatiri = { konuSlug?: string; konuAd: string; rehberler: RehberKaydi[] };
type KumeBolumu = { kume: string; konular: KonuSatiri[] };

export default async function RehberArsivi() {
  const [REHBERLER, KONULAR] = await Promise.all([rehberListesi(), konuHaritasi()]);

  const kumeler = new Map<string, Map<string, KonuSatiri>>();
  for (const rehber of REHBERLER) {
    const konu = KONULAR.get(rehber.konuSlug);
    const kume = konu?.kume ?? DIGER;
    if (!kumeler.has(kume)) kumeler.set(kume, new Map());
    const satirlar = kumeler.get(kume)!;
    const anahtar = konu?.slug ?? rehber.konu;
    if (!satirlar.has(anahtar)) {
      satirlar.set(anahtar, {
        konuSlug: konu?.slug,
        konuAd: konu?.ad ?? rehber.konu,
        rehberler: [],
      });
    }
    satirlar.get(anahtar)!.rehberler.push(rehber);
  }

  const bolumler: KumeBolumu[] = [...kumeler.entries()]
    .map(([kume, satirlar]) => ({
      kume,
      konular: [...satirlar.values()]
        .map((satir) => ({
          ...satir,
          rehberler: [...satir.rehberler].sort(
            (a, b) =>
              (SEVIYE_SIRASI[a.seviye] ?? 9) - (SEVIYE_SIRASI[b.seviye] ?? 9) ||
              a.baslik.localeCompare(b.baslik, 'tr'),
          ),
        }))
        .sort((a, b) => a.konuAd.localeCompare(b.konuAd, 'tr')),
    }))
    .sort((a, b) => {
      if (a.kume === DIGER) return 1;
      if (b.kume === DIGER) return -1;
      return a.kume.localeCompare(b.kume, 'tr');
    });

  const toplamAdim = REHBERLER.reduce((t, r) => t + r.adimlar, 0);
  const konuSayisi = bolumler.reduce((t, b) => t + b.konular.length, 0);

  return (
    <>
      <ListeSemasi
        ad="Sinaptik rehberleri"
        ogeler={REHBERLER.map((rehber) => ({ ad: rehber.baslik, yol: `/rehber/${rehber.slug}/` }))}
      />

      <SayfaBasligi
        kirintilar={[{ ad: 'Rehberler', yol: '/rehber/' }]}
        etiket="UNDERSTAND"
        baslik="Rehberler"
        ozet="Kavramı bildikten sonrası: adım adım uygulama. Her rehber tek cümlelik bir cevapla başlar, sonra adımlara iner; tuzaklar ve kontrol listesiyle biter."
        olcumler={[
          { deger: `${REHBERLER.length}`, etiket: 'Rehber' },
          { deger: `${toplamAdim}`, etiket: 'Toplam adım' },
          { deger: `${konuSayisi}`, etiket: 'Konu' },
          { deger: `${bolumler.length}`, etiket: 'Küme' },
        ]}
      />

      {REHBERLER.length === 0 ? (
        <Bolum>
          <BosDurum
            baslik="Rehberler hazırlanıyor"
            metin="Yayına alınmış rehber yok. Kavram tanımları AI Atlas girdilerinde duruyor."
          />
        </Bolum>
      ) : (
        bolumler.map((bolum, sira) => (
          <Bolum key={bolum.kume} zemin={sira % 2 === 1 ? 'derin' : undefined}>
            <BolumBasligi
              numara={String(sira + 1).padStart(2, '0')}
              etiket="KÜME"
              baslik={bolum.kume}
              aciklama={`${bolum.konular.length} konu · ${bolum.konular.reduce((t, k) => t + k.rehberler.length, 0)} rehber`}
            />
            <ul className="mt-6 divide-y divide-kenar-soluk overflow-hidden rounded-2xl border border-kenar">
              {bolum.konular.map((satir) => (
                <KonuSatiriBas key={satir.konuAd} satir={satir} />
              ))}
            </ul>
          </Bolum>
        ))
      )}
    </>
  );
}

function KonuSatiriBas({ satir }: { satir: KonuSatiri }) {
  return (
    <li className="flex flex-col gap-4 bg-yuzey/25 p-5 lg:flex-row lg:items-start lg:gap-8">
      <div className="lg:w-64 lg:shrink-0">
        {satir.konuSlug ? (
          <Link
            href={`/konu/${satir.konuSlug}/`}
            className="text-[0.9375rem] font-medium text-metin transition-colors hover:text-vurgu-parlak"
          >
            {satir.konuAd}
          </Link>
        ) : (
          <span className="text-[0.9375rem] font-medium text-metin">{satir.konuAd}</span>
        )}
        <p className="etiket-mono mt-1.5 text-metin-soluk">{satir.rehberler.length} rehber</p>
      </div>

      <ul className="flex min-w-0 flex-1 flex-col gap-3.5">
        {satir.rehberler.map((rehber) => (
          <li key={rehber.slug}>
            <Link href={`/rehber/${rehber.slug}/`} className="group block">
              <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
                <span className="etiket-mono rounded-full border border-vurgu/30 bg-vurgu-zemin px-2.5 py-1 text-vurgu-parlak">
                  {SEVIYE_ADI[rehber.seviye]}
                </span>
                <span className="min-w-0 flex-1 text-[0.9375rem] font-medium text-metin group-hover:text-vurgu-parlak">
                  {rehber.baslik}
                </span>
                <span className="inline-flex shrink-0 items-center gap-3 text-[0.6875rem] text-metin-soluk">
                  <span>{rehber.adimlar} adım</span>
                  <span className="inline-flex items-center gap-1">
                    <Saat className="size-3" />
                    {rehber.okumaDakika} dk
                  </span>
                  <Ok className="size-3 transition-transform duration-200 ease-sinaptik group-hover:translate-x-0.5" />
                </span>
              </span>
              {/* Answer-first cevap listede de görünür: okur rehbere girmeden
                  "bu iş nasıl yapılır" sorusunun cevabını alır. */}
              <span className="mt-1.5 block text-[0.8125rem] leading-relaxed text-metin-ikincil">
                {rehber.kisaCevap}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
}
