// /bulten — bülten arşivi (BRIEF §2.2 + §10). Sayılar `issue` türünde
// içeriklerdir; henüz yayın yok, sayfa dürüst "hazırlanıyor" durumunu
// gösterir ve tek kayıt yolunu (Faz 7 çift opt-in) anlatır.
import type { Metadata } from "next";
import { IcerikKarti } from "@/components/content/IcerikKarti";
import { yayindakiIcerikListesi } from "@/lib/db/queries/contents";
import type { IcerikOzetDTO } from "@/lib/db/queries/dto";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Sinaptik Sinyal — bülten arşivi",
  description:
    "Sinaptiklab bülteni Sinaptik Sinyal'in arşivi: yeni içerikler, güncellenen ölçümler ve Türkçe yapay zeka ekosisteminden kaynaklı notlar.",
  alternates: { canonical: `${env.NEXT_PUBLIC_SITE_URL}/bulten` },
};

export default async function BultenArsiviSayfasi() {
  let sayilar: IcerikOzetDTO[] = [];
  try {
    sayilar = await yayindakiIcerikListesi({ type: "issue", adet: 50 });
  } catch {
    sayilar = [];
  }

  return (
    <>
      <section className="ekran relative overflow-hidden border-b border-doku">
        <div className="ekran-izgara">
          <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-14">
            <p className="bolum-indeks uppercase">§ bülten</p>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-murekkep [font-stretch:94%]">
              Sinaptik Sinyal
            </h1>
            <p className="mt-4 max-w-[var(--govde-olcu)] leading-relaxed text-murekkep-2">
              Ayda iki kez: yeni derinlemesine içerikler, güncellenen ölçümler ve Türkçe yapay zeka
              ekosisteminden kaynaklı notlar. Her sayı bu arşivde kalıcı adresiyle yayınlanır.
            </p>
            <div className="veri-rayi mt-7 max-w-md">
              <div>
                yayınlanan sayı
                <br />
                <span className="deger">{sayilar.length}</span>
              </div>
              <div>
                sıklık
                <br />
                <span className="deger">ayda iki</span>
              </div>
              <div>
                kayıt
                <br />
                <span className="deger">yakında</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-12">
        {sayilar.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sayilar.map((sayi, sira) => (
              <li key={sayi.id} className="min-w-0">
                <IcerikKarti icerik={sayi} sira={sira + 1} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="max-w-[var(--govde-olcu)] border border-doku rounded-lg bg-kagit-alt p-6">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-murekkep-2">
              arşiv boş
            </p>
            <p className="mt-3 leading-relaxed text-murekkep-2">
              İlk sayı henüz yayınlanmadı. Bülten kaydı, KVKK uyumlu çift onaylı altyapıyla birlikte
              açılacak; o güne kadar yeni içerikleri <a href="/feed.xml">RSS akışından</a> takip
              edebilirsiniz.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
