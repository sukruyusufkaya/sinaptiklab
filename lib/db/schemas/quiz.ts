import type { WithId } from "mongodb";
import { z } from "zod";
import { seviyeSema } from "./content";
import { kaynakSema, type IndexTanimi } from "./ortak";

/**
 * Testler (BRIEF §2.1'e eklenen modül) — okuyucunun kendini sınadığı
 * çoktan seçmeli setler.
 *
 * Editoryal sözleşme içerikle AYNI katılıkta: her sorunun bir açıklaması
 * ("neden bu şık") ve testin kaynak listesi zorunludur. Fark şu: soru
 * açıklaması mümkün olduğunca SİTEDEKİ yayına bağlanır (`kanitSlug`), yani
 * test bağımsız bir bilgi iddiası üretmez — var olan kaynaklı içeriğin
 * ölçme yüzeyidir. Bu, "kaynaksız sayı/iddia yok" kuralını testlere de
 * taşımanın en dürüst yolu.
 */

export const testTuruSema = z.enum([
  /** Bir konuyu ölçen tematik set (RAG, LLM temelleri…) */
  "konu",
  /** Teknik mülakat hazırlığı — sorular mülakatta gerçekten sorulan biçimde */
  "mulakat",
]);
export type TestTuru = z.infer<typeof testTuruSema>;

export const secenekSema = z.object({
  id: z.string().min(1),
  metin: z.string().min(1),
});

export const soruSema = z.object({
  id: z.string().min(1),
  soru: z.string().min(1),
  secenekler: z.array(secenekSema).min(2).max(6),
  /** Doğru seçeneğin id'si — `secenekler` içinde bulunmak ZORUNDA (aşağıda kontrol) */
  dogru: z.string().min(1),
  /** Neden bu şık: yalnız "doğru" demek öğretmez, gerekçe zorunlu. */
  aciklama: z.string().min(1),
  /** Açıklamayı doğrulayan site içeriğinin slug'ı (varsa). */
  kanitSlug: z.string().optional(),
  zorluk: seviyeSema,
});
export type Soru = z.infer<typeof soruSema>;

const testTemel = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  dek: z.string().min(1),
  kind: testTuruSema,
  pillar: z.string().min(1),
  tags: z.array(z.string()),
  level: seviyeSema,
  /** Geçme eşiği (%) — sonuç ekranı bunu kullanır. */
  passScore: z.number().int().min(1).max(100),
  /** Tahmini süre (dk); soru sayısından türetilmez, editör verir. */
  durationMinutes: z.number().int().min(1).max(180),
  status: z.enum(["draft", "published"]),
  publishedAt: z.date().nullable(),
  updatedAt: z.date(),
  lastVerifiedAt: z.date(),
  version: z.number().int().min(1),
  sources: z.array(kaynakSema).min(1),
  sorular: z.array(soruSema).min(3),
});

/**
 * Şema düzeyinde iki tutarlılık kuralı. Bunlar uygulama katmanına
 * bırakılırsa er ya da geç bozuk bir test yayına çıkar: doğru cevabı
 * seçenekler arasında olmayan soru, kullanıcıya HER ZAMAN yanlış yaptırır
 * ve sessizce yanlış öğretir.
 */
export const testSema = testTemel.superRefine((test, ctx) => {
  const gorulenSoru = new Set<string>();
  test.sorular.forEach((soru, sira) => {
    if (gorulenSoru.has(soru.id)) {
      ctx.addIssue({
        code: "custom",
        path: ["sorular", sira, "id"],
        message: `Soru id'si tekrar ediyor: ${soru.id}`,
      });
    }
    gorulenSoru.add(soru.id);

    const secenekIdleri = new Set(soru.secenekler.map((s) => s.id));
    if (secenekIdleri.size !== soru.secenekler.length) {
      ctx.addIssue({
        code: "custom",
        path: ["sorular", sira, "secenekler"],
        message: "Seçenek id'leri benzersiz olmalı",
      });
    }
    if (!secenekIdleri.has(soru.dogru)) {
      ctx.addIssue({
        code: "custom",
        path: ["sorular", sira, "dogru"],
        message: `Doğru cevap (${soru.dogru}) seçenekler arasında yok`,
      });
    }
  });
});

export type Test = z.infer<typeof testTemel>;
export type TestDoc = WithId<Test>;

export const testIndexes: IndexTanimi[] = [
  { key: { slug: 1 }, options: { unique: true } },
  { key: { status: 1, publishedAt: -1 } },
  { key: { kind: 1, status: 1 } },
  { key: { pillar: 1, status: 1 } },
];
