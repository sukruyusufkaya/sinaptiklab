// /sozluk — kanonik TR YZ sözlüğü indeksi (BRIEF §2.2, §4.2). Harf çıpalı,
// alfabetik gruplanmış terim listesi. Terim korpusu DB'den gelir; DB'siz
// ortamda sayfa kırılmaz, dürüst "hazırlanıyor" durumu gösterir.
import type { Metadata } from "next";
import Link from "next/link";
import { terimListesi } from "@/lib/db/queries/terms";
import { env } from "@/lib/env";
import { breadcrumbJsonLd, jsonLdScript, tanimliTerimKumesiJsonLd } from "@/lib/seo/jsonld";
import { harfleGrupla } from "@/lib/sozluk";

export const metadata: Metadata = {
  title: "Sözlük — Türkçe yapay zeka terimleri",
  description:
    "Yapay zeka terimlerinin kanonik Türkçe karşılıkları: kısa tanım, İngilizce karşılık, eşanlamlılar ve kaynak. Terminoloji kaosuna tek referans.",
  alternates: { canonical: `${env.NEXT_PUBLIC_SITE_URL}/sozluk` },
};

export default async function SozlukSayfasi() {
  let terimler: Awaited<ReturnType<typeof terimListesi>> = [];
  try {
    terimler = await terimListesi();
  } catch {
    terimler = [];
  }

  const gruplar = harfleGrupla(terimler);

  return (
    <>
      {/* Sözlüğün kendi şeması: tek tek terim sayfaları DefinedTerm basıyordu,
          indeks yalnız WebSite taşıyordu. Küme + kırıntı yolu eklendi. */}
      {terimler.length > 0 && jsonLdScript(tanimliTerimKumesiJsonLd(terimler))}
      {jsonLdScript(
        breadcrumbJsonLd([
          { ad: "Ana sayfa", url: env.NEXT_PUBLIC_SITE_URL },
          { ad: "Sözlük", url: `${env.NEXT_PUBLIC_SITE_URL}/sozluk` },
        ]),
      )}
      <section className="mm-zemin border-b border-doku">
        <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-14">
          <p className="bolum-indeks uppercase">§ sözlük</p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight [font-stretch:94%]">
            Sözlük
          </h1>
          <p className="mt-4 max-w-[var(--govde-olcu)] leading-relaxed text-murekkep-2">
            Türkçe yapay zeka terminolojisi dağınık: aynı kavram beş ayrı adla anılıyor, çoğu metin
            İngilizceyi olduğu gibi taşıyor. Buradaki her madde bir kanonik Türkçe karşılık önerir,
            İngilizce aslını ve yaygın eşanlamlılarını kaydeder ve tanımı kaynağa bağlar.
          </p>
          <div className="veri-rayi mt-7 max-w-md bg-kagit">
            <div>
              terim
              <br />
              <span className="deger">{terimler.length}</span>
            </div>
            <div>
              harf grubu
              <br />
              <span className="deger">{gruplar.length}</span>
            </div>
            <div>
              kaynak
              <br />
              <span className="deger">zorunlu</span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-12">
        {terimler.length === 0 ? (
          <p className="max-w-[52ch] text-murekkep-2">
            Sözlük hazırlanıyor — çekirdek terimler yayına alınır alınmaz bu sayfada alfabetik
            olarak listelenecek. Bu arada <Link href="/konu">konu haritasına</Link> bakabilirsiniz.
          </p>
        ) : (
          <>
            {/* Harf dizini: WCAG 2.2 AA dokunma hedefi (2.5.8) gereği her
                bağlantı en az 24×24px — mono harfler tek başına 10px kalıyordu. */}
            <nav aria-label="Harf dizini" className="border-y border-doku py-2">
              <ul className="flex flex-wrap gap-1 font-mono text-sm">
                {gruplar.map((grup) => (
                  <li key={grup.harf}>
                    <a
                      href={`#${grup.cipa}`}
                      className="flex size-8 items-center justify-center border border-transparent rounded-md text-murekkep no-underline transition-colors hover:border-sinyal hover:text-sinyal"
                    >
                      {grup.harf}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-10 space-y-12">
              {gruplar.map((grup) => (
                <section key={grup.harf} aria-labelledby={grup.cipa}>
                  <h2
                    id={grup.cipa}
                    className="scroll-mt-24 border-b border-doku pb-2 font-display text-2xl font-bold"
                  >
                    <span className="text-sinyal">{grup.harf}</span>
                    <span className="ml-3 font-mono text-xs font-normal text-murekkep-2">
                      {grup.terimler.length} terim
                    </span>
                  </h2>
                  <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {grup.terimler.map((terim) => (
                      <li key={terim.slug} className="min-w-0">
                        <Link
                          href={`/sozluk/${terim.slug}`}
                          className="centik flex h-full flex-col border border-doku rounded-lg bg-kagit-alt no-underline transition-colors hover:border-doku-guclu"
                        >
                          <span className="flex items-baseline justify-between gap-3 border-b border-doku px-5 py-2.5 font-mono text-[0.65rem] tracking-[0.16em]">
                            <span className="truncate text-murekkep-2">{terim.en}</span>
                            <span className="shrink-0 text-sinyal">TR</span>
                          </span>
                          <span className="flex flex-1 flex-col p-5">
                            <span className="font-display text-lg font-semibold leading-snug text-murekkep">
                              {terim.tr}
                            </span>
                            <span className="mt-2.5 text-sm leading-relaxed text-murekkep-2">
                              {terim.shortDef}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
