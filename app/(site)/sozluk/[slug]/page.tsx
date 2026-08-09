// /sozluk/<slug> — terim sayfası (BRIEF §2.2, §4.2). DefinedTerm JSON-LD ile
// terim varlığını (entity) beyan eder; uzun tanım MDX olarak derlenir.
// ISR on-demand: build'de üretilmez (generateStaticParams boş), bilinmeyen
// slug notFound.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { terimBySlug } from "@/lib/db/queries/terms";
import { pillarDetay } from "@/lib/db/queries/topics";
import { env } from "@/lib/env";
import { mdxDerle } from "@/lib/mdx/derle";
import { breadcrumbJsonLd, jsonLdScript, tanimliTerimJsonLd } from "@/lib/seo/jsonld";

interface Props {
  params: Promise<{ slug: string }>;
}

const TARIH_TR = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" });

export function generateStaticParams(): { slug: string }[] {
  return [];
}

/** DB yoksa (secret'sız build) sayfa 404'e düşer, build kırılmaz. */
async function terimGetir(slug: string) {
  try {
    return await terimBySlug(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const terim = await terimGetir(slug);
  if (terim === null) return {};
  return {
    title: `${terim.tr} (${terim.en}) — sözlük`,
    description: terim.shortDef.slice(0, 155),
    alternates: { canonical: `${env.NEXT_PUBLIC_SITE_URL}/sozluk/${terim.slug}` },
  };
}

export default async function TerimSayfasi({ params }: Props) {
  const { slug } = await params;
  const terim = await terimGetir(slug);
  if (terim === null) notFound();

  const mutlakUrl = `${env.NEXT_PUBLIC_SITE_URL}/sozluk/${terim.slug}`;
  const { icerik: uzunTanim } = await mdxDerle(terim.longDef);

  let konuBasligi: string | null = null;
  try {
    konuBasligi = (await pillarDetay(terim.pillar))?.title ?? null;
  } catch {
    konuBasligi = null;
  }

  return (
    <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-12">
      {jsonLdScript(tanimliTerimJsonLd(terim, mutlakUrl))}
      {jsonLdScript(
        breadcrumbJsonLd([
          { ad: "Ana sayfa", url: `${env.NEXT_PUBLIC_SITE_URL}/` },
          { ad: "Sözlük", url: `${env.NEXT_PUBLIC_SITE_URL}/sozluk` },
          { ad: terim.tr, url: mutlakUrl },
        ]),
      )}

      <nav aria-label="Sayfa yolu" className="font-mono text-xs text-murekkep-2">
        <ol className="flex flex-wrap items-center gap-x-2">
          <li>
            <Link href="/" className="text-murekkep-2 no-underline hover:text-sinyal">
              Ana sayfa
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href="/sozluk" className="text-murekkep-2 no-underline hover:text-sinyal">
              Sözlük
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-murekkep">
            {terim.tr}
          </li>
        </ol>
      </nav>

      <header className="mt-6 max-w-[var(--govde-olcu)]">
        <h1 className="font-display text-3xl font-bold tracking-tight [font-stretch:94%]">
          {terim.tr}
        </h1>
        <p className="mt-2 font-mono text-sm text-murekkep-2">
          İngilizcesi: <span className="text-murekkep">{terim.en}</span>
          {konuBasligi !== null && (
            <>
              {" · "}
              <Link href={`/konu/${terim.pillar}`} className="no-underline hover:underline">
                {konuBasligi}
              </Link>
            </>
          )}
        </p>
      </header>

      {/* Kısa tanım kutusu: ekranda ilk okunan, GEO'da alıntılanan blok */}
      <div className="mm-zemin mt-8 max-w-[var(--govde-olcu)] border border-doku">
        <p className="border-b border-doku bg-kagit px-5 py-2 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-murekkep-2">
          kısa tanım
        </p>
        <p className="px-5 py-4 text-lg leading-relaxed">{terim.shortDef}</p>
      </div>

      <div
        className="mt-8 max-w-[var(--govde-olcu)] [&_h2]:mt-10 [&_h2]:scroll-mt-24 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_li]:mt-1 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5"
        // İlk paragrafın üst boşluğu kutuyla çakışmasın diye üstte mt-8 var.
      >
        {uzunTanim}
      </div>

      {terim.aliases.length > 0 && (
        <section aria-labelledby="esanlamli-baslik" className="mt-10 max-w-[var(--govde-olcu)]">
          <h2
            id="esanlamli-baslik"
            className="font-mono text-xs uppercase tracking-widest text-murekkep-2"
          >
            Eşanlamlılar ve yaygın kullanımlar
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {terim.aliases.map((ad) => (
              <li
                key={ad}
                className="border border-doku bg-kagit-alt px-3 py-1 font-mono text-sm text-murekkep-2"
              >
                {ad}
              </li>
            ))}
          </ul>
        </section>
      )}

      {terim.ilgili.length > 0 && (
        <section aria-labelledby="ilgili-baslik" className="mt-10 max-w-[var(--govde-olcu)]">
          <h2
            id="ilgili-baslik"
            className="font-mono text-xs uppercase tracking-widest text-murekkep-2"
          >
            İlgili terimler
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {terim.ilgili.map((baglanti) => (
              <li key={baglanti.slug}>
                <Link
                  href={`/sozluk/${baglanti.slug}`}
                  className="centik border border-doku bg-kagit-alt px-3 py-1 font-mono text-sm no-underline transition-colors hover:border-sinyal"
                >
                  {baglanti.tr}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {terim.sources.length > 0 && (
        <section aria-labelledby="kaynaklar-baslik" className="mt-10 max-w-[var(--govde-olcu)]">
          <h2 id="kaynaklar-baslik" className="font-display text-2xl font-bold">
            Kaynaklar
          </h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm">
            {terim.sources.map((kaynak, sira) => (
              <li key={`kaynak-${sira + 1}`}>
                <a href={kaynak.url} target="_blank" rel="noopener noreferrer">
                  {kaynak.label}
                </a>
                <span className="text-murekkep-2"> — {kaynak.publisher}</span>
                <span className="ml-2 font-mono text-xs text-murekkep-2">
                  erişim: {TARIH_TR.format(new Date(kaynak.accessedAt))}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="cetvel mt-12" aria-hidden />

      <p className="mt-6 font-mono text-xs text-murekkep-2">
        Bu terimi içeriklerde arayın:{" "}
        <Link href={`/ara?q=${encodeURIComponent(terim.tr)}`}>/ara?q={terim.tr}</Link>
      </p>
    </div>
  );
}
