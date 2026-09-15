import Link from 'next/link';

/** Sinaptik işareti: sinyal taşıyan üç düğüm. */
export function SinaptikIsareti({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
      <rect
        x="0.75"
        y="0.75"
        width="30.5"
        height="30.5"
        rx="9"
        fill="var(--vurgu-zemin)"
        stroke="var(--vurgu)"
        strokeOpacity="0.45"
        strokeWidth="1.5"
      />
      <path
        d="M9.5 21.5 15 16l-2.5-2.8L22 9.5"
        fill="none"
        stroke="var(--vurgu-parlak)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="21.5" r="2.6" fill="var(--ikincil)" />
      <circle cx="22" cy="9.5" r="2.6" fill="var(--vurgu-parlak)" />
      <circle cx="15" cy="16" r="1.6" fill="var(--sinyal)" />
    </svg>
  );
}

export function Logo({
  className = '',
  yaziGoster = true,
}: {
  className?: string;
  yaziGoster?: boolean;
}) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 rounded-lg ${className}`.trim()}
      aria-label="Sinaptik Lab ana sayfa"
    >
      <SinaptikIsareti className="size-8 shrink-0 transition-transform duration-300 ease-sinaptik group-hover:scale-105" />
      {yaziGoster && (
        <span className="flex flex-col leading-none">
          <span className="text-[0.9375rem] font-semibold tracking-tight text-metin">
            Sinaptik<span className="text-vurgu-parlak">Lab</span>
          </span>
          <span className="etiket-mono mt-1 text-[0.5625rem] text-metin-soluk">
            AI KNOWLEDGE PLATFORM
          </span>
        </span>
      )}
    </Link>
  );
}
