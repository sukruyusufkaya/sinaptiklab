"use client";

// Panoya kopyalama zorunlu olarak etkileşimli — tek "use client" yaprağı.
// Kopyalanacak metin ya `metin` prop'uyla verilir ya da en yakın
// [data-kopyalanabilir] atasının içindeki [data-kopya-icerik] düğümünden okunur.
import { useEffect, useRef, useState } from "react";

export function KopyalaButonu({ metin }: { metin?: string }) {
  const dugmeRef = useRef<HTMLButtonElement | null>(null);
  const zamanlayiciRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [kopyalandi, setKopyalandi] = useState(false);

  // Yalnız temizlik (unmount'ta zamanlayıcıyı iptal) — veri çekme yok.
  useEffect(() => {
    return () => {
      if (zamanlayiciRef.current !== null) clearTimeout(zamanlayiciRef.current);
    };
  }, []);

  async function kopyala() {
    const kap = dugmeRef.current?.closest("[data-kopyalanabilir]");
    const icerik = metin ?? kap?.querySelector("[data-kopya-icerik]")?.textContent ?? "";
    if (icerik.length === 0) return;
    try {
      await navigator.clipboard.writeText(icerik.trim());
      setKopyalandi(true);
      if (zamanlayiciRef.current !== null) clearTimeout(zamanlayiciRef.current);
      zamanlayiciRef.current = setTimeout(() => setKopyalandi(false), 2000);
    } catch {
      // Pano izni reddedildi — sessizce geç, buton durumunu değiştirme.
    }
  }

  return (
    <button
      ref={dugmeRef}
      type="button"
      onClick={kopyala}
      className="border border-doku rounded-md bg-kagit px-2 py-0.5 font-mono text-xs text-murekkep-2 transition-colors hover:border-sinyal hover:text-sinyal"
    >
      <span aria-live="polite">{kopyalandi ? "Kopyalandı" : "Kopyala"}</span>
    </button>
  );
}
