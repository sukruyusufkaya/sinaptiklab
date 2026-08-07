# Pillar / Cluster Ağacı — TASLAK (onay bekliyor)

> Üretim: 2026-08-08. Anahtar kelime havuzuna ve BRIEF §2.3 sabit pillar listesine dayanır. Onaylanınca ADR 0006 Ek A olarak bağlanacak ve `topics` koleksiyonuna tohumlanacak.

**Gerekçe:** Ağaç, verilen anahtar kelime havuzundaki her hacimli terimi tam olarak bir cluster'a bağlayacak şekilde tasarlandı (toplam 124 cluster, pillar başına 9-12). Cluster seçimi doğrudan hacme dayandı: yüksek hacimli gezinme terimleri (gemini, chatgpt, claude, midjourney, n8n, ollama, hugging face) kendi ürün/araç rehberi cluster'ını aldı; "X nedir" orta kuyruğu kavram cluster'larının omurgası oldu (kanonik sözlük ve GEO stratejisiyle uyumlu). Çakışmayı önlemek için sınırlar scope cümlelerine yazıldı: ürün kullanımı (ChatGPT Rehberi) vs API geliştirme (LLM API Entegrasyonu) vs araç çağırma (Ajanik); değerlendirme üçe bölündü (klasik ML metrikleri → ML Temelleri, LLM değerlendirme → LLMOps, RAG'a özgü ölçüm → RAG); izleme ikiye bölündü (klasik drift → MLOps, LLM tracing → LLMOps); görüntü üretimi teknik/araç olarak ayrıldı (difüzyon tekniği → Bilgisayarlı Görü, Midjourney rehberleri → Sektör); güvenlikte saldırı/kırmızı takım Güvenlik pillar'ında, üretim guardrail'leri LLMOps'ta; sektörel hukuki gereklilikler Regülasyon'da, teknik uygulamalar Sektör'de. Nottaki anlam tuzakları (YOLO argo, LoRa IoT, transformer trafo, rag bez) ilgili cluster scope ve örnek başlıklarında açıkça netleştirildi. "Yapay zeka mühendisliği taban puanları" mevsimsel fırsatı ayrı cluster olarak korundu. Hacim verisi sıra-büyüklüğü tahmini olduğundan, SEO araç kotası açıldığında ağacın yeniden puanlanması önerilir; yapı buna izin verecek şekilde cluster'lar bağımsız ve tekil sorumlu tutuldu.

## LLM & Üretken YZ — `llm-uretken-yz`

Büyük dil modelleri ve üretken yapay zekanın kavramları, mimarisi, önde gelen ürünler ve API düzeyinde geliştirme.

| Cluster | Slug | Kapsam | Örnek içerik |
|---|---|---|---|
| LLM Temelleri | `llm-temelleri` | LLM, GPT ve büyük dil modeli kavramlarının tanım düzeyinde, kaynaklı ve kanonik anlatımı. | LLM nedir? Büyük dil modelleri nasıl çalışır? · GPT nedir? GPT ailesinin sürüm sürüm evrimi · LLM ile klasik yazılım arasındaki temel fark |
| Üretken YZ Kavramları | `uretken-yz-kavramlari` | Üretken yapay zekanın genel kavram haritası ve yapay zeka–LLM ilişkisinin kavramsal anlatımı (ürün rehberleri ve mimari ayrı cluster'larda). | Üretken yapay zeka nedir? Ayrımlı ve üretken modeller · Yapay zeka, makine öğrenmesi ve LLM: kavram haritası · Üretken YZ'nin kısa tarihi: GAN'lardan GPT'ye |
| Transformer Mimarisi | `transformer-mimarisi` | Transformer mimarisi, dikkat mekanizması ve model iç yapısının teknik anlatımı (elektrik trafosuyla karışmayı önleyen net YZ bağlamı). | Transformer nedir? (YZ mimarisi, trafo değil) · Attention mekanizması adım adım görselli anlatım · Mixture-of-Experts mimarisi nasıl çalışır? |
| Tokenizasyon & Bağlam Penceresi | `tokenizasyon-baglam-penceresi` | Token, tokenizasyon, bağlam penceresi kavramları ve Türkçe metinlerin tokenlaşma davranışı. | Token nedir? Türkçe neden daha çok token harcar? · Bağlam penceresi nedir, neden önemli? · Tokenizer karşılaştırması: çalışan notebook ile |
| Prompt Mühendisliği | `prompt-muhendisligi` | Prompt kavramı, istem teknikleri ve tekrarlanabilir prompt desenleri. | Prompt nedir? Etkili istem yazmanın temelleri · Few-shot, chain-of-thought ve rol atama teknikleri · Türkçe prompt yazarken yapılan 10 hata |
| ChatGPT Rehberi | `chatgpt-rehberi` | ChatGPT ürününün kullanım rehberleri ve sürümlü özellik takibi (API tarafı LLM API Entegrasyonu cluster'ında). | ChatGPT nasıl kullanılır? Kapsamlı başlangıç rehberi · ChatGPT ücretsiz ve Plus planları: ne fark eder? · ChatGPT özel talimatlar (custom instructions) rehberi |
| Gemini Rehberi | `gemini-rehberi` | Google Gemini ürün ailesinin kullanım rehberleri ve güncel özellik takibi. | Gemini nedir, nasıl kullanılır? · Gemini'nin Google Workspace entegrasyonu rehberi · Gemini'de görsel ve dosya ile çalışma |
| Claude Rehberi | `claude-rehberi` | Anthropic Claude ürün ailesinin kullanım rehberleri ve özellik takibi (Claude Code, Kodlama Ajanları cluster'ında). | Claude nedir, nasıl kullanılır? · Claude Artifacts ile neler yapılır? · Claude'da proje ve dosya yönetimi rehberi |
| Model Karşılaştırmaları | `model-karsilastirmalari` | Kapalı ve açık modellerin görev bazlı, test protokollü ve kaynaklı karşılaştırma/seçim rehberleri. | ChatGPT, Claude ve Gemini: görev bazlı karşılaştırma · En iyi Türkçe LLM hangisi? Test protokolü ve sonuçlar · Ücretsiz LLM seçenekleri: ölçütlü karşılaştırma |
| Açık Ağırlıklı Modeller | `acik-agirlikli-modeller` | Llama, Mistral, Qwen gibi açık ağırlıklı modellerin tanıtımı ve seçim rehberleri (yerelde çalıştırma MLOps & Altyapı'da). | Llama ailesi rehberi: hangi sürüm ne için? · Açık ağırlıklı model ile kapalı model farkı · Türkçe destekli açık modeller: kaynaklı değerlendirme |
| LLM API Entegrasyonu | `llm-api-entegrasyonu` | OpenAI, Anthropic ve Gemini API'leriyle tek çağrı düzeyinde geliştirme: kimlik doğrulama, streaming, structured output ve maliyet (araç çağırma Ajanik Sistemler'de). | ChatGPT API nasıl kullanılır? Çalışan repo ile · Structured output: LLM'den güvenilir JSON almak · LLM API maliyet hesaplama rehberi |
| Halüsinasyon & Güvenilirlik | `halusinasyon-guvenilirlik` | Halüsinasyonun nedenleri, ölçümü ve uygulama düzeyinde azaltma stratejileri. | Yapay zeka halüsinasyonu nedir, neden olur? · Halüsinasyonu azaltmanın kanıta dayalı 7 yolu · LLM çıktısını doğrulama desenleri |

## RAG & Bilgi Erişimi — `rag-bilgi-erisimi`

Kurumsal bilgiyle konuşan sistemler: RAG mimarisi, embedding, vektör arama ve retrieval boru hatları.

| Cluster | Slug | Kapsam | Örnek içerik |
|---|---|---|---|
| RAG Temelleri | `rag-temelleri` | RAG kavramı, çalışma prensibi ve fine-tuning ile karşılaştırması (İngilizce 'rag' aramalarından ayrışan net YZ bağlamı). | RAG nedir? Retrieval-Augmented Generation rehberi · RAG mı fine-tuning mi? Karar çerçevesi · İlk RAG uygulamanız: çalışan repo ile adım adım |
| Embedding & Vektör Temsiller | `embedding-vektor-temsiller` | Embedding kavramı, model seçimi ve Türkçe metinlerde embedding performansı. | Embedding nedir? Vektör temsillere giriş · Türkçe embedding modelleri karşılaştırması: test kodu ile · Embedding boyutu ve maliyet dengesi |
| Vektör Veritabanları | `vektor-veritabanlari` | Pinecone, Qdrant, Weaviate, pgvector gibi vektör veritabanlarının kavramı, karşılaştırması ve kurulum rehberleri. | Vektör veritabanı nedir? · Pinecone, Qdrant ve pgvector karşılaştırması · pgvector ile sıfır ek maliyetli vektör arama |
| Doküman İşleme & Chunking | `dokuman-isleme-chunking` | PDF ve ofis dokümanlarının ayrıştırılması, chunking stratejileri ve retrieval için veri hazırlama. | Chunking nedir? Strateji seçim rehberi · Türkçe PDF'lerden temiz metin çıkarma · Tablo ve görsel içeren dokümanlarda RAG |
| Semantik Arama & Reranking | `semantik-arama-reranking` | Semantik arama, hibrit (BM25+vektör) arama ve yeniden sıralama teknikleri. | Semantik arama nedir, klasik aramadan farkı ne? · Hibrit arama: BM25 + vektör birleşimi uygulaması · Reranker retrieval kalitesini ne kadar artırır? Ölçümlü deney |
| LangChain Rehberi | `langchain-rehberi` | LangChain çerçevesinin sürümlü rehberleri ve RAG odaklı kullanım desenleri (LangGraph Ajanik Sistemler'de). | LangChain nedir, ne zaman kullanmalı? · LangChain ile RAG: çalışan repo · LangChain sürüm geçiş rehberi |
| LlamaIndex Rehberi | `llamaindex-rehberi` | LlamaIndex çerçevesinin rehberleri ve doküman odaklı RAG kullanımı. | LlamaIndex nedir? LangChain'den farkı · LlamaIndex ile kurumsal doküman asistanı · LlamaIndex index türleri rehberi |
| İleri RAG Desenleri | `ileri-rag-desenleri` | Query rewriting, multi-hop, GraphRAG ve agentic RAG gibi ileri mimari desenler. | GraphRAG nedir, ne zaman gerekir? · Query rewriting ile retrieval kalitesini artırma · Çok adımlı (multi-hop) RAG mimarisi |
| RAG Değerlendirme | `rag-degerlendirme` | Retrieval ve yanıt kalitesinin RAG'a özgü metriklerle ölçümü (genel LLM değerlendirme LLMOps'ta). | RAG nasıl değerlendirilir? RAGAS rehberi · Retrieval metrikleri: precision@k, recall, MRR · RAG değerlendirme seti nasıl kurulur? |

## Ajanik Sistemler — `ajanik-sistemler`

Araç kullanan, planlayan ve otonom görev yürüten yapay zeka ajanları ile iş akışı otomasyonu.

| Cluster | Slug | Kapsam | Örnek içerik |
|---|---|---|---|
| Ajan Temelleri | `ajan-temelleri` | AI agent ve agentic AI kavramları, ajan–chatbot farkı ve ajan mimarisinin yapı taşları. | AI agent nedir? Chatbot'tan farkı ne? · Agentic AI nedir? Kavram ve gerçek örnekler · Yapay zeka ajanı nasıl yapılır? Sıfırdan çalışan örnek |
| MCP (Model Context Protocol) | `mcp-rehberi` | MCP protokolünün kavramı, sunucu/istemci geliştirme ve ekosistem takibi (MCP güvenliği Güvenlik pillar'ında). | MCP nedir? Model Context Protocol rehberi · Kendi MCP sunucunuzu yazın: çalışan repo · MCP ekosistemi: öne çıkan sunucular |
| Araç Kullanımı & Function Calling | `arac-kullanimi-function-calling` | LLM'lerin araç çağırma yeteneği: function calling, ReAct döngüsü ve iyi araç tasarımı. | Function calling nedir? Çalışan örnekle · ReAct deseni: düşün-eyle döngüsü · İyi araç (tool) tasarımının kuralları |
| Ajan Çerçeveleri | `ajan-frameworkleri` | LangGraph, CrewAI, AutoGen gibi ajan geliştirme çerçevelerinin rehberleri ve seçim karşılaştırmaları. | CrewAI nedir? İlk ajan ekibiniz · LangGraph ile durum makineli ajan · Ajan çerçevesi seçim rehberi: ölçütlü karşılaştırma |
| Çoklu Ajan Mimarileri | `coklu-ajan-mimarileri` | Birden çok ajanın iş bölümü, orkestrasyonu ve iletişim desenleri (tek çerçeve rehberleri Ajan Çerçeveleri'nde). | Çoklu ajan sistemleri ne zaman gerekir? · Orkestratör-işçi deseni: çalışan uygulama · Ajanlar arası iletişim desenleri |
| Ajan Belleği & Planlama | `ajan-bellek-planlama` | Ajanlarda kısa/uzun vadeli bellek, planlama ve öz-değerlendirme mekanizmaları. | Ajan belleği nasıl tasarlanır? · Planlama stratejileri: plan-and-execute ve reflection · Uzun görevlerde bağlam yönetimi |
| n8n Rehberi | `n8n-rehberi` | n8n platformunun kurulumu, YZ düğümleri ve hazır iş akışı şablonları. | n8n nedir? Kurulumdan ilk iş akışına · n8n ile yapay zeka otomasyonu: 5 hazır şablon · n8n self-host rehberi: Docker ile |
| Otomasyon Platformları | `otomasyon-platformlari` | Make, Zapier, Dify gibi platformların rehberleri ve platformlar arası karşılaştırmalar (n8n'e özgü içerik n8n Rehberi'nde). | n8n, Make ve Zapier karşılaştırması · Dify ile kod yazmadan YZ uygulaması · Hangi otomasyon platformu ne zaman? |
| Kodlama Ajanları | `kodlama-ajanlari` | Claude Code, Cursor, Copilot gibi yazılım geliştirme ajanlarının kullanımı ve iş akışları. | Claude Code nedir, nasıl kullanılır? · Cursor ile ajan destekli geliştirme · Kodlama ajanlarıyla verimli çalışmanın kuralları |
| Bilgisayar & Tarayıcı Kullanan Ajanlar | `bilgisayar-kullanan-ajanlar` | Ekranı, tarayıcıyı ve işletim sistemini kullanan ajanlar (computer use, tarayıcı otomasyonu). | Computer use nedir? Ajan ekranı nasıl kullanır? · Tarayıcı ajanlarıyla web otomasyonu · Bilgisayar kullanan ajanların sınırları: test sonuçları |

## LLMOps & Değerlendirme — `llmops-degerlendirme`

LLM uygulamalarını üretime taşıma disiplini: fine-tuning, değerlendirme, gözlemlenebilirlik ve maliyet yönetimi.

| Cluster | Slug | Kapsam | Örnek içerik |
|---|---|---|---|
| LLMOps Temelleri | `llmops-temelleri` | LLMOps kavramı, yaşam döngüsü ve MLOps'tan farkları. | LLMOps nedir? MLOps'tan farkı · LLM uygulama yaşam döngüsü haritası · LLMOps araç ekosistemi rehberi |
| Fine-Tuning | `fine-tuning-rehberi` | Fine-tuning kavramı, ne zaman gerektiği ve uçtan uca uygulama rehberleri. | Fine-tuning nedir, ne zaman gerekir? · Açık modelde fine-tuning: çalışan repo ile · Fine-tuning maliyet hesabı |
| LoRA & PEFT | `lora-peft` | LoRA, QLoRA ve parametre-verimli fine-tuning yöntemleri (IoT teknolojisi LoRa ile karışmayı önleyen net bağlam). | LoRA nedir? (YZ eğitim tekniği, IoT LoRa değil) · QLoRA ile tek GPU'da fine-tuning · PEFT yöntemleri karşılaştırması |
| Eğitim Verisi Hazırlama | `egitim-verisi-hazirlama` | Fine-tuning için instruction dataset oluşturma, sentetik veri üretimi ve veri kalitesi kontrolü. | Instruction dataset nasıl hazırlanır? · Sentetik veri üretimi: yöntemler ve riskler · Türkçe eğitim verisi kaynakları |
| RLHF & Hizalama | `rlhf-hizalama` | RLHF, DPO ve model hizalama tekniklerinin kavramsal ve uygulamalı anlatımı. | RLHF nedir? İnsan geri bildirimiyle öğrenme · DPO ile hizalama: RLHF'e pratik alternatif · Hizalama neden zor? Kaynaklı derleme |
| LLM Değerlendirme | `llm-degerlendirme` | LLM çıktılarının değerlendirme yöntemleri, metrikler ve değerlendirme seti tasarımı (RAG'a özgü ölçüm RAG pillar'ında). | LLM nasıl değerlendirilir? Yöntem haritası · Değerlendirme seti (eval set) nasıl kurulur? · Otomatik metrikler ve insan değerlendirmesi dengesi |
| LLM-as-Judge | `llm-judge` | LLM ile otomatik değerlendirme: judge prompt tasarımı, yanlılıklar ve kalibrasyon. | LLM-as-judge nedir, ne kadar güvenilir? · Judge prompt tasarımı: çalışan şablonlar · Judge yanlılıkları ve ölçümü |
| LLM Benchmark'ları | `llm-benchmarklari` | MMLU ve benzeri genel benchmark'lar ile Türkçe benchmark ekosisteminin kaynaklı takibi. | LLM benchmark'ları rehberi: MMLU'dan Arena'ya · Türkçe LLM benchmark'ları: mevcut durum · Benchmark sonuçları neden yanıltabilir? |
| LLM Gözlemlenebilirliği | `llm-gozlemlenebilirlik` | Üretimdeki LLM uygulamalarının izlenmesi: tracing, Langfuse/LangSmith ve kalite takibi (klasik ML izleme MLOps'ta). | LLM gözlemlenebilirliği nedir? · Langfuse kurulumu: çalışan örnek · Üretimde prompt performans takibi |
| Prompt & Deney Yönetimi | `prompt-deney-yonetimi` | Prompt versiyonlama, A/B testleri ve LLM uygulamalarında deney takibi süreçleri. | Prompt versiyonlama neden şart? · LLM uygulamasında A/B testi kurgusu · Prompt kayıt defteri (registry) desenleri |
| Maliyet Optimizasyonu | `maliyet-optimizasyonu` | Token maliyeti, önbellekleme ve model kademeleme ile LLM uygulama maliyetinin düşürülmesi (GPU/donanım maliyeti MLOps'ta). | LLM maliyeti nasıl düşürülür? 8 kanıtlı taktik · Prompt caching rehberi · Model kademeleme: ucuz model ne zaman yeter? |
| Guardrails & Çıktı Kontrolü | `guardrails-cikti-kontrolu` | Üretimde çıktı doğrulama, içerik filtreleme ve guardrail çerçeveleri (saldırılar ve kırmızı takım Güvenlik pillar'ında). | Guardrails nedir? Üretimde çıktı güvenliği · Çıktı doğrulama desenleri: şema ve kural tabanlı · Guardrail çerçeveleri karşılaştırması |

## Bilgisayarlı Görü — `bilgisayarli-goru`

Görüntü ve videodan anlam çıkaran sistemler: klasik görüntü işlemeden derin öğrenme tabanlı görüye.

| Cluster | Slug | Kapsam | Örnek içerik |
|---|---|---|---|
| Görüntü İşleme Temelleri | `goruntu-isleme-temelleri` | Görüntü işleme kavramları, filtreler ve klasik yöntemler. | Görüntü işleme nedir? · Konvolüsyon ve filtreler: görselli anlatım · Klasik görüntü işleme ile derin öğrenme farkı |
| OpenCV Rehberi | `opencv-rehberi` | OpenCV kütüphanesinin kurulumdan ileri kullanıma, araç odaklı uygulama tarifleri. | OpenCV nedir? Python ile kurulum ve ilk proje · OpenCV ile nesne tespiti nasıl yapılır? Çalışan repo · OpenCV ile video işleme rehberi |
| Nesne Tespiti & YOLO | `nesne-tespiti-yolo` | Derin öğrenme tabanlı nesne tespiti modelleri, özellikle YOLO ailesi (argo 'YOLO'dan ayrışan net teknik bağlam). | YOLO nedir? (Nesne tespiti algoritması) · YOLO sürümleri karşılaştırması · Kendi veri setinizle YOLO eğitimi: çalışan repo |
| Görüntü Sınıflandırma & CNN | `goruntu-siniflandirma-cnn` | CNN mimarileri ve görüntü sınıflandırma uygulamaları (genel sinir ağı teorisi ML Temelleri'nde). | CNN nedir? Evrişimli sinir ağlarına giriş · Transfer learning ile görüntü sınıflandırma · ResNet'ten ViT'e mimari evrimi |
| Segmentasyon & Nesne Takibi | `segmentasyon-nesne-takibi` | Görüntü segmentasyonu ve video üzerinde nesne takibi teknikleri. | Segmentasyon türleri: semantic, instance, panoptic · SAM ile etkileşimli segmentasyon · Video nesne takibi: DeepSORT uygulaması |
| Yüz Tanıma | `yuz-tanima` | Yüz tespiti ve tanıma teknolojisinin teknik anlatımı ve uygulamaları (hukuki boyut Regülasyon pillar'ında). | Yüz tanıma nasıl çalışır? · Python ile yüz tanıma uygulaması: çalışan repo · Yüz tanımada doğruluk ve yanlılık sorunları |
| OCR & Belge Anlama | `ocr-belge-anlama` | Optik karakter tanıma ve belge yapay zekası; Türkçe belgeler ve el yazısı dahil. | OCR nedir, nasıl çalışır? · Türkçe OCR karşılaştırması: test setiyle · Fatura ve belge çıkarımı: document AI rehberi |
| Görsel-Dil Modelleri (VLM) | `gorsel-dil-modelleri` | Görüntüyü anlayan çok kipli modeller (GPT-4V, Gemini Vision, açık VLM'ler) ve kullanım desenleri. | VLM nedir? Görüntü anlayan modeller · VLM ile görsel soru-cevap: çalışan örnek · Açık kaynak VLM'ler karşılaştırması |
| Difüzyon Modelleri (Teknik) | `difuzyon-modelleri` | Stable Diffusion ve difüzyon tabanlı üretimin teknik anlatımı ile kendi donanımında çalıştırma (araç kullanım rehberleri Sektör Uygulamaları'nda). | Difüzyon modeli nasıl çalışır? · Stable Diffusion'ı yerelde çalıştırma rehberi · ControlNet ile kontrollü görüntü üretimi |
| Video Analitiği | `video-analitigi` | Gerçek zamanlı video analizi, sayma/izleme uygulamaları ve uçta (edge) görü dağıtımı. | Gerçek zamanlı video analitiği mimarisi · Kamera görüntüsünden insan sayma: çalışan repo · Jetson üzerinde görü modeli çalıştırma |

## Makine Öğrenmesi Temelleri — `makine-ogrenmesi-temelleri`

Makine öğrenmesi ve derin öğrenmenin kavramsal-uygulamalı temelleri, kütüphane rehberleri ve matematik altyapısı.

| Cluster | Slug | Kapsam | Örnek içerik |
|---|---|---|---|
| Makine Öğrenmesine Giriş | `makine-ogrenmesi-giris` | ML'nin tanımı, tür haritası ve yapay zeka ile ilişkisinin kanonik anlatımı. | Makine öğrenmesi nedir? · Yapay zeka ile makine öğrenmesi arasındaki fark · Makine öğrenmesi tür haritası: hangisi ne zaman? |
| Denetimli Öğrenme | `denetimli-ogrenme` | Regresyon ve sınıflandırma algoritmalarının kavram ve uygulama rehberleri. | Denetimli öğrenme nedir? · Lineer regresyondan XGBoost'a algoritma turu · Karar ağaçları ve rastgele orman: çalışan notebook |
| Denetimsiz Öğrenme | `denetimsiz-ogrenme` | Kümeleme, boyut indirgeme ve anomali tespiti yöntemleri. | Denetimsiz öğrenme nedir? Denetimliden farkı · K-means ile kümeleme uygulaması · PCA ile boyut indirgeme |
| Derin Öğrenme & Sinir Ağları | `derin-ogrenme-sinir-aglari` | Yapay sinir ağlarının çalışma prensibi ve derin öğrenmenin temel kavramları (görü mimarileri Bilgisayarlı Görü'de, Transformer LLM pillar'ında). | Derin öğrenme nedir? · Yapay sinir ağı nasıl çalışır? Görselli anlatım · Geri yayılım (backpropagation) adım adım |
| Pekiştirmeli Öğrenme | `pekistirmeli-ogrenme` | RL kavramları, algoritmaları ve uygulama örnekleri (RLHF, LLMOps pillar'ında). | Pekiştirmeli öğrenme nedir? · Q-learning'den PPO'ya algoritma haritası · Gym ortamında ilk RL ajanınız |
| PyTorch Rehberi | `pytorch-rehberi` | PyTorch kütüphanesinin sürümlü, uygulamalı rehberleri. | PyTorch nedir? Kurulum ve ilk model · PyTorch ile eğitim döngüsü: çalışan repo · PyTorch Lightning ne zaman kullanılmalı? |
| TensorFlow & Keras | `tensorflow-keras-rehberi` | TensorFlow/Keras ekosisteminin rehberleri ve PyTorch ile çerçeve karşılaştırmaları. | TensorFlow nedir? Keras ile hızlı başlangıç · PyTorch mu TensorFlow mu? Ölçütlü karşılaştırma · Keras ile ilk sinir ağınız |
| scikit-learn Rehberi | `scikit-learn-rehberi` | scikit-learn ile klasik ML uygulama rehberleri ve pipeline desenleri. | scikit-learn nedir? Hızlı başlangıç · scikit-learn pipeline rehberi · Model seçimi: GridSearchCV uygulaması |
| Model Doğrulama & Metrikler | `model-dogrulama-metrikler` | Overfitting, çapraz doğrulama ve klasik ML metrikleri (LLM değerlendirme LLMOps'ta). | Overfitting nedir, nasıl önlenir? · Çapraz doğrulama rehberi · Accuracy yetmez: precision, recall, F1 ne zaman? |
| Python ile ML Başlangıç | `python-ml-baslangic` | ML için Python ortamı, NumPy/Pandas temelleri ve ilk uçtan uca proje. | Makine öğrenmesi için Python kurulumu · NumPy ve Pandas: ML için yeterli temel · İlk uçtan uca ML projeniz: çalışan repo |
| ML Matematiği | `ml-matematigi` | Lineer cebir, olasılık ve optimizasyonun ML bağlamında sezgisel anlatımı. | ML için lineer cebir: ihtiyacınız olan kadar · Gradyan inişi görselli anlatım · Olasılık ve istatistik ML'de nerede karşınıza çıkar? |

## Veri Mühendisliği — `veri-muhendisligi`

Veri boru hatları, büyük veri ekosistemi ve YZ sistemlerini besleyen veri altyapısı.

| Cluster | Slug | Kapsam | Örnek içerik |
|---|---|---|---|
| Veri Mühendisliği Temelleri | `veri-muhendisligi-temelleri` | Veri mühendisliği disiplini, rolü ve veri bilimiyle ilişkisinin kanonik anlatımı. | Veri mühendisi ne iş yapar? · Veri bilimi ile veri mühendisliği arasındaki fark · Modern veri yığını (modern data stack) haritası |
| ETL & Veri Boru Hatları | `etl-boru-hatlari` | ETL/ELT kavramları ve batch boru hattı tasarım desenleri. | ETL nedir? ELT ile farkı · İlk veri boru hattınız: çalışan repo ile · Idempotent boru hattı tasarımı |
| Apache Spark Rehberi | `apache-spark-rehberi` | Apache Spark'ın kavramları ve PySpark uygulama rehberleri. | Apache Spark nedir? · PySpark ile ilk iş: çalışan örnek · Spark performans ayarları rehberi |
| Apache Airflow & Orkestrasyon | `apache-airflow-orkestrasyon` | Airflow ve iş akışı orkestrasyon araçlarının rehberleri. | Apache Airflow nedir? DAG kavramı · Airflow kurulumu ve ilk DAG: çalışan repo · Airflow alternatifleri: Dagster, Prefect |
| Büyük Veri Ekosistemi | `buyuk-veri-ekosistemi` | Büyük veri kavramı ve ekosistem araçlarının harita düzeyinde anlatımı (Spark/Airflow ayrıntısı kendi cluster'larında). | Büyük veri nedir? 5V modeli · Hadoop bugün hâlâ gerekli mi? · Büyük veri ekosistem haritası |
| Veri Ambarı & Lakehouse | `veri-ambari-lakehouse` | Veri ambarı, veri gölü ve lakehouse mimarileri ile platform rehberleri (BigQuery, Snowflake, Databricks). | Veri ambarı, veri gölü, lakehouse: hangisi ne? · BigQuery başlangıç rehberi · Iceberg ve Delta Lake karşılaştırması |
| SQL & Veri Modelleme | `sql-veri-modelleme` | Analitik SQL, veri modelleme ve dbt ile dönüşüm rehberleri. | Analitik SQL rehberi: window fonksiyonları · dbt nedir? İlk projeniz · Yıldız şema ve veri modelleme desenleri |
| Akış Veri İşleme | `akis-veri-isleme` | Kafka ve gerçek zamanlı veri işleme mimarileri. | Apache Kafka nedir? · Gerçek zamanlı boru hattı: Kafka + Flink örneği · Streaming ne zaman gerekli? Karar rehberi |
| Veri Kalitesi & Gözlemlenebilirliği | `veri-kalitesi-gozlemlenebilirlik` | Veri doğrulama, kalite testleri ve veri gözlemlenebilirliği araçları. | Veri kalitesi nasıl ölçülür? · Great Expectations ile veri testi · Veri sözleşmeleri (data contracts) nedir? |
| Veri Madenciliği | `veri-madenciligi` | Veri madenciliği kavramları ve klasik keşif teknikleri (ML algoritmalarının kendisi ML Temelleri'nde). | Veri madenciliği nedir? · Birliktelik kuralları: sepet analizi örneği · CRISP-DM süreci rehberi |

## MLOps & Altyapı — `mlops-altyapi`

Modelleri üretimde çalıştıran altyapı: konteynerler, GPU'lar, deployment ve yerel LLM çalıştırma.

| Cluster | Slug | Kapsam | Örnek içerik |
|---|---|---|---|
| MLOps Temelleri | `mlops-temelleri` | MLOps kavramı, olgunluk seviyeleri ve araç ekosistemi (LLM'e özgü operasyon LLMOps pillar'ında). | MLOps nedir? · MLOps olgunluk seviyeleri: neredesiniz? · MLOps araç haritası |
| Docker & Konteynerler | `docker-konteynerler` | Docker'ın ML iş yükleri bağlamında kavram ve uygulama rehberleri. | Docker nedir? ML mühendisi için rehber · ML modelini Docker'la paketleme: çalışan repo · GPU'lu Docker: nvidia-container-toolkit rehberi |
| Kubernetes | `kubernetes-rehberi` | Kubernetes kavramları ve ML iş yüklerinin K8s üzerinde çalıştırılması. | Kubernetes nedir? Sadeleştirilmiş anlatım · K8s üzerinde model servisi · Kubernetes ML araçları: Kubeflow'a bakış |
| Ollama & Yerel LLM | `ollama-yerel-llm` | Ollama ve yerel LLM çalıştırma: kurulum, model seçimi, quantization (GGUF) ve donanım gereksinimleri. | Ollama nedir, nasıl kullanılır? · Yerel LLM çalıştırma rehberi: hangi donanıma hangi model? · Quantization nedir? GGUF formatı |
| Hugging Face | `hugging-face-rehberi` | Hugging Face Hub ve transformers ekosisteminin kullanım rehberleri. | Hugging Face nedir? · Hub'dan model indirip çalıştırma: çalışan örnek · Spaces ile ücretsiz demo yayınlama |
| Model Servisi & Deployment | `model-servisi-deployment` | Modellerin API olarak servis edilmesi: FastAPI, vLLM, TorchServe ve servis mimarileri. | Model deployment nasıl yapılır? Yol haritası · vLLM ile yüksek verimli LLM servisi · FastAPI ile model API'si: çalışan repo |
| GPU & Donanım | `gpu-donanim` | GPU seçimi, kiralama ve bulut GPU sağlayıcılarının maliyet karşılaştırmaları. | GPU kiralama rehberi: sağlayıcı karşılaştırması · Hangi GPU hangi iş için? VRAM hesabı · Bulut GPU fiyat analizi: güncel tablo |
| ML CI/CD & Deney Takibi | `ml-cicd-deney-takibi` | ML boru hatlarında CI/CD, MLflow ile deney takibi ve model kayıt defteri (prompt deneyleri LLMOps'ta). | ML projelerinde CI/CD nasıl kurulur? · MLflow rehberi: deney takibi ve model registry · DVC ile veri versiyonlama |
| Model İzleme & Drift | `model-izleme-drift` | Üretimdeki klasik ML modellerinin izlenmesi ve drift tespiti (LLM gözlemlenebilirliği LLMOps'ta). | Model drift nedir, nasıl tespit edilir? · Evidently ile model izleme · Yeniden eğitim ne zaman tetiklenmeli? |
| Edge & Mobil Dağıtım | `edge-mobil-dagitim` | Modellerin uç cihaz ve mobilde çalıştırılması: ONNX, TFLite ve optimizasyon. | ONNX nedir? Model taşınabilirliği · Telefonda model çalıştırma: TFLite rehberi · Uç cihaz için model küçültme teknikleri |

## Güvenlik & Kırmızı Takım — `guvenlik-kirmizi-takim`

YZ sistemlerine yönelik saldırılar ve savunmalar ile YZ'nin siber güvenlikte kullanımı.

| Cluster | Slug | Kapsam | Örnek içerik |
|---|---|---|---|
| YZ Güvenliği Temelleri | `yz-guvenligi-temelleri` | Yapay zeka güvenliği kavramları, tehdit modelleri ve OWASP LLM Top 10. | Yapay zeka güvenliği nedir? · OWASP LLM Top 10 Türkçe rehberi · LLM uygulaması için tehdit modelleme |
| Prompt Injection | `prompt-injection` | Prompt injection saldırı türleri, gerçek vakalar ve savunma teknikleri. | Prompt injection nedir? Örneklerle · Dolaylı prompt injection: RAG ve ajanlardaki risk · Prompt injection savunma katmanları |
| Jailbreak & Atlatma Teknikleri | `jailbreak-atlatma` | Model güvenlik önlemlerini atlatma tekniklerinin sorumlu analiz ve savunma perspektifiyle işlenmesi. | LLM jailbreak nedir? · Jailbreak taksonomisi: kaynaklı derleme · Modeller jailbreak'e karşı nasıl güçlendirilir? |
| LLM Kırmızı Takım | `llm-kirmizi-takim` | LLM uygulamalarına sistematik kırmızı takım metodolojisi ve otomatik test araçları. | LLM red teaming nasıl yapılır? · Garak ile otomatik güvenlik taraması: çalışan örnek · Kırmızı takım raporu nasıl yazılır? |
| Deepfake & Tespit | `deepfake-tespit` | Deepfake teknolojisi, tespit yöntemleri ve doğrulama araçları. | Deepfake nedir, nasıl anlaşılır? · Deepfake tespit araçları karşılaştırması · Ses klonlama dolandırıcılığına karşı önlemler |
| Adversarial Saldırılar | `adversarial-saldirilar` | Görü ve klasik ML modellerine yönelik adversarial örnekler ve dayanıklılık teknikleri. | Adversarial attack nedir? · Bir pikselle modeli kandırmak: çalışan deney · Adversarial dayanıklılık teknikleri |
| Veri Gizliliği Saldırıları | `veri-gizliligi-saldirilari` | Eğitim verisi sızdırma, model inversion ve membership inference saldırıları (KVKK boyutu Regülasyon'da). | Modelden eğitim verisi sızar mı? · Membership inference saldırısı anlatımı · Differential privacy ile koruma |
| Ajan & MCP Güvenliği | `ajan-mcp-guvenligi` | Ajan sistemlerinde araç kötüye kullanımı, yetki sınırlama ve MCP güvenlik riskleri. | Ajan güvenliği: araçlar saldırı yüzeyidir · MCP sunucularında güvenlik riskleri · Ajanlara en az yetki ilkesi nasıl uygulanır? |
| Model Tedarik Zinciri Güvenliği | `model-tedarik-zinciri` | Zehirlenmiş modeller, güvensiz serileştirme ve model kaynak doğrulama. | Hugging Face'ten model indirmek güvenli mi? · Pickle riski: safetensors neden var? · Model imzalama ve doğrulama |
| YZ Destekli Siber Güvenlik | `yz-destekli-siber-guvenlik` | Yapay zekanın savunma tarafında kullanımı: tehdit tespiti, SOC otomasyonu ve güvenlik analizi. | Yapay zeka siber güvenlikte nasıl kullanılır? · LLM ile log analizi: çalışan örnek · SOC'ta YZ ajanları: gerçekçi bakış |

## Regülasyon & Yönetişim — `regulasyon-yonetisim`

KVKK, AI Act ve Türkiye YZ mevzuatı ekseninde uyum rehberleri ile kurumsal YZ yönetişimi.

| Cluster | Slug | Kapsam | Örnek içerik |
|---|---|---|---|
| KVKK Temelleri | `kvkk-temelleri` | Kişisel Verilerin Korunması Kanunu'nun kapsamı, yükümlülükler ve genel uyum rehberleri. | KVKK nedir? Kapsamlı rehber · VERBİS kaydı kimler için zorunlu? · Aydınlatma metni nasıl hazırlanır? |
| KVKK & Yapay Zeka | `kvkk-yapay-zeka` | YZ kullanım senaryolarında KVKK uyumu: veri işleme, açık rıza ve kurumsal YZ aracı kullanımı. | ChatGPT kullanımı KVKK'ya uygun mu? · Şirket verisiyle LLM kullanmanın KVKK çerçevesi · KVKK uyumlu RAG mimarisi tasarımı |
| Sınır Ötesi Veri Aktarımı | `sinir-otesi-veri-aktarimi` | Yurt dışına veri aktarımı kuralları ve yabancı YZ servisleri kullanımının hukuki boyutu. | Yurt dışına veri aktarımı: güncel kurallar · ABD tabanlı LLM API'si kullanmak veri aktarımı mıdır? · Standart sözleşme ve taahhütname rehberi |
| Türkiye YZ Mevzuatı | `turkiye-yz-mevzuati` | TBMM'deki yapay zeka yasa tasarısı ve Türkiye'nin YZ politika belgelerinin sürümlü takibi. | Yapay zeka yasası ne zaman çıkacak? Güncel durum · YZ yasa tasarısı madde madde analiz · Ulusal Yapay Zeka Stratejisi özeti |
| EU AI Act | `eu-ai-act` | Avrupa Birliği Yapay Zeka Yasası'nın kapsamı, risk sınıfları ve Türk şirketlerine etkisi. | AI Act nedir? Risk sınıfları rehberi · AI Act Türk şirketlerini nasıl etkiler? · AI Act uyum takvimi ve yükümlülükler |
| Global Regülasyon Takibi | `global-regulasyon-takibi` | ABD, Çin, Birleşik Krallık gibi ülkelerin YZ düzenlemelerinin karşılaştırmalı takibi. | Dünyada YZ regülasyonu haritası · ABD'nin YZ yaklaşımı: federal ve eyalet düzeyi · Çin'in üretken YZ yönetmeliği ne diyor? |
| YZ Etiği & Sorumlu YZ | `yz-etigi-sorumlu-yz` | Etik ilkeler, algoritmik yanlılık, şeffaflık ve sorumlu YZ uygulama çerçeveleri. | Yapay zeka etiği nedir? · Algoritmik yanlılık: örnekler ve ölçüm · Sorumlu YZ ilkeleri nasıl hayata geçirilir? |
| Kurumsal YZ Yönetişimi | `kurumsal-yz-yonetisimi` | Kurum içi YZ kullanım politikaları, ISO 42001 ve yönetişim çerçeveleri (indirilebilir şablonlarla). | Şirket YZ kullanım politikası: indirilebilir şablon · ISO 42001 nedir? Sertifikasyon süreci · YZ yönetişim komitesi nasıl kurulur? |
| Telif & Fikri Mülkiyet | `telif-fikri-mulkiyet` | YZ üretimi içeriğin telif durumu ve eğitim verisi telif tartışmalarının kaynaklı takibi. | YZ ile üretilen içeriğin telifi kime ait? · Eğitim verisi telif davaları: güncel durum · Şirketiniz YZ içeriği kullanırken nelere dikkat etmeli? |
| Sektörel Uyum Gereklilikleri | `sektorel-uyum-gereklilikleri` | Bankacılık, sağlık ve kamu gibi sektörlerde YZ kullanımının hukuki gereklilikleri (teknik uygulamalar Sektör Uygulamaları'nda). | Bankacılıkta YZ: BDDK çerçevesi · Sağlık verisiyle YZ: özel nitelikli veri rejimi · Kamuda YZ kullanımının hukuki sınırları |

## Sektör Uygulamaları — `sektor-uygulamalari`

YZ'nin sektörlerde ve günlük işlerde uygulanması: üretim araçları, sektörel çözümler ve iş modelleri.

| Cluster | Slug | Kapsam | Örnek içerik |
|---|---|---|---|
| Görsel Üretim Araçları | `gorsel-uretim-araclari` | Midjourney, DALL-E ve benzeri araçlarla fotoğraf/resim üretim rehberleri (difüzyonun teknik tarafı Bilgisayarlı Görü'de). | Midjourney nedir, nasıl kullanılır? · Ücretsiz yapay zeka resim oluşturma siteleri: test edilmiş liste · Yapay zeka ile fotoğraf oluşturma: araç karşılaştırması |
| Video Üretim Araçları | `video-uretim-araclari` | Sora, Runway, Veo gibi YZ video üretim araçlarının rehber ve karşılaştırmaları. | Yapay zeka ile video oluşturma rehberi · Sora, Veo ve Runway karşılaştırması · Ürün tanıtım videosu üretme: adım adım |
| Ses & Müzik Üretimi | `ses-muzik-uretimi` | TTS, ses klonlama ve müzik üretim araçlarının rehberleri (kötüye kullanım ve tespit Güvenlik pillar'ında). | Yapay zeka ile seslendirme: araç rehberi · Suno ile müzik üretimi · Türkçe TTS karşılaştırması: örnek seslerle |
| İçerik & Pazarlama YZ'si | `icerik-pazarlama-yz` | Metin içerik üretimi, SEO ve pazarlama süreçlerinde YZ araçları ve iş akışları. | Yapay zeka ile blog içeriği üretimi: etik ve etkili yöntem · SEO için YZ kullanımı: neler işe yarıyor? · Sosyal medya içerik üretim iş akışı |
| YZ ile Gelir Modelleri | `yz-gelir-modelleri` | Yapay zeka ile para kazanma iddialarının gerçekçi, kaynaklı analizi ve uygulanabilir iş modelleri. | Yapay zeka ile para kazanma: gerçekçi 10 model · YZ hizmeti satan freelancer olmak · Para kazanma vaatlerinin eleştirel analizi |
| Chatbot & Müşteri Deneyimi | `chatbot-musteri-deneyimi` | İşletmeler için chatbot kavramı, kurulum rehberleri ve müşteri hizmetleri YZ'si. | Chatbot nedir? Tür ve kullanım haritası · İşletmeme chatbot nasıl kurarım? Uçtan uca rehber · WhatsApp chatbot kurulumu: çalışan örnek |
| Eğitimde Yapay Zeka | `egitimde-yapay-zeka` | Öğretmen, öğrenci ve kurumlar için YZ kullanım senaryoları ve araçları. | Eğitimde yapay zeka nasıl kullanılır? · Öğretmenler için YZ araç seti · Ödevde YZ kullanımı: politika örnekleri |
| Sağlıkta Yapay Zeka | `saglikta-yapay-zeka` | Sağlık sektöründe YZ uygulamaları ve vaka analizleri (hukuki gereklilikler Regülasyon'da). | Sağlıkta yapay zeka: güncel uygulama haritası · Tıbbi görüntülemede YZ: kanıta dayalı durum · Hastane süreçlerinde YZ otomasyonu |
| E-ticaret & Perakende YZ'si | `e-ticaret-perakende-yz` | E-ticarette öneri sistemleri, fiyatlama ve operasyon YZ'si uygulamaları. | E-ticarette yapay zeka: 8 uygulama alanı · Ürün öneri sistemi nasıl çalışır? · Türk e-ticaretinde YZ kullanımı: kaynaklı analiz |
| Finans & Bankacılık YZ'si | `finans-bankacilik-yz` | Bankacılık ve fintech'te YZ uygulamaları: dolandırıcılık tespiti, kredi skorlama, müşteri hizmetleri (mevzuat Regülasyon'da). | Bankacılıkta yapay zeka uygulama haritası · Dolandırıcılık tespitinde ML nasıl çalışır? · Türk bankalarının YZ asistanları: karşılaştırma |
| Üretim & Sanayi YZ'si | `uretim-sanayi-yz` | İmalat sanayiinde kestirimci bakım, kalite kontrol ve süreç optimizasyonu uygulamaları. | Kestirimci bakım nedir? Uygulama rehberi · Görüntü işlemeyle kalite kontrol hattı · KOBİ'ler için sanayide YZ başlangıç rehberi |

## Kariyer & Öğrenme — `kariyer-ogrenme`

YZ alanında kariyer, eğitim seçimi ve öğrenme yol haritaları; Türkiye pazarına özgü veriyle.

| Cluster | Slug | Kapsam | Örnek içerik |
|---|---|---|---|
| YZ Mühendisliği Bölümü | `yz-muhendisligi-bolumu` | Üniversitelerin yapay zeka mühendisliği bölümleri, taban puanları ve tercih rehberleri (YKS dönemi mevsimsel odak). | Yapay zeka mühendisliği taban puanları (güncel) · YZ mühendisliği mi bilgisayar mühendisliği mi? · YZ mühendisliği okutan üniversiteler karşılaştırması |
| Maaş & Pazar Verileri | `maas-pazar-verileri` | Türkiye'de YZ ve veri rollerinin maaş aralıkları ile iş pazarı verilerinin kaynaklı takibi. | Yapay zeka mühendisi maaşları: anket verisiyle · Veri bilimci maaşları Türkiye raporu · Yurt dışı remote YZ işleri: gerçekçi rehber |
| Öğrenme Patikaları | `ogrenme-patikalari` | Sıfırdan ileri seviyeye yapılandırılmış, sürümlü öğrenme yol haritaları. | Yapay zeka öğrenmek için nereden başlamalı? · Sıfırdan YZ mühendisi yol haritası · Yapay zeka için hangi programlama dili? |
| Kurs & Eğitim İncelemeleri | `kurs-egitim-incelemeleri` | Ücretli ve ücretsiz kursların ölçütlü inceleme ve karşılaştırmaları. | En iyi yapay zeka kursları: ölçütlü inceleme · Ücretsiz yapay zeka kursları: seçilmiş liste · Bootcamp'e değer mi? Mezun verisiyle analiz |
| Sertifika Rehberleri | `sertifika-rehberleri` | YZ ve veri sertifikalarının işe alımdaki gerçek karşılığının değerlendirilmesi. | Yapay zeka sertifikaları işe yarıyor mu? · Bulut YZ sertifikaları karşılaştırması · Sertifika mı portföy mü? İşe alım verisiyle |
| YZ Meslek Rolleri | `yz-meslek-rolleri` | ML mühendisi, veri bilimci, prompt mühendisi gibi rollerin görev tanımı ve gereksinimleri. | Yapay zeka mühendisi nasıl olunur? · ML mühendisi ile veri bilimci farkı · Prompt mühendisi nasıl olunur, gelecek vaat ediyor mu? |
| Mülakat Hazırlığı | `mulakat-hazirligi` | YZ/ML pozisyonları için mülakat soruları, teknik değerlendirme ve hazırlık stratejileri. | ML mülakat soruları: 50 soru-cevap · LLM mühendisi mülakatında ne sorulur? · Take-home ödev stratejileri |
| Portföy Projeleri | `portfoy-projeleri` | İşe alımda fark yaratan, çalışan repo'lu portföy proje fikirleri ve kurgulama rehberleri. | İşe aldıran 10 YZ portföy projesi · GitHub portföyü nasıl kurgulanır? · Portföy projesi seçiminde yapılan hatalar |
| Kariyer Geçişi | `kariyer-gecisi` | Başka alanlardan YZ'ye geçiş stratejileri ve gerçek geçiş hikayeleri. | Yazılımcıdan ML mühendisine geçiş · Teknik olmayan alandan YZ kariyerine: gerçekçi yol · 30'undan sonra alan değiştirmek: vaka anlatıları |

