// /llms-full.txt — tam içerik dışa aktarımının yönlendirme kapısı (BRIEF
// §8.1). Tek dev dosya yerine pillar bazlı bölünmüş dosyaların listesi döner:
// /llms-full/<pillar>.txt. Yalnız yayını olan pillar'lar listelenir. DB
// hatasında 500 ATILMAZ; statik açıklama yine döner.
import { pillarlar, type PillarOzetDTO } from "@/lib/db/queries/topics";
import { env } from "@/lib/env";

export const revalidate = 3600;

export async function GET(): Promise<Response> {
  const site = env.NEXT_PUBLIC_SITE_URL;

  let konular: PillarOzetDTO[] = [];
  try {
    konular = await pillarlar();
  } catch {
    konular = [];
  }
  const yayinlilar = konular.filter((konu) => konu.icerikSayisi > 0);

  const bolumler: string[] = [
    "# Sinaptiklab — tam içerik dışa aktarımı",
    "> Tüm yayınlanmış içeriğin pillar bazlı düz Markdown paketleri.",
    "Her dosya, ilgili pillar'daki yayınların tam Markdown hallerini `---` ayraçlarıyla " +
      "art arda içerir. Site geneli özet ve içerik dizini için `/llms.txt` dosyasına bakın.",
  ];

  if (yayinlilar.length > 0) {
    bolumler.push(
      "## Pillar dosyaları",
      yayinlilar
        .map(
          (konu) =>
            `- [${konu.title}](${site}/llms-full/${konu.slug}.txt): ${konu.icerikSayisi} içerik`,
        )
        .join("\n"),
    );
  }

  return new Response(`${bolumler.join("\n\n")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
