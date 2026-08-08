import type { Metadata } from "next";
import { IcerikEditoru } from "@/components/admin/IcerikEditoru";
import { tumTopics, tumYazarlar } from "@/lib/db/queries/admin";
import type { IcerikTuru } from "@/lib/rotalar";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Yeni içerik" };

// Faz 2 alt kümesi: panelden bu üç tür oluşturulur; bilinmeyen ?tur → article.
const YENI_TURLER = ["article", "guide", "tutorial"] as const;

function turCoz(tur: string | undefined): IcerikTuru {
  return YENI_TURLER.find((aday) => aday === tur) ?? "article";
}

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function YeniIcerikSayfasi({ searchParams }: Props) {
  const parametreler = await searchParams;
  const turParam = parametreler["tur"];
  const tur = turCoz(typeof turParam === "string" ? turParam : undefined);

  const [konular, yazarlar] = await Promise.all([tumTopics(), tumYazarlar()]);

  return (
    <IcerikEditoru
      icerik={null}
      varsayilanTur={tur}
      konular={konular}
      yazarSecenekleri={yazarlar}
    />
  );
}
