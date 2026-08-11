"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

export interface MenuMaddesi {
  href: string;
  etiket: string;
}

/**
 * Mobil gezinme çekmecesi. Masaüstünde gizlidir (nav yatay sığar).
 * Erişilebilirlik: aria-expanded/aria-controls, Escape ile kapanır, açılınca
 * ilk bağlantıya odaklanır, rota değişince kendini kapatır.
 */
export function MobilMenu({ maddeler }: { maddeler: readonly MenuMaddesi[] }) {
  const [acik, setAcik] = useState(false);
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);

  // NOT: rota değişimini effect ile dinleyip setState yapmıyoruz (effect
  // içinde senkron setState kaskad render tetikler); menü doğrudan
  // bağlantı tıklamasında kapanıyor — gezinme zaten o tıklamayla başlıyor.

  // Escape ile kapan
  useEffect(() => {
    if (!acik) return;
    const dinle = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAcik(false);
    };
    document.addEventListener("keydown", dinle);
    return () => document.removeEventListener("keydown", dinle);
  }, [acik]);

  // Açılınca panelin ilk bağlantısına odaklan
  useEffect(() => {
    if (acik) panelRef.current?.querySelector("a")?.focus();
  }, [acik]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={acik}
        aria-controls={panelId}
        aria-label={acik ? "Menüyü kapat" : "Menüyü aç"}
        onClick={() => setAcik((o) => !o)}
        className="flex size-9 items-center justify-center border border-doku rounded-md text-murekkep-2 transition-colors hover:border-sinyal hover:text-sinyal"
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
          {acik ? (
            <path d="M3 3L12 12M12 3L3 12" stroke="currentColor" strokeWidth="1.4" />
          ) : (
            <path d="M2 4h11M2 7.5h11M2 11h11" stroke="currentColor" strokeWidth="1.4" />
          )}
        </svg>
      </button>

      {acik && (
        <div
          id={panelId}
          ref={panelRef}
          className="absolute inset-x-0 top-full border-b border-doku bg-kagit shadow-none"
        >
          <nav
            aria-label="Mobil gezinme"
            className="mx-auto max-w-[1280px] px-[var(--gutter)] py-2"
          >
            <ul>
              {maddeler.map((madde) => (
                <li key={madde.href} className="border-b border-doku last:border-b-0">
                  <Link
                    href={madde.href}
                    onClick={() => setAcik(false)}
                    className="flex items-center justify-between py-3 font-mono text-sm text-murekkep no-underline"
                  >
                    {madde.etiket}
                  </Link>
                </li>
              ))}
              <li className="border-t border-doku">
                <Link
                  href="/ara"
                  onClick={() => setAcik(false)}
                  className="flex items-center gap-2 py-3 font-mono text-sm text-murekkep no-underline"
                >
                  Ara
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
