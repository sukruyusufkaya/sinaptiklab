// /robots.txt — BRIEF §8.2 tarayıcı politikası. Bilinçli karar: YZ
// tarayıcılarına İZİN VER (görünürlük > kısıtlama). İzinli her ajan AÇIK
// kayıt alır ki politika robots.txt çıktısında görünür ve denetlenebilir
// olsun; genel kural da aynı engel listesini taşır.
import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

/** §8.2 "Engelli" yolları — genel kural ve tüm YZ ajanları için ortak. */
const ENGELLI_YOLLAR = ["/api/", "/admin/", "/ara?", "/*?utm_"];

/** §8.2 "İzinli" YZ ajanları — listeye ekleme/çıkarma BRIEF güncellemesi ister. */
const YZ_AJANLARI = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "PerplexityBot",
  "Google-Extended",
  "Bingbot",
  "Applebot-Extended",
  "CCBot",
  "Amazonbot",
  "meta-externalagent",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: [...ENGELLI_YOLLAR] },
      ...YZ_AJANLARI.map((ajan) => ({
        userAgent: ajan,
        allow: "/",
        disallow: [...ENGELLI_YOLLAR],
      })),
    ],
    sitemap: `${env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
  };
}
