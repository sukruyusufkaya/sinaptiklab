import { veritabani } from '@/lib/mongo/istemci';
import { KOLEKSIYONLAR } from '@/lib/mongo/koleksiyonlar';
import {
  basarisizDenemeKaydet,
  gecikmeyiUygula,
  istemciAdresi,
  sinirDurumu,
} from '@/lib/yetki/oran-sinirlama';

/**
 * Ziyaretçi formlarının KENDİ koruma katmanı.
 *
 * NEDEN `korumaliEylem()` KULLANILMIYOR
 *
 * `lib/yetki/korumali-eylem.ts` her çağrıda oturum ister; panel eylemleri için
 * doğru, site formları için imkânsızdır — bu formları kimliği doğrulanmamış
 * ziyaretçiler doldurur. Yani panelin "önce yetki" kapısının yerine burada
 * başka bir kapı kurulmak zorunda: GİRDİ DOĞRULAMA (eylem modülünde) ve ORAN
 * SINIRLAMA (bu modülde).
 *
 * MEKANİZMA YENİDEN YAZILMIYOR, YENİDEN KULLANILIYOR
 *
 * Sayaç, pencere, atomik `$inc` ve TTL temizliği `lib/yetki/oran-sinirlama.ts`
 * içinde çözülmüş durumda (`giris_denemeleri` koleksiyonu, `{anahtar, tur}`
 * üzerinde tekil dizin, `saklamaBitis` üzerinde TTL). Buradaki iş, o
 * mekanizmayı form eksenine TAŞIMAK:
 *
 *  - IP ekseni SERT KİLİT: 15 dakikada 20 gönderimden sonra reddedilir.
 *  - E-posta ekseni ARTAN GECİKME: 3. gönderimden sonra 2^n·250 ms (≤ 4 sn).
 *
 * Eşikler o modülün sabitleridir; burada tekrar tanımlanmaz ki iki yerde
 * ayrışmasın.
 *
 * ANAHTAR AD ALANI (namespace) ZORUNLU
 *
 * `giris_denemeleri` tekil dizini `{anahtar, tur}` üzerindedir ve `tur` enum'u
 * yalnızca `'eposta' | 'adres'` kabul eder. Ham IP veya ham e-posta ile
 * sayılsaydı form gönderimleri PANEL GİRİŞİYLE AYNI sayaca yazardı: bir
 * ziyaretçi iletişim formunu 20 kez doldurarak o IP'den panel girişini
 * kilitleyebilirdi. Bu yüzden anahtarlar `form:` ve `arama:` önekiyle yazılır;
 * `tur` değeri değişmediği için şema doğrulayıcısı da bozulmaz.
 *
 * Yalnızca sunucuda çalışır.
 */

/** Oran sınırlama ad alanları. Birbirini kilitlemeyen ayrı sayaç kümeleri. */
export type SinirKapisi = 'form' | 'arama';

export type GecitKarari =
  { gecti: true; adres: string; gecikmeMs: number } | { gecti: false; adres: string; hata: string };

const KILIT_ILETISI = 'Çok sayıda gönderim algılandı. Lütfen birkaç dakika sonra yeniden deneyin.';

/**
 * Gönderime izin verilip verilmediğini söyler. Sayaç ARTIRMAZ.
 *
 * Kabul edilen gönderimden sonra `gonderimSay()` çağrılır. Sıra bu: önce
 * karar, sonra sayaç. Tersi olursa kilitli bir IP'nin her denemesi sayacı
 * ileri taşır ve kilit hiç açılmaz.
 *
 * @param eposta Varsa e-posta ekseni de sayılır. Yoksa (arama kaydı gibi
 *   e-postasız akışlarda) yalnızca IP ekseni anlamlıdır ve dönen `gecikmeMs`
 *   sıfırdır.
 */
export async function formGeciti(
  kapi: SinirKapisi,
  eposta: string | undefined,
): Promise<GecitKarari> {
  const adres = await istemciAdresi();
  const durum = await sinirDurumu(epostaAnahtari(kapi, eposta, adres), adresAnahtari(kapi, adres));

  if (durum.kilitli) return { gecti: false, adres, hata: KILIT_ILETISI };

  // E-posta ekseni yoksa gecikme uygulanmaz: anahtar zaten IP'dir ve aynı
  // kilidi ikinci kez cezalandırmanın bir karşılığı olmaz.
  return { gecti: true, adres, gecikmeMs: eposta ? durum.gecikmeMs : 0 };
}

/** Kabul edilen gönderimi iki eksende birlikte sayar (atomik `$inc`). */
export async function gonderimSay(
  kapi: SinirKapisi,
  eposta: string | undefined,
  adres: string,
): Promise<void> {
  await basarisizDenemeKaydet(epostaAnahtari(kapi, eposta, adres), adresAnahtari(kapi, adres));
}

/** Artan gecikmeyi uygular; eylem sonucu dönmeden ÖNCE çağrılır. */
export { gecikmeyiUygula };

function adresAnahtari(kapi: SinirKapisi, adres: string): string {
  return `${kapi}:${adres}`;
}

function epostaAnahtari(kapi: SinirKapisi, eposta: string | undefined, adres: string): string {
  return `${kapi}:${eposta ?? adres}`;
}

/* --- POLİTİKA SÜRÜMÜ ------------------------------------------------------ */

/**
 * Onay alınan hukuki metnin sürümü.
 *
 * KVKK açısından "onay verdi" kaydı, ONAYIN VERİLDİĞİ METNİN sürümü olmadan
 * eksiktir: metin sonradan değişince eski onayın neyi kapsadığı bilinemez.
 * `politikalar` koleksiyonu bu yüzden `surum` alanını zorunlu tutuyor.
 *
 * KAYIT BULUNAMAZSA `undefined` DÖNER ve alan HİÇ YAZILMAZ. Uydurma bir sürüm
 * ("1.0") yazmak, var olmayan bir metne onay alındığını belgelemek olurdu —
 * denetimde kanıt değeri olan bir alanı kanıt olmayan bir değerle doldurmak
 * KVKK açısından yanlıştır. Alanın boş kalması panelde görülebilir bir eksik
 * olarak durur (`gelen.ts` → `politikaSurumu?: string`).
 */
export async function politikaSurumu(slug: string): Promise<string | undefined> {
  try {
    const db = await veritabani();
    const belge = await db
      .collection<{ slug: string; surum?: string; durum?: string }>(KOLEKSIYONLAR.politikalar)
      .findOne({ slug, durum: 'yayinda' }, { projection: { _id: 0, surum: 1 } });

    const surum = belge?.surum;
    return typeof surum === 'string' && surum.trim().length > 0 ? surum.trim() : undefined;
  } catch (hata) {
    console.error('[site:form] politika sürümü okunamadı', hata);
    return undefined;
  }
}

/**
 * Onayların bağlandığı metin.
 *
 * Üç formun üçü de (iletişim, bülten, readiness paylaşımı) sayfa altında KVKK
 * aydınlatma metnine bağlanıyor; onay kaydı da o metnin sürümünü taşır.
 */
export const ONAY_METNI_SLUGU = 'kvkk-aydinlatma';

/* --- SAKLAMA SÜRELERİ ----------------------------------------------------- */

/**
 * KVKK saklama süreleri.
 *
 * `form_kayitlari`, `test_sonuclari` ve `readiness_sonuclari` şemalarında
 * `saklamaBitis` ZORUNLUDUR ve üçünde de `{ saklamaBitis: 1 }` üzerinde
 * `expireAfterSeconds: 0` TTL dizini kurulu (Atlas'ta doğrulandı). Yani bu
 * alan yazılmazsa kayıt SÜRESİZ saklanır; yazılırsa süre dolduğunda MongoDB
 * kaydı kendisi siler.
 *
 * Süreler SABİTTİR ve gerekçeleri:
 *
 *  - İLETİŞİM/TEKLİF: 24 ay. Kurumsal bir teklif görüşmesinin tekrar açılma
 *    ufku bir bütçe döngüsünden uzundur; iki yıl, "geçen yıl konuşmuştuk"
 *    talebini karşılayan en kısa süredir. On yıllık genel zamanaşımına
 *    yaklaşmak ölçülülük ilkesine aykırı olurdu.
 *  - TEST SONUCU: 12 ay. Kayıt anonimdir ve yalnızca toplu istatistik için
 *    tutulur; bir yıl, yıllık karşılaştırma için yeterli en kısa süredir.
 *  - READINESS (paylaşımsız): 12 ay. Aynı gerekçe — yalnızca istatistik.
 *  - READINESS (iletişim izinli): 24 ay. Bu kayıt artık bir talep kaydıdır ve
 *    iletişim formuyla aynı takip ufkuna sahiptir.
 *
 * `aboneler` koleksiyonunda `saklamaBitis` alanı YOKTUR ve TTL dizini de
 * kurulmamıştır: abonelik süreye değil ONAYA bağlıdır ve çıkışla sona erer.
 * Şemada olmayan bir alanı oraya yazmak doğru olmaz.
 */
export const SAKLAMA_AYLARI = {
  formKaydi: 24,
  testSonucu: 12,
  readinessAnonim: 12,
  readinessIletisimIzinli: 24,
} as const;

/**
 * Saklama bitişi TAKVİM AYI ile hesaplanır, "30 gün × ay" ile değil.
 *
 * 24 × 30 gün = 720 gün, yani iki takvim yılından ~5 hafta kısadır. Saklama
 * süresi hukuki bir taahhüt olduğu için "24 ay" denilen yerde tam 24 takvim
 * ayı durmalı: `setMonth` ay sonlarını da doğru taşır (31 Ocak + 1 ay → 3 Mart
 * değil, 28/29 Şubat'ı aşan gün kaydırması JS'in kendi kuralıyla olur ve gün
 * farkı hesaplamanın lehine değil aleyhine çalışmaz).
 */
export function saklamaBitisi(ay: number, simdi = new Date()): Date {
  const bitis = new Date(simdi.getTime());
  bitis.setMonth(bitis.getMonth() + ay);
  return bitis;
}
