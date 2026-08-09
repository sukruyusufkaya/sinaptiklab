/**
 * Ana sayfa bölüm başlıkları için dekoratif işaretler — 120×120.
 *
 * Üçü de sitenin üç iddiasının şematik karşılığı:
 *  - Kaynaklı derinlik: katmanlar boyunca inen sonda, her katmanda bir ankraj.
 *  - Çalışan kod: yeşil durum LED'i yanan terminal, imleç canlı.
 *  - Kanonik Türkçe: dağınık varyantlar tek terime yakınsıyor.
 *
 * Kart üstünde durur; boyut `className` ile verilir (ör. `size-24`).
 */

interface GorselOzellikleri {
  className?: string;
}

const KATMANLAR = [26, 46, 66, 86];

/** Kaynaklı derinlik — katman katman inen ölçüm sondası. */
export function KaynakliDerinlikGorseli({ className }: GorselOzellikleri) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.2}>
        {KATMANLAR.map((y, i) => (
          <rect
            key={y}
            x={16}
            y={y}
            width={88}
            height={14}
            rx={7}
            fill="currentColor"
            fillOpacity={0.04 + i * 0.015}
          />
        ))}
      </g>
      <path d="M60 14v92" stroke="var(--sinyal)" strokeWidth={2} strokeLinecap="round" />
      <g stroke="var(--sinyal)" strokeWidth={1.75} fill="none">
        {KATMANLAR.map((y, i) => (
          <circle key={y} cx={60} cy={y + 7} r={4} fill={i === 3 ? "var(--sinyal)" : "none"} />
        ))}
      </g>
      <g stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.28} strokeLinecap="round">
        <path d="M110 26v74" />
        <path d="M106 26h8" />
        <path d="M106 100h8" />
      </g>
      {/* Ölçülen derinlik: kumpas üstünde en derin ankraja hizalı çentik. */}
      <path d="M106 93h8" stroke="var(--olcum)" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

/** Çalışan kod — durum LED'i yanan terminal, imleç canlı. */
export function CalisanKodGorseli({ className }: GorselOzellikleri) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="12"
        y="20"
        width="96"
        height="80"
        rx="16"
        fill="currentColor"
        fillOpacity={0.05}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeOpacity={0.22}
      />
      <path d="M12 40h96" stroke="currentColor" strokeWidth={1.25} strokeOpacity={0.18} />
      <circle
        cx="27"
        cy="30"
        r="3.5"
        fill="var(--onay)"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeOpacity={0.35}
      />
      <circle cx="39" cy="30" r="3.5" fill="currentColor" fillOpacity={0.2} />
      <circle cx="51" cy="30" r="3.5" fill="currentColor" fillOpacity={0.12} />
      <path
        d="m26 54 8 8-8 8"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity={0.55}
      />
      <g stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
        <path d="M42 62h24" strokeOpacity={0.35} />
        <path d="M26 82h30" strokeOpacity={0.22} />
      </g>
      <rect x="62" y="75" width="8" height="14" rx="2.5" fill="var(--sinyal)" opacity={0.85} />
    </svg>
  );
}

const VARYANT_Y = [22, 42, 62, 82];
const YAKINSAMA = [
  "c20 0 20 32 38 32",
  "c20 0 20 12 38 12",
  "c20 0 20-8 38-8",
  "c20 0 20-28 38-28",
];

/** Kanonik Türkçe — dağınık varyantlar tek terimde buluşur. */
export function KanonikTurkceGorseli({ className }: GorselOzellikleri) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.2}>
        {VARYANT_Y.map((y) => (
          <rect
            key={y}
            x={8}
            y={y}
            width={28}
            height={12}
            rx={6}
            fill="currentColor"
            fillOpacity={0.05}
          />
        ))}
      </g>
      <g stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.3} strokeLinecap="round">
        {VARYANT_Y.map((y, i) => (
          <path key={y} d={`M36 ${y + 6}${YAKINSAMA[i] ?? ""}`} />
        ))}
      </g>
      <circle
        cx="88"
        cy="60"
        r="12"
        fill="currentColor"
        fillOpacity={0.05}
        stroke="var(--sinyal)"
        strokeWidth={2}
      />
      <circle cx="88" cy="60" r="4" fill="var(--sinyal)" />
      <path d="M88 76v6" stroke="var(--olcum)" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}
