// Rehber OG görseli — tasarım lib/og.tsx'te; içerik bulunamaz veya DB
// erişilemezse kök tasarım döner (her zaman geçerli PNG, 500 yok).
// token kopyaları: --murekkep #12161B, --sinyal #1B3BFF, --kagit #F1F2ED
// (globals.css'ten; değişirse güncelle) — hex'ler lib/og.tsx'te.
import type { ImageResponse } from "next/og";
import { icerikOgGorseli, OG_BOYUT, OG_ICERIK_TIPI } from "@/lib/og";

export const runtime = "nodejs";
export const alt = "Sinaptiklab rehberi";
export const size = OG_BOYUT;
export const contentType = OG_ICERIK_TIPI;

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: Props): Promise<ImageResponse> {
  const { slug } = await params;
  return icerikOgGorseli("guide", slug);
}
