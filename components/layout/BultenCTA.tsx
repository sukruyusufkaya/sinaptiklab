// Bülten CTA'sı (BRIEF §6.1/14 — tek, sayfa sonunda, pop-up YOK).
// Kayıt akışı bilinçli olarak kapalı: çift opt-in + KVKK açık rıza altyapısı
// Faz 7'de (Resend) geliyor; o güne dek işlevsiz form basmak yerine dürüst
// "yakında" durumu gösterilir. Tasarım onaylı kablo çerçevesindeki bloktur.
export function BultenCTA() {
  return (
    <aside aria-labelledby="bulten-baslik" className="border-2 border-murekkep bg-kagit-alt p-6">
      <p className="font-mono text-xs tracking-widest text-sinyal">SİNAPTİK SİNYAL</p>
      <h2 id="bulten-baslik" className="mt-2 font-display text-xl font-bold">
        Saha verisiyle beslenen bülten
      </h2>
      <p className="mt-2 max-w-[52ch] text-sm text-murekkep-2">
        Ayda iki kez: yeni derinlemesine içerikler, güncellenen ölçümler ve Türkçe yapay zeka
        ekosisteminden kaynaklı notlar. Reklamsız, devirsiz, tek tıkla iptal.
      </p>
      <p className="mt-4 inline-flex items-center gap-2 border border-doku bg-kagit px-3 py-2 font-mono text-xs text-murekkep-2">
        <span aria-hidden className="inline-block size-2 border border-sinyal" />
        Kayıt, çift onaylı (KVKK uyumlu) altyapıyla birlikte açılacak — yakında.
      </p>
    </aside>
  );
}
