import type { Metadata } from "next";
import { FazBekleyenSayfa } from "@/components/layout/FazBekleyenSayfa";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Öğrenme patikaları",
  description:
    "Belirli bir hedefe götüren 6-20 adımlık sıralı rotalar: her adım bir içerik ya da ders, ilerleme çubuğuyla.",
  alternates: { canonical: `${env.NEXT_PUBLIC_SITE_URL}/patika` },
};

export default function Sayfa() {
  return (
    <FazBekleyenSayfa
      indeks="patika"
      baslik="Öğrenme patikaları"
      ozet="Belirli bir hedefe götüren 6-20 adımlık sıralı rotalar: her adım bir içerik ya da ders, ilerleme çubuğuyla."
      kapsam={[
        "Rol bazlı patikalar (uygulayıcı mühendis, teknik lider, kariyer değiştiren)",
        "Her adımda ön koşul ve tahmini süre",
        "İlerleme kaydı ve kaldığın yerden devam",
      ]}
      simdilik={{
        metin:
          'Patikaların ilk taslağı "Yapay Zeka Mühendisi Yol Haritası" rehberinde sıralı biçimde anlatılıyor.',
        href: "/rehber/yapay-zeka-muhendisi-yol-haritasi",
        etiket: "Yol haritası rehberi",
      }}
    />
  );
}
