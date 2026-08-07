// Tür → rota eşlemesi (BRIEF §2.2 URL şeması — kalıcı, değiştirilemez).
// Kart, breadcrumb ve rota dosyaları bu tek kaynaktan okur. Şimdilik yalnız
// makale/rehber/uygulama rotaları açık; diğer yollar sonraki fazlarda açılır
// (türe uygun içerik seed'leneceği için pratikte kırık link üretmez).
import type { Content } from "@/lib/db/schemas";

export type IcerikTuru = Content["type"];

const ROTA_ONEKI: Record<IcerikTuru, string> = {
  article: "/makale",
  guide: "/rehber",
  tutorial: "/uygulama",
  lab: "/laboratuvar",
  tool: "/arac",
  benchmark: "/olcum",
  case: "/vaka",
  compliance: "/uyum",
  issue: "/bulten",
};

/** İçerik türü + slug → mutlak yol (örn. article → "/makale/<slug>"). */
export function icerikYolu(type: IcerikTuru, slug: string): string {
  return `${ROTA_ONEKI[type]}/${slug}`;
}

// Türlerin okunur Türkçe etiketleri — rozet ve breadcrumb aynı sözlüğü
// kullanır ki aynı tür sitenin her yerinde aynı adla anılsın (BRIEF §8.3/6).
const TUR_ETIKETI: Record<IcerikTuru, string> = {
  article: "Makale",
  guide: "Rehber",
  tutorial: "Uygulama",
  lab: "Laboratuvar",
  tool: "Araç",
  benchmark: "Ölçüm",
  case: "Vaka",
  compliance: "Uyum",
  issue: "Bülten",
};

/** Türün Türkçe okunur etiketi (rozette büyük harfe tr-TR ile çevrilir). */
export function turEtiketi(type: IcerikTuru): string {
  return TUR_ETIKETI[type];
}

const SEVIYE_ETIKETI: Record<Content["level"], string> = {
  giris: "Giriş",
  orta: "Orta",
  ileri: "İleri",
  uzman: "Uzman",
};

/** Seviyenin Türkçe okunur etiketi. */
export function seviyeEtiketi(level: Content["level"]): string {
  return SEVIYE_ETIKETI[level];
}
