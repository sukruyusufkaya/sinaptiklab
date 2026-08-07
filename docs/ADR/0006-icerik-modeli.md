# ADR 0006 — İçerik Modeli ve Editoryal Zorlayıcılar

- **Durum:** Kabul edildi
- **Tarih:** 2026-08-08

## Bağlam
"Saha verisi, uydurma yok" konumlandırması yalnızca editoryal niyetle değil, **kodla** zorunlu kılınacak (BRIEF §1.3, §4.3). İçerik 13 türde, tamamı sürümlü ve makine-okunabilir olmalı.

## Karar
1. **Tek koleksiyon, `type` ayrımı:** Tüm yayın türleri (`article|guide|tutorial|lab|tool|benchmark|case|compliance|issue`) `contents` koleksiyonunda; `terms`, `topics`, kurs/forum yapıları ayrı koleksiyonlarda (BRIEF §4.1-4.2 şemaları bağlayıcıdır).
2. **MDX string DB'de**, `next-mdx-remote/rsc` ile derlenir; markdown dosya sistemi (contentlayer vb.) kullanılmaz. Gerekçe: admin panelinden CRUD + ISR revalidation + `.md` GEO çıktısının tek kaynaktan üretimi.
3. **Editoryal zorlayıcılar Server Action'da** (yayın kapısı, §4.3'ün 10 maddesi): `sources[] ≥ 1`, `answerFirst` 40–80 kelime, `faq ≥ 2`, stabil TOC id'leri, alt zorunluluğu, tutorial/lab için `repro.repoUrl`, tool/benchmark için 90 günlük `lastVerifiedAt`, ≥3 iç + ≥2 dış link, slug/redirect bütünlüğü, kırık link taraması. Hata mesajları eyleme dönük.
4. **Zod tek sözleşme kaynağı:** her koleksiyonun zod şeması `lib/db/schemas/` altında; TS tipleri `z.infer` ile türetilir; index tanımları `scripts/ensure-indexes.ts` ile idempotent.
5. **Sürümleme:** her yayın güncellemesi `changelog[]`'a kayıt + `version` artışı; `major`/`correction` türleri UI'da görünür.
6. **Taksonomi:** 12 pillar sabit (BRIEF §2.3); cluster ağacı Faz 0 araştırma çıktısıyla kesinleşir ve `topics` koleksiyonuna tohumlanır — ağaç onaylanınca bu ADR'ye ek (Ek A) olarak işlenir.

## Sonuçlar
- Yayınlama yavaşlar ama her yayın GEO/SEO-eksiksiz çıkar; "hızlı ama kaynaksız" içerik teknik olarak imkânsız.
- `.md` çıktısı ve `llms-full` üretimi MDX kaynağından deterministik türetilir; ikinci bir içerik deposu yoktur.
- Şema değişiklikleri migration script'i + ADR günceli gerektirir.

## Ek A — Pillar/Cluster ağacı
**ONAYLANDI — 2026-08-08.** Bağlayıcı ağaç: [docs/arastirma/pillar-cluster-agaci.md](../arastirma/pillar-cluster-agaci.md) (12 pillar / 124 cluster). Faz 2'de `topics` koleksiyonuna bu dosyadan tohumlanır; ağaç değişikliği bu ADR'nin güncellenmesini gerektirir.
