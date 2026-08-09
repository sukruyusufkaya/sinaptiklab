import { createElement, type ComponentType, type ReactNode } from "react";

/**
 * Sinaptiklab ikon seti — özgün, stroke tabanlı, 24×24.
 *
 * Kurallar (BRIEF §5 + tasarım yönü):
 * - Renk yok: her şey `currentColor`. İkon bulunduğu yerin rengini alır,
 *   tema değişiminde ek iş yapmadan uyar.
 * - `strokeWidth={1.5}`, yuvarlak uç/birleşim, `fill="none"` — Stripe/Lucide
 *   yumuşaklığı; keskin köşe yok, geometri yuvarlatılmış.
 * - Hepsi dekoratif: `aria-hidden`. Anlam taşıyan yerde yanına metin koy
 *   (ör. `<span className="sr-only">`), ikonu asla tek başına etiket yapma.
 * - Boyut `className` ile verilir: `size-4`, `size-5`, `size-6`…
 *
 * Metafor sözlüğü marka DNA'sından türetildi: ölçüm, sinyal, kalibrasyon,
 * katman. Robot/beyin/insansı figür bilinçli olarak yok.
 */

export interface IkonOzellikleri {
  className?: string;
}

/** Ortak SVG kabuğu — 6 tekrar eden özniteliği tek yerde tutar. */
function IkonGovde({ className, children }: IkonOzellikleri & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   Gezinme ve eylem
   ══════════════════════════════════════════════════════════════════════ */

/** Arama — mercek. */
export function AraIkon({ className }: IkonOzellikleri) {
  return (
    <IkonGovde className={className}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </IkonGovde>
  );
}

/** Konu — üç düğümlü bağlantı grafiği (pillar/cluster ağacı). */
export function KonuIkon({ className }: IkonOzellikleri) {
  return (
    <IkonGovde className={className}>
      <circle cx="6" cy="7" r="2.2" />
      <circle cx="18" cy="7" r="2.2" />
      <circle cx="12" cy="18" r="2.2" />
      <path d="M8.2 7h7.6" />
      <path d="m7.1 8.9 3.9 7.2" />
      <path d="m16.9 8.9-3.9 7.2" />
    </IkonGovde>
  );
}

/** Sözlük — açık kitap, yumuşak sayfa kavisleri. */
export function SozlukIkon({ className }: IkonOzellikleri) {
  return (
    <IkonGovde className={className}>
      <path d="M12 7.4v11.2" />
      <path d="M12 7.4c-1.6-1.4-3.7-1.9-6-1.7a1.2 1.2 0 0 0-1.2 1.2v9.2a1.2 1.2 0 0 0 1.2 1.2c2.3-.2 4.4.4 6 1.3" />
      <path d="M12 7.4c1.6-1.4 3.7-1.9 6-1.7a1.2 1.2 0 0 1 1.2 1.2v9.2a1.2 1.2 0 0 1-1.2 1.2c-2.3-.2-4.4.4-6 1.3" />
    </IkonGovde>
  );
}

/** Bülten — zarf, yumuşak kapak kavisi. */
export function BultenIkon({ className }: IkonOzellikleri) {
  return (
    <IkonGovde className={className}>
      <rect x="3.5" y="5" width="17" height="14" rx="3.5" />
      <path d="m4.8 8.4 5.9 4.3a2.2 2.2 0 0 0 2.6 0l5.9-4.3" />
    </IkonGovde>
  );
}

/** Sağ ok — "devamını oku" ve akış yönü. */
export function OkSagIkon({ className }: IkonOzellikleri) {
  return (
    <IkonGovde className={className}>
      <path d="M4.5 12h14" />
      <path d="m13 6.5 5.5 5.5-5.5 5.5" />
    </IkonGovde>
  );
}

/** Dış bağlantı — siteden çıkan kaynak linkleri. */
export function DisBaglantiIkon({ className }: IkonOzellikleri) {
  return (
    <IkonGovde className={className}>
      <path d="M14 4.5h5.5V10" />
      <path d="m19.5 4.5-8 8" />
      <path d="M17.5 14v3.5A2.5 2.5 0 0 1 15 20H6.5A2.5 2.5 0 0 1 4 17.5V9a2.5 2.5 0 0 1 2.5-2.5H10" />
    </IkonGovde>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   İçerik türleri
   ══════════════════════════════════════════════════════════════════════ */

/** Makale — kıvrık köşeli belge, iki gövde satırı. */
export function MakaleIkon({ className }: IkonOzellikleri) {
  return (
    <IkonGovde className={className}>
      <path d="M13.8 3.5 19 8.7V18a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 18V6a2.5 2.5 0 0 1 2.5-2.5Z" />
      <path d="M13.7 3.7v3.5a1.5 1.5 0 0 0 1.5 1.5h3.5" />
      <path d="M8.5 13h7" />
      <path d="M8.5 16.5h4.5" />
    </IkonGovde>
  );
}

/** Rehber — ara duraklı rota; başlangıç işareti ve hedef. */
export function RehberIkon({ className }: IkonOzellikleri) {
  return (
    <IkonGovde className={className}>
      <circle cx="4.2" cy="19.5" r="1.7" />
      <path d="M6.6 19.5h2.9a3 3 0 0 0 3-3v-5.5a3 3 0 0 1 3-3h1" />
      <circle cx="19" cy="8" r="2.2" />
      <path d="M19 8h.01" />
    </IkonGovde>
  );
}

/** Uygulama — çalıştırılabilir terminal penceresi. */
export function UygulamaIkon({ className }: IkonOzellikleri) {
  return (
    <IkonGovde className={className}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="3.5" />
      <path d="m8 10.5 2.6 2.6L8 15.7" />
      <path d="M13.5 15.7h3.2" />
    </IkonGovde>
  );
}

/** Kaynak — zincir bağlantı; her iddianın kaynağı. */
export function KaynakIkon({ className }: IkonOzellikleri) {
  return (
    <IkonGovde className={className}>
      <path d="M10.3 13.7a3.7 3.7 0 0 0 5.5.4l2.4-2.4a3.7 3.7 0 0 0-5.2-5.2l-1.4 1.4" />
      <path d="M13.7 10.3a3.7 3.7 0 0 0-5.5-.4l-2.4 2.4a3.7 3.7 0 0 0 5.2 5.2l1.4-1.4" />
    </IkonGovde>
  );
}

/** Kod — açılı ayraçlar ve eğik ayraç. */
export function KodIkon({ className }: IkonOzellikleri) {
  return (
    <IkonGovde className={className}>
      <path d="m9.2 8.2-3.7 3.8 3.7 3.8" />
      <path d="m14.8 8.2 3.7 3.8-3.7 3.8" />
      <path d="m13.4 5.8-2.8 12.4" />
    </IkonGovde>
  );
}

/**
 * İçerik türü → ikon. Anahtarlar `lib/rotalar.ts` içindeki `IcerikTuru`
 * birliğiyle birebir; yeni tür eklenirse burada da karşılığı istenir.
 * (Record yerine gevşek imza: bu dosya şema katmanına bağımlı olmasın.)
 */
export const TUR_IKONLARI: Record<string, ComponentType<IkonOzellikleri>> = {
  article: MakaleIkon,
  guide: RehberIkon,
  tutorial: UygulamaIkon,
  lab: KodIkon,
  tool: MlopsIkon,
  benchmark: OlcumIkon,
  case: SektorIkon,
  compliance: RegulasyonIkon,
  issue: BultenIkon,
};

/** Tür ikonu; bilinmeyen türde genel makale ikonu. */
export function TurIkon({ tur, className = "size-4" }: IkonOzellikleri & { tur: string }) {
  // `createElement`: bkz. PillarIkon — arama modül düzeyindeki sabit
  // haritadan geliyor, JSX'te yerel değişkeni bileşen olarak kullanmak
  // react-hooks/static-components kuralını tetikliyor.
  return createElement(TUR_IKONLARI[tur] ?? MakaleIkon, { className });
}

/* ══════════════════════════════════════════════════════════════════════
   Pillar ikonları — 12 konu ailesi
   ══════════════════════════════════════════════════════════════════════ */

/** LLM & Üretken YZ — bağlam penceresi; son satır hâlâ üretiliyor. */
export function LlmIkon({ className }: IkonOzellikleri) {
  return (
    <IkonGovde className={className}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="4" />
      <path d="M7.5 9.4h9" />
      <path d="M7.5 12.6h5.5" />
      <path d="M7.7 16.2h.01" />
      <path d="M11 16.2h.01" />
      <path d="M14.3 16.2h.01" />
    </IkonGovde>
  );
}

/** RAG — parçalar (chunk) tek düğümde toplanır. */
export function RagIkon({ className }: IkonOzellikleri) {
  return (
    <IkonGovde className={className}>
      <rect x="3" y="4.2" width="5.6" height="4" rx="1.4" />
      <rect x="3" y="10" width="5.6" height="4" rx="1.4" />
      <rect x="3" y="15.8" width="5.6" height="4" rx="1.4" />
      <path d="M8.6 6.2c3.9 0 3.9 4.2 6.8 5" />
      <path d="M8.6 12h6.8" />
      <path d="M8.6 17.8c3.9 0 3.9-4.2 6.8-5" />
      <circle cx="18.4" cy="12" r="2.8" />
    </IkonGovde>
  );
}

/** Ajanik sistemler — çekirdek düğüm ve çevresindeki karar döngüsü. */
export function AjanIkon({ className }: IkonOzellikleri) {
  return (
    <IkonGovde className={className}>
      <path d="M5 12a7 7 0 0 1 12-4.8" />
      <path d="M17 4.2v3h-3" />
      <path d="M19 12a7 7 0 0 1-12 4.8" />
      <path d="M7 19.8v-3h3" />
      <circle cx="12" cy="12" r="2.3" />
    </IkonGovde>
  );
}

/** Ölçüm / LLMOps & Değerlendirme — kadran, ibre, kalibrasyon çentikleri. */
export function OlcumIkon({ className }: IkonOzellikleri) {
  return (
    <IkonGovde className={className}>
      <path d="M4.2 17.5a7.8 7.8 0 1 1 15.6 0" />
      <path d="m5.3 13.6 1.2.7" />
      <path d="M12 9.7v1.4" />
      <path d="m18.7 13.6-1.2.7" />
      <path d="M12 17.5 15 12.3" />
      <circle cx="12" cy="17.5" r="1.1" />
    </IkonGovde>
  );
}

/** Bilgisayarlı görü — tespit çerçevesi ve odak hedefi. */
export function GoruIkon({ className }: IkonOzellikleri) {
  return (
    <IkonGovde className={className}>
      <path d="M4 9V6.5A2.5 2.5 0 0 1 6.5 4H9" />
      <path d="M15 4h2.5A2.5 2.5 0 0 1 20 6.5V9" />
      <path d="M20 15v2.5a2.5 2.5 0 0 1-2.5 2.5H15" />
      <path d="M9 20H6.5A2.5 2.5 0 0 1 4 17.5V15" />
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 12h.01" />
    </IkonGovde>
  );
}

/** Makine öğrenmesi temelleri — öğrenme eğrisi ve eksenler. */
export function OgrenmeIkon({ className }: IkonOzellikleri) {
  return (
    <IkonGovde className={className}>
      <path d="M4.5 4.5v13.2a1.8 1.8 0 0 0 1.8 1.8h13.2" />
      <path d="M7.5 16.2c3.2 0 4-3.4 5.6-6.2s3.4-3.6 5.6-3.6" />
    </IkonGovde>
  );
}

/** Veri mühendisliği — katmanlı depo silindiri. */
export function VeriIkon({ className }: IkonOzellikleri) {
  return (
    <IkonGovde className={className}>
      <ellipse cx="12" cy="6.4" rx="6.8" ry="2.9" />
      <path d="M5.2 6.4v11.2c0 1.6 3 2.9 6.8 2.9s6.8-1.3 6.8-2.9V6.4" />
      <path d="M18.8 12c0 1.6-3 2.9-6.8 2.9S5.2 13.6 5.2 12" />
    </IkonGovde>
  );
}

/** MLOps & altyapı — raf katmanları arasında akan dağıtım hattı. */
export function MlopsIkon({ className }: IkonOzellikleri) {
  return (
    <IkonGovde className={className}>
      <rect x="3.8" y="4.2" width="16.4" height="5.6" rx="2.2" />
      <rect x="3.8" y="14.2" width="16.4" height="5.6" rx="2.2" />
      <path d="M7.2 7h.01" />
      <path d="M10.5 7h6" />
      <path d="M7.2 17h.01" />
      <path d="M10.5 17h6" />
      <path d="M12 10.5v3.1" />
      <path d="m10.6 12.2 1.4 1.4 1.4-1.4" />
    </IkonGovde>
  );
}

/** Güvenlik & kırmızı takım — kalkan ve doğrulama işareti. */
export function GuvenlikIkon({ className }: IkonOzellikleri) {
  return (
    <IkonGovde className={className}>
      <path d="M12 3.2 5.6 5.9v6.1c0 3.9 2.5 6.8 5.7 8.6a1.4 1.4 0 0 0 1.4 0c3.2-1.8 5.7-4.7 5.7-8.6V5.9Z" />
      <path d="m9.5 12 1.8 1.8 3.4-3.8" />
    </IkonGovde>
  );
}

/** Regülasyon & yönetişim — terazi. */
export function RegulasyonIkon({ className }: IkonOzellikleri) {
  return (
    <IkonGovde className={className}>
      <circle cx="12" cy="5" r="1.3" />
      <path d="M12 6.9v12.6" />
      <path d="M8 19.5h8" />
      <path d="M5 8.2h14" />
      <path d="M2.6 12.6 5 8.2l2.4 4.4a2.4 2.4 0 0 1-4.8 0" />
      <path d="M16.6 12.6 19 8.2l2.4 4.4a2.4 2.4 0 0 1-4.8 0" />
    </IkonGovde>
  );
}

/** Sektör uygulamaları — farklı yükseklikte yumuşak bloklar, pencereli. */
export function SektorIkon({ className }: IkonOzellikleri) {
  return (
    <IkonGovde className={className}>
      <path d="M3.5 19.5V9.4a1.6 1.6 0 0 1 1.6-1.6h4.3A1.6 1.6 0 0 1 11 9.4v10.1" />
      <path d="M11 19.5v-6.2a1.6 1.6 0 0 1 1.6-1.6h6.3a1.6 1.6 0 0 1 1.6 1.6v6.2" />
      <path d="M2.5 19.5h19" />
      <path d="M6 11.4h2.5" />
      <path d="M6 15h2.5" />
      <path d="M14 15.4h2.5" />
    </IkonGovde>
  );
}

/** Kariyer & öğrenme — evrak çantası. */
export function KariyerIkon({ className }: IkonOzellikleri) {
  return (
    <IkonGovde className={className}>
      <rect x="3.5" y="7.2" width="17" height="12.3" rx="3" />
      <path d="M9 7.2V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.2" />
      <path d="M3.5 12.4h17" />
    </IkonGovde>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   Pillar slug → ikon haritası
   Slug'lar docs/arastirma/pillar-cluster-agaci.md ile birebir doğrulandı.
   ══════════════════════════════════════════════════════════════════════ */

export const PILLAR_IKONLARI: Record<string, ComponentType<IkonOzellikleri>> = {
  "llm-uretken-yz": LlmIkon,
  "rag-bilgi-erisimi": RagIkon,
  "ajanik-sistemler": AjanIkon,
  "llmops-degerlendirme": OlcumIkon,
  "bilgisayarli-goru": GoruIkon,
  "makine-ogrenmesi-temelleri": OgrenmeIkon,
  "veri-muhendisligi": VeriIkon,
  "mlops-altyapi": MlopsIkon,
  "guvenlik-kirmizi-takim": GuvenlikIkon,
  "regulasyon-yonetisim": RegulasyonIkon,
  "sektor-uygulamalari": SektorIkon,
  "kariyer-ogrenme": KariyerIkon,
};

/**
 * Slug'a karşılık gelen pillar ikonu; bilinmeyen slug'da genel konu ikonu.
 * `noUncheckedIndexedAccess` altında çağrı yerinde `undefined` kontrolü
 * gerekmesin diye tercih edilir.
 */
export function pillarIkonu(slug: string): ComponentType<IkonOzellikleri> {
  return PILLAR_IKONLARI[slug] ?? KonuIkon;
}

/**
 * Slug'ı doğrudan JSX'te kullanmak için ince sarmalayıcı — çağrı yerinde
 * `const Ikon = pillarIkonu(...)` ara değişkeni gerekmesin diye.
 */
export function PillarIkon({
  pillar,
  className = "size-[22px]",
}: IkonOzellikleri & { pillar: string }) {
  // `createElement`: arama modül düzeyindeki sabit haritadan geliyor, yani
  // referans kararlı. JSX'te yerel değişkeni bileşen olarak kullanmak
  // react-hooks/static-components kuralını (haklı olarak) tetiklediğinden
  // aynı şeyi kuralı susturmadan ifade ediyoruz.
  return createElement(pillarIkonu(pillar), { className });
}
