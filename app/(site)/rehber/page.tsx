// /rehber — rehber (type: "guide") arşivi (BRIEF §2.2). Desen: app/(site)/makale/page.tsx.
import type { Metadata } from "next";
import { TurArsivi } from "@/components/content/TurArsivi";
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
  return turArsiviUstVerisi("guide", sayfaOku(ham["sayfa"]));
}

export default async function RehberArsivi({ searchParams }: Props) {
  const ham = await searchParams;
  return <TurArsivi tur="guide" sayfa={sayfaOku(ham["sayfa"])} />;
}
