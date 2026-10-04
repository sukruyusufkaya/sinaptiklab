'use client';

import { useState } from 'react';

/**
 * Köşe yazısının paylaşım ve alıntı araçları.
 *
 * Sunucuda üretilen iki metin (kalıcı adres ve kaynakça satırı) burada yalnızca
 * PANOYA KOPYALANIR; hesaplanmaz. Paylaşım bağlantıları sıradan `<a>`dır:
 * betik kapalıyken de çalışır ve üçüncü taraf betiği yüklemez (izleme yok).
 *
 * "Kopyalandı" durumu tıklama olayında kurulur, effect'te değil (değişmez
 * kural 3). İki saniye sonra kendiliğinden geri döner.
 */
export function KoseAraclari({
  adres,
  baslik,
  kaynakca,
}: {
  adres: string;
  baslik: string;
  kaynakca: string;
}) {
  const [kopyalanan, setKopyalanan] = useState<'adres' | 'kaynakca' | null>(null);

  async function kopyala(tur: 'adres' | 'kaynakca') {
    try {
      await navigator.clipboard.writeText(tur === 'adres' ? adres : kaynakca);
      setKopyalanan(tur);
      window.setTimeout(() => setKopyalanan(null), 2000);
    } catch {
      // Pano izni yoksa sessizce geçilir; metin aşağıda zaten seçilebilir durumda.
    }
  }

  const kodlanmisAdres = encodeURIComponent(adres);
  const kodlanmisBaslik = encodeURIComponent(baslik);

  return (
    <div className="rounded-xl border border-kenar bg-yuzey/40 p-5">
      <p className="etiket-mono mb-3 text-metin-soluk">Paylaş ve alıntıla</p>

      <div className="grid grid-cols-3 gap-2">
        <a
          href={`https://x.com/intent/post?text=${kodlanmisBaslik}&url=${kodlanmisAdres}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-kenar bg-zemin px-2 py-2 text-center text-xs text-metin-ikincil transition-colors hover:border-vurgu/45 hover:text-metin"
        >
          X
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${kodlanmisAdres}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-kenar bg-zemin px-2 py-2 text-center text-xs text-metin-ikincil transition-colors hover:border-vurgu/45 hover:text-metin"
        >
          LinkedIn
        </a>
        <button
          type="button"
          onClick={() => kopyala('adres')}
          className="rounded-lg border border-kenar bg-zemin px-2 py-2 text-xs text-metin-ikincil transition-colors hover:border-vurgu/45 hover:text-metin"
        >
          {kopyalanan === 'adres' ? 'Kopyalandı' : 'Bağlantı'}
        </button>
      </div>

      <div className="mt-4 border-t border-kenar-soluk pt-4">
        <p className="etiket-mono mb-2 text-metin-soluk">Kaynakça satırı</p>
        <p className="text-xs leading-relaxed break-words text-metin-ikincil select-all">
          {kaynakca}
        </p>
        <button
          type="button"
          onClick={() => kopyala('kaynakca')}
          className="etiket-mono mt-3 text-vurgu-parlak transition-colors hover:text-metin"
          aria-live="polite"
        >
          {kopyalanan === 'kaynakca' ? 'Kopyalandı ✓' : 'Kaynakçayı kopyala'}
        </button>
      </div>
    </div>
  );
}
