import { ImageResponse } from 'next/og';
import { SITE } from '@/lib/site';
import { MARKA } from '@/lib/seo/marka';

/**
 * Paylaşım kartı (Open Graph görseli) üreticisi.
 *
 * Her içerik türü kendi `opengraph-image.tsx` dosyasında yalnızca VERİYİ
 * toplar ve buraya verir; düzen tek yerde durur. Aksi hâlde on farklı rota on
 * farklı kart tasarımı üretirdi.
 *
 * ÜÇ TEKNİK KISIT — bilinmezse kart sessizce bozulur:
 *
 * 1. **Yalnızca flexbox.** `ImageResponse` Satori ile çizim yapar; CSS grid,
 *    `position: absolute` dışındaki konumlandırma hileleri ve kısaltma
 *    (`text-overflow: ellipsis`) desteklenmez. Uzun metin KODDA kırpılır.
 * 2. **Token kullanılamaz.** CSS değişkenleri tarayıcıda çözülür, burada
 *    çözülmez; renkler `lib/seo/marka.ts` içindeki sabitlerden gelir.
 * 3. **Yazı tipi elle verilir.** Varsayılan yüz Geist'tir. Marka yüzü
 *    (Bricolage Grotesque) ağdan çekilmeye ÇALIŞILIR; çekilemezse varsayılana
 *    düşülür — bir font isteği yüzünden derlemenin düşmesi kabul edilemez.
 */

export const OG_BOYUTU = { width: 1200, height: 630 } as const;
export const OG_TURU = 'image/png';

/** Kartın taşıyabileceği en uzun başlık; fazlası kırpılır. */
const BASLIK_SINIRI = 110;
const ALT_METIN_SINIRI = 180;

function kirp(metin: string, sinir: number): string {
  const kirpik = metin.trim();
  return kirpik.length <= sinir ? kirpik : `${kirpik.slice(0, sinir - 1).trimEnd()}…`;
}

/**
 * Marka yazı tipini getirir; başarısız olursa `undefined`.
 *
 * Sonuç modül kapsamında önbelleğe alınır: aynı derlemede yüzlerce kart
 * üretilirken font bir kez indirilir.
 *
 * NEDEN TTF URL'İ GÖMÜLMÜYOR
 *
 * Önceden `…/bricolagegrotesque/v7/pxiGZp4vf_…ttf` adresi doğrudan yazılıydı.
 * `fonts.gstatic.com` yolları AİLE SÜRÜMÜ taşır (`/v7/`, `/v9/`…) ve Google
 * aileyi güncellediğinde eski yol 404 olur: derleme her kartta
 * "marka yazı tipi alınamadı" uyarısı basıp varsayılan yüze düşüyordu, yani
 * kartlar sessizce markasızdı. Adres bu yüzden CSS API'sinden ÇÖZÜLÜR; sürüm
 * yükseldiğinde kendini onarır.
 *
 * ESKİ TARAYICI UA'SI ZORUNLU: `fonts.googleapis.com/css2` modern bir
 * User-Agent'a woff2 döndürür, Satori ise woff2 okuyamaz (TTF/OTF/WOFF).
 * Eski bir UA ile aynı uç nokta `format('truetype')` verir.
 */
const YAZI_CSS_ADRESI =
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600&display=swap';

let yaziOnbellegi: ArrayBuffer | null | undefined;

async function markaYazisi(): Promise<ArrayBuffer | undefined> {
  if (yaziOnbellegi !== undefined) return yaziOnbellegi ?? undefined;

  try {
    const cssYaniti = await fetch(YAZI_CSS_ADRESI, {
      cache: 'force-cache',
      // Satori'nin okuyabildiği biçimi almak için kasıtlı eski UA.
      headers: { 'User-Agent': 'Mozilla/4.0' },
    });
    if (!cssYaniti.ok) throw new Error(`css durumu ${cssYaniti.status}`);

    const css = await cssYaniti.text();
    const adres = css.match(/src:\s*url\((https:\/\/[^)]+\.ttf)\)/)?.[1];
    if (!adres) throw new Error('CSS yanıtında ttf adresi bulunamadı');

    const yanit = await fetch(adres, { cache: 'force-cache' });
    if (!yanit.ok) throw new Error(`font durumu ${yanit.status}`);
    yaziOnbellegi = await yanit.arrayBuffer();
  } catch (hata) {
    console.warn('[og] marka yazı tipi alınamadı, varsayılan kullanılıyor:', hata);
    yaziOnbellegi = null;
  }

  return yaziOnbellegi ?? undefined;
}

export type OgKartVerisi = {
  /**
   * Üstteki küçük etiket: içerik türü.
   *
   * GÖRÜNDÜĞÜ GİBİ YAZILIR — burada büyük harfe çevrilmez. CLAUDE.md değişmez
   * kural 1'in nedeni aynen geçerli: `'bilgi'.toUpperCase()` İngilizce yerelde
   * "BILGI" üretir, Türkçesi "BİLGİ"dir. Kartta noktasız "I" görülmesinin
   * sebebi buydu. Büyük harf isteniyorsa çağıran metni büyük yazar.
   */
  etiket: string;
  baslik: string;
  /** Başlığın altındaki tek cümle — kısa cevap ya da özet. */
  altMetin?: string;
  /** Sağ altta gösterilecek en fazla üç künye satırı (tarih, yazar, seviye). */
  kunye?: readonly string[];
};

export async function ogKarti(veri: OgKartVerisi): Promise<ImageResponse> {
  const yazi = await markaYazisi();

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: MARKA.zemin,
        padding: '64px 72px',
        // Sol üstten inen mor ışıma: markanın imzası.
        backgroundImage: `radial-gradient(1000px 520px at 8% -10%, ${MARKA.vurguZemin} 0%, ${MARKA.zemin} 62%)`,
        fontFamily: yazi ? 'Marka' : 'sans-serif',
      }}
    >
      {/* Üst şerit: işaret + tür etiketi */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        {/*
            İşaret Satori'nin anladığı ölçüde SVG olarak çizilir: `rect`,
            `path` ve `circle` destekleniyor. Geometri
            `components/duzen/Logo.tsx` içindeki `SinaptikIsareti` ile AYNI
            tutulmalı — ikisi ayrı düşerse marka iki farklı yerde iki farklı
            görünür.
          */}
        <svg width={52} height={52} viewBox="0 0 32 32">
          <rect
            x="0.75"
            y="0.75"
            width="30.5"
            height="30.5"
            rx="9"
            fill={MARKA.vurguZemin}
            stroke={MARKA.vurgu}
            strokeOpacity="0.45"
            strokeWidth="1.5"
          />
          <path
            d="M9.5 21.5 15 16l-2.5-2.8L22 9.5"
            fill="none"
            stroke={MARKA.vurguParlak}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="9.5" cy="21.5" r="2.6" fill={MARKA.ikincil} />
          <circle cx="22" cy="9.5" r="2.6" fill={MARKA.vurguParlak} />
          <circle cx="15" cy="16" r="1.6" fill={MARKA.sinyal} />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 25, color: MARKA.metin, letterSpacing: -0.4 }}>{SITE.ad}</span>
          <span style={{ fontSize: 15, color: MARKA.vurguParlak, letterSpacing: 3 }}>
            {veri.etiket}
          </span>
        </div>
      </div>

      {/* Başlık ve alt metin */}
      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 1000 }}>
        <span
          style={{
            fontSize: veri.baslik.length > 62 ? 54 : 66,
            lineHeight: 1.08,
            color: MARKA.metin,
            letterSpacing: -1.6,
          }}
        >
          {kirp(veri.baslik, BASLIK_SINIRI)}
        </span>
        {veri.altMetin && (
          <span
            style={{
              marginTop: 22,
              fontSize: 26,
              lineHeight: 1.42,
              color: MARKA.metinIkincil,
            }}
          >
            {kirp(veri.altMetin, ALT_METIN_SINIRI)}
          </span>
        )}
      </div>

      {/* Alt şerit: alan adı + künye */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          borderTop: `1px solid ${MARKA.kenar}`,
          paddingTop: 24,
        }}
      >
        <span style={{ fontSize: 21, color: MARKA.metinIkincil, letterSpacing: 0.4 }}>
          {SITE.alanAdi}
        </span>
        {veri.kunye && veri.kunye.length > 0 && (
          <div style={{ display: 'flex', gap: 22 }}>
            {veri.kunye.slice(0, 3).map((satir) => (
              <span key={satir} style={{ fontSize: 19, color: MARKA.metinIkincil }}>
                {satir}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>,
    {
      ...OG_BOYUTU,
      ...(yazi ? { fonts: [{ name: 'Marka', data: yazi, style: 'normal' as const }] } : {}),
    },
  );
}
