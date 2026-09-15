import type { Blok, SSS } from '@/lib/tipler';

/**
 * ÖRNEK VERİ — yer tutucu ders gövdeleri.
 *
 * Ders kalıbı (MASTER-PLAN §77): teori → örnek → lab → test → proje. Her ders
 * ölçülebilir hedeflerle açılır, uygulamalı bir alıştırmayla kapanır.
 *
 * Sayısal örnekler TEMSİLÎ'dir; ölçüm olarak alıntılanamaz.
 */

export type DersEki = {
  hedefler: string[];
  kavramlar?: string[];
  onkosullar?: string[];
  govde: Blok[];
  alistirma: { baslik: string; adimlar: string[]; cikti: string };
  sss?: SSS[];
  testSlug?: string;
};

export const DERS_GOVDELERI: Record<string, DersEki> = {
  /* ---------------------------------------------------------------------- */
  'token-nedir': {
    hedefler: [
      'Token ile karakter ve kelime arasındaki farkı açıklayabilmek',
      'Bir metnin yaklaşık token sayısını tahmin edebilmek',
      'Token sayısının maliyet ve bağlam bütçesine etkisini hesaplayabilmek',
      'Türkçe metinlerde token verimliliğinin neden düştüğünü anlatabilmek',
    ],
    kavramlar: ['tokenization', 'context-window'],
    govde: [
      {
        tip: 'kisa-cevap',
        metin:
          'Token, bir dil modelinin metni işlerken kullandığı en küçük birimdir. Ne harf ne kelimedir: sık geçen kelimeler tek token, nadir veya çekimli kelimeler birkaç token olur. Maliyet, hız ve bağlam sınırı token cinsinden ölçülür.',
      },
      { tip: 'altbaslik', metin: 'Teori: neden kelime değil?', kimlik: 'teori' },
      {
        tip: 'paragraf',
        metin:
          'Bir modelin sözlüğü sonlu olmak zorunda. Kelime bazlı bir sözlük iki sorun üretir: sözlük dışı kelimeler (yeni bir terim, yazım hatası, özel ad) işlenemez ve sözlük gereğinden çok büyür. Karakter bazlı bir sözlük ise bu sorunu çözer ama diziler çok uzar, model uzun bağımlılıkları öğrenmekte zorlanır.',
      },
      {
        tip: 'paragraf',
        metin:
          'Alt sözcük (subword) tokenizasyonu bu ikisinin ortası: sık geçen parçalar tek birim olarak saklanır, nadir kelimeler bilinen parçalara bölünür. Böylece sözlük makul boyutta kalır ve hiçbir metin işlenemez hale gelmez.',
      },
      { tip: 'altbaslik', metin: 'Örnek: aynı anlam, farklı maliyet', kimlik: 'ornek' },
      {
        tip: 'tablo',
        basliklar: ['Metin', 'Yaklaşık token', 'Neden'],
        satirlar: [
          ['the cat sat', '3', 'Üç sık kelime, üçü de tek token'],
          ['kedi oturdu', '3-4', 'Kök sık, ek ayrı token olabilir'],
          ['kedilerimizdekiler', '5-7', 'Çok ekli biçim, çok parçaya bölünür'],
          ['SKU-44821-B', '6-9', 'Rakam ve tire grupları ayrı ayrı bölünür'],
        ],
        aciklama:
          'Değerler yaklaşık ve temsilîdir; tokenizer sürümüne göre değişir. Kendi metninizle ölçün.',
      },
      {
        tip: 'paragraf',
        metin:
          'Türkçe sondan eklemeli bir dil olduğu için bu tablo Türkçe aleyhine çalışır. Aynı anlamı taşıyan bir Türkçe metin, İngilizce karşılığından daha fazla token tutar. Bunun iki somut sonucu var: aynı fatura tutarına daha az içerik sığar ve bağlam penceresinin etkin kapasitesi düşer.',
      },
      { tip: 'altbaslik', metin: 'Bütçe hesabı', kimlik: 'butce' },
      {
        tip: 'paragraf',
        metin:
          'Bir istemin token bütçesi dört kalemden oluşur. Toplamın pencereye sığması yetmez; çıktı için de yer bırakmak gerekir.',
      },
      {
        tip: 'liste',
        sirali: true,
        ogeler: [
          'Sistem istemi: sabit, her çağrıda ödenir. Kısaltmanın getirisi çağrı sayısıyla çarpılır.',
          'Bağlam: geri getirilen belge parçaları. En oynak ve en kontrol edilebilir kalem.',
          'Konuşma geçmişi: her turda birikir. Sınırlanmazsa sessizce büyür.',
          'Çıktı için ayrılan pay: modelin cevabı da pencerenin içindedir.',
        ],
      },
      {
        tip: 'uyari',
        ton: 'dikkat',
        metin:
          'Karakter sayısını dörde bölerek token tahmin etmek İngilizce için kaba bir yaklaşım; Türkçe için yanıltıcıdır. Gerçek sayıyı sağlayıcının tokenizer aracıyla ölçün.',
      },
      { tip: 'altbaslik', metin: 'Pratik kurallar', kimlik: 'pratik' },
      {
        tip: 'liste',
        ogeler: [
          'Uzun ve sabit önekleri bağlam önbelleğine alın; her çağrıda yeniden ödemeyin.',
          'Konuşma geçmişine bir üst sınır koyun; aşıldığında özetleyerek taşıyın.',
          'Geri getirilen parça sayısını sabitleyin; "ne kadar sığarsa" stratejisi maliyeti öngörülemez kılar.',
          'Kimlik ve kod alanlarını (SKU, madde numarası) gereksiz yere isteme kopyalamayın.',
        ],
      },
    ],
    alistirma: {
      baslik: 'Kendi metninizin token profilini çıkarın',
      adimlar: [
        'Kurumunuzdan üç tipik metin seçin: kısa bir kullanıcı sorusu, bir prosedür paragrafı, bir tablo satırı.',
        'Her birini kullandığınız modelin tokenizer aracıyla ölçün; token sayısını not edin.',
        'Aynı metinlerin İngilizce çevirisini ölçün ve oranı hesaplayın.',
        'Bir isteminizin dört kalemini (sistem, bağlam, geçmiş, çıktı payı) tek tek ölçün.',
        'Toplamı pencere sınırıyla karşılaştırın; hangi kalemin kısılması en çok kazandırır?',
      ],
      cikti:
        'Üç metin için ölçülmüş token sayıları ve isteminizin kalem bazlı token bütçesi tablosu.',
    },
    sss: [
      {
        soru: 'Token sayısı ile kelime sayısı arasında sabit bir oran var mı?',
        cevap:
          'Hayır. Oran dile, metin türüne ve tokenizer sürümüne göre değişir. Türkçe gibi sondan eklemeli dillerde kelime başına token sayısı, İngilizceye göre belirgin biçimde yüksektir.',
      },
      {
        soru: 'Girdi ve çıktı tokeni aynı mı ücretlendirilir?',
        cevap:
          'Genellikle hayır; çoğu sağlayıcıda çıktı tokeni girdi tokeninden pahalıdır. Buna karşılık çok adımlı akışlarda hacim girdide biriktiği için toplam faturayı girdi belirleyebilir.',
      },
    ],
    testSlug: 'llm-testi',
  },

  /* ---------------------------------------------------------------------- */
  'embedding-sezgisi': {
    hedefler: [
      'Gömme vektörünün ne olduğunu geometrik olarak açıklayabilmek',
      'Benzerlik ölçümünün neden kosinüs benzerliğiyle yapıldığını anlatabilmek',
      'Gömme modelinin hangi durumlarda yanlış komşu getirdiğini tanıyabilmek',
      'Bir gömme modelini iş yüküne göre seçme kriterlerini sıralayabilmek',
    ],
    kavramlar: ['embedding', 'vector-database'],
    onkosullar: ['tokenization'],
    govde: [
      {
        tip: 'kisa-cevap',
        metin:
          'Gömme (embedding), bir metni sabit uzunlukta bir sayı dizisine — bir vektöre — çeviren dönüşümdür. Amaç, anlamca yakın metinlerin bu uzayda birbirine yakın düşmesi; böylece "benzerlik" bir geometri problemine indirgenir.',
      },
      { tip: 'altbaslik', metin: 'Teori: anlamı koordinata taşımak', kimlik: 'teori' },
      {
        tip: 'paragraf',
        metin:
          'Bir metni yüzlerce veya binlerce boyutlu bir uzayda bir nokta olarak düşünün. Gömme modeli bu noktayı, eğitim sırasında öğrendiği ilişkilere göre yerleştirir. "Fatura" ile "irsaliye" birbirine yakın düşer; "fatura" ile "yağmur" uzak. Bu yakınlık kelime eşleşmesinden değil bağlamsal kullanımdan gelir.',
      },
      {
        tip: 'paragraf',
        metin:
          'Yakınlık ölçüsü olarak kosinüs benzerliği kullanılır: iki vektör arasındaki açının kosinüsü. Açı ölçüldüğü için vektörün uzunluğu — yani metnin uzunluğu — sonucu bozmaz. Bu, farklı uzunluktaki metinleri karşılaştırabilmenin anahtarı.',
      },
      { tip: 'altbaslik', metin: 'Örnek: benzerlik nerede yanılır?', kimlik: 'ornek' },
      {
        tip: 'tablo',
        basliklar: ['Sorgu', 'Gömme neyi getirir', 'Sorun'],
        satirlar: [
          [
            '"izin süreci nasıl"',
            'İzin, tatil, devamsızlık prosedürleri',
            'Sorun yok: kavramsal sorgu',
          ],
          [
            '"madde 7/b"',
            'Mevzuattan rastgele maddeler',
            'Kesin ifade anlamsal olarak ayırt edilemez',
          ],
          [
            '"faturayı iptal etmeyin"',
            'Fatura iptal prosedürü',
            'Olumsuzluk vektörde zayıf temsil edilir',
          ],
          ['"SKU 44821"', 'Başka SKU kayıtları', 'Rakam dizileri birbirine benzer görünür'],
        ],
        aciklama:
          'Niteliksel örnekler. Bu tablo, neden hibrit aramaya (gömme + lexical) ihtiyaç duyulduğunu gösterir.',
      },
      {
        tip: 'uyari',
        ton: 'bilgi',
        metin:
          'Olumsuzluk ve kesin terim, gömme aramanın iki klasik zayıf noktası. Kurumsal belge setlerinde ikisi de sık görülür; bu yüzden lexical katman ihmal edilmemeli.',
      },
      { tip: 'altbaslik', metin: 'Model seçimi', kimlik: 'model-secimi' },
      {
        tip: 'liste',
        ogeler: [
          'Dil kapsamı: Türkçe performansı ölçülmüş mü, yoksa varsayılıyor mu?',
          'Boyut: yüksek boyut daha iyi temsil ama daha fazla depolama ve arama maliyeti.',
          'Girdi sınırı: modelin kabul ettiği maksimum token sayısı parçalama stratejinizi belirler.',
          'Asimetri: soru ve belge için ayrı önek/model gerektiren kurulumlar daha iyi sonuç verebilir.',
          'Kararlılık: model sürümü değişirse tüm dizini yeniden üretmek gerekir.',
        ],
      },
      {
        tip: 'paragraf',
        metin:
          'Son madde en çok gözden kaçan operasyonel risk. Gömme modelini değiştirmek, sorgu tarafını değiştirmekle bitmez: mevcut tüm vektörler eski uzayda üretilmiştir ve yeni sorgu vektörüyle karşılaştırılamaz. Geçiş planı, yeniden dizinleme maliyetini içermek zorunda.',
      },
    ],
    alistirma: {
      baslik: 'Komşuluk denetimi yapın',
      adimlar: [
        'Kendi belge setinizden 20 parça seçip gömme vektörlerini üretin.',
        'Beş gerçek kullanıcı sorusu yazın; her biri için en yakın beş komşuyu listeleyin.',
        'Her sonucu "ilgili / ilgisiz" olarak elle işaretleyin.',
        'İlk beşteki ilgili oranını hesaplayın; bu sizin başlangıç ölçümünüz.',
        'Kesin terim ve olumsuzluk içeren iki soru ekleyip aynı ölçümü tekrarlayın.',
      ],
      cikti:
        'Beş soru için ilk-beş ilgili oranı ve gömme aramanın zayıf kaldığı sorgu tiplerinin listesi.',
    },
    sss: [
      {
        soru: 'Gömme boyutu büyük olan model her zaman daha iyi mi?',
        cevap:
          'Hayır. Boyut arttıkça temsil kapasitesi artabilir ama depolama, bellek ve arama maliyeti de artar. Kararı boyuta değil, kendi belge setinizde ölçülmüş geri getirme kalitesine dayandırın.',
      },
      {
        soru: 'Gömme modelini değiştirince ne yapmak gerekir?',
        cevap:
          'Tüm belge parçalarının vektörlerini yeni modelle yeniden üretmek gerekir. Farklı modellerin vektör uzayları karşılaştırılabilir değildir; karıştırmak sessiz kalite kaybı üretir.',
      },
    ],
    testSlug: 'rag-testi',
  },

  /* ---------------------------------------------------------------------- */
  'parcalama-stratejileri': {
    hedefler: [
      'Parça uzunluğu ile geri getirme kalitesi arasındaki dengeyi kurabilmek',
      'Belge yapısına göre doğru parçalama yöntemini seçebilmek',
      'Örtüşme (overlap) ve üst veri kararlarını gerekçelendirebilmek',
      'Parçalama hatalarını geri getirme ölçümünden teşhis edebilmek',
    ],
    kavramlar: ['rag', 'embedding'],
    onkosullar: ['embedding'],
    govde: [
      {
        tip: 'kisa-cevap',
        metin:
          'Parçalama, belgeyi aranabilir birimlere bölme işidir. RAG kalitesinde en belirleyici ve en çok ihmal edilen adımdır: kötü parçalanmış bir belge, hangi model ve hangi arama yöntemi kullanılırsa kullanılsın kötü sonuç verir.',
      },
      { tip: 'altbaslik', metin: 'Teori: iki yönlü baskı', kimlik: 'teori' },
      {
        tip: 'paragraf',
        metin:
          'Parça küçük olduğunda arama isabetli olur ama bağlam eksik kalır: model doğru cümleyi bulur, ancak o cümlenin hangi koşulda geçerli olduğunu bilmez. Parça büyük olduğunda bağlam tamdır ama arama bulanıklaşır: parça çok konudan söz eder, gömme vektörü ortalamaya kaçar ve isabet düşer.',
      },
      {
        tip: 'paragraf',
        metin:
          'Bu yüzden doğru soru "ideal parça uzunluğu kaç token" değil. Doğru soru şu: bu belge türünde anlamın kendi içinde tamamlandığı en küçük birim nedir? Bir mevzuat metninde bu bir madde; bir teknik dokümanda bir alt başlık; bir tabloda bir satır artı başlık; bir sohbet kaydında bir soru-cevap çifti.',
      },
      { tip: 'altbaslik', metin: 'Örnek: belge türüne göre strateji', kimlik: 'ornek' },
      {
        tip: 'tablo',
        basliklar: ['Belge türü', 'Doğal birim', 'Yöntem', 'Dikkat'],
        satirlar: [
          [
            'Mevzuat, sözleşme',
            'Madde / fıkra',
            'Yapısal bölme',
            'Madde numarasını parçanın içinde tutun',
          ],
          [
            'Teknik dokümantasyon',
            'Alt başlık bölümü',
            'Başlık hiyerarşisiyle bölme',
            'Üst başlıkları parçaya önek olarak ekleyin',
          ],
          [
            'Tablo ve elektronik çizelge',
            'Satır',
            'Satır + başlık birleştirme',
            'Başlık satırı her parçaya kopyalanmalı',
          ],
          [
            'Destek kaydı, sohbet',
            'Soru-cevap çifti',
            'Diyalog bölme',
            'Rolleri (müşteri/temsilci) koruyun',
          ],
          ['Sunum', 'Slayt', 'Slayt bazlı', 'Notlar alanını birleştirin'],
          ['Uzun makale', 'Paragraf grubu', 'Özyinelemeli bölme', 'Cümle ortasından kesmeyin'],
        ],
        aciklama: 'Yönlendirici tablo; kendi setinizde ölçmeden sabit bir kural benimsemeyin.',
      },
      { tip: 'altbaslik', metin: 'Örtüşme ve üst veri', kimlik: 'ortusme' },
      {
        tip: 'paragraf',
        metin:
          'Örtüşme, komşu parçaların bir miktar ortak metin paylaşması demek. Sınırın tam üstüne düşen bilgiyi kurtarır ama depolama ve gürültüyü artırır. Yapısal bölme yapıldığında örtüşme ihtiyacı büyük ölçüde azalır: madde ve başlık sınırları doğal kesim noktalarıdır.',
      },
      {
        tip: 'kod',
        dil: 'json',
        metin: `{
  "parca_kimligi": "prosedur-izin-v3#madde-7b",
  "metin": "7/b) Yıllık izin talebi, en az yedi gün önce ...",
  "ust_veri": {
    "belge": "İzin Prosedürü",
    "surum": "v3",
    "yururluk": "2026-01-01",
    "baslik_yolu": ["İzinler", "Yıllık izin", "Talep süreci"],
    "madde": "7/b",
    "dil": "tr",
    "erisim_grubu": "tum-calisanlar"
  }
}`,
      },
      {
        tip: 'uyari',
        ton: 'dikkat',
        metin:
          'Erişim grubu (yetki) bilgisi üst veride yoksa, RAG sistemi kullanıcının görmemesi gereken belgeyi cevaba karıştırabilir. Yetki filtresi arama sorgusunun parçası olmalı, sonradan uygulanan bir kontrol değil.',
      },
      { tip: 'altbaslik', metin: 'Teşhis: hata parçalamada mı?', kimlik: 'teshis' },
      {
        tip: 'liste',
        ogeler: [
          'Doğru belge geliyor ama yanlış bölüm: parça çok büyük, bölme daha ince olmalı.',
          'Hiçbir şey gelmiyor: parça çok küçük veya üst veri öneki eksik.',
          'Cevap yarım kalıyor: ilgili bilgi iki parçaya bölünmüş; örtüşme veya yapısal bölme gerekli.',
          'Yanlış sürüm geliyor: üst veride yürürlük tarihi ve sürüm filtresi yok.',
          'Tablo cevapları saçmalıyor: başlık satırı parçalara kopyalanmamış.',
        ],
      },
    ],
    alistirma: {
      baslik: 'İki strateji karşılaştırın',
      adimlar: [
        'Kendi belge setinizden 10 belge seçin ve 15 gerçek soru yazın.',
        'Birinci strateji: sabit uzunlukta bölme (örneğin 800 token, 100 örtüşme).',
        'İkinci strateji: başlık hiyerarşisine göre yapısal bölme, başlık yolu önek olarak eklenmiş.',
        'Her iki dizinde aynı 15 soruyu koşturun; ilk beş sonucu elle işaretleyin.',
        'İki stratejinin ilk-beş ilgili oranını ve ortalama parça uzunluğunu karşılaştırın.',
      ],
      cikti:
        'İki parçalama stratejisinin aynı soru setindeki geri getirme kalitesi karşılaştırması ve seçim gerekçesi.',
    },
    sss: [
      {
        soru: 'Sabit uzunlukta bölme hiç kullanılmamalı mı?',
        cevap:
          'Yapısı olmayan metinler (ham transkript, taranmış serbest metin) için makul bir başlangıçtır. Yapısı olan belgelerde ise yapısal bölme neredeyse her zaman daha iyi sonuç verir.',
      },
      {
        soru: 'Örtüşme oranı ne olmalı?',
        cevap:
          'Yapısal bölme yapıyorsanız çoğu durumda örtüşmeye gerek kalmaz. Sabit uzunlukta bölmede parça uzunluğunun onda biri ile sekizde biri arası yaygın bir başlangıç; kararı kendi ölçümünüze göre verin.',
      },
    ],
    testSlug: 'rag-testi',
  },

  /* ---------------------------------------------------------------------- */
  'hibrit-arama': {
    hedefler: [
      'Anlamsal ve lexical aramanın hangi sorgu tiplerinde güçlü olduğunu ayırt edebilmek',
      'İki sıralama listesini karşılıklı sıra birleştirmesiyle birleştirebilmek',
      'Yeniden sıralayıcının ne zaman değer kattığını değerlendirebilmek',
      'Geri getirme kalitesini ölçülebilir bir metriğe bağlayabilmek',
    ],
    kavramlar: ['rag', 'vector-database', 'embedding'],
    onkosullar: ['embedding', 'rag'],
    govde: [
      {
        tip: 'kisa-cevap',
        metin:
          'Hibrit arama, anlamsal (vektör) ve lexical (kelime) aramayı paralel koşturup iki sonuç listesini tek listede birleştirmektir. Kurumsal belge setlerinde neredeyse her zaman tek yöntemden iyi sonuç verir, çünkü iki yöntemin zayıf noktaları farklıdır.',
      },
      { tip: 'altbaslik', metin: 'Teori: iki farklı körlük', kimlik: 'teori' },
      {
        tip: 'paragraf',
        metin:
          'Lexical arama kelimeyi görür, anlamı görmez: "fatura" arayan kişiye "irsaliye" getirmez. Anlamsal arama anlamı görür, kelimeyi görmez: "madde 7/b" arayan kişiye anlamca yakın ama numarası farklı maddeleri getirir. İki yöntem birbirinin körlüğünü kapatır.',
      },
      { tip: 'altbaslik', metin: 'Birleştirme: neden puan değil sıra?', kimlik: 'birlestirme' },
      {
        tip: 'paragraf',
        metin:
          'İki yöntemin ürettiği puanlar aynı ölçekte değil: kosinüs benzerliği sınırlı bir aralıkta, lexical puan ise belge uzunluğuna ve terim seyrekliğine göre serbestçe değişir. Bu yüzden puanları doğrudan toplamak yanıltıcı. Karşılıklı sıra birleştirmesi (reciprocal rank fusion) bunun yerine yalnızca sıraları kullanır.',
      },
      {
        tip: 'kod',
        dil: 'python',
        metin: `def karsilikli_sira_birlestir(listeler, k=60):
    """Her belgenin, bulunduğu listelerdeki sıralarının tersini toplar.

    listeler: her biri sıralı belge kimliği listesi (en iyi en başta)
    k: küçük sıraların baskınlığını yumuşatan sabit
    """
    puanlar = {}
    for liste in listeler:
        for sira, kimlik in enumerate(liste, start=1):
            puanlar[kimlik] = puanlar.get(kimlik, 0) + 1 / (k + sira)
    return sorted(puanlar, key=puanlar.get, reverse=True)


# Kullanım
birlesik = karsilikli_sira_birlestir([
    anlamsal_ara(sorgu, n=50),
    lexical_ara(sorgu, n=50),
])`,
      },
      {
        tip: 'paragraf',
        metin:
          'Yöntemin iki pratik avantajı var: ölçek uyumu gerektirmez ve üçüncü bir sinyal (örneğin başlık eşleşmesi veya güncellik) eklemek için yeni bir liste vermek yeterlidir.',
      },
      { tip: 'altbaslik', metin: 'Yeniden sıralama', kimlik: 'yeniden-siralama' },
      {
        tip: 'paragraf',
        metin:
          'Birleştirilmiş listenin ilk 20-50 adayı, bir cross-encoder ile yeniden puanlanabilir. Cross-encoder sorgu ve belgeyi birlikte okur; bu yüzden gömme aramadan daha isabetli ama çok daha yavaştır. Bu nedenle tüm dizine değil yalnızca ilk adaylara uygulanır.',
      },
      {
        tip: 'akis',
        adimlar: [
          {
            ad: 'Sorgu hazırlığı',
            aciklama: 'Kısaltmalar açılır, yetki ve tarih filtreleri eklenir.',
          },
          {
            ad: 'Paralel arama',
            aciklama: 'Anlamsal ve lexical arama aynı anda, geniş n ile koşar.',
          },
          { ad: 'Birleştirme', aciklama: 'Karşılıklı sıra birleştirmesiyle tek liste üretilir.' },
          { ad: 'Yeniden sıralama', aciklama: 'İlk 20-50 aday cross-encoder ile puanlanır.' },
          { ad: 'Bağlam kurma', aciklama: 'İlk k parça, kaynak künyesiyle isteme yerleştirilir.' },
        ],
      },
      {
        tip: 'uyari',
        ton: 'bilgi',
        metin:
          'Yeniden sıralayıcı gecikme ekler. Etkileşimli bir arayüzde önce birleştirilmiş sonucu göstermek, yeniden sıralamayı arka planda tamamlamak makul bir uzlaşma olabilir.',
      },
      { tip: 'altbaslik', metin: 'Ölçüm', kimlik: 'olcum' },
      {
        tip: 'liste',
        ogeler: [
          'Recall@k: doğru parça ilk k sonuç içinde var mı? RAG için en kritik metrik.',
          'MRR: doğru parçanın sırasının tersi; üstte olmasını ödüllendirir.',
          'nDCG: birden çok ilgili parça olduğunda sıralama kalitesini ölçer.',
          'Boş dönüş oranı: hiç sonuç gelmeyen sorgu yüzdesi; içerik açığının göstergesi.',
        ],
      },
    ],
    alistirma: {
      baslik: 'Hibrit aramayı ölçerek kurun',
      adimlar: [
        '20 gerçek sorgu ve her biri için doğru kabul edilen parçaları elle işaretleyin.',
        'Yalnızca anlamsal arama ile Recall@5 ölçün.',
        'Yalnızca lexical arama ile Recall@5 ölçün.',
        'Karşılıklı sıra birleştirmesiyle hibrit kurun ve Recall@5 ölçün.',
        'İlk 30 adaya yeniden sıralayıcı uygulayıp Recall@5 ile gecikmeyi birlikte raporlayın.',
      ],
      cikti:
        'Dört kurulumun Recall@5 ve p95 gecikme karşılaştırması; üretim için seçilen kurulumun gerekçesi.',
    },
    sss: [
      {
        soru: 'Hibrit arama her zaman daha iyi mi?',
        cevap:
          'Kurumsal belge setlerinde genellikle evet. Ancak yalnızca kavramsal sorguların geldiği, kod ve kimlik içermeyen setlerde tek başına anlamsal arama yeterli olabilir. Kararı kendi sorgu günlüğünüzle verin.',
      },
      {
        soru: 'RRF sabiti k neden 60?',
        cevap:
          'Literatürde yaygın bir başlangıç değeri; ilk sıraların aşırı baskın olmasını yumuşatır. Kendi setinizde 10-100 aralığını denemek anlamlı bir ayar çalışmasıdır.',
      },
    ],
    testSlug: 'rag-testi',
  },

  /* ---------------------------------------------------------------------- */
  'arac-semasi-tasarimi': {
    hedefler: [
      'Modelin doğru aracı seçmesini kolaylaştıran adlandırma ve açıklama yazabilmek',
      'Parametre şemasını doğrulanabilir biçimde tanımlayabilmek',
      'Hata mesajlarını modelin düzeltebileceği biçimde döndürebilmek',
      'Araç sayısının seçim isabetine etkisini değerlendirebilmek',
    ],
    kavramlar: ['ai-agent', 'mcp'],
    onkosullar: ['ai-agent'],
    govde: [
      {
        tip: 'kisa-cevap',
        metin:
          'Araç şeması, bir ajanın dış dünyayla konuşma sözleşmesidir. Ajan arızalarının büyük kısmı model kalitesinden değil, belirsiz araç adlarından, gevşek parametre tanımlarından ve modelin yorumlayamadığı hata mesajlarından kaynaklanır.',
      },
      { tip: 'altbaslik', metin: 'Teori: model şemayı okuyarak karar verir', kimlik: 'teori' },
      {
        tip: 'paragraf',
        metin:
          'Model hangi aracı çağıracağına, elindeki tek bilgiyle karar verir: araç adı, açıklaması ve parametre şeması. Kodun içinde ne olduğunu görmez. Dolayısıyla şema bir dokümantasyon değil, çalışma zamanı davranışını belirleyen bir arayüz.',
      },
      {
        tip: 'liste',
        ogeler: [
          'Ad ayırt edici olmalı: "ara" değil "musteri_kaydi_ara".',
          'Açıklama ne zaman kullanılacağını söylemeli, ne yaptığını değil: "Müşteri kimliği bilinmiyorsa ada göre arama yapar."',
          'Örtüşen araçlar birleştirilmeli: aynı işi yapan iki araç tutarsız seçim üretir.',
          'Yıkıcı araçlar ayrı ve açıkça işaretlenmeli: "kaydi_kalici_sil (GERİ ALINAMAZ)".',
        ],
      },
      { tip: 'altbaslik', metin: 'Örnek: zayıf ve güçlü şema', kimlik: 'ornek' },
      {
        tip: 'kod',
        dil: 'json',
        metin: `// ZAYIF: ne zaman kullanılacağı belirsiz, parametreler serbest metin
{
  "name": "get_data",
  "description": "Veri getirir",
  "parameters": {
    "type": "object",
    "properties": {
      "query": { "type": "string" },
      "options": { "type": "string" }
    }
  }
}

// GÜÇLÜ: seçim ölçütü açık, değerler kısıtlı, zorunluluk belirtilmiş
{
  "name": "siparis_durumu_sorgula",
  "description": "Sipariş numarası BİLİNİYORSA tek siparişin güncel durumunu döndürür. Sipariş numarası bilinmiyorsa önce musteri_siparislerini_listele kullan.",
  "parameters": {
    "type": "object",
    "properties": {
      "siparis_no": {
        "type": "string",
        "pattern": "^SIP-[0-9]{4}-[0-9]{4}$",
        "description": "SIP-YYYY-NNNN biçiminde sipariş numarası"
      },
      "detay": {
        "type": "string",
        "enum": ["ozet", "kalemler", "tam"],
        "default": "ozet",
        "description": "Dönecek ayrıntı seviyesi"
      }
    },
    "required": ["siparis_no"],
    "additionalProperties": false
  }
}`,
      },
      {
        tip: 'paragraf',
        metin:
          'Güçlü şemadaki üç detay pratikte en çok fark yaratanlar: `enum` ile değer kümesini kapatmak, `pattern` ile biçimi zorlamak ve açıklamanın içinde diğer araca yönlendirme yapmak. Üçü de modelin tahmin etme ihtiyacını azaltır.',
      },
      { tip: 'altbaslik', metin: 'Hata mesajı tasarımı', kimlik: 'hata' },
      {
        tip: 'paragraf',
        metin:
          'Bir araç hata döndürdüğünde bu mesaj modele geri gider ve sonraki adımı belirler. "500 Internal Server Error" modelin yapabileceği bir şey söylemez; model ya aynı çağrıyı tekrarlar ya da vazgeçer. İyi bir hata mesajı, düzeltme yolunu içerir.',
      },
      {
        tip: 'tablo',
        basliklar: ['Durum', 'Kötü mesaj', 'İyi mesaj'],
        satirlar: [
          [
            'Biçim hatası',
            '"Invalid input"',
            '"siparis_no biçimi geçersiz. Beklenen: SIP-YYYY-NNNN. Alınan: 44821."',
          ],
          [
            'Bulunamadı',
            '"404"',
            '"SIP-2026-0412 bulunamadı. Numara doğruysa musteri_siparislerini_listele ile doğrula."',
          ],
          [
            'Yetki yok',
            '"Forbidden"',
            '"Bu kayda erişim yetkisi yok. Kullanıcıdan onay isteyin; bu araçla devam edilemez."',
          ],
          [
            'Hız sınırı',
            '"429"',
            '"Hız sınırı aşıldı. 30 saniye sonra tekrar dene; bu arada başka araç çağırma."',
          ],
        ],
        aciklama: 'İyi mesaj üç şey içerir: ne oldu, neden oldu, şimdi ne yapılmalı.',
      },
      {
        tip: 'uyari',
        ton: 'dikkat',
        metin:
          'Hata mesajlarına iç sistem ayrıntısı (yığın izi, tablo adı, dosya yolu) koymayın. Bu bilgiler modelin bağlamına, oradan da kullanıcı çıktısına sızabilir.',
      },
      { tip: 'altbaslik', metin: 'Araç sayısı', kimlik: 'arac-sayisi' },
      {
        tip: 'paragraf',
        metin:
          'Araç sayısı arttıkça iki şey birden kötüleşir: şemaların kapladığı token miktarı büyür ve seçim isabeti düşer. Pratik yaklaşım, ajan başına araç sayısını dar tutmak ve geniş yetenek ihtiyacını birden çok uzmanlaşmış ajana bölmek.',
      },
    ],
    alistirma: {
      baslik: 'Araç setinizi sadeleştirin',
      adimlar: [
        'Mevcut ajanınızın tüm araçlarını listeleyin; her biri için "hangi durumda seçilmeli" cümlesini yazın.',
        'İki aracın cümlesi örtüşüyorsa birleştirin veya açıklamaları ayırt edici hale getirin.',
        'Her parametreye enum, pattern veya aralık kısıtı ekleyebilir misiniz? Ekleyin.',
        'Her hata yolunu, düzeltme yönlendirmesi içeren bir mesajla yeniden yazın.',
        '20 görevlik setinizi tekrar koşturun; yanlış araç seçimi sayısını önce/sonra karşılaştırın.',
      ],
      cikti:
        'Sadeleştirilmiş araç şeması seti ve yanlış araç seçimi sayısının önce/sonra karşılaştırması.',
    },
    sss: [
      {
        soru: 'Kaç araç fazla sayılır?',
        cevap:
          'Kesin bir eşik yok, ama pratikte tek ajan için beşin altında kalmak seçim isabetini belirgin biçimde korur. Daha fazla yetenek gerekiyorsa işi birden çok uzmanlaşmış ajana bölmek genellikle daha iyi sonuç verir.',
      },
      {
        soru: 'Araç şemasını modelden gizlemek mümkün mü?',
        cevap:
          'Hayır; model seçim yapabilmek için şemayı görmek zorunda. Bu yüzden şemanın kendisi bir güvenlik sınırı değildir. Yetki kısıtı araç içinde, sunucu tarafında uygulanmalı.',
      },
    ],
    testSlug: 'ai-agent-testi',
  },

  /* ---------------------------------------------------------------------- */
  'gorev-seti-kurmak': {
    hedefler: [
      'Gerçek işten görev seçme ölçütlerini uygulayabilmek',
      'Doğrulanabilir bir beklenen son durum yazabilmek',
      'Geliştirme ve karar kümelerini ayırabilmek',
      'Yedi temel metriği tek raporda sunabilmek',
    ],
    kavramlar: ['evaluation', 'ai-agent'],
    onkosullar: ['evaluation'],
    govde: [
      {
        tip: 'kisa-cevap',
        metin:
          'Görev seti, kurumun kendi işinden alınmış ve son durumu makine tarafından doğrulanabilen görevlerden oluşan kapalı bir değerlendirme kümesidir. Model seçimi, istem değişikliği ve sürüm kararı bu set üzerinden verilir.',
      },
      { tip: 'altbaslik', metin: 'Teori: neden kamuya açık benchmark yetmez', kimlik: 'teori' },
      {
        tip: 'paragraf',
        metin:
          'Üç yapısal sorun var. Birincisi temsil: benchmark, sizin işinizi ölçmüyor. İkincisi sızıntı: yayımlanmış bir test seti gelecekteki eğitim verisinin parçası olabilir, bu yüzden skor artışı yetenek artışı anlamına gelmeyebilir. Üçüncüsü granülerlik: tek bir skor, hangi alt yetenekte zayıf olduğunuzu söylemez.',
      },
      { tip: 'altbaslik', metin: 'Görev seçme ölçütleri', kimlik: 'olcutler' },
      {
        tip: 'liste',
        sirali: true,
        ogeler: [
          'Gerçek olsun: üretim kayıtlarından alınmış, uydurulmamış.',
          'Doğrulanabilir olsun: son durum makine tarafından kontrol edilebilsin.',
          'Geri alınabilir olsun: değerlendirme koşusu kalıcı yan etki bırakmasın.',
          'Ayırt edici olsun: iki model arasında farklı sonuç üretme ihtimali olsun.',
          'Dağılımı temsil etsin: kolay, orta ve zor vakalar birlikte bulunsun.',
          'Başarısızlıkları içersin: üretimde hata veren gerçek vakalar sete girsin.',
        ],
      },
      {
        tip: 'uyari',
        ton: 'bilgi',
        metin:
          'Herkesin doğru cevap verdiği görevler sette yer tutar ama bilgi üretmez. Setin değeri, modelleri birbirinden ayırt eden görevlerde.',
      },
      { tip: 'altbaslik', metin: 'Örnek: bir görev kaydı', kimlik: 'ornek' },
      {
        tip: 'kod',
        dil: 'yaml',
        metin: `kimlik: destek-iade-014
kaynak: "üretim kaydı #88412 (anonimleştirildi)"
hedef: "İade talebini politikaya göre değerlendir ve uygun kuyruğa yönlendir."
girdi:
  mesaj: "Ürünü 40 gün önce aldım, kutusu açılmadı, iade etmek istiyorum."
  musteri_tipi: bireysel
  urun_kategorisi: elektronik
beklenen_son_durum:
  karar: "politika-disi"
  kuyruk: "istisna-degerlendirme"
  musteriye_bildirim: true
  degistirilen_kayit_sayisi: 1
kabul:
  yan_etki_yok: true
  maksimum_arac_cagrisi: 4
  kaynak_gosterme: "iade politikası md. 4"
zorluk: zor
not: "30 günlük sınırın hemen üstünde; modelin istisna yolunu seçmesi beklenir."`,
      },
      {
        tip: 'paragraf',
        metin:
          '`kabul` bölümü, doğruluğun ötesindeki kalite koşullarını taşır. "Yan etki yok" ve "maksimum araç çağrısı" olmadan bir model görevi tamamlar ama yolda gereksiz değişiklikler yapabilir; bu üretimde kabul edilemez.',
      },
      { tip: 'altbaslik', metin: 'Küme ayrımı', kimlik: 'kume' },
      {
        tip: 'tablo',
        basliklar: ['Küme', 'Kim görür', 'Ne için kullanılır'],
        satirlar: [
          ['Geliştirme (≈%70)', 'Ekip serbestçe görür', 'İstem ve akış iyileştirme, hata teşhisi'],
          [
            'Karar (≈%30)',
            'Yalnızca sürüm kararında açılır',
            'Sürüm onayı, model değişikliği kararı',
          ],
        ],
        aciklama:
          'Oran yönlendirici. Karar kümesini sık açmak, klasik aşırı uyum sorununu geri getirir.',
      },
      { tip: 'altbaslik', metin: 'Rapor', kimlik: 'rapor' },
      {
        tip: 'liste',
        ogeler: [
          'Tamamlama oranı (genel ve zorluk kırılımlı)',
          'Adım verimliliği: görev başına ortalama araç çağrısı',
          'Kurtarma oranı: hatadan sonra göreve dönüş yüzdesi',
          'Yan etki sayısı: hedef dışı değişiklik toplamı',
          'Kalibrasyon: bilmediğinde bilmediğini söyleme oranı',
          'Kararlılık: aynı görevin tekrarlı koşularında sonuç değişkenliği',
          'Birim maliyet: tamamlanmış görev başına token, süre ve para',
        ],
      },
      {
        tip: 'uyari',
        ton: 'dikkat',
        metin:
          'Bu yedi metriği tek bir skora indirmeyin. Ağırlıklandırma kararı iş bağlamına aittir ve tek sayı, hangi eksende bozulduğunuzu gizler.',
      },
    ],
    alistirma: {
      baslik: 'İlk 30 görevi yazın',
      adimlar: [
        'Üretim kayıtlarından 30 gerçek vaka seçin: 10 kolay, 10 orta, 10 zor.',
        'Her vakanın beklenen son durumunu iki kişi bağımsız yazsın; farkları tartışıp uzlaşın.',
        'Doğrulama kodunu yazın: son durumu otomatik kontrol eden bir fonksiyon.',
        '10 vakayı karar kümesi olarak ayırın ve ayrı bir yerde kilitleyin.',
        'Mevcut kurulumunuzu koşturup yedi metriği raporlayın; bu sizin temel çizginiz.',
      ],
      cikti:
        'Doğrulama kodu yazılmış 30 görevlik set, geliştirme/karar ayrımı ve ilk temel çizgi raporu.',
    },
    sss: [
      {
        soru: 'Beklenen çıktıyı model yazabilir mi?',
        cevap:
          'Taslak olarak yardımcı olabilir ama son karar insana ait olmalı. Modelin yazdığı beklenen çıktı, modelin kendi eğilimlerini sete kodlar ve ölçümü körleştirir.',
      },
      {
        soru: 'LLM-as-judge kullanmak doğru mu?',
        cevap:
          'Makine tarafından doğrulanamayan öznel çıktılarda pratik bir çözüm, ancak tek başına yeterli değil. En az bir insan kalibrasyon turu yapılmalı ve yargıç modelin kendi eğilimleri raporda not edilmeli.',
      },
      {
        soru: 'Set ne zaman güncellenir?',
        cevap:
          'Takvimle değil olayla: her üretim arızası, her yeni kullanım senaryosu ve her sağlayıcı sürüm değişikliği sete vaka ekleme fırsatıdır.',
      },
    ],
    testSlug: 'degerlendirme-testi',
  },

  /* ---------------------------------------------------------------------- */
  'yetki-tasarimi': {
    hedefler: [
      'Bir ajan akışı için en kötü senaryo analizini yapabilmek',
      'Araç yetkilerini en az yetki ilkesine göre daraltabilmek',
      'Onay kapısı ile geri alma arasında doğru tercihi yapabilmek',
      'Çıkış kontrolü ve kum havuzu kararlarını gerekçelendirebilmek',
    ],
    kavramlar: ['prompt-injection', 'ai-agent', 'mcp'],
    onkosullar: ['ai-agent'],
    govde: [
      {
        tip: 'kisa-cevap',
        metin:
          'Ajan güvenliğinde tasarım sorusu "model kandırılabilir mi" değil, "kandırıldığında en fazla ne yapabilir". En az yetki ilkesi, bu cevabı kabul edilebilir seviyede tutmanın en güvenilir yolu.',
      },
      { tip: 'altbaslik', metin: 'Teori: yetki zarfı', kimlik: 'teori' },
      {
        tip: 'paragraf',
        metin:
          'Bir ajanın yetki zarfı, çağırabildiği araçların yapabileceklerinin birleşimidir. Model katmanındaki hiçbir savunma — sistem istemi, filtre, sınıflandırıcı — bu zarfı küçültmez; yalnızca zarf içinde kalma olasılığını artırır. Zarfın kendisini küçültmek, araç ve ağ katmanında yapılan bir iştir.',
      },
      {
        tip: 'alinti',
        metin:
          'Bir ajanın yapabileceği en kötü şey, en yüksek yetkili aracının yapabileceği en kötü şeydir.',
        kaynak: 'Sinaptik Lab — ajan güvenliği notları',
      },
      { tip: 'altbaslik', metin: 'Örnek: en kötü senaryo analizi', kimlik: 'ornek' },
      {
        tip: 'tablo',
        basliklar: ['Araç', 'Mevcut yetki', 'En kötü sonuç', 'Daraltma'],
        satirlar: [
          [
            'belge_ara',
            'Tüm belge dizini',
            'Kullanıcının yetkisi olmayan belge cevaba karışır',
            'Sorguya kullanıcı yetki grubu filtresi zorunlu eklenir',
          ],
          [
            'eposta_gonder',
            'Herhangi bir adrese',
            'Veri dışa sızar',
            'Yalnızca kurum içi alan adlarına; dışa gönderim onaya bağlı',
          ],
          [
            'kayit_guncelle',
            'Tüm tablolar',
            'Üretim verisi bozulur',
            'Yalnızca belirlenen tablo ve alanlar; tüm değişiklikler denetim kaydına',
          ],
          [
            'kod_calistir',
            'Ana makinede',
            'Sistem devralınır',
            'Ağ erişimi kesilmiş kum havuzu, süre ve bellek sınırı',
          ],
        ],
        aciklama: 'Bu analizi her ajan akışı için yazmak, tasarımın ilk adımı olmalı.',
      },
      { tip: 'altbaslik', metin: 'Onay mı, geri alma mı?', kimlik: 'onay' },
      {
        tip: 'paragraf',
        metin:
          'Her eyleme onay koymak, onay yorgunluğu üretir: kullanıcı okumadan onaylamaya başlar ve kontrol kâğıt üstünde kalır. Doğru ayrım, eylemin geri alınabilirliğine göre yapılır.',
      },
      {
        tip: 'liste',
        ogeler: [
          'Geri alınamaz ve dışa dönük (e-posta göndermek, ödeme başlatmak, kalıcı silmek): onay kapısı.',
          'Geri alınabilir ve iç (etiket eklemek, kuyruk değiştirmek, taslak yazmak): denetim kaydı ve geri alma.',
          'Yalnızca okuma: kayıt yeterli, onay gereksiz.',
          'Belirsiz olanlar: önce onaya bağla, ölçüp güven kazanınca gevşet.',
        ],
      },
      { tip: 'altbaslik', metin: 'Çıkış kontrolü', kimlik: 'cikis' },
      {
        tip: 'paragraf',
        metin:
          'Dolaylı istem enjeksiyonunda saldırganın nihai hedefi genellikle veriyi dışarı taşımak. Bu yüzden en etkili tek kontrol, ajanın çıkabildiği ağ hedeflerini izin listesiyle sınırlamak. Ajan bir URL çağırabiliyorsa, o URL saldırganın sunucusu olabilir.',
      },
      {
        tip: 'kod',
        dil: 'text',
        metin: `# Yetki tasarımı kontrol listesi

[ ] Bu akış hangi güvenilmeyen içeriği okuyor?  (web, e-posta, yüklenen belge)
[ ] Aynı bağlamda hangi yıkıcı araçlar var?     -> varsa AYIR
[ ] Her aracın kapsamı göreve göre daraltıldı mı?
[ ] Geri alınamaz eylemler onay kapısında mı?
[ ] Dış ağ erişimi izin listesiyle sınırlı mı?
[ ] Kod çalıştırma kum havuzunda ve ağsız mı?
[ ] Araç çağrıları iz kaydına yazılıyor mu?
[ ] Anormal desen için alarm var mı?            (ör. beklenmeyen dış adres)`,
      },
      {
        tip: 'uyari',
        ton: 'dikkat',
        metin:
          'Sistem isteminde "gömülü talimatlara uymayacaksın" yazmak bir güvenlik kontrolü değil, bir tercih beyanıdır. Denetimde kanıt olarak kabul edilmez.',
      },
    ],
    alistirma: {
      baslik: 'Ajanınızın yetki zarfını küçültün',
      adimlar: [
        'Ajanınızın tüm araçlarını listeleyin; her biri için en kötü sonucu tek cümleyle yazın.',
        'Güvenilmeyen içerik okuyan akışları işaretleyin; bu akışlardaki yıkıcı araçları ayırın.',
        'Her aracın kapsamını göreve indirin: tablo, alan, alan adı, dizin düzeyinde.',
        'Geri alınamaz eylemleri onay kapısına, geri alınabilirleri denetim kaydına bağlayın.',
        'Dış ağ erişimi için izin listesi tanımlayın ve liste dışını engelleyin.',
        'Kırmızı takım denemesi yapın: bir belgeye gömülü talimatla veri sızdırmayı deneyin.',
      ],
      cikti:
        'Araç bazlı en kötü senaryo tablosu, daraltılmış yetki tanımları ve kırmızı takım denemesinin sonucu.',
    },
    sss: [
      {
        soru: 'Ajan tamamen güvenli hale getirilebilir mi?',
        cevap:
          'Bugünkü bilgiyle model düzeyinde tam güvence sağlanmış sayılmıyor. Pratik hedef, riski sıfırlamak değil etkisini kabul edilebilir seviyeye indirmek: en az yetki, onay kapısı, çıkış kontrolü ve kum havuzu.',
      },
      {
        soru: 'Kum havuzunda ağ erişimi neden kapatılmalı?',
        cevap:
          'Kod çalıştırabilen ve ağa çıkabilen bir ajan, hem veriyi dışarı taşıyabilir hem dış bir kaynaktan yeni talimat çekebilir. Ağı kesmek, kod çalıştırma yetkisinin en tehlikeli sonucunu ortadan kaldırır.',
      },
    ],
    testSlug: 'ai-guvenligi-testi',
  },

  /* ---------------------------------------------------------------------- */
  'ai-kullanim-senaryosu-secimi': {
    hedefler: [
      'Bir kullanım senaryosunu etki ve uygulanabilirlik eksenlerinde konumlandırabilmek',
      'Hangi işlerin yapay zekâya uygun olmadığını gerekçeli biçimde ayırabilmek',
      'Pilot kapsamını ölçülebilir bir başarı tanımına bağlayabilmek',
      'Yapay zekâ portföyünü risk sınıfına göre dengeleyebilmek',
    ],
    kavramlar: ['artificial-intelligence'],
    govde: [
      {
        tip: 'kisa-cevap',
        metin:
          'İyi bir ilk kullanım senaryosu üç özelliği birlikte taşır: yüksek tekrar sayısı, makine tarafından doğrulanabilir çıktı ve hata maliyetinin geri alınabilir olması. Bu üçü yoksa senaryo teknik olarak mümkün olsa da kurumsal olarak riskli.',
      },
      { tip: 'altbaslik', metin: 'Teori: iki eksen, dört bölge', kimlik: 'teori' },
      {
        tip: 'paragraf',
        metin:
          'Senaryoları iki eksende konumlandırmak, tartışmayı görüşten karara taşır. Yatay eksen uygulanabilirlik: veri var mı, süreç tanımlı mı, çıktı doğrulanabilir mi? Dikey eksen etki: kaç kez tekrarlanıyor, birim başına ne kadar zaman veya para kurtarıyor?',
      },
      {
        tip: 'tablo',
        basliklar: ['Bölge', 'Etki', 'Uygulanabilirlik', 'Karar'],
        satirlar: [
          ['Hızlı kazanım', 'Yüksek', 'Yüksek', 'Hemen başla; pilot buradan seçilir'],
          ['Stratejik yatırım', 'Yüksek', 'Düşük', 'Önce eksiği kapat (veri, süreç, yetenek)'],
          ['Vitrin projesi', 'Düşük', 'Yüksek', 'Demo değeri var, üretim önceliği yok'],
          ['Dağınık istek', 'Düşük', 'Düşük', 'Kapat; kayda geç ve gerekçesini yaz'],
        ],
        aciklama: 'Matrisin amacı sıralama yapmak; puan üretmek değil.',
      },
      { tip: 'altbaslik', metin: 'Uygun olmayan işler', kimlik: 'uygun-olmayan' },
      {
        tip: 'liste',
        ogeler: [
          'Tek doğru cevabı olan ve kuralla yazılabilen işler: yapay zekâ gereksiz karmaşıklık ekler.',
          'Hata maliyeti geri alınamaz ve yüksek olan tek adımlı kararlar: insan gözetimi olmadan yapılmamalı.',
          'Girdi verisinin kurumda hiç bulunmadığı işler: model veriyi yaratamaz.',
          'Başarının tanımlanamadığı işler: ölçülemeyen bir iyileştirme yönetilemez.',
          'Yasal olarak insan kararı gerektiren süreçler: otomasyon yükümlülüğü ortadan kaldırmaz.',
        ],
      },
      {
        tip: 'uyari',
        ton: 'bilgi',
        metin:
          'En sık yapılan hata, en görünür işi seçmek. Yönetim kuruluna sunulacak proje ile ilk pilot aynı olmak zorunda değil; ilk pilotun görevi öğrenmek.',
      },
      { tip: 'altbaslik', metin: 'Başarı tanımı', kimlik: 'basari' },
      {
        tip: 'paragraf',
        metin:
          'Pilot başlamadan önce tek sayfalık bir kabul belgesi yazılmalı. Bu belge üç soruyu cevaplar: hangi metrik, hangi hedef değer, hangi ölçüm yöntemi. Üçü yazılmadan başlayan pilot, sonunda "işe yaradı mı" tartışmasına düşer.',
      },
      {
        tip: 'akis',
        adimlar: [
          {
            ad: 'Metrik',
            aciklama: 'Ölçülecek iş metriğini seçin: süre, maliyet, hata oranı, kapasite.',
          },
          {
            ad: 'Temel çizgi',
            aciklama: 'Bugünkü değeri ölçün; yoksa pilot öncesi iki hafta ölçün.',
          },
          { ad: 'Hedef', aciklama: 'Kabul edilebilir iyileşmeyi sayıyla yazın.' },
          { ad: 'Yöntem', aciklama: 'Nasıl ölçüleceğini ve kimin ölçeceğini belirleyin.' },
          {
            ad: 'Karar tarihi',
            aciklama: 'Devam/durdur kararının verileceği tarihi peşinen koyun.',
          },
        ],
      },
      { tip: 'altbaslik', metin: 'Portföy dengesi', kimlik: 'portfoy' },
      {
        tip: 'paragraf',
        metin:
          'Tek bir projeye bağlanmak da, on projeyi aynı anda başlatmak da başarısızlık kalıbı. Sağlıklı portföy: bir veya iki hızlı kazanım (öğrenme ve güven inşası), bir stratejik yatırım (altyapı ve veri), ve düzenli olarak kapatılan dağınık istekler.',
      },
    ],
    alistirma: {
      baslik: 'Kendi matrisinizi doldurun',
      adimlar: [
        'Kurumdan gelen 10 yapay zekâ talebini toplayın; her birini tek cümleyle yazın.',
        'Her talep için tekrar sayısını ve birim başına kurtarılan zamanı tahmin edin (etki ekseni).',
        'Her talep için veri, süreç ve doğrulanabilirlik durumunu işaretleyin (uygulanabilirlik ekseni).',
        'Talepleri dört bölgeye yerleştirin ve hızlı kazanım bölgesinden bir pilot seçin.',
        'Seçilen pilot için tek sayfalık kabul belgesini yazın: metrik, temel çizgi, hedef, yöntem, karar tarihi.',
      ],
      cikti:
        'Doldurulmuş etki–uygulanabilirlik matrisi, seçilen pilot ve tek sayfalık kabul belgesi.',
    },
    sss: [
      {
        soru: 'Pilot ne kadar sürmeli?',
        cevap:
          'Cevabı aranan soruyu cevaplayacak en kısa süre; pratikte 4-6 hafta çoğu senaryo için yeterli. Daha uzun süren pilotlar genellikle kapsam belirsizliğinin işareti.',
      },
      {
        soru: 'Hızlı kazanım bölgesinde hiç senaryo yoksa?',
        cevap:
          'Bu, yapay zekâ değil veri ve süreç çalışması gerektiğini gösteriyor. Bu durumda doğru hamle pilot başlatmak değil, bir hazırlık değerlendirmesi yapıp eksik boyutu kapatmak.',
      },
    ],
    testSlug: 'ai-temelleri-testi',
  },
};
