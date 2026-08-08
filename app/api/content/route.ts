import { z } from "zod";
import { yayindakiIcerikListesi } from "@/lib/db/queries/contents";
import { env } from "@/lib/env";
import { icerikTuruSema } from "@/lib/db/schemas";
import { icerikYolu } from "@/lib/rotalar";

/**
 * Açık, sayfalanmış içerik okuma API'si (BRIEF §8.1) — ajanlar ve
 * entegrasyonlar için. Yalnız yayınlanmış içerik; gövde yerine .md
 * bağlantısı verilir (tam metin oradan). Kalıcı rate limit Upstash ile
 * Faz 7'de (BRIEF §9.3); şimdilik CDN önbelleği yükü sınırlar.
 */

const paramSema = z.object({
  sayfa: z.coerce.number().int().min(1).max(1000).default(1),
  adet: z.coerce.number().int().min(1).max(50).default(20),
  tur: icerikTuruSema.optional(),
  pillar: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .optional(),
});

export async function GET(istek: Request): Promise<Response> {
  const url = new URL(istek.url);
  const parse = paramSema.safeParse({
    sayfa: url.searchParams.get("sayfa") ?? undefined,
    adet: url.searchParams.get("adet") ?? undefined,
    tur: url.searchParams.get("tur") ?? undefined,
    pillar: url.searchParams.get("pillar") ?? undefined,
  });
  if (!parse.success) {
    return Response.json(
      { hata: "Geçersiz parametre", detay: z.treeifyError(parse.error) },
      { status: 400 },
    );
  }
  const { sayfa, adet, tur, pillar } = parse.data;

  try {
    const liste = await yayindakiIcerikListesi({ type: tur, pillar, sayfa, adet });
    const site = env.NEXT_PUBLIC_SITE_URL;
    return Response.json(
      {
        sayfa,
        adet,
        ogeler: liste.map((icerik) => ({
          slug: icerik.slug,
          tur: icerik.type,
          baslik: icerik.title,
          dek: icerik.dek,
          pillar: icerik.pillar,
          seviye: icerik.level,
          okumaDakikasi: icerik.readingMinutes,
          yayinTarihi: icerik.publishedAt,
          guncellemeTarihi: icerik.updatedAt,
          url: `${site}${icerikYolu(icerik.type, icerik.slug)}`,
          mdUrl: `${site}${icerikYolu(icerik.type, icerik.slug)}.md`,
        })),
        sonrakiSayfa: liste.length === adet ? sayfa + 1 : null,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch {
    return Response.json({ hata: "İçerik deposuna ulaşılamıyor" }, { status: 503 });
  }
}
