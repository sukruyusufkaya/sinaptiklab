# ADR 0004 — Köşe yazıları: görüş yazısının adresi ve sözleşmesi

**Tarih:** 2026-10-05
**Durum:** Kabul edildi
**İlgili:** MASTER-PLAN §9 (konu ≠ format), §45–46 (kalıcı URL), §56 (answer-first), §59 (kanıt);
`docs/ICERIK-TURLERI.md` satır 30

## Bağlam

İçerik türleri envanteri görüş yazısını `icerikler` (`tur: gorus`) içinde ve
`/analiz/<slug>/` adresinde tanımlıyordu. İlk köşe yazısı yayına hazırlanırken
iki sorun ortaya çıktı:

1. **Adres sözleşmeyi bozuyordu.** `/analiz/` altındaki her metin bir tez güveni
   (`tezGuveni`) ve yanlışlanma koşulu (`yanlislanmaKosulu`) taşır; analiz
   sayfası bu iki alanı okura "buna ne kadar güvenebilirim" cevabı olarak basar.
   Görüş yazısı bu alanları taşımaz — taşısaydı analiz olurdu. Aynı adres
   altında iki farklı söz veren metin okuru yanıltır.
2. **Menü zaten başka bir yeri gösteriyordu.** Gezinmede "Dergi → Köşe Yazıları"
   (`/dergi/kose/`) duruyordu. Bu arşiv yalnızca dergi sayılarının içindeki
   "Görüş" bölümünü listeliyordu; sayılar arşive alındığı için boştu ve
   "Yakında" rozeti taşıyordu. Köşe yazısı ise aylık sayıyı beklemez.

## Karar

- Görüş yazısı `icerikler` koleksiyonunda `tur: 'gorus'` olarak kalır (şema
  değişmez, §9).
- **Kanonik adres `/dergi/kose/<slug>/`dir.** Tarihsiz, sondaki eğik çizgiyle
  biter (§45–46). Yol `lib/icerik/kose.ts` → `koseYolu()` içinde tek yerde
  üretilir; panelin "sitede gör" bağlantısı (`TUR_YOLLARI.gorus`) aynı kalıbı
  izler.
- `app/(site)/dergi/kose/` statik klasörü `[sayi]` dinamik segmentinin önüne
  geçer. `[sayi]` bölüm arşivi listesinden `kose` çıkarıldı; aynı yol iki kez
  prerender edilmez.
- Köşe arşivi iki kaynağı birlikte listeler: bağımsız görüş yazıları ve dergi
  sayılarının "Görüş" bölümü yazıları. İkincisinin kanonik adresi sayının
  altında kalır; arşivde yalnızca bağlantısı durur.

### Görüş yazısının sözleşmesi

- **İmzalıdır.** Yazarı çözülemeyen görüş yazısı okuma katmanında ATLANIR;
  haber akışındaki gibi redaksiyon imzasına düşürülmez. İmzasız görüş, kanıt
  yükünü taşıyacak kimsesi olmayan iddiadır.
- **Rakamı kaynaklıdır.** Yeni `veriNoktalari` alanı (`deger`, `aciklama`,
  `kaynak`, `adres` — dördü de zorunlu) metnin kullandığı her sayıyı birincil
  kaynağıyla taşır ve sayfada "Yazıdaki veriler" şeridi olarak basılır (§59).
  Kaynağı olmayan rakam bu alana yazılamaz.
- **Kendini ilan eder.** Sayfa "Bu bir görüş yazısıdır" notunu taşır ve
  `OpinionNewsArticle` şeması basar.

### Sunum

Gövde aynı blok modelini kullanır; yeni blok tipi eklenmedi. `MetinGovdesi`
`gorunum="kose"` ile dergi tipografisine geçer ve biçimi bloğun şeklinden okur
(soru listesi → soru kartları, kısa öğe envanteri → çipler, `akis` → dikey zaman
çizelgesi, kaynaksız `alinti` → alıntı bloğu). Satır içi `**vurgu**` işareti
tüm görünümlerde `<strong>` olarak basılır; düz metin yüzeylerinde
`duzMetin()` ile kaldırılır.

## Sonuçlar

- `/analiz/` yalnızca tez güveni ve yanlışlanma koşulu taşıyan metinleri
  barındırmaya devam eder.
- "Köşe Yazıları" menü bağlantısı rozetsizdir; arkasında yayında içerik var.
- Röportaj (`tur: roportaj`) hâlâ envanterde `/analiz/<slug>/` olarak duruyor.
  İlk röportaj yayına girerken aynı soru sorulmalı; muhtemel cevap
  `/dergi/roportaj/<slug>/`dir.
