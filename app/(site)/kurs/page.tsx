import type { Metadata } from "next";
import { FazBekleyenSayfa } from "@/components/layout/FazBekleyenSayfa";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Kurslar",
  description:
    "Sıralı, ödevli ve sertifikalı öğrenme programları: ders oynatıcı, ilerleme takibi ve doğrulanabilir tamamlama kaydı.",
  alternates: { canonical: `${env.NEXT_PUBLIC_SITE_URL}/kurs` },
};

export default function Sayfa() {
  return (
    <FazBekleyenSayfa
      indeks="kurs"
      baslik="Kurslar"
      ozet="Sıralı, ödevli ve sertifikalı öğrenme programları: ders oynatıcı, ilerleme takibi ve doğrulanabilir tamamlama kaydı."
      faz="Faz 8"
      kapsam={[
        "Ders oynatıcı: video + metin + çalıştırılabilir kod + quiz",
        "İlerleme takibi ve kaldığın yerden devam",
        "Tamamlamada doğrulanabilir sertifika (PDF + doğrulama kodu)",
        "Course/CourseInstance yapısal verisiyle arama motorlarında zengin sonuç",
      ]}
      simdilik={{
        metin:
          "Kurs müfredatının çekirdeği rehber içeriklerde şimdiden yayında; konu haritasından sıralı okuyabilirsiniz.",
        href: "/konu",
        etiket: "Konu haritası",
      }}
    />
  );
}
