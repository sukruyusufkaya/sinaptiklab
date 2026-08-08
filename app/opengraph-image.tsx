// Kök OG görseli — tasarım lib/og.tsx'te (dört OG route'unun ortak kaynağı).
// token kopyaları: --murekkep #12161B, --sinyal #1B3BFF, --kagit #F1F2ED
// (globals.css'ten; değişirse güncelle) — hex'ler lib/og.tsx'te kullanılır,
// satori CSS değişkeni desteklemediği için orada serbesttir.
import type { ImageResponse } from "next/og";
import { kokOgGorseli, OG_BOYUT, OG_ICERIK_TIPI } from "@/lib/og";

export const runtime = "nodejs";
export const alt = "Sinaptiklab — Saha verisi, uydurma yok.";
export const size = OG_BOYUT;
export const contentType = OG_ICERIK_TIPI;

export default function Image(): ImageResponse {
  return kokOgGorseli();
}
