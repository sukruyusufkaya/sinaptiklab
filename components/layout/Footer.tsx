import Link from "next/link";
import { env } from "@/lib/env";

// Statik prerender'da hesaplanır → build tarihi (enstrüman kalibrasyon satırı)
const BUILD_TARIHI = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(new Date());

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
                {/* prefetch kapalı: rotalar sonraki fazlarda açılacak (404 önlemi) */}
                <Link
                  href={madde.href}
                  prefetch={false}
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
                  prefetch={false}
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
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-2 px-[var(--gutter)] py-4">
          <p className="font-mono text-xs text-murekkep-2">© 2026 Sinaptiklab</p>
          <p className="font-mono text-[0.65rem] tracking-wider text-murekkep-2">
            kalibrasyon: {env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "yerel"} · {BUILD_TARIHI} · tr
          </p>
        </div>
      </div>
    </footer>
  );
}
