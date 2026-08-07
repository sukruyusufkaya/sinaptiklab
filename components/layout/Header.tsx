import Link from "next/link";
import { TemaAnahtari } from "./TemaAnahtari";

const NAV = [
  { href: "/konu", etiket: "Konular" },
  { href: "/sozluk", etiket: "Sözlük" },
  { href: "/arac", etiket: "Araçlar" },
  { href: "/olcum", etiket: "Ölçümler" },
  { href: "/kurs", etiket: "Kurslar" },
  { href: "/forum", etiket: "Forum" },
] as const;

export function Header() {
  return (
    <header className="border-b border-doku">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-6 gap-y-2 px-[var(--gutter)] py-3">
        <Link
          href="/"
          className="flex items-baseline gap-1 font-display text-lg font-bold tracking-tight text-murekkep no-underline hover:text-murekkep"
        >
          SINAPTIKLAB
          <span aria-hidden className="inline-block size-2 bg-sinyal" />
        </Link>
        <nav aria-label="Ana gezinme" className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {NAV.map((madde) => (
            // prefetch kapalı: hedef rotalar sonraki fazlarda açılacak; prefetch
            // şimdilik 404 üretip konsolu kirletiyor. Rota açılınca kaldırılacak.
            <Link
              key={madde.href}
              href={madde.href}
              prefetch={false}
              className="font-mono text-sm text-murekkep-2 no-underline hover:text-sinyal"
            >
              {madde.etiket}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <TemaAnahtari />
          <Link
            href="/giris"
            prefetch={false}
            className="font-mono text-sm text-murekkep-2 no-underline hover:text-sinyal"
          >
            Giriş
          </Link>
        </div>
      </div>
    </header>
  );
}
