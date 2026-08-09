import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IcerikEditoru } from "@/components/admin/IcerikEditoru";
import { icerikById, tumTopics, tumYazarlar } from "@/lib/db/queries/admin";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "İçeriği düzenle" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function IcerikDuzenleSayfasi({ params }: Props) {
  const { id } = await params;
  const [icerik, konular, yazarlar] = await Promise.all([
    icerikById(id),
    tumTopics(),
    tumYazarlar(),
  ]);
  if (icerik === null) notFound();

  return (
    <IcerikEditoru
      icerik={icerik}
      varsayilanTur={icerik.type}
      konular={konular}
      yazarSecenekleri={yazarlar}
      siteHost={new URL(env.NEXT_PUBLIC_SITE_URL).host}
    />
  );
}
