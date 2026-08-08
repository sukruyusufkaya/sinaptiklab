// Konu haritası — 12 pillar (onaylı ağaç, topics koleksiyonundan).
import type { Metadata } from "next";
import Link from "next/link";
import { pillarlar } from "@/lib/db/queries/topics";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Konular — Türkçe yapay zeka konu haritası",
  description:
    "Sinaptiklab'ın 12 ana başlıkta örgütlenmiş içerik haritası: LLM'lerden RAG'e, MLOps'tan regülasyona — her konu kaynaklı ve sürümlü içerikle.",
  alternates: { canonical: `${env.NEXT_PUBLIC_SITE_URL}/konu` },
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

  const toplamIcerik = liste.reduce((toplam, p) => toplam + p.icerikSayisi, 0);

  return (
    <>
      <section className="mm-zemin border-b border-doku">
        <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-14">
          <p className="bolum-indeks uppercase">§ konu haritası</p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight [font-stretch:94%]">
            Konular
          </h1>
          <p className="mt-4 max-w-[var(--govde-olcu)] leading-relaxed text-murekkep-2">
            İçerik, 12 ana başlık (pillar) altında örgütlenir; her başlık kendi alt kümeleriyle bir
            öğrenme ve referans alanıdır. Sayılar yalnız yayında olan içeriği gösterir.
          </p>
          <div className="veri-rayi mt-7 max-w-md bg-kagit">
            <div>
              ana başlık
              <br />
              <span className="deger">{liste.length}</span>
            </div>
            <div>
              yayında içerik
              <br />
              <span className="deger">{toplamIcerik}</span>
            </div>
            <div>
              güncelleme
              <br />
              <span className="deger">sürekli</span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-12">
        {liste.length === 0 && (
          <p className="mt-8 max-w-[52ch] text-murekkep-2">
            Konu haritası hazırlanıyor — kısa süre içinde bu sayfada 12 ana başlık ve alt kümeleri
            listelenecek.
          </p>
        )}

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {liste.map((pillar, sira) => (
            <li key={pillar.slug} className="min-w-0">
              <Link
                href={`/konu/${pillar.slug}`}
                className="centik flex h-full flex-col border border-doku bg-kagit-alt no-underline transition-colors hover:border-sinyal"
              >
                <span className="flex items-baseline justify-between border-b border-doku px-5 py-2.5 font-mono text-[0.65rem] tracking-[0.18em]">
                  <span className="text-sinyal">P{String(sira + 1).padStart(2, "0")}</span>
                  <span className="text-murekkep-2">
                    {pillar.icerikSayisi > 0 ? `${pillar.icerikSayisi} içerik` : "hazırlanıyor"}
                  </span>
                </span>
                <span className="flex flex-1 flex-col p-5">
                  <span className="font-display text-lg font-semibold leading-snug text-murekkep">
                    {pillar.title}
                  </span>
                  <span className="mt-2.5 text-sm leading-relaxed text-murekkep-2">
                    {pillar.intro}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
