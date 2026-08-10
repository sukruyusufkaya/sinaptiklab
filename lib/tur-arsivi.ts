// Tür indeks rotalarının tek doğruluk kaynağı:
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
export const ARSIVLI_TURLER = [
  "article",
  "guide",
  "tutorial",
  "lab",
  "tool",
  "benchmark",
  "case",
  "compliance",
] as const;

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
  lab: {
    baslik: "Laboratuvarlar",
    indeks: "§ laboratuvar",
    giris:
      "Kontrollü koşulda kurulmuş deney kayıtları. Bir laboratuvar hipotezini, kurulumunu, ölçüm yöntemini ve ham sonucunu birlikte yayınlar — sonuç beklentiyi doğrulamadığında da.",
    aciklama:
      "Türkçe yapay zeka deney kayıtları: hipotez, kurulum, ölçüm yöntemi ve ham sonuç bir arada. Olumsuz sonuçlar da yayınlanır.",
    bosMesaj:
      "Henüz yayında laboratuvar kaydı yok. Bir deney ancak kurulumu ve ham verisi yeniden üretilebilir biçimde yazıldığında yayına çıkar.",
  },
  tool: {
    baslik: "Araç ve model kartları",
    indeks: "§ araç",
    giris:
      "Bir modeli ya da aracı üretimde kullanmadan önce bilmeniz gerekenler: sürüm, lisans, bağlam sınırları, maliyet, bilinen zayıflıklar. Pazarlama metni değil, karar kartı.",
    aciklama:
      "Yapay zeka model ve araç kartları: sürüm, lisans, bağlam sınırı, maliyet ve bilinen zayıflıklar. Pazarlama değil, üretim kararı için kart.",
    bosMesaj:
      "Henüz yayında araç kartı yok. Kart, üreticinin iddiası değil kendi ölçümümüz ve doğrulanmış kaynaklarla dolduğunda açılır.",
  },
  benchmark: {
    baslik: "Ölçümler",
    indeks: "§ ölçüm",
    giris:
      "Karşılaştırmalı ölçüm sonuçları. Her ölçüm donanımını, sürümlerini, veri kümesini ve yöntemini açıklar; başkası aynı kurulumu kurup aynı sayıya varabilmelidir.",
    aciklama:
      "Türkçe yapay zeka ölçüm ve kıyaslama sonuçları: donanım, sürüm, veri kümesi ve yöntem açık; her sayı yeniden üretilebilir.",
    bosMesaj:
      "Henüz yayında ölçüm yok. Bir kıyaslama, yöntemi ve donanımı eksiksiz yazılmadan sayı yayınlamaz.",
  },
  case: {
    baslik: "Vaka çalışmaları",
    indeks: "§ vaka",
    giris:
      "Sahada gerçekten kurulmuş sistemlerin hikâyesi: problem, seçilen mimari, karşılaşılan duvar ve ölçülen sonuç. Başarı anlatısı değil, karar günlüğü.",
    aciklama:
      "Türkçe yapay zeka vaka çalışmaları: gerçek kurulumlar, seçilen mimariler, karşılaşılan duvarlar ve ölçülen sonuçlar.",
    bosMesaj:
      "Henüz yayında vaka çalışması yok. Vakalar veri paylaşım izni ve doğrulanabilir ölçüm gerektirdiği için en yavaş dolan türdür.",
  },
  compliance: {
    baslik: "Uyum dosyaları",
    indeks: "§ uyum",
    giris:
      "KVKK, sektör düzenlemeleri ve veri yerleşimi gibi konuların yapay zeka sistemlerine pratik yansıması. Hukuki görüş değil; mühendisin karar verirken bakacağı çerçeve.",
    aciklama:
      "Yapay zeka sistemleri için Türkçe uyum dosyaları: KVKK, veri yerleşimi ve sektör düzenlemelerinin mühendislik karşılığı.",
    bosMesaj:
      "Henüz yayında uyum dosyası yok. Bu tür, birincil mevzuat kaynağına bağlanmadan yayına çıkamaz.",
  },
};

/**
 * Tür indeksinin <head> üst verisi. Sayfa 2+ için başlığa "· Sayfa N" eklenir
 * ve canonical KENDİNE bakar (BRIEF §7.1: sayfalamada benzersiz title +
 * kendi kanoniği; birinci sayfaya işaret eden rel=canonical kullanılmaz).
 */
export function turArsiviUstVerisi(
  tur: ArsivliTur,
  sayfa: number,
  secenekler: { bos?: boolean } = {},
): Metadata {
  const metin = TUR_ARSIV_METNI[tur];
  const baslik = sayfa > 1 ? `${metin.baslik} · Sayfa ${sayfa}` : metin.baslik;
  const mutlakUrl = `${env.NEXT_PUBLIC_SITE_URL}${turArsivSayfaYolu(tur, sayfa)}`;
  return {
    title: baslik,
    description: metin.aciklama,
    alternates: { canonical: mutlakUrl },
    // Hiç içeriği olmayan arşiv ince sayfadır: dizine girmez ama taranır
    // (follow) — yayın açıldığı anda kendiliğinden indekslenebilir hâle gelir.
    ...(secenekler.bos === true ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: "website",
      title: baslik,
      description: metin.aciklama,
      url: mutlakUrl,
    },
  };
}
