/**
 * MCP uçtan uca kanıt scripti (Faz DoD: "MCP endpoint bir ajandan arama+okuma
 * yapabiliyor"). Gerçek MCP istemcisiyle (@modelcontextprotocol/sdk 1.x,
 * Streamable HTTP) /api/mcp'ye bağlanır: tools/list → icerik_ara("RAG") →
 * ilk sonucun slug'ıyla icerik_oku zinciri.
 *
 * Kullanım: dev sunucu 3000'de çalışırken `npx tsx scripts/mcp-test.mts`
 * (farklı adres için MCP_URL ortam değişkeni).
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const adres = new URL(process.env["MCP_URL"] ?? "http://localhost:3000/api/mcp");

/** callTool sonucundaki text parçalarını tek dizeye toplar. */
function metinIcerik(sonuc: unknown): string {
  const parcalar = (sonuc as { content?: { type: string; text?: string }[] }).content ?? [];
  return parcalar
    .filter((p) => p.type === "text" && typeof p.text === "string")
    .map((p) => p.text)
    .join("\n");
}

async function ana(): Promise<void> {
  const istemci = new Client({ name: "sinaptiklab-mcp-test", version: "0.1.0" });
  const tasima = new StreamableHTTPClientTransport(adres);
  await istemci.connect(tasima);
  console.log(`✔ Bağlandı: ${adres.href}\n`);

  // 1) tools/list
  const { tools } = await istemci.listTools();
  console.log(`— Araç listesi (${tools.length}):`);
  for (const arac of tools) {
    console.log(`  • ${arac.name} — ${arac.description ?? "(açıklama yok)"}`);
  }

  // 2) icerik_ara
  console.log('\n— icerik_ara { sorgu: "RAG" }:');
  const arama = await istemci.callTool({ name: "icerik_ara", arguments: { sorgu: "RAG" } });
  const aramaMetni = metinIcerik(arama);
  console.log(aramaMetni);

  // 3) ilk sonucun slug'ıyla icerik_oku
  const eslesme = /slug: ([a-z0-9-]+)/.exec(aramaMetni);
  const slug = eslesme?.[1];
  if (!slug) {
    throw new Error("Arama çıktısında slug bulunamadı — icerik_oku zinciri kurulamadı.");
  }
  console.log(`\n— icerik_oku { slug: "${slug}" }:`);
  const okuma = await istemci.callTool({ name: "icerik_oku", arguments: { slug } });
  const okumaMetni = metinIcerik(okuma);
  const OZET_SINIRI = 600;
  console.log(
    okumaMetni.length > OZET_SINIRI
      ? `${okumaMetni.slice(0, OZET_SINIRI)}\n… (${okumaMetni.length} karakter toplam)`
      : okumaMetni,
  );

  // 4) konulari_listele (kısa özet)
  console.log("\n— konulari_listele:");
  const konular = await istemci.callTool({ name: "konulari_listele", arguments: {} });
  const konuMetni = metinIcerik(konular);
  console.log(konuMetni.split("\n\n").slice(0, 4).join("\n\n"));
  console.log("…");

  await istemci.close();
  console.log("\n✔ MCP uçtan uca test tamam: bağlantı + araç listesi + arama + okuma çalışıyor.");
}

ana().catch((hata: unknown) => {
  console.error("✖ MCP testi başarısız:", hata instanceof Error ? hata.message : hata);
  process.exitCode = 1;
});
