// Kurumsal/yasal sayfalarda veri tablosu (veri işleyenler, hukuki sebepler,
// konu yönlendirme…). Gövde ölçüsünden geniş olabildiği için kendi yatay
// kaydırma kabını taşır: sayfa gövdesi asla yatay kaymaz.
interface Props {
  /** Ekran okuyucu için tablo özeti — görsel başlık bölüm h2'sinden gelir. */
  ozet: string;
  basliklar: readonly string[];
  satirlar: readonly (readonly string[])[];
}

export function Tablo({ ozet, basliklar, satirlar }: Props) {
  return (
    <div className="mt-5 overflow-x-auto border border-doku rounded-md">
      <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
        <caption className="sr-only">{ozet}</caption>
        <thead>
          <tr className="bg-kagit-alt">
            {basliklar.map((baslik) => (
              <th
                key={baslik}
                scope="col"
                className="border-b border-doku px-4 py-2.5 font-mono text-[0.65rem] font-normal uppercase tracking-[0.18em] text-murekkep-2"
              >
                {baslik}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {satirlar.map((satir, satirNo) => (
            <tr key={satir.join("·")} className="border-b border-doku last:border-b-0">
              {satir.map((hucre, sutunNo) => (
                <td
                  key={`${String(satirNo)}-${String(sutunNo)}`}
                  className={
                    sutunNo === 0
                      ? "px-4 py-3 align-top font-medium text-murekkep"
                      : "px-4 py-3 align-top leading-relaxed text-murekkep-2"
                  }
                >
                  {hucre}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
