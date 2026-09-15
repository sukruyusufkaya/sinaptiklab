import type {
  Blok,
  DergiSayisi,
  DergiYazisi,
  Etkinlik,
  Kaynak,
  Konu,
  PodcastBolumu,
  SeoAlanlari,
  Seviye,
  SSS,
  Uzman,
  Yazar,
} from '@/lib/tipler';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { slugIle, yayindaTek, yayindakiler } from '@/lib/mongo/sorgular/site';
import { konuHaritasi, yazarHaritasi } from '@/lib/icerik/temel';

/**
 * Yayın okuma modülü: rehberler, dergi, podcast, etkinlikler, uzmanlar.
 *
 * `lib/veri/yayin.ts` ile AYNI ADLARI ve AYNI ŞEKİLLERİ verir; tek fark
 * fonksiyonların `async` olması ve dizi sabitlerinin fonksiyona dönmesi
 * (`REHBERLER` → `rehberListesi()`, `lib/icerik/atlas.ts` içindeki
 * `ATLAS` → `atlasListesi()` kalıbı). Böylece sayfa taşımak `await` eklemek ve
 * içe alma yolunu değiştirmekten ibaret kalır.
 *
 * BEŞ DÖNÜŞÜM — hepsi okuma katmanında, şemaya dokunmadan yapılır:
 *
 * 1. REHBER = `icerikler` koleksiyonunda `tur: 'rehber'`. Şema `konuSlug`
 *    tutar, `RehberKaydi` ise konunun GÖRÜNEN ADINI ister; ad `konular`
 *    koleksiyonundan (`konuHaritasi()`) okunur, `slugla()` ile ÜRETİLMEZ.
 *    Konusu çözülemeyen rehber ATLANIR: atıfta bulunulan konu taslakta ya da
 *    slug'ı değişmiş demektir; konu rozetini boş basmak yerine kayıt
 *    gösterilmez (`lib/icerik/atlas.ts` içindeki tanınmayan kategori kararının
 *    aynısı).
 * 2. Ad değişiklikleri geri alınır: `yayinTarihi` → `tarih`,
 *    `ilgiliAtlas` → `ilgiliSluglar` (rehberde ve dergi yazısında).
 * 3. `adimlar` bir SAYAÇtır ve şemada yok — tohumlama da yazmıyor. Değer
 *    `adimListesi` uzunluğundan hesaplanır: uydurulmuş değil, gerçekten
 *    yayımlanmış adım sayısıdır.
 * 4. ETKİNLİK: şemada iki ayrı durum var. `durum` yayın akışıdır (sorguların
 *    süzgeci), `etkinlikDurumu` takvim aşamasıdır. Site tipi `Etkinlik.durum`
 *    TAKVİM aşamasını taşır → `etkinlikDurumu` oraya taşınır, yayın akışı
 *    durumu ayıklanır. Şemanın `iptal` değerinin site tipinde karşılığı yok;
 *    o kayıt ATLANIR (bkz. rapor).
 * 5. DERGİ YAZISI: `yazarSlug` korunur (şekil sözleşmesi `DergiYazisi` böyle
 *    tanımlar) ve imza şeridi için çözülmüş `yazar` nesnesi EK alan olarak
 *    eklenir. Çözülemezse `undefined` kalır; uydurma imza atılmaz.
 *
 * Ağır alanlar liste sorgularında `haric` ile dışarıda bırakılır; detay
 * sorgusunda (`...Bul`) belgenin tamamı gelir.
 *
 * ÜSTVERİ (`seo`). Beş koleksiyonun dördünde alan vardır ve görünüme taşınır:
 * rehber ve etkinlik alanları tek tek yazdığı için AÇIKÇA (`seo: belge.seo`),
 * dergi ve podcast belgeyi yaydığı için kendiliğinden. İki istisna:
 *   - `uzmanlar` şemasında alan var ama uzmanın detay rotası yok, bu yüzden
 *     `Uzman` tipine eklenmedi (bkz. `lib/tipler.ts` içindeki `SeoAlanlari`).
 *   - `dergiSayilari` şemasında `seo` SAYI düzeyindedir; `yazilar` öğelerinde
 *     yoktur, yani `/dergi/<sayi>/<yazi>/` üstverisi panelden ayarlanamaz.
 */

/* --- REHBERLER ------------------------------------------------------------ */

/** Rehber adımı: özet zorunlu, ayrıntı blokları opsiyonel. */
export type RehberAdimi = {
  ad: string;
  ozet: string;
  ayrinti?: Blok[];
};

export type RehberKaydi = {
  slug: string;
  baslik: string;
  kisaCevap: string;
  /** Konunun GÖRÜNEN ADI (şemadaki `konuSlug` buradan çözülür). */
  konu: string;
  /**
   * Konunun SLUG'ı — arşivi kümeye göre gruplamak için gerekli.
   *
   * Görünen ad yeterli değil: küme bilgisi `konular` koleksiyonunda ve o
   * birleştirme slug üzerinden yapılıyor. Ada göre eşleştirmek, projede
   * tekrar eden kırılganlık (bir konu adı düzeltildiğinde bağ sessizce
   * kopar) — dergi bölüm arşivlerinde tam bu yaşandı.
   */
  konuSlug: string;
  seviye: Seviye;
  okumaDakika: number;
  yazarSlug: string;
  tarih: string;
  adimlar: number;
  adimListesi?: RehberAdimi[];
  /** Rehbere başlamadan önce gereken kavram ve yetkinlikler. */
  onKosullar?: string[];
  /** Uygulama sırasında gereken araç ve erişimler. */
  araclar?: string[];
  /** Sahada en sık düşülen hatalar. */
  tuzaklar?: { baslik: string; aciklama: string }[];
  /** Rehber tamamlandığında işaretlenecek maddeler. */
  kontrolListesi?: string[];
  kaynaklar?: Kaynak[];
  ilgiliSluglar?: string[];
  sss?: SSS[];
  /** Editörün panelden yazdığı üstveri; `/rehber/<slug>/` bunu okur. */
  seo?: SeoAlanlari;
};

/** Mongo belgesi: şemadaki hâl (`konuSlug`, `yayinTarihi`, `ilgiliAtlas`). */
type RehberBelgesi = Omit<
  RehberKaydi,
  'konu' | 'konuSlug' | 'tarih' | 'adimlar' | 'ilgiliSluglar'
> & {
  konuSlug: string;
  yayinTarihi: string;
  ilgiliAtlas?: string[];
};

/**
 * Rehber listesinde gerekmeyen ağır alanlar.
 *
 * `adimListesi` listede kalır (adım SAYISI oradan hesaplanıyor), ama adım
 * ayrıntıları blok dizisidir ve arşiv kartında kullanılmaz: iç içe alan
 * yolu (`adimListesi.ayrinti`) ile tek tek atılır.
 */
const REHBER_LISTE_HARIC = ['govde', 'sss', 'kaynaklar', 'adimListesi.ayrinti'];

/**
 * Alanlar tek tek yazılır (spread + rest yerine): böylece yalnızca şemaya ait
 * olan alanlar (`tur`, `yol`, `durum`, zaman damgaları) RSC sınırından geçmez
 * ve kullanılmayan bağlama uyarısı doğmaz (`npm run lint` `--max-warnings=0`
 * ile çalışıyor). Bedeli: şemaya yeni bir alan eklenirse buraya da eklenmesi
 * gerekir — `seo` tam olarak bu yüzden düşüyordu ve şimdi açıkça taşınıyor.
 */
function rehberGorunume(belge: RehberBelgesi, konular: Map<string, Konu>): RehberKaydi | null {
  const konu = konular.get(belge.konuSlug);
  if (!konu) {
    console.warn(
      `[icerik:yayin] rehber "${belge.slug}" atlandı — yayında olmayan konu: "${belge.konuSlug}"`,
    );
    return null;
  }

  return {
    slug: belge.slug,
    baslik: belge.baslik,
    kisaCevap: belge.kisaCevap,
    konu: konu.ad,
    konuSlug: belge.konuSlug,
    seviye: belge.seviye,
    okumaDakika: belge.okumaDakika,
    yazarSlug: belge.yazarSlug,
    tarih: belge.yayinTarihi,
    adimlar: belge.adimListesi?.length ?? 0,
    adimListesi: belge.adimListesi,
    onKosullar: belge.onKosullar,
    araclar: belge.araclar,
    tuzaklar: belge.tuzaklar,
    kontrolListesi: belge.kontrolListesi,
    kaynaklar: belge.kaynaklar,
    ilgiliSluglar: belge.ilgiliAtlas,
    sss: belge.sss,
    seo: belge.seo,
  };
}

/** Yayındaki rehberler, yayın tarihine göre yeniden eskiye. */
export async function rehberListesi(): Promise<RehberKaydi[]> {
  const [belgeler, konular] = await Promise.all([
    yayindakiler<RehberBelgesi>(KOLEKSIYONLAR.icerikler, {
      suzgec: { tur: 'rehber' },
      siralama: { yayinTarihi: -1 },
      haric: REHBER_LISTE_HARIC,
    }),
    konuHaritasi(),
  ]);

  return belgeler
    .map((belge) => rehberGorunume(belge, konular))
    .filter((rehber): rehber is RehberKaydi => rehber !== null);
}

/**
 * Tek rehber. Adım ayrıntıları, kaynaklar ve SSS ile birlikte gelir.
 *
 * Süzgece `tur` de yazılır: aynı koleksiyondaki bir haberin adresi
 * `/rehber/<slug>/` altında açılmasın.
 */
export async function rehberBul(slug: string): Promise<RehberKaydi | undefined> {
  const [belge, konular] = await Promise.all([
    yayindaTek<RehberBelgesi>(KOLEKSIYONLAR.icerikler, { slug, tur: 'rehber' }),
    konuHaritasi(),
  ]);
  if (!belge) return undefined;
  return rehberGorunume(belge, konular) ?? undefined;
}

/* --- DERGİ ---------------------------------------------------------------- */

/** `DergiYazisi` + imza şeridi için çözülmüş yazar. `yazarSlug` korunur. */
export type DergiYazisiKaydi = DergiYazisi & { yazar?: Yazar };

export type DergiSayiKaydi = Omit<DergiSayisi, 'yazilar'> & { yazilar: DergiYazisiKaydi[] };

type DergiYaziBelgesi = Omit<DergiYazisi, 'ilgiliSluglar'> & { ilgiliAtlas?: string[] };

/** Şema `yazilar` dizisini zorunlu kılmaz: künyesi girilmiş, içi boş sayı olabilir. */
type DergiBelgesi = Omit<DergiSayisi, 'yazilar'> & { yazilar?: DergiYaziBelgesi[] };

function dergiGorunume(belge: DergiBelgesi, yazarlar: Map<string, Yazar>): DergiSayiKaydi {
  const { yazilar, ...kalan } = belge;
  return {
    ...kalan,
    yazilar: (yazilar ?? []).map(({ ilgiliAtlas, ...yazi }) => ({
      ...yazi,
      ilgiliSluglar: ilgiliAtlas,
      yazar: yazarlar.get(yazi.yazarSlug),
    })),
  };
}

/**
 * Yayındaki dergi sayıları, tarihe göre yeniden eskiye.
 *
 * Yazı gövdeleri ve kaynakları listede okunmaz — arşiv kartı künyeyle
 * çalışır; tam metin `dergiSayisiBul()` ile gelir.
 */
export async function dergiSayiListesi(): Promise<DergiSayiKaydi[]> {
  const [belgeler, yazarlar] = await Promise.all([
    yayindakiler<DergiBelgesi>(KOLEKSIYONLAR.dergiSayilari, {
      siralama: { tarih: -1 },
      haric: ['yazilar.govde', 'yazilar.kaynaklar'],
    }),
    yazarHaritasi(),
  ]);

  return belgeler.map((belge) => dergiGorunume(belge, yazarlar));
}

/** Tek sayı; içindeki yazıların gövdesi ve kaynaklarıyla birlikte. */
export async function dergiSayisiBul(slug: string): Promise<DergiSayiKaydi | undefined> {
  const [belge, yazarlar] = await Promise.all([
    slugIle<DergiBelgesi>(KOLEKSIYONLAR.dergiSayilari, slug),
    yazarHaritasi(),
  ]);
  if (!belge) return undefined;
  return dergiGorunume(belge, yazarlar);
}

export type DergiBolumu = {
  slug: string;
  ad: string;
  ozet: string;
  /** Yazının `bolum` alanındaki değer; eşleşme buna göre yapılır, ada göre değil. */
  yaziBolumu: string;
};

/**
 * Dergi bölümleri — İÇERİK DEĞİL, SINIFLANDIRMA.
 *
 * `/dergi/<bolum>/` rotası bu slug'lara bağlıdır (bkz.
 * `app/(site)/dergi/[sayi]/page.tsx` — tek dinamik segment hem sayıyı hem
 * bölüm arşivini karşılıyor), bu yüzden editörün panelden değiştireceği bir
 * liste değil. `lib/taksonomi.ts` doktrini gereği MongoDB'ye TAŞINMAZ; kalıcı
 * yeri `lib/taksonomi.ts` olmalı, şimdilik burada duruyor (bkz. rapor).
 */
export const DERGI_BOLUMLERI: readonly DergiBolumu[] = [
  {
    slug: 'dosya',
    ad: 'Dosya Konuları',
    ozet: 'Her sayının kapak dosyasını oluşturan derin incelemeler.',
    yaziBolumu: 'Dosya',
  },
  {
    slug: 'roportaj',
    ad: 'Röportajlar',
    ozet: 'Araştırmacı, kurucu ve uygulayıcılarla konuşmalar.',
    yaziBolumu: 'Röportaj',
  },
  {
    slug: 'kose',
    ad: 'Köşe Yazıları',
    ozet: 'Düzenli yazarların görüş yazıları.',
    yaziBolumu: 'Görüş',
  },
  {
    slug: 'arastirma-yazilari',
    ad: 'Araştırma Yazıları',
    ozet: 'Sayı içindeki ölçüm ve bulgu temelli yazılar.',
    yaziBolumu: 'Araştırma',
  },
  {
    slug: 'uygulama',
    ad: 'Uygulama Notları',
    ozet: 'Sahadan uygulama anlatıları ve kurulum notları.',
    yaziBolumu: 'Uygulama',
  },
];

/**
 * Bir bölümün yazıları — `yaziBolumu` ile BİREBİR eşleşme.
 *
 * ÖNCEKİ EŞLEŞTİRME KIRIKTI. Bölüm arşivi yazının `bolum` alanını bölümün
 * GÖRÜNEN ADIYLA karşılaştırıyordu (`bolum.ad.startsWith(yazi.bolum)`).
 * "Dosya Konuları".startsWith("Dosya") tuttuğu için dosya arşivi doluyordu,
 * ama "Köşe Yazıları".startsWith("Görüş") tutmuyordu: köşe arşivi yazılar
 * varken BOŞ görünüyordu. "Araştırma" ve "Uygulama" bölümlerinin ise hiç
 * arşivi yoktu — o yazılara hiçbir liste sayfasından ulaşılamıyordu.
 *
 * Eşleşme artık ada değil açık bir alana (`yaziBolumu`) bağlı. Ad değişince
 * bağ kopmaz; bu, projede tekrar eden "görünen ada göre eşleştirme" hatasının
 * aynısıydı.
 */
export async function dergiBolumununYazilari(bolumSlug: string) {
  const bolum = DERGI_BOLUMLERI.find((b) => b.slug === bolumSlug);
  if (!bolum) return [];
  return (await dergiSayiListesi()).flatMap((sayi) =>
    sayi.yazilar
      .filter((yazi) => yazi.bolum === bolum.yaziBolumu)
      .map((yazi) => ({ ...yazi, sayiSlug: sayi.slug, sayiAd: sayi.sayi })),
  );
}

/* --- PODCAST -------------------------------------------------------------- */

/**
 * Yayındaki podcast bölümleri, numaraya göre büyükten küçüğe.
 *
 * Şema alan adları site tipiyle birebir örtüşüyor; dönüşüm yok. `dokum`
 * (tam döküm) listede okunmaz.
 */
export async function podcastListesi(): Promise<PodcastBolumu[]> {
  return yayindakiler<PodcastBolumu>(KOLEKSIYONLAR.podcast, {
    siralama: { numara: -1 },
    haric: ['dokum'],
  });
}

/** Tek bölüm; dökümüyle birlikte. */
export async function podcastBul(slug: string): Promise<PodcastBolumu | undefined> {
  return slugIle<PodcastBolumu>(KOLEKSIYONLAR.podcast, slug);
}

/* --- ETKİNLİKLER ---------------------------------------------------------- */

/**
 * Mongo belgesi: takvim aşaması `etkinlikDurumu` alanında, yayın akışı
 * durumu ise `durum` alanında durur.
 */
type EtkinlikBelgesi = Omit<Etkinlik, 'durum'> & {
  etkinlikDurumu: string;
  durum?: string;
};

/** Site tipinin takvim aşamaları — şemadaki `iptal` burada yok. */
const TAKVIM_DURUMLARI = ['planlandi', 'kayit-acik', 'gecti'] as const;

function etkinlikGorunume(belge: EtkinlikBelgesi): Etkinlik | null {
  const takvimDurumu = TAKVIM_DURUMLARI.find((deger) => deger === belge.etkinlikDurumu);
  if (!takvimDurumu) {
    console.warn(
      `[icerik:yayin] etkinlik "${belge.slug}" atlandı — site tipinde karşılığı olmayan takvim durumu: "${belge.etkinlikDurumu}"`,
    );
    return null;
  }

  // Alan alan yazılır: şemadaki yayın akışı `durum`u dışarı ÇIKMAZ, site
  // tipinin `durum` alanı takvim aşamasını taşır. `seo` ise taşınır —
  // `/etkinlikler/<slug>/` üstverisini editör panelden yazıyor.
  return {
    slug: belge.slug,
    ad: belge.ad,
    tur: belge.tur,
    tarih: belge.tarih,
    bicim: belge.bicim,
    ozet: belge.ozet,
    durum: takvimDurumu,
    seo: belge.seo,
  };
}

/**
 * Yayındaki etkinlikler, tarihe göre yeniden eskiye.
 *
 * "Yaklaşan" ve "geçmiş" ayrımı BURADA yapılmaz: sorgular sunucu zamanını
 * okumaz (bkz. `lib/mongo/sorgular/site.ts` üçüncü değişmez kural); ayrımı
 * `durum === 'gecti'` üzerinden çağıran sayfa yapar.
 */
export async function etkinlikListesi(): Promise<Etkinlik[]> {
  const belgeler = await yayindakiler<EtkinlikBelgesi>(KOLEKSIYONLAR.etkinlikler, {
    siralama: { tarih: -1 },
  });

  return belgeler
    .map(etkinlikGorunume)
    .filter((etkinlik): etkinlik is Etkinlik => etkinlik !== null);
}

/** Tek etkinlik. */
export async function etkinlikBul(slug: string): Promise<Etkinlik | undefined> {
  const belge = await slugIle<EtkinlikBelgesi>(KOLEKSIYONLAR.etkinlikler, slug);
  if (!belge) return undefined;
  return etkinlikGorunume(belge) ?? undefined;
}

/* --- UZMANLAR ------------------------------------------------------------- */

/**
 * Yayındaki uzman ağı, slug sırasına göre.
 *
 * Dönüşüm yok: şema alanları (`slug`, `ad`, `unvan`, `alan`, `basHarfler`)
 * site tipiyle birebir örtüşüyor; yayın akışı `durum` alanı süzgeç olarak
 * kullanılır ve belgede kalır.
 *
 * SIRALAMA: önce DOLU koltuklar, sonra açık koltuklar; her grup kendi içinde
 * alana göre. Ada göre sıralamak açık koltukların hepsini ("Açık koltuk")
 * listenin bir yerine yığar ve alan bilgisini sıralamadan düşürürdü; slug
 * sırası ise `koltuk-` önekini sıralamış olurdu. Alan, okurun gerçekten
 * aradığı boyuttur.
 */
export async function uzmanListesi(): Promise<Uzman[]> {
  const belgeler = await yayindakiler<Uzman>(KOLEKSIYONLAR.uzmanlar);
  return [...belgeler].sort(
    (a, b) =>
      Number(a.koltukDurumu === 'acik') - Number(b.koltukDurumu === 'acik') ||
      a.alan.localeCompare(b.alan, 'tr'),
  );
}
