'use client';

import { useEffect, useState } from 'react';

/**
 * Kaydırma takipli içindekiler.
 *
 * Aktif bölüm IntersectionObserver ile belirlenir. Bağlantılar gerçek çapa
 * bağlantılarıdır; JavaScript çalışmasa da gezinme işler — takip yalnızca
 * görsel bir katman ekler.
 */
export function IcindekilerTakipli({
  basliklar,
}: {
  basliklar: { kimlik: string; metin: string }[];
}) {
  const [aktif, setAktif] = useState<string | null>(basliklar[0]?.kimlik ?? null);

  useEffect(() => {
    if (basliklar.length === 0) return;

    const gozlemci = new IntersectionObserver(
      (kayitlar) => {
        const gorunen = kayitlar
          .filter((kayit) => kayit.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (gorunen[0]) setAktif(gorunen[0].target.id);
      },
      // Üst şeridi hesaba katan bir bant: başlık ekranın üst üçte birine
      // girdiğinde aktif sayılır.
      { rootMargin: '-120px 0px -65% 0px', threshold: 0 },
    );

    for (const baslik of basliklar) {
      const oge = document.getElementById(baslik.kimlik);
      if (oge) gozlemci.observe(oge);
    }

    return () => gozlemci.disconnect();
  }, [basliklar]);

  if (basliklar.length === 0) return null;

  return (
    <nav aria-label="İçindekiler" className="rounded-xl border border-kenar bg-yuzey/40 p-5">
      <p className="etiket-mono mb-3.5 text-metin">İçindekiler</p>
      <ol className="space-y-0.5">
        {basliklar.map((baslik, sira) => {
          const seciliMi = aktif === baslik.kimlik;
          return (
            <li key={baslik.kimlik}>
              <a
                href={`#${baslik.kimlik}`}
                aria-current={seciliMi ? 'location' : undefined}
                className={`group flex gap-2.5 rounded-lg px-2 py-1.5 -mx-2 transition-colors duration-200 ${
                  seciliMi ? 'bg-vurgu-zemin/60' : 'hover:bg-yuzey-2'
                }`}
              >
                <span
                  className={`etiket-mono mt-0.5 shrink-0 transition-colors ${
                    seciliMi ? 'text-vurgu-parlak' : 'text-metin-soluk'
                  }`}
                >
                  {String(sira + 1).padStart(2, '0')}
                </span>
                <span
                  className={`text-[0.8125rem] leading-snug transition-colors ${
                    seciliMi
                      ? 'font-medium text-metin'
                      : 'text-metin-ikincil group-hover:text-metin'
                  }`}
                >
                  {baslik.metin}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
