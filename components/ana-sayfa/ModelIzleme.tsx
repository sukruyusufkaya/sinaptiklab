import Link from 'next/link';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Rozet } from '@/components/arayuz/Rozet';
import { Kilit, Ok, Terazi } from '@/components/arayuz/Ikonlar';
import { BENCHMARK_ORNEGI, modelListesi } from '@/lib/icerik/varliklar';

export async function ModelIzleme() {
  const MODELLER = await modelListesi();
  if (MODELLER.length === 0) return null;

  return (
    <Bolum kimlik="modeller" zemin="derin" etiketlendiren="model-basligi">
      <BolumBasligi
        numara="05"
        etiket="UNDERSTAND"
        baslik={<span id="model-basligi">AI Model Watch</span>}
        aciklama="Her model bir varlık sayfası: yetenekler, bağlam, lisans, fiyat ve sürüm geçmişi tek yerde."
        baglantiYolu="/modeller/"
        baglantiMetni="Model veritabanı"
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
        {/* --- Model ızgarası --- */}
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2 xl:grid-cols-3">
          {MODELLER.map((model) => (
            <li
              key={model.slug}
              className="group relative bg-zemin p-5 transition-colors hover:bg-yuzey/60"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-[0.9375rem] font-semibold tracking-tight text-metin group-hover:text-vurgu-parlak">
                    <Link
                      href={`/modeller/${model.slug}/`}
                      className="before:absolute before:inset-0"
                    >
                      {model.ad}
                    </Link>
                  </h3>
                  <p className="etiket-mono mt-1 text-metin-soluk">{model.saglayici}</p>
                </div>
                {model.acikKaynak ? (
                  <Rozet ton="basari">Açık</Rozet>
                ) : (
                  <span
                    className="grid size-6 shrink-0 place-items-center rounded-full border border-kenar text-metin-soluk"
                    title="Kapalı ağırlık"
                  >
                    <Kilit className="size-3" />
                  </span>
                )}
              </div>

              <dl className="mt-4 space-y-1.5 text-xs">
                <div className="flex justify-between gap-3">
                  <dt className="text-metin-soluk">Tip</dt>
                  <dd className="truncate text-right text-metin-ikincil">{model.tip}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-metin-soluk">Bağlam</dt>
                  <dd className="truncate text-right text-metin-ikincil">
                    {model.baglamPenceresi}
                  </dd>
                </div>
              </dl>

              <p className="mt-4 border-t border-kenar-soluk pt-3 text-xs leading-relaxed text-metin-soluk">
                {model.vurgu}
              </p>
            </li>
          ))}
        </ul>

        {/* --- Karşılaştırma vitrini --- */}
        <div className="flex flex-col rounded-2xl border border-kenar bg-yuzey/50 p-5">
          <div className="flex items-center gap-2">
            <Terazi className="size-4 text-ikincil" />
            <span className="etiket-mono text-metin">Sinaptik Benchmark</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-metin-soluk">
            Metodoloji, test verisi, model sürümü ve örneklem sayısı her zaman açık yayımlanır.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <caption className="sr-only">Örnek benchmark tablosu — yer tutucu değerler</caption>
              <thead>
                <tr className="border-b border-kenar">
                  <th scope="col" className="etiket-mono py-2 pr-2 text-left text-metin-soluk">
                    Model
                  </th>
                  {BENCHMARK_ORNEGI.boyutlar.slice(0, 3).map((boyut) => (
                    <th
                      key={boyut}
                      scope="col"
                      className="etiket-mono py-2 px-1 text-right text-metin-soluk"
                    >
                      {boyut.slice(0, 3)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BENCHMARK_ORNEGI.satirlar.map((satir) => (
                  <tr key={satir.ad} className="border-b border-kenar-soluk last:border-b-0">
                    <th
                      scope="row"
                      className="py-2.5 pr-2 text-left font-medium text-metin-ikincil"
                    >
                      {satir.ad}
                    </th>
                    {satir.skorlar.slice(0, 3).map((skor, sira) => (
                      <td
                        key={sira}
                        className="py-2.5 px-1 text-right font-mono text-metin tabular-nums"
                      >
                        {skor}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-3 rounded-lg border border-uyari/25 bg-uyari/8 px-3 py-2 text-[0.6875rem] leading-relaxed text-uyari">
            Yer tutucu değerler. Gerçek ölçümler yayımlanana kadar bu tablo kaynak gösterilemez.
          </p>

          <Link
            href="/karsilastir/"
            className="group mt-auto flex items-center justify-between rounded-lg border border-kenar px-3 py-2.5 pt-2.5 text-[0.8125rem] text-metin-ikincil transition-colors hover:border-vurgu hover:text-metin"
          >
            Model karşılaştırma aracı
            <Ok className="size-4 transition-transform duration-200 ease-sinaptik group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </Bolum>
  );
}
