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

## Sonuçlar
- MongoDB bağlantısı BRIEF §3.1'deki global-promise deseniyle kurulur; sapma kabul edilmez.
- Sürüm doğrulaması Faz 1'de scaffold sırasında yapılır (Next 16.x güncel minor, React 19 uyumu, Tailwind v4 + shadcn uyumu); uyumsuzluk çıkarsa bu ADR güncellenip kullanıcıya sorulur.
- Embedding üretimi için OpenAI API yalnızca `scripts/backfill-embeddings` ve yayın hattında kullanılır; client'a asla sızmaz.
