'use server';

import { ObjectId } from 'mongodb';
import { veritabani } from '@/lib/mongo/istemci';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { yayindakiSluglar } from '@/lib/mongo/sorgular/site';
import { SITE } from '@/lib/site';
import { guvenliIcYol } from '@/lib/guvenlik/adres';
import { denetimYaz } from '@/lib/yetki/denetim';
import { basarili, basarisiz, type EylemSonucu } from '@/lib/yetki/korumali-eylem';
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
} from '@/lib/yetki/oturum';
import {
  parolaDenetle,
  parolaGucunuDenetle,
  parolaOzetle,
  yenilenmeliMi,
} from '@/lib/yetki/parola';
import {
  dogrulamaMektubu,
  gonder,
  gonderimYapilandirildiMi,
  parolaSifirlamaMektubu,
} from '@/lib/site/eposta';
import {
  BULTEN_LISTELERI,
  coklunuDogrula,
  DENEYIM_SEVIYELERI,
  EN_COK_ILGI_ALANI,
  haftalikSaatDogrula,
  HEDEFLER,
  KURUM_SINIRI,
  secenekDogrula,
} from '@/lib/site/uyelik-profili';
import {
  anahtarOzetle,
  anahtarUret,
  DOGRULAMA_SURESI_MS,
  SIFIRLAMA_SURESI_MS,
  VARSAYILAN_UYE_ROLU,
} from '@/lib/site/uyelik';

/**
 * Site üyeliği eylemleri.
 *
 * `lib/yetki/eylemler.ts` PANEL girişidir ve `panelErisimiVarMi()` kapısı
 * taşır. Burası site üyesi içindir: aynı oturum mekanizmasını kullanır ama
 * panel yetkisi ARAMAZ.
 *
 * `korumaliEylem` KULLANILMAZ — o sarmalayıcı oturum ve izin ister, bu
 * eylemleri ise kimliği doğrulanmamış ziyaretçi çağırır. Bu yüzden her eylem
 * KENDİ korumasını kurar:
 *
 *  - Oran sınırlama (IP sert kilit + e-posta artan gecikme) — panel girişiyle
 *    aynı mekanizma, `lib/yetki/oran-sinirlama.ts`.
 *  - Girdi doğrulama: e-posta deseni şemadakiyle aynı, parola gücü
 *    `parolaGucunuDenetle` ile.
 *  - Rol girdiden OKUNMAZ: kayıt her zaman `['uye']` yazar. Aksi hâlde form
 *    alanına `roller=sahip` yazan biri kendini sahip yapardı.
 *  - Hesap varlığı SIZDIRILMAZ: hem kayıt hem parola sıfırlama, e-posta
 *    sistemde olsa da olmasa da AYNI iletiyi döner.
 *
 * `redirect()` çağrılmaz; hedef yol sonuçta döner ve gezinmeyi istemci yapar.
 */

/** Şemadaki `eposta` deseniyle birebir aynı. */
const EPOSTA_DESENI = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const ADSOYAD_SINIRI = 80;

type UyelikCiktisi = { yol?: string; epostaGonderildi?: boolean };

/* --- KAYIT ---------------------------------------------------------------- */

/**
 * Üye kaydı.
 *
 * HESAP SAYIMI SIZDIRILMAZ: e-posta zaten kayıtlıysa yeni kayıt açılmaz, ama
 * yanıt yeni kayıtla AYNI olur. Böylece form bir e-posta adresinin sistemde
 * olup olmadığını öğrenmek için kullanılamaz. Var olan adres için doğrulama
 * mektubu da yeniden gönderilmez — aksi hâlde form, sahibinin isteği olmadan
 * birine mektup yollatmaya yarardı.
 */
export async function uyeKaydol(veri: FormData): Promise<EylemSonucu<UyelikCiktisi>> {
  const hamEposta = String(veri.get('eposta') ?? '');
  const parola = String(veri.get('parola') ?? '');
  const adSoyad = String(veri.get('adSoyad') ?? '')
    .trim()
    .slice(0, ADSOYAD_SINIRI);
  const kosullar = veri.get('kosullar');
  /*
   * ÖĞRENME rolü — yetki rolü DEĞİL. `roller` alanı asla girdiden okunmaz;
   * bu alan yalnızca öğrenme rotasının kişiselleştirilmesi için saklanır.
   */
  const ogrenmeRolu = String(veri.get('ogrenmeRolu') ?? '')
    .trim()
    .slice(0, 60);

  /*
   * PROFİL ALANLARI — hepsi BEYAZ LİSTEYE karşı doğrulanır.
   *
   * Hiçbiri formdan geldiği gibi yazılmaz. Şema bu alanların çoğunu `enum`
   * ile sınırlıyor; doğrulamadan yazmak, geçersiz bir değerde şema
   * doğrulayıcısının TÜM KAYDI reddetmesine yol açardı — yani kötü niyet
   * gerekmeden, eski bir sekme bile kaydı bozabilirdi.
   *
   * Listede olmayan değer sessizce DÜŞÜRÜLÜR, kayıt reddedilmez: bu alanların
   * hiçbiri güvenlik kararı vermiyor ve kullanıcıyı kendi hatası olmayan bir
   * engelle karşılaştırmak yanlış olurdu. Güvenlik kararı veren tek alan
   * `roller` ve o zaten hiç okunmuyor.
   */
  const deneyimSeviyesi = secenekDogrula(veri.get('deneyimSeviyesi'), DENEYIM_SEVIYELERI);
  const hedef = secenekDogrula(veri.get('hedef'), HEDEFLER);
  const haftalikSaat = haftalikSaatDogrula(veri.get('haftalikSaat'));
  const kurum = String(veri.get('kurum') ?? '')
    .trim()
    .slice(0, KURUM_SINIRI);
  const bultenListeleri = coklunuDogrula(
    veri.getAll('bultenListeleri'),
    BULTEN_LISTELERI.map((s) => s.deger),
    BULTEN_LISTELERI.length,
  );
  /*
   * İlgi alanı ve sektör CANLI TAKSONOMİYE karşı doğrulanır, sabit listeye
   * değil: konular ve sektörler panelden yönetiliyor, kod içine kopyalanmış
   * bir liste ilk düzenlemede ayrışırdı. Bu okuma kaydın önünde yapılır
   * çünkü geçersiz slug şema doğrulayıcısını tetikleyip kaydı düşürürdü.
   */
  const gecerliKonular = await yayindakiSluglar(KOLEKSIYONLAR.konular);
  const gecerliSektorler = await yayindakiSluglar(KOLEKSIYONLAR.sektorler);
  const ilgiAlanlari = coklunuDogrula(
    veri.getAll('ilgiAlanlari'),
    gecerliKonular,
    EN_COK_ILGI_ALANI,
  );
  const sektorSlug = coklunuDogrula(
    veri.get('sektorSlug') ? [veri.get('sektorSlug') as string] : [],
    gecerliSektorler,
    1,
  )?.[0];

  const ORTAK_ILETI =
    'Kaydınız alındı. E-posta adresinize doğrulama bağlantısı gönderiyoruz; ' +
    'gelen kutunuzu kontrol edin.';

  if (!hamEposta || !parola) {
    return basarisiz('E-posta ve parola gerekli.', { kod: 'eksik-alan' });
  }
  if (!EPOSTA_DESENI.test(hamEposta.trim())) {
    return basarisiz('Geçerli bir e-posta adresi girin.', {
      kod: 'eposta-bicimi',
      alanHatalari: { eposta: 'Bu adres geçerli görünmüyor.' },
    });
  }
  // KVKK: açık rıza olmadan kayıt oluşturulmaz.
  if (kosullar !== 'on' && kosullar !== 'true') {
    return basarisiz('Devam etmek için kullanım şartlarını ve aydınlatma metnini onaylayın.', {
      kod: 'onay-gerekli',
      alanHatalari: { kosullar: 'Onay gerekli.' },
    });
  }

  const eposta = epostaNormalize(hamEposta);
  const guc = parolaGucunuDenetle(parola, eposta);
  if (!guc.gecerli) {
    const ileti = guc.sorunlar.join(' ');
    return basarisiz(ileti || 'Parola yeterince güçlü değil.', {
      kod: 'parola-gucu',
      alanHatalari: { parola: ileti || 'Daha güçlü bir parola seçin.' },
    });
  }

  const adres = await istemciAdresi();

  try {
    /*
     * Oran sınırlama kayıtta da uygulanır: aksi hâlde tek bir IP saniyeler
     * içinde binlerce hesap açıp `kullanicilar` koleksiyonunu doldurabilir.
     */
    const sinir = await sinirDurumu(eposta, adres);
    if (sinir.kilitli) {
      const dakika = Math.ceil((sinir.kalanSaniye ?? 0) / 60);
      return basarisiz(
        `Bu ağdan çok fazla deneme yapıldı. ${dakika} dakika sonra tekrar deneyin.`,
        {
          kod: 'oran-siniri',
        },
      );
    }

    const db = await veritabani();
    const koleksiyon = db.collection(KOLEKSIYONLAR.kullanicilar);
    const mevcut = await koleksiyon.findOne({ eposta }, { projection: { _id: 1 } });

    if (mevcut) {
      /*
       * Adres kayıtlı. Sayım sızdırmamak için aynı ileti döner. Gecikme de
       * uygulanır: yanıt süresi farkı da bir sızıntı kanalıdır.
       */
      await gecikmeyiUygula(sinir.gecikmeMs);
      await denetimYaz({
        eylem: 'olustur',
        koleksiyon: KOLEKSIYONLAR.kullanicilar,
        eposta,
        adres,
        basarili: false,
        not: 'Üyelik kaydı: adres zaten kayıtlı, yeni kayıt açılmadı.',
      });
      return basarili({ yol: '/giris/', epostaGonderildi: false }, ORTAK_ILETI);
    }

    const parolaOzeti = await parolaOzetle(parola);
    const anahtar = anahtarUret();
    const simdi = new Date();

    const sonuc = await koleksiyon.insertOne({
      eposta,
      parolaOzeti,
      parolaGuncellendi: simdi,
      // Rol GİRDİDEN OKUNMAZ.
      roller: [VARSAYILAN_UYE_ROLU],
      durum: 'aktif',
      epostaDogrulandi: false,
      epostaDogrulamaOzeti: anahtarOzetle(anahtar),
      epostaDogrulamaBitis: new Date(simdi.getTime() + DOGRULAMA_SURESI_MS),
      adSoyad: adSoyad || undefined,
      ogrenmeRolu: ogrenmeRolu || undefined,
      deneyimSeviyesi,
      ilgiAlanlari,
      sektorSlug,
      hedef,
      haftalikSaat,
      kurum: kurum || undefined,
      /*
       * KVKK: bülten rızası AMAÇ BAZLI kaydedilir. Tek bir `bulten: true`
       * bayrağı "hangi listeye rıza verildi" sorusunu cevaplamıyordu.
       * Hiçbir liste işaretlenmediyse rıza nesnesi hiç yazılmaz — boş bir
       * rıza kaydı, verilmemiş rızayı verilmiş gibi gösterirdi.
       */
      rizalar: bultenListeleri ? { bulten: true, bultenTarihi: simdi, bultenListeleri } : undefined,
      uyelikTarihi: simdi,
      olusturuldu: simdi,
      guncellendi: simdi,
    });

    const mektup = await gonder(
      dogrulamaMektubu(eposta, `${SITE.url}/uye-ol/dogrula/?anahtar=${anahtar}`),
    );

    await denetimYaz({
      eylem: 'olustur',
      koleksiyon: KOLEKSIYONLAR.kullanicilar,
      belgeKimligi: String(sonuc.insertedId),
      kullaniciKimligi: String(sonuc.insertedId),
      eposta,
      adres,
      basarili: true,
      not: `Site üyeliği açıldı. Doğrulama mektubu: ${mektup.gonderildi ? 'gönderildi' : mektup.neden}`,
    });

    // Kayıt sonrası oturum açılır: doğrulama beklenirken de site kullanılabilir.
    const tarayici = await istemciTarayicisi();
    await oturumAc(sonuc.insertedId, { adres, tarayici });

    return basarili(
      { yol: '/hesabim/', epostaGonderildi: mektup.gonderildi },
      mektup.gonderildi
        ? ORTAK_ILETI
        : 'Kaydınız alındı ve oturum açıldı. E-posta gönderimi henüz yapılandırılmadığı için ' +
            'doğrulama bağlantısı iletilemedi; doğrulamayı hesap sayfanızdan tekrar isteyebilirsiniz.',
    );
  } catch (hata) {
    console.error('[uyeKaydol] beklenmeyen hata:', hata);
    return basarisiz('Kayıt tamamlanamadı. Sorun sürerse bize bildirin.', { kod: 'beklenmeyen' });
  }
}

/* --- GİRİŞ / ÇIKIŞ -------------------------------------------------------- */

/**
 * Üye girişi.
 *
 * Panel girişinden tek farkı: `panelErisimiVarMi()` KAPISI YOK. Editör de bu
 * formdan girebilir — sitede oturum açmış olur, panel erişimi ayrıca
 * `app/(admin)/layout.tsx` tarafından denetlenir.
 */
export async function uyeGiris(veri: FormData): Promise<EylemSonucu<UyelikCiktisi>> {
  const hamEposta = String(veri.get('eposta') ?? '');
  const parola = String(veri.get('parola') ?? '');
  const devam = guvenliIcYol(String(veri.get('devam') ?? ''), '/hesabim/');

  const GENEL_HATA = 'E-posta veya parola hatalı.';

  if (!hamEposta || !parola) return basarisiz('E-posta ve parola gerekli.', { kod: 'eksik-alan' });

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
        not: `Üye girişi — oran sınırı (${sinir.eksen}).`,
      });
      const dakika = Math.ceil((sinir.kalanSaniye ?? 0) / 60);
      return basarisiz(`Çok fazla başarısız deneme. ${dakika} dakika sonra tekrar deneyin.`, {
        kod: 'oran-siniri',
      });
    }

    const db = await veritabani();
    const kullanici = await db.collection(KOLEKSIYONLAR.kullanicilar).findOne({ eposta });

    const parolaOzeti = typeof kullanici?.parolaOzeti === 'string' ? kullanici.parolaOzeti : null;
    // Hesap yoksa da aynı maliyette sahte özetleme yapılır (zamanlama sızıntısı).
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
        not: 'Üye girişi başarısız.',
      });
      await gecikmeyiUygula(sinir.gecikmeMs);
      return basarisiz(GENEL_HATA, { kod: 'kimlik-hatasi' });
    }

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
      not: 'Site girişi.',
    });

    return basarili({ yol: devam }, 'Giriş başarılı.');
  } catch (hata) {
    console.error('[uyeGiris] beklenmeyen hata:', hata);
    return basarisiz('Giriş yapılamadı. Sorun sürerse bize bildirin.', { kod: 'beklenmeyen' });
  }
}

export async function uyeCikis(): Promise<EylemSonucu<{ yol: string }>> {
  await oturumKapat('cikis');
  return basarili({ yol: '/' }, 'Çıkış yapıldı.');
}

/* --- E-POSTA DOĞRULAMA ---------------------------------------------------- */

/**
 * Doğrulama bağlantısını işler.
 *
 * Anahtar tek kullanımlıktır: doğrulandığı anda özet ve bitiş silinir. Aksi
 * hâlde bağlantı e-posta arşivinde süresiz bir yeniden doğrulama aracı olarak
 * kalırdı.
 */
export async function epostaDogrula(anahtar: string): Promise<EylemSonucu<{ eposta?: string }>> {
  if (!anahtar) return basarisiz('Doğrulama bağlantısı geçersiz.', { kod: 'anahtar-yok' });

  try {
    const db = await veritabani();
    const sonuc = await db.collection(KOLEKSIYONLAR.kullanicilar).findOneAndUpdate(
      {
        epostaDogrulamaOzeti: anahtarOzetle(anahtar),
        epostaDogrulamaBitis: { $gt: new Date() },
      },
      {
        $set: { epostaDogrulandi: true, guncellendi: new Date() },
        $unset: { epostaDogrulamaOzeti: '', epostaDogrulamaBitis: '' },
      },
      { returnDocument: 'after', projection: { eposta: 1 } },
    );

    if (!sonuc) {
      return basarisiz('Bağlantı geçersiz ya da süresi geçmiş. Yeni bir bağlantı isteyin.', {
        kod: 'anahtar-gecersiz',
      });
    }

    await denetimYaz({
      eylem: 'guncelle',
      koleksiyon: KOLEKSIYONLAR.kullanicilar,
      belgeKimligi: String(sonuc._id),
      kullaniciKimligi: String(sonuc._id),
      eposta: typeof sonuc.eposta === 'string' ? sonuc.eposta : undefined,
      adres: await istemciAdresi(),
      basarili: true,
      degisenAlanlar: ['epostaDogrulandi'],
      not: 'E-posta adresi doğrulandı.',
    });

    return basarili(
      { eposta: typeof sonuc.eposta === 'string' ? sonuc.eposta : undefined },
      'E-posta adresiniz doğrulandı.',
    );
  } catch (hata) {
    console.error('[epostaDogrula] beklenmeyen hata:', hata);
    return basarisiz('Doğrulama yapılamadı.', { kod: 'beklenmeyen' });
  }
}

/** Oturumdaki kullanıcı için doğrulama mektubunu yeniden gönderir. */
export async function dogrulamaYenidenGonder(): Promise<EylemSonucu<UyelikCiktisi>> {
  const kullanici = await oturumKullanicisi();
  if (!kullanici) return basarisiz('Bu işlem için giriş yapmalısınız.', { kod: 'oturum-yok' });

  const adres = await istemciAdresi();

  try {
    // Yeniden gönderim de sınırlanır: aksi hâlde mektup bombardımanı aracı olur.
    const sinir = await sinirDurumu(kullanici.eposta, adres);
    if (sinir.kilitli) {
      return basarisiz('Çok sık istek yaptınız. Biraz sonra tekrar deneyin.', {
        kod: 'oran-siniri',
      });
    }

    const anahtar = anahtarUret();
    const db = await veritabani();
    await db.collection(KOLEKSIYONLAR.kullanicilar).updateOne(
      { _id: new ObjectId(kullanici.kimlik) },
      {
        $set: {
          epostaDogrulamaOzeti: anahtarOzetle(anahtar),
          epostaDogrulamaBitis: new Date(Date.now() + DOGRULAMA_SURESI_MS),
          guncellendi: new Date(),
        },
      },
    );

    const mektup = await gonder(
      dogrulamaMektubu(kullanici.eposta, `${SITE.url}/uye-ol/dogrula/?anahtar=${anahtar}`),
    );

    return basarili(
      { epostaGonderildi: mektup.gonderildi },
      mektup.gonderildi
        ? 'Doğrulama bağlantısı gönderildi.'
        : 'E-posta gönderimi henüz yapılandırılmadı; bağlantı iletilemedi.',
    );
  } catch (hata) {
    console.error('[dogrulamaYenidenGonder] beklenmeyen hata:', hata);
    return basarisiz('İstek tamamlanamadı.', { kod: 'beklenmeyen' });
  }
}

/* --- PAROLA SIFIRLAMA ----------------------------------------------------- */

/**
 * Sıfırlama bağlantısı ister.
 *
 * Hesap varlığı SIZDIRILMAZ: adres kayıtlı olmasa da aynı ileti döner ve
 * hiçbir mektup gönderilmez.
 */
export async function parolaSifirlamaIste(veri: FormData): Promise<EylemSonucu<UyelikCiktisi>> {
  const hamEposta = String(veri.get('eposta') ?? '');
  /*
   * İLETİ SAĞLAYICI YAPILANDIRMASINA BAĞLI, HESABIN VARLIĞINA DEĞİL.
   *
   * Önceki hâli koşulsuz "bağlantı gönderildi" diyordu; e-posta sağlayıcısı
   * yapılandırılmadığı için hiçbir mektup gitmiyordu ve kullanıcı gelen
   * kutusunu boşuna bekliyordu.
   *
   * Düzeltmenin inceliği şu: `gonder()` sonucuna bakmak akışı bozar. Mektup
   * yalnızca hesap VARSA gönderiliyor, dolayısıyla "gönderilemedi" iletisi
   * ancak hesap varken görünürdü ve adresin kayıtlı olup olmadığını
   * sızdırırdı. Bu yüzden ileti, hesaptan bağımsız bir olguya —
   * `gonderimYapilandirildiMi()` — bağlanır: iki dalda da aynı cevap döner.
   */
  const ORTAK_ILETI = gonderimYapilandirildiMi()
    ? 'Adres kayıtlıysa parola sıfırlama bağlantısı gönderildi. Gelen kutunuzu kontrol edin.'
    : 'E-posta gönderimi henüz yapılandırılmadığı için sıfırlama bağlantısı iletilemiyor. ' +
      'Hesabınıza erişemiyorsanız bizimle iletişime geçin.';

  if (!EPOSTA_DESENI.test(hamEposta.trim())) {
    return basarisiz('Geçerli bir e-posta adresi girin.', { kod: 'eposta-bicimi' });
  }

  const eposta = epostaNormalize(hamEposta);
  const adres = await istemciAdresi();

  try {
    const sinir = await sinirDurumu(eposta, adres);
    if (sinir.kilitli) {
      return basarisiz('Çok fazla istek yapıldı. Biraz sonra tekrar deneyin.', {
        kod: 'oran-siniri',
      });
    }

    const db = await veritabani();
    const kullanici = await db
      .collection(KOLEKSIYONLAR.kullanicilar)
      .findOne({ eposta, durum: 'aktif' }, { projection: { _id: 1 } });

    if (kullanici) {
      const anahtar = anahtarUret();
      await db.collection(KOLEKSIYONLAR.kullanicilar).updateOne(
        { _id: kullanici._id },
        {
          $set: {
            parolaSifirlamaOzeti: anahtarOzetle(anahtar),
            parolaSifirlamaBitis: new Date(Date.now() + SIFIRLAMA_SURESI_MS),
            guncellendi: new Date(),
          },
        },
      );
      const mektup = await gonder(
        parolaSifirlamaMektubu(eposta, `${SITE.url}/parola-sifirla/?anahtar=${anahtar}`),
      );
      await denetimYaz({
        eylem: 'parola-degistir',
        koleksiyon: KOLEKSIYONLAR.kullanicilar,
        belgeKimligi: String(kullanici._id),
        kullaniciKimligi: String(kullanici._id),
        eposta,
        adres,
        basarili: true,
        not: `Parola sıfırlama bağlantısı istendi. Mektup: ${mektup.gonderildi ? 'gönderildi' : mektup.neden}`,
      });
    }

    // Yanıt süresi farkı sızıntı kanalı: her iki dalda da gecikme uygulanır.
    await gecikmeyiUygula(sinir.gecikmeMs);
    return basarili({}, ORTAK_ILETI);
  } catch (hata) {
    console.error('[parolaSifirlamaIste] beklenmeyen hata:', hata);
    return basarisiz('İstek tamamlanamadı.', { kod: 'beklenmeyen' });
  }
}

/**
 * Sıfırlama bağlantısıyla yeni parola belirler.
 *
 * Başarıda kullanıcının TÜM oturumları iptal edilir: parola değişiminin amacı
 * ele geçirilmiş bir erişimi kesmekse, eski oturumun yaşamaya devam etmesi o
 * amacı boşa çıkarır.
 */
export async function parolaSifirla(veri: FormData): Promise<EylemSonucu<{ yol: string }>> {
  const anahtar = String(veri.get('anahtar') ?? '');
  const parola = String(veri.get('parola') ?? '');

  if (!anahtar) return basarisiz('Bağlantı geçersiz.', { kod: 'anahtar-yok' });
  if (!parola) return basarisiz('Yeni parola gerekli.', { kod: 'eksik-alan' });

  try {
    const db = await veritabani();
    const koleksiyon = db.collection(KOLEKSIYONLAR.kullanicilar);

    const kullanici = await koleksiyon.findOne({
      parolaSifirlamaOzeti: anahtarOzetle(anahtar),
      parolaSifirlamaBitis: { $gt: new Date() },
      durum: 'aktif',
    });

    if (!kullanici) {
      return basarisiz('Bağlantı geçersiz ya da süresi geçmiş. Yeni bir bağlantı isteyin.', {
        kod: 'anahtar-gecersiz',
      });
    }

    const eposta = typeof kullanici.eposta === 'string' ? kullanici.eposta : '';
    const guc = parolaGucunuDenetle(parola, eposta);
    if (!guc.gecerli) {
      const ileti = guc.sorunlar.join(' ');
      return basarisiz(ileti || 'Parola yeterince güçlü değil.', {
        kod: 'parola-gucu',
        alanHatalari: { parola: ileti || 'Daha güçlü bir parola seçin.' },
      });
    }

    const simdi = new Date();
    await koleksiyon.updateOne(
      { _id: kullanici._id },
      {
        $set: {
          parolaOzeti: await parolaOzetle(parola),
          parolaGuncellendi: simdi,
          guncellendi: simdi,
        },
        // Anahtar tek kullanımlık.
        $unset: { parolaSifirlamaOzeti: '', parolaSifirlamaBitis: '', kilitBitis: '' },
      },
    );

    await kullaniciOturumlariniIptalEt(kullanici._id as ObjectId, 'parola-degisti');

    await denetimYaz({
      eylem: 'parola-degistir',
      koleksiyon: KOLEKSIYONLAR.kullanicilar,
      belgeKimligi: String(kullanici._id),
      kullaniciKimligi: String(kullanici._id),
      eposta,
      adres: await istemciAdresi(),
      basarili: true,
      not: 'Parola sıfırlama bağlantısıyla değiştirildi; tüm oturumlar iptal edildi.',
    });

    return basarili(
      { yol: '/giris/' },
      'Parolanız değişti. Yeni parolanızla giriş yapabilirsiniz.',
    );
  } catch (hata) {
    console.error('[parolaSifirla] beklenmeyen hata:', hata);
    return basarisiz('Parola değiştirilemedi.', { kod: 'beklenmeyen' });
  }
}

/* --- HESAP --------------------------------------------------------------- */

/** Üye kendi görünen adını değiştirir. Başka hiçbir alan buradan yazılamaz. */
export async function hesabiGuncelle(veri: FormData): Promise<EylemSonucu<undefined>> {
  const kullanici = await oturumKullanicisi();
  if (!kullanici) return basarisiz('Bu işlem için giriş yapmalısınız.', { kod: 'oturum-yok' });

  const adSoyad = String(veri.get('adSoyad') ?? '')
    .trim()
    .slice(0, ADSOYAD_SINIRI);

  try {
    const db = await veritabani();
    await db.collection(KOLEKSIYONLAR.kullanicilar).updateOne(
      { _id: new ObjectId(kullanici.kimlik) },
      // Yalnızca `adSoyad`. Rol, durum ve e-posta buradan DEĞİŞTİRİLEMEZ.
      { $set: { adSoyad: adSoyad || undefined, guncellendi: new Date() } },
    );

    await denetimYaz({
      eylem: 'guncelle',
      koleksiyon: KOLEKSIYONLAR.kullanicilar,
      belgeKimligi: kullanici.kimlik,
      kullaniciKimligi: kullanici.kimlik,
      eposta: kullanici.eposta,
      adres: await istemciAdresi(),
      basarili: true,
      degisenAlanlar: ['adSoyad'],
      not: 'Üye kendi adını güncelledi.',
    });

    return basarili(undefined, 'Bilgileriniz kaydedildi.');
  } catch (hata) {
    console.error('[hesabiGuncelle] beklenmeyen hata:', hata);
    return basarisiz('Kaydedilemedi.', { kod: 'beklenmeyen' });
  }
}
