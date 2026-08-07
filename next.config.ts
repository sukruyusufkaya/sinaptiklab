import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Ev dizini ayrı bir git deposu + lockfile içerdiği için kökü açıkça sabitle
  turbopack: {
    root: fileURLToPath(new URL(".", import.meta.url)),
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
