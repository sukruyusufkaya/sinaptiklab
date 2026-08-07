"use server";

// Editoryal Server Action'lar — BRIEF §3.1 (yazma yolları Server Action + zod),
// §4.3 (yayın zorlayıcıları), §11 (admin kontrol listesi).
//
// NOT: "use server" dosyası yalnız async fonksiyon EXPORT edebilir; bu yüzden
// `icerikGirdisiSema` modül içinde tanımlı ve dışarıya yalnız `IcerikGirdisi`
// TİPİ verilir (tip export'ları derlemede silindiği için serbesttir).
import { MongoServerError, ObjectId } from "mongodb";
import { revalidateTag } from "next/cache";
import { z } from "zod";

import { ICERIK_LISTE_TAG, icerikTag } from "@/lib/db/queries/contents";
import { contentSema, durumSema, kaynakSema, type Content } from "@/lib/db/schemas";
import { MdxDerlemeHatasi, mdxDerle, okumaSuresi, type TocMaddesi } from "@/lib/mdx/derle";
import { getDb } from "@/lib/mongodb";
import { slugla } from "@/lib/slug";
import { yayinKontrolleri, type KontrolSonucu } from "./dogrulayicilar";
import { gecisGecerliMi, gecisHatasi, type Durum } from "./durum-makinesi";

// ── Girdi şeması ─────────────────────────────────────────────────────
// contentSema'dan türetilir. Form serileştirmesi düz JSON taşıdığı için:
//   * ObjectId alanları (authors, technicalReviewer, relatedManual,
//     i18n.translationOf) 24 karakter hex STRING alınıp ObjectId'ye çevrilir,
//   * tarih alanları (lastVerifiedAt, sources[].accessedAt, repro.runDate)
//     ISO string kabul edilip Date'e çevrilir.
// Sunucu üretimli alanlar (toc, readingMinutes, excerptHtml, embedding,
// metrics, changelog, version, updatedAt, publishedAt) girdiden ATILIR;
// `status` da atılır — durum yalnız durum-makinesi action'larıyla değişir.

const OBJECT_ID_HEX = /^[0-9a-f]{24}$/i;

const objectIdHexSema = z
  .string()
  .regex(OBJECT_ID_HEX, "24 karakterlik ObjectId hex bekleniyor (ör. 665f1c2ab3d4e5f6a7b8c9d0).")
  .transform((hex) => new ObjectId(hex));

const isoTarihSema = z
  .union([
    z.date(),
    z
      .string()
      .refine(
        (deger) => !Number.isNaN(Date.parse(deger)),
        "Geçerli bir ISO tarih girin (ör. 2026-08-08T10:00:00Z).",
      ),
  ])
  .transform((deger) => (deger instanceof Date ? deger : new Date(deger)));

const kaynakGirdisiSema = kaynakSema.omit({ accessedAt: true }).extend({
  accessedAt: isoTarihSema,
});

const reproGirdisiSema = z.object({
  repoUrl: z.string().optional(),
  notebookUrl: z.string().optional(),
  modelIds: z.array(z.string()).optional(),
  hardware: z.string().optional(),
  runDate: isoTarihSema.optional(),
  approxCostUsd: z.number().optional(),
});

const icerikGirdisiSema = contentSema
  .omit({
    toc: true,
    readingMinutes: true,
    excerptHtml: true,
    embedding: true,
    metrics: true,
    changelog: true,
    version: true,
    updatedAt: true,
    publishedAt: true,
    status: true,
    slug: true,
    authors: true,
    technicalReviewer: true,
    lastVerifiedAt: true,
    sources: true,
    repro: true,
    relatedManual: true,
    i18n: true,
  })
  .extend({
    /** Verilirse mevcut belge güncellenir; yoksa yeni taslak oluşturulur. */
    id: z.string().regex(OBJECT_ID_HEX).optional(),
    /** Boş bırakılırsa slugla(title) üretilir. */
    slug: z.string().min(1).optional(),
    authors: z.array(objectIdHexSema),
    technicalReviewer: objectIdHexSema.nullable(),
    lastVerifiedAt: isoTarihSema,
    sources: z
      .array(kaynakGirdisiSema)
      .min(1, "En az bir kaynak ekleyin — kaynaksız içerik kaydedilse bile yayınlanamaz."),
    repro: reproGirdisiSema.nullable(),
    relatedManual: z.array(objectIdHexSema).default([]),
    i18n: z.object({
      lang: z.enum(["tr", "en"]),
      translationOf: objectIdHexSema.optional(),
    }),
  });

export type IcerikGirdisi = z.infer<typeof icerikGirdisiSema>;

export type KaydetSonucu =
  { ok: true; id: string; slug: string } | { ok: false; hatalar: string[] };
export type YayinSonucu =
  { ok: true; slug: string } | { ok: false; kontroller: KontrolSonucu[]; hatalar?: string[] };
export type DurumSonucu =
  { ok: true; slug: string; durum: Durum } | { ok: false; hatalar: string[] };

// ── Yardımcılar ──────────────────────────────────────────────────────

function zodHatalari(hata: z.ZodError): string[] {
  return hata.issues.map((sorun) => {
    const yol = sorun.path.map(String).join(".");
    return yol.length > 0 ? `${yol}: ${sorun.message}` : sorun.message;
  });
}

function htmlKacir(metin: string): string {
  return metin
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function icerikKoleksiyonu() {
  const db = await getDb();
  return db.collection<Content>("contents");
}

/**
 * İçerik sayfası + liste yüzeylerinin ISR önbelleğini düşürür (BRIEF §3.1).
 * Next 16'da revalidateTag profil parametresi zorunlu; "max" eski davranışın
 * (bir sonraki istekte tazele) birebir karşılığıdır.
 */
function icerikOnbellekleriniDusur(slug: string): void {
  revalidateTag(icerikTag(slug), "max");
  revalidateTag(ICERIK_LISTE_TAG, "max");
}

// ── icerikKaydet ─────────────────────────────────────────────────────

export async function icerikKaydet(girdi: unknown): Promise<KaydetSonucu> {
  // TODO(faz-7): oturum kontrolü
  const ayristirma = icerikGirdisiSema.safeParse(girdi);
  if (!ayristirma.success) {
    return { ok: false, hatalar: zodHatalari(ayristirma.error) };
  }
  const veri = ayristirma.data;

  // MDX kayıt anında derlenir: hem toc üretir hem sözdizimi hatasını satır
  // bilgisiyle yakalar (BRIEF: "hem sayfa render'ında hem kaydedilirken").
  let toc: TocMaddesi[];
  try {
    ({ toc } = await mdxDerle(veri.body));
  } catch (hata) {
    if (hata instanceof MdxDerlemeHatasi) {
      return { ok: false, hatalar: [hata.message] };
    }
    throw hata;
  }

  const slug = veri.slug ?? slugla(veri.title);
  if (slug.length === 0) {
    return {
      ok: false,
      hatalar: ['Slug üretilemedi: başlıkta harf/rakam bulunamadı; "slug" alanını elle doldurun.'],
    };
  }

  const simdi = new Date();
  const ortak = {
    type: veri.type,
    slug,
    title: veri.title,
    dek: veri.dek,
    answerFirst: veri.answerFirst,
    body: veri.body,
    // TODO(faz-3): dek yerine MDX'ten zenginleştirilmiş özet üretilecek.
    excerptHtml: `<p>${htmlKacir(veri.dek)}</p>`,
    level: veri.level,
    pillar: veri.pillar,
    clusters: veri.clusters,
    tags: veri.tags,
    authors: veri.authors,
    technicalReviewer: veri.technicalReviewer,
    lastVerifiedAt: veri.lastVerifiedAt,
    readingMinutes: okumaSuresi(veri.body),
    toc,
    faq: veri.faq,
    sources: veri.sources,
    repro: veri.repro,
    relatedManual: veri.relatedManual,
    seo: veri.seo,
    i18n: veri.i18n,
    updatedAt: simdi,
  };

  const koleksiyon = await icerikKoleksiyonu();
  try {
    if (veri.id === undefined) {
      const belge: Content = {
        ...ortak,
        status: "draft",
        publishedAt: null,
        embedding: [],
        changelog: [],
        metrics: { views: 0, avgScrollDepth: 0, aiReferrals: 0 },
        version: 1,
      };
      const eklenen = await koleksiyon.insertOne(belge);
      return { ok: true, id: eklenen.insertedId.toHexString(), slug };
    }

    // Güncelleme: status/publishedAt/changelog/metrics/embedding'e DOKUNULMAZ.
    // NOT(faz-4): yayındaki içeriğin slug'ı değişirse `redirects` koleksiyonuna
    // 301 kaydı üretilecek (BRIEF §2.2); redirect middleware Faz 4'te geliyor.
    const guncelleme = await koleksiyon.updateOne(
      { _id: new ObjectId(veri.id) },
      { $set: ortak, $inc: { version: 1 } },
    );
    if (guncelleme.matchedCount === 0) {
      return {
        ok: false,
        hatalar: [
          `İçerik bulunamadı (id: ${veri.id}); silinmiş olabilir — listeden yeniden seçin.`,
        ],
      };
    }
    return { ok: true, id: veri.id, slug };
  } catch (hata) {
    if (hata instanceof MongoServerError && hata.code === 11000) {
      return {
        ok: false,
        hatalar: [
          `"${slug}" slug'ı başka bir içerikte kullanılıyor; benzersiz bir slug girin veya başlığı değiştirin.`,
        ],
      };
    }
    throw hata;
  }
}

// ── icerikYayinla ────────────────────────────────────────────────────

export async function icerikYayinla(id: string): Promise<YayinSonucu> {
  // TODO(faz-7): oturum kontrolü
  if (!OBJECT_ID_HEX.test(id)) {
    return { ok: false, kontroller: [], hatalar: [`Geçersiz içerik id'si: "${id}".`] };
  }

  const koleksiyon = await icerikKoleksiyonu();
  const belge = await koleksiyon.findOne({ _id: new ObjectId(id) });
  if (belge === null) {
    return {
      ok: false,
      kontroller: [],
      hatalar: [`İçerik bulunamadı (id: ${id}); silinmiş olabilir — listeden yeniden seçin.`],
    };
  }

  if (!gecisGecerliMi(belge.status, "published")) {
    return { ok: false, kontroller: [], hatalar: [gecisHatasi(belge.status, "published")] };
  }

  // Doğrulama bağlamı: çakışma denetimi için aday DIŞI tüm slug'lar; iç link
  // önerileri için aynı pillar'daki YAYINDAKİ slug'lar (kural 8 sözleşmesi).
  const digerleri = await koleksiyon
    .find({ _id: { $ne: belge._id } }, { projection: { slug: 1, status: 1, pillar: 1 } })
    .toArray();
  const mevcutSluglar = digerleri.map((d) => d.slug);
  const yayindakiSluglar = digerleri
    .filter((d) => d.status === "published" && d.pillar === belge.pillar)
    .map((d) => d.slug);

  const kontroller = await yayinKontrolleri(belge, { mevcutSluglar, yayindakiSluglar });
  if (kontroller.some((kontrol) => !kontrol.gecti)) {
    return { ok: false, kontroller };
  }

  const simdi = new Date();
  const ilkYayinMi = belge.publishedAt === null;
  const changelogKaydi: Content["changelog"][number] = {
    at: simdi,
    by: belge.authors[0] ?? new ObjectId(),
    note: ilkYayinMi ? "İlk yayın" : "Yeniden yayın",
    kind: "major",
  };
  await koleksiyon.updateOne(
    { _id: belge._id },
    {
      $set: {
        status: "published",
        publishedAt: belge.publishedAt ?? simdi,
        lastVerifiedAt: simdi,
        updatedAt: simdi,
      },
      $push: { changelog: changelogKaydi },
    },
  );

  icerikOnbellekleriniDusur(belge.slug);
  return { ok: true, slug: belge.slug };
}

// ── icerikDurumDegistir ──────────────────────────────────────────────

export async function icerikDurumDegistir(id: string, hedef: Durum): Promise<DurumSonucu> {
  // TODO(faz-7): oturum kontrolü
  if (!OBJECT_ID_HEX.test(id)) {
    return { ok: false, hatalar: [`Geçersiz içerik id'si: "${id}".`] };
  }
  const hedefAyristirma = durumSema.safeParse(hedef);
  if (!hedefAyristirma.success) {
    return {
      ok: false,
      hatalar: [
        `Geçersiz hedef durum: "${String(hedef)}"; ${durumSema.options.join(" | ")} bekleniyor.`,
      ],
    };
  }
  if (hedefAyristirma.data === "published") {
    return {
      ok: false,
      hatalar: [
        "İçeriği yayına almak için icerikYayinla kullanın; yayın, editoryal kontroller (BRIEF §4.3) geçmeden yapılamaz.",
      ],
    };
  }

  const koleksiyon = await icerikKoleksiyonu();
  const belge = await koleksiyon.findOne({ _id: new ObjectId(id) });
  if (belge === null) {
    return {
      ok: false,
      hatalar: [`İçerik bulunamadı (id: ${id}); silinmiş olabilir — listeden yeniden seçin.`],
    };
  }

  if (!gecisGecerliMi(belge.status, hedefAyristirma.data)) {
    return { ok: false, hatalar: [gecisHatasi(belge.status, hedefAyristirma.data)] };
  }

  await koleksiyon.updateOne(
    { _id: belge._id },
    { $set: { status: hedefAyristirma.data, updatedAt: new Date() } },
  );

  // Yayından çıkışta (arşivleme/geri çekme) önbellekteki sayfa da düşmeli.
  if (belge.status === "published") {
    icerikOnbellekleriniDusur(belge.slug);
  }
  return { ok: true, slug: belge.slug, durum: hedefAyristirma.data };
}
