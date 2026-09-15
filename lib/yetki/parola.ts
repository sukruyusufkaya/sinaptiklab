import { randomBytes, scrypt as scryptGeriCagirmali, timingSafeEqual } from 'node:crypto';
import type { ScryptOptions } from 'node:crypto';
import { promisify } from 'node:util';

/**
 * Parola özetleme — scrypt (node:crypto, ek bağımlılık yok).
 *
 * Parola ASLA düz metin saklanmaz. Kayıt biçimi maliyet parametrelerini de
 * taşır; böylece maliyet ileride yükseltilince eski özetler doğrulanmaya
 * devam eder ve kullanıcı bir sonraki girişinde sessizce yeni parametrelere
 * taşınabilir (bkz. `yenilenmeliMi`).
 *
 *   scrypt$<N>$<r>$<p>$<tuz-base64>$<ozet-base64>
 *
 * Bu modül yalnızca sunucuda çalışır.
 */

/**
 * `promisify` çok imzalı `scrypt`in yalnızca ilk aşırı yüklemesini görür;
 * seçenek nesnesi alan imzayı açıkça yazıyoruz.
 */
const scrypt = promisify(scryptGeriCagirmali) as (
  parola: string | Buffer,
  tuz: string | Buffer,
  uzunluk: number,
  secenekler: ScryptOptions,
) => Promise<Buffer>;

/** Mevcut maliyet parametreleri. Yükseltilirse eski özetler yine doğrulanır. */
const N = 16384; // 2^14 — OWASP asgarisinin üstünde, sunucusuz ortamda makul
const R = 8;
const P = 1;
const OZET_UZUNLUK = 32;
const TUZ_UZUNLUK = 16;

/** scrypt bellek ihtiyacı ≈ 128 · N · r; varsayılan 32 MB sınırı yetmez. */
const MAKS_BELLEK = 64 * 1024 * 1024;

export type ParolaGucu = {
  gecerli: boolean;
  sorunlar: string[];
};

/**
 * Asgari parola politikası. Karmaşıklık kuralları yerine uzunluk önceliklidir
 * (NIST SP 800-63B); uzunluk, karakter sınıfı zorlamasından daha etkilidir.
 */
export function parolaGucunuDenetle(parola: string, eposta?: string): ParolaGucu {
  const sorunlar: string[] = [];

  if (parola.length < 12) sorunlar.push('En az 12 karakter olmalı.');
  if (parola.length > 200) sorunlar.push('En fazla 200 karakter olabilir.');
  if (/^\s|\s$/.test(parola)) sorunlar.push('Başında veya sonunda boşluk olamaz.');

  // DİKKAT: Burada `toLocaleLowerCase('tr-TR')` KULLANILMAZ. Türkçe yerelde
  // "I" harfi noktasız "ı"ya döner; "ADMIN1234567" → "admın1234567" olur ve
  // yasak liste denetimini sessizce geçer. Güvenlik karşılaştırmaları her
  // zaman yerelden bağımsız `toLowerCase()` ile yapılır.
  const sade = parola.toLowerCase();
  if (eposta) {
    const yerelKisim = eposta.split('@')[0]?.toLowerCase() ?? '';
    if (yerelKisim.length > 2 && sade.includes(yerelKisim)) {
      sorunlar.push('E-posta adresinizi içeremez.');
    }
  }

  // Türkçe katlama da ayrıca denetlenir: kullanıcı "ADMIN" yazıp Türkçe
  // katlamayla listeyi atlatmaya çalışırsa ikinci biçim yakalar.
  const turkceKatlanmis = parola.toLocaleLowerCase('tr-TR').replaceAll('ı', 'i');
  for (const yasak of ['sinaptik', 'parola', 'password', '123456', 'qwerty', 'admin']) {
    if (sade.includes(yasak) || turkceKatlanmis.includes(yasak)) {
      sorunlar.push(`Tahmin edilebilir bir dizi içeriyor: "${yasak}".`);
      break;
    }
  }

  return { gecerli: sorunlar.length === 0, sorunlar };
}

export async function parolaOzetle(parola: string): Promise<string> {
  const tuz = randomBytes(TUZ_UZUNLUK);
  const ozet = await scrypt(parola.normalize('NFKC'), tuz, OZET_UZUNLUK, {
    N,
    r: R,
    p: P,
    maxmem: MAKS_BELLEK,
  });

  return ['scrypt', N, R, P, tuz.toString('base64'), ozet.toString('base64')].join('$');
}

type Cozulmus = { n: number; r: number; p: number; tuz: Buffer; ozet: Buffer };

function coz(kayit: string): Cozulmus | null {
  const parcalar = kayit.split('$');
  if (parcalar.length !== 6 || parcalar[0] !== 'scrypt') return null;

  const n = Number(parcalar[1]);
  const r = Number(parcalar[2]);
  const p = Number(parcalar[3]);
  if (!Number.isInteger(n) || !Number.isInteger(r) || !Number.isInteger(p)) return null;
  // Kötü niyetli veya bozuk bir kayıt aşırı bellek/CPU talep edemesin.
  if (n < 1024 || r < 1 || p < 1 || p > 16) return null;
  // Kelepçe MAKS_BELLEK ile TUTARLI olmalı: scrypt bellek ihtiyacı ≈ 128·N·r.
  // Aksi hâlde `coz()` geçerli saydığı bir kaydı `parolaDogrula` içinde
  // ERR_CRYPTO_INVALID_SCRYPT_PARAMS ile patlatır ve hesap kalıcı 500'e düşer.
  if (128 * n * r > MAKS_BELLEK) return null;

  try {
    return {
      n,
      r,
      p,
      tuz: Buffer.from(parcalar[4] ?? '', 'base64'),
      ozet: Buffer.from(parcalar[5] ?? '', 'base64'),
    };
  } catch {
    return null;
  }
}

/**
 * Parolayı kayıtla karşılaştırır. Karşılaştırma sabit zamanlıdır.
 *
 * Kayıt bozuksa `false` döner; çağıran taraf yine de sahte bir özetleme
 * yapmalıdır (bkz. `sahteDogrulama`) ki var olmayan kullanıcı ile var olan
 * kullanıcı arasındaki süre farkı hesap varlığını sızdırmasın.
 */
export async function parolaDogrula(parola: string, kayit: string): Promise<boolean> {
  const cozulmus = coz(kayit);
  if (!cozulmus) return false;

  let hesaplanan: Buffer;
  try {
    hesaplanan = await scrypt(parola.normalize('NFKC'), cozulmus.tuz, cozulmus.ozet.length, {
      N: cozulmus.n,
      r: cozulmus.r,
      p: cozulmus.p,
      maxmem: MAKS_BELLEK,
    });
  } catch {
    // Bozuk kayıt doğrulamayı reddeder; hesabı 500'e düşürmez.
    return false;
  }

  if (hesaplanan.length !== cozulmus.ozet.length) return false;
  return timingSafeEqual(hesaplanan, cozulmus.ozet);
}

/**
 * Zamanlama eşitlemesi — ÇAĞIRAN TARAFA BIRAKILMAZ.
 *
 * `kayit` null ise (hesap yok, parola özeti yok) gerçek doğrulamayla aynı
 * maliyette sahte bir özetleme yapılır ve `false` döner. Böylece "kullanıcı
 * yok" ile "parola yanlış" arasındaki yanıt süresi farkı ölçülerek hesap
 * varlığı çıkarılamaz.
 *
 * Giriş akışı DAİMA bu fonksiyonu çağırmalı, `parolaDogrula`yı doğrudan
 * çağırmamalı: tek kod yolu olması korumanın unutulmasını imkânsız kılar.
 */
export async function parolaDenetle(
  parola: string,
  kayit: string | null | undefined,
): Promise<boolean> {
  if (!kayit) {
    const tuz = randomBytes(TUZ_UZUNLUK);
    try {
      await scrypt(parola.normalize('NFKC'), tuz, OZET_UZUNLUK, {
        N,
        r: R,
        p: P,
        maxmem: MAKS_BELLEK,
      });
    } catch {
      /* sahte işin başarısız olması sonucu değiştirmez */
    }
    return false;
  }
  return parolaDogrula(parola, kayit);
}

/** Kayıt güncel maliyet parametrelerinin altındaysa giriş sırasında yenilenir. */
export function yenilenmeliMi(kayit: string): boolean {
  const cozulmus = coz(kayit);
  if (!cozulmus) return true;
  return cozulmus.n < N || cozulmus.r < R || cozulmus.p < P;
}
