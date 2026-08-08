"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Uzun kod bloğu genişletici (BRIEF §6.3): .shiki max-height'ı aşıyorsa
 * altta "Genişlet" düğmesi gösterir; açınca sınır kalkar (.kod-acik —
 * globals.css). Kısa bloklarda hiç görünmez.
 */
export function KodGenislet({ children }: { children: ReactNode }) {
  const kapRef = useRef<HTMLDivElement | null>(null);
  const [tasiyor, setTasiyor] = useState(false);
  const [acik, setAcik] = useState(false);

  useEffect(() => {
    const pre = kapRef.current?.querySelector(".shiki");
    if (pre instanceof HTMLElement && pre.scrollHeight > pre.clientHeight + 4) {
      setTasiyor(true);
    }
  }, []);

  return (
    <div ref={kapRef} className={acik ? "kod-acik" : undefined}>
      {children}
      {tasiyor && (
        <button
          type="button"
          aria-expanded={acik}
          onClick={() => setAcik(!acik)}
          className="block w-full border-t border-doku bg-kagit-alt py-1.5 font-mono text-xs text-murekkep-2 hover:text-sinyal"
        >
          {acik ? "▲ Daralt" : "▼ Genişlet"}
        </button>
      )}
    </div>
  );
}
