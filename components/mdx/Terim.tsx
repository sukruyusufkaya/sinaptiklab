// BRIEF §6.2/6.4 — sözlük terimi: <Terim slug="gomme-vektoru">gömme vektörü</Terim>
// Şimdilik /sozluk/<slug> linki + dotted alt çizgi; kısa açıklama `title`
// attribute'ünde taşınır. Gerçek tooltip cilası Faz 3/6'da.
import Link from "next/link";
import type { ReactNode } from "react";

export function Terim({
  slug,
  aciklama,
  children,
}: {
  slug: string;
  aciklama?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={`/sozluk/${slug}`}
      title={aciklama}
      className="text-murekkep underline decoration-doku decoration-dotted underline-offset-4 transition-colors hover:text-sinyal hover:decoration-sinyal"
    >
      {children}
    </Link>
  );
}
