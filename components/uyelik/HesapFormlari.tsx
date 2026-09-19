'use client';

import { useState, useTransition } from 'react';
import { UyelikAlani, UyelikFormu } from '@/components/uyelik/UyelikFormu';
import { oturumTazele } from '@/lib/site/oturum-durumu';
import { dogrulamaYenidenGonder, hesabiGuncelle, uyeCikis } from '@/lib/site/uyelik-eylemleri';
import { useRouter } from 'next/navigation';

/** Görünen ad güncelleme. Başka hiçbir alan buradan değiştirilemez. */
export function BilgiFormu({ adSoyad }: { adSoyad?: string }) {
  return (
    <UyelikFormu eylem={hesabiGuncelle} baslik="Bilgilerim" dugmeMetni="Kaydet">
      {(alanHatasi) => (
        <UyelikAlani
          ad="adSoyad"
          etiket="Ad soyad"
          otomatik="name"
          zorunlu={false}
          varsayilan={adSoyad}
          hata={alanHatasi('adSoyad')}
        />
      )}
    </UyelikFormu>
  );
}

/**
 * Doğrulama mektubunu yeniden ister.
 *
 * Sonuç iletisi gönderim durumunu DÜRÜSTÇE söyler: e-posta sağlayıcısı
 * yapılandırılmadıysa "gönderildi" demez.
 */
export function DogrulamaDugmesi() {
  const [ileti, setIleti] = useState<string>();
  const [hata, setHata] = useState<string>();
  const [bekliyor, baslat] = useTransition();

  return (
    <div className="rounded-xl border border-uyari/30 bg-uyari/8 px-4 py-3.5">
      <p className="text-sm text-metin">E-posta adresin doğrulanmadı.</p>
      <p className="mt-1 text-xs leading-relaxed text-metin-ikincil">
        Doğrulama, hesabın gerçekten sana ait olduğunu gösterir ve bülten gönderiminin koşuludur.
      </p>

      {ileti && (
        <p role="status" className="mt-2.5 text-xs text-metin-ikincil">
          {ileti}
        </p>
      )}
      {hata && (
        <p role="alert" className="mt-2.5 text-xs text-tehlike">
          {hata}
        </p>
      )}

      <button
        type="button"
        disabled={bekliyor}
        onClick={() =>
          baslat(async () => {
            const sonuc = await dogrulamaYenidenGonder();
            if (sonuc.tamam) {
              setHata(undefined);
              setIleti(sonuc.ileti);
            } else {
              setIleti(undefined);
              setHata(sonuc.hata);
            }
          })
        }
        className="mt-3 inline-flex h-8 items-center rounded-full border border-kenar-guclu px-3.5 text-xs font-medium text-metin transition-colors hover:border-vurgu disabled:opacity-60"
      >
        {bekliyor ? 'Gönderiliyor…' : 'Doğrulama bağlantısı gönder'}
      </button>
    </div>
  );
}

/** Oturumu kapatır ve ana sayfaya döner. */
export function CikisDugmesi() {
  const [bekliyor, baslat] = useTransition();
  const yonlendirici = useRouter();

  return (
    <button
      type="button"
      disabled={bekliyor}
      onClick={() =>
        baslat(async () => {
          const sonuc = await uyeCikis();
          // Başlık statik düzenin altında; oturumu kendi deposundan okuyor.
          oturumTazele();
          yonlendirici.push(sonuc.tamam ? (sonuc.veri?.yol ?? '/') : '/');
          yonlendirici.refresh();
        })
      }
      className="text-sm text-metin-ikincil underline underline-offset-4 transition-colors hover:text-metin disabled:opacity-60"
    >
      {bekliyor ? 'Çıkılıyor…' : 'Çıkış yap'}
    </button>
  );
}
