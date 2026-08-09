# ADR 0009 — Hareket Sistemi

- **Durum:** Kabul edildi
- **Tarih:** 2026-08-09
- **Talep:** Ürün sahibi "çok daha animasyonel" bir arayüz istedi (ADR 0008 sapmasının devamı).

## Bağlam

BRIEF §5.6 hareketi üç yerle sınırlıyordu: sayfa geçişi, sinyal izi, hover. ADR 0008 dördüncü olarak ekran süpürmesini ekledi. Ürün sahibinin talebi bu sınırın kalkmasını gerektiriyor; ancak §9.1 performans bütçeleri ve §9.2 erişilebilirlik taahhüdü pazarlık dışıdır.

## Karar

Serbest animasyon yerine **kurallı bir hareket sistemi** tanımlandı. Her hareket bir ölçüm cihazı davranışını taklit eder; süsleme amaçlı hareket hâlâ yasaktır.

| Ad | Davranış | Nerede |
| --- | --- | --- |
| `.beliren` | Görüş alanına giren bölüm 16px aşağıdan yerine oturur | Bölüm blokları |
| `.kademe` | Izgara öğeleri `--k` indeksi kadar gecikmeli girer | Kart ızgaraları |
| `.iz-ciz` | SVG yolu soldan sağa "kaydedilir" (stroke-dashoffset) | Hero EKG izi |
| `SayacDeger` | Değer 0'dan gerçek okumaya yükselir (easeOutCubic) | Ölçüm şeridi |
| `.led` | Durum LED'i %55–100 opaklık salınımı | Cihaz üst çubukları |
| `.iskelet` | Yükleme bloklarında tarama bandı | `loading.tsx` |
| `.baglanti-iz` | Alt çizgi soldan sağa çizilir | Kaynak bağlantıları |
| `.acilir-ok` | `+` işareti 45° dönerek `×` olur | SSS, değişiklik günlüğü |
| `.supurme` | Osiloskop süpürmesi (ADR 0008) | Hero paneli |

## Teknik kısıtlar (hepsi zorunlu)

1. **Sıfır JS tercih edilir.** Scroll animasyonları CSS `animation-timeline: view()` ile çalışır — `IntersectionObserver` yok, scroll dinleyici yok. `@supports` koruması sayesinde desteklemeyen tarayıcıda **içerik tam görünür** kalır (gizlenip açılmaz).
2. **Yalnız compositor özellikleri** — `transform` ve `opacity`. Layout/paint tetikleyen animasyon (width, top, box-shadow) yasak. İstisna: `stroke-dashoffset` (SVG, paint ama tek küçük yüzey).
3. **`prefers-reduced-motion: reduce` altında hepsi kapalı.** Sayaç doğrudan son değeri basar, iz çizili gelir, süpürme `display: none`. Fiilen doğrulandı.
4. **JS gerektiren tek öğe** `SayacDeger`; sunucuda ve reduced-motion'da son değeri render eder → hidrasyon uyuşmazlığı yok.
5. Sonsuz döngülü animasyonlar (`.led`, `.supurme`, `.iskelet`) yalnız küçük yüzeylerde ve düşük kontrastta; metin okunurluğunu etkilemez.

## Sonuçlar

- Ölçülen etki: ana sayfa Lighthouse **Perf 0.96 · A11y 1.0 · BP 1.0 · SEO 1.0**, CLS 0 (ADR 0008 turundaki değerlerle aynı — hareket katmanı bütçeyi bozmadı).
- Yeni animasyon eklemek isteyen, bu tablodaki dört kısıta uymak ve tabloya satır eklemek zorundadır.
- Geri alma: `@media (prefers-reduced-motion: no-preference)` sarmalayıcıları kaldırılırsa tüm sistem statik hâle döner; bileşen API'leri değişmez.
