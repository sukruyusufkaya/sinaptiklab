import Link from 'next/link';
import type { AnaMenuOgesi } from '@/lib/rotalar';
import { Ok } from '@/components/arayuz/Ikonlar';

const ROZET_SINIFLARI: Record<string, string> = {
  yeni: 'border-vurgu/40 bg-vurgu-zemin text-vurgu-parlak',
  canli: 'border-tehlike/40 bg-tehlike/10 text-tehlike',
  yakinda: 'border-kenar bg-yuzey-2 text-metin-soluk',
};

const ROZET_METNI: Record<string, string> = {
  yeni: 'Yeni',
  canli: 'Canlı',
  yakinda: 'Yakında',
};

export function MegaMenu({ oge }: { oge: AnaMenuOgesi }) {
  return (
    <div className="kap py-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr_1fr_minmax(0,20rem)]">
        {oge.sutunlar.map((sutun) => (
          <div key={sutun.baslik}>
            <p className="etiket-mono mb-4 text-metin-soluk">{sutun.baslik}</p>
            <ul className="space-y-0.5">
              {sutun.ogeler.map((menuOgesi) => (
                <li key={menuOgesi.yol}>
                  <Link
                    href={menuOgesi.yol}
                    className="group block rounded-lg px-3 py-2 -mx-3 transition-colors duration-150 hover:bg-yuzey-2"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-medium text-metin group-hover:text-vurgu-parlak">
                        {menuOgesi.ad}
                      </span>
                      {menuOgesi.rozet && (
                        <span
                          className={`etiket-mono rounded-full border px-1.5 py-0.5 text-[0.5625rem] ${ROZET_SINIFLARI[menuOgesi.rozet]}`}
                        >
                          {ROZET_METNI[menuOgesi.rozet]}
                        </span>
                      )}
                    </span>
                    {menuOgesi.aciklama && (
                      <span className="mt-0.5 block text-xs leading-relaxed text-metin-soluk">
                        {menuOgesi.aciklama}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {oge.vitrin && (
          <Link
            href={oge.vitrin.yol}
            className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-kenar bg-zemin-derin p-5 transition-colors duration-200 hover:border-vurgu/50"
          >
            <div
              className="nokta-zemin pointer-events-none absolute inset-0 opacity-40"
              aria-hidden="true"
            />
            <div className="relative">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <p className="etiket-mono text-vurgu-parlak">{oge.vitrin.etiket}</p>
                {/*
                  Vitrin de durumunu söyleyebilir. Dergi menüsünde vitrin,
                  henüz YAYIMLANMAMIŞ Ekim sayısını "Sayıyı oku" çağrısıyla
                  tanıtıyordu; okur çıkmamış bir sayıyı okuyabileceğini
                  sanıyordu.
                */}
                {oge.vitrin.rozet && (
                  <span
                    className={`etiket-mono rounded-full border px-1.5 py-0.5 text-[0.5625rem] ${ROZET_SINIFLARI[oge.vitrin.rozet]}`}
                  >
                    {ROZET_METNI[oge.vitrin.rozet]}
                  </span>
                )}
              </div>
              <p className="text-lg leading-snug font-semibold tracking-tight text-metin">
                {oge.vitrin.baslik}
              </p>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-metin-ikincil">
                {oge.vitrin.metin}
              </p>
            </div>
            <span className="relative mt-5 inline-flex items-center gap-2 text-sm font-medium text-vurgu-parlak">
              {oge.vitrin.baglantiMetni}
              <Ok className="size-4 transition-transform duration-200 ease-sinaptik group-hover:translate-x-1" />
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
