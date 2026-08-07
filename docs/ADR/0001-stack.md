# ADR 0001 — Teknoloji Yığını

- **Durum:** Kabul edildi
- **Tarih:** 2026-08-08
- **Karar verici:** Şükrü Yusuf Kaya (ürün brief'i ile)

## Bağlam
Sinaptiklab içerik-ağırlıklı, SEO/GEO-kritik, tek geliştiricili bir platform. Gereksinimler: mükemmel Core Web Vitals, sunucu tarafı render zorunluluğu (GEO §8.3/7), Türkçe tam metin arama + vektör benzerliği, düşük operasyon yükü.

## Karar
| Katman | Seçim |
|---|---|
| Framework | Next.js 16.x App Router + React 19 (RSC varsayılan) |
| Dil | TypeScript `strict` + `noUncheckedIndexedAccess`; `any` yasak |
| Stil | Tailwind CSS v4 + CSS değişken token'ları |
| Bileşen | shadcn/ui (kopyala-sahiplen) + Radix |
| Veritabanı | MongoDB Atlas, resmi `mongodb` driver (Mongoose YASAK), zod ile şema doğrulama |
| Arama | Atlas Search (BM25, TR analyzer) + Atlas Vector Search (1536d cosine) |
| Hosting | Vercel Fluid Compute, `fra1`, ISR + `revalidateTag` |
| İçerik | MDX string olarak DB'de, `next-mdx-remote/rsc` ile derleme |
| Auth | Auth.js v5 + MongoDB adapter (e-posta OTP + GitHub + Google) |
| E-posta | Resend + React Email |
| Cache/limit | Upstash Redis |
| Test | Vitest + Playwright + axe-core; Lighthouse CI |

## Gerekçe
- **Tek koleksiyonlu içerik modeli + esnek şema** → MongoDB; ilişkisel bütünlük ihtiyacı düşük, zod uygulama katmanında sözleşmeyi taşıyor.
- **Atlas Search + Vector Search aynı veritabanında** → ayrı arama altyapısı (Elastic, Typesense, Pinecone) işletme maliyeti sıfırlanıyor.
- **Vercel fra1** → TR kullanıcısına en yakın bölge; TTFB ≤ 200 ms bütçesi ancak edge-yakını ISR ile tutar.
- **Mongoose yasağı** → serverless soğuk başlatmada model derleme yükü + tip sisteminin zod'la çakışması; resmi driver + zod daha az katman.

## Sapma kaydı — tipografi mekanizması (2026-08-08)
BRIEF §5.3 "next/font/local ile self-host" der. Uygulamada `next/font/google` (build zamanı indirme + self-host) seçildi. Gerekçe: fontsource woff2 dosyaları subset başına ayrıdır ve `next/font/local` tek ailede unicode-range'li çoklu subset üretemez; subset başına ayrı aile + zincir denemesi yanlış metrikli fallback yüzünden **CLS 0.337 / LCP 4.4s** ölçtürdü (Lighthouse, 2026-08-08). `next/font/google` aynı fontları build'de indirip tek ailede unicode-range'li subset'ler + doğru size-adjust fallback ile üretir; runtime'da Google CDN'e istek **gitmez** — brief'in asıl hedefi (self-host, CDN bağımlılığı yok, swap, CLS 0) korunur. Maliyet: build sırasında fonts.googleapis.com erişimi gerekir (Vercel/CI cache'ler).

## Sonuçlar
- MongoDB bağlantısı BRIEF §3.1'deki global-promise deseniyle kurulur; sapma kabul edilmez.
- Sürüm doğrulaması Faz 1'de scaffold sırasında yapılır (Next 16.x güncel minor, React 19 uyumu, Tailwind v4 + shadcn uyumu); uyumsuzluk çıkarsa bu ADR güncellenip kullanıcıya sorulur.
- Embedding üretimi için OpenAI API yalnızca `scripts/backfill-embeddings` ve yayın hattında kullanılır; client'a asla sızmaz.
