import { BultenIkon, VeriIkon } from "@/components/gorsel";

// Bülten CTA'sı (BRIEF §6.1/14 — tek, sayfa sonunda, pop-up YOK).
//
// E-posta kaydı hâlâ kapalı (çift opt-in + KVKK açık rıza altyapısı gelmedi)
// ve işlevsiz form basmak §14 yasağı. Ama yalnız "yakında" demek okuyucuyu
// çıkmaza sokuyordu: site canlıya çıkarken tek eylem çağrısının ölü olması
// kabul edilemez. Bugün ÇALIŞAN abonelik yolu feed'lerdir — asıl eylem o,
// e-posta ise ikincil bir not.
const AKISLAR = [
  { href: "/feed.xml", etiket: "RSS" },
  { href: "/atom.xml", etiket: "Atom" },
  { href: "/feed.json", etiket: "JSON Feed" },
] as const;

export function BultenCTA() {
  return (
    <aside
      aria-labelledby="bulten-baslik"
      className="rounded-xl border border-doku bg-kagit-alt p-6 shadow-y1 sm:p-8"
    >
      <p className="flex items-center gap-2 font-mono text-xs tracking-widest text-sinyal">
        <BultenIkon className="size-4" />
        SİNAPTİK SİNYAL
      </p>
      <h2 id="bulten-baslik" className="mt-3 font-display text-xl font-bold">
        Yeni yayınları kaçırmayın
      </h2>
      <p className="mt-2 max-w-[54ch] text-sm leading-relaxed text-murekkep-2">
        Her yeni içerik, güncellenen ölçüm ve sürüm notu akışa düşer. Reklamsız, takip etiketi yok,
        kayıt gerekmez — okuyucunuza ekleyin, yeter.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {AKISLAR.map((akis) => (
          <a
            key={akis.href}
            href={akis.href}
            className="inline-flex items-center gap-2 rounded-md border border-doku bg-kagit px-3 py-2 font-mono text-xs text-murekkep no-underline transition-colors hover:border-doku-guclu hover:text-sinyal"
          >
            <VeriIkon className="size-3.5" />
            {akis.etiket}
          </a>
        ))}
      </div>

      <p className="mt-4 max-w-[54ch] font-mono text-[0.7rem] leading-relaxed text-murekkep-2">
        E-posta bülteni ayda iki kez çıkacak; kayıt, çift onaylı ve KVKK uyumlu altyapı hazır
        olduğunda açılır. O güne kadar yarım bir form göstermiyoruz.
      </p>
    </aside>
  );
}
