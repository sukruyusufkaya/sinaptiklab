import { ObjectId } from "mongodb";
import { z } from "zod";

export const objectIdSema = z.custom<ObjectId>((v) => v instanceof ObjectId);

// BRIEF §4.1 sources item — her iddianın kaynağı
export const kaynakSema = z.object({
  label: z.string().min(1),
  url: z.url(),
  publisher: z.string().min(1),
  accessedAt: z.date(),
  kind: z.enum(["paper", "docs", "vendor", "data", "news", "own_field_data"]),
});
export type Kaynak = z.infer<typeof kaynakSema>;

export type IndexTanimi = {
  key: Record<string, 1 | -1>;
  options?: { unique?: boolean; name?: string; expireAfterSeconds?: number };
};
