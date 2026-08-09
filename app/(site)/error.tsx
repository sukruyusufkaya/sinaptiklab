"use client";

import Link from "next/link";
import { useEffect } from "react";
import { HataGorseli } from "@/components/gorsel";

/**
 * Site tarafı hata sınırı (BRIEF §12.3/§9). Sunucu hatası, DB kesintisi ya
 * da render hatası burada yakalanır; kullanıcı boş ekranla karşılaşmaz.
 * Sentry Faz 9'da bağlanacak — şimdilik hata konsola düşer (digest ile
 * sunucu günlüğünden eşleştirilebilir).
 */
export default function SiteHatasi({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Site hatası:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-20">
      <div className="max-w-[60ch] border border-doku rounded-lg bg-kagit-alt p-8">
        <HataGorseli className="h-auto w-44 text-murekkep-2" />
        <p className="mt-6 flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-uyari">
          <span aria-hidden className="inline-block size-1.5 rounded-full bg-uyari" />
          ölçüm kesintisi · sunucu hatası
        </p>
        <h1 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight">
          Bu sayfa şu an yüklenemedi.
        </h1>
        <p className="mt-4 leading-relaxed text-murekkep-2">
          Geçici bir sorun oluştu; içerik kaybolmadı. Sayfayı yeniden deneyebilir ya da başka bir
          bölüme geçebilirsiniz. Sorun sürerse hata kodunu iletirseniz kaydı hızla bulabiliriz.
        </p>
        {error.digest !== undefined && (
          <p className="mt-4 border border-doku rounded-md bg-kagit px-3 py-2 font-mono text-xs text-murekkep-2">
            hata kodu: {error.digest}
          </p>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={reset} className="dugme-birincil">
            Yeniden dene <span aria-hidden>↻</span>
          </button>
          <Link href="/" className="dugme-cerceve">
            Ana sayfa
          </Link>
          <Link href="/iletisim" className="dugme-cerceve">
            Bildir
          </Link>
        </div>
      </div>
    </div>
  );
}
