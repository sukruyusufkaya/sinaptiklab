// /etiket/<slug> — etiket arşivi (BRIEF §2.2). Etiketler serbest metindir,
// URL slug'ı ASCII-normalize; eşleşmeyi lib/db/queries/arsiv.ts slugla() ile
// kurar (aynı etiketin "RAG"/"rag" gibi yazımları tek arşivde toplanır).
//
// BRIEF §7.1 KRİTİK: 10'dan az içerik taşıyan etiket arşivi INDEKSLENMEZ.
// Kural hem <meta robots>'ta hem sayfada mono notla açıkça belirtilir.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { IcerikKarti } from "@/components/content/IcerikKarti";
import { etiketIcerikleri, type EtiketArsiviDTO } from "@/lib/db/queries/arsiv";
import { env } from "@/lib/env";
import { icerikYolu } from "@/lib/rotalar";
import { breadcrumbJsonLd, jsonLdScript, koleksiyonSayfasiJsonLd } from "@/lib/seo/jsonld";
import { slugla } from "@/lib/slug";

/** §7.1 — ince içerik eşiği: bu sayının altındaki arşiv noindex. */
const INDEKS_ESIGI = 10;

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams(): { slug: string }[] {
  return [];
}

/** Bozuk yüzde kodlamasında (`%`, `%zz`) girdiyi olduğu gibi bırakır. */
function yuzdeCoz(ham: string): string {
  try {
    return decodeURIComponent(ham);
  } catch {
    return ham;
  }
}

/** DB erişilemezse 404'e düşeriz: yarım arşiv basmaktansa "yok" demek dürüst. */
async function arsivGetir(slug: string): Promise<EtiketArsiviDTO | null> {
  try {
    return await etiketIcerikleri(slug);
  } catch {
    return null;
  }
}

const aciklamaMetni = (arsiv: EtiketArsiviDTO) =>
  `“${arsiv.etiket}” etiketini taşıyan ${arsiv.icerikler.length} yayın: makaleler, rehberler ve uygulamalar tek arşivde.`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const arsiv = await arsivGetir(slug);
  if (arsiv === null) return {};
  const inceIcerik = arsiv.icerikler.length < INDEKS_ESIGI;
  return {
    title: `${arsiv.etiket} etiketi`,
    description: aciklamaMetni(arsiv).slice(0, 155),
    alternates: { canonical: `${env.NEXT_PUBLIC_SITE_URL}/etiket/${arsiv.slug}` },
    // §7.1 — ince içerik koruması; linkler yine izlenir ki keşif bozulmasın.
    ...(inceIcerik ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function EtiketArsivi({ params }: Props) {
  const { slug } = await params;

  // Kanonik adres normalize slug'tır: /etiket/RAG ve /etiket/vektör-arama gibi
  // varyantlar 301 ile tek adrese toplanır (BRIEF §2.2 slug kuralı; slugla
  // idempotent olduğu için döngü oluşmaz). Next dinamik segmenti çözmeden
  // verdiği için yüzde kodlaması önce açılır.
  const kanonikSlug = slugla(yuzdeCoz(slug));
  if (kanonikSlug !== "" && kanonikSlug !== slug) permanentRedirect(`/etiket/${kanonikSlug}`);

  const arsiv = await arsivGetir(slug);
  if (arsiv === null) notFound();

  const adet = arsiv.icerikler.length;
  const inceIcerik = adet < INDEKS_ESIGI;
  const mutlakUrl = `${env.NEXT_PUBLIC_SITE_URL}/etiket/${arsiv.slug}`;

  return (
    <>
      <section className="mm-zemin border-b border-doku">
        <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-12">
          <nav aria-label="Sayfa yolu" className="font-mono text-xs text-murekkep-2">
            <ol className="flex flex-wrap items-center gap-x-2">
              <li>
                <Link href="/" className="text-murekkep-2 no-underline hover:text-sinyal">
                  Ana sayfa
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>Etiket</li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-murekkep">
                {arsiv.etiket}
              </li>
            </ol>
          </nav>

          <p className="bolum-indeks mt-6 uppercase">§ etiket</p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight [font-stretch:94%]">
            {arsiv.etiket}
          </h1>
          <p className="mt-4 max-w-[var(--govde-olcu)] leading-relaxed text-murekkep-2">
            Bu etiketi taşıyan yayınlar. Etiket arşivleri konu hiyerarşisinin dışında, yatay bir
            kesittir — kalıcı yapı için <Link href="/konu">konu haritasına</Link> bakın.
          </p>

          <div className="veri-rayi mt-7 max-w-lg bg-kagit">
            <div>
              yayın
              <br />
              <span className="deger">{adet}</span>
            </div>
            <div>
              yazım
              <br />
              <span className="deger">{arsiv.varyantlar.length}</span>
            </div>
            <div>
              dizin
              <br />
              <span className="deger">{inceIcerik ? "kapalı" : "açık"}</span>
            </div>
          </div>

          {inceIcerik && (
            <p className="mt-4 max-w-[var(--govde-olcu)] font-mono text-[0.7rem] leading-relaxed tracking-[0.04em] text-murekkep-2">
              not: bu arşiv henüz indekslenmiyor — {INDEKS_ESIGI} içeriğin altındaki etiket
              sayfaları arama motorlarına <span className="text-murekkep">noindex</span> ile
              bildirilir (ince içerik koruması). Eşik aşıldığında dizine kendiliğinden açılır.
            </p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-12">
        {adet > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {arsiv.icerikler.map((icerik, sira) => (
              <li key={icerik.id} className="min-w-0">
                <IcerikKarti icerik={icerik} sira={sira + 1} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="max-w-[52ch] text-murekkep-2">
            Bu etiketle eşleşen yayın kalmamış. <Link href="/ara">Aramayı</Link> ya da{" "}
            <Link href="/konu">konu haritasını</Link> deneyin.
          </p>
        )}
      </div>

      {jsonLdScript(
        breadcrumbJsonLd([
          { ad: "Ana sayfa", url: env.NEXT_PUBLIC_SITE_URL },
          { ad: "Etiket" },
          { ad: arsiv.etiket, url: mutlakUrl },
        ]),
      )}
      {/* CollectionPage yalnız dizine açık arşivlerde basılır: noindex sayfaya
          zengin sonuç verisi koymak taramaya karışık sinyal gönderir. */}
      {!inceIcerik &&
        jsonLdScript(
          koleksiyonSayfasiJsonLd({
            ad: `${arsiv.etiket} etiketi`,
            aciklama: aciklamaMetni(arsiv),
            url: mutlakUrl,
            ogeler: arsiv.icerikler.map((icerik) => ({
              baslik: icerik.title,
              url: `${env.NEXT_PUBLIC_SITE_URL}${icerikYolu(icerik.type, icerik.slug)}`,
            })),
          }),
        )}
    </>
  );
}
