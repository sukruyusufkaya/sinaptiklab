# ADR 0004 — Erişim, Üyelik ve Topluluk Modeli

- **Durum:** Kabul edildi (kullanıcı onayı, 2026-08-08)
- **Tarih:** 2026-08-08

## Bağlam
Brief'in GEO katmanı (§8) "en büyük farklılaştırıcı" ve §8.3/8 "paywall/login yok yayın içeriğinde" kuralını koyuyor. Karar sürecinde "platform tamamen ücretli olsun" seçeneği gündeme geldi; netleştirmede kullanıcı modeli şöyle tanımladı: **üyelik yorum ve ileride belirlenecek özellikleri açar, ödeme yapısı olmayacak.**

## Karar
1. **Tüm yayın içeriği (makale, rehber, tutorial, sözlük, ölçüm, kurs, lab) herkese açık ve ücretsizdir.** Paywall, metered sayaç veya login duvarı yoktur. §8 GEO yüzeyleri (llms.txt, `.md` route'lar, `/api/content`, MCP) tam içerikle çalışır.
2. **Ödeme altyapısı kurulmaz.** Abonelik, sanal POS, MoR entegrasyonu kapsam dışıdır; ileride gelir modeli gündeme gelirse yeni ADR açılır.
3. **Ücretsiz üyelik** (Auth.js: e-posta OTP + GitHub + Google) şu yetkileri açar:
   - Yorum yazma (moderasyon kuyruğuyla)
   - Forum katılımı (Faz 7)
   - Kurs/patika ilerleme takibi + sertifika
   - **Sonradan belirlenecek üye özellikleri** — aday listesi (henüz kararlaştırılmadı): içerik kaydetme/okuma listesi, bülten tercih yönetimi, yeni içerik bildirimleri. Aktifleştirme kullanıcı onayıyla.
4. **Forum zamanlaması (K4):** Faz 7'de, davetli başlangıçla açılır (boş forum güven kırar); genel kayıt sonra açılır.

## Sonuçlar
- Mimarie "entitlement" katmanı basit kalır: `user` var/yok + rol; plan/abonelik kavramı yok.
- `enrollments`/`progress` koleksiyonları ödeme değil sadece ilerleme taşır; sertifika ücretsiz üretilir.
- KVKK yükü üyelik verisiyle sınırlı (e-posta, OAuth profili); veri silme akışı §9.3 aynen geçerli.
