# ADR 0007 — Geçici /admin Koruması (Basic Auth)

- **Durum:** Kabul edildi (geçici; Faz 7'de kaldırılacak)
- **Tarih:** 2026-08-08

## Bağlam
Yönetim paneli Faz 2'de geliyor; kalıcı kimlik sistemi (Auth.js v5, rol tabanlı `owner|editor|author|moderator`) ise Faz 7 kapsamında. Panel canlı sitede korumasız kalamaz.

## Karar
Faz 2-6 arası `/admin/*` yolları middleware'de **HTTP Basic Auth** ile korunur:
- Kimlik `ADMIN_USER` / `ADMIN_PASS` env değişkenlerinden okunur (zod'lu `lib/env.ts` üzerinden; parola min 8 karakter).
- Değişkenler tanımlı değilse `/admin` **404** döner (güvenli varsayılan — panel fiilen kapalı).
- HTTPS zorunlu ortamda (Vercel) Basic Auth kabul edilebilir geçici çözümdür; CSRF yüzeyi yok çünkü Server Action'lar da aynı istek bağlamında bu duvarla korunur.

## Sonuçlar
- Faz 7'de Auth.js oturumu + rol kontrolü gelince bu middleware bloğu ve env değişkenleri kaldırılır; ADR güncellenir.
- Vercel'e `ADMIN_USER`/`ADMIN_PASS` eklenmeden canlıda panel görünmez (bilinçli).
- Sınırlama: tek kullanıcı, oturum/audit yok — Faz 2-6'da editör tek kişi (kurucu) olduğu için kabul edildi.
