/**
 * Otomatik terim linkleme (BRIEF §6.4).
 *
 * Gövdedeki metinde `terms` koleksiyonundaki bir terim geçtiğinde, terimin
 * İLK geçtiği yer bir kez `<Terim slug="...">` ile sarılır. Amaç: aynı kavram
 * sitenin her yerinde aynı adla anılsın ve kanonik tanıma bağlansın (§1.3
 * "Türkçe terminoloji kaosu" tezinin teknik karşılığı).
 *
 * BRIEF §6.4 "yayınlanma sırasında" der; burada RENDER anında uygulanıyor.
 * Gerekçe: sözlük büyüdükçe eski içerikler yeniden yayınlanmadan da
 * bağlanır ve gövde verisi mutasyona uğramaz (ham `.md` yüzeyi temiz kalır).
 * ISR sayesinde maliyet içerik başına bir kez ödenir.
 *
 * YANLIŞ POZİTİF KORUMASI (DoD: < %2):
 *  1. Kod çitleri, satır içi kod, JSX etiketleri, markdown bağlantıları,
 *     başlıklar ve mevcut `<Terim>`/`<Kaynak>` sarmalayıcıları dokunulmaz —
 *     hepsi taramadan önce yer tutucuya alınır.
 *  2. Eşleşme kelime sınırında olmalı; terimden önce/sonra harf gelemez.
 *  3. Çekim eki kuyruğu SERBEST harf dizisi değil, gerçek Türkçe ek
 *     listesinden gelir. Serbest bıraktığımızda "gömme" + "ktir" →
 *     "gömmektir" gibi fiil çekimleri yanlışlıkla eşleşiyordu (27 yayında
 *     ölçüldü); ek listesi bu sınıfı tamamen kapatır.
 *  3b. Sarmalanan metin ANINDA korumaya alınır. Aksi hâlde daha kısa bir
 *     terim, az önce eklenen `slug="..."` özniteliğinin içinde eşleşip
 *     iç içe etiket üretiyordu (MDX derlemesi kırılıyordu).
 *  4. Kısa terimler: 4 karakterden kısa olanlar yalnız TAMAMI BÜYÜK HARF
 *     kısaltmaysa (RAG, LLM, MCP) ve harfi harfine eşleşirse bağlanır;
 *     3 harften kısa hiçbir terim bağlanmaz. Böylece "ağ" gibi genel
 *     kelimeler gövdeyi kirletmez ama kısaltmalar kaybolmaz.
 *  5. İçeriğin kendi terimi linklenmez (haricSlug).
 */

export interface LinklenecekTerim {
  slug: string;
  /** Türkçe kanonik ad. */
  tr: string;
  /** Eşanlamlılar; kanonik adla aynı slug'a bağlanır. */
  aliases?: string[];
}

/** Korunacak bölgeler: kod, JSX, bağlantı, başlık, mevcut bileşen sarmalı. */
const KORUNAN_DESENLER: RegExp[] = [
  /```[\s\S]*?```/g, // kod çiti
  /`[^`\n]+`/g, // satır içi kod
  /<[A-Za-z][^>]*>[\s\S]*?<\/[A-Za-z][\w]*>/g, // çift JSX etiketi (içeriğiyle)
  /<[^>]+>/g, // tekil JSX/HTML etiketi
  /\[[^\]]*\]\([^)]*\)/g, // markdown bağlantısı
  /^#{1,6} .*$/gm, // başlıklar
  /^\s*\|.*\|\s*$/gm, // tablo satırları (hücre içi link karmaşası olmasın)
];

const YER_TUTUCU_BASI = "";
const YER_TUTUCU_SONU = "";

function korumayaAl(metin: string): { govde: string; parcalar: string[] } {
  const parcalar: string[] = [];
  let govde = metin;
  for (const desen of KORUNAN_DESENLER) {
    govde = govde.replace(desen, (es) => {
      parcalar.push(es);
      return `${YER_TUTUCU_BASI}${parcalar.length - 1}${YER_TUTUCU_SONU}`;
    });
  }
  return { govde, parcalar };
}

function korumayiCoz(metin: string, parcalar: string[]): string {
  let sonuc = metin;
  // Sondan başa: iç içe yer tutucular doğru çözülsün
  for (let i = parcalar.length - 1; i >= 0; i--) {
    sonuc = sonuc.split(`${YER_TUTUCU_BASI}${i}${YER_TUTUCU_SONU}`).join(parcalar[i] ?? "");
  }
  return sonuc;
}

function regexKacis(deger: string): string {
  return deger.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Türkçe küçük harf kümesi — sınır kontrolü için. */
const HARF = "a-zA-ZçÇğĞıİöÖşŞüÜ";

/**
 * İzin verilen çekim ekleri (uzundan kısaya sıralı — regex alternasyonu ilk
 * eşleşeni alır). Yalnız isim çekimi: sahiplik, hâl ve çoğul. Fiil ekleri
 * (-mek, -tir, -yor…) BİLİNÇLİ olarak yok; terimler isimdir.
 */
const CEKIM_EKLERI = [
  "lerinden",
  "larından",
  "lerinde",
  "larında",
  "leriyle",
  "larıyla",
  "lerini",
  "larını",
  "lerine",
  "larına",
  "lerin",
  "ların",
  "lerde",
  "larda",
  "lerden",
  "lardan",
  "leri",
  "ları",
  "lere",
  "lara",
  "ler",
  "lar",
  "sinden",
  "sından",
  "sundan",
  "sünden",
  "sinde",
  "sında",
  "sunda",
  "sünde",
  "sini",
  "sını",
  "sunu",
  "sünü",
  "sine",
  "sına",
  "suna",
  "süne",
  "siyle",
  "sıyla",
  "suyla",
  "süyle",
  "si",
  "sı",
  "su",
  "sü",
  "nden",
  "ndan",
  "nin",
  "nın",
  "nun",
  "nün",
  "nde",
  "nda",
  "ne",
  "na",
  "ni",
  "nı",
  "nu",
  "nü",
  "den",
  "dan",
  "ten",
  "tan",
  "in",
  "ın",
  "un",
  "ün",
  "de",
  "da",
  "te",
  "ta",
  "yle",
  "yla",
  "le",
  "la",
  "ye",
  "ya",
  "yi",
  "yı",
  "yu",
  "yü",
  "i",
  "ı",
  "u",
  "ü",
  "e",
  "a",
] as const;

const EK_DESENI = `(?:['’]?(?:${CEKIM_EKLERI.join("|")}))?`;
/** Kısa kökler için: ek yalnız kesme işaretiyle gelirse kabul edilir. */
const KESMELI_EK_DESENI = `(?:['’](?:${CEKIM_EKLERI.join("|")}))?`;

export interface LinklemeSonucu {
  govde: string;
  /** Fiilen bağlanan terim slug'ları (ölçüm/hata ayıklama için). */
  baglananlar: string[];
}

export function terimleriLinkle(
  body: string,
  terimler: LinklenecekTerim[],
  secenekler: { haricSlug?: string } = {},
): LinklemeSonucu {
  const { haricSlug } = secenekler;
  const { govde, parcalar } = korumayaAl(body);

  // Kısaltma mı? (RAG, LLM, MCP…) — tamamı büyük harf ve en az 3 karakter
  const kisaltmaMi = (ad: string) => ad.length >= 3 && ad === ad.toLocaleUpperCase("tr-TR");

  // Uzun terimler önce denenir: "gömme vektörü" > "vektör"
  const adaylar = terimler
    .filter((t) => t.slug !== haricSlug)
    .flatMap((t) => [t.tr, ...(t.aliases ?? [])].map((ad) => ({ slug: t.slug, ad: ad.trim() })))
    .filter((a) => a.ad.length >= 4 || kisaltmaMi(a.ad))
    .sort((a, b) => b.ad.length - a.ad.length);

  const baglananlar: string[] = [];
  const tumParcalar = [...parcalar];
  let sonuc = govde;

  for (const aday of adaylar) {
    if (baglananlar.includes(aday.slug)) continue; // her terim en çok bir kez

    // Kelime sınırı: öncesinde/sonrasında harf olamaz; sonrasında yalnız
    // listedeki gerçek Türkçe çekim eklerinden biri gelebilir.
    // Kısaltmalar harfi harfine eşleşir (rag ≠ RAG); diğerleri büyük/küçük
    // harf duyarsız.
    const bayraklar = aday.ad.length < 4 ? "u" : "iu";
    // KISA KÖK KURALI: 6 karakterden kısa terimlerde eksiz gövde ya da
    // KESME İŞARETLİ ek kabul edilir. Ölçümde "ajan"+"da" → "ajanda" ve
    // "gömme"+"ye" → "gömmeye" (fiil) gibi yanlış eşleşmeler bu sınıftan
    // geliyordu; kesme işareti Türkçede özel ad/kısaltma ekini işaretlediği
    // için ("token'lar", "RAG'ın") o biçim güvenle kalır.
    const ekDeseni = aday.ad.length >= 6 ? EK_DESENI : KESMELI_EK_DESENI;
    const desen = new RegExp(
      `(^|[^${HARF}\\w])(${regexKacis(aday.ad)})(${ekDeseni})(?![${HARF}])`,
      bayraklar,
    );
    const es = desen.exec(sonuc);
    if (es === null) continue;

    const [tam, onEk = "", govdeMetni = "", cekim = ""] = es;
    // Sarmalı doğrudan gövdeye yazmak yerine KORUMAYA AL: sonraki (daha kısa)
    // terimler bu işaretlemenin içinde — özellikle slug="" özniteliğinde —
    // eşleşemesin. Bu koruma olmadan iç içe <Terim> üretiliyordu.
    tumParcalar.push(`<Terim slug="${aday.slug}">${govdeMetni}${cekim}</Terim>`);
    const yerine = `${onEk}${YER_TUTUCU_BASI}${tumParcalar.length - 1}${YER_TUTUCU_SONU}`;
    sonuc = sonuc.slice(0, es.index) + yerine + sonuc.slice(es.index + tam.length);
    baglananlar.push(aday.slug);
  }

  return { govde: korumayiCoz(sonuc, tumParcalar), baglananlar };
}
