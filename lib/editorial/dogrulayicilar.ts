// BRIEF §4.3 — 10 editoryal zorlayıcı. Yayınlama Server Action'ı bu kontroller
// geçmeden içeriği `published` yapamaz. Her mesaj editöre NE YAPMASI gerektiğini
// söyler ("geçersiz" demez); admin kontrol listesi (BRIEF §11) bu sonuçları
// madde madde gösterir.
import type { Content } from "@/lib/db/schemas";
import { slugla } from "@/lib/slug";

export interface KontrolSonucu {
  kural: string;
  gecti: boolean;
  mesaj: string;
  oneriler?: string[];
}

export interface DogrulamaBaglami {
  /** Aday DIŞINDAKİ tüm slug'lar (taslaklar dahil) — çakışma denetimi (kural 9). */
  mevcutSluglar: string[];
  /**
   * Yayındaki içeriklerin slug'ları. Çağıran, adayla AYNI pillar'a ait yayın
   * slug'larını vermelidir; iç link önerileri (kural 8) buradan seçilir.
   */
  yayindakiSluglar: string[];
  /**
   * Kırık link denetimi (kural 10). Verilmezse fetch HEAD (5 sn zaman aşımı,
   * 2xx/3xx = sağlam) kullanılır; testlerde sahte fonksiyon geçin — ağa çıkmayın.
   */
  linkDenetleyici?: (url: string) => Promise<boolean>;
}

// ── Ortak yardımcılar ────────────────────────────────────────────────

/** TR-güvenli kelime sayımı: whitespace'e böl, boşları at. */
function kelimeSay(metin: string): number {
  return metin.split(/\s+/).filter((k) => k.length > 0).length;
}

/**
 * Kod blokları (``` çitleri) ve satır içi kod (`...`) içerik denetimlerinden
 * muaf tutulur: örnek koddaki bir URL ya da <img> etiketi editoryal iddia değildir.
 */
function kodsuzGovde(govde: string): string {
  return govde.replace(/```[\s\S]*?```/g, " ").replace(/`[^`\n]*`/g, " ");
}

// BRIEF §2.2 URL şeması — içerik gövdesinde iç link sayılan yol önekleri.
const IC_LINK_ONEKLERI = [
  "/makale/",
  "/rehber/",
  "/uygulama/",
  "/sozluk/",
  "/arac/",
  "/olcum/",
  "/vaka/",
  "/uyum/",
  "/kurs/",
  "/patika/",
  "/konu/",
] as const;

// BRIEF §16/K1 — kanonik alan; bu hostlara giden mutlak URL "dış link" sayılmaz.
const SITE_ALANLARI = new Set(["sinaptiklab.com", "www.sinaptiklab.com"]);

const MD_LINK_DESENI = /(?<!!)\[[^\]]*\]\(\s*<?([^)\s>]+)/g;
const HREF_DESENI = /\bhref\s*=\s*(?:"([^"]+)"|'([^']+)')/gi;

/** Markdown `[metin](url)` linkleri + HTML `href` öznitelikleri. */
function baglantilariAyikla(kodsuz: string): string[] {
  const sonuc: string[] = [];
  for (const es of kodsuz.matchAll(MD_LINK_DESENI)) {
    if (es[1] !== undefined) sonuc.push(es[1]);
  }
  for (const es of kodsuz.matchAll(HREF_DESENI)) {
    const url = es[1] ?? es[2];
    if (url !== undefined) sonuc.push(url);
  }
  return sonuc;
}

function icLinkMi(url: string): boolean {
  return IC_LINK_ONEKLERI.some((onek) => url.startsWith(onek));
}

function disLinkMi(url: string): boolean {
  if (!/^https?:\/\//i.test(url)) return false;
  try {
    return !SITE_ALANLARI.has(new URL(url).hostname.toLowerCase());
  } catch {
    return false;
  }
}

// ── Kural 1: kaynaklar ve <Kaynak> atıf tutarlılığı ──────────────────

const KAYNAK_ATIF_DESENI = /<Kaynak\b[^>]*\bid\s*=\s*(?:"([^"]*)"|'([^']*)'|\{([^}]*)\})/g;

function kaynakAtiflariKurali(aday: Content, kodsuz: string): KontrolSonucu {
  const kural = "kaynak-atiflari";
  if (aday.sources.length === 0) {
    return {
      kural,
      gecti: false,
      mesaj:
        "Hiç kaynak yok; en az 1 kaynak ekleyin (etiket, URL, yayıncı, erişim tarihi, tür). Kaynaksız içerik yayınlanamaz.",
    };
  }

  const atiflar: string[] = [];
  for (const es of kodsuz.matchAll(KAYNAK_ATIF_DESENI)) {
    const ham = (es[1] ?? es[2] ?? es[3] ?? "").trim().replace(/^["']|["']$/g, "");
    atiflar.push(ham);
  }

  if (atiflar.length === 0) {
    return {
      kural,
      gecti: false,
      mesaj:
        'Gövdede hiç <Kaynak> atıfı yok; sayısal iddiaların yanına atıf ekleyin (ör. <Kaynak id="1">p95 gecikme 340 ms</Kaynak>).',
    };
  }

  const gecersizler = atiflar.filter((a) => {
    if (!/^\d+$/.test(a)) return true;
    const numara = Number.parseInt(a, 10);
    return numara < 1 || numara > aday.sources.length;
  });
  if (gecersizler.length > 0) {
    return {
      kural,
      gecti: false,
      mesaj:
        `Gövdedeki ${gecersizler.length} <Kaynak> atıfı kaynak listesiyle eşleşmiyor ` +
        `(id: ${[...new Set(gecersizler)].join(", ")}); id'leri 1..${aday.sources.length} ` +
        "aralığına çekin ya da eksik kaynakları sources listesine ekleyin.",
    };
  }

  return {
    kural,
    gecti: true,
    mesaj: `${aday.sources.length} kaynak ve gövdedeki ${atiflar.length} <Kaynak> atıfı tutarlı.`,
  };
}

// ── Kural 2: answerFirst 40–80 kelime ────────────────────────────────

function kisaCevapKurali(aday: Content): KontrolSonucu {
  const kural = "kisa-cevap";
  const sayi = kelimeSay(aday.answerFirst);
  if (sayi < 40) {
    return {
      kural,
      gecti: false,
      mesaj:
        `"Kısa cevap" (answerFirst) şu an ${sayi} kelime; hedef 40–80 — en az ${40 - sayi} kelime ` +
        "daha ekleyin ve cevabı somut sayı/tarihle doğrudan verin.",
    };
  }
  if (sayi > 80) {
    return {
      kural,
      gecti: false,
      mesaj:
        `"Kısa cevap" (answerFirst) şu an ${sayi} kelime; hedef 40–80 — en az ${sayi - 80} kelime ` +
        "kısaltın, ayrıntıyı gövdeye taşıyın.",
    };
  }
  return { kural, gecti: true, mesaj: `"Kısa cevap" ${sayi} kelime — 40–80 aralığında.` };
}

// ── Kural 3: SSS en az 2 soru ────────────────────────────────────────

function sssKurali(aday: Content): KontrolSonucu {
  const kural = "sss";
  if (aday.faq.length < 2) {
    return {
      kural,
      gecti: false,
      mesaj:
        `SSS'de ${aday.faq.length} soru var; en az 2 gerekiyor — okuyucuların arama motoruna ` +
        `yazacağı ${2 - aday.faq.length} soru-cevap daha ekleyin (FAQPage şeması buradan üretilir).`,
    };
  }
  return { kural, gecti: true, mesaj: `SSS'de ${aday.faq.length} soru-cevap var.` };
}

// ── Kural 4: TOC dolu ve tüm çapalar stabil id taşıyor ───────────────

function icindekilerKurali(aday: Content): KontrolSonucu {
  const kural = "icindekiler";
  if (aday.toc.length === 0) {
    return {
      kural,
      gecti: false,
      mesaj:
        "İçindekiler (toc) boş; gövdeye en az bir H2 başlık ekleyin — toc, içerik kaydedilirken " +
        "mdxDerle tarafından otomatik üretilir.",
    };
  }
  const idsizler = aday.toc.filter((madde) => madde.id.trim().length === 0);
  if (idsizler.length > 0) {
    return {
      kural,
      gecti: false,
      mesaj:
        `İçindekiler'de id'si boş ${idsizler.length} madde var ` +
        `(${idsizler.map((m) => `"${m.text}"`).join(", ")}); içeriği yeniden kaydedin ki ` +
        "mdxDerle her başlığa stabil id üretsin.",
    };
  }
  return {
    kural,
    gecti: true,
    mesaj: `İçindekiler ${aday.toc.length} madde; tüm başlıklar stabil id taşıyor.`,
  };
}

// ── Kural 5: tüm görsellerde alt metni ───────────────────────────────

const MD_GORSEL_DESENI = /!\[([^\]]*)\]\(\s*<?([^)\s>]*)/g;
const IMG_ETIKET_DESENI = /<img\b[^>]*>/gi;
const IMG_ALT_DESENI = /\balt\s*=\s*(?:"([^"]*)"|'([^']*)')/i;
const IMG_SRC_DESENI = /\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)')/i;

function gorselAltKurali(kodsuz: string): KontrolSonucu {
  const kural = "gorsel-alt";
  const eksikler: string[] = [];
  let toplam = 0;

  for (const es of kodsuz.matchAll(MD_GORSEL_DESENI)) {
    toplam += 1;
    if ((es[1] ?? "").trim().length === 0) {
      const url = es[2] ?? "";
      eksikler.push(url.length > 0 ? url : "(url'siz görsel)");
    }
  }
  for (const es of kodsuz.matchAll(IMG_ETIKET_DESENI)) {
    toplam += 1;
    const alt = IMG_ALT_DESENI.exec(es[0]);
    const altMetni = alt !== null ? (alt[1] ?? alt[2] ?? "") : "";
    if (altMetni.trim().length === 0) {
      const src = IMG_SRC_DESENI.exec(es[0]);
      eksikler.push(src !== null ? (src[1] ?? src[2] ?? "(src'siz <img>)") : "(src'siz <img>)");
    }
  }

  if (eksikler.length > 0) {
    return {
      kural,
      gecti: false,
      mesaj:
        `${eksikler.length} görselde alt metni eksik veya boş: ${eksikler.join(", ")} — ` +
        "her görsele içeriğini tarif eden bir alt yazın (erişilebilirlik + SEO zorunluluğu).",
    };
  }
  return {
    kural,
    gecti: true,
    mesaj: toplam === 0 ? "Gövdede görsel yok." : `${toplam} görselin tümünde alt metni tanımlı.`,
  };
}

// ── Kural 6: tutorial/lab için repro.repoUrl zorunlu ─────────────────

function reproKurali(aday: Content): KontrolSonucu {
  const kural = "repro-zorunlu";
  if (aday.type !== "tutorial" && aday.type !== "lab") {
    return { kural, gecti: true, mesaj: `"${aday.type}" türü için repro deposu zorunlu değil.` };
  }
  const repoUrl = aday.repro?.repoUrl;
  if (repoUrl === undefined || repoUrl.trim().length === 0) {
    return {
      kural,
      gecti: false,
      mesaj:
        "Uygulama/laboratuvar içeriğinde çalışan kod zorunlu; repro.repoUrl alanına deponun " +
        "bağlantısını ekleyin (notebook varsa repro.notebookUrl'i de doldurun).",
    };
  }
  return { kural, gecti: true, mesaj: `Repro deposu tanımlı: ${repoUrl}` };
}

// ── Kural 7: tool/benchmark için lastVerifiedAt ≤ 90 gün ─────────────

const GUN_MS = 86_400_000;

function guncellikKurali(aday: Content, simdi: Date): KontrolSonucu {
  const kural = "veri-guncelligi";
  if (aday.type !== "tool" && aday.type !== "benchmark") {
    return {
      kural,
      gecti: true,
      mesaj: `"${aday.type}" türü için 90 günlük doğrulama şartı yok.`,
    };
  }
  const gun = Math.floor((simdi.getTime() - aday.lastVerifiedAt.getTime()) / GUN_MS);
  if (gun > 90) {
    return {
      kural,
      gecti: false,
      mesaj:
        `Son veri doğrulaması ${gun} gün önce yapılmış (sınır 90 gün); fiyat/metrik verilerini ` +
        "yeniden doğrulayıp lastVerifiedAt tarihini güncelleyin.",
    };
  }
  return {
    kural,
    gecti: true,
    mesaj: `Son veri doğrulaması ${Math.max(gun, 0)} gün önce — 90 gün sınırının içinde.`,
  };
}

// ── Kural 8: iç link ≥ 3, dış link ≥ 2 ──────────────────────────────

function linkSayisiKurali(aday: Content, kodsuz: string, baglam: DogrulamaBaglami): KontrolSonucu {
  const kural = "link-sayisi";
  const tumu = baglantilariAyikla(kodsuz);
  const ic = tumu.filter(icLinkMi).length;
  const dis = tumu.filter(disLinkMi).length;

  if (ic >= 3 && dis >= 2) {
    return {
      kural,
      gecti: true,
      mesaj: `Gövdede ${ic} iç, ${dis} dış link var (hedef: ≥ 3 iç, ≥ 2 dış).`,
    };
  }

  const eylemler: string[] = [];
  if (ic < 3) eylemler.push(`${3 - ic} iç link ekleyin`);
  if (dis < 2) eylemler.push(`${2 - dis} otoriter dış kaynağa link ekleyin`);

  const sonuc: KontrolSonucu = {
    kural,
    gecti: false,
    mesaj: `Gövdede ${ic} iç link (hedef ≥ 3) ve ${dis} dış link (hedef ≥ 2) var; ${eylemler.join(" ve ")}.`,
  };
  if (ic < 3) {
    const adaylar = baglam.yayindakiSluglar.filter((s) => s !== aday.slug).slice(0, 5);
    if (adaylar.length > 0) {
      sonuc.oneriler = adaylar;
      sonuc.mesaj += ` Aynı pillar'dan önerilen ${adaylar.length} içerik: ${adaylar.join(", ")}.`;
    }
  }
  return sonuc;
}

// ── Kural 9: slug normu ve benzersizliği ─────────────────────────────

function slugKurali(aday: Content, baglam: DogrulamaBaglami): KontrolSonucu {
  const kural = "slug";
  const norm = slugla(aday.slug);
  if (norm !== aday.slug) {
    return {
      kural,
      gecti: false,
      mesaj:
        `Slug "${aday.slug}" normalizasyon kuralına uymuyor; "${norm}" olarak güncelleyin ` +
        "(Türkçe karakterler ASCII'ye, küçük harf, stop-word'süz, maks 60 karakter). Yayındaki " +
        "bir içeriğin slug'ı değişiyorsa 301 redirect kaydı oluşturmayı unutmayın (BRIEF §2.2).",
    };
  }
  if (baglam.mevcutSluglar.includes(aday.slug)) {
    return {
      kural,
      gecti: false,
      mesaj:
        `"${aday.slug}" slug'ı başka bir içerikte zaten kullanılıyor; benzersiz bir slug seçin ` +
        `(ör. "${aday.slug}-2") ya da çakışan içeriği yeniden adlandırıp 301 redirect ekleyin.`,
    };
  }
  return { kural, gecti: true, mesaj: `Slug "${aday.slug}" norma uygun ve benzersiz.` };
}

// ── Kural 10: kırık link taraması ────────────────────────────────────

const URL_DESENI = /https?:\/\/[^\s)"'<>\]]+/g;

async function varsayilanLinkDenetleyici(url: string): Promise<boolean> {
  const denetim = new AbortController();
  const zamanlayici = setTimeout(() => denetim.abort(), 5_000);
  try {
    const yanit = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: denetim.signal,
    });
    return yanit.status >= 200 && yanit.status < 400;
  } catch {
    return false;
  } finally {
    clearTimeout(zamanlayici);
  }
}

async function kirikLinkKurali(kodsuz: string, baglam: DogrulamaBaglami): Promise<KontrolSonucu> {
  const kural = "kirik-link";
  const denetle = baglam.linkDenetleyici ?? varsayilanLinkDenetleyici;
  const urller = [
    ...new Set([...kodsuz.matchAll(URL_DESENI)].map((es) => es[0].replace(/[.,;:!?]+$/, ""))),
  ];

  if (urller.length === 0) {
    return { kural, gecti: true, mesaj: "Gövdede denetlenecek http(s) bağlantısı yok." };
  }

  const sonuclar = await Promise.all(
    urller.map(async (url) => ({ url, saglam: await denetle(url) })),
  );
  const kirikler = sonuclar.filter((s) => !s.saglam).map((s) => s.url);
  if (kirikler.length > 0) {
    return {
      kural,
      gecti: false,
      mesaj:
        `${kirikler.length} kırık link bulundu: ${kirikler.join(", ")} — bağlantıları çalışan ` +
        "adreslerle değiştirin ya da kaldırın.",
    };
  }
  return { kural, gecti: true, mesaj: `${urller.length} http(s) bağlantısının tümü erişilebilir.` };
}

// ── Ana giriş — 10 kontrolün tamamı, sabit sırada ────────────────────

export async function yayinKontrolleri(
  aday: Content,
  baglam: DogrulamaBaglami,
): Promise<KontrolSonucu[]> {
  const simdi = new Date();
  const kodsuz = kodsuzGovde(aday.body);
  return [
    kaynakAtiflariKurali(aday, kodsuz),
    kisaCevapKurali(aday),
    sssKurali(aday),
    icindekilerKurali(aday),
    gorselAltKurali(kodsuz),
    reproKurali(aday),
    guncellikKurali(aday, simdi),
    linkSayisiKurali(aday, kodsuz, baglam),
    slugKurali(aday, baglam),
    await kirikLinkKurali(kodsuz, baglam),
  ];
}
