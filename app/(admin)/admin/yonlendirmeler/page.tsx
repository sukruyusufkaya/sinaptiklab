import type { Metadata } from "next";
import { PanelBasligi } from "@/components/admin/PanelBasligi";
import { tumYonlendirmeler } from "@/lib/db/queries/admin-ek";
import { yonlendirmeSil } from "./actions";
import { YonlendirmeFormu } from "./YonlendirmeFormu";

// Yönlendirme yöneticisi (BRIEF §2.2 slug değişimi → 301 zorunlu, §11).
// Panel her istekte taze okur — önbellek yok.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Yönlendirmeler" };

const TARIH_TR = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" });

export default async function YonlendirmeYoneticisi() {
  const kayitlar = await tumYonlendirmeler();
  const hedefler = new Set(kayitlar.map((kayit) => kayit.to));
  const zincirliSayisi = kayitlar.filter((kayit) => hedefler.has(kayit.from)).length;

  return (
    <>
      <PanelBasligi
        indeks="yönlendirme tablosu"
        baslik="Yönlendirmeler"
        aciklama={
          <>
            Yayındaki bir içeriğin slug&apos;ı değişirse eski yol için kalıcı yönlendirme kaydı
            zorunludur (BRIEF §2.2). Kayıtlar içerik rotalarında 404 öncesi okunur ve{" "}
            <code className="font-mono text-xs">redirects</code> etiketiyle önbelleklenir.
          </>
        }
      >
        <div className="veri-rayi mt-7 max-w-lg bg-kagit">
          <div>
            kayıt
            <br />
            <span className="deger tabular-nums">{kayitlar.length}</span>
          </div>
          <div>
            zincirli
            <br />
            <span
              className={`deger tabular-nums ${zincirliSayisi > 0 ? "text-olcum" : "text-onay"}`}
            >
              {zincirliSayisi}
            </span>
          </div>
          <div>
            önbellek etiketi
            <br />
            <span className="deger">redirects</span>
          </div>
        </div>
      </PanelBasligi>

      <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-8">
        <YonlendirmeFormu />

        <div className="cetvel mt-8" aria-hidden />

        <h2 className="mt-6 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-murekkep-2">
          kayıtlı yönlendirmeler
        </h2>

        {kayitlar.length === 0 ? (
          <p className="mt-4 border border-doku rounded-lg bg-kagit-alt p-6 text-murekkep-2">
            Henüz yönlendirme kaydı yok — slug değiştirdiğinizde eski yolu buraya ekleyin.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto border border-doku rounded-md">
            <table className="w-full min-w-[48rem] border-collapse text-sm">
              <caption className="sr-only">
                Kayıtlı yönlendirmeler: kaynak yol, hedef yol, HTTP kodu ve oluşturma tarihi
              </caption>
              <thead>
                <tr className="border-b border-doku bg-kagit-alt text-left font-mono text-[0.65rem] uppercase tracking-[0.18em] text-murekkep-2">
                  <th scope="col" className="px-4 py-2.5 font-normal">
                    Kaynak (from)
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-normal">
                    Hedef (to)
                  </th>
                  <th scope="col" className="w-20 px-4 py-2.5 font-normal">
                    Kod
                  </th>
                  <th scope="col" className="w-44 px-4 py-2.5 font-normal">
                    Oluşturma
                  </th>
                  <th scope="col" className="w-20 px-4 py-2.5 font-normal">
                    <span className="sr-only">İşlem</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {kayitlar.map((kayit) => {
                  const zincirli = hedefler.has(kayit.from);
                  return (
                    <tr
                      key={kayit.id}
                      className="border-b border-doku transition-colors last:border-b-0 hover:bg-kagit-alt"
                    >
                      <td className="px-4 py-3 font-mono text-xs">
                        {kayit.from}
                        {zincirli && (
                          <span className="ml-2 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-olcum">
                            zincir
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        <span aria-hidden className="mr-2 text-murekkep-2">
                          →
                        </span>
                        {kayit.to}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs tabular-nums text-sinyal">
                        {kayit.code}
                      </td>
                      <td className="px-4 py-3 font-mono text-[0.65rem] tabular-nums text-murekkep-2">
                        {TARIH_TR.format(new Date(kayit.createdAt))}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <form action={yonlendirmeSil}>
                          <input type="hidden" name="id" value={kayit.id} />
                          <button
                            type="submit"
                            aria-label={`${kayit.from} yönlendirmesini sil`}
                            className="border border-doku rounded-md px-2 py-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-murekkep-2 transition-colors hover:border-uyari hover:text-uyari"
                          >
                            Sil
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {zincirliSayisi > 0 && (
          <p className="mt-4 border border-olcum rounded-md p-3 font-mono text-xs text-murekkep-2">
            {zincirliSayisi} kayıt zincir oluşturuyor (bir kaydın hedefi başka bir kaydın kaynağı).
            Zinciri kısaltmak için ilk kaydı doğrudan son hedefe bağlayın.
          </p>
        )}
      </div>
    </>
  );
}
