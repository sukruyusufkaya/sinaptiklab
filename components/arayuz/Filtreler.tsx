import Link from 'next/link';

/**
 * Arşiv filtreleri crawl edilebilir bağlantılardır, JS durumu değil.
 * Facet kombinasyonları indekslenmez; yalnızca küratörlü hub'lar bağlanır
 * (MASTER-PLAN §51).
 */
export function FiltreSeridi({
  etiket,
  ogeler,
  aktifYol,
}: {
  etiket: string;
  ogeler: { ad: string; yol: string; adet?: number }[];
  aktifYol: string;
}) {
  return (
    <nav aria-label={etiket} className="flex flex-wrap gap-2">
      {ogeler.map((oge) => {
        const aktif = oge.yol === aktifYol;
        return (
          <Link
            /*
             * Anahtar AD + YOL bileşimi. Yalnızca `yol` kullanıldığında, aynı
             * adrese giden iki öğe (bir arşivde "Tümü" ile bir rol rozeti gibi)
             * React'te aynı anahtara düşüyor ve "iki çocuk aynı anahtarla"
             * hatası üretiyordu. Bileşik anahtar hatayı susturmaz, olmasını
             * engeller: aynı ada VE aynı yola sahip iki öğe zaten yinelemedir.
             */
            key={`${oge.ad}|${oge.yol}`}
            href={oge.yol}
            aria-current={aktif ? 'page' : undefined}
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[0.8125rem] font-medium transition-colors duration-150 ${
              aktif
                ? 'border-vurgu/40 bg-vurgu-zemin text-vurgu-parlak'
                : 'border-kenar text-metin-ikincil hover:border-kenar-guclu hover:text-metin'
            }`}
          >
            {oge.ad}
            {typeof oge.adet === 'number' && (
              <span className="etiket-mono text-metin-soluk tabular-nums">{oge.adet}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

/** Henüz içeriği olmayan bölümler için dürüst boş durum. */
export function BosDurum({
  baslik,
  metin,
  eylem,
}: {
  baslik: string;
  metin: string;
  eylem?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-kenar-guclu bg-zemin-derin/60 px-6 py-14 text-center">
      <p className="etiket-mono mb-3 text-metin-soluk">Hazırlanıyor</p>
      <p className="mx-auto max-w-md text-lg font-semibold tracking-tight text-metin">{baslik}</p>
      <p className="mx-auto mt-3 max-w-lg text-[0.875rem] leading-relaxed text-metin-ikincil">
        {metin}
      </p>
      {eylem && <div className="mt-6 flex justify-center">{eylem}</div>}
    </div>
  );
}
