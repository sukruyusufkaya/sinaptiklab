// /llms.txt — llmstxt.org spesifikasyonu (BRIEF §8.1): H1 + tek cümlelik
// blockquote özet + açıklama, ardından Konular (pillar hub'ları), Sözlük
// (kanonik Türkçe terminoloji), Arşivler (tür indeksleri), İçerik (yayındaki
// en önemli ≤50 URL) ve Diğer (makine uç noktaları, feed'ler, site haritası).
// DB hatasında 500 ATILMAZ; statik iskelet yine döner (lib/feeds.ts deseni).
import { yayindakiIcerikListesi } from "@/lib/db/queries/contents";
import type { IcerikOzetDTO } from "@/lib/db/queries/dto";
import { terimListesi, type TerimOzetDTO } from "@/lib/db/queries/terms";
import { pillarlar, type PillarOzetDTO } from "@/lib/db/queries/topics";
import { env } from "@/lib/env";
import { icerikYolu } from "@/lib/rotalar";
import { ARSIVLI_TURLER, TUR_ARSIV_METNI, turIndeksYolu } from "@/lib/tur-arsivi";
import { turSayisi } from "@/lib/db/queries/arsiv";

export const revalidate = 3600;

export async function GET(): Promise<Response> {
  const site = env.NEXT_PUBLIC_SITE_URL;

  let konular: PillarOzetDTO[] = [];
  try {
    konular = await pillarlar();
  } catch {
    konular = [];
  }
  let icerikler: IcerikOzetDTO[] = [];
  try {
    icerikler = await yayindakiIcerikListesi({ adet: 50 });
  } catch {
    icerikler = [];
  }
  let terimler: TerimOzetDTO[] = [];
  try {
    terimler = await terimListesi();
  } catch {
    terimler = [];
  }
  // Yalnız yayını olan arşivler duyurulur: boş bir indekse ajan yollamak,
  // sayfayı noindex tutup sitemap'ten çıkarma kararıyla çelişirdi.
  const arsivler = (
    await Promise.all(
      ARSIVLI_TURLER.map(async (tur) => {
        try {
          const adet = await turSayisi(tur);
          const yol = turIndeksYolu(tur);
          return adet > 0 && yol !== null ? { tur, yol, adet } : null;
        } catch {
          return null;
        }
      }),
    )
  ).filter(
    (a): a is { tur: (typeof ARSIVLI_TURLER)[number]; yol: string; adet: number } => a !== null,
  );

  const bolumler: string[] = [
    "# Sinaptiklab",
    "> Yapay zeka sistemlerini gerçekten üretenler için kaynaklı, yeniden üretilebilir " +
      "Türkçe teknik yayın — saha verisi, uydurma yok.",
    "Sinaptiklab'de her iddia numaralı kaynak listesiyle, her tutorial çalışan repo ile " +
      "yayımlanır; içerik sürümlenir ve son doğrulama tarihi taşır. Her içerik URL'sinin " +
      "sonuna `.md` ekleyerek sayfanın LLM-dostu ham Markdown halini alabilirsiniz " +
      "(örn. `/rehber/llm-nedir.md`); aynısı sözlük terimleri için de geçerlidir " +
      "(`/sozluk/ajan.md`). Pillar bazlı toplu dışa aktarım `/llms-full.txt` altındadır. " +
      "Yapısal sorgular için MCP uç noktası `/api/mcp` ve açık JSON `/api/content` " +
      "kullanılabilir; ikisi de kimlik doğrulama istemez.",
  ];

  if (konular.length > 0) {
    bolumler.push(
      "## Konular",
      konular
        .map((konu) => `- [${konu.title}](${site}/konu/${konu.slug}): ${konu.intro}`)
        .join("\n"),
    );
  }

  if (terimler.length > 0) {
    bolumler.push(
      "## Sözlük",
      `Kanonik Türkçe yapay zeka terminolojisi — ${terimler.length} terim. Her terimin ` +
        `Türkçe adı, İngilizce karşılığı, tanımı ve kaynağı vardır; sitedeki her metin ` +
        `bu sözlüğe bağlanır. Terim listesi: ${site}/sozluk`,
      terimler
        .map(
          (terim) =>
            `- [${terim.tr} (${terim.en})](${site}/sozluk/${terim.slug}): ${terim.shortDef}`,
        )
        .join("\n"),
    );
  }

  if (arsivler.length > 0) {
    bolumler.push(
      "## Arşivler",
      arsivler
        .map(
          (a) =>
            `- [${TUR_ARSIV_METNI[a.tur].baslik}](${site}${a.yol}): ${TUR_ARSIV_METNI[a.tur].aciklama} (${a.adet} yayın)`,
        )
        .join("\n"),
    );
  }

  if (icerikler.length > 0) {
    bolumler.push(
      "## İçerik",
      icerikler
        .map(
          (icerik) =>
            `- [${icerik.title}](${site}${icerikYolu(icerik.type, icerik.slug)}): ${icerik.dek}`,
        )
        .join("\n"),
    );
  }

  bolumler.push(
    "## Diğer",
    [
      `- [MCP uç noktası](${site}/api/mcp): Model Context Protocol (Streamable HTTP). Araçlar: icerik_ara, icerik_oku, konulari_listele, sozluk_ara, terim_oku`,
      `- [İçerik API](${site}/api/content): yayındaki tüm içeriğin JSON listesi; kimlik doğrulama gerekmez`,
      `- [Tam içerik dışa aktarımı](${site}/llms-full.txt): tüm yayınların pillar bazlı düz Markdown paketleri`,
      `- [RSS](${site}/feed.xml): son 20 yayın (RSS 2.0)`,
      `- [Atom](${site}/atom.xml): son 20 yayın (Atom 1.0)`,
      `- [JSON Feed](${site}/feed.json): son 20 yayın (JSON Feed 1.1)`,
      `- [Site haritası](${site}/sitemap.xml): tüm kalıcı URL'ler`,
    ].join("\n"),
  );

  return new Response(`${bolumler.join("\n\n")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
