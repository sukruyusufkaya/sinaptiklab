import type { Metadata } from "next";
import Link from "next/link";
import { DurumRozeti } from "@/components/admin/DurumRozeti";
import { tumIcerikler } from "@/lib/db/queries/admin";
import { turEtiketi } from "@/lib/rotalar";

// Panel her istekte taze okur — önbellek yok (liste, taslakları da gösterir).
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "İçerikler" };

const TARIH_TR = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" });
const tarih = (iso: string) => TARIH_TR.format(new Date(iso));

// Faz 2 alt kümesi: panelden yalnız bu üç tür oluşturulur (BRIEF §11).
const YENI_TURLER = ["article", "guide", "tutorial"] as const;

export default async function AdminIcerikListesi() {
  const icerikler = await tumIcerikler();

  return (
    <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">İçerikler</h1>
          <p className="mt-1 font-mono text-xs text-murekkep-2">{icerikler.length} kayıt</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-widest text-murekkep-2">
            Yeni içerik:
          </span>
          {YENI_TURLER.map((tur) => (
            <Link
              key={tur}
              href={`/admin/yeni?tur=${tur}`}
              className="border border-doku px-3 py-1.5 font-mono text-sm text-sinyal no-underline hover:border-sinyal"
            >
              + {turEtiketi(tur)}
            </Link>
          ))}
        </div>
      </div>

      {icerikler.length === 0 ? (
        <p className="mt-10 border border-doku bg-kagit-alt p-6 text-murekkep-2">
          Henüz içerik yok — yukarıdan tür seçip ilk içeriği oluşturun.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto border border-doku">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-doku bg-kagit-alt text-left">
                <th className="px-4 py-3 font-mono text-xs font-normal uppercase tracking-wider text-murekkep-2">
                  Başlık
                </th>
                <th className="px-4 py-3 font-mono text-xs font-normal uppercase tracking-wider text-murekkep-2">
                  Tür
                </th>
                <th className="px-4 py-3 font-mono text-xs font-normal uppercase tracking-wider text-murekkep-2">
                  Durum
                </th>
                <th className="px-4 py-3 font-mono text-xs font-normal uppercase tracking-wider text-murekkep-2">
                  Güncelleme
                </th>
                <th className="px-4 py-3 font-mono text-xs font-normal uppercase tracking-wider text-murekkep-2">
                  Yayın
                </th>
              </tr>
            </thead>
            <tbody>
              {icerikler.map((icerik) => (
                <tr key={icerik.id} className="border-b border-doku last:border-b-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/icerik/${icerik.id}`}
                      className="font-medium text-murekkep no-underline hover:text-sinyal"
                    >
                      {icerik.title}
                    </Link>
                    <span className="ml-2 font-mono text-xs text-murekkep-2">/{icerik.slug}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{turEtiketi(icerik.type)}</td>
                  <td className="px-4 py-3">
                    <DurumRozeti durum={icerik.status} />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-murekkep-2">
                    {tarih(icerik.updatedAt)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-murekkep-2">
                    {icerik.publishedAt !== null ? tarih(icerik.publishedAt) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
