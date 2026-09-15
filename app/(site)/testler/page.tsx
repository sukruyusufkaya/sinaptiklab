import type { Metadata } from 'next';
import Link from 'next/link';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { BosDurum } from '@/components/arayuz/Filtreler';
import { Dugme } from '@/components/arayuz/Dugme';
import { Hedef, Ok, Saat } from '@/components/arayuz/Ikonlar';
import { ListeSemasi } from '@/lib/seo/jsonld';
import { testler, type TestKunyesi } from '@/lib/icerik/ogrenme';
import { konuHaritasi } from '@/lib/icerik/temel';
import { SEVIYE_ADI } from '@/lib/taksonomi';

export const metadata: Metadata = {
  title: 'Testler',
  description:
    'Yapay zekâ konu testleri: taksonomideki her konu için başlangıç, orta ve ileri seviye ölçüm. RAG, ajanlar, LLM, altyapı, değerlendirme, güvenlik ve regülasyon.',
  alternates: { canonical: '/testler/' },
};

/**
 * Test dizini — KÜMEYE ve KONUYA göre.
 *
 * Sayfa daha önce tüm testleri tek kart ızgarasında, SORU SAYISINA göre azalan
 * sırada listeliyordu. İki neden de kırıldı: (1) banka 12 testten 100 teste
 * çıkınca 100 eşit ağırlıklı kart arasında konu ayırt edilemiyor, (2) her test
 * altı soru taşıdığı için "soru sayısına göre sırala" artık bir sıra
 * üretmiyor — kararı rastgeleye bırakıyor.
 *
 * Şimdi düzen taksonomiyi izliyor: küme → konu → seviye. Aynı konunun
 * başlangıç/orta/ileri testleri tek satırda yan yana durur, yani okur önce
 * "hangi konu" sonra "hangi seviye" kararını verir. `konu` merkezine bağlantı
 * her satırda var; test ile konu arasındaki bağ `konuSlug` üzerinden kurulur
 * (bkz. `konuyaGoreTestler`).
 *
 * KÜME BİLGİSİ testte YOK, konudadır. Birleştirme burada, tek `konuHaritasi()`
 * okumasıyla yapılır — `lib/icerik/temel.ts` başlığındaki kalıp. Konusu
 * çözülemeyen test "Diğer" altında toplanır; listeden DÜŞMEZ (test sayfası
 * yayında, dizinden gizlemek onu erişilemez kılardı).
 */

const SEVIYE_SIRASI: Record<string, number> = { baslangic: 0, orta: 1, ileri: 2 };
const DIGER = 'Diğer';

type KonuSatiri = { konuSlug?: string; konuAd: string; testler: TestKunyesi[] };
type KumeBolumu = { kume: string; konular: KonuSatiri[] };

export default async function TestlerSayfasi() {
  const [TESTLER, KONULAR] = await Promise.all([testler(), konuHaritasi()]);

  const kumeler = new Map<string, Map<string, KonuSatiri>>();
  for (const test of TESTLER) {
    const konu = test.konuSlug ? KONULAR.get(test.konuSlug) : undefined;
    const kume = konu?.kume ?? DIGER;
    if (!kumeler.has(kume)) kumeler.set(kume, new Map());
    const satirlar = kumeler.get(kume)!;
    const anahtar = konu?.slug ?? test.konu;
    if (!satirlar.has(anahtar)) {
      satirlar.set(anahtar, { konuSlug: konu?.slug, konuAd: konu?.ad ?? test.konu, testler: [] });
    }
    satirlar.get(anahtar)!.testler.push(test);
  }

  // Küme adına göre, "Diğer" her zaman sonda; konular küme içinde ada göre.
  const bolumler: KumeBolumu[] = [...kumeler.entries()]
    .map(([kume, satirlar]) => ({
      kume,
      konular: [...satirlar.values()]
        .map((satir) => ({
          ...satir,
          testler: [...satir.testler].sort(
            (a, b) => (SEVIYE_SIRASI[a.seviye] ?? 9) - (SEVIYE_SIRASI[b.seviye] ?? 9),
          ),
        }))
        .sort((a, b) => a.konuAd.localeCompare(b.konuAd, 'tr')),
    }))
    .sort((a, b) => {
      if (a.kume === DIGER) return 1;
      if (b.kume === DIGER) return -1;
      return a.kume.localeCompare(b.kume, 'tr');
    });

  const toplamSoru = TESTLER.reduce((t, x) => t + x.soruSayisi, 0);
  const konuSayisi = bolumler.reduce((t, b) => t + b.konular.length, 0);

  return (
    <>
      <ListeSemasi
        ad="Sinaptik testleri"
        ogeler={TESTLER.map((test) => ({ ad: test.ad, yol: `/testler/${test.slug}/` }))}
      />

      <SayfaBasligi
        kirintilar={[{ ad: 'Testler', yol: '/testler/' }]}
        etiket="LEARN"
        baslik="Testler"
        ozet="Testler bildiklerini değil nerede eksiğin olduğunu gösterir. Her soru bir beceri düğümüne bağlıdır; her test bir konu merkezine çıkar."
        olcumler={[
          { deger: `${TESTLER.length}`, etiket: 'Test' },
          { deger: `${toplamSoru}`, etiket: 'Soru' },
          { deger: `${konuSayisi}`, etiket: 'Konu' },
          { deger: `${bolumler.length}`, etiket: 'Küme' },
        ]}
        eylemler={
          <Dugme href="/seviye-testi/">
            <Hedef className="size-4" />
            Genel seviye testi
          </Dugme>
        }
      />

      {TESTLER.length === 0 ? (
        <Bolum>
          <BosDurum
            baslik="Konu testleri hazırlanıyor"
            metin="Yayına girmiş test bulunmuyor. Hazır olduklarında ölçülen beceriler ve örnek sorularla birlikte burada listelenecek."
            eylem={<Dugme href="/seviye-testi/">Genel seviye testi</Dugme>}
          />
        </Bolum>
      ) : (
        bolumler.map((bolum, sira) => (
          <Bolum key={bolum.kume} zemin={sira % 2 === 1 ? 'derin' : undefined}>
            <BolumBasligi
              numara={String(sira + 1).padStart(2, '0')}
              etiket="KÜME"
              baslik={bolum.kume}
              aciklama={`${bolum.konular.length} konu · ${bolum.konular.reduce((t, k) => t + k.testler.length, 0)} test`}
            />
            <ul className="mt-6 divide-y divide-kenar-soluk overflow-hidden rounded-2xl border border-kenar">
              {bolum.konular.map((satir) => (
                <KonuSatiriBas key={satir.konuAd} satir={satir} />
              ))}
            </ul>
          </Bolum>
        ))
      )}

      <Bolum zemin={bolumler.length % 2 === 1 ? 'derin' : undefined}>
        <BolumBasligi
          numara={String(bolumler.length + 1).padStart(2, '0')}
          etiket="SORU BANKASI"
          baslik="Her soru bir metadata kaydıdır"
        />
        <div className="olcu">
          <p className="font-serif text-[1.0625rem] leading-relaxed text-metin-ikincil">
            Bir soru yalnızca metin değildir. Her kayıt konu, alt konu, zorluk, ölçtüğü beceri,
            doğru cevap, açıklama ve ilgili Atlas girdisini taşır.
          </p>
          <p className="mt-5 font-serif text-[1.0625rem] leading-relaxed text-metin-ikincil">
            Bu yapı, soru bankasını semantik öğrenme grafiğine bağlar: yanlış cevaplanan soru, hangi
            beceri düğümünün eksik olduğunu söyler ve rotada o düğüm yeniden açılır.
          </p>
        </div>
        <div className="mt-7">
          <Dugme href="/ogren/beceri-grafigi/" gorunum="ikincil">
            Beceri grafiğini gör
            <Ok className="size-4" />
          </Dugme>
        </div>
      </Bolum>
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
        <p className="etiket-mono mt-1.5 text-metin-soluk">{satir.testler.length} test</p>
      </div>

      <ul className="flex min-w-0 flex-1 flex-col gap-2.5">
        {satir.testler.map((test) => (
          <li key={test.slug}>
            <Link
              href={`/testler/${test.slug}/`}
              className="group flex flex-wrap items-baseline gap-x-3 gap-y-1.5"
            >
              <span className="etiket-mono rounded-full border border-vurgu/30 bg-vurgu-zemin px-2.5 py-1 text-vurgu-parlak">
                {SEVIYE_ADI[test.seviye]}
              </span>
              <span className="min-w-0 flex-1 text-sm leading-relaxed text-metin-ikincil group-hover:text-metin">
                {test.ozet || test.ad}
              </span>
              <span className="inline-flex shrink-0 items-center gap-3 text-[0.6875rem] text-metin-soluk">
                <span>{test.soruSayisi} soru</span>
                <span className="inline-flex items-center gap-1">
                  <Saat className="size-3" />
                  {test.dakika} dk
                </span>
                <Ok className="size-3 transition-transform duration-200 ease-sinaptik group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
}
