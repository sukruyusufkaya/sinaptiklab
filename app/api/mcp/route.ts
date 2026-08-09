import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { yayindakiIcerik } from "@/lib/db/queries/contents";
import { pillarlar } from "@/lib/db/queries/topics";
import { env } from "@/lib/env";
import { icerikYolu, turEtiketi } from "@/lib/rotalar";
import { icerikAra } from "@/lib/search/ara";

/**
 * MCP (Model Context Protocol) endpoint'i (BRIEF §8.1) — ajanların Sinaptiklab
 * korpusunu arayıp okuyabildiği makine yüzeyi. mcp-handler 2.x stateless
 * Streamable HTTP sunar (Redis/SSE yok); route doğrudan /api/mcp'ye monte
 * edilir ([transport] dinamik segmenti 1.x kalıntısıdır, 2.x'te yol
 * incelenmez). Araç çıktıları metin: ajanlar URL + .md bağlantısıyla tam
 * içeriğe ulaşır.
 */

export const maxDuration = 60;

const SITE = env.NEXT_PUBLIC_SITE_URL;

// Arama tek kaynaktan gelir: lib/search/ara.ts (Atlas Search + regex yedeği,
// serverApi'siz arama client'ı lib/search/istemci.ts'te — $search Stable API
// strict ile çalışmaz). /ara sayfasıyla MCP aracı aynı sıralamayı görür.

function metinYaniti(text: string): { content: { type: "text"; text: string }[] } {
  return { content: [{ type: "text", text }] };
}

function hataYaniti(text: string): {
  content: { type: "text"; text: string }[];
  isError: true;
} {
  return { content: [{ type: "text", text }], isError: true };
}

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      "icerik_ara",
      {
        title: "İçerik ara",
        description:
          "Sinaptiklab korpusunda tam metin arama yapar (başlık, özet, gövde, etiketler). " +
          "Her sonuçta slug, sayfa URL'si ve ham Markdown (.md) URL'si döner; " +
          "slug ile icerik_oku çağrılabilir.",
        inputSchema: z.object({
          sorgu: z.string().min(1).describe("Arama sorgusu (Türkçe)"),
          adet: z.number().int().min(1).max(20).default(5).describe("Sonuç sayısı (maks 20)"),
        }),
      },
      async ({ sorgu, adet }) => {
        const { sonuclar, motor } = await icerikAra({ sorgu, adet });
        const motorEtiketi = motor === "atlas" ? "Atlas Search" : "regex yedeği";
        if (sonuclar.length === 0) {
          return metinYaniti(
            `"${sorgu}" için sonuç bulunamadı (motor: ${motorEtiketi}). ` +
              "Daha genel bir Türkçe terim deneyin veya konulari_listele ile konu haritasına bakın.",
          );
        }
        const satirlar = sonuclar.map((s, i) => {
          const url = `${SITE}${icerikYolu(s.type, s.slug)}`;
          return [
            `${i + 1}. ${s.title} [${turEtiketi(s.type)}]`,
            `   ${s.dek}`,
            `   slug: ${s.slug}`,
            `   url: ${url}`,
            `   md: ${url}.md`,
          ].join("\n");
        });
        return metinYaniti(
          `"${sorgu}" için ${sonuclar.length} sonuç (motor: ${motorEtiketi}):\n\n` +
            satirlar.join("\n\n"),
        );
      },
    );

    server.registerTool(
      "icerik_oku",
      {
        title: "İçerik oku",
        description:
          "Slug ile yayınlanmış bir içeriğin tamamını döner: başlık, özet, kısa cevap, " +
          "gövde (ham MDX) ve kaynak listesi. Slug'ları icerik_ara sağlar.",
        inputSchema: z.object({
          slug: z.string().min(1).describe("İçerik slug'ı (icerik_ara sonuçlarından)"),
        }),
      },
      async ({ slug }) => {
        const icerik = await yayindakiIcerik(slug);
        if (!icerik) {
          return hataYaniti(
            `"${slug}" slug'ıyla yayınlanmış içerik bulunamadı. ` +
              "Slug'ı icerik_ara aracıyla doğrulayın; taslak içerikler bu uçtan sunulmaz.",
          );
        }
        const url = `${SITE}${icerikYolu(icerik.type, icerik.slug)}`;
        const kaynaklar =
          icerik.sources.length > 0
            ? icerik.sources
                .map(
                  (k) =>
                    `- ${k.label} — ${k.publisher} — ${k.url} (erişim: ${k.accessedAt.slice(0, 10)})`,
                )
                .join("\n")
            : "- (kaynak listesi boş)";
        return metinYaniti(
          [
            `# ${icerik.title}`,
            "",
            `${icerik.dek}`,
            "",
            `Tür: ${turEtiketi(icerik.type)} · Pillar: ${icerik.pillar} · URL: ${url} · Markdown: ${url}.md`,
            "",
            "## Kısa cevap",
            icerik.answerFirst,
            "",
            "## Gövde (ham MDX)",
            icerik.body,
            "",
            "## Kaynaklar",
            kaynaklar,
          ].join("\n"),
        );
      },
    );

    server.registerTool(
      "konulari_listele",
      {
        title: "Konuları listele",
        description:
          "Sinaptiklab konu haritasını (pillar'lar) döner: başlık, slug, " +
          "yayınlanmış içerik sayısı ve hub URL'si.",
      },
      async () => {
        const liste = await pillarlar();
        const satirlar = liste.map(
          (p) =>
            `- ${p.title} (${p.icerikSayisi} içerik)\n  slug: ${p.slug}\n  url: ${SITE}/konu/${p.slug}`,
        );
        return metinYaniti(
          `Sinaptiklab konu haritası (${liste.length} pillar):\n\n${satirlar.join("\n\n")}`,
        );
      },
    );
  },
  {
    serverInfo: { name: "sinaptiklab", version: "0.1.0" },
    instructions:
      "Sinaptiklab Türkçe yapay zeka içerik korpusu: arama (icerik_ara), okuma (icerik_oku), " +
      "konu listesi (konulari_listele). Tüm içerik kaynaklıdır; her içeriğin url'sine .md " +
      "eklenerek ham Markdown alınabilir.",
  },
);

/**
 * mcp-handler 2.x ana handler'a CORS başlığı EKLEMEZ (yalnız OAuth metadata
 * yardımcıları CORS'ludur — dist doğrulandı); tarayıcı tabanlı uzak MCP
 * istemcileri için preflight + yanıt başlıklarını burada yönetiyoruz.
 */
const CORS_BASLIKLARI: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, Mcp-Session-Id, Mcp-Protocol-Version, Last-Event-ID",
  "Access-Control-Expose-Headers": "Mcp-Session-Id, Mcp-Protocol-Version",
  "Access-Control-Max-Age": "86400",
};

async function corsluHandler(istek: Request): Promise<Response> {
  const yanit = await handler(istek);
  const basliklar = new Headers(yanit.headers);
  for (const [ad, deger] of Object.entries(CORS_BASLIKLARI)) basliklar.set(ad, deger);
  return new Response(yanit.body, {
    status: yanit.status,
    statusText: yanit.statusText,
    headers: basliklar,
  });
}

export function OPTIONS(): Response {
  return new Response(null, { status: 204, headers: CORS_BASLIKLARI });
}

export { corsluHandler as GET, corsluHandler as POST, corsluHandler as DELETE };
