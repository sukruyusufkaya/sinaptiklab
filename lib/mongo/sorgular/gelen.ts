import { ObjectId, type Filter } from 'mongodb';
import {
  ARAMA_GORUNUMLERI,
  FORM_TURLERI,
  ISLEM_DURUMLARI,
  ONAY_DURUMLARI,
} from '@/lib/admin/gelen-sabitleri';
import { alanDegeriniMaskele, epostaMaskele, zamanMetni } from '@/lib/admin/kisisel-veri';
import { veritabani } from '@/lib/mongo/istemci';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import { denetimYaz } from '@/lib/yetki/denetim';
import { YetkiHatasi, type OturumKullanicisi } from '@/lib/yetki/oturum';
import { izinVarMi, KOLEKSIYON_IZNI } from '@/lib/yetki/roller';

/**
 * Siteden TOPLANAN verinin okuma katmanı: bülten aboneleri, form kayıtları,
 * test ve AI Readiness sonuçları, site içi arama sorguları.
 *
 * GÜVENLİK SÖZLEŞMESİ (lib/mongo/sorgular/yonetim.ts ile aynı kalıp):
 * Buradaki her fonksiyon oturum kullanıcısını ZORUNLU parametre olarak alır ve
 * izin denetimini kendi içinde yapar. Böylece bir ekran veya eylem kontrolü
 * atlamak isterse TypeScript derlemez — koruma "unutulabilir bir kural"
 * olmaktan çıkar. Okuma tarafında da geçerli: bu koleksiyonların dördü KİŞİSEL
 * VERİ taşır, `kayitlariListele` gibi serbest bir okuma yolu bırakılamaz.
 *
 * İki ek kural:
 *
 *  1. `_id` dışa DİZE olarak çıkar, `ObjectId` sınırdan geçmez. Tarihler de
 *     dizeye çevrilir; görünüm tipleri yalnızca ilkel değer taşır.
 *  2. E-posta gibi alanlar MASKELENMİŞ döner (bkz. `lib/admin/kisisel-veri.ts`).
 *     Ham değer yalnızca `gelenKaydiAc` ile, tek kayıt için, `kisiselveri:disaAktar`
 *     izniyle ve denetim kaydı yazılarak açılır.
 *
 * Bu modülde YAZMA yoktur. Editoryal iş akışı alanları (`islemDurumu`,
 * `inceledi`) `lib/admin/gelen-eylemleri.ts` içinden değişir.
 */

/* --- ORTAK --------------------------------------------------------------- */

export type GelenListesi<T> = {
  kayitlar: T[];
  toplam: number;
  sayfa: number;
  sayfaBoyutu: number;
  sayfaSayisi: number;
};

export type SayfaSecenekleri = {
  sayfa?: number;
  sayfaBoyutu?: number;
};

const VARSAYILAN_SAYFA_BOYUTU = 40;
const AZAMI_SAYFA_BOYUTU = 200;

function sayfaHesapla(secenekler: SayfaSecenekleri): { sayfa: number; sayfaBoyutu: number } {
  const sayfaBoyutu = Math.min(
    Math.max(1, secenekler.sayfaBoyutu ?? VARSAYILAN_SAYFA_BOYUTU),
    AZAMI_SAYFA_BOYUTU,
  );
  return { sayfa: Math.max(1, secenekler.sayfa ?? 1), sayfaBoyutu };
}

/**
 * Koleksiyonun okuma iznini rol matrisinden alır ve yoksa atar.
 *
 * Ekranlar ayrıca `notFound()` ile kapanır; bu, ekran gizlemenin yetmediği
 * durumlar için ikinci kapı (doğrudan fonksiyon çağrısı, yeni bir rota).
 */
function okumaIzniGerekli(kullanici: OturumKullanicisi, koleksiyon: string): void {
  const izinler = KOLEKSIYON_IZNI[koleksiyon];
  if (!izinler) {
    throw new YetkiHatasi(`Bu koleksiyon panelden okunamıyor (${koleksiyon}).`, 'izin-yok');
  }
  if (!izinVarMi(kullanici.roller, izinler.oku)) {
    throw new YetkiHatasi(`Bu kaydı görüntüleme yetkiniz yok (${izinler.oku}).`, 'izin-yok');
  }
}

/** Enum süzgeçleri: URL'den gelen değer beyaz listede yoksa süzgeç uygulanmaz. */
function enumSuzgeci(deger: string | undefined, gecerli: readonly string[]): string | undefined {
  if (!deger || deger === 'tumu') return undefined;
  return gecerli.includes(deger) ? deger : undefined;
}

function metin(deger: unknown): string | undefined {
  return typeof deger === 'string' && deger.length > 0 ? deger : undefined;
}

function sayi(deger: unknown): number | undefined {
  return typeof deger === 'number' && Number.isFinite(deger) ? deger : undefined;
}

function mantik(deger: unknown): boolean | undefined {
  return typeof deger === 'boolean' ? deger : undefined;
}

function tarihMetni(deger: unknown): string | undefined {
  if (deger instanceof Date) return deger.toISOString();
  return undefined;
}

async function listele<T>(
  koleksiyon: string,
  filtre: Filter<Record<string, unknown>>,
  siralama: Record<string, 1 | -1>,
  secenekler: SayfaSecenekleri,
  donustur: (belge: Record<string, unknown>) => T,
): Promise<GelenListesi<T>> {
  const { sayfa, sayfaBoyutu } = sayfaHesapla(secenekler);
  const db = await veritabani();

  const [belgeler, toplam] = await Promise.all([
    db
      .collection(koleksiyon)
      .find(filtre)
      .sort(siralama)
      .skip((sayfa - 1) * sayfaBoyutu)
      .limit(sayfaBoyutu)
      .toArray(),
    db.collection(koleksiyon).countDocuments(filtre),
  ]);

  return {
    kayitlar: belgeler.map((belge) => donustur(belge as Record<string, unknown>)),
    toplam,
    sayfa,
    sayfaBoyutu,
    sayfaSayisi: Math.max(1, Math.ceil(toplam / sayfaBoyutu)),
  };
}

/* --- ABONELER ------------------------------------------------------------ */

export type AboneGorunumu = {
  kimlik: string;
  /** Maskeli e-posta; ham değer için `gelenKaydiAc`. */
  eposta: string;
  onayDurumu: string;
  onayTarihi?: string;
  onayKaynagi?: string;
  politikaSurumu?: string;
  listeler: string[];
  cikisTarihi?: string;
  olusturuldu?: string;
};

export async function aboneleriListele(
  kullanici: OturumKullanicisi,
  secenekler: SayfaSecenekleri & { onayDurumu?: string } = {},
): Promise<GelenListesi<AboneGorunumu>> {
  okumaIzniGerekli(kullanici, KOLEKSIYONLAR.aboneler);

  const filtre: Filter<Record<string, unknown>> = {};
  const onay = enumSuzgeci(secenekler.onayDurumu, ONAY_DURUMLARI);
  if (onay) filtre.onayDurumu = onay;

  return listele(
    KOLEKSIYONLAR.aboneler,
    filtre,
    { olusturuldu: -1 },
    secenekler,
    (belge): AboneGorunumu => ({
      kimlik: String(belge._id),
      eposta: epostaMaskele(metin(belge.eposta) ?? ''),
      onayDurumu: metin(belge.onayDurumu) ?? 'bilinmiyor',
      onayTarihi: tarihMetni(belge.onayTarihi),
      onayKaynagi: metin(belge.onayKaynagi),
      politikaSurumu: metin(belge.politikaSurumu),
      listeler: Array.isArray(belge.listeler)
        ? belge.listeler.filter((l): l is string => typeof l === 'string')
        : [],
      cikisTarihi: tarihMetni(belge.cikisTarihi),
      olusturuldu: tarihMetni(belge.olusturuldu),
    }),
  );
}

/* --- FORM KAYITLARI ------------------------------------------------------ */

export type FormKaydiGorunumu = {
  kimlik: string;
  formTuru: string;
  islemDurumu: string;
  kaynakYol?: string;
  politikaSurumu?: string;
  /** ISO dize; ekran `saklamaDurumu` ile yorumlar. */
  saklamaBitis?: string;
  olusturuldu?: string;
  /** Serbest şemalı form alanları, maskelenmiş hâlde. */
  alanlar: { anahtar: string; metin: string; maskeli: boolean }[];
};

/** Serbest `alanlar` nesnesini maskeli anahtar/değer çiftlerine çevirir. */
function formAlanlari(deger: unknown): FormKaydiGorunumu['alanlar'] {
  if (!deger || typeof deger !== 'object' || Array.isArray(deger)) return [];
  return Object.entries(deger as Record<string, unknown>)
    .slice(0, 12)
    .map(([anahtar, ham]) => ({ anahtar, ...alanDegeriniMaskele(anahtar, ham) }));
}

export async function formKayitlariniListele(
  kullanici: OturumKullanicisi,
  secenekler: SayfaSecenekleri & { formTuru?: string; islemDurumu?: string } = {},
): Promise<GelenListesi<FormKaydiGorunumu>> {
  okumaIzniGerekli(kullanici, KOLEKSIYONLAR.formKayitlari);

  const filtre: Filter<Record<string, unknown>> = {};
  const tur = enumSuzgeci(secenekler.formTuru, FORM_TURLERI);
  const durum = enumSuzgeci(secenekler.islemDurumu, ISLEM_DURUMLARI);
  if (tur) filtre.formTuru = tur;
  if (durum) filtre.islemDurumu = durum;

  return listele(
    KOLEKSIYONLAR.formKayitlari,
    filtre,
    { olusturuldu: -1 },
    secenekler,
    (belge): FormKaydiGorunumu => ({
      kimlik: String(belge._id),
      formTuru: metin(belge.formTuru) ?? 'bilinmiyor',
      // Şemada zorunlu değil: yazılmamışsa kuyrukta "yeni" gibi davranır.
      islemDurumu: metin(belge.islemDurumu) ?? 'yeni',
      kaynakYol: metin(belge.kaynakYol),
      politikaSurumu: metin(belge.politikaSurumu),
      saklamaBitis: tarihMetni(belge.saklamaBitis),
      olusturuldu: tarihMetni(belge.olusturuldu),
      alanlar: formAlanlari(belge.alanlar),
    }),
  );
}

/* --- TEST SONUÇLARI ------------------------------------------------------ */

export type TestSonucuGorunumu = {
  kimlik: string;
  testSlug: string;
  puan?: number;
  dogruSayisi?: number;
  soruSayisi?: number;
  seviye?: string;
  sureSaniye?: number;
  /** Kayıt bir hesaba bağlı mı. Kullanıcı kimliği dışarı VERİLMEZ. */
  hesabaBagli: boolean;
  saklamaBitis?: string;
  olusturuldu?: string;
};

export async function testSonuclariniListele(
  kullanici: OturumKullanicisi,
  secenekler: SayfaSecenekleri & { testSlug?: string } = {},
): Promise<GelenListesi<TestSonucuGorunumu>> {
  okumaIzniGerekli(kullanici, KOLEKSIYONLAR.testSonuclari);

  const filtre: Filter<Record<string, unknown>> = {};
  // Slug beyaz listesi yok; biçim denetimi yeterli (şemadaki SLUG deseni).
  const slug = secenekler.testSlug;
  if (slug && slug !== 'tumu' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    filtre.testSlug = slug;
  }

  return listele(
    KOLEKSIYONLAR.testSonuclari,
    filtre,
    { olusturuldu: -1 },
    secenekler,
    (belge): TestSonucuGorunumu => ({
      kimlik: String(belge._id),
      testSlug: metin(belge.testSlug) ?? 'bilinmiyor',
      puan: sayi(belge.puan),
      dogruSayisi: sayi(belge.dogruSayisi),
      soruSayisi: sayi(belge.soruSayisi),
      seviye: metin(belge.seviye),
      sureSaniye: sayi(belge.sureSaniye),
      hesabaBagli: belge.kullaniciKimligi instanceof ObjectId,
      saklamaBitis: tarihMetni(belge.saklamaBitis),
      olusturuldu: tarihMetni(belge.olusturuldu),
    }),
  );
}

/* --- READINESS SONUÇLARI ------------------------------------------------- */

export type ReadinessSonucuGorunumu = {
  kimlik: string;
  /** Kurum adı maskelenmez: kişi değil tüzel kişi adıdır ve takip için gerekli. */
  kurumAdi?: string;
  sektorSlug?: string;
  calisanAraligi?: string;
  toplamPuan?: number;
  olgunlukSeviyesi?: string;
  iletisimIzni: boolean;
  /** Maskeli; ham değer için `gelenKaydiAc`. */
  eposta?: string;
  boyutSayisi: number;
  saklamaBitis?: string;
  olusturuldu?: string;
};

export async function readinessSonuclariniListele(
  kullanici: OturumKullanicisi,
  secenekler: SayfaSecenekleri & { sektorSlug?: string; iletisimIzni?: string } = {},
): Promise<GelenListesi<ReadinessSonucuGorunumu>> {
  okumaIzniGerekli(kullanici, KOLEKSIYONLAR.readinessSonuclari);

  const filtre: Filter<Record<string, unknown>> = {};
  const sektor = secenekler.sektorSlug;
  if (sektor && sektor !== 'tumu' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(sektor)) {
    filtre.sektorSlug = sektor;
  }
  if (secenekler.iletisimIzni === 'true') filtre.iletisimIzni = true;

  return listele(
    KOLEKSIYONLAR.readinessSonuclari,
    filtre,
    { olusturuldu: -1 },
    secenekler,
    (belge): ReadinessSonucuGorunumu => {
      const eposta = metin(belge.eposta);
      const boyutlar = belge.boyutPuanlari;
      return {
        kimlik: String(belge._id),
        kurumAdi: metin(belge.kurumAdi),
        sektorSlug: metin(belge.sektorSlug),
        calisanAraligi: metin(belge.calisanAraligi),
        toplamPuan: sayi(belge.toplamPuan),
        olgunlukSeviyesi: metin(belge.olgunlukSeviyesi),
        iletisimIzni: mantik(belge.iletisimIzni) ?? false,
        eposta: eposta ? epostaMaskele(eposta) : undefined,
        boyutSayisi:
          boyutlar && typeof boyutlar === 'object' && !Array.isArray(boyutlar)
            ? Object.keys(boyutlar as Record<string, unknown>).length
            : 0,
        saklamaBitis: tarihMetni(belge.saklamaBitis),
        olusturuldu: tarihMetni(belge.olusturuldu),
      };
    },
  );
}

/* --- ARAMA KAYITLARI ----------------------------------------------------- */

export type AramaKaydiGorunumu = {
  kimlik: string;
  sorgu: string;
  adet: number;
  sonucBulundu?: boolean;
  ilkSonucYolu?: string;
  sonGorulme?: string;
  inceledi: boolean;
};

/**
 * Arama kayıtları. Kişisel veri DEĞİLDİR (şema: yalnızca sorgu metni ve sayaç).
 *
 * Varsayılan görünüm `acik`: sonuç üretmeyen sorgular. `icerik_acigi` dizini
 * ({ sonucBulundu: 1, adet: -1 }) tam bu sorgu için var, sıralama ona uyar.
 */
export async function aramaKayitlariniListele(
  kullanici: OturumKullanicisi,
  secenekler: SayfaSecenekleri & { gorunum?: string } = {},
): Promise<GelenListesi<AramaKaydiGorunumu>> {
  okumaIzniGerekli(kullanici, KOLEKSIYONLAR.aramaKayitlari);

  const gorunum = enumSuzgeci(secenekler.gorunum, ARAMA_GORUNUMLERI);
  const filtre: Filter<Record<string, unknown>> = {};
  if (gorunum === 'acik') filtre.sonucBulundu = false;
  if (gorunum === 'sonuclu') filtre.sonucBulundu = true;
  if (gorunum === 'incelenmedi') {
    filtre.sonucBulundu = false;
    filtre.inceledi = { $ne: true };
  }

  return listele(
    KOLEKSIYONLAR.aramaKayitlari,
    filtre,
    { adet: -1 },
    secenekler,
    (belge): AramaKaydiGorunumu => ({
      kimlik: String(belge._id),
      sorgu: metin(belge.sorgu) ?? '',
      adet: sayi(belge.adet) ?? 0,
      sonucBulundu: mantik(belge.sonucBulundu),
      ilkSonucYolu: metin(belge.ilkSonucYolu),
      sonGorulme: tarihMetni(belge.sonGorulme),
      inceledi: mantik(belge.inceledi) ?? false,
    }),
  );
}

/* --- SAYAÇLAR ------------------------------------------------------------ */

export type GelenSayaclari = {
  abone: { toplam: number; bekliyor: number; onayli: number; cikti: number };
  form: {
    toplam: number;
    yeni: number;
    islemde: number;
    kapandi: number;
    suresiGecmis: number;
    saklamasiz: number;
  };
};

export async function gelenSayaclari(kullanici: OturumKullanicisi): Promise<GelenSayaclari> {
  okumaIzniGerekli(kullanici, KOLEKSIYONLAR.aboneler);
  okumaIzniGerekli(kullanici, KOLEKSIYONLAR.formKayitlari);

  const db = await veritabani();
  const aboneler = db.collection(KOLEKSIYONLAR.aboneler);
  const formlar = db.collection(KOLEKSIYONLAR.formKayitlari);
  const simdi = new Date();

  const [
    aboneToplam,
    bekliyor,
    onayli,
    cikti,
    formToplam,
    yeni,
    islemde,
    kapandi,
    suresiGecmis,
    saklamasiz,
  ] = await Promise.all([
    aboneler.countDocuments(),
    aboneler.countDocuments({ onayDurumu: 'bekliyor' }),
    aboneler.countDocuments({ onayDurumu: 'onayli' }),
    aboneler.countDocuments({ onayDurumu: 'cikti' }),
    formlar.countDocuments(),
    formlar.countDocuments({ $or: [{ islemDurumu: 'yeni' }, { islemDurumu: { $exists: false } }] }),
    formlar.countDocuments({ islemDurumu: 'islemde' }),
    formlar.countDocuments({ islemDurumu: 'kapandi' }),
    formlar.countDocuments({ saklamaBitis: { $lt: simdi } }),
    formlar.countDocuments({ saklamaBitis: { $exists: false } }),
  ]);

  return {
    abone: { toplam: aboneToplam, bekliyor, onayli, cikti },
    form: { toplam: formToplam, yeni, islemde, kapandi, suresiGecmis, saklamasiz },
  };
}

export type SonucSayaclari = {
  test: { toplam: number; suresiGecmis: number; saklamasiz: number; ortalamaPuan: number | null };
  readiness: {
    toplam: number;
    suresiGecmis: number;
    saklamasiz: number;
    iletisimIzinli: number;
    ortalamaPuan: number | null;
  };
};

/** Ortalama, GERÇEK kayıtların toplamıdır; kayıt yoksa `null` döner ve ekranda "—" basılır. */
async function ortalama(koleksiyon: string, alan: string): Promise<number | null> {
  const db = await veritabani();
  const sonuc = await db
    .collection(koleksiyon)
    .aggregate<{ ortalama: number | null }>([
      { $match: { [alan]: { $type: 'number' } } },
      { $group: { _id: null, ortalama: { $avg: `$${alan}` } } },
    ])
    .toArray();

  const deger = sonuc[0]?.ortalama;
  return typeof deger === 'number' && Number.isFinite(deger) ? Math.round(deger * 10) / 10 : null;
}

export async function sonucSayaclari(kullanici: OturumKullanicisi): Promise<SonucSayaclari> {
  okumaIzniGerekli(kullanici, KOLEKSIYONLAR.testSonuclari);
  okumaIzniGerekli(kullanici, KOLEKSIYONLAR.readinessSonuclari);

  const db = await veritabani();
  const testler = db.collection(KOLEKSIYONLAR.testSonuclari);
  const readiness = db.collection(KOLEKSIYONLAR.readinessSonuclari);
  const simdi = new Date();

  const [
    testToplam,
    testGecmis,
    testSaklamasiz,
    testOrtalama,
    readinessToplam,
    readinessGecmis,
    readinessSaklamasiz,
    izinli,
    readinessOrtalama,
  ] = await Promise.all([
    testler.countDocuments(),
    testler.countDocuments({ saklamaBitis: { $lt: simdi } }),
    testler.countDocuments({ saklamaBitis: { $exists: false } }),
    ortalama(KOLEKSIYONLAR.testSonuclari, 'puan'),
    readiness.countDocuments(),
    readiness.countDocuments({ saklamaBitis: { $lt: simdi } }),
    readiness.countDocuments({ saklamaBitis: { $exists: false } }),
    readiness.countDocuments({ iletisimIzni: true }),
    ortalama(KOLEKSIYONLAR.readinessSonuclari, 'toplamPuan'),
  ]);

  return {
    test: {
      toplam: testToplam,
      suresiGecmis: testGecmis,
      saklamasiz: testSaklamasiz,
      ortalamaPuan: testOrtalama,
    },
    readiness: {
      toplam: readinessToplam,
      suresiGecmis: readinessGecmis,
      saklamasiz: readinessSaklamasiz,
      iletisimIzinli: izinli,
      ortalamaPuan: readinessOrtalama,
    },
  };
}

export type AramaSayaclari = { toplam: number; acik: number; incelenmedi: number };

export async function aramaSayaclari(kullanici: OturumKullanicisi): Promise<AramaSayaclari> {
  okumaIzniGerekli(kullanici, KOLEKSIYONLAR.aramaKayitlari);

  const db = await veritabani();
  const koleksiyon = db.collection(KOLEKSIYONLAR.aramaKayitlari);

  const [toplam, acik, incelenmedi] = await Promise.all([
    koleksiyon.countDocuments(),
    koleksiyon.countDocuments({ sonucBulundu: false }),
    koleksiyon.countDocuments({ sonucBulundu: false, inceledi: { $ne: true } }),
  ]);

  return { toplam, acik, incelenmedi };
}

/** Testlerin slug dağılımı — süzgeç şeridi için. Boş koleksiyonda boş dizi. */
export async function testSluglari(
  kullanici: OturumKullanicisi,
): Promise<{ slug: string; adet: number }[]> {
  okumaIzniGerekli(kullanici, KOLEKSIYONLAR.testSonuclari);

  const db = await veritabani();
  const gruplar = await db
    .collection(KOLEKSIYONLAR.testSonuclari)
    .aggregate<{ _id: unknown; adet: number }>([
      { $group: { _id: '$testSlug', adet: { $sum: 1 } } },
      { $sort: { adet: -1 } },
      { $limit: 20 },
    ])
    .toArray();

  return gruplar
    .filter((grup): grup is { _id: string; adet: number } => typeof grup._id === 'string')
    .map((grup) => ({ slug: grup._id, adet: grup.adet }));
}

/* --- TEK KAYDI HAM AÇ ---------------------------------------------------- */

const ACILABILIR_KOLEKSIYONLAR: readonly string[] = [
  KOLEKSIYONLAR.aboneler,
  KOLEKSIYONLAR.formKayitlari,
  KOLEKSIYONLAR.testSonuclari,
  KOLEKSIYONLAR.readinessSonuclari,
];

export type AcilanKayit = {
  kimlik: string;
  koleksiyon: string;
  alanlar: { anahtar: string; deger: string }[];
};

/**
 * Bir kaydın HAM (maskesiz) içeriğini açar.
 *
 * Veri sahibi talebi, şikâyet incelemesi veya teklif takibi için gerekli
 * olabilir; ama bu bir ERİŞİM OLAYIDIR ve kayda geçer:
 *
 *  - `kisiselveri:disaAktar` izni ister (yalnızca sahip ve yönetici),
 *  - her açılışta `disa-aktar` denetim kaydı yazar.
 *
 * Listeleme yolunda maskeleme bu yüzden zayıflatılmamalı: ham veri görmenin
 * tek yolu iz bırakan bu fonksiyondur.
 */
export async function gelenKaydiAc(parametreler: {
  kullanici: OturumKullanicisi;
  koleksiyon: string;
  kimlik: string;
  adres?: string;
}): Promise<AcilanKayit | null> {
  const { kullanici, koleksiyon, kimlik, adres } = parametreler;

  if (!ACILABILIR_KOLEKSIYONLAR.includes(koleksiyon)) {
    throw new YetkiHatasi(`Bu koleksiyon açılamaz (${koleksiyon}).`, 'izin-yok');
  }
  if (!izinVarMi(kullanici.roller, 'kisiselveri:disaAktar')) {
    throw new YetkiHatasi('Ham kaydı görmek için dışa aktarma yetkisi gerekir.', 'izin-yok');
  }
  if (!ObjectId.isValid(kimlik)) return null;

  const db = await veritabani();
  const belge = await db.collection(koleksiyon).findOne({ _id: new ObjectId(kimlik) });
  if (!belge) return null;

  await denetimYaz({
    eylem: 'disa-aktar',
    koleksiyon,
    belgeKimligi: kimlik,
    kullanici,
    adres,
    not: 'Panelde ham kayıt görüntülendi (maskesiz).',
  });

  const alanlar = Object.entries(belge)
    .filter(([anahtar]) => anahtar !== '_id')
    .map(([anahtar, deger]) => ({ anahtar, deger: hamMetin(deger) }));

  return { kimlik, koleksiyon, alanlar: [{ anahtar: '_id', deger: kimlik }, ...alanlar] };
}

/** Ham değeri okunur tek satıra çevirir; ObjectId ve Date sınırdan geçmez. */
function hamMetin(deger: unknown): string {
  if (deger === null || deger === undefined) return '—';
  if (deger instanceof Date) return zamanMetni(deger);
  if (deger instanceof ObjectId) return deger.toHexString();
  if (typeof deger === 'object') {
    // `Date` ve `ObjectId` kendi `toJSON`'larını taşır; iç içe değerler de dizeye döner.
    try {
      return JSON.stringify(deger);
    } catch {
      return '{…}';
    }
  }
  return String(deger);
}
