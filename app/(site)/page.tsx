import Link from "next/link";
import { IcerikKarti } from "@/components/content/IcerikKarti";
import { BultenCTA } from "@/components/layout/BultenCTA";
import { sonYayinlar } from "@/lib/db/queries/contents";
import type { IcerikOzetDTO } from "@/lib/db/queries/dto";
import {
  pillarlar,
  siteIstatistikleri,
  type PillarOzetDTO,
  type SiteIstatistikleriDTO,
} from "@/lib/db/queries/topics";

const SAYI_TR = new Intl.NumberFormat("tr-TR");

/** Statik marka izi: hero'daki EKG motifi — animasyonsuz, aria-hidden.
 *  (Hareketli tek gösterişli öğe makale sayfasındaki sinyal izidir, §5.4.) */
function HeroIzi() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 480 120"
      fill="none"
      className="h-auto w-full max-w-[480px] text-doku"
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        d="M0 60 H120 L134 60 L142 18 L150 96 L158 60 H220 L232 60 L240 34 L248 82 L254 60 H340 L352 60 L362 8 L374 108 L384 60 H480"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M0 60 H120 L134 60 L142 18 L150 96 L158 60 H220"
        stroke="var(--sinyal)"
        strokeWidth="1.5"
      />
      {/* ölçüm imleci */}
      <rect x="217" y="56" width="7" height="7" fill="var(--sinyal)" />
      <text
        x="230"
        y="50"
        fill="var(--murekkep-2)"
        style={{ font: "10px var(--font-mono)", letterSpacing: "0.08em" }}
      >
        t=şimdi
      </text>
    </svg>
  );
}

function OlcumSeridi({ veri }: { veri: SiteIstatistikleriDTO }) {
  const hucreler = [
    { deger: veri.yayindaIcerik, etiket: "yayında içerik" },
    { deger: veri.pillarSayisi, etiket: "ana konu" },
    { deger: veri.clusterSayisi, etiket: "alt küme" },
    { deger: veri.toplamKaynak, etiket: "doğrulanmış kaynak" },
  ];
  return (
    <section aria-label="Site ölçümleri" className="border-y border-doku">
      <dl className="mx-auto grid max-w-[1280px] grid-cols-2 sm:grid-cols-4">
        {hucreler.map((hucre, sira) => (
          <div
            key={hucre.etiket}
            className={`px-[var(--gutter)] py-5 ${sira > 0 ? "border-l border-doku" : ""} ${sira >= 2 ? "max-sm:border-t max-sm:border-doku" : ""} ${sira === 2 ? "max-sm:border-l-0" : ""}`}
          >
            <dd className="font-display text-3xl font-bold text-murekkep">
              {SAYI_TR.format(hucre.deger)}
            </dd>
            <dt className="mt-1 font-mono text-xs tracking-wider text-murekkep-2">
              {hucre.etiket}
            </dt>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default async function AnaSayfa() {
  // DB yoksa/erişilemiyorsa bölümler sessizce atlanır — build DB'siz de geçmeli
  let yayinlar: IcerikOzetDTO[] = [];
  let konular: PillarOzetDTO[] = [];
  let istatistik: SiteIstatistikleriDTO | null = null;
  try {
    [yayinlar, konular, istatistik] = await Promise.all([
      sonYayinlar(6),
      pillarlar(),
      siteIstatistikleri(),
    ]);
  } catch {
    yayinlar = [];
    konular = [];
    istatistik = null;
  }

  return (
    <>
      {/* ── Hero: milimetrik tezgâh zemini üzerinde kompozisyon ── */}
      <section className="mm-zemin border-b border-doku">
        <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-[var(--gutter)] py-20 sm:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(280px,480px)] lg:py-28">
          <div>
            <p className="inline-flex items-center gap-2 border border-doku bg-kagit px-3 py-1 font-mono text-xs uppercase tracking-widest text-murekkep-2">
              <span aria-hidden className="inline-block size-1.5 bg-onay" />
              kalibrasyon aşaması · v0.1
            </p>
            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.02] tracking-tight text-murekkep [font-stretch:92%]">
              Saha verisi,
              <br />
              <span className="text-sinyal">uydurma yok.</span>
            </h1>
            <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-murekkep-2">
              Yapay zeka sistemlerini <em>gerçekten üretenler</em> için Türkçe teknik yayın: her
              iddia kaynaklı, her ölçüm yeniden üretilebilir, her içerik sürümlü.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/konu" className="dugme-birincil">
                Konu haritası <span aria-hidden>→</span>
              </Link>
              <a href="#son-yayinlar" className="dugme-cerceve">
                Son yayınlar <span aria-hidden>↓</span>
              </a>
            </div>
          </div>
          <div className="hidden bg-kagit/60 p-6 lg:block">
            <p className="mb-3 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-murekkep-2">
              iz 01 · aksiyon potansiyeli
            </p>
            <HeroIzi />
            <p className="mt-3 text-right font-mono text-[0.65rem] tracking-wider text-murekkep-2">
              64 px/s · eşik −55 mV
            </p>
          </div>
        </div>
      </section>

      {istatistik !== null && <OlcumSeridi veri={istatistik} />}

      <div className="mx-auto max-w-[1280px] px-[var(--gutter)]">
        {yayinlar.length > 0 && (
          <>
            <section aria-labelledby="son-yayinlar" className="scroll-mt-16 py-16">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="son-yayinlar" className="font-display text-2xl font-bold">
                  Son yayınlar
                </h2>
                <p className="font-mono text-xs text-murekkep-2">son doğrulamalı · kaynaklı</p>
              </div>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {yayinlar.map((yayin, sira) => (
                  <li key={yayin.id} className="min-w-0">
                    <IcerikKarti icerik={yayin} sira={sira + 1} />
                  </li>
                ))}
              </ul>
            </section>

            <div className="cetvel" aria-hidden />
          </>
        )}

        {konular.length > 0 && (
          <>
            <section aria-labelledby="konu-haritasi" className="py-16">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="konu-haritasi" className="font-display text-2xl font-bold">
                  Konu haritası
                </h2>
                <Link href="/konu" className="font-mono text-xs no-underline hover:underline">
                  tümü →
                </Link>
              </div>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {konular.map((pillar, sira) => (
                  <li key={pillar.slug} className="min-w-0">
                    <Link
                      href={`/konu/${pillar.slug}`}
                      className="centik flex h-full items-baseline gap-3 border border-doku bg-kagit px-4 py-3 no-underline transition-colors hover:border-sinyal"
                    >
                      <span className="font-mono text-[0.65rem] text-murekkep-2">
                        {String(sira + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-murekkep">
                        {pillar.title}
                      </span>
                      <span className="shrink-0 font-mono text-xs text-sinyal">
                        {pillar.icerikSayisi}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <div className="cetvel" aria-hidden />
          </>
        )}

        <section aria-labelledby="ne-geliyor" className="py-16">
          <h2 id="ne-geliyor" className="font-display text-2xl font-bold">
            Tezgâhta ne var?
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                no: "01",
                baslik: "Kaynaklı derinlik",
                metin:
                  "Her sayı, tarih ve iddia kaynağına bağlanır; kaynağı olmayan içerik yayına teknik olarak çıkamaz.",
              },
              {
                no: "02",
                baslik: "Çalışan kod",
                metin:
                  "Uygulamalar ve laboratuvarlar çalışan repo, model sürümü, donanım ve maliyet bilgisiyle gelir: yeniden üretilebilirlik varsayılandır.",
              },
              {
                no: "03",
                baslik: "Kanonik Türkçe",
                metin:
                  "Türkçe yapay zeka terminolojisi tek sözlükte kanonikleşir; aynı kavram sitenin her yerinde aynı adla anılır.",
              },
            ].map((madde) => (
              <li key={madde.no} className="centik border border-doku bg-kagit-alt p-6">
                <p className="font-mono text-xs text-sinyal">{madde.no}</p>
                <h3 className="mt-3 font-display text-lg font-semibold">{madde.baslik}</h3>
                <p className="mt-2 text-sm leading-relaxed text-murekkep-2">{madde.metin}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="pb-20">
          <BultenCTA />
        </section>
      </div>
    </>
  );
}
