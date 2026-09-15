import { cache } from 'react';
import { veritabani } from '@/lib/mongo/istemci';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';

/**
 * URL yönlendirme çözümü (MASTER-PLAN §48).
 *
 * Panel `yonlendirmeler` koleksiyonuna kayıt yazıyordu ama HİÇBİR YER OKUMUYORDU:
 * editör 301 tanımlıyor, eski adres yine 404 veriyordu. Bu modül o boşluğu kapatır.
 *
 * ÇÖZÜM NEREDE ÇALIŞIR — ve neden `proxy.ts` içinde DEĞİL
 *
 * `proxy.ts` (Next 16'ya kadar `middleware.ts`) Edge çalışma zamanındadır ve
 * MongoDB sürücüsünü yükleyemez (aynı kısıt oturum doğrulamasında da var;
 * bkz. `lib/yetki/oturum-sabitleri.ts`). Ayrıca eşleştiricisi yalnızca
 * `/admin` yollarını kapsıyor.
 *
 * `next.config.ts` içindeki `redirects()` de bilinçli olarak KULLANILMADI:
 * o katman yönlendirmeyi rotalamadan ÖNCE uygular, yani editör yanlışlıkla
 * YAYINDA olan bir adresi kaynak yol yazarsa o sayfa bir sonraki dağıtıma kadar
 * erişilemez olur. Üstelik yeni kayıt ancak yeniden dağıtımla etkinleşir.
 *
 * Bu yüzden çözüm `app/(site)/[...yol]/page.tsx` yakalayıcı rotasındadır:
 * Next yol eşleştirmede statik ve dinamik rotaları yakalayıcıdan ÖNCE dener, bu
 * yüzden bu kod YALNIZCA gerçek bir sayfaya karşılık gelmeyen adreslerde çalışır.
 * Yaşayan bir sayfayı gölgelemesi yapısal olarak imkânsızdır ve panelde yazılan
 * kayıt anında etkilidir.
 *
 * DURUM KODU: App Router `redirect()` ile 307, `permanentRedirect()` ile 308
 * üretir; 301 gönderemez. 301 ve 308 ikisi de KALICI yönlendirmedir ve arama
 * motorları bağlantı değerini ikisinde de aktarır; 308 ek olarak isteğin
 * yöntemini korur. Bu yüzden kayıttaki 301 ve 308 → 308, 302 → 307 olarak
 * karşılanır. Alan yardım metni bunu editöre söyler.
 */

export type YonlendirmeSonucu = {
  hedefYol: string;
  /** 301/308 → true (kalıcı), 302 → false (geçici). */
  kalici: boolean;
};

type YonlendirmeBelgesi = {
  kaynakYol: string;
  hedefYol: string;
  kod?: number;
  aktif?: boolean;
};

/** Zincir çözümünde en fazla bu kadar adım izlenir. */
const AZAMI_ADIM = 5;

/**
 * Yolu karşılaştırılabilir biçime getirir.
 *
 * Site `trailingSlash: true` ile çalışıyor ama koleksiyondaki kayıtlar eski
 * projeden eğik çizgisiz taşındı (`/makale/rag-mi-fine-tuning-mi`). Normalize
 * etmeden hiçbir kayıt eşleşmez. Sorgu yaparken HER İKİ biçim de denenir.
 */
export function yoluNormalize(yol: string): string {
  const [yolParcasi = ''] = yol.split('?');
  const tekEgik = `/${yolParcasi}`.replace(/\/{2,}/g, '/');
  return tekEgik.endsWith('/') ? tekEgik : `${tekEgik}/`;
}

function egiksiz(yol: string): string {
  return yol.length > 1 && yol.endsWith('/') ? yol.slice(0, -1) : yol;
}

const kaydiBul = cache(async (yol: string): Promise<YonlendirmeBelgesi | null> => {
  const db = await veritabani();
  return db.collection<YonlendirmeBelgesi>(KOLEKSIYONLAR.yonlendirmeler).findOne(
    {
      kaynakYol: { $in: [yol, egiksiz(yol)] },
      // `aktif` alanı olmayan eski kayıtlar da etkin sayılır; yalnızca açıkça
      // `false` yazılmış kayıt devre dışıdır.
      aktif: { $ne: false },
    },
    { projection: { _id: 0 } },
  );
});

/**
 * Bir yolun yönlendirme hedefini çözer; yönlendirme yoksa `undefined`.
 *
 * Zincirleri izler (A→B→C ise doğrudan C'ye gider) ve DÖNGÜYE KARŞI korumalıdır:
 * görülen yollar kümede tutulur, tekrar görülürse zincir o noktada kesilir.
 * Döngü koruması olmadan A→B→A yazan bir editör siteyi sonsuz yönlendirmeye
 * sokabilirdi.
 */
export async function yonlendirmeCoz(yol: string): Promise<YonlendirmeSonucu | undefined> {
  const baslangic = yoluNormalize(yol);

  let suanki = baslangic;
  const gorulen = new Set<string>([baslangic]);
  let kalici = true;
  let bulundu = false;

  for (let adim = 0; adim < AZAMI_ADIM; adim += 1) {
    const kayit = await kaydiBul(suanki);
    if (!kayit) break;

    const hedef = yoluNormalize(kayit.hedefYol);

    // Kendine yönlendirme ya da döngü: zinciri burada bitir.
    if (gorulen.has(hedef)) {
      console.warn(`[yonlendirme] döngü tespit edildi, zincir kesildi: ${baslangic} → ${hedef}`);
      break;
    }

    gorulen.add(hedef);
    suanki = hedef;
    bulundu = true;
    // Zincirde tek bir geçici adım varsa sonuç geçici sayılır: kalıcı bir
    // yönlendirme tarayıcıda önbelleğe alınır, geçici olanı ezemez.
    if (kayit.kod === 302) kalici = false;
  }

  if (!bulundu || suanki === baslangic) return undefined;
  return { hedefYol: suanki, kalici };
}
