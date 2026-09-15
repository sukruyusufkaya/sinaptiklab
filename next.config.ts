import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import type { NextConfig } from 'next';

const kok = dirname(fileURLToPath(import.meta.url));

/** Üretimde güvenlik başlıkları; canlıya çıkmadan önce zorunlu (bkz. ADR). */
const GUVENLIK_BASLIKLARI = [
  // Tarayıcı MIME türünü tahmin etmesin.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Site başka bir sayfaya çerçevelenemez (clickjacking).
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Dış sitelere tam URL sızmasın.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Kullanılmayan güçlü API'ler kapalı.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
  // HTTPS zorunlu — yalnızca üretimde anlamlı, yerelde tarayıcı yok sayar.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Çapraz kaynak yalıtımı.
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: { root: kok },
  poweredByHeader: false,
  // Kalıcı URL politikası (MASTER-PLAN §45): her yol sondaki eğik çizgiyle biter.
  trailingSlash: true,

  /**
   * `mongodb` sunucu tarafında dışsal bırakılır.
   *
   * Paketlenmeye çalışıldığında sürücünün DNS (SRV kaydı çözümleme), TLS ve
   * yerel eklenti yolları bozulur; belirtisi `querySrv ETIMEOUT` hatasıdır —
   * bağlantı dizesi doğru olmasına rağmen Atlas bulunamaz.
   */
  serverExternalPackages: ['mongodb'],

  async headers() {
    return [
      {
        source: '/:path*',
        headers: GUVENLIK_BASLIKLARI,
      },
      {
        // Panel hiçbir koşulda dizinlenmez ve çerçevelenmez.
        source: '/admin/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
      {
        /**
         * Taslak önizleme rotası: yayımlanmamış içerik taşır.
         *
         * Sayfa `metadata.robots` ile de noindex verir; başlık, meta etiketi
         * okumayan aracılar (bazı tarayıcı botları, önbellek katmanları) için
         * ikinci kattır. `no-store` şart: süresi dolmuş bir bağlantının
         * yanıtının ara belleklerde yaşamaya devam etmesi önizlemeyi kalıcı
         * bir yayın adresine çevirirdi.
         */
        source: '/onizleme/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
    ];
  },
};

export default nextConfig;
