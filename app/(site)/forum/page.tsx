import type { Metadata } from "next";
import { FazBekleyenSayfa } from "@/components/layout/FazBekleyenSayfa";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Forum",
  description:
    "Sinaptiklab forumu — teknik soru, saha deneyimi ve kod tartışması için moderasyonlu topluluk alanı.",
  alternates: { canonical: `${env.NEXT_PUBLIC_SITE_URL}/forum` },
};

export default function Sayfa() {
  return (
    <FazBekleyenSayfa
      indeks="forum"
      baslik="Forum"
      ozet="Sinaptiklab forumu — teknik soru, saha deneyimi ve kod tartışması için moderasyonlu topluluk alanı."
      faz="Faz 7"
      kapsam={[
        'Kategori → konu → yanıt yapısı, kod bloğu desteği ve "çözüldü" işareti',
        "Davetli başlangıç: boş forum güven kırdığı için ilk çekirdek toplulukla açılacak",
        "SEO: konular indekslenir, ince konular (2 yanıttan az ve 30 günden eski) otomatik noindex",
        "E-posta bildirimleri ve haftalık özet",
      ]}
      simdilik={{
        metin:
          "Sorularınızı şimdilik doğrudan iletebilirsiniz; her içerik hatası bildirimi kaynak düzeltmesiyle sonuçlanır.",
        href: "/iletisim",
        etiket: "İletişim",
      }}
    />
  );
}
