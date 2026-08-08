// /makale/<slug> — yalnız type: "article" (BRIEF §2.2). İnce rota: veriyi
// yayindakiIcerik çeker, görünümü IcerikSayfasi kurar. ISR on-demand:
// build'de sayfa üretilmez (generateStaticParams boş), ilk istekte üretilip
// önbellenir; yayın aksiyonu revalidateTag ile tazeler.
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { IcerikSayfasi } from "@/components/content/IcerikSayfasi";
import { IcerikYapisalVeri } from "@/components/seo/IcerikYapisalVeri";
import { yayindakiIcerik } from "@/lib/db/queries/contents";
import { guvenliYonlendirmeBul } from "@/lib/db/queries/redirects";
import { env } from "@/lib/env";
import { icerikYolu } from "@/lib/rotalar";

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
  const mutlakUrl = `${env.NEXT_PUBLIC_SITE_URL}${icerikYolu(icerik.type, icerik.slug)}`;
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

export default async function MakaleSayfasi({ params }: Props) {
  const { slug } = await params;
  const icerik = await yayindakiIcerik(slug);
  if (icerik === null || icerik.type !== "article") {
    // Slug değişmişse redirects koleksiyonu kalıcı yönlendirir (BRIEF §2.2)
    const hedef = await guvenliYonlendirmeBul(`/makale/${slug}`);
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
