import { DURUM_ETIKETLERI, type Durum } from "@/lib/editorial/durum-makinesi";

// Tek durum sözlüğü (DURUM_ETIKETLERI) + panel genelinde tek rozet görünümü:
// renkli LED noktası + mono etiket (enstrüman dili). Renk tek başına anlam
// taşımaz — etiket her zaman yazılıdır (BRIEF §9.2).
// "use client" YOK: hem server (liste) hem client (editör alt barı) kullanır.
const DURUM_RENGI: Record<Durum, string> = {
  draft: "text-murekkep-2",
  in_review: "text-olcum",
  scheduled: "text-sinyal",
  published: "text-onay",
  archived: "text-murekkep-2",
};

const DURUM_NOKTASI: Record<Durum, string> = {
  draft: "bg-murekkep-2",
  in_review: "bg-olcum",
  scheduled: "bg-sinyal",
  published: "bg-onay",
  archived: "bg-doku",
};

export function DurumRozeti({ durum }: { durum: Durum }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap border border-doku rounded-md px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.14em] ${DURUM_RENGI[durum]}`}
    >
      <span aria-hidden className={`inline-block size-1.5 shrink-0 ${DURUM_NOKTASI[durum]}`} />
      {DURUM_ETIKETLERI[durum]}
    </span>
  );
}
