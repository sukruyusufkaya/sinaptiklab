// Tür indeks rotalarının (/makale, /rehber, /uygulama) tek doğruluk kaynağı:
// hangi türlerin arşiv sayfası VAR, o sayfanın yolu, sayfalı adresi, ekran
// metni ve <head> üst verisi. Rota önekleri lib/rotalar'dan türetilir — URL
// şeması değişirse (BRIEF §2.2) burası kendiliğinden takip eder.
//
// Ayrı dosya olmasının nedeni üç tüketicisi olması: tür indeks sayfaları,
// TurArsivi görünümü ve içerik sayfalarının breadcrumb'ı.
import type { Metadata } from "next";
import { env } from "@/lib/env";
import { icerikYolu, type IcerikTuru } from "@/lib/rotalar";

/** Arşiv (indeks) sayfası olan içerik türleri. Yeni tür yayına çıkınca eklenir. */
export const ARSIVLI_TURLER = ["article", "guide", "tutorial"] as const;

export type ArsivliTur = (typeof ARSIVLI_TURLER)[number];

export function arsivliTurMu(tur: IcerikTuru): tur is ArsivliTur {
  return (ARSIVLI_TURLER as readonly IcerikTuru[]).includes(tur);
}

/** Türün indeks yolu ("/makale"); indeksi olmayan türde null. */
export function turIndeksYolu(tur: IcerikTuru): string | null {
  if (!arsivliTurMu(tur)) return null;
  // icerikYolu(tur, "") → "/makale/" ; sondaki bölü düşürülür
  return icerikYolu(tur, "").replace(/\/$/, "");
}

/** Sayfalı arşiv adresi; 1. sayfa parametresiz kalır (kanonik sadelik). */
export function turArsivSayfaYolu(tur: ArsivliTur, sayfa: number): string {
  const yol = turIndeksYolu(tur) ?? "/";
  return sayfa > 1 ? `${yol}?sayfa=${sayfa}` : yol;
}

export interface TurArsivMetni {
  /** H1 ve breadcrumb'da görünen ad. */
  baslik: string;
  /** Bölüm indeksi damgası (§ makale). */
  indeks: string;
  /** Başlık altındaki tanım paragrafı. */
  giris: string;
  /** <meta description> — 155 karakter sınırı (BRIEF §7.1). */
  aciklama: string;
  /** Hiç yayın yokken basılan dürüst mesaj. */
  bosMesaj: string;
}

export const TUR_ARSIV_METNI: Record<ArsivliTur, TurArsivMetni> = {
  article: {
    baslik: "Makaleler",
    indeks: "§ makale",
    giris:
      "Derinlemesine teknik analiz: bir kararın, mimarinin ya da ölçümün neden öyle olduğunu sonuna kadar götüren yazılar. Her iddia kaynağına bağlı, her sayı doğrulanmış, her metin sürümlü.",
    aciklama:
      "Derinlemesine Türkçe teknik yapay zeka analizleri: her iddia kaynaklı, her sayı doğrulanmış, her metin sürümlü ve son doğrulama tarihiyle yayında.",
    bosMesaj:
      "Henüz yayında makale yok. Editoryal hat kaynak doğrulamasından geçmeden yayın açmadığı için bu liste yavaş dolar.",
  },
  guide: {
    baslik: "Rehberler",
    indeks: "§ rehber",
    giris:
      "Bir konuyu baştan sona kuran uzun form metinler. Rehber, altındaki makale ve uygulamaların bağlandığı ana gövdedir: kavram, karar çerçevesi ve tuzaklar tek yerde.",
    aciklama:
      "Uçtan uca Türkçe yapay zeka rehberleri: kavramdan karar çerçevesine, saha tuzaklarıyla. Kaynaklı, sürümlü ve düzenli güncellenen uzun form metinler.",
    bosMesaj:
      "Henüz yayında rehber yok. Rehberler uzun form olduğu için editoryal hattın en yavaş ilerleyen kısmıdır.",
  },
  tutorial: {
    baslik: "Uygulamalar",
    indeks: "§ uygulama",
    giris:
      "Adım adım, kopyala-çalıştır. Bir uygulama ancak çalışan kod, model sürümü, donanım ve yaklaşık maliyet bilgisiyle yayına çıkabilir — okuduğunuzu kendi makinenizde yeniden üretebilmeniz esastır.",
    aciklama:
      "Adım adım Türkçe yapay zeka uygulamaları: çalışan repo, model sürümü, donanım ve maliyet bilgisiyle. Okuduğunuzu kendi makinenizde yeniden üretin.",
    bosMesaj:
      "Henüz yayında uygulama yok. Uygulamalar çalışan repo ve yeniden üretim bilgisi olmadan yayına çıkamadığı için bu tür kasıtlı olarak yavaş dolar.",
  },
};

/**
 * Tür indeksinin <head> üst verisi. Sayfa 2+ için başlığa "· Sayfa N" eklenir
 * ve canonical KENDİNE bakar (BRIEF §7.1: sayfalamada benzersiz title +
 * kendi kanoniği; birinci sayfaya işaret eden rel=canonical kullanılmaz).
 */
export function turArsiviUstVerisi(tur: ArsivliTur, sayfa: number): Metadata {
  const metin = TUR_ARSIV_METNI[tur];
  const baslik = sayfa > 1 ? `${metin.baslik} · Sayfa ${sayfa}` : metin.baslik;
  const mutlakUrl = `${env.NEXT_PUBLIC_SITE_URL}${turArsivSayfaYolu(tur, sayfa)}`;
  return {
    title: baslik,
    description: metin.aciklama,
    alternates: { canonical: mutlakUrl },
    openGraph: {
      type: "website",
      title: baslik,
      description: metin.aciklama,
      url: mutlakUrl,
    },
  };
}
