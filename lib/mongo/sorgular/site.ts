import { cache } from 'react';
import type { Filter, Sort } from 'mongodb';
import { veritabani } from '@/lib/mongo/istemci';

/**
 * Herkese açık site için okuma ilkelleri.
 *
 * `lib/mongo/sorgular/yonetim.ts` PANEL içindir: her durumdaki kaydı görür ve
 * yazma yapar, bu yüzden çağıranından oturum ister. Bu dosya tam tersidir:
 * yalnızca OKUR ve yalnızca YAYINDA olanı döndürür.
 *
 * ÜÇ DEĞİŞMEZ KURAL
 *
 * 1. **Taslak sızmaz.** `durum` alanı olan her koleksiyonda süzgeç
 *    `durum: 'yayinda'` ile başlar. Bu varsayılan, çağıranın bir şey yapmasını
 *    gerektirmeden geçerlidir; kapatmak için `durumsuz: true` yazmak ve
 *    koleksiyonun gerçekten `durum` alanı olmadığını bilmek gerekir.
 * 2. **`_id` dışarı çıkmaz.** MongoDB'nin `ObjectId`'si RSC sınırından
 *    geçemez (serialize edilemez) ve site tiplerinde karşılığı yoktur; her
 *    belgeden ayıklanır. Kalıcı kimlik `slug`'dır (MASTER-PLAN §45).
 * 3. **Sunucu zamanı okunmaz.** Sorgular "bugün"e göre süzme yapmaz; tarih
 *    kıyası gerekiyorsa çağıran sayfa yapar. Böylece statik üretim
 *    tekrarlanabilir kalır.
 *
 * ÖNBELLEK: `cache()` React'in istek kapsamlı hafızasıdır — aynı render'da
 * `atlasListesi()` on kez çağrılsa Atlas'a bir kez gidilir. Sayfa düzeyindeki
 * önbellek Next'in kendi tam sayfa önbelleğidir; panel kaydettiğinde
 * `revalidatePath()` ile düşürülür (bkz. `lib/admin/eylemler.ts`).
 */

/** `durum` alanı olan koleksiyonlarda yayında olanın değeri. */
export const YAYINDA = 'yayinda';

export type ListeSecenekleri = {
  /** Ek süzgeç — `durum` süzgeciyle birleştirilir. */
  suzgec?: Filter<Record<string, unknown>>;
  siralama?: Sort;
  sinir?: number;
  /** Koleksiyonda `durum` alanı yok (radar, yönlendirmeler, medya…). */
  durumsuz?: boolean;
  /** Listede gerekmeyen ağır alanları dışarıda bırakır (ör. `govde`). */
  haric?: readonly string[];
};

/**
 * `cache()` argüman KİMLİĞİNE göre eşler; `{ sinir: 5 }` gibi bir nesne
 * literali her çağrıda yeni bir referanstır ve önbellek hiç tutmaz. Bu yüzden
 * seçenekler önce metne çevrilip öyle anahtarlanır.
 *
 * Kısıt: iki çağrının aynı önbellek girdisine düşmesi için nesne alanlarının
 * AYNI SIRADA yazılması gerekir (`JSON.stringify` sırayı korur). Farklı sırada
 * yazılan iki eşdeğer süzgeç yalnızca fazladan bir sorgu yapar — yanlış sonuç
 * üretmez.
 */
function anahtarla(secenekler: ListeSecenekleri): string {
  return JSON.stringify(secenekler);
}

function suzgeciKur(secenekler: ListeSecenekleri): Filter<Record<string, unknown>> {
  const temel = secenekler.suzgec ?? {};
  return secenekler.durumsuz ? temel : { durum: YAYINDA, ...temel };
}

function izdusum(haric?: readonly string[]): Record<string, 0> {
  const p: Record<string, 0> = { _id: 0 };
  for (const alan of haric ?? []) p[alan] = 0;
  return p;
}

const listeyiOku = cache(async (koleksiyon: string, anahtar: string): Promise<unknown[]> => {
  const secenekler = JSON.parse(anahtar) as ListeSecenekleri;
  const db = await veritabani();

  let imlec = db
    .collection(koleksiyon)
    .find(suzgeciKur(secenekler), { projection: izdusum(secenekler.haric) });

  if (secenekler.siralama) imlec = imlec.sort(secenekler.siralama);
  if (secenekler.sinir) imlec = imlec.limit(secenekler.sinir);

  return imlec.toArray();
});

/** Yayında olan belgeleri listeler. */
export function yayindakiler<T>(
  koleksiyon: string,
  secenekler: ListeSecenekleri = {},
): Promise<T[]> {
  return listeyiOku(koleksiyon, anahtarla(secenekler)) as Promise<T[]>;
}

const tekiOku = cache(
  async (koleksiyon: string, anahtar: string, durumsuz: boolean): Promise<unknown> => {
    const suzgec = JSON.parse(anahtar) as Filter<Record<string, unknown>>;
    const db = await veritabani();
    const belge = await db
      .collection(koleksiyon)
      .findOne(durumsuz ? suzgec : { durum: YAYINDA, ...suzgec }, { projection: { _id: 0 } });
    return belge ?? undefined;
  },
);

/** Yayında olan tek belgeyi getirir; yoksa `undefined`. */
export function yayindaTek<T>(
  koleksiyon: string,
  suzgec: Filter<Record<string, unknown>>,
  secenekler: { durumsuz?: boolean } = {},
): Promise<T | undefined> {
  return tekiOku(koleksiyon, JSON.stringify(suzgec), secenekler.durumsuz === true) as Promise<
    T | undefined
  >;
}

/** Slug ile tek belge — en sık kullanılan biçim. */
export function slugIle<T>(
  koleksiyon: string,
  slug: string,
  secenekler: { durumsuz?: boolean } = {},
): Promise<T | undefined> {
  return yayindaTek<T>(koleksiyon, { slug }, secenekler);
}

const sayiyiOku = cache(
  async (koleksiyon: string, anahtar: string, durumsuz: boolean): Promise<number> => {
    const suzgec = JSON.parse(anahtar) as Filter<Record<string, unknown>>;
    const db = await veritabani();
    return db
      .collection(koleksiyon)
      .countDocuments(durumsuz ? suzgec : { durum: YAYINDA, ...suzgec });
  },
);

/** Yayında olan belge sayısı. */
export function yayindaSayisi(
  koleksiyon: string,
  suzgec: Filter<Record<string, unknown>> = {},
  secenekler: { durumsuz?: boolean } = {},
): Promise<number> {
  return sayiyiOku(koleksiyon, JSON.stringify(suzgec), secenekler.durumsuz === true);
}

/**
 * `generateStaticParams` için slug listesi.
 *
 * Derleme anında çalışır. Veritabanı o an erişilemezse `veritabani()` hata
 * atar ve derleme DÜŞER — istenen davranış budur: sessizce boş bir site
 * yayımlamaktansa derlemenin kırılması iyidir.
 */
export async function yayindakiSluglar(
  koleksiyon: string,
  secenekler: { durumsuz?: boolean } = {},
): Promise<string[]> {
  const kayitlar = await yayindakiler<{ slug?: string }>(koleksiyon, {
    durumsuz: secenekler.durumsuz,
  });
  return kayitlar
    .map((k) => k.slug)
    .filter((s): s is string => typeof s === 'string' && s.length > 0);
}
