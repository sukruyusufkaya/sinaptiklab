# ADR 0002 — Domain ve Kanonik Host

- **Durum:** Kabul edildi (kullanıcı onayı, 2026-08-08)
- **Tarih:** 2026-08-08

## Bağlam
Canonical URL, redirect middleware, sitemap, OG, JSON-LD ve tüm mutlak URL'ler tek kanonik host'a bağlanmak zorunda (BRIEF §7.1). Karar ilk gün verilmeliydi. Seçenekler: `sinaptiklab.com`, `sinaptiklab.com.tr`, `sinaptiklab.ai`.

## Karar
- Kanonik host: **`https://sinaptiklab.com`** (apex).
- `www.sinaptiklab.com` → apex'e **301**; middleware tek kanonik host'u zorlar (trailing slash normalizasyonu dahil).
- `NEXT_PUBLIC_SITE_URL=https://sinaptiklab.com` tek gerçek kaynak; kodda host string'i sabitlemek yasak.

## Gerekçe
- `.com` TR kitlesi için güven + uluslararası genişlemeye (Faz 7+ `/en`) açık; `.com.tr` ileride taşınma riski, `.ai` maliyet/algı dengesi zayıf.
- Apex tercihinde tutarlılık: Vercel apex + `www` redirect desteği sorunsuz; tek host = tek cache, tek canonical.

## Sonuçlar
- Domain satın alma/DNS bağlama kullanıcı aksiyonu; Faz 1 Vercel bağlantısında doğrulanır.
- Domain henüz bağlanmadıysa preview'lar `*.vercel.app` üzerinde çalışır ama canonical daima env'den okunur.
