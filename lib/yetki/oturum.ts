import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { ObjectId, type WithId } from 'mongodb';
import { veritabani } from '@/lib/mongo/istemci';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import {
  KAYAN_SURE_MS,
  KAYDIRMA_ESIGI_MS,
  MUTLAK_SURE_MS,
  OTURUM_COOKIE,
} from '@/lib/yetki/oturum-sabitleri';
import type { Izin } from '@/lib/yetki/roller';
import { izinKumesi, izinVarMi } from '@/lib/yetki/roller';

/**
 * Oturum yönetimi.
 *
 * Çerezde DÜZ token durur, veritabanında yalnızca SHA-256 özeti. Veritabanı
 * sızarsa oturumlar ele geçirilemez (parola özetiyle aynı mantık).
 *
 * İki ayrı süre vardır:
 *  - `biterZaman`  : kayan pencere (varsayılan 8 saat). Etkin kullanımda ileri alınır.
 *  - `mutlakBitis` : uzatılamaz üst sınır (7 gün). Sonsuza kadar açık oturum olmaz.
 *
 * Çerezin `maxAge` değeri mutlak sınıra göre verilir; kayan pencerenin sahibi
 * veritabanıdır. Böylece RSC render'ı sırasında çerez yazmaya gerek kalmaz
 * (Next.js render sırasında çerez yazmayı zaten yasaklar).
 *
 * Yalnızca sunucuda çalışır.
 */

export { OTURUM_COOKIE } from '@/lib/yetki/oturum-sabitleri';

function ozetle(token: string): string {
  return createHash('sha256').update(token).digest('base64url');
}

/* --- TİPLER --------------------------------------------------------------- */

export type OturumKullanicisi = {
  kimlik: string;
  eposta: string;
  adSoyad?: string;
  roller: string[];
  yazarSlug?: string;
  /** Parola bu tarihte güncellendi; panelde "parolanızı değiştirin" uyarısı için. */
  parolaGuncellendi?: Date;
  izinler: Izin[];
};

type OturumBelgesi = {
  tokenOzeti: string;
  kullaniciKimligi: ObjectId;
  biterZaman: Date;
  mutlakBitis: Date;
  sonErisim?: Date;
  adres?: string;
  tarayici?: string;
  iptalEdildi?: boolean;
  iptalNedeni?: string;
  olusturuldu?: Date;
};

type KullaniciBelgesi = {
  eposta: string;
  adSoyad?: string;
  roller?: string[];
  durum?: string;
  yazarSlug?: string;
  parolaGuncellendi?: Date;
};

/* --- OTURUM AÇ / KAPAT ---------------------------------------------------- */

/**
 * Yeni oturum açar ve çerezi yazar. Yalnızca Server Action veya Route
 * Handler içinden çağrılabilir (çerez yazımı gerektirir).
 *
 * Oturum sabitlemeye karşı: token her girişte sıfırdan üretilir, var olan bir
 * token asla yeniden kullanılmaz.
 */
export async function oturumAc(
  kullaniciKimligi: ObjectId | string,
  bilgi: { adres?: string; tarayici?: string } = {},
  simdi: Date = new Date(),
): Promise<string> {
  const token = randomBytes(32).toString('base64url');
  const db = await veritabani();

  await db.collection<OturumBelgesi>(KOLEKSIYONLAR.oturumlar).insertOne({
    tokenOzeti: ozetle(token),
    kullaniciKimligi:
      typeof kullaniciKimligi === 'string' ? new ObjectId(kullaniciKimligi) : kullaniciKimligi,
    biterZaman: new Date(simdi.getTime() + KAYAN_SURE_MS),
    mutlakBitis: new Date(simdi.getTime() + MUTLAK_SURE_MS),
    sonErisim: simdi,
    adres: bilgi.adres,
    tarayici: bilgi.tarayici?.slice(0, 200),
    olusturuldu: simdi,
  });

  const kavanoz = await cookies();
  kavanoz.set(OTURUM_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(MUTLAK_SURE_MS / 1000),
  });

  return token;
}

/** Oturumu iptal eder ve çerezi siler. Server Action içinden çağrılır. */
export async function oturumKapat(neden = 'cikis'): Promise<void> {
  const kavanoz = await cookies();
  const token = kavanoz.get(OTURUM_COOKIE)?.value;

  if (token) {
    const db = await veritabani();
    await db
      .collection<OturumBelgesi>(KOLEKSIYONLAR.oturumlar)
      .updateOne(
        { tokenOzeti: ozetle(token) },
        { $set: { iptalEdildi: true, iptalNedeni: neden, biterZaman: new Date() } },
      );
  }

  kavanoz.delete(OTURUM_COOKIE);
}

/**
 * Bir kullanıcının tüm oturumlarını iptal eder.
 * Parola değişiminde, rol değişiminde ve yönetici müdahalesinde ÇAĞRILMALI —
 * aksi hâlde çalınmış bir oturum parola değişse de yaşamaya devam eder.
 */
export async function kullaniciOturumlariniIptalEt(
  kullaniciKimligi: ObjectId | string,
  neden: 'parola-degisti' | 'yonetici-iptali' | 'rol-degisti',
  haricTutulanTokenOzeti?: string,
): Promise<number> {
  const db = await veritabani();
  const filtre: Record<string, unknown> = {
    kullaniciKimligi:
      typeof kullaniciKimligi === 'string' ? new ObjectId(kullaniciKimligi) : kullaniciKimligi,
    iptalEdildi: { $ne: true },
  };
  if (haricTutulanTokenOzeti) filtre.tokenOzeti = { $ne: haricTutulanTokenOzeti };

  const sonuc = await db.collection<OturumBelgesi>(KOLEKSIYONLAR.oturumlar).updateMany(filtre, {
    $set: { iptalEdildi: true, iptalNedeni: neden, biterZaman: new Date() },
  });

  return sonuc.modifiedCount;
}

/* --- OTURUM OKU ----------------------------------------------------------- */

/**
 * Geçerli oturumun kullanıcısını döndürür, yoksa `null`.
 *
 * Render sırasında güvenle çağrılabilir: çerez YAZMAZ, yalnızca gerekiyorsa
 * veritabanındaki kayan süreyi ileri alır.
 */
export async function oturumKullanicisi(): Promise<OturumKullanicisi | null> {
  const kavanoz = await cookies();
  const token = kavanoz.get(OTURUM_COOKIE)?.value;
  if (!token || token.length < 20 || token.length > 200) return null;

  const db = await veritabani();
  const tokenOzeti = ozetle(token);
  const oturum = await db
    .collection<OturumBelgesi>(KOLEKSIYONLAR.oturumlar)
    .findOne({ tokenOzeti });

  if (!oturum) return null;

  // Sabit zamanlı karşılaştırma: özet eşleşmesi sorgu ile bulundu ama yine de
  // doğrula (dizin taraması sızıntısına karşı ucuz bir ek adım).
  const beklenen = Buffer.from(oturum.tokenOzeti);
  const gelen = Buffer.from(tokenOzeti);
  if (beklenen.length !== gelen.length || !timingSafeEqual(beklenen, gelen)) return null;

  const simdi = new Date();
  if (oturum.iptalEdildi) return null;
  if (oturum.biterZaman.getTime() <= simdi.getTime()) return null;
  if (oturum.mutlakBitis.getTime() <= simdi.getTime()) return null;

  const kullanici = (await db
    .collection(KOLEKSIYONLAR.kullanicilar)
    .findOne({ _id: oturum.kullaniciKimligi })) as WithId<KullaniciBelgesi> | null;

  if (!kullanici || kullanici.durum !== 'aktif') return null;

  // Kayan pencereyi ileri al — mutlak sınırı aşmadan, eşik dolduysa.
  const sonErisim = oturum.sonErisim?.getTime() ?? 0;
  if (simdi.getTime() - sonErisim > KAYDIRMA_ESIGI_MS) {
    const yeniBitis = new Date(
      Math.min(simdi.getTime() + KAYAN_SURE_MS, oturum.mutlakBitis.getTime()),
    );
    await db
      .collection<OturumBelgesi>(KOLEKSIYONLAR.oturumlar)
      .updateOne({ tokenOzeti }, { $set: { sonErisim: simdi, biterZaman: yeniBitis } });
  }

  const roller = kullanici.roller ?? [];

  return {
    kimlik: kullanici._id.toHexString(),
    eposta: kullanici.eposta,
    adSoyad: kullanici.adSoyad,
    roller,
    yazarSlug: kullanici.yazarSlug,
    parolaGuncellendi: kullanici.parolaGuncellendi,
    izinler: [...izinKumesi(roller)],
  };
}

/* --- GUARD'LAR ------------------------------------------------------------ */

export class YetkiHatasi extends Error {
  constructor(
    message: string,
    readonly kod: 'oturum-yok' | 'izin-yok',
  ) {
    super(message);
    this.name = 'YetkiHatasi';
  }
}

/**
 * Server Action'ların İLK satırında çağrılır. Oturum yoksa veya izin
 * yetmiyorsa atar. Ekranı gizlemek yeterli değildir — yazma yolu burada
 * korunur.
 */
export async function yetkiGerekli(izin: Izin): Promise<OturumKullanicisi> {
  const kullanici = await oturumKullanicisi();
  if (!kullanici) {
    throw new YetkiHatasi('Oturum bulunamadı. Yeniden giriş yapın.', 'oturum-yok');
  }
  if (!izinVarMi(kullanici.roller, izin)) {
    throw new YetkiHatasi(`Bu işlem için yetkiniz yok (${izin}).`, 'izin-yok');
  }
  return kullanici;
}

/** İzin gerektirmeyen, yalnızca oturum isteyen yollar için. */
export async function oturumGerekli(): Promise<OturumKullanicisi> {
  const kullanici = await oturumKullanicisi();
  if (!kullanici) {
    throw new YetkiHatasi('Oturum bulunamadı. Yeniden giriş yapın.', 'oturum-yok');
  }
  return kullanici;
}

/** Panelin herhangi bir ekranına girebilmek için gereken asgari izin. */
export const PANEL_ASGARI_IZNI: Izin = 'icerik:oku';

export function panelErisimiVarMi(kullanici: OturumKullanicisi | null): boolean {
  return Boolean(kullanici && izinVarMi(kullanici.roller, PANEL_ASGARI_IZNI));
}
