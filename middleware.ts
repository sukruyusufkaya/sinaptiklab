import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";

/**
 * İki iş yapar:
 * 1. `.md` ham içerik yüzeyi (BRIEF §8.1): `/makale|rehber|uygulama/<slug>.md`
 *    → `/api/md/<tur>/<slug>` rewrite. Handler türü ve yayın durumunu kendi
 *    doğrular (yanlış tür / taslak / olmayan slug → 404).
 * 2. Geçici /admin koruması (ADR 0007): HTTP Basic Auth. ADMIN_USER/ADMIN_PASS
 *    tanımlı değilse /admin 404 görünür (güvenli varsayılan); Faz 7'de Auth.js
 *    rol sistemine devredilecek.
 * (Kanonik host normalizasyonu Vercel domain ayarında; redirect kayıtları
 * rota katmanında — Edge'de mongodb driver çalışmaz.)
 */

const MD_DESENI = /^\/(makale|rehber|uygulama)\/([^/]+)\.md$/;

export function middleware(istek: NextRequest) {
  const yol = istek.nextUrl.pathname;

  const mdEs = MD_DESENI.exec(yol);
  if (mdEs !== null) {
    const [, tur, slug] = mdEs;
    return NextResponse.rewrite(new URL(`/api/md/${tur}/${slug}`, istek.url));
  }

  if (!yol.startsWith("/admin")) return NextResponse.next();

  if (!env.ADMIN_USER || !env.ADMIN_PASS) {
    return new NextResponse(null, { status: 404 });
  }

  const yetki = istek.headers.get("authorization");
  if (yetki?.startsWith("Basic ")) {
    try {
      const [kullanici, ...parolaParcalari] = atob(yetki.slice(6)).split(":");
      const parola = parolaParcalari.join(":");
      if (kullanici === env.ADMIN_USER && parola === env.ADMIN_PASS) {
        return NextResponse.next();
      }
    } catch {
      /* bozuk başlık → 401'e düş */
    }
  }

  return new NextResponse("Kimlik doğrulama gerekli", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Sinaptiklab Admin", charset="UTF-8"' },
  });
}

export const config = {
  matcher: ["/admin/:path*", "/admin", "/makale/:slug*", "/rehber/:slug*", "/uygulama/:slug*"],
};
