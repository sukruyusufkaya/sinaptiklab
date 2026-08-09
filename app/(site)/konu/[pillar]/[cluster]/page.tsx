// /konu/<pillar>/<cluster> — cluster hub'ı (BRIEF §2.2). Cluster kaydı
// topics'ten (kind: "cluster", parent: <pillar>) gelir; geçersiz pillar/cluster
// kombinasyonu 404'tür. İçerikler `clusters[]` üzerinden eşleşir.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IcerikKarti } from "@/components/content/IcerikKarti";
import { clusterDetay, clusterIcerikleri, type ClusterDetayDTO } from "@/lib/db/queries/arsiv";
import type { IcerikOzetDTO } from "@/lib/db/queries/dto";
import { env } from "@/lib/env";
import { icerikYolu } from "@/lib/rotalar";
import { breadcrumbJsonLd, jsonLdScript, koleksiyonSayfasiJsonLd } from "@/lib/seo/jsonld";

interface Props {
  params: Promise<{ pillar: string; cluster: string }>;
}

export function generateStaticParams(): { pillar: string; cluster: string }[] {
  return [];
}

/** DB erişilemezse 404: var olmayan cluster ile aynı davranış (yarım hub yok). */
async function detayGetir(pillar: string, cluster: string): Promise<ClusterDetayDTO | null> {
  try {
    return await clusterDetay(pillar, cluster);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pillar, cluster } = await params;
  const detay = await detayGetir(pillar, cluster);
  if (detay === null) return {};
  return {
    title: `${detay.title} — ${detay.pillarTitle}`,
    description: (detay.intro !== "" ? detay.intro : `${detay.title} alt kümesindeki yayınlar.`)
      .slice(0, 155)
      .trim(),
    alternates: {
      canonical: `${env.NEXT_PUBLIC_SITE_URL}/konu/${detay.pillarSlug}/${detay.slug}`,
    },
  };
}

export default async function ClusterSayfasi({ params }: Props) {
  const { pillar, cluster } = await params;
  const detay = await detayGetir(pillar, cluster);
  if (detay === null) notFound();

  let icerikler: IcerikOzetDTO[] = [];
  try {
    icerikler = await clusterIcerikleri(detay.pillarSlug, detay.slug);
  } catch {
    icerikler = [];
  }

  const pillarUrl = `${env.NEXT_PUBLIC_SITE_URL}/konu/${detay.pillarSlug}`;
  const mutlakUrl = `${pillarUrl}/${detay.slug}`;

  return (
    <>
      <section className="mm-zemin border-b border-doku">
        <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-12">
          <nav aria-label="Sayfa yolu" className="font-mono text-xs text-murekkep-2">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li>
                <Link href="/" className="text-murekkep-2 no-underline hover:text-sinyal">
                  Ana sayfa
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href="/konu" className="text-murekkep-2 no-underline hover:text-sinyal">
                  Konular
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link
                  href={`/konu/${detay.pillarSlug}`}
                  className="text-murekkep-2 no-underline hover:text-sinyal"
                >
                  {detay.pillarTitle}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-murekkep">
                {detay.title}
              </li>
            </ol>
          </nav>

          <p className="bolum-indeks mt-6 uppercase">§ alt küme</p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight [font-stretch:94%]">
            {detay.title}
          </h1>
          {detay.intro !== "" && (
            <p className="mt-4 max-w-[var(--govde-olcu)] leading-relaxed text-murekkep-2">
              {detay.intro}
            </p>
          )}

          <div className="veri-rayi mt-7 max-w-lg bg-kagit">
            <div>
              yayın
              <br />
              <span className="deger">{detay.icerikSayisi}</span>
            </div>
            <div>
              üst konu
              <br />
              <span className="deger">{detay.pillarTitle}</span>
            </div>
          </div>

          <p className="mt-6 font-mono text-sm">
            <Link href={`/konu/${detay.pillarSlug}`}>← {detay.pillarTitle} haritasına dön</Link>
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-12">
        <h2 className="font-display text-2xl font-bold">Bu alt kümedeki yayınlar</h2>
        {icerikler.length > 0 ? (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {icerikler.map((icerik, sira) => (
              <li key={icerik.id} className="min-w-0">
                <IcerikKarti icerik={icerik} sira={sira + 1} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 max-w-[52ch] text-murekkep-2">
            Bu alt kümede henüz yayın yok. Editoryal takvimde sıradaki başlıklardan biri —{" "}
            <Link href={`/konu/${detay.pillarSlug}`}>{detay.pillarTitle}</Link> altındaki diğer
            kümelere göz atabilirsiniz.
          </p>
        )}
      </div>

      {jsonLdScript(
        breadcrumbJsonLd([
          { ad: "Ana sayfa", url: env.NEXT_PUBLIC_SITE_URL },
          { ad: "Konular", url: `${env.NEXT_PUBLIC_SITE_URL}/konu` },
          { ad: detay.pillarTitle, url: pillarUrl },
          { ad: detay.title, url: mutlakUrl },
        ]),
      )}
      {icerikler.length > 0 &&
        jsonLdScript(
          koleksiyonSayfasiJsonLd({
            ad: `${detay.title} — ${detay.pillarTitle}`,
            aciklama: detay.intro !== "" ? detay.intro : `${detay.title} alt kümesindeki yayınlar.`,
            url: mutlakUrl,
            ogeler: icerikler.map((icerik) => ({
              baslik: icerik.title,
              url: `${env.NEXT_PUBLIC_SITE_URL}${icerikYolu(icerik.type, icerik.slug)}`,
            })),
          }),
        )}
    </>
  );
}
