import Link from "next/link";

const KURUMSAL = [
  { href: "/hakkinda", etiket: "Hakkında" },
  { href: "/editoryal-politika", etiket: "Editoryal Politika" },
  { href: "/kunye", etiket: "Künye" },
  { href: "/iletisim", etiket: "İletişim" },
] as const;

const YASAL = [
  { href: "/kvkk-aydinlatma", etiket: "KVKK Aydınlatma" },
  { href: "/gizlilik", etiket: "Gizlilik" },
  { href: "/cerez-politikasi", etiket: "Çerez Politikası" },
  { href: "/kullanim-sartlari", etiket: "Kullanım Şartları" },
] as const;

export function Footer() {
  return (
    <footer className="mt-16 border-t border-doku">
      <div className="mx-auto grid max-w-[1280px] gap-8 px-[var(--gutter)] py-10 sm:grid-cols-3">
        <div>
          <p className="font-display text-base font-bold text-murekkep">
            SINAPTIKLAB
            <span aria-hidden className="ml-1 inline-block size-1.5 bg-sinyal" />
          </p>
          <p className="mt-2 max-w-[32ch] text-sm text-murekkep-2">
            Türkçe teknik yapay zeka yayını. Saha verisi, uydurma yok.
          </p>
          <p className="mt-4 font-mono text-xs text-murekkep-2">
            Sinaptik Sinyal bülteni — yakında.
          </p>
        </div>
        <nav aria-label="Kurumsal">
          <h2 className="font-mono text-xs uppercase tracking-wider text-murekkep-2">Site</h2>
          <ul className="mt-3 space-y-2">
            {KURUMSAL.map((madde) => (
              <li key={madde.href}>
                <Link
                  href={madde.href}
                  className="text-sm text-murekkep no-underline hover:text-sinyal"
                >
                  {madde.etiket}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Yasal">
          <h2 className="font-mono text-xs uppercase tracking-wider text-murekkep-2">Yasal</h2>
          <ul className="mt-3 space-y-2">
            {YASAL.map((madde) => (
              <li key={madde.href}>
                <Link
                  href={madde.href}
                  className="text-sm text-murekkep no-underline hover:text-sinyal"
                >
                  {madde.etiket}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-doku">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-[var(--gutter)] py-4">
          <p className="font-mono text-xs text-murekkep-2">© 2026 Sinaptiklab</p>
          <p className="font-mono text-xs text-murekkep-2" lang="tr">
            tr
          </p>
        </div>
      </div>
    </footer>
  );
}
