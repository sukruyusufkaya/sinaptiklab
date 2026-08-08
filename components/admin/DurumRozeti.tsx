import { DURUM_ETIKETLERI, type Durum } from "@/lib/editorial/durum-makinesi";

// Tek durum sözlüğü (DURUM_ETIKETLERI) + panel genelinde tek rozet görünümü.
// "use client" YOK: hem server (liste) hem client (editör alt barı) kullanır.
const DURUM_RENGI: Record<Durum, string> = {
  draft: "text-murekkep-2",
  in_review: "text-sinyal",
  scheduled: "text-sinyal",
  published: "text-onay",
  archived: "text-murekkep-2",
};

export function DurumRozeti({ durum }: { durum: Durum }) {
  return (
    <span
      className={`inline-block border border-doku px-2 py-0.5 font-mono text-xs ${DURUM_RENGI[durum]}`}
    >
      {DURUM_ETIKETLERI[durum]}
    </span>
  );
}
