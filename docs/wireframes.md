# Sinaptiklab — Kablo Çerçeveleri (Faz 0)

> Durum: **onay bekliyor**. Tüm sayfa tipleri; masaüstü (≥1024px) esas, kritik yerlerde mobil varyant. Tasarım dili: "ölçüm laboratuvarı" — hairline çizgiler (`--doku`), maks 4px radius, tek sinyal rengi, ölçüm cetveli motifli bölüm ayırıcılar. Gradyan/glow/parallax yok.

Ortak kabuk (her sayfada):

```
┌──────────────────────────────────────────────────────────────────────────┐
│ SINAPTIKLAB▪   Konular ▾   Sözlük   Araçlar   Ölçümler   Kurslar   Forum │
│                                              [Ara ⌘K] [☾/☀] [Giriş/Profil]│
├──────────────────────────────────── hairline ────────────────────────────┤
│                              <sayfa içeriği>                             │
├──────────────────────────────────── hairline ────────────────────────────┤
│ FOOTER: Hakkında · Editoryal Politika · Künye · KVKK · Çerez · Gizlilik  │
│ Bülten aboneliği (inline form, pop-up yok) · RSS/Atom/JSON · llms.txt    │
│ sameAs: GitHub · LinkedIn · X · YouTube          © Sinaptiklab · [tr]    │
└──────────────────────────────────────────────────────────────────────────┘
```
Not: "Konular ▾" 12 pillar'ı açan mega-liste (2 kolon, sade metin linkleri). `⌘K` komut paleti aramayı açar. "Giriş" ücretsiz üyelik (ADR 0004).

---

## 1. Ana sayfa `/`

```
┌──────────────────────────────────────────────────────────────────────────┐
│  SAHA VERİSİ, UYDURMA YOK.                          ┌──────────────────┐ │
│  Türkçe teknik YZ yayını: her iddia kaynaklı,       │ ÖLÇÜM PANOSU     │ │
│  her tutorial çalışan repo ile.                     │ 128 içerik       │ │
│  [Patikalara başla]  [Son yazılar ↓]                │ 42 terim         │ │
│                                                     │ 12 ölçüm         │ │
│                                                     │ son doğrulama: dün│ │
├──╥── cetvel motifi ──────────────────────────────────└──────────────────┘ │
│ 01║ ÖNE ÇIKAN                                                            │
│   ║ ┌──────────────────────────────┐ ┌─────────────┐ ┌─────────────┐    │
│   ║ │ BÜYÜK KART: rehber/deep-dive │ │ makale kartı│ │ makale kartı│    │
│   ║ │ pillar rozeti · seviye · dk  │ │             │ │             │    │
│   ║ └──────────────────────────────┘ └─────────────┘ └─────────────┘    │
│ 02║ PİLLAR AKIŞLARI (sekmeli: LLM | RAG | Ajanik | ...)                  │
│   ║ • yazı satırı — tarih · seviye · okuma dk · lastVerifiedAt          │
│   ║ • yazı satırı                                          [tümü →]     │
│ 03║ SÖZLÜKTEN: 6 terim çipi (kısa tanım tooltip)            [sözlük →]  │
│ 04║ SON ÖLÇÜMLER: mini tablo (model · metrik · tarih)       [ölçümler →]│
│ 05║ PATİKALAR: 3 kart (adım sayısı + hedef persona)         [patikalar →]│
│ 06║ BÜLTEN CTA (tek, inline): e-posta + [Abone ol] + KVKK onay kutusu   │
└──────────────────────────────────────────────────────────────────────────┘
```
Not: Kart görselleri yok ya da tipografik/diyagram; stok görsel yasak. "Ölçüm panosu" canlı sayılar — laboratuvar kimliğini ilk ekranda kurar.

---

## 2. Makale / Rehber / Uygulama detayı `/makale/<slug>` (masaüstü)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Ana sayfa / Konu: RAG & Bilgi Erişimi / RAG değerlendirme    (breadcrumb)│
├──────────────────────────────────────────────────────────────────────────┤
│ [RAG & Bilgi Erişimi] [orta] [18 dk] [son doğrulama: 2 Ağu 2026]         │
│                                                                          │
│ H1: RAG Sistemleri Nasıl Değerlendirilir: Ragas'tan Üretim Metriklerine  │
│ dek: 140-180 karakterlik spot metni…                                     │
│ ── Yazar: Ş. Y. Kaya · Teknik editör: — · Yayın 12 Tem · Günc. 2 Ağu ──  │
├──────┬──────────────────────────────────────────────┬────────────────────┤
│ iz   │ ┌──────────────────────────────────────────┐ │ KENAR NOTU (260px) │
│ 64px │ │ ▊ KISA CEVAP (answerFirst, 40-80 kelime) │ │                    │
│  │   │ │   [kopyala]                              │ │ İçindekiler        │
│  ├▶  │ └──────────────────────────────────────────┘ │  1. Neden ölçmeli  │
│  │   │                                              │  2. Metrikler      │
│  │   │ ## Bölüm başlığı (H2, stabil id)             │  3. Ragas kurulumu │
│  ├▶  │ Gövde 68ch, satır 1.65…                      │  …                 │
│  │   │                                              │ ─ hairline ─       │
│  │   │ <Kod dosya="eval.py" satirVurgu="3-5">       │ [i] Terim: gömme   │
│  │   │ ┌ eval.py ────────────── [Kopyala] ┐         │  vektörü — tooltip │
│  ├▶  │ │ shiki, build-time vurgu          │         │  tanımı burada     │
│  │   │ └──────────────────────────────────┘         │ ─ hairline ─       │
│  │   │ <Uyari tip="tuzak"> sarı sol bordür          │ Kaynak önizleme    │
│  │   │                                              │ [3] arXiv 2405…    │
│  ▼   │ ── cetvel: bölüm 03/07 ──                    │                    │
├──────┴──────────────────────────────────────────────┴────────────────────┤
│ ┌ YENİDEN ÜRETİLEBİLİRLİK ────────────────────────────────────────────┐  │
│ │ repo: github.com/… · notebook · modeller: gpt-4o@…, claude-… ·      │  │
│ │ donanım: A100 40GB · çalıştırma: 12 Tem 2026 · ~$14                 │  │
│ └─────────────────────────────────────────────────────────────────────┘  │
│ KAYNAKLAR: [1] … (erişim: 12 Tem 2026)  [2] …                            │
│ DEĞİŞİKLİK GÜNLÜĞÜ ▸ "Bu yazı 3 kez güncellendi"                         │
│ SSS (2+ soru, FAQPage ile aynı veri)                                     │
│ İLGİLİ İÇERİK: 3 kart (vektör + aynı cluster)                            │
│ YORUMLAR (üye girişi ister — giriş yoksa: "Yorum için üye olun" satırı)  │
│ BÜLTEN CTA (tek, sayfa sonu)                                             │
└──────────────────────────────────────────────────────────────────────────┘
```

**"iz" = Aksiyon Potansiyeli:** dikey sinyal hattı; okuma ilerledikçe dolar, her H2 sınırında spike (▶). Spike tıklanınca bölüme gider. `prefers-reduced-motion`: statik bölüm haritası.

Mobil varyant:
```
┌──────────────────────────┐
│ ~~~~/\~~~~/\~~~ (iz, üst │  ← yatay ince bant, spike'lar tıklanabilir
│ breadcrumb (kısaltılmış) │
│ rozetler · H1 · dek      │
│ yazar satırı             │
│ ▊ KISA CEVAP             │
│ [İçindekiler ▾] (akordeon)│
│ gövde (tek kolon, 68ch)  │
│ kenar notları gövde içine│
│ inline kutu olarak akar  │
│ …                        │
└──────────────────────────┘
```
Uygulama (`tutorial`) farkı: gövdede `<Adim n="">` numaralı adım blokları (HowTo schema); repro kutusu zorunlu ve KISA CEVAP'ın hemen altında da özet satırı olarak görünür.

---

## 3. Pillar hub `/konu/<pillar-slug>` (cluster hub aynı kalıp, bir seviye derin)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Ana sayfa / Konular / RAG & Bilgi Erişimi                                │
│ H1: RAG & Bilgi Erişimi                                                  │
│ intro: 2-3 cümle pillar tanıtımı (topics.intro)                          │
├──────────────────────────────────────────────────────────────────────────┤
│ BAŞLANGIÇ REHBERİ: ┌ pillar'ın kanonik rehberi (guide) büyük kart ┐      │
├──────────────────────────────────────────────────────────────────────────┤
│ CLUSTER'LAR (ızgara, her biri kendi hub'ına link):                       │
│ ┌ Parçalama Stratejileri ┐ ┌ Yeniden Sıralama ┐ ┌ RAG Değerlendirme ┐   │
│ │ 8 içerik · son: 2 Ağu  │ │ 5 içerik         │ │ 12 içerik          │   │
│ └────────────────────────┘ └──────────────────┘ └────────────────────┘   │
├──────────────────────────────────────────────────────────────────────────┤
│ TÜM İÇERİK (filtre: tür ▾ · seviye ▾ · sıralama ▾)                       │
│ • satır: tür rozeti · başlık · tarih · seviye · dk                       │
│ • …                                            [sayfalama: 1 2 3 →]     │
│ İLGİLİ TERİMLER: çip listesi (sözlükten, bu pillar'a bağlı)              │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Sözlük `/sozluk` ve terim `/sozluk/<slug>`

```
İNDEKS                                    TERİM SAYFASI
┌──────────────────────────────┐  ┌──────────────────────────────────────┐
│ H1: Türkçe YZ Sözlüğü        │  │ breadcrumb / Sözlük / Gömme Vektörü  │
│ [ara/filtrele input]         │  │ H1: Gömme Vektörü   EN: embedding    │
│ A B C Ç D E … (harf çubuğu)  │  │ diğer adlar: embedding, gömme        │
│ ┌ pillar filtresi (çipler) ┐ │  │ ▊ KISA TANIM (≤25 kelime, kopyala)   │
│ │                          │ │  │ ── hairline ──                       │
│ A                            │  │ UZUN TANIM (MDX gövde, 68ch)         │
│ • Ajan (agent) — kısa tanım… │  │ KAYNAKLAR: [1] …                     │
│ • Aktivasyon — kısa tanım…   │  │ İLİŞKİLİ TERİMLER: çipler            │
│ B                            │  │ BU TERİMİ KULLANAN İÇERİK: 5 satır   │
│ • Bağlam penceresi — …       │  │ (DefinedTerm JSON-LD)                │
└──────────────────────────────┘  └──────────────────────────────────────┘
```

---

## 5. Araç/Model kartı `/arac/<slug>`

```
┌──────────────────────────────────────────────────────────────────────────┐
│ breadcrumb / Araçlar / Claude API                                        │
│ H1: Claude API          vendor: Anthropic · kategori: LLM API            │
│ [son doğrulama: 12 Tem 2026]  ← 90 günü geçerse otomatik "bayat" uyarısı │
├───────────────────────────────┬──────────────────────────────────────────┤
│ KARAR (verdict): 2-3 cümle    │ TR ERİŞİLEBİLİRLİK ┌──────────────────┐ │
│ net hüküm                     │ │ TR kartı: ✓  fatura: ✗  veri: AB/ABD │ │
│                               │ └──────────────────────────────────────┘ │
│ ARTILAR          EKSİLER      │ FİYATLANDIRMA (doğrulama tarihli tablo)  │
│ + madde          − madde      │ │ plan · $ birim · doğrulandı: <tarih>  │ │
│ + madde          − madde      │ API DOKÜMANI → link                      │
├───────────────────────────────┴──────────────────────────────────────────┤
│ İLGİLİ ÖLÇÜMLER: benchmarkRefs tablosu (→ /olcum/<slug>)                 │
│ GÖVDE: derinlemesine inceleme (MDX)                                      │
│ KAYNAKLAR · SSS · İLGİLİ İÇERİK · YORUMLAR                               │
└──────────────────────────────────────────────────────────────────────────┘
(SoftwareApplication + Review + Offer JSON-LD)
```

---

## 6. Ölçüm `/olcum/<slug>`

```
┌──────────────────────────────────────────────────────────────────────────┐
│ breadcrumb / Ölçümler / TR Özetleme Karşılaştırması                      │
│ H1 · görev: özetleme · veri seti: <ad> · çalıştırma: 12 Tem 2026         │
│ ▊ KISA CEVAP: kazanan + koşul özeti                                      │
├──────────────────────────────────────────────────────────────────────────┤
│ SONUÇ TABLOSU (sıralanabilir; mobilde kart dönüşümü):                    │
│ │ model · metrik · değer · ±CI │  ← satır vurgusu --olcum sarısıyla     │
├──────────────────────────────────────────────────────────────────────────┤
│ PROTOKOL: nasıl ölçtük (adım adım, MDX)                                  │
│ ┌ REPRO ┐ repo · donanım · maliyet · model sürümleri                     │
│ KAYNAKLAR · SSS · İlgili içerik                                          │
└──────────────────────────────────────────────────────────────────────────┘
(Dataset + Observation JSON-LD; <Olcum id=""> bileşeni bu veriyi makale içine gömer)
```

---

## 7. Yazar sayfası `/yazar/<slug>` (E-E-A-T)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [avatar]  H1: Şükrü Yusuf Kaya                                           │
│           unvan · employer · uzmanlıklar (çipler)                        │
│           sameAs: GitHub · LinkedIn · X · ORCID (ikon + tam link)        │
│ longBio (68ch)                                                           │
│ credentials: sertifika/deneyim listesi                                   │
├──────────────────────────────────────────────────────────────────────────┤
│ YAZILARI (tür filtresi): satır listesi + sayfalama                       │
│ TEKNİK EDİTÖRLÜĞÜNÜ YAPTIĞI: satır listesi                               │
└──────────────────────────────────────────────────────────────────────────┘
(Person + sameAs JSON-LD)
```

---

## 8. Arama `/ara` (+ ⌘K paleti)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [  arama girdisi                                   ] [Ara]               │
│ filtreler: tür ▾ · pillar ▾ · seviye ▾ · tarih ▾                         │
├──────────────────────────────────────────────────────────────────────────┤
│ "rag değerlendirme" için 14 sonuç (birincil: BM25 + eşanlamlı)           │
│ • [makale] başlık — vurgulu snippet… · pillar · tarih                    │
│ • [terim]  başlık — kısa tanım…                                          │
│ ANLAMSAL EŞLEŞMELER (vektör, ayrı bölüm başlığıyla): 3 satır             │
│ Sonuç yoksa: öneri sorguları + en yakın terimler                         │
└──────────────────────────────────────────────────────────────────────────┘
⌘K paleti: overlay, aynı arama; hızlı gezinme (sayfalar + son içerik). /ara? indekslenmez (robots).
```

---

## 9. Kurs `/kurs/<slug>` ve ders oynatıcı `/kurs/<slug>/<ders-slug>`

```
KURS KAPAĞI                              DERS OYNATICI
┌──────────────────────────────┐  ┌──────────────────────────────────────┐
│ H1 · seviye · toplam süre    │  │ ┌ MÜFREDAT (sol, 280px) ┐ ┌────────┐ │
│ ne öğreneceksin (madde)      │  │ │ ✓ 1. Giriş            │ │ video/ │ │
│ önkoşullar (patika linki)    │  │ │ ▶ 2. Kurulum (aktif)  │ │ metin  │ │
│ MÜFREDAT: bölüm ▸ ders listesi│ │ │   3. İlk model        │ │ +kod   │ │
│ [Kursa başla] (üye girişi)   │  │ │ ilerleme: ▓▓▓░░ %42   │ │ +quiz  │ │
│ eğitmen kartı (yazar)        │  │ └───────────────────────┘ └────────┘ │
│ (Course JSON-LD)             │  │ [← önceki] [tamamlandı ✓] [sonraki →]│
└──────────────────────────────┘  └──────────────────────────────────────┘
Kurs bitince: sertifika sayfası (PDF indir + doğrulama kodu + doğrulama URL'i).
Mobilde müfredat üstte akordeon. Tüm kurslar ücretsiz (ADR 0004).
```

---

## 10. Patika `/patika/<slug>`

```
┌──────────────────────────────────────────────────────────────────────────┐
│ H1: Sıfırdan RAG Mühendisliği · hedef persona · toplam süre              │
│ ilerleme: ▓▓░░░░ 2/9 (üye ise)                                           │
│  ①──②──③──④──⑤──⑥──⑦──⑧──⑨   (sinyal izi metaforu, yatay)               │
│ ┌ ① Terimlerle tanış (sözlük seti) — 20 dk        [tamamlandı ✓] ┐      │
│ ┌ ② Gömme vektörleri makalesi — 18 dk             [şimdi başla →] ┐     │
│ ┌ ③ İlk RAG uygulaman (tutorial) — 45 dk          [kilitsiz] ┐          │
│ … her adım bir içerik/ders kartı; sıra tavsiye, kilit yok                │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 11. Bülten `/bulten` ve sayı `/bulten/<sayi>`

```
ARŞİV                                    SAYI
┌──────────────────────────────┐  ┌──────────────────────────────────────┐
│ H1: Sinaptik Sinyal (bülten) │  │ H1: Sayı #12 · 4 Ağu 2026            │
│ abonelik formu (çift opt-in, │  │ YÖNETİCİ ÖZETİ (5 dk'da durum)       │
│ KVKK açık rıza kutusu ayrı)  │  │ gövde: bölümler (web'e uyarlanmış    │
│ • Sayı #12 — başlık · tarih  │  │ e-posta içeriği, kanonik burası)     │
│ • Sayı #11 — …               │  │ [Sonraki sayıyı kaçırma → abone ol]  │
└──────────────────────────────┘  └──────────────────────────────────────┘
```

---

## 12. Forum `/forum`, kategori, konu

```
KATEGORİ LİSTESİ                          KONU SAYFASI
┌──────────────────────────────┐  ┌──────────────────────────────────────┐
│ H1: Forum (davetli dönem     │  │ breadcrumb / Forum / RAG / konu      │
│ bandı: "şu an davetle")      │  │ H1: konu başlığı · [çözüldü ✓]       │
│ ┌ RAG ┐ 34 konu · son: 2s    │  │ ┌ İLK MESAJ (soru) ─ ▲ 12 ┐          │
│ ┌ LLMOps ┐ …                 │  │ │ gövde + kod bloğu        │          │
│ Konu satırı: başlık · yanıt  │  │ ┌ YANIT (kabul edilen, üstte) ✓┐     │
│ sayısı · ▲ oy · son etkinlik │  │ ┌ YANIT ─ ▲ 3 ┐                      │
│ [Yeni konu] (üye)            │  │ [yanıt editörü: markdown + kod]      │
└──────────────────────────────┘  └──────────────────────────────────────┘
İnce konu (yanıt<2 && yaş>30gün) noindex. Linkler nofollow ugc.
```

---

## 13. Admin editör `/admin` (içerik düzenleme ekranı)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [← içerik listesi] başlık girdisi        durum: draft ▾  [Kaydet] [Yayınla]│
├───────────────────────────────────┬──────────────────────────────────────┤
│ MDX EDİTÖRÜ (monospace)           │ CANLI ÖNİZLEME (gerçek makale        │
│                                   │ şablonu, senkron kaydırma)           │
│ otomatik taslak kaydı: "2 sn önce"│                                      │
├───────────────────────────────────┴──────────────────────────────────────┤
│ SEKMELER: Meta | Kaynaklar | SSS | SEO | İç Link Önerileri | Değişiklik  │
│ ┌ YAYIN KONTROL LİSTESİ (§4.3) ────────────────────────────────────────┐ │
│ │ ✓ sources ≥ 1        ✓ answerFirst 40-80 kelime   ✗ iç link 1/3     │ │
│ │ ✗ SSS 1/2            ✓ alt metinleri              ✓ slug uygun      │ │
│ │ → "2 iç link ekle: şu 5 ilgili yazı öneriliyor: …"                  │ │
│ └─ tümü ✓ olmadan [Yayınla] pasif ────────────────────────────────────┘ │
│ SEO sekmesi: title/desc sayaç + SERP önizleme + kannibalizasyon uyarısı  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Statik sayfalar
`/hakkinda`, `/editoryal-politika`, `/kunye`, `/iletisim`, KVKK seti: tek kolon 68ch düz MDX sayfaları; editoryal politika sayfası §4.3 zorlayıcılarını kamuya açık anlatır (güven sinyali).

## Onay soruları
1. Ana sayfadaki "Ölçüm Panosu" (canlı sayılar) kalsın mı?
2. Makale kenar notu sütunu (260px) masaüstünde varsayılan açık mı, katlanabilir mi olsun?
3. Bülten adı önerisi "Sinaptik Sinyal" — uygun mu, değişsin mi?
