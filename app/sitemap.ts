// Parçalı sitemap (BRIEF §7.1) — generateSitemaps ile tür başına parça:
// /sitemap/sayfalar.xml, /sitemap/makaleler.xml, ... İndeks ayrı dosyada
// (app/sitemap.xml/route.ts). lastModified yalnız içerik parçalarında ve
// GERÇEK updatedAt'tir; statik sayfalara uydurma tarih yazılmaz.
//
// DB'siz dayanıklılık (app/(site)/page.tsx deseni): tüm DB çağrıları
// try/catch'li, hata → boş parça; build asla kırılmaz.
import type { MetadataRoute } from "next";
import { yayindakiIcerikListesi } from "@/lib/db/queries/contents";
import { terimListesi } from "@/lib/db/queries/terms";
import { pillarlar, tumClusterlar } from "@/lib/db/queries/topics";
import { env } from "@/lib/env";
import { icerikYolu, type IcerikTuru } from "@/lib/rotalar";
import {
  DIGER_TURLER,
  PARCA_ICERIK_TURU,
  SITEMAP_PARCALARI,
  sitemapParcasiMi,
} from "@/lib/sitemap-parcalari";
import { turSayisi } from "@/lib/db/queries/arsiv";
import { ARSIVLI_TURLER, turIndeksYolu } from "@/lib/tur-arsivi";

export function generateSitemaps(): { id: string }[] {
  return SITEMAP_PARCALARI.map((id) => ({ id }));
}

const mutlak = (yol: string) => `${env.NEXT_PUBLIC_SITE_URL}${yol}`;

async function icerikParcasi(type: IcerikTuru): Promise<MetadataRoute.Sitemap> {
  try {
    const liste = await yayindakiIcerikListesi({ type, adet: 5000 });
    return liste.map((icerik) => ({
      url: mutlak(icerikYolu(icerik.type, icerik.slug)),
      lastModified: icerik.updatedAt,
    }));
  } catch {
    return [];
  }
}

async function konuParcasi(): Promise<MetadataRoute.Sitemap> {
  try {
    const [konular, clusterlar] = await Promise.all([pillarlar(), tumClusterlar()]);
    return [
      ...konular.map((pillar) => ({ url: mutlak(`/konu/${pillar.slug}`) })),
      ...clusterlar.map((c) => ({ url: mutlak(`/konu/${c.pillar}/${c.slug}`) })),
    ];
  } catch {
    return [];
  }
}

async function sozlukParcasi(): Promise<MetadataRoute.Sitemap> {
  try {
    const terimler = await terimListesi();
    return terimler.map((terim) => ({ url: mutlak(`/sozluk/${terim.slug}`) }));
  } catch {
    return [];
  }
}

// Next 16: id, ".xml" uzantısı soyulmuş string'e çözülen Promise olarak gelir.
export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const id = await props.id;
  if (!sitemapParcasiMi(id)) return [];

  switch (id) {
    case "sayfalar": {
      // Tür indeksleri ARSIVLI_TURLER'den türetilir ve YALNIZ yayını olanlar
      // girer: boş arşiv sayfaları noindex olduğu için sitemap'e de girmemeli
      // (iki yüzeyin aynı şeyi söylemesi gerekir). İçerik açıldığı an
      // kendiliğinden listeye dahil olurlar.
      const turIndeksleri = (
        await Promise.all(
          ARSIVLI_TURLER.map(async (tur) => {
            try {
              return (await turSayisi(tur)) > 0 ? turIndeksYolu(tur) : null;
            } catch {
              return null;
            }
          }),
        )
      ).filter((yol): yol is string => yol !== null);

      // Açık statik rotalar. /ara noindex olduğu için YOK; sonraki fazlara
      // ait modül sayfaları (forum/kurs/patika/giris) bilinçli olarak var —
      // gerçek içerik taşıyorlar ve plan şeffaflığı sağlıyorlar.
      return [
        "/",
        "/konu",
        "/sozluk",
        "/bulten",
        ...turIndeksleri,
        "/hakkinda",
        "/editoryal-politika",
        "/kunye",
        "/iletisim",
        "/kvkk-aydinlatma",
        "/gizlilik",
        "/cerez-politikasi",
        "/kullanim-sartlari",
        "/forum",
        "/kurs",
        "/patika",
      ].map((yol) => ({ url: mutlak(yol) }));
    }
    case "makaleler":
    case "rehberler":
    case "uygulamalar": {
      const tur = PARCA_ICERIK_TURU[id];
      return tur ? icerikParcasi(tur) : [];
    }
    case "diger": {
      const parcalar = await Promise.all(DIGER_TURLER.map((tur) => icerikParcasi(tur)));
      return parcalar.flat();
    }
    case "konular":
      return konuParcasi();
    case "sozluk":
      return sozlukParcasi();
  }
}
