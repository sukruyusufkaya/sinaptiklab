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
- **Bayat `.next` tuzağı:** çok sayıda artımlı build'den sonra `.next` hem eski rota tiplerini tutup `tsc`'yi kırıyor hem de Lighthouse'u 0.97'den 0.73'e düşürebiliyor (iki kez ölçüldü). Şüpheli bir performans düşüşünde ÖNCE `rm -rf .next` ile temiz build al, sonra sebep ara.

## Faz durumu

- **Faz 0 — TAMAM (2026-08-08):** rakip analizi + anahtar kelime havuzu (`docs/arastirma/`), ADR 0001-0006, kablo çerçeveleri ve pillar/cluster ağacı (12 pillar / 124 cluster) onaylandı.
- **Faz 1 — TAMAM (2026-08-08):** Next.js 16 iskeleti, token'lar, tipografi (next/font/google — sapma kaydı ADR 0001), layout kabuğu, MongoDB katmanı + zod şemaları + ensure-indexes (Atlas'ta 14/14 index, search+vector dahil). CI: github.com/sukruyusufkaya/sinaptiklab.com yeşil. Canlı: **https://sinaptiklab-com-green.vercel.app** (fra1, Vercel projesi "sinaptiklab-com"). Canlı Lighthouse (devtools): 0.98/1/1/1, CLS 0, LCP 1.7s. Kalan kullanıcı aksiyonu: sinaptiklab.com satın alma + domain bağlama; Faz 9'a not — Atlas şifre rotasyonu + Network Access daraltma (şifre sohbete düz metin girdi, 0.0.0.0/0 açık).
- **Faz 2 — TAMAM (2026-08-08):** içerik motoru canlı. Sorgu katmanı (ISR tag: `content:<slug>` + `content-list`), MDX hattı (Shiki çift tema, TR başlık id/TOC, 11 özel bileşen), §4.3 doğrulayıcılar + durum makinesi + Server Action'lar, admin paneli (/admin — Basic Auth ADR 0007, editör+önizleme+kontrol listesi), public rotalar (makale/rehber/uygulama), **19 yayında + 1 bilinçli taslak** tohum içerik (14 ajanlı araştırma workflow'u, kaynaklar fiilen doğrulandı), topics 136 + authors 1 tohumlandı. Kapsam: satır %90.9 (eşik %70 CI'da). Canlıda doğrulandı: makaleler 200, taslak 404, ana sayfa akışı dolu.
- **Faz 3 — TAMAM (2026-08-09):** sinyal izi (SVG tek path + dashoffset; useLayoutEffect ölçüm, useSyncExternalStore reduced-motion), Tufte kenar notları, kod diff+genişlet, konu haritası + pillar hub + ilgili içerik + bülten CTA (tasarım entegrasyonu). Canlı makale Lighthouse 0.99/1/1/1, axe 0 (çift tema), 12 E2E. Risk: makale JS 141KB>90 hedefi (Faz 9'a diyet notu).
- **Faz 4 — TAMAM (2026-08-09, kod+canlı; GSC/RRT domain'e kilitli):** JSON-LD builder'ları (TechArticle+citation, HowTo, Person, FAQPage, Breadcrumb, Org+WebSite), tüm rotalarda canonical, /yazar/[slug], parçalı sitemap+indeks (`/sitemap.xml` rewrite), §8.2 robots (12 YZ ajanı izinli), RSS/Atom/JSON feed, dinamik OG (route-group djb2 rewrite'ları next.config'te), redirects→308 rota kancası (fiilen doğrulandı), IndexNow (key public/*.txt). Kapsam %88.8. hreflang bilinçli yok (tek dil; EN Faz 7+).
- **Faz 5 — TAMAM (2026-08-09):** GEO katmanı. llms.txt + pillar bazlı llms-full, `.md` ham içerik (middleware rewrite, tüm türler), açık `/api/content`, **MCP endpoint** (`/api/mcp` — mcp-handler 2.x stateless; gerçek MCP istemcisiyle uçtan uca kanıtlı), olay beacon + admin YZ Görünürlük paneli, YZ tarayıcı E2E'si.
- **Faz 6 — TAMAM (2026-08-09):** Atlas Search'lü `/ara` (Türkçe analyzer, filtre+sayfalama, JS'siz), `/sozluk` + 30 terim (kaynakları doğrulanmış), DefinedTerm JSON-LD.
- **Kapsam + tasarım turları (2026-08-09):** BRIEF §2.2'nin TÜM rotaları açık (tür indeksleri, 5 tür detay rotası, etiket arşivi 10-altı noindex, cluster hub'ları, 8 kurumsal/yasal sayfa, /bulten, faz-bekleyen modül sayfaları). Admin enstrüman konsolu (yönlendirme yöneticisi döngü denetimli, bakım paneli, SEO/SERP editörü, repro alanları). Tasarım: **ADR 0008 enstrüman ekranı** (`.ekran` tema-bağımsız koyu panel) + **ADR 0009 hareket sistemi** (scroll-driven reveal sıfır-JS, iz çizimi, sayaç, LED, iskelet — hepsi reduced-motion'da kapalı). Ana sayfa bento akış + konu yoğunluk haritası + sözlük vitrini + "ajanlara açık" paneli. Üretim: mobil menü, error/global-error/kabuklu 404, makale araçları (Markdown kopyala/paylaş/yazdır), print stylesheet, feed discovery.
- **Tasarım v5 — ADR 0010 (2026-08-09):** ürün sahibinin yönlendirmesiyle (**"fazla sade ve keskin", "görsel yok", koyu-öncelikli, Stripe/Notion**) malzeme değişti, marka DNA'sı korundu. Koyu varsayılan palet (`:root` koyu; açık tema hem sistem tercihi hem kullanıcı seçimiyle tam destekli), kademeli radius (6/10/16/24px), yükselti + iç ışık katmanı, genişletilmiş palet, `--bolum-bosluk` ile ferah ritim. HUD braketleri emekli (`HudCerceve` silindi); `.ekran` vurgu paneline dönüştü. **Görsel katman:** `components/gorsel/` — 23 SVG ikon (12 pillar + 9 içerik türü haritalı), hero "ölçüm tezgâhı" kompozisyonu, 3 boş durum + 3 bölüm illüstrasyonu; hepsi `currentColor`, sıfır paket, `"use client"` yok. Tema geçişinde iki gerçek kusur ölçülüp kapatıldı (bkz. ADR 0010).
- **Rota kapsamı TAMAM (2026-08-10):** BRIEF §2.2'deki sekiz içerik türünün de arşivi açık (`/makale /rehber /uygulama /laboratuvar /arac /olcum /vaka /uyum`). `ARSIVLI_TURLER` artık tek kaynak: arşiv sayfaları, arama tür süzgeci, sitemap `sayfalar` parçası ve içerik breadcrumb'ları hepsi ondan türer. Boş arşiv `noindex, follow` ve sitemap'e girmez; içerik açıldığı an ikisi de kendiliğinden döner. Kalan 5 türün içeriği tek sitemap parçasında (`diger`). Arşivlerde kardeş tür gezinme şeridi + boş durum illüstrasyonu.
- **İçerik: 27 yayın + 1 bilinçli taslak; 12 pillar'ın hepsi dolu.** 30 sözlük terimi, 136 topic. Beş yeni tür (lab/tool/benchmark/case/compliance) henüz boş — arşivleri hazır, bekliyorlar.
- **Hareket sistemi (2026-08-10):** hero SVG hareketi + compositor tabanlı site katmanı (giriş sahnesi, okuma ilerleme şeridi, dolan yoğunluk çubukları, kayan oklar). **Ölçülmüş kural: maliyet kaydırma güdümlü zaman çizelgesi SAYISINDAN gelir, SVG hareketinden değil.** Çok öğeli dolum efektlerinde `view-timeline-name` ile TEK çizelge paylaştır (12 ayrı `view()` → Style&Layout +570ms).
- **Ölçüm (yerel üretim build'i, lhci medyan/3 koşu):** Lighthouse 0.96-0.97/1/1/1, CLS 0, LCP 2.0-2.2s, TBT 38-113ms. 148 birim + 60 E2E (axe dahil, çift tema) yeşil.
- **Kapsam kararı (2026-08-10):** **kurs ve forum modülleri kapsamdan ÇIKARILDI** (ürün sahibi kararı). Rotalar, gezinme maddeleri, sitemap girdileri ve iç link doğrulayıcısındaki `/kurs/` öneki silindi. BRIEF §2.2'deki `/kurs/*` ve `/forum/*` satırları artık geçerli değil; `/patika` ve `/giris` plan sayfaları duruyor.
- **SEO+GEO tamamlama (2026-08-10):** llms.txt'e **Sözlük** (30 terim, kanonik TR terminoloji) ve **Arşivler** bölümleri + `/api/mcp` ile `/api/content` duyurusu eklendi. Sözlük terimlerinin `.md` ham yüzeyi açıldı (`/sozluk/<slug>.md`; middleware matcher'ına `/sozluk/:slug*` eklenmesi gerekti). **MCP 3 → 5 araç:** `sozluk_ara` + `terim_oku`. `/sozluk` indeksine DefinedTermSet (30 gömülü DefinedTerm) + BreadcrumbList, tür arşivlerine BreadcrumbList, sitemap statik sayfalarına `lastmod` (akan listeler son yayına, sabit metinler build tarihine bağlı).
- **Canlıya hazırlık (2026-08-10):** dışarı sızan geliştirme izleri temizlendi. İç faz numaraları ("Faz 7/8", "modül: kapalı") public sayfalardan kaldırıldı; footer'daki `kalibrasyon: <commit sha> · <build tarihi>` yerine okura anlamlı **arşiv son güncelleme** tarihi kondu; `/giris` rotası ve header bağlantısı silindi (auth yokken giriş reklamı yapılmaz); bülten CTA'sı ölü "yakında" yerine bugün ÇALIŞAN RSS/Atom/JSON abonelik yolunu sunuyor. **Header gezinmesi yayındaki içerikten türetiliyor** — menüdeki hiçbir madde boş arşive gitmez (Uygulamalar 0 yayınla otomatik düştü).
- **Ana sayfa (2026-08-10):** hero altındaki sayı şeridi "arşivin bugünkü durumu" kanıt bandına dönüştü (büyük sayılar, her sayının ne kanıtladığını söyleyen not, doğrulanmış kaynak sinyal renginde); konu yoğunluk haritası satırları büyütüldü (11px ikon kutusu, tabular sayı + "yayın" etiketi, yuvarlak dolum çubuğu, hover zemini).
- **Testler modülü (2026-08-10):** yeni `quizzes` koleksiyonu + `/testler` ve `/testler/<slug>`. Şema düzeyinde bütünlük: doğru cevap şıklar arasında olmak ZORUNDA, soru/şık id'leri benzersiz (`superRefine`) — bozuk test yayına çıkamaz. Motor alıştırma kipinde: şık işaretlenince soru kilitlenir, gerekçe açılır; **skor tarayıcıda hesaplanır, hiçbir veri sunucuya gitmez**. JS'siz de öğretici (sorular + `<details>` gerekçeler sunucu render'ında). `Quiz`+`Question` JSON-LD (practice-problems zengin sonuç adayı). Tohum: **5 test / 38 soru**, her sorunun `kanitSlug`'ı sitedeki kaynaklı yayına bağlı. Gezinme, footer, sitemap (`testler` parçası) ve llms.txt entegre. 4 E2E.
- **Ana sayfa §04 (makine yüzeyleri) ve §05 (ilkeler) kaldırıldı** (ürün sahibi kararı). `MakineYuzeyleri` bileşeni artık kullanılmıyor.
- **İçerik (2026-08-10):** `tool` ve `compliance` türleri açıldı — _Ollama araç kartı_ ve _On-Prem LLM KVKK uyum dosyası_, ikisi de gerçek yayın kapısından geçti. **AÇIK İŞ:** laboratuvar, ölçüm, vaka, uygulama. Kısıt: uygulama/laboratuvar `repro.repoUrl` ZORUNLU (kural 6) — örnek kod deposu yok; ölçüm/laboratuvar kendi ölçümümüzü ister; vaka veri paylaşım izni ister.
- **Link çürümesi denetimi:** yayın kapısı üç eski yayında kırık link yakaladı. Biri gerçekten ölmüştü (HF evaluate docs), ikisi **yanlış pozitifti**: link denetleyicisi UA göndermediği için aws.amazon.com isteği engelliyordu. Denetleyiciye tarayıcı benzeri UA eklendi — canlı linkler artık yanlışlıkla reddedilmiyor.
- **Faz 7 — sıradaki:** kimlik, yorumlar, bülten (çift opt-in), KVKK akışları, rate limiting.
- Bekleyen kullanıcı aksiyonları: **domain** (GSC+RRT bunu bekliyor), Vercel env: ADMIN_USER/ADMIN_PASS + INDEXNOW_KEY; GitHub secret: MONGODB_URI; BLOB_READ_WRITE_TOKEN; tutorial örnek repo'su.
- Anahtar kelime hacimleri doğrulanamadı: Semrush API kredisi 0, Ahrefs planı API'siz — biri açılırsa tek toplu sorguyla doğrula.
