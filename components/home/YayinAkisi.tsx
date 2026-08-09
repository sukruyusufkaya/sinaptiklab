import Link from "next/link";
import type { CSSProperties } from "react";
import { IcerikKarti } from "@/components/content/IcerikKarti";
import type { IcerikOzetDTO } from "@/lib/db/queries/dto";
import { icerikYolu, seviyeEtiketi, turEtiketi } from "@/lib/rotalar";

const TARIH_TR = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" });

/**
 * Editoryal bento: en yeni yayın "manşet" muamelesi görür (iri başlık,
 * tam dek, ölçüm rayı), kalanlar standart kartlarla akar. Eşit ızgara
 * yerine hiyerarşi — hangi içeriğin öne çıktığı görülür.
 *
 * IZGARA SÖZLEŞMESİ: 3 kolonda manşet 2×2 hücre kaplar, geriye 5 hücre
 * kalır. Çağıran taraf TAM 6 yayın vermelidir; fazlası eksik satır bırakır.
 */
export function YayinAkisi({ yayinlar }: { yayinlar: IcerikOzetDTO[] }) {
  const [mansetIcerik, ...digerleri] = yayinlar;
  if (!mansetIcerik) return null;

  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-3">
      {/* Manşet — iki kolon, iki satır */}
      <article className="centik kademe group relative flex flex-col justify-between border border-doku bg-kagit-alt lg:col-span-2 lg:row-span-2">
        <div className="flex items-baseline justify-between border-b border-doku px-5 py-2.5 font-mono text-[0.65rem] uppercase tracking-[0.18em]">
          <span className="flex items-center gap-2 text-sinyal">
            <span aria-hidden className="led inline-block size-1.5 bg-sinyal" />
            en son yayın
          </span>
          <span className="text-murekkep-2">{turEtiketi(mansetIcerik.type)}</span>
        </div>

        <div className="flex flex-1 flex-col p-6 sm:p-8">
          <h3 className="max-w-[22ch] font-display text-3xl font-bold leading-[1.08] tracking-tight [font-stretch:94%]">
            <Link
              href={icerikYolu(mansetIcerik.type, mansetIcerik.slug)}
              className="text-murekkep no-underline transition-colors hover:text-sinyal"
            >
              {mansetIcerik.title}
            </Link>
          </h3>
          <p className="mt-4 max-w-[52ch] leading-relaxed text-murekkep-2">{mansetIcerik.dek}</p>

          <div className="veri-rayi mt-auto pt-8">
            <div>
              seviye
              <br />
              <span className="deger">{seviyeEtiketi(mansetIcerik.level)}</span>
            </div>
            <div>
              okuma
              <br />
              <span className="deger">{mansetIcerik.readingMinutes} dk</span>
            </div>
            <div>
              yayın
              <br />
              <span className="deger">
                {TARIH_TR.format(new Date(mansetIcerik.publishedAt ?? mansetIcerik.updatedAt))}
              </span>
            </div>
          </div>
        </div>
      </article>

      {/* Kalanlar — sağ kolon ve altta akan kartlar */}
      {digerleri.map((yayin, sira) => (
        <div key={yayin.id} className="kademe min-w-0" style={{ "--k": sira + 1 } as CSSProperties}>
          <IcerikKarti icerik={yayin} sira={sira + 2} />
        </div>
      ))}
    </div>
  );
}
