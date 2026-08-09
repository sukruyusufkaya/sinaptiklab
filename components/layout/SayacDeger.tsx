"use client";

import { useEffect, useRef, useState } from "react";

const SAYI_TR = new Intl.NumberFormat("tr-TR");

/**
 * Ölçüm sayacı (ADR 0009): cihaz açılırken değerin sıfırdan gerçek okumaya
 * yükselmesi. Sunucuda ve `prefers-reduced-motion: reduce` altında değer
 * DOĞRUDAN son hâliyle basılır — hidrasyon uyuşmazlığı ve gereksiz hareket
 * olmaz. Yalnız görüş alanına girince başlar (IntersectionObserver).
 */
export function SayacDeger({ deger, sure = 900 }: { deger: number; sure?: number }) {
  const [gosterilen, setGosterilen] = useState(deger);
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;

    let cerceve = 0;
    let baslangic: number | null = null;
    setGosterilen(0);

    const adim = (zaman: number) => {
      baslangic ??= zaman;
      const oran = Math.min((zaman - baslangic) / sure, 1);
      // easeOutCubic — ibre yavaşlayarak yerine oturur
      const yumusak = 1 - (1 - oran) ** 3;
      setGosterilen(Math.round(deger * yumusak));
      if (oran < 1) cerceve = requestAnimationFrame(adim);
    };

    const gozlemci = new IntersectionObserver(
      (girisler) => {
        if (girisler.some((g) => g.isIntersecting)) {
          cerceve = requestAnimationFrame(adim);
          gozlemci.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    gozlemci.observe(el);

    return () => {
      cancelAnimationFrame(cerceve);
      gozlemci.disconnect();
    };
  }, [deger, sure]);

  return (
    <span ref={ref} className="tabular-nums">
      {SAYI_TR.format(gosterilen)}
    </span>
  );
}
