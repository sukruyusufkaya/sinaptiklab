/**
 * 30 çekirdek Türkçe YZ terimini `terms` koleksiyonuna tohumlar (BRIEF §1.3
 * terminoloji kaosu tezi + §4.2 şeması). İdempotent: slug üzerinden upsert,
 * tekrar koşmak güvenlidir.
 *
 * Kaynak politikası: her terimin kaynağı ya birincil makale (arXiv) ya da
 * resmi dokümantasyondur; URL'ler tohumlama tarihinde fiilen 200 döndürdüğü
 * doğrulanarak eklenmiştir (WebFetch + curl).
 *
 * Çalıştır: npx tsx scripts/seed-terms.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { MongoClient, ServerApiVersion } from "mongodb";
import { termSema, type Term } from "../lib/db/schemas/term";

const KOK = join(import.meta.dirname, "..");

// .env.local'i elle yükle (harici paket yok; mevcut env ezilmez)
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
    if (anahtar && deger && !(anahtar in process.env)) process.env[anahtar] = deger;
  }
}

const ERISIM = new Date("2026-08-09T00:00:00.000Z");

type Kaynak = Term["sources"][number];

const makale = (label: string, url: string, publisher = "arXiv"): Kaynak => ({
  label,
  url,
  publisher,
  accessedAt: ERISIM,
  kind: "paper",
});

const dokuman = (label: string, url: string, publisher: string): Kaynak => ({
  label,
  url,
  publisher,
  accessedAt: ERISIM,
  kind: "docs",
});

// ── Terimler ─────────────────────────────────────────────────────────
// pillar değerleri docs/arastirma/pillar-cluster-agaci.md'deki onaylı
// slug'lardan seçilmiştir (12 pillar).

const TERIMLER: Term[] = [
  {
    slug: "gomme-vektoru",
    tr: "Gömme vektörü",
    en: "Embedding",
    aliases: ["embedding", "gömme", "vektör gösterimi", "yerleştirme"],
    shortDef:
      "Metni ya da başka bir veriyi, anlamsal yakınlığı uzaklığa çeviren sabit boyutlu sayı dizisiyle temsil etme biçimi.",
    longDef:
      'Gömme vektörü, bir metin parçasını (kelime, cümle, belge) yüzlerce ya da binlerce boyutlu bir sayı dizisine dönüştürür. Bu uzayda anlamca yakın ifadeler birbirine yakın konumlanır; böylece "benzerlik" bir geometri problemine indirgenir. Modern erişim sistemlerinin temeli budur: sorgu da belgeler de aynı uzaya gömülür, ardından en yakın komşular aranır.',
    pillar: "rag-bilgi-erisimi",
    related: ["benzerlik-aramasi", "vektor-veritabani", "rag"],
    sources: [
      makale(
        "Efficient Estimation of Word Representations in Vector Space (word2vec)",
        "https://arxiv.org/abs/1301.3781",
      ),
      dokuman("Sentence Transformers belgeleri", "https://www.sbert.net/", "sbert.net"),
    ],
  },
  {
    slug: "token",
    tr: "Token",
    en: "Token",
    aliases: ["jeton", "simge", "belirteç"],
    shortDef:
      "Modelin metni işlerken kullandığı en küçük birim; çoğunlukla bir kelime parçası, bazen tek bir karakter.",
    longDef:
      "Dil modelleri metni harf harf değil, token denen parçalar hâlinde görür. Türkçede eklerin çokluğu nedeniyle bir kelime sıklıkla birkaç token'a bölünür; bu da aynı metnin Türkçesinin İngilizcesinden daha fazla token tutmasına yol açar. Maliyet, hız ve bağlam penceresi hesapları kelime değil token üzerinden yapılır.",
    pillar: "llm-uretken-yz",
    related: ["tokenlastirma", "baglam-penceresi", "cikarim"],
    sources: [
      dokuman(
        "tiktoken — OpenAI modelleri için BPE tokenizer",
        "https://github.com/openai/tiktoken",
        "OpenAI",
      ),
    ],
  },
  {
    slug: "tokenlastirma",
    tr: "Tokenlaştırma",
    en: "Tokenization",
    aliases: ["tokenizasyon", "belirteçleme", "parçalama"],
    shortDef: "Ham metni modelin işleyebileceği token dizisine bölme adımı.",
    longDef:
      "Tokenlaştırma, metni sabit bir sözlükteki parçalara ayırır. Yaygın yöntem olan BPE (byte pair encoding), sık geçen karakter çiftlerini birleştirerek sözlüğü veriden öğrenir ve sözlükte olmayan kelime sorununu ortadan kaldırır. Tokenizer değişirse aynı metnin token sayısı ve model davranışı da değişir; bu yüzden tokenizer model kadar kritik bir bileşendir.",
    pillar: "llm-uretken-yz",
    related: ["token", "baglam-penceresi"],
    sources: [
      makale(
        "Neural Machine Translation of Rare Words with Subword Units (BPE)",
        "https://arxiv.org/abs/1508.07909",
      ),
    ],
  },
  {
    slug: "dikkat-mekanizmasi",
    tr: "Dikkat mekanizması",
    en: "Attention mechanism",
    aliases: ["attention", "öz-dikkat", "self-attention", "ilgi mekanizması"],
    shortDef:
      "Modelin bir çıktıyı üretirken girdinin hangi bölümlerine ne kadar ağırlık vereceğini öğrenmesini sağlayan işlem.",
    longDef:
      "Dikkat, sabit uzunlukta bir ara temsile sıkışma sorununu çözmek için önerildi: model, her adımda girdinin tamamına bakar ve ilgili parçalara daha yüksek ağırlık verir. Transformer mimarisinde bu fikir öz-dikkat (self-attention) biçimini alır; her token dizideki diğer tüm token'larla doğrudan ilişkilenir. Uzun bağlamda maliyetin dizi uzunluğunun karesiyle büyümesi, alandaki verimlilik araştırmalarının ana motivasyonudur.",
    pillar: "llm-uretken-yz",
    related: ["transformer", "baglam-penceresi", "token"],
    sources: [
      makale(
        "Neural Machine Translation by Jointly Learning to Align and Translate",
        "https://arxiv.org/abs/1409.0473",
      ),
      makale("Attention Is All You Need", "https://arxiv.org/abs/1706.03762"),
    ],
  },
  {
    slug: "transformer",
    tr: "Transformer",
    en: "Transformer",
    aliases: ["dönüştürücü", "transformer mimarisi"],
    shortDef:
      "Yinelemeli katman kullanmadan yalnızca dikkat mekanizmasına dayanan, bugünkü dil modellerinin temelindeki sinir ağı mimarisi.",
    longDef:
      "Transformer, diziyi baştan sona sırayla işleyen yinelemeli ağların yerine tüm konumları paralel işleyen dikkat katmanlarını koydu. Paralelleşebilirlik, eğitim ölçeğini donanımla birlikte büyütmeyi mümkün kıldı; bugünkü büyük dil modellerinin neredeyse tamamı bu mimarinin türevidir. Kodlayıcı-kod çözücü, yalnız kod çözücü ve yalnız kodlayıcı olmak üzere üç yaygın varyantı vardır.",
    pillar: "llm-uretken-yz",
    related: ["dikkat-mekanizmasi", "token", "ince-ayar"],
    sources: [makale("Attention Is All You Need", "https://arxiv.org/abs/1706.03762")],
  },
  {
    slug: "cikarim",
    tr: "Çıkarım",
    en: "Inference",
    aliases: ["inference", "model çıkarımı", "tahmin üretme"],
    shortDef:
      "Eğitilmiş bir modelin yeni girdiye karşılık çıktı üretmesi; üretimde gecikme ve maliyetin belirlendiği aşama.",
    longDef:
      "Eğitim bir kez, çıkarım milyonlarca kez çalışır; bu yüzden üretim maliyetinin büyük kısmı çıkarım tarafındadır. Dil modellerinde çıkarım token token ilerler ve gecikme genellikle bellek bant genişliğine takılır. vLLM gibi sunum katmanları sayfalı dikkat önbelleği ve sürekli yığınlama gibi tekniklerle aynı donanımdan belirgin biçimde daha yüksek verim çıkarır.",
    pillar: "mlops-altyapi",
    related: ["niceleme", "token", "llmops"],
    sources: [dokuman("vLLM belgeleri", "https://docs.vllm.ai/en/latest/", "vLLM")],
  },
  {
    slug: "ince-ayar",
    tr: "İnce ayar",
    en: "Fine-tuning",
    aliases: ["fine-tuning", "ince ayarlama", "uyarlama"],
    shortDef:
      "Önceden eğitilmiş bir modeli, göreve özgü daha küçük bir veri kümesiyle eğitmeye devam ederek uyarlama.",
    longDef:
      "İnce ayar, sıfırdan eğitimle aynı işlemi yapar; tek farkı rastgele ağırlıklarla değil öğrenilmiş ağırlıklarla başlamasıdır. Bu yüzden çok daha az veri, süre ve hesap gerektirir. Biçem, biçim ve alan diline uyum için güçlü bir araçtır; ancak modele yeni ve değişken bilgi eklemek için genellikle erişim destekli üretim daha uygundur.",
    pillar: "llm-uretken-yz",
    related: ["lora", "rag", "damitma"],
    sources: [
      dokuman(
        "Transformers — Fine-tuning",
        "https://huggingface.co/docs/transformers/en/training",
        "Hugging Face",
      ),
    ],
  },
  {
    slug: "rag",
    tr: "Erişim destekli üretim",
    en: "Retrieval-Augmented Generation (RAG)",
    aliases: ["RAG", "geri getirmeli üretim", "arama destekli üretim", "bilgiyle beslenmiş üretim"],
    shortDef:
      "Modelin cevabı üretmeden önce dış bir kaynaktan ilgili belgeleri getirip bağlama koyduğu mimari.",
    longDef:
      "RAG, parametrik belleği (modelin ağırlıkları) parametrik olmayan bellekle (aranabilir bir belge dizini) birleştirir. Cevap, getirilen belgelere dayandığı için güncellenebilir, kaynak gösterilebilir ve modeli yeniden eğitmeden değiştirilebilir. Kalite büyük ölçüde erişim adımına bağlıdır: yanlış belge getirildiğinde model kendinden emin biçimde yanlış cevap üretir.",
    pillar: "rag-bilgi-erisimi",
    related: ["gomme-vektoru", "vektor-veritabani", "halusinasyon"],
    sources: [
      makale(
        "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
        "https://arxiv.org/abs/2005.11401",
      ),
    ],
  },
  {
    slug: "vektor-veritabani",
    tr: "Vektör veritabanı",
    en: "Vector database",
    aliases: ["vektör deposu", "vector store", "vektör indeksi"],
    shortDef:
      "Gömme vektörlerini saklayan ve bir sorgu vektörüne en yakın kayıtları hızla döndürebilen veri deposu.",
    longDef:
      "Vektör veritabanı, klasik indekslerin yaptığı eşitlik ve aralık sorgularının yerine yakınlık sorgusu çalıştırır. Çoğu sistem yaklaşık en yakın komşu indeksleri kullanır: küçük bir doğruluk kaybı karşılığında milyonlarca vektörde milisaniyeler içinde arama yapar. Ayrı bir ürün olabileceği gibi, MongoDB Atlas gibi genel amaçlı veritabanlarının bir yeteneği de olabilir.",
    pillar: "rag-bilgi-erisimi",
    related: ["gomme-vektoru", "benzerlik-aramasi", "rag"],
    sources: [
      dokuman(
        "Atlas Vector Search genel bakış",
        "https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/",
        "MongoDB",
      ),
    ],
  },
  {
    slug: "benzerlik-aramasi",
    tr: "Benzerlik araması",
    en: "Similarity search",
    aliases: ["vektör araması", "yaklaşık en yakın komşu", "ANN", "anlamsal arama"],
    shortDef:
      "Bir sorgu vektörüne en yakın kayıtları bulma işlemi; anlamsal aramanın altındaki temel operasyon.",
    longDef:
      "Tam arama tüm vektörleri tarar ve veri büyüdükçe pahalılaşır; bu yüzden üretimde yaklaşık en yakın komşu (ANN) indeksleri kullanılır. HNSW gibi grafik tabanlı indeksler, katmanlı bir komşuluk grafiğinde gezinerek aramayı logaritmik ölçekte tutar. Doğruluk ve hız arasındaki denge (recall/latency) indeks parametreleriyle ayarlanır ve ölçülerek seçilmelidir.",
    pillar: "rag-bilgi-erisimi",
    related: ["gomme-vektoru", "vektor-veritabani"],
    sources: [
      makale(
        "Efficient and robust approximate nearest neighbor search using HNSW graphs",
        "https://arxiv.org/abs/1603.09320",
      ),
      dokuman("Faiss — benzerlik araması kütüphanesi", "https://faiss.ai/", "Meta AI"),
    ],
  },
  {
    slug: "halusinasyon",
    tr: "Halüsinasyon",
    en: "Hallucination",
    aliases: ["uydurma", "sanrı", "kaynaksız üretim"],
    shortDef:
      "Modelin kaynakta olmayan ya da gerçeğe aykırı bilgiyi akıcı ve kendinden emin biçimde üretmesi.",
    longDef:
      "Halüsinasyon iki biçimde incelenir: girdiye sadık olmama (kaynakla çelişme) ve olguya sadık olmama (dünya bilgisiyle çelişme). Nedenleri veri gürültüsünden eğitim hedefinin doğruluğu değil olabilirliği ödüllendirmesine kadar uzanır. Pratikte tek çare yoktur; erişim destekli üretim, kaynak zorunluluğu ve otomatik değerlendirme birlikte kullanılır.",
    pillar: "llmops-degerlendirme",
    related: ["rag", "degerlendirme-kumesi", "kiyaslama"],
    sources: [
      makale(
        "Survey of Hallucination in Natural Language Generation",
        "https://arxiv.org/abs/2202.03629",
      ),
    ],
  },
  {
    slug: "baglam-penceresi",
    tr: "Bağlam penceresi",
    en: "Context window",
    aliases: ["context window", "bağlam sınırı", "çalışma belleği"],
    shortDef:
      "Modelin tek bir istekte referans alabildiği toplam token miktarı; sistem istemi, konuşma geçmişi ve çıktı dahildir.",
    longDef:
      "Bağlam penceresi modelin çalışma belleğidir ve eğitildiği veri yığınından farklıdır. Pencere büyüdükçe daha uzun belgeler işlenebilir, ancak token sayısı arttıkça doğruluk ve hatırlama düşebilir; bu yüzden bağlamda ne olduğu, ne kadar yer olduğu kadar önemlidir. İstek gönderilmeden önce token sayımıyla tahmin yapmak, sınırı aşan hataların önüne geçer.",
    pillar: "llm-uretken-yz",
    related: ["token", "istem-muhendisligi", "rag"],
    sources: [
      dokuman(
        "Context windows",
        "https://platform.claude.com/docs/en/build-with-claude/context-windows",
        "Anthropic",
      ),
    ],
  },
  {
    slug: "istem-muhendisligi",
    tr: "İstem mühendisliği",
    en: "Prompt engineering",
    aliases: ["prompt mühendisliği", "komut mühendisliği", "yönerge tasarımı"],
    shortDef:
      "Modelden istenen davranışı almak için girdi metnini ölçülebilir başarı ölçütlerine göre tasarlama ve iyileştirme pratiği.",
    longDef:
      "İstem mühendisliği, sezgiyle metin değiştirmek değildir: önce başarı ölçütü ve değerlendirme kurulur, sonra istem üzerinde sistematik denemeler yapılır. Açıklık, örnek verme, yapılandırılmış biçim ve rol tanımı en sık işe yarayan tekniklerdir. Her sorun istemle çözülmez; bazen model seçimi, erişim katmanı veya ince ayar daha doğru araçtır.",
    pillar: "llm-uretken-yz",
    related: ["az-atisli-ogrenme", "dusunce-zinciri", "baglam-penceresi"],
    sources: [
      dokuman(
        "Prompt engineering overview",
        "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview",
        "Anthropic",
      ),
    ],
  },
  {
    slug: "sifir-atisli-ogrenme",
    tr: "Sıfır atışlı öğrenme",
    en: "Zero-shot learning",
    aliases: ["zero-shot", "örneksiz öğrenme", "sıfır örnekli"],
    shortDef: "Modele hiç örnek vermeden, yalnızca görevin doğal dildeki tarifiyle iş yaptırma.",
    longDef:
      "Sıfır atışlı kullanımda istem yalnız görevi anlatır; çözülmüş örnek içermez. Büyük dil modelleri, ölçek büyüdükçe bu kipte belirgin biçimde iyileşir ve birçok görevde görev-özel eğitim olmadan makul sonuç verir. Örnek eklemenin maliyeti (token) ile kazandırdığı doğruluk karşılaştırılarak seçim yapılır.",
    pillar: "llm-uretken-yz",
    related: ["az-atisli-ogrenme", "istem-muhendisligi"],
    sources: [makale("Language Models are Few-Shot Learners", "https://arxiv.org/abs/2005.14165")],
  },
  {
    slug: "az-atisli-ogrenme",
    tr: "Az atışlı öğrenme",
    en: "Few-shot learning",
    aliases: ["few-shot", "az örnekli öğrenme", "birkaç örnekli"],
    shortDef:
      "İsteme birkaç çözülmüş örnek koyarak, ağırlıkları güncellemeden modelin görevi kavramasını sağlama.",
    longDef:
      "Az atışlı kullanımda örnekler eğitim değil bağlam işlevi görür: model ağırlıkları değişmez, davranış yalnız istem içindeki desenle yönlendirilir. Literatürde bu yetenek bağlam içi öğrenme diye anılır ve model ölçeğiyle birlikte güçlenir. Örneklerin biçimi ve sırası sonucu belirgin biçimde etkilediği için örnek seçimi ölçülerek yapılmalıdır.",
    pillar: "llm-uretken-yz",
    related: ["sifir-atisli-ogrenme", "istem-muhendisligi", "dusunce-zinciri"],
    sources: [makale("Language Models are Few-Shot Learners", "https://arxiv.org/abs/2005.14165")],
  },
  {
    slug: "dusunce-zinciri",
    tr: "Düşünce zinciri",
    en: "Chain-of-thought",
    aliases: ["chain-of-thought", "CoT", "akıl yürütme zinciri", "adım adım düşünme"],
    shortDef:
      "Modelin doğrudan cevap yerine ara adımları da üretmesini isteyerek çok adımlı akıl yürütmeyi iyileştirme tekniği.",
    longDef:
      "Düşünce zinciri, isteme ara adımlarıyla çözülmüş örnekler koyarak ya da modelden adım adım ilerlemesini isteyerek uygulanır. Aritmetik, sembolik ve mantık gerektiren görevlerde doğruluğu belirgin biçimde artırır; kazanç özellikle büyük modellerde ortaya çıkar. Üretilen adımların doğru görünmesi doğru olduğu anlamına gelmez, bu yüzden çıktı yine doğrulanmalıdır.",
    pillar: "llm-uretken-yz",
    related: ["istem-muhendisligi", "az-atisli-ogrenme", "ajan"],
    sources: [
      makale(
        "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models",
        "https://arxiv.org/abs/2201.11903",
      ),
    ],
  },
  {
    slug: "ajan",
    tr: "Ajan",
    en: "Agent",
    aliases: ["etmen", "yapay zeka ajanı", "otonom ajan"],
    shortDef:
      "Hedefe ulaşmak için akıl yürütme ile araç kullanımını döngü hâlinde birleştiren, adımlarını kendi seçen sistem.",
    longDef:
      "Ajan, tek seferlik bir cevap üretmez: gözlem yapar, ne yapacağına karar verir, bir araç çağırır, sonucu okur ve döngüyü sürdürür. ReAct çalışması bu düşün-eyle döngüsünün, yalnız akıl yürütmeye ya da yalnız eyleme göre daha isabetli sonuç verdiğini gösterdi. Üretimde asıl zorluk yetenek değil kontroldür: durma koşulu, hata toparlama ve yetki sınırı tasarımın parçasıdır.",
    pillar: "ajanik-sistemler",
    related: ["arac-cagirma", "mcp", "dusunce-zinciri"],
    sources: [
      makale(
        "ReAct: Synergizing Reasoning and Acting in Language Models",
        "https://arxiv.org/abs/2210.03629",
      ),
    ],
  },
  {
    slug: "arac-cagirma",
    tr: "Araç çağırma",
    en: "Tool calling",
    aliases: ["function calling", "fonksiyon çağırma", "işlev çağrısı", "araç kullanımı"],
    shortDef:
      "Modelin, tanımlanmış bir fonksiyonu adı ve parametreleriyle yapılandırılmış biçimde çağırmasını sağlayan mekanizma.",
    longDef:
      "Geliştirici araçları şema olarak tanımlar; model isteğe uygun aracı seçer ve çağrıyı yapılandırılmış olarak döndürür. Kodu model değil uygulama çalıştırır, sonuç bir sonraki adımda modele geri verilir. Bu döngü, dil modelini hesap makinesi, arama, veritabanı veya iş sistemine bağlayan standart yoldur.",
    pillar: "ajanik-sistemler",
    related: ["ajan", "mcp"],
    sources: [
      dokuman(
        "Tool use with Claude",
        "https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview",
        "Anthropic",
      ),
      makale(
        "Toolformer: Language Models Can Teach Themselves to Use Tools",
        "https://arxiv.org/abs/2302.04761",
      ),
    ],
  },
  {
    slug: "mcp",
    tr: "Model Bağlam Protokolü",
    en: "Model Context Protocol (MCP)",
    aliases: ["MCP", "model context protocol"],
    shortDef:
      "Yapay zeka uygulamalarını dış veri kaynaklarına, araçlara ve iş akışlarına bağlamak için açık kaynak standart protokol.",
    longDef:
      "MCP, her uygulama için ayrı entegrasyon yazma zorunluluğunu kaldırır: sunucu bir kez yazılır, protokolü destekleyen tüm istemciler onu kullanabilir. Bir MCP sunucusu araç, veri kaynağı ve hazır istem sunabilir; istemci tarafında ise ajan bu yüzeyleri keşfedip çağırır. Sinaptiklab'ın kendi korpusu da bu protokolle bir uçtan sunulur.",
    pillar: "ajanik-sistemler",
    related: ["ajan", "arac-cagirma"],
    sources: [
      dokuman(
        "What is the Model Context Protocol (MCP)?",
        "https://modelcontextprotocol.io/docs/getting-started/intro",
        "Model Context Protocol",
      ),
    ],
  },
  {
    slug: "llmops",
    tr: "LLMOps",
    en: "LLMOps",
    aliases: ["LLM operasyonları", "büyük dil modeli operasyonları"],
    shortDef:
      "Dil modeli tabanlı sistemlerin sürümlenmesi, dağıtımı, izlenmesi ve değerlendirilmesini otomatikleştiren mühendislik pratiği.",
    longDef:
      "LLMOps, MLOps'un dil modellerine uyarlanmış hâlidir: aynı sürekli teslim ve otomasyon ilkeleri geçerlidir, fakat izlenen şey yalnız model metriği değil istem sürümü, bağlam ve çıktı kalitesidir. Olgunluk düzeyi elle dağıtımdan uçtan uca otomatik hatta doğru ilerler. Değerlendirme kümesi olmadan LLMOps kurulamaz; regresyonu ancak ölçebildiğiniz şeyde yakalarsınız.",
    pillar: "llmops-degerlendirme",
    related: ["degerlendirme-kumesi", "kiyaslama", "cikarim"],
    sources: [
      dokuman(
        "MLOps: Continuous delivery and automation pipelines in machine learning",
        "https://docs.cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning",
        "Google Cloud",
      ),
    ],
  },
  {
    slug: "degerlendirme-kumesi",
    tr: "Değerlendirme kümesi",
    en: "Evaluation set",
    aliases: ["eval seti", "değerlendirme veri kümesi", "test kümesi"],
    shortDef:
      "Bir sistemin kalitesini tekrarlanabilir biçimde ölçmek için ayrılmış, üzerinde eğitim yapılmayan örnek ve ölçüt kümesi.",
    longDef:
      "Değerlendirme kümesi senaryoları (görev, alan, dil) ve ölçütleri (doğruluk, kalibrasyon, sağlamlık, maliyet) birlikte tanımlar. Tek bir sayı yerine çok boyutlu bir tablo üretmek, modeller arası dürüst karşılaştırmanın koşuludur. Kümeye sızma (test verisinin eğitime karışması) sonucu geçersiz kılar; bu yüzden veri kökeni kaydedilmelidir.",
    pillar: "llmops-degerlendirme",
    related: ["kiyaslama", "llmops", "halusinasyon"],
    sources: [
      makale("Holistic Evaluation of Language Models (HELM)", "https://arxiv.org/abs/2211.09110"),
    ],
  },
  {
    slug: "kiyaslama",
    tr: "Kıyaslama",
    en: "Benchmark",
    aliases: ["benchmark", "ölçüt takımı", "karşılaştırma testi"],
    shortDef:
      "Modelleri aynı görev ve protokolle karşılaştırmak için standartlaştırılmış, herkese açık test takımı.",
    longDef:
      "Kıyaslamalar ilerlemeyi ortak bir cetvele bağlar: MMLU gibi çok görevli testler geniş bilgi ve akıl yürütmeyi ölçer. Ancak yüksek kıyaslama puanı üretim başarısını garanti etmez; testin dili, alanı ve sızma riski sonucu belirler. Türkçe için çoğu popüler kıyaslama ya çeviridir ya da yoktur, bu yüzden yerel değerlendirme kümesi kaçınılmazdır.",
    pillar: "llmops-degerlendirme",
    related: ["degerlendirme-kumesi", "llmops"],
    sources: [
      makale(
        "Measuring Massive Multitask Language Understanding (MMLU)",
        "https://arxiv.org/abs/2009.03300",
      ),
      makale("Holistic Evaluation of Language Models (HELM)", "https://arxiv.org/abs/2211.09110"),
    ],
  },
  {
    slug: "damitma",
    tr: "Damıtma",
    en: "Knowledge distillation",
    aliases: ["bilgi damıtma", "distillation", "model damıtma"],
    shortDef:
      "Büyük bir öğretmen modelin davranışını, çok daha küçük bir öğrenci modele aktararak boyut ve maliyeti düşürme.",
    longDef:
      "Damıtmada öğrenci model yalnız doğru etiketi değil, öğretmenin tüm sınıflara verdiği olasılık dağılımını da hedefler; bu yumuşak hedefler sert etiketten daha çok bilgi taşır. Sonuçta çok daha küçük bir model, büyüğün başarısına yakın sonuç verebilir. Uç cihaz ve düşük gecikme senaryolarında nicelemeyle birlikte kullanılır.",
    pillar: "makine-ogrenmesi-temelleri",
    related: ["niceleme", "ince-ayar", "cikarim"],
    sources: [
      makale("Distilling the Knowledge in a Neural Network", "https://arxiv.org/abs/1503.02531"),
    ],
  },
  {
    slug: "niceleme",
    tr: "Niceleme",
    en: "Quantization",
    aliases: ["kuantizasyon", "quantization", "nicemleme"],
    shortDef:
      "Model ağırlıklarını ve etkinleşmelerini daha az bitle temsil ederek bellek ve hesap maliyetini düşürme.",
    longDef:
      "Niceleme, 16 ya da 32 bitlik kayan noktalı sayıları 8 ya da 4 bitlik tamsayılara indirir; bellek ihtiyacı ve bant genişliği baskısı buna oranla azalır. Asıl sorun, dağılımdaki uç değerlerin (outlier) düşük hassasiyette bilgi kaybına yol açmasıdır; modern yöntemler bu değerleri ayrı işleyerek doğruluğu korur. Kazanç ve kayıp mutlaka kendi değerlendirme kümenizde ölçülmelidir.",
    pillar: "mlops-altyapi",
    related: ["cikarim", "damitma", "lora"],
    sources: [
      makale(
        "A Survey of Quantization Methods for Efficient Neural Network Inference",
        "https://arxiv.org/abs/2103.13630",
      ),
      makale(
        "LLM.int8(): 8-bit Matrix Multiplication for Transformers at Scale",
        "https://arxiv.org/abs/2208.07339",
      ),
    ],
  },
  {
    slug: "lora",
    tr: "Düşük ranklı uyarlama",
    en: "Low-Rank Adaptation (LoRA)",
    aliases: ["LoRA", "düşük rank uyarlaması", "adaptör ince ayarı"],
    shortDef:
      "Modelin ağırlıklarını dondurup yanına küçük düşük ranklı matrisler ekleyerek yapılan verimli ince ayar yöntemi.",
    longDef:
      "LoRA, eğitilen parametre sayısını binde birler düzeyine indirir: asıl ağırlıklar sabit kalır, öğrenme yalnız eklenen düşük ranklı matrislerde gerçekleşir. Bellek ihtiyacı ve kontrol noktası boyutu böylece çarpıcı biçimde düşer, üstelik çıkarım anında ek gecikme getirmeyecek şekilde birleştirilebilir. Aynı taban model üzerinde çok sayıda göreve özgü adaptör taşımak da mümkün olur.",
    pillar: "llm-uretken-yz",
    related: ["ince-ayar", "niceleme"],
    sources: [
      makale(
        "LoRA: Low-Rank Adaptation of Large Language Models",
        "https://arxiv.org/abs/2106.09685",
      ),
    ],
  },
  {
    slug: "cok-kipli-model",
    tr: "Çok kipli model",
    en: "Multimodal model",
    aliases: ["multimodal", "çok modlu model", "çok biçimli model"],
    shortDef:
      "Metin, görsel, ses gibi birden fazla veri kipini aynı temsil uzayında işleyebilen model.",
    longDef:
      "Çok kipli modeller farklı kipleri ortak bir uzaya gömerek aralarında ilişki kurar; CLIP, görsel ile metni eşleştirerek etiketsiz görev transferini mümkün kıldı. Bugünün büyük modelleri görsel girdiyi doğrudan kabul edip metin üretebiliyor. Değerlendirme bu alanda daha zordur: her kip için ayrı ölçüt ve kip geçişleri için ek testler gerekir.",
    pillar: "llm-uretken-yz",
    related: ["gomme-vektoru", "difuzyon-modeli", "transformer"],
    sources: [
      makale(
        "Learning Transferable Visual Models From Natural Language Supervision (CLIP)",
        "https://arxiv.org/abs/2103.00020",
      ),
      makale("GPT-4 Technical Report", "https://arxiv.org/abs/2303.08774"),
    ],
  },
  {
    slug: "difuzyon-modeli",
    tr: "Difüzyon modeli",
    en: "Diffusion model",
    aliases: ["yayılım modeli", "diffusion", "gürültü giderme modeli"],
    shortDef:
      "Veriye adım adım gürültü ekleyip bu süreci tersine çevirmeyi öğrenerek yeni örnek üreten üretken model ailesi.",
    longDef:
      "Eğitimde ileri süreç görüntüyü kademeli olarak saf gürültüye çevirir; model ise her adımda gürültüyü tahmin edip geri almayı öğrenir. Üretim, rastgele gürültüden başlayıp bu ters adımları uygulayarak ilerler. Görsel üretimde baskın yaklaşımdır ve ses ile video üretimine de taşınmıştır.",
    pillar: "bilgisayarli-goru",
    related: ["cok-kipli-model", "denetimli-ogrenme"],
    sources: [
      makale("Denoising Diffusion Probabilistic Models", "https://arxiv.org/abs/2006.11239"),
    ],
  },
  {
    slug: "denetimli-ogrenme",
    tr: "Denetimli öğrenme",
    en: "Supervised learning",
    aliases: ["gözetimli öğrenme", "supervised learning", "etiketli öğrenme"],
    shortDef:
      "Girdi-etiket çiftlerinden oluşan veriyle, yeni girdiler için etiketi tahmin eden bir eşleme öğrenme.",
    longDef:
      "Denetimli öğrenme, makine öğrenmesinin en yaygın kurgusudur; sınıflandırma (kategorik etiket) ve regresyon (sürekli değer) olmak üzere iki temel biçimi vardır. Başarı, etiket kalitesine ve verinin dağılımı gerçek kullanımı temsil etmesine bağlıdır. Model seçimi ve hiperparametreler, eğitim verisiyle değil ayrı bir doğrulama kümesiyle belirlenir.",
    pillar: "makine-ogrenmesi-temelleri",
    related: ["asiri-ogrenme", "pekistirmeli-ogrenme-rlhf", "degerlendirme-kumesi"],
    sources: [
      dokuman(
        "Supervised learning — scikit-learn kullanıcı kılavuzu",
        "https://scikit-learn.org/stable/supervised_learning.html",
        "scikit-learn",
      ),
    ],
  },
  {
    slug: "pekistirmeli-ogrenme-rlhf",
    tr: "İnsan geri bildirimli pekiştirmeli öğrenme",
    en: "Reinforcement Learning from Human Feedback (RLHF)",
    aliases: [
      "RLHF",
      "insan geri bildirimiyle pekiştirmeli öğrenme",
      "insan tercihleriyle hizalama",
    ],
    shortDef:
      "İnsan tercihlerinden bir ödül modeli öğrenip, dil modelini bu ödülü artıracak biçimde pekiştirmeli öğrenmeyle eğitme.",
    longDef:
      "Önce insanlar aynı isteme verilen cevapları sıralar; bu sıralamalardan bir ödül modeli eğitilir. Ardından dil modeli, ödül modelini maksimize edecek biçimde pekiştirmeli öğrenmeyle güncellenir. Sonuç, çok daha küçük bir modelin bile talimatlara uyma ve tercih edilme bakımından çok daha büyük bir taban modeli geçebilmesidir.",
    pillar: "makine-ogrenmesi-temelleri",
    related: ["ince-ayar", "denetimli-ogrenme", "halusinasyon"],
    sources: [
      makale(
        "Training language models to follow instructions with human feedback",
        "https://arxiv.org/abs/2203.02155",
      ),
      makale(
        "Deep Reinforcement Learning from Human Preferences",
        "https://arxiv.org/abs/1706.03741",
      ),
    ],
  },
  {
    slug: "asiri-ogrenme",
    tr: "Aşırı öğrenme",
    en: "Overfitting",
    aliases: ["aşırı uyum", "ezberleme", "overfitting"],
    shortDef:
      "Modelin eğitim verisine, gürültüsü dahil, o kadar uyması ki görmediği veride başarısının düşmesi.",
    longDef:
      "Aşırı öğrenmenin klasik işareti, eğitim başarısı yükselirken doğrulama başarısının bir noktadan sonra düşmeye başlamasıdır; doğrulama eğrileri bu ayrışmayı görünür kılar. Derin ağların rastgele etiketleri bile ezberleyebildiği gösterildi, dolayısıyla kapasite tek başına açıklayıcı değildir. Pratik önlemler: ayrı doğrulama kümesi, düzenlileştirme, erken durdurma ve daha fazla temsil edici veri.",
    pillar: "makine-ogrenmesi-temelleri",
    related: ["denetimli-ogrenme", "degerlendirme-kumesi", "ince-ayar"],
    sources: [
      dokuman(
        "Validation curves — scikit-learn kullanıcı kılavuzu",
        "https://scikit-learn.org/stable/modules/learning_curve.html",
        "scikit-learn",
      ),
      makale(
        "Understanding deep learning requires rethinking generalization",
        "https://arxiv.org/abs/1611.03530",
      ),
    ],
  },
];

// ── Doğrulama + upsert ───────────────────────────────────────────────

function dogrula(): void {
  const sluglar = new Set<string>();
  for (const terim of TERIMLER) {
    const sonuc = termSema.safeParse(terim);
    if (!sonuc.success) {
      throw new Error(`${terim.slug}: şema geçersiz — ${JSON.stringify(sonuc.error.issues)}`);
    }
    if (sluglar.has(terim.slug)) throw new Error(`Slug tekrarı: ${terim.slug}`);
    sluglar.add(terim.slug);

    const kelime = terim.shortDef.split(/\s+/).filter(Boolean).length;
    if (kelime > 25) throw new Error(`${terim.slug}: shortDef ${kelime} kelime (maks 25)`);
    if (terim.sources.length === 0) throw new Error(`${terim.slug}: kaynak yok`);
  }
  // related[] yalnız var olan terimlere işaret etmeli (kırık iç link olmasın)
  for (const terim of TERIMLER) {
    for (const ilgili of terim.related) {
      if (!sluglar.has(ilgili))
        throw new Error(`${terim.slug}: bilinmeyen related slug "${ilgili}"`);
    }
  }
}

async function ana(): Promise<void> {
  dogrula();
  console.log(`Doğrulandı: ${TERIMLER.length} terim (şema + kaynak + iç link)`);

  const uri = process.env["MONGODB_URI"];
  if (!uri) {
    console.log("MONGODB_URI tanımlı değil; tohumlama atlanıyor.");
    return;
  }

  const client = await new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
  }).connect();
  const db = client.db(process.env["MONGODB_DB"] ?? "sinaptiklab");

  let eklenen = 0;
  let guncellenen = 0;
  for (const terim of TERIMLER) {
    const sonuc = await db
      .collection("terms")
      .updateOne({ slug: terim.slug }, { $set: terim }, { upsert: true });
    if (sonuc.upsertedCount > 0) eklenen += 1;
    else guncellenen += 1;
  }
  const toplam = await db.collection("terms").countDocuments();
  console.log(`terms → ${eklenen} yeni, ${guncellenen} güncellendi; koleksiyonda ${toplam} kayıt`);

  await client.close();
}

ana().catch((hata: unknown) => {
  console.error("seed-terms hata:", hata instanceof Error ? hata.message : hata);
  process.exit(1);
});
