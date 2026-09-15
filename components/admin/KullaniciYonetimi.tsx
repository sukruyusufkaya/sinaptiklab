'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Onay } from '@/components/arayuz/Ikonlar';
import {
  kullaniciDurumDegistir,
  kullaniciOlustur,
  oturumlariKapat,
  rolDegistir,
} from '@/lib/admin/kullanici-eylemleri';
import { ROL_ADI, ROL_TARIFI, ROLLER, type Rol } from '@/lib/yetki/roller';

const ALAN =
  'h-10 w-full rounded-lg border border-kenar bg-zemin px-3 text-sm text-metin outline-none transition-colors focus:border-vurgu';

export type KullaniciGorunumu = {
  kimlik: string;
  eposta: string;
  adSoyad?: string;
  roller: string[];
  durum: string;
  sonGiris?: string;
  aktifOturum: number;
  kendisiMi: boolean;
  /** Bu satır üzerinde işlem yapılabilir mi (yetki düzeyi karşılaştırması). */
  yonetilebilir: boolean;
};

export function KullaniciYonetimi({
  kullanicilar,
  atanabilirRoller,
}: {
  kullanicilar: KullaniciGorunumu[];
  atanabilirRoller: Rol[];
}) {
  const [hata, setHata] = useState<string>();
  const [ileti, setIleti] = useState<string>();
  const [alanHatalari, setAlanHatalari] = useState<Record<string, string>>({});
  const [formAcik, setFormAcik] = useState(false);
  const [bekliyor, baslat] = useTransition();
  const yonlendirici = useRouter();

  function isle(cagri: () => Promise<{ tamam: boolean; hata?: string; ileti?: string }>) {
    setHata(undefined);
    setIleti(undefined);
    baslat(async () => {
      const sonuc = await cagri();
      if (sonuc.tamam) {
        setIleti(sonuc.ileti);
        yonlendirici.refresh();
      } else {
        setHata(sonuc.hata);
      }
    });
  }

  function olustur(veri: FormData) {
    setHata(undefined);
    setIleti(undefined);
    setAlanHatalari({});
    baslat(async () => {
      const sonuc = await kullaniciOlustur({ veri });
      if (sonuc.tamam) {
        setIleti(sonuc.ileti);
        setFormAcik(false);
        yonlendirici.refresh();
      } else {
        setHata(sonuc.hata);
        setAlanHatalari(sonuc.alanHatalari ?? {});
      }
    });
  }

  return (
    <div className="space-y-5">
      {hata && (
        <p
          role="alert"
          className="rounded-lg border border-tehlike/35 bg-tehlike/10 px-4 py-3 text-sm text-tehlike"
        >
          {hata}
        </p>
      )}
      {ileti && (
        <p
          role="status"
          className="flex items-start gap-2 rounded-lg border border-basari/35 bg-basari/10 px-4 py-3 text-sm text-basari"
        >
          <Onay className="mt-0.5 size-4 shrink-0" />
          {ileti}
        </p>
      )}

      {/* Yeni kullanıcı */}
      <section className="rounded-xl border border-kenar bg-yuzey/40 p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="etiket-mono text-metin">YENİ KULLANICI</h2>
          <button
            type="button"
            onClick={() => setFormAcik((a) => !a)}
            className="rounded-lg border border-kenar px-3 py-1.5 text-xs text-metin-ikincil transition-colors hover:border-vurgu hover:text-metin"
            aria-expanded={formAcik}
          >
            {formAcik ? 'kapat' : 'ekle'}
          </button>
        </div>

        {formAcik && (
          <form action={olustur} className="mt-4 grid gap-3 sm:grid-cols-2" noValidate>
            <div>
              <label htmlFor="k-eposta" className="etiket-mono mb-1.5 block text-metin-soluk">
                E-POSTA *
              </label>
              <input id="k-eposta" name="eposta" type="email" required className={ALAN} />
              {alanHatalari.eposta && (
                <p className="mt-1 text-xs text-tehlike">{alanHatalari.eposta}</p>
              )}
            </div>

            <div>
              <label htmlFor="k-ad" className="etiket-mono mb-1.5 block text-metin-soluk">
                AD SOYAD
              </label>
              <input id="k-ad" name="adSoyad" type="text" className={ALAN} />
            </div>

            <div>
              <label htmlFor="k-rol" className="etiket-mono mb-1.5 block text-metin-soluk">
                ROL *
              </label>
              <select id="k-rol" name="rol" required defaultValue="yazar" className={ALAN}>
                {atanabilirRoller.map((rol) => (
                  <option key={rol} value={rol}>
                    {ROL_ADI[rol]}
                  </option>
                ))}
              </select>
              {alanHatalari.rol && <p className="mt-1 text-xs text-tehlike">{alanHatalari.rol}</p>}
              <p className="mt-1 text-xs leading-relaxed text-metin-soluk">
                {ROL_TARIFI[(atanabilirRoller[0] ?? 'yazar') as Rol]}
              </p>
            </div>

            <div>
              <label htmlFor="k-parola" className="etiket-mono mb-1.5 block text-metin-soluk">
                GEÇİCİ PAROLA *
              </label>
              <input
                id="k-parola"
                name="parola"
                type="text"
                required
                autoComplete="off"
                className={`${ALAN} font-mono text-xs`}
              />
              {alanHatalari.parola && (
                <p className="mt-1 text-xs text-tehlike">{alanHatalari.parola}</p>
              )}
              <p className="mt-1 text-xs leading-relaxed text-metin-soluk">
                En az 12 karakter. Güvenli bir kanaldan iletin ve kullanıcıdan ilk girişte
                değiştirmesini isteyin.
              </p>
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={bekliyor}
                className="inline-flex h-10 items-center rounded-lg bg-vurgu px-5 text-sm font-medium text-white transition-colors hover:bg-vurgu-parlak disabled:opacity-60"
              >
                {bekliyor ? 'Oluşturuluyor…' : 'Kullanıcı oluştur'}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Liste */}
      <div className="overflow-x-auto rounded-xl border border-kenar">
        <table className="w-full min-w-[46rem] border-collapse text-sm">
          <thead>
            <tr className="bg-zemin-derin">
              {['Kullanıcı', 'Rol', 'Durum', 'Son giriş', 'Oturum', 'İşlem'].map((baslik) => (
                <th
                  key={baslik}
                  scope="col"
                  className="etiket-mono border-b border-kenar px-3 py-2.5 text-left text-metin-soluk"
                >
                  {baslik}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {kullanicilar.map((k) => (
              <tr key={k.kimlik} className="border-b border-kenar-soluk last:border-0">
                <td className="px-3 py-2.5 align-top">
                  <span className="block text-metin">{k.adSoyad ?? k.eposta}</span>
                  {k.adSoyad && <span className="block text-xs text-metin-soluk">{k.eposta}</span>}
                  {k.kendisiMi && (
                    <span className="etiket-mono mt-0.5 block text-vurgu-parlak">bu sizsiniz</span>
                  )}
                </td>

                <td className="px-3 py-2.5 align-top">
                  {k.yonetilebilir && !k.kendisiMi ? (
                    <select
                      defaultValue={k.roller[0] ?? ''}
                      onChange={(o) =>
                        isle(() => rolDegistir({ kimlik: k.kimlik, roller: [o.target.value] }))
                      }
                      disabled={bekliyor}
                      aria-label={`${k.eposta} rolü`}
                      className="rounded-lg border border-kenar bg-zemin px-2 py-1 text-xs text-metin outline-none focus:border-vurgu"
                    >
                      {ROLLER.filter((r) => atanabilirRoller.includes(r)).map((rol) => (
                        <option key={rol} value={rol}>
                          {ROL_ADI[rol]}
                        </option>
                      ))}
                      {/* Mevcut rol atanabilir listede yoksa yine göster. */}
                      {k.roller[0] && !atanabilirRoller.includes(k.roller[0] as Rol) && (
                        <option value={k.roller[0]}>
                          {ROL_ADI[k.roller[0] as Rol] ?? k.roller[0]}
                        </option>
                      )}
                    </select>
                  ) : (
                    <span className="text-xs text-metin-ikincil">
                      {k.roller.map((r) => ROL_ADI[r as Rol] ?? r).join(', ') || '—'}
                    </span>
                  )}
                </td>

                <td className="px-3 py-2.5 align-top">
                  <span
                    className={`etiket-mono rounded-full border px-2 py-0.5 ${
                      k.durum === 'aktif'
                        ? 'border-basari/45 bg-basari/10 text-basari'
                        : 'border-uyari/45 bg-uyari/10 text-uyari'
                    }`}
                  >
                    {k.durum}
                  </span>
                </td>

                <td className="px-3 py-2.5 align-top font-mono text-xs whitespace-nowrap text-metin-soluk">
                  {k.sonGiris ?? '—'}
                </td>

                <td className="px-3 py-2.5 align-top font-mono text-xs tabular-nums text-metin-ikincil">
                  {k.aktifOturum}
                </td>

                <td className="px-3 py-2.5 align-top">
                  <span className="flex flex-wrap gap-1.5">
                    {k.aktifOturum > 0 && (k.yonetilebilir || k.kendisiMi) && (
                      <button
                        type="button"
                        onClick={() => isle(() => oturumlariKapat({ kimlik: k.kimlik }))}
                        disabled={bekliyor}
                        className="rounded-md border border-kenar px-2 py-1 text-[0.6875rem] text-metin-soluk transition-colors hover:border-uyari hover:text-uyari disabled:opacity-50"
                      >
                        oturumları kapat
                      </button>
                    )}
                    {k.yonetilebilir && !k.kendisiMi && (
                      <button
                        type="button"
                        onClick={() =>
                          isle(() =>
                            kullaniciDurumDegistir({
                              kimlik: k.kimlik,
                              durum: k.durum === 'aktif' ? 'askida' : 'aktif',
                            }),
                          )
                        }
                        disabled={bekliyor}
                        className={`rounded-md border px-2 py-1 text-[0.6875rem] transition-colors disabled:opacity-50 ${
                          k.durum === 'aktif'
                            ? 'border-kenar text-metin-soluk hover:border-tehlike hover:text-tehlike'
                            : 'border-basari/45 text-basari hover:bg-basari/10'
                        }`}
                      >
                        {k.durum === 'aktif' ? 'askıya al' : 'etkinleştir'}
                      </button>
                    )}
                    {!k.yonetilebilir && !k.kendisiMi && (
                      <span className="text-[0.6875rem] text-metin-soluk">yetki yetersiz</span>
                    )}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs leading-relaxed text-metin-soluk">
        Rol veya durum değiştiğinde hedefin tüm oturumları kapatılır. Kendi rolünüzü
        değiştiremezsiniz ve sistemde en az bir aktif sahip hesabı kalmak zorundadır.
      </p>
    </div>
  );
}
