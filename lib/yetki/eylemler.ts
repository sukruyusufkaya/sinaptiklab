'use server';

import { ObjectId } from 'mongodb';
import { veritabani } from '@/lib/mongo/istemci';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { guvenliIcYol } from '@/lib/guvenlik/adres';
import { denetimYaz } from '@/lib/yetki/denetim';
import { basarili, basarisiz, oturumluEylem, type EylemSonucu } from '@/lib/yetki/korumali-eylem';
import {
  basariliGirisSonrasiTemizle,
  basarisizDenemeKaydet,
  epostaNormalize,
  gecikmeyiUygula,
  istemciAdresi,
  istemciTarayicisi,
  sinirDurumu,
} from '@/lib/yetki/oran-sinirlama';
import {
  kullaniciOturumlariniIptalEt,
  oturumAc,
  oturumKapat,
  oturumKullanicisi,
  panelErisimiVarMi,
} from '@/lib/yetki/oturum';
import {
  parolaDenetle,
  parolaGucunuDenetle,
  parolaOzetle,
  yenilenmeliMi,
} from '@/lib/yetki/parola';

/**
 * Kimlik eylemleri.
 *
 * DİKKAT: Bu dosyadaki eylemler `redirect()` ÇAĞIRMAZ. Next.js'te `redirect()`
 * bir istisna fırlatarak çalışır; `korumaliEylem` sarmalayıcısının catch bloğu
 * onu yutar ve yönlendirme sessizce kaybolur. Bunun yerine hedef yol sonuçta
 * döndürülür, gezinmeyi istemci yapar.
 */

/* --- GİRİŞ ---------------------------------------------------------------- */

export type GirisSonucu = EylemSonucu<{ yol: string }>;

/**
 * Giriş.
 *
 * Kasıtlı tasarım kararları:
 *  - Hata iletisi hesap varlığını SIZDIRMAZ: "kullanıcı yok", "parola yanlış"
 *    ve "hesap askıda" aynı iletiyi döner.
 *  - Parola denetimi tek kod yolundan (`parolaDenetle`) geçer; hesap yoksa da
 *    aynı maliyette sahte özetleme yapılır, böylece yanıt süresi farkı hesap
 *    varlığını açığa çıkarmaz.
 *  - Oturum tokeni her girişte sıfırdan üretilir (oturum sabitleme koruması).
 */
export async function giris(veri: FormData): Promise<GirisSonucu> {
  const hamEposta = String(veri.get('eposta') ?? '');
  const parola = String(veri.get('parola') ?? '');
  const devam = guvenliIcYol(String(veri.get('devam') ?? ''), '/admin/');

  const GENEL_HATA = 'E-posta veya parola hatalı.';

  if (!hamEposta || !parola) {
    return basarisiz('E-posta ve parola gerekli.', { kod: 'eksik-alan' });
  }

  const eposta = epostaNormalize(hamEposta);
  const adres = await istemciAdresi();

  try {
    const sinir = await sinirDurumu(eposta, adres);

    if (sinir.kilitli) {
      await denetimYaz({
        eylem: 'giris-basarisiz',
        koleksiyon: KOLEKSIYONLAR.kullanicilar,
        eposta,
        adres,
        basarili: false,
        not: `Oran sınırı (${sinir.eksen}); ${sinir.kalanSaniye}s kaldı.`,
      });
      const dakika = Math.ceil((sinir.kalanSaniye ?? 0) / 60);
      return basarisiz(
        `Bu ağdan çok fazla başarısız deneme yapıldı. ${dakika} dakika sonra tekrar deneyin.`,
        { kod: 'oran-siniri' },
      );
    }

    const db = await veritabani();
    const kullanici = await db.collection(KOLEKSIYONLAR.kullanicilar).findOne({ eposta });

    const parolaOzeti = typeof kullanici?.parolaOzeti === 'string' ? kullanici.parolaOzeti : null;
    const parolaDogru = await parolaDenetle(parola, parolaOzeti);
    const hesapAktif = kullanici?.durum === 'aktif';

    if (!parolaDogru || !hesapAktif) {
      await basarisizDenemeKaydet(eposta, adres);
      await denetimYaz({
        eylem: 'giris-basarisiz',
        koleksiyon: KOLEKSIYONLAR.kullanicilar,
        belgeKimligi: kullanici ? String(kullanici._id) : undefined,
        kullaniciKimligi: kullanici ? String(kullanici._id) : undefined,
        eposta,
        adres,
        basarili: false,
        not: !kullanici
          ? 'Hesap bulunamadı.'
          : !hesapAktif
            ? `Hesap durumu: ${String(kullanici.durum)}`
            : 'Parola hatalı.',
      });
      // Artan gecikme: kaba kuvveti ekonomik olarak bitirir.
      await gecikmeyiUygula(sinir.gecikmeMs);
      return basarisiz(GENEL_HATA, { kod: 'kimlik-hatasi' });
    }

    // Parola doğru ama panel yetkisi yok: kimlik doğrulandığı için bunu
    // söylemek bilgi sızdırmaz ve kullanıcıyı gereksiz yere şaşırtmaz.
    const roller = Array.isArray(kullanici.roller) ? (kullanici.roller as string[]) : [];
    const paneleGirebilir = panelErisimiVarMi({
      kimlik: String(kullanici._id),
      eposta,
      roller,
      izinler: [],
    });

    if (!paneleGirebilir) {
      await denetimYaz({
        eylem: 'giris-basarisiz',
        koleksiyon: KOLEKSIYONLAR.kullanicilar,
        belgeKimligi: String(kullanici._id),
        kullaniciKimligi: String(kullanici._id),
        eposta,
        adres,
        basarili: false,
        not: `Panel yetkisi yok (roller: ${roller.join(', ') || 'yok'}).`,
      });
      return basarisiz('Bu hesabın yönetim paneline erişim yetkisi yok.', { kod: 'panel-yetkisi' });
    }

    /* --- Başarılı --- */

    // Maliyet parametreleri yükseltilmişse özeti sessizce yenile.
    if (parolaOzeti && yenilenmeliMi(parolaOzeti)) {
      const yeniOzet = await parolaOzetle(parola);
      await db
        .collection(KOLEKSIYONLAR.kullanicilar)
        .updateOne({ _id: kullanici._id }, { $set: { parolaOzeti: yeniOzet } });
    }

    await basariliGirisSonrasiTemizle(eposta);

    const tarayici = await istemciTarayicisi();
    await oturumAc(kullanici._id as ObjectId, { adres, tarayici });

    await db
      .collection(KOLEKSIYONLAR.kullanicilar)
      .updateOne(
        { _id: kullanici._id },
        { $set: { sonGiris: new Date(), sonGirisAdresi: adres }, $unset: { kilitBitis: '' } },
      );

    await denetimYaz({
      eylem: 'giris',
      koleksiyon: KOLEKSIYONLAR.kullanicilar,
      belgeKimligi: String(kullanici._id),
      kullaniciKimligi: String(kullanici._id),
      eposta,
      adres,
      basarili: true,
      not: `Roller: ${roller.join(', ')}`,
    });

    return basarili({ yol: devam }, 'Giriş başarılı.');
  } catch (hata) {
    console.error('[giris] beklenmeyen hata:', hata);
    return basarisiz('Giriş yapılamadı. Sorun sürerse teknik ekibe bildirin.', {
      kod: 'beklenmeyen',
    });
  }
}

/* --- ÇIKIŞ ---------------------------------------------------------------- */

export async function cikis(): Promise<EylemSonucu<{ yol: string }>> {
  const kullanici = await oturumKullanicisi();
  const adres = await istemciAdresi();

  await oturumKapat('cikis');

  if (kullanici) {
    await denetimYaz({
      eylem: 'cikis',
      koleksiyon: KOLEKSIYONLAR.kullanicilar,
      belgeKimligi: kullanici.kimlik,
      kullanici,
      adres,
      basarili: true,
    });
  }

  return basarili({ yol: '/admin/giris/' }, 'Çıkış yapıldı.');
}

/* --- PAROLA DEĞİŞTİRME ---------------------------------------------------- */

/**
 * Kullanıcı kendi parolasını değiştirir.
 *
 * Mevcut parola sorulur (oturum çalınmışsa saldırgan parolayı değiştirip
 * hesabı kalıcı olarak ele geçirmesin) ve değişiklikten sonra DİĞER tüm
 * oturumlar iptal edilir.
 */
export const parolaDegistir = oturumluEylem<FormData, { yol: string }>(
  async (veri, { kullanici, kaydet }) => {
    const mevcutParola = String(veri.get('mevcutParola') ?? '');
    const yeniParola = String(veri.get('yeniParola') ?? '');
    const yeniParolaTekrar = String(veri.get('yeniParolaTekrar') ?? '');

    if (!mevcutParola || !yeniParola) {
      return basarisiz('Mevcut ve yeni parola gerekli.', { kod: 'eksik-alan' });
    }
    if (yeniParola !== yeniParolaTekrar) {
      return basarisiz('Yeni parolalar birbiriyle uyuşmuyor.', {
        alanHatalari: { yeniParolaTekrar: 'Parolalar uyuşmuyor.' },
      });
    }
    if (yeniParola === mevcutParola) {
      return basarisiz('Yeni parola mevcut parolayla aynı olamaz.', {
        alanHatalari: { yeniParola: 'Farklı bir parola seçin.' },
      });
    }

    const guc = parolaGucunuDenetle(yeniParola, kullanici.eposta);
    if (!guc.gecerli) {
      return basarisiz(guc.sorunlar.join(' '), {
        alanHatalari: { yeniParola: guc.sorunlar[0] ?? 'Parola politikayı karşılamıyor.' },
      });
    }

    const db = await veritabani();
    const belge = await db
      .collection(KOLEKSIYONLAR.kullanicilar)
      .findOne({ _id: new ObjectId(kullanici.kimlik) });

    const ozet = typeof belge?.parolaOzeti === 'string' ? belge.parolaOzeti : null;
    if (!(await parolaDenetle(mevcutParola, ozet))) {
      return basarisiz('Mevcut parola hatalı.', {
        alanHatalari: { mevcutParola: 'Mevcut parola hatalı.' },
      });
    }

    await db
      .collection(KOLEKSIYONLAR.kullanicilar)
      .updateOne(
        { _id: new ObjectId(kullanici.kimlik) },
        { $set: { parolaOzeti: await parolaOzetle(yeniParola), parolaGuncellendi: new Date() } },
      );

    // Bu oturum ayakta kalır, diğerleri düşer.
    const iptal = await kullaniciOturumlariniIptalEt(kullanici.kimlik, 'parola-degisti');

    await kaydet({
      eylem: 'parola-degistir',
      koleksiyon: KOLEKSIYONLAR.kullanicilar,
      belgeKimligi: kullanici.kimlik,
      not: `${iptal} oturum iptal edildi.`,
    });

    return basarili({ yol: '/admin/' }, 'Parolanız değiştirildi. Diğer oturumlar kapatıldı.');
  },
);
