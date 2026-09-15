import Link from 'next/link';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Grafik, Ok } from '@/components/arayuz/Ikonlar';
import { arastirmaListesi } from '@/lib/icerik/arastirma';

const TUR_TONU: Record<string, string> = {
  Rapor: 'text-vurgu-parlak',
  Benchmark: 'text-ikincil',
  'Veri Seti': 'text-sinyal',
  Index: 'text-uyari',
  Whitepaper: 'text-metin-ikincil',
};

export async function Arastirma() {
  const ARASTIRMA = await arastirmaListesi();
  if (ARASTIRMA.length === 0) return null;

  return (
    <Bolum kimlik="arastirma" zemin="derin" etiketlendiren="arastirma-basligi">
      <BolumBasligi
        numara="08"
        etiket="RESEARCH"
        baslik={
          <span id="arastirma-basligi">Başkalarının kaynak göstermek zorunda kalacağı veri</span>
        }
        aciklama="Özgün araştırma, açık metodoloji ve atıf formatıyla yayımlanan veri setleri."
        baglantiYolu="/arastirma/"
        baglantiMetni="Araştırma merkezi"
      />

      <ul className="grid gap-4 md:grid-cols-2">
        {ARASTIRMA.map((yayin) => (
          <li key={yayin.slug}>
            <Link
              href={`/arastirma/${yayin.slug}/`}
              className="group relative flex h-full gap-5 overflow-hidden rounded-2xl border border-kenar bg-yuzey/40 p-6 transition-[border-color,background-color] duration-300 hover:border-ikincil/45 hover:bg-yuzey/70"
            >
              <div className="flex w-24 shrink-0 flex-col items-start justify-between border-r border-kenar-soluk pr-5">
                <Grafik className="size-5 text-metin-soluk transition-colors group-hover:text-ikincil" />
                <div>
                  <p className="font-mono text-2xl leading-none font-medium tracking-tight text-metin">
                    {yayin.veriNoktasi}
                  </p>
                  <p className="mt-1.5 text-[0.6875rem] leading-tight text-metin-soluk">
                    {yayin.veriEtiketi}
                  </p>
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <span className={`etiket-mono ${TUR_TONU[yayin.tur] ?? 'text-metin-soluk'}`}>
                  {yayin.tur}
                </span>
                <h3 className="mt-2.5 text-lg leading-snug font-semibold tracking-tight text-balance transition-colors group-hover:text-metin">
                  {yayin.baslik}
                </h3>
                <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-metin-ikincil">
                  {yayin.ozet}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-metin-soluk transition-colors group-hover:text-ikincil">
                  Metodoloji ve atıf
                  <Ok className="size-3.5 transition-transform duration-200 ease-sinaptik group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-center text-xs text-metin-soluk">
        Araştırma sonuçları ticari müşterilerden bağımsız yürütülür; sponsorlu içerikler açıkça
        işaretlenir.
      </p>
    </Bolum>
  );
}
