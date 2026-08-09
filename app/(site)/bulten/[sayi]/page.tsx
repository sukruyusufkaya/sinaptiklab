// /bulten/<sayi> — tek bülten sayısı (issue türü). Diğer içerik rotalarıyla
// aynı ince desen: veriyi sorgu katmanı çeker, görünümü IcerikSayfasi kurar.
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { IcerikSayfasi } from "@/components/content/IcerikSayfasi";
import { IcerikYapisalVeri } from "@/components/seo/IcerikYapisalVeri";
import { yayindakiIcerik } from "@/lib/db/queries/contents";
import { guvenliYonlendirmeBul } from "@/lib/db/queries/redirects";
import { env } from "@/lib/env";

interface Props {
  params: Promise<{ sayi: string }>;
}

export async function generateStaticParams(): Promise<{ sayi: string }[]> {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sayi } = await params;
  const icerik = await yayindakiIcerik(sayi);
  if (icerik === null || icerik.type !== "issue") return {};
  const mutlakUrl = `${env.NEXT_PUBLIC_SITE_URL}/bulten/${icerik.slug}`;
  return {
    title: icerik.seo.title ?? icerik.title,
    description: icerik.seo.description ?? icerik.dek,
    alternates: { canonical: icerik.seo.canonical ?? mutlakUrl },
    openGraph: {
      type: "article",
      title: icerik.seo.title ?? icerik.title,
      description: icerik.seo.description ?? icerik.dek,
      modifiedTime: icerik.updatedAt,
      ...(icerik.publishedAt !== null ? { publishedTime: icerik.publishedAt } : {}),
    },
  };
}

export default async function BultenSayisiSayfasi({ params }: Props) {
  const { sayi } = await params;
  const icerik = await yayindakiIcerik(sayi);
  if (icerik === null || icerik.type !== "issue") {
    const hedef = await guvenliYonlendirmeBul(`/bulten/${sayi}`);
    if (hedef !== null) permanentRedirect(hedef);
    notFound();
  }
  return (
    <>
      <IcerikYapisalVeri icerik={icerik} />
      <IcerikSayfasi icerik={icerik} />
    </>
  );
}
