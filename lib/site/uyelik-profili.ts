/**
 * Üyelik profili seçenekleri — TEK KAYNAK.
 *
 * Form bu listelerden üretilir, sunucu eylemi de gelen değeri bu listelere
 * karşı DOĞRULAR. İki yerde ayrı liste tutmak, formda olmayan bir değerin
 * sunucudan geçmesine ya da tersine yol açardı; `araclar.kategori` alanında
 * tam bu ayrışma yaşandı ve 50 kaydın kategorisi panelden silinebilir hâle
 * geldi.
 *
 * VERİ MİNİMİZASYONU: buradaki her alanın sitede bir karşılığı var. Bir alan
 * yalnızca "ileride lazım olur" diye eklenmez — KVKK'da toplanan her kişisel
 * veri bir amaca bağlanmak zorunda ve amacı olmayan alan hem hukuki yük hem
 * de kullanıcı için gereksiz sürtünmedir.
 */

export type Secenek = { deger: string; etiket: string; tarif?: string };

/** Hangi seviyedeki test ve dersler önerilecek. */
export const DENEYIM_SEVIYELERI: readonly Secenek[] = [
  {
    deger: 'baslangic',
    etiket: 'Başlangıç',
    tarif: 'Kavramları yeni öğreniyorum',
  },
  {
    deger: 'orta',
    etiket: 'Orta',
    tarif: 'Uygulama yaptım, kararları tartışabiliyorum',
  },
  {
    deger: 'ileri',
    etiket: 'İleri',
    tarif: 'Üretimde sistem kurdum ve ölçtüm',
  },
];

/** Rota seçimini yönlendirir: 20 rotanın rol ayrımına karşılık gelir. */
export const HEDEFLER: readonly Secenek[] = [
  {
    deger: 'mevcut-iste-kullanim',
    etiket: 'Mevcut işimde kullanmak',
    tarif: 'Yaptığım işe yapay zekâyı katmak istiyorum',
  },
  {
    deger: 'kariyer-degisimi',
    etiket: 'Kariyer değiştirmek',
    tarif: 'Bu alanda çalışmaya geçmek istiyorum',
  },
  {
    deger: 'ekip-kurma',
    etiket: 'Ekip kurmak veya yönetmek',
    tarif: 'Kurumda yapay zekâ ekibi ya da programı kuruyorum',
  },
  {
    deger: 'akademik',
    etiket: 'Akademik çalışma',
    tarif: 'Araştırma veya ders için takip ediyorum',
  },
  { deger: 'merak', etiket: 'Merak', tarif: 'Alanı anlamak istiyorum' },
];

/** Rotanın kaç haftaya yayılacağını belirler. */
export const HAFTALIK_SAATLER: readonly Secenek[] = [
  { deger: '2', etiket: 'Haftada 1–2 saat' },
  { deger: '5', etiket: 'Haftada 3–5 saat' },
  { deger: '10', etiket: 'Haftada 6–10 saat' },
  { deger: '20', etiket: 'Haftada 10 saatten fazla' },
];

/** Bülten listeleri — `aboneler.listeler` enum'uyla BİREBİR aynı olmalı. */
export const BULTEN_LISTELERI: readonly Secenek[] = [
  { deger: 'daily', etiket: 'Sinaptik Brief', tarif: 'Günün beş gelişmesi' },
  { deger: 'weekly', etiket: 'Haftalık özet', tarif: 'Haftanın derlemesi ve analizler' },
  { deger: 'research', etiket: 'Sinaptik Research', tarif: 'Yayın ve benchmark duyuruları' },
  { deger: 'kurumsal', etiket: 'Kurumsal', tarif: 'Vaka çalışmaları ve uyum gündemi' },
];

/** İlgi alanı seçiminde en çok kaç konu işaretlenebilir (şema `maxItems`). */
export const EN_COK_ILGI_ALANI = 8;

/** Kurum adı için üst sınır (şema `maxLength`). */
export const KURUM_SINIRI = 120;

/**
 * Bir değeri seçenek listesine karşı doğrular.
 *
 * Listede yoksa `undefined` döner — HATA DEĞİL. Gerekçe: bu alanların hepsi
 * opsiyonel ve hiçbiri güvenlik kararı vermiyor. Geçersiz bir değer yüzünden
 * kaydı reddetmek, kullanıcıyı kendi hatası olmayan bir engelle karşılaştırır
 * (eski bir sekme, otomatik doldurma, tarayıcı eklentisi); sessizce düşürmek
 * doğru davranıştır. Güvenlik kararı veren `roller` alanı zaten HİÇ okunmaz.
 */
export function secenekDogrula(
  deger: FormDataEntryValue | null,
  secenekler: readonly Secenek[],
): string | undefined {
  if (typeof deger !== 'string') return undefined;
  const kirpik = deger.trim();
  return secenekler.some((s) => s.deger === kirpik) ? kirpik : undefined;
}

/**
 * Çoklu seçim alanını beyaz listeye karşı doğrular ve sınırlar.
 *
 * `FormData.getAll` aynı adı taşıyan her girdiyi döndürür; tekrar eden ve
 * listede olmayan değerler elenir, sonra `enCok` ile kırpılır. Kırpma şema
 * `maxItems` ile aynı sayıda olmalı, yoksa doğrulayıcı kaydı reddeder.
 */
export function coklunuDogrula(
  degerler: FormDataEntryValue[],
  gecerliler: readonly string[],
  enCok: number,
): string[] | undefined {
  const kume = new Set(gecerliler);
  const temiz = [
    ...new Set(
      degerler
        .filter((d): d is string => typeof d === 'string')
        .map((d) => d.trim())
        .filter((d) => kume.has(d)),
    ),
  ].slice(0, enCok);
  return temiz.length > 0 ? temiz : undefined;
}

/** Haftalık saat metnini sayıya çevirir; listede yoksa `undefined`. */
export function haftalikSaatDogrula(deger: FormDataEntryValue | null): number | undefined {
  const secim = secenekDogrula(deger, HAFTALIK_SAATLER);
  return secim ? Number(secim) : undefined;
}

export type UyelikProfili = {
  deneyimSeviyesi?: string;
  ilgiAlanlari?: string[];
  sektorSlug?: string;
  hedef?: string;
  haftalikSaat?: number;
  kurum?: string;
};
