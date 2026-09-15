/**
 * Kart kapaklarında fotoğraf yerine kullanılan bilgi grafiği dokusu.
 * Stok görsel yerine platformun kendi görsel dilini taşır (MASTER-PLAN §113).
 */

const DUGUMLER: { x: number; y: number; r: number; ton: string }[] = [
  { x: 120, y: 86, r: 5, ton: 'var(--vurgu-parlak)' },
  { x: 232, y: 44, r: 3.5, ton: 'var(--ikincil)' },
  { x: 318, y: 118, r: 4.5, ton: 'var(--vurgu)' },
  { x: 196, y: 158, r: 3, ton: 'var(--metin-soluk)' },
  { x: 412, y: 62, r: 3, ton: 'var(--metin-soluk)' },
  { x: 462, y: 148, r: 6, ton: 'var(--sinyal)' },
  { x: 64, y: 168, r: 3, ton: 'var(--metin-soluk)' },
  { x: 366, y: 196, r: 3.5, ton: 'var(--ikincil)' },
];

const BAGLAR: [number, number][] = [
  [0, 1],
  [0, 3],
  [1, 2],
  [2, 3],
  [1, 4],
  [4, 5],
  [2, 5],
  [3, 6],
  [2, 7],
  [7, 5],
];

export function SinyalAgi({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 240"
      className={className}
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid slice"
    >
      <g opacity="0.55">
        {BAGLAR.map(([a, b]) => {
          const bas = DUGUMLER[a];
          const son = DUGUMLER[b];
          if (!bas || !son) return null;
          return (
            <line
              key={`${a}-${b}`}
              x1={bas.x}
              y1={bas.y}
              x2={son.x}
              y2={son.y}
              stroke="var(--kenar-guclu)"
              strokeWidth="1"
            />
          );
        })}
      </g>

      {DUGUMLER.map((dugum, sira) => (
        <g key={sira}>
          <circle cx={dugum.x} cy={dugum.y} r={dugum.r * 3} fill={dugum.ton} opacity="0.1" />
          <circle cx={dugum.x} cy={dugum.y} r={dugum.r} fill={dugum.ton} opacity="0.9" />
        </g>
      ))}
    </svg>
  );
}
