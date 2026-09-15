import type { AtlasGirdisi } from '@/lib/tipler';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { slugIle, yayindakiler } from '@/lib/mongo/sorgular/site';
import { ATLAS_KATEGORI_ADI, ATLAS_KATEGORILERI } from '@/lib/taksonomi';

/**
 * Atlas okuma modülü — ÖRNEK ALAN MODÜLÜ.
 *
 * `lib/veri/atlas.ts` ile AYNI ADLARI ve AYNI ŞEKİLLERİ verir; tek fark
 * fonksiyonların `async` olması. Böylece bir sayfayı taşımak `await` eklemek
 * ve içe alma yolunu değiştirmekten ibaret kalır; sunum kodu hiç değişmez.
 *
 * TEK GERÇEK DÖNÜŞÜM — `kategoriSlug` → `kategori`:
 * Şema slug tutar (rota `/atlas/kategori/<slug>/` ona bağlı), site tipi
 * `AtlasGirdisi` ise görünen adı ister. Tohumlama sırasında ad slug'a
 * çevrilmişti; burada tersi yapılır. Tanınmayan bir slug görülürse girdi
 * ATLANIR ve uyarı basılır: kategorisi çözülemeyen bir kavram, kategori
 * sayfalarında görünmeyeceği için sessizce yanlış yerde durmasındansa hiç
 * durmaması iyidir.
 */

export { ATLAS_KATEGORILERI };

/** Mongo belgesi: şemadaki hâl (kategoriSlug taşır, kategori taşımaz). */
type AtlasBelgesi = Omit<AtlasGirdisi, 'kategori'> & { kategoriSlug: string };

function gorunume(belge: AtlasBelgesi): AtlasGirdisi | null {
  const { kategoriSlug, ...kalan } = belge;
  const kategori = ATLAS_KATEGORI_ADI.get(kategoriSlug);
  if (!kategori) {
    console.warn(
      `[icerik:atlas] "${belge.slug}" atlandı — taksonomide olmayan kategori: "${kategoriSlug}"`,
    );
    return null;
  }
  return { ...kalan, kategori };
}

/** Yayındaki tüm Atlas girdileri, ada göre Türkçe sıralı. */
export async function atlasListesi(): Promise<AtlasGirdisi[]> {
  const belgeler = await yayindakiler<AtlasBelgesi>(KOLEKSIYONLAR.atlas);
  return belgeler
    .map(gorunume)
    .filter((g): g is AtlasGirdisi => g !== null)
    .sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
}

/**
 * Tek girdi. Gövdesiyle birlikte gelir.
 *
 * Taslak bir kavramın adresine gidildiğinde `undefined` döner ve sayfa 404
 * verir — panelde görünen bir kayıt, yayımlanmadan sitede açılmaz.
 */
export async function atlasBul(slug: string): Promise<AtlasGirdisi | undefined> {
  const belge = await slugIle<AtlasBelgesi>(KOLEKSIYONLAR.atlas, slug);
  if (!belge) return undefined;
  return gorunume(belge) ?? undefined;
}

/** Bir kategorinin girdileri. Bilinmeyen kategoride boş dizi. */
export async function kategoriyeGoreAtlas(kategoriSlug: string): Promise<AtlasGirdisi[]> {
  if (!ATLAS_KATEGORI_ADI.has(kategoriSlug)) return [];
  const belgeler = await yayindakiler<AtlasBelgesi>(KOLEKSIYONLAR.atlas, {
    suzgec: { kategoriSlug },
  });
  return belgeler
    .map(gorunume)
    .filter((g): g is AtlasGirdisi => g !== null)
    .sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
}

/**
 * Kategori bazında YAYINDA olan girdi sayısı.
 *
 * `ATLAS_KATEGORILERI[].adet` ile karıştırılmamalı: oradaki sayı kavram
 * evreninin tahmini genişliği, buradaki ise gerçekten yayımlanmış girdi
 * sayısıdır.
 */
export async function kategoriAdedi(kategoriSlug: string): Promise<number> {
  return (await kategoriyeGoreAtlas(kategoriSlug)).length;
}

export type SozlukGirdisi = {
  slug: string;
  terim: string;
  ingilizce?: string;
  kisaltma?: string;
  tanim: string;
  kategoriSlug?: string;
  kategori: string;
  /** Ayrıntılı Atlas girdisi varsa slug'ı; yoksa terimin detay sayfası yoktur. */
  atlasSlug?: string;
};

type TerimBelgesi = {
  slug: string;
  terim: string;
  ingilizce?: string;
  kisaltma?: string;
  tanim: string;
  kategoriSlug?: string;
  atlasSlug?: string;
};

/**
 * Sözlük — `terimler` koleksiyonundan.
 *
 * ÖNCEDEN `atlas` KOLEKSİYONUNU OKUYORDU ve 35 terim gösteriyordu. Sözlüğü
 * büyütmenin tek yolu yeni Atlas girdisi açmaktı; bir Atlas girdisi ise gövde,
 * SSS, kaynak ve sürüm geçmişi taşıyan ağır bir editoryal üründür. Üç yüz
 * terimi o ağırlıkla üretmek ne gerçekçi ne de doğruydu: "şaşkınlık" terimine
 * tek satırlık tanım yeter, "RAG"e kendi sayfası gerekir.
 *
 * İKİ KATMAN BİLİNÇLİ OLARAK ÖRTÜŞÜYOR: Atlas girdisi olan terim `atlasSlug`
 * ile oraya bağlanır ve tanımı sözlükte yine görünür. Böylece sözlük TEK ve
 * TAM bir liste olur — okur "bu terim neden burada yok" diye sormaz ve aynı
 * terim iki kez listelenmez.
 *
 * Kategori adı `lib/taksonomi.ts` üzerinden çözülür; kayıtta yalnızca slug
 * durur, görünen ad tek yerden gelir.
 */
export async function sozluk(): Promise<SozlukGirdisi[]> {
  const belgeler = await yayindakiler<TerimBelgesi>(KOLEKSIYONLAR.terimler);
  return belgeler
    .map((belge) => ({
      slug: belge.slug,
      terim: belge.terim,
      ingilizce: belge.ingilizce,
      kisaltma: belge.kisaltma,
      tanim: belge.tanim,
      kategoriSlug: belge.kategoriSlug,
      kategori: belge.kategoriSlug
        ? (ATLAS_KATEGORI_ADI.get(belge.kategoriSlug) ?? belge.kategoriSlug)
        : 'Diğer',
      atlasSlug: belge.atlasSlug,
    }))
    .sort((a, b) => a.terim.localeCompare(b.terim, 'tr'));
}
