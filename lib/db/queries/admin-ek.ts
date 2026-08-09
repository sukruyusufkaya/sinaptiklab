import type { ObjectId } from "mongodb";
import type { Content, Redirect } from "@/lib/db/schemas";
import { getDb } from "@/lib/mongodb";
import { icerikYolu, type IcerikTuru } from "@/lib/rotalar";

/**
 * Admin panelinin İKİNCİL okuma yolları (admin.ts'in devamı): yönlendirme
 * yöneticisi ve bakım paneli. admin.ts gibi ÖNBELLEKSİZ — çağıran sayfalar
 * force-dynamic, panel her istekte taze veri görmeli. ObjectId/Date → string
 * dönüşümleri burada yapılır; sayfalar düz veri alır.
 */

const GUN_MS = 24 * 60 * 60 * 1000;

/** BRIEF §11: `lastVerifiedAt` bu eşiği aşarsa içerik "çürüyen" sayılır. */
export const CURUME_ESIGI_GUN = 180;

/** BRIEF §4.3 kaynak kuralı geçer ama tek kaynak kalite riskidir (§11 denetimi). */
export const AZ_KAYNAK_ESIGI = 2;

// ── Yönlendirmeler ───────────────────────────────────────────────────

export interface YonlendirmeSatiri {
  id: string;
  from: string;
  to: string;
  code: Redirect["code"];
  createdAt: string;
}

/** Tüm 301/308 kayıtları, en yeni önce. */
export async function tumYonlendirmeler(): Promise<YonlendirmeSatiri[]> {
  const db = await getDb();
  const docs = await db
    .collection<Redirect>("redirects")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  return docs.map((doc) => ({
    id: doc._id.toHexString(),
    from: doc.from,
    to: doc.to,
    code: doc.code,
    createdAt: doc.createdAt.toISOString(),
  }));
}

// ── Bakım paneli ─────────────────────────────────────────────────────

export interface BakimIcerikSatiri {
  id: string;
  type: IcerikTuru;
  slug: string;
  title: string;
  /** Public yol — `/makale/<slug>` gibi (iç link taramasının anahtarı). */
  yol: string;
  lastVerifiedAt: string;
  /** Son doğrulamanın üzerinden geçen tam gün sayısı. */
  yasGun: number;
  kaynakSayisi: number;
  /** Diğer YAYINDAKİ içeriklerin gövdesinden gelen iç link sayısı. */
  gelenLink: number;
}

export interface TurDagilimi {
  type: IcerikTuru;
  toplam: number;
  durumlar: Record<Content["status"], number>;
}

export interface BakimRaporu {
  esikGun: number;
  toplamIcerik: number;
  yayinSayisi: number;
  /** `lastVerifiedAt` eşikten eski yayınlar — en eskiden yeniye. */
  curuyen: BakimIcerikSatiri[];
  /** Kaynak sayısı eşiğin altındaki yayınlar — en azdan çoğa. */
  azKaynak: BakimIcerikSatiri[];
  /** Hiç iç link almayan yayınlar (BRIEF §7.3 "yetim sayfa"). */
  yetim: BakimIcerikSatiri[];
  dagilim: TurDagilimi[];
  durumToplam: Record<Content["status"], number>;
}

interface BakimHamSatiri {
  _id: ObjectId;
  type: IcerikTuru;
  slug: string;
  title: string;
  status: Content["status"];
  lastVerifiedAt: Date;
  body: string;
  kaynakSayisi: number;
}

const BOS_DURUM_SAYACI = (): Record<Content["status"], number> => ({
  draft: 0,
  in_review: 0,
  scheduled: 0,
  published: 0,
  archived: 0,
});

/** Regex özel karakterlerini kaçırır (slug'lar bugün güvenli, savunma amaçlı). */
function regexKacir(metin: string): string {
  return metin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Yayındaki her içeriğe kaç iç link geldiğini sayar (BRIEF §7.3).
 * Tüm hedef yolları TEK regex'te birleştirir → gövde başına tek tarama.
 * Sondaki lookahead `/makale/rag` ile `/makale/rag-degerlendirme` karışmasını
 * engeller; içeriğin kendi gövdesindeki kendine link sayılmaz.
 */
function gelenLinkSayaci(yayinlar: BakimHamSatiri[]): Map<string, number> {
  const sayac = new Map<string, number>();
  const yollar = yayinlar.map((yayin) => icerikYolu(yayin.type, yayin.slug));
  for (const yol of yollar) sayac.set(yol, 0);
  if (yollar.length === 0) return sayac;

  const desen = new RegExp(`(?:${yollar.map(regexKacir).join("|")})(?![\\w-])`, "g");
  for (const kaynak of yayinlar) {
    const kaynakYolu = icerikYolu(kaynak.type, kaynak.slug);
    for (const es of kaynak.body.matchAll(desen)) {
      const bulunan = es[0];
      if (bulunan === undefined || bulunan === kaynakYolu) continue;
      sayac.set(bulunan, (sayac.get(bulunan) ?? 0) + 1);
    }
  }
  return sayac;
}

/**
 * BRIEF §11 bakım denetimi: çürüyen içerik, tür/durum dağılımı, kalite riski
 * (az kaynak) ve yetim sayfalar — tek DB turunda.
 */
export async function bakimRaporu(esikGun: number = CURUME_ESIGI_GUN): Promise<BakimRaporu> {
  const db = await getDb();
  const docs = await db
    .collection<Content>("contents")
    .aggregate<BakimHamSatiri>([
      {
        $project: {
          type: 1,
          slug: 1,
          title: 1,
          status: 1,
          lastVerifiedAt: 1,
          body: 1,
          kaynakSayisi: { $size: { $ifNull: ["$sources", []] } },
        },
      },
    ])
    .toArray();

  // Dağılım: tüm durumlar (taslak dahil); kalite listeleri yalnız yayınlar.
  const durumToplam = BOS_DURUM_SAYACI();
  const turHaritasi = new Map<IcerikTuru, TurDagilimi>();
  for (const doc of docs) {
    durumToplam[doc.status] += 1;
    const mevcut = turHaritasi.get(doc.type) ?? {
      type: doc.type,
      toplam: 0,
      durumlar: BOS_DURUM_SAYACI(),
    };
    mevcut.toplam += 1;
    mevcut.durumlar[doc.status] += 1;
    turHaritasi.set(doc.type, mevcut);
  }

  const yayinlar = docs.filter((doc) => doc.status === "published");
  const gelen = gelenLinkSayaci(yayinlar);
  const simdi = Date.now();

  const satirlar: BakimIcerikSatiri[] = yayinlar.map((doc) => {
    const yol = icerikYolu(doc.type, doc.slug);
    return {
      id: doc._id.toHexString(),
      type: doc.type,
      slug: doc.slug,
      title: doc.title,
      yol,
      lastVerifiedAt: doc.lastVerifiedAt.toISOString(),
      yasGun: Math.max(0, Math.floor((simdi - doc.lastVerifiedAt.getTime()) / GUN_MS)),
      kaynakSayisi: doc.kaynakSayisi,
      gelenLink: gelen.get(yol) ?? 0,
    };
  });

  return {
    esikGun,
    toplamIcerik: docs.length,
    yayinSayisi: yayinlar.length,
    curuyen: satirlar.filter((satir) => satir.yasGun > esikGun).sort((a, b) => b.yasGun - a.yasGun),
    azKaynak: satirlar
      .filter((satir) => satir.kaynakSayisi < AZ_KAYNAK_ESIGI)
      .sort((a, b) => a.kaynakSayisi - b.kaynakSayisi || a.title.localeCompare(b.title, "tr")),
    yetim: satirlar
      .filter((satir) => satir.gelenLink === 0)
      .sort((a, b) => a.title.localeCompare(b.title, "tr")),
    dagilim: [...turHaritasi.values()].sort((a, b) => b.toplam - a.toplam),
    durumToplam,
  };
}
