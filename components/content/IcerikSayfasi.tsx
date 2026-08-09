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
import { turIndeksYolu } from "@/lib/tur-arsivi";

const TARIH_TR = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" });
const SAYI_TR = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 });

const tarih = (iso: string) => TARIH_TR.format(new Date(iso));

const DEGISIKLIK_TURU: Record<IcerikDetayDTO["changelog"][number]["kind"], string> = {
  minor: "küçük",
  major: "büyük",
  correction: "düzeltme",
};

/** Kaynak türlerinin okunur Türkçe karşılığı (§4.1 sources.kind) */
const KAYNAK_TURU: Record<string, string> = {
  paper: "akademik makale",
  docs: "resmi dokümantasyon",
  vendor: "üretici kaynağı",
  data: "veri kümesi",
  news: "haber",
  own_field_data: "kendi saha ölçümümüz",
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
            <li>
              {/* Tür indeksi olan türlerde kırıntı linklidir (JSON-LD ile aynı) */}
              {turIndeksYolu(icerik.type) !== null ? (
                <Link
                  href={turIndeksYolu(icerik.type) ?? "/"}
                  className="text-murekkep-2 no-underline hover:text-sinyal"
                >
                  {turEtiketi(icerik.type)}
                </Link>
              ) : (
                turEtiketi(icerik.type)
              )}
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-murekkep">
              {icerik.title}
            </li>
          </ol>
        </nav>

        {/* 2 — tür + pillar damgası (enstrüman kayıt başlığı) */}
        <p className="mt-6 flex flex-wrap items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.18em]">
          <span className="bg-sinyal px-2 py-1 text-kagit">{turEtiketi(icerik.type)}</span>
          <Link
            href={`/konu/${icerik.pillar}`}
            className="border border-doku px-2 py-1 text-murekkep-2 no-underline transition-colors hover:border-sinyal hover:text-sinyal"
          >
            {icerik.pillar}
          </Link>
        </p>

        {/* 3 — H1 + dek */}
        <h1 className="mt-5 max-w-[26ch] font-display text-4xl font-bold leading-[1.05] tracking-tight [font-stretch:94%]">
          {icerik.title}
        </h1>
        <p className="mt-5 max-w-[var(--govde-olcu)] text-lg leading-relaxed text-murekkep-2">
          {icerik.dek}
        </p>

        {/* 3b — ölçüm rayı: okuma parametreleri tek satırda, cihaz okuması gibi */}
        <div className="veri-rayi mt-7 max-w-[var(--govde-olcu)]">
          <div>
            seviye
            <br />
            <span className="deger">{seviyeEtiketi(icerik.level)}</span>
          </div>
          <div>
            okuma
            <br />
            <span className="deger">{icerik.readingMinutes} dk</span>
          </div>
          <div>
            kaynak
            <br />
            <span className="deger">{icerik.sources.length}</span>
          </div>
          <div>
            son doğrulama
            <br />
            <span className="deger">{tarih(icerik.lastVerifiedAt)}</span>
          </div>
          <div>
            sürüm
            <br />
            <span className="deger">v{icerik.version}</span>
          </div>
        </div>

        {/* 4 — yazar satırı */}
        <div className="mt-4 flex max-w-[var(--govde-olcu)] flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-doku pb-3 text-sm">
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
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-murekkep-2">
              İçindekiler · {icerik.toc.filter((m) => m.depth === 2).length} bölüm
            </p>
            <ul className="mt-4 space-y-1.5 text-sm">
              {icerik.toc.map((madde, sira) => (
                <li
                  key={madde.id}
                  className={`flex gap-3 ${madde.depth >= 3 ? "pl-5 text-murekkep-2" : ""}`}
                >
                  <span aria-hidden className="shrink-0 font-mono text-[0.7rem] text-murekkep-2">
                    {String(sira + 1).padStart(2, "0")}
                  </span>
                  <a
                    href={`#${madde.id}`}
                    className="min-w-0 text-murekkep no-underline transition-colors hover:text-sinyal"
                  >
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
          className="mt-10 max-w-[var(--govde-olcu)] [&_blockquote]:mt-4 [&_blockquote]:border-l-2 [&_blockquote]:border-doku [&_blockquote]:pl-4 [&_blockquote]:text-murekkep-2 [&_h2]:mt-12 [&_h2]:scroll-mt-24 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-8 [&_h3]:scroll-mt-24 [&_h3]:text-xl [&_h3]:font-semibold [&_hr]:my-8 [&_hr]:border-doku [&_li]:mt-1 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mt-4 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_td]:border [&_td]:border-doku [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-doku [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5"
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

        {/* 9 — Kaynaklar: numaralı kayıt defteri (li id'leri <Kaynak id="">
            dipnot çapalarıyla eşleşir; :target ile vurgulanır) */}
        {icerik.sources.length > 0 && (
          <section
            aria-labelledby="kaynaklar-baslik"
            className="beliren mt-14 max-w-[var(--govde-olcu)]"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="kaynaklar-baslik" className="font-display text-2xl font-bold">
                Kaynaklar
              </h2>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-murekkep-2">
                {icerik.sources.length} kayıt · erişim tarihli
              </p>
            </div>
            <ol className="mt-5 border-t border-doku">
              {icerik.sources.map((kaynak, sira) => (
                <li
                  key={`kaynak-${sira + 1}`}
                  id={`kaynak-${sira + 1}`}
                  className="kaynak-kayit flex scroll-mt-24 gap-4 border-b border-doku py-3"
                >
                  <span aria-hidden className="shrink-0 font-mono text-xs tabular-nums text-sinyal">
                    [{sira + 1}]
                  </span>
                  <span className="min-w-0 flex-1 text-sm leading-relaxed">
                    <a
                      href={kaynak.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="baglanti-iz text-murekkep hover:text-sinyal"
                    >
                      {kaynak.label}
                    </a>
                    <span className="block font-mono text-[0.7rem] text-murekkep-2">
                      {kaynak.publisher} · {KAYNAK_TURU[kaynak.kind] ?? kaynak.kind} · erişim:{" "}
                      {tarih(kaynak.accessedAt)}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* 10 — değişiklik günlüğü: sürüm kayıt defteri */}
        {icerik.changelog.length > 0 && (
          <section
            aria-label="Değişiklik günlüğü"
            className="beliren mt-12 max-w-[var(--govde-olcu)]"
          >
            <details className="acilir border border-doku bg-kagit-alt">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-mono text-xs uppercase tracking-[0.16em] text-murekkep-2 hover:text-sinyal">
                <span>
                  değişiklik günlüğü · {icerik.changelog.length} kayıt · v{icerik.version}
                </span>
                <span aria-hidden className="acilir-ok text-sinyal">
                  +
                </span>
              </summary>
              <ol className="border-t border-doku">
                {icerik.changelog.map((kayit, sira) => (
                  <li
                    key={`${kayit.at}-${sira}`}
                    className="flex flex-wrap items-baseline gap-x-3 border-b border-doku px-4 py-2.5 text-sm last:border-b-0"
                  >
                    <span className="font-mono text-[0.7rem] tabular-nums text-murekkep-2">
                      {tarih(kayit.at)}
                    </span>
                    <span className="border border-doku px-1.5 font-mono text-[0.65rem] uppercase tracking-wider text-sinyal">
                      {DEGISIKLIK_TURU[kayit.kind]}
                    </span>
                    <span className="min-w-0 flex-1 text-murekkep-2">{kayit.note}</span>
                  </li>
                ))}
              </ol>
            </details>
          </section>
        )}

        {/* 11 — SSS (FAQPage şemasıyla aynı veriden) */}
        {icerik.faq.length > 0 && (
          <section aria-labelledby="sss-baslik" className="beliren mt-14 max-w-[var(--govde-olcu)]">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="sss-baslik" className="font-display text-2xl font-bold">
                Sık sorulan sorular
              </h2>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-murekkep-2">
                {icerik.faq.length} soru
              </p>
            </div>
            <div className="mt-5 border-t border-doku">
              {icerik.faq.map((madde) => (
                <details key={madde.q} className="acilir border-b border-doku">
                  <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4 py-3.5 font-medium transition-colors hover:text-sinyal">
                    <span className="min-w-0">{madde.q}</span>
                    <span aria-hidden className="acilir-ok shrink-0 font-mono text-sinyal">
                      +
                    </span>
                  </summary>
                  <p className="pb-4 leading-relaxed text-murekkep-2">{madde.a}</p>
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
