import { SinaptikIsareti } from '@/components/duzen/Logo';

/**
 * Bakım kipi ekranı.
 *
 * Panelden `bakim-kipi` açıldığında site içeriğinin yerine bu basılır. İki
 * şeye dikkat edildi:
 *
 *  1. **Panel kapanmaz.** Bu bileşen yalnızca `(site)` düzeninde kullanılır;
 *     `/admin` ayrı bir rota grubudur. Aksi hâlde editör bakım kipini açtıktan
 *     sonra onu kapatacağı ekrana da erişemezdi.
 *  2. **Arama motoruna "kalıcı" sinyali verilmez.** Sayfa `noindex` alır ama
 *     içerik silinmiş gibi 404/410 dönmez; bakım geçicidir.
 */

export function BakimEkrani() {
  return (
    <div className="kap flex min-h-dvh flex-col items-center justify-center py-20 text-center">
      <SinaptikIsareti className="size-10 text-vurgu" />

      <h1 className="mt-8 max-w-xl text-3xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-4xl">
        Kısa bir bakım molası veriyoruz.
      </h1>
      <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-metin-ikincil">
        Sinaptik Lab şu anda güncelleniyor. Kısa süre içinde yeniden yayında olacağız — birazdan
        tekrar deneyin.
      </p>

      <p className="mt-10 font-mono text-xs tracking-widest text-metin-soluk">SİNAPTİK LAB</p>
    </div>
  );
}
