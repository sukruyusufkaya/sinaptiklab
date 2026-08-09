import Link from "next/link";
import { MobilMenu, type MenuMaddesi } from "./MobilMenu";
import { TemaAnahtari } from "./TemaAnahtari";

// Ana gezinme — BRIEF §2.2 URL şeması. `hazir: false` olanlar sonraki
// fazlarda açılacak modüllerdir: rota vardır (plan sayfası döner) ama
// prefetch kapalıdır ve görsel olarak sönük gösterilir.
const NAV: readonly MenuMaddesi[] = [
  { href: "/konu", etiket: "Konular", hazir: true },
  { href: "/sozluk", etiket: "Sözlük", hazir: true },
  { href: "/makale", etiket: "Makaleler", hazir: true },
  { href: "/rehber", etiket: "Rehberler", hazir: true },
  { href: "/uygulama", etiket: "Uygulamalar", hazir: true },
  { href: "/kurs", etiket: "Kurslar", hazir: false },
  { href: "/forum", etiket: "Forum", hazir: false },
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-doku bg-kagit/85 backdrop-blur-sm">
      <div className="relative mx-auto flex max-w-[1280px] items-center gap-x-5 px-[var(--gutter)] py-3">
        <Link
          href="/"
          aria-label="Sinaptiklab ana sayfa"
          className="flex shrink-0 items-baseline gap-1 font-display text-lg font-bold tracking-tight text-murekkep no-underline hover:text-murekkep"
        >
          SINAPTIKLAB
          <span aria-hidden className="inline-block size-2 bg-sinyal" />
        </Link>

        {/* Masaüstü gezinme (md+); mobilde çekmeceye düşer */}
        <nav
          aria-label="Ana gezinme"
          className="hidden flex-wrap items-center gap-x-4 gap-y-1 md:flex"
        >
          {NAV.map((madde) => (
            <Link
              key={madde.href}
              href={madde.href}
              prefetch={madde.hazir ? undefined : false}
              className={`font-mono text-sm no-underline transition-colors hover:text-sinyal ${
                madde.hazir ? "text-murekkep-2" : "text-murekkep-2/70"
              }`}
            >
              {madde.etiket}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/ara"
            aria-label="Sitede ara"
            className="flex items-center gap-2 border border-doku px-2.5 py-1.5 font-mono text-xs text-murekkep-2 no-underline transition-colors hover:border-sinyal hover:text-sinyal"
          >
            <svg width="13" height="13" viewBox="0 0 15 15" fill="none" aria-hidden>
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M10 10L14 14" stroke="currentColor" strokeWidth="1.3" />
            </svg>
            <span className="max-sm:hidden">ara</span>
          </Link>
          <TemaAnahtari />
          <Link
            href="/giris"
            prefetch={false}
            className="font-mono text-sm text-murekkep-2/70 no-underline transition-colors hover:text-sinyal max-lg:hidden"
          >
            Giriş
          </Link>
          <MobilMenu maddeler={NAV} />
        </div>
      </div>
    </header>
  );
}
