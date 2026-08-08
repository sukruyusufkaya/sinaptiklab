// /llms.txt — llmstxt.org spesifikasyonu (BRIEF §8.1): H1 + tek cümlelik
// blockquote özet + açıklama, ardından Konular (pillar hub'ları), İçerik
// (yayındaki en önemli ≤50 URL) ve Diğer (feed'ler + site haritası) bölümleri.
// DB hatasında 500 ATILMAZ; statik iskelet yine döner (lib/feeds.ts deseni).
import { yayindakiIcerikListesi } from "@/lib/db/queries/contents";
import type { IcerikOzetDTO } from "@/lib/db/queries/dto";
import { pillarlar, type PillarOzetDTO } from "@/lib/db/queries/topics";
import { env } from "@/lib/env";
import { icerikYolu } from "@/lib/rotalar";

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

  const bolumler: string[] = [
    "# Sinaptiklab",
    "> Yapay zeka sistemlerini gerçekten üretenler için kaynaklı, yeniden üretilebilir " +
      "Türkçe teknik yayın — saha verisi, uydurma yok.",
    "Sinaptiklab'de her iddia numaralı kaynak listesiyle, her tutorial çalışan repo ile " +
      "yayımlanır; içerik sürümlenir ve son doğrulama tarihi taşır. Her içerik URL'sinin " +
      "sonuna `.md` ekleyerek sayfanın LLM-dostu ham Markdown halini alabilirsiniz " +
      "(örn. `/rehber/rag-nedir.md`). Pillar bazlı toplu dışa aktarım `/llms-full.txt` " +
      "altındadır.",
  ];

  if (konular.length > 0) {
    bolumler.push(
      "## Konular",
      konular
        .map((konu) => `- [${konu.title}](${site}/konu/${konu.slug}): ${konu.intro}`)
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
