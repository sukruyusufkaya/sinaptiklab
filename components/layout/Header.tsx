import Link from "next/link";
import { MobilMenu, type MenuMaddesi } from "./MobilMenu";
import { AraIkon } from "@/components/gorsel";
import { TemaAnahtari } from "./TemaAnahtari";
import { turSayisi } from "@/lib/db/queries/arsiv";
import { ARSIVLI_TURLER, TUR_ARSIV_METNI, turIndeksYolu } from "@/lib/tur-arsivi";

/**
 * Ana gezinme — BRIEF §2.2 URL şeması.
 *
 * Tür bağlantıları YAYINDAKİ İÇERİKTEN türetilir: menüdeki hiçbir madde
 * "Kayıt yok." diyen boş bir arşive gitmez. Boş arşiv zaten `noindex` ve
 * sitemap dışı; gezinmenin de aynı şeyi söylemesi gerekir. İçerik açıldığı
 * an madde kendiliğinden menüye girer, elle iş yok.
 */
const SABIT_NAV: readonly MenuMaddesi[] = [
  { href: "/konu", etiket: "Konular" },
  { href: "/sozluk", etiket: "Sözlük" },
];

/** Menüde görünecek tür arşivleri; en çok üç tanesi (menü şişmesin). */
const MENUDEKI_TUR_ADEDI = 3;

async function gezinmeMaddeleri(): Promise<MenuMaddesi[]> {
  const dolu = (
    await Promise.all(
      ARSIVLI_TURLER.map(async (tur) => {
        try {
          const adet = await turSayisi(tur);
          const yol = turIndeksYolu(tur);
          return adet > 0 && yol !== null
            ? { href: yol, etiket: TUR_ARSIV_METNI[tur].baslik, adet }
            : null;
        } catch {
          return null;
        }
      }),
    )
  )
    .filter((m): m is { href: string; etiket: string; adet: number } => m !== null)
    .sort((a, b) => b.adet - a.adet)
    .slice(0, MENUDEKI_TUR_ADEDI)
    .map(({ href, etiket }) => ({ href, etiket }));

  return [...SABIT_NAV, ...dolu];
}

export async function Header() {
  const nav = await gezinmeMaddeleri();

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
          <span aria-hidden className="inline-block size-2 rounded-[2px] bg-sinyal" />
        </Link>

        {/* Masaüstü gezinme (md+); mobilde çekmeceye düşer */}
        <nav
          aria-label="Ana gezinme"
          className="hidden flex-wrap items-center gap-x-4 gap-y-1 md:flex"
        >
          {nav.map((madde) => (
            <Link
              key={madde.href}
              href={madde.href}
              className="font-mono text-sm text-murekkep no-underline transition-colors hover:text-sinyal"
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
          <MobilMenu maddeler={nav} />
        </div>
      </div>
    </header>
  );
}
