/**
 * Ana sayfa hero kompozisyonu — "ölçüm tezgâhı".
 *
 * Anlatı: üç enstrüman paneli (sinyal izi · ölçüm çubukları · bilgi ağı)
 * birbirine veri akışıyla bağlı, hepsi ortak bir kalibrasyon rayının
 * üstünde duruyor. Marka iddiasının görsel karşılığı: her çıktı bir
 * ölçüme, her ölçüm bir kaynağa bağlı.
 *
 * Teknik:
 * - Tüm gövde `currentColor` + opaklık katmanı; derinlik gradyanla değil
 *   katman/opaklıkla kuruluyor (BRIEF §14 gradyan yasağı).
 * - Vurgular yalnız token: `--sinyal` (aktif yol), `--olcum` (kalibrasyon
 *   çentikleri, %3 alan sınırının çok altında), `--onay` (durum LED'i).
 * - Saf SVG: JS yok, `next/image` yok. Tek hareket, P1 izinin açılışta
 *   çizilmesi (`.iz-ciz`, ADR 0009) — CSS ile, reduced-motion'da kapalı.
 * - `viewBox` ölçekli; ~520px genişlikte tasarlandı, `w-full h-auto` ile
 *   her kolona oturur.
 */

import type { CSSProperties } from "react";

/** Kalibrasyon rayı çentikleri: x konumları ve vurgulu olanların indeksi. */
const RAY_BASLANGIC = 36;
const RAY_ADIM = 14;
const RAY_ADET = 33;
const RAY_CENTIKLERI = Array.from({ length: RAY_ADET }, (_, i) => RAY_BASLANGIC + i * RAY_ADIM);
const VURGULU_CENTIK = new Set([8, 20]);

/** Ağ paneli düğümleri (P3 içi). */
const AG_DUGUMLERI = [
  { id: "a", x: 186, y: 296 },
  { id: "b", x: 228, y: 254 },
  { id: "c", x: 252, y: 318 },
  { id: "d", x: 300, y: 276 },
  { id: "e", x: 334, y: 320 },
  { id: "f", x: 346, y: 250 },
] as const;

/** Aktif yol üstündeki düğümler — `--sinyal` ile işaretlenir. */
const AKTIF_DUGUMLER = new Set(["a", "b", "d", "f"]);

export function HeroGorseli({ className = "w-full h-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 400"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* ── Zemin ızgarası: tezgâh milimetrik kâğıdı ── */}
      <g stroke="currentColor" strokeWidth={1} opacity={0.08}>
        <path d="M20 60h480M20 140h480M20 220h480M20 300h480" />
        <path d="M100 24v352M220 24v352M340 24v352M460 24v352" />
      </g>

      {/* ── Katman panelleri: yumuşak köşe, opaklıkla derinlik ── */}
      <g stroke="currentColor" strokeWidth={1.25}>
        <rect
          x="36"
          y="52"
          width="214"
          height="150"
          rx="22"
          fill="currentColor"
          fillOpacity={0.035}
          strokeOpacity={0.16}
        />
        <rect
          x="286"
          y="44"
          width="196"
          height="132"
          rx="22"
          fill="currentColor"
          fillOpacity={0.05}
          strokeOpacity={0.2}
        />
        <rect
          x="150"
          y="222"
          width="230"
          height="132"
          rx="22"
          fill="currentColor"
          fillOpacity={0.045}
          strokeOpacity={0.18}
        />
      </g>

      {/* ── Paneller arası veri akışı ── */}
      <g
        stroke="currentColor"
        strokeWidth={1.25}
        strokeOpacity={0.28}
        strokeLinecap="round"
        fill="none"
      >
        <path d="M250 128c18 0 18-22 36-22" />
        <path d="M132 202c0 14 14 20 36 20" />
        <path d="M384 176c0 30-12 40-32 46" />
      </g>
      <g stroke="currentColor" strokeWidth={1.25} strokeOpacity={0.4} fill="none">
        <circle cx="250" cy="128" r="3.5" />
        <circle cx="286" cy="106" r="3.5" />
        <circle cx="132" cy="202" r="3.5" />
        <circle cx="168" cy="222" r="3.5" />
        <circle cx="384" cy="176" r="3.5" />
        <circle cx="352" cy="222" r="3.5" />
      </g>

      {/* ── P1: sinyal izi (aksiyon potansiyeli) ── */}
      <g strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M54 140h136" stroke="currentColor" strokeWidth={1} strokeOpacity={0.18} />
        <path d="M54 88h30" stroke="currentColor" strokeWidth={1.25} strokeOpacity={0.16} />
        {/* Marka hareketi (ADR 0009): iz açılışta soldan sağa "kaydedilir";
            reduced-motion altında çizili gelir. */}
        <path
          className="iz-ciz"
          style={{ "--iz-uzunluk": "260" } as CSSProperties}
          d="M54 140h34l10-30 12 62 10-46 12 14h58"
          stroke="var(--sinyal)"
          strokeWidth={2.25}
        />
        <circle cx="98" cy="110" r="4" stroke="var(--olcum)" strokeWidth={2} />
      </g>

      {/* ── P2: ölçüm çubukları + durum LED'i ── */}
      <g>
        <path d="M306 62h96" stroke="currentColor" strokeWidth={1.25} strokeOpacity={0.18} />
        <path d="M306 152h156" stroke="currentColor" strokeWidth={1.25} strokeOpacity={0.22} />
        <g fill="currentColor" fillOpacity={0.2}>
          <rect x="310" y="112" width="20" height="40" rx="7" />
          <rect x="340" y="88" width="20" height="64" rx="7" />
          <rect x="370" y="100" width="20" height="52" rx="7" />
          <rect x="430" y="94" width="20" height="58" rx="7" />
        </g>
        <rect x="400" y="70" width="20" height="82" rx="7" fill="var(--sinyal)" opacity={0.55} />
        {/* Durum LED'i: --onay koyu temada da kısık kaldığı için currentColor
            halka şekli taşır, token yalnız sıcaklığı verir. */}
        <circle
          cx="466"
          cy="62"
          r="4"
          fill="var(--onay)"
          stroke="currentColor"
          strokeWidth={1.25}
          strokeOpacity={0.35}
        />
      </g>

      {/* ── P3: bilgi ağı — kenarlar, aktif yol, düğümler ── */}
      <g stroke="currentColor" strokeWidth={1.25} strokeOpacity={0.24} fill="none">
        <path d="m186 296 42-42" />
        <path d="m186 296 66 22" />
        <path d="m228 254 72 22" />
        <path d="m252 318 48-42" />
        <path d="m300 276 34 44" />
        <path d="m300 276 46-26" />
        <path d="m252 318 82 2" />
      </g>
      <g stroke="var(--sinyal)" strokeWidth={2} fill="none" strokeLinecap="round">
        <path d="m186 296 42-42" />
        <path d="m228 254 72 22" />
        <path d="m300 276 46-26" />
      </g>
      {AG_DUGUMLERI.map((dugum) => {
        const aktif = AKTIF_DUGUMLER.has(dugum.id);
        return (
          <circle
            key={dugum.id}
            cx={dugum.x}
            cy={dugum.y}
            r={aktif ? 6 : 5}
            fill="currentColor"
            fillOpacity={0.08}
            stroke={aktif ? "var(--sinyal)" : "currentColor"}
            strokeWidth={aktif ? 2 : 1.25}
            strokeOpacity={aktif ? 1 : 0.45}
          />
        );
      })}

      {/* ── Kalibrasyon rayı: ölçek, çentikler, kumpas köşesi ── */}
      <g stroke="currentColor" strokeLinecap="round">
        <path d="M36 376h448" strokeWidth={1.25} strokeOpacity={0.24} />
        <path d="M150 358v6h230v-6" strokeWidth={1.25} strokeOpacity={0.3} fill="none" />
        <path d="M265 364v6" strokeWidth={1.25} strokeOpacity={0.3} />
      </g>
      <g strokeLinecap="round">
        {RAY_CENTIKLERI.map((x, i) => {
          const vurgulu = VURGULU_CENTIK.has(i);
          const uzunluk = vurgulu ? 12 : i % 4 === 0 ? 9 : 5;
          return (
            <path
              key={x}
              d={`M${x} 376v-${uzunluk}`}
              stroke={vurgulu ? "var(--olcum)" : "currentColor"}
              strokeWidth={vurgulu ? 2 : 1.25}
              strokeOpacity={vurgulu ? 1 : 0.28}
            />
          );
        })}
      </g>
    </svg>
  );
}

export default HeroGorseli;
