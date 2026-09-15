# Sinaptik Lab

Yapay zekâ bilgi, haber ve öğrenme platformu. **Discover → Understand → Learn → Build.**

Proje anayasası: [docs/MASTER-PLAN.md](docs/MASTER-PLAN.md) · İçerik envanteri: [docs/ICERIK-TURLERI.md](docs/ICERIK-TURLERI.md) · Karar kayıtları: [docs/ADR/](docs/ADR/)

## Yığın

Next.js 16 (App Router, RSC) · TypeScript `strict` · Tailwind CSS v4 (token tabanlı,
bkz. `app/globals.css`) · MongoDB · Vercel. Gerekçe: [ADR 0001](docs/ADR/0001-yigin.md).

## Geliştirme

```bash
npm install
npm run dev
```

| Komut | İş |
| --- | --- |
| `npm run lint` / `format:check` / `typecheck` | statik kontroller (uyarı = hata) |
| `npm run build` | üretim derlemesi |
| `npm run format` | Prettier ile biçimlendirme |
| `npm run mongo:sema` | TS tanımlarından JSON şema üret |
| `npm run mongo:kur` | koleksiyon, şema ve dizinleri Atlas'a uygula (yıkıcı değil) |
| `npm run mongo:kontrol` | Atlas'taki mevcut durumu raporla |

Ortam değişkenleri `.env.example` dosyasında listelidir; gerçek değerler
`.env.local` içinde durur ve **asla** depoya girmez.

## Dizin yapısı

```
app/
  (site)/          herkese açık sayfalar — Header + Footer kabuğu
  globals.css      tasarım tokenları ve yardımcı sınıflar
  layout.tsx       kök düzen, yazı tipleri, tema betiği
  robots.ts        crawl kuralları (§51)
  sitemap.ts       site haritası (§50)
components/
  arayuz/          temel bileşenler (Dugme, Rozet, Kart, SayfaBasligi, Kirintilar…)
  duzen/           kabuk (Baslik, MegaMenu, MobilMenu, KomutPaleti, Altlik)
  ana-sayfa/       ana sayfa bölümleri — MASTER-PLAN §114 sırasıyla
  icerik/          uzun metin (MetinGovdesi, IcerikDuzeni, IcerikKenari)
  kurumsal/        politika ve kimlik şablonları (MetinSayfasi, KimlikKarti)
  gorsel/          platforma özgü SVG görsel varlıkları
lib/
  rotalar.ts       gezinme mimarisinin tek kaynağı (§4, §130)
  tipler.ts        içerik modeli — topic ≠ format (§9, §69)
  arama.ts         paylaşılan arama dizini (⌘K paleti + /ara/)
  seo/jsonld.tsx   structured data (§66)
  tema.ts          tema dış store'u (DOM tabanlı, effect'siz)
  mongo/
    istemci.ts     Atlas bağlantısı (geliştirmede önbellekli)
    koleksiyonlar.ts  33 koleksiyonun şeması ve dizinleri — TEK doğruluk kaynağı
  veri/            YER TUTUCU veri; MongoDB sorgu katmanı devreye girince fixture kalır
    temel.ts       konular, yazarlar, ortak biçimlendiriciler
    gundem.ts      manşet, haber akışı, brief, radar, analizler
    atlas.ts       Atlas girdileri + kategoriler + sözlük (üç katmanı birleştirir)
    varliklar.ts   modeller, şirketler, araçlar, karşılaştırmalar
    ogrenme.ts     rotalar, dersler, testler, beceri grafiği
    sorular.ts     77 soruluk banka (12 test + seviye testi)
    arastirma.ts   yayınlar + metodoloji ilkeleri
    kurumsal.ts    hizmetler, sektörler, vakalar
    yayin.ts       rehberler, dergi, podcast, etkinlikler, uzmanlar
    lab.ts         Lab projeleri, hesaplayıcılar, meslekler
    readiness.ts   AI Readiness boyutları ve olgunluk seviyeleri
    politikalar.ts editoryal ve yasal metinler
    govde/         UZUN METİNLER — künye verisinden ayrı tutulur
      haber.ts     12 haber gövdesi
      analiz.ts    6 analiz gövdesi (her biri karşı görüş bölümüyle)
      ders.ts      8 ders gövdesi (hedef, teori, alıştırma)
      rehber.ts    6 rehberin adım ayrıntısı, tuzakları, kontrol listesi
      dergi.ts     11 dergi yazısı
      arastirma.ts 6 araştırma yayınının tam metni
      atlas-temel.ts      10 temel kavram girdisi
      atlas-uygulama.ts   11 uygulama kavramı girdisi
      atlas-derinlik.ts   mevcut 12 girdinin derinleştirme katmanı
scripts/
  mongo-semalari-uret.mjs  TS tanımlarından JSON şema üretir
  mongo-kur.mjs            Atlas'a uygular (yıkıcı değil)
docs/
  MASTER-PLAN.md     135 maddelik plan
  ICERIK-TURLERI.md  42 içerik türü ve veri karşılıkları
  ADR/               mimari karar kayıtları
```

## URL mimarisi

Kategori hub'ları ile içerik sayfaları aynı segmenti paylaşmaz:

| Aile          | Hub                  | İçerik                              |
| ------------- | -------------------- | ----------------------------------- |
| Gündem        | `/gundem/llm/`       | `/haber/<slug>/`                    |
| Atlas         | `/atlas/kategori/…/` | `/atlas/<slug>/`                    |
| Araştırma     | `/arastirma/raporlar/` | `/arastirma/<slug>/`              |
| Dergi         | `/dergi/dosya/`      | `/dergi/<sayi>/<yazi>/`             |

`/arastirma/[slug]/` ve `/dergi/[sayi]/` tek dinamik segmentte hem tür/bölüm arşivini hem
içerik sayfasını karşılar; ayrım slug'ın bilinen tür listesinde olup olmamasıyla yapılır.

## Değişmez kurallar

- Bileşende token dışı hex/px yok; `any` ve `@ts-ignore` yok.
- Kritik içerik ilk HTML response'unda gelir; salt client-side rendering yok.
- **`text-transform: uppercase` kullanılmaz** — belge dili `tr` olduğu için "i" harfi
  "İ"ye dönüşür ve "DİSCOVER", "ANTHROPİC" gibi hatalar üretir. Büyük harf isteniyorsa
  metin kaynakta büyük yazılır.
- `lib/veri/*` içindeki hiçbir sayı gerçek ölçüm değildir ve kaynak gösterilemez.
- Yeni rota eklenirken `lib/rotalar.ts` ve `app/sitemap.ts` birlikte güncellenir.
- Sır kodda durmaz: bağlantı dizesi, parola ve anahtar yalnızca `.env.local` içinde.
- MongoDB şeması tek yerde tanımlanır (`lib/mongo/koleksiyonlar.ts`);
  `scripts/mongo-semalari.json` türetilmiş dosyadır, elle düzenlenmez.

## Durum

**Faz 1 — Foundation ve içerik derinleştirme tamamlandı.** 298 sayfa prerender ediliyor;
16.033 iç bağlantı örneğinde kırık bağlantı yok.

**Faz 2 — Veri katmanı başladı.** MongoDB Atlas'ta 33 koleksiyon, 71 dizin ve JSON şema
doğrulayıcıları kurulu; ayrıntı için [docs/ICERIK-TURLERI.md](docs/ICERIK-TURLERI.md).

Hazır olan sayfa aileleri: ana sayfa · Atlas (hub, kategori, girdi) · konu merkezleri ·
sözlük · rehberler · gündem (hub, 9 kategori, haber, analiz) · Brief · Radar · modeller ·
karşılaştırmalar · şirketler · araçlar · hesaplayıcılar · Öğren (hub, rotalar, beceri
grafiği, dersler, projeler) · testler · seviye testi · Academy · araştırma (hub, 6 tür,
yayınlar) · metodoloji · dergi (son sayı, arşiv, sayı, yazı, bölümler) · kurumsal (hub,
8 hizmet, AI Readiness, projeler) · sektörler · vaka çalışmaları · Lab · kariyer ·
topluluk · uzmanlar · yazarlar · etkinlikler · podcast · soru-cevap · bülten · hakkında ·
künye · iletişim · politikalar (editoryal, AI, düzeltme) · yasal (KVKK, gizlilik, çerez,
şartlar) · giriş · üye ol · arama · `/en/`.

Yayında olan içerik: 34 Atlas kavram girdisi · 13 haber + 6 analiz tam gövde ·
11 dergi yazısı · 6 araştırma yayını tam metin · 6 rehber (adım ayrıntısı, tuzaklar,
kontrol listesi) · 8 ders (hedef, gövde, alıştırma) · 7 öğrenme rotası (tamamı bölümlü) ·
12 test + 77 soruluk banka · seviye testi · 6 hesaplayıcı · model seçici ·
model karşılaştırıcı · beceri grafiği · AI Readiness değerlendirmesi · canlı arama.

Sıradaki iş: sorgu katmanı (`lib/mongo/sorgular/*`) ve fixture'ların Atlas'a taşınması,
admin/editör paneli, `opengraph-image.tsx`, RSS/Atom akışları, `llms.txt`,
`sitemap-index.xml` bölünmesi (§50), `loading.tsx` / `error.tsx`.
