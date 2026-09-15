import Link from 'next/link';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Dugme } from '@/components/arayuz/Dugme';
import { Bina, Hedef, Ok } from '@/components/arayuz/Ikonlar';
import { sektorler } from '@/lib/icerik/kurumsal';

const HIZMETLER = [
  { ad: 'AI Stratejisi & Dönüşüm', yol: '/kurumsal/yapay-zeka-stratejisi/' },
  { ad: 'Kurumsal RAG Sistemleri', yol: '/kurumsal/rag/' },
  { ad: 'AI Agent & Otomasyon', yol: '/kurumsal/ai-agent/' },
  { ad: 'Computer Vision', yol: '/kurumsal/computer-vision/' },
  { ad: 'Predictive AI', yol: '/kurumsal/machine-learning/' },
  { ad: 'AI Governance', yol: '/kurumsal/ai-governance/' },
  { ad: 'MLOps / LLMOps', yol: '/kurumsal/mlops/' },
  { ad: 'Kurumsal Eğitim', yol: '/kurumsal/egitim/' },
];

const SURECLER = ['Discovery', 'Assessment', 'Prototype', 'PoC', 'Production', 'Monitoring'];

export async function Kurumsal() {
  const SEKTORLER = await sektorler();

  return (
    <Bolum kimlik="kurumsal" zemin="derin" etiketlendiren="kurumsal-basligi">
      <BolumBasligi
        numara="11"
        etiket="BUILD"
        baslik={<span id="kurumsal-basligi">Yapay zekâyı gerçek iş sonuçlarına dönüştürün</span>}
        aciklama="Stratejiden PoC'ye, kurumsal eğitimden üretim sistemlerine kadar uçtan uca dönüşüm."
        baglantiYolu="/kurumsal/"
        baglantiMetni="Kurumsal hizmetler"
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {/* --- Hizmetler + süreç --- */}
        <div className="rounded-2xl border border-kenar bg-yuzey/40 p-6 sm:p-7">
          <div className="flex items-center gap-2">
            <Bina className="size-4 text-vurgu-parlak" />
            <span className="etiket-mono text-metin">Hizmet hatları</span>
          </div>

          <ul className="mt-5 grid gap-px overflow-hidden rounded-xl border border-kenar bg-kenar sm:grid-cols-2">
            {HIZMETLER.map((hizmet) => (
              <li key={hizmet.yol}>
                <Link
                  href={hizmet.yol}
                  className="group flex items-center justify-between gap-3 bg-zemin px-4 py-3.5 transition-colors hover:bg-yuzey-2"
                >
                  <span className="text-[0.8125rem] text-metin-ikincil group-hover:text-metin">
                    {hizmet.ad}
                  </span>
                  <Ok className="size-3.5 shrink-0 text-metin-soluk opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-7">
            <p className="etiket-mono mb-4 text-metin-soluk">Yaklaşımımız</p>
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-3">
              {SURECLER.map((adim, sira) => (
                <li key={adim} className="flex items-center gap-2">
                  <span className="rounded-full border border-kenar bg-zemin px-3 py-1.5 text-xs text-metin-ikincil">
                    {adim}
                  </span>
                  {sira < SURECLER.length - 1 && (
                    <span className="text-metin-soluk" aria-hidden="true">
                      →
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>

          {SEKTORLER.length > 0 && (
            <div className="mt-7 border-t border-kenar-soluk pt-5">
              <p className="etiket-mono mb-3 text-metin-soluk">Sektörler</p>
              <ul className="flex flex-wrap gap-2">
                {SEKTORLER.map((sektor) => (
                  <li key={sektor.slug}>
                    <Link
                      href={`/sektor/${sektor.slug}/`}
                      className="group flex items-center gap-2 rounded-full border border-kenar px-3 py-1.5 transition-colors hover:border-vurgu/45"
                    >
                      <span className="text-xs text-metin-ikincil group-hover:text-metin">
                        {sektor.ad}
                      </span>
                      <span className="etiket-mono text-metin-soluk tabular-nums">
                        {sektor.kullanimSayisi}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* --- AI Readiness --- */}
        <div className="relative flex flex-col overflow-hidden rounded-2xl border border-vurgu/30 bg-gradient-to-b from-vurgu-zemin/50 to-zemin-derin p-6 sm:p-7">
          <div
            className="nokta-zemin pointer-events-none absolute inset-0 opacity-40"
            aria-hidden="true"
          />

          <div className="relative">
            <div className="flex items-center gap-2">
              <Hedef className="size-4 text-vurgu-parlak" />
              <span className="etiket-mono text-vurgu-parlak">Ücretsiz değerlendirme</span>
            </div>

            <h3 className="mt-4 text-xl leading-snug font-semibold tracking-tight sm:text-2xl">
              AI Readiness Assessment
            </h3>
            <p className="mt-3 text-[0.8125rem] leading-relaxed text-metin-ikincil">
              Strateji, veri, altyapı, yetenek, yönetişim, kullanım senaryoları ve güvenlik
              boyutlarında kurumunuzun olgunluk skoru.
            </p>

            <div className="mt-6 rounded-xl border border-kenar bg-zemin/70 p-5">
              <p className="etiket-mono text-metin-soluk">Örnek çıktı</p>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="font-mono text-4xl font-medium tracking-tighter tabular-nums">
                  62
                </span>
                <span className="font-mono text-base text-metin-soluk">/100</span>
              </div>
              <p className="mt-1 text-sm font-medium text-uyari">Experimenting</p>

              <div className="mt-4 space-y-2">
                {[
                  ['Strateji', 74],
                  ['Veri', 58],
                  ['Altyapı', 66],
                  ['Yetenek', 49],
                  ['Yönetişim', 41],
                ].map(([ad, deger]) => (
                  <div key={ad as string} className="flex items-center gap-3">
                    <span className="w-20 shrink-0 text-[0.6875rem] text-metin-soluk">{ad}</span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-yuzey-3">
                      <span
                        className="block h-full rounded-full bg-vurgu"
                        style={{ width: `${deger as number}%` }}
                      />
                    </span>
                    <span className="etiket-mono w-6 text-right text-metin-soluk tabular-nums">
                      {deger}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Dugme href="/kurumsal/ai-readiness/" className="relative mt-6 w-full">
            Değerlendirmeyi başlat
            <Ok className="size-4" />
          </Dugme>
        </div>
      </div>
    </Bolum>
  );
}
