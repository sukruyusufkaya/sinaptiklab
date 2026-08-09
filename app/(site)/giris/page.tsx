import type { Metadata } from "next";
import { FazBekleyenSayfa } from "@/components/layout/FazBekleyenSayfa";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Giriş",
  description:
    "Ücretsiz üyelik: yorum yazmak, okuma geçmişini tutmak ve bülten tercihlerini yönetmek için.",
  alternates: { canonical: `${env.NEXT_PUBLIC_SITE_URL}/giris` },
};

export default function Sayfa() {
  return (
    <FazBekleyenSayfa
      indeks="erişim"
      baslik="Giriş"
      ozet="Ücretsiz üyelik: yorum yazmak, okuma geçmişini tutmak ve bülten tercihlerini yönetmek için."
      faz="Faz 7"
      kapsam={[
        "E-posta ile tek kullanımlık kod (OTP), GitHub ve Google ile giriş",
        "Yorumlar ve moderasyon kuyruğu",
        "KVKK akışları: verilerini dışa aktar ve hesabını sil",
        "Tüm yayın içeriği üyeliksiz ve ücretsiz kalmaya devam edecek",
      ]}
      simdilik={{
        metin:
          "Sitedeki tüm içerik giriş gerektirmez ve gerektirmeyecek. Üyelik yalnız topluluk özellikleri için gelecek.",
        href: "/",
        etiket: "Ana sayfa",
      }}
    />
  );
}
