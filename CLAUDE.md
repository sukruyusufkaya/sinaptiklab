# Sinaptik Lab — çalışma notları

**Proje anayasası [docs/MASTER-PLAN.md](docs/MASTER-PLAN.md)'dir.** Mimari bir karar
vermeden önce ilgili maddeye bak; plandan sapılacaksa `docs/ADR/` altına gerekçe yaz.
İçerik türleri ve veri karşılıkları için [docs/ICERIK-TURLERI.md](docs/ICERIK-TURLERI.md).

## Dil ve adlandırma

Arayüz metinleri, kod tanımlayıcıları, dosya adları ve yorumlar **Türkçe**dir
(`Baslik.tsx`, `lib/rotalar.ts`, `function tarihBicimle()`). Tanımlayıcılarda ASCII dışı
harf kullanma (`MansetKarti`, `MansetKartı` değil).

## Değişmez kurallar

1. **`text-transform: uppercase` kullanılmaz.** Belge dili `tr` olduğundan tarayıcı "i"
   harfini "İ"ye çevirir; "Discover" → "DİSCOVER", "Anthropic" → "ANTHROPİC" olur. Büyük
   harf isteniyorsa metin kaynakta büyük yazılır.
2. **Token dışı renk/ölçü yok.** Renkler `app/globals.css` içindeki `--vurgu`, `--metin`,
   `--kenar`… tokenlarından gelir; bileşende çıplak hex yazılmaz.
3. **Effect içinde `setState` yok.** Dış durum için `useSyncExternalStore` (bkz.
   `lib/tema.ts`) veya koşullu montaj kullanılır (bkz. `KomutPaleti`).
4. **Kritik içerik sunucuda render edilir.** Haber, Atlas, rehber, dergi, kurs ve model
   sayfaları ilk HTML response'unda anlamlı içerik taşır.
5. **Uydurma veri yayımlanmaz.** `lib/veri/*` yer tutucudur; buradan gelen hiçbir
   sayı gerçek ölçüm gibi sunulmaz. Benchmark tabloları görünür bir "örnek veri" uyarısı
   taşır (MASTER-PLAN §59).
6. **Yeni rota** eklenirken `lib/rotalar.ts` (gezinmenin tek kaynağı) ve `app/sitemap.ts`
   birlikte güncellenir. URL'ler sondaki eğik çizgiyle biter ve tarih içermez (§45–46).
7. **Konu ≠ format.** İçerik modellenirken `konu` (topic) ve `tur` (content type) ayrı
   alanlardır (§9).
8. **Sır kodda durmaz.** Bağlantı dizesi, parola ve anahtar yalnızca `.env.local`
   (gitignore'lu) içinde bulunur. `.env.example` yalnızca boş anahtar adlarını taşır.
9. **Şema tek yerde tanımlanır.** MongoDB koleksiyon şemaları ve dizinleri
   `lib/mongo/koleksiyonlar.ts` içindedir; `scripts/mongo-semalari.json` bundan
   türetilir, elle düzenlenmez.
10. **Gövde ayrı modülde.** Uzun metinler `lib/veri/govde/*` içinde tutulur ve künye
   verisiyle derleme anında birleştirilir; bu, üretimdeki MongoDB sorgusunun taklididir.

## Kalite kapıları

Değişiklikten sonra sırayla: `npm run typecheck`, `npm run lint`, `npm run build`.
Üçü de temiz olmadan iş bitmiş sayılmaz. `npm run format` biçimlendirmeyi düzeltir.

## MongoDB

```bash
npm run mongo:sema      # TS tanımlarından JSON şema üret
npm run mongo:kur       # şemayı ve dizinleri Atlas'a uygula (yıkıcı değil)
npm run mongo:kontrol   # yalnızca mevcut durumu raporla
```

`mongo:kur` hiçbir koleksiyonu veya belgeyi silmez: yenileri oluşturur, var olanların
doğrulayıcısını `collMod` ile günceller, eksik dizinleri ekler. Doğrulama seviyesi
`moderate` — mevcut kayıtlar bozulmaz.

Bağlantı `lib/mongo/istemci.ts` üzerinden kurulur; geliştirme modunda istemci
`globalThis` üzerinde önbelleğe alınır (sıcak yeniden yükleme bağlantı havuzunu
tüketmesin diye).

## Sayfa yazarken

Yeni bir sayfa paylaşılan şablonların üzerine kurulur; sıfırdan düzen yazılmaz:

- **Arşiv / hub:** `SayfaBasligi` + `Bolum` + `BolumBasligi` + `Kart`/`KartIzgarasi`
- **Uzun metin:** `IcerikDuzeni` + `MetinGovdesi` + `IcerikKenari` bileşenleri
  (`IcindekilerTablosu`, `YazarSeridi`, `KaynakListesi`, `SurumGecmisi`, `SSSBolumu`)
- **Politika / yasal:** `MetinSayfasi` + `lib/veri/politikalar.ts` içindeki bölüm dizisi
- **Kimlik:** `KimlikKarti` + `AlanGrubu`
- **Filtre:** `FiltreSeridi` (crawl edilebilir bağlantı, JS durumu değil)
- **Boş bölüm:** `BosDurum` — hazır olmayan bölüm dolu gösterilmez

Her sayfa `Kirintilar` (veya `SayfaBasligi`) üzerinden breadcrumb şeması üretir; içerik
sayfaları ayrıca `lib/seo/jsonld.tsx` içinden uygun şemayı basar.

## Şu anki durum

**Faz 1 (Foundation) ve Faz 2 (veri katmanı) tamamlandı; içerik ölçeklendi.**
1366 prerender edilen sayfa. Site artık fixture'dan değil MongoDB Atlas'tan
okuyor (`lib/mongo/sorgular/*`, `lib/icerik/*`); `lib/veri/*` yalnızca
yapılandırma (skor basamakları, rota önerileri, politika bölümleri) için kaldı.

Yayında olan içerik (sayılar Atlas'tan, `npm run icerik:denetim` ile doğrulanır):

| koleksiyon | yayında | not |
| --- | --- | --- |
| `modeller` | 340 | 6 aile hub'ı + üyeler |
| `sirketler` | 87 | |
| `araclar` | 56 | |
| `konular` | 55 | iki düzeyli ağaç, 10 küme |
| `hizmetler` | 50 | |
| `vakalar` | 50 | tamamı temsilî senaryo işaretli |
| `lab_projeleri` | 50 | 19'u çalışan araç |
| `testler` | 100 | 605 soruluk banka |
| `ogrenme_yollari` | 20 | 11 rol |
| `meslekler` | 19 | 6 rol ailesi, kıdem kırılımlı |
| `atlas` | 35 | gövde, SSS, kaynak, sürüm geçmişi; beceri ağının düğümleri |
| `terimler` | 538 | sözlük; 35'i Atlas girdisine bağlı, 12'si aşama işaretli |
| `uzmanlar` | 23 | 22 tanımlı açık koltuk |
| `dersler` | 8 | |

Ayrıca: 45 haber + 56 derin analiz tam gövde, seviye testi, model
karşılaştırma stüdyosu, model seçici, beceri ağı, AI Readiness.

**Dergi ve Araştırma bölümleri hazırlanıyor.** `dergi_sayilari` (3) ve
`arastirma` (6) kayıtları arşive alındı; iki menü de `rozet: 'yakinda'`
taşıyor ve sayfalar `CokYakinda` bileşeniyle yapıyı gösteriyor. Belgeler
silinmedi, `durum: 'arsiv'` — okuma katmanı yalnızca `yayinda` olanı
gördüğü için yayından kaldırmakla aynı sonucu verir, ama geri dönülebilir.
`/analiz/` bilerek rozetsiz: arkasında 56 yayında analiz var.

### Sözlük iki katmanlı

`/sozluk/` artık `atlas` değil `terimler` koleksiyonundan okuyor. Gerekçe:
sözlüğü büyütmenin tek yolu Atlas girdisi açmaktı ve bir Atlas girdisi
gövde, SSS, kaynak ve sürüm geçmişi taşıyan ağır bir editoryal üründür.
Beş yüz terimi o ağırlıkla üretmek doğru değil: "şaşkınlık"a tek satır
yeter, "RAG"e kendi sayfası gerekir.

İki katman **bilinçli olarak örtüşür**: Atlas girdisi olan terim
`atlasSlug` ile oraya bağlanır ve tanımı sözlükte yine görünür. Böylece
sözlük tek ve tam bir liste olur, aynı terim iki kez listelenmez.
**Terimin kendi sayfası yoktur** — tek satırlık tanım için ayrı adres
açmak yüzlerce ince sayfa üretir (§51); derinlik isteyen terim Atlas'a
taşınır.

### Terimin aşaması (`asama`)

Sözlük "bu nedir?" sorusunun yanında **"bu hâlâ kullanılıyor mu?"** sorusunu
da cevaplar. `asama` alanı üç değer alır — `yerlesik` (varsayılan, alan boş
olabilir), `yeni` (yerleşmekte, tanımı değişebilir), `kullanimdan-kalkti`.
Yerleşik olmayan her terim `asamaNotu` taşımak **zorundadır**: dayanaksız
"kullanımdan kalktı" etiketi §59'un yasakladığı iddiadır. Kural tohumlama
betiğinde denetlenir (şema koşullu zorunluluk ifade edemiyor).

Kullanımdan kalkan terim **silinmez**: okur onunla eski dokümantasyonda
karşılaşmaya devam ediyor. Gerekçesi ve yerine geleni gösterir.
Ayrıntı: [docs/ADR/0003-terim-asamalari.md](docs/ADR/0003-terim-asamalari.md).

`ilgili` alanı terimleri birbirine bağlayan semantik ağdır (§48); okuma
katmanı kopuk slug'ı sessizce düşürür, `npm run icerik:denetim` bildirir.
`kaynak: { ad, adres }` tanımın dayandığı birincil kaynağı taşır ve
`DefinedTerm.sameAs` olarak basılır.

### Kategori sayfaları sözlüğün dilimidir

`/atlas/kategori/<slug>/` yalnızca Atlas kartlarını listelediğinde kategori
başına ortalama iki karta düşüyordu — ince sayfa tarifi. Sayfa artık aynı
kategorinin **tüm sözlük terimlerini** de taşıyor ve kendi `DefinedTermSet`
şemasını basıyor. `/sozluk/` kopyası değil: biri alfabetik tek liste, diğeri
tek alanın konusuyla birlikte verilmiş hâli.

### Beceri ağı

`lib/ogrenme/beceri-agi.ts` — 35 Atlas kavramı ve aralarındaki 51 önkoşul
kenarı. Kod düzeyi taksonomidir (`lib/taksonomi.ts` ile aynı gerekçe): bir
kenar değiştiğinde üretilen her öğrenme rotası değişir.

Kenarlar **geçişli olarak indirgenmiştir** — yalnızca doğrudan önkoşullar
yazılır. `atlas.onkosullar` alanı aynı bilgiyi görünen adla ve eksik taşır
(35 kaydın 22'sinde dolu); iki kaynak `npm run icerik:denetim` ile birbirini
denetler ve Atlas'taki her önkoşulun çizgede doğrudan ya da geçişli olarak
karşılandığı sınanır.

`/ogren/beceri-grafigi/` bu ağı bir rota üreticisine çevirir: hedef `?hedef=`,
bilinenler `?bilinen=` ile URL'de taşınır, plan sunucuda render edilir.

### Bütünlük denetimi

```bash
npm run icerik:denetim            # kopuk referans ve tutarsızlık raporu
npm run icerik:denetim -- --ayrinti
```

MongoDB'de yabancı anahtar yoktur: şema doğrulayıcısı bir alanın BİÇİMİNİ
denetler, karşılığının var olduğunu denetleyemez. `konuSlug: "machine-learning"`
yazan bir test şemadan sorunsuz geçer ve sitede hiçbir konu merkezinde
görünmez. Bu betik o boşluğu kapatır: 20 çapraz koleksiyon bağını, test ↔ soru
tutarlılığını, temsilî vaka kuralını ve gövde bloklarının biçimini denetler.
Yalnızca okur, hiçbir belgeyi değiştirmez; bulgu varsa çıkış kodu 1'dir.

**Yeni bir bağ eklerken** `scripts/butunluk-denetimi.mjs` içindeki `BAGLAR`
dizisine bir satır eklenir.

### Sıradaki işler

- Yayına çıkış öncesi: MongoDB ve admin parolalarının döndürülmesi (ikisi
  şu an aynı), Atlas Network Access'in Vercel aralıklarına daraltılması
- E-posta sağlayıcısı: üyelik doğrulama/sıfırlama postası şu an gönderilmiyor
  (`lib/site/eposta.ts` bunu dürüstçe raporluyor)
- 7 eski İngilizce koleksiyonun (`topics`, `events`, `contents`, `terms`,
  `quizzes`, `redirects`, `authors` — 247 belge) akıbeti
- Yasal/KVKK metinlerinin avukat incelemesi (şu an görünür taslak uyarısı
  taşıyorlar)
