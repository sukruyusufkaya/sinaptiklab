import type { Blok } from '@/lib/tipler';
import { SatirIci } from '@/components/icerik/SatirIci';

/**
 * Gövdenin basılış biçimi.
 *
 * `standart` — haber, analiz, rehber, Atlas: bilgi yoğun, sıkı tipografi.
 * `kose` — imzalı görüş yazısı: dergi tipografisi. Aynı bloklar, farklı ritim:
 *   açılış harfi, numaralı bölüm başlıkları, alıntı blokları, soru kartları,
 *   kavram çipleri ve dikey zaman çizelgesi. Yeni blok tipi YOKTUR; biçim
 *   bloğun kendi şeklinden okunur (bkz. `listeBicimi`). Böylece aynı içerik
 *   makine yüzeylerinde (RSS, şema, dışa aktarma) değişmeden kalır.
 */
export type GovdeGorunumu = 'standart' | 'kose';

/**
 * Yapılandırılmış blokları uzun metin tipografisiyle basar.
 * HTML string yerine blok listesi kullanılır; böylece aynı içerik
 * makine tarafından da (GEO, dışa aktarma) okunabilir kalır.
 */
export function MetinGovdesi({
  bloklar,
  gorunum = 'standart',
}: {
  bloklar: Blok[];
  gorunum?: GovdeGorunumu;
}) {
  if (gorunum === 'kose') return <KoseGovdesi bloklar={bloklar} />;

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
          <p className="font-serif text-[1.0625rem] leading-relaxed text-metin">
            <SatirIci metin={blok.metin} />
          </p>
        </div>
      );

    case 'altbaslik':
      return (
        <h2
          id={blok.kimlik}
          className="group scroll-mt-28 pt-4 text-[1.375rem] leading-snug font-semibold tracking-tight sm:text-2xl"
        >
          {blok.metin}
          <BaslikCapasi kimlik={blok.kimlik} metin={blok.metin} />
        </h2>
      );

    case 'paragraf':
      return (
        <p className="font-serif text-[1.0625rem] leading-[1.75] text-metin-ikincil">
          <SatirIci metin={blok.metin} />
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
                <SatirIci metin={oge} />
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
                <SatirIci metin={oge} />
              </span>
            </li>
          ))}
        </ul>
      );

    case 'alinti':
      return (
        <blockquote className="border-l-2 border-vurgu pl-5">
          <p className="font-serif text-lg leading-relaxed text-metin italic">
            <SatirIci metin={blok.metin} />
          </p>
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
      return <Tablo blok={blok} />;

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
          <p className="text-[0.9375rem] leading-relaxed text-metin-ikincil">
            <SatirIci metin={blok.metin} />
          </p>
        </aside>
      );
  }
}

function BaslikCapasi({ kimlik, metin }: { kimlik: string; metin: string }) {
  return (
    <a
      href={`#${kimlik}`}
      aria-label={`${metin} bölümüne bağlantı`}
      className="ml-2 align-middle text-base text-metin-soluk opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100"
    >
      #
    </a>
  );
}

function Tablo({ blok }: { blok: Extract<Blok, { tip: 'tablo' }> }) {
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
                    <SatirIci metin={hucre} />
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
}

/* --- KÖŞE GÖRÜNÜMÜ -------------------------------------------------------- */

/** Metnin tamamı tek bir vurgu ise (`**...**`) — yazarın altını çizdiği cümle. */
const TAM_VURGU = /^\*\*[^*]+\*\*$/;

/**
 * Listenin dergi sayfasındaki biçimi, öğelerin şeklinden okunur:
 *
 *  - `soru`: her öğe soru işaretiyle biter → numaralı soru kartları. Görüş
 *    yazısında soru listesi bir kontrol listesidir; okur kendi kurumuna sorar.
 *  - `cip`: beş ve daha fazla kısa öğe (≤ 42 karakter) → kavram çipleri.
 *    "Kimlik. Yetki. Retrieval…" gibi katman sayımları cümle değil envanterdir.
 *  - `cumle`: geri kalan her şey → ritimli cümle dizisi.
 */
function listeBicimi(ogeler: string[]): 'soru' | 'cip' | 'cumle' {
  if (ogeler.length >= 2 && ogeler.every((oge) => oge.trim().endsWith('?'))) return 'soru';
  if (ogeler.length >= 5 && ogeler.every((oge) => oge.length <= 42)) return 'cip';
  return 'cumle';
}

function KoseGovdesi({ bloklar }: { bloklar: Blok[] }) {
  const ilkParagraf = bloklar.findIndex((blok) => blok.tip === 'paragraf');
  // Bölüm numarası = bloğa kadar gelen alt başlık sayısı; render sırasında sayaç tutulmaz.
  const baslikSiralari = bloklar.flatMap((blok, sira) => (blok.tip === 'altbaslik' ? [sira] : []));

  return (
    <div className="space-y-7">
      {bloklar.map((blok, sira) => {
        if (blok.tip === 'altbaslik') {
          return <KoseBasligi key={sira} blok={blok} numara={baslikSiralari.indexOf(sira) + 1} />;
        }
        if (blok.tip === 'paragraf') {
          return <KoseParagrafi key={sira} metin={blok.metin} acilis={sira === ilkParagraf} />;
        }
        if (blok.tip === 'alinti' && !blok.kaynak)
          return <KoseAlintisi key={sira} metin={blok.metin} />;
        if (blok.tip === 'liste' && !blok.sirali)
          return <KoseListesi key={sira} ogeler={blok.ogeler} />;
        if (blok.tip === 'akis') return <KoseZamanCizelgesi key={sira} adimlar={blok.adimlar} />;
        return <BlokBas key={sira} blok={blok} />;
      })}
    </div>
  );
}

function KoseBasligi({
  blok,
  numara,
}: {
  blok: Extract<Blok, { tip: 'altbaslik' }>;
  numara: number;
}) {
  return (
    <div className="mt-16! border-t border-kenar pt-8 first:mt-0!">
      <p className="etiket-mono mb-3 flex items-center gap-3 text-vurgu-parlak" aria-hidden="true">
        {String(numara).padStart(2, '0')}
        <span className="h-px w-10 bg-vurgu/40" />
      </p>
      <h2
        id={blok.kimlik}
        className="group scroll-mt-28 font-serif text-[1.625rem] leading-[1.2] font-semibold tracking-[-0.015em] text-balance text-metin sm:text-[2rem]"
      >
        {blok.metin}
        <BaslikCapasi kimlik={blok.kimlik} metin={blok.metin} />
      </h2>
    </div>
  );
}

function KoseParagrafi({ metin, acilis }: { metin: string; acilis: boolean }) {
  if (TAM_VURGU.test(metin)) {
    return (
      <p className="border-l-2 border-vurgu py-1 pl-5 font-serif text-[1.3125rem] leading-[1.5] font-medium text-balance text-metin">
        {metin.slice(2, -2)}
      </p>
    );
  }
  return (
    <p
      className={`font-serif text-[1.125rem] leading-[1.8] text-metin-ikincil sm:text-[1.1875rem] ${acilis ? 'kose-ilk-harf' : ''}`}
    >
      <SatirIci metin={metin} />
    </p>
  );
}

function KoseAlintisi({ metin }: { metin: string }) {
  // Yazar alıntıyı kendi tırnağıyla yazmış olabilir; çift tırnak basılmaz.
  const temiz = metin.replace(/^[“"]|[”"]$/g, '');
  return (
    <figure className="relative my-12! border-y border-kenar py-9 sm:px-6">
      <span
        className="pointer-events-none absolute -top-5 left-0 bg-zemin pr-3 font-serif text-[4rem] leading-none text-vurgu-parlak sm:left-6"
        aria-hidden="true"
      >
        “
      </span>
      <blockquote>
        <p className="font-serif text-[1.5rem] leading-[1.35] font-medium tracking-[-0.01em] text-balance text-metin sm:text-[1.875rem]">
          <SatirIci metin={temiz} />
        </p>
      </blockquote>
    </figure>
  );
}

function KoseListesi({ ogeler }: { ogeler: string[] }) {
  const bicim = listeBicimi(ogeler);

  if (bicim === 'soru') {
    return (
      <ol className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar sm:grid-cols-2">
        {ogeler.map((oge, sira) => (
          <li
            key={sira}
            className="flex gap-3.5 bg-zemin p-4 transition-colors duration-200 hover:bg-yuzey/60 sm:p-5 sm:last:odd:col-span-2"
          >
            <span className="etiket-mono mt-1 shrink-0 text-vurgu-parlak">
              {String(sira + 1).padStart(2, '0')}
            </span>
            <span className="text-[0.9375rem] leading-relaxed text-metin">
              <SatirIci metin={oge} />
            </span>
          </li>
        ))}
      </ol>
    );
  }

  if (bicim === 'cip') {
    return (
      <ul className="flex flex-wrap gap-2">
        {ogeler.map((oge, sira) => (
          <li
            key={sira}
            className="rounded-full border border-kenar bg-yuzey/50 px-3.5 py-1.5 text-[0.875rem] text-metin-ikincil transition-colors duration-200 hover:border-vurgu/45 hover:text-metin"
          >
            <SatirIci metin={oge.replace(/[.,]$/, '')} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="space-y-3 border-l border-kenar pl-5">
      {ogeler.map((oge, sira) => (
        <li
          key={sira}
          className="relative font-serif text-[1.0625rem] leading-relaxed text-metin-ikincil sm:text-[1.125rem]"
        >
          <span
            className="absolute top-[0.7em] -left-[1.4rem] size-1.5 rounded-full bg-vurgu-sonuk"
            aria-hidden="true"
          />
          <SatirIci metin={oge} />
        </li>
      ))}
    </ul>
  );
}

function KoseZamanCizelgesi({ adimlar }: { adimlar: { ad: string; aciklama: string }[] }) {
  const son = adimlar.length - 1;
  return (
    <ol className="relative space-y-5 border-l border-kenar pl-7">
      {adimlar.map((adim, sira) => (
        <li key={`${adim.ad}-${sira}`} className="relative">
          <span
            className={`absolute top-1 -left-[2.0625rem] grid size-3 place-items-center rounded-full border ${
              sira === son
                ? 'border-vurgu bg-vurgu shadow-[0_0_0_4px_var(--vurgu-zemin)]'
                : 'border-kenar-guclu bg-zemin'
            }`}
            aria-hidden="true"
          />
          <p className={`etiket-mono ${sira === son ? 'text-vurgu-parlak' : 'text-metin-soluk'}`}>
            {adim.ad}
          </p>
          <p
            className={`mt-1.5 font-serif text-[1.0625rem] leading-relaxed ${
              sira === son ? 'font-medium text-metin' : 'text-metin-ikincil'
            }`}
          >
            <SatirIci metin={adim.aciklama} />
          </p>
        </li>
      ))}
    </ol>
  );
}

/** Gövdedeki alt başlıklardan içindekiler listesi çıkarır. */
export function altBasliklar(bloklar: Blok[] = []) {
  return bloklar
    .filter((blok): blok is Extract<Blok, { tip: 'altbaslik' }> => blok.tip === 'altbaslik')
    .map((blok) => ({ kimlik: blok.kimlik, metin: blok.metin }));
}
