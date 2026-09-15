# ADR 0001 — Teknoloji yığını

**Tarih:** 2026-09-11 · **Durum:** Kabul edildi

## Bağlam

MASTER-PLAN §93 veri katmanı için PostgreSQL + pgvector ve headless CMS (Sanity/Payload)
öneriyor. Kurucu ise projeyi başlatırken veriyi **MongoDB**'de tutacağını ve sitenin
**Vercel** üzerinden sunulacağını açıkça belirtti.

## Karar

- **Frontend:** Next.js 16 App Router, React Server Components, TypeScript `strict`.
- **Stil:** Tailwind CSS v4, token tabanlı (`app/globals.css`). Bileşende token dışı
  hex/px yok.
- **Veri:** MongoDB (resmî sürücü) + `zod` ile şema doğrulama. Anlamsal arama gerekirse
  MongoDB Atlas Vector Search değerlendirilir.
- **Barındırma:** Vercel.
- **CMS:** Ayrı bir headless CMS kurulmaz; editör paneli uygulamanın içinde
  (`app/(admin)/`) geliştirilir — içerik modeli §69'daki entity grafiğidir ve dış bir
  ürünün şemasına sıkıştırılmaz.

## Gerekçe

Kurucunun açık kararı plan metnindeki öneriyi geçersiz kılar. MongoDB'nin belge modeli,
§69'daki heterojen entity ailesi (Content, Model, Quiz, Dataset, LearningPath…) ile
ilişkisel bir şemaya göre daha az sürtünmeyle eşleşir; Vercel ise §54'teki ISR ve edge
gereksinimlerini doğrudan karşılar.

## Sonuçlar

- Veri erişimi `lib/db/` altında toplanır; bileşenler doğrudan sürücüye erişmez.
- Arayüz önce yer tutucu veriyle geliştirilir (`lib/veri/*`); MongoDB bağlandığında
  yalnızca sorgu katmanı değişir, bileşen imzaları değişmez.
- İlişkisel bütünlük uygulama katmanında zod şemalarıyla korunur.
