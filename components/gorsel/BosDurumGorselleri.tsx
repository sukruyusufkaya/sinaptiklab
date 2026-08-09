/**
 * Boş durum illüstrasyonları — ~240×180, sade ve sıcak.
 *
 * Üçü de aynı görsel dilde: yumuşak köşeli panel + ölçüm/sinyal öğesi.
 * Renk yalnız `currentColor` + token vurgusu (`--sinyal`, `--olcum`);
 * hex ve gradyan yok, robot/insan figürü yok.
 */

interface GorselOzellikleri {
  className?: string;
}

/** Arama tarama alanının nokta ızgarası — mercek altında boşluk bırakır. */
const IZGARA_X = [48, 76, 104, 132, 160, 188];
const IZGARA_Y = [50, 76, 102, 128];
const MERCEK = { x: 120, y: 88, r: 30 };

/** "Sonuç yok" — tarama alanı boş, mercek altında hiçbir düğüm yok. */
export function AramaBosGorseli({ className }: GorselOzellikleri) {
  return (
    <svg
      viewBox="0 0 240 180"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="24"
        y="28"
        width="192"
        height="124"
        rx="20"
        fill="currentColor"
        fillOpacity={0.03}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeOpacity={0.16}
      />
      <g fill="currentColor" fillOpacity={0.14}>
        {IZGARA_Y.flatMap((y) =>
          IZGARA_X.map((x) => {
            // Mercek alanının içi bilinçli olarak boş: "eşleşme yok".
            const uzaklik = Math.hypot(x - MERCEK.x, y - MERCEK.y);
            if (uzaklik < MERCEK.r + 6) return null;
            return <circle key={`${x}-${y}`} cx={x} cy={y} r={2.4} />;
          }),
        )}
      </g>
      <g stroke="currentColor" strokeWidth={2.75} strokeLinecap="round" strokeOpacity={0.55}>
        <circle cx={MERCEK.x} cy={MERCEK.y} r={MERCEK.r} />
        <path d="m141 109 21 21" />
      </g>
      {/* "Eşleşme yok" işareti bilinçle nötr: boş durumun sinyal rengi olmaz,
          ayrıca --olcum açık temada bu boyutta okunmuyor. */}
      <path
        d="M108 88h24"
        stroke="currentColor"
        strokeWidth={2.75}
        strokeOpacity={0.4}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** "İçerik hazırlanıyor" — iki dolu kart, üçüncüsü kesikli çerçevede sırada. */
export function ArsivBosGorseli({ className }: GorselOzellikleri) {
  return (
    <svg
      viewBox="0 0 240 180"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g stroke="currentColor" strokeWidth={1.5}>
        <rect
          x="32"
          y="30"
          width="176"
          height="38"
          rx="13"
          fill="currentColor"
          fillOpacity={0.05}
          strokeOpacity={0.18}
        />
        <rect
          x="32"
          y="76"
          width="176"
          height="38"
          rx="13"
          fill="currentColor"
          fillOpacity={0.05}
          strokeOpacity={0.18}
        />
        <rect
          x="32"
          y="122"
          width="176"
          height="38"
          rx="13"
          strokeOpacity={0.32}
          strokeDasharray="7 8"
        />
      </g>
      <g stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeOpacity={0.22}>
        <path d="M52 43h84" />
        <path d="M52 55h48" />
        <path d="M52 89h84" />
        <path d="M52 101h60" />
      </g>
      <g strokeLinecap="round">
        <path d="M66 141h56" stroke="currentColor" strokeWidth={2.5} strokeOpacity={0.14} />
        <path d="M66 141h22" stroke="var(--sinyal)" strokeWidth={2.5} />
      </g>
      <circle cx="52" cy="141" r="4" fill="var(--sinyal)" />
    </svg>
  );
}

/** "Bir şeyler ters gitti" — sinyal izi kopmuş, kopma noktası işaretli. */
export function HataGorseli({ className }: GorselOzellikleri) {
  return (
    <svg
      viewBox="0 0 240 180"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="20"
        y="36"
        width="200"
        height="108"
        rx="20"
        fill="currentColor"
        fillOpacity={0.03}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeOpacity={0.14}
      />
      <path d="M32 122h176" stroke="currentColor" strokeWidth={1.25} strokeOpacity={0.18} />
      <g
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity={0.5}
      >
        <path d="M32 90h26l10-22 12 44 10-22h10" />
        <path d="M140 90h20l8-14 10 28 8-14h22" />
      </g>
      <path
        d="M104 90h32"
        stroke="currentColor"
        strokeWidth={2}
        strokeOpacity={0.2}
        strokeDasharray="4 9"
        strokeLinecap="round"
      />
      {/* Kopma noktası: halka şekli currentColor ile taşır (her iki temada
          okunur), --olcum yalnız işareti sıcak tutar. */}
      <circle cx="120" cy="90" r="13" stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.3} />
      <g stroke="var(--olcum)" strokeWidth={2.75} strokeLinecap="round">
        <path d="m114 84 12 12" />
        <path d="m126 84-12 12" />
      </g>
    </svg>
  );
}
