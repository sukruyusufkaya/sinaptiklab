import type { Metadata } from 'next';
import type { SeoAlanlari } from '@/lib/tipler';

/**
 * Editörün yazdığı SEO alanlarını sayfanın hesapladığı varsayılanlarla birleştirir.
 *
 * NEDEN VAR: 24 koleksiyonun şemasında ve panel formunda `seo` alanı vardı ama
 * onu OKUYAN tek yer `lib/icerik/politikalar.ts` idi. Editör SEO başlığı
 * yazıyor, arama sonucunda hiç görünmüyordu. Bu, "panel yazıyor, hiçbir şey
 * okumuyor" hatasının SEO alanlarındaki hâliydi.
 *
 * Eşlemenin sayfa başına elle yazılması yerine tek yardımcıda toplanmasının
 * nedeni: her sayfa kendi `generateMetadata`'sında `seo.baslik ?? ...` yazarsa
 * bir sonraki sayfa bunu unutur ve boşluk sessizce geri döner.
 *
 * ÖNCELİK SIRASI
 *   1. Editörün yazdığı değer (doluysa)
 *   2. Sayfanın hesapladığı varsayılan
 * Boş dizeler yok sayılır: panelde alan açılıp boş bırakıldığında varsayılan
 * kullanılır, başlık boş kalmaz.
 *
 * `dizinlenmesin` YALNIZCA TEK YÖNLÜ çalışır: editör bir sayfayı dizinden
 * çıkarabilir, ama `dizinlenmesin: false` yazarak sayfanın kendi getirdiği
 * `noindex` kararını EZEMEZ. Böylece yasal/teknik olarak dizinlenmemesi gereken
 * bir sayfa (panel, önizleme, filtre kombinasyonu) panelden yanlışlıkla
 * indekslenebilir hâle gelmez.
 */

export type { SeoAlanlari };

/** Belgesinde `seo` taşıyabilen her kayıt. */
export type SeoTasiyan = { seo?: SeoAlanlari };

function dolu(deger?: string): string | undefined {
  if (typeof deger !== 'string') return undefined;
  const kirpik = deger.trim();
  return kirpik.length > 0 ? kirpik : undefined;
}

export type UstveriVarsayilani = {
  baslik: string;
  aciklama?: string;
  /** Sayfanın kanonik yolu — `/atlas/ai-agent/` gibi göreli. */
  kanonik?: string;
  /** Sayfanın kendi kararı; editör bunu `false` ile ezemez. */
  dizinlenmesin?: boolean;
  /** `openGraph` için ek alanlar (tür, yayın tarihi, yazar…). */
  openGraph?: Metadata['openGraph'];
};

/**
 * Editör SEO alanlarını varsayılanların üzerine uygular ve Next `Metadata`
 * nesnesi üretir.
 *
 * `openGraph` başlığı ve açıklaması da editörün değerini alır: paylaşım
 * kartının sayfa başlığından farklı olması şaşırtıcı olurdu.
 */
export function ustveriBirlestir(
  seo: SeoAlanlari | undefined,
  varsayilan: UstveriVarsayilani,
): Metadata {
  const baslik = dolu(seo?.baslik) ?? varsayilan.baslik;
  const aciklama = dolu(seo?.aciklama) ?? varsayilan.aciklama;
  const kanonik = dolu(seo?.kanonik) ?? varsayilan.kanonik;

  // Tek yönlü: sayfanın kendi noindex kararı panelden geri alınamaz.
  const dizinlenmesin = varsayilan.dizinlenmesin === true || seo?.dizinlenmesin === true;

  const ustveri: Metadata = {
    title: baslik,
    description: aciklama,
  };

  if (kanonik) ustveri.alternates = { canonical: kanonik };
  if (dizinlenmesin) ustveri.robots = { index: false, follow: true };

  const ogGorsel = dolu(seo?.ogGorsel);
  if (varsayilan.openGraph || ogGorsel) {
    ustveri.openGraph = {
      ...varsayilan.openGraph,
      title: baslik,
      ...(aciklama ? { description: aciklama } : {}),
      ...(ogGorsel ? { images: [{ url: ogGorsel }] } : {}),
    };
  }

  return ustveri;
}
