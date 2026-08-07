// /makale/<slug> — yalnız type: "article" (BRIEF §2.2). İnce rota: veriyi
// yayindakiIcerik çeker, görünümü IcerikSayfasi kurar. ISR on-demand:
// build'de sayfa üretilmez (generateStaticParams boş), ilk istekte üretilip
// önbellenir; yayın aksiyonu revalidateTag ile tazeler.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IcerikSayfasi } from "@/components/content/IcerikSayfasi";
import { yayindakiIcerik } from "@/lib/db/queries/contents";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const icerik = await yayindakiIcerik(slug);
  if (icerik === null || icerik.type !== "article") return {};
  return {
    title: icerik.seo.title ?? icerik.title,
    description: icerik.seo.description ?? icerik.dek,
    openGraph: {
      type: "article",
      title: icerik.seo.title ?? icerik.title,
      description: icerik.seo.description ?? icerik.dek,
      modifiedTime: icerik.updatedAt,
      ...(icerik.publishedAt !== null ? { publishedTime: icerik.publishedAt } : {}),
    },
  };
}

export default async function MakaleSayfasi({ params }: Props) {
  const { slug } = await params;
  const icerik = await yayindakiIcerik(slug);
  if (icerik === null || icerik.type !== "article") notFound();
  return <IcerikSayfasi icerik={icerik} />;
}
