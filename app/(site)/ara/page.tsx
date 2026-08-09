// /ara — arama (BRIEF §2.2, §13 FAZ 6). Tamamen sunucu tarafı: form GET ile
// kendine gönderir, filtreler link, sayfalama link — JavaScript kapalıyken de
// çalışır ("use client" YOK). Sorgu bazlı olduğu için force-dynamic ve
// noindex (§7.1: arama sonuç sayfaları indekslenmez).
import type { Metadata } from "next";
import Link from "next/link";
import { IcerikKarti } from "@/components/content/IcerikKarti";
import { AramaBosGorseli } from "@/components/gorsel";
import { sonYayinlar } from "@/lib/db/queries/contents";
import { pillarlar } from "@/lib/db/queries/topics";
import { icerikTuruSema, seviyeSema, type Content } from "@/lib/db/schemas";
import { env } from "@/lib/env";
import { seviyeEtiketi, turEtiketi } from "@/lib/rotalar";
import {
  ARAMA_SAYFA_ADEDI,
  icerikAra,
  sayfaNoOku,
  sayfalama,
  sorguTemizle,
  terimAra,
  type AramaCiktisi,
  type TerimEslesmesiDTO,
} from "@/lib/search/ara";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ara — Sinaptiklab",
  description:
    "Sinaptiklab korpusunda tam metin arama: makaleler, rehberler ve uygulamalar; tür, seviye ve konu filtreleriyle.",
  // §7.1 — arama sonuç sayfaları indekslenmez; linkler izlenir.
  robots: { index: false, follow: true },
  alternates: { canonical: `${env.NEXT_PUBLIC_SITE_URL}/ara` },
};

const TUR_CIPLERI: Content["type"][] = ["article", "guide", "tutorial"];
const SEVIYE_CIPLERI: Content["level"][] = ["giris", "orta", "ileri", "uzman"];

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Aynı ad birden çok kez geldiyse ilkini alır; dizi/boş değerleri sadeleştirir. */
function tekDeger(ham: string | string[] | undefined): string | undefined {
  const deger = Array.isArray(ham) ? ham[0] : ham;
  return deger !== undefined && deger.trim() !== "" ? deger : undefined;
}

interface Suzgec {
  q: string;
  tur?: Content["type"];
  pillar?: string;
  seviye?: Content["level"];
  sayfa: number;
}

/** Filtre durumundan /ara adresi üretir; boş alanlar URL'ye yazılmaz. */
function araYolu(suzgec: Partial<Suzgec>): string {
  const p = new URLSearchParams();
  if (suzgec.q) p.set("q", suzgec.q);
  if (suzgec.tur) p.set("tur", suzgec.tur);
  if (suzgec.pillar) p.set("pillar", suzgec.pillar);
  if (suzgec.seviye) p.set("seviye", suzgec.seviye);
  if (suzgec.sayfa !== undefined && suzgec.sayfa > 1) p.set("sayfa", String(suzgec.sayfa));
  const sorgu = p.toString();
  return sorgu === "" ? "/ara" : `/ara?${sorgu}`;
}

const CIP_TEMEL =
  "centik border px-3 py-1 font-mono text-xs no-underline transition-colors focus-visible:text-sinyal";
const CIP_PASIF = "border-doku bg-kagit-alt text-murekkep-2 hover:border-sinyal hover:text-sinyal";
const CIP_AKTIF = "border-sinyal bg-kagit-alt text-sinyal";

function Cip({ href, aktif, children }: { href: string; aktif: boolean; children: string }) {
  return (
    <Link
      href={href}
      prefetch={false}
      aria-current={aktif ? "true" : undefined}
      className={`${CIP_TEMEL} ${aktif ? CIP_AKTIF : CIP_PASIF}`}
    >
      {children}
    </Link>
  );
}

export default async function AramaSayfasi({ searchParams }: Props) {
  const ham = await searchParams;
  const q = sorguTemizle(tekDeger(ham["q"]) ?? "");
  const turSonuc = icerikTuruSema.safeParse(tekDeger(ham["tur"]));
  const seviyeSonuc = seviyeSema.safeParse(tekDeger(ham["seviye"]));
  const suzgec: Suzgec = {
    q,
    ...(turSonuc.success ? { tur: turSonuc.data } : {}),
    ...(seviyeSonuc.success ? { seviye: seviyeSonuc.data } : {}),
    ...(tekDeger(ham["pillar"]) !== undefined ? { pillar: tekDeger(ham["pillar"]) } : {}),
    sayfa: sayfaNoOku(tekDeger(ham["sayfa"])),
  };

  // DB'siz ortamda (secret'sız build/CI) sayfa kırılmaz: her veri yolu kendi
  // boş durumuna düşer ve arayüz dürüstçe "sonuç yok" der.
  let cikti: AramaCiktisi = { sonuclar: [], toplam: 0, motor: "regex" };
  let terimler: TerimEslesmesiDTO[] = [];
  let konular: Awaited<ReturnType<typeof pillarlar>> = [];
  let oneriler: Awaited<ReturnType<typeof sonYayinlar>> = [];

  try {
    konular = await pillarlar();
  } catch {
    konular = [];
  }

  if (q !== "") {
    const [icerikSonucu, terimSonucu] = await Promise.allSettled([
      icerikAra({
        sorgu: q,
        ...(suzgec.tur ? { tur: suzgec.tur } : {}),
        ...(suzgec.pillar ? { pillar: suzgec.pillar } : {}),
        ...(suzgec.seviye ? { seviye: suzgec.seviye } : {}),
        sayfa: suzgec.sayfa,
      }),
      terimAra(q),
    ]);
    if (icerikSonucu.status === "fulfilled") cikti = icerikSonucu.value;
    if (terimSonucu.status === "fulfilled") terimler = terimSonucu.value;
  } else {
    try {
      oneriler = await sonYayinlar(6);
    } catch {
      oneriler = [];
    }
  }

  const sayfaBilgisi = sayfalama(cikti.toplam, ARAMA_SAYFA_ADEDI, suzgec.sayfa);
  const suzgecVar = Boolean(suzgec.tur ?? suzgec.pillar ?? suzgec.seviye);
  const motorEtiketi = cikti.motor === "atlas" ? "atlas search" : "regex yedeği";

  return (
    <>
      <section className="mm-zemin border-b border-doku">
        <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-12">
          <p className="bolum-indeks uppercase">§ arama</p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight [font-stretch:94%]">
            Ara
          </h1>

          {/* Enstrüman girdisi: mono, çerçeveli, kendi kendine GET yapan form */}
          <form action="/ara" method="get" role="search" className="mt-6 max-w-2xl">
            <label
              htmlFor="arama-girdisi"
              className="block font-mono text-[0.65rem] uppercase tracking-[0.2em] text-murekkep-2"
            >
              sorgu
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              <input
                id="arama-girdisi"
                type="search"
                name="q"
                defaultValue={q}
                placeholder="ör. RAG, ollama, değerlendirme"
                autoComplete="off"
                className="min-w-0 flex-1 border border-doku rounded-lg bg-kagit px-4 py-3 font-mono text-base text-murekkep placeholder:text-murekkep-2 focus-visible:border-sinyal"
              />
              <button type="submit" className="dugme-birincil px-6">
                Ara
              </button>
            </div>
            {/* Filtreler form gönderiminde korunur (çip → gizli alan) */}
            {suzgec.tur && <input type="hidden" name="tur" value={suzgec.tur} />}
            {suzgec.pillar && <input type="hidden" name="pillar" value={suzgec.pillar} />}
            {suzgec.seviye && <input type="hidden" name="seviye" value={suzgec.seviye} />}
          </form>

          <div className="mt-6 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-16 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-murekkep-2">
                tür
              </span>
              <Cip
                href={araYolu({ q, pillar: suzgec.pillar, seviye: suzgec.seviye })}
                aktif={!suzgec.tur}
              >
                hepsi
              </Cip>
              {TUR_CIPLERI.map((tur) => (
                <Cip
                  key={tur}
                  href={araYolu({
                    q,
                    pillar: suzgec.pillar,
                    seviye: suzgec.seviye,
                    ...(suzgec.tur === tur ? {} : { tur }),
                  })}
                  aktif={suzgec.tur === tur}
                >
                  {turEtiketi(tur)}
                </Cip>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="w-16 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-murekkep-2">
                seviye
              </span>
              <Cip
                href={araYolu({ q, tur: suzgec.tur, pillar: suzgec.pillar })}
                aktif={!suzgec.seviye}
              >
                hepsi
              </Cip>
              {SEVIYE_CIPLERI.map((seviye) => (
                <Cip
                  key={seviye}
                  href={araYolu({
                    q,
                    tur: suzgec.tur,
                    pillar: suzgec.pillar,
                    ...(suzgec.seviye === seviye ? {} : { seviye }),
                  })}
                  aktif={suzgec.seviye === seviye}
                >
                  {seviyeEtiketi(seviye)}
                </Cip>
              ))}
            </div>

            {konular.length > 0 && (
              <div className="flex flex-wrap items-start gap-2">
                <span className="w-16 shrink-0 pt-1 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-murekkep-2">
                  konu
                </span>
                <div className="flex flex-wrap gap-2">
                  <Cip
                    href={araYolu({ q, tur: suzgec.tur, seviye: suzgec.seviye })}
                    aktif={!suzgec.pillar}
                  >
                    hepsi
                  </Cip>
                  {konular.map((konu) => (
                    <Cip
                      key={konu.slug}
                      href={araYolu({
                        q,
                        tur: suzgec.tur,
                        seviye: suzgec.seviye,
                        ...(suzgec.pillar === konu.slug ? {} : { pillar: konu.slug }),
                      })}
                      aktif={suzgec.pillar === konu.slug}
                    >
                      {konu.title}
                    </Cip>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-10">
        {q === "" ? (
          <section aria-labelledby="bos-sorgu-baslik">
            <h2 id="bos-sorgu-baslik" className="font-display text-2xl font-bold">
              Nereden başlanır
            </h2>
            <p className="mt-3 max-w-[var(--govde-olcu)] text-murekkep-2">
              Bir sorgu yazın ya da aşağıdaki konulardan birine girin. Arama başlık, spot, gövde ve
              etiketlerde çalışır; terimler için <Link href="/sozluk">sözlüğe</Link> de
              bakabilirsiniz.
            </p>

            {konular.length > 0 && (
              <>
                <h3 className="mt-8 font-mono text-xs uppercase tracking-widest text-murekkep-2">
                  Popüler konular
                </h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {[...konular]
                    .sort((a, b) => b.icerikSayisi - a.icerikSayisi)
                    .slice(0, 8)
                    .map((konu) => (
                      <li key={konu.slug}>
                        <Link
                          href={`/konu/${konu.slug}`}
                          className={`${CIP_TEMEL} ${CIP_PASIF}`}
                          prefetch={false}
                        >
                          {konu.title} · {konu.icerikSayisi}
                        </Link>
                      </li>
                    ))}
                </ul>
              </>
            )}

            {oneriler.length > 0 && (
              <>
                <h3 className="mt-10 font-mono text-xs uppercase tracking-widest text-murekkep-2">
                  Son yayınlar
                </h3>
                <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {oneriler.map((icerik, sira) => (
                    <li key={icerik.id} className="min-w-0">
                      <IcerikKarti icerik={icerik} sira={sira + 1} />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        ) : (
          <section aria-labelledby="sonuc-baslik">
            <h2 id="sonuc-baslik" className="font-display text-2xl font-bold">
              <span className="text-murekkep-2">“{q}”</span> için {cikti.toplam} sonuç
            </h2>

            {terimler.length > 0 && (
              <div className="mt-6 border border-doku rounded-md bg-kagit-alt">
                <p className="border-b border-doku px-5 py-2 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-murekkep-2">
                  sözlükte eşleşen terim
                </p>
                <ul className="divide-y divide-doku">
                  {terimler.map((terim) => (
                    <li key={terim.slug} className="px-5 py-3">
                      <Link href={`/sozluk/${terim.slug}`} className="font-display font-semibold">
                        {terim.tr}
                      </Link>
                      <span className="ml-2 font-mono text-xs text-murekkep-2">{terim.en}</span>
                      <p className="mt-1 text-sm text-murekkep-2">{terim.shortDef}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {cikti.sonuclar.length > 0 ? (
              <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cikti.sonuclar.map((sonuc, sira) => (
                  <li key={sonuc.id} className="min-w-0">
                    <IcerikKarti icerik={sonuc} sira={sayfaBilgisi.atla + sira + 1} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-6 flex max-w-[var(--govde-olcu)] flex-col gap-5 rounded-lg border border-doku bg-kagit-alt p-6 sm:flex-row sm:items-start">
                <AramaBosGorseli className="h-auto w-40 shrink-0 text-murekkep-2" />
                <div>
                  <p className="font-display text-lg font-semibold">Bu sorgu için kayıt yok.</p>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-murekkep-2">
                    <li>Yazımı kontrol edin; tek kelimelik ve daha genel bir terim deneyin.</li>
                    <li>
                      Türkçe terim sonuç vermezse İngilizce karşılığını deneyin (ör. “çıkarım” →
                      “inference”).
                    </li>
                    {suzgecVar && (
                      <li>
                        Filtreler sonucu daraltıyor olabilir —{" "}
                        <Link href={araYolu({ q })}>filtreleri temizleyin</Link>.
                      </li>
                    )}
                    <li>
                      <Link href="/konu">Konu haritasına</Link> ya da{" "}
                      <Link href="/sozluk">sözlüğe</Link> göz atın.
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {(sayfaBilgisi.oncekiVar || sayfaBilgisi.sonrakiVar) && (
              <nav
                aria-label="Sonuç sayfaları"
                className="mt-8 flex items-center justify-between gap-4 border-t border-doku pt-5 font-mono text-sm"
              >
                {sayfaBilgisi.oncekiVar ? (
                  <Link href={araYolu({ ...suzgec, sayfa: sayfaBilgisi.sayfa - 1 })} rel="prev">
                    ← önceki
                  </Link>
                ) : (
                  <span className="text-murekkep-2">← önceki</span>
                )}
                <span className="text-murekkep-2">
                  sayfa {sayfaBilgisi.sayfa} / {sayfaBilgisi.sayfaSayisi}
                </span>
                {sayfaBilgisi.sonrakiVar ? (
                  <Link href={araYolu({ ...suzgec, sayfa: sayfaBilgisi.sayfa + 1 })} rel="next">
                    sonraki →
                  </Link>
                ) : (
                  <span className="text-murekkep-2">sonraki →</span>
                )}
              </nav>
            )}

            <p className="mt-6 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-murekkep-2">
              motor: {motorEtiketi} · {cikti.toplam} kayıt · sayfa {sayfaBilgisi.sayfa}/
              {sayfaBilgisi.sayfaSayisi}
            </p>
          </section>
        )}
      </div>
    </>
  );
}
