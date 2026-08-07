# Sinaptiklab — Proje Anayasası (özet)

Tam ürün brief'i: **[docs/BRIEF.md](docs/BRIEF.md)** — tüm şemalar, tasarım token'ları, faz planı ve DoD'ler orada. Bu dosya sadece her oturumda hatırlanması gereken çekirdeği taşır.

## Ne inşa ediyoruz

Türkiye'nin en teknik Türkçe yapay zeka yayın + öğrenme platformu. Konumlandırma: **"Saha verisi, uydurma yok."** Her iddia kaynaklı (`sources[]` zorunlu), her tutorial çalışan repo ile, sürümlü içerik, kanonik TR YZ sözlüğü, GEO katmanı (llms.txt, .md route'lar, MCP endpoint) en büyük farklılaştırıcı.

## Kilitli iş kararları (2026-08-08 — bkz. docs/ADR/)

- **Domain:** sinaptiklab.com, apex kanonik, www→apex 301
- **Dil:** TR-öncelikli; EN altyapısı (i18n, hreflang, /en iskeleti) gün 1'den hazır, EN içerik Faz 7+ kararı
- **Erişim:** tüm içerik açık ve ücretsiz; **ödeme altyapısı YOK**; ücretsiz üyelik → yorum + ileride belirlenecek üye özellikleri
- **Yazar:** tek yazar (Şükrü Yusuf Kaya) + teknik editör; konuk program ~30 içerik sonrası davetle
- **Forum:** Faz 7'de davetli başlangıç

## Yığın (sabit — sapma önerisi varsa önce sor)

Next.js 16 App Router + React 19 · TS `strict` + `noUncheckedIndexedAccess` (`any` yasak) · Tailwind v4 + token'lar · shadcn/ui · MongoDB Atlas resmi driver (**Mongoose yasak**) + Atlas Search/Vector · Vercel `fra1` ISR+`revalidateTag` · MDX `next-mdx-remote/rsc` · Auth.js v5 · Resend · Upstash Redis · Vitest + Playwright + axe-core.

## Çalışma disiplini

- Tahmin etme, doğrula; uydurma API kullanma.
- Önce sözleşme (tip/şema/route/DoD), sonra kod. Küçük commit'ler, Conventional Commits.
- Faz DoD'si karşılanmadan sonraki faza geçilmez; her faz sonunda kanıtlı rapor (format: BRIEF §15).
- Yasaklar listesi: BRIEF §14 (mor gradyan, `any`, token dışı hex, client'ta DB, `useEffect` ile fetch, 3. parti script, kaynaksız sayı, pop-up...).

## Ortam tuzakları

- **Ev dizini git tuzağı:** `C:/Users/sukruyusuf` bir git deposu. Bu projenin deposu proje kökünde (`git init -b main` yapıldı). Her git işleminde `git rev-parse --show-toplevel` çıktısının proje kökü olduğundan emin ol.
- Windows + PowerShell 5.1; dosya yazarken UTF-8 dikkati.

## Faz durumu

- **Faz 0 — TAMAM (2026-08-08):** rakip analizi + anahtar kelime havuzu (`docs/arastirma/`), ADR 0001-0006, kablo çerçeveleri ve pillar/cluster ağacı (12 pillar / 124 cluster) onaylandı.
- **Faz 1 — teknik iş tamam, dış bağlantılar bekliyor:** Next.js 16 iskeleti, token'lar, tipografi (next/font/google — sapma kaydı ADR 0001), layout kabuğu, MongoDB katmanı + zod şemaları + ensure-indexes, Vitest(14)/Playwright(5)/axe yeşil, yerel Lighthouse ~0.97/1/1/1. **Bekleyen kullanıcı aksiyonları:** GitHub remote (CI kanıtı), Vercel bağlantısı (fra1 + canlı DoD), Atlas `MONGODB_URI`, sinaptiklab.com satın alma.
- Anahtar kelime hacimleri doğrulanamadı: Semrush API kredisi 0, Ahrefs planı API'siz — biri açılırsa tek toplu sorguyla doğrula.
