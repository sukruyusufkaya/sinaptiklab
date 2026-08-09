import Link from "next/link";
import type { CSSProperties } from "react";
import type { TerimOzetDTO } from "@/lib/db/queries/terms";

/**
 * Sözlük vitrini: kanonik Türkçe terminoloji (BRIEF §1.3'ün en büyük
 * farklılaştırıcılarından biri) ana sayfada görünür olur. Terim kartı
 * TR başlık + EN karşılık + tek cümlelik tanım taşır.
 */
export function SozlukVitrini({ terimler }: { terimler: TerimOzetDTO[] }) {
  return (
    <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {terimler.map((terim, sira) => (
        <li key={terim.slug} className="kademe min-w-0" style={{ "--k": sira } as CSSProperties}>
          <Link
            href={`/sozluk/${terim.slug}`}
            className="centik flex h-full flex-col border border-doku bg-kagit-alt p-4 no-underline transition-colors hover:border-sinyal"
          >
            <span className="font-display text-base font-semibold text-murekkep">{terim.tr}</span>
            <span className="mt-0.5 font-mono text-[0.7rem] text-murekkep-2">{terim.en}</span>
            <span className="mt-2.5 text-sm leading-relaxed text-murekkep-2">{terim.shortDef}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
