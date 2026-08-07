"use client";

// BRIEF §6.2 — lite-youtube yaklaşımı, üçüncü parti script YOK (paket de yok,
// kendi implementasyonumuz). Tıklanana dek yalnız img.youtube.com kapağı +
// oynat düğmesi; tıklanınca youtube-nocookie iframe'i yüklenir.
import { useState } from "react";

export function Video({ videoId, baslik }: { videoId: string; baslik: string }) {
  const [aktif, setAktif] = useState(false);

  if (aktif) {
    return (
      <div className="my-6 aspect-video w-full border border-doku">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
          title={baslik}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full border-0"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setAktif(true)}
      aria-label={`Videoyu oynat: ${baslik}`}
      className="group relative my-6 block aspect-video w-full cursor-pointer overflow-hidden border border-doku bg-kagit-alt p-0"
    >
      {/* Kapak üçüncü parti alan adından geldiği için next/image yerine img;
          next.config remotePatterns yapılandırması Faz 3'te ele alınacak. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
        alt={baslik}
        loading="lazy"
        className="h-full w-full object-cover"
      />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-14 w-14 items-center justify-center border-2 border-kagit bg-murekkep/80 text-kagit transition-colors group-hover:bg-sinyal">
          <svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
    </button>
  );
}
