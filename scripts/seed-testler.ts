/**
 * Testleri (`quizzes`) tohumlar. İdempotent: slug üzerinden upsert.
 *
 * EDİTORYAL SÖZLEŞME
 * - Her sorunun bir GEREKÇESİ var; "doğru cevap X" demek yetmez.
 * - Gerekçe mümkün olduğunca sitedeki YAYINA bağlanır (`kanitSlug`). Test
 *   bağımsız bir bilgi iddiası üretmez, var olan kaynaklı içeriğin ölçme
 *   yüzeyidir — "kaynaksız iddia yok" kuralı testlere böyle taşınır.
 * - `sources` yalnız birincil referanslardır (birincil makale, resmi
 *   dokümantasyon, mevzuat metni). URL'ler tohumlama öncesi curl ile fiilen
 *   doğrulandı.
 * - Doğru cevabın şıklar arasında olduğu ŞEMA düzeyinde zorunlu
 *   (lib/db/schemas/quiz.ts superRefine) — bozuk test yayına çıkamaz.
 *
 * Çalıştır: npx tsx scripts/seed-testler.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { MongoClient, ServerApiVersion } from "mongodb";
import { testSema, type Test } from "../lib/db/schemas/quiz";

const KOK = join(import.meta.dirname, "..");

const envYolu = join(KOK, ".env.local");
if (existsSync(envYolu)) {
  for (const satir of readFileSync(envYolu, "utf8").split("\n")) {
    const temiz = satir.replace(/^﻿/, "").trim();
    if (!temiz || temiz.startsWith("#")) continue;
    const esit = temiz.indexOf("=");
    if (esit === -1) continue;
    const anahtar = temiz
      .slice(0, esit)
      .replace(/^export\s+/, "")
      .trim();
    const deger = temiz
      .slice(esit + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (process.env[anahtar] === undefined) process.env[anahtar] = deger;
  }
}

const ERISIM = new Date("2026-08-10T00:00:00.000Z");
const SIMDI = new Date("2026-08-10T00:00:00.000Z");

const K = {
  transformer: {
    label: "Attention Is All You Need",
    url: "https://arxiv.org/abs/1706.03762",
    publisher: "arXiv (Vaswani et al.)",
    accessedAt: ERISIM,
    kind: "paper" as const,
  },
  rag: {
    label: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
    url: "https://arxiv.org/abs/2005.11401",
    publisher: "arXiv (Lewis et al.)",
    accessedAt: ERISIM,
    kind: "paper" as const,
  },
  owasp: {
    label: "OWASP Top 10 for Large Language Model Applications",
    url: "https://owasp.org/www-project-top-10-for-large-language-model-applications/",
    publisher: "OWASP",
    accessedAt: ERISIM,
    kind: "docs" as const,
  },
  aiAct: {
    label: "Regulation (EU) 2024/1689 — Artificial Intelligence Act",
    url: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj",
    publisher: "EUR-Lex",
    accessedAt: ERISIM,
    kind: "docs" as const,
  },
  kvkk: {
    label: "Kişisel Verileri Koruma Kurumu",
    url: "https://www.kvkk.gov.tr/",
    publisher: "KVKK",
    accessedAt: ERISIM,
    kind: "docs" as const,
  },
  sklearn: {
    label: "Cross-validation: evaluating estimator performance",
    url: "https://scikit-learn.org/stable/modules/cross_validation.html",
    publisher: "scikit-learn",
    accessedAt: ERISIM,
    kind: "docs" as const,
  },
  hf: {
    label: "Transformers dokümantasyonu",
    url: "https://huggingface.co/docs/transformers/index",
    publisher: "Hugging Face",
    accessedAt: ERISIM,
    kind: "docs" as const,
  },
  mlops: {
    label: "MLOps Principles",
    url: "https://ml-ops.org/content/mlops-principles",
    publisher: "ml-ops.org",
    accessedAt: ERISIM,
    kind: "docs" as const,
  },
} satisfies Record<string, Test["sources"][number]>;

/** Ortak alanları tekrar yazmamak için. */
function test(
  temel: Pick<
    Test,
    | "slug"
    | "title"
    | "dek"
    | "kind"
    | "pillar"
    | "tags"
    | "level"
    | "passScore"
    | "durationMinutes"
    | "sources"
    | "sorular"
  >,
): Test {
  return {
    ...temel,
    status: "published",
    publishedAt: SIMDI,
    updatedAt: SIMDI,
    lastVerifiedAt: SIMDI,
    version: 1,
  };
}

const TESTLER: Test[] = [
  test({
    slug: "llm-temelleri-testi",
    title: "LLM temelleri",
    dek: "Token, bağlam penceresi, transformer, halüsinasyon ve model seçimi: büyük dil modelleriyle çalışmadan önce oturması gereken kavramlar.",
    kind: "konu",
    pillar: "llm-uretken-yz",
    tags: ["llm", "transformer", "token"],
    level: "giris",
    passScore: 70,
    durationMinutes: 10,
    sources: [K.transformer, K.hf],
    sorular: [
      {
        id: "s1",
        soru: "Bir dil modelinin 'bağlam penceresi' neyi sınırlar?",
        secenekler: [
          { id: "a", metin: "Modelin eğitildiği toplam veri miktarını" },
          { id: "b", metin: "Tek bir istekte girdi ve çıktı olarak işleyebileceği token sayısını" },
          { id: "c", metin: "Modelin saniyede üretebileceği kelime sayısını" },
          { id: "d", metin: "Modelin parametre sayısını" },
        ],
        dogru: "b",
        aciklama:
          "Bağlam penceresi, modelin tek çağrıda görebildiği token bütçesidir: sistem talimatı, kullanıcı girdisi, getirilen belgeler ve üretilen çıktı hep bu bütçeyi paylaşır. Eğitim verisi büyüklüğü ve parametre sayısı ayrı kavramlardır.",
        kanitSlug: "llm-nedir",
        zorluk: "giris",
      },
      {
        id: "s2",
        soru: "Türkçe metinler İngilizce metinlere göre çoğu tokenlaştırıcıda neden daha fazla token üretir?",
        secenekler: [
          { id: "a", metin: "Türkçe alfabede daha çok harf olduğu için" },
          {
            id: "b",
            metin:
              "Sondan eklemeli yapı ve düşük Türkçe payı nedeniyle kelimeler daha çok parçaya bölündüğü için",
          },
          { id: "c", metin: "Türkçe metinler her zaman daha uzun yazıldığı için" },
          { id: "d", metin: "Tokenlaştırıcılar Türkçeyi karakter karakter işlediği için" },
        ],
        dogru: "b",
        aciklama:
          "Alt-kelime tokenlaştırıcıların sözlüğü ağırlıkla İngilizce derlemden öğrenilir. Türkçenin sondan eklemeli yapısı, aynı kökün çok sayıda çekimli biçimini üretir ve bunlar sözlükte tek parça olarak bulunmadığı için kelime birden çok parçaya bölünür. Bu doğrudan maliyet ve bağlam bütçesi demektir.",
        kanitSlug: "token-nedir-turkcede-tokenlasma",
        zorluk: "orta",
      },
      {
        id: "s3",
        soru: "Transformer mimarisinin kendinden önceki tekrarlayan ağlara (RNN) göre temel avantajı nedir?",
        secenekler: [
          { id: "a", metin: "Daha az parametre kullanması" },
          {
            id: "b",
            metin:
              "Dizideki tüm konumları paralel işleyebilmesi ve uzun menzilli bağımlılıkları dikkat ile yakalaması",
          },
          { id: "c", metin: "Eğitim için veri gerektirmemesi" },
          { id: "d", metin: "Yalnızca CPU üzerinde çalışabilmesi" },
        ],
        dogru: "b",
        aciklama:
          "Dikkat (attention) mekanizması her konumun diğer tüm konumlara doğrudan bakmasını sağlar; bu hem paralel eğitimi mümkün kılar hem de RNN'lerde sorun olan uzun menzilli bağımlılıkları kısaltır.",
        kanitSlug: "transformer-mimarisi-nasil-calisir",
        zorluk: "orta",
      },
      {
        id: "s4",
        soru: "Halüsinasyon teriminin teknik karşılığı hangisidir?",
        secenekler: [
          { id: "a", metin: "Modelin isteği reddetmesi" },
          {
            id: "b",
            metin:
              "Modelin akıcı ama gerçekle uyuşmayan, kaynakta karşılığı olmayan içerik üretmesi",
          },
          { id: "c", metin: "Modelin çok yavaş yanıt vermesi" },
          { id: "d", metin: "Modelin aynı cevabı tekrarlaması" },
        ],
        dogru: "b",
        aciklama:
          "Halüsinasyon, çıktının dil bakımından tutarlı ama olgusal dayanağının olmaması durumudur. Model bir doğruluk veritabanı değil olasılık dağılımı üzerinden ürettiği için akıcılık doğruluk garantisi vermez.",
        kanitSlug: "yapay-zeka-halusinasyonu-nedir",
        zorluk: "giris",
      },
      {
        id: "s5",
        soru: "Açık ağırlıklı (open-weight) bir model ile açık kaynak yazılım arasındaki fark nedir?",
        secenekler: [
          { id: "a", metin: "Fark yoktur, iki terim aynı şeyi anlatır" },
          {
            id: "b",
            metin:
              "Açık ağırlıkta model parametreleri indirilebilir ama lisans kullanımı kısıtlayabilir; eğitim verisi ve süreci de açık olmayabilir",
          },
          { id: "c", metin: "Açık ağırlıklı modeller ticari olarak hiçbir koşulda kullanılamaz" },
          { id: "d", metin: "Açık ağırlıklı modellerin kaynak kodu yoktur" },
        ],
        dogru: "b",
        aciklama:
          "Ağırlıkların indirilebilir olması lisansın serbest olduğu anlamına gelmez. Kullanım sınırı, kullanıcı eşiği ya da alan kısıtı getiren lisanslar yaygındır; ayrıca eğitim verisi ve tarifi çoğu zaman açıklanmaz. Üretim kararı lisans metni okunmadan verilemez.",
        kanitSlug: "acik-agirlikli-modeller-secim-rehberi",
        zorluk: "orta",
      },
      {
        id: "s6",
        soru: "Sıcaklık (temperature) parametresini 0'a yaklaştırmak ne yapar?",
        secenekler: [
          { id: "a", metin: "Modeli daha yaratıcı ve çeşitli hâle getirir" },
          { id: "b", metin: "Çıktıyı daha belirlenimci ve tekrarlanabilir kılar" },
          { id: "c", metin: "Bağlam penceresini büyütür" },
          { id: "d", metin: "Halüsinasyonu tamamen ortadan kaldırır" },
        ],
        dogru: "b",
        aciklama:
          "Düşük sıcaklık olasılık dağılımını sivrileştirir; model en olası tokenı seçmeye yaklaşır. Bu tekrarlanabilirliği artırır ama olgusal doğruluğu garanti etmez — düşük sıcaklıkta da halüsinasyon görülür.",
        kanitSlug: "yapay-zeka-halusinasyonu-nedir",
        zorluk: "orta",
      },
      {
        id: "s7",
        soru: "Sistem talimatı (system prompt) ile kullanıcı girdisini ayırmak neden önemlidir?",
        secenekler: [
          { id: "a", metin: "Yalnızca okunabilirlik için" },
          {
            id: "b",
            metin:
              "Rol ve yetki sınırını netleştirip kullanıcı girdisinin talimat gibi işlenme riskini azaltmak için",
          },
          { id: "c", metin: "Token maliyetini düşürmek için" },
          { id: "d", metin: "Modelin daha hızlı çalışması için" },
        ],
        dogru: "b",
        aciklama:
          "Ayrım, kullanıcıdan gelen metnin sistem talimatını ezmesini zorlaştırır. Tek başına yeterli bir savunma değildir — prompt injection'a karşı çıktı doğrulama ve yetki sınırlama da gerekir — ama temel katmandır.",
        kanitSlug: "prompt-muhendisligi-rehberi",
        zorluk: "orta",
      },
      {
        id: "s8",
        soru: "Bir modelin parametre sayısının büyük olması aşağıdakilerden hangisini GARANTİ etmez?",
        secenekler: [
          { id: "a", metin: "Belirli bir görevde daha iyi sonuç vermesini" },
          { id: "b", metin: "Daha fazla bellek gerektirmesini" },
          { id: "c", metin: "Çıkarım maliyetinin artmasını" },
          { id: "d", metin: "Model dosyasının daha büyük olmasını" },
        ],
        dogru: "a",
        aciklama:
          "Parametre sayısı bellek, maliyet ve dosya boyutunu doğrudan belirler; ancak görev başarımı veri kalitesi, eğitim tarifi ve göreve uyuma bağlıdır. Küçük ve göreve uyarlanmış bir model, büyük genel bir modeli geçebilir.",
        kanitSlug: "acik-agirlikli-modeller-secim-rehberi",
        zorluk: "ileri",
      },
    ],
  }),

  test({
    slug: "rag-ve-bilgi-erisimi-testi",
    title: "RAG ve bilgi erişimi",
    dek: "Gömme vektörü, parçalama, vektör veritabanı seçimi ve RAG ile fine-tuning arasındaki karar çerçevesi.",
    kind: "konu",
    pillar: "rag-bilgi-erisimi",
    tags: ["rag", "embedding", "vektor-veritabani"],
    level: "orta",
    passScore: 70,
    durationMinutes: 12,
    sources: [K.rag, K.hf],
    sorular: [
      {
        id: "s1",
        soru: "RAG mimarisinin çözdüğü temel sorun nedir?",
        secenekler: [
          { id: "a", metin: "Modelin yazım üslubunu değiştirmek" },
          {
            id: "b",
            metin:
              "Modelin eğitim verisinde bulunmayan ya da güncellenen bilgiye erişmesini sağlamak",
          },
          { id: "c", metin: "Modelin çıkarım hızını artırmak" },
          { id: "d", metin: "Modelin parametre sayısını azaltmak" },
        ],
        dogru: "b",
        aciklama:
          "RAG bir BİLGİ sorununu çözer: cevap üretmeden önce dış kaynaktan ilgili belgeler getirilip bağlama konur. Davranış ve üslup sorunu ise fine-tuning'in alanıdır.",
        kanitSlug: "rag-nedir",
        zorluk: "giris",
      },
      {
        id: "s2",
        soru: "Gömme vektörü (embedding) neyi temsil eder?",
        secenekler: [
          { id: "a", metin: "Metnin sıkıştırılmış hâlini; geri açılabilir" },
          {
            id: "b",
            metin: "Metnin anlamsal yakınlığını uzaklığa çeviren sabit boyutlu bir sayı dizisini",
          },
          { id: "c", metin: "Metindeki kelime sayısını" },
          { id: "d", metin: "Metnin dilbilgisi ağacını" },
        ],
        dogru: "b",
        aciklama:
          "Gömme, metni anlamın geometriye çevrildiği bir uzayda konumlandırır: yakın anlamlı metinler yakın vektörlere düşer. Sıkıştırma değildir; vektörden orijinal metin geri üretilemez.",
        kanitSlug: "gomme-vektoru-embedding-nedir",
        zorluk: "giris",
      },
      {
        id: "s3",
        soru: "Bir RAG hattında parçalama (chunking) stratejisi neden kritiktir?",
        secenekler: [
          { id: "a", metin: "Yalnız depolama maliyetini etkilediği için" },
          {
            id: "b",
            metin:
              "Parça çok büyükse ilgisiz metin bağlamı kirletir, çok küçükse cevabı taşıyan bağlam kopar",
          },
          { id: "c", metin: "Vektör veritabanı yalnız sabit boyutlu parça kabul ettiği için" },
          { id: "d", metin: "Model yalnız kısa metinleri anlayabildiği için" },
        ],
        dogru: "b",
        aciklama:
          "Parça boyutu bir denge sorunudur: geniş parçalar isabeti düşürür ve token maliyetini artırır, dar parçalar ise cevabın dayandığı bağlamı bölerek modeli eksik bilgiyle bırakır.",
        kanitSlug: "gomme-boru-hatti-chunking-tazeleme-maliyet",
        zorluk: "orta",
      },
      {
        id: "s4",
        soru: "Gömme modeli değiştirildiğinde mevcut vektör indeksine ne yapılmalıdır?",
        secenekler: [
          { id: "a", metin: "Hiçbir şey; vektörler modelden bağımsızdır" },
          { id: "b", metin: "Tüm korpus yeni modelle yeniden gömülmelidir" },
          { id: "c", metin: "Yalnız yeni eklenen belgeler yeni modelle gömülür" },
          { id: "d", metin: "İndeksin boyut alanı elle güncellenir" },
        ],
        dogru: "b",
        aciklama:
          "Farklı modellerin vektör uzayları karşılaştırılamaz; aynı indekste iki modelin vektörünü karıştırmak benzerlik hesabını anlamsızlaştırır. Model değişimi tam yeniden gömme maliyeti demektir — bu yüzden model seçimi baştan ciddiye alınmalıdır.",
        kanitSlug: "gomme-boru-hatti-chunking-tazeleme-maliyet",
        zorluk: "ileri",
      },
      {
        id: "s5",
        soru: "Kurumsal bir dokümantasyon asistanında bilgi sık sık güncelleniyorsa hangi yaklaşım daha uygundur?",
        secenekler: [
          { id: "a", metin: "Her güncellemede modeli yeniden fine-tune etmek" },
          { id: "b", metin: "RAG kullanmak; kaynak güncellendiğinde indeksi tazelemek yeterlidir" },
          { id: "c", metin: "Modeli daha büyük bir modelle değiştirmek" },
          { id: "d", metin: "Bağlam penceresini büyütmek" },
        ],
        dogru: "b",
        aciklama:
          "Fine-tuning bilgiyi ağırlıklara gömer; her değişiklikte yeniden eğitim gerekir ve bu pahalı, yavaş ve izlenebilirliği zayıf bir döngüdür. RAG'de bilgi dışarıda durur, güncelleme indeks tazelemesine iner.",
        kanitSlug: "rag-fine-tuning-karsilastirmasi",
        zorluk: "orta",
      },
      {
        id: "s6",
        soru: "Vektör veritabanı seçiminde aşağıdakilerden hangisi tek başına belirleyici DEĞİLDİR?",
        secenekler: [
          { id: "a", metin: "Veri ölçeği ve beklenen sorgu hacmi" },
          { id: "b", metin: "Filtreli arama ve meta veri desteği" },
          { id: "c", metin: "Ürünün GitHub yıldız sayısı" },
          { id: "d", metin: "Barındırma modeli ve veri yerleşimi kısıtları" },
        ],
        dogru: "c",
        aciklama:
          "Popülerlik göstergesi mimari bir kısıt değildir. Ölçek, filtreleme ihtiyacı, gecikme hedefi, işletme yükü ve veri yerleşimi (KVKK açısından önemli) kararı belirler.",
        kanitSlug: "vektor-veritabani-nedir-secim-rehberi",
        zorluk: "orta",
      },
      {
        id: "s7",
        soru: "RAG kullanan bir sistemde halüsinasyon riski nasıl azalır?",
        secenekler: [
          {
            id: "a",
            metin: "Model getirilen belgelere dayanmaya zorlanıp cevap kaynağa bağlanabildiği için",
          },
          { id: "b", metin: "RAG modelin parametrelerini düzelttiği için" },
          { id: "c", metin: "RAG sıcaklığı otomatik sıfırladığı için" },
          { id: "d", metin: "RAG halüsinasyonu tamamen ortadan kaldırdığı için" },
        ],
        dogru: "a",
        aciklama:
          "RAG cevabı denetlenebilir bir zemine oturtur: hangi belgeden geldiği gösterilebilir. Ancak riski AZALTIR, sıfırlamaz — yanlış belge getirilirse model kendinden emin biçimde yanlış cevap verebilir.",
        kanitSlug: "rag-nedir",
        zorluk: "orta",
      },
      {
        id: "s8",
        soru: "Yalnız anlamsal (vektör) arama yerine anahtar kelime aramasıyla birleştirilmiş hibrit arama ne kazandırır?",
        secenekler: [
          { id: "a", metin: "Depolama maliyetini düşürür" },
          {
            id: "b",
            metin: "Ürün kodu, hata kodu gibi birebir eşleşmesi gereken ifadelerde isabeti artırır",
          },
          { id: "c", metin: "Gömme modeline ihtiyacı ortadan kaldırır" },
          { id: "d", metin: "Bağlam penceresini büyütür" },
        ],
        dogru: "b",
        aciklama:
          "Anlamsal arama yakın anlamı yakalar ama nadir, tam eşleşmesi gereken dizgilerde (SKU, hata kodu, mevzuat maddesi) zayıflar. Anahtar kelime aramasıyla birleşince iki zayıflık birbirini kapatır.",
        kanitSlug: "vektor-veritabani-nedir-secim-rehberi",
        zorluk: "ileri",
      },
    ],
  }),

  test({
    slug: "uretimde-llm-degerlendirme-testi",
    title: "Üretimde LLM: değerlendirme ve işletme",
    dek: "Metrik seçimi, aşırı öğrenme, çapraz doğrulama, MLOps olgunluğu ve fine-tuning kararı.",
    kind: "konu",
    pillar: "llmops-degerlendirme",
    tags: ["llmops", "mlops", "degerlendirme"],
    level: "ileri",
    passScore: 75,
    durationMinutes: 12,
    sources: [K.sklearn, K.mlops],
    sorular: [
      {
        id: "s1",
        soru: "Sınıf dengesizliği yüksek bir problemde accuracy neden yanıltıcıdır?",
        secenekler: [
          { id: "a", metin: "Hesaplanması zor olduğu için" },
          {
            id: "b",
            metin:
              "Her örneği çoğunluk sınıfa atayan bir model bile yüksek accuracy alabildiği için",
          },
          { id: "c", metin: "Yalnız ikili sınıflandırmada tanımlı olduğu için" },
          { id: "d", metin: "Eğitim verisinde hesaplanamadığı için" },
        ],
        dogru: "b",
        aciklama:
          "%99'u negatif olan bir veri kümesinde her şeye negatif diyen model %99 accuracy alır ama hiçbir pozitifi yakalamaz. Bu yüzden precision, recall ve F1 gibi sınıf bazlı metrikler gerekir.",
        kanitSlug: "asiri-ogrenme-capraz-dogrulama-model-metrikleri",
        zorluk: "orta",
      },
      {
        id: "s2",
        soru: "Çapraz doğrulama (cross-validation) neyi hedefler?",
        secenekler: [
          { id: "a", metin: "Eğitim süresini kısaltmak" },
          {
            id: "b",
            metin: "Başarım tahminini tek bir şanslı/şanssız ayrıma bağlı kalmaktan kurtarmak",
          },
          { id: "c", metin: "Modelin parametre sayısını azaltmak" },
          { id: "d", metin: "Etiketleme maliyetini düşürmek" },
        ],
        dogru: "b",
        aciklama:
          "Tek bir eğitim/test ayrımı, ayrımın rastlantısına duyarlıdır. Çapraz doğrulama veriyi katlara bölüp her katı sırayla test yaparak başarım tahmininin varyansını düşürür.",
        kanitSlug: "asiri-ogrenme-capraz-dogrulama-model-metrikleri",
        zorluk: "orta",
      },
      {
        id: "s3",
        soru: "Aşırı öğrenmenin (overfitting) en açık göstergesi hangisidir?",
        secenekler: [
          { id: "a", metin: "Eğitim ve doğrulama hatasının birlikte yüksek olması" },
          { id: "b", metin: "Eğitim hatası düşerken doğrulama hatasının artmaya başlaması" },
          { id: "c", metin: "Eğitimin uzun sürmesi" },
          { id: "d", metin: "Modelin küçük olması" },
        ],
        dogru: "b",
        aciklama:
          "Model eğitim verisindeki gürültüyü ezberlemeye başladığında eğitim hatası düşmeye devam ederken görülmemiş veride hata yükselir. İkisinin birlikte yüksek olması ise yetersiz öğrenmedir (underfitting).",
        kanitSlug: "asiri-ogrenme-capraz-dogrulama-model-metrikleri",
        zorluk: "giris",
      },
      {
        id: "s4",
        soru: "Standart bir benchmark'ta (ör. MMLU) yüksek skor almış bir model, sizin uygulamanız için ne anlama gelir?",
        secenekler: [
          { id: "a", metin: "Uygulamanızda da en iyi sonucu vereceği kesindir" },
          {
            id: "b",
            metin:
              "Genel bir sinyaldir; kendi görevinizde kendi değerlendirme setinizle ölçmek gerekir",
          },
          { id: "c", metin: "Hiçbir şey ifade etmez" },
          { id: "d", metin: "Maliyetinin düşük olduğunu gösterir" },
        ],
        dogru: "b",
        aciklama:
          "Genel benchmark'lar geniş bir yetenek profilini özetler ama sizin veri dağılımınızı, dilinizi ve kısıtlarınızı temsil etmez. Üretim kararı için kendi görevinizden türetilmiş bir değerlendirme seti şarttır.",
        kanitSlug: "llm-degerlendirme-metrikleri",
        zorluk: "orta",
      },
      {
        id: "s5",
        soru: "LLM-as-judge yaklaşımının bilinen zayıflığı nedir?",
        secenekler: [
          { id: "a", metin: "Çok pahalı olması" },
          {
            id: "b",
            metin: "Yargıç modelin uzunluk, biçim ve kendi üslubuna yanlılık gösterebilmesi",
          },
          { id: "c", metin: "Yalnız İngilizcede çalışması" },
          { id: "d", metin: "İnsan değerlendirmesiyle hiç örtüşmemesi" },
        ],
        dogru: "b",
        aciklama:
          "Yargıç model, daha uzun ya da kendi üslubuna yakın cevapları sistematik olarak yüksek puanlayabilir. Kullanılabilir bir yöntemdir ama kalibrasyon ve insan denetimiyle birlikte anlamlıdır.",
        kanitSlug: "llm-degerlendirme-metrikleri",
        zorluk: "ileri",
      },
      {
        id: "s6",
        soru: "Fine-tuning hangi sorunu çözmek için doğru araçtır?",
        secenekler: [
          { id: "a", metin: "Modelin bilmediği güncel bir olguyu öğretmek" },
          {
            id: "b",
            metin: "Modelin çıktı biçimini, üslubunu ve göreve özgü davranışını oturtmak",
          },
          { id: "c", metin: "Bağlam penceresini büyütmek" },
          { id: "d", metin: "Çıkarım gecikmesini düşürmek" },
        ],
        dogru: "b",
        aciklama:
          "Fine-tuning davranış öğretir: biçim, üslup, göreve özgü karar alışkanlığı. Güncel ya da kuruma özel BİLGİ için doğru araç RAG'dir; bilgi ağırlıklara gömüldüğünde her değişiklik yeniden eğitim demektir.",
        kanitSlug: "fine-tuning-nedir-ne-zaman-gerekir",
        zorluk: "orta",
      },
      {
        id: "s7",
        soru: "MLOps'un temel iddiası hangisidir?",
        secenekler: [
          { id: "a", metin: "Model eğitimini otomatikleştirmek yeterlidir" },
          {
            id: "b",
            metin:
              "Veri, model ve kodun birlikte sürümlenip yeniden üretilebilir biçimde işletilmesi gerekir",
          },
          { id: "c", metin: "Modelleri yalnız bulutta çalıştırmak gerekir" },
          { id: "d", metin: "Model başarımı tek başına yeterli bir üretim ölçütüdür" },
        ],
        dogru: "b",
        aciklama:
          "MLOps yalnız otomasyon değil, yeniden üretilebilirlik disiplinidir: hangi veriyle, hangi kodla, hangi parametreyle üretilmiş bir modelin çalıştığı izlenebilmelidir. Aksi hâlde bir regresyonun kaynağı bulunamaz.",
        kanitSlug: "mlops-nedir",
        zorluk: "orta",
      },
      {
        id: "s8",
        soru: "Üretimdeki bir modelde 'veri kayması' (data drift) ne demektir?",
        secenekler: [
          { id: "a", metin: "Veritabanının bozulması" },
          {
            id: "b",
            metin: "Gerçek dünyadaki girdi dağılımının modelin eğitildiği dağılımdan uzaklaşması",
          },
          { id: "c", metin: "Model dosyasının sürümünün kaybolması" },
          { id: "d", metin: "Eğitim verisinin silinmesi" },
        ],
        dogru: "b",
        aciklama:
          "Model değişmez ama dünya değişir: kullanıcı davranışı, ürün yelpazesi ya da mevsim değiştiğinde girdi dağılımı kayar ve başarım sessizce düşer. Bu yüzden üretimde sürekli izleme gerekir.",
        kanitSlug: "yapay-zeka-veri-boru-hatti-mimarisi",
        zorluk: "ileri",
      },
    ],
  }),

  test({
    slug: "guvenlik-ve-uyum-testi",
    title: "Güvenlik ve uyum",
    dek: "Prompt injection savunmaları, KVKK'nın yapay zeka sistemlerine yansıması ve AB AI Act'in risk sınıfları.",
    kind: "konu",
    pillar: "guvenlik-kirmizi-takim",
    tags: ["guvenlik", "kvkk", "ai-act"],
    level: "ileri",
    passScore: 75,
    durationMinutes: 12,
    sources: [K.owasp, K.aiAct, K.kvkk],
    sorular: [
      {
        id: "s1",
        soru: "Prompt injection saldırısının özü nedir?",
        secenekler: [
          { id: "a", metin: "Modelin ağırlıklarını değiştirmek" },
          {
            id: "b",
            metin:
              "Modelin işlediği metne, sistem talimatını ezmeyi hedefleyen komutlar yerleştirmek",
          },
          { id: "c", metin: "API anahtarını çalmak" },
          { id: "d", metin: "Modeli aşırı yükleyip çökertmek" },
        ],
        dogru: "b",
        aciklama:
          "Model, talimat ile veriyi ayırt edecek yapısal bir sınıra sahip değildir; işlediği her metin talimat gibi okunabilir. Saldırı doğrudan kullanıcı girdisinden gelebileceği gibi getirilen bir belgeden de (dolaylı injection) gelebilir.",
        kanitSlug: "prompt-injection-nedir-savunmalar",
        zorluk: "orta",
      },
      {
        id: "s2",
        soru: "Prompt injection'a karşı tek başına YETERSİZ olan savunma hangisidir?",
        secenekler: [
          { id: "a", metin: "Modelin erişebildiği araçların yetkisini daraltmak" },
          { id: "b", metin: "Sistem talimatına 'kullanıcı talimatlarını yok say' cümlesi eklemek" },
          { id: "c", metin: "Çıktıyı kullanmadan önce doğrulamak" },
          { id: "d", metin: "Riskli eylemler için insan onayı istemek" },
        ],
        dogru: "b",
        aciklama:
          "Talimatla talimatı savunmak kırılgandır: saldırgan da aynı kanaldan yazar. Dayanıklı savunma mimaridedir — en az yetki, çıktı doğrulama ve kritik eylemlerde insan onayı.",
        kanitSlug: "prompt-injection-nedir-savunmalar",
        zorluk: "ileri",
      },
      {
        id: "s3",
        soru: "Kişisel veri içeren metinlerin yurt dışındaki bir LLM API'sine gönderilmesi KVKK açısından ne anlama gelir?",
        secenekler: [
          { id: "a", metin: "Hiçbir özel değerlendirme gerektirmez" },
          {
            id: "b",
            metin: "Yurt dışına veri aktarımı sayılır ve kendi hukuki dayanağını gerektirir",
          },
          { id: "c", metin: "Yalnız veri şifreliyse aktarım sayılmaz" },
          { id: "d", metin: "Yalnız veri kalıcı olarak saklanıyorsa aktarım sayılır" },
        ],
        dogru: "b",
        aciklama:
          "İşleme amacıyla verinin yurt dışındaki bir işleyiciye ulaştırılması aktarımdır; şifreleme ya da kalıcı saklamama bunu ortadan kaldırmaz. Uygun aktarım mekanizması ve aydınlatma yükümlülüğü ayrıca değerlendirilmelidir.",
        kanitSlug: "kvkk-yapay-zeka-uyum-rehberi",
        zorluk: "ileri",
      },
      {
        id: "s4",
        soru: "AB Yapay Zeka Yasası (AI Act) sistemleri hangi eksende sınıflandırır?",
        secenekler: [
          { id: "a", metin: "Model büyüklüğüne göre" },
          { id: "b", metin: "Kullanımın yarattığı riske göre" },
          { id: "c", metin: "Geliştiricinin ülkesine göre" },
          { id: "d", metin: "Açık kaynak olup olmamasına göre" },
        ],
        dogru: "b",
        aciklama:
          "AI Act risk temelli bir çerçevedir: kabul edilemez, yüksek riskli, sınırlı riskli ve asgari riskli kullanımlar farklı yükümlülüklere tabidir. Belirleyici olan modelin kendisi değil, kullanım bağlamıdır.",
        kanitSlug: "ab-yapay-zeka-yasasi-ai-act-rehberi",
        zorluk: "orta",
      },
      {
        id: "s5",
        soru: "Bir yapay zeka özelliği için 'veri minimizasyonu' pratikte ne demektir?",
        secenekler: [
          { id: "a", metin: "Mümkün olduğunca az model kullanmak" },
          {
            id: "b",
            metin: "Amaca ulaşmak için gereğinden fazla kişisel veriyi toplamamak ve işlememek",
          },
          { id: "c", metin: "Veritabanı boyutunu küçültmek" },
          { id: "d", metin: "Logları hiç tutmamak" },
        ],
        dogru: "b",
        aciklama:
          "Minimizasyon bir depolama optimizasyonu değil hukuki ilkedir: işleme amacı ne ise onun gerektirdiği veriyle sınırlı kalınır. Pratikte maskeleme, alan kırpma ve saklama süresi tanımlamak demektir.",
        kanitSlug: "kvkk-yapay-zeka-uyum-rehberi",
        zorluk: "orta",
      },
      {
        id: "s6",
        soru: "Dolaylı (indirect) prompt injection nereden gelir?",
        secenekler: [
          { id: "a", metin: "Doğrudan kullanıcının yazdığı mesajdan" },
          {
            id: "b",
            metin:
              "Modelin okuduğu bir web sayfası, belge ya da e-posta gibi üçüncü taraf içerikten",
          },
          { id: "c", metin: "Model ağırlıklarından" },
          { id: "d", metin: "Ağ katmanından" },
        ],
        dogru: "b",
        aciklama:
          "RAG ya da araç kullanan sistemlerde model, kullanıcının yazmadığı içerikleri de okur. Saldırgan o içeriğe komut gömerse model bunu talimat sanabilir — bu yüzden getirilen içerik de güvenilmez girdi sayılmalıdır.",
        kanitSlug: "prompt-injection-nedir-savunmalar",
        zorluk: "ileri",
      },
    ],
  }),

  test({
    slug: "yapay-zeka-muhendisi-mulakat-testi",
    title: "Yapay zeka mühendisi mülakatı",
    dek: "Mülakatta gerçekten sorulan biçimde karar soruları: hangi yaklaşım, neden ve hangi kısıt altında.",
    kind: "mulakat",
    pillar: "kariyer-ogrenme",
    tags: ["mulakat", "kariyer"],
    level: "orta",
    passScore: 70,
    durationMinutes: 15,
    sources: [K.rag, K.owasp, K.mlops],
    sorular: [
      {
        id: "s1",
        soru: "Bir müşteri 'kendi dokümanlarımızla konuşan bir asistan' istiyor. İlk mimari kararınız ne olur?",
        secenekler: [
          { id: "a", metin: "Modeli müşterinin dokümanlarıyla fine-tune etmek" },
          { id: "b", metin: "RAG kurmak: dokümanları indekslemek ve cevabı kaynağa bağlamak" },
          { id: "c", metin: "En büyük modeli seçip tüm dokümanları isteme yapıştırmak" },
          { id: "d", metin: "Bağlam penceresi en geniş modeli seçip başka bir şey yapmamak" },
        ],
        dogru: "b",
        aciklama:
          "Bu bir bilgi sorunudur, davranış sorunu değil. RAG dokümanı dışarıda tutar; güncelleme indeks tazelemesine iner ve cevap kaynağa bağlanabildiği için denetlenebilir olur.",
        kanitSlug: "rag-fine-tuning-karsilastirmasi",
        zorluk: "orta",
      },
      {
        id: "s2",
        soru: "RAG kurdunuz ama cevaplar sık sık alakasız. İlk nereye bakarsınız?",
        secenekler: [
          { id: "a", metin: "Daha büyük bir üretici modele geçmeye" },
          { id: "b", metin: "Getirme (retrieval) kalitesine: parçalama, gömme modeli ve sıralama" },
          { id: "c", metin: "Sıcaklığı düşürmeye" },
          { id: "d", metin: "Sistem talimatını uzatmaya" },
        ],
        dogru: "b",
        aciklama:
          "Yanlış belge getirildiyse hiçbir üretici model bunu kurtaramaz — çöp girer, çöp çıkar. Önce getirmenin isabetini ölçmek gerekir; üretim katmanı ondan sonra gelir.",
        kanitSlug: "rag-nedir",
        zorluk: "orta",
      },
      {
        id: "s3",
        soru: "Modeliniz kurumsal e-postaları özetliyor ve araç çağırabiliyor. En kritik güvenlik önlemi hangisidir?",
        secenekler: [
          { id: "a", metin: "Sistem talimatına uyarı cümlesi eklemek" },
          { id: "b", metin: "Araç yetkilerini daraltmak ve riskli eylemlerde insan onayı istemek" },
          { id: "c", metin: "Modeli daha düşük sıcaklıkla çalıştırmak" },
          { id: "d", metin: "Logları kapatmak" },
        ],
        dogru: "b",
        aciklama:
          "Okunan e-posta güvenilmez girdidir ve dolaylı injection taşıyabilir. Savunma mimaride olur: en az yetki ilkesi ve kritik eylemde insan onayı, talimat metnine güvenmekten kat kat dayanıklıdır.",
        kanitSlug: "prompt-injection-nedir-savunmalar",
        zorluk: "ileri",
      },
      {
        id: "s4",
        soru: "'Modelimiz %92 accuracy alıyor' diyen bir ekibe ilk sorunuz ne olur?",
        secenekler: [
          { id: "a", metin: "Hangi GPU'da eğittiniz?" },
          { id: "b", metin: "Sınıf dağılımı nasıl ve precision/recall ne?" },
          { id: "c", metin: "Kaç parametre?" },
          { id: "d", metin: "Hangi framework?" },
        ],
        dogru: "b",
        aciklama:
          "Dengesiz veride accuracy tek başına anlamsızdır. Hangi sınıfta ne kadar hata yapıldığı ve maliyetinin ne olduğu (kaçırılan dolandırıcılık mı, yanlış alarm mı) kararı belirler.",
        kanitSlug: "asiri-ogrenme-capraz-dogrulama-model-metrikleri",
        zorluk: "orta",
      },
      {
        id: "s5",
        soru: "Türkçe bir uygulamada token maliyeti beklenenin çok üstünde çıktı. En olası yapısal sebep nedir?",
        secenekler: [
          { id: "a", metin: "Türkçe karakterler daha fazla bant genişliği kullanır" },
          {
            id: "b",
            metin:
              "Tokenlaştırıcı Türkçe kelimeleri çok parçaya böldüğü için aynı metin daha fazla token eder",
          },
          { id: "c", metin: "Türkçe istekler daha yavaş işlenir" },
          { id: "d", metin: "Model Türkçeyi desteklemiyordur" },
        ],
        dogru: "b",
        aciklama:
          "Token sayısı doğrudan maliyettir. İngilizce ağırlıklı sözlüklerde Türkçe kelimeler daha çok alt parçaya bölünür; aynı anlamı taşıyan metin İngilizcesine göre belirgin biçimde fazla token eder.",
        kanitSlug: "token-nedir-turkcede-tokenlasma",
        zorluk: "orta",
      },
      {
        id: "s6",
        soru: "Üretime çıkan bir modelin başarımı aylar içinde sessizce düştü. İlk hipoteziniz?",
        secenekler: [
          { id: "a", metin: "Model dosyası bozulmuştur" },
          { id: "b", metin: "Girdi dağılımı kaymıştır (data drift)" },
          { id: "c", metin: "GPU yavaşlamıştır" },
          { id: "d", metin: "Framework sürümü eskimiştir" },
        ],
        dogru: "b",
        aciklama:
          "Model değişmediyse değişen dünyadır: kullanıcı davranışı, ürün yelpazesi ya da mevsim. Bu yüzden üretimde yalnız hata oranı değil girdi dağılımı da izlenir.",
        kanitSlug: "mlops-nedir",
        zorluk: "orta",
      },
      {
        id: "s7",
        soru: "Bir LLM özelliği KVKK açısından değerlendirilirken ilk netleştirilmesi gereken nedir?",
        secenekler: [
          { id: "a", metin: "Modelin parametre sayısı" },
          { id: "b", metin: "Hangi kişisel verinin, hangi amaçla, nereye gittiği" },
          { id: "c", metin: "Sağlayıcının fiyat listesi" },
          { id: "d", metin: "Modelin açık ağırlıklı olup olmadığı" },
        ],
        dogru: "b",
        aciklama:
          "Uyum tartışması veri akışıyla başlar: hangi veri, hangi amaç, hangi işleyici, hangi ülke. Teknik seçimler bu haritanın üstüne kurulur; tersi sırayla yapılan tasarım sonradan bozulur.",
        kanitSlug: "kvkk-yapay-zeka-uyum-rehberi",
        zorluk: "ileri",
      },
      {
        id: "s8",
        soru: "Gömme modelini değiştirme kararı verildi. Ekibe hatırlatmanız gereken maliyet nedir?",
        secenekler: [
          { id: "a", metin: "Yalnız yeni belgelerin yeniden gömülmesi gerekir" },
          { id: "b", metin: "Tüm korpusun yeniden gömülmesi ve indeksin baştan kurulması gerekir" },
          { id: "c", metin: "Yalnız API anahtarının değişmesi gerekir" },
          { id: "d", metin: "Hiçbir ek maliyet yoktur" },
        ],
        dogru: "b",
        aciklama:
          "İki modelin vektör uzayı karşılaştırılamaz; karışık indeks benzerlik hesabını bozar. Model değişimi tam yeniden gömme demektir — büyük korpuslarda bu ciddi bir zaman ve para kalemidir.",
        kanitSlug: "gomme-boru-hatti-chunking-tazeleme-maliyet",
        zorluk: "ileri",
      },
    ],
  }),
];

async function ana(): Promise<void> {
  const uri = process.env["MONGODB_URI"];
  if (uri === undefined || uri.trim() === "") {
    throw new Error("MONGODB_URI tanımlı değil (.env.local)");
  }

  // Şema doğrulaması ÖNCE: bozuk bir test DB'ye hiç girmemeli.
  for (const ham of TESTLER) {
    const sonuc = testSema.safeParse(ham);
    if (!sonuc.success) {
      throw new Error(
        `Test şeması geçersiz (${ham.slug}): ${sonuc.error.issues
          .map((i) => `${i.path.join(".")} — ${i.message}`)
          .join(" | ")}`,
      );
    }
  }

  const client = await new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
  }).connect();
  const db = client.db(process.env["MONGODB_DB"] ?? "sinaptiklab");

  let eklenen = 0;
  let guncellenen = 0;
  for (const test of TESTLER) {
    const sonuc = await db
      .collection("quizzes")
      .updateOne({ slug: test.slug }, { $set: test }, { upsert: true });
    if (sonuc.upsertedCount > 0) eklenen += 1;
    else guncellenen += 1;
  }

  const toplam = await db.collection("quizzes").countDocuments();
  const soruSayisi = TESTLER.reduce((t, x) => t + x.sorular.length, 0);
  console.log(
    `quizzes → ${eklenen} yeni, ${guncellenen} güncellendi; koleksiyonda ${toplam} test, tohumda ${soruSayisi} soru`,
  );

  await client.close();
}

ana().catch((hata: unknown) => {
  console.error("seed-testler hata:", hata instanceof Error ? hata.message : hata);
  process.exit(1);
});
