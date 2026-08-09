# ADR 0010 — Tasarım Yönü Revizyonu: Koyu-Öncelikli ve Yumuşak

- **Durum:** Kabul edildi
- **Tarih:** 2026-08-09
- **Karar veren:** Ürün sahibi (Şükrü Yusuf Kaya), doğrudan yönlendirmeyle.

## Bağlam

BRIEF §5 tasarımı üç noktada kilitliyordu: (1) varsayılan tema **açık** ("kemik beyazı tezgâh"), (2) `border-radius` **maks 4px** (enstrüman hissi), (3) hareket üç yerle sınırlı — (3) zaten ADR 0009 ile genişletilmişti.

Dört tasarım turu boyunca konsept korunarak zanaat derinleştirildi (milimetrik zemin, HUD, veri rayları, enstrüman ekranı). Ürün sahibi sonuçtan memnun olmadığını belirtip yönü netleştirdi:

- **Rahatsız eden:** "fazla sade ve keskin", "görsel/illüstrasyon yok"
- **İstenen tema:** koyu-öncelikli site (yalnız hero değil)
- **Referans:** Stripe / Notion — ferah, yumuşak, sıcak, görsel zenginlikli

## Karar

Marka DNA'sı (ölçüm, sinyal, kalibrasyon dili) korunur; **malzeme ve doku değişir**.

1. **Koyu varsayılan.** `:root` artık koyu paleti taşır. Açık tema kaybolmaz: `prefers-color-scheme: light` ve kullanıcının açık seçimi (`[data-theme="light"]`) tam destekli kalır. Tema anahtarı iki yönlü çalışmayı sürdürür.
2. **Yumuşak geometri.** Radius ölçeği 4px'ten çıkarılıp kademeli sisteme geçer: `sm 6px · md 10px · lg 16px · xl 24px`. Hairline çerçeveler yerini yumuşak kenar + yükselti (elevation) katmanına bırakır.
3. **Genişletilmiş palet.** Tek sinyal rengi disiplini yerini **birincil + dört destek tonuna** bırakır (sinyal mavisi, teal, kehribar, mercan, mor-olmayan yumuşak yeşil). Kural: bir yüzeyde en çok iki vurgu rengi; anlam taşımayan renk yok.
4. **Görsel katman.** Özgün SVG ikon seti (24px, stroke tabanlı) ve soyut-teknik illüstrasyonlar eklenir. **Yasaklar aynen sürüyor:** robot/beyin görseli, stok fotoğraf, mor–camgöbeği gradyan, parlayan küre, YZ klişesi.
5. **Ferahlık.** Bölüm dikey boşlukları ve satır aralıkları artar; yoğunluk yerine nefes.

## Yürürlükten kalkan kurallar

- BRIEF §5.1'in "varsayılan tema açık" hükmü → koyu-öncelikli.
- BRIEF §5.5'in "border-radius maks 4px" hükmü → kademeli radius ölçeği.
- BRIEF §5.2'nin "tek sinyal rengi" kısıtı → disiplinli çok tonlu palet.

## Değişmeyenler (pazarlık dışı)

- **Erişilebilirlik:** WCAG AA kontrast, axe sıfır ihlal, klavye erişimi, `prefers-reduced-motion`.
- **Performans:** §9.1 bütçeleri (Lighthouse ≥95, CLS ≤0.02) CI'da zorunlu kalır.
- **§14 yasakları:** gradyan klişesi, stok görsel, üçüncü parti script, token dışı hex.
- Token disiplini: bileşenlerde hex yazılmaz; renk yalnız CSS değişkenlerinden gelir.

## Sonuçlar (uygulandı)

- Tema anahtarı artık "koyudan açığa" yön değiştirir; `color-scheme` bildirimi, `viewport.themeColor` ve tarayıcı UI'ı buna göre güncellendi.
- `.ekran` (ADR 0008) **vurgu paneline dönüştü**: tema-bağımsız koyu override değil, token'lara dayanan yükseltilmiş yüzey + ışıklılık perdesi. İki temada da doğru çalışır.
- **HUD köşe braketleri emekliye ayrıldı** (`HudCerceve` bileşeni ve `.hud` kuralları silindi): keskin kesim işaretleri yeni malzemeyle çelişiyordu; yerini yumuşak kenar + yükselti aldı. `.centik` sınıfı korundu ama davranışı "köşe braketi" yerine "yükselti + kenar belirginleşmesi" oldu — çağrı yerlerini tek tek değiştirmeye gerek kalmadı.
- Kart hover'ı mavi çerçeveden nötr güçlü kenara + yükseltiye çekildi; sinyal mavisi eylem öğelerine (düğme, girdi, bağlantı) ayrıldı.
- Görsel katman `components/gorsel/` altında: 23 ikon (12 pillar + 9 içerik türü haritalı), hero kompozisyonu, 3 boş durum ve 3 bölüm illüstrasyonu. Hepsi saf SVG server component, `currentColor` tabanlı, sıfır paket.

### Uygulama sırasında ölçülen iki gerçek kusur

1. **Tema geçişi renk interpolasyonu.** Anahtar basıldığında sayfadaki her `transition-colors` aynı anda tetikleniyor ve ~150ms boyunca metin ile zemin birbirine yakın ara renklerde kalıyordu (axe: 1.09:1, WCAG 1.4.3). Çözüm: anahtar tek kare boyunca `.tema-degisiyor` sınıfı ekliyor, o sınıf tüm geçişleri susturuyor.
2. **`content-visibility: auto` tema değişimini kaçırıyor.** Atlanan bölümlerde kendi `color`'ını token'dan alan öğeler eski temanın rengiyle donup kalıyordu (koyu zemin üstünde açık tema metni). Çözüm: aynı tek kare boyunca `.gec-boya` bölümleri `content-visibility: visible` ile render edilmeye zorlanıyor.

Her ikisi de yalnız test kırıklığı değil, gerçek kullanıcının tema değiştirdiğinde göreceği kusurdu.

### Geri alma

Token bloğu tek dosyada (`app/globals.css`) toplandığı için açık-öncelikliye dönüş, `:root` ve `[data-theme="light"]` bloklarının yer değiştirmesi + `html { color-scheme }` ve `viewport.themeColor` sırasının çevrilmesiyle olur.
