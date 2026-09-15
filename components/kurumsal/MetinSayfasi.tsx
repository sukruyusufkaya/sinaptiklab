import Link from 'next/link';
import type { ReactNode } from 'react';
import { SayfaBasligi } from '@/components/arayuz/SayfaBasligi';
import { IcerikDuzeni } from '@/components/icerik/IcerikDuzeni';
import { IcindekilerTablosu, IlgiliBaglantilar } from '@/components/icerik/IcerikKenari';
import { tarihUzun } from '@/lib/bicim';

export type MetinBolumu = {
  kimlik: string;
  baslik: string;
  paragraflar?: string[];
  liste?: string[];
  tablo?: { basliklar: string[]; satirlar: string[][] };
};

/**
 * Politika, ilke ve kurumsal metin sayfalarının ortak şablonu.
 * Yapı tek yerde durduğu için tüm politika sayfaları aynı ritmi korur.
 */
export function MetinSayfasi({
  etiket,
  baslik,
  ozet,
  guncelleme,
  bolumler,
  ilgili,
  ek,
}: {
  etiket: string;
  baslik: string;
  ozet: string;
  guncelleme: string;
  bolumler: MetinBolumu[];
  ilgili?: { ad: string; yol: string; not?: string }[];
  ek?: ReactNode;
}) {
  return (
    <>
      <SayfaBasligi
        kirintilar={[{ ad: baslik, yol: '#' }]}
        etiket={etiket}
        baslik={baslik}
        ozet={ozet}
        desen="nokta"
      />

      <IcerikDuzeni
        kenar={
          <>
            <IcindekilerTablosu
              basliklar={bolumler.map((bolum) => ({ kimlik: bolum.kimlik, metin: bolum.baslik }))}
            />
            <div className="rounded-xl border border-kenar bg-yuzey/40 p-5">
              <p className="etiket-mono mb-2 text-metin-soluk">Son güncelleme</p>
              <p className="text-sm text-metin-ikincil">
                <time dateTime={guncelleme}>{tarihUzun(guncelleme)}</time>
              </p>
              <p className="mt-3 border-t border-kenar-soluk pt-3 text-xs leading-relaxed text-metin-soluk">
                Metin değişmeden tarih güncellenmez. Değişiklikler bölüm bölüm izlenir.
              </p>
            </div>
            {ilgili && ilgili.length > 0 && (
              <IlgiliBaglantilar baslik="İlgili sayfalar" ogeler={ilgili} />
            )}
          </>
        }
      >
        <div className="space-y-10">
          {bolumler.map((bolum, sira) => (
            <section key={bolum.kimlik} id={bolum.kimlik} className="scroll-mt-28">
              <h2 className="flex items-baseline gap-3 text-[1.375rem] font-semibold tracking-tight sm:text-2xl">
                <span className="etiket-mono text-metin-soluk">
                  {String(sira + 1).padStart(2, '0')}
                </span>
                {bolum.baslik}
              </h2>

              {bolum.paragraflar?.map((paragraf) => (
                <p
                  key={paragraf.slice(0, 40)}
                  className="mt-4 font-serif text-[1.0625rem] leading-[1.75] text-metin-ikincil"
                >
                  {paragraf}
                </p>
              ))}

              {bolum.liste && (
                <ul className="mt-4 space-y-2.5">
                  {bolum.liste.map((madde) => (
                    <li key={madde} className="flex gap-3.5">
                      <span
                        className="mt-2.5 size-1.5 shrink-0 rounded-full bg-vurgu-sonuk"
                        aria-hidden="true"
                      />
                      <span className="font-serif text-[1.0625rem] leading-relaxed text-metin-ikincil">
                        {madde}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {bolum.tablo && (
                <div className="mt-5 overflow-x-auto rounded-xl border border-kenar">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-kenar bg-yuzey/50">
                        {bolum.tablo.basliklar.map((baslikHucre) => (
                          <th
                            key={baslikHucre}
                            scope="col"
                            className="etiket-mono px-4 py-3 text-left text-metin-soluk"
                          >
                            {baslikHucre}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bolum.tablo.satirlar.map((satir, satirSira) => (
                        <tr key={satirSira} className="border-b border-kenar-soluk last:border-b-0">
                          {satir.map((hucre, hucreSira) => (
                            <td
                              key={hucreSira}
                              className={`px-4 py-3 ${hucreSira === 0 ? 'font-medium text-metin' : 'text-metin-ikincil'}`}
                            >
                              {hucre}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}
        </div>

        {ek}

        <div className="mt-12 rounded-xl border border-kenar bg-yuzey/40 p-5">
          <p className="etiket-mono mb-2 text-metin-soluk">Soru veya düzeltme</p>
          <p className="text-[0.875rem] leading-relaxed text-metin-ikincil">
            Bu metinde bir hata veya eksik görürseniz{' '}
            <Link href="/iletisim/" className="text-vurgu-parlak underline underline-offset-4">
              iletişim sayfası
            </Link>{' '}
            üzerinden bildirebilirsiniz. Düzeltmeler güncelleme geçmişine kaydedilir.
          </p>
        </div>
      </IcerikDuzeni>
    </>
  );
}
