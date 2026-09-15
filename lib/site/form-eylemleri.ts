'use server';

import { veritabani } from '@/lib/mongo/istemci';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import {
  formGeciti,
  gecikmeyiUygula,
  gonderimSay,
  ONAY_METNI_SLUGU,
  politikaSurumu,
  SAKLAMA_AYLARI,
  saklamaBitisi,
} from '@/lib/site/form-korumasi';
import {
  AD_EN_AZ,
  AD_EN_COK,
  bultenListesiMi,
  calisanAraligiMi,
  EPOSTA_DESENI,
  EPOSTA_EN_COK,
  ILETISIM_KONULARI,
  KURUM_ADI_EN_COK,
  MESAJ_EN_AZ,
  MESAJ_EN_COK,
  SORGU_EN_AZ,
  SORGU_EN_COK,
  type BultenListesi,
  type FormSonucu,
  type ReadinessSonucuGirdisi,
  type TestSonucuGirdisi,
} from '@/lib/site/form-sozlesmesi';
import { bultenAktif } from '@/lib/site/ayarlar';

/**
 * Site formlarının YAZMA katmanı.
 *
 * Beş koleksiyonun şeması ve dizinleri kuruluydu, panel ekranları hazırdı, ama
 * yazan kod yoktu: üç form `action` taşımıyordu ve `form_kayitlari`,
 * `aboneler`, `arama_kayitlari`, `test_sonuclari`, `readiness_sonuclari` boştu.
 * Bu modül o boşluğu kapatır.
 *
 * PANEL EYLEMİ DEĞİLDİR — `korumaliEylem()` KULLANILMAZ
 *
 * Bu eylemleri kimliği doğrulanmamış ziyaretçiler çağırır; oturum isteyen
 * sarmalayıcı burada işe yaramaz. Yerine üç kapı kurulur:
 *
 *  1. GİRDİ DOĞRULAMA (bu modül): e-posta deseni ŞEMAYLA AYNI, uzunluk
 *     sınırları uygulanır, şemada olmayan hiçbir alan yazılmaz, enum dışı
 *     değer kabul edilmez. Gelen `FormData` bir tarayıcı formundan geldiği
 *     varsayılmaz: `Next-Action` başlığıyla doğrudan da çağrılabilir.
 *  2. ORAN SINIRLAMA (`lib/site/form-korumasi.ts`): IP ekseninde sert kilit,
 *     e-posta ekseninde artan gecikme.
 *  3. SAKLAMA SÜRESİ: TTL'in bakacağı `saklamaBitis` her kayıtta yazılır.
 *
 * E-POSTA GÜNLÜĞE YAZILMAZ
 *
 * Hata dallarında `console.error` yalnızca hatanın kendisini basar. E-posta
 * adresini günlüğe düşürmek, kişisel veriyi saklama süresi ve erişim denetimi
 * olmayan bir ikinci yere (platform günlükleri) kopyalamak olurdu.
 *
 * `'use server'` modülü yalnızca `async` fonksiyon dışa açabilir: sabitler ve
 * tipler `lib/site/form-sozlesmesi.ts` içindedir.
 */

/* --- ORTAK YARDIMCILAR ---------------------------------------------------- */

const GENEL_HATA = 'İşlem tamamlanamadı. Sorun sürerse teknik ekibe bildirin.';

function dize(veri: FormData, ad: string): string {
  const deger = veri.get(ad);
  return typeof deger === 'string' ? deger.trim() : '';
}

/**
 * E-posta normalizasyonu.
 *
 * `toLocaleLowerCase('tr-TR')` KULLANILMAZ: Türkçe yerelde "I" → "ı" olur ve
 * `Ismail@x.com` ile `ismail@x.com` iki ayrı tekil anahtar üretir (aynı gerekçe
 * `lib/yetki/oran-sinirlama.ts` içinde de yazılı).
 */
function epostaNormalize(deger: string): string {
  return deger.trim().toLowerCase();
}

function epostaGecerliMi(deger: string): boolean {
  return deger.length <= EPOSTA_EN_COK && EPOSTA_DESENI.test(deger);
}

/** Kaynak yolu; şemada serbest dize. Sorgu dizesi ve host KAYDEDİLMEZ. */
function kaynakYolu(veri: FormData): string | undefined {
  const ham = dize(veri, 'kaynakYol');
  if (!ham.startsWith('/') || ham.length > 200) return undefined;
  return ham.split(/[?#]/)[0];
}

/* --- 1. İLETİŞİM FORMU --------------------------------------------------- */

/**
 * İletişim/talep formu → `form_kayitlari`.
 *
 * İmza `useActionState` sözleşmesine uyar (önceki durum + FormData): form
 * `action={...}` ile doğrudan sunucu eylemine bağlanır ve JavaScript devre dışı
 * olsa bile çalışır.
 *
 * `alanlar` şemada serbest bir `object`; panelin maskeleme kuralı ALAN ADINA
 * bakıyor (`lib/admin/kisisel-veri.ts`), bu yüzden anahtarlar `adSoyad` ve
 * `eposta` olarak yazılır — bu adlarla listede maskelenmiş görünürler.
 */
export async function iletisimGonder(
  _oncekiDurum: FormSonucu | null,
  veri: FormData,
): Promise<FormSonucu> {
  const adSoyad = dize(veri, 'adSoyad');
  const eposta = epostaNormalize(dize(veri, 'eposta'));
  const konuDegeri = dize(veri, 'konu');
  const mesaj = dize(veri, 'mesaj');

  const alanHatalari: Record<string, string> = {};

  if (adSoyad.length < AD_EN_AZ || adSoyad.length > AD_EN_COK) {
    alanHatalari.adSoyad = `Ad soyad ${AD_EN_AZ}-${AD_EN_COK} karakter olmalı.`;
  }
  if (!epostaGecerliMi(eposta)) {
    alanHatalari.eposta = 'Geçerli bir e-posta adresi girin.';
  }
  const konu = ILETISIM_KONULARI.find((k) => k.deger === konuDegeri);
  if (!konu) {
    alanHatalari.konu = 'Listeden bir konu seçin.';
  }
  if (mesaj.length < MESAJ_EN_AZ || mesaj.length > MESAJ_EN_COK) {
    alanHatalari.mesaj = `Mesaj ${MESAJ_EN_AZ}-${MESAJ_EN_COK} karakter olmalı.`;
  }

  if (Object.keys(alanHatalari).length > 0 || !konu) {
    return { tamam: false, hata: 'Formda eksik veya hatalı alanlar var.', alanHatalari };
  }

  const gecit = await formGeciti('form', eposta);
  if (!gecit.gecti) return { tamam: false, hata: gecit.hata };

  try {
    const db = await veritabani();
    const simdi = new Date();

    await db.collection(KOLEKSIYONLAR.formKayitlari).insertOne({
      formTuru: konu.formTuru,
      alanlar: { adSoyad, eposta, konu: konu.deger, konuAdi: konu.ad, mesaj },
      kaynakYol: kaynakYolu(veri) ?? '/iletisim/',
      politikaSurumu: await politikaSurumu(ONAY_METNI_SLUGU),
      islemDurumu: 'yeni',
      saklamaBitis: saklamaBitisi(SAKLAMA_AYLARI.formKaydi, simdi),
      olusturuldu: simdi,
    });

    await gonderimSay('form', eposta, gecit.adres);
    await gecikmeyiUygula(gecit.gecikmeMs);

    return {
      tamam: true,
      ileti: 'Talebiniz alındı. İki iş günü içinde dönüş yapılır.',
    };
  } catch (hata) {
    console.error('[site:form] iletişim kaydı yazılamadı', hata);
    return { tamam: false, hata: GENEL_HATA };
  }
}

/* --- 2. BÜLTEN KAYDI ----------------------------------------------------- */

/**
 * Bülten kaydı → `aboneler`.
 *
 * ÇİFT ONAY: şema `onayDurumu` enum'unu `bekliyor | onayli | cikti` olarak
 * tanımlıyor ve koleksiyon açıklaması çift onayı zorunlu kılıyor. Onay
 * e-postası altyapısı henüz yok, bu yüzden kayıt `bekliyor` durumunda kalır ve
 * `onayTarihi` YAZILMAZ — onay alınmadan onay tarihi yazmak kaydı gerçekte
 * olmayan bir rızayla damgalamak olurdu. Kullanıcıya da bu söylenir.
 *
 * AYAR KAPISI: `bulten-aktif` ayarı kapalıyken yazma reddedilir. Formu gizlemek
 * yetmez; eylem doğrudan da çağrılabilir.
 *
 * TEKRAR KAYIT: `eposta` üzerinde tekil dizin var. Var olan abonenin liste
 * seçimi güncellenir; `onayli` bir abone `bekliyor`a DÜŞÜRÜLMEZ (onayını
 * kaybetmesin), yalnızca daha önce `cikti` olan kayıt yeniden `bekliyor`a
 * alınır.
 */
export async function bultenAbone(
  _oncekiDurum: FormSonucu | null,
  veri: FormData,
): Promise<FormSonucu> {
  if (!(await bultenAktif())) {
    return { tamam: false, hata: 'Bülten kayıtları şu an kapalı.' };
  }

  const eposta = epostaNormalize(dize(veri, 'eposta'));
  if (!epostaGecerliMi(eposta)) {
    return {
      tamam: false,
      hata: 'Geçerli bir e-posta adresi girin.',
      alanHatalari: { eposta: 'Geçerli bir e-posta adresi girin.' },
    };
  }

  // Enum dışı değer sessizce atılır; hiç geçerli seçim yoksa form eksiktir.
  const listeler = veri
    .getAll('listeler')
    .filter(bultenListesiMi)
    .filter((deger, sira, tumu): deger is BultenListesi => tumu.indexOf(deger) === sira);

  if (listeler.length === 0) {
    return {
      tamam: false,
      hata: 'En az bir bülten seçin.',
      alanHatalari: { listeler: 'En az bir bülten seçin.' },
    };
  }

  const gecit = await formGeciti('form', eposta);
  if (!gecit.gecti) return { tamam: false, hata: gecit.hata };

  try {
    const db = await veritabani();
    const koleksiyon = db.collection(KOLEKSIYONLAR.aboneler);
    const simdi = new Date();
    const onayKaynagi = kaynakYolu(veri) ?? '/bulten/';
    const surum = await politikaSurumu(ONAY_METNI_SLUGU);

    const mevcut = await koleksiyon.findOne<{ onayDurumu?: string }>(
      { eposta },
      { projection: { _id: 0, onayDurumu: 1 } },
    );

    if (!mevcut) {
      try {
        await koleksiyon.insertOne({
          eposta,
          onayDurumu: 'bekliyor',
          onayKaynagi,
          politikaSurumu: surum,
          listeler,
          // Çıkış bağlantısının tahmin edilemez anahtarı; e-postadan türetilmez.
          cikisAnahtari: crypto.randomUUID(),
          olusturuldu: simdi,
        });
      } catch (hata) {
        // Eşzamanlı iki gönderim: tekil dizin ikincisini düşürür (11000).
        // Yarışı kaybeden taraf güncelleme dalına geçer.
        if (!yinelenenAnahtarMi(hata)) throw hata;
        await koleksiyon.updateOne(
          { eposta },
          { $set: { listeler, onayKaynagi, politikaSurumu: surum, guncellendi: simdi } },
        );
      }
    } else {
      const yeniden = mevcut.onayDurumu === 'cikti';
      await koleksiyon.updateOne(
        { eposta },
        {
          $set: {
            listeler,
            onayKaynagi,
            politikaSurumu: surum,
            guncellendi: simdi,
            ...(yeniden ? { onayDurumu: 'bekliyor' } : {}),
          },
          ...(yeniden ? { $unset: { cikisTarihi: '' } } : {}),
        },
      );
    }

    await gonderimSay('form', eposta, gecit.adres);
    await gecikmeyiUygula(gecit.gecikmeMs);

    return {
      tamam: true,
      ileti:
        'Kaydınız alındı. Çift onay gerektiği için abonelik, onayınız tamamlanana kadar bekleme durumundadır.',
    };
  } catch (hata) {
    console.error('[site:form] abone kaydı yazılamadı', hata);
    return { tamam: false, hata: GENEL_HATA };
  }
}

function yinelenenAnahtarMi(hata: unknown): boolean {
  return typeof hata === 'object' && hata !== null && (hata as { code?: number }).code === 11000;
}

/* --- 3. ARAMA KAYDI ------------------------------------------------------ */

/**
 * Site içi arama sorgusu → `arama_kayitlari`. SESSİZ: hata yutar, hiçbir şey
 * döndürmez. Arama deneyimi bir günlük yazması yüzünden bozulmaz.
 *
 * NEDEN SAYFA RENDER'INDAN DEĞİL İSTEMCİDEN ÇAĞRILIYOR
 *
 * `/ara/` sayfası statik üretilir ve aramayı istemci bileşeni (`CanliArama`)
 * dizin üzerinde yapar — sonuç sayısını bilen tek yer orası. Render sırasında
 * yazmak iki nedenle yanlış olurdu: Next render'ı yan etkisiz kabul eder
 * (aynı render birden çok kez çalışabilir) ve veritabanına yazan bir sayfa
 * statik üretimden düşerdi. Route handler da eklenebilirdi ama o `lib/rotalar.ts`
 * ile `app/sitemap.ts`'e yeni bir genel uç noktası sokardı; Server Action aynı
 * işi yeni URL yüzeyi açmadan yapıyor.
 *
 * KİŞİSEL VERİ YAZILMAZ: şema açıklaması "yalnızca sorgu metni ve sayaç"
 * diyor. IP, oturum veya kullanıcı kimliği BU KOLEKSİYONA yazılmaz. IP yalnızca
 * oran sınırlama sayacında (`giris_denemeleri`, TTL'li) ve yalnızca YENİ bir
 * sorgu belgesi açılırken kullanılır.
 *
 * TEKİL SORGU: `{ sorgu: 1 }` tekil dizin var. Aynı sorgu tekrar gelince yeni
 * belge açılmaz; `adet` `$inc` ile artar ve `sonGorulme` güncellenir.
 */
export async function aramaKaydet(
  sorgu: string,
  sonucBulundu: boolean,
  ilkSonucYolu?: string,
): Promise<void> {
  const temiz = sorgu.replace(/\s+/g, ' ').trim();
  if (temiz.length < SORGU_EN_AZ || temiz.length > SORGU_EN_COK) return;

  const yol =
    typeof ilkSonucYolu === 'string' && ilkSonucYolu.startsWith('/')
      ? ilkSonucYolu.slice(0, 200)
      : undefined;

  try {
    const db = await veritabani();
    const koleksiyon = db.collection(KOLEKSIYONLAR.aramaKayitlari);
    const simdi = new Date();

    const guncelleme = {
      $inc: { adet: 1 },
      $set: { sonucBulundu, ilkSonucYolu: yol, sonGorulme: simdi, guncellendi: simdi },
    };

    const sonuc = await koleksiyon.updateOne({ sorgu: temiz }, guncelleme);
    if (sonuc.matchedCount > 0) return;

    // Yeni belge açmak, sel vektörünün TAMAMI: var olan sorgular yalnızca bir
    // sayacı artırıyor, sınırsız büyüyen tek şey DISTINCT sorgu sayısı. Oran
    // sınırı bu yüzden sadece burada uygulanır — meşru aramalar hiç
    // sınırlanmaz, koleksiyonu şişiren yol sınırlanır.
    const gecit = await formGeciti('arama', undefined);
    if (!gecit.gecti) return;

    try {
      await koleksiyon.insertOne({
        sorgu: temiz,
        adet: 1,
        sonucBulundu,
        ilkSonucYolu: yol,
        sonGorulme: simdi,
        olusturuldu: simdi,
      });
      await gonderimSay('arama', undefined, gecit.adres);
    } catch (hata) {
      if (!yinelenenAnahtarMi(hata)) throw hata;
      await koleksiyon.updateOne({ sorgu: temiz }, guncelleme);
    }
  } catch (hata) {
    console.error('[site:arama] sorgu kaydedilemedi', hata);
  }
}

/* --- 4. TEST SONUCU ------------------------------------------------------ */

const SLUG_DESENI = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Test/seviye testi sonucu → `test_sonuclari`. SESSİZ: sonuç ekranı bir yazma
 * hatası yüzünden bozulmaz.
 *
 * ANONİM: `kullaniciKimligi` YAZILMAZ. Şema açıklaması "anonim çözümlerde
 * kullanıcı bağlanmaz" diyor; oturum eşlemesi üyelik akışı geldiğinde ayrıca
 * kurulur. Ayırt edici olarak yalnızca tarayıcıda üretilen rastgele
 * `oturumAnahtari` tutulur (kimlikle ilişkilendirilemez).
 *
 * Sayısal alanlar ŞEMA ARALIĞINA kelepçelenir: `puan` 0-100, `soruSayisi` ≥ 1.
 * Aksi hâlde uç bir istemci değeri "Document failed validation" üretir.
 */
export async function testSonucuKaydet(girdi: TestSonucuGirdisi): Promise<void> {
  const testSlug = girdi.testSlug.trim();
  if (!SLUG_DESENI.test(testSlug) || testSlug.length > 120) return;

  const soruSayisi = Math.trunc(girdi.soruSayisi);
  if (!Number.isFinite(soruSayisi) || soruSayisi < 1) return;

  const puan = kelepce(girdi.puan, 0, 100);
  const dogruSayisi = kelepce(Math.trunc(girdi.dogruSayisi), 0, soruSayisi);
  if (puan === undefined || dogruSayisi === undefined) return;

  const gecit = await formGeciti('form', undefined);
  if (!gecit.gecti) return;

  try {
    const db = await veritabani();
    const simdi = new Date();

    await db.collection(KOLEKSIYONLAR.testSonuclari).insertOne({
      testSlug,
      oturumAnahtari: oturumAnahtariTemiz(girdi.oturumAnahtari),
      puan,
      dogruSayisi,
      soruSayisi,
      seviye: kisaMetin(girdi.seviye, 80),
      beceriKirilimi: beceriKirilimiTemiz(girdi.beceriKirilimi),
      sureSaniye: kelepce(Math.trunc(girdi.sureSaniye ?? Number.NaN), 0, 86_400),
      saklamaBitis: saklamaBitisi(SAKLAMA_AYLARI.testSonucu, simdi),
      olusturuldu: simdi,
    });

    await gonderimSay('form', undefined, gecit.adres);
  } catch (hata) {
    console.error('[site:test] sonuç yazılamadı', hata);
  }
}

/* --- 5. AI READINESS SONUCU ---------------------------------------------- */

/**
 * AI Readiness sonucu → `readiness_sonuclari`. SESSİZ değildir: kullanıcı
 * paylaşmayı açıkça seçtiği için sonucu görmek hakkıdır.
 *
 * AÇIK RIZA (KVKK): kayıt yalnızca kullanıcı "sonucu paylaş" adımını
 * tamamladığında oluşur. `eposta` ve `iletisimIzni` yalnızca onay kutusu
 * İŞARETLENMİŞSE yazılır; varsayılan işaretli bir kutu yoktur. İzin yoksa
 * e-posta alanı hiç yazılmaz — "izin vermedi ama adresi duruyor" hâli oluşmaz.
 *
 * SAKLAMA: izinliyse 24 ay (talep kaydı), değilse 12 ay (yalnızca istatistik).
 */
export async function readinessSonucuKaydet(girdi: ReadinessSonucuGirdisi): Promise<FormSonucu> {
  const toplamPuan = kelepce(Math.round(girdi.toplamPuan), 0, 100);
  const boyutPuanlari = beceriKirilimiTemiz(girdi.boyutPuanlari);

  if (toplamPuan === undefined || !boyutPuanlari) {
    return { tamam: false, hata: 'Değerlendirme sonucu okunamadı.' };
  }

  const iletisimIzni = girdi.iletisimIzni === true;
  const eposta = iletisimIzni ? epostaNormalize(girdi.eposta ?? '') : '';

  if (iletisimIzni && !epostaGecerliMi(eposta)) {
    return {
      tamam: false,
      hata: 'İletişim izni için geçerli bir e-posta adresi girin.',
      alanHatalari: { eposta: 'Geçerli bir e-posta adresi girin.' },
    };
  }

  const gecit = await formGeciti('form', iletisimIzni ? eposta : undefined);
  if (!gecit.gecti) return { tamam: false, hata: gecit.hata };

  try {
    const db = await veritabani();
    const simdi = new Date();

    await db.collection(KOLEKSIYONLAR.readinessSonuclari).insertOne({
      kurumAdi: kisaMetin(girdi.kurumAdi, KURUM_ADI_EN_COK),
      calisanAraligi: calisanAraligiMi(girdi.calisanAraligi) ? girdi.calisanAraligi : undefined,
      boyutPuanlari,
      toplamPuan,
      olgunlukSeviyesi: kisaMetin(girdi.olgunlukSeviyesi, 80),
      iletisimIzni,
      eposta: iletisimIzni ? eposta : undefined,
      politikaSurumu: await politikaSurumu(ONAY_METNI_SLUGU),
      saklamaBitis: saklamaBitisi(
        iletisimIzni ? SAKLAMA_AYLARI.readinessIletisimIzinli : SAKLAMA_AYLARI.readinessAnonim,
        simdi,
      ),
      olusturuldu: simdi,
    });

    await gonderimSay('form', iletisimIzni ? eposta : undefined, gecit.adres);
    await gecikmeyiUygula(gecit.gecikmeMs);

    return {
      tamam: true,
      ileti: iletisimIzni
        ? 'Sonucunuz kaydedildi. Değerlendirmeyi birlikte yorumlamak için size dönüş yapılacak.'
        : 'Sonucunuz anonim olarak kaydedildi. İletişim bilgisi saklanmadı.',
    };
  } catch (hata) {
    console.error('[site:readiness] sonuç yazılamadı', hata);
    return { tamam: false, hata: GENEL_HATA };
  }
}

/* --- SAYISAL VE METİN TEMİZLİĞİ ------------------------------------------ */

/** Aralık dışı veya sayı olmayan değer `undefined` döner: alan hiç yazılmaz. */
function kelepce(deger: number, enAz: number, enCok: number): number | undefined {
  if (!Number.isFinite(deger)) return undefined;
  return Math.min(enCok, Math.max(enAz, deger));
}

function kisaMetin(deger: string | undefined, enCok: number): string | undefined {
  const metin = (deger ?? '').trim();
  if (!metin) return undefined;
  return metin.slice(0, enCok);
}

/** Rastgele anahtar beklenir; biçimi tanımadığımız değer yazılmaz. */
function oturumAnahtariTemiz(deger: string | undefined): string | undefined {
  const metin = (deger ?? '').trim();
  return /^[a-zA-Z0-9-]{8,64}$/.test(metin) ? metin : undefined;
}

/**
 * Serbest `object` alanların temizliği: yalnızca sonlu sayı değerleri, en çok
 * 40 anahtar. Şema `object` diyor ve içeriği doğrulamıyor; istemciden gelen
 * gelişigüzel bir nesneyi olduğu gibi yazmak koleksiyonu istemcinin eline
 * bırakmak olurdu.
 */
function beceriKirilimiTemiz(
  deger: Record<string, number> | undefined,
): Record<string, number> | undefined {
  if (!deger || typeof deger !== 'object') return undefined;

  const temiz: Record<string, number> = {};
  for (const [anahtar, sayi] of Object.entries(deger).slice(0, 40)) {
    if (typeof sayi !== 'number' || !Number.isFinite(sayi)) continue;
    const ad = anahtar.trim().slice(0, 80);
    // Nokta ve `$` MongoDB alan adlarında anlam taşır; dışlanır.
    if (!ad || ad.includes('.') || ad.startsWith('$')) continue;
    temiz[ad] = Math.round(sayi);
  }

  return Object.keys(temiz).length > 0 ? temiz : undefined;
}
