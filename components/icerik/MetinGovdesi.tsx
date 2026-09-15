import type { Blok } from '@/lib/tipler';

/**
 * Yapılandırılmış blokları uzun metin tipografisiyle basar.
 * HTML string yerine blok listesi kullanılır; böylece aynı içerik
 * makine tarafından da (GEO, dışa aktarma) okunabilir kalır.
 */
export function MetinGovdesi({ bloklar }: { bloklar: Blok[] }) {
  return (
    <div className="space-y-6">
      {bloklar.map((blok, sira) => (
        <BlokBas key={sira} blok={blok} />
      ))}
    </div>
  );
}

function BlokBas({ blok }: { blok: Blok }) {
  switch (blok.tip) {
    case 'kisa-cevap':
      return (
        <div className="rounded-xl border border-vurgu/30 bg-vurgu-zemin/45 p-5">
          <p className="etiket-mono mb-2.5 text-vurgu-parlak">Kısa cevap</p>
          <p className="font-serif text-[1.0625rem] leading-relaxed text-metin">{blok.metin}</p>
        </div>
      );

    case 'altbaslik':
      return (
        <h2
          id={blok.kimlik}
          className="group scroll-mt-28 pt-4 text-[1.375rem] leading-snug font-semibold tracking-tight sm:text-2xl"
        >
          {blok.metin}
          <a
            href={`#${blok.kimlik}`}
            aria-label={`${blok.metin} bölümüne bağlantı`}
            className="ml-2 align-middle text-base text-metin-soluk opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100"
          >
            #
          </a>
        </h2>
      );

    case 'paragraf':
      return (
        <p className="font-serif text-[1.0625rem] leading-[1.75] text-metin-ikincil">
          {blok.metin}
        </p>
      );

    case 'liste':
      return blok.sirali ? (
        <ol className="space-y-2.5">
          {blok.ogeler.map((oge, sira) => (
            <li key={sira} className="flex gap-3.5">
              <span className="etiket-mono mt-1 shrink-0 text-vurgu-parlak">
                {String(sira + 1).padStart(2, '0')}
              </span>
              <span className="font-serif text-[1.0625rem] leading-relaxed text-metin-ikincil">
                {oge}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <ul className="space-y-2.5">
          {blok.ogeler.map((oge, sira) => (
            <li key={sira} className="flex gap-3.5">
              <span
                className="mt-2.5 size-1.5 shrink-0 rounded-full bg-vurgu-sonuk"
                aria-hidden="true"
              />
              <span className="font-serif text-[1.0625rem] leading-relaxed text-metin-ikincil">
                {oge}
              </span>
            </li>
          ))}
        </ul>
      );

    case 'alinti':
      return (
        <blockquote className="border-l-2 border-vurgu pl-5">
          <p className="font-serif text-lg leading-relaxed text-metin italic">{blok.metin}</p>
          {blok.kaynak && (
            <footer className="etiket-mono mt-2.5 text-metin-soluk">— {blok.kaynak}</footer>
          )}
        </blockquote>
      );

    case 'kod':
      return (
        <figure className="overflow-hidden rounded-xl border border-kenar bg-zemin-derin">
          <figcaption className="etiket-mono flex items-center justify-between border-b border-kenar px-4 py-2.5 text-metin-soluk">
            {blok.dil}
          </figcaption>
          <pre className="overflow-x-auto p-4 text-[0.8125rem] leading-relaxed">
            <code className="font-mono text-metin-ikincil">{blok.metin}</code>
          </pre>
        </figure>
      );

    case 'tablo':
      return (
        <figure>
          <div className="overflow-x-auto rounded-xl border border-kenar">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-kenar bg-yuzey/50">
                  {blok.basliklar.map((baslik) => (
                    <th
                      key={baslik}
                      scope="col"
                      className="etiket-mono px-4 py-3 text-left text-metin-soluk"
                    >
                      {baslik}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {blok.satirlar.map((satir, sira) => (
                  <tr key={sira} className="border-b border-kenar-soluk last:border-b-0">
                    {satir.map((hucre, hucreSira) => (
                      <td
                        key={hucreSira}
                        className={`px-4 py-3 ${hucreSira === 0 ? 'font-medium text-metin' : 'text-metin-ikincil'}`}
                      >
                        {hucre}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {blok.aciklama && (
            <figcaption className="mt-2.5 text-xs text-metin-soluk">{blok.aciklama}</figcaption>
          )}
        </figure>
      );

    case 'akis':
      return (
        <ol className="grid gap-px overflow-hidden rounded-xl border border-kenar bg-kenar sm:grid-cols-2 lg:grid-cols-3">
          {blok.adimlar.map((adim, sira) => (
            <li key={adim.ad} className="bg-zemin p-4">
              <div className="flex items-center gap-2.5">
                <span className="etiket-mono grid size-6 place-items-center rounded-full border border-vurgu/35 bg-vurgu-zemin text-vurgu-parlak">
                  {sira + 1}
                </span>
                <span className="text-sm font-medium text-metin">{adim.ad}</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-metin-soluk">{adim.aciklama}</p>
            </li>
          ))}
        </ol>
      );

    case 'uyari':
      return (
        <aside
          className={`rounded-xl border p-5 ${
            blok.ton === 'dikkat'
              ? 'border-uyari/30 bg-uyari/8'
              : 'border-ikincil/30 bg-ikincil-zemin/50'
          }`}
        >
          <p
            className={`etiket-mono mb-2 ${blok.ton === 'dikkat' ? 'text-uyari' : 'text-ikincil'}`}
          >
            {blok.ton === 'dikkat' ? 'Dikkat' : 'Not'}
          </p>
          <p className="text-[0.9375rem] leading-relaxed text-metin-ikincil">{blok.metin}</p>
        </aside>
      );
  }
}

/** Gövdedeki alt başlıklardan içindekiler listesi çıkarır. */
export function altBasliklar(bloklar: Blok[] = []) {
  return bloklar
    .filter((blok): blok is Extract<Blok, { tip: 'altbaslik' }> => blok.tip === 'altbaslik')
    .map((blok) => ({ kimlik: blok.kimlik, metin: blok.metin }));
}
