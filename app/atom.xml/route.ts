// /atom.xml — Atom 1.0 (BRIEF §7.1, RFC 4287). Son 20 yayın; dek
// <summary>, excerptHtml <content type="html"> (entity kaçışlı), tarihler
// ISO 8601. DB hatasında boş-girişli geçerli feed döner (lib/feeds.ts).
import {
  FEED_ACIKLAMA,
  FEED_BASLIK,
  FEED_YAZAR,
  feedGuncellemesi,
  feedOgeleri,
  SITE_URL,
  xmlKacis,
} from "@/lib/feeds";

export const revalidate = 3600;

export async function GET(): Promise<Response> {
  const ogeler = await feedOgeleri(20);

  const girisler = ogeler.map(
    (oge) => `  <entry>
    <title>${xmlKacis(oge.title)}</title>
    <id>${xmlKacis(oge.url)}</id>
    <link rel="alternate" type="text/html" href="${xmlKacis(oge.url)}"/>
    <published>${oge.publishedAt}</published>
    <updated>${oge.updatedAt}</updated>
    <summary>${xmlKacis(oge.dek)}</summary>
    <content type="html">${xmlKacis(oge.excerptHtml)}</content>
    <author><name>${xmlKacis(FEED_YAZAR)}</name></author>
  </entry>`,
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="tr">
  <title>${xmlKacis(FEED_BASLIK)}</title>
  <subtitle>${xmlKacis(FEED_ACIKLAMA)}</subtitle>
  <id>${xmlKacis(`${SITE_URL}/`)}</id>
  <link rel="alternate" type="text/html" href="${xmlKacis(SITE_URL)}"/>
  <link rel="self" type="application/atom+xml" href="${xmlKacis(`${SITE_URL}/atom.xml`)}"/>
  <updated>${feedGuncellemesi(ogeler)}</updated>
  <author><name>${xmlKacis(FEED_YAZAR)}</name></author>
${girisler.join("\n")}
</feed>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
  });
}
