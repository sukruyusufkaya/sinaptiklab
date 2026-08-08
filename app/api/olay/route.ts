import { z } from "zod";
import { eventSema } from "@/lib/db/schemas";
import { yzAjanEtiketi } from "@/lib/geo/ai-ajanlar";
import { getDb } from "@/lib/mongodb";

/**
 * Hafif olay beacon'ı (BRIEF §8.5): yalnız dış referrer'lı görüntülemeler.
 * Kişisel veri yok (yol + referrer host + zaman). sendBeacon ile çağrılır;
 * hata durumunda sessizce 204 döner (istemciyi asla etkilemez).
 * Kaba koruma: gövde sınırı + alan doğrulaması; IP bazlı rate limit Upstash
 * ile Faz 7'de gelecek (BRIEF §9.3).
 */

const girdiSema = z.object({
  path: z
    .string()
    .min(1)
    .max(300)
    .regex(/^\/[^\s]*$/, "yol / ile başlamalı"),
  referrerHost: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9.-]+$/i, "host biçimi"),
});

export async function POST(istek: Request): Promise<Response> {
  try {
    const ham = await istek.text();
    if (ham.length > 1024) return new Response(null, { status: 204 });
    const girdi = girdiSema.safeParse(JSON.parse(ham));
    if (!girdi.success) return new Response(null, { status: 204 });

    const olay = eventSema.parse({
      type: "goruntuleme",
      path: girdi.data.path,
      referrerHost: girdi.data.referrerHost.toLowerCase(),
      aiAgent: yzAjanEtiketi(girdi.data.referrerHost),
      ts: new Date(),
    });
    const db = await getDb();
    await db.collection("events").insertOne(olay);
  } catch {
    /* telemetri asla hata sızdırmaz */
  }
  return new Response(null, { status: 204 });
}
