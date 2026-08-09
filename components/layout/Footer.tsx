import Link from "next/link";
import { env } from "@/lib/env";

// Statik prerender'da hesaplanır → build tarihi (enstrüman kalibrasyon satırı)
const BUILD_TARIHI = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(new Date());

const KESIF = [
  { href: "/konu", etiket: "Konular" },
  { href: "/sozluk", etiket: "Sözlük" },
  { href: "/ara", etiket: "Arama" },
  { href: "/bulten", etiket: "Bülten arşivi" },
] as const;

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

/** Makine okunabilir yüzeyler (BRIEF §8.1) — açıkça duyurulur: ajanlar ve
 *  entegrasyonlar bu adresleri kullanabilir. Next Link ile değil <a> ile,
 *  çünkü hepsi route handler / statik dosya. */
const MAKINE = [
  { href: "/llms.txt", etiket: "llms.txt" },
  { href: "/feed.xml", etiket: "RSS" },
  { href: "/api/content", etiket: "İçerik API" },
  { href: "/api/mcp", etiket: "MCP uç noktası" },
] as const;

function Sutun({
  baslik,
  maddeler,
  disBaglanti = false,
}: {
  baslik: string;
  maddeler: readonly { href: string; etiket: string }[];
  disBaglanti?: boolean;
}) {
  return (
    <nav aria-label={baslik}>
      <h2 className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-murekkep-2">
        {baslik}
      </h2>
      <ul className="mt-3 space-y-2">
        {maddeler.map((madde) => (
          <li key={madde.href}>
            {disBaglanti ? (
              <a
                href={madde.href}
                className="font-mono text-sm text-murekkep no-underline transition-colors hover:text-sinyal"
              >
                {madde.etiket}
              </a>
            ) : (
              <Link
                href={madde.href}
                className="text-sm text-murekkep no-underline transition-colors hover:text-sinyal"
              >
                {madde.etiket}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-doku">
      <div className="mx-auto grid max-w-[1280px] gap-8 px-[var(--gutter)] py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <p className="font-display text-base font-bold text-murekkep">
            SINAPTIKLAB
            <span aria-hidden className="ml-1 inline-block size-1.5 bg-sinyal" />
          </p>
          <p className="mt-2 max-w-[34ch] text-sm leading-relaxed text-murekkep-2">
            Yapay zeka sistemlerini gerçekten üretenler için Türkçe teknik yayın. Saha verisi,
            uydurma yok.
          </p>
          <p className="mt-5 inline-flex items-center gap-2 border border-doku px-2.5 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-murekkep-2">
            <span aria-hidden className="inline-block size-1.5 bg-onay" />
            içerik ajanlara açık · llms.txt + mcp
          </p>
        </div>
        <Sutun baslik="Keşif" maddeler={KESIF} />
        <Sutun baslik="Kurumsal" maddeler={KURUMSAL} />
        <Sutun baslik="Yasal" maddeler={YASAL} />
        <div className="sm:col-span-2 lg:col-span-5">
          <div className="cetvel my-2" aria-hidden />
          <Sutun baslik="Makine okunabilir yüzeyler" maddeler={MAKINE} disBaglanti />
        </div>
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
