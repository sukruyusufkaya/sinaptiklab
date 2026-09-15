import { Bolum } from '@/components/arayuz/Bolum';
import { Dugme } from '@/components/arayuz/Dugme';
import { Hedef, Ok, Onay } from '@/components/arayuz/Ikonlar';

const SEVIYELER = [
  { ad: 'AI Curious', aralik: '0–35', renk: 'bg-metin-soluk' },
  { ad: 'AI Explorer', aralik: '36–60', renk: 'bg-ikincil' },
  { ad: 'AI Practitioner', aralik: '61–80', renk: 'bg-vurgu' },
  { ad: 'AI Builder', aralik: '81–100', renk: 'bg-sinyal' },
];

const OLCULEN = [
  'Temel kavramlar ve model türleri',
  'Üretken yapay zekâ ve LLM çalışma mantığı',
  'RAG, ajanlar ve araç kullanımı',
  'Değerlendirme, güvenlik ve sorumlu kullanım',
];

export function SeviyeOlcumu() {
  return (
    <Bolum kimlik="seviye" etiketlendiren="seviye-basligi">
      <div className="relative overflow-hidden rounded-3xl border border-kenar bg-zemin-derin">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="izgara-zemin absolute inset-0 opacity-40" />
          <div className="absolute -bottom-32 left-1/4 h-80 w-[36rem] rounded-full bg-vurgu/14 blur-[110px]" />
        </div>

        <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-14">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="etiket-mono text-metin-soluk">07</span>
              <span className="h-px w-6 bg-kenar-guclu" aria-hidden="true" />
              <span className="etiket-mono text-vurgu-parlak">ÖLÇÜM</span>
            </div>

            <h2
              id="seviye-basligi"
              className="text-2xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-3xl md:text-[2.25rem]"
            >
              Yapay zekâ seviyen kaç?
            </h2>
            <p className="mt-4 max-w-lg text-[0.9375rem] leading-relaxed text-metin-ikincil">
              15 soruluk Sinaptik AI Knowledge Test, bildiklerini değil{' '}
              <span className="text-metin">nerede eksiğin olduğunu</span> gösterir. Sonuç, doğrudan
              bir öğrenme yoluna bağlanır.
            </p>

            <ul className="mt-7 grid gap-2.5 sm:grid-cols-2">
              {OLCULEN.map((madde) => (
                <li
                  key={madde}
                  className="flex items-start gap-2.5 text-[0.8125rem] text-metin-ikincil"
                >
                  <Onay className="mt-0.5 size-4 shrink-0 text-basari" />
                  {madde}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Dugme href="/seviye-testi/" boyut="lg">
                Teste başla
                <Ok className="size-4" />
              </Dugme>
              <Dugme href="/testler/" gorunum="ikincil" boyut="lg">
                Konu testleri
              </Dugme>
            </div>

            <p className="mt-4 text-xs text-metin-soluk">
              Sorular sayfada görünür ve taranabilir; test JavaScript arkasına gizlenmez.
            </p>
          </div>

          {/* --- Sonuç önizlemesi --- */}
          <div className="rounded-2xl border border-kenar bg-yuzey/60 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Hedef className="size-4 text-vurgu-parlak" />
              <span className="etiket-mono text-metin">Örnek sonuç</span>
            </div>

            <div className="mt-5 flex items-baseline gap-2">
              <span className="font-mono text-5xl font-medium tracking-tighter text-metin tabular-nums">
                58
              </span>
              <span className="font-mono text-lg text-metin-soluk">/100</span>
            </div>
            <p className="mt-1 text-sm font-medium text-ikincil">AI Explorer</p>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-yuzey-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-ikincil to-vurgu"
                style={{ width: '58%' }}
              />
            </div>

            <ul className="mt-5 space-y-2">
              {SEVIYELER.map((seviye) => (
                <li key={seviye.ad} className="flex items-center justify-between gap-3 text-xs">
                  <span className="flex items-center gap-2">
                    <span className={`size-2 rounded-full ${seviye.renk}`} aria-hidden="true" />
                    <span className="text-metin-ikincil">{seviye.ad}</span>
                  </span>
                  <span className="etiket-mono text-metin-soluk tabular-nums">{seviye.aralik}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-xl border border-vurgu/30 bg-vurgu-zemin/60 p-4">
              <p className="etiket-mono mb-1.5 text-vurgu-parlak">Önerilen rota</p>
              <p className="text-sm font-medium text-metin">Generative AI Fundamentals</p>
              <p className="mt-1 text-xs text-metin-ikincil">
                Eksik önkoşul: Embeddings · Vector Search
              </p>
            </div>
          </div>
        </div>
      </div>
    </Bolum>
  );
}
