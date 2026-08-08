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
- **Faz 1 — TAMAM (2026-08-08):** Next.js 16 iskeleti, token'lar, tipografi (next/font/google — sapma kaydı ADR 0001), layout kabuğu, MongoDB katmanı + zod şemaları + ensure-indexes (Atlas'ta 14/14 index, search+vector dahil). CI: github.com/sukruyusufkaya/sinaptiklab.com yeşil. Canlı: **https://sinaptiklab-com-green.vercel.app** (fra1, Vercel projesi "sinaptiklab-com"). Canlı Lighthouse (devtools): 0.98/1/1/1, CLS 0, LCP 1.7s. Kalan kullanıcı aksiyonu: sinaptiklab.com satın alma + domain bağlama; Faz 9'a not — Atlas şifre rotasyonu + Network Access daraltma (şifre sohbete düz metin girdi, 0.0.0.0/0 açık).
- **Faz 2 — TAMAM (2026-08-08):** içerik motoru canlı. Sorgu katmanı (ISR tag: `content:<slug>` + `content-list`), MDX hattı (Shiki çift tema, TR başlık id/TOC, 11 özel bileşen), §4.3 doğrulayıcılar + durum makinesi + Server Action'lar, admin paneli (/admin — Basic Auth ADR 0007, editör+önizleme+kontrol listesi), public rotalar (makale/rehber/uygulama), **19 yayında + 1 bilinçli taslak** tohum içerik (14 ajanlı araştırma workflow'u, kaynaklar fiilen doğrulandı), topics 136 + authors 1 tohumlandı. Kapsam: satır %90.9 (eşik %70 CI'da). Canlıda doğrulandı: makaleler 200, taslak 404, ana sayfa akışı dolu.
- **Faz 3 — TAMAM (2026-08-09):** sinyal izi (SVG tek path + dashoffset; useLayoutEffect ölçüm, useSyncExternalStore reduced-motion), Tufte kenar notları, kod diff+genişlet, konu haritası + pillar hub + ilgili içerik + bülten CTA (tasarım entegrasyonu). Canlı makale Lighthouse 0.99/1/1/1, axe 0 (çift tema), 12 E2E. Risk: makale JS 141KB>90 hedefi (Faz 9'a diyet notu).
- **Faz 4 — TAMAM (2026-08-09, kod+canlı; GSC/RRT domain'e kilitli):** JSON-LD builder'ları (TechArticle+citation, HowTo, Person, FAQPage, Breadcrumb, Org+WebSite), tüm rotalarda canonical, /yazar/[slug], parçalı sitemap+indeks (`/sitemap.xml` rewrite), §8.2 robots (12 YZ ajanı izinli), RSS/Atom/JSON feed, dinamik OG (route-group djb2 rewrite'ları next.config'te), redirects→308 rota kancası (fiilen doğrulandı), IndexNow (key public/*.txt). Kapsam %88.8. hreflang bilinçli yok (tek dil; EN Faz 7+).
- **Faz 5 — sıradaki:** GEO katmanı (llms.txt, .md route'lar, /api/content, MCP endpoint, YZ tarayıcı fiili doğrulama, AI referrer segmentasyonu).
- Bekleyen kullanıcı aksiyonları: **domain** (GSC+RRT bunu bekliyor), Vercel env: ADMIN_USER/ADMIN_PASS + INDEXNOW_KEY; GitHub secret: MONGODB_URI; BLOB_READ_WRITE_TOKEN; tutorial örnek repo'su.
- Anahtar kelime hacimleri doğrulanamadı: Semrush API kredisi 0, Ahrefs planı API'siz — biri açılırsa tek toplu sorguyla doğrula.
