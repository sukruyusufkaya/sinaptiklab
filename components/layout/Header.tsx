import Link from "next/link";
import { MobilMenu, type MenuMaddesi } from "./MobilMenu";
import { AraIkon } from "@/components/gorsel";
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
    // id="tepe": footer'daki "başa dön" çapası buraya döner
    <header
      id="tepe"
      className="sticky top-0 z-30 border-b border-doku bg-kagit/85 backdrop-blur-sm"
    >
      {/* Okuma ilerlemesi: sayfanın kaydırma ilerlemesine bağlı şerit.
          Kaydırma güdümlü CSS animasyonu — JS yok, scroll dinleyicisi yok,
          yalnız `transform: scaleX` (compositor'da koşar). Header'ın kendi
          alt kenarına oturur, böylece sabit bir yükseklik tahmini gerekmez.
          Salt dekoratif: aria-hidden. */}
      <span
        aria-hidden
        className="ilerleme-seridi pointer-events-none absolute inset-x-0 bottom-[-1px] block h-px origin-left bg-sinyal"
      />
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
              // Hazır olmayan modüller SOLDURULARAK değil, bir kademe daha
              // sönük TOKEN ile ayrışır. Opaklıkla soldurmak (eskiden /70)
              // kontrastı 3.07:1'e düşürüyordu — AA sınırının altı. İki
              // durum da erişilebilir kalmalı, hiyerarşi yine okunuyor.
              className={`font-mono text-sm no-underline transition-colors hover:text-sinyal ${
                madde.hazir ? "text-murekkep" : "text-murekkep-2"
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
            className="flex items-center gap-2 rounded-md border border-doku bg-kagit-alt px-3 py-1.5 font-mono text-xs text-murekkep-2 no-underline transition-colors hover:border-doku-guclu hover:text-sinyal"
          >
            <AraIkon className="size-4" />
            <span className="max-sm:hidden">ara</span>
          </Link>
          <TemaAnahtari />
          <Link
            href="/giris"
            prefetch={false}
            className="font-mono text-sm text-murekkep-2 no-underline transition-colors hover:text-sinyal max-lg:hidden"
          >
            Giriş
          </Link>
          <MobilMenu maddeler={NAV} />
        </div>
      </div>
    </header>
  );
}
