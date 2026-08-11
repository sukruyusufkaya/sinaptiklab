import Link from "next/link";
import { OkSagIkon } from "@/components/gorsel";
import { yayindakiIcerikListesi } from "@/lib/db/queries/contents";

const TARIH_TR = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" });

/**
 * Alt şeritte eskiden `kalibrasyon: <commit sha> · <build tarihi>` yazıyordu.
 * Commit özeti ve build damgası GELİŞTİRİCİ bilgisidir; canlı sitede okura
 * hiçbir şey söylemez, "burası hâlâ bir test ortamı" izlenimi verir. Yerine
 * okurun umursadığı ve markanın iddiasıyla örtüşen tek tarih konuldu:
 * arşivin en son ne zaman güncellendiği.
 */
async function sonGuncellemeMetni(): Promise<string | null> {
  try {
    const liste = await yayindakiIcerikListesi({ adet: 1 });
    const ilk = liste[0];
    return ilk === undefined ? null : TARIH_TR.format(new Date(ilk.updatedAt));
  } catch {
    return null;
  }
}

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

export async function Footer() {
  const sonGuncelleme = await sonGuncellemeMetni();

  return (
    <footer className="mt-[var(--bolum-bosluk)] border-t border-doku">
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
              className="ok-kayar mt-5 inline-flex items-center gap-1.5 font-mono text-xs text-murekkep-2 no-underline transition-colors hover:text-sinyal"
            >
              nasıl çalışıyoruz
              <OkSagIkon className="ok size-3.5" />
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
        {sonGuncelleme !== null && (
          <p className="ml-auto font-mono text-[0.65rem] tracking-wider text-murekkep-2">
            arşiv son güncelleme: {sonGuncelleme}
          </p>
        )}
      </div>
    </footer>
  );
}
