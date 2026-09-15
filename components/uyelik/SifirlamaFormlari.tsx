'use client';

import { UyelikAlani, UyelikFormu } from '@/components/uyelik/UyelikFormu';
import { parolaSifirla, parolaSifirlamaIste } from '@/lib/site/uyelik-eylemleri';

/**
 * Parola sıfırlama — iki aşama, iki form.
 *
 * Aşama 1 (anahtar yok): adres istenir, bağlantı gönderilir.
 * Aşama 2 (anahtar var): yeni parola belirlenir.
 *
 * Aşama 1'in iletisi adresin kayıtlı olup olmadığını SÖYLEMEZ; sunucu tarafı
 * her iki durumda aynı yanıtı döner.
 */

export function SifirlamaTalebiFormu() {
  return (
    <UyelikFormu
      eylem={parolaSifirlamaIste}
      baslik="Parola sıfırlama"
      dugmeMetni="Bağlantı gönder"
      basaridaTemizle
      altBilgi={
        <p className="mt-4 text-[0.6875rem] leading-relaxed text-metin-soluk">
          Güvenlik gereği, adresin kayıtlı olup olmadığı bildirilmez.
        </p>
      }
    >
      {(alanHatasi) => (
        <UyelikAlani
          ad="eposta"
          etiket="E-posta"
          tur="email"
          otomatik="email"
          hata={alanHatasi('eposta')}
        />
      )}
    </UyelikFormu>
  );
}

export function YeniParolaFormu({ anahtar }: { anahtar: string }) {
  return (
    <UyelikFormu
      eylem={parolaSifirla}
      baslik="Yeni parola"
      dugmeMetni="Parolayı değiştir"
      altBilgi={
        <p className="mt-4 text-[0.6875rem] leading-relaxed text-metin-soluk">
          Parola değişince açık olan tüm oturumlar kapatılır.
        </p>
      }
    >
      {(alanHatasi) => (
        <>
          <input type="hidden" name="anahtar" value={anahtar} />
          <UyelikAlani
            ad="parola"
            etiket="Yeni parola"
            tur="password"
            otomatik="new-password"
            ipucu="En az 12 karakter."
            hata={alanHatasi('parola')}
          />
        </>
      )}
    </UyelikFormu>
  );
}
