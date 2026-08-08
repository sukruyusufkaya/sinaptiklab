// /llms-full/<pillar>.txt — bir pillar'ın tüm yayınlarının tam Markdown'ı
// (BRIEF §8.1). Dinamik segment ".txt" içeremediği için route [pillar] olarak
// tanımlıdır ve ".txt" son eki param'dan burada soyulur: "rag-bilgi-erisimi.txt"
// → slug "rag-bilgi-erisimi"; son ek yoksa 404. İçerikler `\n\n---\n\n` ile
// birleşir. DB hatasında 500 yerine 404 (metin dosyası yüzeyi).
import { yayindakiIcerik, yayindakiIcerikListesi } from "@/lib/db/queries/contents";
import type { IcerikDetayDTO } from "@/lib/db/queries/dto";
import { pillarDetay } from "@/lib/db/queries/topics";
import { env } from "@/lib/env";
import { icerikMarkdown } from "@/lib/geo/markdown-disa-aktar";

export const revalidate = 3600;

function bulunamadi(): Response {
  return new Response("Bulunamadı", {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

interface Baglam {
  params: Promise<{ pillar: string }>;
}

export async function GET(_istek: Request, { params }: Baglam): Promise<Response> {
  const { pillar } = await params;
  if (!pillar.endsWith(".txt")) return bulunamadi();
  const slug = pillar.slice(0, -".txt".length);
  if (slug === "") return bulunamadi();

  try {
    const detay = await pillarDetay(slug);
    if (detay === null) return bulunamadi();

    const ozetler = await yayindakiIcerikListesi({ pillar: slug, adet: 100 });
    const dolular = await Promise.all(ozetler.map((ozet) => yayindakiIcerik(ozet.slug)));
    const belgeler = dolular
      .filter((icerik): icerik is IcerikDetayDTO => icerik !== null)
      .map((icerik) => icerikMarkdown(icerik).trim());

    const baslik =
      `# ${detay.title} — Sinaptiklab tam içerik\n\n` +
      `> ${detay.intro}\n\n` +
      `İçerik sayısı: ${belgeler.length} · Konu sayfası: ${env.NEXT_PUBLIC_SITE_URL}/konu/${detay.slug}`;

    return new Response(`${[baslik, ...belgeler].join("\n\n---\n\n")}\n`, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch {
    return bulunamadi();
  }
}
