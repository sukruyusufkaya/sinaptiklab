/**
 * Platformun içerik modeli (MASTER-PLAN §9, §10, §69).
 * Kritik prensip: KONU (topic) ile FORMAT (content type) ayrı alanlardır.
 * Bu tipler ileride MongoDB koleksiyon şemalarının karşılığıdır.
 */

export type IcerikTuru =
  | 'haber'
  | 'analiz'
  | 'rehber'
  | 'atlas'
  | 'uygulama'
  | 'arastirma'
  | 'rapor'
  | 'benchmark'
  | 'veri-seti'
  | 'arac'
  | 'model'
  | 'karsilastirma'
  | 'vaka'
  | 'ders'
  | 'ogrenme-yolu'
  | 'test'
  | 'dergi'
  | 'gorus'
  | 'roportaj'
  | 'video';

export type Seviye = 'baslangic' | 'orta' | 'ileri';

/**
 * Editörün panelden yazdığı SEO alanları (§67).
 *
 * Kendi kamuya açık sayfası olan HER içerik tipi bu alanı taşır. Sayfanın
 * `generateMetadata`'sı bunu `lib/seo/ustveri.ts` içindeki
 * `ustveriBirlestir()` ile hesapladığı varsayılanların üzerine uygular —
 * doğrudan okumaz. Tek yardımcıdan geçmesinin nedeni orada yazılı.
 *
 * ALANI TAŞIMAYANLAR — şemasında `seo` olsa da kamuya açık TEK SAYFASI olmayan
 * tipe eklenmez; okunmayacak bir alan tipe yazılırsa sayfası olduğu sanılır:
 *   - `Soru` — soru bankası kaydı; kendi adresi yok (teste gömülü basılır).
 *   - `Uzman` — yalnızca `/uzmanlar/` listesinde görünür, detay rotası yok.
 *   - `DergiYazisi` — şemada `seo` sayı düzeyindedir, yazı öğesinde yoktur.
 *   - brief sayıları — `/brief/` tek sayfadır, sayı başına adres yok.
 */
export type SeoAlanlari = {
  baslik?: string;
  aciklama?: string;
  kanonik?: string;
  dizinlenmesin?: boolean;
  ogGorsel?: string;
};

/**
 * Konu — platformun omurgası (MASTER-PLAN §9).
 *
 * KONU ile FORMAT ayrı alanlardır: "Haber" bir format, "RAG" bir konudur.
 * İçerik, Atlas girdisi, ders ve test aynı `konuSlug` etrafında toplanır.
 *
 * HİYERARŞİ iki düzeylidir: `ustKonuSlug` taşımayan kayıt ANA KONU (pillar),
 * taşıyan kayıt ALT KONUDUR (cluster). Üçüncü düzey bilinçli olarak yok —
 * gezinmeyi karmaşıklaştırır ve kırıntı yolunu okunmaz kılar.
 */
export type Konu = {
  slug: string;
  ad: string;
  kume: string;
  /** Alt konuysa bağlı olduğu ana konunun slug'ı. Ana konuda bulunmaz. */
  ustKonuSlug?: string;
  /** Küme içinde okuma sırası; küçük olan önce gelir. */
  sira?: number;
  /** `/konu/<slug>/` sayfasının giriş metni. */
  ozet?: string;
  seo?: SeoAlanlari;
};

export type Yazar = {
  slug: string;
  ad: string;
  unvan: string;
  basHarfler: string;
  ozgecmis?: string;
  uzmanlik?: string[];
  sosyal?: { etiket: string; adres: string }[];
  seo?: SeoAlanlari;
};

/* --- METİN GÖVDESİ -------------------------------------------------------- */

/** Uzun metin, HTML string yerine yapılandırılmış bloklarla modellenir. */
export type Blok =
  | { tip: 'paragraf'; metin: string }
  | { tip: 'altbaslik'; metin: string; kimlik: string }
  | { tip: 'liste'; ogeler: string[]; sirali?: boolean }
  | { tip: 'kisa-cevap'; metin: string }
  | { tip: 'alinti'; metin: string; kaynak?: string }
  | { tip: 'kod'; dil: string; metin: string }
  | { tip: 'tablo'; basliklar: string[]; satirlar: string[][]; aciklama?: string }
  | { tip: 'akis'; adimlar: { ad: string; aciklama: string }[] }
  | { tip: 'uyari'; ton: 'bilgi' | 'dikkat'; metin: string };

export type Kaynak = {
  ad: string;
  yayinci: string;
  tur: 'Makale' | 'Dokümantasyon' | 'Teknik rapor' | 'Mevzuat' | 'Veri seti' | 'Röportaj';
  adres?: string;
};

export type SurumKaydi = {
  surum: string;
  tarih: string;
  degisiklik: string;
};

export type SSS = {
  soru: string;
  cevap: string;
};

/* --- İÇERİK --------------------------------------------------------------- */

export type Icerik = {
  slug: string;
  yol: string;
  tur: IcerikTuru;
  baslik: string;
  /** Answer-first: tek cümlelik, alıntılanabilir cevap (MASTER-PLAN §56). */
  kisaCevap: string;
  ozet?: string;
  konu: Konu;
  yazar: Yazar;
  yayinTarihi: string;
  guncellemeTarihi?: string;
  okumaDakika: number;
  oneCikan?: boolean;
  etiketler?: string[];
  /** Haber şablonu: Ne oldu → Neden önemli → Teknik detay → Kim etkileniyor → Yorum */
  govde?: Blok[];
  kaynaklar?: Kaynak[];
  ilgiliSluglar?: string[];
  seo?: SeoAlanlari;
};

/** Derin analiz: tez → bağlam → kanıt → karşı görüş → sonuç → ne yapmalı. */
/**
 * Derin analiz: tez → bağlam → kanıt → mekanizma → karşı görüş → sınırlar →
 * sonuç → ne yapmalı.
 *
 * `tezGuveni` ve `yanlislanmaKosulu` bu formatı GÖRÜŞ YAZISINDAN ayıran iki
 * alandır. Bir analiz iddia üretir; iddia üreten metnin okura borcu, o
 * iddianın ne kadar sağlam olduğunu ve hangi gözlemle çürütüleceğini
 * söylemektir. Yanlışlanma koşulu yazılamıyorsa ortada tez değil temenni
 * vardır ve metin yayımlanmamalıdır.
 */
export type Analiz = {
  slug: string;
  baslik: string;
  /** Alıntılanabilir tez cümlesi. */
  girizgah: string;
  konu: string;
  okumaDakika: number;
  yazarSlug: string;
  tarih: string;
  guncellemeTarihi?: string;
  /** Tezin dayandığı kanıtın gücü; okura açıkça bildirilir. */
  tezGuveni?: 'yuksek' | 'orta' | 'dusuk';
  /** Bu tezi çürütecek gözlem. */
  yanlislanmaKosulu?: string;
  govde?: Blok[];
  kaynaklar?: Kaynak[];
  sss?: SSS[];
  ilgiliSluglar?: string[];
  seo?: SeoAlanlari;
};

/* --- RADAR ---------------------------------------------------------------- */

export type RadarYonu = 'yukselen' | 'sabit' | 'dusen';

export type RadarKaydi = {
  slug: string;
  ad: string;
  momentum: number;
  yon: RadarYonu;
  degisim: number;
  sinyaller: {
    yayin: number;
    github: number;
    modelCikisi: number;
    aramaIlgisi: number;
  };
  not?: string;
  seo?: SeoAlanlari;
};

export type BriefMaddesi = {
  numara: string;
  baslik: string;
  neden: string;
  kaynak: string;
  konuSlug: string;
};

/* --- ATLAS ---------------------------------------------------------------- */

export type AtlasGirdisi = {
  slug: string;
  ad: string;
  /** Türkçe karşılık veya kısaltmanın açılımı. */
  altAd?: string;
  kategori: string;
  kisaTanim: string;
  seviye: Seviye;
  ilgili: string[];
  onkosullar?: string[];
  sonDogrulama: string;
  yayinTarihi?: string;
  guncellemeTarihi?: string;
  govde?: Blok[];
  sss?: SSS[];
  kaynaklar?: Kaynak[];
  surumler?: SurumKaydi[];
  yazarSlug?: string;
  inceleyenSlug?: string;
  seo?: SeoAlanlari;
};

/* --- ÖĞRENME -------------------------------------------------------------- */

export type YolBolumu = {
  ad: string;
  ozet: string;
  sure: string;
  kavramlar: string[];
};

export type OgrenmeYolu = {
  slug: string;
  ad: string;
  rol: string;
  seviyeAraligi: string;
  bolum: number;
  saat: number;
  aciklama: string;
  cikti: string[];
  onkosullar?: string[];
  kimeGore?: string;
  bolumler?: YolBolumu[];
  seo?: SeoAlanlari;
};

export type Ders = {
  slug: string;
  ad: string;
  yolSlug: string;
  seviye: Seviye;
  dakika: number;
  ozet: string;
  /** Ders sonunda kazanılacak somut yetiler. */
  hedefler?: string[];
  /** Derste geçen Atlas kavramlarının slug'ları. */
  kavramlar?: string[];
  onkosullar?: string[];
  govde?: Blok[];
  alistirma?: { baslik: string; adimlar: string[]; cikti: string };
  sss?: SSS[];
  testSlug?: string;
  seo?: SeoAlanlari;
};

/* --- TESTLER -------------------------------------------------------------- */

export type Soru = {
  kimlik: string;
  konu: string;
  altKonu: string;
  zorluk: Seviye;
  beceri: string;
  soru: string;
  secenekler: string[];
  dogruIndeks: number;
  aciklama: string;
  ilgiliAtlas?: string;
};

export type Test = {
  slug: string;
  ad: string;
  konu: string;
  soruSayisi: number;
  dakika: number;
  seviye: Seviye;
  ozet: string;
  olculenBeceriler: string[];
  kimlerCozmeli: string;
  ogrenmeHedefleri: string[];
  ornekSorular: Soru[];
  seo?: SeoAlanlari;
};

/* --- MODELLER VE ŞİRKETLER ------------------------------------------------ */

/**
 * AI modeli.
 *
 * OPSİYONELLİK ŞEMAYLA HİZALIDIR. `lib/mongo/koleksiyonlar.ts` içinde
 * `modeller` için zorunlu alanlar yalnızca `slug`, `ad`, `saglayici`, `tip` ve
 * `durum`; geri kalan her şey opsiyoneldir.
 *
 * Bu tip başta `baglamPenceresi`, `vurgu`, `yayin` ve `acikKaynak` alanlarını
 * ZORUNLU ilan ediyordu ve VERİYİ YANLIŞ TANIMLIYORDU. Sonucu bir derleme
 * çökmesiyle görüldü: `components/lab/ModelSeciciArayuzu.tsx` içindeki
 * `model.baglamPenceresi.includes(...)` çağrısı, alanı olmayan bir kayıtta
 * "Cannot read properties of undefined" verdi — TypeScript uyarmadı, çünkü tip
 * alanın her zaman var olduğunu söylüyordu. Araştırma kayıtları doğrulanamayan
 * alanı bilinçli olarak yazmadığı için (uydurma veri yasağı, CLAUDE.md §5) bu
 * durum kural, istisna değil.
 */
export type AiModeli = {
  slug: string;
  ad: string;
  saglayici: string;
  saglayiciSlug?: string;
  /**
   * Bu model bir ailenin ÜYESİYSE ailenin hub kaydının slug'ı.
   *
   * Tek yönlü: hub kendi üyelerini dizi olarak tutmaz, üyeler hub'ı işaret
   * eder (`saglayiciSlug` ile aynı kalıp). Hub kaydında bu alan BULUNMAZ.
   */
  aileSlug?: string;
  /** Bu kayıt tek bir modeli değil bir AİLEYİ anlatıyor mu. */
  aileMi?: boolean;
  tip: string;
  baglamPenceresi?: string;
  acikKaynak?: boolean;
  /** Ağırlıklar indirilebilir mi — `acikKaynak` ile aynı şey DEĞİL. */
  acikAgirlik?: boolean;
  lisans?: string;
  yayin?: string;
  surum?: string;
  durum: 'guncel' | 'yeni' | 'onceki-surum';
  vurgu?: string;
  ozet?: string;
  yetenekler?: string[];
  siniriliklar?: string[];
  kullanimAlanlari?: string[];
  api?: boolean;
  modaliteler?: string[];
  fiyatlandirma?: {
    girdiBirimFiyat?: number;
    ciktiBirimFiyat?: number;
    birim?: string;
    paraBirimi?: string;
    kaynakAdres?: string;
  };
  kaynaklar?: Kaynak[];
  sonDogrulama?: string;
  seo?: SeoAlanlari;
};

export type Sirket = {
  slug: string;
  ad: string;
  tur: string;
  merkez: string;
  kurulus: string;
  alan: string;
  ozet: string;
  urunler: string[];
  modelSluglari?: string[];
  kilometreTaslari?: { tarih: string; olay: string }[];
  seo?: SeoAlanlari;
};

export type Arac = {
  slug: string;
  ad: string;
  kategori: string;
  neIse: string;
  kimKullanmali: string;
  enIyiKullanim: string;
  alternatifler: string[];
  fiyat: string;
  artilar: string[];
  eksiler: string[];
  degerlendirme: string;
  /** Aracı yapan şirket; karşılığı `sirketler` içinde yoksa yazılmaz. */
  sirketSlug?: string;
  seo?: SeoAlanlari;
};

/* --- ARAŞTIRMA ------------------------------------------------------------ */

export type ArastirmaYayini = {
  slug: string;
  baslik: string;
  tur: 'Rapor' | 'Benchmark' | 'Veri Seti' | 'Whitepaper' | 'Index' | 'Not';
  ozet: string;
  veriNoktasi: string;
  veriEtiketi: string;
  tarih: string;
  yontem?: string[];
  kapsam?: { etiket: string; deger: string }[];
  bulgular?: string[];
  sinirliliklar?: string[];
  atifFormati?: string;
  lisans?: string;
  /** Yayının tam metni: yönetici özeti, bölümler, tablolar. */
  govde?: Blok[];
  sss?: SSS[];
  ilgiliSluglar?: string[];
  seo?: SeoAlanlari;
};

/* --- KURUMSAL ------------------------------------------------------------- */

export type Hizmet = {
  slug: string;
  ad: string;
  ozet: string;
  problem: string;
  cozum: string;
  kullanimAlanlari: string[];
  mimari?: string[];
  guvenlik?: string[];
  sss?: SSS[];
  seo?: SeoAlanlari;
};

export type SektorKaydi = {
  slug: string;
  ad: string;
  ozet: string;
  kullanimSayisi: number;
  kullanimAlanlari?: string[];
  teknolojiler?: string[];
  riskler?: string[];
  seo?: SeoAlanlari;
};

export type VakaCalismasi = {
  slug: string;
  baslik: string;
  sektor: string;
  problem: string;
  yaklasim: string;
  teknolojiler: string[];
  etki: { etiket: string; deger: string }[];
  dersler: string[];
  seo?: SeoAlanlari;
};

/* --- DERGİ ---------------------------------------------------------------- */

export type DergiYazisi = {
  slug: string;
  baslik: string;
  bolum: string;
  ozet: string;
  yazarSlug: string;
  okumaDakika: number;
  govde?: Blok[];
  kaynaklar?: Kaynak[];
  ilgiliSluglar?: string[];
};

/**
 * `seo` YALNIZCA SAYI DÜZEYİNDE vardır.
 *
 * `dergiSayilari` şemasında `seo` üst düzey bir alandır; `yazilar` dizisinin
 * öğelerinde yoktur. Bu yüzden `/dergi/<sayi>/<yazi>/` sayfasının üstverisi
 * panelden ayarlanamaz — alan `DergiYazisi`e eklenirse şemanın da (başka bir
 * ajanın alanı) genişletilmesi gerekir.
 */
export type DergiSayisi = {
  slug: string;
  sayi: string;
  kapakKonusu: string;
  ozet: string;
  tarih: string;
  yazilar: DergiYazisi[];
  seo?: SeoAlanlari;
};

/* --- TOPLULUK ------------------------------------------------------------- */

/**
 * Uzman koltuğu.
 *
 * AÇIK KOLTUK DA BİR KAYITTIR. `koltukDurumu` alanı eskiden yoktu ve sayfa
 * boş koltukları `ad === 'Katkı bekleniyor'` karşılaştırmasıyla ayırıyordu —
 * görünen ada göre eşleştirme, bu projede tekrar eden bir hata sınıfı. Metin
 * bir boşluk kadar değişse tüm açık koltuklar dolu sayılırdı.
 */
export type Uzman = {
  slug: string;
  ad: string;
  unvan: string;
  alan: string;
  /** Koltuğun bağlı olduğu konu; `/konu/<slug>/` merkezine bağlanır. */
  alanSlug?: string;
  koltukDurumu?: 'dolu' | 'acik';
  basHarfler: string;
  ozgecmis?: string;
  /** Koltuğun üstlendiği editoryal iş. */
  sorumluluklar?: string[];
  /** Başvuranda aranan doğrulanabilir nitelikler. */
  aranan?: string[];
  /** Koltuğun karşılığında sunulanlar. */
  sunulan?: string[];
  /** İnceleyebileceği içerik türleri. */
  kapsam?: string[];
  katkilar?: string[];
};

export type Etkinlik = {
  slug: string;
  ad: string;
  tur: 'Webinar' | 'Workshop' | 'Meetup' | 'Konferans';
  tarih: string;
  bicim: string;
  ozet: string;
  durum: 'planlandi' | 'kayit-acik' | 'gecti';
  seo?: SeoAlanlari;
};

export type PodcastBolumu = {
  slug: string;
  numara: number;
  ad: string;
  konuk: string;
  dakika: number;
  ozet: string;
  cikarimlar: string[];
  tarih: string;
  seo?: SeoAlanlari;
};

/* --- LAB ------------------------------------------------------------------ */

export type LabProjesi = {
  slug: string;
  ad: string;
  tur: 'Araç' | 'Deney' | 'Açık Kaynak' | 'Demo';
  ozet: string;
  durum?: 'yayinda' | 'gelistiriliyor';
  girdiler?: { etiket: string; birim: string }[];
  seo?: SeoAlanlari;
};

/* --- KARİYER -------------------------------------------------------------- */

/** Kıdem basamağı — unvan değil, sorumluluk sınıfı. */
export type MeslekBasamagi = 'giris' | 'orta' | 'kidemli' | 'lider';

export type MeslekSeviyesi = {
  basamak: MeslekBasamagi;
  ad: string;
  odak: string;
  sorumluluklar: string[];
  /** Bu basamakta olunduğunu gösteren doğrulanabilir işaret. */
  kanit?: string;
};

export type Meslek = {
  slug: string;
  ad: string;
  ozet: string;
  /** Answer-first paragraf (MASTER-PLAN §56). */
  kisaCevap?: string;
  /** İngilizce ve alternatif unvanlar — arama niyetiyle eşleşme için. */
  esAdlar?: string[];
  rolAilesi?: string;
  konuSlug?: string;
  neYapar: string[];
  beceriler: string[];
  teknolojiler: string[];
  seviyeler?: MeslekSeviyesi[];
  gunlukIs?: { dilim: string; is: string }[];
  ciktilar?: string[];
  olcutler?: { ad: string; aciklama: string }[];
  girisYollari?: string[];
  portfolyo?: { ad: string; aciklama: string; kanit?: string; labSlug?: string }[];
  yanlisAnlamalar?: { iddia: string; gercek: string }[];
  /** Komşu meslekler; `fark` zorunlu — farkı yazılmayan komşuluk bilgi taşımaz. */
  komsuMeslekler?: { slug: string; fark: string }[];
  ilgiliAtlas?: string[];
  yolSlug?: string;
  testSlug?: string;
  sss?: SSS[];
  kaynaklar?: Kaynak[];
  seo?: SeoAlanlari;
};
