'use client';

import { useEffect, useState } from 'react';

/**
 * Uzun metinlerde okuma ilerlemesi.
 *
 * Sayfanın tamamı değil `#makale` kabı ölçülür: kapanış çağrısı ve altlık
 * ilerlemeye dâhil edilmez, böylece çubuk metnin sonunda dolar.
 */
export function OkumaCubugu({ hedefKimlik = 'makale' }: { hedefKimlik?: string }) {
  const [oran, setOran] = useState(0);

  useEffect(() => {
    const hedef = document.getElementById(hedefKimlik);
    if (!hedef) return;

    let cerceve = 0;

    const olc = () => {
      const kutu = hedef.getBoundingClientRect();
      const gorunum = window.innerHeight;
      const okunan = gorunum - kutu.top;
      const toplam = kutu.height;
      const yeni = toplam > 0 ? Math.min(1, Math.max(0, okunan / toplam)) : 0;
      setOran(yeni);
    };

    const dinle = () => {
      cancelAnimationFrame(cerceve);
      cerceve = requestAnimationFrame(olc);
    };

    olc();
    window.addEventListener('scroll', dinle, { passive: true });
    window.addEventListener('resize', dinle);

    return () => {
      cancelAnimationFrame(cerceve);
      window.removeEventListener('scroll', dinle);
      window.removeEventListener('resize', dinle);
    };
  }, [hedefKimlik]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[55] h-0.5" aria-hidden="true">
      <div
        className="h-full origin-left bg-gradient-to-r from-vurgu via-vurgu-parlak to-ikincil transition-[width] duration-100 ease-out"
        style={{ width: `${oran * 100}%` }}
      />
    </div>
  );
}
