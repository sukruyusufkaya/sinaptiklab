// BRIEF §6.2 — uyarı kutusu. Dört tip, dört farklı ikon ve renk kodu;
// enstrüman panelindeki durum bildirimleri gibi okunur.
import type { ReactNode } from "react";

type UyariTipi = "dikkat" | "tuzak" | "guvenlik" | "kvkk";

// NOT: `--olcum` (ölçüm sarısı) BRIEF §5.2 gereği yalnız İŞARETLEME rengidir,
// metin rengi değil — açık zeminde 1.3:1 kontrast veriyor (axe ile ölçüldü).
// Tip ayrımı bu yüzden üç kanaldan okunur: sol bordür rengi, işaret glifi ve
// yazılı etiket. Etiket metni her zaman yüksek kontrastlı mürekkeptir.
const TIPLER: Record<UyariTipi, { etiket: string; bordur: string; isaret: string }> = {
  dikkat: { etiket: "dikkat", bordur: "border-l-olcum", isaret: "!" },
  tuzak: { etiket: "tuzak", bordur: "border-l-olcum", isaret: "⚑" },
  guvenlik: { etiket: "güvenlik", bordur: "border-l-uyari", isaret: "⨯" },
  kvkk: { etiket: "kvkk", bordur: "border-l-uyari", isaret: "§" },
};

export function Uyari({ tip = "dikkat", children }: { tip?: UyariTipi; children: ReactNode }) {
  const secim = TIPLER[tip] ?? TIPLER.dikkat;
  return (
    <aside
      role="note"
      className={`my-7 border border-doku border-l-[3px] ${secim.bordur} bg-kagit-alt`}
    >
      <p className="flex items-center gap-2 border-b border-doku px-4 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-murekkep">
        <span aria-hidden className="font-bold">
          {secim.isaret}
        </span>
        {secim.etiket}
      </p>
      <div className="px-4 py-3 text-sm leading-relaxed [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
        {children}
      </div>
    </aside>
  );
}
