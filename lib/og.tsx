// Dinamik OG görsellerinin tek tasarım kaynağı (BRIEF §7.1) — kök görsel
// (app/opengraph-image.tsx) ve içerik görselleri (makale/rehber/uygulama)
// buradan üretilir ki dört route aynı dili konuşsun.
//
// token kopyaları: --murekkep #12161B, --sinyal #1B3BFF, --kagit #F1F2ED
// (globals.css'ten; değişirse güncelle). ImageResponse/satori CSS değişkeni
// desteklemez — hex kullanımı BURADA serbesttir. Font yüklenmez (satori'de
// next/font yok); varsayılan sans yeterli, tipografi cilası sonraki faz.
import { ImageResponse } from "next/og";
import { yayindakiIcerik } from "@/lib/db/queries/contents";
import { turEtiketi, type IcerikTuru } from "@/lib/rotalar";

export const OG_BOYUT = { width: 1200, height: 630 };
export const OG_ICERIK_TIPI = "image/png";

const MUREKKEP = "#12161B"; // koyu grafit zemin (--murekkep)
const KAGIT = "#F1F2ED"; // zemin üstü metin (--kagit)
const SINYAL = "#1B3BFF"; // sinyal mavisi kare + vurgu (--sinyal)
// Koyu zemin yardımcı tonları (tasarım türevi; --murekkep-2'nin koyu tema
// değeriyle hizalı, token değildir):
const GRI = "#9BA3AB";
const CETVEL = "#39424D";

/** Alt kenardaki ölçüm cetveli motifi — her 5. çizgi uzun ve sinyal renkli. */
function CetvelMotifi() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        display: "flex",
        alignItems: "flex-end",
        padding: "0 24px",
      }}
    >
      {Array.from({ length: 47 }, (_, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            width: 2,
            height: i % 5 === 0 ? 30 : 14,
            backgroundColor: i % 5 === 0 ? SINYAL : CETVEL,
            marginLeft: i === 0 ? 0 : 23,
          }}
        />
      ))}
    </div>
  );
}

/** Kök tasarım: marka + slogan. İçerik bulunamayan OG'ler de buna düşer. */
export function kokOgGorseli(): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        backgroundColor: MUREKKEP,
        color: KAGIT,
        padding: "0 96px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div style={{ display: "flex", width: 44, height: 44, backgroundColor: SINYAL }} />
        <div style={{ display: "flex", fontSize: 76, fontWeight: 700, letterSpacing: 10 }}>
          SINAPTIKLAB
        </div>
      </div>
      <div style={{ display: "flex", marginTop: 28, fontSize: 34, color: GRI }}>
        Saha verisi, uydurma yok.
      </div>
      <CetvelMotifi />
    </div>,
    OG_BOYUT,
  );
}

/**
 * İçerik OG görseli: üstte tür etiketi + pillar (mono görünümlü), ortada
 * başlık (maks ~3 satır — JS ile kısaltılır, satori lineClamp'ine
 * güvenilmez), altta site adı + sinyal kare. DB hatası veya içerik
 * bulunamazsa kök tasarım döner (500 yerine her zaman geçerli PNG).
 */
export async function icerikOgGorseli(tur: IcerikTuru, slug: string): Promise<ImageResponse> {
  let baslik: string | null = null;
  let pillar = "";
  try {
    const icerik = await yayindakiIcerik(slug);
    if (icerik !== null && icerik.type === tur) {
      baslik = icerik.title;
      pillar = icerik.pillar;
    }
  } catch {
    // DB yok/erişilemez — kök tasarıma düş
  }
  if (baslik === null) return kokOgGorseli();

  const kisaltilmis = baslik.length > 110 ? `${baslik.slice(0, 109).trimEnd()}…` : baslik;
  const fontSize = kisaltilmis.length > 75 ? 48 : 64;

  return new ImageResponse(
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: MUREKKEP,
        color: KAGIT,
        padding: "64px 96px 88px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          fontSize: 26,
          letterSpacing: 6,
          textTransform: "uppercase",
        }}
      >
        <div style={{ display: "flex", color: SINYAL }}>{turEtiketi(tur)}</div>
        <div style={{ display: "flex", color: CETVEL }}>/</div>
        <div style={{ display: "flex", color: GRI }}>{pillar}</div>
      </div>
      <div
        style={{
          display: "flex",
          maxWidth: 1000,
          fontSize,
          fontWeight: 700,
          lineHeight: 1.18,
        }}
      >
        {kisaltilmis}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", width: 26, height: 26, backgroundColor: SINYAL }} />
        <div style={{ display: "flex", fontSize: 28, color: GRI }}>sinaptiklab.com</div>
      </div>
      <CetvelMotifi />
    </div>,
    OG_BOYUT,
  );
}
