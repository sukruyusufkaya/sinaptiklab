// Editoryal durum makinesi — BRIEF §4.1 `status` alanının izinli geçişleri.
// Yayına giriş yalnız icerikYayinla üzerinden olur (editoryal kontroller şart);
// diğer geçişler icerikDurumDegistir ile yapılır. İkisi de önce bu tabloya sorar.
import type { Content } from "@/lib/db/schemas";

export type Durum = Content["status"];

/** Hata mesajları ve admin arayüzü için Türkçe durum etiketleri. */
export const DURUM_ETIKETLERI: Record<Durum, string> = {
  draft: "taslak",
  in_review: "incelemede",
  scheduled: "zamanlanmış",
  published: "yayında",
  archived: "arşivde",
};

/**
 * Geçiş tablosu:
 *   draft      → in_review
 *   in_review  → draft | scheduled | published
 *   scheduled  → published | draft
 *   published  → archived
 *   archived   → draft
 */
const GECIS_TABLOSU: Record<Durum, readonly Durum[]> = {
  draft: ["in_review"],
  in_review: ["draft", "scheduled", "published"],
  scheduled: ["published", "draft"],
  published: ["archived"],
  archived: ["draft"],
};

export function gecisGecerliMi(from: Durum, to: Durum): boolean {
  return GECIS_TABLOSU[from].includes(to);
}

/** Geçersiz geçiş için eyleme dönük Türkçe hata: mümkün hedefleri de sayar. */
export function gecisHatasi(from: Durum, to: Durum): string {
  const hedefler = GECIS_TABLOSU[from]
    .map((durum) => `"${DURUM_ETIKETLERI[durum]}" (${durum})`)
    .join(", ");
  return (
    `"${DURUM_ETIKETLERI[from]}" (${from}) durumundan "${DURUM_ETIKETLERI[to]}" (${to}) ` +
    `durumuna geçilemez; bu durumdan mümkün geçişler: ${hedefler}.`
  );
}
