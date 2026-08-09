import Link from "next/link";
import type { CSSProperties } from "react";
import {
  CalisanKodGorseli,
  HeroGorseli,
  KanonikTurkceGorseli,
  KaynakliDerinlikGorseli,
} from "@/components/gorsel";
import { BolumBasligi } from "@/components/home/BolumBasligi";
import { KonuYogunlugu } from "@/components/home/KonuYogunlugu";
import { MakineYuzeyleri } from "@/components/home/MakineYuzeyleri";
import { SozlukVitrini } from "@/components/home/SozlukVitrini";
import { YayinAkisi } from "@/components/home/YayinAkisi";
import { BultenCTA } from "@/components/layout/BultenCTA";
import { SayacDeger } from "@/components/layout/SayacDeger";
import { sonYayinlar } from "@/lib/db/queries/contents";
import type { IcerikOzetDTO } from "@/lib/db/queries/dto";
import { terimListesi, type TerimOzetDTO } from "@/lib/db/queries/terms";
import {
  pillarlar,
  siteIstatistikleri,
  type PillarOzetDTO,
  type SiteIstatistikleriDTO,
} from "@/lib/db/queries/topics";

/** Ekran içi okuma şeridi: gerçek verimizden ölçümler (§14/7 uyumlu). */
function OlcumSeridi({ veri }: { veri: SiteIstatistikleriDTO }) {
  const hucreler = [
    { deger: veri.yayindaIcerik, etiket: "yayında içerik" },
    { deger: veri.pillarSayisi, etiket: "ana konu" },
    { deger: veri.clusterSayisi, etiket: "alt küme" },
    { deger: veri.toplamKaynak, etiket: "doğrulanmış kaynak" },
  ];
  return (
    <dl className="grid grid-cols-2 border-t border-doku sm:grid-cols-4">
      {hucreler.map((hucre, sira) => (
        <div
          key={hucre.etiket}
          className={`px-5 py-4 sm:px-6 ${sira > 0 ? "border-l border-doku" : ""} ${sira >= 2 ? "border-t border-doku sm:border-t-0" : ""} ${sira === 2 ? "border-l-0 sm:border-l" : ""}`}
        >
          <dd className="font-display text-2xl font-bold tabular-nums text-murekkep sm:text-3xl">
            <SayacDeger deger={hucre.deger} />
          </dd>
          <dt className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-murekkep-2">
            {hucre.etiket}
          </dt>
        </div>
      ))}
    </dl>
  );
}

const ILKELER = [
  {
    no: "01",
    Gorsel: KaynakliDerinlikGorseli,
    baslik: "Kaynaklı derinlik",
    metin:
      "Her sayı, tarih ve iddia kaynağına bağlanır. Kaynağı olmayan içerik yayına teknik olarak çıkamaz — bu bir editoryal niyet değil, yayın hattındaki bir kapı.",
    olcut: "yayın kapısı: 10 kontrol",
  },
  {
    no: "02",
    Gorsel: CalisanKodGorseli,
    baslik: "Çalışan kod",
    metin:
      "Uygulamalar ve laboratuvarlar çalışan repo, model sürümü, donanım ve maliyet bilgisiyle gelir; yeniden üretilebilirlik varsayılandır.",
    olcut: "repro kutusu zorunlu",
  },
  {
    no: "03",
    Gorsel: KanonikTurkceGorseli,
    baslik: "Kanonik Türkçe",
    metin:
      "Türkçe yapay zeka terminolojisi tek sözlükte kanonikleşir; aynı kavram sitenin her yerinde aynı adla anılır ve terim sayfasına bağlanır.",
    olcut: "sözlük: tek doğruluk kaynağı",
  },
] as const;

export default async function AnaSayfa() {
  // DB yoksa/erişilemiyorsa bölümler sessizce atlanır — build DB'siz de geçmeli
  let yayinlar: IcerikOzetDTO[] = [];
  let konular: PillarOzetDTO[] = [];
  let istatistik: SiteIstatistikleriDTO | null = null;
  let terimler: TerimOzetDTO[] = [];
  try {
    const [y, k, i, t] = await Promise.all([
      sonYayinlar(6),
      pillarlar(),
      siteIstatistikleri(),
      terimListesi(),
    ]);
    yayinlar = y;
    konular = k;
    istatistik = i;
    terimler = t;
  } catch {
    yayinlar = [];
    konular = [];
    istatistik = null;
    terimler = [];
  }

  // Vitrin için çekirdek terimler: tanımı kısa ve net olanlardan ilk altı
  const vitrinTerimleri = terimler.slice(0, 6);

  return (
    <>
      {/* ── Hero: yükseltilmiş vurgu yüzeyi + ölçüm tezgâhı görseli (ADR 0010) ── */}
      <section className="ekran relative overflow-hidden border-b border-doku">
        <span aria-hidden className="supurme left-0" />
        <div className="ekran-izgara">
          <div className="mx-auto max-w-[1280px] px-[var(--gutter)]">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-doku py-3 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-murekkep-2">
              <span className="flex items-center gap-2 text-onay">
                <span aria-hidden className="led inline-block size-1.5 bg-onay" />
                çevrimiçi
              </span>
              <span aria-hidden>/</span>
              <span>kanal 01 · yayın akışı</span>
              <span aria-hidden>/</span>
              <span>kalibrasyon v0.1</span>
              <span className="ml-auto max-sm:hidden">tr · utf-8</span>
            </div>

            <div className="grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(300px,520px)] lg:py-24">
              <div>
                <h1 className="font-display text-4xl font-bold leading-[0.98] tracking-tight text-murekkep [font-stretch:88%]">
                  Yapay zekanın
                  <br />
                  <span className="text-sinyal">Türkçe teknik kaynağı.</span>
                </h1>
                <p className="mt-7 max-w-[50ch] text-lg leading-relaxed text-murekkep-2">
                  LLM, RAG, ajanlar, MLOps, güvenlik ve regülasyon. Yapay zeka sistemlerini{" "}
                  <em>üretenler</em> için Türkçe teknik yayın.
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <Link href="/konu" className="dugme-birincil">
                    Konu haritası <span aria-hidden>→</span>
                  </Link>
                  <a href="#son-yayinlar" className="dugme-cerceve">
                    Son yayınlar <span aria-hidden>↓</span>
                  </a>
                </div>
              </div>

              {/* Ölçüm tezgâhı kompozisyonu (ADR 0010 görsel katmanı): sinyal
                  izi + ölçüm çubukları + bilgi ağı, ortak kalibrasyon rayında.
                  Küçük ekranda gizlenir; hero metni her koşulda önce gelir. */}
              <div className="relative hidden rounded-xl border border-doku bg-kagit-alt/70 p-6 shadow-y2 lg:block">
                <p className="mb-4 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-murekkep-2">
                  tezgâh · üç panel · tek kalibrasyon
                </p>
                <HeroGorseli className="h-auto w-full text-murekkep-2" />
                <div className="mt-4 flex justify-between font-mono text-[0.65rem] tracking-wider text-murekkep-2">
                  <span>p1 sinyal</span>
                  <span>p2 ölçüm</span>
                  <span>p3 bilgi ağı</span>
                  <span className="text-sinyal">kayıt açık</span>
                </div>
              </div>
            </div>
          </div>

          {istatistik !== null && (
            <div className="mx-auto max-w-[1280px] px-[var(--gutter)]">
              <OlcumSeridi veri={istatistik} />
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-[var(--gutter)]">
        {/* § 01 — yayın akışı (bento: manşet + kartlar) */}
        {yayinlar.length > 0 && (
          <section aria-labelledby="son-yayinlar" className="beliren scroll-mt-20 py-16">
            <BolumBasligi
              no="01"
              id="son-yayinlar"
              baslik="Son yayınlar"
              bagAdres="/makale"
              bagEtiket="tüm makaleler"
            />
            <YayinAkisi yayinlar={yayinlar} />
          </section>
        )}

        {/* § 02 — konu yoğunluk haritası */}
        {konular.length > 0 && (
          <section
            aria-labelledby="konu-haritasi"
            className="beliren gec-boya py-[var(--bolum-bosluk)]"
          >
            <BolumBasligi
              no="02"
              id="konu-haritasi"
              baslik="Konu yoğunluğu"
              bagAdres="/konu"
              bagEtiket="konu haritası"
            />
            <KonuYogunlugu pillarlar={konular} />
          </section>
        )}

        {/* § 03 — sözlük vitrini */}
        {vitrinTerimleri.length > 0 && (
          <section
            aria-labelledby="sozluk-vitrin"
            className="beliren gec-boya py-[var(--bolum-bosluk)]"
          >
            <BolumBasligi
              no="03"
              id="sozluk-vitrin"
              baslik="Kanonik Türkçe sözlük"
              bagAdres="/sozluk"
              bagEtiket={`${terimler.length} terim`}
            />
            <SozlukVitrini terimler={vitrinTerimleri} />
          </section>
        )}
      </div>

      {/* § 04 — makine okunabilir yüzeyler (tam genişlik koyu panel) */}
      <MakineYuzeyleri />

      <div className="mx-auto max-w-[1280px] px-[var(--gutter)]">
        {/* § 05 — editoryal ilkeler */}
        <section aria-labelledby="ilkeler" className="beliren gec-boya py-[var(--bolum-bosluk)]">
          <BolumBasligi
            no="05"
            id="ilkeler"
            baslik="Tezgâhta ne var?"
            not="üç ilke · üçü de kodla zorunlu"
          />
          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {ILKELER.map((madde, sira) => (
              <li
                key={madde.no}
                className="kademe centik flex flex-col border border-doku rounded-lg bg-kagit-alt"
                style={{ "--k": sira } as CSSProperties}
              >
                <span className="flex items-center justify-between border-b border-doku px-5 py-2.5 font-mono text-[0.65rem] tracking-[0.18em] text-sinyal">
                  {madde.no}
                  <madde.Gorsel className="size-14 text-murekkep-2" />
                </span>
                <span className="flex flex-1 flex-col p-5">
                  <span className="font-display text-lg font-semibold">{madde.baslik}</span>
                  <span className="mt-2.5 text-sm leading-relaxed text-murekkep-2">
                    {madde.metin}
                  </span>
                  <span className="mt-auto pt-5 font-mono text-[0.65rem] uppercase tracking-wider text-murekkep-2">
                    {madde.olcut}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="beliren gec-boya pb-[var(--bolum-bosluk)]">
          <BultenCTA />
        </section>
      </div>
    </>
  );
}
