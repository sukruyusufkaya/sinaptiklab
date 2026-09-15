'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Onay } from '@/components/arayuz/Ikonlar';
import { ayarKaydet, siteyiTazeleEylemi } from '@/lib/admin/ayar-eylemleri';

export type AyarGorunumu = {
  anahtar: string;
  ad: string;
  tip: 'mantik' | 'metin';
  aciklama: string;
  deger: unknown;
};

export function AyarlarFormu({ ayarlar }: { ayarlar: AyarGorunumu[] }) {
  const [hata, setHata] = useState<string>();
  const [ileti, setIleti] = useState<string>();
  const [bekliyor, baslat] = useTransition();
  const yonlendirici = useRouter();

  function kaydet(veri: FormData) {
    setHata(undefined);
    setIleti(undefined);
    baslat(async () => {
      const sonuc = await ayarKaydet({ veri });
      if (sonuc.tamam) {
        setIleti(sonuc.ileti);
        yonlendirici.refresh();
      } else {
        setHata(sonuc.hata);
      }
    });
  }

  function tazele() {
    setHata(undefined);
    setIleti(undefined);
    baslat(async () => {
      const sonuc = await siteyiTazeleEylemi(undefined);
      if (sonuc.tamam) setIleti(sonuc.ileti);
      else setHata(sonuc.hata);
    });
  }

  return (
    <div className="space-y-4">
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
          className="flex items-center gap-2 rounded-lg border border-basari/35 bg-basari/10 px-4 py-3 text-sm text-basari"
        >
          <Onay className="size-4 shrink-0" />
          {ileti}
        </p>
      )}

      <form action={kaydet} className="space-y-4">
        <div className="divide-y divide-kenar-soluk overflow-hidden rounded-xl border border-kenar">
          {ayarlar.map((ayar) => (
            <div key={ayar.anahtar} className="bg-yuzey/30 px-4 py-3.5">
              <label
                htmlFor={`ayar-${ayar.anahtar}`}
                className="flex flex-wrap items-baseline gap-x-2 gap-y-1"
              >
                <span className="text-sm font-medium text-metin">{ayar.ad}</span>
                <code className="font-mono text-[0.6875rem] text-metin-soluk">{ayar.anahtar}</code>
              </label>
              <p className="mt-1 text-xs leading-relaxed text-metin-soluk">{ayar.aciklama}</p>

              <div className="mt-2.5">
                {ayar.tip === 'mantik' ? (
                  <label className="flex items-center gap-2 text-sm text-metin-ikincil">
                    <input
                      id={`ayar-${ayar.anahtar}`}
                      type="checkbox"
                      name={ayar.anahtar}
                      defaultChecked={Boolean(ayar.deger)}
                      className="size-4 accent-[var(--vurgu)]"
                    />
                    Açık
                  </label>
                ) : (
                  <input
                    id={`ayar-${ayar.anahtar}`}
                    type="text"
                    name={ayar.anahtar}
                    defaultValue={typeof ayar.deger === 'string' ? ayar.deger : ''}
                    className="h-10 w-full rounded-lg border border-kenar bg-zemin px-3 text-sm text-metin outline-none transition-colors focus:border-vurgu"
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={bekliyor}
            className="inline-flex h-10 items-center rounded-lg bg-vurgu px-5 text-sm font-medium text-white transition-colors hover:bg-vurgu-parlak disabled:opacity-60"
          >
            {bekliyor ? 'Kaydediliyor…' : 'Ayarları kaydet'}
          </button>

          <button
            type="button"
            onClick={tazele}
            disabled={bekliyor}
            className="rounded-lg border border-kenar px-4 py-2 text-sm text-metin-ikincil transition-colors hover:border-vurgu hover:text-metin disabled:opacity-50"
          >
            Siteyi tazele
          </button>
        </div>
      </form>

      <p className="text-xs leading-relaxed text-metin-soluk">
        &quot;Siteyi tazele&quot; tüm sayfaların önbelleğini boşaltır. Toplu bir veri
        değişikliğinden sonra kullanın; tek içerik yayımlarken gerekmez — o yol kendiliğinden
        tazelenir.
      </p>
    </div>
  );
}
