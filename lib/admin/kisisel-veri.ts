/**
 * Kişisel veri sunum yardımcıları.
 *
 * KVKK "veri minimizasyonu" ilkesinin panel karşılığı: editör bir listeye
 * bakarken ham e-posta veya telefon görmek zorunda DEĞİLDİR. Liste ekranları
 * maskelenmiş değer gösterir; ham değer yalnızca tek bir kayıt için, ayrı bir
 * istekle ve denetim kaydı yazılarak açılır (bkz. `gelenKaydiAc`).
 *
 * Maskeleme bir güvenlik kontrolü DEĞİLDİR — veriyi sorgulayan kod ham değeri
 * görür. Amaç omuz üstünden okuma, ekran paylaşımı ve ekran görüntüsü
 * yüzeyini küçültmektir.
 *
 * Bu modül veritabanına dokunmaz; istemci bileşenleri de içe alabilir.
 */

const EPOSTA_DESENI = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** `sukru.kaya@site.com` → `s***@site.com`. Alan adı korunur; hangi sağlayıcı olduğu operasyon için gerekli. */
export function epostaMaskele(deger: string): string {
  const eposta = deger.trim();
  const at = eposta.lastIndexOf('@');
  if (at <= 0) return metinMaskele(eposta);

  const yerel = eposta.slice(0, at);
  const alan = eposta.slice(at + 1);
  const ilk = yerel.slice(0, 1);
  return `${ilk}***@${alan}`;
}

/** Serbest metni maskeler: ilk karakter kalır, gerisi yıldız olur. */
export function metinMaskele(deger: string): string {
  const metin = deger.trim();
  if (!metin) return '—';
  if (metin.length <= 2) return '*'.repeat(metin.length);
  return `${metin.slice(0, 1)}${'*'.repeat(Math.min(metin.length - 1, 6))}`;
}

/**
 * Telefonu maskeler; yalnızca son iki hane kalır (kaydı ayırt etmeye yeter).
 *
 * Kısa veya eksik bir numarada hiçbir hane bırakılmaz: üç haneli bir parçanın
 * ilk hanesini göstermek bilgi verir, ayırt etmeye yaramaz.
 */
export function telefonMaskele(deger: string): string {
  const rakamlar = deger.replace(/\D/g, '');
  if (!rakamlar) return metinMaskele(deger);
  if (rakamlar.length < 7) return '*'.repeat(rakamlar.length);
  return `${'*'.repeat(rakamlar.length - 2)}${rakamlar.slice(-2)}`;
}

const TELEFON_ANAHTARI = /(telefon|gsm|cep|phone|tel)$/i;
const EPOSTA_ANAHTARI = /(eposta|email|mail)$/i;
const AD_ANAHTARI = /(adsoyad|isim|ad|soyad|name)$/i;

/**
 * Form alanlarının serbest şemasını maskeler.
 *
 * `form_kayitlari.alanlar` şemada `object` olarak serbesttir: hangi formun
 * hangi alanı gönderdiği önceden bilinmez. Bu yüzden karar ALAN ADINA göre
 * verilir; tanınmayan alanlar kısaltılır ama maskelenmez (ör. "konu", "mesaj"
 * editoryal olarak gerekli).
 */
export function alanDegeriniMaskele(
  anahtar: string,
  deger: unknown,
): { metin: string; maskeli: boolean } {
  if (deger === null || deger === undefined) return { metin: '—', maskeli: false };
  if (typeof deger === 'boolean') return { metin: deger ? 'evet' : 'hayır', maskeli: false };
  if (typeof deger === 'number') return { metin: String(deger), maskeli: false };
  if (deger instanceof Date) return { metin: gunMetni(deger), maskeli: false };

  if (Array.isArray(deger)) {
    return { metin: `${deger.length} öge`, maskeli: false };
  }

  if (typeof deger === 'object') return { metin: '{…}', maskeli: false };

  const metin = String(deger).trim();
  if (!metin) return { metin: '—', maskeli: false };

  if (EPOSTA_DESENI.test(metin) || EPOSTA_ANAHTARI.test(anahtar)) {
    return { metin: epostaMaskele(metin), maskeli: true };
  }
  if (TELEFON_ANAHTARI.test(anahtar)) {
    return { metin: telefonMaskele(metin), maskeli: true };
  }
  if (AD_ANAHTARI.test(anahtar)) {
    return { metin: metinMaskele(metin), maskeli: true };
  }

  return { metin: metin.length > 120 ? `${metin.slice(0, 119)}…` : metin, maskeli: false };
}

/* --- SAKLAMA SÜRESİ ------------------------------------------------------- */

export type SaklamaDurumu = {
  /** Kayıtta `saklamaBitis` var mı. Yoksa TTL o kaydı asla silmez. */
  tanimli: boolean;
  /** Saklama süresi dolmuş; kayıt silinmeyi bekliyor. */
  gecti: boolean;
  /** Bitişe kalan tam gün; geçmişse negatif, tanımsızsa null. */
  kalanGun: number | null;
  /** Ekranda gösterilecek kısa metin. */
  metin: string;
};

const GUN_MS = 86_400_000;

/**
 * Saklama süresinin durumunu hesaplar.
 *
 * TTL dizini süresi geçen kaydı ~60 saniyede bir süpürür; yine de bu bilgi
 * ekranda GÖRÜNÜR olmak zorunda. `saklamaBitis` alanı hiç yoksa TTL o kaydı
 * hiçbir zaman silmez ve kayıt süresiz saklanır — bu bir KVKK bulgusudur,
 * editör görmeli.
 */
export function saklamaDurumu(
  bitis: Date | string | null | undefined,
  simdi = new Date(),
): SaklamaDurumu {
  if (!bitis) {
    return { tanimli: false, gecti: false, kalanGun: null, metin: 'süre yok' };
  }

  const tarih = bitis instanceof Date ? bitis : new Date(bitis);
  if (Number.isNaN(tarih.getTime())) {
    return { tanimli: false, gecti: false, kalanGun: null, metin: 'geçersiz' };
  }

  const kalanGun = Math.floor((tarih.getTime() - simdi.getTime()) / GUN_MS);
  if (kalanGun < 0) {
    return { tanimli: true, gecti: true, kalanGun, metin: `${gunMetni(tarih)} · süresi geçti` };
  }

  return { tanimli: true, gecti: false, kalanGun, metin: `${gunMetni(tarih)} · ${kalanGun} gün` };
}

/** ISO tarih (YYYY-AA-GG). Panelde tek biçim kullanılır. */
export function gunMetni(deger: Date | string | null | undefined): string {
  if (!deger) return '—';
  const tarih = deger instanceof Date ? deger : new Date(deger);
  if (Number.isNaN(tarih.getTime())) return '—';
  return tarih.toISOString().slice(0, 10);
}

/** ISO tarih + saat (YYYY-AA-GG SS:DD). */
export function zamanMetni(deger: Date | string | null | undefined): string {
  if (!deger) return '—';
  const tarih = deger instanceof Date ? deger : new Date(deger);
  if (Number.isNaN(tarih.getTime())) return '—';
  return tarih.toISOString().slice(0, 16).replace('T', ' ');
}
