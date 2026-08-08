import { env } from "@/lib/env";

/**
 * IndexNow bildirimi (BRIEF §7.1): yayınlanan/güncellenen URL'ler Bing ve
 * Yandex'e anında bildirilir. Anahtar doğrulaması public/<key>.txt dosyasıyla
 * yapılır (anahtar gizli değildir — protokol gereği zaten herkese açık
 * yayınlanır). INDEXNOW_KEY tanımsızsa sessizce atlanır; ping hatası yayını
 * ASLA kırmaz (en-iyi-çaba).
 */
export async function indexNowBildir(yollar: string[]): Promise<void> {
  const anahtar = env.INDEXNOW_KEY;
  if (!anahtar || yollar.length === 0) return;

  const site = new URL(env.NEXT_PUBLIC_SITE_URL);
  try {
    const yanit = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: site.host,
        key: anahtar,
        keyLocation: `${env.NEXT_PUBLIC_SITE_URL}/${anahtar}.txt`,
        urlList: yollar.map((y) => `${env.NEXT_PUBLIC_SITE_URL}${y}`),
      }),
      signal: AbortSignal.timeout(5_000),
    });
    if (!yanit.ok && yanit.status !== 202) {
      console.warn(`IndexNow bildirimi reddedildi: ${yanit.status}`);
    }
  } catch (hata) {
    console.warn(
      "IndexNow bildirimi başarısız (yayın etkilenmez):",
      hata instanceof Error ? hata.message : hata,
    );
  }
}
