import Link from "next/link";
import type { CSSProperties } from "react";
import type { PillarOzetDTO } from "@/lib/db/queries/topics";

/**
 * Konu yoğunluk haritası: her ana başlığın yayın sayısı yatay çubukla
 * gösterilir — düz çip listesi yerine gerçek bir okuma. Çubuk genişliği
 * en dolu pillar'a göre oranlanır; boş başlıklar dürüstçe "—" gösterir.
 * Salt CSS (transform yok, layout yok): scroll-driven kademe ile gelir.
 */
export function KonuYogunlugu({ pillarlar }: { pillarlar: PillarOzetDTO[] }) {
  const enYuksek = Math.max(...pillarlar.map((p) => p.icerikSayisi), 1);

  return (
    <ul className="mt-8 grid gap-x-10 gap-y-1 lg:grid-cols-2">
      {pillarlar.map((pillar, sira) => {
        const oran = Math.round((pillar.icerikSayisi / enYuksek) * 100);
        return (
          <li key={pillar.slug} className="kademe min-w-0" style={{ "--k": sira } as CSSProperties}>
            <Link
              href={`/konu/${pillar.slug}`}
              className="group grid grid-cols-[2.2rem_minmax(0,1fr)_2.5rem] items-center gap-3 border-b border-doku py-2.5 no-underline"
            >
              <span className="font-mono text-[0.65rem] text-murekkep-2">
                P{String(sira + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-murekkep transition-colors group-hover:text-sinyal">
                  {pillar.title}
                </span>
                {/* yoğunluk çubuğu: zemin + dolu kısım */}
                <span aria-hidden className="mt-1.5 block h-[3px] w-full bg-doku/60">
                  <span
                    className="block h-full bg-sinyal transition-[width] duration-500"
                    style={{ width: `${oran}%` }}
                  />
                </span>
              </span>
              <span className="text-right font-mono text-xs tabular-nums text-murekkep-2">
                {pillar.icerikSayisi > 0 ? pillar.icerikSayisi : "—"}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
