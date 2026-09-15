import type { AtlasGirdisi } from '@/lib/tipler';

/**
 * ÖRNEK VERİ — yer tutucu.
 *
 * Atlas'ın uygulama katmanı: bir sistemi üretime alırken karar verilmesi
 * gereken kavramlar. Temel katmandan (bkz. `atlas-temel.ts`) farkı, her
 * girdinin bir mühendislik kararına karşılık gelmesi.
 *
 * Sayısal örnekler TEMSİLÎ'dir; ölçüm olarak alıntılanamaz.
 */

export const ATLAS_UYGULAMA: AtlasGirdisi[] = [
  /* ---------------------------------------------------------------------- */
  {
    slug: 'chunking',
    ad: 'Chunking',
    altAd: 'Parçalama',
    kategori: 'Large Language Models',
    kisaTanim:
      'Bir belgeyi, aranabilir ve bağlama sığacak anlamlı birimlere bölme işlemidir; geri getirme kalitesini belirleyen ilk karardır.',
    seviye: 'orta',
    ilgili: ['RAG', 'Embedding', 'Reranking', 'Vector Database'],
    onkosullar: ['Embedding'],
    sonDogrulama: '2026-09-05',
    yayinTarihi: '2026-06-18',
    yazarSlug: 'sukru-yusuf-kaya',
    govde: [
      {
        tip: 'kisa-cevap',
        metin:
          'Parçalama, RAG hattında en çok ihmal edilen ve kaliteyi en çok belirleyen adımdır. Doğru soru "ideal parça uzunluğu kaç token" değil, "bu belge türünde anlamın kendi içinde tamamlandığı en küçük birim nedir" sorusudur.',
      },
      { tip: 'altbaslik', metin: 'İki yönlü baskı', kimlik: 'baski' },
      {
        tip: 'paragraf',
        metin:
          'Parça küçüldükçe arama isabeti artar, bağlam eksilir: model doğru cümleyi bulur ama hangi koşulda geçerli olduğunu bilmez. Parça büyüdükçe bağlam tamamlanır, arama bulanıklaşır: parça çok konudan söz ettiği için gömme vektörü ortalamaya kaçar.',
      },
      { tip: 'altbaslik', metin: 'Yöntemler', kimlik: 'yontemler' },
      {
        tip: 'tablo',
        basliklar: ['Yöntem', 'Nasıl böler', 'Uygun olduğu yer'],
        satirlar: [
          ['Sabit uzunluk', 'Belirli token sayısında keser', 'Yapısı olmayan ham metin'],
          ['Özyinelemeli', 'Paragraf → cümle → kelime sırasıyla dener', 'Uzun makale ve rapor'],
          ['Yapısal', 'Başlık, madde veya slayt sınırından böler', 'Mevzuat, dokümantasyon, sunum'],
          ['Satır bazlı', 'Tablo satırı + başlık satırı', 'Elektronik çizelge, katalog'],
          ['Diyalog', 'Soru-cevap çifti', 'Destek kaydı, sohbet dökümü'],
          ['Anlamsal', 'Cümle benzerliği düştüğünde böler', 'Konu geçişi belirsiz uzun metinler'],
        ],
        aciklama: 'Yapısı olan belgelerde yapısal bölme neredeyse her zaman öne geçer.',
      },
      { tip: 'altbaslik', metin: 'Üst veri: parçanın künyesi', kimlik: 'ust-veri' },
      {
        tip: 'paragraf',
        metin:
          'Bir parça yalnızca metinden oluşmaz. Başlık yolu, belge sürümü, yürürlük tarihi ve erişim grubu parçayla birlikte saklanmalı. Erişim grubu üst veride yoksa sistem, kullanıcının görmemesi gereken belgeyi cevaba karıştırabilir.',
      },
      {
        tip: 'liste',
        ogeler: [
          'Başlık yolu: parçanın belgedeki yeri; önek olarak metne de eklenebilir.',
          'Sürüm ve yürürlük: eski sürümün cevaba karışmasını engeller.',
          'Erişim grubu: yetki filtresi arama sorgusunun parçası olmalı.',
          'Kaynak bağlantısı: cevapta atıf verebilmek için gerekli.',
          'Dil: çok dilli setlerde yanlış dilde parça dönmesini engeller.',
        ],
      },
      {
        tip: 'uyari',
        ton: 'dikkat',
        metin:
          'Tablo parçalarında başlık satırını her parçaya kopyalamazsanız, model sayıları hangi kolona ait olduğunu bilemez ve kendinden emin biçimde yanlış okur.',
      },
      { tip: 'altbaslik', metin: 'Teşhis', kimlik: 'teshis' },
      {
        tip: 'liste',
        ogeler: [
          'Doğru belge, yanlış bölüm geliyor → parça çok büyük.',
          'Hiçbir şey gelmiyor → parça çok küçük veya başlık öneki eksik.',
          'Cevap yarım kalıyor → bilgi iki parçaya bölünmüş; örtüşme veya yapısal bölme gerekli.',
          'Eski bilgi geliyor → üst veride sürüm ve yürürlük filtresi yok.',
        ],
      },
    ],
    sss: [
      {
        soru: 'Örtüşme (overlap) şart mı?',
        cevap:
          'Yapısal bölme yapıyorsanız çoğu durumda gerekmez; madde ve başlık sınırları doğal kesim noktalarıdır. Sabit uzunlukta bölmede sınıra düşen bilgiyi kurtarmak için kullanılır.',
      },
      {
        soru: 'Aynı belgeyi iki farklı parçalamayla dizinlemek mantıklı mı?',
        cevap:
          'Bazı kurulumlarda evet: kısa parçalar arama isabeti, uzun parçalar bağlam için tutulur ve eşleşen kısa parçanın ait olduğu uzun parça bağlama konur. Depolama maliyetini artırır.',
      },
    ],
    surumler: [{ surum: 'v1.0', tarih: '2026-06-18', degisiklik: 'İlk yayın.' }],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'reranking',
    ad: 'Reranking',
    altAd: 'Yeniden sıralama',
    kategori: 'Large Language Models',
    kisaTanim:
      'Arama adımından dönen ilk adayların, sorgu ve belgeyi birlikte okuyan daha maliyetli bir modelle yeniden puanlanıp sıralanmasıdır.',
    seviye: 'ileri',
    ilgili: ['RAG', 'Semantic Search', 'Embedding'],
    onkosullar: ['Embedding', 'RAG'],
    sonDogrulama: '2026-09-06',
    yayinTarihi: '2026-07-02',
    yazarSlug: 'sinaptik-research',
    govde: [
      {
        tip: 'kisa-cevap',
        metin:
          'Yeniden sıralama, iki aşamalı arama mimarisinin ikinci aşamasıdır: hızlı bir yöntemle geniş bir aday kümesi toplanır, sonra pahalı ama isabetli bir model yalnızca bu adaylar üzerinde çalışır.',
      },
      { tip: 'altbaslik', metin: 'Bi-encoder ve cross-encoder', kimlik: 'encoder' },
      {
        tip: 'tablo',
        basliklar: ['Boyut', 'Bi-encoder (gömme)', 'Cross-encoder (yeniden sıralayıcı)'],
        satirlar: [
          [
            'Nasıl çalışır',
            'Sorgu ve belge ayrı ayrı vektörleşir',
            'Sorgu ve belge birlikte okunur',
          ],
          [
            'Ön hesaplama',
            'Belge vektörleri önceden üretilir',
            'Mümkün değil; her çift anlık hesaplanır',
          ],
          ['Hız', 'Milyonlarca belgede milisaniyeler', 'Aday başına model çağrısı'],
          ['İsabet', 'İyi', 'Belirgin daha iyi'],
          ['Ölçek', 'Tüm dizin', 'Yalnızca ilk 20-100 aday'],
        ],
        aciklama: 'İkisi alternatif değil; ardışık iki aşamadır.',
      },
      { tip: 'altbaslik', metin: 'Ne zaman değer katar?', kimlik: 'ne-zaman' },
      {
        tip: 'liste',
        ogeler: [
          'Aday kümesinde doğru parça var ama ilk sıralarda değil: en net kazanç durumu.',
          'Sorgular uzun ve çok kısıtlı: gömme, kısıtların tümünü temsil etmekte zorlanır.',
          'Bağlam bütçesi dar: isteme az parça koyulacaksa sıralamanın kalitesi kritik hale gelir.',
          'Çok kaynaklı dizin: farklı kaynakların puanlarını ortak bir ölçekte kıyaslamak gerekir.',
        ],
      },
      {
        tip: 'uyari',
        ton: 'bilgi',
        metin:
          'Yeniden sıralayıcı, aday kümesinde olmayan belgeyi bulamaz. İlk aşamanın geri çağırma oranı düşükse, yeniden sıralama kayıp bilgiyi geri getirmez.',
      },
      { tip: 'altbaslik', metin: 'Ölçüm ve maliyet', kimlik: 'olcum' },
      {
        tip: 'paragraf',
        metin:
          'Etkisi iki metrikle birlikte raporlanmalı: ilk k sonuçtaki ilgili oranı ve kuyruk gecikmesi. Aday sayısı arttıkça isabet artar ama gecikme doğrusal büyür; üretim kararı bu iki eğrinin kesiştiği yerde verilir. Etkileşimli arayüzlerde birleşik sonucu hemen gösterip yeniden sıralamayı arka planda tamamlamak pratik bir uzlaşma.',
      },
    ],
    sss: [
      {
        soru: 'Kaç aday yeniden sıralanmalı?',
        cevap:
          'Tipik başlangıç 20-50 aday. Kararı iki ölçümün kesişiminde verin: aday sayısını artırmak ilk-k ilgili oranını ne kadar yükseltiyor ve p95 gecikmeyi ne kadar büyütüyor?',
      },
      {
        soru: 'Yeniden sıralama yerine daha iyi bir gömme modeli yeterli olmaz mı?',
        cevap:
          'Kısmen yardımcı olur ama farklı bir sınırı vardır: gömme modeli sorgu ile belgeyi ayrı ayrı okur, cross-encoder birlikte okur. Bu yapısal fark, gömme kalitesiyle tam olarak kapanmıyor.',
      },
    ],
    surumler: [{ surum: 'v1.0', tarih: '2026-07-02', degisiklik: 'İlk yayın.' }],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'semantic-search',
    ad: 'Semantic Search',
    altAd: 'Anlamsal arama',
    kategori: 'NLP',
    kisaTanim:
      'Kelime eşleşmesi yerine anlam yakınlığına dayanarak sonuç döndüren arama yaklaşımıdır; gömme vektörleri arasındaki mesafeyle ölçülür.',
    seviye: 'orta',
    ilgili: ['Embedding', 'Vector Database', 'Reranking', 'RAG'],
    onkosullar: ['Embedding'],
    sonDogrulama: '2026-09-02',
    yayinTarihi: '2026-06-05',
    yazarSlug: 'sinaptik-research',
    govde: [
      {
        tip: 'kisa-cevap',
        metin:
          'Anlamsal arama, "fatura" arayan kullanıcıya "irsaliye" içeren belgeyi de getirebilir; çünkü eşleşmeyi kelimede değil anlam uzayında kurar. Karşılığında kesin terimleri, kodları ve olumsuzluğu ayırt etmekte zayıftır.',
      },
      { tip: 'altbaslik', metin: 'Lexical arama ile karşılaştırma', kimlik: 'karsilastirma' },
      {
        tip: 'tablo',
        basliklar: ['Sorgu tipi', 'Anlamsal', 'Lexical', 'Hibrit'],
        satirlar: [
          ['Kavramsal soru', 'Güçlü', 'Zayıf', 'Güçlü'],
          ['Kesin kod veya numara', 'Zayıf', 'Güçlü', 'Güçlü'],
          ['Eş anlamlı terim', 'Güçlü', 'Zayıf', 'Güçlü'],
          ['Olumsuzluk içeren sorgu', 'Zayıf', 'Zayıf', 'Orta'],
          ['Yazım hatalı sorgu', 'Orta', 'Zayıf', 'Orta'],
          ['Nadir özel ad', 'Orta', 'Güçlü', 'Güçlü'],
        ],
        aciklama: 'Niteliksel eğilim tablosu; kendi sorgu günlüğünüzle doğrulayın.',
      },
      { tip: 'altbaslik', metin: 'Yaklaşık en yakın komşu', kimlik: 'ann' },
      {
        tip: 'paragraf',
        metin:
          'Milyonlarca vektörde tam en yakın komşuyu bulmak pahalıdır. Üretim sistemleri yaklaşık en yakın komşu (ANN) algoritmaları kullanır: küçük bir isabet kaybı karşılığında aramayı çok hızlandırır. Bu bir ayar ekseni yaratır; geri çağırma ile gecikme arasındaki dengeyi siz belirlersiniz.',
      },
      {
        tip: 'uyari',
        ton: 'bilgi',
        metin:
          'ANN parametrelerini sıkılaştırmak gecikmeyi düşürür ama sessizce geri çağırmayı da düşürür. Değişikliği ölçmeden uygulamak, arama kalitesinde fark edilmeyen kayba yol açar.',
      },
      { tip: 'altbaslik', metin: 'Kurulum kontrol listesi', kimlik: 'kontrol' },
      {
        tip: 'liste',
        sirali: true,
        ogeler: [
          'Gömme modelini Türkçe performansı ölçülmüş biçimde seçin.',
          'Yetki ve tarih filtrelerini arama sorgusuna gömün, sonradan uygulamayın.',
          'Lexical katmanı ilk günden ekleyin; kesin terimler kaçınılmaz olarak gelecek.',
          'Değerlendirme seti kurun: 20 sorgu, işaretlenmiş doğru parçalar.',
          'Boş dönüş oranını izleyin; içerik açığı panosunun girdisidir.',
        ],
      },
    ],
    sss: [
      {
        soru: 'Anlamsal arama klasik aramayı tamamen değiştirir mi?',
        cevap:
          'Hayır. Kurumsal belge setlerinde kesin terim, kod ve kısaltma sorguları kaçınılmazdır; bu yüzden pratikte hibrit kurulum varsayılan hâle geliyor.',
      },
      {
        soru: 'Vektör veritabanı şart mı?',
        cevap:
          'Küçük ölçekte ilişkisel veya doküman veritabanının vektör eklentileri yeterli olabilir. Ayrı bir vektör veritabanı, ölçek ve filtreli arama ihtiyaçları büyüdüğünde anlam kazanır.',
      },
    ],
    surumler: [{ surum: 'v1.0', tarih: '2026-06-05', degisiklik: 'İlk yayın.' }],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'function-calling',
    ad: 'Function Calling',
    altAd: 'Araç çağırma',
    kategori: 'AI Agents',
    kisaTanim:
      'Modelin serbest metin yerine, verilen şemaya uygun yapılandırılmış bir çağrı üretmesi ve uygulamanın bu çağrıyı gerçek bir fonksiyona bağlamasıdır.',
    seviye: 'orta',
    ilgili: ['AI Agent', 'MCP', 'Prompt Engineering'],
    onkosullar: ['LLM'],
    sonDogrulama: '2026-09-08',
    yayinTarihi: '2026-05-30',
    guncellemeTarihi: '2026-09-08',
    yazarSlug: 'sukru-yusuf-kaya',
    govde: [
      {
        tip: 'kisa-cevap',
        metin:
          'Araç çağırmada model kodu çalıştırmaz; hangi fonksiyonun hangi parametrelerle çağrılması gerektiğini söyleyen yapılandırılmış bir çıktı üretir. Çağrıyı yapan, sonucu doğrulayan ve modele geri veren uygulamadır.',
      },
      { tip: 'altbaslik', metin: 'Döngü', kimlik: 'dongu' },
      {
        tip: 'akis',
        adimlar: [
          {
            ad: 'Şema',
            aciklama: 'Uygulama, kullanılabilir araçları ad ve parametre şemasıyla bildirir.',
          },
          {
            ad: 'Karar',
            aciklama:
              'Model, gerekiyorsa bir araç çağrısı üretir; gerekmiyorsa doğrudan cevap verir.',
          },
          { ad: 'Doğrulama', aciklama: 'Uygulama çağrıyı şemaya ve yetkiye göre denetler.' },
          { ad: 'Yürütme', aciklama: 'Fonksiyon çalıştırılır, sonuç alınır.' },
          {
            ad: 'Geri besleme',
            aciklama: 'Sonuç veya hata, modele yapılandırılmış biçimde döner.',
          },
          {
            ad: 'Kapanış',
            aciklama: 'Model sonucu kullanarak cevabı yazar veya yeni bir çağrı üretir.',
          },
        ],
      },
      { tip: 'altbaslik', metin: 'Şema kalitesi sonucu belirler', kimlik: 'sema' },
      {
        tip: 'liste',
        ogeler: [
          'Ayırt edici ad: "ara" değil "musteri_kaydi_ara".',
          'Seçim ölçütü içeren açıklama: aracın ne yaptığı değil, ne zaman kullanılacağı yazılır.',
          'Kapalı değer kümesi: mümkün olan her yerde enum kullanın.',
          'Biçim kısıtı: kimlik ve tarih alanlarına desen (pattern) verin.',
          'Zorunluluk: required ve additionalProperties: false eksik bırakılmamalı.',
        ],
      },
      {
        tip: 'kod',
        dil: 'json',
        metin: `{
  "name": "izin_talebi_olustur",
  "description": "Çalışan için yıllık izin talebi oluşturur. Talep ONAYA DÜŞER, doğrudan onaylanmaz.",
  "parameters": {
    "type": "object",
    "properties": {
      "calisan_no": { "type": "string", "pattern": "^[0-9]{6}$" },
      "baslangic": { "type": "string", "format": "date" },
      "gun_sayisi": { "type": "integer", "minimum": 1, "maximum": 30 },
      "tur": { "type": "string", "enum": ["yillik", "mazeret", "ucretsiz"] }
    },
    "required": ["calisan_no", "baslangic", "gun_sayisi", "tur"],
    "additionalProperties": false
  }
}`,
      },
      {
        tip: 'uyari',
        ton: 'dikkat',
        metin:
          'Şema bir güvenlik sınırı değildir; model onu görür ve göz ardı edebilir. Yetki ve sınır denetimi fonksiyonun içinde, sunucu tarafında yapılmalı.',
      },
      { tip: 'altbaslik', metin: 'Sık görülen arızalar', kimlik: 'arizalar' },
      {
        tip: 'tablo',
        basliklar: ['Arıza', 'Belirti', 'Çözüm'],
        satirlar: [
          [
            'Yanlış araç seçimi',
            'İki aracın açıklaması örtüşüyor',
            'Açıklamalara seçim ölçütü yazmak, aracı birleştirmek',
          ],
          [
            'Uydurulmuş parametre',
            'Şemada olmayan alan gelir',
            'additionalProperties: false ve kod tarafında doğrulama',
          ],
          [
            'Sonsuz döngü',
            'Aynı çağrı tekrarlanır',
            'Deneme sayısını sınırlamak, hata mesajına yön vermek',
          ],
          [
            'Eksik zorunlu alan',
            'Model alanı boş bırakır',
            'required bildirmek ve hata mesajında alanı söylemek',
          ],
        ],
        aciklama: 'Dört arızanın da çözümü model değiştirmek değil, sözleşmeyi netleştirmek.',
      },
    ],
    sss: [
      {
        soru: 'Model fonksiyonu kendisi mi çalıştırıyor?',
        cevap:
          'Hayır. Model yalnızca çağrı niyetini yapılandırılmış biçimde üretir; çalıştırma, doğrulama ve yetki kontrolü uygulamanın sorumluluğundadır.',
      },
      {
        soru: 'Function calling ile MCP arasındaki fark nedir?',
        cevap:
          'Araç çağırma, model ile uygulama arasındaki çıktı biçimidir. MCP ise araç ve veri kaynaklarının istemciden bağımsız tanımlanmasını sağlayan bir protokoldür; aynı aracı farklı istemcilerin kullanabilmesini amaçlar.',
      },
    ],
    surumler: [
      { surum: 'v1.1', tarih: '2026-09-08', degisiklik: 'Arıza tablosu ve şema örneği eklendi.' },
      { surum: 'v1.0', tarih: '2026-05-30', degisiklik: 'İlk yayın.' },
    ],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'guardrails',
    ad: 'Guardrails',
    altAd: 'Koruma bantları',
    kategori: 'AI Security',
    kisaTanim:
      'Bir yapay zekâ sisteminin girdi, çıktı ve eylem katmanlarına yerleştirilen, istenmeyen davranışı sınırlayan programatik denetimlerdir.',
    seviye: 'orta',
    ilgili: ['Prompt Injection', 'Responsible AI', 'Evaluation'],
    onkosullar: ['LLM'],
    sonDogrulama: '2026-09-07',
    yayinTarihi: '2026-07-14',
    yazarSlug: 'sukru-yusuf-kaya',
    govde: [
      {
        tip: 'kisa-cevap',
        metin:
          'Koruma bantları, modelin iyi niyetine bırakılmayan denetimlerdir. Sistem isteminde "şunu yapma" yazmak bir tercih beyanıdır; koruma bandı ise yapılmasını teknik olarak engelleyen bir katmandır.',
      },
      { tip: 'altbaslik', metin: 'Üç katman', kimlik: 'katmanlar' },
      {
        tip: 'tablo',
        basliklar: ['Katman', 'Ne denetler', 'Örnek'],
        satirlar: [
          [
            'Girdi',
            'Kullanıcıdan ve kaynaktan geleni',
            'Kişisel veri maskeleme, konu dışı istek reddi',
          ],
          [
            'Çıktı',
            'Modelin ürettiğini',
            'Şema doğrulama, kaynaksız iddia reddi, gizli veri taraması',
          ],
          ['Eylem', 'Araç çağrılarını', 'Yetki kısıtı, onay kapısı, çıkış izin listesi'],
        ],
        aciklama: 'En güçlü katman eylem katmanıdır; diğer ikisi tek başına yeterli değildir.',
      },
      { tip: 'altbaslik', metin: 'Deterministik ve model tabanlı denetim', kimlik: 'turler' },
      {
        tip: 'paragraf',
        metin:
          'Deterministik denetimler kurallıdır: şema doğrulama, düzenli ifade, izin listesi, sayısal aralık kontrolü. Öngörülebilir ve denetlenebilirler. Model tabanlı denetimler bir sınıflandırıcı veya ikinci bir dil modeli kullanır; esnek ama kendisi de hata yapabilir ve yeni bir saldırı yüzeyi ekler.',
      },
      {
        tip: 'liste',
        ogeler: [
          'Mümkün olan her yerde deterministik denetim tercih edin; ölçülebilir ve kararlıdır.',
          'Model tabanlı denetimi yalnızca kuralla yazılamayan durumlar için kullanın.',
          'Her denetimin yanlış pozitif oranını ölçün; aşırı katı bir bant ürünü kullanılamaz kılar.',
          'Reddetme mesajını kullanıcıya faydalı biçimde yazın; sadece "yapamam" demeyin.',
        ],
      },
      {
        tip: 'uyari',
        ton: 'dikkat',
        metin:
          'Koruma bandı olarak kullanılan ikinci bir dil modeli de istem enjeksiyonuna açıktır. Denetim zincirinin son halkası deterministik olmalı.',
      },
      { tip: 'altbaslik', metin: 'Ölçüm', kimlik: 'olcum' },
      {
        tip: 'paragraf',
        metin:
          'Koruma bantları iki yönlü ölçülür: engellenmesi gerekeni engelliyor mu (yakalama oranı) ve engellenmemesi gerekeni geçiriyor mu (yanlış pozitif oranı). İkincisi ölçülmediğinde, güvenlik adına kullanılabilirlik sessizce kaybedilir.',
      },
    ],
    sss: [
      {
        soru: 'Koruma bandı modelin yerine mi geçer?',
        cevap:
          'Hayır, modelin etrafını çevreler. Model davranışını iyileştirme (eğitim, istem) ile sınırlama (koruma bandı) birbirini tamamlar; biri diğerinin yerine kullanılamaz.',
      },
      {
        soru: 'Her isteği bir sınıflandırıcıdan geçirmek gecikmeyi bozar mı?',
        cevap:
          'Bozabilir. Pratik yaklaşım, denetimi riske göre kademelendirmek: yalnızca okuma yapan akışlarda hafif, yazma ve dışa dönük eylem içeren akışlarda ağır denetim.',
      },
    ],
    surumler: [{ surum: 'v1.0', tarih: '2026-07-14', degisiklik: 'İlk yayın.' }],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'quantization',
    ad: 'Quantization',
    altAd: 'Nicemleme',
    kategori: 'AI Infrastructure',
    kisaTanim:
      'Model ağırlıklarının ve/veya ara değerlerin daha az bitle temsil edilerek bellek ve hesaplama maliyetinin düşürülmesidir.',
    seviye: 'ileri',
    ilgili: ['Mixture of Experts', 'LLM', 'MLOps'],
    onkosullar: ['Deep Learning'],
    sonDogrulama: '2026-09-03',
    yayinTarihi: '2026-07-08',
    yazarSlug: 'sinaptik-research',
    govde: [
      {
        tip: 'kisa-cevap',
        metin:
          'Nicemleme, "aynı modeli daha az bellekle çalıştırma" tekniğidir. Ağırlıklar yüksek hassasiyetli kayan noktadan daha düşük bitli bir temsile indirilir; bellek ve bant genişliği kazancı karşılığında bir miktar kalite kaybı kabul edilir.',
      },
      { tip: 'altbaslik', metin: 'Neyi kazandırır?', kimlik: 'kazanc' },
      {
        tip: 'liste',
        ogeler: [
          'Bellek: model daha küçük donanıma sığar; kenar cihazda çalışma mümkün olur.',
          'Bant genişliği: ağırlık okuma maliyeti düşer, üretim hızı artar.',
          'Maliyet: aynı donanımda daha fazla eşzamanlı istek karşılanır.',
          'Erişilebilirlik: yerel çalıştırma ve deneme maliyeti düşer.',
        ],
      },
      { tip: 'altbaslik', metin: 'Yaklaşımlar', kimlik: 'yaklasimlar' },
      {
        tip: 'tablo',
        basliklar: ['Yaklaşım', 'Ne zaman uygulanır', 'Özellik'],
        satirlar: [
          [
            'Eğitim sonrası nicemleme',
            'Model eğitildikten sonra',
            'Hızlı ve ucuz; kalite kaybı değişken',
          ],
          ['Kalibrasyonlu nicemleme', 'Küçük bir örnek kümeyle', 'Kaybı azaltır; ek adım gerekir'],
          [
            'Nicemlemeye duyarlı eğitim',
            'Eğitim sırasında',
            'En iyi kalite; eğitim maliyeti yüksek',
          ],
          ['Karışık hassasiyet', 'Katman bazlı seçim', 'Hassas katmanlar yüksek bitte tutulur'],
        ],
        aciklama: 'Seçim, kabul edilebilir kalite kaybına ve yeniden eğitim imkânına bağlı.',
      },
      {
        tip: 'uyari',
        ton: 'dikkat',
        metin:
          'Nicemlemenin kalite etkisi göreve göre değişir ve ortalama metriklerde görünmeyebilir. Uzun bağlam, çok dilli ve muhakeme gerektiren görevlerde kayıp daha belirgin olabilir; kendi görev setinizde ölçmeden üretime almayın.',
      },
      { tip: 'altbaslik', metin: 'Karar çerçevesi', kimlik: 'karar' },
      {
        tip: 'liste',
        sirali: true,
        ogeler: [
          'Kalite eşiğinizi görev setinizde tanımlayın; sıralama değil eşik kararı verin.',
          'Nicemlenmiş ve tam hassasiyetli sürümü aynı sette karşılaştırın.',
          'Kuyruk gecikmesi ve eşzamanlılık kapasitesini birlikte ölçün.',
          'Toplam maliyeti hesaplayın: donanım, operasyon ve kalite kaybının iş etkisi.',
          'Kararınızı sürüm notuna yazın; model yükseltmesinde tekrar ölçün.',
        ],
      },
    ],
    sss: [
      {
        soru: 'Nicemleme modeli "bozar" mı?',
        cevap:
          'Kalite kaybı vardır ama miktarı yaklaşıma ve göreve bağlı; birçok senaryoda fark edilmeyecek kadar küçük olabilir. Önemli olan kaybın varsayılmak yerine ölçülmesi.',
      },
      {
        soru: 'Budama (pruning) ile aynı şey mi?',
        cevap:
          'Hayır. Nicemleme her ağırlığı daha az bitle temsil eder; budama bazı ağırlık veya birimleri tamamen kaldırır. İkisi birlikte de kullanılabilir.',
      },
    ],
    surumler: [{ surum: 'v1.0', tarih: '2026-07-08', degisiklik: 'İlk yayın.' }],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'mlops',
    ad: 'MLOps',
    altAd: 'Makine öğrenmesi operasyonları',
    kategori: 'MLOps / LLMOps',
    kisaTanim:
      'Makine öğrenmesi modellerinin geliştirilmesini, dağıtımını, izlenmesini ve yenilenmesini tekrarlanabilir ve denetlenebilir hale getiren mühendislik disiplinidir.',
    seviye: 'orta',
    ilgili: ['LLMOps', 'Evaluation', 'Machine Learning'],
    onkosullar: ['Machine Learning'],
    sonDogrulama: '2026-09-04',
    yayinTarihi: '2026-05-12',
    yazarSlug: 'sinaptik-research',
    govde: [
      {
        tip: 'kisa-cevap',
        metin:
          'MLOps, bir modeli "çalıştı" durumundan "çalışmaya devam ediyor ve neden çalıştığını gösterebiliyoruz" durumuna taşıyan pratikler bütünüdür. Yazılım mühendisliğinden ayrıldığı yer, artefaktın yalnızca kod değil aynı zamanda veri ve model olması.',
      },
      { tip: 'altbaslik', metin: 'Üç artefakt, üç sürüm', kimlik: 'artefaktlar' },
      {
        tip: 'paragraf',
        metin:
          'Klasik yazılımda sürümlenen tek şey koddur. Makine öğrenmesinde üç şey birden sürümlenmeli: kod, veri ve model. Üçünün eşleşmesi kaydedilmezse bir sonucu yeniden üretmek mümkün olmaz — ve yeniden üretilemeyen bir sonuç denetlenemez.',
      },
      {
        tip: 'akis',
        adimlar: [
          {
            ad: 'Veri sürümleme',
            aciklama: 'Eğitim kümesinin anlık görüntüsü ve şeması kaydedilir.',
          },
          { ad: 'Deney kaydı', aciklama: 'Hiperparametre, metrik ve ortam bilgisi izlenir.' },
          {
            ad: 'Model kaydı',
            aciklama: 'Model, kart bilgisiyle birlikte bir kayıt defterine alınır.',
          },
          { ad: 'Dağıtım', aciklama: 'Gölge veya kademeli dağıtımla üretime alınır.' },
          { ad: 'İzleme', aciklama: 'Girdi dağılımı, tahmin dağılımı ve iş metriği takip edilir.' },
          {
            ad: 'Yenileme',
            aciklama: 'Tetikleyici koşulda yeniden eğitim ve geri alma planı işler.',
          },
        ],
      },
      { tip: 'altbaslik', metin: 'Sürüklenme', kimlik: 'suruklenme' },
      {
        tip: 'tablo',
        basliklar: ['Tür', 'Ne değişir', 'Nasıl fark edilir'],
        satirlar: [
          ['Veri sürüklenmesi', 'Girdi dağılımı', 'Özellik dağılımı izleme, istatistiksel testler'],
          [
            'Kavram sürüklenmesi',
            'Girdi-çıktı ilişkisi',
            'İş metriğinin bozulması; etiket gecikmeli gelir',
          ],
          ['Şema kırılması', 'Alan tipi veya adı', 'Doğrulama hatası; genellikle ani ve görünür'],
          [
            'Yukarı akış değişimi',
            'Besleyen sistemin davranışı',
            'Beklenmeyen boş oranı, ani dağılım kayması',
          ],
        ],
        aciklama:
          'Kavram sürüklenmesi en sinsi olanıdır; etiket gecikmesi nedeniyle geç fark edilir.',
      },
      {
        tip: 'uyari',
        ton: 'bilgi',
        metin:
          'Üretimdeki bir modelin en önemli metriği doğruluk değil, geri alma süresidir: bozulduğunu anladıktan sonra eski sürüme dönmek kaç dakika sürüyor?',
      },
    ],
    sss: [
      {
        soru: 'MLOps ile DevOps arasındaki fark nedir?',
        cevap:
          'DevOps kod artefaktını yönetir; MLOps buna veri ve model artefaktlarını ekler. Bu, sürümleme, test ve izleme pratiklerinin veri dağılımını da kapsayacak biçimde genişlemesi demektir.',
      },
      {
        soru: 'Küçük bir ekip için minimum MLOps kurulumu ne?',
        cevap:
          'Üç şey: eğitim verisinin sürümlenmiş bir anlık görüntüsü, deney metriklerinin kaydı ve üretimde girdi dağılımı izleme. Bu üçü olmadan hiçbir teşhis yapılamaz.',
      },
    ],
    surumler: [{ surum: 'v1.0', tarih: '2026-05-12', degisiklik: 'İlk yayın.' }],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'llmops',
    ad: 'LLMOps',
    altAd: 'Dil modeli operasyonları',
    kategori: 'MLOps / LLMOps',
    kisaTanim:
      'Dil modeli tabanlı uygulamaların istem, bağlam, araç ve model sürümlerini izlenebilir, ölçülebilir ve geri alınabilir biçimde işletme pratiğidir.',
    seviye: 'orta',
    ilgili: ['MLOps', 'Evaluation', 'RAG', 'AI Agent'],
    onkosullar: ['LLM'],
    sonDogrulama: '2026-09-09',
    yayinTarihi: '2026-06-25',
    guncellemeTarihi: '2026-09-09',
    yazarSlug: 'sukru-yusuf-kaya',
    inceleyenSlug: 'sinaptik-research',
    govde: [
      {
        tip: 'kisa-cevap',
        metin:
          'LLMOps, klasik MLOps ile aynı amacı taşır ama farklı artefaktları yönetir: model ağırlıkları yerine istem sürümleri, bağlam kaynakları, araç şemaları ve sağlayıcı model sürümleri. Arıza biçimi de farklıdır: sistem hata vermeden kalite düşer.',
      },
      { tip: 'altbaslik', metin: 'Sessiz arıza problemi', kimlik: 'sessiz-ariza' },
      {
        tip: 'paragraf',
        metin:
          'Klasik bir servis bozulduğunda hata oranı yükselir ve alarm çalar. Dil modeli tabanlı bir akış bozulduğunda servis 200 döner, gecikme normaldir, hata oranı sıfırdır — ama cevaplar kötüleşmiştir. Nedeni bir istem değişikliği, sağlayıcı model güncellemesi, belge setinin bozulması veya araç şemasının değişmesi olabilir.',
      },
      { tip: 'altbaslik', metin: 'İz: minimum kayıt birimi', kimlik: 'iz' },
      {
        tip: 'paragraf',
        metin:
          'Kayıt birimi "istek" değil "iz" olmalı: bir kullanıcı niyetinden başlayıp tüm alt çağrıları kapsayan bir ağaç. Her düğümde şu alanların bulunması, sonradan sorulacak hemen her soruyu cevaplamaya yetiyor.',
      },
      {
        tip: 'kod',
        dil: 'json',
        metin: `{
  "iz_kimligi": "tr_01H...",
  "adim": "geri-getirme",
  "istem_surumu": "ozet-v7",
  "model": "saglayici/model-adi@2026-08",
  "girdi_token": 4120,
  "cikti_token": 318,
  "gecikme_ms": 1840,
  "arac_cagrilari": [{ "ad": "belge_ara", "sonuc_sayisi": 0 }],
  "geri_getirme_isabet": false,
  "degerlendirme": { "bicim_uyumu": true, "kaynakli": false },
  "maliyet_usd": 0.0042
}`,
      },
      { tip: 'altbaslik', metin: 'Çevrimdışı ve çevrimiçi değerlendirme', kimlik: 'degerlendirme' },
      {
        tip: 'tablo',
        basliklar: ['Tür', 'Ne zaman', 'Ne ölçer', 'Sınırı'],
        satirlar: [
          [
            'Çevrimdışı',
            'Sürüm öncesi',
            'Görev setinde tamamlama ve kalite',
            'Gerçek trafiği temsil etmez',
          ],
          [
            'Çevrimiçi',
            'Üretimde sürekli',
            'Gerçek isteklerde kalite göstergeleri',
            'Etiket yok; dolaylı sinyal',
          ],
          ['İnsan denetimi', 'Örneklemeli', 'Öznel kalite ve güvenlik', 'Maliyetli, gecikmeli'],
        ],
        aciklama: 'Üçü birlikte kurulmadığında sessiz kalite düşüşü fark edilmez.',
      },
      {
        tip: 'uyari',
        ton: 'dikkat',
        metin:
          'İzlerde kişisel veri birikir. Maskeleme, saklama süresi ve erişim kuralları ilk günden tanımlanmalı; sonradan temizlemek çok daha pahalı.',
      },
      { tip: 'altbaslik', metin: 'Olgunluk göstergesi', kimlik: 'olgunluk' },
      {
        tip: 'paragraf',
        metin:
          'Bir ekibin olgunluğunu anlamak için tek soru yeterli: "Dün saat üçte şu cevabı neden verdiğini gösterebilir misin?" Cevap hayırsa, model tartışmasının pratik bir anlamı yok.',
      },
    ],
    sss: [
      {
        soru: 'İstem sürümünü neden kaydetmek gerekiyor?',
        cevap:
          'Çünkü çıktı kalitesi istem, model sürümü ve bağlamın bileşiminden doğar. Üçünden biri kayıtlı değilse bir gerilemenin nedenini bulmak mümkün olmaz.',
      },
      {
        soru: 'Sağlayıcı modeli güncellediğinde ne yapmalı?',
        cevap:
          'Görev setini yeni sürümde koşturup eski sürümle karşılaştırmak. Sürüm sabitleme imkânı varsa, karşılaştırma tamamlanana kadar sabitlemek en güvenli yol.',
      },
      {
        soru: 'Model tabanlı otomatik değerlendirme güvenilir mi?',
        cevap:
          'Tek başına değil. Yargıç modelin kendi eğilimleri sonuca karışır; en az bir insan kalibrasyon turuyla desteklenmeli ve raporda yöntem belirtilmeli.',
      },
    ],
    kaynaklar: [
      {
        ad: 'Sinaptik Research — gözlemlenebilirlik notları',
        yayinci: 'Sinaptik Lab',
        tur: 'Teknik rapor',
      },
    ],
    surumler: [
      {
        surum: 'v1.1',
        tarih: '2026-09-09',
        degisiklik: 'İz şeması ve değerlendirme tablosu eklendi.',
      },
      { surum: 'v1.0', tarih: '2026-06-25', degisiklik: 'İlk yayın.' },
    ],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'responsible-ai',
    ad: 'Responsible AI',
    altAd: 'Sorumlu yapay zekâ',
    kategori: 'Responsible AI',
    kisaTanim:
      'Yapay zekâ sistemlerinin adillik, şeffaflık, hesap verebilirlik, gizlilik ve güvenlik boyutlarını tasarım aşamasından itibaren yönetme yaklaşımıdır.',
    seviye: 'baslangic',
    ilgili: ['Guardrails', 'Evaluation', 'Hallucination', 'Artificial Intelligence'],
    sonDogrulama: '2026-09-08',
    yayinTarihi: '2026-05-18',
    guncellemeTarihi: '2026-09-08',
    yazarSlug: 'sukru-yusuf-kaya',
    govde: [
      {
        tip: 'kisa-cevap',
        metin:
          'Sorumlu yapay zekâ bir etik bildirisi değil, bir mühendislik ve yönetişim pratiğidir. Ölçülebilir hâle gelmediği sürece — adillik metriği, kayıt altyapısı, gözetim noktası — bir niyet beyanı olarak kalır.',
      },
      { tip: 'altbaslik', metin: 'Boyutlar ve karşılıkları', kimlik: 'boyutlar' },
      {
        tip: 'tablo',
        basliklar: ['Boyut', 'Soru', 'Teknik karşılığı'],
        satirlar: [
          [
            'Adillik',
            'Sistem gruplar arasında farklı mı davranıyor?',
            'Alt grup bazlı metrik raporlama',
          ],
          [
            'Şeffaflık',
            'Kullanıcı yapay zekâ ile mi konuştuğunu biliyor mu?',
            'Arayüzde bildirim, içerik işaretleme',
          ],
          ['Hesap verebilirlik', 'Karardan kim sorumlu?', 'Sahiplik matrisi, denetim kaydı'],
          ['Gizlilik', 'Hangi veri nereye gidiyor?', 'Maskeleme, saklama süresi, bölge kısıtı'],
          [
            'Güvenlik',
            'Kötüye kullanıldığında ne olur?',
            'Yetki sınırı, koruma bantları, kırmızı takım',
          ],
          ['Dayanıklılık', 'Bozulduğunda fark eder miyiz?', 'İzleme, alarm, geri alma planı'],
        ],
        aciklama: 'Her boyutun bir ölçüsü ve bir sahibi olmalı; aksi hâlde sorumluluk dağılır.',
      },
      { tip: 'altbaslik', metin: 'İnsan gözetimi ne demek?', kimlik: 'insan-gozetimi' },
      {
        tip: 'paragraf',
        metin:
          'İnsan gözetimi, ekranda bir onay düğmesi olması değildir. Anlamlı gözetim üç koşul gerektirir: gözeten kişi kararı anlayabilecek bilgiye sahip olmalı, reddetme yetkisi gerçekten bulunmalı ve reddetmenin bir bedeli olmamalı. Üçünden biri eksikse onay, kaydı olan bir otomatik onaya dönüşür.',
      },
      {
        tip: 'liste',
        ogeler: [
          'Gözeten kişiye kararın gerekçesini ve kaynağını gösterin.',
          'Reddetme yolunu onaylama yolu kadar kolay yapın.',
          'Onay oranını izleyin; %99 onay, gözetimin işlemediğinin göstergesi olabilir.',
          'Gözetim yükünü ölçün; taşıyamayacak sayıda karar yığan bir akış gözetimi çökertir.',
        ],
      },
      {
        tip: 'uyari',
        ton: 'dikkat',
        metin:
          'Bu girdi editoryal bir özettir, hukuki görüş değildir. Yükümlülükler sektöre, kuruma ve coğrafyaya göre değişir; bağlayıcı değerlendirme için hukuk danışmanınıza başvurun.',
      },
      { tip: 'altbaslik', metin: 'Nereden başlanır?', kimlik: 'baslangic' },
      {
        tip: 'liste',
        sirali: true,
        ogeler: [
          'Envanter: kurumdaki tüm yapay zekâ destekli akışları amaçlarıyla listeleyin.',
          'Risk sınıflandırması: her akışı etkisine göre sınıflandırın ve gerekçesini yazın.',
          'Sahiplik: her akış için bir iş sahibi ve bir teknik sahip atayın.',
          'Kayıt: karar, girdi, istem ve model sürümünü denetlenebilir biçimde saklayın.',
          'Gözetim: yüksek etkili akışlarda gerçek bir reddetme noktası tanımlayın.',
          'Gözden geçirme: envanteri ve sınıflandırmayı düzenli aralıklarla yenileyin.',
        ],
      },
    ],
    sss: [
      {
        soru: 'Adillik nasıl ölçülür?',
        cevap:
          'Tek bir metrik yoktur ve bazı adillik tanımları matematiksel olarak aynı anda sağlanamaz. Pratik yaklaşım, ilgili alt gruplar için aynı performans metriklerini ayrı ayrı raporlamak ve hangi tanımı neden seçtiğinizi yazmak.',
      },
      {
        soru: 'Sorumlu yapay zekâ inovasyonu yavaşlatır mı?',
        cevap:
          'Kayıt, izleme ve gözden geçirme pratikleri aynı zamanda kalite ve hata ayıklama altyapısıdır. Yavaşlatan şey genellikle bu pratikler değil, geç fark edilen arızaların yarattığı geri dönüşler.',
      },
    ],
    surumler: [
      { surum: 'v1.1', tarih: '2026-09-08', degisiklik: 'İnsan gözetimi bölümü eklendi.' },
      { surum: 'v1.0', tarih: '2026-05-18', degisiklik: 'İlk yayın.' },
    ],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'computer-vision',
    ad: 'Computer Vision',
    altAd: 'Bilgisayarlı görü',
    kategori: 'Computer Vision',
    kisaTanim:
      'Görüntü ve video verisinden nesne, sahne, metin ve hareket gibi bilgileri çıkarmayı amaçlayan yapay zekâ alt alanıdır.',
    seviye: 'orta',
    ilgili: ['Deep Learning', 'Transformer', 'Multimodal AI', 'Embodied AI'],
    onkosullar: ['Deep Learning'],
    sonDogrulama: '2026-09-01',
    yayinTarihi: '2026-05-02',
    yazarSlug: 'sinaptik-research',
    govde: [
      {
        tip: 'kisa-cevap',
        metin:
          'Bilgisayarlı görü, pikselleri karara çeviren işin adıdır. Sınıflandırmadan nesne tespitine, segmentasyondan görsel-dil modellerine uzanan bir görev yelpazesi içerir ve her görev farklı etiket maliyeti taşır.',
      },
      { tip: 'altbaslik', metin: 'Görev tipleri', kimlik: 'gorevler' },
      {
        tip: 'tablo',
        basliklar: ['Görev', 'Çıktı', 'Etiket maliyeti'],
        satirlar: [
          ['Sınıflandırma', 'Görüntü başına etiket', 'Düşük'],
          ['Nesne tespiti', 'Sınırlayıcı kutular ve sınıflar', 'Orta'],
          ['Anlamsal segmentasyon', 'Piksel başına sınıf', 'Yüksek'],
          ['Örnek segmentasyonu', 'Piksel başına sınıf ve örnek kimliği', 'Çok yüksek'],
          ['Anahtar nokta', 'Eklem veya işaret noktaları', 'Yüksek'],
          ['Görsel soru cevaplama', 'Serbest metin', 'Değişken; çok modlu model gerekir'],
        ],
        aciklama: 'Etiket maliyeti, proje planında model seçiminden daha belirleyici olabilir.',
      },
      { tip: 'altbaslik', metin: 'Evrişim ve görsel transformer', kimlik: 'mimariler' },
      {
        tip: 'paragraf',
        metin:
          'Evrişimli ağlar yerel desenleri kaydırmalı filtrelerle yakalar ve az veriyle iyi genelleme yapar. Görsel transformerlar görüntüyü yamalara bölüp dikkat mekanizmasıyla ilişkilendirir; büyük veriyle daha güçlü ama küçük veride evrişimli ağların dayanıklılığına ulaşmakta zorlanır. Pratikte melez mimariler yaygın.',
      },
      { tip: 'altbaslik', metin: 'Veri kalitesi merkezde', kimlik: 'veri-kalitesi' },
      {
        tip: 'liste',
        ogeler: [
          'Etiket rehberi olmadan iki etiketleyici farklı etiketler; anlaşma oranını ölçün.',
          'Sınıf dengesizliği görü projelerinde kuraldır; ölçüm ve örnekleme buna göre tasarlanmalı.',
          'Çekim koşulu (ışık, açı, lens) dağılımı üretimle eşleşmiyorsa model sahada çöker.',
          'Veri artırma, gerçek çeşitliliğin yerini almaz; yalnızca dayanıklılığı artırır.',
        ],
      },
      {
        tip: 'uyari',
        ton: 'dikkat',
        metin:
          'Yüz tanıma ve biyometrik uygulamalar birçok coğrafyada özel yükümlülüklere tabidir ve yüksek riskli kabul edilebilir. Teknik uygulanabilirlik, hukuki uygunluk anlamına gelmez.',
      },
    ],
    sss: [
      {
        soru: 'Görsel-dil modelleri klasik OCR hattını gereksiz kılıyor mu?',
        cevap:
          'Kılmıyor; hata karakterini değiştiriyor. Görsel-dil modelleri tablo ve form anlamada güçlü ama hatayı sessiz ve inandırıcı biçimde üretebiliyor. Dayanıklı kurulumlar ikisini birbirine karşı doğrulama olarak kullanıyor.',
      },
      {
        soru: 'Kaç etiketli görüntü gerekir?',
        cevap:
          'Göreve ve sınıf sayısına bağlı; transfer öğrenmeyle sınıf başına yüzler mertebesinde örnek sıkça yeterli olabilir. Öğrenme eğrisi çıkarmak, tahminden güvenilirdir.',
      },
    ],
    surumler: [{ surum: 'v1.0', tarih: '2026-05-02', degisiklik: 'İlk yayın.' }],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'embodied-ai',
    ad: 'Embodied AI',
    altAd: 'Bedenlenmiş yapay zekâ',
    kategori: 'Robotics',
    kisaTanim:
      'Fiziksel bir bedeni olan ve çevresiyle algı-eylem döngüsü üzerinden etkileşen yapay zekâ sistemlerinin alanıdır.',
    seviye: 'ileri',
    ilgili: ['Computer Vision', 'Multimodal AI', 'Deep Learning'],
    onkosullar: ['Deep Learning', 'Computer Vision'],
    sonDogrulama: '2026-09-05',
    yayinTarihi: '2026-06-28',
    yazarSlug: 'sukru-yusuf-kaya',
    govde: [
      {
        tip: 'kisa-cevap',
        metin:
          'Bedenlenmiş yapay zekâda model yalnızca tahmin üretmez, dünyayı değiştirir. Bu, dil modellerinde olmayan üç kısıt getirir: hata geri alınamaz, karar gerçek zamanlıdır ve her eylem sonraki durumu belirler.',
      },
      { tip: 'altbaslik', metin: 'Neden dil modelinin yolunu izlemiyor?', kimlik: 'fark' },
      {
        tip: 'paragraf',
        metin:
          'Dil modellerini mümkün kılan şey internet ölçeğinde hazır metin verisiydi. Fiziksel dünyada böyle bir yığın yok: her örnek zaman, donanım ve güvenlik maliyeti karşılığında üretiliyor. Bu yüzden alandaki temel darboğaz parametre sayısı değil, örnek toplama maliyeti.',
      },
      {
        tip: 'tablo',
        basliklar: ['Veri kaynağı', 'Ölçek', 'Kalite', 'Temel sorun'],
        satirlar: [
          ['Teleoperasyon', 'Düşük', 'Yüksek', 'İnsan saati başına maliyet'],
          ['Simülasyon', 'Çok yüksek', 'Değişken', 'Gerçeklik açığı (sim-to-real)'],
          ['İnsan videosu', 'Yüksek', 'Orta', 'Eylem etiketi ve kinematik eşleme yok'],
          ['Filo verisi', 'Zamanla artar', 'Yüksek', 'Önce sahada robot gerekir'],
        ],
        aciklama: 'Pratikte hepsinin karışımı kullanılıyor; tek kaynak yeterli değil.',
      },
      { tip: 'altbaslik', metin: 'İki hızlı mimari', kimlik: 'mimari' },
      {
        tip: 'akis',
        adimlar: [
          {
            ad: 'Yavaş katman',
            aciklama: 'Büyük model hedefi alt görevlere böler; saniyeler mertebesinde.',
          },
          {
            ad: 'Hızlı katman',
            aciklama: 'Öğrenilmiş politika kısa ufuklu eylem üretir; on milisaniyeler.',
          },
          { ad: 'Kontrolcü', aciklama: 'Klasik hareket kontrolü yürütür; milisaniyeler.' },
          {
            ad: 'Güvenlik',
            aciklama: 'Kuvvet, hız ve alan sınırları donanımda, modelden bağımsız uygulanır.',
          },
        ],
      },
      {
        tip: 'uyari',
        ton: 'dikkat',
        metin:
          'Güvenlik sınırı modelin içinde değil, dışında olmalı. Öğrenilmiş bir politikanın sınırı "anlaması" ile donanımsal olarak aşamaması farklı güvencelerdir.',
      },
      { tip: 'altbaslik', metin: 'Anlamlı metrikler', kimlik: 'metrikler' },
      {
        tip: 'liste',
        ogeler: [
          'Müdahalesiz çalışma süresi: iki insan müdahalesi arasındaki ortalama süre.',
          'Görev başına müdahale sayısı: otonominin gerçek göstergesi.',
          'Tekrar kararlılığı: aynı görev yüz kez koşulduğunda başarı değişkenliği.',
          'Güvenlik olayı oranı: sınır ihlali ve durdurma sayısı.',
        ],
      },
      {
        tip: 'paragraf',
        metin:
          'Bu metriklerin hiçbiri gösterim videolarında görünmez. Bir pilotun gerçek olgunluğu, başarılı demo sayısıyla değil müdahalesiz çalışma süresiyle ölçülür.',
      },
    ],
    sss: [
      {
        soru: 'VLA modeli nedir?',
        cevap:
          'Vision-Language-Action modeli; görüntüyü ve doğal dilde verilen hedefi girdi alıp doğrudan robot eylemleri üreten model ailesi. Algı, planlama ve kontrol ayrımını tek bir öğrenilmiş bileşende birleştirmeyi amaçlar.',
      },
      {
        soru: 'Humanoid biçim gerekli mi?',
        cevap:
          'Her senaryoda değil. Humanoid biçimin gerekçesi, insan için tasarlanmış ortamlara sonradan girebilmek. Belirli bir görev için özelleşmiş bir platform çoğu zaman daha verimli olur.',
      },
    ],
    surumler: [{ surum: 'v1.0', tarih: '2026-06-28', degisiklik: 'İlk yayın.' }],
  },
];
