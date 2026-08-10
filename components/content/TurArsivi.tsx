// Tür indeks görünümü — SEKİZ rota da (makale, rehber, uygulama,
// laboratuvar, araç, ölçüm, vaka, uyum) bu tek bileşeni kurar; aralarındaki
// fark yalnız lib/tur-arsivi.ts'teki metinlerdir.
// RSC: veriyi kendisi çeker, DB hatasında boş duruma düşer (sayfa kırılmaz).
//
// Görsel dil: yükseltilmiş vurgu yüzeyi (.ekran + .ekran-izgara) — tür
// indeksleri sitenin ana gezinme cepheleridir; ikincil arşivler (etiket,
// cluster) .mm-zemin kağıt zemininde kalır.
import Link from "next/link";
import { IcerikKarti } from "@/components/content/IcerikKarti";
import { ArsivBosGorseli, TurIkon } from "@/components/gorsel";
import { ARSIV_SAYFA_ADEDI, turListesi, turSayisi } from "@/lib/db/queries/arsiv";
import type { IcerikOzetDTO } from "@/lib/db/queries/dto";
import { env } from "@/lib/env";
import { jsonLdScript, koleksiyonSayfasiJsonLd } from "@/lib/seo/jsonld";
import { icerikYolu } from "@/lib/rotalar";
import {
  ARSIVLI_TURLER,
  TUR_ARSIV_METNI,
  turArsivSayfaYolu,
  turIndeksYolu,
  type ArsivliTur,
} from "@/lib/tur-arsivi";

const SAYI_TR = new Intl.NumberFormat("tr-TR");

export async function TurArsivi({ tur, sayfa }: { tur: ArsivliTur; sayfa: number }) {
  const metin = TUR_ARSIV_METNI[tur];
  const yol = turIndeksYolu(tur) ?? "/";

  let icerikler: IcerikOzetDTO[] = [];
  let toplam = 0;
  try {
    [icerikler, toplam] = await Promise.all([
      turListesi(tur, sayfa, ARSIV_SAYFA_ADEDI),
      turSayisi(tur),
    ]);
  } catch {
    icerikler = [];
    toplam = 0;
  }

  const sayfaSayisi = Math.max(1, Math.ceil(toplam / ARSIV_SAYFA_ADEDI));
  const atla = (sayfa - 1) * ARSIV_SAYFA_ADEDI;
  const oncekiVar = sayfa > 1;
  const sonrakiVar = sayfa < sayfaSayisi;
  // Aralık dışı sayfa isteği (ör. ?sayfa=99): liste boş döner, 404 vermeyiz —
  // kanonik kendine bakar ve okuyucu geri dönüş linkiyle listeye çıkar.
  const araligiAsti = sayfa > sayfaSayisi && toplam > 0;

  return (
    <>
      <section className="ekran relative overflow-hidden border-b border-doku">
        <div className="ekran-izgara">
          <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-14">
            <p className="bolum-indeks uppercase">{metin.indeks}</p>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-murekkep [font-stretch:94%]">
              {metin.baslik}
            </h1>
            <p className="mt-4 max-w-[var(--govde-olcu)] leading-relaxed text-murekkep-2">
              {metin.giris}
            </p>
            <div className="veri-rayi mt-7 max-w-lg">
              <div>
                yayında
                <br />
                <span className="deger">{SAYI_TR.format(toplam)}</span>
              </div>
              <div>
                sayfa
                <br />
                <span className="deger">
                  {Math.min(sayfa, sayfaSayisi)} / {sayfaSayisi}
                </span>
              </div>
              <div>
                sıralama
                <br />
                <span className="deger">yeniden eskiye</span>
              </div>
              <div>
                kaynak
                <br />
                <span className="deger">zorunlu</span>
              </div>
            </div>

            {/* Kardeş arşivler: sekiz tür başlıkta yer kaplamadan birbirine
                bağlanır. Aktif olan aria-current ile işaretlenir. */}
            <nav aria-label="İçerik türleri" className="mt-7">
              <ul className="flex flex-wrap gap-2">
                {ARSIVLI_TURLER.map((kardes) => {
                  const aktif = kardes === tur;
                  return (
                    <li key={kardes}>
                      <Link
                        href={turIndeksYolu(kardes) ?? "/"}
                        aria-current={aktif ? "page" : undefined}
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-xs no-underline transition-colors ${
                          aktif
                            ? "border-sinyal bg-sinyal-yumusak text-sinyal"
                            : "border-doku bg-kagit-alt text-murekkep-2 hover:border-doku-guclu hover:text-murekkep"
                        }`}
                      >
                        <TurIkon tur={kardes} className="size-[15px]" />
                        {TUR_ARSIV_METNI[kardes].baslik}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-12">
        {icerikler.length > 0 ? (
          <>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {icerikler.map((icerik, sira) => (
                <li key={icerik.id} className="min-w-0">
                  <IcerikKarti icerik={icerik} sira={atla + sira + 1} />
                </li>
              ))}
            </ul>

            {(oncekiVar || sonrakiVar) && (
              <nav
                aria-label="Arşiv sayfaları"
                className="mt-10 flex items-center justify-between gap-4 border-t border-doku pt-5 font-mono text-sm"
              >
                {oncekiVar ? (
                  <Link href={turArsivSayfaYolu(tur, sayfa - 1)} rel="prev">
                    ← önceki
                  </Link>
                ) : (
                  <span className="text-murekkep-2">← önceki</span>
                )}
                <span className="text-murekkep-2">
                  sayfa {sayfa} / {sayfaSayisi}
                </span>
                {sonrakiVar ? (
                  <Link href={turArsivSayfaYolu(tur, sayfa + 1)} rel="next">
                    sonraki →
                  </Link>
                ) : (
                  <span className="text-murekkep-2">sonraki →</span>
                )}
              </nav>
            )}

            {jsonLdScript(
              koleksiyonSayfasiJsonLd({
                ad: metin.baslik,
                aciklama: metin.aciklama,
                url: `${env.NEXT_PUBLIC_SITE_URL}${turArsivSayfaYolu(tur, sayfa)}`,
                toplam,
                atla,
                ogeler: icerikler.map((icerik) => ({
                  baslik: icerik.title,
                  url: `${env.NEXT_PUBLIC_SITE_URL}${icerikYolu(icerik.type, icerik.slug)}`,
                })),
              }),
            )}
          </>
        ) : (
          <div className="flex max-w-[var(--govde-olcu)] flex-col gap-5 rounded-lg border border-doku bg-kagit-alt p-6 sm:flex-row sm:items-start">
            <ArsivBosGorseli className="h-auto w-40 shrink-0 text-murekkep-2" />
            <div>
              <p className="font-display text-lg font-semibold">
                {araligiAsti ? "Bu sayfada kayıt yok." : "Kayıt yok."}
              </p>
              <p className="mt-3 text-murekkep-2">
                {araligiAsti
                  ? `Arşivde ${SAYI_TR.format(toplam)} kayıt var ve son sayfa ${sayfaSayisi}.`
                  : metin.bosMesaj}
              </p>
              <p className="mt-4 font-mono text-sm">
                <Link href={yol}>← {metin.baslik.toLocaleLowerCase("tr-TR")} listesi</Link>
                <span aria-hidden className="mx-2 text-murekkep-2">
                  ·
                </span>
                <Link href="/konu">konu haritası</Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
