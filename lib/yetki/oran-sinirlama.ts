import { headers } from 'next/headers';
import { veritabani } from '@/lib/mongo/istemci';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';

/**
 * Giriş denemelerinde oran sınırlama.
 *
 * İki eksende birlikte sayılır:
 *  - E-posta: tek hesaba yönelen parola denemelerini keser.
 *  - IP: çok sayıda hesabı tarayan saldırıyı (credential stuffing) keser.
 *
 * IP eşiği daha yüksektir çünkü kurumsal ağlarda onlarca meşru kullanıcı aynı
 * adresten çıkar; e-posta eşiği düşüktür çünkü tek hesapta çok deneme meşru değil.
 *
 * Yalnızca sunucuda çalışır.
 */

/**
 * POLİTİKA:
 *  - IP ekseni SERT KİLİT uygular. Çok sayıda hesabı tarayan saldırıyı keser.
 *  - E-posta ekseni ARTAN GECİKME uygular, sert kilit UYGULAMAZ.
 *
 * Neden: e-posta ekseninde sert kilit, saldırganın yalnızca beş yanlış parola
 * denemesiyle sahip hesabını kilitlemesine izin verir — yani oran sınırlamanın
 * kendisi bir hizmet engelleme aracına dönüşür. Artan gecikme kaba kuvveti
 * ekonomik olarak bitirir ama meşru kullanıcıyı dışarıda bırakmaz.
 */
const EPOSTA_GECIKME_ESIGI = 3;
const EPOSTA_MAKS_GECIKME_MS = 4000;
const ADRES_ESIGI = 20;
const PENCERE_MS = 15 * 60 * 1000;

type DenemeBelgesi = {
  anahtar: string;
  tur: 'eposta' | 'adres';
  adet: number;
  sonDeneme: Date;
  saklamaBitis: Date;
};

/**
 * İstemci IP'si.
 *
 * GÜVEN VARSAYIMI: `x-forwarded-for` istemci tarafından sahtelenebilir bir
 * başlıktır. Vercel (ve ters vekil arkasındaki her düzgün kurulum) bu başlığı
 * kenar katmanında ÜZERİNE YAZAR, bu yüzden orada güvenilir. Ters vekil
 * OLMADAN doğrudan internete açılırsa IP ekseni sahtelenebilir hâle gelir ve
 * yalnızca e-posta ekseni koruma sağlar.
 *
 * Vercel'in kendi başlığı önce denenir; sahtelenemez olan tek başlık odur.
 */
export async function istemciAdresi(): Promise<string> {
  const h = await headers();

  const vercel = h.get('x-vercel-forwarded-for');
  if (vercel) return (vercel.split(',')[0] ?? '').trim().slice(0, 64) || 'bilinmeyen';

  const gercek = h.get('x-real-ip');
  if (gercek) return gercek.trim().slice(0, 64);

  const iletilen = h.get('x-forwarded-for');
  if (iletilen) {
    const ilk = iletilen.split(',')[0]?.trim();
    if (ilk) return ilk.slice(0, 64);
  }

  return 'bilinmeyen';
}

export async function istemciTarayicisi(): Promise<string> {
  const h = await headers();
  return h.get('user-agent')?.slice(0, 200) ?? 'bilinmeyen';
}

/**
 * E-posta normalizasyonu.
 *
 * DİKKAT: `toLocaleLowerCase('tr-TR')` KULLANILMAZ. Türkçe yerelde "I" → "ı"
 * dönüşümü olur; `İsmail@x.com` ile `ismail@x.com` iki AYRI anahtar üretir,
 * bu da iki ayrı hesap ve iki ayrı kilit sayacı demektir. E-posta yerel
 * kısmı ASCII katlanmalıdır.
 */
export function epostaNormalize(eposta: string): string {
  return eposta.trim().toLowerCase();
}

export type SinirDurumu = {
  kilitli: boolean;
  /** Kilit bu ana kadar sürer. */
  bitis?: Date;
  kalanSaniye?: number;
  /** Hangi eksende kilitlendi — kullanıcıya gösterilmez, kayda geçer. */
  eksen?: 'eposta' | 'adres';
  /** E-posta ekseninde uygulanacak yapay gecikme (ms). */
  gecikmeMs: number;
};

/**
 * Denemeye izin verilip verilmediğini söyler. Sayaç ARTIRMAZ; yalnızca okur.
 * Başarısız denemeden sonra `basarisizDenemeKaydet` çağrılmalıdır.
 */
export async function sinirDurumu(eposta: string, adres: string): Promise<SinirDurumu> {
  const db = await veritabani();
  const koleksiyon = db.collection<DenemeBelgesi>(KOLEKSIYONLAR.girisDenemeleri);
  const simdi = new Date();

  const kayitlar = await koleksiyon
    .find({
      $or: [
        { anahtar: epostaNormalize(eposta), tur: 'eposta' },
        { anahtar: adres, tur: 'adres' },
      ],
    })
    .toArray();

  let gecikmeMs = 0;

  for (const kayit of kayitlar) {
    const pencereDisi = simdi.getTime() - kayit.sonDeneme.getTime() > PENCERE_MS;
    if (pencereDisi) continue;

    if (kayit.tur === 'adres' && kayit.adet >= ADRES_ESIGI) {
      const bitis = new Date(kayit.sonDeneme.getTime() + PENCERE_MS);
      return {
        kilitli: true,
        bitis,
        kalanSaniye: Math.max(0, Math.ceil((bitis.getTime() - simdi.getTime()) / 1000)),
        eksen: 'adres',
        gecikmeMs: 0,
      };
    }

    if (kayit.tur === 'eposta' && kayit.adet >= EPOSTA_GECIKME_ESIGI) {
      // 2^(fazla deneme) · 250 ms, üst sınırla kelepçelenmiş.
      const fazla = kayit.adet - EPOSTA_GECIKME_ESIGI + 1;
      gecikmeMs = Math.min(EPOSTA_MAKS_GECIKME_MS, 2 ** fazla * 250);
    }
  }

  return { kilitli: false, gecikmeMs };
}

/** Artan gecikmeyi uygular. Giriş akışı sonucu döndürmeden ÖNCE çağırır. */
export async function gecikmeyiUygula(ms: number): Promise<void> {
  if (ms <= 0) return;
  await new Promise((coz) => setTimeout(coz, ms));
}

export async function basarisizDenemeKaydet(eposta: string, adres: string): Promise<void> {
  const db = await veritabani();
  const koleksiyon = db.collection<DenemeBelgesi>(KOLEKSIYONLAR.girisDenemeleri);
  const simdi = new Date();
  const saklamaBitis = new Date(simdi.getTime() + PENCERE_MS * 2);

  for (const [anahtar, tur] of [
    [epostaNormalize(eposta), 'eposta'],
    [adres, 'adres'],
  ] as const) {
    // ATOMİK: oku-sonra-yaz yerine tek işlem. Eşzamanlı denemeler sayacı
    // birlikte artırır; oku-sonra-yaz deseninde paralel istekler birbirinin
    // artışını ezerek sınırı fiilen devre dışı bırakır.
    const pencereBasi = new Date(simdi.getTime() - PENCERE_MS);

    const guncellenen = await koleksiyon.updateOne(
      { anahtar, tur, sonDeneme: { $gt: pencereBasi } },
      { $inc: { adet: 1 }, $set: { sonDeneme: simdi, saklamaBitis } },
    );

    if (guncellenen.matchedCount === 0) {
      // Kayıt yok ya da penceresi kapanmış: sayacı 1'e çek.
      await koleksiyon.updateOne(
        { anahtar, tur },
        { $set: { anahtar, tur, adet: 1, sonDeneme: simdi, saklamaBitis } },
        { upsert: true },
      );
    }
  }
}

/** Başarılı girişten sonra o hesabın sayacı temizlenir. IP sayacı DURUR. */
export async function basariliGirisSonrasiTemizle(eposta: string): Promise<void> {
  const db = await veritabani();
  await db
    .collection<DenemeBelgesi>(KOLEKSIYONLAR.girisDenemeleri)
    .deleteOne({ anahtar: epostaNormalize(eposta), tur: 'eposta' });
}
