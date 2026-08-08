// /api/md/<tur>/<slug> — içeriğin ham Markdown hali (BRIEF §8.1: her içerik
// URL'sine ".md" eklenince temiz Markdown döner; güzel URL'leri middleware
// buraya rewrite eder). tur ∈ {makale, rehber, uygulama}: yalnız açık public
// rotaların segmentleri kabul edilir ve içeriğin türü rotayla eşleşmelidir.
import { yayindakiIcerik } from "@/lib/db/queries/contents";
import type { IcerikDetayDTO } from "@/lib/db/queries/dto";
import { icerikMarkdown } from "@/lib/geo/markdown-disa-aktar";
import { icerikYolu, type IcerikTuru } from "@/lib/rotalar";

export const revalidate = 3600;

// Rota öneki lib/rotalar'daki tek kaynaktan tersine türetilir ("/makale/x" →
// "makale") ki URL şeması değişirse eşleme kendiliğinden takip etsin.
const ACIK_TURLER = ["article", "guide", "tutorial"] as const;
const SEGMENT_TURU: ReadonlyMap<string, IcerikTuru> = new Map(
  ACIK_TURLER.map((tur) => [icerikYolu(tur, "x").split("/")[1] ?? "", tur]),
);

function bulunamadi(): Response {
  return new Response("Bulunamadı", {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

interface Baglam {
  params: Promise<{ tur: string; slug: string }>;
}

export async function GET(_istek: Request, { params }: Baglam): Promise<Response> {
  const { tur, slug } = await params;
  const beklenenTur = SEGMENT_TURU.get(tur);
  if (beklenenTur === undefined) return bulunamadi();

  let icerik: IcerikDetayDTO | null = null;
  try {
    icerik = await yayindakiIcerik(slug);
  } catch {
    // DB hatasında 500 yerine 404: yüzey metin dosyasıdır, tüketici LLM'e
    // "yok" demek yarım belge vermekten iyidir (lib/feeds.ts dayanıklılık deseni).
    icerik = null;
  }
  if (icerik === null || icerik.type !== beklenenTur) return bulunamadi();

  return new Response(icerikMarkdown(icerik), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
