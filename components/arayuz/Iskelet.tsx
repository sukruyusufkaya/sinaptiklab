/**
 * Yükleme iskeletleri.
 *
 * NEREDE GÖRÜNÜR: sayfaların çoğu statik üretiliyor, yani ilk boyamada
 * iskelet görünmez. İskelet gezinme sırasında Next bir sonraki rotayı
 * akıtırken ve gerçekten dinamik rotalarda devreye girer.
 *
 * ⚠ KULLANIM SINIRI — `notFound()` VEYA `redirect()` ÇAĞIRAN ROTAYA
 * `loading.tsx` KOYULMAZ
 *
 * `loading.tsx` bir Suspense sınırı kurar; Next sınırı görünce HTML kabuğunu
 * HEMEN `200` durum koduyla akıtmaya başlar. Sayfa gövdesi daha sonra çalıştığı
 * için `notFound()` ve `redirect()` artık HTTP durumunu DEĞİŞTİREMEZ: 404
 * "soft 404" (gövdesi 404, durumu 200) olur, kalıcı yönlendirme ise 308 yerine
 * `<meta http-equiv="refresh">` hâline düşer. İkisi de arama motoru açısından
 * bozuktur. Gerekçenin tamamı `docs/ADR/0002-loading-ve-durum-kodu.md`
 * içindedir. Bu yüzden iskelet YALNIZCA `/ara/` ve `/kesfet/` gibi var olmayan
 * bir kaydı reddetmeyen sayfalarda kullanılır.
 *
 * İKİ KURAL
 *
 * 1. **Nihai düzenin ölçüsünü taklit eder.** İskelet yerleşimi gerçek
 *    içerikten farklıysa yükleme bittiğinde sayfa zıplar (layout shift).
 *    Bu yüzden ölçüler kart ve başlık bileşenlerinin ölçüleriyle aynı tutulur.
 * 2. **Hareket tercihe saygılıdır.** `motion-reduce:animate-none` ile
 *    `prefers-reduced-motion` açık olan kullanıcıda nabız durur; iskelet
 *    yine görünür, yalnızca titremez.
 *
 * ERİŞİLEBİLİRLİK: iskelet bir içerik değil, bekleme göstergesidir. Kapsayıcı
 * `aria-busy` ve `aria-live="polite"` taşır; ekran okuyucu yükleniyor bilgisini
 * bir kez duyurur, kutuların kendisini okumaz (`aria-hidden`).
 */

const NABIZ = 'animate-pulse motion-reduce:animate-none';

/** Tek satır yer tutucu. Genişlik oranı içeriğin değişkenliğini taklit eder. */
export function IskeletSatir({
  genislik = 'w-full',
  yukseklik = 'h-4',
  className = '',
}: {
  genislik?: string;
  yukseklik?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`${NABIZ} rounded-md bg-yuzey-2 ${genislik} ${yukseklik} ${className}`.trim()}
    />
  );
}

/** Kart yer tutucu — `Kart` bileşeninin kenar ve dolgu ölçüleriyle aynı. */
export function IskeletKart() {
  return (
    <div aria-hidden="true" className="rounded-2xl border border-kenar bg-yuzey/30 p-5">
      <IskeletSatir genislik="w-20" yukseklik="h-3" />
      <IskeletSatir className="mt-3.5" yukseklik="h-5" />
      <IskeletSatir className="mt-2" genislik="w-4/5" yukseklik="h-5" />
      <IskeletSatir className="mt-4" genislik="w-full" yukseklik="h-3" />
      <IskeletSatir className="mt-1.5" genislik="w-2/3" yukseklik="h-3" />
    </div>
  );
}

/** Izgara hâlinde kart listesi. */
export function IskeletIzgara({ adet = 6 }: { adet?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: adet }, (_, sira) => (
        <IskeletKart key={sira} />
      ))}
    </div>
  );
}

/** Sayfa başlığı bloğu — `SayfaBasligi` ölçüsünde. */
export function IskeletBaslik() {
  return (
    <div aria-hidden="true">
      <IskeletSatir genislik="w-28" yukseklik="h-3" />
      <IskeletSatir className="mt-5" genislik="w-3/4 max-w-2xl" yukseklik="h-10" />
      <IskeletSatir className="mt-4" genislik="w-full max-w-xl" yukseklik="h-4" />
      <IskeletSatir className="mt-2" genislik="w-2/3 max-w-lg" yukseklik="h-4" />
    </div>
  );
}

/** Uzun metin gövdesi — paragraf ritmini taklit eder. */
export function IskeletMetin({ paragraf = 4 }: { paragraf?: number }) {
  return (
    <div aria-hidden="true" className="space-y-7">
      {Array.from({ length: paragraf }, (_, sira) => (
        <div key={sira} className="space-y-2.5">
          <IskeletSatir />
          <IskeletSatir />
          <IskeletSatir genislik="w-11/12" />
          <IskeletSatir genislik="w-3/5" />
        </div>
      ))}
    </div>
  );
}

/**
 * Liste/hub sayfası iskeleti — sitedeki en yaygın sayfa biçimi.
 *
 * `/ara/` ve `/kesfet/` kullanır. Grup kökünde (`app/(site)/loading.tsx`)
 * KULLANILMAZ: oradaki bir sınır bütün sitenin 404 ve yönlendirme durum
 * kodlarını bozar (bkz. dosya başlığı).
 */
export function IskeletListeSayfasi() {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className="kap py-12 sm:py-16">
      <span className="yalniz-ekran-okuyucu">Sayfa yükleniyor…</span>
      <IskeletBaslik />
      <div className="mt-12">
        <IskeletIzgara />
      </div>
    </div>
  );
}

/**
 * Uzun metin sayfası iskeleti: gövde + kenar sütunu.
 *
 * Şu an çağıran yok. İçerik detay sayfalarının (`/atlas/[slug]/` gibi) hepsi
 * kaydı bulamazsa `notFound()` çağırıyor, dolayısıyla hiçbirine `loading.tsx`
 * konulamaz. Uzun metinli AMA var olmayan bir kaydı reddetmeyen bir sayfa
 * eklenirse burası hazır durur.
 */
export function IskeletIcerikSayfasi() {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className="kap py-12 sm:py-16">
      <span className="yalniz-ekran-okuyucu">İçerik yükleniyor…</span>
      <IskeletBaslik />
      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <IskeletMetin />
        <div className="space-y-4">
          <IskeletKart />
          <IskeletKart />
        </div>
      </div>
    </div>
  );
}
