import 'server-only';
import { cache } from 'react';
import { atlasListesi } from '@/lib/icerik/atlas';
import { dersler, testler } from '@/lib/icerik/ogrenme';
import { labProjeleri, meslekler } from '@/lib/icerik/lab';
import { konuHaritasi } from '@/lib/icerik/temel';
import {
  BECERI_TANIMLARI,
  acilanlar,
  derinlikler,
  dogrula,
  rotaCikar,
  type Rota,
} from './beceri-agi';

/**
 * Beceri ağının VERİ katmanı.
 *
 * `beceri-agi.ts` çizgenin kendisidir ve veritabanına bakmaz; bu modül o
 * çizgeyi yayındaki içerikle birleştirir. Ayrım bilinçlidir: çizge işlemleri
 * (derinlik, kapanış, rota) saf fonksiyonlardır ve veritabanı olmadan
 * sınanabilir; bu dosya ise yalnızca birleştirme yapar.
 *
 * BİRLEŞTİRME UYGULAMADA, `$lookup` İLE DEĞİL. Altı koleksiyon bir kez okunur
 * ve `cache()` ile istek boyunca paylaşılır; 35 düğüm için altı ayrı toplama
 * aşaması kurmak hem yavaş hem hata ayıklaması zor olurdu (`lib/icerik/temel.ts`
 * ile aynı gerekçe).
 *
 * BAĞLAR TÜRETİLİR, YAZILMAZ: ders bağı `dersler.kavramlar`, lab bağı
 * `lab_projeleri.kavramlar`, meslek bağı `meslekler.ilgiliAtlas`, test bağı ise
 * düğümün `konuSlug`u üzerinden `testler.konuSlug` ile kurulur. Bu alanların
 * hepsi zaten dolu ve `npm run icerik:denetim` tarafından denetleniyor; yeni
 * bir içerik alanı açılmadı.
 */

export type BeceriKaynagi = { slug: string; ad: string };

export type BeceriDugumu = {
  slug: string;
  /** Atlas kaydından; Atlas'ta karşılığı yoksa düğüm listeye HİÇ girmez. */
  ad: string;
  kisaTanim?: string;
  seviye?: string;
  konuSlug: string;
  konuAdi?: string;
  kume?: string;
  onkosullar: string[];
  /** Bu kavramın önünü açtığı düğümler — ters kenarlardan türetilir. */
  acar: string[];
  derinlik: number;
  kapi: string;
  dersler: { slug: string; ad: string; dakika: number; seviye: string; yolSlug: string }[];
  dakika: number;
  testler: { slug: string; ad: string; seviye: string; soruSayisi: number }[];
  lab: BeceriKaynagi[];
  meslekler: BeceriKaynagi[];
};

/**
 * Birleştirilmiş ağ.
 *
 * Atlas'ta karşılığı olmayan bir tanım sessizce DÜŞÜRÜLÜR ve düşürülenler
 * `eksikAtlas` içinde raporlanır. Uydurma bir ad üretip düğümü göstermek,
 * tıklandığında 404 veren bir kavram kartı basmak olurdu.
 */
export type BeceriAgi = {
  dugumler: BeceriDugumu[];
  /** Tanımda olup Atlas'ta yayında olmayan slug'lar. */
  eksikAtlas: string[];
  /** Çizgenin kendi tutarsızlıkları (döngü, tanımsız önkoşul). */
  cizgeHatalari: string[];
  toplamDakika: number;
  toplamBag: number;
};

export const beceriAgi = cache(async (): Promise<BeceriAgi> => {
  const [ATLAS, DERSLER, TESTLER, LAB, MESLEKLER, KONULAR] = await Promise.all([
    atlasListesi(),
    dersler(),
    testler(),
    labProjeleri(),
    meslekler(),
    konuHaritasi(),
  ]);

  const atlasHaritasi = new Map(ATLAS.map((a) => [a.slug, a]));
  const derinlik = derinlikler();
  const acilan = acilanlar();

  // Kavram → ders / lab / meslek indeksleri: üç koleksiyonda tek geçiş.
  const dersDizini = new Map<string, BeceriDugumu['dersler']>();
  for (const ders of DERSLER) {
    for (const kavram of ders.kavramlar ?? []) {
      const liste = dersDizini.get(kavram) ?? [];
      liste.push({
        slug: ders.slug,
        ad: ders.ad,
        dakika: ders.dakika,
        seviye: ders.seviye,
        yolSlug: ders.yolSlug,
      });
      dersDizini.set(kavram, liste);
    }
  }

  const labDizini = new Map<string, BeceriKaynagi[]>();
  for (const proje of LAB) {
    for (const kavram of proje.kavramlar ?? []) {
      const liste = labDizini.get(kavram) ?? [];
      liste.push({ slug: proje.slug, ad: proje.ad });
      labDizini.set(kavram, liste);
    }
  }

  const meslekDizini = new Map<string, BeceriKaynagi[]>();
  for (const meslek of MESLEKLER) {
    for (const kavram of meslek.ilgiliAtlas ?? []) {
      const liste = meslekDizini.get(kavram) ?? [];
      liste.push({ slug: meslek.slug, ad: meslek.ad });
      meslekDizini.set(kavram, liste);
    }
  }

  const testDizini = new Map<string, BeceriDugumu['testler']>();
  for (const test of TESTLER) {
    if (!test.konuSlug) continue;
    const liste = testDizini.get(test.konuSlug) ?? [];
    liste.push({
      slug: test.slug,
      ad: test.ad,
      seviye: test.seviye,
      soruSayisi: test.soruSayisi,
    });
    testDizini.set(test.konuSlug, liste);
  }

  const eksikAtlas: string[] = [];
  const dugumler: BeceriDugumu[] = [];

  for (const tanim of BECERI_TANIMLARI) {
    const atlas = atlasHaritasi.get(tanim.slug);
    if (!atlas) {
      eksikAtlas.push(tanim.slug);
      continue;
    }

    const dersListesi = (dersDizini.get(tanim.slug) ?? []).sort(
      (a, b) => a.dakika - b.dakika || a.ad.localeCompare(b.ad, 'tr'),
    );
    const konu = KONULAR.get(tanim.konuSlug);

    dugumler.push({
      slug: tanim.slug,
      ad: atlas.ad,
      kisaTanim: atlas.kisaTanim,
      seviye: atlas.seviye,
      konuSlug: tanim.konuSlug,
      konuAdi: konu?.ad,
      kume: konu?.kume,
      onkosullar: tanim.onkosullar,
      acar: acilan.get(tanim.slug) ?? [],
      derinlik: derinlik.get(tanim.slug) ?? 0,
      kapi: tanim.kapi,
      dersler: dersListesi,
      dakika: dersListesi.reduce((t, d) => t + d.dakika, 0),
      testler: (testDizini.get(tanim.konuSlug) ?? []).slice(0, 4),
      lab: (labDizini.get(tanim.slug) ?? []).slice(0, 4),
      meslekler: meslekDizini.get(tanim.slug) ?? [],
    });
  }

  return {
    dugumler,
    eksikAtlas,
    cizgeHatalari: dogrula(),
    toplamDakika: dugumler.reduce((t, d) => t + d.dakika, 0),
    toplamBag: dugumler.reduce((t, d) => t + d.onkosullar.length, 0),
  };
});

/* --- ROTA ----------------------------------------------------------------- */

export type RotaAdimi = BeceriDugumu & { sira: number };

export type UretilenRota = Rota & {
  adimlar: RotaAdimi[];
  toplamDakika: number;
  /** Rotadaki düğümleri doğrulayan testler, yinelenmeden. */
  testler: BeceriDugumu['testler'];
};

/**
 * Hedefe giden rotayı içerikle birlikte üretir.
 *
 * SÜRE BİR TOPLAMDIR, BİR TAHMİN DEĞİL: her adımın dakikası o kavramı işleyen
 * derslerin gerçek `dakika` alanlarından gelir. Ders bağı olmayan bir kavram 0
 * dakika gösterir ve bu, sıfır emek gerektiği anlamına gelmez — sayfa bunu
 * açıkça söyler. Uydurma bir "tahmini süre" üretmek, sayfanın dayandığı tüm
 * veriyi şüpheli hâle getirirdi (CLAUDE.md §5).
 */
export async function rotaUret(
  hedefler: readonly string[],
  bilinenler: readonly string[],
): Promise<UretilenRota> {
  const { dugumler } = await beceriAgi();
  const harita = new Map(dugumler.map((d) => [d.slug, d]));
  const rota = rotaCikar(hedefler, bilinenler);

  const adimlar = rota.sira
    .map((slug) => harita.get(slug))
    .filter((d): d is BeceriDugumu => Boolean(d))
    .map((dugum, sira) => ({ ...dugum, sira: sira + 1 }));

  const gorulenTest = new Set<string>();
  const testler: BeceriDugumu['testler'] = [];
  for (const adim of adimlar) {
    for (const test of adim.testler) {
      if (gorulenTest.has(test.slug)) continue;
      gorulenTest.add(test.slug);
      testler.push(test);
    }
  }

  return {
    ...rota,
    adimlar,
    toplamDakika: adimlar.reduce((t, a) => t + a.dakika, 0),
    testler,
  };
}

/**
 * `?hedef=` ve `?bilinen=` parametrelerini temizler.
 *
 * Adres çubuğu kullanıcı girdisidir; slug biçiminde olmayan, tekrarlayan veya
 * aşırı uzun değerler süzgeçten geçmez. Tanımsız slug'lar burada düşürülmez —
 * `rotaCikar()` onları `bilinmeyen` olarak raporlar ki sayfa sessizce yanlış
 * bir rota göstermek yerine durumu söyleyebilsin.
 */
export function slugParametresi(ham: string | string[] | undefined, sinir = 12): string[] {
  const metin = Array.isArray(ham) ? ham.join(',') : (ham ?? '');
  if (!metin.trim()) return [];
  return [
    ...new Set(
      metin
        .split(',')
        .map((p) => p.trim())
        .filter((p) => /^[a-z0-9-]{1,60}$/.test(p)),
    ),
  ].slice(0, sinir);
}
