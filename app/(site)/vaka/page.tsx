// /vaka — vaka çalışması (type: "case") arşivi (BRIEF §2.2). Desen: app/(site)/makale/page.tsx.
import type { Metadata } from "next";
import { TurArsivi } from "@/components/content/TurArsivi";
import { turSayisi } from "@/lib/db/queries/arsiv";
import { sayfaNoOku } from "@/lib/search/ara";
import { turArsiviUstVerisi } from "@/lib/tur-arsivi";

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function sayfaOku(ham: string | string[] | undefined): number {
  return sayfaNoOku(Array.isArray(ham) ? ham[0] : ham);
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const ham = await searchParams;
  // Hiç yayın yoksa arşiv ince sayfadır → noindex, follow. DB'ye
  // ulaşılamazsa da aynı davranış: uydurma bir sayı indeksleme kararı vermez.
  let bos = true;
  try {
    bos = (await turSayisi("case")) === 0;
  } catch {
    bos = true;
  }
  return turArsiviUstVerisi("case", sayfaOku(ham["sayfa"]), { bos });
}

export default async function VakaArsivi({ searchParams }: Props) {
  const ham = await searchParams;
  return <TurArsivi tur="case" sayfa={sayfaOku(ham["sayfa"])} />;
}
