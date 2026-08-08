"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * "Aksiyon Potansiyeli" sinyal izi (BRIEF §5.4) — markanın tek gösterişli,
 * ama işlevsel öğesi. Masaüstünde sol payda dikey bir iz: okuma ilerlemesiyle
 * dolar, her H2 sınırında bir spike verir, spike'lar tıklanabilir bölüm
 * haritasıdır. Mobilde üstte ince ilerleme bandı. prefers-reduced-motion
 * altında animasyon yok: iz statik bölüm haritasına döner (ilerleme dolgusu
 * geçişsiz güncellenir, smooth scroll kapalı).
 *
 * Uygulama notları:
 * - Tek SVG path (dikey hat + EKG spike'ları); dolgu strokeDasharray/offset
 *   ile çizginin içinden akar → spike'lar da "ateşlenir".
 * - Ölçüm: makale kökü (id="icerik-govde") offset'leri; scroll rAF ile
 *   kısılır, transform/dashoffset dışında layout tetiklenmez (60fps).
 * - Tıklanabilir katman HTML <a> elemanları (SVG değil): klavye + ekran
 *   okuyucu erişimi doğal.
 */

interface Bolum {
  id: string;
  text: string;
}

interface Olcum {
  /** Bölümün iz üzerindeki y konumu (px, ray yüksekliğine oranlı). */
  y: number;
  id: string;
  text: string;
}

const SPIKE_YARI_YUKSEKLIK = 7; // px — spike'ın hat üzerinde kapladığı dikey pay
const HAT_X = 24; // rayın içindeki hat merkezi

// prefers-reduced-motion aboneliği (effect içinde setState yerine
// useSyncExternalStore — SSR anlık görüntüsü false).
const HAREKET_SORGUSU = "(prefers-reduced-motion: reduce)";
function hareketAboneligi(bildir: () => void) {
  const sorgu = window.matchMedia(HAREKET_SORGUSU);
  sorgu.addEventListener("change", bildir);
  return () => sorgu.removeEventListener("change", bildir);
}
const hareketDurumu = () => window.matchMedia(HAREKET_SORGUSU).matches;
const sunucuHareketDurumu = () => false;

function izYoluCiz(yukseklik: number, olcumler: Olcum[]): string {
  // Yukarıdan aşağı tek yol: hat → spike → hat → spike…
  let d = `M ${HAT_X} 0`;
  for (const o of olcumler) {
    const ust = Math.max(o.y - SPIKE_YARI_YUKSEKLIK, 0);
    const alt = Math.min(o.y + SPIKE_YARI_YUKSEKLIK, yukseklik);
    d += ` L ${HAT_X} ${ust}`;
    d += ` L ${HAT_X + 14} ${o.y - 2}`; // R tepesi (sağa)
    d += ` L ${HAT_X - 8} ${o.y + 3}`; // S çukuru (sola)
    d += ` L ${HAT_X} ${alt}`;
  }
  d += ` L ${HAT_X} ${yukseklik}`;
  return d;
}

export function SinyalIzi({ bolumler }: { bolumler: Bolum[] }) {
  const rayRef = useRef<HTMLElement | null>(null);
  const izRef = useRef<SVGPathElement | null>(null);
  const [olcumler, setOlcumler] = useState<Olcum[]>([]);
  const [rayYuksekligi, setRayYuksekligi] = useState(0);
  const [izUzunlugu, setIzUzunlugu] = useState(0);
  const [ilerleme, setIlerleme] = useState(0);
  const [aktifId, setAktifId] = useState<string | null>(null);
  const hareketAzalt = useSyncExternalStore(hareketAboneligi, hareketDurumu, sunucuHareketDurumu);

  // Ölçüm: makale ve başlık konumları → ray koordinatları (mount + resize)
  useEffect(() => {
    function olc() {
      const govde = document.getElementById("icerik-govde");
      const ray = rayRef.current;
      if (!govde || !ray) return;
      const yukseklik = ray.clientHeight;
      const govdeUst = govde.getBoundingClientRect().top + window.scrollY;
      const govdeBoy = govde.scrollHeight;
      if (yukseklik === 0 || govdeBoy === 0) return;

      const yeni: Olcum[] = [];
      for (const b of bolumler) {
        const el = document.getElementById(b.id);
        if (!el) continue;
        const elUst = el.getBoundingClientRect().top + window.scrollY;
        const oran = Math.min(Math.max((elUst - govdeUst) / govdeBoy, 0), 1);
        yeni.push({ y: Math.round(oran * yukseklik), id: b.id, text: b.text });
      }
      setRayYuksekligi(yukseklik);
      setOlcumler(yeni);
    }

    // İlk ölçüm rAF'a ertelenir (effect içinde senkron setState kaskadı olmasın)
    const ilkOlcum = requestAnimationFrame(olc);
    const gozlemci = new ResizeObserver(olc);
    const govde = document.getElementById("icerik-govde");
    if (govde) gozlemci.observe(govde);
    if (rayRef.current) gozlemci.observe(rayRef.current);
    return () => {
      cancelAnimationFrame(ilkOlcum);
      gozlemci.disconnect();
    };
  }, [bolumler]);

  // Path uzunluğu (dashoffset dolgusu için) — path değişince yeniden ölç
  useEffect(() => {
    if (izRef.current) setIzUzunlugu(izRef.current.getTotalLength());
  }, [rayYuksekligi, olcumler]);

  // İlerleme + aktif bölüm: rAF kısıtlamalı scroll dinleyici
  useEffect(() => {
    let bekleyen = false;
    function guncelle() {
      bekleyen = false;
      const govde = document.getElementById("icerik-govde");
      if (!govde) return;
      const kutu = govde.getBoundingClientRect();
      const okumaHizasi = window.innerHeight * 0.35;
      const oran = Math.min(Math.max((okumaHizasi - kutu.top) / kutu.height, 0), 1);
      setIlerleme(oran);

      let aktif: string | null = null;
      for (const b of bolumler) {
        const el = document.getElementById(b.id);
        if (el && el.getBoundingClientRect().top <= okumaHizasi) aktif = b.id;
      }
      setAktifId(aktif);
    }
    function planla() {
      if (!bekleyen) {
        bekleyen = true;
        requestAnimationFrame(guncelle);
      }
    }
    guncelle();
    window.addEventListener("scroll", planla, { passive: true });
    window.addEventListener("resize", planla);
    return () => {
      window.removeEventListener("scroll", planla);
      window.removeEventListener("resize", planla);
    };
  }, [bolumler]);

  // Bölüme gitme native çapa + CSS scroll-behavior ile olur (globals.css):
  // JS kaydırma yönetimi yok — smooth'u desteklemeyen ortamda anlık atlar,
  // reduced-motion tercihini tarayıcı uygular.
  const yol = rayYuksekligi > 0 ? izYoluCiz(rayYuksekligi, olcumler) : "";

  return (
    <>
      {/* Mobil: üstte ince ilerleme bandı (xl altı) */}
      <div
        aria-hidden
        className="fixed inset-x-0 top-0 z-40 h-[3px] origin-left bg-sinyal xl:hidden"
        style={{
          transform: `scaleX(${ilerleme})`,
          transition: hareketAzalt ? "none" : "transform 80ms linear",
        }}
      />

      {/* Masaüstü: sol payda dikey iz */}
      <nav
        ref={rayRef}
        aria-label="Bölüm haritası"
        className="sticky top-16 hidden h-[calc(100dvh-8rem)] w-16 xl:block"
      >
        {yol !== "" && (
          <svg
            aria-hidden
            width="64"
            height={rayYuksekligi}
            viewBox={`0 0 64 ${rayYuksekligi}`}
            className="absolute inset-0"
          >
            {/* zemin izi (ref: dolgu için toplam uzunluk buradan ölçülür) */}
            <path ref={izRef} d={yol} fill="none" stroke="var(--doku)" strokeWidth="1.5" />
            {/* okuma dolgusu: çizginin içinden akar */}
            {izUzunlugu > 0 && (
              <path
                d={yol}
                fill="none"
                stroke="var(--sinyal)"
                strokeWidth="1.5"
                strokeDasharray={izUzunlugu}
                strokeDashoffset={izUzunlugu * (1 - ilerleme)}
                style={hareketAzalt ? undefined : { transition: "stroke-dashoffset 80ms linear" }}
              />
            )}
          </svg>
        )}
        {/* tıklanabilir bölüm haritası (HTML katmanı — klavye/ekran okuyucu) */}
        <ul className="absolute inset-0 m-0 list-none p-0">
          {olcumler.map((o) => (
            <li key={o.id} className="absolute left-0" style={{ top: o.y - 10 }}>
              <a
                href={`#${o.id}`}
                aria-label={o.text}
                aria-current={aktifId === o.id ? "true" : undefined}
                className="group flex h-5 w-16 items-center no-underline"
              >
                <span
                  aria-hidden
                  className={`ml-9 inline-block size-2 border ${
                    aktifId === o.id
                      ? "border-sinyal bg-sinyal"
                      : "border-doku bg-kagit group-hover:border-sinyal"
                  }`}
                />
                {/* görsel tooltip; erişilebilir ad yukarıdaki aria-label'da */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute left-16 z-10 hidden w-56 border border-doku bg-kagit px-2 py-1 text-xs text-murekkep shadow-none group-hover:block group-focus-visible:block"
                >
                  {o.text}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
