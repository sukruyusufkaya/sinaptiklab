// BRIEF §6.2/§6.4 — sözlük terimi bağlantısı. Gövde akışını bozmadan
// "bu bir kanonik terim" sinyali verir: noktalı alt çizgi + hover'da sinyal
// rengi. Sözlük sayfası Faz 6'da açıldı; tooltip yerine gerçek sayfaya gider.
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
      className="text-murekkep underline decoration-doku decoration-dotted decoration-1 underline-offset-[3px] transition-colors hover:text-sinyal hover:decoration-sinyal focus-visible:text-sinyal"
    >
      {children}
    </Link>
  );
}
