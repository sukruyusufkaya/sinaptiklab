// İçerik rotalarının (makale/rehber/uygulama) paylaştığı JSON-LD bloğu (RSC).
// BRIEF §7.2: TechArticle (+ tutorial'da ek HowTo), BreadcrumbList, uygunsa
// FAQPage. Breadcrumb'ın "tür" kırıntısı URL'siz basılır: tür indeks rotası
// henüz yok; BreadcrumbList'te item'sız öğe geçerlidir.
import type { IcerikDetayDTO } from "@/lib/db/queries/dto";
import { env } from "@/lib/env";
import { icerikYolu, turEtiketi } from "@/lib/rotalar";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  howToJsonLd,
  jsonLdScript,
  techArticleJsonLd,
} from "@/lib/seo/jsonld";

export function IcerikYapisalVeri({ icerik }: { icerik: IcerikDetayDTO }) {
  const mutlakUrl = `${env.NEXT_PUBLIC_SITE_URL}${icerikYolu(icerik.type, icerik.slug)}`;

  return (
    <>
      {jsonLdScript(techArticleJsonLd(icerik, mutlakUrl))}
      {icerik.type === "tutorial" && jsonLdScript(howToJsonLd(icerik, mutlakUrl))}
      {jsonLdScript(
        breadcrumbJsonLd([
          { ad: "Ana sayfa", url: env.NEXT_PUBLIC_SITE_URL },
          { ad: turEtiketi(icerik.type) },
          { ad: icerik.title, url: mutlakUrl },
        ]),
      )}
      {icerik.faq.length > 0 && jsonLdScript(faqPageJsonLd(icerik.faq))}
    </>
  );
}
