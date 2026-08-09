"use client";

// Konsol sekmeleri — aktif sekmeyi işaretlemek için pathname gerekir, bu
// yüzden layout'un TEK client parçası. Veri çekme yok (usePathname sadece
// yönlendirici durumunu okur); §14 useEffect-fetch yasağı kapsamı dışında.
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Sekme {
  yol: string;
  etiket: string;
  /** Bu sekmeyi aktif sayan yol önekleri (editör/önizleme → "İçerikler"). */
  kokler: readonly string[];
}

const SEKMELER: readonly Sekme[] = [
  {
    yol: "/admin",
    etiket: "İçerikler",
    kokler: ["/admin/yeni", "/admin/icerik", "/admin/onizleme"],
  },
  { yol: "/admin/yonlendirmeler", etiket: "Yönlendirmeler", kokler: [] },
  { yol: "/admin/bakim", etiket: "Bakım", kokler: [] },
  { yol: "/admin/geo", etiket: "YZ Görünürlük", kokler: [] },
];

function aktifMi(sekme: Sekme, yol: string): boolean {
  if (yol === sekme.yol) return true;
  if (sekme.yol !== "/admin" && yol.startsWith(`${sekme.yol}/`)) return true;
  return sekme.kokler.some((kok) => yol === kok || yol.startsWith(`${kok}/`));
}

export function KonsolGezinme() {
  const yol = usePathname();

  return (
    <nav aria-label="Admin gezinme" className="flex flex-wrap items-stretch">
      {SEKMELER.map((sekme) => {
        const aktif = aktifMi(sekme, yol);
        return (
          <Link
            key={sekme.yol}
            href={sekme.yol}
            aria-current={aktif ? "page" : undefined}
            className={`border-b-2 px-3 py-2.5 font-mono text-xs uppercase tracking-[0.18em] no-underline transition-colors first:pl-0 ${
              aktif
                ? "border-sinyal text-sinyal"
                : "border-transparent text-murekkep-2 hover:text-murekkep"
            }`}
          >
            {sekme.etiket}
          </Link>
        );
      })}
    </nav>
  );
}
