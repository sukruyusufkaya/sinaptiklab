import { akisOgeleri, atomOlustur } from '@/lib/seo/akis';

/** Atom 1.0 akışı. Üretimi ve gerekçesi `lib/seo/akis.ts` içinde. */

export const dynamic = 'force-dynamic';

export async function GET() {
  return new Response(atomOlustur(await akisOgeleri(), new Date()), {
    headers: {
      'content-type': 'application/atom+xml; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=1800, stale-while-revalidate=86400',
    },
  });
}
