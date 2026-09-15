# Sinaptik Lab — İçerik Türleri Envanteri

Bu belge, platformda barınacak **tüm içerik türlerini** ve her birinin veri
karşılığını listeler. `docs/MASTER-PLAN.md` neyi neden yaptığımızı, bu belge
**neyi nerede tuttuğumuzu** söyler.

**Temel ilke (MASTER-PLAN §9):** KONU ile TÜR ayrı alanlardır. "RAG" bir konudur;
haber, analiz, rehber, ders, test, kavram girdisi ise türlerdir. Aynı konu
hakkında sekiz farklı türde içerik olabilir ve hepsi aynı konu merkezinde
(`/konu/rag/`) listelenir ama her biri kendi kalıcı URL'inde yaşar.

**İkinci ilke (§10):** Varlık (entity) ile makale ayrı şeydir. Kavram, model,
şirket, araç ve meslek birer *varlıktır*: kalıcı URL'i, sürüm geçmişi ve son
doğrulama tarihi vardır, "yayın tarihi" ikincildir. Haber ve analiz ise
*akıştır*: tarihi birincildir, güncellenmez arşivlenir.

---

## 1. Genel bakış

| # | Katman | İçerik türü | URL deseni | Koleksiyon | Yaşam döngüsü |
|---|--------|-------------|------------|------------|----------------|
| 1 | Discover | Haber | `/haber/<slug>/` | `icerikler` (`tur: haber`) | Akış — arşivlenir |
| 2 | Discover | Analiz | `/analiz/<slug>/` | `icerikler` (`tur: analiz`) | Akış — nadiren güncellenir |
| 3 | Discover | Günlük Brief | `/brief/<tarih>/` | `briefler` | Günlük sayı |
| 4 | Discover | Trend Radar | `/radar/`, `/radar/<slug>/` | `radar` | Zaman serisi |
| 5 | Understand | Atlas kavram girdisi | `/atlas/<slug>/` | `atlas` | Varlık — sürümlü |
| 6 | Understand | Sözlük kaydı | `/sozluk/<slug>/` | `atlas` (türetilmiş görünüm) | Varlık |
| 7 | Understand | Konu merkezi | `/konu/<slug>/` | `konular` | Hub — sürekli |
| 8 | Understand | Model kartı | `/modeller/<slug>/` | `modeller` | Varlık — sürümlü |
| 9 | Understand | Karşılaştırma | `/karsilastir/<a>-vs-<b>/` | `modeller` (türetilmiş) | Varlık |
| 10 | Understand | Şirket kartı | `/sirketler/<slug>/` | `sirketler` | Varlık |
| 11 | Understand | Araç kartı | `/araclar/<slug>/` | `araclar` | Varlık |
| 12 | Learn | Öğrenme rotası | `/ogren/yollar/<slug>/` | `ogrenme_yollari` | Müfredat |
| 13 | Learn | Ders | `/ogren/dersler/<slug>/` | `dersler` | Müfredat |
| 14 | Learn | Beceri grafiği | `/ogren/beceri-grafigi/` | `atlas` (türetilmiş) | Varlık |
| 15 | Learn | Test | `/testler/<slug>/` | `testler` + `sorular` | Ölçüm |
| 16 | Learn | Seviye testi | `/seviye-testi/` | `sorular` | Ölçüm |
| 17 | Learn | Sertifika programı | `/akademi/sertifikalar/` | `sayfalar` | Program |
| 18 | Build | Rehber (how-to) | `/rehber/<slug>/` | `icerikler` (`tur: rehber`) | Bakımlı — güncellenir |
| 19 | Build | Lab projesi / araç | `/lab/<slug>/` | `lab_projeleri` | Ürün |
| 20 | Build | Hesaplayıcı | `/hesaplayicilar/`, `/lab/<slug>/` | `lab_projeleri` | Ürün |
| 21 | Research | Rapor | `/arastirma/<slug>/` | `arastirma` (`tur: Rapor`) | Yayın — sürümlü |
| 22 | Research | Benchmark | `/arastirma/<slug>/` | `arastirma` (`tur: Benchmark`) | Yayın — sürümlü |
| 23 | Research | Veri seti | `/arastirma/<slug>/` | `arastirma` (`tur: Veri Seti`) | Yayın — sürümlü |
| 24 | Research | Whitepaper | `/arastirma/<slug>/` | `arastirma` (`tur: Whitepaper`) | Yayın |
| 25 | Research | Index | `/arastirma/<slug>/` | `arastirma` (`tur: Index`) | Yayın — yıllık |
| 26 | Research | Yöntem notu | `/arastirma/<slug>/` | `arastirma` (`tur: Not`) | Yayın |
| 27 | Yayın | Dergi sayısı | `/dergi/<sayi>/` | `dergi_sayilari` | Periyodik |
| 28 | Yayın | Dergi yazısı | `/dergi/<sayi>/<yazi>/` | `dergi_sayilari.yazilar` | Periyodik |
| 29 | Yayın | Podcast bölümü | `/podcast/<slug>/` | `podcast` | Akış |
| 30 | Yayın | Görüş yazısı | `/analiz/<slug>/` | `icerikler` (`tur: gorus`) | Akış |
| 31 | Yayın | Röportaj | `/analiz/<slug>/` | `icerikler` (`tur: roportaj`) | Akış |
| 32 | Kurumsal | Hizmet sayfası | `/kurumsal/<slug>/` | `hizmetler` | Bakımlı |
| 33 | Kurumsal | Sektör sayfası | `/sektor/<slug>/` | `sektorler` | Bakımlı |
| 34 | Kurumsal | Vaka çalışması | `/vaka-calismalari/<slug>/` | `vakalar` | Bakımlı |
| 35 | Kurumsal | AI Readiness | `/kurumsal/ai-readiness/` | `readiness_sonuclari` | Etkileşimli |
| 36 | Kariyer | Meslek kartı | `/kariyer/<slug>/` | `meslekler` | Varlık |
| 37 | Topluluk | Uzman profili | `/uzmanlar/<slug>/` | `uzmanlar` | Varlık |
| 38 | Topluluk | Etkinlik | `/etkinlikler/<slug>/` | `etkinlikler` | Takvim |
| 39 | Topluluk | Soru-cevap | `/soru-cevap/` | `icerikler` (`tur: gorus`) | Akış |
| 40 | Künye | Yazar profili | `/yazar/<slug>/` | `yazarlar` | Varlık |
| 41 | Statik | Editoryal sayfa | `/hakkinda/`, `/kunye/`, `/metodoloji/` … | `sayfalar` | Bakımlı |
| 42 | Hukuki | Politika metni | `/gizlilik/`, `/kvkk-aydinlatma/` … | `politikalar` | Sürümlü |

---

## 2. Tür bazında ayrıntı

Her tür için: **ne için var**, **hangi alanları zorunlu**, **hangi şablonu izler**.

### 2.1 Haber · `icerikler` (`tur: haber`)

- **Ne için:** günlük gelişmeyi kayda geçirmek; Brief'in ve konu merkezinin girdisi.
- **Zorunlu:** `slug`, `baslik`, `kisaCevap` (answer-first, 40–600 karakter),
  `konuSlug`, `yazarSlug`, `durum`, `yayinTarihi`.
- **Şablon:** ne oldu → neden önemli → teknik detay → kimleri etkiliyor →
  Sinaptik yorumu → kaynak.
- **Yaşam döngüsü:** güncellenmez, gerekirse yeni haber yazılır ve eski habere bağlanır.
- **Şema:** `NewsArticle`.

### 2.2 Analiz · `icerikler` (`tur: analiz`)

- **Ne için:** bir gelişmeyi çerçevelemek; tezli, uzun soluklu yorum.
- **Zorunlu:** haber alanları + `govde` içinde **en az bir karşı görüş bölümü**.
- **Şablon:** tez → bağlam → kanıt → karşı görüş → sonuç → ne yapmalı.
- **Kural:** tek yönlü savunma editoryal politikaya aykırıdır.
- **Şema:** `Article`.

### 2.3 Günlük Brief · `briefler`

- **Ne için:** her sabah bilinmesi gereken beş gelişme, beş dakikada.
- **Zorunlu:** `tarih` (tekil), `baslik`, en az bir `maddeler` girdisi
  (`numara`, `baslik`, `neden`).
- **Kural:** her madde bir konuya ve mümkünse bir içeriğe bağlanır.
- **Kullanım:** aynı kayıt hem `/brief/<tarih>/` sayfasını hem bülten gönderimini besler.

### 2.4 Trend Radar · `radar`

- **Ne için:** hangi başlığın yükseldiğini, sinyal kırılımıyla göstermek.
- **Zorunlu:** `slug`, `tarih`, `momentum` (0–100), `yon`, `yontemSurumu`.
- **Kural:** skor bir kanaat değil; skorlama yöntemi sürümlenir ve yayımlanır (§64).
- **Yapı:** zaman serisi — her gün yeni kayıt, tarihe göre tekil.

### 2.5 Atlas kavram girdisi · `atlas`

- **Ne için:** platformun omurgası. Her kavramın tek, kalıcı ve alıntılanabilir adresi.
- **Zorunlu:** `slug`, `ad`, `kategoriSlug`, `kisaTanim` (answer-first),
  `seviye`, `sonDogrulama`, `durum`.
- **Şablon:** tanım → nasıl çalışır → örnek → yanılgılar → nerede kullanılır →
  ilgili kavramlar → SSS → kaynak → sürüm geçmişi.
- **Kural:** `sonDogrulama` tarihi sayfada görünür; tazeliği denetlenir.
- **Şema:** `DefinedTerm` + `FAQPage` (yalnızca görünen SSS için).

### 2.6 Sözlük · `atlas` üzerinden türetilmiş görünüm

- **Ne için:** hızlı arayan kullanıcı için tek satırlık tanım listesi.
- **Kural:** ayrı bir koleksiyon **yoktur**; `atlas.kisaTanim` alanından türetilir.
  Aynı bilgiyi iki yerde tutmak tutarsızlık üretir.

### 2.7 Konu merkezi · `konular`

- **Ne için:** bir konu hakkındaki tüm türleri tek sayfada toplamak.
- **Zorunlu:** `slug`, `ad`, `kume`, `durum`.
- **Kural:** merkez içerik üretmez, içerik toplar. Yalnızca küratörlü merkezler
  dizinlenir; otomatik filtre kombinasyonları dizinlenmez (§51).

### 2.8 Model kartı · `modeller`

- **Ne için:** bir modelin yetenek, sınır, bağlam, lisans ve fiyat künyesi.
- **Zorunlu:** `slug`, `ad`, `saglayici`, `tip`, `durum`, `sonDogrulama`.
- **Kural:** fiyat ve bağlam penceresi gibi değişken alanlar `sonDogrulama`
  tarihiyle birlikte gösterilir; kaynak adresi tutulur.

### 2.9 Karşılaştırma · `modeller` üzerinden türetilmiş

- **Ne için:** "A vs B" arayan kullanıcıyı karşılamak.
- **Kural:** ayrı koleksiyon yok; iki model kaydından üretilir. Yalnızca
  **anlamlı ve küratörlü** çiftler için sayfa açılır; tüm kombinasyonlar üretilmez.

### 2.10 Şirket kartı · `sirketler`

- **Ne için:** ekosistem oyuncularının künyesi ve model/ürün bağlantıları.
- **Zorunlu:** `slug`, `ad`, `tur`, `durum`.

### 2.11 Araç kartı · `araclar`

- **Ne için:** "bu araç ne işe yarar, kim kullanmalı" sorusuna dürüst cevap.
- **Zorunlu:** `slug`, `ad`, `kategori`, `neIse`, `durum`.
- **Kural:** `artilar` ve `eksiler` birlikte doldurulur; yalnızca artı listeleyen
  kart yayımlanmaz.

### 2.12 Öğrenme rotası · `ogrenme_yollari`

- **Ne için:** bir rol için sıralı, önkoşulları belirli müfredat.
- **Zorunlu:** `slug`, `ad`, `rol`, `seviyeAraligi`, `durum`.
- **Kural:** her bölüm Atlas kavramlarına ve derslere bağlanır.
- **Şema:** `Course`.

### 2.13 Ders · `dersler`

- **Ne için:** tek oturumda tamamlanan öğrenme birimi.
- **Zorunlu:** `slug`, `ad`, `yolSlug`, `seviye`, `dakika`, `durum`.
- **Şablon:** hedefler → teori → örnek → lab (uygulamalı alıştırma) → test → proje.
- **Kural:** `hedefler` ölçülebilir yazılır ("…açıklayabilmek", "…hesaplayabilmek").

### 2.14 Beceri grafiği · `atlas` üzerinden türetilmiş

- **Ne için:** kavramlar arası önkoşul ilişkisini görünür kılmak.
- **Kural:** `atlas.onkosullar` alanından üretilir; ayrı veri tutulmaz.

### 2.15 Test · `testler` + `sorular`

- **Ne için:** öğrenmeyi ölçmek ve eksik önkoşulu göstermek.
- **Zorunlu (test):** `slug`, `ad`, `konu`, `dakika`, `seviye`, `durum`,
  `olculenBeceriler`, `ogrenmeHedefleri`.
- **Zorunlu (soru):** `kimlik`, `konu`, `zorluk`, `beceri`, `soru`,
  `secenekler`, `dogruIndeks`, `aciklama`.
- **Kural:** doğru cevap ve açıklama **sunucuda kalır**; istemciye yalnızca
  gerekli alanlar gönderilir.
- **Şema:** `Quiz`.

### 2.16 Seviye testi · `sorular`

- **Ne için:** kullanıcıyı doğru rotaya yönlendirmek.
- **Çıktı:** puan → seviye etiketi → zayıf beceri listesi → önerilen rota.

### 2.17 Sertifika programı · `sayfalar`

- **Ne için:** ücretli akademi programlarının tanıtımı ve müfredatı.

### 2.18 Rehber · `icerikler` (`tur: rehber`)

- **Ne için:** "nasıl yapılır" sorusunun uçtan uca cevabı.
- **Zorunlu:** `kisaCevap`, `adimListesi`, `onKosullar`, `araclar`,
  `tuzaklar`, `kontrolListesi`.
- **Şablon:** önkoşul → araç → adım adım uygulama → her adımda doğrulama →
  tuzaklar → kontrol listesi.
- **Yaşam döngüsü:** **bakımlı** — arşivlenmez, güncellenir; `guncellemeTarihi` görünür.
- **Şema:** `HowTo`.

### 2.19 Lab projesi ve hesaplayıcı · `lab_projeleri`

- **Ne için:** okumak yerine denemek; token, maliyet, parçalama hesaplayıcıları,
  embedding görselleştirici, model seçici.
- **Zorunlu:** `slug`, `ad`, `tur`, `ozet`, `durum`.
- **Kural:** hesaplama istemcide yapılır; kullanıcı verisi sunucuya gitmez.
  Bu, sayfada açıkça belirtilir.

### 2.20 Araştırma yayınları · `arastirma`

Altı alt tür tek koleksiyonda, `tur` alanıyla ayrışır: **Rapor**, **Benchmark**,
**Veri Seti**, **Whitepaper**, **Index**, **Not**.

- **Zorunlu:** `slug`, `baslik`, `tur`, `ozet`, `tarih`, **`sinirliliklar`
  (en az bir madde)**, `durum`.
- **Şablon:** yönetici özeti → neden bu çalışma → yöntem → bulgular → yorum →
  sınırlılıklar → tekrarlanabilirlik → atıf formatı.
- **Kural (metodoloji ilkesi):** sınırlılık bölümü olmayan yayın onaylanmaz.
  Şema bunu veritabanı seviyesinde zorlar.
- **Şema:** `Dataset` (veri setlerinde), `ScholarlyArticle`.

### 2.21 Dergi · `dergi_sayilari`

- **Ne için:** aylık dosya; bir konuyu farklı açılardan ele alan yazı seti.
- **Zorunlu (sayı):** `slug`, `sayi`, `kapakKonusu`, `tarih`, `durum`.
- **Zorunlu (yazı):** `slug`, `baslik`, `bolum`, `yazarSlug`.
- **Kural:** yazılar PDF'in içine gömülmez; her biri kendi kalıcı adresinde
  HTML olarak yayımlanır ve ayrı ayrı alıntılanabilir.

### 2.22 Podcast · `podcast`

- **Ne için:** uzun soluklu söyleşi; aynı zamanda erişilebilirlik ve GEO için
  tam döküm.
- **Zorunlu:** `slug`, `numara` (tekil), `ad`, `tarih`, `durum`.
- **Kural:** `dokum` alanı doldurulmadan yayımlanmaz — arama ve erişilebilirlik
  için zorunlu.
- **Şema:** `PodcastEpisode`.

### 2.23 Kurumsal hizmet · `hizmetler`

- **Ne için:** platformun ticari tarafı; problem–çözüm eşleşmesi.
- **Zorunlu:** `slug`, `ad`, `ozet`, `problem`, `cozum`, `durum`.
- **Şema:** `Service`.

### 2.24 Sektör sayfası · `sektorler`

- **Ne için:** sektöre özgü kullanım alanları, teknolojiler, riskler ve mevzuat.

### 2.25 Vaka çalışması · `vakalar`

- **Ne için:** yapılan işin kanıtı.
- **Zorunlu:** `slug`, `baslik`, `sektor`, `problem`, `yaklasim`, `durum`.
- **Kural:** müşteri adı yalnızca `onayliYayin: true` ise gösterilir; etki
  rakamları `olcumYontemi` alanı olmadan yayımlanmaz.

### 2.26 AI Readiness · `readiness_sonuclari`

- **Ne için:** kurumsal olgunluk öz değerlendirmesi; yedi boyut, ağırlıklı skor.
- **Kural:** hesaplama istemcide yapılır. Kayıt **yalnızca** kullanıcı sonucu
  paylaşmayı seçerse oluşur ve TTL ile silinir.

### 2.27 Meslek kartı · `meslekler`

- **Ne için:** "bu işi yapmak için ne öğrenmeliyim" sorusunu rotaya bağlamak.
- **Zorunlu:** `slug`, `ad`, `ozet`, `durum`.

### 2.28 Uzman profili · `uzmanlar` · Etkinlik · `etkinlikler`

- **Ne için:** topluluk katmanı; konuşmacı ağı ve takvim.
- **Şema:** `Event` (etkinliklerde), `Person`.

### 2.29 Yazar profili · `yazarlar`

- **Ne için:** E-E-A-T. Her içeriğin arkasında adı, unvanı ve uzmanlığı
  yazılı bir kişi vardır.
- **Zorunlu:** `slug`, `ad`, `unvan`, `basHarfler`.
- **Kural:** `ozgecmis` ve `uzmanlik` doldurulmadan yazar içerik yayımlamaz.
- **Şema:** `Person` + `ProfilePage`.

### 2.30 Editoryal sayfa · `sayfalar` · Politika metni · `politikalar`

- **Ne için:** hakkında, künye, iletişim, metodoloji, editoryal politika;
  gizlilik, KVKK aydınlatma, çerez politikası, kullanım şartları.
- **Kural:** politika metinlerinde `yururlukTarihi`, `surum` ve `surumler`
  zorunludur. `hukukiOnay: false` olduğu sürece sayfada **taslak uyarısı**
  gösterilir.

---

## 3. İçerik olmayan koleksiyonlar

Bunlar sayfa üretmez ama platformu çalıştırır.

| Koleksiyon | Ne için | Not |
|------------|---------|-----|
| `medya` | Görsel, ses, video, belge varlıkları | `altMetin` zorunlu; yapay zekâ ile üretilen görseller `uretimYontemi` ile işaretlenir |
| `yonlendirmeler` | URL taşıma kayıtları | Adres değişince eski adres kalıcı olarak yeni adrese taşınır (§48) |
| `arama_kayitlari` | Site içi arama sorguları | Sonuç üretmeyen sorgular içerik açığı panosunu besler; kişisel veri saklanmaz |
| `_koleksiyon_kunyesi` | Koleksiyon açıklamaları ve kişisel veri işaretleri | Kurulum scripti yazar; KVKK envanterinin kaynağı |

## 4. Kişisel veri içeren koleksiyonlar

Bu beş koleksiyon KVKK işleme envanterine girer ve ayrı saklama politikası taşır.

| Koleksiyon | Veri | Saklama |
|------------|------|---------|
| `kullanicilar` | E-posta, ad, parola **özeti**, izin kayıtları | Hesap silinene kadar |
| `aboneler` | E-posta, onay tarihi ve kaynağı | Çıkışa kadar; çift onay zorunlu |
| `form_kayitlari` | Form alanları (iletişim, teklif, etkinlik) | `saklamaBitis` → TTL ile otomatik silinir |
| `test_sonuclari` | Puan, beceri kırılımı, anonim oturum anahtarı | `saklamaBitis` → TTL ile otomatik silinir |
| `readiness_sonuclari` | Kurum adı, skorlar, iletişim izni | `saklamaBitis` → TTL ile otomatik silinir |

**Kurallar:** parola asla düz metin saklanmaz (yalnızca Argon2/bcrypt özeti);
her izin kaydı `politikaSurumu` ile birlikte tutulur; TTL dizini `saklamaBitis`
alanına bakar ve süre dolduğunda kaydı MongoDB'nin kendisi siler.

---

## 5. Sayılar

| Ölçü | Değer |
|------|-------|
| Sayfa üreten içerik türü | 42 |
| MongoDB koleksiyonu | 33 |
| Dizin | 71 |
| Kişisel veri içeren koleksiyon | 5 |
| TTL (otomatik silme) dizini | 3 |
| Türkçe tam metin arama dizini | 2 (`icerikler`, `atlas`) |

## 6. Şemayı nasıl güncellerim?

Şemalar tek bir yerde tanımlıdır: `lib/mongo/koleksiyonlar.ts`.

```bash
npm run mongo:sema      # TS tanımlarından JSON şema üret
npm run mongo:kur       # şemayı ve dizinleri Atlas'a uygula (yıkıcı değil)
npm run mongo:kontrol   # yalnızca mevcut durumu raporla
```

`mongo:kur` hiçbir koleksiyonu veya belgeyi silmez: yeni koleksiyonları
oluşturur, var olanların doğrulayıcısını `collMod` ile günceller ve eksik
dizinleri ekler. Doğrulama seviyesi `moderate` olduğu için mevcut kayıtlar
bozulmaz; yalnızca yeni ve güncellenen kayıtlar denetlenir.
