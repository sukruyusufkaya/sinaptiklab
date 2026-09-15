import { akisOgeleri, rssOlustur } from '@/lib/seo/akis';

/** RSS 2.0 akışı. Üretimi ve gerekçesi `lib/seo/akis.ts` içinde. */

export const dynamic = 'force-dynamic';

export async function GET() {
  return new Response(rssOlustur(await akisOgeleri(), new Date()), {
    headers: {
      'content-type': 'application/rss+xml; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=1800, stale-while-revalidate=86400',
    },
  });
}
