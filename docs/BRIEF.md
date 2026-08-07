# SINAPTIKLAB — ÜRÜN BRIEF'İ

> Bu dosya projenin anayasasıdır. Kaynağı 2026-08-08 tarihli kullanıcı brief'idir; §16 açık kararları aynı gün kullanıcı onayıyla kilitlenmiş ve karar günlüğüne dönüştürülmüştür. Değişiklik ancak ADR ile yapılır.

---

## 0. ROL

Kıdemli ürün mühendisi: full-stack geliştirici + teknik SEO mimarı + tasarım lideri. Görev: Türkiye'nin en teknik ve en profesyonel yapay zeka içerik platformu **Sinaptiklab**'ı sıfırdan üretime almak.

Çalışma disiplini:
- **Tahmin etme, doğrula.** Sürüm, API imzası, şema alanı veya SEO davranışı konusunda emin değilsen dokümantasyonu oku. Uydurma API kullanma.
- **Küçük, gözden geçirilebilir commit'ler.** Her commit tek bir işi yapar, mesajı Conventional Commits.
- **Önce sözleşme, sonra kod.** Tip, şema, route ve DoD tanımlanmadan implementasyon başlamaz.
- **Her fazın sonunda kanıt.** "Yaptım" yetmez; test çıktısı, Lighthouse skoru, ekran görüntüsü, curl çıktısı.
- **Ölçemediğini iyileştirme.** Performans ve SEO bütçeleri CI'da kırılırsa build fail olur.

---

## 1. ÜRÜN TEZİ

### 1.1 Tek cümlelik tanım
Sinaptiklab, yapay zeka sistemlerini **gerçekten üreten** insanlar için yazılmış, her iddiası kaynaklı ve yeniden üretilebilir Türkçe teknik yayın ve öğrenme platformudur.

### 1.2 Ne DEĞİL
Şu içerik türleri kesinlikle üretilmez:
- "En iyi 20 yapay zeka aracı" tipi affiliate listeleri
- Kaynaksız, tarihi belirsiz, sayı uyduran haber özetleri
- İngilizce blogların makine çevirisi
- ChatGPT'ye yazdırılıp düzeltilmemiş dolgu içerik

### 1.3 Pazar boşluğu (mevcut TR manzarası)
Türkçe YZ içerik alanı üç kümede yoğunlaşıyor: **araç dizinleri**, **genel teknoloji haber siteleri** (Webrazzi, ShiftDelete, Technopat) ve **kurumsal blog pazarlaması**. Ortak açıklar:

| Boşluk | Sinaptiklab'ın cevabı |
|---|---|
| Kod yok, sadece anlatı var | Her tutorial'da çalışan repo + notebook |
| Sayılar kaynaksız ve tarihsiz | Her veri noktasında kaynak + "son doğrulama" tarihi |
| Türkçe terminoloji kaosu | Kanonik Türkçe YZ sözlüğü, otomatik terim linkleme |
| Regülasyon hiç konuşulmuyor | KVKK / on-prem / regüle sektör dosyaları |
| İçerik bir kere yazılıp çürüyor | Sürümlü içerik + değişiklik günlüğü |
| Öğrenci için sıra yok | Yapılandırılmış öğrenme patikaları |

**Konumlandırma ilkesi:** *"Saha verisi, uydurma yok."* Editoryal kural — teknik olarak zorunlu (bkz. §4.3 `sources[]` zorunluluğu).

### 1.4 Hedef kitleler

| Persona | İhtiyaç | Ana içerik türü |
|---|---|---|
| **Uygulayıcı mühendis** (ML/backend/veri) | Üretimde çalışan desen, tuzaklar, maliyet | Deep-dive, benchmark, mimari |
| **Teknik lider / mimar** | Karar gerekçesi, TCO, risk | Vaka çalışması, karşılaştırma, karar rehberi |
| **Regüle sektör kararvericisi** | KVKK uyumu, on-prem, tedarikçi seçimi | Regülasyon dosyası, uyum kontrol listesi |
| **Öğrenci / kariyer değiştiren** | Sıralı öğrenme, ödevler, portföy | Patika, kurs, laboratuvar |
| **Yönetici okuyucu** | 5 dakikada durum | Bülten, yönetici özeti bloğu |

---

## 2. BİLGİ MİMARİSİ

### 2.1 İçerik türleri
1. **Makale** (`article`) — derinlemesine teknik analiz
2. **Rehber** (`guide`) — pillar; uçtan uca uzun form
3. **Uygulama** (`tutorial`) — adım adım, çalışan kod zorunlu
4. **Laboratuvar** (`lab`) — çalıştırılabilir notebook / repo
5. **Sözlük terimi** (`term`) — kanonik Türkçe YZ terimi
6. **Model/Araç kartı** (`tool`) — yapılandırılmış inceleme, fiyat, TR erişilebilirliği
7. **Ölçüm** (`benchmark`) — yeniden üretilebilir karşılaştırma verisi
8. **Vaka çalışması** (`case`) — anonimleştirilmiş saha projesi
9. **Regülasyon dosyası** (`compliance`) — KVKK, AI Act, sektör mevzuatı
10. **Kurs / Ders** (`course` / `lesson`)
11. **Patika** (`path`) — sıralı öğrenme rotası
12. **Bülten sayısı** (`issue`)
13. **Forum konusu** (`thread`)

### 2.2 URL şeması (kalıcı, değiştirilemez)
```
/                                 ana sayfa
/makale/<slug>                    makale
/rehber/<slug>                    pillar rehber
/uygulama/<slug>                  tutorial
/laboratuvar/<slug>               lab
/sozluk                           sözlük indeksi
/sozluk/<slug>                    terim
/arac/<slug>                      araç/model kartı
/olcum/<slug>                     benchmark
/vaka/<slug>                      vaka çalışması
/uyum/<slug>                      regülasyon dosyası
/kurs/<slug>                      kurs
/kurs/<slug>/<ders-slug>          ders
/patika/<slug>                    öğrenme patikası
/konu/<pillar-slug>               pillar hub
/konu/<pillar-slug>/<cluster>     cluster hub
/etiket/<slug>                    etiket arşivi
/yazar/<slug>                     yazar (E-E-A-T sayfası)
/bulten                           bülten arşivi
/bulten/<sayi>                    bülten sayısı
/forum, /forum/<kategori>, /forum/<kategori>/<slug>
/ara                              arama
/hakkinda /iletisim /editoryal-politika /kunye
/gizlilik /kvkk-aydinlatma /cerez-politikasi /kullanim-sartlari
/en/...                           İngilizce ayna (Faz 7+)
```
**Kural:** Slug Türkçe, ASCII'ye normalize (`ı→i, ğ→g, ş→s, ç→c, ö→o, ü→u`), stop-word temizli, maks. 60 karakter. Slug değişirse **301 redirect kaydı zorunlu** (`redirects` koleksiyonu).

### 2.3 Taksonomi
- **Pillar** (8–12 adet, sabit): LLM & Üretken YZ · RAG & Bilgi Erişimi · Ajanik Sistemler · LLMOps & Değerlendirme · Bilgisayarlı Görü · Makine Öğrenmesi Temelleri · Veri Mühendisliği · MLOps & Altyapı · Güvenlik & Kırmızı Takım · Regülasyon & Yönetişim · Sektör Uygulamaları · Kariyer & Öğrenme
- **Cluster** (pillar başına 8–15)
- **Etiket** (serbest, kontrollü liste; yeni etiket editör onayıyla)
- **Seviye**: `giris` | `orta` | `ileri` | `uzman`

Her içerik **tek pillar + 1..3 cluster** ile ilişkilenir. Pillar hub sayfaları otomatik üretilir; pillar-cluster iç linkleme otomatiktir, elle yazılmaz.

---

## 3. TEKNOLOJİ YIĞINI

Kesin kararlar. Sapma önerisi varsa **önce sor**.

| Katman | Seçim | Not |
|---|---|---|
| Framework | **Next.js 16.x (App Router)**, React 19 | Aktif LTS; Turbopack varsayılan; Node.js 20+ zorunlu |
| Dil | TypeScript, `strict: true`, `noUncheckedIndexedAccess` | `any` yasak, `unknown` + zod ile daralt |
| Stil | Tailwind CSS v4 + CSS değişkenleri | Token'lar §5'te; keyfi hex kullanımı yasak |
| Bileşen | shadcn/ui (kopyala-sahiplen), Radix primitives | Tema token'larına uyarlanacak |
| DB | **MongoDB Atlas** + resmi `mongodb` driver | Mongoose kullanma; zod ile şema doğrulama |
| Arama | MongoDB Atlas Search (BM25) + **Atlas Vector Search** | Vektör: ilgili içerik + semantik arama |
| Hosting | **Vercel** (Fluid Compute), ISR + `revalidateTag` | Bölge: `fra1` (TR gecikmesi) |
| İçerik formatı | MDX (DB'de string), `next-mdx-remote/rsc` ile derlenir | Özel bileşen seti §6.2 |
| Auth | Auth.js v5 (MongoDB adapter) | E-posta OTP + GitHub + Google |
| E-posta | Resend + React Email | Bülten, bildirim, OTP |
| Rate limit / cache | Upstash Redis | API ve forum için |
| Görsel | Vercel Blob + `next/image` | AVIF/WebP, `sizes` zorunlu |
| Analitik | Vercel Analytics + Umami (self-host) + GSC | GA4 opsiyonel |
| Test | Vitest (birim) + Playwright (E2E) + axe-core (a11y) | CI'da zorunlu |
| Lint | ESLint flat config + Prettier + `@typescript-eslint` | `--max-warnings=0` |
| CI | GitHub Actions | Lint → tip → test → build → Lighthouse CI |

### 3.1 MongoDB + Vercel bağlantı deseni (kritik)

Serverless'ta her invocation yeni bağlantı açarsa Atlas connection limit'i patlar. **Zorunlu desen:**

```ts
// lib/mongodb.ts
import { MongoClient, ServerApiVersion } from "mongodb";
const uri = process.env.MONGODB_URI!;
const options = {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
  maxPoolSize: 10,
  minPoolSize: 0,
  maxIdleTimeMS: 30_000,
};
let clientPromise: Promise<MongoClient>;
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}
if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri, options).connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = new MongoClient(uri, options).connect();
}
export default clientPromise;
```

Ek kurallar:
- Atlas'ta Vercel entegrasyonunu kur; mümkünse **Atlas–Vercel native integration** kullan.
- Okuma yolları **asla** istek başına DB'ye gitmez: içerik sayfaları ISR + `unstable_cache` + `revalidateTag('article:<id>')`.
- Yazma yolları Server Action, hepsi zod ile doğrulanır.

---

## 4. VERİ MODELİ (MongoDB)

Her koleksiyon için zod şeması + TS tipi + index tanımı **kod olarak** `lib/db/schemas/` altında yaşar; index'ler `scripts/ensure-indexes.ts` ile idempotent kurulur ve CI'da çalışır.

### 4.1 `contents` (tüm yayın türleri tek koleksiyonda, `type` ile ayrışır)
```ts
{
  _id: ObjectId,
  type: "article"|"guide"|"tutorial"|"lab"|"tool"|"benchmark"|"case"|"compliance"|"issue",
  slug: string,                    // unique, index
  title: string,                   // 60 kar. hedef
  dek: string,                     // 140-180 kar. spot
  answerFirst: string,             // 40-60 kelime "Kısa cevap" — GEO için kritik
  body: string,                    // MDX kaynağı
  excerptHtml: string,             // liste kartları için önceden render
  level: "giris"|"orta"|"ileri"|"uzman",
  pillar: string,                  // slug
  clusters: string[],
  tags: string[],
  authors: ObjectId[],             // -> authors
  technicalReviewer: ObjectId|null,// E-E-A-T sinyali
  status: "draft"|"in_review"|"scheduled"|"published"|"archived",
  publishedAt: Date|null,
  updatedAt: Date,
  lastVerifiedAt: Date,            // "veri son doğrulama" — UI'da gösterilir
  readingMinutes: number,
  toc: [{ id, text, depth }],
  faq: [{ q, a }],                 // FAQPage schema kaynağı
  sources: [{                      // ZORUNLU, min 1 (§4.3)
    label: string, url: string, publisher: string,
    accessedAt: Date, kind: "paper"|"docs"|"vendor"|"data"|"news"|"own_field_data"
  }],
  repro: {                         // yeniden üretilebilirlik kutusu
    repoUrl?: string, notebookUrl?: string, modelIds?: string[],
    hardware?: string, runDate?: Date, approxCostUsd?: number
  } | null,
  relatedManual: ObjectId[],
  embedding: number[],             // 1536d, Atlas Vector Search
  seo: { title?, description?, canonical?, noindex?: boolean, ogImageOverride?: string },
  i18n: { lang: "tr"|"en", translationOf?: ObjectId },
  changelog: [{ at: Date, by: ObjectId, note: string, kind: "minor"|"major"|"correction" }],
  metrics: { views: number, avgScrollDepth: number, aiReferrals: number },
  version: number
}
```

**Index'ler:**
`{slug:1}` unique · `{status:1, publishedAt:-1}` · `{pillar:1, status:1, publishedAt:-1}` · `{tags:1}` · `{type:1, status:1}` · `{"i18n.lang":1, "i18n.translationOf":1}` · Atlas Search index `content_search` (title^5, dek^3, body, tags^2, Türkçe analyzer + `icuFolding`) · Vector index `content_vector` (`embedding`, cosine, 1536).

### 4.2 Diğer koleksiyonlar
- **`authors`** — `slug, name, title, bio, longBio, avatar, credentials[], sameAs[] (LinkedIn/GitHub/ORCID/X), expertise[], employer` → `Person` JSON-LD kaynağı
- **`terms`** — `slug, tr, en, aliases[], shortDef (max 25 kelime), longDef (MDX), pillar, related[], sources[]` → `DefinedTerm` + otomatik linkleme sözlüğü
- **`topics`** — pillar/cluster ağacı, `slug, kind, parent, title, intro, seo`
- **`tools`** — `slug, vendor, category, pricing[{plan, priceUsd, unit, verifiedAt}], trAvailability{card, invoice, dataResidency}, apiDocsUrl, benchmarkRefs[], verdict, pros[], cons[], lastVerifiedAt`
- **`benchmarks`** — `slug, task, dataset, models[{id, metric, value, ci}], protocol, repoUrl, runAt, hardware, costUsd, sources[]`
- **`courses`** / **`lessons`** / **`paths`** / **`enrollments`** / **`progress`**
- **`users`**, **`accounts`**, **`sessions`** (Auth.js)
- **`comments`** — `contentId, userId, body, parentId, status(pending|approved|spam), createdAt`
- **`threads`** / **`posts`** / **`votes`** (forum)
- **`subscribers`** — `email, status, confirmedAt, source, prefs[], unsubToken`
- **`redirects`** — `from, to, code(301|308), createdAt` (middleware okur, Redis'te cache)
- **`events`** — hafif olay logu (`type, path, referrerHost, aiAgent?, ts`), 90 gün TTL
- **`media`** — `url, alt, width, height, blurDataURL, credit, license`

### 4.3 Editoryal zorlayıcılar (kodla zorunlu)

Yayınlama Server Action'ı şu kontroller geçmeden `published` yapamaz:
1. `sources.length >= 1` ve her sayıda/iddiada kaynak referansı var
2. `answerFirst` dolu ve 40–80 kelime arası
3. `faq.length >= 2`
4. `toc` üretilmiş, tüm H2/H3'te stabil `id` var
5. Tüm görsellerde `alt` dolu
6. `tutorial` ve `lab` için `repro.repoUrl` zorunlu
7. `tool` ve `benchmark` için `lastVerifiedAt` son 90 gün içinde
8. İç link sayısı ≥ 3, dış otoriter link ≥ 2
9. Slug çakışması yok; varsa redirect kaydı üretildi
10. Kırık link taraması temiz

Hata mesajları editöre **ne yapması gerektiğini** söyler ("3 iç link ekle: şu 5 ilgili yazı öneriliyor"), sadece "geçersiz" demez.

---

## 5. TASARIM SİSTEMİ

### 5.1 Yön (birebir uygula, "modernleştirmeye" çalışma)

**Konsept: Ölçüm laboratuvarı.** Site bir enstrümanın okuması gibi görünür: kemik beyazı laboratuvar tezgâhı, grafit mürekkep, tek bir *sinyal* rengi. YZ sitelerinin standart görünümü — koyu zemin + mor/camgöbeği gradyan + parlayan küre — **yasaktır**. Sinaptiklab elektrik mühendisliği ve elektrofizyoloji dilinden konuşur: iz (trace), eşik, gecikme, kalibrasyon, ölçüm işareti.

Varsayılan tema **açık**; karanlık tema eşdeğer kalitede ve `prefers-color-scheme` ile otomatik.

### 5.2 Renk token'ları
```css
:root {
  --kagit:      #F1F2ED;  /* zemin — kemik beyazı, tezgâh laminatı */
  --kagit-alt:  #E7E9E2;  /* kart, kod bloğu zemini */
  --murekkep:   #12161B;  /* ana metin — grafit */
  --murekkep-2: #4A5158;  /* ikincil metin */
  --doku:       #C9CCC3;  /* hairline çizgi, ızgara */
  --sinyal:     #1B3BFF;  /* elektrik mavisi — link, odak, aktif */
  --sinyal-dip: #0A1C99;  /* hover / basılı */
  --olcum:      #FFC400;  /* ölçüm sarısı — SADECE işaretleme, max %3 alan */
  --uyari:      #B4341C;
  --onay:       #0C6E5E;
}
[data-theme="dark"] {
  --kagit:      #0A0D11;
  --kagit-alt:  #141A20;
  --murekkep:   #E8EAE5;
  --murekkep-2: #9BA3AB;
  --doku:       #2A3138;
  --sinyal:     #5C7BFF;
  --sinyal-dip: #93A8FF;
  --olcum:      #FFD24D;
}
```
Kural: bileşenlerde hex yazmak yasak; sadece token. Kontrast **WCAG AA** (gövde ≥ 4.5:1, büyük başlık ≥ 3:1) — CI'da otomatik kontrol.

### 5.3 Tipografi

| Rol | Yüzey | Neden |
|---|---|---|
| Display | **Bricolage Grotesque Variable** | Değişken genişlik/optik boyut; karakterli ama teknik |
| Gövde | **Newsreader** (alternatif: Literata) | Uzun form okunabilirliği; Inter'den farklılaşma |
| Yardımcı / kod | **JetBrains Mono** | Kod, veri tabloları, etiketler, zaman damgaları |

**Türkçe zorunluluğu:** Her yüzey `ı İ ğ Ğ ş Ş ç Ç ö Ö ü Ü` glif'lerini eksiksiz taşımalı; `locale="tr"` ile `İ/ı` dönüşümü doğru çalışmalı. Fontlar `next/font/local` ile **self-host** (Google Fonts CDN'e runtime bağımlılık yok), `font-display: swap`, `size-adjust` ile CLS sıfırlanır. Subset: `latin` + `latin-ext`.

Tip ölçeği (1.25 majör üçlü, `clamp()` ile akışkan):
`--fs-xs .75rem · --fs-sm .875rem · --fs-base 1.0625rem · --fs-lg 1.25rem · --fs-xl 1.5rem · --fs-2xl 1.953rem · --fs-3xl 2.441rem · --fs-4xl 3.052rem`

Gövde satır uzunluğu **62–72 karakter** (`max-inline-size: 68ch`), satır yüksekliği 1.65.

### 5.4 İmza öğesi — "Aksiyon Potansiyeli"

Makale sayfasında sol payda (mobilde üstte ince bant) dikey bir **sinyal izi**: okuma ilerlemesiyle dolan hat, her H2 bölüm sınırında bir *spike*. Hat aynı zamanda tıklanabilir bölüm haritasıdır. Markanın adını (sinaps → ateşleme) taşıyan ve **işlevsel** olan tek gösterişli öğe.

Kurallar: SVG + `IntersectionObserver`, 60fps, `prefers-reduced-motion: reduce` altında animasyon kapalı — statik bölüm haritası. Sitenin geri kalanı sakin: gradyan yok, glow yok, parallax yok, otomatik oynayan video yok.

### 5.5 Izgara ve düzen
- 12 kolon, `--gutter: clamp(1rem, 4vw, 2.5rem)`, maks içerik genişliği 1280px
- Makale düzeni: `[iz 64px] [gövde 68ch] [kenar notu 260px]` — kenar notunda kaynaklar, terim tanımları, repro kutusu
- Kenarlıklar hairline `1px solid var(--doku)`, `border-radius` **maks 4px**
- Bölüm ayırıcılar: ölçüm cetveli motifi (ince çentikli çizgi), bölüm numarası/derinlik taşır

### 5.6 Hareket
Sadece üç yerde: (1) sayfa geçişinde `view-transition` ile 180ms fade+lift, (2) sinyal izi, (3) hover'da 120ms renk/alt çizgi. Easing `cubic-bezier(.2,.8,.2,1)`. Başka animasyon yok.

---

## 6. OKUMA DENEYİMİ

### 6.1 Makale sayfası bileşenleri (sırayla)
1. Breadcrumb (JSON-LD ile eşleşir)
2. Pillar rozeti + seviye + okuma süresi + `lastVerifiedAt`
3. H1 + dek
4. Yazar satırı: yazar(lar) + **teknik editör** + yayın/güncelleme tarihi
5. **"Kısa cevap"** kutusu (`answerFirst`) — koyu çerçeve, ilk ekranda, kopyalanabilir
6. İçindekiler (mobilde açılır)
7. Gövde
8. **Yeniden üretilebilirlik kutusu** (varsa): repo, notebook, model sürümleri, donanım, çalıştırma tarihi, yaklaşık maliyet
9. **Kaynaklar** — numaralı, erişim tarihli
10. **Değişiklik günlüğü** — "Bu yazı 3 kez güncellendi" (açılır)
11. SSS (FAQPage schema ile aynı veriden)
12. İlgili içerik (vektör benzerliği + aynı cluster karışımı)
13. Yorumlar
14. Bülten CTA'sı (tek, sayfa sonunda; pop-up yok)

### 6.2 Özel MDX bileşenleri
`<KisaCevap>` · `<Kaynak id="">` (metin içi atıf) · `<Terim slug="">` (sözlük tooltip) · `<Kod dosya="" satirVurgu="" calistir="">` · `<Uyari tip="dikkat|tuzak|guvenlik|kvkk">` · `<Karsilastirma>` (tablo + mobil kart) · `<Diyagram>` (Mermaid, SSR) · `<Olcum id="">` (benchmark'tan canlı veri) · `<YoneticiOzeti>` · `<Adim n="">` (HowTo schema) · `<Video>` (lite-youtube).

### 6.3 Kod blokları
Shiki ile **build zamanında** vurgulanır (runtime JS yok); açık `github-light` türevi + koyu `github-dark` türevi, token renkleri `--sinyal`/`--olcum` ile hizalı. Diff, satır vurgusu, dosya sekmesi, `Kopyala`. Uzun blok `max-height` + genişlet.

### 6.4 Otomatik terim linkleme
Yayınlanma sırasında gövde taranır; `terms` eşleşmeleri **ilk geçtiği yerde bir kez** `<Terim>` ile sarılır (Türkçe çekim ekleri için kök eşleme). Kendi terim sayfasında link üretilmez. Editör devre dışı bırakabilir.

---

## 7. SEO MİMARİSİ

### 7.1 Teknik temel
- Her route'ta `generateMetadata`: title (≤60), description (≤155), canonical (mutlak), `openGraph`, `twitter`, `alternates.languages` (`tr`, `en`, `x-default`)
- **Dinamik OG görseli** her içerik için `opengraph-image.tsx` (`ImageResponse`, 1200×630)
- `app/sitemap.ts` → tür başına parçalı sitemap + `sitemap-index.xml`; `lastmod` gerçek `updatedAt`
- `app/robots.ts` (§8.2 ile birlikte)
- RSS + Atom + JSON Feed (`/feed.xml`, `/atom.xml`, `/feed.json`), pillar bazlı feed'ler
- `middleware.ts`: `redirects` koleksiyonundan 301, trailing slash normalizasyonu, www→apex, tek kanonik host
- Yayınlandığında **IndexNow** ping + Google Search Console API bildirimi
- Sayfalama: kanonik + benzersiz `<title>` (`Sayfa 2`), ince içerik `noindex`
- Etiket arşivleri: **10'dan az içerik varsa `noindex`**

### 7.2 JSON-LD (hepsi tipli builder fonksiyonlarıyla, elle string yok)

| Sayfa | Şema |
|---|---|
| Global | `Organization`, `WebSite` + `SearchAction` |
| Makale/rehber | `TechArticle` (+ `author`, `reviewedBy`, `datePublished`, `dateModified`, `citation[]`) |
| Uygulama | `HowTo` + `TechArticle` |
| Sözlük | `DefinedTermSet` / `DefinedTerm` |
| Araç | `SoftwareApplication` + `Review` + `Offer` |
| Ölçüm | `Dataset` + `Observation` |
| Kurs | `Course` + `CourseInstance` + `Syllabus` |
| Yazar | `Person` + `sameAs[]` |
| Tümü | `BreadcrumbList`, uygunsa `FAQPage`, `VideoObject` |

`citation[]` alanı `sources[]`'tan otomatik doldurulur — hem SEO hem GEO için ana kaldıraç.

### 7.3 İç linkleme motoru
Elle iç linke güvenme. Üç kanal: (1) pillar↔cluster↔içerik hiyerarşisi, (2) sözlük terim linkleri, (3) vektör benzerliğine göre "ilgili" bloğu. Editöre yazarken **öneri paneli**. Yetim sayfa (`gelen iç link = 0`) CI'da uyarı, 7 gün sonra hata.

---

## 8. GEO / YZ GÖRÜNÜRLÜK KATMANI

Sitenin en büyük farklılaştırıcısı. Amaç: ChatGPT, Claude, Perplexity, Gemini ve Google AI Overviews yanıtlarında **kaynak olarak gösterilmek**.

### 8.1 Makine okunabilir yüzeyler
- **`/llms.txt`** — site haritası + pillar özetleri + en önemli 50 URL, Markdown
- **`/llms-full.txt`** — tüm yayınlanmış içeriğin düz metni (pillar bazlı bölünmüş: `/llms-full/<pillar>.txt`)
- **`.md` uzantısı ile ham içerik:** her içerik URL'sine `.md` eklenince temiz Markdown döner, `Content-Type: text/markdown`
- **`/api/content`** — açık, sayfalanmış JSON okuma API'si (rate-limited)
- **MCP sunucusu** (`/api/mcp`) — ajanların Sinaptiklab korpusunu arayıp okuyabildiği Model Context Protocol endpoint'i. *TR'de hiçbir içerik sitesinde yok; farklılaşma + PR malzemesi.*

### 8.2 Tarayıcı politikası (`robots.txt`)
Bilinçli karar: **YZ tarayıcılarına izin ver** (görünürlük > kısıtlama).
İzinli: `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-User`, `PerplexityBot`, `Google-Extended`, `Bingbot`, `Applebot-Extended`, `CCBot`, `Amazonbot`, `meta-externalagent`.
Engelli: `/api/`, `/admin/`, `/ara?`, `/*?utm_*`.
WAF'ın bu ajanları bloklamadığını **fiilen doğrula** (curl + user-agent testi, CI'da).

### 8.3 İçerik biçimi kuralları (GEO için zorunlu)
1. **Cevap önce.** Her H2 bölümü doğrudan cevapla başlar.
2. **Çıkarılabilir birimler.** Her bölüm tek konu, 150–300 kelime, bağımsız anlamlı.
3. **Somut sayı + tarih + kaynak.** "Hızlı" değil, "p95 gecikme 340 ms (kendi ölçümümüz, 12 Tem 2026, A100 40GB)".
4. **Stabil çapa.** Her H2/H3'te değişmeyen `id`; başlık değişse bile eski `id` korunur (alias).
5. **Adlandırılmış uzman.** Alıntılar kim söyledi + unvan + kurum.
6. **Terminoloji tutarlılığı.** Aynı kavram her yerde aynı Türkçe terimle (sözlük kanonik).
7. **Sunucu tarafı render.** İçeriğin hiçbir parçası yalnızca client-side JS ile gelmez.
8. **Paywall/login yok** yayın içeriğinde.

### 8.4 Varlık (entity) sinyalleri
`Organization` şeması + tutarlı NAP + `sameAs` (LinkedIn, GitHub, YouTube, X) + Wikidata kaydı + yazarların ORCID/GitHub bağlantıları. Yazar sayfaları gerçek E-E-A-T sayfası.

### 8.5 Ölçüm
`events` koleksiyonuna referrer host; `chatgpt.com`, `perplexity.ai`, `claude.ai`, `gemini.google.com`, `copilot.microsoft.com` ayrı segment. Admin'de **"YZ Görünürlük"** paneli. Haftalık manuel prompt seti (30 soru) ile marka anma/atıf takibi → `geo_audits` koleksiyonu.

---

## 9. PERFORMANS, ERİŞİLEBİLİRLİK, GÜVENLİK

### 9.1 Bütçeler (CI'da zorunlu, aşılırsa build kırılır)

| Metrik | Hedef |
|---|---|
| LCP (mobil, 4G) | ≤ 1.8 s |
| INP | ≤ 150 ms |
| CLS | ≤ 0.02 |
| TTFB (Vercel fra1) | ≤ 200 ms |
| İlk yükte JS (makale sayfası) | ≤ 90 KB gzip |
| Lighthouse: Perf / A11y / Best / SEO | ≥ 95 / 100 / 100 / 100 |
| Toplam sayfa ağırlığı (makale) | ≤ 400 KB |

Yöntem: RSC varsayılan, `"use client"` sadece gerekli yaprak bileşenlerde; Shiki build-time; görseller AVIF + `sizes` + `priority` yalnızca LCP görselinde; üçüncü parti script **sıfır** (analitik self-host).

### 9.2 Erişilebilirlik
WCAG 2.2 AA. Klavye ile tam gezinilebilir, görünür odak halkası (`--sinyal`, 2px offset), `skip to content`, semantik landmark'lar, `aria-live` bildirimler, form hataları programatik ilişkili, `prefers-reduced-motion` saygılı, `lang="tr"`. Playwright + axe-core her PR'da; ihlal = kırmızı.

### 9.3 Güvenlik ve KVKK
- CSP (nonce tabanlı, `unsafe-inline` yok), HSTS, `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` kısıtlı
- Tüm girdiler zod; MDX sanitize; yorum/forum'da XSS koruması + `rehype-sanitize`
- Rate limit: yorum 5/dk, arama 30/dk, API 60/dk (Upstash)
- Auth: OTP + OAuth, session rotasyonu, CSRF
- **KVKK:** aydınlatma metni, açık rıza (bülten ayrı onay), çerez yönetimi (varsayılan **reddet**, yalnızca zorunlu çerez ilk yüklemede), veri işleme envanteri, saklama süreleri, silme talebi akışı (`/hesap/verilerim` → dışa aktar + sil), veri işleyen listesi (Vercel, Atlas, Resend, Upstash) ve yurt dışı aktarım bilgilendirmesi
- Sır yönetimi: `.env` asla commit edilmez; Vercel env; `gitleaks` pre-commit

---

## 10. TOPLULUK, KURSLAR, BÜLTEN

- **Yorumlar:** Auth (ücretsiz üyelik) zorunlu, markdown alt küme, moderasyon kuyruğu, spam skoru, `nofollow ugc` linkler
- **Forum:** kategori → konu → yanıt, upvote, "çözüldü" işareti, kod bloğu, e-posta bildirimi, haftalık özet. SEO: konular indekslenir, ince konular (`yanıt<2 && yaş>30gün`) `noindex`
- **Kurslar:** ders oynatıcı (video + metin + kod + quiz), ilerleme takibi, sertifika (PDF, doğrulanabilir kod), `Course` schema — **tamamı açık, ödeme yok** (bkz. §16 K3)
- **Patikalar:** 6–20 adımlık sıralı rota, her adım bir içerik/ders, ilerleme çubuğu
- **Bülten:** çift opt-in, Resend, React Email şablonu, arşiv sayfaları indekslenir, `/bulten/<sayi>` kanonik

---

## 11. YÖNETİM PANELİ (`/admin`)

Rol tabanlı (`owner|editor|author|moderator`). Özellikler:
- İçerik CRUD, **canlı MDX önizleme** (yan yana), taslak otomatik kaydetme
- Yayın öncesi **kontrol listesi** (§4.3) — her madde yeşil olmadan yayın butonu pasif
- Kaynak yöneticisi (URL yapıştır → başlık/yayıncı/tarih otomatik çek)
- SEO paneli: title/description sayacı, SERP önizleme, kannibalizasyon uyarısı
- İç link önerici (vektör tabanlı)
- Medya kütüphanesi, `alt` zorunlu
- Yorum/forum moderasyonu
- Analitik: içerik performansı, YZ görünürlük paneli, çürüyen içerik listesi (`lastVerifiedAt > 180 gün`)
- Redirect yöneticisi
- İçerik takvimi (planlanan yayınlar)

---

## 12. REPO, ORTAM, DAĞITIM

### 12.1 Yapı
```
sinaptiklab/
├─ app/
│  ├─ (site)/            # genel sayfalar
│  ├─ (admin)/admin/
│  ├─ api/
│  │  ├─ content/ mcp/ og/ webhooks/
│  ├─ sitemap.ts robots.ts opengraph-image.tsx
├─ components/  ui/ content/ mdx/ layout/
├─ lib/
│  ├─ db/ (client, schemas, queries, indexes)
│  ├─ seo/ (metadata, jsonld builders)
│  ├─ geo/ (llms-txt, markdown-export)
│  ├─ mdx/ search/ auth/ email/ analytics/
├─ content-ops/          # editoryal kılavuz, şablonlar
├─ scripts/              # ensure-indexes, seed, backfill-embeddings, link-check
├─ tests/  unit/ e2e/ a11y/
├─ docs/  BRIEF.md ADR/ RUNBOOK.md
└─ .github/workflows/
```

### 12.2 Ortam değişkenleri (`.env.example` olarak commit et)
```
MONGODB_URI= MONGODB_DB=
NEXT_PUBLIC_SITE_URL=https://sinaptiklab.com
AUTH_SECRET= AUTH_GITHUB_ID= AUTH_GITHUB_SECRET= AUTH_GOOGLE_ID= AUTH_GOOGLE_SECRET=
RESEND_API_KEY= NEWSLETTER_FROM=
UPSTASH_REDIS_REST_URL= UPSTASH_REDIS_REST_TOKEN=
BLOB_READ_WRITE_TOKEN=
OPENAI_API_KEY=            # sadece embedding üretimi
REVALIDATE_SECRET= INDEXNOW_KEY=
UMAMI_WEBSITE_ID= UMAMI_SCRIPT_URL=
```

### 12.3 Git ve CI/CD
- Branch: `main` (prod) ← `develop` ← `feat/*`, `fix/*`
- Conventional Commits + `commitlint`; PR şablonu DoD kontrol listesi içerir
- GitHub Actions: `lint → typecheck → unit → build → e2e → a11y → lighthouse-ci`
- Vercel: her PR'a preview; `main` → production; `fra1`
- Migration: `scripts/migrations/<timestamp>-<ad>.ts`, idempotent, `migrations` koleksiyonunda kayıt
- Yedek: Atlas otomatik yedek + haftalık `mongodump` (Vercel Cron → Blob)
- İzleme: Sentry, Vercel Log Drains, uptime kontrolü, kırık link haftalık cron

---

## 13. FAZ PLANI

Her faz: **Girdi → İş → Çıktı → DoD**. DoD karşılanmadan sonraki faz başlamaz. Her faz sonunda `docs/ADR/` altına karar kaydı.

### FAZ 0 — Keşif ve karar kaydı
**İş:** Rakip taraması (en az 10 TR + 10 global; IA, içerik derinliği, şema kullanımı, performans tablosu). Marka token doğrulaması. Pillar/cluster ağacının kesinleştirilmesi. Anahtar kelime + soru havuzu. `docs/ADR/0001` … `0006`.
**DoD:** Rakip karşılaştırma tablosu teslim · pillar/cluster ağacı onaylandı · 6 ADR yazıldı · tüm sayfa tiplerinin kablo çerçeveleri onaylandı.

### FAZ 1 — İskelet
**İş:** Repo, Next.js 16 + TS strict + Tailwind v4, tasarım token'ları, tipografi self-host, layout kabuğu (header/footer/tema anahtarı), MongoDB bağlantısı + `ensure-indexes`, zod şemaları, ESLint/Prettier/Vitest/Playwright, GitHub Actions, Vercel bağlantısı, `.env.example`.
**DoD:** `main` Vercel'de canlı (boş ama gerçek) · CI yeşil · Atlas bağlantısı sağlıklı, index'ler kurulu · Lighthouse ≥ 98 (boş sayfa) · tema anahtarı FOUC'suz.

### FAZ 2 — İçerik motoru
**İş:** `contents` + `authors` + `topics` + `terms` CRUD, MDX derleme hattı, Shiki, ISR + `revalidateTag`, medya yükleme, taslak/yayın durum makinesi, §4.3 doğrulayıcılar, 20 tohum içerik.
**DoD:** Admin'den yayınlanan yazı 5 sn içinde canlıda · doğrulayıcılar eksik içeriği reddediyor · tüm MDX bileşenleri render oluyor · birim testler ≥ %70 kapsam.

### FAZ 3 — Okuma deneyimi
**İş:** Makale/rehber/uygulama şablonları, TOC, sinyal izi, kenar notu sütunu, repro kutusu, kaynaklar, değişiklik günlüğü, SSS, kod bloğu UX, karanlık tema, mobil düzen, a11y geçişi.
**DoD:** Lighthouse Perf ≥ 95 / A11y 100 (gerçek makale) · axe ihlali 0 · klavyeyle baştan sona gezilebiliyor · `prefers-reduced-motion` doğrulandı · 3 gerçek cihazda ekran görüntüsü.

### FAZ 4 — SEO katmanı
**İş:** `generateMetadata`, canonical, dinamik OG, sitemap(ler), robots, RSS/Atom/JSON Feed, JSON-LD builder'ları (§7.2 tamamı), breadcrumb, redirect middleware, IndexNow, pillar/cluster hub sayfaları, sayfalama kanoniği.
**DoD:** Rich Results Test tüm şema tiplerinde hatasız · sitemap GSC'de doğrulandı · her sayfa tipinde canonical/hreflang doğru · 0 kırık link · SEO Lighthouse 100.

### FAZ 5 — GEO katmanı
**İş:** `/llms.txt`, `/llms-full/*`, `.md` route'ları, `/api/content`, `/api/mcp`, robots YZ politikası + fiili doğrulama, `answerFirst` bloğu, stabil çapa + alias, AI referrer segmentasyonu, GEO denetim paneli.
**DoD:** `curl -A "GPTBot"` ile 5 sayfa 200 · `.md` çıktısı temiz ve eksiksiz · MCP endpoint bir ajandan arama+okuma yapabiliyor · `llms.txt` spesifikasyona uygun · admin'de AI referral segmenti veri gösteriyor.

### FAZ 6 — Keşif ve arama
**İş:** Atlas Search (TR analyzer, eşanlamlı, yazım toleransı), arama sayfası + filtreler, Vector Search ile ilgili içerik, embedding backfill, otomatik terim linkleme, sözlük sitesi, yetim sayfa raporu.
**DoD:** TR sorgular doğru sonuç veriyor · arama p95 < 300 ms · ilgili içerik alaka ≥ 4/5 · terim linkleme yanlış pozitif < %2.

### FAZ 7 — Kimlik, topluluk, bülten
**İş:** Auth.js, profil, yorumlar + moderasyon, forum (davetli başlangıç — K5), bülten (çift opt-in + arşiv), bildirimler, rate limiting, KVKK akışları, çerez yönetimi.
**DoD:** Kayıt→yorum→moderasyon E2E yeşil · forum konusu indekslenebilir + ince konu `noindex` · çift opt-in doğrulandı · KVKK sayfaları ve veri silme akışı çalışıyor · rate limit yük testinde tuttu.

### FAZ 8 — Kurslar ve laboratuvar
**İş:** Kurs/ders/patika modelleri, ders oynatıcı, ilerleme, quiz, sertifika, `Course` schema, notebook/StackBlitz gömme, `lab` içerik tipi. (Ödeme yok — K3.)
**DoD:** Uçtan uca kurs tamamlanıp sertifika üretiliyor · `Course` rich result geçerli · lab embed'leri mobilde çalışıyor.

### FAZ 9 — Sertleştirme ve lansman
**İş:** CSP + güvenlik başlıkları, Sentry, log drain, yedekleme cron'u, yük testi (k6, 500 eşzamanlı), 404/500, RUNBOOK, lansman kontrol listesi, GSC/Bing doğrulama, sitemap gönderimi, `sameAs` bağlama.
**DoD:** securityheaders.com A+ · yük testinde p95 < 500 ms · Sentry'de kritik hata 0 · tüm bütçeler CI'da zorunlu · lansman listesi tamam.

### FAZ 10 — Sürekli içerik operasyonu (lansman sonrası)
İçerik takvimi (pillar başına haftalık kota), çürüyen içerik döngüsü (180 gün), aylık GEO denetimi, üç aylık teknik SEO denetimi, İngilizce ayna (`/en`) kararı.

---

## 14. YASAKLAR

Kod incelemesinde otomatik ret sebepleri:
1. Mor/camgöbeği gradyan, parlayan küre, "AI" görselleri, stok robot fotoğrafı
2. `any` tipi, `@ts-ignore`, doğrulanmamış `process.env` erişimi
3. Bileşende doğrudan hex/px değeri (token dışı)
4. Client component içinde DB erişimi veya sır kullanımı
5. `useEffect` ile veri çekme (RSC/Server Action varken)
6. Üçüncü parti script eklemek (onay olmadan)
7. Kaynaksız sayı veya tarihsiz iddia içeren içerik
8. Modal/pop-up bülten formu, çerez duvarı, otomatik oynayan ses
9. `localStorage`'a kritik durum yazmak
10. Bir fazın DoD'si karşılanmadan sonrakine geçmek

---

## 15. HER FAZ SONU RAPOR FORMATI

```
## Faz <n> — <ad>
Durum: Tamam / Kısmi
Yapılanlar: <madde madde, commit hash'leriyle>
DoD kontrolü: <her madde ✅/❌ + kanıt (çıktı, skor, ekran görüntüsü yolu)>
Ölçümler: LCP / INP / CLS / JS boyutu / Lighthouse 4'lü
Açık riskler: <madde + önerilen aksiyon>
Onay bekleyen kararlar: <soru listesi>
Sonraki faz için hazırlık: <ön koşullar>
```

---

## 16. KARAR GÜNLÜĞÜ (açık kararlar 2026-08-08'de kullanıcı onayıyla kapandı)

| # | Karar | Sonuç | ADR |
|---|---|---|---|
| K1 | Domain | **sinaptiklab.com**, apex kanonik, www→apex 301 | [0002](ADR/0002-domain-kanonik-host.md) |
| K2 | Dil stratejisi | **TR-öncelikli**; EN altyapısı (i18n şeması, hreflang, /en iskeleti) gün 1'den hazır, EN içerik kararı Faz 7+ | [0003](ADR/0003-dil-stratejisi.md) |
| K3 | Erişim / gelir modeli | **Tüm içerik açık ve ücretsiz; ödeme altyapısı YOK.** Ücretsiz üyelik → yorum + sonradan belirlenecek üye özellikleri. §8.3/8. madde (paywall yok) olduğu gibi geçerli. | [0004](ADR/0004-erisim-uyelik-modeli.md) |
| K4 | Forum zamanlaması | Faz 7'de, **davetli başlangıç** (brief önerisi kabul edildi) | [0004](ADR/0004-erisim-uyelik-modeli.md) |
| K5 | Yazar kadrosu | **Tek yazar (Şükrü Yusuf Kaya) + teknik editör**; konuk yazar programı ~30 içerik sonrası davetle | [0005](ADR/0005-yazar-modeli-eeat.md) |

---

*Şükrü Yusuf Kaya · alfitechnology.com*
