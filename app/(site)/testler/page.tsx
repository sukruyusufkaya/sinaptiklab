// /testler — test indeksi (kendini sınama modülü). Testler `quizzes`
// koleksiyonundan gelir; DB'siz ortamda sayfa kırılmaz, dürüst boş durum
// gösterir. Tür (konu / mülakat) başlıklarla ayrılır.
import type { Metadata } from "next";
import Link from "next/link";
import { ArsivBosGorseli, OkSagIkon, PillarIkon } from "@/components/gorsel";
import { testListesi, type TestOzetDTO } from "@/lib/db/queries/quizzes";
import { env } from "@/lib/env";
import { seviyeEtiketi } from "@/lib/rotalar";
import { breadcrumbJsonLd, jsonLdScript, koleksiyonSayfasiJsonLd } from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "Testler — kendini sına",
  description:
    "Türkçe yapay zeka testleri: LLM, RAG, MLOps ve güvenlik konularında çoktan seçmeli sorular. Her sorunun gerekçesi kaynaklı içeriğe bağlı.",
  alternates: { canonical: `${env.NEXT_PUBLIC_SITE_URL}/testler` },
};

const TUR_BASLIGI: Record<TestOzetDTO["kind"], { baslik: string; giris: string }> = {
  konu: {
    baslik: "Konu testleri",
    giris:
      "Bir konuyu gerçekten anladınız mı? Her soru sitedeki kaynaklı bir yayına dayanır; yanlış yaptığınızda gerekçe ve okunacak içerik birlikte gelir.",
  },
  mulakat: {
    baslik: "Mülakat hazırlığı",
    giris:
      "Teknik mülakatlarda gerçekten sorulan biçimde sorular: tanım ezberi değil, karar gerekçesi ölçülür.",
  },
};

function TestKarti({ test }: { test: TestOzetDTO }) {
  return (
    <Link
      href={`/testler/${test.slug}`}
      className="centik ok-kayar group flex h-full flex-col rounded-lg border border-doku bg-kagit-alt no-underline transition-colors hover:border-doku-guclu"
    >
      <span className="flex items-center justify-between border-b border-doku px-5 py-2.5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-sinyal">
        <span className="flex items-center gap-2">
          <PillarIkon pillar={test.pillar} className="size-[15px]" />
          {test.soruSayisi} soru
        </span>
        <span className="text-murekkep-2">~{test.durationMinutes} dk</span>
      </span>
      <span className="flex flex-1 flex-col p-5">
        <span className="font-display text-lg font-semibold leading-snug text-murekkep">
          {test.title}
        </span>
        <span className="mt-2.5 text-sm leading-relaxed text-murekkep-2">{test.dek}</span>
        <span className="mt-auto flex flex-wrap items-center gap-x-2 pt-5 font-mono text-[0.7rem] text-murekkep-2">
          <span className="rounded-md border border-doku px-1.5 py-0.5">
            {seviyeEtiketi(test.level)}
          </span>
          <span>geçme %{test.passScore}</span>
          <span aria-hidden className="ml-auto text-sinyal">
            <OkSagIkon className="ok size-4" />
          </span>
        </span>
      </span>
    </Link>
  );
}

export default async function TestlerSayfasi() {
  let testler: TestOzetDTO[] = [];
  try {
    testler = await testListesi();
  } catch {
    testler = [];
  }

  const turler: TestOzetDTO["kind"][] = ["konu", "mulakat"];
  const toplamSoru = testler.reduce((toplam, t) => toplam + t.soruSayisi, 0);

  return (
    <>
      {jsonLdScript(
        breadcrumbJsonLd([
          { ad: "Ana sayfa", url: env.NEXT_PUBLIC_SITE_URL },
          { ad: "Testler", url: `${env.NEXT_PUBLIC_SITE_URL}/testler` },
        ]),
      )}
      {testler.length > 0 &&
        jsonLdScript(
          koleksiyonSayfasiJsonLd({
            ad: "Testler",
            aciklama: "Türkçe yapay zeka testleri: her sorunun gerekçesi kaynaklı içeriğe bağlı.",
            url: `${env.NEXT_PUBLIC_SITE_URL}/testler`,
            toplam: testler.length,
            atla: 0,
            ogeler: testler.map((t) => ({
              baslik: t.title,
              url: `${env.NEXT_PUBLIC_SITE_URL}/testler/${t.slug}`,
            })),
          }),
        )}

      <section className="ekran relative overflow-hidden border-b border-doku">
        <div className="ekran-izgara">
          <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-14">
            <p className="bolum-indeks uppercase">§ test</p>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-murekkep [font-stretch:94%]">
              Kendini sına
            </h1>
            <p className="mt-4 max-w-[var(--govde-olcu)] leading-relaxed text-murekkep-2">
              Okumak ile bilmek aynı şey değil. Buradaki her soru sitedeki kaynaklı bir yayına
              dayanır; yanlış yaptığınızda neden yanlış olduğunu ve hangi metni okumanız gerektiğini
              birlikte gösterir. Kayıt yok, skor kaydedilmiyor, hiçbir veri sunucuya gitmiyor.
            </p>
            <div className="veri-rayi mt-7 max-w-lg">
              <div>
                test
                <br />
                <span className="deger">{testler.length}</span>
              </div>
              <div>
                soru
                <br />
                <span className="deger">{toplamSoru}</span>
              </div>
              <div>
                gerekçe
                <br />
                <span className="deger">her soruda</span>
              </div>
              <div>
                kayıt
                <br />
                <span className="deger">tutulmuyor</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-12">
        {testler.length === 0 ? (
          <div className="flex max-w-[var(--govde-olcu)] flex-col gap-5 rounded-lg border border-doku bg-kagit-alt p-6 sm:flex-row sm:items-start">
            <ArsivBosGorseli className="h-auto w-40 shrink-0 text-murekkep-2" />
            <div>
              <p className="font-display text-lg font-semibold">Henüz yayında test yok.</p>
              <p className="mt-3 text-murekkep-2">
                Testler yayındaki içerikten türetilir; bir konunun testi, o konuda yeterli kaynaklı
                yayın biriktiğinde açılır.
              </p>
              <p className="mt-4 font-mono text-sm">
                <Link href="/konu">konu haritası</Link>
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-[var(--bolum-bosluk)]">
            {turler.map((tur) => {
              const grup = testler.filter((t) => t.kind === tur);
              if (grup.length === 0) return null;
              return (
                <section key={tur} aria-labelledby={`tur-${tur}`} className="beliren">
                  <div className="border-b border-doku pb-3">
                    <h2
                      id={`tur-${tur}`}
                      className="font-display text-2xl font-bold tracking-tight"
                    >
                      {TUR_BASLIGI[tur].baslik}
                    </h2>
                    <p className="mt-2 max-w-[var(--govde-olcu)] text-sm leading-relaxed text-murekkep-2">
                      {TUR_BASLIGI[tur].giris}
                    </p>
                  </div>
                  <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {grup.map((test) => (
                      <li key={test.slug} className="min-w-0">
                        <TestKarti test={test} />
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
