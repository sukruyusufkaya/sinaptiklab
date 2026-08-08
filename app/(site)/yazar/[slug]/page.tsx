// /yazar/<slug> — gerçek E-E-A-T sayfası (BRIEF §8.4): kimlik + uzmanlık +
// doğrulanabilir dış bağlantılar (sameAs) + yazarın yayındaki içerikleri.
// ISR on-demand: build'de üretilmez (generateStaticParams boş), bilinmeyen
// slug notFound. Person JSON-LD kaynağı authors koleksiyonudur.
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { IcerikKarti } from "@/components/content/IcerikKarti";
import { yazarBySlug } from "@/lib/db/queries/authors";
import { yazarinYayinlari } from "@/lib/db/queries/contents";
import { env } from "@/lib/env";
import { jsonLdScript, kisiJsonLd } from "@/lib/seo/jsonld";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const yazar = await yazarBySlug(slug);
  if (yazar === null) return {};
  return {
    title: `${yazar.name} — yazar`,
    description: yazar.bio,
    alternates: { canonical: `${env.NEXT_PUBLIC_SITE_URL}/yazar/${yazar.slug}` },
  };
}

export default async function YazarSayfasi({ params }: Props) {
  const { slug } = await params;
  const yazar = await yazarBySlug(slug);
  if (yazar === null) notFound();

  const yayinlar = await yazarinYayinlari(yazar.id);
  const mutlakUrl = `${env.NEXT_PUBLIC_SITE_URL}/yazar/${yazar.slug}`;

  return (
    <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-12">
      {jsonLdScript(kisiJsonLd(yazar, mutlakUrl))}

      <p className="font-mono text-xs uppercase tracking-widest text-murekkep-2">Yazar</p>

      <div className="mt-3 flex flex-wrap items-start gap-6">
        {yazar.avatar !== "" && (
          <Image
            src={yazar.avatar}
            alt={yazar.name}
            width={96}
            height={96}
            className="border border-doku"
          />
        )}
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-bold">{yazar.name}</h1>
          <p className="mt-2 text-murekkep-2">
            {yazar.title}
            {yazar.employer !== "" && (
              <span className="font-mono text-sm"> · {yazar.employer}</span>
            )}
          </p>
        </div>
      </div>

      <p className="mt-6 max-w-[var(--govde-olcu)] text-murekkep-2">{yazar.longBio}</p>

      {yazar.expertise.length > 0 && (
        <section aria-labelledby="uzmanlik-baslik" className="mt-8">
          <h2
            id="uzmanlik-baslik"
            className="font-mono text-xs uppercase tracking-widest text-murekkep-2"
          >
            Uzmanlık alanları
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {yazar.expertise.map((alan) => (
              <li key={alan} className="border border-doku bg-kagit-alt px-3 py-1 text-sm">
                {alan}
              </li>
            ))}
          </ul>
        </section>
      )}

      {yazar.sameAs.length > 0 && (
        <section aria-labelledby="baglanti-baslik" className="mt-8">
          <h2
            id="baglanti-baslik"
            className="font-mono text-xs uppercase tracking-widest text-murekkep-2"
          >
            Doğrulanabilir profiller
          </h2>
          <ul className="mt-3 space-y-1">
            {yazar.sameAs.map((adres) => (
              <li key={adres}>
                <a
                  href={adres}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-murekkep hover:text-sinyal"
                >
                  {adres.replace(/^https?:\/\//, "")}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="cetvel mt-10" aria-hidden />

      <section aria-labelledby="yayinlar-baslik" className="mt-10">
        <h2 id="yayinlar-baslik" className="font-display text-2xl font-bold">
          Yayındaki içerik
        </h2>
        {yayinlar.length > 0 ? (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {yayinlar.map((icerik) => (
              <li key={icerik.id} className="min-w-0">
                <IcerikKarti icerik={icerik} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 max-w-[52ch] text-murekkep-2">Bu yazarın yayında içeriği henüz yok.</p>
        )}
      </section>
    </div>
  );
}
