import type { Metadata } from "next";
import Link from "next/link";
import { DurumRozeti } from "@/components/admin/DurumRozeti";
import { PanelBasligi } from "@/components/admin/PanelBasligi";
import { tumIcerikler, type AdminIcerikOzeti } from "@/lib/db/queries/admin";
import { DURUM_ETIKETLERI, type Durum } from "@/lib/editorial/durum-makinesi";
import { turEtiketi, type IcerikTuru } from "@/lib/rotalar";

// Panel her istekte taze okur — önbellek yok (liste, taslakları da gösterir).
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "İçerikler" };

const TARIH_TR = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" });
const tarih = (iso: string) => TARIH_TR.format(new Date(iso));

// Faz 2 alt kümesi: panelden yalnız bu üç tür oluşturulur (BRIEF §11).
const YENI_TURLER = ["article", "guide", "tutorial"] as const;

const DURUMLAR = [
  "draft",
  "in_review",
  "scheduled",
  "published",
  "archived",
] as const satisfies readonly Durum[];

function durumCoz(deger: string | undefined): Durum | null {
  return DURUMLAR.find((durum) => durum === deger) ?? null;
}

const SUZGEC_BAGLANTISI =
  "border px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] no-underline transition-colors";
const SUZGEC_PASIF = "border-doku text-murekkep-2 hover:border-sinyal hover:text-sinyal";
const SUZGEC_AKTIF = "border-sinyal bg-sinyal text-kagit hover:text-kagit";

/** Mevcut sorguyu koruyarak tek parametreyi değiştiren yol üretir. */
function suzgecYolu(mevcut: { durum: Durum | null; tur: string | null }): string {
  const parametreler = new URLSearchParams();
  if (mevcut.durum !== null) parametreler.set("durum", mevcut.durum);
  if (mevcut.tur !== null) parametreler.set("tur", mevcut.tur);
  const sorgu = parametreler.toString();
  return sorgu.length > 0 ? `/admin?${sorgu}` : "/admin";
}

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminIcerikListesi({ searchParams }: Props) {
  const parametreler = await searchParams;
  const durumParam = parametreler["durum"];
  const turParam = parametreler["tur"];
  const seciliDurum = durumCoz(typeof durumParam === "string" ? durumParam : undefined);
  const seciliTurAdayi = typeof turParam === "string" ? turParam : null;

  const icerikler = await tumIcerikler();

  // Türler veriden türetilir (adet sırasıyla) — panelde ölü süzgeç linki olmaz.
  const turSayaci = new Map<IcerikTuru, number>();
  for (const icerik of icerikler) {
    turSayaci.set(icerik.type, (turSayaci.get(icerik.type) ?? 0) + 1);
  }
  const turler = [...turSayaci.entries()].sort((a, b) => b[1] - a[1]);
  const seciliTur = turler.some(([tur]) => tur === seciliTurAdayi) ? seciliTurAdayi : null;

  const durumSayaci = (durum: Durum) =>
    icerikler.filter((icerik) => icerik.status === durum).length;

  const listelenen: AdminIcerikOzeti[] = icerikler.filter(
    (icerik) =>
      (seciliDurum === null || icerik.status === seciliDurum) &&
      (seciliTur === null || icerik.type === seciliTur),
  );

  const suzgecAcik = seciliDurum !== null || seciliTur !== null;

  return (
    <>
      <PanelBasligi
        indeks="içerik envanteri"
        baslik="İçerikler"
        aciklama="Her durumdaki kayıt; başlığa tıklayınca editör açılır. Yayın kontrolleri (BRIEF §4.3) editörün sağ sütununda çalışır."
        aksiyon={
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-full font-mono text-[0.65rem] uppercase tracking-[0.18em] text-murekkep-2 sm:w-auto">
              yeni kayıt
            </span>
            {YENI_TURLER.map((tur) => (
              <Link key={tur} href={`/admin/yeni?tur=${tur}`} className="dugme-cerceve bg-kagit">
                + {turEtiketi(tur)}
              </Link>
            ))}
          </div>
        }
      >
        <div className="veri-rayi mt-7 max-w-2xl bg-kagit">
          <div>
            toplam
            <br />
            <span className="deger tabular-nums">{icerikler.length}</span>
          </div>
          <div>
            yayında
            <br />
            <span className="deger tabular-nums text-onay">{durumSayaci("published")}</span>
          </div>
          <div>
            taslak
            <br />
            <span className="deger tabular-nums">{durumSayaci("draft")}</span>
          </div>
          <div>
            incelemede
            <br />
            <span className="deger tabular-nums">{durumSayaci("in_review")}</span>
          </div>
          <div>
            arşivde
            <br />
            <span className="deger tabular-nums">{durumSayaci("archived")}</span>
          </div>
        </div>
      </PanelBasligi>

      <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-8">
        {/* ── Süzgeçler: server-side, salt searchParams ── */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-20 shrink-0 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-murekkep-2">
              durum
            </span>
            <Link
              href={suzgecYolu({ durum: null, tur: seciliTur })}
              className={`${SUZGEC_BAGLANTISI} ${seciliDurum === null ? SUZGEC_AKTIF : SUZGEC_PASIF}`}
            >
              tümü
            </Link>
            {DURUMLAR.map((durum) => (
              <Link
                key={durum}
                href={suzgecYolu({ durum, tur: seciliTur })}
                className={`${SUZGEC_BAGLANTISI} ${seciliDurum === durum ? SUZGEC_AKTIF : SUZGEC_PASIF}`}
              >
                {DURUM_ETIKETLERI[durum]} · {durumSayaci(durum)}
              </Link>
            ))}
          </div>

          {turler.length > 1 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-20 shrink-0 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-murekkep-2">
                tür
              </span>
              <Link
                href={suzgecYolu({ durum: seciliDurum, tur: null })}
                className={`${SUZGEC_BAGLANTISI} ${seciliTur === null ? SUZGEC_AKTIF : SUZGEC_PASIF}`}
              >
                tümü
              </Link>
              {turler.map(([tur, adet]) => (
                <Link
                  key={tur}
                  href={suzgecYolu({ durum: seciliDurum, tur })}
                  className={`${SUZGEC_BAGLANTISI} ${seciliTur === tur ? SUZGEC_AKTIF : SUZGEC_PASIF}`}
                >
                  {turEtiketi(tur)} · {adet}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="cetvel mt-6" aria-hidden />

        <p aria-live="polite" className="mt-4 font-mono text-xs text-murekkep-2">
          {listelenen.length} / {icerikler.length} kayıt gösteriliyor
          {suzgecAcik && (
            <>
              {" · "}
              <Link href="/admin" className="no-underline hover:underline">
                süzgeci temizle
              </Link>
            </>
          )}
        </p>

        {icerikler.length === 0 ? (
          <p className="mt-6 border border-doku rounded-lg bg-kagit-alt p-6 text-murekkep-2">
            Henüz içerik yok — yukarıdan tür seçip ilk içeriği oluşturun.
          </p>
        ) : listelenen.length === 0 ? (
          <p className="mt-6 border border-doku rounded-lg bg-kagit-alt p-6 text-murekkep-2">
            Bu süzgeçle eşleşen kayıt yok. <Link href="/admin">Süzgeci temizleyin</Link> ya da başka
            bir durum seçin.
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto border border-doku rounded-md">
            <table className="w-full min-w-[52rem] border-collapse text-sm">
              <caption className="sr-only">
                İçerik envanteri: başlık, tür, durum, güncelleme ve yayın tarihleri
              </caption>
              <thead>
                <tr className="border-b border-doku bg-kagit-alt text-left font-mono text-[0.65rem] uppercase tracking-[0.18em] text-murekkep-2">
                  <th scope="col" className="w-12 px-4 py-2.5 font-normal">
                    #
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-normal">
                    Başlık
                  </th>
                  <th scope="col" className="w-28 px-4 py-2.5 font-normal">
                    Tür
                  </th>
                  <th scope="col" className="w-36 px-4 py-2.5 font-normal">
                    Durum
                  </th>
                  <th scope="col" className="w-44 px-4 py-2.5 font-normal">
                    Güncelleme
                  </th>
                  <th scope="col" className="w-44 px-4 py-2.5 font-normal">
                    Yayın
                  </th>
                </tr>
              </thead>
              <tbody>
                {listelenen.map((icerik, sira) => (
                  <tr
                    key={icerik.id}
                    className="border-b border-doku transition-colors last:border-b-0 hover:bg-kagit-alt"
                  >
                    <td className="px-4 py-3 font-mono text-[0.65rem] text-murekkep-2 tabular-nums">
                      {String(sira + 1).padStart(2, "0")}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/icerik/${icerik.id}`}
                        className="font-medium text-murekkep no-underline hover:text-sinyal"
                      >
                        {icerik.title}
                      </Link>
                      <span className="mt-0.5 block font-mono text-[0.65rem] text-murekkep-2">
                        /{icerik.slug}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{turEtiketi(icerik.type)}</td>
                    <td className="px-4 py-3">
                      <DurumRozeti durum={icerik.status} />
                    </td>
                    <td className="px-4 py-3 font-mono text-[0.65rem] tabular-nums text-murekkep-2">
                      {tarih(icerik.updatedAt)}
                    </td>
                    <td className="px-4 py-3 font-mono text-[0.65rem] tabular-nums text-murekkep-2">
                      {icerik.publishedAt !== null ? tarih(icerik.publishedAt) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
