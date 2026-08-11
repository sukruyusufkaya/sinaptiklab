"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import type { Soru } from "@/lib/db/schemas";
import { icerikYolu } from "@/lib/rotalar";

/**
 * Test motoru — alıştırma kipi: bir şık işaretlenince soru kilitlenir,
 * doğru/yanlış ve GEREKÇE anında açılır. Amaç sınav simülasyonu değil
 * öğrenme; bu yüzden geri bildirim sona saklanmaz.
 *
 * İki tasarım kararı:
 *
 * 1. HİÇBİR VERİ SUNUCUYA GİTMEZ. Skor tarayıcıda hesaplanır, kaydedilmez,
 *    çerez yazılmaz. Site genelinde takip yok (§14); testler istisna olamaz.
 *
 * 2. JS'siz de İŞE YARAR. Bileşen sunucuda render edilir: soru, şıklar ve
 *    "Açıklamayı göster" `<details>`'i HTML'de gelir — `<details>` yerli
 *    olarak JS'siz açılır. JS varsa açıklama işaretleme anında kendiliğinden
 *    açılır ve skor işler. Böylece hem okuyucu hem tarayıcı tam metni görür
 *    (arama motoru için de asıl değer gerekçe metnidir).
 */

interface Props {
  sorular: Soru[];
  passScore: number;
  /** Soruların kanıt içeriğine bağlanabilmesi için slug → (tür, başlık) */
  kanitlar: Record<string, { tur: Parameters<typeof icerikYolu>[0]; baslik: string }>;
}

const HARF = ["A", "B", "C", "D", "E", "F"];

export function TestCalistir({ sorular, passScore, kanitlar }: Props) {
  const alanOnEki = useId();
  const [cevaplar, setCevaplar] = useState<Record<string, string>>({});

  const cevaplanan = Object.keys(cevaplar).length;
  const dogruSayisi = useMemo(
    () => sorular.filter((s) => cevaplar[s.id] === s.dogru).length,
    [sorular, cevaplar],
  );
  const bitti = cevaplanan === sorular.length;
  const yuzde = sorular.length === 0 ? 0 : Math.round((dogruSayisi / sorular.length) * 100);
  const gecti = yuzde >= passScore;

  function isaretle(soruId: string, secenekId: string) {
    // Bir kez işaretlenen soru kilitlenir: tahmin sonrası şık değiştirmek
    // öğrenmeyi değil skoru düzeltir.
    setCevaplar((oncekiler) =>
      oncekiler[soruId] === undefined ? { ...oncekiler, [soruId]: secenekId } : oncekiler,
    );
  }

  return (
    <div>
      {/* ── İlerleme şeridi ── */}
      <div className="sticky top-[3.5rem] z-10 -mx-2 mb-8 rounded-lg border border-doku bg-kagit/90 px-4 py-3 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 font-mono text-xs">
          <span className="text-murekkep-2">
            <span className="text-murekkep">{cevaplanan}</span> / {sorular.length} soru
          </span>
          <span className="text-murekkep-2">
            doğru: <span className="text-murekkep">{dogruSayisi}</span>
            <span aria-hidden className="mx-2">
              ·
            </span>
            <span className={gecti && bitti ? "text-onay" : "text-murekkep"}>%{yuzde}</span>
          </span>
        </div>
        <div aria-hidden className="mt-2 h-1 w-full rounded-full bg-doku">
          <div
            className="h-full rounded-full bg-sinyal transition-[width] duration-300"
            style={{ width: `${sorular.length === 0 ? 0 : (cevaplanan / sorular.length) * 100}%` }}
          />
        </div>
      </div>

      <ol className="space-y-5">
        {sorular.map((soru, sira) => {
          const secilen = cevaplar[soru.id];
          const cevaplandi = secilen !== undefined;
          const dogruMu = secilen === soru.dogru;
          const kanit = soru.kanitSlug === undefined ? undefined : kanitlar[soru.kanitSlug];

          return (
            <li
              key={soru.id}
              className="rounded-xl border border-doku bg-kagit-alt p-5 shadow-y1 sm:p-6"
            >
              <fieldset>
                <legend className="mb-4 block">
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-murekkep-2">
                    soru {sira + 1} · {soru.zorluk}
                  </span>
                  <span className="mt-2 block font-display text-lg font-semibold leading-snug text-murekkep">
                    {soru.soru}
                  </span>
                </legend>

                <div className="space-y-2">
                  {soru.secenekler.map((secenek, sIndex) => {
                    const buSecildi = secilen === secenek.id;
                    const buDogru = secenek.id === soru.dogru;
                    // Renk TEK BAŞINA sinyal değil: doğru/yanlış ayrıca
                    // metinle de yazılır (WCAG 1.4.1).
                    const durum = !cevaplandi
                      ? "border-doku hover:border-doku-guclu"
                      : buDogru
                        ? "border-onay bg-onay/5"
                        : buSecildi
                          ? "border-uyari bg-uyari/5"
                          : "border-doku opacity-70";
                    return (
                      <label
                        key={secenek.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border bg-kagit px-4 py-3 text-sm transition-colors ${durum} ${
                          cevaplandi ? "cursor-default" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name={`${alanOnEki}-${soru.id}`}
                          value={secenek.id}
                          checked={buSecildi}
                          disabled={cevaplandi}
                          onChange={() => isaretle(soru.id, secenek.id)}
                          className="mt-1 size-4 shrink-0 accent-[var(--sinyal)]"
                        />
                        <span className="min-w-0">
                          <span className="font-mono text-xs text-murekkep-2">
                            {HARF[sIndex] ?? "?"}
                          </span>{" "}
                          <span className="text-murekkep">{secenek.metin}</span>
                          {cevaplandi && buDogru && (
                            <span className="ml-2 font-mono text-[0.65rem] uppercase tracking-wider text-onay">
                              doğru cevap
                            </span>
                          )}
                          {cevaplandi && buSecildi && !buDogru && (
                            <span className="ml-2 font-mono text-[0.65rem] uppercase tracking-wider text-uyari">
                              senin işaretlediğin
                            </span>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {cevaplandi && (
                <p
                  role="status"
                  className={`mt-4 font-mono text-xs ${dogruMu ? "text-onay" : "text-uyari"}`}
                >
                  {dogruMu ? "Doğru." : "Yanlış."}
                </p>
              )}

              {/* Açıklama: JS'siz de açılabilsin diye `details`; cevaplandığında
                  `open` ile kendiliğinden açılır. */}
              <details open={cevaplandi} className="acilir mt-3">
                <summary className="cursor-pointer list-none font-mono text-xs text-murekkep-2 transition-colors hover:text-sinyal">
                  Açıklama
                </summary>
                <div className="mt-3 border-l-2 border-doku pl-4 text-sm leading-relaxed text-murekkep-2">
                  <p>{soru.aciklama}</p>
                  {kanit !== undefined && soru.kanitSlug !== undefined && (
                    <p className="mt-3 font-mono text-xs">
                      Kaynak içerik:{" "}
                      <Link href={icerikYolu(kanit.tur, soru.kanitSlug)}>{kanit.baslik}</Link>
                    </p>
                  )}
                </div>
              </details>
            </li>
          );
        })}
      </ol>

      {/* ── Sonuç ── */}
      {bitti && (
        <div
          role="status"
          className="mt-8 rounded-xl border border-doku bg-kagit-alt p-6 shadow-y2 sm:p-8"
        >
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-murekkep-2">
            sonuç
          </p>
          <p className="mt-3 font-display text-3xl font-bold tabular-nums text-murekkep">
            {dogruSayisi} / {sorular.length}
            <span className={`ml-3 text-xl ${gecti ? "text-onay" : "text-olcum"}`}>%{yuzde}</span>
          </p>
          <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-murekkep-2">
            {gecti
              ? `Geçme eşiği %${passScore}; bu testi geçtiniz. Yanlış yaptığınız soruların açıklamalarındaki içeriklere göz atmak yine de faydalı.`
              : `Geçme eşiği %${passScore}. Yanlış yaptığınız soruların açıklamalarındaki içerikleri okuyup tekrar deneyin — açıklamalar tam olarak neyin atlandığını söylüyor.`}
          </p>
          <button type="button" onClick={() => setCevaplar({})} className="dugme-cerceve mt-6">
            Baştan dene{" "}
            <span aria-hidden className="ok">
              ↻
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
