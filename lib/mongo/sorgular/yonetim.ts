import { ObjectId, type Filter, type Sort } from 'mongodb';
import { veritabani } from '@/lib/mongo/istemci';
import { degisenAlanlar, denetimYaz, surumKaydet } from '@/lib/yetki/denetim';
import type { OturumKullanicisi } from '@/lib/yetki/oturum';
import { KOLEKSIYON_IZNI, izinVarMi, nesneYetkisi, yazilabilirAlanlar } from '@/lib/yetki/roller';

/**
 * Panel veri erişim katmanı.
 *
 * GÜVENLİK SÖZLEŞMESİ: Yazma fonksiyonları oturum kullanıcısını ZORUNLU
 * parametre olarak alır. Böylece bir eylem yetki kontrolünü atlamak isterse
 * TypeScript derlemez — koruma "unutulabilir bir kural" olmaktan çıkar.
 *
 * Her yazma üç şeyi birlikte yapar:
 *  1. Koleksiyon düzeyi izin + nesne düzeyi yetki kontrolü
 *  2. Alan beyaz listesi (kütle atama koruması)
 *  3. Sürüm kaydı + denetim kaydı
 */

export type Belge = Record<string, unknown>;

export type ListeSecenekleri = {
  filtreler?: Record<string, string | undefined>;
  arama?: string;
  aramaAlanlari?: readonly string[];
  siralama?: Sort;
  sayfa?: number;
  sayfaBoyutu?: number;
};

export type ListeSonucu = {
  kayitlar: Belge[];
  toplam: number;
  sayfa: number;
  sayfaBoyutu: number;
  sayfaSayisi: number;
};

const VARSAYILAN_SAYFA_BOYUTU = 25;
const AZAMI_SAYFA_BOYUTU = 200;

/** Düzenli ifade meta karakterlerini kaçırır — arama girdisi desen olamaz. */
function desenKacir(metin: string): string {
  return metin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function filtreKur(secenekler: ListeSecenekleri): Filter<Belge> {
  const kosullar: Filter<Belge>[] = [];

  for (const [ad, deger] of Object.entries(secenekler.filtreler ?? {})) {
    if (!deger || deger === 'tumu') continue;
    // Sayısal filtreler (ör. yönlendirme kodu) metin olarak gelir.
    const sayi = Number(deger);
    if (deger !== '' && !Number.isNaN(sayi) && String(sayi) === deger) {
      kosullar.push({ $or: [{ [ad]: deger }, { [ad]: sayi }] } as Filter<Belge>);
    } else if (deger === 'true' || deger === 'false') {
      kosullar.push({ [ad]: deger === 'true' } as Filter<Belge>);
    } else {
      kosullar.push({ [ad]: deger } as Filter<Belge>);
    }
  }

  const arama = secenekler.arama?.trim();
  if (arama && secenekler.aramaAlanlari?.length) {
    const desen = new RegExp(desenKacir(arama), 'i');
    kosullar.push({
      $or: secenekler.aramaAlanlari.map((alan) => ({ [alan]: desen })),
    } as Filter<Belge>);
  }

  return kosullar.length ? { $and: kosullar } : {};
}

/* --- OKUMA ---------------------------------------------------------------- */

export async function kayitlariListele(
  koleksiyon: string,
  secenekler: ListeSecenekleri = {},
): Promise<ListeSonucu> {
  const db = await veritabani();
  const filtre = filtreKur(secenekler);

  const sayfaBoyutu = Math.min(
    Math.max(1, secenekler.sayfaBoyutu ?? VARSAYILAN_SAYFA_BOYUTU),
    AZAMI_SAYFA_BOYUTU,
  );
  const sayfa = Math.max(1, secenekler.sayfa ?? 1);

  const [kayitlar, toplam] = await Promise.all([
    db
      .collection(koleksiyon)
      .find(filtre)
      .sort(secenekler.siralama ?? { olusturuldu: -1 })
      .skip((sayfa - 1) * sayfaBoyutu)
      .limit(sayfaBoyutu)
      .toArray(),
    db.collection(koleksiyon).countDocuments(filtre),
  ]);

  return {
    kayitlar: kayitlar.map((k) => ({ ...k, _id: String(k._id) })),
    toplam,
    sayfa,
    sayfaBoyutu,
    sayfaSayisi: Math.max(1, Math.ceil(toplam / sayfaBoyutu)),
  };
}

export async function kayitGetir(koleksiyon: string, kimlik: string): Promise<Belge | null> {
  if (!ObjectId.isValid(kimlik)) return null;
  const db = await veritabani();
  const belge = await db.collection(koleksiyon).findOne({ _id: new ObjectId(kimlik) });
  return belge ? { ...belge, _id: String(belge._id) } : null;
}

/** Slug ile getirir — düzenleme ekranına slug'la girilebilmesi için. */
export async function kayitSlugIleGetir(
  koleksiyon: string,
  anahtarAlan: string,
  deger: string,
): Promise<Belge | null> {
  const db = await veritabani();
  const belge = await db.collection(koleksiyon).findOne({ [anahtarAlan]: deger });
  return belge ? { ...belge, _id: String(belge._id) } : null;
}

/** İlişki alanları için: hedef koleksiyondan slug + görünen ad listesi. */
export async function iliskiSecenekleri(
  koleksiyon: string,
  anahtarAlan = 'slug',
  baslikAlani = 'ad',
): Promise<{ deger: string; etiket: string }[]> {
  const db = await veritabani();
  const kayitlar = await db
    .collection(koleksiyon)
    .find({}, { projection: { [anahtarAlan]: 1, [baslikAlani]: 1, baslik: 1, ad: 1 } })
    .limit(500)
    .toArray();

  return kayitlar
    .map((k) => {
      const deger = k[anahtarAlan];
      if (typeof deger !== 'string') return null;
      const etiket =
        (typeof k[baslikAlani] === 'string' && k[baslikAlani]) ||
        (typeof k.ad === 'string' && k.ad) ||
        (typeof k.baslik === 'string' && k.baslik) ||
        deger;
      return { deger, etiket: String(etiket) };
    })
    .filter((x): x is { deger: string; etiket: string } => x !== null)
    .sort((a, b) => a.etiket.localeCompare(b.etiket, 'tr'));
}

/* --- YAZMA ---------------------------------------------------------------- */

export type YazmaSonucu =
  | { tamam: true; kimlik: string; surumNo?: number | null }
  | { tamam: false; hata: string; alan?: string };

/** MongoDB doğrulama hatasını editöre anlamlı bir iletiye çevirir. */
function mongoHatasiCevir(hata: unknown): { hata: string; alan?: string } {
  const kod = (hata as { code?: number }).code;

  if (kod === 11000) {
    const anahtar = Object.keys(
      (hata as { keyPattern?: Record<string, unknown> }).keyPattern ?? {},
    )[0];
    return {
      hata: anahtar
        ? `Bu "${anahtar}" değeri başka bir kayıtta kullanılıyor. Tekil olmalı.`
        : 'Bu kayıt zaten var (tekillik ihlali).',
      alan: anahtar,
    };
  }

  if (kod === 121) {
    const ayrinti = (hata as { errInfo?: { details?: { schemaRulesNotSatisfied?: unknown[] } } })
      .errInfo?.details?.schemaRulesNotSatisfied;

    // Hangi alanların kuralı ihlal ettiğini çıkarmaya çalış.
    const alanlar = new Set<string>();
    const gez = (dugum: unknown) => {
      if (!dugum || typeof dugum !== 'object') return;
      if (Array.isArray(dugum)) {
        dugum.forEach(gez);
        return;
      }
      const nesne = dugum as Record<string, unknown>;
      if (typeof nesne.propertyName === 'string') alanlar.add(nesne.propertyName);
      if (Array.isArray(nesne.missingProperties)) {
        for (const eksik of nesne.missingProperties) {
          if (typeof eksik === 'string') alanlar.add(eksik);
        }
      }
      Object.values(nesne).forEach(gez);
    };
    gez(ayrinti);

    const liste = [...alanlar];
    return {
      hata: liste.length
        ? `Veritabanı doğrulaması reddetti. Sorunlu alan(lar): ${liste.join(', ')}.`
        : 'Veritabanı doğrulaması reddetti. Zorunlu bir alan eksik veya bir değer beklenen biçimde değil.',
      alan: liste[0],
    };
  }

  console.error('[yonetim] beklenmeyen mongo hatası:', hata);
  return { hata: 'Kayıt yazılamadı. Sorun sürerse teknik ekibe bildirin.' };
}

/**
 * Yeni kayıt oluşturur.
 *
 * `kullanici` zorunludur: yetki kontrolü bu fonksiyonun içinde yapılır,
 * çağıranın iyi niyetine bırakılmaz.
 */
export async function kayitOlustur(parametreler: {
  koleksiyon: string;
  veri: Belge;
  kullanici: OturumKullanicisi;
  adres?: string;
}): Promise<YazmaSonucu> {
  const { koleksiyon, veri, kullanici, adres } = parametreler;

  const izinler = KOLEKSIYON_IZNI[koleksiyon];
  if (!izinler) return { tamam: false, hata: 'Bu koleksiyon panelden yönetilemiyor.' };
  if (!izinVarMi(kullanici.roller, izinler.yaz)) {
    return { tamam: false, hata: 'Bu işlem için yetkiniz yok.' };
  }

  const nesne = nesneYetkisi({ kullanici, koleksiyon, belge: null, eylem: 'yaz' });
  if (!nesne.izinli) return { tamam: false, hata: nesne.neden };

  const suzulmus = yazilabilirAlanlar(koleksiyon, veri);
  if (!suzulmus) return { tamam: false, hata: 'Bu koleksiyona panelden yazılamaz.' };

  const simdi = new Date();
  const yazilacak: Belge = { ...suzulmus.veri, olusturuldu: simdi, guncellendi: simdi };

  // Yazar rolü kendi adına damgalanır; başkasının adına içerik açamaz.
  if (koleksiyon === 'icerikler' && kullanici.yazarSlug && !yazilacak.yazarSlug) {
    yazilacak.yazarSlug = kullanici.yazarSlug;
  }

  try {
    const db = await veritabani();
    const sonuc = await db.collection(koleksiyon).insertOne(yazilacak);
    const kimlik = String(sonuc.insertedId);

    await denetimYaz({
      eylem: 'olustur',
      koleksiyon,
      belgeKimligi: kimlik,
      belgeSlug: typeof yazilacak.slug === 'string' ? yazilacak.slug : undefined,
      kullanici,
      adres,
      degisenAlanlar: Object.keys(suzulmus.veri),
      yeniDurum: typeof yazilacak.durum === 'string' ? yazilacak.durum : undefined,
      not: suzulmus.ayiklanan.length
        ? `Yazılamayan alanlar ayıklandı: ${suzulmus.ayiklanan.join(', ')}`
        : undefined,
    });

    return { tamam: true, kimlik };
  } catch (hata) {
    return { tamam: false, ...mongoHatasiCevir(hata) };
  }
}

/** Var olan kaydı günceller; önceki hâli sürüm geçmişine yazar. */
export async function kayitGuncelle(parametreler: {
  koleksiyon: string;
  kimlik: string;
  veri: Belge;
  kullanici: OturumKullanicisi;
  adres?: string;
}): Promise<YazmaSonucu> {
  const { koleksiyon, kimlik, veri, kullanici, adres } = parametreler;

  const izinler = KOLEKSIYON_IZNI[koleksiyon];
  if (!izinler) return { tamam: false, hata: 'Bu koleksiyon panelden yönetilemiyor.' };
  if (!izinVarMi(kullanici.roller, izinler.yaz)) {
    return { tamam: false, hata: 'Bu işlem için yetkiniz yok.' };
  }
  if (!ObjectId.isValid(kimlik)) return { tamam: false, hata: 'Geçersiz kayıt kimliği.' };

  const db = await veritabani();
  const mevcut = await db.collection(koleksiyon).findOne({ _id: new ObjectId(kimlik) });
  if (!mevcut) return { tamam: false, hata: 'Kayıt bulunamadı.' };

  const nesne = nesneYetkisi({ kullanici, koleksiyon, belge: mevcut, eylem: 'yaz' });
  if (!nesne.izinli) return { tamam: false, hata: nesne.neden };

  const suzulmus = yazilabilirAlanlar(koleksiyon, veri);
  if (!suzulmus) return { tamam: false, hata: 'Bu koleksiyona panelden yazılamaz.' };

  const degisen = degisenAlanlar(mevcut, suzulmus.veri);
  if (!degisen.length) return { tamam: true, kimlik, surumNo: null };

  try {
    // Önceki hâl sürüm geçmişine — yanlış düzenleme geri alınabilsin.
    const surumNo = await surumKaydet({
      koleksiyon,
      belgeKimligi: kimlik,
      belgeSlug: typeof mevcut.slug === 'string' ? mevcut.slug : undefined,
      anlikGoruntu: mevcut,
      kullanici,
      degisenAlanlar: degisen,
    });

    await db
      .collection(koleksiyon)
      .updateOne(
        { _id: new ObjectId(kimlik) },
        { $set: { ...suzulmus.veri, guncellendi: new Date() } },
      );

    await denetimYaz({
      eylem: 'guncelle',
      koleksiyon,
      belgeKimligi: kimlik,
      belgeSlug: typeof mevcut.slug === 'string' ? mevcut.slug : undefined,
      kullanici,
      adres,
      degisenAlanlar: degisen,
      oncekiDurum: typeof mevcut.durum === 'string' ? mevcut.durum : undefined,
      yeniDurum: typeof suzulmus.veri.durum === 'string' ? suzulmus.veri.durum : undefined,
      not: suzulmus.ayiklanan.length
        ? `Yazılamayan alanlar ayıklandı: ${suzulmus.ayiklanan.join(', ')}`
        : undefined,
    });

    return { tamam: true, kimlik, surumNo };
  } catch (hata) {
    return { tamam: false, ...mongoHatasiCevir(hata) };
  }
}

/** Durum geçişi — yayın akışının tek kapısı. */
export async function durumDegistir(parametreler: {
  koleksiyon: string;
  kimlik: string;
  yeniDurum: string;
  kullanici: OturumKullanicisi;
  adres?: string;
}): Promise<YazmaSonucu> {
  const { koleksiyon, kimlik, yeniDurum, kullanici, adres } = parametreler;

  const GECERLI = ['taslak', 'incelemede', 'yayinda', 'arsiv'];
  if (!GECERLI.includes(yeniDurum)) return { tamam: false, hata: 'Geçersiz durum.' };
  if (!ObjectId.isValid(kimlik)) return { tamam: false, hata: 'Geçersiz kayıt kimliği.' };

  const izinler = KOLEKSIYON_IZNI[koleksiyon];
  if (!izinler) return { tamam: false, hata: 'Bu koleksiyon panelden yönetilemiyor.' };

  // Yayına alma ve arşivleme ayrı ve daha yüksek bir izin ister.
  const yayinIslemi = yeniDurum === 'yayinda' || yeniDurum === 'arsiv';
  const gerekenIzin = yayinIslemi
    ? koleksiyon === 'icerikler'
      ? 'icerik:yayinla'
      : izinler.yaz
    : izinler.yaz;

  if (!izinVarMi(kullanici.roller, gerekenIzin)) {
    return {
      tamam: false,
      hata: yayinIslemi
        ? 'Yayımlama yetkiniz yok. İçeriği "İncelemede" durumuna alıp editöre iletin.'
        : 'Bu işlem için yetkiniz yok.',
    };
  }

  const db = await veritabani();
  const mevcut = await db.collection(koleksiyon).findOne({ _id: new ObjectId(kimlik) });
  if (!mevcut) return { tamam: false, hata: 'Kayıt bulunamadı.' };

  const nesne = nesneYetkisi({ kullanici, koleksiyon, belge: mevcut, eylem: 'yaz' });
  if (!nesne.izinli) return { tamam: false, hata: nesne.neden };

  try {
    await db
      .collection(koleksiyon)
      .updateOne(
        { _id: new ObjectId(kimlik) },
        { $set: { durum: yeniDurum, guncellendi: new Date() } },
      );

    await denetimYaz({
      eylem: yeniDurum === 'yayinda' ? 'yayinla' : 'durum-degistir',
      koleksiyon,
      belgeKimligi: kimlik,
      belgeSlug: typeof mevcut.slug === 'string' ? mevcut.slug : undefined,
      kullanici,
      adres,
      oncekiDurum: typeof mevcut.durum === 'string' ? mevcut.durum : undefined,
      yeniDurum,
    });

    return { tamam: true, kimlik };
  } catch (hata) {
    return { tamam: false, ...mongoHatasiCevir(hata) };
  }
}

/** Kaydı siler. Silinen belge sürüm geçmişinde kalır. */
export async function kayitSil(parametreler: {
  koleksiyon: string;
  kimlik: string;
  kullanici: OturumKullanicisi;
  adres?: string;
}): Promise<YazmaSonucu> {
  const { koleksiyon, kimlik, kullanici, adres } = parametreler;

  const izinler = KOLEKSIYON_IZNI[koleksiyon];
  if (!izinler) return { tamam: false, hata: 'Bu koleksiyon panelden yönetilemiyor.' };
  if (!izinVarMi(kullanici.roller, izinler.sil)) {
    return { tamam: false, hata: 'Silme yetkiniz yok.' };
  }
  if (!ObjectId.isValid(kimlik)) return { tamam: false, hata: 'Geçersiz kayıt kimliği.' };

  const db = await veritabani();
  const mevcut = await db.collection(koleksiyon).findOne({ _id: new ObjectId(kimlik) });
  if (!mevcut) return { tamam: false, hata: 'Kayıt bulunamadı.' };

  const nesne = nesneYetkisi({ kullanici, koleksiyon, belge: mevcut, eylem: 'sil' });
  if (!nesne.izinli) return { tamam: false, hata: nesne.neden };

  try {
    // Silinen belge geri getirilebilsin diye önce anlık görüntü alınır.
    await surumKaydet({
      koleksiyon,
      belgeKimligi: kimlik,
      belgeSlug: typeof mevcut.slug === 'string' ? mevcut.slug : undefined,
      anlikGoruntu: mevcut,
      kullanici,
      not: 'Silme öncesi anlık görüntü.',
    });

    await db.collection(koleksiyon).deleteOne({ _id: new ObjectId(kimlik) });

    await denetimYaz({
      eylem: 'sil',
      koleksiyon,
      belgeKimligi: kimlik,
      belgeSlug: typeof mevcut.slug === 'string' ? mevcut.slug : undefined,
      kullanici,
      adres,
      oncekiDurum: typeof mevcut.durum === 'string' ? mevcut.durum : undefined,
    });

    return { tamam: true, kimlik };
  } catch (hata) {
    return { tamam: false, ...mongoHatasiCevir(hata) };
  }
}

export type SurumKaydiGorunumu = {
  _id: string;
  surumNo: number;
  zaman?: Date;
  kullaniciEpostasi?: string;
  degisenAlanlar?: string[];
  not?: string;
  anlikGoruntu?: Belge;
};

/** Bir belgenin sürüm geçmişi. */
export async function surumGecmisi(
  koleksiyon: string,
  kimlik: string,
  enCok = 20,
): Promise<SurumKaydiGorunumu[]> {
  const db = await veritabani();
  const kayitlar = await db
    .collection('icerik_surumleri')
    .find({ koleksiyon, belgeKimligi: kimlik })
    .sort({ surumNo: -1 })
    .limit(enCok)
    .toArray();

  return kayitlar.map((k) => ({
    _id: String(k._id),
    surumNo: typeof k.surumNo === 'number' ? k.surumNo : 0,
    zaman: k.zaman instanceof Date ? k.zaman : undefined,
    kullaniciEpostasi: typeof k.kullaniciEpostasi === 'string' ? k.kullaniciEpostasi : undefined,
    degisenAlanlar: Array.isArray(k.degisenAlanlar) ? (k.degisenAlanlar as string[]) : undefined,
    not: typeof k.not === 'string' ? k.not : undefined,
    anlikGoruntu:
      k.anlikGoruntu && typeof k.anlikGoruntu === 'object' ? (k.anlikGoruntu as Belge) : undefined,
  }));
}
