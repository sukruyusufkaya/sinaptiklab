import Link from 'next/link';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Rozet } from '@/components/arayuz/Rozet';
import { Ok, Saat } from '@/components/arayuz/Ikonlar';
import { gundem, manset } from '@/lib/icerik/gundem';
import { TUR_ADI } from '@/lib/taksonomi';
import { SinyalAgi } from '@/components/gorsel/SinyalAgi';
import type { Icerik } from '@/lib/tipler';

const FILTRELER = [
  { ad: 'Tümü', yol: '/gundem/' },
  { ad: 'Modeller', yol: '/gundem/llm/' },
  { ad: 'Araştırma', yol: '/gundem/arastirma/' },
  { ad: 'Business', yol: '/gundem/is-dunyasi/' },
  { ad: 'Robotik', yol: '/gundem/robotik/' },
  { ad: 'Türkiye', yol: '/gundem/turkiye/' },
];

export function tarihBicimle(tarih: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(tarih));
}

export function UstVeri({ icerik }: { icerik: Icerik }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-metin-soluk">
      <span className="etiket-mono text-vurgu-parlak">{TUR_ADI[icerik.tur] ?? icerik.tur}</span>
      <span className="size-1 rounded-full bg-kenar-guclu" aria-hidden="true" />
      <time dateTime={icerik.yayinTarihi}>{tarihBicimle(icerik.yayinTarihi)}</time>
      <span className="size-1 rounded-full bg-kenar-guclu" aria-hidden="true" />
      <span className="inline-flex items-center gap-1">
        <Saat className="size-3.5" />
        {icerik.okumaDakika} dk
      </span>
    </div>
  );
}

function MansetKarti({ icerik }: { icerik: Icerik }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-kenar bg-yuzey/50 transition-colors duration-300 hover:border-vurgu/45">
      {/* Görsel yerine tipografik kapak */}
      <div className="relative aspect-[16/6] overflow-hidden border-b border-kenar bg-zemin-derin">
        <div className="izgara-zemin absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="absolute -right-16 -bottom-24 h-64 w-64 rounded-full bg-vurgu/22 blur-[80px]" />
        <SinyalAgi className="absolute inset-0 size-full opacity-80" />
        <div className="relative flex h-full items-end p-6">
          <span className="etiket-mono rounded-full border border-kenar bg-zemin/80 px-3 py-1.5 text-metin-ikincil backdrop-blur">
            {icerik.konu.ad}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <UstVeri icerik={icerik} />

        <h3 className="mt-3 text-xl leading-[1.16] font-semibold tracking-tight text-balance sm:text-2xl">
          <Link href={icerik.yol} className="before:absolute before:inset-0">
            {icerik.baslik}
          </Link>
        </h3>

        {/* Answer-first blok (MASTER-PLAN §56) */}
        <p className="mt-4 border-l-2 border-vurgu/50 pl-4 text-[0.9375rem] leading-relaxed text-metin-ikincil">
          {icerik.kisaCevap}
        </p>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-kenar-soluk pt-4">
          <span className="flex items-center gap-2.5">
            <span className="etiket-mono grid size-8 place-items-center rounded-full border border-kenar bg-yuzey-2 text-metin-ikincil">
              {icerik.yazar.basHarfler}
            </span>
            <span className="text-xs">
              <span className="block font-medium text-metin">{icerik.yazar.ad}</span>
              <span className="block text-metin-soluk">{icerik.yazar.unvan}</span>
            </span>
          </span>
          <Ok className="size-5 shrink-0 text-metin-soluk transition-transform duration-200 ease-sinaptik group-hover:translate-x-1 group-hover:text-vurgu-parlak" />
        </div>
      </div>
    </article>
  );
}

function AkisSatiri({ icerik }: { icerik: Icerik }) {
  return (
    <article className="group relative border-b border-kenar-soluk py-4 first:pt-0 last:border-b-0 last:pb-0">
      <div className="flex items-start gap-4">
        <span className="etiket-mono mt-1 w-14 shrink-0 text-metin-soluk">
          {new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short' }).format(
            new Date(icerik.yayinTarihi),
          )}
        </span>
        <div className="min-w-0">
          <h3 className="text-[0.9375rem] leading-snug font-medium tracking-tight text-metin transition-colors group-hover:text-vurgu-parlak">
            <Link href={icerik.yol} className="before:absolute before:inset-0">
              {icerik.baslik}
            </Link>
          </h3>
          <p className="mt-1.5 line-clamp-2 text-[0.8125rem] leading-relaxed text-metin-soluk">
            {icerik.kisaCevap}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="etiket-mono text-metin-soluk">{icerik.konu.ad}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export async function Gundem() {
  const [MANSET, GUNDEM] = await Promise.all([manset(), gundem()]);

  return (
    <Bolum kimlik="gundem" etiketlendiren="gundem-basligi">
      <BolumBasligi
        numara="01"
        etiket="DISCOVER"
        baslik={<span id="gundem-basligi">Bugünün AI Gündemi</span>}
        aciklama="Her haber tek soruyla kapanır: peki bunun anlamı ne? Çeviri değil, bağlam."
        baglantiYolu="/gundem/"
        baglantiMetni="Tüm gündem"
      />

      <nav aria-label="Gündem filtreleri" className="mb-8 flex flex-wrap gap-2">
        {FILTRELER.map((filtre, sira) => (
          <Link
            key={filtre.yol}
            href={filtre.yol}
            className={`rounded-full border px-3.5 py-1.5 text-[0.8125rem] font-medium transition-colors duration-150 ${
              sira === 0
                ? 'border-vurgu/40 bg-vurgu-zemin text-vurgu-parlak'
                : 'border-kenar text-metin-ikincil hover:border-kenar-guclu hover:text-metin'
            }`}
          >
            {filtre.ad}
          </Link>
        ))}
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-10">
        {MANSET && <MansetKarti icerik={MANSET} />}

        <div className="flex flex-col">
          <div className="mb-4 flex items-center justify-between border-b border-kenar pb-3">
            <span className="etiket-mono text-metin">SON GELİŞMELER</span>
            <Rozet ton="canli">Canlı</Rozet>
          </div>
          <div className="flex-1">
            {GUNDEM.map((icerik) => (
              <AkisSatiri key={icerik.slug} icerik={icerik} />
            ))}
          </div>
        </div>
      </div>
    </Bolum>
  );
}
