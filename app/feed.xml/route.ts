// /feed.xml — RSS 2.0 (BRIEF §7.1). Son 20 yayın; dek düz metin
// <description>, excerptHtml <content:encoded> (CDATA), yazar dc:creator
// (RSS'in yerli <author>'ı e-posta ister — istemiyoruz). DB hatasında
// boş-öğeli geçerli kanal döner (lib/feeds.ts).
import {
  cdata,
  FEED_ACIKLAMA,
  FEED_BASLIK,
  FEED_DIL,
  FEED_YAZAR,
  feedGuncellemesi,
  feedOgeleri,
  rfc822,
  SITE_URL,
  xmlKacis,
} from "@/lib/feeds";

export const revalidate = 3600;

export async function GET(): Promise<Response> {
  const ogeler = await feedOgeleri(20);

  const parcalar = ogeler.map(
    (oge) => `    <item>
      <title>${xmlKacis(oge.title)}</title>
      <link>${xmlKacis(oge.url)}</link>
      <guid isPermaLink="true">${xmlKacis(oge.url)}</guid>
      <description>${xmlKacis(oge.dek)}</description>
      <content:encoded>${cdata(oge.excerptHtml)}</content:encoded>
      <dc:creator>${xmlKacis(FEED_YAZAR)}</dc:creator>
      <pubDate>${rfc822(oge.publishedAt)}</pubDate>
    </item>`,
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${xmlKacis(FEED_BASLIK)}</title>
    <link>${xmlKacis(SITE_URL)}</link>
    <description>${xmlKacis(FEED_ACIKLAMA)}</description>
    <language>${FEED_DIL}</language>
    <lastBuildDate>${rfc822(feedGuncellemesi(ogeler))}</lastBuildDate>
    <atom:link href="${xmlKacis(`${SITE_URL}/feed.xml`)}" rel="self" type="application/rss+xml"/>
${parcalar.join("\n")}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
