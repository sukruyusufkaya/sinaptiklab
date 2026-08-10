// /api/md/terim/<slug> — sözlük teriminin ham Markdown hali (BRIEF §8.1).
// Güzel URL'i middleware buraya rewrite eder: /sozluk/<slug>.md
//
// Sözlük sitenin en ayırt edici GEO varlığı (kanonik Türkçe YZ terminolojisi);
// içerik türlerinin `.md` yüzeyi varken terimlerin olmaması boşluktu.
import { terimBySlug } from "@/lib/db/queries/terms";
import { terimMarkdown } from "@/lib/geo/markdown-disa-aktar";

export const revalidate = 3600;

interface Baglam {
  params: Promise<{ slug: string }>;
}

export async function GET(_istek: Request, { params }: Baglam): Promise<Response> {
  const { slug } = await params;

  let terim: Awaited<ReturnType<typeof terimBySlug>> = null;
  try {
    terim = await terimBySlug(slug);
  } catch {
    terim = null;
  }
  if (terim === null) {
    return new Response("Bulunamadı", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return new Response(terimMarkdown(terim), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
