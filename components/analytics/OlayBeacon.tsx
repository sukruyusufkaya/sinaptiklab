"use client";

import { useEffect } from "react";

/**
 * Referrer beacon'ı (BRIEF §8.5): sayfa açılışında DIŞ referrer varsa
 * /api/olay'a tek atımlık kayıt gönderir (YZ görünürlük segmentasyonu).
 * Not: buradaki useEffect veri ÇEKMEZ (BRIEF §14/5 kapsamı dışı) —
 * fire-and-forget telemetri gönderimidir; sendBeacon render'ı bloklamaz.
 * Çerez/kimlik yok; yalnız yol + referrer host'u (KVKK minimalizmi).
 */
export function OlayBeacon() {
  useEffect(() => {
    try {
      if (document.referrer === "") return;
      const referrer = new URL(document.referrer);
      if (referrer.host === window.location.host) return;
      const veri = JSON.stringify({
        path: window.location.pathname,
        referrerHost: referrer.host,
      });
      navigator.sendBeacon("/api/olay", new Blob([veri], { type: "application/json" }));
    } catch {
      /* telemetri sessiz */
    }
  }, []);

  return null;
}
