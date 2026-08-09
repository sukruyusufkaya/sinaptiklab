import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { PanelBasligi } from "@/components/admin/PanelBasligi";
import {
  AZ_KAYNAK_ESIGI,
  bakimRaporu,
  type BakimIcerikSatiri,
  type TurDagilimi,
} from "@/lib/db/queries/admin-ek";
import { DURUM_ETIKETLERI, type Durum } from "@/lib/editorial/durum-makinesi";
import { turEtiketi } from "@/lib/rotalar";

// Bakım paneli (BRIEF §11 "çürüyen içerik listesi" + §7.3 "yetim sayfa").
// Sorgular önbelleksiz; sayfa her istekte taze ölçüm alır.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Bakım" };

const TARIH_TR = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" });

const DURUM_SIRASI = [
  "published",
  "in_review",
  "scheduled",
  "draft",
  "archived",
] as const satisfies readonly Durum[];

interface ListeProps {
  /** Başlık id'si (aria-labelledby) — boşluksuz ASCII. */
  kimlik: string;
  indeks: string;
  baslik: string;
  aciklama: ReactNode;
  satirlar: BakimIcerikSatiri[];
  olcumBasligi: string;
  olcum: (satir: BakimIcerikSatiri) => ReactNode;
  bosMesaj: string;
}

function BakimListesi({
  kimlik,
  indeks,
  baslik,
  aciklama,
  satirlar,
  olcumBasligi,
  olcum,
  bosMesaj,
}: ListeProps) {
  return (
    <section aria-labelledby={kimlik} className="mt-10">
      <p className="bolum-indeks uppercase">§ {indeks}</p>
      <h2 id={kimlik} className="mt-2 font-display text-xl font-bold">
        {baslik}{" "}
        <span className="font-mono text-sm font-normal tabular-nums text-murekkep-2">
          ({satirlar.length})
        </span>
      </h2>
      <p className="mt-2 max-w-[var(--govde-olcu)] text-sm leading-relaxed text-murekkep-2">
        {aciklama}
      </p>

      {satirlar.length === 0 ? (
        <p className="mt-4 border border-onay rounded-lg p-4 font-mono text-xs text-onay">
          ✓ {bosMesaj}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto border border-doku rounded-md">
          <table className="w-full min-w-[42rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-doku bg-kagit-alt text-left font-mono text-[0.65rem] uppercase tracking-[0.18em] text-murekkep-2">
                <th scope="col" className="px-4 py-2.5 font-normal">
                  İçerik
                </th>
                <th scope="col" className="w-28 px-4 py-2.5 font-normal">
                  Tür
                </th>
                <th scope="col" className="w-52 px-4 py-2.5 font-normal">
                  {olcumBasligi}
                </th>
              </tr>
            </thead>
            <tbody>
              {satirlar.map((satir) => (
                <tr
                  key={satir.id}
                  className="border-b border-doku transition-colors last:border-b-0 hover:bg-kagit-alt"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/icerik/${satir.id}`}
                      className="font-medium text-murekkep no-underline hover:text-sinyal"
                    >
                      {satir.title}
                    </Link>
                    <span className="mt-0.5 block font-mono text-[0.65rem] text-murekkep-2">
                      {satir.yol}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{turEtiketi(satir.type)}</td>
                  <td className="px-4 py-3">{olcum(satir)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function DagilimTablosu({ dagilim }: { dagilim: TurDagilimi[] }) {
  return (
    <div className="mt-4 overflow-x-auto border border-doku rounded-md">
      <table className="w-full min-w-[42rem] border-collapse text-sm">
        <caption className="sr-only">İçerik türlerinin durum bazında dağılımı</caption>
        <thead>
          <tr className="border-b border-doku bg-kagit-alt text-left font-mono text-[0.65rem] uppercase tracking-[0.18em] text-murekkep-2">
            <th scope="col" className="px-4 py-2.5 font-normal">
              Tür
            </th>
            <th scope="col" className="w-20 px-4 py-2.5 text-right font-normal">
              Toplam
            </th>
            {DURUM_SIRASI.map((durum) => (
              <th key={durum} scope="col" className="w-24 px-4 py-2.5 text-right font-normal">
                {DURUM_ETIKETLERI[durum]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dagilim.map((satir) => (
            <tr key={satir.type} className="border-b border-doku last:border-b-0">
              <th scope="row" className="px-4 py-2.5 text-left font-mono text-xs font-normal">
                {turEtiketi(satir.type)}
              </th>
              <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums text-murekkep">
                {satir.toplam}
              </td>
              {DURUM_SIRASI.map((durum) => {
                const adet = satir.durumlar[durum];
                return (
                  <td
                    key={durum}
                    className={`px-4 py-2.5 text-right font-mono text-xs tabular-nums ${
                      adet === 0
                        ? "text-doku"
                        : durum === "published"
                          ? "text-onay"
                          : "text-murekkep-2"
                    }`}
                  >
                    {adet}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function BakimPaneli() {
  const rapor = await bakimRaporu();

  return (
    <>
      <PanelBasligi
        indeks="bakım denetimi"
        baslik="Bakım"
        aciklama={
          <>
            Yayındaki içeriğin sağlık taraması: doğrulama yaşı (BRIEF §11), kaynak yoğunluğu ve iç
            link kapsaması (§7.3). Ölçümler her sayfa açılışında yeniden hesaplanır — önbellek yok.
          </>
        }
      >
        <div className="veri-rayi mt-7 max-w-3xl bg-kagit">
          <div>
            yayında
            <br />
            <span className="deger tabular-nums">{rapor.yayinSayisi}</span>
          </div>
          <div>
            çürüyen &gt;{rapor.esikGun}g
            <br />
            <span
              className={`deger tabular-nums ${rapor.curuyen.length > 0 ? "text-uyari" : "text-onay"}`}
            >
              {rapor.curuyen.length}
            </span>
          </div>
          <div>
            az kaynak
            <br />
            <span
              className={`deger tabular-nums ${rapor.azKaynak.length > 0 ? "text-olcum" : "text-onay"}`}
            >
              {rapor.azKaynak.length}
            </span>
          </div>
          <div>
            yetim sayfa
            <br />
            <span
              className={`deger tabular-nums ${rapor.yetim.length > 0 ? "text-uyari" : "text-onay"}`}
            >
              {rapor.yetim.length}
            </span>
          </div>
          <div>
            toplam kayıt
            <br />
            <span className="deger tabular-nums">{rapor.toplamIcerik}</span>
          </div>
        </div>
      </PanelBasligi>

      <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-8">
        <BakimListesi
          kimlik="bolum-curuyen"
          indeks="çürüyen içerik"
          baslik="Çürüyen içerik"
          aciklama={`Son veri doğrulaması ${rapor.esikGun} günden eski yayınlar; en eskiden yeniye. Kaynakları yeniden okuyup lastVerifiedAt alanını güncelleyin.`}
          satirlar={rapor.curuyen}
          olcumBasligi="Doğrulama yaşı"
          olcum={(satir) => (
            <span className="font-mono text-xs">
              <span className="text-uyari tabular-nums">{satir.yasGun} gün</span>
              <span className="ml-2 text-murekkep-2">
                ({TARIH_TR.format(new Date(satir.lastVerifiedAt))})
              </span>
            </span>
          )}
          bosMesaj={`Tüm yayınlar son ${rapor.esikGun} gün içinde doğrulanmış.`}
        />

        <div className="spektrum mt-10" aria-hidden />

        <section aria-labelledby="bolum-dagilim" className="mt-10">
          <p className="bolum-indeks uppercase">§ envanter dağılımı</p>
          <h2 id="bolum-dagilim" className="mt-2 font-display text-xl font-bold">
            Tür ve durum dağılımı
          </h2>
          <p className="mt-2 max-w-[var(--govde-olcu)] text-sm leading-relaxed text-murekkep-2">
            Tüm kayıtlar (taslak dahil) tür kırılımında; hangi türde ne kadar iş bittiğini ve nerede
            yığılma olduğunu gösterir.
          </p>
          {rapor.dagilim.length === 0 ? (
            <p className="mt-4 border border-doku rounded-lg bg-kagit-alt p-4 text-murekkep-2">
              Henüz içerik yok.
            </p>
          ) : (
            <DagilimTablosu dagilim={rapor.dagilim} />
          )}
        </section>

        <div className="spektrum mt-10" aria-hidden />

        <BakimListesi
          kimlik="bolum-az-kaynak"
          indeks="kalite riski"
          baslik="Az kaynaklı yayınlar"
          aciklama={`Kaynak sayısı ${AZ_KAYNAK_ESIGI}'den az olan yayınlar. Yayın kuralı en az 1 kaynak ister ama tek kaynağa dayanan iddia "saha verisi, uydurma yok" çıtasını karşılamaz.`}
          satirlar={rapor.azKaynak}
          olcumBasligi="Kaynak sayısı"
          olcum={(satir) => (
            <span className="font-mono text-xs tabular-nums text-olcum">
              {satir.kaynakSayisi} kaynak
            </span>
          )}
          bosMesaj={`Her yayında en az ${AZ_KAYNAK_ESIGI} kaynak var.`}
        />

        <div className="spektrum mt-10" aria-hidden />

        <BakimListesi
          kimlik="bolum-yetim"
          indeks="yetim sayfa"
          baslik="Yetim sayfalar"
          aciklama="Diğer yayınların gövdesinden hiç iç link almayan yayınlar (BRIEF §7.3). İlgili içeriklerden bağlam içinde link verin — hem tarama hem okuyucu için."
          satirlar={rapor.yetim}
          olcumBasligi="Gelen iç link"
          olcum={() => <span className="font-mono text-xs tabular-nums text-uyari">0 link</span>}
          bosMesaj="Her yayına en az bir iç link geliyor."
        />

        <p className="mt-10 font-mono text-xs text-murekkep-2">
          İç link taraması gövde metninde <code>/tür/slug</code> geçişlerini sayar; yalnız yayında
          olan içerikler hem kaynak hem hedef olarak dikkate alınır (kendine link sayılmaz).
        </p>
      </div>
    </>
  );
}
