# ADR 0003 — Sözlük terimlerinin yaşam döngüsü alanı

**Tarih:** 2026-09-19
**Durum:** Kabul edildi
**İlgili:** MASTER-PLAN §51 (ince sayfa), §56 (answer-first), §59 (kanıt), §60 (tazelik)

## Bağlam

Sözlük 324'ten 538 terime çıkarıldı. Eklenen terimlerin büyük bölümü alanın en
hızlı değişen katmanlarından geliyor: ajan protokolleri, MCP ekosistemi, bağlam
mühendisliği, çıkarım altyapısı, AB Yapay Zekâ Yasası'nın uygulama dili.

Bu katmanda bir tanımın doğru olması yetmiyor. İki somut örnek:

- **MCP `sampling`, `roots` ve `logging`.** 2026-07-28 spesifikasyonuyla
  kullanımdan kaldırıldılar (SEP-2577). Sözlükte yalın bir tanım olarak
  dursalardı okuru bugün kullanılmaması gereken bir özelliğe yönlendirirdik.
  Terimi hiç yazmamak da çözüm değil: okur onunla eski dokümantasyonda ve
  mevcut kod tabanlarında karşılaşmaya devam ediyor.
- **"Context Rot", "Agentic Misalignment".** Alanda kullanılıyorlar ama tanımları
  oturmadı. Bugün yazılan tanımın bir yıl sonra dar kalması olası; bunu
  söylememek, tanımı olduğundan kesin göstermek olur.

`durum` alanı bu işi göremez: o yayın akışını (taslak / incelemede / yayında /
arşiv) tutuyor ve editoryal bir iş akışına ait. Bir terimin *yayında* olması ile
alanda *yerleşik* olması bağımsız iki şey.

## Karar

`terimler` koleksiyonuna iki alan eklendi:

- `asama`: `yerlesik` | `yeni` | `kullanimdan-kalkti`. Alan boşsa terim
  yerleşik sayılır — 324 eski kaydın hiçbirine dokunulmadı.
- `asamaNotu`: en çok 240 karakter. `asama` yerleşik değilse **zorunludur**;
  tohumlama betiği dayanaksız etiketi reddeder.

Üçüncü bir alan, `kaynak: { ad, adres }`, tanımın dayandığı birincil kaynağı
(spesifikasyon, mevzuat metni, resmî dokümantasyon) taşıyor. `https://` olmayan
adres reddediliyor.

## Gerekçe

**Neden zorunlu gerekçe.** Dayanaksız bir "kullanımdan kalktı" etiketi,
MASTER-PLAN §59'un yasakladığı iddianın ta kendisidir: ölçüsüz, kaynaksız,
denetlenemez. Zorunluluk şemada değil tohumlama betiğinde duruyor — şema
koşullu zorunluluk ifade edemiyor, betik edebiliyor ve hatayı yazmadan önce
yakalıyor.

**Neden ayrı bir alan, tanımın içine yazmak yerine.** Tanım `DefinedTerm`
şemasında `description` olarak basılıyor. Geçerlilik bilgisi tanıma karışsaydı
alıntılanan cümle "…sağlıyordu. MCP 2026-07-28 ile kaldırıldı." hâline gelir ve
bir dil modeli terimin tanımı ile o tanımın geçerlilik durumunu ayırt edemezdi.
Ayrı alan, şemada tanımı temiz bırakıyor; not sayfada tanımın altında,
görsel olarak ayrı bir blokta duruyor.

**Neden GEO açısından önemli.** Bir dil modelinin eğitim verisinde bu alanın
eski hâli var. "MCP sampling nedir?" sorusunun cevabında modelin bilmediği şey
tanım değil, özelliğin artık önerilmediği. Sözlük bu farkı taşıyan az sayıdaki
Türkçe kaynaktan biri oluyor — ve `llms.txt` aşama işaretli terimlerin tam
listesini gerekçeleriyle yayımlıyor.

## Sonuçlar

- `/sozluk/` sayfasında "Değişen terimler" bölümü açıldı; aşaması yerleşik
  olmayan terimler gerekçeleriyle öne çıkıyor (§60 tazelik).
- `llms.txt` bu iki listeyi tam hâliyle taşıyor.
- Yeni bir alan ekleyen her terim tohumlamasında `asamaNotu` zorunluluğu
  denetleniyor; kural kodda, editörün hatırlamasına bırakılmadı.
- `asama` için dizin açıldı — işaretli terimleri filtrelemek tam tarama
  gerektirmesin.

## Reddedilen seçenekler

**Kullanımdan kalkan terimi silmek.** Okurun karşılaştığı terimi sözlükten
çıkarmak, soruyu cevapsız bırakır ve onu daha kötü bir kaynağa yollar.

**Ayrı bir "arşiv sözlüğü" sayfası.** Sözlüğün tek ve tam liste olması,
"bu terim neden burada yok" sorusunu ortadan kaldıran temel özelliği
(`lib/icerik/atlas.ts` içindeki gerekçe). İkiye bölmek onu geri getirirdi.

**Serbest metin durum alanı.** Enum olmayan bir alan zamanla "deprecated",
"Deprecated", "kullanılmıyor", "eski" gibi beş yazıma dağılır — projede daha
önce `uzmanlar.koltukDurumu` ile yaşanan hata sınıfı.
