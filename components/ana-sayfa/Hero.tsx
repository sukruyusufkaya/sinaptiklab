import Link from 'next/link';
import { Dugme } from '@/components/arayuz/Dugme';
import { Rozet } from '@/components/arayuz/Rozet';
import { Dusen, Nabiz, Ok, Yukselen } from '@/components/arayuz/Ikonlar';
import { radar } from '@/lib/icerik/gundem';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { yayindaSayisi } from '@/lib/mongo/sorgular/site';
import type { RadarKaydi } from '@/lib/tipler';

/**
 * Ana sayfa ölçümleri — SABİT DEĞİL, VERİTABANINDAN.
 *
 * Bu dört sayı koda gömülüydü ve üçü yanlıştı: "480+ Atlas kavramı" derken
 * yayında 35 kavram vardı, "7 öğrenme yolu" derken 20, "12 konu kümesi"
 * derken 10 küme. "480+" bir ÖLÇÜM değil bir HEDEFTİ; sayfada ölçüm gibi
 * duruyordu. Değişmez kural 5 tam bunu yasaklıyor ve ihlal en görünür yerde,
 * ana sayfanın ilk ekranındaydı.
 *
 * Sayılar artık her derlemede sayılıyor. Gömülü sayı bir daha bayatlayamaz:
 * içerik eklendiğinde ölçüm kendiliğinden doğru kalır, silindiğinde de.
 *
 * "Brief yayını" için sıklık İDDİA EDİLMEZ. Eskiden "Günlük" yazıyordu;
 * yayında tek brief var, yani sıklık ölçülmüş bir şey değil. Yerine yayındaki
 * brief sayısı basılıyor — sayılabilen tek doğru büyüklük bu.
 */
async function olcumleriOku() {
  const [atlas, rota, konu, brief] = await Promise.all([
    yayindaSayisi(KOLEKSIYONLAR.atlas),
    yayindaSayisi(KOLEKSIYONLAR.ogrenmeYollari),
    yayindaSayisi(KOLEKSIYONLAR.konular),
    yayindaSayisi(KOLEKSIYONLAR.briefler),
  ]);

  return [
    { deger: `${atlas}`, etiket: 'Atlas kavramı' },
    { deger: `${rota}`, etiket: 'Öğrenme yolu' },
    { deger: `${konu}`, etiket: 'Konu' },
    { deger: `${brief}`, etiket: 'Brief' },
  ];
}

function YonIkonu({ yon }: { yon: RadarKaydi['yon'] }) {
  if (yon === 'yukselen') return <Yukselen className="size-3.5 text-sinyal" />;
  if (yon === 'dusen') return <Dusen className="size-3.5 text-metin-soluk" />;
  return <span className="block h-px w-3.5 bg-metin-soluk" aria-hidden="true" />;
}

function RadarSatiri({ kayit, sira }: { kayit: RadarKaydi; sira: number }) {
  return (
    <Link
      href={`/radar/${kayit.slug}/`}
      className="group flex items-center gap-3 rounded-lg px-2 py-2 -mx-2 transition-colors duration-150 hover:bg-yuzey-2"
    >
      <span className="etiket-mono w-5 shrink-0 text-metin-soluk">
        {String(sira + 1).padStart(2, '0')}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-[0.8125rem] font-medium text-metin group-hover:text-vurgu-parlak">
            {kayit.ad}
          </span>
          <span className="flex shrink-0 items-center gap-1.5">
            <YonIkonu yon={kayit.yon} />
            <span
              className={`etiket-mono tabular-nums ${
                kayit.degisim > 0
                  ? 'text-sinyal'
                  : kayit.degisim < 0
                    ? 'text-metin-soluk'
                    : 'text-metin-soluk'
              }`}
            >
              {kayit.degisim > 0 ? '+' : ''}
              {kayit.degisim}
            </span>
          </span>
        </span>

        <span className="mt-1.5 block h-1 w-full overflow-hidden rounded-full bg-yuzey-3">
          <span
            className="block h-full rounded-full bg-gradient-to-r from-vurgu to-ikincil transition-[width] duration-700 ease-sinaptik"
            style={{ width: `${kayit.momentum}%` }}
          />
        </span>
      </span>
    </Link>
  );
}

export async function Hero() {
  const [RADAR, OLCUMLER] = await Promise.all([radar(), olcumleriOku()]);

  return (
    <section className="relative overflow-hidden border-b border-kenar">
      {/* Zemin dokusu */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="izgara-zemin absolute inset-0 opacity-[0.55] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,black,transparent)]" />
        <div className="absolute -top-40 left-1/2 h-[32rem] w-[52rem] -translate-x-1/2 rounded-full bg-vurgu/18 blur-[120px]" />
        <div className="absolute top-24 right-[8%] h-72 w-72 rounded-full bg-ikincil/12 blur-[100px]" />
      </div>

      <div className="kap relative grid gap-12 py-16 md:py-24 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-16">
        {/* --- Sol: konumlandırma --- */}
        <div className="flex flex-col justify-center">
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <Rozet ton="canli">Canlı gündem</Rozet>
            <span className="etiket-mono text-metin-soluk">
              DISCOVER · UNDERSTAND · LEARN · BUILD
            </span>
          </div>

          <h1 className="text-[2.5rem] leading-[1.04] font-semibold tracking-[-0.03em] text-balance sm:text-[3.25rem] lg:text-[3.75rem]">
            Yapay Zekânın <span className="gradyan-metin">Nabzını Tut.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-metin-ikincil sm:text-lg">
            Haberlerden araştırmalara, öğrenme yollarından gerçek yapay zekâ projelerine kadar tüm
            ekosistemi tek platformda keşfet.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Dugme href="/gundem/" boyut="lg">
              Bugünün AI Gündemi
              <Ok className="size-4" />
            </Dugme>
            <Dugme href="/ogren/" gorunum="ikincil" boyut="lg">
              Öğrenmeye Başla
            </Dugme>
          </div>

          <dl className="mt-12 grid max-w-xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-kenar bg-kenar sm:grid-cols-4">
            {OLCUMLER.map((olcum) => (
              <div key={olcum.etiket} className="bg-zemin px-4 py-4">
                <dt className="etiket-mono text-metin-soluk">{olcum.etiket}</dt>
                <dd className="mt-1.5 font-mono text-xl font-medium tracking-tight text-metin tabular-nums">
                  {olcum.deger}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* --- Sağ: AI Radar --- */}
        <aside
          aria-labelledby="radar-basligi"
          className="relative rounded-2xl border border-kenar bg-yuzey/70 p-5 shadow-kart backdrop-blur-sm"
        >
          <div className="flex items-start justify-between gap-3 border-b border-kenar-soluk pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Nabiz className="size-4 text-sinyal" />
                <h2 id="radar-basligi" className="text-sm font-semibold tracking-tight">
                  Sinaptik AI Radar
                </h2>
              </div>
              <p className="mt-1.5 text-xs text-metin-soluk">
                Yayın, depo, model ve arama sinyallerinden türetilen momentum
              </p>
            </div>
            <span className="etiket-mono shrink-0 rounded-full border border-kenar px-2 py-1 text-metin-soluk">
              7g
            </span>
          </div>

          <div className="mt-3 space-y-0.5">
            {RADAR.map((kayit, sira) => (
              <RadarSatiri key={kayit.slug} kayit={kayit} sira={sira} />
            ))}
          </div>

          {/*
            YER TUTUCU UYARISI ANA SAYFADA DA DURUR.
            `/radar/` sayfası bu uyarıyı taşıyordu, ana sayfa taşımıyordu —
            oysa momentum çubuklarını ve `+12` gibi değişim rakamlarını ilk
            gören yer burası. Uyarının yalnızca derinlikteki sayfada durması,
            ziyaretçilerin çoğunun onu hiç görmemesi demekti (değişmez kural 5).
          */}
          <p className="mt-3 border-t border-kenar-soluk pt-3 text-[0.6875rem] leading-relaxed text-uyari">
            Yer tutucu skorlar. Gerçek endeks yayımlanana kadar bu değerler kaynak gösterilemez.
          </p>

          <Link
            href="/radar/"
            className="group mt-4 flex items-center justify-between rounded-lg border border-kenar px-3 py-2.5 text-[0.8125rem] text-metin-ikincil transition-colors hover:border-vurgu hover:text-metin"
          >
            Radar metodolojisi ve tam liste
            <Ok className="size-4 transition-transform duration-200 ease-sinaptik group-hover:translate-x-0.5" />
          </Link>
        </aside>
      </div>
    </section>
  );
}
