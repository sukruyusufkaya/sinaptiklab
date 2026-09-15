import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';

/**
 * Rol ve izin matrisi.
 *
 * İzinler eylem bazlıdır, ekran bazlı değil: aynı izin hem sunucu eyleminde
 * (Server Action) hem ekranda kullanılır. Ekranı gizlemek bir yetki kontrolü
 * değildir — asıl kontrol her zaman sunucuda, yazma yolunun başında yapılır.
 *
 * Bu modül veritabanına dokunmaz; istemci bileşenleri de güvenle içe alabilir.
 */

export const ROLLER = ['sahip', 'yonetici', 'editor', 'yazar', 'moderator'] as const;
export type Rol = (typeof ROLLER)[number];

export const ROL_ADI: Record<Rol, string> = {
  sahip: 'Sahip',
  yonetici: 'Yönetici',
  editor: 'Editör',
  yazar: 'Yazar',
  moderator: 'Moderatör',
};

export const ROL_TARIFI: Record<Rol, string> = {
  sahip: 'Her yetkiye sahiptir. Devredilebilir ama silinemez; en az bir sahip kalmak zorundadır.',
  yonetici: 'Kullanıcı ve ayar yönetimi dâhil her işlem. Sahip hesabını değiştiremez.',
  editor: 'İçerik ve varlıkları yazar, yayımlar, arşivler. Kullanıcı ve kişisel veriye erişemez.',
  yazar: 'Taslak yazar ve düzenler. Yayımlama yetkisi yoktur.',
  moderator: 'Soru-cevap ve topluluk katkılarını denetler. İçeriği yalnızca okur.',
};

/* --- İZİNLER -------------------------------------------------------------- */

export const IZINLER = [
  // İçerik akışı
  'icerik:oku',
  'icerik:yaz',
  'icerik:yayinla',
  'icerik:sil',
  // Varlıklar (Atlas, model, araç, rota, test, yayın…)
  'varlik:yaz',
  'varlik:sil',
  // Taksonomi ve künye
  'taksonomi:yaz',
  // Hukuki metinler — ayrı ve daha yüksek eşik
  'politika:yaz',
  // Operasyon
  'medya:yaz',
  'medya:sil',
  'yonlendirme:yaz',
  'arama:oku',
  // Yönetim
  'kullanici:oku',
  'kullanici:yaz',
  'kisiselveri:oku',
  'kisiselveri:yaz',
  'kisiselveri:disaAktar',
  'kisiselveri:sil',
  'denetim:oku',
  'ayar:yaz',
] as const;

export type Izin = (typeof IZINLER)[number];

export const IZIN_ADI: Record<Izin, string> = {
  'icerik:oku': 'İçerikleri görüntüle',
  'icerik:yaz': 'İçerik oluştur ve düzenle',
  'icerik:yayinla': 'İçerik yayımla, arşivle',
  'icerik:sil': 'İçerik sil',
  'varlik:yaz': 'Varlık kayıtlarını düzenle',
  'varlik:sil': 'Varlık kaydı sil',
  'taksonomi:yaz': 'Konu ve yazar künyelerini düzenle',
  'politika:yaz': 'Hukuki metinleri düzenle',
  'medya:yaz': 'Medya yükle ve düzenle',
  'medya:sil': 'Medya sil',
  'yonlendirme:yaz': 'URL yönlendirmelerini yönet',
  'arama:oku': 'Arama kayıtlarını ve içerik açığını gör',
  'kullanici:oku': 'Kullanıcıları görüntüle',
  'kullanici:yaz': 'Kullanıcı ve rol yönetimi',
  'kisiselveri:oku': 'Kişisel veri kayıtlarını görüntüle',
  'kisiselveri:yaz': 'Kişisel veri kaydını düzenle',
  'kisiselveri:disaAktar': 'Kişisel veriyi dışa aktar',
  'kisiselveri:sil': 'Kişisel veri sil',
  'denetim:oku': 'Denetim kaydını oku',
  'ayar:yaz': 'Site ayarlarını değiştir',
};

/* --- MATRİS --------------------------------------------------------------- */

const EDITOR_IZINLERI: Izin[] = [
  'icerik:oku',
  'icerik:yaz',
  'icerik:yayinla',
  'icerik:sil',
  'varlik:yaz',
  'varlik:sil',
  'taksonomi:yaz',
  'medya:yaz',
  'medya:sil',
  'yonlendirme:yaz',
  'arama:oku',
];

const YONETICI_IZINLERI: Izin[] = [
  ...EDITOR_IZINLERI,
  'politika:yaz',
  'kullanici:oku',
  'kullanici:yaz',
  'kisiselveri:oku',
  'kisiselveri:yaz',
  'kisiselveri:disaAktar',
  'kisiselveri:sil',
  // Denetim kaydı kullanıcı e-postası ve IP adresi taşır; `editor` rolüne
  // VERİLMEZ (tarifi "kişisel veriye erişemez" diyor, matris uymak zorunda).
  'denetim:oku',
  'ayar:yaz',
];

export const ROL_IZINLERI: Record<Rol, readonly Izin[]> = {
  sahip: IZINLER,
  yonetici: YONETICI_IZINLERI,
  editor: EDITOR_IZINLERI,
  yazar: ['icerik:oku', 'icerik:yaz', 'medya:yaz'],
  moderator: ['icerik:oku', 'arama:oku'],
};

/** Rollerden herhangi biri izne sahipse true. */
export function izinVarMi(roller: readonly string[] | undefined, izin: Izin): boolean {
  if (!roller?.length) return false;
  return roller.some((rol) => {
    const liste = ROL_IZINLERI[rol as Rol];
    return Boolean(liste?.includes(izin));
  });
}

/** Verilen rollerin toplam izin kümesi — ekranları göstermek/gizlemek için. */
export function izinKumesi(roller: readonly string[] | undefined): Set<Izin> {
  const kume = new Set<Izin>();
  for (const rol of roller ?? []) {
    for (const izin of ROL_IZINLERI[rol as Rol] ?? []) kume.add(izin);
  }
  return kume;
}

/** Rol sıralaması — yüksek sayı daha yetkili. Rol değiştirme kontrolünde kullanılır. */
export const ROL_DUZEYI: Record<Rol, number> = {
  sahip: 100,
  yonetici: 80,
  editor: 60,
  yazar: 40,
  moderator: 20,
};

export function enYuksekDuzey(roller: readonly string[] | undefined): number {
  return Math.max(0, ...(roller ?? []).map((r) => ROL_DUZEYI[r as Rol] ?? 0));
}

/* --- KOLEKSİYON → İZİN EŞLEMESİ ------------------------------------------ */

/**
 * Genel CRUD motoru bir koleksiyon üzerinde işlem yapmadan önce buraya bakar.
 * Eşlemesi olmayan koleksiyon panelden yönetilemez (güvenli varsayılan).
 */
export const KOLEKSIYON_IZNI: Record<string, { oku: Izin; yaz: Izin; sil: Izin }> = {
  [KOLEKSIYONLAR.icerikler]: { oku: 'icerik:oku', yaz: 'icerik:yaz', sil: 'icerik:sil' },

  // Varlıklar
  [KOLEKSIYONLAR.atlas]: { oku: 'icerik:oku', yaz: 'varlik:yaz', sil: 'varlik:sil' },
  [KOLEKSIYONLAR.modeller]: { oku: 'icerik:oku', yaz: 'varlik:yaz', sil: 'varlik:sil' },
  [KOLEKSIYONLAR.sirketler]: { oku: 'icerik:oku', yaz: 'varlik:yaz', sil: 'varlik:sil' },
  [KOLEKSIYONLAR.araclar]: { oku: 'icerik:oku', yaz: 'varlik:yaz', sil: 'varlik:sil' },
  [KOLEKSIYONLAR.meslekler]: { oku: 'icerik:oku', yaz: 'varlik:yaz', sil: 'varlik:sil' },
  [KOLEKSIYONLAR.ogrenmeYollari]: { oku: 'icerik:oku', yaz: 'varlik:yaz', sil: 'varlik:sil' },
  [KOLEKSIYONLAR.dersler]: { oku: 'icerik:oku', yaz: 'varlik:yaz', sil: 'varlik:sil' },
  [KOLEKSIYONLAR.testler]: { oku: 'icerik:oku', yaz: 'varlik:yaz', sil: 'varlik:sil' },
  [KOLEKSIYONLAR.sorular]: { oku: 'icerik:oku', yaz: 'varlik:yaz', sil: 'varlik:sil' },
  [KOLEKSIYONLAR.arastirma]: { oku: 'icerik:oku', yaz: 'varlik:yaz', sil: 'varlik:sil' },
  [KOLEKSIYONLAR.dergiSayilari]: { oku: 'icerik:oku', yaz: 'varlik:yaz', sil: 'varlik:sil' },
  [KOLEKSIYONLAR.podcast]: { oku: 'icerik:oku', yaz: 'varlik:yaz', sil: 'varlik:sil' },
  [KOLEKSIYONLAR.briefler]: { oku: 'icerik:oku', yaz: 'varlik:yaz', sil: 'varlik:sil' },
  [KOLEKSIYONLAR.radar]: { oku: 'icerik:oku', yaz: 'varlik:yaz', sil: 'varlik:sil' },
  [KOLEKSIYONLAR.hizmetler]: { oku: 'icerik:oku', yaz: 'varlik:yaz', sil: 'varlik:sil' },
  [KOLEKSIYONLAR.sektorler]: { oku: 'icerik:oku', yaz: 'varlik:yaz', sil: 'varlik:sil' },
  [KOLEKSIYONLAR.vakalar]: { oku: 'icerik:oku', yaz: 'varlik:yaz', sil: 'varlik:sil' },
  [KOLEKSIYONLAR.labProjeleri]: { oku: 'icerik:oku', yaz: 'varlik:yaz', sil: 'varlik:sil' },
  [KOLEKSIYONLAR.etkinlikler]: { oku: 'icerik:oku', yaz: 'varlik:yaz', sil: 'varlik:sil' },
  [KOLEKSIYONLAR.uzmanlar]: { oku: 'icerik:oku', yaz: 'varlik:yaz', sil: 'varlik:sil' },
  [KOLEKSIYONLAR.sayfalar]: { oku: 'icerik:oku', yaz: 'varlik:yaz', sil: 'varlik:sil' },

  // Taksonomi ve künye
  [KOLEKSIYONLAR.konular]: { oku: 'icerik:oku', yaz: 'taksonomi:yaz', sil: 'taksonomi:yaz' },
  [KOLEKSIYONLAR.yazarlar]: { oku: 'icerik:oku', yaz: 'taksonomi:yaz', sil: 'taksonomi:yaz' },

  // Hukuki
  [KOLEKSIYONLAR.politikalar]: { oku: 'icerik:oku', yaz: 'politika:yaz', sil: 'politika:yaz' },

  // Operasyon
  [KOLEKSIYONLAR.medya]: { oku: 'icerik:oku', yaz: 'medya:yaz', sil: 'medya:sil' },
  [KOLEKSIYONLAR.yonlendirmeler]: {
    oku: 'icerik:oku',
    yaz: 'yonlendirme:yaz',
    sil: 'yonlendirme:yaz',
  },
  // Arama kayıtları içerik açığı panosunu besleyen editoryal karar verisidir;
  // temizleme yalnızca yönetici işidir. Okuma izni yazma kapısı OLAMAZ.
  [KOLEKSIYONLAR.aramaKayitlari]: { oku: 'arama:oku', yaz: 'ayar:yaz', sil: 'ayar:yaz' },

  // Kişisel veri — dışa aktarma ve silme ayrı izinlerle korunur
  [KOLEKSIYONLAR.kullanicilar]: {
    oku: 'kullanici:oku',
    yaz: 'kullanici:yaz',
    sil: 'kullanici:yaz',
  },
  [KOLEKSIYONLAR.aboneler]: {
    oku: 'kisiselveri:oku',
    yaz: 'kisiselveri:yaz',
    sil: 'kisiselveri:sil',
  },
  [KOLEKSIYONLAR.formKayitlari]: {
    oku: 'kisiselveri:oku',
    yaz: 'kisiselveri:yaz',
    sil: 'kisiselveri:sil',
  },
  [KOLEKSIYONLAR.testSonuclari]: {
    oku: 'kisiselveri:oku',
    yaz: 'kisiselveri:yaz',
    sil: 'kisiselveri:sil',
  },
  [KOLEKSIYONLAR.readinessSonuclari]: {
    oku: 'kisiselveri:oku',
    yaz: 'kisiselveri:yaz',
    sil: 'kisiselveri:sil',
  },
};

/* --- NESNE DÜZEYİNDE YETKİ ----------------------------------------------- */

/**
 * Koleksiyon düzeyindeki izin YETMEZ.
 *
 * `izinVarMi(['yazar'], 'icerik:yaz')` her belge için `true` döner; hangi
 * belge olduğu sorulmaz. Bu, bir yazarın başkasının taslağını veya yayındaki
 * bir makaleyi düzenlemesine izin verir (IDOR). Nesne düzeyindeki kontrol
 * burada yapılır ve yazma yolunda ZORUNLUDUR.
 */
export type NesneKarari = { izinli: true } | { izinli: false; neden: string };

export type YetkiliKullanici = {
  kimlik: string;
  roller: readonly string[];
  yazarSlug?: string;
};

const IZINLI: NesneKarari = { izinli: true };

function ret(neden: string): NesneKarari {
  return { izinli: false, neden };
}

/**
 * Bir belge üzerinde yazma/silme yetkisini belge içeriğine bakarak karar verir.
 * `belge` yeni kayıtta `null` olur.
 */
export function nesneYetkisi(parametreler: {
  kullanici: YetkiliKullanici;
  koleksiyon: string;
  belge: Record<string, unknown> | null;
  eylem: 'yaz' | 'sil';
}): NesneKarari {
  const { kullanici, koleksiyon, belge, eylem } = parametreler;
  const duzey = enYuksekDuzey(kullanici.roller);

  // Editör ve üstü için nesne düzeyinde ek kısıt yok (kullanıcı yönetimi hariç).
  const ustDuzey = duzey >= ROL_DUZEYI.editor;

  /* --- İçerik: yazar yalnızca kendi yayımlanmamış taslağına dokunur --- */
  if (koleksiyon === KOLEKSIYONLAR.icerikler && !ustDuzey) {
    if (eylem === 'sil') return ret('Yazar rolü içerik silemez.');
    if (!belge) return IZINLI; // yeni taslak — sahiplik yazma anında damgalanır

    const sahip = typeof belge.yazarSlug === 'string' ? belge.yazarSlug : undefined;
    if (!kullanici.yazarSlug || sahip !== kullanici.yazarSlug) {
      return ret('Yalnızca kendi içeriklerinizi düzenleyebilirsiniz.');
    }
    if (belge.durum === 'yayinda') {
      return ret('Yayındaki içerik yazar rolüyle düzenlenemez; editöre iletin.');
    }
    return IZINLI;
  }

  /* --- Kullanıcılar: ayrıcalık yükseltmesini engelle --- */
  if (koleksiyon === KOLEKSIYONLAR.kullanicilar) {
    if (!belge) {
      // Yeni kullanıcı: rol atama kontrolü `rolAtamaKarari` ile ayrıca yapılır.
      return duzey >= ROL_DUZEYI.yonetici ? IZINLI : ret('Kullanıcı oluşturma yetkiniz yok.');
    }

    const hedefRoller = Array.isArray(belge.roller) ? (belge.roller as string[]) : [];
    const hedefDuzey = enYuksekDuzey(hedefRoller);
    const kendisi = String(belge._id ?? '') === kullanici.kimlik;

    if (kendisi && eylem === 'sil') return ret('Kendi hesabınızı silemezsiniz.');

    // Kendinden yetkili veya eşit bir hesaba dokunulamaz (sahip kendisi hariç).
    if (!kendisi && hedefDuzey >= duzey) {
      return ret('Kendinizle aynı veya daha yüksek yetkili bir hesabı değiştiremezsiniz.');
    }
    return IZINLI;
  }

  return IZINLI;
}

/**
 * Rol atama kararı — ayrıcalık yükseltmesinin asıl kapısı.
 *
 * Kurallar:
 *  1. Kendi düzeyinin ÜSTÜNDE bir rol atanamaz (yönetici → sahip yapamaz).
 *  2. Kendi rollerini kimse değiştiremez (kendini yükseltme yolu kapalı).
 *  3. Son sahip hesabı sahiplikten düşürülemez.
 */
export function rolAtamaKarari(parametreler: {
  kullanici: YetkiliKullanici;
  hedefKimlik: string;
  hedefinMevcutRolleri: readonly string[];
  yeniRoller: readonly string[];
  sistemdekiSahipSayisi: number;
}): NesneKarari {
  const { kullanici, hedefKimlik, hedefinMevcutRolleri, yeniRoller, sistemdekiSahipSayisi } =
    parametreler;

  const duzey = enYuksekDuzey(kullanici.roller);
  if (duzey < ROL_DUZEYI.yonetici) return ret('Rol değiştirme yetkiniz yok.');

  if (hedefKimlik === kullanici.kimlik) {
    return ret('Kendi rollerinizi değiştiremezsiniz. Başka bir yöneticiden isteyin.');
  }

  const gecersiz = yeniRoller.filter((r) => !ROLLER.includes(r as Rol));
  if (gecersiz.length) return ret(`Tanınmayan rol: ${gecersiz.join(', ')}`);
  if (!yeniRoller.length) return ret('En az bir rol atanmalı.');

  if (enYuksekDuzey(yeniRoller) > duzey) {
    return ret('Kendi yetki düzeyinizin üstünde bir rol atayamazsınız.');
  }
  if (enYuksekDuzey(hedefinMevcutRolleri) >= duzey) {
    return ret('Kendinizle aynı veya daha yüksek yetkili bir hesabın rolünü değiştiremezsiniz.');
  }

  const sahiplikKaldiriliyor =
    hedefinMevcutRolleri.includes('sahip') && !yeniRoller.includes('sahip');
  if (sahiplikKaldiriliyor && sistemdekiSahipSayisi <= 1) {
    return ret('Sistemde en az bir sahip hesabı kalmalı.');
  }

  return IZINLI;
}

/* --- ALAN BEYAZ LİSTESİ --------------------------------------------------- */

/**
 * Kütle atama (mass assignment) koruması.
 *
 * Genel CRUD motoru form verisini doğrudan `$set` ile geçirir. Güvenlik
 * açısından kritik alanlar bu yolla ASLA yazılamaz; yalnızca kendilerine ait
 * özel eylemlerle değişir (parola değiştirme, rol atama, hesap askıya alma).
 */
export const GENEL_YAZMADA_YASAK_ALANLAR: Record<string, readonly string[]> = {
  [KOLEKSIYONLAR.kullanicilar]: [
    'parolaOzeti',
    'parolaGuncellendi',
    'parolaSifirlamaOzeti',
    'parolaSifirlamaBitis',
    'roller',
    'durum',
    'epostaDogrulandi',
    'basarisizGiris',
    'kilitBitis',
    'sonGiris',
    'sonGirisAdresi',
  ],
  [KOLEKSIYONLAR.oturumlar]: ['*'],
  [KOLEKSIYONLAR.girisDenemeleri]: ['*'],
  [KOLEKSIYONLAR.denetimKaydi]: ['*'],
  [KOLEKSIYONLAR.icerikSurumleri]: ['*'],
  [KOLEKSIYONLAR.onizlemeAnahtarlari]: ['*'],
};

/** Her koleksiyonda genel motorun asla yazamayacağı alanlar. */
export const HER_ZAMAN_YASAK_ALANLAR: readonly string[] = [
  '_id',
  'olusturuldu',
  'guncellendi',
  'surumNo',
];

/**
 * Gelen veriden yazılamayacak alanları ayıklar.
 * `['*']` tanımlıysa koleksiyon genel motorla hiç yazılamaz.
 */
export function yazilabilirAlanlar<T extends Record<string, unknown>>(
  koleksiyon: string,
  veri: T,
): { veri: Partial<T>; ayiklanan: string[] } | null {
  const yasak = GENEL_YAZMADA_YASAK_ALANLAR[koleksiyon] ?? [];
  if (yasak.includes('*')) return null;

  const tumYasak = new Set([...yasak, ...HER_ZAMAN_YASAK_ALANLAR]);
  const sonuc: Record<string, unknown> = {};
  const ayiklanan: string[] = [];

  for (const [anahtar, deger] of Object.entries(veri)) {
    if (tumYasak.has(anahtar)) {
      ayiklanan.push(anahtar);
      continue;
    }
    sonuc[anahtar] = deger;
  }

  return { veri: sonuc as Partial<T>, ayiklanan };
}
