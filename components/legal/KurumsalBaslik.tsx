// Kurumsal/yasal sayfaların ortak başlık bloğu: milimetrik tezgâh zemini,
// § indeks damgası, H1, spot ve mono okuma rayı (BRIEF §5.5 deseni;
// /konu başlığıyla aynı ritim). HUD braketleri sayfayı "panel" olarak çerçeveler.
import type { ReactNode } from "react";

export interface BaslikRayi {
  readonly etiket: string;
  readonly deger: string;
}

interface Props {
  /** `.bolum-indeks` damgası; "§" işaretini bileşen basar. */
  indeks: string;
  baslik: string;
  spot: string;
  /** Mono okuma rayı: son güncelleme, kapsam, durum… */
  raylar: readonly BaslikRayi[];
  /** Spotun hemen altında görünen not — yasal sayfalarda taslak uyarısı. */
  not?: ReactNode;
}

export function KurumsalBaslik({ indeks, baslik, spot, raylar, not }: Props) {
  return (
    <section className="mm-zemin relative border-b border-doku">
      <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-14">
        <p className="bolum-indeks uppercase">§ {indeks}</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight [font-stretch:94%]">
          {baslik}
        </h1>
        <p className="mt-4 max-w-[var(--govde-olcu)] leading-relaxed text-murekkep-2">{spot}</p>
        {not !== undefined && <div className="mt-7 max-w-[var(--govde-olcu)]">{not}</div>}
        {raylar.length > 0 && (
          <div className="veri-rayi mt-7 max-w-3xl bg-kagit">
            {raylar.map((ray) => (
              <div key={ray.etiket}>
                {ray.etiket}
                <br />
                <span className="deger">{ray.deger}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
