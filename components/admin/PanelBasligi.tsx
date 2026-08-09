import type { ReactNode } from "react";

/**
 * Panel başlığı — her admin sayfasının üst şeridi: milimetrik zemin, HUD köşe
 * braketleri, § indeks damgası ve isteğe bağlı `.veri-rayi` okuma satırı.
 * Konsolun "cihaz paneli" dilini sayfa ölçeğinde tekrarlar (ADR 0008).
 * Server bileşen: hiçbir durum tutmaz, yalnız düzen.
 */
interface Props {
  /** § damgası — büyük harfe çevrilir (ör. "içerik envanteri"). */
  indeks: string;
  baslik: string;
  aciklama?: ReactNode;
  /** Sağ üstteki eylem alanı (düğmeler, bağlantılar). */
  aksiyon?: ReactNode;
  /** Başlığın altındaki okuma satırı — genelde `.veri-rayi`. */
  children?: ReactNode;
}

export function PanelBasligi({ indeks, baslik, aciklama, aksiyon, children }: Props) {
  return (
    <section className="mm-zemin relative border-b border-doku">
      <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-8">
        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
          <div className="min-w-0">
            <p className="bolum-indeks uppercase">§ {indeks}</p>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight [font-stretch:94%]">
              {baslik}
            </h1>
            {aciklama !== undefined && (
              <div className="mt-3 max-w-[var(--govde-olcu)] text-sm leading-relaxed text-murekkep-2">
                {aciklama}
              </div>
            )}
          </div>
          {aksiyon !== undefined && <div className="shrink-0">{aksiyon}</div>}
        </div>
        {children}
      </div>
    </section>
  );
}
