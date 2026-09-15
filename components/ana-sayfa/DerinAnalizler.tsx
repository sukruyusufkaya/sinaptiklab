import Link from 'next/link';
import { Bolum } from '@/components/arayuz/Bolum';
import { BolumBasligi } from '@/components/arayuz/BolumBasligi';
import { Ok, Saat } from '@/components/arayuz/Ikonlar';
import { analizler } from '@/lib/icerik/gundem';

export async function DerinAnalizler() {
  const ANALIZLER = await analizler();
  if (ANALIZLER.length === 0) return null;

  return (
    <Bolum kimlik="analiz" etiketlendiren="analiz-basligi">
      <BolumBasligi
        numara="03"
        etiket="THOUGHT LEADERSHIP"
        baslik={<span id="analiz-basligi">Derinlemesine</span>}
        aciklama="Haber ne olduğunu söyler; analiz bunun ne anlama geldiğini."
        baglantiYolu="/analiz/"
        baglantiMetni="Tüm analizler"
      />

      <ul className="grid gap-px overflow-hidden rounded-2xl border border-kenar bg-kenar md:grid-cols-3">
        {ANALIZLER.map((analiz, sira) => (
          <li
            key={analiz.slug}
            className="group relative bg-zemin transition-colors hover:bg-yuzey/60"
          >
            <Link href={`/analiz/${analiz.slug}/`} className="flex h-full flex-col p-6 sm:p-7">
              <span className="etiket-mono text-metin-soluk">
                {String(sira + 1).padStart(2, '0')} · {analiz.konu}
              </span>

              <h3 className="mt-5 text-xl leading-[1.18] font-semibold tracking-tight text-balance transition-colors group-hover:text-vurgu-parlak">
                {analiz.baslik}
              </h3>

              <p className="mt-4 flex-1 font-serif text-[0.9375rem] leading-relaxed text-metin-ikincil">
                {analiz.girizgah}
              </p>

              <span className="mt-6 flex items-center justify-between border-t border-kenar-soluk pt-4 text-xs text-metin-soluk">
                <span className="inline-flex items-center gap-1.5">
                  <Saat className="size-3.5" />
                  {analiz.okumaDakika} dakikalık okuma
                </span>
                <Ok className="size-4 transition-transform duration-200 ease-sinaptik group-hover:translate-x-1 group-hover:text-vurgu-parlak" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Bolum>
  );
}
