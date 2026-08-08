import Link from "next/link";
import { IcerikKarti } from "@/components/content/IcerikKarti";
import { BultenCTA } from "@/components/layout/BultenCTA";
import { sonYayinlar } from "@/lib/db/queries/contents";
import type { IcerikOzetDTO } from "@/lib/db/queries/dto";
import { pillarlar, type PillarOzetDTO } from "@/lib/db/queries/topics";

export default async function AnaSayfa() {
  // DB yoksa/erişilemiyorsa bölümler sessizce atlanır — build DB'siz de geçmeli
  // (bilinçli sessizlik: console.error bile yok, build günlüğü kirlenmesin).
  let yayinlar: IcerikOzetDTO[] = [];
  let konular: PillarOzetDTO[] = [];
  try {
    [yayinlar, konular] = await Promise.all([sonYayinlar(6), pillarlar()]);
  } catch {
    yayinlar = [];
    konular = [];
  }

  return (
    <div className="mx-auto max-w-[1280px] px-[var(--gutter)]">
      <section className="py-20 sm:py-28">
        <p className="font-mono text-xs uppercase tracking-widest text-murekkep-2">
          Kalibrasyon aşaması — v0.1
        </p>
        <h1 className="mt-4 max-w-[22ch] font-display text-4xl font-bold">
          Saha verisi, uydurma yok.
        </h1>
        <p className="mt-6 max-w-[var(--govde-olcu)] text-lg text-murekkep-2">
          Sinaptiklab, yapay zeka sistemlerini gerçekten üretenler için yazılan Türkçe teknik yayın
          ve öğrenme platformudur: her iddia kaynaklı, her tutorial çalışan repo ile, her içerik
          sürümlü.
        </p>
      </section>

      <div className="cetvel" aria-hidden />

      {yayinlar.length > 0 && (
        <>
          <section aria-labelledby="son-yayinlar" className="py-14">
            <h2 id="son-yayinlar" className="font-display text-2xl font-bold">
              Son yayınlar
            </h2>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {yayinlar.map((yayin) => (
                <li key={yayin.id}>
                  <IcerikKarti icerik={yayin} />
                </li>
              ))}
            </ul>
          </section>

          <div className="cetvel" aria-hidden />
        </>
      )}

      {konular.length > 0 && (
        <>
          <section aria-labelledby="konu-haritasi" className="py-14">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="konu-haritasi" className="font-display text-2xl font-bold">
                Konu haritası
              </h2>
              <Link href="/konu" className="font-mono text-xs no-underline hover:underline">
                tümü →
              </Link>
            </div>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {konular.map((pillar) => (
                <li key={pillar.slug} className="min-w-0">
                  <Link
                    href={`/konu/${pillar.slug}`}
                    className="flex h-full items-baseline justify-between gap-3 border border-doku px-4 py-3 no-underline transition-colors hover:border-sinyal"
                  >
                    <span className="text-sm font-medium text-murekkep">{pillar.title}</span>
                    <span className="shrink-0 font-mono text-xs text-murekkep-2">
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

      <section aria-labelledby="ne-geliyor" className="py-14">
        <h2 id="ne-geliyor" className="font-display text-2xl font-bold">
          Tezgâhta ne var?
        </h2>
        <ul className="mt-6 grid gap-6 sm:grid-cols-3">
          <li className="border border-doku bg-kagit-alt p-5">
            <p className="font-mono text-xs text-sinyal">01</p>
            <h3 className="mt-2 font-display text-lg font-semibold">Kaynaklı derinlik</h3>
            <p className="mt-2 text-sm text-murekkep-2">
              Her sayı, tarih ve iddia kaynağına bağlanır; kaynağı olmayan içerik yayına teknik
              olarak çıkamaz.
            </p>
          </li>
          <li className="border border-doku bg-kagit-alt p-5">
            <p className="font-mono text-xs text-sinyal">02</p>
            <h3 className="mt-2 font-display text-lg font-semibold">Çalışan kod</h3>
            <p className="mt-2 text-sm text-murekkep-2">
              Uygulamalar ve laboratuvarlar çalışan repo, model sürümü, donanım ve maliyet
              bilgisiyle gelir: yeniden üretilebilirlik varsayılandır.
            </p>
          </li>
          <li className="border border-doku bg-kagit-alt p-5">
            <p className="font-mono text-xs text-sinyal">03</p>
            <h3 className="mt-2 font-display text-lg font-semibold">Kanonik Türkçe</h3>
            <p className="mt-2 text-sm text-murekkep-2">
              Türkçe yapay zeka terminolojisi tek sözlükte kanonikleşir; aynı kavram sitenin her
              yerinde aynı adla anılır.
            </p>
          </li>
        </ul>
      </section>

      <section className="pb-16">
        <BultenCTA />
      </section>
    </div>
  );
}
