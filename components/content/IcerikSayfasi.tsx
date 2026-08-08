// BRIEF §6.1 — içerik sayfası gövdesi (Faz 2 basitleştirilmiş sürüm; tam
// cila Faz 3). Sıra: breadcrumb-lite → rozet satırı → H1+dek → yazar satırı →
// Kısa cevap → İçindekiler → gövde → repro kutusu → Kaynaklar → değişiklik
// günlüğü → SSS. Yorum / bülten CTA / ilgili içerik Faz 3+/7 — burada yok.
// RSC; IcerikDetayDTO alır, gövdeyi mdxDerle ile derler.
import Link from "next/link";
import type { ReactNode } from "react";
import { IlgiliIcerikler } from "@/components/content/IlgiliIcerikler";
import { SinyalIzi } from "@/components/content/SinyalIzi";
import { BultenCTA } from "@/components/layout/BultenCTA";
import { Kaynak } from "@/components/mdx/Kaynak";
import { KisaCevap } from "@/components/mdx/KisaCevap";
import type { IcerikDetayDTO } from "@/lib/db/queries/dto";
import { mdxDerle } from "@/lib/mdx/derle";
import { seviyeEtiketi, turEtiketi } from "@/lib/rotalar";

const TARIH_TR = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" });
const SAYI_TR = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 });

const tarih = (iso: string) => TARIH_TR.format(new Date(iso));

const DEGISIKLIK_TURU: Record<IcerikDetayDTO["changelog"][number]["kind"], string> = {
  minor: "küçük",
  major: "büyük",
  correction: "düzeltme",
};

/** Repro kutusunun tek satırı: font-mono etiket + değer. */
function ReproSatiri({ etiket, children }: { etiket: string; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="w-36 shrink-0 text-murekkep-2">{etiket}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  );
}

export async function IcerikSayfasi({ icerik }: { icerik: IcerikDetayDTO }) {
  // <Kaynak> kenar notu basabilsin diye kaynak verisi bileşene bağlanır (§5.5)
  const kenarKaynaklari = icerik.sources.map((k) => ({
    label: k.label,
    publisher: k.publisher,
  }));
  const KaynakBagli = (props: { id: string; children?: ReactNode }) => (
    <Kaynak {...props} kaynaklar={kenarKaynaklari} />
  );
  const { icerik: govde } = await mdxDerle(icerik.body, { Kaynak: KaynakBagli });

  // Sinyal izi yalnız H2 sınırlarında spike verir (BRIEF §5.4)
  const izBolumleri = icerik.toc
    .filter((m) => m.depth === 2)
    .map((m) => ({ id: m.id, text: m.text }));

  return (
    <article className="mx-auto max-w-[1280px] px-[var(--gutter)] py-10 xl:grid xl:justify-center xl:grid-cols-[64px_minmax(0,68ch)_280px] xl:gap-x-10">
      {/* İz kolonu: masaüstünde dikey sinyal izi; mobilde üstte ince bant */}
      <div className="xl:col-start-1 xl:row-start-1">
        <SinyalIzi bolumler={izBolumleri} />
      </div>

      <div className="min-w-0 xl:col-start-2 xl:row-start-1">
        {/* 1 — breadcrumb-lite (tür etiketi düz metin: tür indeks rotası henüz yok) */}
        <nav aria-label="Sayfa yolu" className="font-mono text-xs text-murekkep-2">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <li>
              <Link href="/" className="text-murekkep-2 no-underline hover:text-sinyal">
                Ana sayfa
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>{turEtiketi(icerik.type)}</li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-murekkep">
              {icerik.title}
            </li>
          </ol>
        </nav>

        {/* 2 — pillar rozeti + seviye + okuma süresi + son doğrulama */}
        <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-murekkep-2">
          <span className="border border-doku px-2 py-0.5 text-sinyal">{icerik.pillar}</span>
          <span>{seviyeEtiketi(icerik.level)}</span>
          <span aria-hidden>·</span>
          <span>{icerik.readingMinutes} dk okuma</span>
          <span aria-hidden>·</span>
          <span>son doğrulama: {tarih(icerik.lastVerifiedAt)}</span>
        </p>

        {/* 3 — H1 + dek */}
        <h1 className="mt-4 max-w-[28ch] font-display text-4xl font-bold">{icerik.title}</h1>
        <p className="mt-4 max-w-[var(--govde-olcu)] text-lg text-murekkep-2">{icerik.dek}</p>

        {/* 4 — yazar satırı */}
        <div className="mt-6 flex max-w-[var(--govde-olcu)] flex-wrap items-baseline gap-x-4 gap-y-1 border-y border-doku py-3 text-sm">
          <span className="font-medium">
            {icerik.yazarlar.length > 0
              ? icerik.yazarlar.map((y, sira) => (
                  <span key={y.id}>
                    {sira > 0 && ", "}
                    <Link
                      href={`/yazar/${y.slug}`}
                      className="text-murekkep no-underline hover:text-sinyal"
                    >
                      {y.name}
                    </Link>
                  </span>
                ))
              : "—"}
          </span>
          <span className="text-murekkep-2">
            Teknik editör:{" "}
            {icerik.teknikEditor !== null ? (
              <Link
                href={`/yazar/${icerik.teknikEditor.slug}`}
                className="text-murekkep-2 no-underline hover:text-sinyal"
              >
                {icerik.teknikEditor.name}
              </Link>
            ) : (
              "—"
            )}
          </span>
          <span className="font-mono text-xs text-murekkep-2">
            {icerik.publishedAt !== null && <>yayın: {tarih(icerik.publishedAt)} · </>}
            güncelleme: {tarih(icerik.updatedAt)}
          </span>
        </div>

        {/* 5 — Kısa cevap (answerFirst) */}
        <div className="mt-8 max-w-[var(--govde-olcu)]">
          <KisaCevap>
            <p>{icerik.answerFirst}</p>
          </KisaCevap>
        </div>

        {/* 6 — İçindekiler */}
        {icerik.toc.length > 0 && (
          <nav
            aria-label="İçindekiler"
            className="mt-8 max-w-[var(--govde-olcu)] border border-doku bg-kagit-alt p-4"
          >
            <p className="font-mono text-xs tracking-widest text-murekkep-2">İÇİNDEKİLER</p>
            <ul className="mt-3 space-y-1 text-sm">
              {icerik.toc.map((madde) => (
                <li key={madde.id} className={madde.depth >= 3 ? "pl-4" : undefined}>
                  <a href={`#${madde.id}`} className="text-murekkep no-underline hover:text-sinyal">
                    {madde.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* 7 — gövde (id: sinyal izi ölçümü + kenar notu akışı buradan) */}
        <div
          id="icerik-govde"
          className="mt-10 max-w-[var(--govde-olcu)] [&_blockquote]:mt-4 [&_blockquote]:border-l-2 [&_blockquote]:border-doku [&_blockquote]:pl-4 [&_blockquote]:text-murekkep-2 [&_h2]:mt-12 [&_h2]:scroll-mt-6 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-8 [&_h3]:scroll-mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_hr]:my-8 [&_hr]:border-doku [&_li]:mt-1 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mt-4 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_td]:border [&_td]:border-doku [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-doku [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5"
        >
          {govde}
        </div>

        {/* 8 — yeniden üretilebilirlik kutusu */}
        {icerik.repro !== null && (
          <section
            aria-labelledby="repro-baslik"
            className="mt-12 max-w-[var(--govde-olcu)] border border-doku bg-kagit-alt p-4"
          >
            <h2
              id="repro-baslik"
              className="font-mono text-xs font-normal tracking-widest text-murekkep-2"
            >
              YENİDEN ÜRETİLEBİLİRLİK
            </h2>
            <dl className="mt-3 space-y-2 font-mono text-sm">
              {icerik.repro.repoUrl !== undefined && (
                <ReproSatiri etiket="repo">
                  <a href={icerik.repro.repoUrl} target="_blank" rel="noopener noreferrer">
                    {icerik.repro.repoUrl}
                  </a>
                </ReproSatiri>
              )}
              {icerik.repro.notebookUrl !== undefined && (
                <ReproSatiri etiket="notebook">
                  <a href={icerik.repro.notebookUrl} target="_blank" rel="noopener noreferrer">
                    {icerik.repro.notebookUrl}
                  </a>
                </ReproSatiri>
              )}
              {icerik.repro.modelIds !== undefined && icerik.repro.modelIds.length > 0 && (
                <ReproSatiri etiket="model">{icerik.repro.modelIds.join(", ")}</ReproSatiri>
              )}
              {icerik.repro.hardware !== undefined && (
                <ReproSatiri etiket="donanım">{icerik.repro.hardware}</ReproSatiri>
              )}
              {icerik.repro.runDate !== undefined && (
                <ReproSatiri etiket="çalıştırma">{tarih(icerik.repro.runDate)}</ReproSatiri>
              )}
              {icerik.repro.approxCostUsd !== undefined && (
                <ReproSatiri etiket="yaklaşık maliyet">
                  ≈ {SAYI_TR.format(icerik.repro.approxCostUsd)} USD
                </ReproSatiri>
              )}
            </dl>
          </section>
        )}

        {/* 9 — Kaynaklar (li id'leri <Kaynak id=""> dipnot çapalarıyla eşleşir) */}
        {icerik.sources.length > 0 && (
          <section aria-labelledby="kaynaklar-baslik" className="mt-12 max-w-[var(--govde-olcu)]">
            <h2 id="kaynaklar-baslik" className="font-display text-2xl font-bold">
              Kaynaklar
            </h2>
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm">
              {icerik.sources.map((kaynak, sira) => (
                <li key={`kaynak-${sira + 1}`} id={`kaynak-${sira + 1}`} className="scroll-mt-6">
                  <a href={kaynak.url} target="_blank" rel="noopener noreferrer">
                    {kaynak.label}
                  </a>
                  <span className="text-murekkep-2"> — {kaynak.publisher}</span>
                  <span className="ml-2 font-mono text-xs text-murekkep-2">
                    erişim: {tarih(kaynak.accessedAt)}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* 10 — değişiklik günlüğü */}
        {icerik.changelog.length > 0 && (
          <section aria-label="Değişiklik günlüğü" className="mt-12 max-w-[var(--govde-olcu)]">
            <details className="border border-doku">
              <summary className="cursor-pointer p-3 font-mono text-sm">
                Bu yazı {icerik.changelog.length} kez güncellendi
              </summary>
              <ul className="space-y-2 border-t border-doku p-3 text-sm">
                {icerik.changelog.map((kayit, sira) => (
                  <li key={`${kayit.at}-${sira}`} className="flex flex-wrap items-baseline gap-x-3">
                    <span className="font-mono text-xs text-murekkep-2">{tarih(kayit.at)}</span>
                    <span className="font-mono text-xs text-sinyal">
                      {DEGISIKLIK_TURU[kayit.kind]}
                    </span>
                    <span>{kayit.note}</span>
                  </li>
                ))}
              </ul>
            </details>
          </section>
        )}

        {/* 11 — SSS */}
        {icerik.faq.length > 0 && (
          <section aria-labelledby="sss-baslik" className="mt-12 max-w-[var(--govde-olcu)]">
            <h2 id="sss-baslik" className="font-display text-2xl font-bold">
              Sık Sorulan Sorular
            </h2>
            <div className="mt-4 space-y-2">
              {icerik.faq.map((madde) => (
                <details key={madde.q} className="border border-doku">
                  <summary className="cursor-pointer p-3 font-medium">{madde.q}</summary>
                  <p className="border-t border-doku p-3 text-murekkep-2">{madde.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* 12 + 14 — ilgili içerik ve bülten CTA'sı: ızgaranın ikinci satırı,
          gövde+kenar kolonlarını kaplar (yorumlar Faz 7'de araya girecek) */}
      <div className="min-w-0 xl:col-span-2 xl:col-start-2 xl:row-start-2">
        <div className="cetvel mt-14" aria-hidden />
        <div className="mt-10">
          <IlgiliIcerikler pillar={icerik.pillar} haricSlug={icerik.slug} />
        </div>
        <div className="mt-12 max-w-[42rem]">
          <BultenCTA />
        </div>
      </div>
    </article>
  );
}
