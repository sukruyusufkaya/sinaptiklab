// /testler/<slug> — tek test sayfası. Sorular sunucuda render edilir
// (JS'siz de okunur, tarayıcı için de asıl değer gerekçe metnidir);
// işaretleme ve skor istemcide çalışır — hiçbir veri sunucuya gitmez.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TestCalistir } from "@/components/test/TestCalistir";
import { yayindakiIcerik } from "@/lib/db/queries/contents";
import { testBySlug, testListesi } from "@/lib/db/queries/quizzes";
import { env } from "@/lib/env";
import { seviyeEtiketi, type IcerikTuru } from "@/lib/rotalar";
import { breadcrumbJsonLd, jsonLdScript, testJsonLd } from "@/lib/seo/jsonld";

interface Props {
  params: Promise<{ slug: string }>;
}

const TARIH_TR = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" });

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    return (await testListesi()).map((t) => ({ slug: t.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const test = await testBySlug(slug);
  if (test === null) return {};
  const mutlakUrl = `${env.NEXT_PUBLIC_SITE_URL}/testler/${test.slug}`;
  return {
    title: test.title,
    description: test.dek,
    alternates: { canonical: mutlakUrl },
    openGraph: {
      type: "article",
      title: test.title,
      description: test.dek,
      url: mutlakUrl,
      modifiedTime: test.updatedAt,
      ...(test.publishedAt !== null ? { publishedTime: test.publishedAt } : {}),
    },
  };
}

const KAYNAK_TURU: Record<string, string> = {
  paper: "akademik makale",
  docs: "resmi dokümantasyon",
  vendor: "üretici kaynağı",
  data: "veri kümesi",
  news: "haber",
  own_field_data: "kendi saha ölçümümüz",
};

export default async function TestSayfasi({ params }: Props) {
  const { slug } = await params;
  const test = await testBySlug(slug);
  if (test === null) notFound();

  // Soruların kanıt içerikleri: slug → (tür, başlık). Yayından kalkmış ya da
  // taslağa dönmüş bir slug sessizce düşer — kırık link basılmaz.
  const kanitSluglari = [
    ...new Set(test.sorular.flatMap((s) => (s.kanitSlug ? [s.kanitSlug] : []))),
  ];
  const kanitlar: Record<string, { tur: IcerikTuru; baslik: string }> = {};
  await Promise.all(
    kanitSluglari.map(async (kanitSlug) => {
      try {
        const icerik = await yayindakiIcerik(kanitSlug);
        if (icerik !== null) kanitlar[kanitSlug] = { tur: icerik.type, baslik: icerik.title };
      } catch {
        /* kanıt çözülemezse açıklama yine görünür, yalnız link basılmaz */
      }
    }),
  );

  const mutlakUrl = `${env.NEXT_PUBLIC_SITE_URL}/testler/${test.slug}`;

  return (
    <>
      {jsonLdScript(testJsonLd(test, mutlakUrl))}
      {jsonLdScript(
        breadcrumbJsonLd([
          { ad: "Ana sayfa", url: env.NEXT_PUBLIC_SITE_URL },
          { ad: "Testler", url: `${env.NEXT_PUBLIC_SITE_URL}/testler` },
          { ad: test.title, url: mutlakUrl },
        ]),
      )}

      <article className="mx-auto max-w-[1280px] px-[var(--gutter)] py-10">
        <div className="mx-auto max-w-[72ch]">
          <nav aria-label="Sayfa yolu" className="font-mono text-xs text-murekkep-2">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li>
                <Link href="/" className="text-murekkep-2 no-underline hover:text-sinyal">
                  Ana sayfa
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href="/testler" className="text-murekkep-2 no-underline hover:text-sinyal">
                  Testler
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-murekkep">
                {test.title}
              </li>
            </ol>
          </nav>

          <h1 className="mt-6 font-display text-3xl font-bold leading-tight tracking-tight [font-stretch:94%]">
            {test.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-murekkep-2">{test.dek}</p>

          <div className="veri-rayi mt-7">
            <div>
              soru
              <br />
              <span className="deger">{test.soruSayisi}</span>
            </div>
            <div>
              süre
              <br />
              <span className="deger">~{test.durationMinutes} dk</span>
            </div>
            <div>
              seviye
              <br />
              <span className="deger">{seviyeEtiketi(test.level)}</span>
            </div>
            <div>
              geçme
              <br />
              <span className="deger">%{test.passScore}</span>
            </div>
            <div>
              son doğrulama
              <br />
              <span className="deger">{TARIH_TR.format(new Date(test.lastVerifiedAt))}</span>
            </div>
          </div>

          <p className="mt-4 font-mono text-xs leading-relaxed text-murekkep-2">
            Bir şık işaretlendiğinde soru kilitlenir ve gerekçe açılır. Skor tarayıcınızda
            hesaplanır; hiçbir cevap sunucuya gönderilmez, kaydedilmez.
          </p>

          <div className="mt-10">
            <TestCalistir sorular={test.sorular} passScore={test.passScore} kanitlar={kanitlar} />
          </div>

          {/* Kaynak defteri — testin dayandığı birincil kaynaklar */}
          <section aria-labelledby="test-kaynaklar" className="mt-12 border-t border-doku pt-8">
            <h2
              id="test-kaynaklar"
              className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-murekkep-2"
            >
              Kaynaklar
            </h2>
            <ol className="mt-4 space-y-3">
              {test.sources.map((kaynak, sira) => (
                <li key={kaynak.url} className="flex gap-3 text-sm">
                  <span className="shrink-0 font-mono text-xs text-murekkep-2">
                    {String(sira + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <a href={kaynak.url} rel="noopener noreferrer" target="_blank">
                      {kaynak.label}
                    </a>
                    <span className="mt-0.5 block font-mono text-xs text-murekkep-2">
                      {kaynak.publisher} · {KAYNAK_TURU[kaynak.kind] ?? kaynak.kind} · erişim{" "}
                      {TARIH_TR.format(new Date(kaynak.accessedAt))}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <p className="mt-10 font-mono text-sm">
            <Link href="/testler">← tüm testler</Link>
          </p>
        </div>
      </article>
    </>
  );
}
