# ADR 0005 — Yazar Modeli ve E-E-A-T

- **Durum:** Kabul edildi (kullanıcı onayı, 2026-08-08)
- **Tarih:** 2026-08-08

## Bağlam
E-E-A-T ve GEO varlık sinyalleri (BRIEF §8.4) gerçek, doğrulanabilir yazar kimliği ister. Seçenekler: tek yazar, baştan konuk yazar programı, çok yazarlı çekirdek kadro.

## Karar
1. **Lansman tek yazarla:** Şükrü Yusuf Kaya. Tam E-E-A-T yazar sayfası: unvan, uzmanlıklar, `sameAs[]` (GitHub, LinkedIn, X), `Person` JSON-LD, yayın listesi.
2. **Teknik editör rolü** gün 1'den şemada (`technicalReviewer`) ve UI'da; başlangıçta boş kalabilir, atandığında `reviewedBy` JSON-LD'ye yansır.
3. **Konuk yazar programı** ~30 yayınlanmış içerik eşiğinden sonra **davetle** açılır; başvuru formu ve editoryal süreç o aşamada tasarlanır (yeni ADR).
4. `authors` koleksiyonu baştan çok-yazarlıya hazır (içerikte `authors: ObjectId[]`); tek yazar bir veri durumudur, mimari kısıt değildir.

## Sonuçlar
- İçerik hacim planı tek yazar kapasitesine göre (Faz 10 takviminde pillar başına kota buna göre ayarlanır).
- Tutarlı tek ses = terminoloji tutarlılığı (§8.3/6) kolaylaşır.
- Risk: tek kişiye bağımlılık; hafifletme: sürümlü içerik + güçlü editoryal şablonlar (`content-ops/`).
