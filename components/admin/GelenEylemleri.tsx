'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { aramaIncelemesiniIsaretle, formDurumunuDegistir } from '@/lib/admin/gelen-eylemleri';
import { ISLEM_DURUMLARI, ISLEM_DURUMU_ADI, type IslemDurumu } from '@/lib/admin/gelen-sabitleri';

/**
 * Toplanan veri ekranlarının tek tıklık iş akışı düğmeleri.
 *
 * Bu ekranlar SALT OKUNURDUR; kullanıcı girdisi editör tarafından
 * düzeltilmez. Değişebilen tek şey editoryal damgadır: form kaydının işlem
 * durumu ve arama sorgusunun incelenmişliği. Asıl yetki kontrolü sunucuda,
 * `korumaliEylem` içinde yapılır — buradaki düğmeyi gizlemek bir koruma
 * değildir.
 *
 * Durum güncellemesi `useTransition` ile yapılır; effect içinde `setState`
 * yoktur (CLAUDE.md §3).
 */

const DUGME = 'rounded-full border px-2.5 py-1 text-xs transition-colors disabled:cursor-default';

export function IslemDurumuDugmeleri({ kimlik, mevcut }: { kimlik: string; mevcut: string }) {
  const [durum, setDurum] = useState(mevcut);
  const [hata, setHata] = useState<string>();
  const [bekliyor, baslat] = useTransition();
  const yonlendirici = useRouter();

  function degistir(yeni: IslemDurumu) {
    setHata(undefined);
    baslat(async () => {
      const sonuc = await formDurumunuDegistir({ kimlik, islemDurumu: yeni });
      if (sonuc.tamam) {
        setDurum(yeni);
        yonlendirici.refresh();
      } else {
        setHata(sonuc.hata);
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {ISLEM_DURUMLARI.map((secenek) => {
        const etkin = durum === secenek;
        return (
          <button
            key={secenek}
            type="button"
            disabled={bekliyor || etkin}
            onClick={() => degistir(secenek)}
            aria-pressed={etkin}
            className={`${DUGME} ${
              etkin
                ? 'border-vurgu/45 bg-vurgu-zemin text-vurgu-parlak'
                : 'border-kenar text-metin-ikincil hover:border-kenar-guclu hover:text-metin'
            }`}
          >
            {ISLEM_DURUMU_ADI[secenek]}
          </button>
        );
      })}
      {hata && <span className="text-xs text-tehlike">{hata}</span>}
    </div>
  );
}

export function IncelemeDugmesi({ kimlik, inceledi }: { kimlik: string; inceledi: boolean }) {
  const [isaretli, setIsaretli] = useState(inceledi);
  const [hata, setHata] = useState<string>();
  const [bekliyor, baslat] = useTransition();
  const yonlendirici = useRouter();

  function cevir() {
    setHata(undefined);
    baslat(async () => {
      const sonuc = await aramaIncelemesiniIsaretle({ kimlik, inceledi: !isaretli });
      if (sonuc.tamam) {
        setIsaretli(!isaretli);
        yonlendirici.refresh();
      } else {
        setHata(sonuc.hata);
      }
    });
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={bekliyor}
        onClick={cevir}
        aria-pressed={isaretli}
        className={`${DUGME} ${
          isaretli
            ? 'border-basari/45 text-basari'
            : 'border-kenar text-metin-soluk hover:border-kenar-guclu hover:text-metin'
        }`}
      >
        {isaretli ? 'incelendi' : 'incelendi işaretle'}
      </button>
      {hata && <span className="text-xs text-tehlike">{hata}</span>}
    </span>
  );
}
