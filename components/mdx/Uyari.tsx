// BRIEF §6.2 — uyarı bloğu: <Uyari tip="dikkat|tuzak|guvenlik|kvkk">
// Sol kalın bordür: dikkat/tuzak ölçüm sarısı, guvenlik/kvkk uyarı kırmızısı.
import type { ReactNode } from "react";

const TIPLER = {
  dikkat: { etiket: "DİKKAT", bordur: "border-olcum" },
  tuzak: { etiket: "TUZAK", bordur: "border-olcum" },
  guvenlik: { etiket: "GÜVENLİK", bordur: "border-uyari" },
  kvkk: { etiket: "KVKK", bordur: "border-uyari" },
} as const;

export type UyariTipi = keyof typeof TIPLER;

export function Uyari({ tip = "dikkat", children }: { tip?: UyariTipi; children: ReactNode }) {
  const secim = TIPLER[tip];
  return (
    <aside role="note" className={`my-6 border-l-4 ${secim.bordur} bg-kagit-alt px-4 py-3`}>
      <span className="font-mono text-xs tracking-widest text-murekkep-2">{secim.etiket}</span>
      <div className="mt-1 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">{children}</div>
    </aside>
  );
}
