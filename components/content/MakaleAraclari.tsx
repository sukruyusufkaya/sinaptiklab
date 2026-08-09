"use client";

import { useState } from "react";

/**
 * Makale araç çubuğu. "Markdown kopyala" markanın GEO tezinin görünür
 * yüzüdür: her içeriğin `.md` sürümü herkese açıktır (BRIEF §8.1), okuyucu
 * da ajanı da aynı ham metni alabilir. Paylaşım için üçüncü parti script
 * YOK (§14/6): Web Share API varsa o, yoksa bağlantı kopyalanır.
 */
export function MakaleAraclari({ yol, baslik }: { yol: string; baslik: string }) {
  const [durum, setDurum] = useState<string | null>(null);

  function bildir(mesaj: string) {
    setDurum(mesaj);
    setTimeout(() => setDurum(null), 2500);
  }

  async function markdownKopyala() {
    try {
      const yanit = await fetch(`${yol}.md`);
      if (!yanit.ok) throw new Error(String(yanit.status));
      await navigator.clipboard.writeText(await yanit.text());
      bildir("Markdown panoya kopyalandı");
    } catch {
      bildir("Kopyalanamadı — .md bağlantısını elle açabilirsiniz");
    }
  }

  async function paylas() {
    const adres = window.location.href;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: baslik, url: adres });
        return;
      }
      await navigator.clipboard.writeText(adres);
      bildir("Bağlantı panoya kopyalandı");
    } catch {
      /* kullanıcı iptal etti — sessiz */
    }
  }

  const dugme =
    "flex items-center gap-1.5 border border-doku rounded-md px-2.5 py-1.5 font-mono text-[0.7rem] text-murekkep-2 transition-colors hover:border-sinyal hover:text-sinyal";

  return (
    <div className="mt-6 flex max-w-[var(--govde-olcu)] flex-wrap items-center gap-2 print:hidden">
      <button type="button" onClick={markdownKopyala} className={dugme}>
        <span aria-hidden>⤓</span> Markdown kopyala
      </button>
      <a href={`${yol}.md`} className={`${dugme} no-underline`}>
        <span aria-hidden>◱</span> .md görüntüle
      </a>
      <button type="button" onClick={paylas} className={dugme}>
        <span aria-hidden>↗</span> Paylaş
      </button>
      <button type="button" onClick={() => window.print()} className={dugme}>
        <span aria-hidden>⎙</span> Yazdır
      </button>
      <span aria-live="polite" className="font-mono text-[0.7rem] text-onay">
        {durum}
      </span>
    </div>
  );
}
