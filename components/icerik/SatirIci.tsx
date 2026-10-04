import { Fragment } from 'react';

/**
 * Blok metnindeki satır içi vurguyu (`**kalın**`) basar.
 *
 * Gövde HTML string taşımaz (bkz. `MetinGovdesi`); vurgu bu yüzden metnin
 * içinde tek bir işaretle durur ve burada `<strong>`a çevrilir. Yalnızca bu
 * işaret tanınır — bağlantı, italik ya da HTML yorumlanmaz; böylece panelden
 * yazılan metin işaretlemeye dönüşüp sayfayı bozamaz.
 *
 * Kapanmamış `**` düz metin olarak kalır.
 */
export function SatirIci({ metin }: { metin: string }) {
  const parcalar = metin.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parcalar.map((parca, sira) =>
        parca.startsWith('**') && parca.endsWith('**') && parca.length > 4 ? (
          <strong key={sira} className="font-semibold text-metin">
            {parca.slice(2, -2)}
          </strong>
        ) : (
          <Fragment key={sira}>{parca}</Fragment>
        ),
      )}
    </>
  );
}
