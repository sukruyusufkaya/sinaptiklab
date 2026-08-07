# ADR 0003 — Dil Stratejisi

- **Durum:** Kabul edildi (kullanıcı onayı, 2026-08-08)
- **Tarih:** 2026-08-08

## Bağlam
Ürün Türkçe pazar boşluğuna oynuyor (BRIEF §1.3) ama İngilizce ayna (`/en`) uzun vadede gündemde. Baştan iki dilli üretim tek yazarla sürdürülebilir değil; tamamen TR-kilitli mimari ise ileride pahalı bir geriye dönüş yaratır.

## Karar
**TR-öncelikli, EN altyapısı hazır:**
1. Tüm içerik üretimi Türkçe; varsayılan `lang="tr"`, `i18n.lang: "tr"`.
2. Şema gün 1'den iki dilli: `i18n: { lang, translationOf }` alanları aktif, `alternates.languages` (`tr`, `en`, `x-default`) builder'ı kurulur — EN çeviri yoksa yalnızca `tr` + `x-default` üretilir.
3. `/en/...` route iskeleti tanımlı ama yayında değil (404/`noindex`); EN içerik kararı Faz 7+ verilere göre.
4. Slug'lar Türkçe kelimelerden ASCII normalize — EN sluglar ayrı üretilir, çeviri slug'ı TR slug'a bağlanmaz.

## Sonuçlar
- hreflang hataları riski minimum: çeviri olmadan `en` alternatifi asla beyan edilmez.
- EN kararı verildiğinde migration gerekmez; yalnızca içerik + route açılışı.
