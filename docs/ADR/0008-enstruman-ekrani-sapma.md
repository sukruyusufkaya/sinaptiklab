# ADR 0008 — Enstrüman Ekranı: Tasarım Sapma Kaydı

- **Durum:** Kabul edildi
- **Tarih:** 2026-08-09
- **Talep:** Ürün sahibi (Şükrü Yusuf Kaya), iki kez ardışık olarak "çok daha ultramodern, çok daha futuristik tasarım" istedi.

## Bağlam

BRIEF §5.1 "ölçüm laboratuvarı" konseptini kilitler ve **varsayılan temayı açık** tanımlar; §5.6 hareketi üç yerle sınırlar (sayfa geçişi, sinyal izi, hover). §14/1 mor–camgöbeği gradyan, parlayan küre ve stok YZ görselini yasaklar.

İlk iki tasarım turu (zanaat derinleştirme: milimetrik zemin, veri rayı, HUD çentikleri) konsepti korudu ama talep tekrarlandı — istenen sıçrama, mevcut kısıtların **iki tanesini** esnetmeden karşılanamıyordu.

## Karar

Konseptin **anlatısını genişleterek** sapma yapıldı: "Kağıt her zaman açıktır; **cihazın ekranı** her zaman koyudur." Sayfa artık iki malzeme taşır — laboratuvar kağıdı (açık) ve ona gömülü enstrüman ekranı (koyu).

1. **`.ekran` — tema bağımsız koyu panel.** Token'lar yerel kapsamda ezilir (`--kagit`, `--murekkep`, `--sinyal`…), böylece içindeki her bileşen otomatik uyum sağlar ve **hiçbir bileşende hex yazılmaz** (§14/3 korunur). Site teması açık ya da koyu olsun, ekran panelinin görünümü sabittir.
2. **`.supurme` — osiloskop tarama çizgisi.** §5.6'nın üç hareketine **dördüncüsü** eklendi. Sınırlar: yalnız hero panelinde, tek öğe, salt `transform` (compositor katmanı, layout/paint tetiklemez), 9 sn periyot, `prefers-reduced-motion: reduce` altında `display: none`.
3. **HUD köşe braketleri** (`.hud` + `HudCerceve`) — panel ölçeğinde kalıcı kesim işaretleri; `.centik`in hover'a bağlı olmayan biçimi.

Yasaklar **aynen yürürlükte**: renk gradyanı yok (yalnız çizgi ızgarası ve tek yönlü sinyal maskesi), glow/bloom yok, parlayan küre yok, stok görsel yok, tek sinyal rengi disiplini sürüyor.

## Sonuçlar

- Karşıtlık artışı marka lehine: ana sayfa ilk ekranı artık "bir cihazın önünde durma" hissi veriyor; ölçüm şeridi ekranın okuma satırı olarak panelin içine taşındı.
- **Erişilebilirlik pazarlık dışı:** panel içi metin/zemin oranları WCAG AA sınırının üzerinde tutuldu ve axe ile çift temada doğrulandı (bkz. `tests/e2e/`). `color-scheme: dark` panel kapsamında bildirildi.
- Performans: animasyon tek compositor katmanı; ölçülen CLS/LCP bütçeleri korundu.
- **Geri alma yolu:** `.ekran` sınıfı hero'dan kaldırılırsa sayfa önceki açık kompozisyona döner; token sistemi ve bileşenler değişmeden çalışır.

## Alternatifler

- **Sitenin tamamını koyu-öncelikli yapmak:** reddedildi — uzun form okunabilirliği ve §5.1 "kemik beyazı tezgâh" kimliği kaybolurdu.
- **Gradyan/glow ile "YZ estetiği":** reddedildi — §14/1 yasağı ve §1.2 farklılaşma tezine aykırı.
