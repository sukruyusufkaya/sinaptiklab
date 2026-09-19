/**
 * Başlığın oturum durumu — İSTEMCİ TARAFI DIŞ DURUM DEPOSU.
 *
 * NEDEN SUNUCUDAN OKUNMUYOR: `app/(site)/layout.tsx` bilerek statiktir
 * (kendi yorumunda yazıyor) ve 1366 sayfa bu sayede prerender ediliyor.
 * Oturumu düzende okumak `cookies()` çağırmak demek; bu, düzenin altındaki
 * HER sayfayı dinamiğe düşürür ve statik üretimi tümüyle bitirirdi. Başlık
 * uğruna sitenin tamamını dinamik yapmak orantısız bir bedel.
 *
 * O yüzden oturum durumu, sayfa yüklendikten SONRA `/api/oturum/` adresinden
 * bir kez çekilir. Sayfanın kendisi statik kalır; yalnızca sağ üstteki
 * kimlik alanı hidrasyondan sonra doğru hâline geçer.
 *
 * NEDEN `useSyncExternalStore`, NEDEN EFFECT İÇİNDE setState DEĞİL: CLAUDE.md
 * kural 3. Oturum React'e ait olmayan bir dış durumdur ve başlık HER sayfada
 * monte olur — her montajda yeniden getirmek, istemci gezinmesinde sayfa
 * başına bir istek demekti. Modül kapsamındaki depo, getirmeyi sekme ömrü
 * boyunca BİR KEZ yapar; sonraki montajlar önbelleği okur.
 *
 * GİRİŞ/ÇIKIŞ SONRASI `oturumTazele()` çağrılır (bkz. `UyelikFormu`,
 * `CikisDugmesi`); yoksa çıkış yapan kullanıcı, tam sayfa yenilemeye kadar
 * başlıkta kendi adını görmeye devam ederdi.
 */

export type OturumDurumu =
  /** Henüz bilinmiyor — hidrasyon öncesi ve getirme sürerken. */
  { asama: 'bilinmiyor' } | { asama: 'anonim' } | { asama: 'girisli'; ad: string; panel: boolean };

/**
 * Anlık görüntüler PAYLAŞILAN SABİT nesnelerdir.
 *
 * `useSyncExternalStore` her render'da `getSnapshot()` çağırır ve dönen değeri
 * bir öncekiyle `Object.is` ile karşılaştırır. Her çağrıda yeni bir nesne
 * üretilseydi React durumu sürekli değişmiş sayar ve sonsuz render döngüsüne
 * girerdi — bu kancanın en bilinen tuzağı.
 */
const BILINMIYOR: OturumDurumu = { asama: 'bilinmiyor' };
const ANONIM: OturumDurumu = { asama: 'anonim' };

let durum: OturumDurumu = BILINMIYOR;
let getirmeBasladi = false;

const dinleyiciler = new Set<() => void>();

function yaz(yeni: OturumDurumu) {
  durum = yeni;
  for (const geriCagir of dinleyiciler) geriCagir();
}

type OturumYaniti = { girisli?: boolean; ad?: string; panel?: boolean };

function getir() {
  /*
   * HATA DURUMUNDA `anonim`. Ağ koptuğunda ya da uç nokta 500 döndüğünde
   * başlık giriş bağlantılarını gösterir — yani bugünkü davranışa düşer.
   * "Bilinmiyor"da takılı kalmak, kullanıcıyı hiçbir şey tıklayamadığı bir
   * iskeletle baş başa bırakırdı.
   */
  fetch('/api/oturum/', { credentials: 'same-origin', cache: 'no-store' })
    .then((yanit) => (yanit.ok ? yanit.json() : Promise.reject(new Error(String(yanit.status)))))
    .then((veri: OturumYaniti) => {
      yaz(
        veri.girisli && veri.ad
          ? { asama: 'girisli', ad: veri.ad, panel: Boolean(veri.panel) }
          : ANONIM,
      );
    })
    .catch(() => yaz(ANONIM));
}

/**
 * Abonelik. İlk abone getirmeyi tetikler.
 *
 * Getirme RENDER SIRASINDA değil abonelikte başlar; `subscribe` bir effect
 * içinde çalıştığı için bu, render'ı yan etkisiz bırakır.
 */
export function oturumAbone(geriCagir: () => void) {
  dinleyiciler.add(geriCagir);
  if (!getirmeBasladi) {
    getirmeBasladi = true;
    getir();
  }
  return () => {
    dinleyiciler.delete(geriCagir);
  };
}

export function oturumOku(): OturumDurumu {
  return durum;
}

/** Sunucuda ve hidrasyondan önce durum her zaman bilinmezdir. */
export function oturumSunucuda(): OturumDurumu {
  return BILINMIYOR;
}

/**
 * Durumu yeniden sorar — giriş, kayıt, hesap güncelleme ve çıkıştan sonra.
 *
 * Önce `bilinmiyor`a düşürülmez: çıkış yapan kullanıcı bir an için iskelet
 * görmek yerine doğrudan doğru hâle geçer, arada titreme olmaz.
 */
export function oturumTazele() {
  getirmeBasladi = true;
  getir();
}
