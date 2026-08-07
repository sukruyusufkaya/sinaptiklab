"use client";

/**
 * Tema anahtarı. İkon görünürlüğü tamamen CSS ile ([data-theme] + media query,
 * bkz. globals.css) yönetilir; bileşen durum tutmaz → hydration uyuşmazlığı yok.
 */
export function TemaAnahtari() {
  function temayiDegistir() {
    const kok = document.documentElement;
    const acik = kok.getAttribute("data-theme");
    const mevcut =
      acik === "dark" || acik === "light"
        ? acik
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    const yeni = mevcut === "dark" ? "light" : "dark";
    kok.setAttribute("data-theme", yeni);
    try {
      localStorage.setItem("tema", yeni);
    } catch {
      /* gizli modda sessiz geç */
    }
  }

  return (
    <button
      type="button"
      onClick={temayiDegistir}
      aria-label="Açık ve koyu tema arasında geçiş yap"
      className="flex size-8 items-center justify-center border border-doku text-murekkep-2 hover:border-sinyal hover:text-sinyal"
    >
      {/* ay: açık temada görünür (koyuya geçirir) */}
      <svg className="tema-ay" width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
        <path
          d="M13 9.5A6 6 0 0 1 5.5 2 6 6 0 1 0 13 9.5Z"
          stroke="currentColor"
          strokeWidth="1.2"
          fill="none"
        />
      </svg>
      {/* güneş: koyu temada görünür (açığa geçirir) */}
      <svg
        className="tema-gunes"
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        aria-hidden
      >
        <circle cx="7.5" cy="7.5" r="3" stroke="currentColor" strokeWidth="1.2" />
        <path
          d="M7.5 0v2M7.5 13v2M0 7.5h2M13 7.5h2M2.2 2.2l1.4 1.4M11.4 11.4l1.4 1.4M12.8 2.2l-1.4 1.4M3.6 11.4l-1.4 1.4"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </svg>
    </button>
  );
}
