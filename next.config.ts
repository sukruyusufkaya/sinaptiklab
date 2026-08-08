import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

/**
 * Next, route group içindeki metadata görsel rotalarına hash soneki ekler:
 * app/(site)/makale/[slug]/opengraph-image.tsx → /makale/<slug>/opengraph-image-16m5zo
 * (kaynak: next/dist/lib/metadata/get-metadata-route.js — djb2Hash(parent).toString(36).slice(0,6)).
 * Aşağıdaki kopya aynı algoritmadır (next/dist/shared/lib/hash.js, djbxor);
 * soneksiz temiz URL'yi hash'li gerçek rotaya rewrite etmek için kullanılır.
 * Next algoritmayı değiştirirse rewrite hedefi 404 verir — CI'daki OG curl
 * doğrulaması bunu yakalar.
 */
function djb2Hash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xffffffff;
  }
  return hash >>> 0;
}

const ogSoneki = (parent: string) => djb2Hash(parent).toString(36).slice(0, 6);

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Ev dizini ayrı bir git deposu + lockfile içerdiği için kökü açıkça sabitle
  turbopack: {
    root: fileURLToPath(new URL(".", import.meta.url)),
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // /sitemap.xml → sitemap indeksi. app/sitemap.ts (generateSitemaps) yolu
  // metadata rotası olarak sahiplendiği için indeks app dizininde doğrudan
  // /sitemap.xml'e konamıyor; içerik bu rewrite ile kanonik adresten servis
  // edilir (bkz. app/sitemap-indeksi.xml/route.ts).
  async rewrites() {
    return [
      { source: "/sitemap.xml", destination: "/sitemap-indeksi.xml" },
      // Soneksiz OG görsel URL'leri → hash'li gerçek metadata rotaları
      // (sayfa meta etiketleri zaten hash'li URL'yi işaret eder; bu kayıtlar
      // temiz URL'yi elle/CI'dan çağırabilmek için).
      {
        source: "/makale/:slug/opengraph-image",
        destination: `/makale/:slug/opengraph-image-${ogSoneki("/(site)/makale/[slug]")}`,
      },
      {
        source: "/rehber/:slug/opengraph-image",
        destination: `/rehber/:slug/opengraph-image-${ogSoneki("/(site)/rehber/[slug]")}`,
      },
      {
        source: "/uygulama/:slug/opengraph-image",
        destination: `/uygulama/:slug/opengraph-image-${ogSoneki("/(site)/uygulama/[slug]")}`,
      },
    ];
  },
};

export default nextConfig;
