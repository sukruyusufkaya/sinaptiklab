import type { ArastirmaYayini } from '@/lib/tipler';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { slugIle, yayindakiSluglar, yayindakiler } from '@/lib/mongo/sorgular/site';

/**
 * Sinaptik Research okuma modülü — `lib/veri/arastirma.ts` karşılığı.
 *
 * `lib/icerik/atlas.ts` ile aynı kalıp: fixture'ın verdiği ADLAR ve ŞEKİLLER
 * korunur, tek fark fonksiyonların `async` olması. Böylece `/arastirma/`,
 * `/arastirma/<slug>/`, `/metodoloji/`, `/konu/<slug>/`, `/ara/` ve ana sayfa
 * bandı taşınırken sunum kodu değişmez.
 *
 * ŞEKİL FARKI — BU KOLEKSİYONDA ÜÇÜNDEN HİÇBİRİ YOK:
 * Araştırma yayını normalize edilmiş bir ilişki taşımaz (`konuSlug`/`yazarSlug`
 * şemada bulunmaz), slug'dan görünen ada çevrilen bir alanı yoktur ve
 * tohumlama hiçbir alanı yeniden adlandırmamıştır (`lib/tohum/arastirma.ts`
 * yalnızca `durum` ekler, sınırlılığı boş olan kaydı atar ve şemada karşılığı
 * olmayan `ilgiliSluglar`ı yazmaz). Bu yüzden modül geçiş katmanıdır: belge
 * doğrudan görünüm şekli olarak okunur, dönüşüm yapılmaz.
 *
 * KALAN TEK UYUMSUZLUK — ZORUNLULUK DERECESİ:
 * `veriNoktasi` ve `veriEtiketi` site tipinde zorunlu (`string`), şemada ise
 * `required` listesinde DEĞİL — panelden bu iki alanı boş bırakarak yayın
 * kaydedilebilir. Uydurma yer tutucu üretmek yasak (CLAUDE.md kural 5), kaydı
 * atlamak da ölçülü değil: eksik olan şey kartın vitrin rakamı, yayının
 * kimliği değil. Bu yüzden okunan şekil `ArastirmaKaydi` olarak daraltılır ve
 * iki alan OPSİYONEL bildirilir. Bu alanları kullanan altı çağrı yerinin
 * hepsi JSX içinde düz metin olarak basar; `string | undefined` orada sorunsuz
 * çalışır, eksik alan boş basılır.
 */

/**
 * Şemadaki hâl = site tipi, iki alanın zorunluluğu düşürülmüş biçimiyle.
 *
 * `durum` ve `ekler` şemada vardır ama site tipinde karşılığı yoktur; liste
 * sorgularında `haric` ile dışarıda bırakılır, detay sorgusunda belgede kalır
 * ve sunum onları hiç okumaz (Atlas modülündeki `durum` ile aynı durum).
 *
 * `seo` bu kümede DEĞİL: artık `ArastirmaYayini` tipinde tanımlıdır ve
 * `/arastirma/<slug>/` sayfasının `generateMetadata`'sı onu okur.
 */
export type ArastirmaKaydi = Omit<ArastirmaYayini, 'veriNoktasi' | 'veriEtiketi'> & {
  veriNoktasi?: string;
  veriEtiketi?: string;
};

/**
 * Listede gerekmeyen alanlar. `sss` ve `govde` ağır; `ekler` yalnızca detay ve
 * makine yüzeyi içindir. Modül düzeyinde sabit tutulur ki `cache()` anahtarı
 * her çağrıda aynı metne serileşsin.
 *
 * `seo` LİSTEDEN ÇIKARILMAZ: beş kısa alanlık hafif bir nesnedir ve buradan
 * elenmesi, aynı sabiti kullanan bir detay yolu eklendiğinde editörün yazdığı
 * başlığı sessizce kaybettirir. Kazancı yok, riski var.
 */
const LISTE_HARIC = ['govde', 'sss', 'ekler'];

/**
 * Yayın akışı sıralaması: yeni tarih önce.
 *
 * Mongo `tur_akisi` dizininde `tarih: -1` zaten var; JS'teki bu kıyas aynı
 * günde yayımlanan iki kaydın sırasını da belirleyerek statik üretimi
 * tekrarlanabilir kılar (fixture'ın diziye yazılma sırası kalıcı bir sıralama
 * değildi; `/arastirma/` sayfası da aynı kıyası kendisi yapıyordu).
 */
function akisSirasi(a: ArastirmaKaydi, b: ArastirmaKaydi): number {
  return b.tarih.localeCompare(a.tarih) || a.baslik.localeCompare(b.baslik, 'tr');
}

/** Yayındaki tüm araştırma yayınları — fixture'daki `ARASTIRMA` dizisinin yerine. */
export async function arastirmaListesi(): Promise<ArastirmaKaydi[]> {
  const belgeler = await yayindakiler<ArastirmaKaydi>(KOLEKSIYONLAR.arastirma, {
    siralama: { tarih: -1 },
    haric: LISTE_HARIC,
  });
  return [...belgeler].sort(akisSirasi);
}

/**
 * Bir yayın türünün kayıtları — `/arastirma/<tur-slug>/` arşivi için.
 *
 * Fixture'da karşılığı yoktu; sayfa tüm diziyi süzüyordu. Burada süzgeç
 * veritabanına iner (`tur_akisi` dizini) ve arşiv sayfası tek sorguyla
 * kurulur. Tür değeri şemadaki kapalı enum'dan gelir.
 */
export async function turuneGoreArastirma(tur: ArastirmaYayini['tur']): Promise<ArastirmaKaydi[]> {
  const belgeler = await yayindakiler<ArastirmaKaydi>(KOLEKSIYONLAR.arastirma, {
    suzgec: { tur },
    siralama: { tarih: -1 },
    haric: LISTE_HARIC,
  });
  return [...belgeler].sort(akisSirasi);
}

/**
 * Tek yayın. Gövde, SSS ve ekleriyle birlikte gelir.
 *
 * Taslak bir yayının adresine gidildiğinde `undefined` döner ve sayfa 404
 * verir — panelde duran kayıt, yayımlanmadan sitede açılmaz.
 */
export async function arastirmaBul(slug: string): Promise<ArastirmaKaydi | undefined> {
  return slugIle<ArastirmaKaydi>(KOLEKSIYONLAR.arastirma, slug);
}

/** `generateStaticParams` için yayın slug'ları. */
export async function arastirmaSluglari(): Promise<string[]> {
  return yayindakiSluglar(KOLEKSIYONLAR.arastirma);
}

/* --- KOD DÜZEYİ TAKSONOMİ -------------------------------------------------- */

export type ArastirmaTuruKaydi = {
  /** `/arastirma/<slug>/` arşiv rotası. */
  slug: string;
  ad: string;
  /** Şemadaki `tur` enum değeri. */
  tur: ArastirmaYayini['tur'];
  ozet: string;
};

/**
 * Yayın türleri — MongoDB'ye TAŞINMAZ.
 *
 * `ATLAS_KATEGORILERI` ile aynı gerekçe: bu liste veri değil, rota
 * sözleşmesidir. Şemadaki `tur` enum'u (`lib/mongo/koleksiyonlar.ts`) ve
 * panelin tür seçenekleri (`lib/admin/alanlar/arastirma.ts`) aynı altı değeri
 * kodda tanımlar; arşiv adresleri (`/arastirma/raporlar/`) buradaki slug'lara
 * bağlıdır. Bir koleksiyona konsa iki kayıt kaynağı ve kırılabilir rota
 * oluşurdu.
 *
 * NOT: Uzun vadede `lib/taksonomi.ts` bu listenin doğru evidir; fixture
 * silinirken oraya taşınmalıdır (bu görevde yalnızca bu dosya yazıldı).
 */
export const ARASTIRMA_TURLERI: readonly ArastirmaTuruKaydi[] = [
  {
    slug: 'raporlar',
    ad: 'Raporlar',
    tur: 'Rapor',
    ozet: 'Saha araştırmaları ve yıllık durum raporları.',
  },
  {
    slug: 'benchmark',
    ad: 'Benchmarklar',
    tur: 'Benchmark',
    ozet: 'Açık metodolojili karşılaştırmalı değerlendirmeler.',
  },
  {
    slug: 'veri-setleri',
    ad: 'Veri Setleri',
    tur: 'Veri Seti',
    ozet: 'Lisansı ve üretim yöntemi belgelenmiş veri setleri.',
  },
  {
    slug: 'whitepaper',
    ad: 'Whitepaper',
    tur: 'Whitepaper',
    ozet: 'Mimari ve yöntem dokümanları.',
  },
  {
    slug: 'ai-index',
    ad: 'AI Index',
    tur: 'Index',
    ozet: 'Düzenli güncellenen endeksler.',
  },
  {
    slug: 'notlar',
    ad: 'Research Notes',
    tur: 'Not',
    ozet: 'Kısa yöntem ve gözlem notları.',
  },
];

/* --- METODOLOJİ ----------------------------------------------------------- */

/**
 * Metodoloji ilkeleri — koleksiyon karşılığı YOK, bu yüzden kodda durur.
 *
 * `/metodoloji/` sayfasının gövdesi; tohumlamada hiçbir koleksiyona yazılmadı
 * (`politikalar` dâhil). Redaksiyonun kendi kuralı olduğu için ölçüm verisi
 * değil, yayın politikasıdır; panelden düzenlenecek bir kayıt hâline
 * getirilmesi ayrı bir karardır. Metin fixture'dan birebir taşındı — tek
 * kelimesi üretilmedi.
 */
export const METODOLOJI_ILKELERI: readonly { ad: string; aciklama: string }[] = [
  {
    ad: 'Ölçüm tarihi ve sürüm',
    aciklama:
      'Her sonuç, ölçümün yapıldığı tarih ve model sürümüyle birlikte yayımlanır. Sürüm bilgisi olmayan sonuç yayımlanmaz.',
  },
  {
    ad: 'Görev seti açıklığı',
    aciklama:
      'Kullanılan görev setinin yapısı, alt kümeleri ve örnek sayısı açıklanır. Örnekler kamuya açıksa bağlantı verilir.',
  },
  {
    ad: 'Örnekleme ayarları',
    aciklama:
      'Sıcaklık, üst-p ve tekrar sayısı raporlanır. Aynı ayarlarla yeniden üretilebilir olmayan ölçüm yayımlanmaz.',
  },
  {
    ad: 'Puanlama yöntemi',
    aciklama:
      'Otomatik ve insan değerlendirmesinin payı belirtilir. İnsan değerlendirmesinde değerlendirici sayısı ve uyum ölçüsü paylaşılır.',
  },
  {
    ad: 'Sınırlılıklar',
    aciklama:
      'Her yayın, sonucun ne söylemediğini açıkça listeler. Sınırlılık bölümü olmayan yayın onaylanmaz.',
  },
  {
    ad: 'Ticari bağımsızlık',
    aciklama:
      'Benchmark ve araştırmalar danışmanlık müşterilerinden bağımsız yürütülür; sponsorlu içerik ayrıca işaretlenir.',
  },
];
