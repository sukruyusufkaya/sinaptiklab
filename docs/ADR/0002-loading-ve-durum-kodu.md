# ADR 0002 — `loading.tsx` ile HTTP durum kodu arasındaki seçim

**Durum:** kabul edildi
**Tarih:** 2026-09-12
**İlgili maddeler:** MASTER-PLAN §45 (kalıcı URL), §48 (yönlendirmeler), §50 (site haritası)

## Bağlam

Faz 2 kapsamında `loading.tsx` iskeletleri eklendi: grup kökünde
`app/(site)/loading.tsx` ve on üç içerik detay rotasında (`atlas/[slug]`,
`haber/[slug]`, `rehber/[slug]`…) birer tane. Aynı fazda panelden tanımlanan
URL yönlendirmeleri `app/(site)/[...yol]/page.tsx` yakalayıcısına bağlandı.

Uçtan uca doğrulamada ikisinin birlikte çalışmadığı görüldü. Ölçülen davranış:

| Adres                             | Beklenen | Ölçülen |
| --------------------------------- | -------- | ------- |
| `/makale/rag-mi-fine-tuning-mi/`  | 308      | **200** |
| `/boyle-bir-adres-yok/`           | 404      | **200** |
| `/atlas/olmayan-kavram/`          | 404      | **200** |

Sitedeki `notFound()` çağıran 34 sayfanın **tamamı** 200 dönüyordu.

## Neden

`loading.tsx` bir Suspense sınırı kurar. Next sınırı görünce iskeleti
render edip HTML kabuğunu **hemen** akıtmaya başlar — ve ilk bayt gidince
HTTP durum satırı artık yazılmıştır. Sayfa gövdesi bundan sonra çalışır;
içindeki `notFound()` / `redirect()` durumu değiştiremez, yalnızca akışın
devamına düşer. Sonuç:

- `notFound()` → gövdesi 404 ekranı, durumu `200` olan bir **soft 404**.
  Google soft 404'ü yinelenen/düşük değerli içerik sayar ve var olmayan
  sonsuz adres uzayını indekslemeye çalışır.
- `permanentRedirect()` → `308` yerine `<meta http-equiv="refresh">` +
  istemci tarafı kurtarma. Arama motoru bunu kalıcı yönlendirme saymaz;
  §48'in bütün amacı olan bağlantı değeri aktarımı gerçekleşmez.

Kontrol vakası mekanizmayı doğruluyor: `loading.tsx` sınırı altında olmayan
`/onizleme/[anahtar]/` rotası aynı `notFound()` çağrısıyla doğru `404`
döndürüyor.

## Değerlendirilen seçenekler

1. **`dynamicParams = false`** — bilinmeyen slug rotalama katmanında, hiç
   render edilmeden 404 olur. Reddedildi: panelden yayımlanan YENİ bir kayıt
   bir sonraki derlemeye kadar 404 dönerdi. CMS için kabul edilemez.
2. **Yönlendirmeyi middleware'de çözmek** — Edge çalışma zamanı MongoDB
   sürücüsünü yükleyemez; Node runtime'a alınsa her istekte veritabanı
   sorgusu demek olurdu. Zaten `notFound()` tarafını hiç çözmüyor.
3. **`next.config.ts` `redirects()`** — yalnızca yönlendirmeyi çözer, kayıt
   ancak yeniden dağıtımla etkinleşir ve editör yaşayan bir adresi kaynak
   yazarsa o sayfayı erişilemez kılar (`lib/mongo/sorgular/yonlendirme.ts`
   başlığındaki gerekçe).
4. **Suspense sınırlarını kaldırmak** — seçilen.

## Karar

`notFound()` veya `redirect()` çağıran hiçbir rotanın üzerinde `loading.tsx`
bulunmaz. On dört dosya kaldırıldı:

- `app/(site)/loading.tsx` (grup kökü — bütün siteyi etkiliyordu)
- `analiz`, `arastirma`, `atlas`, `dergi/[sayi]/[yazi]`, `haber`, `kariyer`,
  `konu`, `kurumsal`, `modeller`, `ogren/dersler`, `ogren/yollar`, `rehber`,
  `vaka-calismalari` detay rotalarındaki on üç dosya

Korunanlar: `app/(site)/ara/loading.tsx` ve `app/(site)/kesfet/loading.tsx` —
bu iki sayfa var olmayan bir kaydı reddetmiyor, dolayısıyla durum kodu
kararı vermiyor.

## Sonuç

Doğru durum kodu, yükleme iskeletine tercih edildi. Gerekçe: iskelet
**kozmetik** ve zaten sayfaların çoğunda görünmüyordu (297 sayfa statik
üretiliyor; ilk boyamada HTML hazır, iskelet yalnızca istemci tarafı gezinme
sırasında kısa süre görünürdü). Durum kodu ise **yapısal**: soft 404 tarama
bütçesini yakar, yönlendirmenin 200'e düşmesi eski adreslerin biriktirdiği
bağlantı değerini çöpe atar. Bu projenin tamamı SEO/GEO üzerine kurulduğu
için takas tek yönlü.

Kural `components/arayuz/Iskelet.tsx` dosya başlığına ve korunan iki
`loading.tsx` dosyasına yazıldı ki sınır yeniden eklenmesin.

## Doğrulama

Regresyon, `npm run build` sonrası `next start` üzerinde ölçülür:

```
/makale/rag-mi-fine-tuning-mi/  → 308, konum /makale/rag-fine-tuning-karsilastirmasi/
/boyle-bir-adres-yok/           → 404
/atlas/                         → 200   (yakalayıcı yaşayan sayfayı gölgelemez)
/atlas/olmayan-kavram/          → 404
```
