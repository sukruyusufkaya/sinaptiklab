// Pillar hub sayfası — başlık, kapsam, cluster haritası ve yayındaki içerik.
// (Cluster hub'ları /konu/<pillar>/<cluster> Faz 4'te; şimdilik çipler bilgi verir.)
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IcerikKarti } from "@/components/content/IcerikKarti";
import { yayindakiIcerikListesi } from "@/lib/db/queries/contents";
import { pillarDetay } from "@/lib/db/queries/topics";
import { env } from "@/lib/env";

interface Props {
  params: Promise<{ pillar: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pillar } = await params;
  const detay = await pillarDetay(pillar);
  if (!detay) return {};
  return {
    title: `${detay.title} — konu haritası`,
    description: detay.intro.slice(0, 155),
    alternates: { canonical: `${env.NEXT_PUBLIC_SITE_URL}/konu/${detay.slug}` },
  };
}

export function generateStaticParams() {
  return [];
}

export default async function PillarSayfasi({ params }: Props) {
  const { pillar } = await params;
  const detay = await pillarDetay(pillar);
  if (!detay) notFound();

  const icerikler = await yayindakiIcerikListesi({ pillar, adet: 24 });

  return (
    <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-12">
      <nav aria-label="Sayfa yolu" className="font-mono text-xs text-murekkep-2">
        <ol className="flex flex-wrap items-center gap-x-2">
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
          <li aria-current="page" className="text-murekkep">
            {detay.title}
          </li>
        </ol>
      </nav>

      <h1 className="mt-6 font-display text-3xl font-bold">{detay.title}</h1>
      <p className="mt-3 max-w-[var(--govde-olcu)] text-murekkep-2">{detay.intro}</p>
      <p className="mt-2 font-mono text-xs text-murekkep-2">
        {detay.icerikSayisi} yayında içerik · {detay.clusters.length} alt küme
      </p>

      {detay.clusters.length > 0 && (
        <section aria-labelledby="kumeler-baslik" className="mt-8">
          <h2
            id="kumeler-baslik"
            className="font-mono text-xs uppercase tracking-widest text-murekkep-2"
          >
            Alt kümeler
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {detay.clusters.map((k) => (
              <li
                key={k.slug}
                className="border border-doku bg-kagit-alt px-3 py-1 text-sm text-murekkep"
                title={k.intro}
              >
                {k.title}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="cetvel mt-10" aria-hidden />

      <section aria-labelledby="icerikler-baslik" className="mt-10">
        <h2 id="icerikler-baslik" className="font-display text-2xl font-bold">
          Yayındaki içerik
        </h2>
        {icerikler.length > 0 ? (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {icerikler.map((icerik) => (
              <li key={icerik.id} className="min-w-0">
                <IcerikKarti icerik={icerik} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 max-w-[52ch] text-murekkep-2">
            Bu başlıkta içerik hazırlanıyor. Editoryal takvimde sıradaki konulardan biri —
            yayınlananları kaçırmamak için ana sayfadaki akışı takip edebilirsiniz.
          </p>
        )}
      </section>
    </div>
  );
}
