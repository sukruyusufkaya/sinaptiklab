import { denetimYaz, type DenetimEylemi } from '@/lib/yetki/denetim';
import { istemciAdresi } from '@/lib/yetki/oran-sinirlama';
import { oturumKullanicisi, YetkiHatasi, type OturumKullanicisi } from '@/lib/yetki/oturum';
import type { Izin } from '@/lib/yetki/roller';
import { izinVarMi } from '@/lib/yetki/roller';

/**
 * Server Action koruma sarmalayıcısı.
 *
 * NEDEN GEREKLİ — bu, panelin en kritik güvenlik kararıdır:
 *
 * Next.js App Router'da bir Server Action isteği `Next-Action` başlığıyla
 * gönderilir ve Next önce EYLEMİ çalıştırır, sonra sayfayı/layout'u yeniden
 * render eder. Bu yüzden `app/(admin)/layout.tsx` içindeki bir
 * `redirect('/admin/giris')` eylemin çalışmasını ENGELLEMEZ — yalnızca
 * sonrasında dönen HTML'i değiştirir. Yan etki (veritabanı yazması, yayın,
 * silme) o noktada çoktan gerçekleşmiştir.
 *
 * Aynı şekilde `proxy.ts` de yeterli değildir: çerez varlığını kontrol
 * etmek kimliği doğrulamaz ve eylem kimliği herhangi bir rotadan çağrılabilir.
 *
 * Sonuç: yetki kontrolü HER eylemin ilk satırında yapılmak zorundadır. Bunu
 * unutulabilir bir kural olmaktan çıkarmak için tüm eylemler bu sarmalayıcıdan
 * geçer; ham `isleyici` dışa açılmaz.
 */

export type EylemSonucu<T = undefined> =
  | { tamam: true; veri?: T; ileti?: string }
  | { tamam: false; hata: string; kod?: string; alanHatalari?: Record<string, string> };

export function basarili<T>(veri?: T, ileti?: string): EylemSonucu<T> {
  return { tamam: true, veri, ileti };
}

export function basarisiz<T = undefined>(
  hata: string,
  ek?: { kod?: string; alanHatalari?: Record<string, string> },
): EylemSonucu<T> {
  return { tamam: false, hata, kod: ek?.kod, alanHatalari: ek?.alanHatalari };
}

/** Eylem gövdesine geçirilen bağlam. */
export type EylemBaglami = {
  kullanici: OturumKullanicisi;
  adres: string;
  /** Denetim kaydı yazar; eylem türü ve belge bilgisi burada verilir. */
  kaydet: (girdi: {
    eylem: DenetimEylemi;
    koleksiyon: string;
    belgeKimligi?: string;
    belgeSlug?: string;
    degisenAlanlar?: string[];
    oncekiDurum?: string;
    yeniDurum?: string;
    not?: string;
  }) => Promise<void>;
};

/**
 * Korumalı eylem üretir.
 *
 * @param izin    Eylemin gerektirdiği izin. Nesne düzeyindeki kontrol
 *                (sahiplik, rol yükseltmesi) eylem gövdesinde `nesneYetkisi`
 *                ve `rolAtamaKarari` ile ayrıca yapılır — bu sarmalayıcı
 *                yalnızca koleksiyon düzeyindeki kapıdır.
 * @param isleyici Asıl iş. Yalnızca yetki geçtiyse çağrılır.
 */
export function korumaliEylem<Girdi, Cikti>(
  izin: Izin,
  isleyici: (girdi: Girdi, baglam: EylemBaglami) => Promise<EylemSonucu<Cikti>>,
): (girdi: Girdi) => Promise<EylemSonucu<Cikti>> {
  return async (girdi: Girdi) => {
    let kullanici: OturumKullanicisi | null = null;

    try {
      kullanici = await oturumKullanicisi();

      if (!kullanici) {
        return basarisiz<Cikti>('Oturumunuz sona ermiş. Yeniden giriş yapın.', {
          kod: 'oturum-yok',
        });
      }

      if (!izinVarMi(kullanici.roller, izin)) {
        const adres = await istemciAdresi();
        await denetimYaz({
          eylem: 'guncelle',
          koleksiyon: '-',
          kullanici,
          adres,
          basarili: false,
          not: `Yetkisiz eylem denemesi: ${izin}`,
        });
        return basarisiz<Cikti>('Bu işlem için yetkiniz yok.', { kod: 'izin-yok' });
      }

      const adres = await istemciAdresi();
      const onaylanmis = kullanici;

      return await isleyici(girdi, {
        kullanici: onaylanmis,
        adres,
        kaydet: (kayit) => denetimYaz({ ...kayit, kullanici: onaylanmis, adres }),
      });
    } catch (hata) {
      if (hata instanceof YetkiHatasi) {
        return basarisiz<Cikti>(hata.message, { kod: hata.kod });
      }

      // Beklenmeyen hata: kullanıcıya iç ayrıntı SIZDIRILMAZ, sunucuya yazılır.
      console.error(`[eylem:${izin}] beklenmeyen hata:`, hata);
      return basarisiz<Cikti>('İşlem tamamlanamadı. Sorun sürerse teknik ekibe bildirin.', {
        kod: 'beklenmeyen',
      });
    }
  };
}

/**
 * Yalnızca oturum isteyen, izin gerektirmeyen eylemler (çıkış, kendi parolasını
 * değiştirme gibi).
 */
export function oturumluEylem<Girdi, Cikti>(
  isleyici: (girdi: Girdi, baglam: EylemBaglami) => Promise<EylemSonucu<Cikti>>,
): (girdi: Girdi) => Promise<EylemSonucu<Cikti>> {
  return async (girdi: Girdi) => {
    try {
      const kullanici = await oturumKullanicisi();
      if (!kullanici) {
        return basarisiz<Cikti>('Oturumunuz sona ermiş. Yeniden giriş yapın.', {
          kod: 'oturum-yok',
        });
      }

      const adres = await istemciAdresi();
      return await isleyici(girdi, {
        kullanici,
        adres,
        kaydet: (kayit) => denetimYaz({ ...kayit, kullanici, adres }),
      });
    } catch (hata) {
      if (hata instanceof YetkiHatasi) {
        return basarisiz<Cikti>(hata.message, { kod: hata.kod });
      }
      console.error('[oturumlu-eylem] beklenmeyen hata:', hata);
      return basarisiz<Cikti>('İşlem tamamlanamadı.', { kod: 'beklenmeyen' });
    }
  };
}
