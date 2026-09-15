import { ObjectId } from 'mongodb';
import { veritabani } from '@/lib/mongo/istemci';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import type { OturumKullanicisi } from '@/lib/yetki/oturum';

/**
 * Denetim kaydı — panelde yapılan her yazma işlemi buraya düşer.
 *
 * Kayıt yalnızca EKLENIR; güncelleme ve silme yolu yoktur. "Kim ne zaman neyi
 * değiştirdi" sorusunun cevabı bu koleksiyondur ve KVKK izlenebilirlik
 * yükümlülüğünün teknik karşılığıdır.
 *
 * Denetim yazımı asla ana işlemi düşürmez: kayıt başarısız olursa hata
 * yutulur ve konsola yazılır. Aksi hâlde kayıt altyapısındaki bir sorun
 * içerik kaydetmeyi engellerdi.
 */

export type DenetimEylemi =
  | 'giris'
  | 'cikis'
  | 'giris-basarisiz'
  | 'olustur'
  | 'guncelle'
  | 'durum-degistir'
  | 'sil'
  | 'yayinla'
  | 'geri-al'
  | 'rol-degistir'
  | 'parola-degistir'
  | 'disa-aktar'
  | 'kisisel-veri-sil'
  | 'yonlendirme-ekle'
  | 'medya-yukle'
  | 'medya-sil'
  | 'ayar-degistir';

export type DenetimGirdisi = {
  eylem: DenetimEylemi;
  koleksiyon: string;
  belgeKimligi?: string;
  belgeSlug?: string;
  kullanici?: OturumKullanicisi | null;
  /**
   * Oturum henüz açılmamışken (giriş anı) kullanıcı kimliği doğrudan verilir.
   * Aksi hâlde giriş kaydı kullanıcıya bağlanamaz ve "giriş geçmişi" boş görünür.
   */
  kullaniciKimligi?: string;
  /** Oturum yoksa (başarısız giriş) e-posta doğrudan verilir. */
  eposta?: string;
  adres?: string;
  degisenAlanlar?: string[];
  oncekiDurum?: string;
  yeniDurum?: string;
  not?: string;
  basarili?: boolean;
};

export async function denetimYaz(girdi: DenetimGirdisi): Promise<void> {
  try {
    const db = await veritabani();
    await db.collection(KOLEKSIYONLAR.denetimKaydi).insertOne({
      eylem: girdi.eylem,
      koleksiyon: girdi.koleksiyon,
      belgeKimligi: girdi.belgeKimligi,
      belgeSlug: girdi.belgeSlug,
      kullaniciKimligi: girdi.kullanici
        ? new ObjectId(girdi.kullanici.kimlik)
        : girdi.kullaniciKimligi
          ? new ObjectId(girdi.kullaniciKimligi)
          : undefined,
      kullaniciEpostasi: girdi.kullanici?.eposta ?? girdi.eposta,
      zaman: new Date(),
      adres: girdi.adres,
      degisenAlanlar: girdi.degisenAlanlar,
      oncekiDurum: girdi.oncekiDurum,
      yeniDurum: girdi.yeniDurum,
      not: girdi.not,
      basarili: girdi.basarili ?? true,
      olusturuldu: new Date(),
    });
  } catch (hata) {
    console.error('[denetim] kayıt yazılamadı:', hata);
  }
}

/* --- SÜRÜM GEÇMİŞİ -------------------------------------------------------- */

/**
 * Bir belgenin değişiklikten ÖNCEKİ hâlini saklar.
 *
 * Sürüm numarası koleksiyon+belge başına artar. Yarış durumunda tekil dizin
 * çakışma verir; o durumda bir sonraki numarayı deneyerek ilerleriz.
 */
export async function surumKaydet(parametreler: {
  koleksiyon: string;
  belgeKimligi: string;
  belgeSlug?: string;
  anlikGoruntu: Record<string, unknown>;
  kullanici?: OturumKullanicisi | null;
  degisenAlanlar?: string[];
  not?: string;
}): Promise<number | null> {
  try {
    const db = await veritabani();
    const koleksiyon = db.collection(KOLEKSIYONLAR.icerikSurumleri);

    const sonSurum = await koleksiyon
      .find({ koleksiyon: parametreler.koleksiyon, belgeKimligi: parametreler.belgeKimligi })
      .sort({ surumNo: -1 })
      .limit(1)
      .toArray();

    let surumNo = ((sonSurum[0]?.surumNo as number | undefined) ?? 0) + 1;

    // Aynı belgeye eşzamanlı iki kaydetme gelirse tekil dizin çakışır; ilerle.
    for (let deneme = 0; deneme < 5; deneme += 1) {
      try {
        await koleksiyon.insertOne({
          koleksiyon: parametreler.koleksiyon,
          belgeKimligi: parametreler.belgeKimligi,
          belgeSlug: parametreler.belgeSlug,
          surumNo,
          anlikGoruntu: parametreler.anlikGoruntu,
          zaman: new Date(),
          kullaniciKimligi: parametreler.kullanici
            ? new ObjectId(parametreler.kullanici.kimlik)
            : undefined,
          kullaniciEpostasi: parametreler.kullanici?.eposta,
          degisenAlanlar: parametreler.degisenAlanlar,
          not: parametreler.not,
          olusturuldu: new Date(),
        });
        return surumNo;
      } catch (hata) {
        const kod = (hata as { code?: number }).code;
        if (kod !== 11000) throw hata;
        surumNo += 1;
      }
    }
    return null;
  } catch (hata) {
    console.error('[surum] kayıt yazılamadı:', hata);
    return null;
  }
}

/* --- ALAN KARŞILAŞTIRMA --------------------------------------------------- */

/**
 * İki belge arasında değişen üst düzey alan adlarını döndürür.
 * Denetim kaydında "neyin değiştiği" bilgisi için kullanılır; alanın içeriği
 * kaydedilmez (kişisel veri sızdırmamak için).
 */
export function degisenAlanlar(
  onceki: Record<string, unknown> | null | undefined,
  yeni: Record<string, unknown>,
): string[] {
  if (!onceki) return Object.keys(yeni).sort();

  const anahtarlar = new Set([...Object.keys(onceki), ...Object.keys(yeni)]);
  const degisen: string[] = [];

  for (const anahtar of anahtarlar) {
    if (anahtar === 'guncellendi' || anahtar === '_id') continue;
    if (JSON.stringify(onceki[anahtar]) !== JSON.stringify(yeni[anahtar])) {
      degisen.push(anahtar);
    }
  }

  return degisen.sort();
}
