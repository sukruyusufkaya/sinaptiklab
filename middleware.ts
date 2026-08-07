import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";

/**
 * Geçici /admin koruması (ADR 0007): HTTP Basic Auth.
 * ADMIN_USER/ADMIN_PASS tanımlı değilse /admin tamamen 404 görünür (güvenli
 * varsayılan). Faz 7'de Auth.js rol tabanlı sisteme devredilecek.
 * (Redirect/kanonik host kuralları Faz 4'te bu middleware'e eklenecek.)
 */
export function middleware(istek: NextRequest) {
  if (!istek.nextUrl.pathname.startsWith("/admin")) return NextResponse.next();

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
  matcher: ["/admin/:path*", "/admin"],
};
