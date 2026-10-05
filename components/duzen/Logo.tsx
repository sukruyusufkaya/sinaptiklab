import Image from 'next/image';
import Link from 'next/link';
import isaret from '@/public/marka/sinaptik-isaret-256.png';

/**
 * Sinaptik işareti: iki düğümü birbirine bağlayan "S" — sinaps.
 *
 * Kaynak raster (saydam PNG, `public/marka/`): işaretin derinlik ve ışık
 * geçişleri SVG ile birebir kurulamıyor. Arka planı kaldırılmış ana dosya
 * `sinaptik-isaret.png` (500 px); türevler ondan üretilir. Statik içe alma
 * sayesinde `next/image` boyuta göre küçültülmüş sürüm sunar ve yer tutucu
 * boyutu bilindiği için düzen kaymaz.
 *
 * Dekoratiftir (`alt=""`): yanındaki marka adı ya da bağlantının
 * `aria-label`'ı kimliği zaten söyler.
 */
export function SinaptikIsareti({
  className = '',
  oncelikli = false,
}: {
  className?: string;
  /** Yalnızca ekranın üstünde ilk görünen işaret (başlık) önceden yüklenir. */
  oncelikli?: boolean;
}) {
  return (
    <Image
      src={isaret}
      alt=""
      sizes="48px"
      className={`object-contain ${className}`.trim()}
      priority={oncelikli}
    />
  );
}

export function Logo({
  className = '',
  yaziGoster = true,
}: {
  className?: string;
  yaziGoster?: boolean;
}) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 rounded-lg ${className}`.trim()}
      aria-label="Sinaptik Lab ana sayfa"
    >
      <SinaptikIsareti
        oncelikli
        className="size-8 shrink-0 transition-transform duration-300 ease-sinaptik group-hover:scale-105"
      />
      {yaziGoster && (
        <span className="flex flex-col leading-none">
          <span className="text-[0.9375rem] font-semibold tracking-tight text-metin">
            Sinaptik<span className="text-vurgu-parlak">Lab</span>
          </span>
          <span className="etiket-mono mt-1 text-[0.5625rem] text-metin-soluk">
            AI KNOWLEDGE PLATFORM
          </span>
        </span>
      )}
    </Link>
  );
}
