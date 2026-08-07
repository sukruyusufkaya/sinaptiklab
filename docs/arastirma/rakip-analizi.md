# Rakip Analizi — Faz 0 Araştırma Çıktısı

> Üretim: 2026-08-08, 13 ajanlı arka plan taraması (22 site fiilen çekilerek incelendi). Ham site verisi: [rakip-ham-veri.json](rakip-ham-veri.json)

## Rakip Karşılaştırma Tablosu

| Site | Pazar | Kategori | İçerik Derinliği | Şema/JSON-LD | GEO Yüzeyleri | E-E-A-T | En Büyük Zayıflık |
|---|---|---|---|---|---|---|---|
| webrazzi.com | TR | Haber | Kod yok; ~650-700 kelime, linkli kaynaklı haber aktarımı | NewsArticle+Person+Org+WebSite (Breadcrumb yok) | llms.txt yok; AI botlarına bilinçli Allow | Gerçek yazar + profil; bio/unvan yok | Teknik derinlik sıfır |
| shiftdelete.net | TR | Haber | ~420 kelime; kod yok; linksiz "kaynaklara göre" atıf | En kapsamlı TR seti: NewsArticle+Person+Breadcrumb+Org | llms.txt var (Yoast oto); ama ai-train=no, ai-input=no | Dolu yazar profilleri; teknik otorite zayıf | Çelişkili AI sinyali + atıfsız içerik |
| technopat.net | TR | Topluluk | Tespit edilemedi (tüm sayfalar 403) | Tespit edilemedi | Tüm AI botlarına Disallow + Cloudflare engeli | Tespit edilemedi | GEO kanalını bilinçli kapatmış |
| donanimhaber.com | TR | Haber | Kod yok; haber sonu dış link/DOI pratiği var | Tespit edilemedi | llms.txt yok (404); AI botları fiilen serbest | Güçlü: unvanlı, biyolu editör sayfaları | İçerik çeviri-haber seviyesinde |
| webtekno.com | TR | Haber | Kod yok; isimle atıf var ama link yok | Çok zengin: NewsArticle+Speakable+Rating+Person(jobTitle) | llms.txt yok; GPTBot Allow, ai-input=yes | Şemada güçlü; profilde bio/uzmanlık yok | YZ kategorisi (61+ sayfa) tamamen tüketici haberi |
| teknoblog.com | TR | Haber | Kod yok; dış kaynağa doğrudan link var | NewsArticle+Person(sameAs)+Org+Speakable | llms.txt VAR + atıf-şartlı AI politikası | Gerçek bio + sosyal profiller | Güncelleme tarihi yok; evergreen varlık yok |
| egirisim.com | TR | Haber | Basın bülteni formatı; dış kaynak linki sıfır | BlogPosting (haberde NewsArticle değil) | llms.txt yok (404); bot kuralı tanımsız | Kurucu-editör kimliği sağlam; tek yazar | Kaynaksız haber + tek yazar bağımlılığı |
| evrimagaci.org | TR | Eğitim | Kaynakça+arşiv linki güçlü; kod yok | Tespit edilemedi (ham HTML'de JSON-LD yok) | llms.txt çok kapsamlı; ama bot UA'lara 403 | Emsalsiz güven mimarisi (editör, politika, etiket) | Bot engeli GEO hedefiyle çelişiyor |
| bthaber.com | TR | Haber | ~450 kelime PR aktarımı; linksiz sayılar | Tespit edilemedi | llms.txt yok; tüm büyük AI botları engelli | Yazar imzası yok; künye şeffaf | AI'ya kapalı + yazarsız, sığ içerik |
| log.com.tr | TR | Haber | 1-2 paragraf derleme; kısmi kaynak linki | Tespit edilemedi | llms.txt yok (404); AI botları serbest | İmza var; bio/unvan yok | Derinlik çok düşük + etiket spam görünümü |
| towardsdatascience.com | Global | Teknik yayın | Kod var (~8-10 blok); dış atıf sıfıra yakın | Tam Yoast grafı (Article+Person+Breadcrumb) | llms.txt yok; TÜM AI botları engelli | Yazar sayfaları boş (bio/link yok) | GEO'dan bilinçli çekilmiş |
| huggingface.co | Global | Kurumsal blog | Kod + companion repo + References standardı | SocialMediaPosting (Article/TechArticle değil) | llms.txt yok; robots tam açık + RSS | Çok yazarlı gerçek kimlik + upvote doğrulaması | TR çevirileri gönüllü/yarım; şema tipi zayıf |
| simonwillison.net | Global | Teknik yayın | Kod + 50+ linkli atıf; tamamen birinci elden | JSON-LD yok (grep 0) | llms.txt yok (404); botlara açık | Otorite içerik + site dışı itibardan | Yapılandırılmış veri ve öğrenme patikası yok |
| eugeneyan.com | Global | Teknik yayın | 50+ tam künyeli akademik atıf; kod bloğu yok | JSON-LD yok (grep 0) | llms.txt yok (404); robots tam açık | Unvan+işveren açık; BibTeX "cite this" | Tazelik düşük; çalıştırılabilir kod/repo yok |
| lilianweng.github.io | Global | Teknik yayın | 24 kaynaklı literatür sentezi; kod yok | Tespit edilemedi | llms.txt yok (404); robots tam açık, lastmod'lu sitemap | Bio sayfası yok; otorite site dışından | Site içi E-E-A-T ve şema minimal |
| latent.space | Global | Teknik yayın | İlk elden hands-on içerik; sistematik kaynakça yok | Tespit edilemedi | llms.txt yok (404); news_sitemap var | Unvanlı çok yazar + ağır konuk ağı | Taksonomi yok, arşiv keşfi zayıf |
| pinecone.io/learn | Global | Kurumsal blog | Kod ve repo YOK; yeni içerikte akademik atıf | Article+Person+Org+WebPage | llms.txt VAR + 2 MCP sunucusu ("For Agents") | İsim+foto var; bio/unvan/yazar sayfası yok | Cornerstone içerik 2023'te donmuş |
| neptune.ai/blog | Global | Kurumsal blog | Gözlemlenemedi (site yayından kalktı) | Tespit edilemedi | Tüm URL'ler openai.com'a 308 | Gözlemlenemedi | Külliyat satın almayla tek kararda yok oldu |
| evidentlyai.com/blog | Global | Kurumsal blog | Özgün deney + Colab/GitHub + arXiv; çift tarih | Tespit edilemedi (JSON-LD izi yok) | llms.txt yok (404); RSS görünmüyor | Unvanlı yazarlar + /authors/ sayfaları | İçerik mükemmel, teknik GEO yüzeyi boş |
| deeplearning.ai (The Batch) | Global | Haber | Kod yok; her iddiada birincil kaynak linki | Tespit edilemedi | llms.txt yok; cevap botlarına izin / eğitim botlarına blok | Kurumsal otorite güçlü; bireysel imza yok | Yazarsız haberler; "nasıl yapılır" kurslara kilitli |
| magazine.sebastianraschka.com | Global | Teknik yayın | Özgün diyagram + arXiv atıf; kod repo'da (LLMs-from-scratch) | Tespit edilemedi (Substack) | llms.txt yok (404); tam metinli RSS | Ders kitabı düzeyi bireysel kimlik (PhD, kitap yazarı) | Düz arşiv, tek yazar, Substack kısıtları |

Notlar: shiftdelete.net iki ayrı turda analiz edildi (ikincisi technopat.net ikamesi olarak); tablo iki analizin birleşimidir. technopat.net ve neptune.ai/blog erişilemedi — hücreleri fiilen gözlenebilenlerle sınırlıdır. evidentlyai.com/blog, neptune.ai ikamesidir.

## TR Pazarı Boşluk Haritası

| Ortak TR Açığı | Kanıt (veriden) | Sinaptiklab'ın Cevabı |
|---|---|---|
| Kod, tutorial, çalışan repo sıfır | İncelenen 10 TR sitesinin hiçbirinde kod bloğu gözlenmedi; DH ve LOG'un "Nasıl Yapılır" kategorileri bile kodsuz | "Her tutorial çalışan repo ile" — TR'de fiilen rakipsiz katman |
| Linksiz/zayıf atıf kültürü | shiftdelete, webtekno, bthaber, egirisim: iddialar linksiz; kısmen iyi olanlar (webrazzi, DH, teknoblog) bile yapılandırılmış kaynakça kullanmıyor | Her iddiada zorunlu, tıklanabilir sources[] + makale sonu yapılandırılmış kaynakça bloğu |
| Güncelleme tarihi ve sürümleme yok | Görünür güncelleme tarihi yalnız evrimagaci.org ve webtekno'da gözlendi; changelog/sürüm hiçbir sitede yok | Sürümlü içerik: "vX.Y, şu tarihte şu sürümle test edildi" + görünür değişiklik günlüğü |
| Yazar otoritesi eksik | bthaber ve The Batch tarzı imzasızlık; LOG/webrazzi'de imza var bio yok; DH tek güçlü istisna | Unvan + bio + sosyal kanıt + teknik editör onayı + Person/sameAs şeması |
| GEO yüzeyi zayıf veya çelişkili | llms.txt sadece 2 TR sitede (shiftdelete: Yoast oto + çelişkili ai-input=no; teknoblog: küratörlü); technopat ve bthaber tüm AI botlarını engelliyor | Küratörlü llms.txt + açık "YZ asistanları alıntılayabilir" politika sayfası + sayfa başına .md çıktı |
| Kanonik sözlük / öğrenme patikası yok | Sözlük+akademi modeli yalnız evrimagaci'de ve popüler bilim alanında; teknik alanda hiçbir emsalde yok | Kanonik Türkçe YZ sözlüğü (DefinedTerm şemalı) + seviyeli öğrenme patikaları |
| KVKK/regülasyon dikeyi boş | DH analizinde açık not: "KVKK/regülasyon dosyası benzeri hiçbir şey yok" | KVKK/regülasyon dosyaları — sahipsiz dikeyin ilk sahibi olmak |
| Özgün saha verisi yok | TR haber içeriği ağırlıkla yabancı kaynak aktarımı (webrazzi, DH, teknoblog, LOG); özgün deney/benchmark hiçbirinde yok | Türkiye'ye özgü test/ölçüm içerikleri (ör. Türkçe LLM değerlendirmeleri) — "saha verisi, uydurma yok" |
| Şema derinliği haberde takılı | En iyiler NewsArticle seviyesinde; egirisim haberde BlogPosting kullanıyor; DefinedTerm/HowTo/FAQ hiçbir emsalde yok | Gün 1'de tam graf (TechArticle+Person+Org+Breadcrumb), üstüne DefinedTerm/HowTo/FAQ ile fark |

## Global Emsallerden Alınacak Desenler

1. **Citation bloğu (eugeneyan.com, lilianweng.github.io):** Her makaleye Türkçe "Bu yazıya atıf" bloğu (APA + BibTeX); maliyeti sıfır, akademik ve LLM atıf akışını aynı anda besliyor. → Faz 1 (içerik şablonuna gömülü).
2. **Görünür güncelleme politikası (lilianweng.github.io):** Eski yazılar periyodik güncellenir, değişiklikler işaretlenir + sitemap'te lastmod; Sinaptiklab bunu changelog bileşeniyle sistemleştirmeli. → Faz 1.
3. **Sabit editoryal şablon (The Batch):** "What's new / How it works / Why it matters" kalıbının Türkçe kanoniği: "Ne oldu / Nasıl çalışıyor / Neden önemli / Kaynaklar" — hem okunabilirlik hem LLM çıkarımı için öngörülebilir yapı. → Faz 1.
4. **Çift tarih pratiği (evidentlyai.com):** "Published + Last updated" birlikte, hem sayfada hem listelerde; sürüm notuyla birleştirilerek bir adım öteye taşınır. → Faz 1.
5. **Yazar sayfası modeli (magazine.sebastianraschka.com):** Gerçek isim + unvan + doğrulanabilir geçmiş + yayın listesi; çok yazarlı + teknik editör katmanıyla ölçeklenerek tek-yazar riski aşılır. → Faz 1.
6. **Seri/chapter URL mimarisi (pinecone.io/learn):** /series/[patika]/[bolum] şeması öğrenme patikalarının doğrudan şablonu; küratörlü llms.txt ile birlikte kurulmalı (MCP tarzı "For Agents" yüzeyi sonraya). → llms.txt+patika URL'leri Faz 1, MCP Faz 3.
7. **Özgün deney formatı (evidentlyai.com):** "X yöntemi Y veri setinde karşılaştırdık, defterler burada" — Colab/GitHub bağlantılı, alıntılanma mıknatısı; Türkçe'de hiç yapılmıyor. → Faz 2.
8. **Entry/link/quote/note tipolojisi (simonwillison.net):** Günlük Türkçe YZ link-blog'u + kısa notlar; sık yayınla tazelik sinyali üretir, küçük alıntılanabilir birimler GEO'yu besler. → Faz 2.
9. **Sayı numaralı haftalık bülten (The Batch issue-NNN) + news_sitemap (latent.space):** Kalıcı URL'li, kaynaklı Türkçe haftalık YZ bülteni; haber üreteceksek Google News sitemap ilk günden. → Faz 2.
10. **Ekosistem katmanı (latent.space, huggingface.co):** Türkçe Paper Club / okuma grubu + resmi/topluluk içerik ayrımı ve upvote modeli; bağlılık üretir ama editoryal yükü büyük — MVP'ye değil yol haritasına. → Faz 3.

## Stratejik Sonuç

1. **Tez doğrulanıyor:** İncelenen 10 TR sitesinin hiçbirinde kod bloğu, çalışan repo, sürümlü içerik veya kanonik teknik sözlük yok; YZ tamamen haber/tüketici formatında işleniyor. "Kod + kaynak + sürüm" üçlüsü TR pazarında fiilen rakipsiz alan.
2. **GEO boşluğu gerçek ve iki taraflı:** TR'nin en güçlü teknik topluluğu (technopat) ve kurumsal BT yayını (bthaber) AI botlarını bilinçli engelliyor; globalde TDS aynı yolu seçmiş. Buna karşın llms.txt'i küratörlü yapan TR sitesi yalnız teknoblog — açık robots + küratörlü llms.txt + .md çıktı kombinasyonu hâlâ kimsede yok.
3. **Risk 1 — soğuk başlangıç/otorite:** Willison ve Weng örnekleri asıl GEO kaldıracının teknik yüzey değil yıllarla birikmiş içerik otoritesi olduğunu gösteriyor; Sinaptiklab'ın hazır itibarı yok, şema+llms.txt tek başına atıf getirmez — derin içerik üretim temposu sürdürülmek zorunda.
4. **Risk 2 — bakım yükü:** Sürümlü içerik + çalışan repo vaadi kalıcı operasyon maliyeti demek; Pinecone'un 2023'te donan cornerstone'ları ve HF kurslarındaki 2022 atıf metadatası, bu vaadin tutturulamadığında nasıl göründüğünün kanıtı. Vaat edilen her sayfa bakım sözleşmesidir.
5. **Risk 3 — pencerenin daralması:** llms.txt'i bir TR sitesi zaten yayınladı (teknoblog), webtekno/webrazzi bilinçli bot politikaları kurdu; GEO farkındalığı TR'de başladı. Ayrıca kapalı duran büyük oyuncular (technopat, bthaber) politikalarını tek satırla açabilir — Sinaptiklab'ın avantajı yüzeyde değil, taklidi aylar süren içerik sözleşmesinde (repo, deney, sözlük, KVKK dikeyi) kalıcılaşmalı.
