// İçerik özet kartı — ana sayfa "Son yayınlar" akışı ve liste sayfaları.
// RSC; IcerikOzetDTO alır, başlık türün rotasına lib/rotalar ile bağlanır.
// Görsel dil (ADR 0010): üst çubukta tür ikonu + etiket + kayıt numarası;
// hover'da yumuşak yükselti (.centik) ve kenar belirginleşmesi.
import Link from "next/link";
import { TurIkon } from "@/components/gorsel";
import type { IcerikOzetDTO } from "@/lib/db/queries/dto";
import { icerikYolu, seviyeEtiketi, turEtiketi } from "@/lib/rotalar";

const TARIH_TR = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" });

export function IcerikKarti({ icerik, sira }: { icerik: IcerikOzetDTO; sira?: number }) {
  const tarih = TARIH_TR.format(new Date(icerik.publishedAt ?? icerik.updatedAt));

  return (
    <article className="centik group flex h-full flex-col border border-doku rounded-lg bg-kagit-alt transition-colors hover:border-doku-guclu">
      <div className="flex items-baseline justify-between border-b border-doku px-5 py-2.5">
        <p className="flex items-center gap-2 font-mono text-[0.65rem] tracking-[0.18em] text-sinyal">
          <TurIkon tur={icerik.type} className="size-[15px]" />
          {turEtiketi(icerik.type).toLocaleUpperCase("tr-TR")}
        </p>
        {sira !== undefined && (
          <p aria-hidden className="font-mono text-[0.65rem] text-murekkep-2">
            {String(sira).padStart(2, "0")}
          </p>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold leading-snug">
          <Link
            href={icerikYolu(icerik.type, icerik.slug)}
            className="text-murekkep no-underline transition-colors hover:text-sinyal focus-visible:text-sinyal"
          >
            {icerik.title}
          </Link>
        </h3>
        <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-murekkep-2">{icerik.dek}</p>
        <p className="mt-auto flex flex-wrap items-center gap-x-2 pt-5 font-mono text-[0.7rem] text-murekkep-2">
          <span className="border border-doku rounded-md px-1.5 py-0.5">
            {seviyeEtiketi(icerik.level)}
          </span>
          <span>{icerik.readingMinutes} dk</span>
          <span aria-hidden>·</span>
          <time>{tarih}</time>
        </p>
      </div>
    </article>
  );
}
