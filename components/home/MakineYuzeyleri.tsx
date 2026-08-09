/**
 * Makine okunabilir yüzeyler paneli (BRIEF §8.1). Bu, TR içerik alanında
 * hiçbir yayında olmayan farklılaştırıcıdır ve ana sayfada saklanmaz:
 * ajanların korpusa nasıl bağlanacağı doğrudan gösterilir.
 * Koyu `.ekran` paneli: "bu, sitenin makine tarafı" ayrımı görsel olarak da
 * okunur (ADR 0008).
 */
const YUZEYLER = [
  {
    ad: "llms.txt",
    yol: "/llms.txt",
    aciklama: "Site haritası, konu özetleri ve öncelikli içerik listesi — llmstxt.org biçiminde.",
  },
  {
    ad: ".md ham içerik",
    yol: "/rehber/rag-nedir.md",
    aciklama: "Her içerik URL'sinin sonuna .md ekleyin; temiz Markdown, bileşen artığı olmadan.",
  },
  {
    ad: "İçerik API",
    yol: "/api/content",
    aciklama: "Sayfalanmış JSON: tür ve konu filtreli, her kayıtta kanonik ve .md bağlantısı.",
  },
  {
    ad: "MCP uç noktası",
    yol: "/api/mcp",
    aciklama:
      "Model Context Protocol: ajanlar korpusta arama yapıp içeriği okuyabilir (icerik_ara, icerik_oku, konulari_listele).",
  },
] as const;

export function MakineYuzeyleri() {
  return (
    <section aria-labelledby="makine-baslik" className="ekran relative border-y border-doku">
      <div className="ekran-izgara">
        <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-14">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-doku pb-3">
            <div>
              <p className="bolum-indeks uppercase">§ 04 · makine tarafı</p>
              <h2
                id="makine-baslik"
                className="mt-2 font-display text-2xl font-bold tracking-tight text-murekkep"
              >
                İçerik ajanlara açık
              </h2>
            </div>
            <p className="font-mono text-xs text-murekkep-2">
              kimlik gerektirmez · ücretsiz · robots.txt&apos;te izinli
            </p>
          </div>

          <p className="mt-5 max-w-[68ch] leading-relaxed text-murekkep-2">
            Sinaptiklab yalnız insanlar için değil, yapay zeka asistanları için de okunabilir olacak
            biçimde inşa edildi. Aşağıdaki yüzeyler herkese açıktır; bir ajan korpusta arama yapıp
            kaynaklı içeriği doğrudan okuyabilir.
          </p>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {YUZEYLER.map((yuzey) => (
              <li key={yuzey.ad} className="min-w-0">
                <a
                  href={yuzey.yol}
                  className="centik flex h-full flex-col border border-doku rounded-lg bg-kagit-alt/60 p-5 no-underline transition-colors hover:border-doku-guclu"
                >
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="font-mono text-sm text-sinyal">{yuzey.ad}</span>
                    <span className="font-mono text-[0.65rem] text-murekkep-2">{yuzey.yol}</span>
                  </span>
                  <span className="mt-2.5 text-sm leading-relaxed text-murekkep-2">
                    {yuzey.aciklama}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
