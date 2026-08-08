import type { WithId } from "mongodb";
import { z } from "zod";
import type { IndexTanimi } from "./ortak";

// BRIEF §4.2 events — hafif olay logu (YZ görünürlük ölçümü, §8.5).
// Yalnız dış referrer'lı görüntülemeler kaydedilir (KVKK minimalizmi:
// kişisel veri yok — yol, referrer host'u ve zaman damgası).
export const eventSema = z.object({
  type: z.string().min(1),
  path: z.string().min(1).max(300),
  referrerHost: z.string().max(200),
  /** YZ asistan segmenti (chatgpt.com, perplexity.ai…) eşleşirse etiket. */
  aiAgent: z.string().optional(),
  ts: z.date(),
});

export type Event = z.infer<typeof eventSema>;
export type EventDoc = WithId<Event>;

export const eventIndexes: IndexTanimi[] = [
  // 90 gün TTL (BRIEF §4.2)
  { key: { ts: 1 }, options: { expireAfterSeconds: 90 * 24 * 60 * 60, name: "ts_ttl_90g" } },
  { key: { aiAgent: 1, ts: -1 } },
  { key: { referrerHost: 1, ts: -1 } },
];
