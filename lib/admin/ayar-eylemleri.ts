'use server';

import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';
import { veritabani } from '@/lib/mongo/istemci';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { basarili, basarisiz, korumaliEylem } from '@/lib/yetki/korumali-eylem';

/**
 * Site ayarı eylemleri.
 *
 * TANIMLI anahtarlar dışında hiçbir şey yazılamaz: serbest anahtar kabul etmek,
 * panele yazma yetkisi olan birinin uygulamanın okuduğu herhangi bir ayarı
 * uydurmasına izin vermek olurdu.
 */

const IZINLI_AYARLAR = {
  'bakim-kipi': 'mantik',
  'duyuru-seridi': 'metin',
  'manset-slug': 'metin',
  'bulten-aktif': 'mantik',
} as const;

type AyarAnahtari = keyof typeof IZINLI_AYARLAR;

const METIN_SINIRI = 300;

export const ayarKaydet = korumaliEylem<{ veri: FormData }, { degisen: number }>(
  'ayar:yaz',
  async ({ veri }, { kullanici, kaydet }) => {
    const db = await veritabani();
    const degisenler: string[] = [];

    for (const [anahtar, tip] of Object.entries(IZINLI_AYARLAR) as [
      AyarAnahtari,
      'mantik' | 'metin',
    ][]) {
      const ham = veri.get(anahtar);

      let deger: unknown;
      if (tip === 'mantik') {
        deger = ham === 'on' || ham === 'true';
      } else {
        const metin = String(ham ?? '').trim();
        if (metin.length > METIN_SINIRI) {
          return basarisiz<{ degisen: number }>(
            `"${anahtar}" en fazla ${METIN_SINIRI} karakter olabilir.`,
          );
        }
        deger = metin;
      }

      const mevcut = await db.collection(KOLEKSIYONLAR.ayarlar).findOne({ anahtar });
      if (mevcut && JSON.stringify(mevcut.deger) === JSON.stringify(deger)) continue;

      await db.collection(KOLEKSIYONLAR.ayarlar).updateOne(
        { anahtar },
        {
          $set: {
            anahtar,
            deger,
            guncelleyenKimlik: new ObjectId(kullanici.kimlik),
            guncellendi: new Date(),
          },
          $setOnInsert: { olusturuldu: new Date() },
        },
        { upsert: true },
      );

      degisenler.push(anahtar);
    }

    if (degisenler.length === 0) {
      return basarili({ degisen: 0 }, 'Değişiklik yok.');
    }

    await kaydet({
      eylem: 'ayar-degistir',
      koleksiyon: KOLEKSIYONLAR.ayarlar,
      degisenAlanlar: degisenler,
      not: `Değişen ayarlar: ${degisenler.join(', ')}`,
    });

    // Ayarlar kabukta ve ana sayfada okunur; ikisi de tazelenir.
    revalidatePath('/', 'layout');

    return basarili(
      { degisen: degisenler.length },
      `${degisenler.length} ayar güncellendi ve site tazelendi.`,
    );
  },
);

export const siteyiTazeleEylemi = korumaliEylem<undefined, undefined>(
  'ayar:yaz',
  async (_girdi, { kaydet }) => {
    revalidatePath('/', 'layout');
    await kaydet({
      eylem: 'ayar-degistir',
      koleksiyon: '-',
      not: 'Tüm site önbelleği elle tazelendi.',
    });
    return basarili<undefined>(undefined, 'Site önbelleği tazelendi.');
  },
);

/** Uygulamanın ayar okuma yolu. */
export async function ayarOku<T>(anahtar: AyarAnahtari, varsayilan: T): Promise<T> {
  try {
    const db = await veritabani();
    const kayit = await db.collection(KOLEKSIYONLAR.ayarlar).findOne({ anahtar });
    return kayit && kayit.deger !== undefined ? (kayit.deger as T) : varsayilan;
  } catch {
    // Veritabanı yoksa site yine çalışır; varsayılan döner.
    return varsayilan;
  }
}
