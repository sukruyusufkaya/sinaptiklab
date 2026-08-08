// /feed.json — JSON Feed 1.1 (BRIEF §7.1, jsonfeed.org/version/1.1).
// Son 20 yayın; dek summary, excerptHtml content_html; JSON.stringify
// kaçış işini üstlenir. DB hatasında boş items ile geçerli feed döner.
import {
  FEED_ACIKLAMA,
  FEED_BASLIK,
  FEED_DIL,
  FEED_YAZAR,
  feedOgeleri,
  SITE_URL,
} from "@/lib/feeds";

export const revalidate = 3600;

export async function GET(): Promise<Response> {
  const ogeler = await feedOgeleri(20);

  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: FEED_BASLIK,
    home_page_url: SITE_URL,
    feed_url: `${SITE_URL}/feed.json`,
    description: FEED_ACIKLAMA,
    language: FEED_DIL,
    authors: [{ name: FEED_YAZAR, url: SITE_URL }],
    items: ogeler.map((oge) => ({
      id: oge.url,
      url: oge.url,
      title: oge.title,
      summary: oge.dek,
      content_html: oge.excerptHtml,
      date_published: oge.publishedAt,
      date_modified: oge.updatedAt,
      authors: [{ name: FEED_YAZAR, url: SITE_URL }],
    })),
  };

  return new Response(JSON.stringify(feed, null, 2), {
    headers: { "Content-Type": "application/feed+json; charset=utf-8" },
  });
}
