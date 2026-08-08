// YZ asistan referrer segmentasyonu (BRIEF §8.5) — bu host'lardan gelen
// ziyaretler admin "YZ Görünürlük" panelinde ayrı izlenir.
const YZ_REFERRER_ETIKETLERI: Record<string, string> = {
  "chatgpt.com": "chatgpt",
  "chat.openai.com": "chatgpt",
  "perplexity.ai": "perplexity",
  "www.perplexity.ai": "perplexity",
  "claude.ai": "claude",
  "gemini.google.com": "gemini",
  "copilot.microsoft.com": "copilot",
  "www.bing.com": "bing-chat",
};

/** Host bir YZ asistanına aitse segment etiketi, değilse undefined. */
export function yzAjanEtiketi(host: string): string | undefined {
  return YZ_REFERRER_ETIKETLERI[host.toLowerCase()];
}
