// İçerik rotalarının paylaştığı JSON-LD bloğu (RSC). BRIEF §7.2:
//   her tür      → TechArticle + BreadcrumbList (+ FAQPage varsa)
//   tutorial     → ek HowTo
//   tool         → ek SoftwareApplication
//   benchmark    → ek Dataset
// Ek şemalar TechArticle'ı DEĞİŞTİRMEZ, yanına eklenir: metin gövdesi her
// türde bir teknik makaledir, tür şeması onun üstüne binen ikinci okumadır.
//
// Breadcrumb'ın "tür" kırıntısı arşiv rotası VARSA link taşır (/makale,
// /rehber, /uygulama); olmayan türlerde item'sız öğe basılır — BreadcrumbList
// bunu kabul eder.
import type { IcerikDetayDTO } from "@/lib/db/queries/dto";
import { env } from "@/lib/env";
import { icerikYolu, turEtiketi } from "@/lib/rotalar";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  howToJsonLd,
  jsonLdScript,
  techArticleJsonLd,
  veriKumesiJsonLd,
  yazilimUygulamasiJsonLd,
} from "@/lib/seo/jsonld";
import { turIndeksYolu } from "@/lib/tur-arsivi";

export function IcerikYapisalVeri({ icerik }: { icerik: IcerikDetayDTO }) {
  const mutlakUrl = `${env.NEXT_PUBLIC_SITE_URL}${icerikYolu(icerik.type, icerik.slug)}`;
  const indeksYolu = turIndeksYolu(icerik.type);

  return (
    <>
      {jsonLdScript(techArticleJsonLd(icerik, mutlakUrl))}
      {icerik.type === "tutorial" && jsonLdScript(howToJsonLd(icerik, mutlakUrl))}
      {/* Araç kartında fiyat verisi şemada henüz yok; teklif bilinçli olarak
          geçilmiyor (uydurma fiyat §14/7 yasağı — bkz. yazilimUygulamasiJsonLd). */}
      {icerik.type === "tool" && jsonLdScript(yazilimUygulamasiJsonLd(icerik, mutlakUrl))}
      {icerik.type === "benchmark" && jsonLdScript(veriKumesiJsonLd(icerik, mutlakUrl))}
      {jsonLdScript(
        breadcrumbJsonLd([
          { ad: "Ana sayfa", url: env.NEXT_PUBLIC_SITE_URL },
          {
            ad: turEtiketi(icerik.type),
            ...(indeksYolu !== null ? { url: `${env.NEXT_PUBLIC_SITE_URL}${indeksYolu}` } : {}),
          },
          { ad: icerik.title, url: mutlakUrl },
        ]),
      )}
      {icerik.faq.length > 0 && jsonLdScript(faqPageJsonLd(icerik.faq))}
    </>
  );
}
