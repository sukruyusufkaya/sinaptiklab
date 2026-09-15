# Sinaptik Lab — Master Plan

> Bu doküman, kurucunun 11 Eylül 2026'da verdiği 135 maddelik platform, SEO, GEO, içerik,
> ürün ve büyüme planının çalışma sürümüdür. **Projenin anayasasıdır**: mimari kararlar
> buraya dayandırılır, buradan sapılacaksa gerekçesi bir ADR ile yazılır.
>
> Tek istisna: §93'teki veri tabanı önerisi (PostgreSQL + headless CMS). Kurucu kararı
> **MongoDB + Vercel** olduğu için o madde geçersizdir — bkz. `docs/ADR/0001-yigin.md`.

---

## Bölüm A — Konumlandırma ve marka

### §1 Yönetici özeti

Sinaptik Lab "yapay zekâ hakkında içerik üreten bir site" değildir. Doğru konumlandırma:
**yapay zekâ dünyasında ne olduğunu anlamak, bir konuyu öğrenmek, bilgiyi doğrulamak ve
bunu gerçek bir projeye dönüştürmek isteyen kişinin başladığı platform.**

Dört ihtiyacın kesişimi: **Discover → Understand → Learn → Build**

| Katman     | Kullanıcı ihtiyacı      | Ürün                                |
| ---------- | ----------------------- | ----------------------------------- |
| Discover   | Ne oldu?                | Haber / Radar / Brief / Dergi       |
| Understand | Bu nedir, neden önemli? | Atlas / Rehber / Modeller / Araçlar |
| Learn      | Nasıl öğrenirim?        | Academy / Öğrenme yolları / Testler |
| Build      | Nasıl uygularım?        | Lab / Danışmanlık / Eğitim / Proje  |

Büyüme döngüsü (flywheel): Haber → Kavram → Derin analiz → Öğrenme yolu → Test → Üyelik →
Newsletter → Workshop/Eğitim → Danışmanlık → Vaka çalışması → Yeni içerik → Otorite.

### §2 Marka konumlandırması

Marka vaadi: **"Yapay zekâyı takip et. Anla. Öğren. Uygula."**
İngilizce: _AI Intelligence. Knowledge. Learning. Execution._

Hedeflenen algı: AI medya platformu + knowledge platformu + academy + research hub +
danışmanlık + topluluk. Referans bileşim: MIT Technology Review + DeepLearning.AI +
Hugging Face Learn + danışmanlık şirketi + dijital akademi.

### §3 Marka mimarisi

Sinaptik **News · Atlas · Academy · Magazine · Research · Enterprise · Community**.
Ayrı domain **kullanılmaz**; tamamı `sinaptiklab.com/...` altındadır — domain authority
parçalanmamalıdır.

### §4 Ana menü

`Gündem | Keşfet | Öğren | Dergi | Araştırma | Kurumsal | Topluluk`
Sağda: Ara · Giriş Yap · Üye Ol. Üstte ince utility bar: AI Radar · Haftalık Bülten ·
Etkinlikler · TR/EN.

### §5 Gündem mega menü

Son Haberler `/gundem/` · Yapay Zekâ `/gundem/yapay-zeka/` · LLM `/gundem/llm/` ·
AI Agent `/gundem/ai-agent/` · Robotik `/gundem/robotik/` · Araştırma
`/gundem/arastirma/` · Şirketler (OpenAI, Google DeepMind, Anthropic, Meta, Microsoft,
NVIDIA, xAI, Mistral, Hugging Face) · Startup `/gundem/startuplar/` · Türkiye
`/gundem/turkiye/` · Regülasyon `/gundem/regulasyon/` · AI Business
`/gundem/is-dunyasi/` · Haftanın Özeti `/gundem/haftanin-ozeti/`.

### §6 Keşfet — SEO motoru

Gündem trafik sağlar, **Keşfet otorite yaratır**. Üç içerik ailesi: Kavramlar, Rehberler,
Varlıklar (model/araç/şirket).

### §7 AI Atlas

Platformun Wikipedia benzeri bilgi grafiği. `/atlas/<kavram>/`. Girdi şablonu:
kısa tanım → 30 saniyede → nasıl çalışır → mimari → alt kavramlar → karşılaştırma →
avantaj/dezavantaj → kullanım alanları → diyagram → kod örneği → gerçek örnekler →
ilgili kavramlar/dersler/haberler/araştırmalar/test soruları.

Açık tanım, tek URL'de tek ana konu, entity tutarlılığı ve bağımsız doğrulanabilirlik
AI grounding/citation görünürlüğü açısından belirleyicidir.

### §8 Atlas konu taksonomisi (14 küme)

1. Artificial Intelligence · 2. Machine Learning · 3. Deep Learning · 4. Generative AI ·
5. Large Language Models · 6. AI Agents · 7. Computer Vision · 8. NLP · 9. Robotics ·
10. Data Science · 11. AI Infrastructure · 12. MLOps/LLMOps · 13. AI Security ·
14. Responsible AI.

### §9 Konu ≠ format

CMS'de **Topic** ve **Content Type** ayrı alanlardır. `/konu/rag/` hub'ı otomatik olarak
RAG haberleri, rehberleri, dersleri, araştırmaları, testleri ve projelerini toplar.

### §10 İçerik formatları

News · Analysis · Guide · Atlas Entry · Tutorial · Research · Report · Benchmark ·
Dataset · Tool Page · Model Page · Comparison · Case Study · Lesson · Learning Path ·
Quiz · Magazine Article · Opinion · Interview · Video.

---

## Bölüm B — Ana sayfa

### §11–18 Ana sayfa modülleri

- **Hero**: H1 "Yapay Zekânın Nabzını Tut." + CTA "Bugünün AI Gündemi" / "Öğrenmeye Başla";
  sağda **Sinaptik AI Radar** (editoryal kontrollü, dinamik).
- **Bugünün AI Gündemi**: büyük manşet + dört küçük haber; filtreler Tümü · Modeller ·
  Araştırma · Business · Robotik · Türkiye.
- **Sinaptik Brief**: günlük 5 maddelik özet; aynı içerik e-bültene gider.
- **Sinaptik Radar**: teknoloji momentum tablosu; arkasında yayın sayısı, research trend,
  GitHub aktivitesi, model çıkışları, arama ilgisi, yatırım haberleri. İleride
  **Sinaptik AI Trend Index**.
- **Derinlemesine**: thought leadership analizleri.
- **AI Atlas modülü**: "Bir kavram öğren" + 30 saniyelik açıklama.
- **Öğrenme yolları**: 7 rota kartı.
- **Seviyeni Ölç**: 15 soruluk AI Knowledge Test → sonuç → önerilen öğrenme yolu.
  SEO → engagement → registration → personalization hunisi.

### §19–21 Varlık sayfaları

- **Modeller** `/modeller/<model>/`: geliştirici, tip, yayın tarihi, bağlam, API, açık
  kaynak; özet, yetenekler, benchmark, fiyatlandırma, kullanım alanları, limitations,
  güncelleme geçmişi, ilgili haberler, karşılaştırmalar.
- **Karşılaştırma** `/karsilastir/<a>-vs-<b>/`: reasoning, coding, context, multimodal,
  speed, API cost, benchmark, enterprise, privacy. Programatik üretilebilir **ancak**
  editoryal değer taşımalıdır; katma değersiz kitlesel üretim yapılmaz.
- **Araçlar** `/araclar/`: editoryal seçki. Her araç için ne işe yarar, kim kullanmalı,
  en iyi kullanım alanı, alternatifler, fiyat, avantaj/dezavantaj, Sinaptik değerlendirmesi.

---

## Bölüm C — Öğrenme sistemi

### §22–24 Öğren

`/ogren/` bir LMS mantığıyla tasarlanır. Kullanıcı **rol** (öğrenci, yazılımcı, veri
bilimci, yönetici, girişimci, pazarlamacı), **seviye** ve **hedef** seçer; sistem rota
üretir. Her bölüm **Theory → Example → Lab → Quiz → Project** döngüsüyle ilerler.

Roadmap'ler düz liste değil **DAG**'dır (skill graph): sistem "kullanıcı RAG öğrenmek
istiyor ama embedding bilgisi eksik" tespitini yapabilmelidir.

Örnek rota — Generative AI Engineer (13 bölüm): AI Fundamentals → ML Basics → Deep
Learning → Transformers → LLM Fundamentals → Prompt Engineering → Embeddings → Vector
Databases → RAG → Fine-Tuning → Evaluation → AI Agents → LLMOps.

### §25–27 Testler

12 kategori: AI Fundamentals, Machine Learning, Deep Learning, Generative AI, Prompt
Engineering, LLM, RAG, AI Agent, Computer Vision, Python, Data Science, AI Ethics.

Her soru metadata taşır: Question ID, Topic, Subtopic, Difficulty, Skill, Question,
Correct Answer, Explanation, Related Lesson, Related Atlas Entry.

**Testler JS içine gizlenmez.** `/test/<slug>/` sayfasında testin ne olduğu, kimin
çözmesi gerektiği, ölçülen beceriler, örnek sorular, öğrenme hedefleri ve sonuç
seviyeleri crawl edilebilir olmalıdır. `Quiz`, `Question`, `Answer`, uygun durumda
`QAPage` şemaları kullanılır.

### §28 Sinaptik Academy

Üç katman: **Learn** (ücretsiz mikro dersler) · **Path** (yapılandırılmış rotalar) ·
**Programs** (premium programlar: Generative AI Developer, AI Agent Engineer, Computer
Vision, AI for Executives).

---

## Bölüm D — Dergi ve araştırma

### §29–31 Dergi

**Sinaptik Magazine**. Sayı landing page `/dergi/2026-ekim/`, her yazının ayrı HTML
adresi `/dergi/2026-ekim/agentic-ai-donemi/`. PDF **ikincil** dağıtım formatıdır;
içerik PDF'e hapsedilmez.

### §32–35 Araştırma

`/arastirma/` altında Reports · Benchmarks · Datasets · Surveys · AI Index ·
Whitepapers · Industry Reports.

GEO'nun en değerli stratejisi: **başka sitelerin kaynak göstermek zorunda kalacağı veri
üretmek.** Hedef yayınlar: Türkiye AI Adoption Index, Generative AI Kullanımı, AI Salary
Report, AI Agent Adoption Report, Türkçe LLM Benchmark, Turkish RAG Benchmark, Turkish
Hallucination Benchmark, Enterprise AI Readiness Index.

Dataset sayfası: ad, açıklama, versiyon, lisans, üretim yöntemi, kolonlar, örnek kayıt,
sınırlamalar, atıf formatı, indirme, changelog + `Dataset`/`DataDownload` şeması.

Benchmark yayınının **metodoloji sayfası zorunludur** (`/metodoloji/model-benchmark/`):
test datası, tarih, model versiyonu, temperature, prompt, evaluation method, sample
count, limitations.

---

## Bölüm E — Kurumsal

### §36–40 Enterprise

`/kurumsal/` — "Yapay zekâyı gerçek iş sonuçlarına dönüştürün."

Hizmetler: AI Strategy & Transformation · AI Readiness Assessment · Generative AI
Solutions · RAG Systems · AI Agents & Automation · Computer Vision · Predictive AI ·
AI Governance · LLMOps/MLOps · Kurumsal Eğitim.

Hizmet sayfası şablonu: Problem → Çözüm → Kullanım alanları → Mimari → Güvenlik →
Yaklaşımımız (Discovery → Assessment → Prototype → PoC → Production → Monitoring) →
Vaka çalışmaları → SSS → CTA.

Sektör sayfaları `/sektor/<sektor>/`: finans, sağlık, üretim, enerji, lojistik,
perakende, inşaat, madencilik, turizm, eğitim. Her biri kullanım alanları, potansiyel
projeler, teknolojiler, riskler, vakalar, ilgili içerik ve eğitimleri sunar.

Vaka çalışması formatı: Problem → Mevcut durum → Veri → Yaklaşım → Mimari → Teknoloji →
Model → Entegrasyon → Güvenlik → Sonuç → Öğrenilen dersler → Ölçülebilir etki.

### §41–43 Lab ve Copilot

`/lab/`: AI Experiments, Open Source, Demos, Benchmarks, Playground, Datasets, Research.

İnteraktif araçlar (linkable assets): Token Calculator, LLM Cost Calculator, Context
Window Calculator, GPU Memory Calculator, RAG Chunk Calculator, AI Readiness Calculator,
Prompt Tokenizer, Model Selector, AI ROI Calculator, Embedding Visualizer.

**Sinaptik Copilot**: kendi knowledge base'i üzerinde RAG ile cevap verir ve cevabın her
bölümünde Sinaptik kaynaklarını gösterir — chatbot trafiği öldürmez, keşif motoru olur.

---

## Bölüm F — SEO mimarisi

### §44 Temel

Organik büyümenin dayanağı: **topic authority + information architecture + technical
excellence + original content**. AI Overviews / AI Mode için özel bir GEO markup
gerekmez; sayfanın önce indekslenebilir ve snippet göstermeye uygun olması gerekir.
**SEO temeldir; GEO onun üzerinde çalışan bilgi mimarisidir.**

### §45–46 URL standardı

Kısa, kalıcı, okunabilir: `/atlas/rag/`, `/rehber/rag-mimarisi/`, `/haber/...`,
`/ogren/rag/`. Haber dışında URL'ye **tarih konmaz**; yayın tarihi metadata'dadır.

### §47–49 Hub, iç linkleme, breadcrumb

`/konu/<konu>/` kategori çöplüğü değil editoryal landing page'dir: tanım, öne çıkan
rehber, son haberler, araştırmalar, modeller, dersler, test, projeler, ilgili kavramlar.

İç linkleme "ilgili yazılar" değil **semantic knowledge graph**'tir; CMS'de
`related concepts` alanı bulunur. Breadcrumb + `BreadcrumbList` şeması uygulanır.

### §50 Sitemap

`sitemap-index.xml` altında: news, atlas, guides, research, academy, magazine, models,
tools, video, authors. News sitemap **yalnızca son iki günün** haberlerini tutar.
Tek dosya sınırı 50.000 URL / 50 MB.

### §51–52 Faceted navigation ve canonical

`?topic=`, `?level=`, `?format=`, `?year=` kombinasyonları indekslenmez; **curated
hub'lar indekslenir, kullanıcı filtreleri indekslenmez.** Her içeriğin tek canonical
URL'si vardır (pagination, tracking parametreleri, bülten linkleri, filtreler, PDF/HTML
kopyaları dahil).

### §53–54 Performans ve render

Eşik: LCP ≤ 2.5s · INP ≤ 200ms · CLS ≤ 0.1. **İç hedef: LCP < 2.0s · INP < 150ms ·
CLS < 0.05.** Haber, Atlas, rehber, dergi, kurs ve model sayfaları SSR/SSG/ISR ile
gerçek HTML olarak gönderilir; salt client-side rendering'e bağımlı yapı kurulmaz.

---

## Bölüm G — GEO

### §55–57 Yaklaşım

Temel soru: **"Bir LLM bu sayfayı okuduğunda hangi cümleyi güvenle cevap olarak
kullanabilir?"** Her içerikte citation-ready bloklar bulunur.

**Answer first**: sayfa 500 kelimelik girizgâhla başlamaz; ilk bölüm tek cümlelik tanımdır.

Evergreen şablon: Tanım → Kısa cevap → Temel noktalar → Nasıl çalışır → Mimari → Örnek →
Kullanım alanları → Avantajlar → Dezavantajlar → Karşılaştırma → Teknik detay → SSS →
Kaynaklar → Güncelleme geçmişi.

### §58–59 Entity-first ve kanıt

İlk kullanımda bağlam verilir: "Anthropic tarafından geliştirilen Claude…",
"Google DeepMind tarafından geliştirilen Gemini…". Kişi, organizasyon, ürün ve konum
adlarının açık ve tutarlı tanımlanması grounding doğruluğuna yardım eder.

Sayısal iddia formatı: ❌ "Model X %30 daha iyi" · ✅ "Model X, Y benchmarkında 84.3
skor elde etti" + kaynak (paper, resmî dokümantasyon, teknik rapor, mevzuat, birincil
röportaj, dataset).

### §60–61 Tazelik ve sürüm

Sayfada "İlk yayın" ve "Son güncelleme" gösterilir. **İçerik değişmeden tarih
güncellenmez** — yanıltıcı freshness davranışıdır. Model sayfaları, benchmark,
regülasyon ve teknik rehberlerde **güncelleme geçmişi** (v1.3 — tarih — ne değişti)
tutulur.

### §62–65 E-E-A-T ve editoryal şeffaflık

Her makalenin yazarı görünür ve `/yazar/<slug>/` profiline bağlanır (bio, uzmanlık,
eğitim, deneyim, yayınlar, sosyal profiller). Gerektiğinde ayrı **teknik / hukuki /
tıbbi reviewer** — bu yalnızca schema için değil gerçek editoryal süreç olmalıdır.

Footer'da: Editoryal İlkeler, Kaynak Politikası, Düzeltme Politikası, AI Kullanım
Politikası, Reklam Politikası, Sponsorluk Politikası, Etik İlkeler.

AI politikası metni: _"Yapay zekâ araçları araştırma, transkripsiyon, editoryal destek
veya metin geliştirme amacıyla kullanılabilir. Yayınlanan içeriklerden editoryal ekip
sorumludur ve içerikler insan incelemesinden geçer."_

### §66–68 Structured data

Ana sayfa `Organization` + `WebSite` + `SearchAction` · Haber `NewsArticle` +
`Person` + `Organization` + `BreadcrumbList` · Rehber `Article` · Yazar `ProfilePage` +
`Person` · Kurs `Course` + `ItemList` · Eğitim materyali `LearningResource` · Test
`Quiz`/`Question`/`Answer` · Veri seti `Dataset` + `DataDownload` · Video `VideoObject` ·
Etkinlik `Event` · Forum `DiscussionForumPosting` · Soru-cevap `QAPage`.

**Uyarı:** schema "Google'a bunu göster" komutu değil "bu verinin ne olduğunu tarif
ediyorum" mekanizmasıdır. Markup **görünür içerikle birebir** uyumlu olmalıdır.

Her makalede metadata: headline, alternativeHeadline, description, author, reviewer,
datePublished, dateModified, category, topic, difficulty, estimatedReadingTime, sources,
relatedEntities, prerequisites, learningOutcome, keywords.

---

## Bölüm H — Sistem ve operasyon

### §69 İçerik modeli (entity'ler)

Content · Topic · Person · Organization · Model · Tool · Technology · Course · Lesson ·
LearningPath · Quiz · Question · MagazineIssue · ResearchReport · Dataset · Benchmark ·
Service · Industry · CaseStudy.

Bu yaklaşım platformu "page database" değil **AI knowledge graph** yapar.

### §70–71 Arama

Keyword + semantic + entity + content-type araması birlikte desteklenir (lexical +
vector + hybrid ranking + reranking). Sonuç arayüzü tüm ürünleri bağlar: Kavram · Öğren ·
Haber · Modeller · Araştırma · Kurumsal.

### §72 Kişiselleştirme

Onboarding: kimsin (developer/manager/student/founder/researcher), seviyen, ilgi
alanların. Ana sayfada "Senin İçin" alanı. **Kişiselleştirme SEO içeriğinin yerine
geçmez**; canonical URL herkes için crawl edilebilir temel içerik taşır.

### §73–74 Newsletter

Segmentli: Sinaptik **Daily** · **Weekly** · **Research** · **Enterprise**.
CTA "bültenimize kayıt olun" değil: _"Yapay Zekâ Dünyasında Önemli Bir Şeyi Kaçırma —
haftanın en önemli gelişmelerini 5 dakikada oku."_

### §75–76 Topluluk ve kariyer

Önce Expert Profiles, Events, Q&A, Newsletter, LinkedIn; sonra Discussions, Projects,
Study Groups. `/kariyer/`: AI Engineer, ML Engineer, AI PM, Prompt Engineer, AI Agent
Developer, CV Engineer, MLOps Engineer — her biri için ne yapar, beceriler, roadmap,
teknoloji, maaş araştırması, kurslar, test, iş ilanları.

### §77–78 Intent hunisi

"RAG nedir" → Atlas · "RAG nasıl yapılır" → Guide · "RAG Python tutorial" → Tutorial ·
"RAG eğitimi" → Academy · "Kurumsal RAG sistemi" → Enterprise.

Her içerik tek intent'e bağlanır: Informational · Educational · Comparative · Technical ·
Commercial Investigation · Transactional · Navigational. Karıştırılmaz; ayrı URL açılır.

### §79 Sinaptik Content Quality Score

Originality · Expertise · Evidence · Depth · Clarity · Search Intent Match · GEO
Readability · Internal Linking · Multimedia · Freshness — her biri 0–5, toplam **/50**.
**35 altı içerik yayınlanmaz.**

### §80–84 Haber politikası

Haber şablonu: Ne oldu? → Neden önemli? → Teknik detay → Kimleri etkiliyor? → Sinaptik
yorumu → Kaynak. **"So what?" ilkesi**: her haber "peki bunun anlamı ne?" sorusuna cevap
verir. Haber yayımlandığında entity'ler bağlanır ve `/sirketler/<sirket>/` sayfaları
otomatik güncellenir. Bilgi grafiği ilişkisi: company → model → benchmark → technology →
tutorial → use case.

### §85 Dil stratejisi

Türkçe root (`sinaptiklab.com/rag-nedir/`), İngilizce `/en/what-is-rag/`. Her dil için
ayrı URL, gerçek lokalizasyon, hreflang, canonical ve ayrı keyword research.
**Makine çevirisiyle yüz binlerce sayfa açılmaz.**

### §86 Programmatic SEO

Yalnızca **database + unique data + useful comparison** varsa: model, araç, şirket,
benchmark, karşılaştırma sayfaları. %95 aynı template'li binlerce düşük değerli URL
üretilmez.

### §87–91 Dağıtım

Dijital PR: original research, reports, surveys, benchmarks, data viz, infographics,
interactive tools, expert commentary + gazetecinin kullanabileceği **Sinaptik Data**
alanı. Amiral gemisi: **State of AI Türkiye** yıllık raporu.

Her uzun içerik LinkedIn post, X thread, Instagram carousel, Reels script, newsletter
bloğu ve kısa videoya dönüşür; kaynak her zaman **canonical Sinaptik article**'dır.

Video: kritik evergreen sayfalarda video + HTML transcript + `VideoObject`.
Podcast (**Sinaptik Sessions**): her bölüm `/podcast/...` altında video, transcript,
key takeaways, entity'ler ve kaynaklarla yayımlanır.

### §92 Footer

Keşfet · Öğren · Research · Sinaptik · Enterprise · Legal sütunları.

---

## Bölüm I — Teknoloji ve tasarım

### §93 Teknoloji mimarisi

- **Frontend:** Next.js tabanlı SSR/SSG/ISR.
- **Veri:** _Plan PostgreSQL + pgvector + headless CMS (Sanity/Payload) öneriyordu._
  **Kurucu kararı MongoDB + Vercel'dir; bu madde geçersizdir.**
- **Arama:** lexical + vector hibrit.
- **CDN / edge:** Vercel.
- **Object storage:** S3 uyumlu.

### §94–95 CMS

Editör alanları: Title, Slug, Summary, Answer Summary, Key Takeaways, Topic, Subtopics,
Entities, Content Type, Author, Reviewer, Sources, Published, Updated, Difficulty,
Audience, Related Content, Learning Outcome, SEO Title, Meta Description, OG Image.
Schema CMS'ten otomatik üretilir.

AI asistanı önerir (eksik iç link, entity çıkarımı, kaynak kontrol listesi, başlık, meta
description, SSS, schema doğrulama, content decay). **AI publish butonu yoktur.**

### §96–97 Content decay

Freshness Risk puanlaması (ör. "GPT-4 rehberi: High", "Transformer nedir: Low",
"API pricing: Critical") + uyarı üretimi. **"Son doğrulama"**, "son güncelleme"den ayrı
bir alandır.

### §98–101 Ölçüm

GSC · Bing Webmaster Tools · GA4 · product analytics · Web Vitals · error monitoring ·
server analytics · newsletter analytics · CRM.

GEO analytics artık teoriktir değil: Google Search Console generative AI görünürlük
raporu ve Bing Webmaster Tools **AI Performance** raporu takip edilir (AI citations,
cited pages, cited topics, AI referral traffic).

Sinaptik Visibility Dashboard: Search Visibility · GEO Visibility · Authority · Audience ·
Learning · Business.

**North Star üçlüsü:** Knowledge Reach · Knowledge Authority · Knowledge Conversion.
Platform yalnızca pageview ile yönetilmez.

### §102–104 Huniler

**B2B:** arama → makale → AI Readiness Test → skor → PDF için e-posta → enterprise
newsletter → vaka → workshop → PoC → production.
**B2C:** arama → Atlas → quiz → signup → ders → learning path → academy → premium.

AI Readiness boyutları: Strategy, Data, Infrastructure, Talent, Governance, Use Cases,
Security → 100 üzerinden skor + maturity seviyesi + öneriler.

### §105–106 Monetizasyon ve bağımsızlık

Reklam bağımlı değil: AI Consulting · AI Projects · Corporate Training · Academy ·
Membership · Premium Reports · Sponsorship (seçici) · Events · Data/Research Licensing ·
Recruitment.

Sponsorlu içerik açıkça **"Sponsorlu"** işaretlenir. Müşteri olduğu için "en iyi AI
şirketi" yazılmaz. Research ve benchmark ticari müşterilerden bağımsız yürütülür.

### §107–113 Tasarım

Yön: **Editorial × Scientific × Futuristic**. Ne "AI neon cyberpunk" klişesi ne de aşırı
kurumsal. Güçlü tipografi, geniş whitespace, veri görselleştirme, grid, subtle gradient,
koyu/açık tema, micro-interaction, temiz diyagramlar, data card'lar, monospace vurgular.

Grid: 1440px, 12 kolon; hero 60/40; mobil tek kolon. Kart sistemleri (News, Analysis,
Learning, Data, Model, Research) aynı design system altında farklılaşır.

Renk: background çok açık neutral veya deep dark; primary electric indigo/violet;
secondary cyan/teal; accent signal lime veya amber — çok kontrollü. **10 farklı neon
renk kullanılmaz.** His: bilimsel + premium + teknolojik.

Dark mode UX ürünüdür (System/Light/Dark saklanır). Erişilebilirlik ilk günden: klavye
navigasyonu, ARIA, focus state, kontrast, alt text, caption, transcript, semantic HTML.

Görseller anlamlı dosya adı + alt + caption taşır; teknik diyagramlar SVG'dir ve
**Sinaptik visual assets** haline gelir (alıntılandıkça backlink kaynağı).

### §114–115 Ana sayfa akışı

Header → Hero + AI Radar → Bugünün AI Gündemi → Sinaptik Brief → Derin Analizler →
AI Atlas → Trend Teknolojiler → AI Model Watch → Learning Paths → Seviyeni Ölç →
Research & Reports → Magazine → Lab Projects → Sektörlerde AI → Enterprise →
Newsletter → Expert Contributors → Footer.

Mobil: logo/search/menu → hero → 3 top story → Brief → konu keşfi → learning card →
radar. **Sonsuz haber feed'i değil, seçilmiş keşif deneyimi.**

### §116–118 Arama ve içerik zekâsı

Command palette (⌘K) gruplu sonuç verir. **Zero-result sorgular kaydedilir** ve
editoryal yol haritasını besler. Content Intelligence panosu: trending queries, declining
pages, zero-result searches, high impression/low CTR, high citation/low traffic, content
gaps, internal link opportunities, old content, weak topic clusters.

---

## Bölüm J — Yürütme

### §119–121 Editoryal organizasyon ve akış

Roller: Editor-in-Chief, AI News Editor, Research Editor, Technical Editor, Learning
Designer, Data Journalist, Video Editor, SEO/GEO Lead, Researcher, Expert Contributors.

**Haber akışı:** Discover → Verify → Primary Source → Draft → Technical Context →
Fact Check → Entities → Internal Links → Schema → Publish → Distribution → Update.

**Evergreen akışı:** Topic Gap → User Intent → Entity Map → SERP/AI Answer Analysis →
Primary Sources → Expert Contribution → Content Architecture → Original Visual →
Internal Linking → Schema → Publish → Measurement → Refresh. (Keyword'den başlamaz.)

### §122–124 İlk 1.000 URL portföyü

250 Atlas · 150 evergreen rehber · 150 haber/analiz · 100 model/araç/şirket entity ·
100 öğrenme kaynağı · 100 test/eğitim · 50 araştırma/veri · 50 sektör/business ·
25 vaka/hizmet · 25 dergi/editoryal. (Katı kota değil, portföy mantığı.)

İlk pillar'lar: Generative AI, LLM, AI Agents, RAG, Machine Learning, Deep Learning,
Computer Vision, AI Automation, MLOps, AI Security, AI for Business, AI Governance.
Her pillar için: 1 pillar page, 10–30 Atlas girdisi, 10 rehber, 5–10 haber/analiz,
1 learning path, 1 test, 1 özgün görsel.

**Boş kategori açılmaz:** bir kategori, anlamlı minimum içerik kümesi oluşmadan menüde
görünmez.

### §125–127 Faz planı

1. **Foundation** — brand system, taxonomy, URL mimarisi, CMS şeması, design system,
   teknik SEO, analytics.
2. **Authority Base** — AI Atlas, pillar rehberler, yazarlar, editoryal politikalar,
   haber masası.
3. **Engagement** — testler, öğrenme yolları, newsletter, arama.
4. **Original IP** — raporlar, benchmarklar, veri setleri, araçlar.
5. **Revenue** — kurumsal hizmetler, vaka çalışmaları, eğitim, AI readiness.

6–12 ay: personalized feed, Copilot, academy dashboard, skill graph, sertifikalar, model
veritabanı, benchmark motoru, topluluk, etkinlikler, enterprise dashboard.

### §128–129 Moat ve temel prensip

Savunulabilir avantaj beş şeydir: **Knowledge Graph · Original Data · Expert Network ·
Learning Graph · Enterprise Experience.** Haber ve blog moat değildir.

En önemli prensip: içerik organizasyonu "hangi kategoride yazı yayınlayalım?" sorusundan
değil **"yapay zekâ bilgisini nasıl modellenebilir bir yapıya dönüştürürüz?"** sorusundan
başlar. Site mimarisinin temel nesnesi **article değil entity**'dir. Article entity
hakkında bilgi verir, Lesson öğretir, Quiz ölçer, News değişimi bildirir, Research yeni
bilgi üretir, Consulting gerçek dünyaya uygular.

### §130 Nihai menü

Bkz. `lib/rotalar.ts` — gezinme mimarisinin tek kaynağı.

### §131 Tek cümlede

_AI dünyasında yaşananları Gündem ile yakalayan, Atlas ile açıklayan, Academy ile
öğreten, Research ile yeni bilgi üreten, Magazine ile yorumlayan ve Enterprise ile
gerçek dünyaya uygulayan bütünleşik bir yapay zekâ platformu._

### §132 İlk günden kurulacak yedi omurga

Sinaptik AI Atlas · Daily/Weekly bülten · Learning Paths · AI Knowledge Test ·
AI Models Database · Sinaptik Research · Enterprise.
Sonra: Magazine, Tools, Benchmark, Dataset, Copilot, Community.

### §133 Olmazsa olmaz 15 ilke

1. Her URL'nin tek baskın arama niyeti ve ana konusu olmalı.
2. Haber ve evergreen içerik ayrı sistemlerle yönetilmeli.
3. Topic ve format taxonomy birbirinden ayrılmalı.
4. Her içerikte gerçek author identity bulunmalı.
5. Birincil kaynak kullanımı zorunlu olmalı.
6. AI-generated içerik doğrudan publish edilmemeli.
7. Her kavramın kalıcı entity URL'si bulunmalı.
8. İç linkleme semantic knowledge graph mantığında kurulmalı.
9. Kritik bilgiler ilk paragraflarda açıkça cevaplanmalı.
10. Karşılaştırmalar tabloyla desteklenmeli.
11. Sayısal claimler kaynaklandırılmalı.
12. Orijinal research düzenli üretilmeli.
13. Schema görünür içerikle birebir eşleşmeli.
14. Search + AI citation görünürlüğü birlikte ölçülmeli.
15. Site yalnızca trafik değil **otorite ve dönüşüm** optimize etmeli.

### §134–135 Stratejik hedef ve nihai mimari

Hedef "Google'da ilk sıraya çıkmak"tan büyüktür: kullanıcı sorduğunda Sinaptik çıksın;
AI sistemleri araştırdığında Sinaptik kaynak olsun; gazeteci veri ararken Sinaptik
Research'e gelsin; öğrenci Academy'den başlasın; CTO Benchmark'a baksın; şirket
Enterprise'a başvursun. O noktada Sinaptik Lab bir web sitesi değil, **yapay zekâ
ekosisteminin bilgi katmanlarından biridir.**

```text
                         SINAPTIK LAB
                              │
          ┌───────────────────┼────────────────────┐
       DISCOVER            UNDERSTAND            LEARN
       Gündem              AI Atlas             Academy
       Radar               Guides               Paths
       Brief               Models               Lessons
       Magazine            Tools                Tests
          └───────────────┬───┴────────────────────┘
                       RESEARCH
               Reports / Data / Benchmark
                          ↓
                        BUILD
                     Enterprise
          Consulting / Training / Projects
                          ↓
                    CASE STUDIES
                          ↓
                   KNOWLEDGE GRAPH
                          └────→ tekrar Discover
```

**Medya kullanıcı getirir. Bilgi otorite yaratır. Eğitim kullanıcıyı tutar. Araştırma
citation üretir. Enterprise gelir yaratır. Gerçek projeler yeniden bilgi üretir.**
