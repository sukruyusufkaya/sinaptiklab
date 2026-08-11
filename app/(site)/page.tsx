import Link from "next/link";
import type { CSSProperties } from "react";
import { HeroGorseli } from "@/components/gorsel";
import { BolumBasligi } from "@/components/home/BolumBasligi";
import { KonuYogunlugu } from "@/components/home/KonuYogunlugu";
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

/**
 * Kanıt şeridi: hero'nun hemen altında, iddianın SAYIYLA karşılığı.
 * Sayılar gerçek veriden gelir (§14/7 — uydurma metrik yasak); her hücre
 * sayının ne kanıtladığını da söyler, yoksa çıplak rakam bir şey anlatmaz.
 */
function OlcumSeridi({ veri }: { veri: SiteIstatistikleriDTO }) {
  const hucreler = [
    { deger: veri.yayindaIcerik, etiket: "yayında içerik", not: "hepsi sürümlü" },
    { deger: veri.toplamKaynak, etiket: "doğrulanmış kaynak", not: "her iddia bağlı", vurgu: true },
    { deger: veri.pillarSayisi, etiket: "ana konu", not: "sabit taksonomi" },
    { deger: veri.clusterSayisi, etiket: "alt küme", not: "otomatik iç link" },
  ];
  return (
    <section aria-label="Arşivin bugünkü durumu" className="border-t border-doku pt-6">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-murekkep-2">
        arşivin bugünkü durumu
      </p>
      <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-4">
        {hucreler.map((hucre) => (
          <div key={hucre.etiket} className="min-w-0">
            <dd
              className={`font-display text-3xl font-bold tabular-nums sm:text-4xl ${
                hucre.vurgu === true ? "text-sinyal" : "text-murekkep"
              }`}
            >
              <SayacDeger deger={hucre.deger} />
            </dd>
            {/* Niteleyici not `dt` İÇİNDE: `dl > div` yalnız `dt`/`dd`
                kabul eder, araya `p` koymak axe'ta definition-list ihlali
                (ölçüldü). `dt` akış içeriği alır, nested span geçerlidir. */}
            <dt className="mt-2 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-murekkep">
              {hucre.etiket}
              <span className="mt-1 block normal-case tracking-normal text-murekkep-2">
                {hucre.not}
              </span>
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
            <div className="grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(300px,520px)] lg:py-24">
              {/* `.sahne`: çocukları --s sırasına göre kademeli yükselir */}
              <div className="sahne">
                <h1
                  style={{ "--s": 0 } as CSSProperties}
                  className="font-display text-4xl font-bold leading-[0.98] tracking-tight text-murekkep [font-stretch:88%]"
                >
                  Yapay zekanın
                  <br />
                  <span className="text-sinyal">Türkçe teknik kaynağı.</span>
                </h1>
                <p
                  style={{ "--s": 1 } as CSSProperties}
                  className="mt-7 max-w-[50ch] text-lg leading-relaxed text-murekkep-2"
                >
                  LLM, RAG, ajanlar, MLOps, güvenlik ve regülasyon. Yapay zeka sistemlerini{" "}
                  <em>üretenler</em> için Türkçe teknik yayın.
                </p>
                <div
                  style={{ "--s": 2 } as CSSProperties}
                  className="mt-9 flex flex-wrap items-center gap-3"
                >
                  <Link href="/konu" className="dugme-birincil">
                    Konu haritası{" "}
                    <span aria-hidden className="ok">
                      →
                    </span>
                  </Link>
                  <a href="#son-yayinlar" className="dugme-cerceve">
                    Son yayınlar <span aria-hidden>↓</span>
                  </a>
                </div>
              </div>

              {/* Ölçüm tezgâhı kompozisyonu (ADR 0010 görsel katmanı): sinyal
                  izi + ölçüm çubukları + bilgi ağı, ortak kalibrasyon rayında.
                  Küçük ekranda gizlenir; hero metni her koşulda önce gelir. */}
              <div
                style={{ "--s": 3 } as CSSProperties}
                className="sahne-tek relative hidden rounded-xl border border-doku bg-kagit-alt/70 p-6 shadow-y2 lg:block"
              >
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
            <div className="mx-auto max-w-[1280px] px-[var(--gutter)] pb-12">
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

      <div className="mx-auto max-w-[1280px] px-[var(--gutter)]">
        <section className="beliren gec-boya pb-[var(--bolum-bosluk)]">
          <BultenCTA />
        </section>
      </div>
    </>
  );
}
