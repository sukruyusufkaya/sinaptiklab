// /makale — makale (type: "article") arşivi (BRIEF §2.2). İnce rota: sayfa
// numarasını okur, görünümü TurArsivi kurar, üst veriyi lib/tur-arsivi üretir.
// `?sayfa=N` okunduğu için render dinamiktir; veri katmanı yine ISR önbellekli
// (unstable_cache + ICERIK_LISTE_TAG), yani DB'ye istek başına gidilmez.
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
    bos = (await turSayisi("article")) === 0;
  } catch {
    bos = true;
  }
  return turArsiviUstVerisi("article", sayfaOku(ham["sayfa"]), { bos });
}

export default async function MakaleArsivi({ searchParams }: Props) {
  const ham = await searchParams;
  return <TurArsivi tur="article" sayfa={sayfaOku(ham["sayfa"])} />;
}
