"use server";

// Yönlendirme yöneticisinin yazma yolları (BRIEF §2.2 + §11 "Redirect
// yöneticisi"). Okuma tarafı lib/db/queries/admin-ek.ts'te.
//
// NOT: "use server" dosyası yalnız async fonksiyon EXPORT edebilir; şemalar
// modül içinde tanımlıdır, dışarıya yalnız TİP verilir (derlemede silinir).
import { MongoServerError, ObjectId } from "mongodb";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { YONLENDIRME_TAG } from "@/lib/db/queries/redirects";
import type { Redirect } from "@/lib/db/schemas";
import { getDb } from "@/lib/mongodb";

const OBJECT_ID_HEX = /^[0-9a-f]{24}$/i;
/** Zincir takibinde sonsuz döngüye karşı üst sınır. */
const ZINCIR_SINIRI = 10;

export interface YonlendirmeSonucu {
  ok: boolean;
  /** Başarı mesajı (ok === true) — arayüzde yeşil satır. */
  mesaj: string;
  hatalar: string[];
  /** Kayıt yapıldı ama dikkat gerektiren durumlar (ör. yönlendirme zinciri). */
  uyarilar: string[];
}

const BOS_SONUC: YonlendirmeSonucu = { ok: false, mesaj: "", hatalar: [], uyarilar: [] };

/** Yol normalizasyonu: kırp, sondaki eğik çizgiyi at (kök hariç). */
function yoluNormalize(ham: string): string {
  const kirpilmis = ham.trim();
  if (kirpilmis.length > 1 && kirpilmis.endsWith("/")) return kirpilmis.replace(/\/+$/, "");
  return kirpilmis;
}

const siteYoluSema = z
  .string()
  .trim()
  .min(1, "Boş bırakılamaz.")
  .refine((deger) => !/\s/.test(deger), "Boşluk içeremez.")
  .refine(
    (deger) => deger.startsWith("/"),
    'Site içi yol olmalı ve "/" ile başlamalı (ör. /makale/eski-slug).',
  )
  .refine(
    (deger) => !deger.startsWith("//"),
    'Protokolsüz mutlak URL ("//host/...") kabul edilmez.',
  )
  .transform(yoluNormalize);

const hedefSema = z
  .string()
  .trim()
  .min(1, "Boş bırakılamaz.")
  .refine((deger) => !/\s/.test(deger), "Boşluk içeremez.")
  .refine(
    (deger) => deger.startsWith("/") || /^https?:\/\//i.test(deger),
    'Hedef "/" ile başlayan site içi yol ya da http(s):// ile başlayan mutlak URL olmalı.',
  )
  .refine(
    (deger) => !deger.startsWith("//"),
    'Protokolsüz mutlak URL ("//host/...") kabul edilmez.',
  )
  .transform(yoluNormalize);

const yonlendirmeGirdisiSema = z.object({
  from: siteYoluSema,
  to: hedefSema,
  code: z.union([z.literal(301), z.literal(308)]),
});

function zodHatalari(hata: z.ZodError): string[] {
  const alanAdi: Record<string, string> = { from: "Kaynak (from)", to: "Hedef (to)", code: "Kod" };
  return hata.issues.map((sorun) => {
    const yol = sorun.path.map(String).join(".");
    const etiket = alanAdi[yol] ?? yol;
    return etiket.length > 0 ? `${etiket}: ${sorun.message}` : sorun.message;
  });
}

async function koleksiyon() {
  const db = await getDb();
  return db.collection<Redirect>("redirects");
}

function onbellekleriDusur(): void {
  revalidateTag(YONLENDIRME_TAG, "max");
  revalidatePath("/admin/yonlendirmeler");
}

/**
 * Yeni kayıttan sonra oluşacak zinciri izler.
 * Dönüş: hedefe varana kadar geçilen yollar (aday hariç). Aday `from`'a geri
 * dönülürse dizinin son elemanı `from` olur → gerçek döngü.
 */
function zinciriIzle(from: string, to: string, tablo: Map<string, string>): string[] {
  const yol: string[] = [];
  let mevcut = to;
  for (let adim = 0; adim < ZINCIR_SINIRI; adim += 1) {
    yol.push(mevcut);
    if (mevcut === from) return yol; // döngü kapandı
    const sonraki = tablo.get(mevcut);
    if (sonraki === undefined) return yol;
    mevcut = sonraki;
  }
  return yol;
}

export async function yonlendirmeEkle(
  _oncekiDurum: YonlendirmeSonucu | null,
  formVerisi: FormData,
): Promise<YonlendirmeSonucu> {
  // TODO(faz-7): oturum/rol kontrolü (şimdilik middleware Basic Auth — ADR 0007)
  const kodHam = formVerisi.get("code");
  const ayristirma = yonlendirmeGirdisiSema.safeParse({
    from: formVerisi.get("from"),
    to: formVerisi.get("to"),
    code: kodHam === "308" ? 308 : 301,
  });
  if (!ayristirma.success) {
    return { ...BOS_SONUC, hatalar: zodHatalari(ayristirma.error) };
  }
  const { from, to, code } = ayristirma.data;

  if (from === to) {
    return {
      ...BOS_SONUC,
      hatalar: ["Kendine yönlendirme yapılamaz: kaynak ve hedef aynı yol."],
    };
  }

  const kayitlar = await koleksiyon();
  const mevcutlar = await kayitlar.find({}, { projection: { from: 1, to: 1 } }).toArray();

  if (mevcutlar.some((kayit) => kayit.from === from)) {
    return {
      ...BOS_SONUC,
      hatalar: [`"${from}" için zaten bir yönlendirme var; önce mevcut kaydı silin.`],
    };
  }

  // Döngü/zincir denetimi: yeni kayıt eklendikten SONRAKİ tabloyu simüle et.
  const tablo = new Map(mevcutlar.map((kayit) => [kayit.from, kayit.to]));
  tablo.set(from, to);
  const zincir = zinciriIzle(from, to, tablo);
  const sonDurak = zincir[zincir.length - 1] ?? to;
  const cizim = [from, ...zincir].join(" → ");
  const uyarilar: string[] = [];
  if (sonDurak === from) {
    return {
      ...BOS_SONUC,
      hatalar: [`Döngü oluşur: ${cizim}. Kayıt eklenmedi; önce zincirdeki kayıtları düzeltin.`],
    };
  }
  if (zincir.length > 1) {
    uyarilar.push(
      `Yönlendirme zinciri oluştu: ${cizim}. Arama motorları zinciri sevmez; "${from}" doğrudan "${sonDurak}" hedefini göstermeli.`,
    );
  }

  try {
    await kayitlar.insertOne({ from, to, code, createdAt: new Date() });
  } catch (hata) {
    if (hata instanceof MongoServerError && hata.code === 11000) {
      return {
        ...BOS_SONUC,
        hatalar: [`"${from}" için zaten bir yönlendirme var (benzersiz index).`],
      };
    }
    throw hata;
  }

  onbellekleriDusur();
  return {
    ok: true,
    mesaj: `Yönlendirme eklendi: ${from} → ${to} (${code}).`,
    hatalar: [],
    uyarilar,
  };
}

export async function yonlendirmeSil(formVerisi: FormData): Promise<void> {
  // TODO(faz-7): oturum/rol kontrolü
  const id = formVerisi.get("id");
  if (typeof id !== "string" || !OBJECT_ID_HEX.test(id)) return;
  const kayitlar = await koleksiyon();
  await kayitlar.deleteOne({ _id: new ObjectId(id) });
  onbellekleriDusur();
}
