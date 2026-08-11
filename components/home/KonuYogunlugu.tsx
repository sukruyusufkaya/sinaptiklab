import Link from "next/link";
import { pillarIkonu } from "@/components/gorsel";
import type { PillarOzetDTO } from "@/lib/db/queries/topics";

/**
 * Konu yoğunluk haritası: her ana başlığın yayın sayısı yatay çubukla
 * gösterilir — düz çip listesi yerine gerçek bir okuma. Çubuk genişliği
 * en dolu pillar'a göre oranlanır; boş başlıklar dürüstçe "—" gösterir.
 *
 * Satırlar kart DEĞİL: on iki kart bu ölçekte gürültü olurdu. Bunun yerine
 * satır yüksekliği, ikon kutusu ve sayı büyütülüp aralarına gerçek nefes
 * konuldu; hover'da zemin belirir. Böylece liste hem tarama hem karşılaştırma
 * için okunur kalıyor.
 *
 * Dolum animasyonu on iki ayrı `view()` yerine listenin TEK adlandırılmış
 * çizelgesini paylaşır (bkz. `.yogunluk-liste`, globals.css) — kaydırma
 * güdümlü çizelge SAYISI doğrudan Style&Layout maliyetine yazılıyor.
 */
export function KonuYogunlugu({ pillarlar }: { pillarlar: PillarOzetDTO[] }) {
  const enYuksek = Math.max(...pillarlar.map((p) => p.icerikSayisi), 1);

  return (
    <ul className="yogunluk-liste mt-8 grid gap-x-10 gap-y-0.5 lg:grid-cols-2">
      {pillarlar.map((pillar) => {
        const oran = Math.round((pillar.icerikSayisi / enYuksek) * 100);
        const Ikon = pillarIkonu(pillar.slug);
        const bos = pillar.icerikSayisi === 0;
        return (
          <li key={pillar.slug} className="min-w-0">
            <Link
              href={`/konu/${pillar.slug}`}
              className="group grid grid-cols-[2.75rem_minmax(0,1fr)_3rem] items-center gap-4 rounded-lg border-b border-doku px-2 py-3.5 no-underline transition-colors hover:border-doku-guclu hover:bg-kagit-alt"
            >
              {/* Pillar ikonu: dekoratif; anlamı yandaki başlık taşır */}
              <span className="flex size-11 items-center justify-center rounded-lg border border-doku bg-kagit-alt text-murekkep-2 transition-colors group-hover:border-doku-guclu group-hover:text-sinyal">
                <Ikon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[0.95rem] font-medium text-murekkep transition-colors group-hover:text-sinyal">
                  {pillar.title}
                </span>
                {/* yoğunluk çubuğu: zemin + dolu kısım */}
                <span aria-hidden className="mt-2 block h-1 w-full rounded-full bg-doku">
                  <span
                    className="olcu-dolum block h-full rounded-full bg-sinyal"
                    style={{ width: `${oran}%` }}
                  />
                </span>
              </span>
              <span className="text-right">
                <span
                  className={`block font-display text-lg font-bold tabular-nums ${
                    bos ? "text-murekkep-2" : "text-murekkep"
                  }`}
                >
                  {bos ? "—" : pillar.icerikSayisi}
                </span>
                <span className="mt-0.5 block font-mono text-[0.6rem] uppercase tracking-wider text-murekkep-2">
                  {bos ? "hazırlanıyor" : "yayın"}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
