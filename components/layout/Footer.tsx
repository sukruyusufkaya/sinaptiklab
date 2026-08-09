import Link from "next/link";
import { AjanIkon, KaynakIkon, KodIkon, OkSagIkon, VeriIkon } from "@/components/gorsel";
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

/**
 * Makine okunabilir yüzeyler (BRIEF §8.1). Sitenin en ayırt edici katmanı,
 * bu yüzden footer'ın dip listesi değil AÇILIŞ şeridi: dört yüzey, ne işe
 * yaradığı ve adresiyle. Next `Link` değil `<a>` — hepsi route handler ya da
 * statik dosya.
 *
 * İkonlar veri içinde HAZIR ELEMAN olarak duruyor: map gövdesinde yerel bir
 * değişkeni bileşen gibi kullanmak `react-hooks/static-components` kuralını
 * tetikliyor; modül düzeyinde bir kez üretilen eleman bu sorunu doğurmuyor.
 */
const MAKINE = [
  {
    href: "/llms.txt",
    etiket: "llms.txt",
    aciklama: "Site haritası ve içerik özeti, dil modelleri için düz metin.",
    ikon: <KaynakIkon className="size-[18px]" />,
  },
  {
    href: "/feed.xml",
    etiket: "RSS · Atom · JSON",
    aciklama: "Yayın akışı; üç biçimde de tam metin ve kaynak listesiyle.",
    ikon: <VeriIkon className="size-[18px]" />,
  },
  {
    href: "/api/content",
    etiket: "İçerik API",
    aciklama: "Yayındaki her içerik JSON olarak; anahtar gerektirmez.",
    ikon: <KodIkon className="size-[18px]" />,
  },
  {
    href: "/api/mcp",
    etiket: "MCP uç noktası",
    aciklama: "Model Context Protocol — ajanlar arşive doğrudan bağlanır.",
    ikon: <AjanIkon className="size-[18px]" />,
  },
] as const;

function Sutun({
  baslik,
  maddeler,
}: {
  baslik: string;
  maddeler: readonly { href: string; etiket: string }[];
}) {
  return (
    <nav aria-label={baslik}>
      <h2 className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-murekkep-2">
        {baslik}
      </h2>
      <ul className="mt-4 space-y-2.5">
        {maddeler.map((madde) => (
          <li key={madde.href}>
            <Link
              href={madde.href}
              className="text-sm text-murekkep-2 no-underline transition-colors hover:text-murekkep"
            >
              {madde.etiket}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="mt-[var(--bolum-bosluk)] border-t border-doku">
      {/* ── Makine yüzeyleri: footer'ın manşeti ── */}
      <section
        aria-labelledby="footer-makine"
        className="border-b border-doku bg-kagit-alt/45 py-11"
      >
        <div className="mx-auto max-w-[1280px] px-[var(--gutter)]">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <h2
              id="footer-makine"
              className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-murekkep-2"
            >
              <span aria-hidden className="inline-block size-1.5 rounded-full bg-onay" />
              makine okunabilir yüzeyler
            </h2>
            <p className="font-mono text-[0.65rem] tracking-wider text-murekkep-2">
              kimlik doğrulama yok · tam metin · ücretsiz
            </p>
          </div>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {MAKINE.map((yuzey) => (
              <li key={yuzey.href} className="min-w-0">
                <a
                  href={yuzey.href}
                  className="centik group flex h-full flex-col rounded-lg border border-doku bg-kagit p-4 no-underline transition-colors hover:border-doku-guclu"
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      aria-hidden
                      className="text-murekkep-2 transition-colors group-hover:text-sinyal"
                    >
                      {yuzey.ikon}
                    </span>
                    <span className="text-sm font-medium text-murekkep">{yuzey.etiket}</span>
                  </span>
                  <span className="mt-2.5 text-xs leading-relaxed text-murekkep-2">
                    {yuzey.aciklama}
                  </span>
                  <span className="mt-4 font-mono text-[0.7rem] text-murekkep-2 transition-colors group-hover:text-sinyal">
                    {yuzey.href}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Gezinme ── */}
      <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-12">
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr_1fr]">
          <div className="max-w-[36ch]">
            <p className="font-display text-base font-bold tracking-tight text-murekkep">
              SINAPTIKLAB
              <span aria-hidden className="ml-1.5 inline-block size-1.5 rounded-full bg-sinyal" />
            </p>
            <p className="mt-3 text-sm leading-relaxed text-murekkep-2">
              Yapay zekanın Türkçe teknik kaynağı. Her iddia kaynağına, her uygulama çalışan bir
              repo&apos;ya, her içerik bir sürüm numarasına bağlı.
            </p>
            <Link
              href="/hakkinda"
              className="mt-5 inline-flex items-center gap-1.5 font-mono text-xs text-murekkep-2 no-underline transition-colors hover:text-sinyal"
            >
              nasıl çalışıyoruz
              <OkSagIkon className="size-3.5" />
            </Link>
          </div>

          <Sutun baslik="Keşif" maddeler={KESIF} />
          <Sutun baslik="Kurumsal" maddeler={KURUMSAL} />
          <Sutun baslik="Yasal" maddeler={YASAL} />
        </div>
      </div>

      {/* ── Alt şerit ── */}
      <div className="mx-auto max-w-[1280px] px-[var(--gutter)]">
        <div className="cetvel" aria-hidden />
      </div>
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-6 gap-y-2 px-[var(--gutter)] py-5">
        <p className="font-mono text-xs text-murekkep-2">© 2026 Sinaptiklab</p>
        <a
          href="#tepe"
          className="font-mono text-xs text-murekkep-2 no-underline transition-colors hover:text-sinyal"
        >
          başa dön ↑
        </a>
        <p className="ml-auto font-mono text-[0.65rem] tracking-wider text-murekkep-2">
          kalibrasyon: {env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "yerel"} · {BUILD_TARIHI} · tr
        </p>
      </div>
    </footer>
  );
}
