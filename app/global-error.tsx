"use client";

/**
 * Kök hata sınırı: kök layout'un kendisi patlarsa devreye girer, bu yüzden
 * kendi <html>/<body>'sini kurar ve token'lara güvenemez (globals.css
 * yüklenmemiş olabilir). Bilinçli olarak inline stil kullanan TEK dosyadır —
 * §14/3 istisnası gerekçesiyle burada belgelidir.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="tr">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f1f2ed",
          color: "#12161b",
          fontFamily: "ui-monospace, monospace",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: "52ch", border: "1px solid #c9ccc3", padding: "2rem" }}>
          <p style={{ margin: 0, fontSize: "0.75rem", letterSpacing: "0.2em", color: "#b4341c" }}>
            KRİTİK HATA
          </p>
          <h1 style={{ margin: "1rem 0 0", fontSize: "1.5rem", lineHeight: 1.2 }}>
            Sinaptiklab şu an yüklenemiyor.
          </h1>
          <p style={{ margin: "1rem 0 0", lineHeight: 1.6, color: "#4a5158" }}>
            Beklenmeyen bir hata oluştu. Sayfayı yenilemeyi deneyin; sorun sürerse
            ee.sukruyusufkaya@gmail.com adresine hata kodunu iletin.
          </p>
          {error.digest !== undefined && (
            <p style={{ margin: "1rem 0 0", fontSize: "0.75rem", color: "#4a5158" }}>
              hata kodu: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              background: "#1b3bff",
              color: "#f1f2ed",
              border: "1px solid #1b3bff",
              padding: "0.625rem 1.25rem",
              font: "inherit",
              cursor: "pointer",
            }}
          >
            Yeniden dene
          </button>
        </div>
      </body>
    </html>
  );
}
