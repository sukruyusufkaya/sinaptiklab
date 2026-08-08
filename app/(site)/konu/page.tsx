// Konu haritası — 12 pillar (onaylı ağaç, topics koleksiyonundan).
import type { Metadata } from "next";
import Link from "next/link";
import { pillarlar } from "@/lib/db/queries/topics";

export const metadata: Metadata = {
  title: "Konular — Türkçe yapay zeka konu haritası",
  description:
    "Sinaptiklab'ın 12 ana başlıkta örgütlenmiş içerik haritası: LLM'lerden RAG'e, MLOps'tan regülasyona — her konu kaynaklı ve sürümlü içerikle.",
};

export default async function KonularSayfasi() {
  // DB'siz ortamda (örn. secret'sız CI build'i) sayfa kırılmaz; boş durumda
  // dürüst "hazırlanıyor" mesajı basılır. DB varken build'de SSG.
  let liste: Awaited<ReturnType<typeof pillarlar>> = [];
  try {
    liste = await pillarlar();
  } catch {
    liste = [];
  }

  return (
    <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-12">
      <p className="font-mono text-xs uppercase tracking-widest text-murekkep-2">Konu haritası</p>
      <h1 className="mt-3 font-display text-3xl font-bold">Konular</h1>
      <p className="mt-3 max-w-[var(--govde-olcu)] text-murekkep-2">
        İçerik, 12 ana başlık (pillar) altında örgütlenir; her başlık kendi alt kümeleriyle bir
        öğrenme ve referans alanıdır. Sayılar yalnız yayında olan içeriği gösterir.
      </p>

      <div className="cetvel mt-8" aria-hidden />

      {liste.length === 0 && (
        <p className="mt-8 max-w-[52ch] text-murekkep-2">
          Konu haritası hazırlanıyor — kısa süre içinde bu sayfada 12 ana başlık ve alt kümeleri
          listelenecek.
        </p>
      )}

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {liste.map((pillar, sira) => (
          <li key={pillar.slug} className="min-w-0">
            <Link
              href={`/konu/${pillar.slug}`}
              className="flex h-full flex-col border border-doku bg-kagit-alt p-5 no-underline transition-colors hover:border-sinyal"
            >
              <p className="font-mono text-xs text-sinyal">{String(sira + 1).padStart(2, "0")}</p>
              <h2 className="mt-2 font-display text-lg font-semibold text-murekkep">
                {pillar.title}
              </h2>
              <p className="mt-2 text-sm text-murekkep-2">{pillar.intro}</p>
              <p className="mt-auto pt-4 font-mono text-xs text-murekkep-2">
                {pillar.icerikSayisi > 0 ? `${pillar.icerikSayisi} içerik` : "içerik hazırlanıyor"}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
