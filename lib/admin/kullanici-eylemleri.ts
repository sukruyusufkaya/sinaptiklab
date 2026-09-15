'use server';

import { ObjectId } from 'mongodb';
import { veritabani } from '@/lib/mongo/istemci';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { basarili, basarisiz, korumaliEylem } from '@/lib/yetki/korumali-eylem';
import { kullaniciOturumlariniIptalEt } from '@/lib/yetki/oturum';
import { epostaNormalize } from '@/lib/yetki/oran-sinirlama';
import { parolaGucunuDenetle, parolaOzetle } from '@/lib/yetki/parola';
import { enYuksekDuzey, rolAtamaKarari, ROL_DUZEYI, ROLLER, type Rol } from '@/lib/yetki/roller';

/**
 * Kullanıcı yönetimi eylemleri.
 *
 * Ayrıcalık yükseltmesinin asıl kapısı buradadır. Rol matrisindeki
 * `rolAtamaKarari` üç şeyi birlikte zorlar:
 *  1. Kimse kendi düzeyinin üstünde bir rol atayamaz.
 *  2. Kimse kendi rollerini değiştiremez.
 *  3. Son sahip hesabı sahiplikten düşürülemez.
 *
 * Rol veya durum değiştiğinde hedefin TÜM oturumları iptal edilir — aksi
 * hâlde yetkisi alınmış bir kullanıcı mutlak süre sonuna kadar (7 gün)
 * panelde çalışmaya devam eder.
 */

async function sahipSayisi(): Promise<number> {
  const db = await veritabani();
  return db
    .collection(KOLEKSIYONLAR.kullanicilar)
    .countDocuments({ roller: 'sahip', durum: 'aktif' });
}

/* --- ROL DEĞİŞTİRME ------------------------------------------------------- */

export type RolGirdisi = { kimlik: string; roller: string[] };

export const rolDegistir = korumaliEylem<RolGirdisi, { roller: string[] }>(
  'kullanici:yaz',
  async ({ kimlik, roller }, { kullanici, kaydet }) => {
    if (!ObjectId.isValid(kimlik)) {
      return basarisiz<{ roller: string[] }>('Geçersiz kullanıcı kimliği.');
    }

    const db = await veritabani();
    const hedef = await db
      .collection(KOLEKSIYONLAR.kullanicilar)
      .findOne({ _id: new ObjectId(kimlik) });

    if (!hedef) return basarisiz<{ roller: string[] }>('Kullanıcı bulunamadı.');

    const mevcutRoller = Array.isArray(hedef.roller) ? (hedef.roller as string[]) : [];

    const karar = rolAtamaKarari({
      kullanici,
      hedefKimlik: kimlik,
      hedefinMevcutRolleri: mevcutRoller,
      yeniRoller: roller,
      sistemdekiSahipSayisi: await sahipSayisi(),
    });

    if (!karar.izinli) return basarisiz<{ roller: string[] }>(karar.neden);

    await db
      .collection(KOLEKSIYONLAR.kullanicilar)
      .updateOne({ _id: new ObjectId(kimlik) }, { $set: { roller, guncellendi: new Date() } });

    // Yetkisi değişen kullanıcının oturumları düşer; yeni yetkiyle yeniden girer.
    const iptal = await kullaniciOturumlariniIptalEt(kimlik, 'rol-degisti');

    await kaydet({
      eylem: 'rol-degistir',
      koleksiyon: KOLEKSIYONLAR.kullanicilar,
      belgeKimligi: kimlik,
      not: `${mevcutRoller.join(', ') || 'yok'} → ${roller.join(', ')}; ${iptal} oturum iptal edildi.`,
    });

    return basarili({ roller }, 'Rol güncellendi. Kullanıcının oturumları kapatıldı.');
  },
);

/* --- DURUM DEĞİŞTİRME ----------------------------------------------------- */

export type DurumGirdisi = { kimlik: string; durum: 'aktif' | 'askida' };

export const kullaniciDurumDegistir = korumaliEylem<DurumGirdisi, { durum: string }>(
  'kullanici:yaz',
  async ({ kimlik, durum }, { kullanici, kaydet }) => {
    if (!ObjectId.isValid(kimlik)) {
      return basarisiz<{ durum: string }>('Geçersiz kullanıcı kimliği.');
    }
    if (durum !== 'aktif' && durum !== 'askida') {
      return basarisiz<{ durum: string }>('Geçersiz durum.');
    }
    if (kimlik === kullanici.kimlik) {
      return basarisiz<{ durum: string }>('Kendi hesabınızı askıya alamazsınız.');
    }

    const db = await veritabani();
    const hedef = await db
      .collection(KOLEKSIYONLAR.kullanicilar)
      .findOne({ _id: new ObjectId(kimlik) });

    if (!hedef) return basarisiz<{ durum: string }>('Kullanıcı bulunamadı.');

    const hedefRoller = Array.isArray(hedef.roller) ? (hedef.roller as string[]) : [];
    if (enYuksekDuzey(hedefRoller) >= enYuksekDuzey(kullanici.roller)) {
      return basarisiz<{ durum: string }>(
        'Kendinizle aynı veya daha yüksek yetkili bir hesabı değiştiremezsiniz.',
      );
    }

    // Son aktif sahibi askıya almak sistemi sahipsiz bırakır.
    if (durum === 'askida' && hedefRoller.includes('sahip') && (await sahipSayisi()) <= 1) {
      return basarisiz<{ durum: string }>('Sistemde en az bir aktif sahip hesabı kalmalı.');
    }

    await db
      .collection(KOLEKSIYONLAR.kullanicilar)
      .updateOne({ _id: new ObjectId(kimlik) }, { $set: { durum, guncellendi: new Date() } });

    const iptal =
      durum === 'askida' ? await kullaniciOturumlariniIptalEt(kimlik, 'yonetici-iptali') : 0;

    await kaydet({
      eylem: 'guncelle',
      koleksiyon: KOLEKSIYONLAR.kullanicilar,
      belgeKimligi: kimlik,
      oncekiDurum: typeof hedef.durum === 'string' ? hedef.durum : undefined,
      yeniDurum: durum,
      not: durum === 'askida' ? `${iptal} oturum iptal edildi.` : 'Hesap yeniden etkinleştirildi.',
    });

    return basarili(
      { durum },
      durum === 'askida'
        ? 'Hesap askıya alındı ve oturumları kapatıldı.'
        : 'Hesap etkinleştirildi.',
    );
  },
);

/* --- OTURUMLARI KAPAT ----------------------------------------------------- */

export const oturumlariKapat = korumaliEylem<{ kimlik: string }, { adet: number }>(
  'kullanici:yaz',
  async ({ kimlik }, { kullanici, kaydet }) => {
    if (!ObjectId.isValid(kimlik)) {
      return basarisiz<{ adet: number }>('Geçersiz kullanıcı kimliği.');
    }

    const db = await veritabani();
    const hedef = await db
      .collection(KOLEKSIYONLAR.kullanicilar)
      .findOne({ _id: new ObjectId(kimlik) });
    if (!hedef) return basarisiz<{ adet: number }>('Kullanıcı bulunamadı.');

    const hedefRoller = Array.isArray(hedef.roller) ? (hedef.roller as string[]) : [];
    if (
      kimlik !== kullanici.kimlik &&
      enYuksekDuzey(hedefRoller) >= enYuksekDuzey(kullanici.roller)
    ) {
      return basarisiz<{ adet: number }>(
        'Kendinizle aynı veya daha yüksek yetkili bir hesabın oturumlarını kapatamazsınız.',
      );
    }

    const adet = await kullaniciOturumlariniIptalEt(kimlik, 'yonetici-iptali');

    await kaydet({
      eylem: 'guncelle',
      koleksiyon: KOLEKSIYONLAR.kullanicilar,
      belgeKimligi: kimlik,
      not: `${adet} oturum yönetici tarafından kapatıldı.`,
    });

    return basarili({ adet }, `${adet} oturum kapatıldı.`);
  },
);

/* --- KULLANICI OLUŞTURMA -------------------------------------------------- */

export type OlusturGirdisi = { veri: FormData };

export const kullaniciOlustur = korumaliEylem<OlusturGirdisi, { kimlik: string }>(
  'kullanici:yaz',
  async ({ veri }, { kullanici, kaydet }) => {
    const eposta = epostaNormalize(String(veri.get('eposta') ?? ''));
    const adSoyad = String(veri.get('adSoyad') ?? '').trim();
    const parola = String(veri.get('parola') ?? '');
    const rol = String(veri.get('rol') ?? '');

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(eposta)) {
      return basarisiz<{ kimlik: string }>('Geçerli bir e-posta girin.', {
        alanHatalari: { eposta: 'Geçersiz e-posta.' },
      });
    }
    if (!ROLLER.includes(rol as Rol)) {
      return basarisiz<{ kimlik: string }>('Geçerli bir rol seçin.', {
        alanHatalari: { rol: 'Tanınmayan rol.' },
      });
    }
    if (ROL_DUZEYI[rol as Rol] > enYuksekDuzey(kullanici.roller)) {
      return basarisiz<{ kimlik: string }>(
        'Kendi yetki düzeyinizin üstünde bir rol atayamazsınız.',
        { alanHatalari: { rol: 'Yetki düzeyiniz yetersiz.' } },
      );
    }

    const guc = parolaGucunuDenetle(parola, eposta);
    if (!guc.gecerli) {
      return basarisiz<{ kimlik: string }>(guc.sorunlar.join(' '), {
        alanHatalari: { parola: guc.sorunlar[0] ?? 'Parola politikayı karşılamıyor.' },
      });
    }

    const db = await veritabani();
    const mevcut = await db.collection(KOLEKSIYONLAR.kullanicilar).findOne({ eposta });
    if (mevcut) {
      return basarisiz<{ kimlik: string }>('Bu e-posta ile bir hesap zaten var.', {
        alanHatalari: { eposta: 'Kullanımda.' },
      });
    }

    const simdi = new Date();
    const sonuc = await db.collection(KOLEKSIYONLAR.kullanicilar).insertOne({
      eposta,
      adSoyad: adSoyad || undefined,
      parolaOzeti: await parolaOzetle(parola),
      parolaGuncellendi: simdi,
      roller: [rol],
      durum: 'aktif',
      epostaDogrulandi: false,
      olusturuldu: simdi,
      guncellendi: simdi,
    });

    const kimlik = String(sonuc.insertedId);

    await kaydet({
      eylem: 'olustur',
      koleksiyon: KOLEKSIYONLAR.kullanicilar,
      belgeKimligi: kimlik,
      not: `Rol: ${rol}. Parola yönetici tarafından belirlendi; kullanıcı ilk girişte değiştirmeli.`,
    });

    return basarili(
      { kimlik },
      'Kullanıcı oluşturuldu. Parolayı güvenli bir kanaldan iletin ve değiştirmesini isteyin.',
    );
  },
);
