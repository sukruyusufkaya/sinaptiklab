import {
  AI_AGENT,
  AI_ETIGI,
  AI_GUVENLIGI,
  AI_TEMELLERI,
  COMPUTER_VISION,
  DEEP_LEARNING,
  DEGERLENDIRME,
  GENERATIVE_AI,
  LLM,
  MACHINE_LEARNING,
  PROMPT_ENGINEERING,
  RAG,
  SEVIYE_SORULARI,
} from '@/lib/veri/sorular';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { temizle, YAYINDA, type Donusturucu, type TohumBelgesi } from '@/lib/tohum/tipler';
import type { Soru } from '@/lib/tipler';

/**
 * Soru bankası dönüştürücüsü.
 *
 * Fixture 13 ayrı dizi dışa aktarır; şemada tek koleksiyon var ve `kimlik`
 * tekil dizindir. Giderilen uyumsuzluklar:
 *
 *  1. `durum` fixture'da hiç yok (şemada zorunlu değil ama panel filtresi ve
 *     yayın akışı bu alanı bekliyor) → `yayinda` verilir.
 *  2. Sorunun hangi diziden geldiği fixture'da yalnızca export adıyla kodlu;
 *     şemada böyle bir alan yok. Bu bilgi `etiketler` dizisine slug olarak
 *     yazılır (`rag`, `llm`, `seviye`…) — `testler.soruEtiketi` bu değerle
 *     eşleşir, yani test slug'ının `-testi` eki atılmış hali.
 *  3. `SEVIYE_SORULARI` yeni soru tanımlamaz; diğer dizilerden 15 kaydı
 *     REFERANS eder. Aynı `kimlik` iki kez yazılırsa upsert ikinci geçişte
 *     ilkini ezer ve `seviye` etiketi kaybolur. Bu yüzden kayıtlar `kimlik`
 *     üzerinde birleştirilir: belge bir kez üretilir, etiketleri birikir
 *     (örn. `['ai-temelleri', 'seviye']`). Birleştirilen her kimlik
 *     `console.warn` ile bildirilir.
 *  4. Şemada olmayan alan yazılmaz; `Soru` tipinin tüm alanları şemada var,
 *     bu yüzden alan atılmıyor.
 *
 * Şema sınırları (`soru` minLength 10, `secenekler` 2–6 öge, `dogruIndeks`
 * 0–5, `zorluk` SEVIYE enum'u) üretim sırasında denetlenir; ihlal eden kayıt
 * sessizce düzeltilmez, ATLANIR ve bildirilir.
 */

/** Dizi → `etiketler` değeri. Sıra korunur: ilk etiket sorunun ana testidir. */
const KAYNAKLAR: { etiket: string; sorular: readonly Soru[] }[] = [
  { etiket: 'ai-temelleri', sorular: AI_TEMELLERI },
  { etiket: 'machine-learning', sorular: MACHINE_LEARNING },
  { etiket: 'deep-learning', sorular: DEEP_LEARNING },
  { etiket: 'generative-ai', sorular: GENERATIVE_AI },
  { etiket: 'llm', sorular: LLM },
  { etiket: 'prompt-engineering', sorular: PROMPT_ENGINEERING },
  { etiket: 'rag', sorular: RAG },
  { etiket: 'ai-agent', sorular: AI_AGENT },
  { etiket: 'computer-vision', sorular: COMPUTER_VISION },
  { etiket: 'degerlendirme', sorular: DEGERLENDIRME },
  { etiket: 'ai-guvenligi', sorular: AI_GUVENLIGI },
  { etiket: 'ai-etigi', sorular: AI_ETIGI },
  { etiket: 'seviye', sorular: SEVIYE_SORULARI },
];

/** Şemadaki `SEVIYE` enum'u. */
const ZORLUKLAR = new Set(['baslangic', 'orta', 'ileri']);

export const SORULAR_DONUSTURUCUSU: Donusturucu = {
  koleksiyon: KOLEKSIYONLAR.sorular,
  anahtarAlan: 'kimlik',
  not: 'lib/veri/sorular.ts — 13 dizi birleştirilir; diziyi bildiren slug etiketler alanına yazılır, kimlik tekrarları etiket birleştirmesiyle ayıklanır, durum eklenir.',
  uret: () => {
    const belgeler = new Map<string, TohumBelgesi>();
    const etiketler = new Map<string, string[]>();
    const tekrarlar: string[] = [];

    for (const { etiket, sorular } of KAYNAKLAR) {
      for (const soru of sorular) {
        const kimlik = soru.kimlik;

        if (!kimlik) {
          console.warn(`[tohum:sorular] "${soru.soru?.slice(0, 40)}…" atlandı — kimlik yok.`);
          continue;
        }

        // Aynı kimlik ikinci kez görüldü (SEVIYE_SORULARI referansları):
        // belgeyi yeniden üretmek yerine yalnızca etiketi ekle.
        const mevcutEtiketler = etiketler.get(kimlik);
        if (mevcutEtiketler) {
          if (!mevcutEtiketler.includes(etiket)) mevcutEtiketler.push(etiket);
          tekrarlar.push(`${kimlik} → ${mevcutEtiketler.join(', ')}`);
          continue;
        }

        if (!ZORLUKLAR.has(soru.zorluk)) {
          console.warn(
            `[tohum:sorular] "${kimlik}" atlandı — zorluk enum dışı: "${soru.zorluk}" (beklenen: baslangic, orta, ileri)`,
          );
          continue;
        }

        if (typeof soru.soru !== 'string' || soru.soru.length < 10) {
          console.warn(`[tohum:sorular] "${kimlik}" atlandı — soru metni 10 karakterden kısa.`);
          continue;
        }

        const secenekler = soru.secenekler.filter((s) => typeof s === 'string' && s.length > 0);
        if (secenekler.length < 2 || secenekler.length > 6) {
          console.warn(
            `[tohum:sorular] "${kimlik}" atlandı — seçenek sayısı ${secenekler.length} (şema 2–6 istiyor).`,
          );
          continue;
        }

        if (
          !Number.isInteger(soru.dogruIndeks) ||
          soru.dogruIndeks < 0 ||
          soru.dogruIndeks > 5 ||
          soru.dogruIndeks >= secenekler.length
        ) {
          console.warn(
            `[tohum:sorular] "${kimlik}" atlandı — dogruIndeks ${soru.dogruIndeks} geçersiz (0–5 ve seçenek sayısının altında olmalı).`,
          );
          continue;
        }

        const kendiEtiketleri = [etiket];
        etiketler.set(kimlik, kendiEtiketleri);
        belgeler.set(
          kimlik,
          temizle({
            kimlik,
            konu: soru.konu,
            altKonu: soru.altKonu,
            etiketler: kendiEtiketleri,
            zorluk: soru.zorluk,
            beceri: soru.beceri,
            soru: soru.soru,
            secenekler,
            dogruIndeks: soru.dogruIndeks,
            aciklama: soru.aciklama,
            ilgiliAtlas: soru.ilgiliAtlas,
            durum: YAYINDA,
          }),
        );
      }
    }

    if (tekrarlar.length) {
      console.warn(
        `[tohum:sorular] ${tekrarlar.length} kimlik tekrarı etiket birleştirmesiyle ayıklandı: ${tekrarlar.join(' | ')}`,
      );
    }

    return [...belgeler.values()];
  },
};
