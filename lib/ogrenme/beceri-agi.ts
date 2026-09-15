/**
 * Beceri ağı — KOD DÜZEYİ TAKSONOMİ.
 *
 * Burada duran tek şey ÖNKOŞUL İLİŞKİSİDİR: "X'i öğrenmek için önce Y gerekir".
 * Bu ilişki içerik değil, editoryal bir yargıdır ve panelden değiştirilecek bir
 * liste değildir — bir kenar silindiğinde üretilen her öğrenme rotası değişir.
 * Bu yüzden `lib/taksonomi.ts` ile aynı gerekçeyle sürüm kontrolünde kalır.
 *
 * KENARLAR GEÇİŞLİ OLARAK İNDİRGENMİŞTİR. `atlas.onkosullar` alanı da önkoşul
 * taşır ama iki nedenle bu çizgenin kaynağı değildir: değerleri slug değil
 * GÖRÜNEN AD'dır ("Embedding") ve 35 kaydın yalnızca 22'sinde doludur. Yine de
 * iki kaynak birbirini denetler — `npm run icerik:denetim` Atlas'taki her
 * önkoşulun burada doğrudan ya da geçişli olarak karşılandığını sınar.
 *
 * Buradaki liste yalnızca DOĞRUDAN önkoşulları taşır. Atlas'ta "Transformer
 * için Neural Networks gerekir" yazar; bu doğrudur ama zaten
 * `transformer ← attention ← deep-learning ← neural-networks` zincirinden
 * gelir. Geçişli kenarı ayrıca yazmak rotayı değiştirmez, yalnızca diyagramı
 * okunmaz hâle getirir.
 *
 * DÜĞÜMLER UYDURULMAZ: her düğüm yayındaki bir Atlas girdisinin slug'ıdır.
 * Ad, özet ve seviye Atlas kaydından okunur; ders, test, lab projesi ve meslek
 * bağları ise HALİHAZIRDA VAR OLAN alanlardan türetilir:
 *
 *   - `dersler.kavramlar` → atlas   (148 dersin tamamında dolu)
 *   - `lab_projeleri.kavramlar` → atlas
 *   - `meslekler.ilgiliAtlas` → atlas
 *   - `testler.konuSlug` → konular  (düğümün `konuSlug`u üzerinden)
 *
 * Yani bu dosya yeni bir içerik katmanı AÇMAZ; var olan bağları bir çizgeye
 * bağlar. Sitede zaten duran 148 ders ve 100 test, ilk kez "hangi kavram için"
 * sorusuna göre erişilebilir hâle gelir.
 *
 * ÖNCEKİ HÂL: `lib/veri/ogrenme.ts` içinde 17 düğümlük elle yazılmış bir liste
 * vardı. Düğümlerin yarısında Atlas karşılığı yoktu, hiçbirinde ders, test veya
 * meslek bağı yoktu ve grafik yalnızca çizilip bırakılıyordu — üzerinde hiçbir
 * işlem yapılamıyordu. Bir çizgenin değeri çizilmesinde değil, ÜZERİNDE YOL
 * BULUNABİLMESİNDEDİR.
 */

/** Düğümün `konuSlug`u `konular` koleksiyonundaki bir slug olmalıdır. */
export type BeceriTanimi = {
  /** Yayındaki bir `atlas` slug'ı. */
  slug: string;
  /** Yayındaki bir `konular` slug'ı — test ve konu merkezi bağı buradan kurulur. */
  konuSlug: string;
  /** Doğrudan önkoşullar; hepsi bu listede tanımlı bir slug olmalı. */
  onkosullar: string[];
  /**
   * Bu kavramın AÇTIĞI kapı.
   *
   * Çizgelerin çoğu okla yetinir ve okun neden orada olduğunu söylemez. Bir ok
   * bilgi taşımaz; "önce şunu öğren çünkü şu olmadan bu anlaşılmaz" cümlesi
   * taşır. Rota üretildiğinde her adımın yanında bu cümle basılır.
   */
  kapi: string;
};

export const BECERI_TANIMLARI: readonly BeceriTanimi[] = [
  {
    slug: 'artificial-intelligence',
    konuSlug: 'yapay-zeka-temelleri',
    onkosullar: [],
    kapi: 'Alanın sınırlarını çizer: hangi problem yapay zekâ problemidir, hangisi düz bir yazılım problemi. Bu ayrım yapılmadan seçilen her araç fazla ya da eksik gelir.',
  },
  {
    slug: 'machine-learning',
    konuSlug: 'makine-ogrenmesi',
    onkosullar: ['artificial-intelligence'],
    kapi: 'Kuralı elle yazmak ile veriden çıkarmak arasındaki farkı kurar. Sonraki her konu bu ayrımın üzerine oturur.',
  },
  {
    slug: 'neural-networks',
    konuSlug: 'derin-ogrenme',
    onkosullar: ['machine-learning'],
    kapi: 'Öğrenmenin katmanlı bir yapıda nasıl gerçekleştiğini verir; derin öğrenme ve transformer bu yapının üzerine kurulur.',
  },
  {
    slug: 'deep-learning',
    konuSlug: 'derin-ogrenme',
    onkosullar: ['neural-networks'],
    kapi: 'Ölçek ile yeteneğin nasıl ilişkilendiğini gösterir; modern modellerin neden büyük olduğu sorusunun cevabı buradadır.',
  },
  {
    slug: 'tokenization',
    konuSlug: 'llm',
    onkosullar: [],
    kapi: 'Metnin modele hangi birimlerle girdiğini verir. Bağlam bütçesi, maliyet ve Türkçede yaşanan kayıpların hepsi bu birimle ölçülür.',
  },
  {
    slug: 'embedding',
    konuSlug: 'vektor-veritabanlari',
    onkosullar: ['tokenization', 'neural-networks'],
    kapi: 'Anlamı koordinata çevirir; arama, benzerlik ve geri getirmenin tamamı bu temsile dayanır.',
  },
  {
    slug: 'attention',
    konuSlug: 'derin-ogrenme',
    onkosullar: ['deep-learning'],
    kapi: 'Modelin girdinin hangi kısmına bakacağına nasıl karar verdiğini açıklar; transformer mimarisinin çekirdeğidir.',
  },
  {
    slug: 'transformer',
    konuSlug: 'derin-ogrenme',
    onkosullar: ['attention', 'embedding'],
    kapi: 'Bugünkü dil modellerinin mimarisini verir. Bağlam penceresi sınırının ve maliyetin nereden geldiği ancak burada anlaşılır.',
  },
  {
    slug: 'llm',
    konuSlug: 'llm',
    onkosullar: ['transformer', 'tokenization'],
    kapi: 'Uygulama katmanının tamamının üzerine kurulduğu bileşen. Buradan sonraki her konu bir dil modelinin varlığını varsayar.',
  },
  {
    slug: 'generative-ai',
    konuSlug: 'uretken-yapay-zeka',
    onkosullar: ['deep-learning'],
    kapi: 'Sınıflandırma ile üretim arasındaki farkı kurar: çıktının tek doğrusu olmadığında değerlendirme de değişir.',
  },
  {
    slug: 'context-window',
    konuSlug: 'baglam-muhendisligi',
    onkosullar: ['llm'],
    kapi: 'Modele tek seferde ne kadar bilgi verilebileceğinin sınırını koyar; geri getirme ihtiyacının kaynağı bu sınırdır.',
  },
  {
    slug: 'prompt-engineering',
    konuSlug: 'prompt-muhendisligi',
    onkosullar: ['llm'],
    kapi: 'Modelden istenen davranışı elde etmenin ilk katmanı. Tek başına yeterli değildir ama olmadan hiçbir katman kurulamaz.',
  },
  {
    slug: 'reasoning',
    konuSlug: 'akil-yurutme',
    onkosullar: ['llm'],
    kapi: 'Modelin çok adımlı çıkarım yapabilme kapasitesini tanıtır; ajan mimarilerinin dayandığı yetenek budur.',
  },
  {
    slug: 'chain-of-thought',
    konuSlug: 'akil-yurutme',
    onkosullar: ['prompt-engineering', 'reasoning'],
    kapi: 'Akıl yürütmeyi görünür kılan tekniği verir; adımların kaydedilebilmesi hem hata ayıklamayı hem değerlendirmeyi mümkün kılar.',
  },
  {
    slug: 'hallucination',
    konuSlug: 'degerlendirme',
    onkosullar: ['llm'],
    kapi: 'Bu sistemlerdeki temel başarısızlık modunu tanıtır. Neyin ölçüleceğine karar vermeden önce neyin yanlış gidebileceğini bilmek gerekir.',
  },
  {
    slug: 'evaluation',
    konuSlug: 'degerlendirme',
    onkosullar: ['llm', 'hallucination'],
    kapi: 'Bir sistemin iyi çalıştığını iddia etmek ile göstermek arasındaki farkı kurar. Üretime çıkan her karar bu ölçüme dayanır.',
  },
  {
    slug: 'fine-tuning',
    konuSlug: 'fine-tuning',
    onkosullar: ['llm', 'evaluation'],
    kapi: 'Modelin davranışını değiştirmenin yolunu verir — bilgi eklemenin değil. İkisini ayırmak, geri getirme ile fine-tuning arasındaki seçimi mümkün kılar.',
  },
  {
    slug: 'semantic-search',
    konuSlug: 'hibrit-arama',
    onkosullar: ['embedding'],
    kapi: 'Kelime eşleşmesi olmadan ilgili belgeyi bulmayı sağlar; geri getirmenin yarısı buradan gelir.',
  },
  {
    slug: 'vector-database',
    konuSlug: 'vektor-veritabanlari',
    onkosullar: ['embedding'],
    kapi: 'Gömme temsillerini ölçekte saklama ve arama yolunu verir; dizin tazeliği ve yetki sınırı sorunları burada başlar.',
  },
  {
    slug: 'chunking',
    konuSlug: 'rag',
    onkosullar: ['tokenization', 'embedding'],
    kapi: 'Belgenin hangi büyüklükte parçalara ayrılacağına karar verdirir. RAG kalitesinin en belirleyici ve en çok küçümsenen adımıdır.',
  },
  {
    slug: 'reranking',
    konuSlug: 'hibrit-arama',
    onkosullar: ['semantic-search'],
    kapi: 'Getirilen adayları yeniden sıralar; ilk k sonucun kalitesini arama motorunu değiştirmeden yükseltmenin yoludur.',
  },
  {
    slug: 'rag',
    konuSlug: 'rag',
    onkosullar: ['llm', 'vector-database', 'chunking', 'semantic-search'],
    kapi: 'Modelin cevabını kurumun kendi belgelerine dayandırır. Bağlam penceresi sınırının ve güncel bilgi ihtiyacının birlikte çözümüdür.',
  },
  {
    slug: 'function-calling',
    konuSlug: 'arac-cagirma',
    onkosullar: ['llm'],
    kapi: 'Modelin metin üretmekten çıkıp iş yapmasını sağlar; ajan mimarisinin ilk yapı taşıdır ve ilk risk yüzeyidir.',
  },
  {
    slug: 'mcp',
    konuSlug: 'arac-cagirma',
    onkosullar: ['function-calling'],
    kapi: 'Araç bağlantısını standart bir arayüze taşır; her sağlayıcı için ayrı entegrasyon yazma zorunluluğunu kaldırır.',
  },
  {
    slug: 'ai-agent',
    konuSlug: 'ai-agent',
    onkosullar: ['function-calling', 'reasoning', 'prompt-engineering'],
    kapi: 'Sıralaması önceden yazılmamış çok adımlı görevleri mümkün kılar. Aynı esneklik, davranışı deterministik olmaktan çıkarır.',
  },
  {
    slug: 'prompt-injection',
    konuSlug: 'ajan-guvenligi',
    onkosullar: ['prompt-engineering', 'ai-agent'],
    kapi: 'Bu sistemlerdeki temel saldırı yüzeyini tanıtır: veri ile talimat aynı kanaldan gelir, dolayısıyla okunan her içerik bir komut olabilir.',
  },
  {
    slug: 'guardrails',
    konuSlug: 'ai-guvenlik',
    onkosullar: ['prompt-injection', 'evaluation'],
    kapi: 'Modelin yanlış yönlendirildiğinde ne yapabileceğini sınırlar. Savunmanın taşıyıcı katmanı istem değil yetkidir.',
  },
  {
    slug: 'mlops',
    konuSlug: 'mlops',
    onkosullar: ['machine-learning'],
    kapi: 'Modeli bir deneyden bir üretim varlığına çevirir: sürümleme, dağıtım, izleme ve geri alma.',
  },
  {
    slug: 'llmops',
    konuSlug: 'gozlemlenebilirlik',
    onkosullar: ['mlops', 'evaluation'],
    kapi: 'Ana varlığın model ağırlıkları değil istem ve bağlam hattı olduğu durumu ele alır; sağlayıcı sürümü habersiz değiştiğinde ne olacağını çözer.',
  },
  {
    slug: 'quantization',
    konuSlug: 'cikarim-optimizasyonu',
    onkosullar: ['deep-learning'],
    kapi: 'Modeli daha az bellekle çalıştırmanın yolunu ve bedelini verir; uç cihaz ve maliyet kararlarının temelidir.',
  },
  {
    slug: 'mixture-of-experts',
    konuSlug: 'ai-altyapi',
    onkosullar: ['transformer'],
    kapi: 'Büyük modelin her istekte tamamının çalışmadığı mimariyi açıklar; parametre sayısı ile çalışma maliyeti arasındaki kopukluğun nedenidir.',
  },
  {
    slug: 'multimodal-ai',
    konuSlug: 'cok-modlu-uretim',
    onkosullar: ['transformer', 'generative-ai'],
    kapi: 'Metin dışı girdilerin aynı temsile nasıl taşındığını verir; görsel, ses ve videonun tek modelle işlenmesini mümkün kılar.',
  },
  {
    slug: 'computer-vision',
    konuSlug: 'computer-vision',
    onkosullar: ['deep-learning'],
    kapi: 'Görüntüden anlam çıkarmayı verir. Verinin fiziksel dünyadan gelmesi, etiketleme ve saha koşullarını işin merkezine taşır.',
  },
  {
    slug: 'embodied-ai',
    konuSlug: 'robotik',
    onkosullar: ['computer-vision', 'ai-agent'],
    kapi: 'Kararı fiziksel eyleme çevirir; geri alınamazlık ve gerçek zamanlılık kısıtları burada devreye girer.',
  },
  {
    slug: 'responsible-ai',
    konuSlug: 'yapay-zeka-etigi',
    onkosullar: ['evaluation', 'hallucination'],
    kapi: 'Teknik ölçümü etik ve hukuki sorumlulukla birleştirir; alt grup performansı ve şeffaflık yükümlülükleri burada okunur.',
  },
];

/* --- ÇİZGE İŞLEMLERİ ------------------------------------------------------ */

const TANIM_HARITASI = new Map(BECERI_TANIMLARI.map((t) => [t.slug, t]));

/**
 * Topolojik derinlik: düğümün en uzun önkoşul zincirinin uzunluğu.
 *
 * Ziyaret kümesi döngüye karşı korumadır. Çizge tanım gereği yönlü ve
 * döngüsüzdür ama tanımı elle yazan biri bir gün döngü kurabilir; o durumda
 * sayfa sonsuz döngüye girmek yerine 0 döner ve `dogrula()` hatayı bildirir.
 */
export function derinlikler(): Map<string, number> {
  const bellek = new Map<string, number>();

  function hesapla(slug: string, ziyaret: Set<string>): number {
    const onbellek = bellek.get(slug);
    if (onbellek !== undefined) return onbellek;
    if (ziyaret.has(slug)) return 0;
    ziyaret.add(slug);

    const tanim = TANIM_HARITASI.get(slug);
    const deger =
      !tanim || tanim.onkosullar.length === 0
        ? 0
        : Math.max(...tanim.onkosullar.map((o) => hesapla(o, ziyaret))) + 1;

    ziyaret.delete(slug);
    bellek.set(slug, deger);
    return deger;
  }

  for (const tanim of BECERI_TANIMLARI) hesapla(tanim.slug, new Set());
  return bellek;
}

/** Ters kenarlar: bir kavramın AÇTIĞI düğümler. */
export function acilanlar(): Map<string, string[]> {
  const harita = new Map<string, string[]>();
  for (const tanim of BECERI_TANIMLARI) {
    for (const onkosul of tanim.onkosullar) {
      const mevcut = harita.get(onkosul) ?? [];
      mevcut.push(tanim.slug);
      harita.set(onkosul, mevcut);
    }
  }
  return harita;
}

export type Rota = {
  /** Öğrenilecek düğümler, önkoşul sırasıyla. */
  sira: string[];
  /** Hedefin önkoşulu olup KULLANICI TARAFINDAN BİLİNDİĞİ söylenen düğümler. */
  atlanan: string[];
  /** Çizgede bulunamayan slug'lar — sessizce yutulmaz. */
  bilinmeyen: string[];
};

/**
 * Hedefe giden EN KISA öğrenme sırası.
 *
 * Geriye doğru yürür: hedeften başlayıp önkoşullarını, onların önkoşullarını
 * toplar. "Bilinen" işaretli düğümler ve onların tüm önkoşul ağacı düşer —
 * bir kavramı bilen biri onun önkoşullarını da biliyordur.
 *
 * Sonuç derinliğe göre sıralanır: aynı derinlikteki düğümler birbirinden
 * bağımsız öğrenilebilir, dolayısıyla aralarındaki sıra keyfîdir ve ada göre
 * sabitlenir (aynı girdi her zaman aynı rotayı versin diye).
 */
export function rotaCikar(hedefler: readonly string[], bilinenler: readonly string[]): Rota {
  const bilinen = new Set(bilinenler.filter((s) => TANIM_HARITASI.has(s)));
  const bilinmeyen = [...hedefler, ...bilinenler].filter((s) => !TANIM_HARITASI.has(s));

  // Bilinen bir düğümün önkoşulları da bilinir sayılır.
  const bilinenKapanisi = new Set<string>();
  const yigin = [...bilinen];
  while (yigin.length) {
    const slug = yigin.pop()!;
    if (bilinenKapanisi.has(slug)) continue;
    bilinenKapanisi.add(slug);
    yigin.push(...(TANIM_HARITASI.get(slug)?.onkosullar ?? []));
  }

  const gerekli = new Set<string>();
  const atlanan = new Set<string>();
  const kuyruk = hedefler.filter((s) => TANIM_HARITASI.has(s));
  while (kuyruk.length) {
    const slug = kuyruk.pop()!;
    if (gerekli.has(slug)) continue;
    if (bilinenKapanisi.has(slug)) {
      atlanan.add(slug);
      continue;
    }
    gerekli.add(slug);
    kuyruk.push(...(TANIM_HARITASI.get(slug)?.onkosullar ?? []));
  }

  const derinlik = derinlikler();
  const sira = [...gerekli].sort(
    (a, b) => (derinlik.get(a) ?? 0) - (derinlik.get(b) ?? 0) || a.localeCompare(b, 'tr'),
  );

  return { sira, atlanan: [...atlanan].sort(), bilinmeyen: [...new Set(bilinmeyen)] };
}

/**
 * Tanımın kendi içindeki tutarlılığı.
 *
 * Atlas ve konu slug'larının GERÇEKTEN var olduğu burada denetlenemez — bu
 * modül veritabanına bakmaz. O denetim `npm run icerik:denetim` içindedir.
 * Burada yalnızca çizgenin kendi kuralları sınanır: tanımsız önkoşul, kendine
 * gönderen kenar ve döngü.
 */
export function dogrula(): string[] {
  const hatalar: string[] = [];
  const gorulen = new Set<string>();

  for (const tanim of BECERI_TANIMLARI) {
    if (gorulen.has(tanim.slug)) hatalar.push(`${tanim.slug}: slug tekrar ediyor`);
    gorulen.add(tanim.slug);
    for (const onkosul of tanim.onkosullar) {
      if (onkosul === tanim.slug) hatalar.push(`${tanim.slug}: kendini önkoşul gösteriyor`);
      else if (!TANIM_HARITASI.has(onkosul))
        hatalar.push(`${tanim.slug}: tanımsız önkoşul "${onkosul}"`);
    }
  }

  // Döngü tespiti — derinlik hesabı döngüde 0 döner, o yüzden ayrı yürünür.
  const durum = new Map<string, 'isleniyor' | 'bitti'>();
  function yuru(slug: string, yol: string[]): void {
    if (durum.get(slug) === 'bitti') return;
    if (durum.get(slug) === 'isleniyor') {
      hatalar.push(`döngü: ${[...yol, slug].join(' → ')}`);
      return;
    }
    durum.set(slug, 'isleniyor');
    for (const onkosul of TANIM_HARITASI.get(slug)?.onkosullar ?? []) yuru(onkosul, [...yol, slug]);
    durum.set(slug, 'bitti');
  }
  for (const tanim of BECERI_TANIMLARI) yuru(tanim.slug, []);

  return hatalar;
}
